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

### Geographic Data

#### `geoDataField` (string)
The field containing geographic coordinates in the format "lat;lng".

**Example:**
```typescript
geoDataField: 'Coordinates'
```

---

### Properties Configuration

The `properties` array defines which fields to display and filter. Properties are displayed in the order they are defined.

**Example:**
```typescript
properties: [
  {
    field: 'TownVillage',
    label: 'Town / Village',
    filter: null
  },
  {
    field: 'Material',
    label: 'Material Type',
    filter: {
      type: 'standard',
      shortLabel: 'Mat.'
    }
  },
  {
    field: 'Circuits',
    label: 'Associated Circuits',
    path: '_nc_m2m_Sites_Circuits.Circuits.Denomination',
    filter: {
      type: 'standard'
    }
  }
]
```

---

### Popup Settings

#### `popup.titleField` (string)
The field to use as the title in point popups.

**Example:**
```typescript
popup: {
  titleField: 'Denomination'
}
```

#### `popup.width` (number, optional)
The maximum width of the popup in pixels.

**Example:**
```typescript
popup: {
  width: 500
}
```

#### `popup.imageField` (string, optional)
The field containing image data to display in popups.

**Example:**
```typescript
popup: {
  imageField: 'Visuals'
}
```

---

### Filter Menu Settings

#### `filterMenu.type` (string)
The type of filter menu UI: `'dropdown'` or `'tabs'`.

**Example:**
```typescript
filterMenu: {
  type: 'dropdown'  // or 'tabs'
}
```

---

### Filter Configuration

The new filter configuration uses a unified `properties` array that combines display fields, labels, and filter settings.

Each property has the following fields:
- `field` (string): The unique identifier for the property
- `label` (string, optional): The display label (defaults to the field name)
- `filter` (FilterType | null): The filter configuration, or null for no filter
- `path` (string, optional): For relational properties, the path to access nested data

#### Filter Types

##### Standard Filter
A standard filter creates a list of checkboxes for all unique values found in the data.

**Example:**
```typescript
{
  field: 'Material',
  label: 'Material Type',
  filter: {
    type: 'standard',
    shortLabel: 'Mat.'  // Optional: shorter label for tabs
  }
}
```

##### Boolean Filter
A boolean filter provides a simple toggle switch (e.g., "Has Images").

**Example:**
```typescript
{
  field: 'HasImages',
  label: 'Has Images',
  filter: {
    type: 'boolean',
    checkFunction: (record) => {
      // Custom logic to check if record has images
      return record.Images && record.Images.length > 0
    }
  }
}
```

##### No Filter
To display a property without filtering capability, set `filter` to `null`.

**Example:**
```typescript
{
  field: 'Description',
  label: 'Description',
  filter: null  // Display only, no filter
}
```

#### Relational Properties

For database relations (like `_nc_m2m_Sites_Circuits` in NocoDB), use the `path` parameter to access nested data.

**Example:**
```typescript
{
  field: 'Circuits',
  label: 'Associated Circuits',
  path: '_nc_m2m_Sites_Circuits.Circuits.Denomination',
  filter: {
    type: 'standard',
    shortLabel: 'Circuits'
  }
}
```

The `path` parameter uses dot notation to navigate through nested objects and arrays:
- If an array is encountered, all matching values are extracted
- Multiple values are displayed as comma-separated lists in popups
- For filters, each unique value becomes a filter option

**See `RELATION_PROPERTIES_GUIDE.md` for detailed examples and usage patterns.**

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

Here's a complete example configuration:

```typescript
export const config: AppConfig = {
  appName: 'My Custom Map',
  
  apiUrl: 'https://my-api.example.com/api/v2/tables/mytable/records',
  apiToken: 'my-api-token-here',
  
  geoDataField: 'Coordinates',
  
  properties: [
    {
      field: 'TownVillage',
      label: 'Town / Village',
      filter: null
    },
    {
      field: 'Material',
      label: 'Material Type',
      filter: {
        type: 'standard',
        shortLabel: 'Mat.'
      }
    },
    {
      field: 'Circuits',
      label: 'Associated Circuits',
      path: '_nc_m2m_Sites_Circuits.Circuits.Denomination',
      filter: {
        type: 'standard',
        shortLabel: 'Circuits'
      }
    },
    {
      field: 'HasImages',
      label: 'Has Images',
      filter: {
        type: 'boolean',
        checkFunction: (record) => {
          return record.Visuals && Array.isArray(record.Visuals) && record.Visuals.length > 0
        }
      }
    }
  ],
  
  debug: {
    enabled: false,
    showConsoleLog: false
  },
  
  map: {
    defaultCenter: [47.0, 8.5],
    defaultZoom: 10,
    clusterRadius: 80
  },
  
  popup: {
    titleField: 'Denomination',
    width: 500,
    imageField: 'Visuals'
  },
  
  filterMenu: {
    type: 'dropdown'
  },
  
  eddbServiceUrl: 'https://eddb.unifr.ch'
}
```

---

## Tips

1. **Production Settings**: For production, consider setting `debug.enabled` and `debug.showConsoleLog` to `false`.

2. **Properties Order**: The order of properties in the `properties` array determines both the display order in popups and the order of filter tabs.

3. **Relational Properties**: Use the `path` parameter to access nested data from database relations. See `RELATION_PROPERTIES_GUIDE.md` for detailed examples.

4. **Filter Types**: Choose between `'dropdown'` and `'tabs'` for `filterMenu.type` based on the number of filters - tabs work better with fewer filters.

5. **API Configuration**: Make sure your `apiUrl` and `apiToken` are correct for your NocoDB instance.

6. **Map Positioning**: Adjust `defaultCenter` and `defaultZoom` to focus on your area of interest when the map loads.

7. **Custom Labels**: Use the `label` property to provide user-friendly names while keeping technical field names in `field`.

8. **Boolean Filters**: For complex filtering logic, use boolean filters with custom `checkFunction` implementations.
