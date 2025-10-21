# Configuration Guide

This document explains how to configure the Ludus application using the `src/config.ts` file.

## Configuration File Location

The configuration file is located at: `src/config.ts`

## Configuration Options

### Application Settings

#### `appName` (string)
The name of your application displayed in the header.

**Example:**
```typescript
appName: 'Ludus'
```

#### `eddbServiceUrl` (string)
The base URL for the EDDB service used in links.

**Example:**
```typescript
eddbServiceUrl: 'https://eddb.unifr.ch'
```

---

### API Configuration

#### `apiUrl` (string)
The full URL of the NocoDB API endpoint for fetching records.

**Example:**
```typescript
apiUrl: 'https://eddb.unifr.ch/noco/api/v2/tables/mw4mvjms6nkuq0f/records'
```

#### `apiToken` (string)
The authentication token for the NocoDB API.

**Example:**
```typescript
apiToken: 'hCmfVFzK4mpjHkyLJzD1U2plqzJInYmdhzQ8NrzR'
```

---

### Filter Configuration

Each filter has the following properties:
- `field` (string): The name of the field in the API response
- `label` (string): The display label for the filter
- `enabled` (boolean): Whether the filter should be available in the UI

#### Available Filters

##### `filters.material`
Filter points by material type.

**Example:**
```typescript
material: {
  field: 'Material',
  label: 'Material',
  enabled: true
}
```

##### `filters.morphology`
Filter points by morphology.

**Example:**
```typescript
morphology: {
  field: 'Morphology',
  label: 'Morphology',
  enabled: true
}
```

##### `filters.game`
Filter points by game type.

**Example:**
```typescript
game: {
  field: 'Game',
  label: 'Game',
  enabled: true
}
```

##### `filters.conservationState`
Filter points by conservation state.

**Example:**
```typescript
conservationState: {
  field: 'ConservationState',
  label: 'Conservation State',
  enabled: true
}
```

##### `filters.typology`
Filter points by typology.

**Example:**
```typescript
typology: {
  field: 'Typology',
  label: 'Typology',
  enabled: true
}
```

##### `filters.hasImages`
Filter to show only points with images.

**Example:**
```typescript
hasImages: {
  field: 'Image',
  label: 'Has Images',
  enabled: true
}
```

#### Disabling a Filter

To disable a filter, set its `enabled` property to `false`:

```typescript
filters: {
  material: {
    field: 'Material',
    label: 'Material',
    enabled: false  // This filter won't appear in the UI
  }
}
```

---

### Debug Mode

#### `debug.enabled` (boolean)
Controls whether the Debug button appears in the UI.

**Example:**
```typescript
debug: {
  enabled: true
}
```

#### `debug.showConsoleLog` (boolean)
Controls whether console logging is enabled throughout the application.

**Example:**
```typescript
debug: {
  showConsoleLog: true
}
```

---

### Map Settings

#### `map.defaultCenter` ([number, number])
The default latitude and longitude where the map is centered on load.

**Example:**
```typescript
map: {
  defaultCenter: [46.8, 8.2]  // [latitude, longitude]
}
```

#### `map.defaultZoom` (number)
The default zoom level of the map (1-20, where higher is more zoomed in).

**Example:**
```typescript
map: {
  defaultZoom: 8
}
```

#### `map.clusterRadius` (number)
The radius in pixels within which markers are clustered together.

**Example:**
```typescript
map: {
  clusterRadius: 50
}
```

---

## Complete Configuration Example

Here's a complete example with different settings:

```typescript
export const config: AppConfig = {
  appName: 'My Custom Map',
  
  apiUrl: 'https://my-api.example.com/api/v2/tables/mytable/records',
  apiToken: 'my-api-token-here',
  
  filters: {
    material: {
      field: 'Material',
      label: 'Material Type',
      enabled: true
    },
    morphology: {
      field: 'Morphology',
      label: 'Morphology',
      enabled: false  // Disabled
    },
    game: {
      field: 'Game',
      label: 'Game',
      enabled: true
    },
    conservationState: {
      field: 'ConservationState',
      label: 'State',
      enabled: true
    },
    typology: {
      field: 'Typology',
      label: 'Type',
      enabled: false  // Disabled
    },
    hasImages: {
      field: 'Image',
      label: 'Has Images',
      enabled: true
    }
  },
  
  debug: {
    enabled: false,  // Hide debug button in production
    showConsoleLog: false  // Disable console logs in production
  },
  
  map: {
    defaultCenter: [47.0, 8.5],  // Different center point
    defaultZoom: 10,  // More zoomed in
    clusterRadius: 80  // Larger cluster radius
  },
  
  eddbServiceUrl: 'https://eddb.unifr.ch'
}
```

---

## Tips

1. **Production Settings**: For production, consider setting `debug.enabled` and `debug.showConsoleLog` to `false`.

2. **Customizing Filters**: You can change the `label` property to use different text in the UI without changing the underlying `field` property.

3. **Disabling Unwanted Filters**: Simply set `enabled: false` for any filters you don't need. The UI will automatically adjust.

4. **API Configuration**: Make sure your `apiUrl` and `apiToken` are correct for your NocoDB instance.

5. **Map Positioning**: Adjust `defaultCenter` and `defaultZoom` to focus on your area of interest when the map loads.
