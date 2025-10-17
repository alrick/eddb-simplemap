import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import { Bug, X, Funnel } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ApiRecord {
  Id: number
  GeoData?: string
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

export function Map({ onPointCountChange }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiData, setApiData] = useState<ApiRecord[] | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [materials, setMaterials] = useState<string[]>([])
  const [materialCounts, setMaterialCounts] = useState<Record<string, number>>({})
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set())
  const [morphologies, setMorphologies] = useState<string[]>([])
  const [morphologyCounts, setMorphologyCounts] = useState<Record<string, number>>({})
  const [selectedMorphologies, setSelectedMorphologies] = useState<Set<string>>(new Set())
  const [games, setGames] = useState<string[]>([])
  const [gameCounts, setGameCounts] = useState<Record<string, number>>({})
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set())
  const [conservationStates, setConservationStates] = useState<string[]>([])
  const [conservationStateCounts, setConservationStateCounts] = useState<Record<string, number>>({})
  const [selectedConservationStates, setSelectedConservationStates] = useState<Set<string>>(new Set())
  const [typologies, setTypologies] = useState<string[]>([])
  const [typologyCounts, setTypologyCounts] = useState<Record<string, number>>({})
  const [selectedTypologies, setSelectedTypologies] = useState<Set<string>>(new Set())
  const markerClusterGroup = useRef<L.MarkerClusterGroup | null>(null)

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return

    const map = L.map(mapContainer.current).setView([46.8, 8.2], 8)

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
            `https://eddb.unifr.ch/noco/api/v2/tables/mw4mvjms6nkuq0f/records?limit=${limit}&offset=${offset}`,
            {
              headers: {
                'xc-token': 'hCmfVFzK4mpjHkyLJzD1U2plqzJInYmdhzQ8NrzR'
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
        
        const materialCountMap: Record<string, number> = {}
        const morphologyCountMap: Record<string, number> = {}
        const gameCountMap: Record<string, number> = {}
        const conservationStateCountMap: Record<string, number> = {}
        const typologyCountMap: Record<string, number> = {}
        
        allRecords.forEach(record => {
          if (record.GeoData && typeof record.GeoData === 'string') {
            const parts = record.GeoData.split(';')
            if (parts.length === 2) {
              const lat = parseFloat(parts[0])
              const lng = parseFloat(parts[1])
              
              if (!isNaN(lat) && !isNaN(lng)) {
                const material = typeof record.Material === 'string' && record.Material.trim() !== '' 
                  ? record.Material 
                  : 'Unknown'
                materialCountMap[material] = (materialCountMap[material] || 0) + 1
                
                const morphology = typeof record.Morphology === 'string' && record.Morphology.trim() !== '' 
                  ? record.Morphology 
                  : 'Unknown'
                morphologyCountMap[morphology] = (morphologyCountMap[morphology] || 0) + 1
                
                const game = typeof record.Game === 'string' && record.Game.trim() !== '' 
                  ? record.Game 
                  : 'Unknown'
                gameCountMap[game] = (gameCountMap[game] || 0) + 1
                
                const conservationState = typeof record.ConservationState === 'string' && record.ConservationState.trim() !== '' 
                  ? record.ConservationState 
                  : 'Unknown'
                conservationStateCountMap[conservationState] = (conservationStateCountMap[conservationState] || 0) + 1
                
                const typology = typeof record.Typology === 'string' && record.Typology.trim() !== '' 
                  ? record.Typology 
                  : 'Unknown'
                typologyCountMap[typology] = (typologyCountMap[typology] || 0) + 1
              }
            }
          }
        })
        
        const uniqueMaterials = Object.keys(materialCountMap)
          .filter(m => m !== 'Unknown')
          .sort()
        const materialsWithUnknown = materialCountMap['Unknown'] 
          ? [...uniqueMaterials, 'Unknown']
          : uniqueMaterials
        setMaterials(materialsWithUnknown)
        setMaterialCounts(materialCountMap)
        setSelectedMaterials(new Set(materialsWithUnknown))
        
        const uniqueMorphologies = Object.keys(morphologyCountMap)
          .filter(m => m !== 'Unknown')
          .sort()
        const morphologiesWithUnknown = morphologyCountMap['Unknown'] 
          ? [...uniqueMorphologies, 'Unknown']
          : uniqueMorphologies
        setMorphologies(morphologiesWithUnknown)
        setMorphologyCounts(morphologyCountMap)
        setSelectedMorphologies(new Set(morphologiesWithUnknown))
        
        const uniqueGames = Object.keys(gameCountMap)
          .filter(g => g !== 'Unknown')
          .sort()
        const gamesWithUnknown = gameCountMap['Unknown'] 
          ? [...uniqueGames, 'Unknown']
          : uniqueGames
        setGames(gamesWithUnknown)
        setGameCounts(gameCountMap)
        setSelectedGames(new Set(gamesWithUnknown))
        
        const uniqueConservationStates = Object.keys(conservationStateCountMap)
          .filter(c => c !== 'Unknown')
          .sort()
        const conservationStatesWithUnknown = conservationStateCountMap['Unknown'] 
          ? [...uniqueConservationStates, 'Unknown']
          : uniqueConservationStates
        setConservationStates(conservationStatesWithUnknown)
        setConservationStateCounts(conservationStateCountMap)
        setSelectedConservationStates(new Set(conservationStatesWithUnknown))
        
        const uniqueTypologies = Object.keys(typologyCountMap)
          .filter(t => t !== 'Unknown')
          .sort()
        const typologiesWithUnknown = typologyCountMap['Unknown'] 
          ? [...uniqueTypologies, 'Unknown']
          : uniqueTypologies
        setTypologies(typologiesWithUnknown)
        setTypologyCounts(typologyCountMap)
        setSelectedTypologies(new Set(typologiesWithUnknown))
        
        const markers = L.markerClusterGroup({
          chunkedLoading: true,
          maxClusterRadius: 50,
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
          if (record.GeoData && typeof record.GeoData === 'string') {
            const parts = record.GeoData.split(';')
            if (parts.length === 2) {
              const lat = parseFloat(parts[0])
              const lng = parseFloat(parts[1])
              
              if (!isNaN(lat) && !isNaN(lng)) {
                const marker = L.marker([lat, lng], { icon: customIcon })
                
                const title = record.Title || 'Untitled'
                
                const popupContent = Object.entries(record)
                  .filter(([key]) => key !== 'GeoData' && key !== 'Id' && key !== 'Title' && key !== 'CreatedAt' && key !== 'UpdatedAt')
                  .map(([key, value]) => {
                    if (value !== null && value !== undefined && value !== '') {
                      return `<p><strong>${key}:</strong> ${value}</p>`
                    }
                    return ''
                  })
                  .filter(Boolean)
                  .join('')

                marker.bindPopup(`<div><h3>${title}</h3>${popupContent}</div>`)

                markers.addLayer(marker)
                validPoints++
              }
            }
          }
        })

        map.addLayer(markers)
        
        console.log(`Loaded ${allRecords.length} records, ${validPoints} with valid coordinates`)
        
        if (validPoints > 0 && markers.getBounds().isValid()) {
          map.fitBounds(markers.getBounds(), { padding: [50, 50] })
        }

        onPointCountChange?.(validPoints)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching map data:', err)
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
      const recordMaterial = typeof record.Material === 'string' && record.Material.trim() !== '' 
        ? record.Material 
        : 'Unknown'
      
      if (!selectedMaterials.has(recordMaterial)) {
        return
      }
      
      const recordMorphology = typeof record.Morphology === 'string' && record.Morphology.trim() !== '' 
        ? record.Morphology 
        : 'Unknown'
      
      if (!selectedMorphologies.has(recordMorphology)) {
        return
      }
      
      const recordGame = typeof record.Game === 'string' && record.Game.trim() !== '' 
        ? record.Game 
        : 'Unknown'
      
      if (!selectedGames.has(recordGame)) {
        return
      }
      
      const recordConservationState = typeof record.ConservationState === 'string' && record.ConservationState.trim() !== '' 
        ? record.ConservationState 
        : 'Unknown'
      
      if (!selectedConservationStates.has(recordConservationState)) {
        return
      }
      
      const recordTypology = typeof record.Typology === 'string' && record.Typology.trim() !== '' 
        ? record.Typology 
        : 'Unknown'
      
      if (!selectedTypologies.has(recordTypology)) {
        return
      }

      if (record.GeoData && typeof record.GeoData === 'string') {
        const parts = record.GeoData.split(';')
        if (parts.length === 2) {
          const lat = parseFloat(parts[0])
          const lng = parseFloat(parts[1])
          
          if (!isNaN(lat) && !isNaN(lng)) {
            const marker = L.marker([lat, lng], { icon: customIcon })
            
            const title = record.Title || 'Untitled'
            
            const popupContent = Object.entries(record)
              .filter(([key]) => key !== 'GeoData' && key !== 'Id' && key !== 'Title' && key !== 'CreatedAt' && key !== 'UpdatedAt')
              .map(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                  return `<p><strong>${key}:</strong> ${value}</p>`
                }
                return ''
              })
              .filter(Boolean)
              .join('')

            marker.bindPopup(`<div><h3>${title}</h3>${popupContent}</div>`)

            markerClusterGroup.current!.addLayer(marker)
            validPoints++
          }
        }
      }
    })

    if (validPoints > 0 && markerClusterGroup.current.getBounds().isValid()) {
      mapInstance.current.fitBounds(markerClusterGroup.current.getBounds(), { padding: [50, 50] })
    }

    onPointCountChange?.(validPoints)
  }, [selectedMaterials, selectedMorphologies, selectedGames, selectedConservationStates, selectedTypologies, apiData, onPointCountChange])

  const handleMaterialToggle = (material: string) => {
    setSelectedMaterials(prev => {
      const next = new Set(prev)
      if (next.has(material)) {
        next.delete(material)
      } else {
        next.add(material)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    setSelectedMaterials(new Set(materials))
    setSelectedMorphologies(new Set(morphologies))
    setSelectedGames(new Set(games))
    setSelectedConservationStates(new Set(conservationStates))
    setSelectedTypologies(new Set(typologies))
  }

  const handleDeselectAll = () => {
    setSelectedMaterials(new Set())
    setSelectedMorphologies(new Set())
    setSelectedGames(new Set())
    setSelectedConservationStates(new Set())
    setSelectedTypologies(new Set())
  }
  
  const handleMorphologyToggle = (morphology: string) => {
    setSelectedMorphologies(prev => {
      const next = new Set(prev)
      if (next.has(morphology)) {
        next.delete(morphology)
      } else {
        next.add(morphology)
      }
      return next
    })
  }
  
  const handleGameToggle = (game: string) => {
    setSelectedGames(prev => {
      const next = new Set(prev)
      if (next.has(game)) {
        next.delete(game)
      } else {
        next.add(game)
      }
      return next
    })
  }
  
  const handleConservationStateToggle = (state: string) => {
    setSelectedConservationStates(prev => {
      const next = new Set(prev)
      if (next.has(state)) {
        next.delete(state)
      } else {
        next.add(state)
      }
      return next
    })
  }
  
  const handleTypologyToggle = (typology: string) => {
    setSelectedTypologies(prev => {
      const next = new Set(prev)
      if (next.has(typology)) {
        next.delete(typology)
      } else {
        next.add(typology)
      }
      return next
    })
  }

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainer} 
        className="w-full h-full"
      />
      
      <div className="absolute top-4 right-4 z-[1000] flex gap-2">
        <Button
          onClick={() => setShowFilter(!showFilter)}
          className="shadow-lg"
          size="sm"
          variant={showFilter ? "default" : "secondary"}
        >
          <Funnel size={18} weight="fill" className="mr-2" />
          Filter
        </Button>
        
        <Button
          onClick={() => setShowDebug(!showDebug)}
          className="shadow-lg"
          size="sm"
          variant={showDebug ? "default" : "secondary"}
        >
          <Bug size={18} weight="fill" className="mr-2" />
          Debug
        </Button>
      </div>

      {showFilter && (
        <div className="absolute top-16 right-4 w-96 bg-card border border-border rounded-lg shadow-xl z-[1001]" style={{ maxHeight: 'calc(100vh - 9rem)', overflow: 'auto' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-card z-10">
            <div className="flex items-center gap-2">
              <Funnel size={20} weight="fill" className="text-primary" />
              <h3 className="font-semibold text-sm">Filters</h3>
            </div>
            <Button
              onClick={() => setShowFilter(false)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X size={18} />
            </Button>
          </div>
          
          <div className="px-4 py-2 border-b border-border bg-muted flex gap-2 sticky top-[57px] z-10">
            <Button
              onClick={handleSelectAll}
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
            >
              Select All
            </Button>
            <Button
              onClick={handleDeselectAll}
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
            >
              Deselect All
            </Button>
          </div>

          <Tabs defaultValue="material" className="w-full">
            <div className="px-4 pt-3 pb-2 sticky top-[97px] bg-card z-10">
              <TabsList className="grid w-full grid-cols-5 h-auto">
                <TabsTrigger value="material" className="text-[10px] px-1 py-1.5">Material</TabsTrigger>
                <TabsTrigger value="morphology" className="text-[10px] px-1 py-1.5">Morph.</TabsTrigger>
                <TabsTrigger value="game" className="text-[10px] px-1 py-1.5">Game</TabsTrigger>
                <TabsTrigger value="conservation" className="text-[10px] px-1 py-1.5">State</TabsTrigger>
                <TabsTrigger value="typology" className="text-[10px] px-1 py-1.5">Type</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="material" className="mt-0">
              <div className="px-4 py-2 border-b border-border bg-muted">
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-semibold text-foreground">{selectedMaterials.size}</span> of <span className="font-semibold text-foreground">{materials.length}</span>
                </p>
              </div>
              <div className="px-4 py-3 space-y-3">
                {materials.map(material => (
                  <div key={material} className="flex items-center space-x-2">
                    <Checkbox
                      id={`material-${material}`}
                      checked={selectedMaterials.has(material)}
                      onCheckedChange={() => handleMaterialToggle(material)}
                    />
                    <Label
                      htmlFor={`material-${material}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {material}
                    </Label>
                    <span className="text-xs text-muted-foreground font-medium">
                      {materialCounts[material] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="morphology" className="mt-0">
              <div className="px-4 py-2 border-b border-border bg-muted">
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-semibold text-foreground">{selectedMorphologies.size}</span> of <span className="font-semibold text-foreground">{morphologies.length}</span>
                </p>
              </div>
              <div className="px-4 py-3 space-y-3">
                {morphologies.map(morphology => (
                  <div key={morphology} className="flex items-center space-x-2">
                    <Checkbox
                      id={`morphology-${morphology}`}
                      checked={selectedMorphologies.has(morphology)}
                      onCheckedChange={() => handleMorphologyToggle(morphology)}
                    />
                    <Label
                      htmlFor={`morphology-${morphology}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {morphology}
                    </Label>
                    <span className="text-xs text-muted-foreground font-medium">
                      {morphologyCounts[morphology] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="game" className="mt-0">
              <div className="px-4 py-2 border-b border-border bg-muted">
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-semibold text-foreground">{selectedGames.size}</span> of <span className="font-semibold text-foreground">{games.length}</span>
                </p>
              </div>
              <div className="px-4 py-3 space-y-3">
                {games.map(game => (
                  <div key={game} className="flex items-center space-x-2">
                    <Checkbox
                      id={`game-${game}`}
                      checked={selectedGames.has(game)}
                      onCheckedChange={() => handleGameToggle(game)}
                    />
                    <Label
                      htmlFor={`game-${game}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {game}
                    </Label>
                    <span className="text-xs text-muted-foreground font-medium">
                      {gameCounts[game] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="conservation" className="mt-0">
              <div className="px-4 py-2 border-b border-border bg-muted">
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-semibold text-foreground">{selectedConservationStates.size}</span> of <span className="font-semibold text-foreground">{conservationStates.length}</span>
                </p>
              </div>
              <div className="px-4 py-3 space-y-3">
                {conservationStates.map(state => (
                  <div key={state} className="flex items-center space-x-2">
                    <Checkbox
                      id={`conservation-${state}`}
                      checked={selectedConservationStates.has(state)}
                      onCheckedChange={() => handleConservationStateToggle(state)}
                    />
                    <Label
                      htmlFor={`conservation-${state}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {state}
                    </Label>
                    <span className="text-xs text-muted-foreground font-medium">
                      {conservationStateCounts[state] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="typology" className="mt-0">
              <div className="px-4 py-2 border-b border-border bg-muted">
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-semibold text-foreground">{selectedTypologies.size}</span> of <span className="font-semibold text-foreground">{typologies.length}</span>
                </p>
              </div>
              <div className="px-4 py-3 space-y-3">
                {typologies.map(typology => (
                  <div key={typology} className="flex items-center space-x-2">
                    <Checkbox
                      id={`typology-${typology}`}
                      checked={selectedTypologies.has(typology)}
                      onCheckedChange={() => handleTypologyToggle(typology)}
                    />
                    <Label
                      htmlFor={`typology-${typology}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {typology}
                    </Label>
                    <span className="text-xs text-muted-foreground font-medium">
                      {typologyCounts[typology] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
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
                {apiData.filter(r => r.GeoData && typeof r.GeoData === 'string' && r.GeoData.includes(';')).length}
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
