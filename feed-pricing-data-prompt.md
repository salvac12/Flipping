# ULTRA-DETAILED PROMPT: FEED PRICING DATA COMPONENT

## COMPONENT OVERVIEW
Create a sophisticated real-time pricing data feed component for a real estate platform that displays live market pricing updates, trends, and analytics. This component should provide instant market insights through a continuously updating feed of pricing changes, new listings, and market movements.

## VISUAL DESIGN SPECIFICATIONS

### Main Container
```
- Container Wrapper:
  - Background: #FFFFFF
  - Border: 1px solid #E5E7EB
  - Border Radius: 16px
  - Box Shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
  - Padding: 0 (header has its own padding)
  - Max Width: 1200px (desktop), 100% (mobile)
  - Min Height: 600px
  - Position: Relative
  - Overflow: Hidden
```

### Header Section
```
- Header Container:
  - Background: Linear Gradient (135deg, #4F46E5 0%, #7C3AED 100%)
  - Padding: 24px 32px
  - Border Radius: 16px 16px 0 0
  - Display: Flex
  - Justify Content: Space Between
  - Align Items: Center

- Title Section:
  - Display: Flex
  - Flex Direction: Column
  - Gap: 8px

- Main Title:
  - Text: "Feed de Precios"
  - Font Family: Inter, -apple-system, system-ui
  - Font Size: 24px
  - Font Weight: 700
  - Color: #FFFFFF
  - Letter Spacing: -0.02em

- Subtitle:
  - Text: "Actualizaciones en tiempo real del mercado"
  - Font Size: 14px
  - Font Weight: 400
  - Color: rgba(255, 255, 255, 0.9)

- Live Indicator:
  - Display: Inline-flex
  - Align Items: Center
  - Gap: 8px
  - Background: rgba(255, 255, 255, 0.2)
  - Padding: 6px 12px
  - Border Radius: 20px

- Live Dot:
  - Width: 8px
  - Height: 8px
  - Background: #10B981
  - Border Radius: 50%
  - Animation: pulse 2s infinite

- Live Text:
  - Text: "EN VIVO"
  - Font Size: 12px
  - Font Weight: 600
  - Color: #FFFFFF
  - Letter Spacing: 0.05em
```

### Filter Bar
```
- Filter Container:
  - Background: #F9FAFB
  - Padding: 16px 32px
  - Border Bottom: 1px solid #E5E7EB
  - Display: Flex
  - Gap: 16px
  - Align Items: Center
  - Flex Wrap: Wrap

- Filter Chip:
  - Background: #FFFFFF
  - Border: 1px solid #D1D5DB
  - Border Radius: 8px
  - Padding: 8px 16px
  - Display: Inline-flex
  - Align Items: Center
  - Gap: 8px
  - Cursor: Pointer
  - Transition: all 0.2s ease

- Filter Chip Active:
  - Background: #4F46E5
  - Border Color: #4F46E5
  - Color: #FFFFFF

- Filter Chip Hover:
  - Border Color: #4F46E5
  - Box Shadow: 0 1px 3px rgba(79, 70, 229, 0.2)

- Filter Label:
  - Font Size: 14px
  - Font Weight: 500
  - Color: #374151 (inactive), #FFFFFF (active)

- Filter Count Badge:
  - Background: #EEF2FF (inactive), rgba(255, 255, 255, 0.2) (active)
  - Color: #4F46E5 (inactive), #FFFFFF (active)
  - Font Size: 12px
  - Font Weight: 600
  - Padding: 2px 6px
  - Border Radius: 10px
```

### Feed Content Area
```
- Feed Container:
  - Max Height: 500px
  - Overflow Y: Auto
  - Padding: 0
  - Position: Relative
  - Scroll Behavior: Smooth

- Custom Scrollbar:
  - Width: 6px
  - Background: #F3F4F6
  - Thumb Background: #9CA3AF
  - Thumb Border Radius: 3px
  - Thumb Hover: #6B7280
```

### Feed Item Card
```
- Item Container:
  - Background: #FFFFFF
  - Border Bottom: 1px solid #F3F4F6
  - Padding: 20px 32px
  - Display: Grid
  - Grid Template Columns: auto 1fr auto
  - Gap: 20px
  - Align Items: Center
  - Transition: background 0.2s ease
  - Position: Relative

- Item Hover State:
  - Background: #F9FAFB
  - Border Left: 3px solid #4F46E5
  - Padding Left: 29px (compensate for border)

- New Item Animation:
  - Animation: slideIn 0.4s ease
  - Background Flash: rgba(79, 70, 229, 0.05) for 1s

- Price Change Indicator:
  - Width: 48px
  - Height: 48px
  - Border Radius: 12px
  - Display: Flex
  - Align Items: Center
  - Justify Content: Center
  - Font Size: 20px

- Price Up Indicator:
  - Background: #FEF2F2
  - Color: #DC2626
  - Icon: ↑ or Arrow Up SVG

- Price Down Indicator:
  - Background: #F0FDF4
  - Color: #16A34A
  - Icon: ↓ or Arrow Down SVG

- New Listing Indicator:
  - Background: #EEF2FF
  - Color: #4F46E5
  - Icon: ✨ or Star SVG
```

### Feed Item Content
```
- Content Grid:
  - Display: Grid
  - Grid Template Columns: 1fr auto
  - Gap: 16px
  - Align Items: Start

- Property Info:
  - Display: Flex
  - Flex Direction: Column
  - Gap: 4px

- Property Title:
  - Font Size: 16px
  - Font Weight: 600
  - Color: #111827
  - Line Height: 1.4
  - Max Width: 400px
  - Text Overflow: Ellipsis
  - White Space: Nowrap
  - Overflow: Hidden

- Property Location:
  - Font Size: 14px
  - Color: #6B7280
  - Display: Flex
  - Align Items: Center
  - Gap: 4px

- Location Icon:
  - Width: 14px
  - Height: 14px
  - Color: #9CA3AF

- Property Details:
  - Display: Flex
  - Gap: 16px
  - Margin Top: 8px

- Detail Item:
  - Display: Flex
  - Align Items: Center
  - Gap: 4px
  - Font Size: 13px
  - Color: #6B7280

- Detail Icon:
  - Width: 16px
  - Height: 16px
  - Color: #9CA3AF
```

### Price Information
```
- Price Container:
  - Display: Flex
  - Flex Direction: Column
  - Align Items: End
  - Gap: 4px

- Current Price:
  - Font Size: 20px
  - Font Weight: 700
  - Color: #111827

- Previous Price (if changed):
  - Font Size: 14px
  - Color: #9CA3AF
  - Text Decoration: Line-through

- Price Change:
  - Display: Inline-flex
  - Align Items: Center
  - Gap: 4px
  - Font Size: 14px
  - Font Weight: 600
  - Padding: 4px 8px
  - Border Radius: 6px

- Price Increase:
  - Background: #FEF2F2
  - Color: #DC2626
  - Text: "+X% (€X.XXX)"

- Price Decrease:
  - Background: #F0FDF4
  - Color: #16A34A
  - Text: "-X% (€X.XXX)"
```

### Timestamp and Actions
```
- Footer Container:
  - Display: Flex
  - Justify Content: Space Between
  - Align Items: Center
  - Margin Top: 12px
  - Padding Top: 12px
  - Border Top: 1px solid #F3F4F6

- Timestamp:
  - Font Size: 12px
  - Color: #9CA3AF
  - Display: Flex
  - Align Items: Center
  - Gap: 4px

- Time Icon:
  - Width: 14px
  - Height: 14px

- Relative Time:
  - Text: "hace X minutos/horas"
  - Update: Real-time using intervals

- Action Buttons:
  - Display: Flex
  - Gap: 8px

- Action Button:
  - Background: Transparent
  - Border: 1px solid #E5E7EB
  - Border Radius: 6px
  - Padding: 6px 10px
  - Font Size: 12px
  - Font Weight: 500
  - Color: #6B7280
  - Cursor: Pointer
  - Display: Flex
  - Align Items: Center
  - Gap: 4px
  - Transition: all 0.2s ease

- Button Hover:
  - Border Color: #4F46E5
  - Color: #4F46E5
  - Background: #EEF2FF
```

### Statistics Summary Bar
```
- Stats Container:
  - Background: #F9FAFB
  - Border Top: 1px solid #E5E7EB
  - Padding: 20px 32px
  - Display: Grid
  - Grid Template Columns: repeat(4, 1fr)
  - Gap: 24px

- Stat Item:
  - Display: Flex
  - Flex Direction: Column
  - Gap: 4px

- Stat Label:
  - Font Size: 12px
  - Font Weight: 500
  - Color: #6B7280
  - Text Transform: Uppercase
  - Letter Spacing: 0.05em

- Stat Value:
  - Font Size: 24px
  - Font Weight: 700
  - Color: #111827
  - Display: Flex
  - Align Items: Baseline
  - Gap: 4px

- Stat Change:
  - Font Size: 14px
  - Font Weight: 500
  - Display: Inline-flex
  - Align Items: Center
  - Gap: 2px

- Positive Change:
  - Color: #16A34A

- Negative Change:
  - Color: #DC2626
```

## DATA VISUALIZATION

### Mini Price Chart (per item)
```
- Chart Container:
  - Width: 120px
  - Height: 40px
  - Position: Relative

- SVG Canvas:
  - Width: 100%
  - Height: 100%

- Line Path:
  - Stroke: #4F46E5
  - Stroke Width: 2px
  - Fill: None
  - Stroke Linecap: Round
  - Stroke Linejoin: Round

- Area Fill:
  - Fill: Linear Gradient (top: rgba(79, 70, 229, 0.1), bottom: transparent)

- Data Points:
  - Circle Radius: 3px
  - Fill: #4F46E5
  - Stroke: #FFFFFF
  - Stroke Width: 2px
  - Only show last point

- Hover Tooltip:
  - Background: #1F2937
  - Color: #FFFFFF
  - Padding: 4px 8px
  - Border Radius: 4px
  - Font Size: 12px
  - Position: Absolute
  - White Space: Nowrap
```

### Activity Heatmap
```
- Heatmap Container:
  - Display: Grid
  - Grid Template Columns: repeat(24, 1fr)
  - Grid Template Rows: repeat(7, 1fr)
  - Gap: 2px
  - Height: 100px
  - Margin Top: 16px

- Heatmap Cell:
  - Border Radius: 2px
  - Aspect Ratio: 1
  - Transition: all 0.2s ease

- Activity Levels:
  - Level 0: #F3F4F6 (no activity)
  - Level 1: #DBEAFE (low)
  - Level 2: #93C5FD (medium)
  - Level 3: #4F46E5 (high)
  - Level 4: #312E81 (very high)

- Cell Hover:
  - Transform: scale(1.2)
  - Box Shadow: 0 2px 4px rgba(0, 0, 0, 0.2)
  - Z-index: 10
```

## REAL-TIME FEATURES

### WebSocket Connection
```typescript
interface WebSocketConfig {
  url: 'wss://api.platform.com/pricing-feed';
  reconnectInterval: 3000;
  maxReconnectAttempts: 5;
  heartbeatInterval: 30000;
  protocols: ['pricing-v1'];
}

interface PricingEvent {
  id: string;
  type: 'price_change' | 'new_listing' | 'sold' | 'price_drop';
  propertyId: string;
  timestamp: number;
  data: {
    previousPrice?: number;
    currentPrice: number;
    changePercent?: number;
    property: PropertyData;
  };
}
```

### Update Animations
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes highlight {
  0% { background-color: rgba(79, 70, 229, 0.1); }
  100% { background-color: transparent; }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.95);
  }
}
```

### Auto-Scroll Behavior
```
- New Item Detection:
  - Check scroll position
  - If at top: Auto-scroll to show new item
  - If user scrolling: Show "New updates" button
  - Smooth scroll duration: 300ms

- Scroll to Top Button:
  - Position: Fixed bottom-right of container
  - Show when: Scrolled > 200px
  - Background: #4F46E5
  - Icon: Arrow Up
  - Border Radius: 50%
  - Size: 40px
  - Box Shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
```

## RESPONSIVE DESIGN

### Desktop (1200px+)
```
- Container: Max width 1200px
- Grid: 4 columns in stats bar
- Feed items: Full layout
- Charts: Visible
- All features enabled
```

### Tablet (768px - 1199px)
```
- Container: 100% width with 24px padding
- Grid: 2 columns in stats bar
- Feed items: Compact layout
- Charts: Hidden on items < 900px
- Touch-optimized interactions
```

### Mobile (< 768px)
```
- Container:
  - Full width
  - Border Radius: 0
  - Padding: 16px

- Header:
  - Font Size: 20px (title)
  - Stack elements vertically

- Filter Bar:
  - Horizontal scroll
  - Snap scrolling
  - Show scroll indicators

- Feed Items:
  - Stack elements vertically
  - Simplified layout
  - No charts
  - Larger touch targets

- Stats Bar:
  - Grid: 2 columns
  - Smaller font sizes
```

## INTERACTIVE BEHAVIORS

### Click Actions
```
1. Property Card Click:
   - Navigate to property detail page
   - Ripple effect from click point
   - Loading state while navigating

2. Filter Chip Click:
   - Toggle active state
   - Update feed immediately
   - Show loading spinner
   - Animate feed refresh

3. Action Button Click:
   - "Ver detalles": Open property modal
   - "Guardar": Add to favorites with animation
   - "Compartir": Open share modal
   - "Alertas": Set price alert

4. Stats Click:
   - Expand detailed statistics view
   - Show historical chart
   - Drill-down capability
```

### Hover Effects
```
1. Feed Item Hover:
   - Background color change
   - Show additional actions
   - Expand truncated text
   - Show mini chart if hidden

2. Price Hover:
   - Show price history tooltip
   - Display calculation breakdown
   - Show market comparison

3. Timestamp Hover:
   - Show exact date/time
   - Display time zone
   - Show update frequency
```

### Keyboard Navigation
```
- Tab: Navigate through items
- Enter: Open selected item
- Space: Toggle filters
- Arrow Up/Down: Navigate feed
- Home: Jump to top
- End: Jump to bottom
- F: Focus filter bar
- R: Refresh feed
- Escape: Close modals
```

## LOADING STATES

### Initial Load
```
- Skeleton Screen:
  - Show 5 skeleton items
  - Animated gradient shine
  - Maintain layout structure
  - Progressive loading

- Skeleton Item:
  - Gray bars for text
  - Circular placeholders for icons
  - Animated pulse effect
  - Proper spacing maintained
```

### Refresh State
```
- Pull to Refresh (mobile):
  - Elastic overscroll
  - Loading spinner
  - Success haptic feedback
  - Error state handling

- Manual Refresh:
  - Button rotation animation
  - Disable during refresh
  - Show progress indicator
  - Success/error feedback
```

### Error States
```
- Connection Lost:
  - Banner at top
  - Retry button
  - Offline indicator
  - Cache fallback

- Load Error:
  - Error message in feed
  - Retry action
  - Contact support link
  - Maintain partial data
```

## EMPTY STATES

### No Data
```
- Illustration: Custom SVG graphic
- Title: "No hay actualizaciones"
- Description: "Las nuevas actualizaciones aparecerán aquí"
- Action Button: "Ajustar filtros"
- Background: Subtle pattern
```

### No Results (filtered)
```
- Icon: Filter icon with X
- Title: "Sin resultados"
- Description: "Prueba ajustando los filtros"
- Suggestions: List of actions
- Clear Filters button
```

## PERFORMANCE OPTIMIZATIONS

### Virtualization
```
- Virtual Scrolling:
  - Render only visible items
  - Buffer: 3 items above/below
  - Smooth scroll restoration
  - Maintain scroll position

- Lazy Loading:
  - Load images on demand
  - Progressive enhancement
  - Intersection Observer API
  - Placeholder images
```

### Caching Strategy
```
- Memory Cache:
  - Last 100 items
  - 5-minute TTL
  - LRU eviction
  - Instant display

- Local Storage:
  - Persist filters
  - Save preferences
  - Offline support
  - 1MB limit
```

### Update Batching
```
- Batch Window: 100ms
- Max Batch Size: 10 items
- Priority Queue: By timestamp
- Debounce: Rapid updates
- Throttle: Scroll events
```

## ACCESSIBILITY

### ARIA Attributes
```html
<div role="feed" aria-label="Actualizaciones de precios">
  <article role="article" aria-labelledby="property-title-{id}">
    <h3 id="property-title-{id}">Property Title</h3>
    <div role="status" aria-live="polite">
      Price changed
    </div>
  </article>
</div>
```

### Screen Reader Support
```
- Announce new items
- Read price changes
- Describe trends
- Navigate by headings
- Skip to content
- Filter announcements
```

### Focus Management
```
- Visible focus indicators
- Logical tab order
- Focus trap in modals
- Return focus on close
- Skip links
- Keyboard shortcuts help
```

## COLOR MODES

### Light Mode (Default)
```
- Background: #FFFFFF
- Text: #111827
- Borders: #E5E7EB
- Accents: #4F46E5
```

### Dark Mode
```
- Background: #111827
- Text: #F9FAFB
- Borders: #374151
- Accents: #818CF8
- Shadows: Stronger/darker
- Charts: Inverted colors
```

## NOTIFICATIONS

### In-Feed Notifications
```
- New Items Badge:
  - Position: Sticky top
  - Background: #4F46E5
  - Text: "X nuevas actualizaciones"
  - Click: Scroll to top
  - Auto-hide: After 5 seconds

- System Messages:
  - Maintenance notices
  - Feature announcements
  - Market alerts
  - Styled differently
```

### Push Notifications (Optional)
```
- Browser Permission Request
- Notification Types:
  - Major price drops
  - New listings in saved searches
  - Market trends
  - Saved property updates
```

## INTEGRATION REQUIREMENTS

### API Endpoints
```
GET /api/feed/pricing
  - Query params: filters, limit, offset
  - Response: PricingEvent[]

WebSocket /ws/pricing-feed
  - Real-time updates
  - Heartbeat/ping-pong

POST /api/feed/subscribe
  - Subscribe to property updates

DELETE /api/feed/unsubscribe
  - Unsubscribe from updates
```

### State Management
```typescript
interface FeedState {
  items: PricingEvent[];
  filters: FilterState;
  isLoading: boolean;
  isConnected: boolean;
  error: Error | null;
  stats: FeedStatistics;
  preferences: UserPreferences;
}
```

### Event Tracking
```typescript
interface FeedAnalytics {
  event: 'feed_view' | 'item_click' | 'filter_apply' | 'share';
  properties: {
    itemId?: string;
    filterType?: string;
    position?: number;
    timestamp: number;
  };
}
```

## TESTING REQUIREMENTS

### Unit Tests
```
- Component rendering
- Filter logic
- Price calculations
- Time formatting
- Data transformations
- Event handlers
```

### Integration Tests
```
- WebSocket connection
- API calls
- State updates
- Error handling
- Offline behavior
- Cache management
```

### E2E Tests
```
- Full user journey
- Real-time updates
- Filter interactions
- Scroll behavior
- Performance metrics
- Cross-browser
```

## BROWSER SUPPORT

### Required Support
```
- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- Mobile Safari 14+
- Chrome Android 90+
```

### Progressive Enhancement
```
- Basic functionality without JS
- Fallback for WebSockets
- Polyfills for older browsers
- Graceful degradation
- Feature detection
```

This comprehensive specification provides all necessary details for implementing a sophisticated real-time pricing feed component with modern UX patterns and technical requirements.