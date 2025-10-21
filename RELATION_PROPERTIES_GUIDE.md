# Guide d'utilisation des propriétés relationnelles

Ce guide explique comment configurer les propriétés relationnelles (comme `_nc_m2m_Sites_Circuits`) dans votre application.

## Vue d'ensemble

Les propriétés relationnelles sont des champs de la base de données qui contiennent des relations vers d'autres tables. Par exemple, un champ `_nc_m2m_Sites_Circuits` pourrait contenir un tableau d'objets avec des informations sur des circuits associés.

## Configuration

Pour utiliser une propriété relationnelle, vous devez définir le paramètre `path` dans la configuration de la propriété :

```typescript
{
  field: 'Circuits',
  label: 'Circuits associés',
  path: '_nc_m2m_Sites_Circuits.Circuits.Denomination',
  filter: {
    type: 'standard'
  }
}
```

### Paramètres

- **`field`** : Le nom de la propriété (utilisé comme clé unique dans l'application)
- **`label`** : Le label affiché dans l'interface (optionnel)
- **`path`** : Le chemin pour accéder à la propriété dans les relations
- **`filter`** : Configuration du filtre (optionnel)

## Fonctionnement du chemin (path)

Le chemin utilise la notation par points pour naviguer dans les objets imbriqués et les tableaux :

### Exemple 1 : Accès simple à une relation

```typescript
// Structure de données :
{
  "_nc_m2m_Sites_Circuits": [
    {
      "Circuits": {
        "Denomination": "Circuit A"
      }
    },
    {
      "Circuits": {
        "Denomination": "Circuit B"
      }
    }
  ]
}

// Configuration :
path: '_nc_m2m_Sites_Circuits.Circuits.Denomination'

// Résultat : ["Circuit A", "Circuit B"]
```

### Exemple 2 : Accès à plusieurs niveaux

```typescript
// Structure de données :
{
  "Relations": [
    {
      "Item": {
        "Details": {
          "Name": "Détail 1"
        }
      }
    }
  ]
}

// Configuration :
path: 'Relations.Item.Details.Name'

// Résultat : ["Détail 1"]
```

### Exemple 3 : Tableaux imbriqués

```typescript
// Structure de données :
{
  "Categories": [
    {
      "Items": [
        { "Name": "Item 1" },
        { "Name": "Item 2" }
      ]
    },
    {
      "Items": [
        { "Name": "Item 3" }
      ]
    }
  ]
}

// Configuration :
path: 'Categories.Items.Name'

// Résultat : ["Item 1", "Item 2", "Item 3"]
```

## Utilisation avec les filtres

Lorsque vous utilisez une propriété relationnelle avec un filtre, le système :

1. Extrait toutes les valeurs à partir du chemin spécifié
2. Crée un filtre avec toutes les valeurs uniques trouvées
3. Permet de filtrer les points sur la carte en fonction de ces valeurs

### Exemple de configuration complète

```typescript
export const config: AppConfig = {
  // ... autres configurations
  
  properties: [
    // Propriété simple (sans relation)
    {
      field: 'TownVillage',
      label: 'Ville / Village',
      filter: null
    },
    
    // Propriété relationnelle avec filtre
    {
      field: 'Circuits',
      label: 'Circuits',
      path: '_nc_m2m_Sites_Circuits.Circuits.Denomination',
      filter: {
        type: 'standard',
        shortLabel: 'Circuits'
      }
    },
    
    // Propriété relationnelle sans filtre (affichage uniquement)
    {
      field: 'CircuitDetails',
      label: 'Détails des circuits',
      path: '_nc_m2m_Sites_Circuits.Circuits.Description',
      filter: null
    }
  ]
}
```

## Affichage dans les popups

Les valeurs extraites depuis les propriétés relationnelles sont automatiquement :

- Affichées dans le popup du point
- Jointes par des virgules si plusieurs valeurs existent
- Parsées en Markdown si le contenu le permet

## Gestion des valeurs vides

Si aucune valeur n'est trouvée pour un chemin donné :

- Dans les filtres : la valeur "Unknown" est ajoutée
- Dans les popups : la propriété n'est pas affichée

## Exemples d'utilisation courante

### Relations many-to-many (NocoDB)

```typescript
{
  field: 'RelatedItems',
  label: 'Items associés',
  path: '_nc_m2m_TableA_TableB.TableB.Name',
  filter: { type: 'standard' }
}
```

### Relations one-to-many

```typescript
{
  field: 'Comments',
  label: 'Commentaires',
  path: 'Comments.Text',
  filter: null
}
```

### Accès à des propriétés calculées

```typescript
{
  field: 'FullNames',
  label: 'Noms complets',
  path: 'Users.Profile.FullName',
  filter: { type: 'standard' }
}
```

## Notes importantes

1. **Performance** : Les chemins complexes avec de nombreux tableaux imbriqués peuvent impacter les performances
2. **Validation** : Assurez-vous que le chemin correspond à la structure réelle de vos données
3. **Débogage** : Utilisez le mode debug pour voir la structure complète des données de l'API
4. **Compatibilité** : Le paramètre `path` est optionnel - si absent, le système utilise directement le champ
