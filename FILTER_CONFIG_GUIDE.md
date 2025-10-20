# Ludus Map Application - Filter Configuration Guide

## Overview

The filter system has been refactored to be fully flexible and dynamic. You can now define any number of filters (or none at all) in the configuration file.

## Filter Types

### 1. Standard Filters
Standard filters work with text/string fields in your data. They allow users to select multiple values from a list.

```typescript
{
  type: 'standard',
  field: 'Material',           // The field name in your API data
  label: 'Material',           // The display label (full version)
  shortLabel: 'Mat.'           // Optional: shorter label for tabs (if space is limited)
}
```

### 2. Boolean Filters
Boolean filters provide an on/off switch for specific conditions.

```typescript
{
  type: 'boolean',
  field: 'Image',              // The field name in your API data
  label: 'Has Images',         // The display label
  checkFunction: (record) => { // Optional: custom check function
    return record.Image && Array.isArray(record.Image) && record.Image.length > 0
  }
}
```

If no `checkFunction` is provided, the filter will simply check if the field is truthy: `!!record[field]`

## Configuration Examples

### Example 1: Multiple Standard Filters
```typescript
filters: [
  { type: 'standard', field: 'Material', label: 'Material' },
  { type: 'standard', field: 'Color', label: 'Color' },
  { type: 'standard', field: 'Size', label: 'Size' },
  { type: 'standard', field: 'Category', label: 'Category', shortLabel: 'Cat.' }
]
```

### Example 2: Mix of Standard and Boolean Filters
```typescript
filters: [
  { type: 'standard', field: 'Status', label: 'Status' },
  { type: 'boolean', field: 'Featured', label: 'Featured Only' },
  { type: 'boolean', field: 'InStock', label: 'In Stock' }
]
```

### Example 3: No Filters
```typescript
filters: []
```

### Example 4: Only Boolean Filters
```typescript
filters: [
  { type: 'boolean', field: 'Verified', label: 'Verified Only' },
  { type: 'boolean', field: 'Premium', label: 'Premium Only' }
]
```

## How It Works

1. **Standard Filters**: The system automatically:
   - Collects all unique values from the specified field
   - Counts occurrences of each value
   - Creates checkboxes for each value
   - Handles "Unknown" values (empty or null fields)
   - Provides "All" and "None" selection buttons

2. **Boolean Filters**: The system:
   - Creates a toggle switch
   - Uses the custom `checkFunction` if provided
   - Otherwise checks if the field is truthy

3. **Filtering Logic**:
   - All enabled filters are applied with AND logic
   - For standard filters: points must match at least one selected value
   - For boolean filters: points must pass the check when enabled

## Benefits of the New System

✅ **Flexible**: Add, remove, or reorder filters easily  
✅ **No Code Changes**: Modify filters in config.ts without touching component code  
✅ **Type-Safe**: Full TypeScript support with proper types  
✅ **Dynamic UI**: The UI automatically adapts to the number and type of filters  
✅ **Scalable**: Works with any number of filters (0 to many)  

## Migration from Old System

The old system had a fixed object structure:
```typescript
// ❌ Old way (rigid)
filters: {
  material: { field: 'Material', label: 'Material', enabled: true },
  morphology: { field: 'Morphology', label: 'Morphology', enabled: true }
}
```

The new system uses an array:
```typescript
// ✅ New way (flexible)
filters: [
  { type: 'standard', field: 'Material', label: 'Material' },
  { type: 'standard', field: 'Morphology', label: 'Morphology', shortLabel: 'Morph.' }
]
```

To disable a filter, simply remove it from the array instead of setting `enabled: false`.
