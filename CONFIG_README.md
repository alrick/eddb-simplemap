# Configuration Guide

Ce guide explique comment configurer l'application de carte interactive Ludus.

## Configuration des Propriétés

La nouvelle configuration unifiée des propriétés permet de contrôler à la fois l'affichage dans les popups, les labels, et les filtres disponibles.

### Structure d'une propriété

```typescript
interface PropertyConfig {
  field: string           // Le nom du champ dans les données API
  label?: string          // Label d'affichage optionnel (si absent, utilise le nom du champ)
  filter: FilterType      // Configuration du filtre (ou null pour pas de filtre)
}
```

### Types de filtres

#### 1. Filtre standard (liste de sélection)

```typescript
{
  field: 'Material',
  label: 'Matériel',
  filter: {
    type: 'standard',
    shortLabel: 'Mat.'    // Optionnel: label court pour les onglets
  }
}
```

#### 2. Filtre booléen (interrupteur on/off)

```typescript
{
  field: 'Image',
  label: 'A des images',
  filter: {
    type: 'boolean',
    checkFunction: (record) => {  // Optionnel: fonction de vérification personnalisée
      return record.Image && Array.isArray(record.Image) && record.Image.length > 0
    }
  }
}
```

Si `checkFunction` n'est pas fourni, le filtre vérifiera simplement si le champ est truthy: `!!record[field]`

#### 3. Pas de filtre

```typescript
{
  field: 'PleiadesId',
  label: 'ID Pleiades',
  filter: null            // Pas de filtre, uniquement affiché dans le popup
}
```

### Ordre d'affichage

L'ordre de déclaration des propriétés dans le tableau détermine :
- L'ordre d'affichage des champs dans le popup
- L'ordre des filtres dans l'interface

### Exemples

#### Exemple 1 : Configuration complète

```typescript
properties: [
  {
    field: 'Material',
    label: 'Matériel',
    filter: {
      type: 'standard'
    }
  },
  {
    field: 'Morphology',
    label: 'Morphologie',
    filter: {
      type: 'standard',
      shortLabel: 'Morph.'
    }
  },
  {
    field: 'PleiadesId',
    label: 'ID Pleiades',
    filter: null
  },
  {
    field: 'Image',
    label: 'A des images',
    filter: {
      type: 'boolean',
      checkFunction: (record) => record.Image?.length > 0
    }
  }
]
```

#### Exemple 2 : Utiliser le nom du champ comme label

```typescript
properties: [
  {
    field: 'Material',
    // Pas de label, "Material" sera utilisé
    filter: { type: 'standard' }
  }
]
```

#### Exemple 3 : Seulement l'affichage, pas de filtres

```typescript
properties: [
  {
    field: 'Description',
    label: 'Description',
    filter: null
  },
  {
    field: 'Date',
    label: 'Date',
    filter: null
  }
]
```

### Champs toujours exclus

Les champs suivants sont toujours exclus de l'affichage dans le popup :

- `GeoData` (ou le champ défini dans `geoDataField`)
- `Id`
- Le champ défini dans `popup.titleField`
- `CreatedAt`
- `UpdatedAt`
- `Location1`, `Location2`, `Location3` (affichés groupés comme "Locations")
- `Image` (affiché séparément en tant qu'images)

### Traitement spécial

- **Locations** : Les champs `Location1`, `Location2`, et `Location3` sont automatiquement groupés et affichés comme "Locations"
- **PleiadesId** : Automatiquement converti en lien vers Pleiades
- **Markdown** : Toutes les valeurs sont analysées comme Markdown
- **Images** : Les images sont affichées en bas du popup si disponibles

## Configuration du Popup

```typescript
popup: {
  titleField: string  // Le champ à utiliser comme titre du popup
  width?: number      // Largeur optionnelle du popup en pixels (défaut: 300)
}
```

### Exemple

```typescript
popup: {
  titleField: 'Title',
  width: 400
}
```

## Configuration complète

Voir le fichier `src/config.ts` pour la configuration complète de l'application incluant :

- Nom de l'application
- URL de l'API
- Token d'authentification
- Champ de données géographiques
- Propriétés (affichage, labels et filtres)
- Configuration de la carte
- Configuration du popup
- URL du service EDDB
