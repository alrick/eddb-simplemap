# Planning Guide

An interactive map application that displays archaeological game piece locations from the EDDB service using the Leaflet library, allowing users to explore, filter, and analyze data points with advanced filtering capabilities.

**Experience Qualities**:
1. **Intuitive** - Users can immediately understand how to interact with the map through familiar pan and zoom controls, with accessible filtering options
2. **Responsive** - The map smoothly reacts to user interactions with fluid animations and efficient data loading from the API
3. **Clear** - Points are visually distinct, filters are well-organized, and the interface prioritizes the map content over controls

**Complexity Level**: Light Application (multiple features with basic state)
This is a data visualization application that connects to a NocoDB API to display archaeological game piece data on an interactive map, with comprehensive filtering, debugging capabilities, and centralized configuration management.

## Essential Features

### Centralized Configuration System
- **Functionality**: Single configuration file (`src/config.ts`) that controls all application settings including app name, API endpoints, filter availability, debug mode, and map defaults
- **Purpose**: Allows easy customization of the application without modifying component code
- **Trigger**: Configuration loaded at application startup
- **Progression**: App initializes → Config loaded → Components use config values
- **Success criteria**: All components respect configuration settings, filters can be enabled/disabled, debug mode toggles correctly

### Interactive Map Display
- **Functionality**: Renders a full-screen Leaflet map with OpenStreetMap tiles, supporting pan, zoom, and standard map interactions
- **Purpose**: Provides the core geographic visualization canvas for displaying archaeological data
- **Trigger**: Automatic on page load
- **Progression**: Page loads → Map initializes with configurable center/zoom → Tiles load → Interactive controls available
- **Success criteria**: Map renders without errors, tiles load completely, pan/zoom work smoothly

### Dynamic API Data Loading
- **Functionality**: Fetches archaeological game piece records from configurable NocoDB API with pagination support
- **Purpose**: Displays real data from the EDDB service on the map
- **Trigger**: Automatic after map initialization
- **Progression**: Map loads → API called with pagination → Records processed → Valid coordinates plotted → Markers clustered
- **Success criteria**: All records fetched, coordinates parsed correctly, marker count displayed in header

### Advanced Filtering System
- **Functionality**: Configurable multi-category filters (Material, Morphology, Game, Conservation State, Typology, Has Images) with counts and select all/none options
- **Purpose**: Allows users to focus on specific subsets of the archaeological data
- **Trigger**: User clicks Filter button
- **Progression**: Click Filter → Panel opens → Select/deselect criteria → Map updates instantly → Point count updates
- **Success criteria**: Filters are responsive, map updates match selections, configurable filters show/hide based on config

### Debug Panel
- **Functionality**: Configurable debug interface showing raw API response data and record statistics
- **Purpose**: Helps developers verify data structure and troubleshoot issues
- **Trigger**: User clicks Debug button (if enabled in config)
- **Progression**: Click Debug → Panel opens → JSON data displayed with metadata
- **Success criteria**: Shows complete API response, scrollable, toggles open/close, can be disabled via config

### Open Point by ID
- **Functionality**: Dialog that allows direct navigation to a specific point using its ID
- **Purpose**: Enables precise location access for reference or sharing
- **Trigger**: User clicks "Open by ID" button
- **Progression**: Click button → Enter ID → Submit → Map centers on point → Popup opens
- **Success criteria**: Finds existing points, shows error for invalid IDs, zooms appropriately

## Edge Case Handling
- **Slow network**: Display loading spinner while fetching API data with progress indication
- **API errors**: Show error message overlay with details when API calls fail
- **Invalid coordinates**: Skip records with malformed or missing GeoData silently
- **Missing data**: Display "Unknown" for empty filter fields, handle gracefully
- **Large datasets**: Use marker clustering to maintain performance with thousands of points
- **No images**: Handle records without images in image filter and popup display
- **Disabled filters**: UI adapts dynamically based on configuration, hiding disabled filters

## Design Direction

The design should feel clean, professional, and academic - prioritizing data clarity and efficient filtering workflows. A minimal interface where the map is the hero, with powerful but unobtrusive controls that reveal complexity progressively.

## Color Selection

Analogous blue-purple palette that complements standard map tiles while maintaining academic professionalism.

- **Primary Color**: Deep Blue-Purple (oklch(0.45 0.15 250)) - Professional and trustworthy, used for interactive elements and selected states
- **Secondary Colors**: Teal-Blue (oklch(0.55 0.12 200)) for supporting UI elements that need distinction from primary actions
- **Accent Color**: Bright Cyan (oklch(0.7 0.15 210)) - Highlights active markers and hover states to draw attention
- **Foreground/Background Pairings**: 
  - Background (Clean White oklch(0.98 0 0)): Dark text (oklch(0.2 0 0)) - Ratio 14.1:1 ✓
  - Primary (Deep Blue-Purple oklch(0.45 0.15 250)): White text (oklch(0.98 0 0)) - Ratio 6.8:1 ✓
  - Card (Soft White oklch(0.97 0 0)): Dark text (oklch(0.2 0 0)) - Ratio 13.5:1 ✓
  - Accent (Bright Cyan oklch(0.7 0.15 210)): Dark text (oklch(0.2 0 0)) - Ratio 8.2:1 ✓

## Font Selection

Clean, geometric sans-serif typography that maintains excellent legibility at small sizes for map labels and information displays. Using Inter for its technical precision and strong readability across weights.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter SemiBold/24px/tight letter spacing
  - H2 (Panel Headers): Inter SemiBold/14px/normal letter spacing
  - H3 (Popup Titles): Inter Medium/16px/normal letter spacing
  - Body (Info Text): Inter Regular/14px/relaxed line height (1.5)
  - Small (Metadata): Inter Regular/12px/normal
  - Tiny (Tab Labels): Inter Medium/10px/tight

## Animations

Subtle and purposeful - animations should enhance spatial understanding and provide feedback without distracting from data exploration. The focus is on smooth transitions that feel immediate and responsive.

- **Purposeful Meaning**: Map transitions guide the eye naturally, filter panel slides in smoothly, marker interactions provide satisfying feedback, and state changes feel instantaneous
- **Hierarchy of Movement**: Map pan/zoom is the primary motion, filter panel transitions are secondary, marker popups are quick fades, UI controls have minimal hover states

## Component Selection

- **Components**: 
  - Card (for filter/debug panels with shadow for depth)
  - Button (for all interactive controls with size variants)
  - Checkbox (for filter selections)
  - Switch (for boolean filters like "Has Images")
  - Tabs (for organizing multiple filter categories)
  - Dialog (for "Open by ID" modal)
  - Input (for ID entry)
  - Label (for form fields)
  - Toaster (via Sonner for success/error notifications)
  
- **Customizations**: 
  - Custom map wrapper component encapsulating Leaflet with configuration integration
  - Styled marker icons with teardrop shape using inline styles
  - Custom popup styles with image galleries and markdown support
  - Configuration-driven filter visibility and tab layout
  
- **States**: 
  - Markers have default and active (popup open) states
  - Filter panel shows selected counts and has sticky headers
  - Buttons toggle between active/inactive variants based on panel state
  - Loading state shows spinner overlay during data fetch
  - Debug mode can be completely hidden via configuration
  
- **Icon Selection**: 
  - MapTrifold for app logo
  - MapPin for point count display
  - Funnel for filter toggle
  - Bug for debug toggle
  - Crosshair for "Open by ID"
  - Image for image filter
  - ArrowCounterClockwise for reset
  - X for close actions
  
- **Spacing**: 
  - Consistent 16px padding for panel content
  - 12px gaps for filter items
  - 8px for tight UI controls
  - 24px for section separation
  
- **Mobile**: 
  - Responsive filter panel with adjusted width
  - Touch-friendly markers with appropriate hit areas
  - Collapsible filter tabs for space efficiency
  - Full viewport map on mobile with overlay controls

## Configuration Documentation

See `CONFIG.md` for detailed information about configuring:
- Application name and branding
- API endpoints and authentication
- Filter availability and field mappings
- Debug mode settings
- Map defaults (center, zoom, cluster radius)
