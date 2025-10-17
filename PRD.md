# Planning Guide

An interactive map prototype that displays hardcoded geographic points using the Leaflet library, allowing users to explore locations with pan and zoom controls.

**Experience Qualities**:
1. **Intuitive** - Users can immediately understand how to interact with the map through familiar pan and zoom gestures
2. **Responsive** - The map smoothly reacts to user interactions with fluid animations and quick load times
3. **Clear** - Points are visually distinct and the interface prioritizes the map content over controls

**Complexity Level**: Micro Tool (single-purpose)
This is a focused prototype demonstrating core mapping functionality with hardcoded data points, establishing the foundation for future geographic data visualization.

## Essential Features

### Interactive Map Display
- **Functionality**: Renders a full-screen Leaflet map with OpenStreetMap tiles, supporting pan, zoom, and standard map interactions
- **Purpose**: Provides the core geographic visualization canvas for displaying location data
- **Trigger**: Automatic on page load
- **Progression**: Page loads → Map initializes with default view → Tiles load → Interactive controls available
- **Success criteria**: Map renders without errors, tiles load completely, pan/zoom work smoothly

### Hardcoded Location Markers
- **Functionality**: Display multiple predefined points of interest on the map with custom markers and popups
- **Purpose**: Demonstrates marker placement and interaction patterns for future dynamic data
- **Trigger**: Automatic after map initialization
- **Progression**: Map loads → Markers appear at specified coordinates → User clicks marker → Popup displays location info
- **Success criteria**: All markers visible, clickable, and display correct information in popups

## Edge Case Handling
- **Slow network**: Display loading state while map tiles download
- **Small screens**: Map adapts to mobile viewport with appropriate zoom levels and touch controls
- **Missing tiles**: Leaflet handles tile loading errors gracefully with retry logic
- **Multiple marker clicks**: Only one popup open at a time for clean UX

## Design Direction

The design should feel clean, professional, and utilitarian - prioritizing map readability and interaction fluidity over decorative elements. A minimal interface where the map is the hero, with controls that fade into the background until needed.

## Color Selection

Analogous blue-green palette that complements standard map tiles without competing for attention.

- **Primary Color**: Deep Blue (oklch(0.45 0.15 250)) - Professional and trustworthy, used for interactive elements and selected states
- **Secondary Colors**: Teal (oklch(0.55 0.12 200)) for supporting UI elements that need distinction from primary actions
- **Accent Color**: Bright Cyan (oklch(0.7 0.15 210)) - Highlights active markers and hover states to draw attention
- **Foreground/Background Pairings**: 
  - Background (Clean White oklch(0.98 0 0)): Dark text (oklch(0.2 0 0)) - Ratio 14.1:1 ✓
  - Primary (Deep Blue oklch(0.45 0.15 250)): White text (oklch(0.98 0 0)) - Ratio 6.8:1 ✓
  - Card (Soft White oklch(0.97 0 0)): Dark text (oklch(0.2 0 0)) - Ratio 13.5:1 ✓
  - Accent (Bright Cyan oklch(0.7 0.15 210)): Dark text (oklch(0.2 0 0)) - Ratio 8.2:1 ✓

## Font Selection

Clean, geometric sans-serif typography that maintains excellent legibility at small sizes for map labels and information displays. Using Inter for its technical precision and strong readability across weights.

- **Typographic Hierarchy**:
  - H1 (Page Title): Inter SemiBold/24px/tight letter spacing
  - H2 (Popup Headers): Inter Medium/16px/normal letter spacing
  - Body (Info Text): Inter Regular/14px/relaxed line height (1.5)
  - Small (Attribution): Inter Regular/11px/normal

## Animations

Subtle and purposeful - animations should enhance spatial understanding without distracting from map exploration. The focus is on smooth transitions that feel immediate and responsive.

- **Purposeful Meaning**: Map transitions guide the eye naturally, marker interactions provide satisfying feedback, and state changes feel instantaneous
- **Hierarchy of Movement**: Map pan/zoom is the primary motion, marker popups are secondary quick fades, UI controls have minimal hover states

## Component Selection

- **Components**: 
  - Card (for map container with subtle shadow for depth)
  - Button (for zoom controls if adding custom UI)
  - Popover/Dialog (for potential marker detail views beyond basic popups)
  - Skeleton (loading state for map initialization)
- **Customizations**: 
  - Custom map wrapper component to encapsulate Leaflet initialization
  - Styled marker icons using Phosphor icons for consistent visual language
  - Custom popup styles matching the overall theme
- **States**: 
  - Markers have default, hover (brightened), and active (popup open) states
  - Map itself shows loading skeleton before tiles appear
  - Interactive elements have subtle scale transforms on hover
- **Icon Selection**: MapPin for primary location markers, MapTrifold for map toggle, MagnifyingGlassPlus/Minus for zoom controls
- **Spacing**: Consistent 16px/24px spacing for popup content, 8px for compact UI controls, generous 32px padding for container elements
- **Mobile**: Full viewport map on mobile, simplified touch-friendly markers with larger hit areas, bottom-positioned attribution to avoid gesture zones
