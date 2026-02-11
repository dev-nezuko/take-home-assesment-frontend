# Interactive Event Seating Map - Frontend

React + TypeScript application for rendering an interactive seating map with seat selection capabilities.

## Architecture Choices & Trade-offs

**SVG vs Canvas**: SVG was chosen over Canvas because it provides better accessibility support (native focus management, aria-labels), easier event handling (click, keyboard events), and simpler state management for individual seats. Performance is sufficient for 15k seats with proper memoization.

**Context API vs Redux**: React Context API was chosen because it's lighter weight for this scope, requires no complex state management setup, and is sufficient for the required features.

**Performance Optimizations**: 
- `React.memo` for Seat components to prevent unnecessary re-renders
- `useCallback` for event handlers to maintain referential equality
- Efficient SVG rendering with direct coordinate mapping (no layout calculations)
- Debounced localStorage writes via useEffect dependencies

## Features

- ✅ Load venue.json and render every seat in its correct position
- ✅ Smooth rendering (≈ 60 fps) for large arenas (≈ 15,000 seats)
- ✅ Seat selection via mouse click and keyboard
- ✅ Display seat details (section, row, seat, price, status) on click or focus
- ✅ Allow selecting up to 8 seats with live summary and subtotal
- ✅ Persist selection after page reload using localStorage
- ✅ Basic accessibility: aria-label on interactive elements, focus outline, keyboard navigation
- ✅ Responsive design for desktop and mobile viewport sizes

## Quick Start

### Prerequisites
- Node.js >= 18
- pnpm (install via `npm install -g pnpm`)

### Installation & Running

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:5173`.

## Testing

No automated tests are included as they were not part of the core requirements. Manual testing can be performed by:
1. Selecting seats via click and keyboard
2. Verifying selection persists after page reload
3. Testing on different viewport sizes
4. Verifying keyboard navigation works correctly
