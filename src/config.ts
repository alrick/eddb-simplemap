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
  eddbServiceUrl: string
}

export const config: AppConfig = {
  appName: 'Ludus',
  
  apiUrl: 'https://eddb.unifr.ch/noco/api/v2/tables/mw4mvjms6nkuq0f/records',
  apiToken: 'hCmfVFzK4mpjHkyLJzD1U2plqzJInYmdhzQ8NrzR',
  
  geoDataField: 'GeoData',
  
  filters: [
    {
      type: 'standard',
      field: 'Material',
      label: 'Material'
    },
    {
      type: 'standard',
      field: 'Morphology',
      label: 'Morphology',
      shortLabel: 'Morph.'
    },
    {
      type: 'standard',
      field: 'Game',
      label: 'Game'
    },
    {
      type: 'standard',
      field: 'ConservationState',
      label: 'Conservation State',
      shortLabel: 'State'
    },
    {
      type: 'standard',
      field: 'Typology',
      label: 'Typology',
      shortLabel: 'Type'
    },
    {
      type: 'boolean',
      field: 'Image',
      label: 'Has Images',
      checkFunction: (record: any) => {
        return record.Image && Array.isArray(record.Image) && record.Image.length > 0 && record.Image.some((img: any) => img.signedPath)
      }
    }
  ],
  
  debug: {
    enabled: true,
    showConsoleLog: true
  },
  
  map: {
    defaultCenter: [46.8, 8.2],
    defaultZoom: 8,
    clusterRadius: 50
  },
  
  eddbServiceUrl: 'https://eddb.unifr.ch'
}
