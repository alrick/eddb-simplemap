# Ludus Map Application - Configuration Guide

## Vue d'ensemble

Le système de configuration a été unifié pour gérer à la fois l'affichage des propriétés dans les popups, leurs labels, et les filtres disponibles. Tout est maintenant configuré dans un seul tableau de propriétés.

## Structure d'une propriété

```typescript
interface PropertyConfig {
  field: string           // Le nom du champ dans les données API
  label?: string          // Label d'affichage optionnel (si absent, utilise le nom du champ)
  filter: FilterType      // Configuration du filtre (ou null pour pas de filtre)
}
```

## Types de filtres

### 1. Filtre standard (Standard Filter)
Les filtres standard fonctionnent avec des champs texte/chaîne de caractères. Ils permettent aux utilisateurs de sélectionner plusieurs valeurs dans une liste.

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

Le système collecte automatiquement :
- Toutes les valeurs uniques du champ
- Le nombre d'occurrences de chaque valeur
- Crée des cases à cocher pour chaque valeur
- Gère les valeurs "Unknown" (champs vides ou null)
- Fournit des boutons "All" et "None" pour la sélection

### 2. Filtre booléen (Boolean Filter)
Les filtres booléens fournissent un interrupteur on/off pour des conditions spécifiques.

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

Si `checkFunction` n'est pas fourni, le filtre vérifie simplement si le champ est truthy: `!!record[field]`

### 3. Pas de filtre (null)
Pour les propriétés qui doivent seulement être affichées dans le popup sans filtre associé.

```typescript
{
  field: 'PleiadesId',
  label: 'ID Pleiades',
  filter: null
}
```

## Exemples de configuration

### Exemple 1 : Plusieurs filtres standard

```typescript
properties: [
  {
    field: 'Material',
    label: 'Matériel',
    filter: { type: 'standard' }
  },
  {
    field: 'Color',
    label: 'Couleur',
    filter: { type: 'standard' }
  },
  {
    field: 'Size',
    label: 'Taille',
    filter: { type: 'standard' }
  },
  {
    field: 'Category',
    label: 'Catégorie',
    filter: {
      type: 'standard',
      shortLabel: 'Cat.'
    }
  }
]
```

### Exemple 2 : Mix de filtres standard et booléens

```typescript
properties: [
  {
    field: 'Status',
    label: 'Statut',
    filter: { type: 'standard' }
  },
  {
    field: 'Featured',
    label: 'En vedette uniquement',
    filter: { type: 'boolean' }
  },
  {
    field: 'InStock',
    label: 'En stock',
    filter: { type: 'boolean' }
  }
]
```

### Exemple 3 : Propriétés sans filtres

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
  },
  {
    field: 'Notes',
    filter: null  // Utilisera "Notes" comme label
  }
]
```

### Exemple 4 : Uniquement des filtres booléens

```typescript
properties: [
  {
    field: 'Verified',
    label: 'Vérifié uniquement',
    filter: { type: 'boolean' }
  },
  {
    field: 'Premium',
    label: 'Premium uniquement',
    filter: { type: 'boolean' }
  }
]
```

### Exemple 5 : Aucun filtre

```typescript
properties: []
```

L'interface s'adaptera automatiquement et n'affichera pas le bouton de filtre.

## Ordre d'affichage

L'ordre de déclaration dans le tableau détermine :
1. **L'ordre d'affichage des propriétés dans le popup** - Les propriétés apparaissent dans l'ordre déclaré
2. **L'ordre des filtres dans l'interface** - Les filtres sont organisés dans l'ordre déclaré

## Logique de filtrage

1. **Filtres standard** :
   - Les points doivent correspondre à au moins une valeur sélectionnée
   - Si aucune valeur n'est sélectionnée, aucun point n'est affiché

2. **Filtres booléens** :
   - Les points doivent passer la vérification quand le filtre est activé
   - Quand désactivé, tous les points passent

3. **Logique AND** :
   - Tous les filtres activés sont appliqués avec une logique ET
   - Un point doit satisfaire tous les filtres pour être affiché

## Avantages du nouveau système

✅ **Flexibilité** : Ajoutez, supprimez ou réorganisez les propriétés et filtres facilement  
✅ **Simplicité** : Une seule configuration pour l'affichage, les labels et les filtres  
✅ **Pas de modifications de code** : Modifiez les propriétés dans config.ts sans toucher au code des composants  
✅ **Type-safe** : Support complet TypeScript avec des types appropriés  
✅ **Interface dynamique** : L'interface s'adapte automatiquement au nombre et type de propriétés  
✅ **Évolutif** : Fonctionne avec n'importe quel nombre de propriétés (0 à plusieurs)  
✅ **Ordre préservé** : L'ordre de déclaration est respecté partout

## Migration depuis l'ancien système

### Ancien système (avant)

Trois configurations séparées :

```typescript
// ❌ Ancien système (complexe et fragmenté)
filters: [
  { type: 'standard', field: 'Material', label: 'Material' }
],
popup: {
  titleField: 'Title',
  displayFields: ['Material', 'Morphology', 'Game'],
  fieldLabels: {
    'Material': 'Matériel',
    'Morphology': 'Morphologie',
    'Game': 'Jeu'
  }
}
```

### Nouveau système (maintenant)

Une seule configuration unifiée :

```typescript
// ✅ Nouveau système (simple et unifié)
properties: [
  {
    field: 'Material',
    label: 'Matériel',
    filter: { type: 'standard' }
  },
  {
    field: 'Morphology',
    label: 'Morphologie',
    filter: { type: 'standard', shortLabel: 'Morph.' }
  },
  {
    field: 'Game',
    label: 'Jeu',
    filter: { type: 'standard' }
  }
],
popup: {
  titleField: 'Title',
  width: 300
}
```

## Configuration complète

Pour voir un exemple complet de configuration, consultez `src/config.ts`.
