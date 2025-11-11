# ULTRA-DETAILED PROMPT: PRICING REFERENCE COMPONENT

## COMPONENT OVERVIEW
Create a sophisticated pricing reference component for a real estate platform that displays comparative market prices in a specific zone/area. This component should provide users with instant market context to evaluate if a property is priced competitively.

## VISUAL DESIGN SPECIFICATIONS

### Container Structure
```
- Main Container:
  - Background: White (#FFFFFF)
  - Border: 1px solid #E5E7EB
  - Border Radius: 12px
  - Padding: 24px
  - Box Shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)
  - Max Width: 480px (desktop), 100% (mobile)
  - Min Height: 320px
```

### Header Section
```
- Title Container:
  - Display: Flex
  - Justify Content: Space Between
  - Align Items: Center
  - Margin Bottom: 20px

- Main Title:
  - Text: "Precio de Referencia"
  - Font: Inter, -apple-system, system-ui
  - Font Size: 18px
  - Font Weight: 600
  - Color: #111827
  - Line Height: 1.2

- Zone Badge:
  - Background: #EEF2FF
  - Color: #4F46E5
  - Font Size: 12px
  - Font Weight: 500
  - Padding: 4px 10px
  - Border Radius: 16px
  - Text: "[Zona Name]"
  - Display: Inline-flex
  - Align Items: Center
```

### Price Visualization Section
```
- Price Range Bar Container:
  - Width: 100%
  - Height: 80px
  - Position: Relative
  - Margin: 24px 0

- Background Track:
  - Width: 100%
  - Height: 8px
  - Background: Linear Gradient from #DC2626 (left) to #16A34A (right)
  - Border Radius: 4px
  - Position: Absolute
  - Top: 50%
  - Transform: translateY(-50%)

- Price Segments:
  - Divide bar into 5 segments
  - Each segment represents 20% of price range
  - Segment Colors:
    - 0-20%: #DC2626 (Very Low)
    - 20-40%: #F59E0B (Low)
    - 40-60%: #EAB308 (Average)
    - 60-80%: #84CC16 (Good)
    - 80-100%: #16A34A (Excellent)

- Current Price Indicator:
  - Type: Vertical marker with tooltip
  - Width: 3px
  - Height: 40px
  - Background: #111827
  - Border Radius: 2px
  - Box Shadow: 0 2px 4px rgba(0, 0, 0, 0.2)
  - Position: Calculated based on price

- Price Tooltip (hover state):
  - Background: #1F2937
  - Color: #FFFFFF
  - Padding: 8px 12px
  - Border Radius: 6px
  - Font Size: 14px
  - Font Weight: 500
  - Position: Above marker
  - Arrow pointing down
```

### Statistics Grid
```
- Container:
  - Display: Grid
  - Grid Template Columns: repeat(2, 1fr)
  - Gap: 16px
  - Margin Top: 24px

- Stat Card:
  - Background: #F9FAFB
  - Border Radius: 8px
  - Padding: 16px
  - Transition: background 0.2s ease

- Stat Card Hover:
  - Background: #F3F4F6

- Stat Label:
  - Font Size: 12px
  - Font Weight: 500
  - Color: #6B7280
  - Text Transform: Uppercase
  - Letter Spacing: 0.05em
  - Margin Bottom: 4px

- Stat Value:
  - Font Size: 20px
  - Font Weight: 700
  - Color: #111827
  - Line Height: 1.2

- Stat Trend (optional):
  - Display: Inline-flex
  - Align Items: Center
  - Margin Top: 4px
  - Font Size: 12px
  - Color: Based on trend (green for up, red for down)
  - Icon: Arrow (↑ or ↓)
```

### Key Statistics to Display
```
1. Precio Mínimo:
   - Label: "MÍNIMO"
   - Value: "€XXX.XXX"
   - Format: Currency with thousand separators

2. Precio Máximo:
   - Label: "MÁXIMO"
   - Value: "€XXX.XXX"
   - Format: Currency with thousand separators

3. Precio Medio:
   - Label: "MEDIO"
   - Value: "€XXX.XXX"
   - Format: Currency with thousand separators
   - Highlight: Primary color background

4. Precio por m²:
   - Label: "€/m²"
   - Value: "€X.XXX/m²"
   - Format: Currency with one decimal
```

### Comparison Indicator
```
- Container:
  - Background: Based on comparison result
    - Below average: #FEF2F2 (light red)
    - Average: #FEF3C7 (light yellow)
    - Above average: #F0FDF4 (light green)
  - Border: 1px solid (matching background)
  - Border Radius: 8px
  - Padding: 12px 16px
  - Margin Top: 16px

- Indicator Text:
  - Font Size: 14px
  - Font Weight: 500
  - Color: Based on comparison
    - Below: #DC2626
    - Average: #CA8A04
    - Above: #16A34A

- Percentage Badge:
  - Display: Inline-block
  - Background: Matching text color with 0.1 opacity
  - Color: Matching text color
  - Padding: 2px 8px
  - Border Radius: 12px
  - Font Weight: 600
  - Margin Left: 8px
```

### Sample Size Indicator
```
- Container:
  - Display: Flex
  - Align Items: Center
  - Justify Content: Space Between
  - Margin Top: 16px
  - Padding Top: 16px
  - Border Top: 1px solid #E5E7EB

- Sample Text:
  - Font Size: 12px
  - Color: #6B7280
  - Text: "Basado en XXX propiedades similares"

- Info Icon:
  - Size: 16px
  - Color: #9CA3AF
  - Cursor: Pointer
  - Tooltip on Hover: "Propiedades de características similares en los últimos 6 meses"
```

## RESPONSIVE DESIGN SPECIFICATIONS

### Desktop (1024px+)
```
- Container Max Width: 480px
- Grid: 2 columns for statistics
- Font Sizes: As specified above
- Full price visualization bar
```

### Tablet (768px - 1023px)
```
- Container Max Width: 100%
- Grid: 2 columns for statistics
- Font Sizes: Maintain desktop sizes
- Price bar: Full width
```

### Mobile (< 768px)
```
- Container:
  - Padding: 16px
  - Border Radius: 8px

- Title:
  - Font Size: 16px

- Statistics Grid:
  - Grid Template Columns: 1fr
  - Gap: 12px

- Stat Cards:
  - Display: Flex
  - Justify Content: Space Between
  - Align Items: Center

- Price Bar:
  - Height: 60px
  - Simplified view (3 segments instead of 5)
```

## INTERACTIVE BEHAVIORS

### Hover States
```
1. Price Indicator:
   - Show tooltip with exact price
   - Smooth transition (200ms ease)
   - Cursor: Pointer

2. Stat Cards:
   - Background color change
   - Subtle scale transform (1.02)
   - Transition: all 0.2s ease

3. Info Icons:
   - Rotate 15 degrees
   - Show tooltip with explanation

4. Zone Badge:
   - Background darken by 10%
   - Cursor: Pointer
   - Click: Filter by zone
```

### Loading States
```
- Skeleton Animation:
  - Background: Linear gradient animation
  - Colors: #F3F4F6 to #E5E7EB
  - Duration: 1.5s infinite
  - All text elements replaced with skeleton bars

- Loading Indicator:
  - Spinner in center of component
  - Size: 32px
  - Color: #4F46E5
  - Background overlay: rgba(255, 255, 255, 0.8)
```

### Empty States
```
- Message: "No hay suficientes datos de referencia"
- Icon: Chart icon with slash
- Color: #6B7280
- Font Size: 14px
- Center aligned
- Minimum height maintained
```

## DATA STRUCTURE

### Input Props
```typescript
interface PricingReferenceProps {
  currentPrice: number;
  zone: {
    id: string;
    name: string;
    coordinates: [number, number];
  };
  propertyType: 'piso' | 'casa' | 'local' | 'garaje';
  surface: number;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  hasElevator?: boolean;
  condition?: 'nueva' | 'buen-estado' | 'reformar';
  timeRange?: '3-months' | '6-months' | '1-year';
}
```

### Calculated Metrics
```typescript
interface PricingMetrics {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  medianPrice: number;
  pricePerSqm: number;
  sampleSize: number;
  percentile: number; // 0-100
  priceComparison: 'below' | 'average' | 'above';
  percentageDiff: number; // Percentage difference from average
  confidenceLevel: 'low' | 'medium' | 'high'; // Based on sample size
}
```

## ACCESSIBILITY REQUIREMENTS

### ARIA Labels
```
- Main container: role="region" aria-label="Precio de referencia de la zona"
- Price bar: role="progressbar" aria-valuenow={currentPrice} aria-valuemin={min} aria-valuemax={max}
- Statistics: role="list" with role="listitem" for each stat
- Tooltips: aria-describedby with unique IDs
```

### Keyboard Navigation
```
- Tab order: Logical flow from top to bottom
- Enter/Space: Activate interactive elements
- Escape: Close tooltips
- Arrow keys: Navigate between stat cards
```

### Screen Reader Support
```
- Announce price comparison result
- Provide context for percentages
- Describe trend arrows
- Include units in value announcements
```

## ANIMATION SPECIFICATIONS

### Entry Animation
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

- Duration: 400ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Stagger: 50ms between elements
```

### Price Indicator Animation
```css
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

- Duration: 2s
- Iteration: 3 times on mount
- Easing: ease-in-out
```

### Value Change Animation
```
- Number counter animation
- Duration: 1000ms
- Easing: ease-out
- Format numbers during animation
```

## COLOR SYSTEM

### Price Evaluation Colors
```
- Excellent (80-100%): #16A34A (green-600)
- Good (60-80%): #84CC16 (lime-500)
- Average (40-60%): #EAB308 (yellow-500)
- Below Average (20-40%): #F59E0B (amber-500)
- Poor (0-20%): #DC2626 (red-600)
```

### UI Colors
```
- Background Primary: #FFFFFF
- Background Secondary: #F9FAFB
- Background Tertiary: #F3F4F6
- Border Default: #E5E7EB
- Border Strong: #D1D5DB
- Text Primary: #111827
- Text Secondary: #6B7280
- Text Tertiary: #9CA3AF
- Brand Primary: #4F46E5
- Brand Light: #EEF2FF
```

## TECHNICAL IMPLEMENTATION NOTES

### Performance Optimizations
```
1. Use React.memo for component memoization
2. Implement virtual scrolling for large datasets
3. Lazy load heavy visualizations
4. Cache API responses for 5 minutes
5. Use requestAnimationFrame for smooth animations
6. Optimize re-renders with useMemo/useCallback
```

### API Integration
```
- Endpoint: /api/properties/pricing-reference
- Method: GET
- Parameters:
  - zone_id: string
  - property_type: string
  - surface_range: [min, max]
  - time_range: string
- Cache: 5 minutes client-side, 1 hour server-side
- Error handling: Graceful fallback to cached data
```

### Testing Requirements
```
1. Unit tests for price calculations
2. Integration tests for API calls
3. Visual regression tests for chart rendering
4. Accessibility tests (WCAG 2.1 AA)
5. Performance tests (LCP < 2.5s)
6. Cross-browser compatibility
```

## EDGE CASES TO HANDLE

1. **Insufficient Data**: Less than 5 comparable properties
2. **Extreme Outliers**: Prices 3x above/below average
3. **Missing Current Price**: Property without listed price
4. **API Failure**: Network errors or timeout
5. **Invalid Zone**: Non-existent or unsupported zone
6. **Large Numbers**: Prices over €10 million
7. **Currency Conversion**: International properties
8. **Historical Data**: Comparing across different time periods

## LOCALIZATION REQUIREMENTS

### Supported Languages
```
- Spanish (default)
- English
- Catalan
- Basque
```

### Number Formatting
```
- Spanish: 1.234.567,89 €
- English: €1,234,567.89
- Thousand separator varies by locale
- Currency symbol position varies
```

### Text Translations
```
- All UI text externalized to translation files
- Date formatting based on locale
- Pluralization rules per language
- RTL support preparation
```

## COMPONENT VARIANTS

### Compact Mode
```
- Height: 180px
- Show only essential metrics
- Simplified price bar
- No animations
- Used in: Property cards, search results
```

### Expanded Mode
```
- Full height with all features
- Detailed statistics
- Interactive elements
- Full animations
- Used in: Property detail page
```

### Comparison Mode
```
- Side-by-side price bars
- Multiple property comparison
- Highlight differences
- Synchronized interactions
- Used in: Compare properties feature
```

## INTEGRATION EXAMPLES

### React Component Usage
```jsx
<PricingReference
  currentPrice={450000}
  zone={{
    id: "retiro",
    name: "Retiro",
    coordinates: [40.4168, -3.7038]
  }}
  propertyType="piso"
  surface={120}
  rooms={3}
  bathrooms={2}
  floor={3}
  hasElevator={true}
  condition="buen-estado"
  timeRange="6-months"
  variant="expanded"
  onZoneClick={(zone) => filterByZone(zone)}
  onDetailsClick={() => openPricingDetails()}
/>
```

### State Management
```typescript
// Redux/Zustand store structure
interface PricingState {
  references: Map<string, PricingMetrics>;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date;
  cacheExpiry: number;
}
```

This comprehensive specification ensures pixel-perfect implementation of the pricing reference component with all necessary details for developers and designers.