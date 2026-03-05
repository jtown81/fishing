# Fishing Tournament App - Build Guide

## Quick Start

### Development Server
```bash
./build.sh
# Select option 1
# Visit: http://localhost:4444 or http://<your-ip>:4444
```

### Production Build
```bash
./build.sh
# Select option 2
```

### Full Build Pipeline + Server
```bash
./build.sh
# Select option 9
# Runs: tests → type check → build → preview server
```

## Build Script Options

The `build.sh` script provides 9 build scenarios:

| Option | Command | Purpose |
|--------|---------|---------|
| 1 | Development Server | Hot reload dev mode on port 4444 |
| 2 | Production Build Only | Build for production (dist/) |
| 3 | Build + Preview | Production build + preview server |
| 4 | Run All Tests | Execute unit tests once |
| 5 | Tests (watch mode) | Run tests with watch mode |
| 6 | Type Check | TypeScript type checking only |
| 7 | Clean Build | Delete dist/ and rebuild |
| 8 | Full Pipeline | test → typecheck → build |
| 9 | Full Pipeline + Server | test → typecheck → build → preview |

## Network Access

The development server is accessible on all network interfaces:

- **Localhost**: `http://localhost:4444`
- **Local IP**: `http://192.168.x.x:4444` (replace with your machine's IP)
- **Docker/Bridge**: Available on all configured network IPs

## Common Workflows

### Start Development
```bash
./build.sh
# Select 1
```

### Before Committing
```bash
./build.sh
# Select 8 (runs tests, type check, and build)
```

### Production Deployment
```bash
./build.sh
# Select 2 (builds to dist/)
# Then deploy dist/ to your host
```

### Testing Only
```bash
pnpm test              # Run once
pnpm test:watch       # Run in watch mode
```

## Manual Commands (without build.sh)

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (port 4444)
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm test             # Run tests
pnpm test:watch       # Tests in watch mode
pnpm typecheck        # Type check only
```

## Project Structure

- **src/** - Application source code
  - `components/` - React components
  - `modules/` - Zustand stores and business logic
  - `models/` - TypeScript type definitions
  - `db/` - Dexie.js database schema
  - `utils/` - Utilities and calculations
  - `hooks/` - Custom React hooks
  - `styles/` - Global styles (Tailwind CSS)
- **tests/unit/** - Unit tests
- **dist/** - Production build output (created after build)

## Port Information

- **Development**: 4444 (hot reload)
- **Preview**: 4444 (static preview)

## Troubleshooting

**Port 4444 already in use?**
```bash
# Kill the process using port 4444
lsof -ti:4444 | xargs kill -9
```

**Dependencies not installed?**
```bash
pnpm install
```

**Build failing?**
```bash
./build.sh
# Select 7 (Clean Build)
```

**Tests failing?**
```bash
./build.sh
# Select 4 (Run All Tests)
```
