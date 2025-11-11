# ULTRA-DETAILED PROMPT: FEED PRICING DATA COMPONENT (Based on feed-pricing-data.html)

## COMPONENT OVERVIEW
Create a comprehensive pricing data feed interface for a real estate platform that allows users to populate and maintain a reference pricing database by selecting neighborhoods, launching automated scrapers, and manually adding property data through multiple input methods.

## VISUAL DESIGN SPECIFICATIONS

### Page Header
```
- Container:
  - Background: #FFFFFF
  - Border Bottom: 1px solid #E5E7EB
  - Position: Sticky top-0
  - Z-Index: 50
  - Box Shadow: 0 1px 2px rgba(0, 0, 0, 0.05)

- Layout:
  - Max Width: 1280px (7xl)
  - Padding X: 16px (sm:24px lg:32px)
  - Height: 64px
  - Display: Flex
  - Justify Content: Space Between
  - Align Items: Center

- Logo Section:
  - Display: Flex
  - Align Items: Center
  - Gap: 12px

- Logo Icon Container:
  - Width: 40px
  - Height: 40px
  - Background: #3B82F6
  - Border Radius: 8px
  - Display: Flex
  - Align Items: Center
  - Justify Content: Center

- Home Icon (SVG):
  - Width: 24px
  - Height: 24px
  - Color: #FFFFFF
  - Stroke Width: 2

- Title:
  - Font Size: 18px
  - Font Weight: 700
  - Color: #111827
  - Text: "House Flipper Pro"

- Subtitle:
  - Font Size: 12px
  - Color: #6B7280
  - Text: "Alimentar Precios de Referencia"

- Action Buttons Group:
  - Display: Flex
  - Gap: 12px
  - Hidden on Mobile (< 640px)

- Secondary Button (Calculator):
  - Background: #FFFFFF
  - Border: 1px solid #D1D5DB
  - Padding: 8px 16px
  - Border Radius: 8px
  - Font Size: 14px
  - Font Weight: 500
  - Color: #374151
  - Hover: Background #F9FAFB
  - Icon: 🧮

- Primary Button (Consult Prices):
  - Background: #16A34A
  - Padding: 8px 16px
  - Border Radius: 8px
  - Font Size: 14px
  - Font Weight: 500
  - Color: #FFFFFF
  - Hover: Background #15803D
  - Icon: 💰
```

### Main Content Area
```
- Container:
  - Max Width: 1280px
  - Margin: 0 auto
  - Padding: 32px 16px (sm:24px lg:32px)
  - Background: #F9FAFB

- Page Title Section:
  - Margin Bottom: 32px

- Page Title:
  - Font Size: 30px
  - Font Weight: 700
  - Color: #111827
  - Margin Bottom: 8px
  - Text: "Alimentar Base de Datos de Precios"

- Page Description:
  - Font Size: 16px
  - Color: #6B7280
  - Text: "Añade nuevas propiedades para mejorar los precios de referencia"
```

### STEP 1: City and Neighborhood Selection Card
```
- Card Container:
  - Background: #FFFFFF
  - Border Radius: 12px
  - Box Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
  - Padding: 24px
  - Margin Bottom: 32px

- Step Header:
  - Display: Flex
  - Align Items: Center
  - Gap: 8px
  - Margin Bottom: 24px

- Step Number Badge:
  - Width: 32px
  - Height: 32px
  - Background: #DBEAFE
  - Color: #2563EB
  - Border Radius: 50%
  - Display: Flex
  - Align Items: Center
  - Justify Content: Center
  - Font Weight: 700
  - Text: "1"

- Step Title:
  - Font Size: 20px
  - Font Weight: 600
  - Color: #111827
  - Text: "Selecciona Ciudad y Barrio"

- Selection Grid:
  - Display: Grid
  - Grid Template Columns: 1fr (mobile), repeat(2, 1fr) (md+)
  - Gap: 24px
  - Margin Bottom: 24px

- Field Label:
  - Display: Block
  - Font Size: 14px
  - Font Weight: 500
  - Color: #374151
  - Margin Bottom: 8px

- Select Field:
  - Width: 100%
  - Padding: 12px 16px
  - Border: 1px solid #D1D5DB
  - Border Radius: 8px
  - Font Size: 14px
  - Background: #FFFFFF
  - Focus Border: #3B82F6
  - Focus Box Shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)
  - Transition: all 0.2s ease

- Option Count Helper:
  - Font Size: 12px
  - Color: #6B7280
  - Margin Top: 4px
  - Text: "169 barrios disponibles"
```

### Database Statistics Panel
```
- Stats Container (Initially Hidden):
  - Padding: 16px
  - Background: #DBEAFE
  - Border: 1px solid #93C5FD
  - Border Radius: 8px

- Stats Layout:
  - Display: Flex
  - Justify Content: Space Between
  - Align Items: Center

- Left Stats Section:
  - Display: Flex
  - Flex Direction: Column

- Stats Label:
  - Font Size: 14px
  - Font Weight: 500
  - Color: #374151

- Property Count:
  - Font Size: 30px
  - Font Weight: 700
  - Color: #2563EB
  - Margin Top: 4px

- Property Breakdown:
  - Font Size: 12px
  - Color: #4B5563
  - Margin Top: 4px
  - Format: "X reformadas • Y sin reformar"

- Right Stats Section:
  - Text Align: Right

- Update Label:
  - Font Size: 14px
  - Color: #4B5563

- Update Time:
  - Font Size: 14px
  - Font Weight: 500
  - Color: #111827
```

### Action Buttons Grid
```
- Button Container:
  - Display: Grid
  - Grid Template Columns: repeat(2, 1fr)
  - Gap: 16px
  - Margin Top: 24px

- Use Existing Button:
  - Background: #16A34A
  - Color: #FFFFFF
  - Padding: 12px 24px
  - Border Radius: 8px
  - Font Size: 16px
  - Font Weight: 600
  - Hover: Background #15803D
  - Transition: colors 0.2s
  - Icon: ✅

- Add More Button:
  - Background: #2563EB
  - Color: #FFFFFF
  - Padding: 12px 24px
  - Border Radius: 8px
  - Font Size: 16px
  - Font Weight: 600
  - Hover: Background #1D4ED8
  - Transition: colors 0.2s
  - Icon: ➕
```

### STEP 2: Add More Properties Section (Initially Hidden)
```
- Section Container:
  - Display: None (initially)
  - Space Y: 32px

- Animation on Show:
  - Fade In: opacity 0 to 1
  - Slide Down: translateY(-20px) to 0
  - Duration: 0.3s ease
```

### Option 2A: Automatic Scrapers Card
```
- Card Container:
  - Background: #FFFFFF
  - Border Radius: 12px
  - Box Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
  - Padding: 24px

- Step Badge:
  - Background: #F3E8FF
  - Color: #7C3AED
  - Text: "2A"

- Section Title:
  - Font Size: 20px
  - Font Weight: 600
  - Color: #111827
  - Text: "Lanzar Scrapers Automáticos"

- Description:
  - Font Size: 14px
  - Color: #6B7280
  - Margin Bottom: 24px

- Scrapers Grid:
  - Display: Grid
  - Grid Template Columns: 1fr (mobile), repeat(2, 1fr) (md), repeat(3, 1fr) (lg)
  - Gap: 16px
  - Margin Bottom: 24px

- Scraper Card:
  - Border: 2px solid #E5E7EB
  - Border Radius: 8px
  - Padding: 16px
  - Cursor: Pointer
  - Transition: all 0.3s ease

- Scraper Card Hover:
  - Border Color: #3B82F6
  - Box Shadow: 0 4px 12px rgba(59, 130, 246, 0.15)

- Scraper Card Active:
  - Border Color: #10B981
  - Background: Linear Gradient (135deg, #ECFDF5 0%, #D1FAE5 100%)

- Scraper Checkbox:
  - Width: 20px
  - Height: 20px
  - Border Radius: 4px
  - Margin Top: 4px

- Scraper Name:
  - Font Size: 16px
  - Font Weight: 600
  - Color: #111827

- Status Badge:
  - Padding: 2px 8px
  - Font Size: 12px
  - Font Weight: 500
  - Background: #D1FAE5
  - Color: #065F46
  - Border Radius: 4px
  - Text: "Activo"

- Scraper Description:
  - Font Size: 12px
  - Color: #6B7280

- Properties Estimate:
  - Font Size: 12px
  - Color: #2563EB
  - Margin Top: 4px
```

### Scraper Summary Panel
```
- Summary Container (Initially Hidden):
  - Padding: 16px
  - Background: #F3E8FF
  - Border: 1px solid #C084FC
  - Border Radius: 8px
  - Margin Bottom: 16px

- Summary Text:
  - Font Size: 14px
  - Font Weight: 500
  - Color: #111827

- Estimate Text:
  - Font Size: 12px
  - Color: #4B5563
  - Margin Top: 4px
```

### Launch Button
```
- Button:
  - Width: 100%
  - Padding: 12px 24px
  - Background: #7C3AED
  - Color: #FFFFFF
  - Font Size: 16px
  - Font Weight: 600
  - Border Radius: 8px
  - Disabled Opacity: 0.5
  - Disabled Cursor: not-allowed
  - Hover: Background #6D28D9
  - Icon: 🚀
```

### Scraping Progress Panel
```
- Progress Container (Initially Hidden):
  - Margin Top: 24px

- Progress Header:
  - Display: Flex
  - Justify Content: Space Between
  - Font Size: 14px

- Progress Label:
  - Font Weight: 500
  - Color: #374151

- Progress Percentage:
  - Color: #2563EB
  - Font Weight: 700

- Progress Bar Container:
  - Width: 100%
  - Height: 12px
  - Background: #E5E7EB
  - Border Radius: 9999px
  - Overflow: Hidden

- Progress Bar Fill:
  - Height: 100%
  - Background: Linear Gradient (90deg, #3B82F6, #8B5CF6)
  - Border Radius: 9999px
  - Transition: width 0.3s ease

- Logs Container:
  - Padding: 12px
  - Background: #F9FAFB
  - Border Radius: 8px
  - Font Family: Monospace
  - Font Size: 12px
  - Color: #374151
  - Max Height: 160px
  - Overflow Y: Auto

- Log Entry:
  - Padding: 2px 0
  - Success Color: #16A34A (checkmark logs)
```

### Option 2B: Add by URL Card
```
- Card Container:
  - Same base styles as Option 2A

- Step Badge:
  - Background: #D1FAE5
  - Color: #16A34A
  - Text: "2B"

- URL Input Container:
  - Display: Flex
  - Gap: 8px

- URL Input Field:
  - Flex: 1
  - Padding: 12px 16px
  - Border: 1px solid #D1D5DB
  - Border Radius: 8px
  - Font Size: 14px
  - Placeholder: "https://www.idealista.com/inmueble/..."

- Analyze Button:
  - Padding: 12px 24px
  - Background: Linear Gradient (135deg, #3B82F6, #6366F1, #8B5CF6)
  - Color: #FFFFFF
  - Font Weight: 600
  - Border Radius: 8px
  - White Space: NoWrap
  - Hover Transform: translateY(-2px)
  - Hover Box Shadow: 0 8px 16px rgba(59, 130, 246, 0.3)
  - Transition: all 0.3s ease

- Supported Portals:
  - Display: Flex
  - Flex Wrap: Wrap
  - Gap: 8px
  - Margin Top: 8px

- Portal Badge:
  - Padding: 4px 8px
  - Background: #F3F4F6
  - Border Radius: 4px
  - Font Size: 12px
```

### URL Preview Panel
```
- Preview Container (Initially Hidden):
  - Padding: 16px
  - Background: #D1FAE5
  - Border: 1px solid #86EFAC
  - Border Radius: 8px

- Success Header:
  - Display: Flex
  - Align Items: Center
  - Gap: 8px
  - Color: #065F46
  - Margin Bottom: 12px

- Success Icon (SVG):
  - Width: 20px
  - Height: 20px
  - Fill: currentColor

- Property Details Grid:
  - Display: Grid
  - Grid Template Columns: repeat(2, 1fr)
  - Gap: 8px
  - Font Size: 14px
  - Margin Bottom: 12px

- Detail Label:
  - Color: #4B5563

- Detail Value:
  - Font Weight: 600
  - Color: #111827

- Save Button:
  - Width: 100%
  - Padding: 8px 16px
  - Background: Linear Gradient (135deg, #3B82F6, #6366F1, #8B5CF6)
  - Color: #FFFFFF
  - Font Weight: 600
  - Border Radius: 8px
  - Icon: 💾
```

### Option 2C: Add by Text Card
```
- Card Container:
  - Same base styles as Option 2A

- Step Badge:
  - Background: #FED7AA
  - Color: #EA580C
  - Text: "2C"

- Action Buttons Row:
  - Display: Flex
  - Gap: 8px
  - Margin Bottom: 8px

- Paste Button:
  - Padding: 8px 16px
  - Border: 1px solid #D1D5DB
  - Border Radius: 8px
  - Font Size: 14px
  - Display: Flex
  - Align Items: Center
  - Gap: 8px
  - Hover: Background #F9FAFB

- Clear Button:
  - Padding: 8px 16px
  - Color: #DC2626
  - Border Radius: 8px
  - Font Size: 14px
  - Hover: Background #FEF2F2

- Text Area:
  - Width: 100%
  - Padding: 12px 16px
  - Border: 1px solid #D1D5DB
  - Border Radius: 8px
  - Font Family: Monospace
  - Font Size: 14px
  - Rows: 8
  - Resize: Vertical

- Extract Button:
  - Width: 100%
  - Padding: 12px 24px
  - Background: Linear Gradient (135deg, #3B82F6, #6366F1, #8B5CF6)
  - Color: #FFFFFF
  - Font Weight: 600
  - Border Radius: 8px
```

## INTERACTIVE BEHAVIORS

### Neighborhood Selection Flow
```javascript
1. User selects city (Madrid by default)
2. Neighborhood dropdown populates with 169 options
3. Each option shows name and property count in parentheses
4. On selection:
   - Database statistics panel appears with slide animation
   - Shows total properties, reformed/unreformed split
   - Shows last update time
   - Two action buttons appear
```

### Database Statistics Display
```javascript
- Total Properties: Random 10-30% of real ad count
- Reformed: 40-60% of total (random)
- Unreformed: Remainder
- Last Update: Random 1-14 days ago
- Formatted as:
  - "Hace X días" (1-6 days)
  - "Hace 1 semana" (7-13 days)
  - "Hace 2 semanas" (14+ days)
```

### Scraper Selection Logic
```javascript
1. Checkbox toggles card active state
2. Active cards get green border and gradient background
3. Summary panel shows when 1+ scrapers selected
4. Launch button enables when 1+ scrapers selected
5. Estimates calculate:
   - Idealista: 50-100 properties
   - Fotocasa: 30-80 properties
   - Pisos.com: 40-90 properties
   - Clikalia: 20-50 properties
   - Gilmar: 30-60 properties
```

### Scraping Progress Animation
```javascript
1. Progress bar starts at 0%
2. Updates every 300ms by 5%
3. Milestone logs at:
   - 25%: "✓ Idealista completado: 73 propiedades encontradas"
   - 50%: "✓ Fotocasa completado: 48 propiedades encontradas"
   - 75%: "✓ Clikalia completado: 31 propiedades encontradas"
   - 100%: Final success message
4. Auto-scroll logs to bottom
5. Alert on completion
```

### URL Parsing Flow
```javascript
1. User enters URL
2. Click "Analizar" button
3. 1-second processing delay
4. Preview panel appears with extracted data:
   - Price: €385,000
   - Surface: 120 m²
   - State: Reformado
   - Neighborhood: Guindalera
5. Save button stores to database
```

### Text Extraction Flow
```javascript
1. User pastes or types property text
2. Click "Extraer y Guardar Datos"
3. 500ms processing delay
4. Success panel appears
5. Alert confirms save
6. Clear text area
```

## ANIMATIONS & TRANSITIONS

### Card Hover Effects
```css
.scraper-card {
  transition: all 0.3s ease;
}

.scraper-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.scraper-card.active {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
}
```

### Button Gradient Hover
```css
.btn-gradient {
  background: linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6);
  transition: all 0.3s ease;
}

.btn-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}
```

### Progress Bar Animation
```css
.progress-bar {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s ease;
}
```

### Spinner Animation
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

## RESPONSIVE DESIGN

### Mobile (< 640px)
```
- Hide header action buttons
- Single column grids
- Full width cards
- Smaller padding (16px)
- Stack all elements vertically
- Larger touch targets (min 44px)
```

### Tablet (640px - 1024px)
```
- Show header action buttons
- 2-column grids where appropriate
- Medium padding (24px)
- Maintain card layouts
```

### Desktop (1024px+)
```
- Full 3-column scraper grid
- Maximum container width (1280px)
- Side-by-side action buttons
- Full padding (32px)
```

## DATA STRUCTURE

### Neighborhood Data
```javascript
const neighborhoodDBData = {
  'barrio-salamanca': {
    total: 337,      // 15% of 2246
    reformed: 142,   // 42% reformed
    unreformed: 195,
    lastUpdate: 'Hace 2 días'
  },
  // ... 168 more neighborhoods
};
```

### Scraper Configuration
```javascript
const scraperConfig = {
  idealista: {
    name: 'Idealista',
    description: 'Portal principal de inmuebles en España',
    status: 'active',
    estimatedProperties: { min: 50, max: 100 }
  },
  // ... other scrapers
};
```

## ACCESSIBILITY FEATURES

### ARIA Labels
```html
- role="region" for main sections
- aria-label for icon buttons
- aria-describedby for help text
- aria-live="polite" for progress updates
- aria-expanded for collapsible sections
```

### Keyboard Navigation
```
- Tab order follows visual hierarchy
- Enter/Space activate buttons and checkboxes
- Escape closes modals
- Arrow keys navigate select options
- Focus visible indicators on all interactive elements
```

## COLOR SYSTEM

### Primary Colors
```
- Blue Primary: #3B82F6
- Blue Dark: #2563EB
- Blue Light: #DBEAFE

- Green Primary: #16A34A
- Green Dark: #15803D
- Green Light: #D1FAE5

- Purple Primary: #7C3AED
- Purple Dark: #6D28D9
- Purple Light: #F3E8FF
```

### Neutral Colors
```
- Gray 50: #F9FAFB
- Gray 100: #F3F4F6
- Gray 200: #E5E7EB
- Gray 300: #D1D5DB
- Gray 400: #9CA3AF
- Gray 500: #6B7280
- Gray 600: #4B5563
- Gray 700: #374151
- Gray 800: #1F2937
- Gray 900: #111827
```

## EDGE CASES & ERROR HANDLING

### Empty States
```
- No neighborhoods: "No hay barrios disponibles"
- No database data: Show 0 properties with "Nunca" update
- No scrapers selected: Disable launch button
- Empty URL/text: Show validation message
```

### Error States
```
- Invalid URL: "URL no válida o portal no soportado"
- Scraper failure: "Error al ejecutar scraper [name]"
- Network error: "Error de conexión. Intenta de nuevo"
- Save failure: "No se pudo guardar. Intenta de nuevo"
```

### Loading States
```
- Select loading: Disabled with spinner
- Button loading: Show spinner, disable interaction
- Progress loading: Animated progress bar
- Card loading: Skeleton placeholders
```

## TECHNICAL IMPLEMENTATION NOTES

### Performance Optimizations
```
1. Lazy load neighborhood data on selection
2. Debounce input fields (300ms)
3. Virtual scrolling for large dropdowns
4. Memoize calculations
5. Use CSS transforms for animations (GPU acceleration)
6. Batch DOM updates
```

### Browser Compatibility
```
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Fallback for clipboard API
- Progressive enhancement for animations
- Polyfill for missing features
```

### Security Considerations
```
1. Sanitize all user inputs
2. Validate URLs against whitelist
3. Escape HTML in text extraction
4. Rate limit scraper launches
5. CORS handling for external APIs
```

This comprehensive specification captures every detail of the feed-pricing-data.html design for pixel-perfect implementation.