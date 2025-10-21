import { useEffect, useRef, useState, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import { Bug, X, Funnel, ArrowCounterClockwise, Crosshair, Image } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { marked } from 'marked'
import { toast } from 'sonner'
import { config, type PropertyConfig } from '@/config'

interface ImageData {
  signedPath?: string
}

interface ApiRecord {
  Id: number
  Image?: ImageData[]
  [key: string]: any
}

interface ApiResponse {
  list: ApiRecord[]
  pageInfo: {
    totalRows?: number
  }
}

interface MapProps {
  onPointCountChange?: (count: number) => void
}

interface FilterState {
  values: string[]
  counts: Record<string, number>
  selected: Set<string>
}

const imageCache = new globalThis.Map<string, string>()

function getPropertyLabel(field: string): string {
  const property = config.properties.find(p => p.field === field)
  return property?.label || field
}

async function cacheImage(signedPath: string): Promise<string> {
  if (imageCache.has(signedPath)) {
    return imageCache.get(signedPath)!
  }

  try {
    const fullUrl = `${config.eddbServiceUrl}/noco/${signedPath}`
    const response = await fetch(fullUrl)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    imageCache.set(signedPath, objectUrl)
    return objectUrl
  } catch (error) {
    if (config.debug.showConsoleLog) {
      console.error('Error caching image:', error)
    }
    return `${config.eddbServiceUrl}/noco/${signedPath}`
  }
}

function parseMarkdown(text: string): string {
  try {
    const parsed = marked.parse(text, { async: false }) as string
    return parsed.replace(/<p>(.*?)<\/p>/g, '$1').trim()
  } catch {
    return text
  }
}

export function Map({ onPointCountChange }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiData, setApiData] = useState<ApiRecord[] | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  
  const [filterStates, setFilterStates] = useState<Record<string, FilterState>>({})
  const [booleanFilterStates, setBooleanFilterStates] = useState<Record<string, boolean>>({})
  
  const markerClusterGroup = useRef<L.MarkerClusterGroup | null>(null)
  const markerMapRef = useRef(new globalThis.Map<number, L.Marker>())
  const [showOpenById, setShowOpenById] = useState(false)
  const [inputId, setInputId] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('')

  const standardFilterProperties = useMemo(() => 
    config.properties.filter(p => p.filter && p.filter.type === 'standard'), 
    []
  )
  const booleanFilterProperties = useMemo(() => 
    config.properties.filter(p => p.filter && p.filter.type === 'boolean'), 
    []
  )
  const displayProperties = useMemo(() => 
    config.properties.filter(p => p.filter === null || p.filter.type === 'standard'), 
    []
  )

  useEffect(() => {
    if (standardFilterProperties.length > 0 && !selectedFilter) {
      setSelectedFilter(standardFilterProperties[0].field)
    }
  }, [standardFilterProperties, selectedFilter])

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return

    const map = L.map(mapContainer.current).setView(config.map.defaultCenter as [number, number], config.map.defaultZoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map)

    mapInstance.current = map

    const fetchData = async () => {
      try {
        setLoading(true)
        
        let allRecords: ApiRecord[] = []
        let offset = 0
        const limit = 1000
        
        while (true) {
          const response = await fetch(
            `${config.apiUrl}?limit=${limit}&offset=${offset}`,
            {
              headers: {
                'xc-token': config.apiToken
              }
            }
          )

          if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status}`)
          }

          const data: ApiResponse = await response.json()
          
          if (!data.list || data.list.length === 0) {
            break
          }
          
          allRecords = allRecords.concat(data.list)
          
          if (data.list.length < limit) {
            break
          }
          
          offset += limit
        }

        setApiData(allRecords)
        
        const newFilterStates: Record<string, FilterState> = {}
        
        standardFilterProperties.forEach(property => {
          const countMap: Record<string, number> = {}
          
          allRecords.forEach(record => {
            if (record[config.geoDataField] && typeof record[config.geoDataField] === 'string') {
              const parts = record[config.geoDataField].split(';')
              if (parts.length === 2) {
                const lat = parseFloat(parts[0])
                const lng = parseFloat(parts[1])
                
                if (!isNaN(lat) && !isNaN(lng)) {
                  const value = typeof record[property.field] === 'string' && record[property.field].trim() !== '' 
                    ? record[property.field] 
                    : 'Unknown'
                  countMap[value] = (countMap[value] || 0) + 1
                }
              }
            }
          })
          
          const uniqueValues = Object.keys(countMap)
            .filter(v => v !== 'Unknown')
            .sort()
          const valuesWithUnknown = countMap['Unknown'] 
            ? [...uniqueValues, 'Unknown']
            : uniqueValues
          
          newFilterStates[property.field] = {
            values: valuesWithUnknown,
            counts: countMap,
            selected: new Set(valuesWithUnknown)
          }
        })
        
        setFilterStates(newFilterStates)
        
        const newBooleanFilterStates: Record<string, boolean> = {}
        booleanFilterProperties.forEach(property => {
          newBooleanFilterStates[property.field] = false
        })
        setBooleanFilterStates(newBooleanFilterStates)
        
        const markers = L.markerClusterGroup({
          chunkedLoading: true,
          maxClusterRadius: config.map.clusterRadius,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true
        })

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: oklch(0.45 0.15 250);
              border: 3px solid oklch(0.98 0 0);
              border-radius: 50% 50% 50% 0;
              width: 28px;
              height: 28px;
              transform: rotate(-45deg);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 10px;
                height: 10px;
                background-color: oklch(0.98 0 0);
                border-radius: 50%;
              "></div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -28]
        })

        markerClusterGroup.current = markers

        let validPoints = 0
        allRecords.forEach(record => {
          if (record[config.geoDataField] && typeof record[config.geoDataField] === 'string') {
            const parts = record[config.geoDataField].split(';')
            if (parts.length === 2) {
              const lat = parseFloat(parts[0])
              const lng = parseFloat(parts[1])
              
              if (!isNaN(lat) && !isNaN(lng)) {
                const marker = L.marker([lat, lng], { icon: customIcon })
                
                const title = record[config.popup.titleField] || 'Untitled'
                
                const locations = [
                  record.Location1,
                  record.Location2,
                  record.Location3
                ].filter(loc => loc !== null && loc !== undefined && loc !== '').join(', ')
                
                const alwaysExcluded = [
                  config.geoDataField, 
                  'Id', 
                  config.popup.titleField, 
                  'CreatedAt', 
                  'UpdatedAt',
                  'Location1',
                  'Location2',
                  'Location3',
                  'Image'
                ]
                
                const displayFields = displayProperties.map(p => p.field)
                
                const popupContent = displayProperties
                  .map(property => {
                    const value = record[property.field]
                    if (value !== null && value !== undefined && value !== '') {
                      const label = getPropertyLabel(property.field)
                      if (property.field === 'PleiadesId') {
                        const pleiadesUrl = `https://pleiades.stoa.org/places/${value}`
                        return `<p><strong>${label}:</strong> <a href="${pleiadesUrl}" target="_blank" rel="noopener noreferrer" style="color: oklch(0.45 0.15 250); text-decoration: underline;">${value}</a></p>`
                      }
                      const parsedValue = parseMarkdown(String(value))
                      return `<p><strong>${label}:</strong> ${parsedValue}</p>`
                    }
                    return ''
                  })
                  .filter(Boolean)
                  .join('')
                
                const locationsHtml = locations ? `<p><strong>Locations:</strong> ${locations}</p>` : ''
                
                const popupElement = document.createElement('div')
                popupElement.innerHTML = `<div><h3>${title}</h3>${locationsHtml}${popupContent}</div>`
                
                if (record.Image && Array.isArray(record.Image) && record.Image.length > 0) {
                  const imageContainer = document.createElement('div')
                  imageContainer.style.marginTop = '12px'
                  imageContainer.style.display = 'flex'
                  imageContainer.style.gap = '8px'
                  imageContainer.style.flexWrap = 'wrap'
                  
                  record.Image.forEach((img: ImageData) => {
                    if (img.signedPath) {
                      const imgWrapper = document.createElement('div')
                      imgWrapper.style.width = '120px'
                      imgWrapper.style.height = '120px'
                      imgWrapper.style.borderRadius = 'var(--radius)'
                      imgWrapper.style.overflow = 'hidden'
                      imgWrapper.style.cursor = 'pointer'
                      imgWrapper.style.border = '2px solid oklch(0.88 0.01 250)'
                      imgWrapper.style.transition = 'transform 0.2s'
                      
                      imgWrapper.addEventListener('mouseenter', () => {
                        imgWrapper.style.transform = 'scale(1.05)'
                      })
                      imgWrapper.addEventListener('mouseleave', () => {
                        imgWrapper.style.transform = 'scale(1)'
                      })
                      
                      const imgElement = document.createElement('img')
                      imgElement.style.width = '100%'
                      imgElement.style.height = '100%'
                      imgElement.style.objectFit = 'cover'
                      imgElement.alt = 'Point image'
                      
                      cacheImage(img.signedPath).then(url => {
                        imgElement.src = url
                      })
                      
                      imgWrapper.addEventListener('click', () => {
                        cacheImage(img.signedPath!).then(url => {
                          window.open(url, '_blank')
                        })
                      })
                      
                      imgWrapper.appendChild(imgElement)
                      imageContainer.appendChild(imgWrapper)
                    }
                  })
                  
                  popupElement.appendChild(imageContainer)
                }

                marker.bindPopup(popupElement, {
                  maxWidth: config.popup.width || 300
                })

                markers.addLayer(marker)
                markerMapRef.current.set(record.Id, marker)
                validPoints++
              }
            }
          }
        })

        map.addLayer(markers)
        
        if (config.debug.showConsoleLog) {
          console.log(`Loaded ${allRecords.length} records, ${validPoints} with valid coordinates`)
        }
        
        if (validPoints > 0 && markers.getBounds().isValid()) {
          map.fitBounds(markers.getBounds(), { padding: [50, 50] })
        }

        onPointCountChange?.(validPoints)
        setLoading(false)
      } catch (err) {
        if (config.debug.showConsoleLog) {
          console.error('Error fetching map data:', err)
        }
        setError(err instanceof Error ? err.message : 'Failed to load map data')
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapInstance.current || !markerClusterGroup.current || !apiData) return

    markerClusterGroup.current.clearLayers()
    markerMapRef.current.clear()

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: oklch(0.45 0.15 250);
          border: 3px solid oklch(0.98 0 0);
          border-radius: 50% 50% 50% 0;
          width: 28px;
          height: 28px;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background-color: oklch(0.98 0 0);
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28]
    })

    let validPoints = 0
    apiData.forEach(record => {
      for (const property of standardFilterProperties) {
        const recordValue = typeof record[property.field] === 'string' && record[property.field].trim() !== '' 
          ? record[property.field] 
          : 'Unknown'
        
        if (!filterStates[property.field]?.selected.has(recordValue)) {
          return
        }
      }
      
      for (const property of booleanFilterProperties) {
        if (booleanFilterStates[property.field]) {
          const checkFunc = property.filter?.type === 'boolean' ? property.filter.checkFunction : undefined
          const defaultCheck = (rec: any) => !!rec[property.field]
          const finalCheck = checkFunc || defaultCheck
          if (!finalCheck(record)) {
            return
          }
        }
      }

      if (record[config.geoDataField] && typeof record[config.geoDataField] === 'string') {
        const parts = record[config.geoDataField].split(';')
        if (parts.length === 2) {
          const lat = parseFloat(parts[0])
          const lng = parseFloat(parts[1])
          
          if (!isNaN(lat) && !isNaN(lng)) {
            const marker = L.marker([lat, lng], { icon: customIcon })
            
            const title = record[config.popup.titleField] || 'Untitled'
            
            const locations = [
              record.Location1,
              record.Location2,
              record.Location3
            ].filter(loc => loc !== null && loc !== undefined && loc !== '').join(', ')
            
            const popupContent = displayProperties
              .map(property => {
                const value = record[property.field]
                if (value !== null && value !== undefined && value !== '') {
                  const label = getPropertyLabel(property.field)
                  if (property.field === 'PleiadesId') {
                    const pleiadesUrl = `https://pleiades.stoa.org/places/${value}`
                    return `<p><strong>${label}:</strong> <a href="${pleiadesUrl}" target="_blank" rel="noopener noreferrer" style="color: oklch(0.45 0.15 250); text-decoration: underline;">${value}</a></p>`
                  }
                  const parsedValue = parseMarkdown(String(value))
                  return `<p><strong>${label}:</strong> ${parsedValue}</p>`
                }
                return ''
              })
              .filter(Boolean)
              .join('')
            
            const locationsHtml = locations ? `<p><strong>Locations:</strong> ${locations}</p>` : ''
            
            const popupElement = document.createElement('div')
            popupElement.innerHTML = `<div><h3>${title}</h3>${locationsHtml}${popupContent}</div>`
            
            if (record.Image && Array.isArray(record.Image) && record.Image.length > 0) {
              const imageContainer = document.createElement('div')
              imageContainer.style.marginTop = '12px'
              imageContainer.style.display = 'flex'
              imageContainer.style.gap = '8px'
              imageContainer.style.flexWrap = 'wrap'
              
              record.Image.forEach((img: ImageData) => {
                if (img.signedPath) {
                  const imgWrapper = document.createElement('div')
                  imgWrapper.style.width = '120px'
                  imgWrapper.style.height = '120px'
                  imgWrapper.style.borderRadius = 'var(--radius)'
                  imgWrapper.style.overflow = 'hidden'
                  imgWrapper.style.cursor = 'pointer'
                  imgWrapper.style.border = '2px solid oklch(0.88 0.01 250)'
                  imgWrapper.style.transition = 'transform 0.2s'
                  
                  imgWrapper.addEventListener('mouseenter', () => {
                    imgWrapper.style.transform = 'scale(1.05)'
                  })
                  imgWrapper.addEventListener('mouseleave', () => {
                    imgWrapper.style.transform = 'scale(1)'
                  })
                  
                  const imgElement = document.createElement('img')
                  imgElement.style.width = '100%'
                  imgElement.style.height = '100%'
                  imgElement.style.objectFit = 'cover'
                  imgElement.alt = 'Point image'
                  
                  cacheImage(img.signedPath).then(url => {
                    imgElement.src = url
                  })
                  
                  imgWrapper.addEventListener('click', () => {
                    cacheImage(img.signedPath!).then(url => {
                      window.open(url, '_blank')
                    })
                  })
                  
                  imgWrapper.appendChild(imgElement)
                  imageContainer.appendChild(imgWrapper)
                }
              })
              
              popupElement.appendChild(imageContainer)
            }

            marker.bindPopup(popupElement, {
              maxWidth: config.popup.width || 300
            })

            markerClusterGroup.current!.addLayer(marker)
            markerMapRef.current.set(record.Id, marker)
            validPoints++
          }
        }
      }
    })

    if (validPoints > 0 && markerClusterGroup.current.getBounds().isValid()) {
      mapInstance.current.fitBounds(markerClusterGroup.current.getBounds(), { padding: [50, 50] })
    }

    onPointCountChange?.(validPoints)
  }, [filterStates, booleanFilterStates, apiData, onPointCountChange, standardFilterProperties, booleanFilterProperties, displayProperties])

  const handleFilterToggle = (field: string, value: string) => {
    setFilterStates(prev => {
      const current = prev[field]
      if (!current) return prev
      
      const newSelected = new Set(current.selected)
      if (newSelected.has(value)) {
        newSelected.delete(value)
      } else {
        newSelected.add(value)
      }
      
      return {
        ...prev,
        [field]: {
          ...current,
          selected: newSelected
        }
      }
    })
  }

  const handleSelectAll = (field: string) => {
    setFilterStates(prev => {
      const current = prev[field]
      if (!current) return prev
      
      return {
        ...prev,
        [field]: {
          ...current,
          selected: new Set(current.values)
        }
      }
    })
  }

  const handleDeselectAll = (field: string) => {
    setFilterStates(prev => {
      const current = prev[field]
      if (!current) return prev
      
      return {
        ...prev,
        [field]: {
          ...current,
          selected: new Set()
        }
      }
    })
  }

  const handleBooleanFilterToggle = (field: string) => {
    setBooleanFilterStates(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleResetAllFilters = () => {
    setFilterStates(prev => {
      const newState: Record<string, FilterState> = {}
      Object.keys(prev).forEach(field => {
        newState[field] = {
          ...prev[field],
          selected: new Set(prev[field].values)
        }
      })
      return newState
    })
    
    setBooleanFilterStates(prev => {
      const newState: Record<string, boolean> = {}
      Object.keys(prev).forEach(field => {
        newState[field] = false
      })
      return newState
    })
  }

  const handleOpenById = () => {
    const id = parseInt(inputId.trim())
    
    if (isNaN(id)) {
      toast.error('Please enter a valid numeric ID')
      return
    }

    const marker = markerMapRef.current.get(id)
    
    if (!marker) {
      toast.error(`No point found with ID: ${id}`)
      return
    }

    const latLng = marker.getLatLng()
    
    if (mapInstance.current) {
      mapInstance.current.setView(latLng, 18)
      marker.openPopup()
      setShowOpenById(false)
      setInputId('')
      toast.success(`Opened point with ID: ${id}`)
    }
  }

  const hasFilters = standardFilterProperties.length > 0 || booleanFilterProperties.length > 0

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainer} 
        className="w-full h-full"
      />
      
      <div className="absolute top-4 right-4 z-[1000] flex gap-2">
        <Dialog open={showOpenById} onOpenChange={setShowOpenById}>
          <DialogTrigger asChild>
            <Button
              className="shadow-lg"
              size="sm"
              variant="secondary"
            >
              <Crosshair size={18} weight="fill" className="mr-2" />
              Open by ID
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Open Point by ID</DialogTitle>
              <DialogDescription>
                Enter the ID of a point to locate and open it on the map.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="point-id">Point ID</Label>
                <Input
                  id="point-id"
                  type="number"
                  placeholder="Enter point ID..."
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleOpenById()
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowOpenById(false)
                    setInputId('')
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleOpenById}>
                  Open Point
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {hasFilters && (
          <Button
            onClick={() => setShowFilter(!showFilter)}
            className="shadow-lg"
            size="sm"
            variant={showFilter ? "default" : "secondary"}
          >
            <Funnel size={18} weight="fill" className="mr-2" />
            Filter
          </Button>
        )}
        
        {config.debug.enabled && (
          <Button
            onClick={() => setShowDebug(!showDebug)}
            className="shadow-lg"
            size="sm"
            variant={showDebug ? "default" : "secondary"}
          >
            <Bug size={18} weight="fill" className="mr-2" />
            Debug
          </Button>
        )}
      </div>

      {showFilter && hasFilters && (
        <div className="absolute top-16 right-4 w-96 bg-card border border-border rounded-lg shadow-xl z-[1001]" style={{ maxHeight: 'calc(100vh - 10rem)', overflow: 'auto' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-card z-10">
            <div className="flex items-center gap-2">
              <Funnel size={20} weight="fill" className="text-primary" />
              <h3 className="font-semibold text-sm">Filters</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleResetAllFilters}
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
              >
                <ArrowCounterClockwise size={16} className="mr-1" />
                Reset all
              </Button>
              <Button
                onClick={() => setShowFilter(false)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X size={18} />
              </Button>
            </div>
          </div>

          {booleanFilterProperties.length > 0 && (
            <div className="border-b border-border">
              {booleanFilterProperties.map(property => (
                <div key={property.field} className="px-4 py-3 border-b border-border bg-muted/50 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image size={18} weight="fill" className="text-primary" />
                      <Label htmlFor={`filter-${property.field}`} className="text-sm font-medium cursor-pointer">
                        {getPropertyLabel(property.field)}
                      </Label>
                    </div>
                    <Switch
                      id={`filter-${property.field}`}
                      checked={booleanFilterStates[property.field] || false}
                      onCheckedChange={() => handleBooleanFilterToggle(property.field)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {standardFilterProperties.length > 0 && (
            <div className="flex flex-col">
              <div className="px-4 pt-3 pb-3 sticky top-[57px] bg-card z-10 border-b border-border">
                <Label htmlFor="filter-select" className="text-xs text-muted-foreground mb-2 block">
                  Select Filter
                </Label>
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger id="filter-select" className="w-full">
                    <SelectValue placeholder="Choose a filter..." />
                  </SelectTrigger>
                  <SelectContent>
                    {standardFilterProperties.map(property => {
                      const state = filterStates[property.field]
                      const activeCount = state ? state.selected.size : 0
                      const totalCount = state ? state.values.length : 0
                      const isPartiallyFiltered = state && activeCount < totalCount && activeCount > 0
                      const isFullyFiltered = state && activeCount === 0
                      
                      return (
                        <SelectItem key={property.field} value={property.field}>
                          <div className="flex items-center justify-between w-full gap-4">
                            <span>{getPropertyLabel(property.field)}</span>
                            <span className={`text-xs font-medium ${
                              isFullyFiltered ? 'text-destructive' : 
                              isPartiallyFiltered ? 'text-primary' : 
                              'text-muted-foreground'
                            }`}>
                              {activeCount}/{totalCount}
                            </span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              {standardFilterProperties.map(property => {
                const state = filterStates[property.field]
                if (!state || selectedFilter !== property.field) return null
                
                return (
                  <div key={property.field}>
                    <div className="px-4 py-2 border-b border-border bg-muted flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Selected: <span className="font-semibold text-foreground">{state.selected.size}</span> of <span className="font-semibold text-foreground">{state.values.length}</span>
                      </p>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleSelectAll(property.field)}
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs px-2"
                        >
                          All
                        </Button>
                        <Button
                          onClick={() => handleDeselectAll(property.field)}
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs px-2"
                        >
                          None
                        </Button>
                      </div>
                    </div>
                    <div className="px-4 py-3 space-y-3">
                      {state.values.map(value => (
                        <div key={value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${property.field}-${value}`}
                            checked={state.selected.has(value)}
                            onCheckedChange={() => handleFilterToggle(property.field, value)}
                          />
                          <Label
                            htmlFor={`${property.field}-${value}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {value}
                          </Label>
                          <span className="text-xs text-muted-foreground font-medium">
                            {state.counts[value] || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {showDebug && apiData && (
        <div className="absolute top-16 right-4 bottom-4 w-96 bg-card border border-border rounded-lg shadow-xl z-[1001] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Bug size={20} weight="fill" className="text-primary" />
              <h3 className="font-semibold text-sm">API Response Debug</h3>
            </div>
            <Button
              onClick={() => setShowDebug(false)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X size={18} />
            </Button>
          </div>
          
          <div className="px-4 py-2 border-b border-border bg-muted shrink-0">
            <p className="text-xs text-muted-foreground">
              Total Records: <span className="font-semibold text-foreground">{apiData.length}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              With Coordinates: <span className="font-semibold text-foreground">
                {apiData.filter(r => r[config.geoDataField] && typeof r[config.geoDataField] === 'string' && r[config.geoDataField].includes(';')).length}
              </span>
            </p>
          </div>

          <div className="flex-1 overflow-auto px-4 py-3">
            <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words">
              {JSON.stringify(apiData, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-[1000]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map data...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg z-[1000]">
          {error}
        </div>
      )}
    </div>
  )
}
