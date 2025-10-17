import { useEffect, useRef } from 'react'
import L from 'leaflet'

interface MapLocation {
  id: string
  name: string
  description: string
  lat: number
  lng: number
}

const locations: MapLocation[] = [
  {
    id: '1',
    name: 'Eiffel Tower',
    description: 'Iconic iron lattice tower in Paris, France',
    lat: 48.8584,
    lng: 2.2945
  },
  {
    id: '2',
    name: 'Statue of Liberty',
    description: 'Colossal neoclassical sculpture in New York Harbor',
    lat: 40.6892,
    lng: -74.0445
  },
  {
    id: '3',
    name: 'Sydney Opera House',
    description: 'Multi-venue performing arts centre in Sydney, Australia',
    lat: -33.8568,
    lng: 151.2153
  },
  {
    id: '4',
    name: 'Great Wall of China',
    description: 'Ancient fortification in northern China',
    lat: 40.4319,
    lng: 116.5704
  },
  {
    id: '5',
    name: 'Machu Picchu',
    description: '15th-century Inca citadel in Peru',
    lat: -13.1631,
    lng: -72.5450
  }
]

export function Map() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return

    const map = L.map(mapContainer.current).setView([20, 0], 2)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map)

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: oklch(0.45 0.15 250);
          border: 3px solid oklch(0.98 0 0);
          border-radius: 50% 50% 50% 0;
          width: 32px;
          height: 32px;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        ">
          <div style="
            width: 12px;
            height: 12px;
            background-color: oklch(0.98 0 0);
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    })

    locations.forEach(location => {
      const marker = L.marker([location.lat, location.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div>
            <h3>${location.name}</h3>
            <p>${location.description}</p>
          </div>
        `)

      marker.on('mouseover', function() {
        this.openPopup()
      })
    })

    mapInstance.current = map

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [])

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  )
}
