export interface StandardFilterType {
  type: 'standard'
  shortLabel?: string
}

export interface BooleanFilterType {
  type: 'boolean'
  checkFunction?: (record: any) => boolean
}

export type FilterType = StandardFilterType | BooleanFilterType | null

export interface PropertyConfig {
  field: string
  label?: string
  filter: FilterType
}

export interface AppConfig {
  appName: string
  apiUrl: string
  apiToken: string
  geoDataField: string
  properties: PropertyConfig[]
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
    width?: number
  }
  eddbServiceUrl: string
}

export const config: AppConfig = {
  appName: 'Ludus',
  
  apiUrl: 'https://eddb.unifr.ch/noco/api/v2/tables/mw4mvjms6nkuq0f/records',
  apiToken: 'hCmfVFzK4mpjHkyLJzD1U2plqzJInYmdhzQ8NrzR',
  
  geoDataField: 'GeoData',
  
  properties: [
    {
      field: 'Material',
      filter: {
        type: 'standard'
      }
    },
    {
      field: 'Morphology',
      filter: {
        type: 'standard',
        shortLabel: 'Morph.'
      }
    },
    {
      field: 'Game',
      filter: {
        type: 'standard'
      }
    },
    {
      field: 'ConservationState',
      label: 'Conservation State',
      filter: {
        type: 'standard',
        shortLabel: 'State'
      }
    },
    {
      field: 'Typology',
      filter: {
        type: 'standard',
        shortLabel: 'Type'
      }
    },
    {
      field: 'PleiadesId',
      label: 'Pleiades ID',
      filter: null
    },
    {
      field: 'Image',
      label: 'Has Images',
      filter: {
        type: 'boolean',
        checkFunction: (record: any) => {
          return record.Image && Array.isArray(record.Image) && record.Image.length > 0 && record.Image.some((img: any) => img.signedPath)
        }
      }
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
    titleField: 'Title',
    width: 300
  },
  
  eddbServiceUrl: 'https://eddb.unifr.ch'
}
