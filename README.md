# Fishing Tournament Management App

An offline-first PWA for managing fishing tournament standings, team registration, and weigh-in tracking. Built to replace Excel/VBA spreadsheet workflows with a modern, mobile-friendly web application.

## Features

### Phase 1 MVP (Complete)
- ✅ **Tournament Setup** - Create tournaments with custom rules
- ✅ **Team Management** - Register teams with member names
- ✅ **Weigh-In Entry** - Quick entry form with auto-calculated totals
- ✅ **Live Standings** - Real-time tournament rankings with rank change tracking
- ✅ **Offline Capable** - Full PWA with service worker caching
- ✅ **Responsive Design** - Mobile-first UI with desktop support
- ✅ **Data Persistence** - IndexedDB local storage for offline operation

### Planned Features (Phase 2+)
- 📋 Weight ticket printing (two-per-page PDF layout)
- 🖼️ Logo management and tournament branding
- 📊 Historical data import from XLSM spreadsheets
- 💾 Data export (JSON/CSV)
- 📈 Advanced statistics and charts
- ☁️ Cloud sync (optional)

## Quick Start

### Installation
```bash
pnpm install
```

### Development
```bash
# Interactive build menu
./build.sh
# Select option 1 (Development Server)

# Or direct command
pnpm dev
# Visit: http://localhost:4444
```

### Production Build
```bash
./build.sh
# Select option 2 (Production Build Only)

# Or direct command
pnpm build
```

### Testing
```bash
# Run unit tests
pnpm test

# Watch mode
pnpm test:watch
```

## Technology Stack

- **Frontend**: React 19 + TypeScript 5
- **Build**: Vite 5 (bundles to ~340KB gzipped)
- **Styling**: Tailwind CSS 4
- **State**: Zustand
- **Database**: Dexie.js (IndexedDB wrapper)
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table v8
- **Charts**: Recharts
- **Testing**: Vitest
- **PWA**: vite-plugin-pwa

## Project Structure

```
src/
├── components/
│   ├── layout/         # AppShell, Header, Sidebar
│   ├── dashboard/      # Standings, summary cards
│   ├── teams/          # Team list, add/edit forms
│   └── weigh-in/       # Weigh-in entry form
├── modules/
│   ├── tournaments/    # Tournament store & operations
│   ├── teams/          # Team store & operations
│   └── weigh-ins/      # Weigh-in store & operations
├── models/             # TypeScript interfaces
├── db/                 # Dexie.js schema
├── hooks/              # Custom React hooks
├── utils/              # Calculations, formatting, validation
└── styles/             # Global CSS

tests/
└── unit/               # Unit tests for calculations
```

## Core Formulas

### Day Total
```
dayTotal = rawWeight + (fishReleased × releaseBonus)
```
Default release bonus: 0.20 lbs per fish (configurable per tournament)

### Grand Total
```
grandTotal = day1Total + day2Total
```

### Standings
- Teams ranked by grandTotal (descending)
- Rank change calculated: day1Rank - day2Rank (positive = improved)

## Network Access

The app runs on **port 4444** and is accessible via:
- **Localhost**: `http://localhost:4444`
- **Network**: `http://<your-ip>:4444`

All network interfaces are automatically exposed for LAN access.

## Build Options

See [BUILD_GUIDE.md](BUILD_GUIDE.md) for detailed build instructions.

Quick reference:
```bash
./build.sh
# 1 - Development Server
# 2 - Production Build
# 3 - Build + Preview
# 4 - Run Tests
# 5 - Tests (watch mode)
# 6 - Type Check
# 7 - Clean Build
# 8 - Full Pipeline
# 9 - Full Pipeline + Server
```

## Testing

All core calculation formulas are unit tested for accuracy:

```bash
pnpm test
```

Tests verify:
- ✅ Daily total calculations with release bonuses
- ✅ Grand total aggregation
- ✅ Team rankings and rank changes
- ✅ Tournament-wide statistics

## Offline Functionality

The app is a Progressive Web App (PWA) that works completely offline:
- Service worker caches all assets
- IndexedDB stores all tournament data locally
- No internet connection required
- Install as native app on mobile devices

## Development Commands

```bash
pnpm install              # Install dependencies
pnpm dev                  # Start dev server (4444)
pnpm build                # Production build
pnpm preview              # Preview production build
pnpm test                 # Run tests
pnpm test:watch           # Tests with auto-reload
pnpm typecheck            # TypeScript type check
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile browsers (iOS Safari, Chrome Android)

## Architecture Notes

- **Separation of Concerns**: UI, calculations, and state are cleanly separated
- **Deterministic Output**: All calculations are reproducible
- **Type Safety**: Full TypeScript strict mode
- **Auditability**: Every formula is named and tested
- **Local-First**: Data never leaves the device by design

## License

Internal use only. Reference: roadmap.md for full specifications.

## Reference

See [BUILD_GUIDE.md](BUILD_GUIDE.md) for detailed build and deployment instructions.
