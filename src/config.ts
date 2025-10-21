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

export type FilterMenuType = 'dropdown' | 'tabs'

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
  filterMenu: {
    type: FilterMenuType
  }
  eddbServiceUrl: string
}

export const config: AppConfig = {
  appName: 'HolyNet',
  
  apiUrl: 'https://eddb.unifr.ch/noco/api/v2/tables/mnn6jpi8328qbc6/records',
  apiToken: 'Q1cPWj4uxDBSrDqlU86Gyto77Cku7nGkvwmdbT6W',
  
  geoDataField: 'Coordinates',
  
  properties: [
    {
      field: 'TownVillage',
      label: 'Town / Village',
      filter: null
    },
    {
      field: 'HistoricalDenomination',
      label: 'Historical Denomination',
      filter: null
    },
    {
      field: 'Coordinates',
      label: 'Coordinates',
      filter: null
    },
    {
      field: 'TimeOfEmergence',
      label: 'Time of Emergence',
      filter: {
        type: 'standard',
        shortLabel: 'ToE'
      }
    },
    {
      field: 'TypologyLegendaryPhysiognomy',
      label: 'Typology - Legendary Physiognomy',
      filter: {
        type: 'standard',
        shortLabel: 'Leg. Physiognomy'
      }
    },
    {
      field: 'TypologyConnectivity',
      label: 'Typology - Connectivity',
      filter: {
        type: 'standard',
        shortLabel: 'Connectivity'
      }
    },
    {
      field: 'TypologySurroundingEnvironment',
      label: 'Typology - Surrounding Environment',
      filter: {
        type: 'standard',
        shortLabel: 'Surrounding Env.'
      }
    },
    {
      field: 'CultObjectMateriality',
      label: 'Cult Object - Materiality',
      filter: {
        type: 'standard',
        shortLabel: 'CO Materiality'
      }
    },
    {
      field: 'CultObjectCulticIdentity',
      label: 'Cult Object - Cultic Identity',
      filter: null
    },
    {
      field: 'AssociatedMemorialNetworks',
      label: 'Associated Memorial Networks',
      filter: {
        type: 'standard',
        shortLabel: 'Memorial Networks'
      }
    },
    {
      field: 'AssociatedReligiousGroups',
      label: 'Associated Religious Groups',
      filter: null
    },
    {
      field: 'ExperientialDimension',
      label: 'Experiential Dimension',
      filter: null
    },
    {
      field: 'History',
      label: 'History',
      filter: null
    },
    {
      field: 'Visuals',
      label: 'Has Images',
      filter: {
        type: 'boolean',
        checkFunction: (record: any) => {
          return record.Visuals && Array.isArray(record.Visuals) && record.Visuals.length > 0 && record.Visuals.some((img: any) => img.signedPath)
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
    titleField: 'Denomination',
    width: 500
  },
  
  filterMenu: {
    type: 'dropdown'
  },
  
  eddbServiceUrl: 'https://eddb.unifr.ch'
}
