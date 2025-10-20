# Configuration Guide

Ce guide explique comment configurer l'application de carte interactive Ludus.

## Configuration du Popup

La configuration du popup permet de contrôler comment les informations des points sont affichées lorsqu'on clique dessus.

### Propriétés disponibles

```typescript
popup: {
  titleField: string        // Le champ à utiliser comme titre du popup
  displayFields?: string[]  // Liste optionnelle des champs à afficher (si undefined, tous les champs sont affichés)
}
```

### Exemples

#### Exemple 1 : Afficher tous les champs (configuration par défaut)

```typescript
popup: {
  titleField: 'Title',
  displayFields: undefined  // Tous les champs seront affichés
}
```

#### Exemple 2 : Afficher uniquement certains champs

```typescript
popup: {
  titleField: 'Title',
  displayFields: ['Material', 'Morphology', 'Game', 'PleiadesId', 'Description']
}
```

Dans cet exemple, seuls les champs spécifiés seront affichés dans le popup (en plus des locations et des images).

#### Exemple 3 : Utiliser un champ différent comme titre

```typescript
popup: {
  titleField: 'Name',  // Utilise le champ "Name" au lieu de "Title"
  displayFields: ['Type', 'Date', 'Location']
}
```

### Champs toujours exclus

Les champs suivants sont toujours exclus de l'affichage, même s'ils sont inclus dans `displayFields` :

- `GeoData` (ou le champ défini dans `geoDataField`)
- `Id`
- Le champ défini dans `titleField`
- `CreatedAt`
- `UpdatedAt`
- `Location1`, `Location2`, `Location3` (affichés groupés comme "Locations")
- `Image` (affiché séparément en tant qu'images)

### Traitement spécial

- **Locations** : Les champs `Location1`, `Location2`, et `Location3` sont automatiquement groupés et affichés comme "Locations"
- **PleiadesId** : Automatiquement converti en lien vers Pleiades
- **Markdown** : Toutes les valeurs sont analysées comme Markdown
- **Images** : Les images sont affichées en bas du popup si disponibles

## Configuration complète

Voir le fichier `src/config.ts` pour la configuration complète de l'application incluant :

- Nom de l'application
- URL de l'API
- Token d'authentification
- Champ de données géographiques
- Filtres
- Configuration de la carte
- Configuration du popup (nouvelle)
- URL du service EDDB
