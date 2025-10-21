export interface StandardFilterConfig {
  type: 'standard'
  field: string
  label: string
  shortLabel?: string
}

export interface BooleanFilterConfig {
  type: 'boolean'
  field: string
  label: string
  checkFunction?: (record: any) => boolean
}

export type FilterConfig = StandardFilterConfig | BooleanFilterConfig

export interface AppConfig {
  appName: string
  apiUrl: string
  apiToken: string
  geoDataField: string
  filters: FilterConfig[]
  debug: {
    enabled: boolean
    showConsoleLog: boolean
  }
  map: {
    defaultCenter: [number, number]
    defaultZoom: number
    clusterRadius: number
  }
  popup: {
    titleField: string
    displayFields?: string[]
  }
  eddbServiceUrl: string
}

export const config: AppConfig = {
  appName: 'HolyNet',
  
  apiUrl: 'https://eddb.unifr.ch/noco/api/v2/tables/mnn6jpi8328qbc6/records',
  apiToken: 'Q1cPWj4uxDBSrDqlU86Gyto77Cku7nGkvwmdbT6W', // read-only token
  
  geoDataField: 'Coordinates',
  
  filters: [
    {
      type: 'standard',
      field: 'TimeOfEmergence',
      label: 'Time of Emergence'
    }
  ],
  
  debug: {
    enabled: false,
    showConsoleLog: true
  },
  
  map: {
    defaultCenter: [46.8, 8.2],
    defaultZoom: 8,
    clusterRadius: 50
  },
  
  popup: {
    titleField: 'Denomination',
    displayFields: undefined
  },
  
  eddbServiceUrl: 'https://eddb.unifr.ch'
}
