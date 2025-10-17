export interface FilterConfig {
  field: string
  label: string
  enabled: boolean
}

export interface AppConfig {
  appName: string
  apiUrl: string
  apiToken: string
  geoDataField: string
  filters: {
    material: FilterConfig
    morphology: FilterConfig
    game: FilterConfig
    conservationState: FilterConfig
    typology: FilterConfig
    hasImages: FilterConfig
  }
  debug: {
    enabled: boolean
    showConsoleLog: boolean
  }
  map: {
    defaultCenter: [number, number]
    defaultZoom: number
    clusterRadius: number
  }
  eddbServiceUrl: string
}

export const config: AppConfig = {
  appName: 'Ludus',
  
  apiUrl: 'https://eddb.unifr.ch/noco/api/v2/tables/mw4mvjms6nkuq0f/records',
  apiToken: 'hCmfVFzK4mpjHkyLJzD1U2plqzJInYmdhzQ8NrzR',
  
  geoDataField: 'GeoData',
  
  filters: {
    material: {
      field: 'Material',
      label: 'Material',
      enabled: true
    },
    morphology: {
      field: 'Morphology',
      label: 'Morphology',
      enabled: true
    },
    game: {
      field: 'Game',
      label: 'Game',
      enabled: true
    },
    conservationState: {
      field: 'ConservationState',
      label: 'Conservation State',
      enabled: true
    },
    typology: {
      field: 'Typology',
      label: 'Typology',
      enabled: true
    },
    hasImages: {
      field: 'Image',
      label: 'Has Images',
      enabled: true
    }
  },
  
  debug: {
    enabled: false,
    showConsoleLog: true
  },
  
  map: {
    defaultCenter: [46.8, 8.2],
    defaultZoom: 8,
    clusterRadius: 50
  },
  
  eddbServiceUrl: 'https://eddb.unifr.ch'
}
