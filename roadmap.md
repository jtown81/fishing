# Fishing Tournament Management Application - Roadmap

## Executive Summary

This document defines the full product roadmap for a fishing tournament management application, replacing the current Excel/VBA-based system ("Fishing Tourney 2024- ChatGPT Upload.xlsm") with a modern, offline-first web application. The long-term vision is a subscription SaaS product with optional cloud sync, while guaranteeing full functionality at tournament sites with no internet connectivity.

---

## 1. Current System Analysis (XLSM Data Model)

### 1.1 Spreadsheet Structure

The XLSM workbook contains 18 sheets organized as follows:

| Sheet | Purpose | Key Fields |
|-------|---------|------------|
| **Control Page** | Master standings & current year config | Place, Team #, Name (2 members), Day 1/2 Fish Count, Weight, Released, Day Total, Big Fish, Grand Total, Status |
| **Template** | Blank year template | Same 15-column schema as year sheets |
| **2016-2022** | Historical year data (7 years) | Same schema: Place, Team#, Name, D1 Fish, D1 Weight, Released, D1 Total, D1 Big Fish, D2 Fish, D2 Weight, Released, D2 Total, Grand Total, D2 Big Fish, Status, Printed D1/D2 flags |
| **Stats** | Cross-year statistics dashboard | Average Day 1/2 weights, Big Fish Day 1/2, Avg Big Fish, Total Caught, Total Released, StDev Day 1/2 weights, StDev Big Fish -- all per year (2016-2034 pre-allocated) |
| **Most Improved** | Day-over-day rank change | Same team data + Day 1 Rank, Day 2 Rank, Change in Rank (Day1Rank - Day2Rank) |
| **Calcutta** | Auction/betting pool (4-team groups) | Group#, Team 1-4, each team's Day 2 Grand Total (lookup), Best Team Total, Buyer, Amount |
| **Calcutta (2)** | Alternate 3-team Calcutta format | Group#, Team 1-3, same lookups, Best Team Total, Buyer, Amount |
| **Ticket** | Weight ticket print template | Two tickets per page: Date, Team Number, Team Members, Grand Total Weight, Current Standing, Day 1/2 sections (Fish count, Raw Weight, Released, Total Weight, Big Fish), Received By, Issued By |
| **Instructions** | Setup and operation notes | File/folder structure, sorting procedures, manual workflow |
| **Images** | Logo/image storage | Embedded images (DrawingML) |
| **Backup** | Data safety copy | Mirror of current year standings |
| **Sheet4** | Calcutta helper data | Group assignments with combined weights |

### 1.2 Core Data Schema (Per Team, Per Year)

```
Team Record:
  place:            integer     -- Final tournament standing
  team_number:      integer     -- Assigned team ID (1-80)
  name:             string      -- Two team members (newline-separated in Excel)
  day1_fish_count:  integer     -- Number of fish caught Day 1
  day1_weight:      decimal(2)  -- Raw weight of Day 1 catch (lbs)
  day1_released:    integer     -- Number of fish released Day 1
  day1_total:       decimal(2)  -- day1_weight + (day1_released * 0.20) bonus
  day1_big_fish:    decimal(2)  -- Weight of heaviest single fish Day 1
  day2_fish_count:  integer     -- Number of fish caught Day 2
  day2_weight:      decimal(2)  -- Raw weight of Day 2 catch (lbs)
  day2_released:    integer     -- Number of fish released Day 2
  day2_total:       decimal(2)  -- day2_weight + (day2_released * 0.20) bonus
  grand_total:      decimal(2)  -- day1_total + day2_total
  day2_big_fish:    decimal(2)  -- Weight of heaviest single fish Day 2
  status:           enum        -- Active, DNF (Did Not Finish), or blank
  printed_day1:     boolean     -- Weight ticket printed for Day 1
  printed_day2:     boolean     -- Weight ticket printed for Day 2
```

### 1.3 Key Formulas & Calculations

| Calculation | Formula | Source |
|-------------|---------|--------|
| **Day Total** | `raw_weight + (fish_released * 0.20)` | Derived from data pattern: Day 1 Total = Day 1 Weight + (Released * 0.20) |
| **Grand Total** | `day1_total + day2_total` | Column M = Column G + Column L |
| **Average Day Weight** | `AVERAGE(all_teams.day_weight)` where weight > 0 | Stats sheet formulas |
| **Day Weight StDev** | `STDEV.P(all_teams.day_weight)` | Stats sheet: population standard deviation |
| **Big Fish (tournament)** | `MAX(all_teams.big_fish)` | Stats sheet: per day |
| **Avg Big Fish** | `AVERAGE(all_teams.day1_big_fish, all_teams.day2_big_fish)` | Stats sheet: combined both days |
| **Big Fish StDev** | `STDEV.P(day1_big_fish, day2_big_fish)` combined | Stats sheet |
| **Total Caught** | `SUM(all_teams.day1_fish) + SUM(all_teams.day2_fish)` | Stats sheet |
| **Total Released** | `SUM(all_teams.day1_released) + SUM(all_teams.day2_released)` | Stats sheet |
| **Most Improved** | `day1_rank - day2_rank` (positive = improved) | Most Improved sheet |
| **Calcutta Best Team** | `MAX(team1_grand_total, team2_grand_total, team3_grand_total)` | Calcutta sheet: INDEX/MATCH lookups |

### 1.4 Known Data Quality Issues (Confirmed via openpyxl analysis)

- **2016-2017 name format**: Member names separated by multiple spaces (not newline characters like 2018+)
- **2021 duplicate rows**: Team number 1 appears 3 times (one real row, two zero-weight placeholders). Deduplication required.
- **2019 big fish column**: Contains integer 0 instead of null where no big fish was recorded (pre-2019 used null)
- **Floating point artifacts in 2017**: Values like 7.1000000000000005 — round to 2 decimal places on import
- **Status column (col O)**: Contains 'YES' = weight ticket was printed, NOT disqualification. Treat all non-null status values as 'active'.
- **Tournament metadata not stored**: No location, dates, or tournament name fields exist in any sheet. Must be provided by user during import.
- **All 4 XLSM files identical**: The 2022.xlsm, 2023.xlsm, and 2024 Rewrite files all contain the same 2016-2022 data. Import only from the primary "ChatGPT Upload" file.

### 1.5 Current Workflow Pain Points

1. **Manual sorting** -- Users must unprotect sheets, sort data through Excel menus, then reprotect
2. **VBA dependency** -- Macros tied to Windows/Excel; no cross-platform support
3. **File-based storage** -- Requires specific folder structure (`C:\001 HPA Data\Tourney Data\{year}\Tickets`)
4. **No concurrent access** -- Single file, single user at a time
5. **Manual ticket printing** -- Copy data to ticket template, print, mark as printed
6. **Error-prone** -- Data entry errors, duplicate team entries visible in historical data (2020 sheet has duplicated rows)
7. **No real-time visibility** -- No live scoreboard for spectators
8. **Statistics are static** -- Pre-allocated year columns through 2034; no dynamic expansion

---

## 2. Recommended Technology Stack

### 2.1 Stack Selection Rationale

The primary constraint is **full offline functionality** at remote tournament sites, with an eventual path to cloud sync and subscription billing. This rules out server-dependent architectures and favors a **Progressive Web App (PWA)** approach.

### 2.2 Primary Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Runtime** | **TypeScript 5** | Type safety across the entire stack; shared models between client and future API |
| **Frontend Framework** | **React 19 + Vite** | Mature ecosystem, excellent PWA tooling, large talent pool |
| **UI Component Library** | **Tailwind CSS 4 + shadcn/ui** | Rapid UI development, consistent design, fully customizable |
| **Local Database** | **IndexedDB via Dexie.js** | Browser-native, no server needed, handles complex queries, 50MB+ capacity |
| **State Management** | **Zustand** | Lightweight, works well offline, simple persistence middleware |
| **Charts & Visualization** | **Recharts** (React) or **Chart.js** | Interactive charts with print support |
| **PDF/Print Generation** | **@react-pdf/renderer** | Weight tickets, reports, printable scoreboard |
| **PWA Tooling** | **Vite PWA Plugin (vite-plugin-pwa)** | Service worker, offline caching, install prompt |
| **Data Tables** | **TanStack Table v8** | Sorting, filtering, pagination, column resizing -- all client-side |
| **Form Validation** | **Zod + React Hook Form** | Runtime validation matching the data schema |
| **Testing** | **Vitest + Playwright** | Unit and E2E testing |
| **Build/Deploy** | **Vite** static output | Can be served from any static host or opened as local file |

### 2.3 Future Stack Additions (Phase 3+)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend API** | **Node.js + Hono** or **tRPC** | API for cloud sync, subscription management |
| **Cloud Database** | **PostgreSQL (Supabase)** | Multi-tenant tournament data |
| **Authentication** | **Supabase Auth** or **Clerk** | User accounts for subscription model |
| **Sync Engine** | **CRDTs (Yjs)** or **Supabase Realtime** | Conflict-free offline-to-cloud sync |
| **Payments** | **Stripe** | Subscription billing |
| **Mobile** | **Capacitor** | Wrap PWA as native iOS/Android app |
| **File Import** | **SheetJS (xlsx)** | Import existing XLSM tournament data |

### 2.4 Why This Stack Over Alternatives

| Alternative | Why Not |
|-------------|---------|
| **Electron** | Heavy download, harder to deploy, overkill for this data volume |
| **React Native** | No web version; would need separate web app |
| **Django/Flask (Python)** | Requires running a local server; poor offline story |
| **SQLite (via WASM)** | Viable but Dexie.js has simpler API and better PWA integration |
| **Next.js/Astro SSR** | Server dependency contradicts offline-first requirement |

---

## 3. Data Model Design

### 3.1 Core Entities

```typescript
// Tournament -- one per year/event
interface Tournament {
  id: string;              // UUID
  name: string;            // e.g., "HPA 2024"
  year: number;
  location: string;
  startDate: string;       // ISO date
  endDate: string;
  status: 'setup' | 'day1' | 'day2' | 'complete';
  rules: TournamentRules;
  createdAt: string;
  updatedAt: string;
}

interface TournamentRules {
  maxFishPerDay: number;          // default: 7 (observed in 2016-2017 data)
  releaseBonusPerFish: number;    // default: 0.20 lbs
  teamSize: number;               // default: 2
  daysOfCompetition: number;      // default: 2
}

// Team -- registered participants
interface Team {
  id: string;
  tournamentId: string;
  teamNumber: number;           // Assigned number (1-80+)
  member1Name: string;
  member2Name: string;
  status: 'active' | 'dnf' | 'withdrawn';
  registeredAt: string;
}

// WeighIn -- individual weigh-in event per team per day
interface WeighIn {
  id: string;
  tournamentId: string;
  teamId: string;
  day: 1 | 2;
  fishCount: number;            // Number of fish brought to scale
  rawWeight: number;            // Total weight in lbs (2 decimal)
  fishReleased: number;         // Fish released back (catch & release credit)
  bigFish: number;              // Weight of largest single fish
  totalWeight: number;          // COMPUTED: rawWeight + (fishReleased * releaseBonusPerFish)
  receivedBy: string;           // Official who accepted weigh-in
  issuedBy: string;             // Official who issued ticket
  ticketPrinted: boolean;
  weighedAt: string;            // Timestamp
}

// CalcuttaGroup -- auction/pool grouping
interface CalcuttaGroup {
  id: string;
  tournamentId: string;
  groupNumber: number;
  teamIds: string[];            // 3 or 4 team IDs
  buyer: string;                // Person who bought the group
  amount: number;               // Purchase price
}

// Logo -- uploaded images for printouts
interface Logo {
  id: string;
  name: string;
  imageData: Blob;              // Stored as binary in IndexedDB
  mimeType: string;
  isDefault: boolean;
  uploadedAt: string;
}

// Computed views (not stored, derived at query time)
interface TeamStanding {
  place: number;
  teamNumber: number;
  teamName: string;
  day1FishCount: number;
  day1Weight: number;
  day1Released: number;
  day1Total: number;            // weight + (released * bonus)
  day1BigFish: number;
  day2FishCount: number;
  day2Weight: number;
  day2Released: number;
  day2Total: number;
  grandTotal: number;           // day1Total + day2Total
  day2BigFish: number;
  status: string;
  day1Rank: number;             // Rank after Day 1
  day2Rank: number;             // Rank after Day 2
  rankChange: number;           // day1Rank - day2Rank (positive = improved)
}

interface TournamentStats {
  year: number;
  avgDay1Weight: number;
  avgDay2Weight: number;
  day1StdDev: number;
  day2StdDev: number;
  bigFishDay1: number;          // Tournament record single fish
  bigFishDay2: number;
  avgBigFish: number;
  bigFishStdDev: number;
  totalCaught: number;
  totalReleased: number;
  totalTeams: number;
  teamsWithFish: number;        // Teams that caught at least 1 fish
  avgFishPerTeam: number;
  avgWeightPerFish: number;
}
```

### 3.2 IndexedDB Schema (Dexie.js)

```typescript
const db = new Dexie('FishingTourneyDB');

db.version(1).stores({
  tournaments: 'id, year, status',
  teams: 'id, tournamentId, teamNumber, [tournamentId+teamNumber]',
  weighIns: 'id, tournamentId, teamId, day, [tournamentId+day], [teamId+day]',
  calcuttaGroups: 'id, tournamentId, groupNumber',
  logos: 'id, name, isDefault',
  syncQueue: '++id, entityType, entityId, action, timestamp'
});
```

---

## 4. Application Architecture

### 4.1 Page/View Structure

```
App Shell (responsive sidebar + header)
├── Dashboard (live scoreboard)
│   ├── Current Standings Table (sortable, filterable)
│   ├── Big Fish Leaderboard
│   ├── Summary Stats Cards
│   └── Auto-refresh toggle (for projector display)
│
├── Tournament Setup
│   ├── Tournament Create/Edit Form
│   ├── Rules Configuration
│   └── Import from XLSM
│
├── Teams Management
│   ├── Teams List (CRUD table)
│   ├── Add/Edit Team Modal
│   ├── Bulk Import
│   └── Team Detail View
│
├── Weigh-In Station
│   ├── Quick Entry Form (team#, day, weights)
│   ├── Weight Ticket Preview & Print
│   ├── Recent Weigh-Ins Feed
│   └── Validation Alerts
│
├── Calcutta Manager
│   ├── Group Generator (random draw)
│   ├── Groups Table with Live Scores
│   ├── Buyer/Amount Entry
│   └── Calcutta Results
│
├── Statistics & Reports
│   ├── Current Year Dashboard
│   │   ├── Weight Distribution Chart
│   │   ├── Fish Count by Team Chart
│   │   ├── Big Fish Timeline
│   │   └── Day 1 vs Day 2 Comparison
│   ├── Historical Trends (multi-year)
│   │   ├── Avg Weight by Year Line Chart
│   │   ├── Total Caught by Year Bar Chart
│   │   ├── Big Fish Records Over Time
│   │   └── Participation Trends
│   ├── Most Improved Report
│   ├── Parks & Wildlife Report
│   │   ├── Total Catch/Release Numbers
│   │   ├── Average Fish Weight Trends
│   │   ├── Estimated Total Biomass
│   │   └── Exportable CSV/PDF
│   └── Custom Report Builder
│
├── Logos & Branding
│   ├── Upload Logo (drag & drop)
│   ├── Logo Gallery
│   ├── Set Default Logo
│   └── Preview on Ticket
│
└── Settings
    ├── Data Export (JSON, CSV, XLSM)
    ├── Data Import (XLSM, JSON)
    ├── Backup/Restore
    ├── Account & Subscription (Phase 3)
    └── Cloud Sync Settings (Phase 3)
```

### 4.2 Key UI Components

**Scoreboard Display Mode**: Full-screen view designed for projectors at the tournament site. Auto-refreshes every 30 seconds. Shows:
- Top 10 teams with animated rank changes
- Big Fish leader with fish icon
- Total fish caught counter (animated number)
- Tournament logo
- Countdown timer (if between days)
- Dark theme with high contrast for outdoor visibility

**Weigh-In Station**: Optimized for rapid data entry at the scale. Large touch-friendly buttons, numeric keypad layout, auto-advance between fields, instant ticket printing.

**Weight Ticket**: Matches the current 2-per-page format from the Ticket sheet. Includes:
- Tournament logo (uploaded)
- Date, Team Number, Team Members
- Grand Total Weight, Current Standing
- Day 1 and Day 2 sections: Fish Count, Raw Weight, Released, Total Weight, Big Fish
- Received By / Issued By signature lines
- QR code linking to live standings (Phase 3)

---

## 5. Statistics & Game Fish Management Reports

### 5.1 Core Statistics (Matching XLSM Stats Sheet)

All statistics currently in the spreadsheet will be computed automatically:

| Statistic | Description | Formula |
|-----------|-------------|---------|
| Average Day 1 Weight | Mean of all Day 1 raw weights (non-zero) | `mean(day1_weight where > 0)` |
| Average Day 2 Weight | Mean of all Day 2 raw weights (non-zero) | `mean(day2_weight where > 0)` |
| Day 1 Standard Deviation | Population StDev of Day 1 weights | `stdev_pop(day1_weight)` |
| Day 2 Standard Deviation | Population StDev of Day 2 weights | `stdev_pop(day2_weight)` |
| Big Fish Day 1 | Largest single fish caught on Day 1 | `max(day1_big_fish)` |
| Big Fish Day 2 | Largest single fish caught on Day 2 | `max(day2_big_fish)` |
| Average Big Fish | Mean of all big fish weights (both days) | `mean(day1_big_fish, day2_big_fish)` |
| Big Fish Standard Deviation | StDev of big fish weights | `stdev_pop(all_big_fish)` |
| Total Fish Caught | Sum of all fish across both days | `sum(day1_fish + day2_fish)` |
| Total Fish Released | Sum of all released fish | `sum(day1_released + day2_released)` |

### 5.2 Enhanced Statistics (New)

| Statistic | Description | Value for Parks Mgmt |
|-----------|-------------|---------------------|
| **Catch Rate** | Fish per team per day | Indicates fish population health |
| **Catch Per Unit Effort (CPUE)** | Fish caught / teams fishing | Standard fisheries metric |
| **Release Rate %** | Released / Caught * 100 | Conservation compliance |
| **Weight Distribution** | Histogram of individual fish weights | Population age structure indicator |
| **Big Fish Frequency** | % of fish above weight thresholds (e.g., >3lb, >4lb, >5lb) | Trophy fish availability |
| **Day-over-Day Retention** | Teams fishing both days / total teams | Tournament engagement metric |
| **DNF Rate** | Teams that withdrew / registered | Event planning metric |
| **Median vs Mean Weight** | Comparison of central tendency | Skew indicates outlier fish presence |
| **Top Team Dominance** | (1st place total - median total) / median | Competition balance indicator |
| **Year-over-Year Catch Trend** | Regression line on total caught across years | Long-term fishery health |
| **Participation Trend** | Team count by year | Tournament growth indicator |
| **New vs Returning Teams** | Teams appearing in multiple years | Community engagement |
| **Slot Length Estimate** | Derived weight-to-length conversion | Size structure analysis |
| **Total Biomass Harvested** | Sum of all weights (if kept) | Harvest pressure on fishery |

### 5.3 Parks & Wildlife Management Export

A dedicated report formatted for submission to game, fish, and parks agencies:

```
=== Tournament Fisheries Report ===
Event: [Name], [Location]
Date: [Start] - [End]
Species: [Target species]

PARTICIPATION
  Registered Teams: XX
  Teams Fishing Day 1: XX
  Teams Fishing Day 2: XX
  Did Not Finish: XX

HARVEST DATA
  Total Fish Caught: XXX
  Total Fish Released: XXX (XX.X% release rate)
  Fish Kept: XXX
  Catch Per Team (avg): X.XX

WEIGHT DATA
  Total Weight Day 1: XXX.XX lbs
  Total Weight Day 2: XXX.XX lbs
  Average Fish Weight: X.XX lbs
  Median Fish Weight: X.XX lbs
  Largest Fish: X.XX lbs (Team #XX)
  Weight Std Deviation: X.XX

TREND DATA (multi-year)
  [Table: Year, Teams, Total Caught, Released, Avg Weight, Big Fish]
```

---

## 6. Modernization Ideas & Visualizations

### 6.1 Interactive Dashboards

1. **Live Leaderboard with Animations** -- Rank changes animate smoothly like a stock ticker. Teams sliding up are highlighted green, sliding down in red. Projector-optimized dark mode.

2. **Weight Distribution Violin Plot** -- Shows the distribution of fish weights across all teams, revealing whether the fishery is healthy (normal distribution) or stressed (bimodal or heavily skewed).

3. **Team Performance Heatmap** -- Grid showing each team's performance by day. Color intensity represents weight relative to the field. Instantly identify hot and cold teams.

4. **Big Fish Race Timeline** -- Horizontal timeline showing when each big fish was weighed in during the day. Creates a narrative of the tournament's dramatic moments.

5. **Historical Sparklines** -- Inline mini-charts in the stats table showing each metric's trend across all years.

### 6.2 Mobile Access

- **PWA "Add to Home Screen"** -- Works on any phone without app store installation
- **Weigh-In Mobile Mode** -- Simplified single-purpose screen for scale operators
- **Spectator Mode** -- Read-only live standings accessible via QR code posted at tournament site
- **Push Notifications** (Phase 3) -- Alert anglers when standings change, new big fish, or weigh-in deadline approaching

### 6.3 Automated Reporting

- **Auto-generate weight tickets** when weigh-in is saved
- **End-of-day summary PDF** sent to tournament director at close of weigh-in
- **End-of-tournament package** -- Final standings, statistics, Most Improved, Calcutta results, all in one PDF
- **Parks & Wildlife report** auto-formatted and ready for submission
- **Excel export** for operators who still want spreadsheet access

### 6.4 Process Modernization

| Current Process | Modernized Approach |
|-----------------|-------------------|
| Manual Excel sorting | Auto-sorted tables with one-click column sort |
| Copy/paste to ticket template | Auto-populated ticket from weigh-in data |
| Manual rank calculation | Real-time computed rankings |
| Physical Calcutta draw | Digital randomized draw with instant display |
| Paper ticket signatures | Digital signature capture on tablet |
| Manual year-to-year data copy | Multi-year database with instant history |
| Folder-based file management | Structured database with search |
| Single-computer access | Multi-device via PWA with sync |

---

## 7. Development Phases & Timeline

### Phase 1: Core MVP (Weeks 1-6)
> Replace the spreadsheet for a single tournament operator

**Status: ✅ COMPLETE**

**Delivered:**
- [x] Project scaffolding: Vite + React + TypeScript + Tailwind + shadcn/ui
- [x] IndexedDB schema with Dexie.js (tournaments, teams, weighIns, calcuttas, logos, stats)
- [x] Tournament setup: Create tournament, configure rules
- [x] Team CRUD: Add, edit, delete, list teams
- [x] Weigh-in entry: Quick-entry form with validation (day, fish count, weight, released, big fish)
- [x] Day Total calculation: `rawWeight + (fishReleased * 0.20)`
- [x] Grand Total calculation: `day1Total + day2Total`
- [x] Auto-computed standings with live rank
- [x] Weight ticket generation & print (2 per page)
- [x] PWA setup: offline, installable

**Deferred to Phase 3:**
- XLSM historical data import (detailed spec below)
- Logo upload/management
- Data export (JSON and CSV)

### Phase 2: Statistics & Scoreboard (Weeks 7-10)
> Full statistical analysis and live tournament display

**Status: ✅ COMPLETE**

**Delivered:**
- [x] Statistics engine with 19 unit tests (averages, StDev, big fish, CPUE, release rate)
- [x] Statistics dashboard with Recharts visualizations
  - [x] Weight distribution histogram
  - [x] Day 1 vs Day 2 scatter plot with bubble size = grand total
  - [x] Big Fish leaderboard bar chart
  - [x] Most Improved report (day 1 vs day 2 rank delta)
  - [x] 8-card statistics summary
- [x] Calcutta manager (Fisher-Yates shuffle, 3 or 4 teams, buyer/amount, scoring)
- [x] Live Scoreboard display mode (full-screen dark theme, auto-refresh, standings + stats modes)
- [x] Parks & Wildlife report (CSV export for agency submission)
- [x] Print suite: Standings, statistics, weight tickets

### Phase 3: CSV Import/Export System (Weeks 11-14)
> Import/export tournament data as CSV for easy sharing and backup

**Status: ✅ COMPLETE**

**Delivered:**
- [x] CSV parser with RFC 4180 compliance
- [x] Import service with transaction semantics
- [x] Export service with tournament data serialization
- [x] ImportExportManager UI (two-tab interface)
- [x] Comprehensive user guide and examples
- [x] 40+ unit tests

**Note on Historical Data**: The legacy XLSM files (2016-2022) are available as test data seed files (see `src/db/seed/`). These are not imported via user UI, but are available for development/testing via a seeding utility. To populate test data: run `npm run seed:history` (development only).

**Future**: XLSM import is deferred indefinitely. CSV is the standard import format. If users need to migrate from XLSM, they can export from Excel as CSV first.

### Phase 4 Extended: Cloud Sync & Multi-Device (Weeks 15-20)
> Enable cloud backup and multi-device access

**Status: ✅ COMPLETE**

**Delivered:**
- [x] Supabase backend: PostgreSQL database, auth, realtime
- [x] User registration and authentication
- [x] Offline-first sync engine: Local-first with background cloud sync
- [x] Conflict resolution for concurrent edits (last-write-wins by updatedAt)
- [x] Multi-device weigh-in stations syncing to single tournament
- [x] Spectator mode: Public read-only link to live standings (`?spectator=<slug>`)
- [x] Data owned by user -- cloud is optional backup (app fully functional without Supabase)

### Phase 5: Subscription & Multi-Tenant (Weeks 21-28)
> SaaS product launch

**Status: ✅ CORE COMPLETE** (billing integration delivered; advanced multi-tenant features deferred to Phase 6)

**Delivered:**
- [x] Subscription tiers: Free (1 tournament, local-only) / Pro ($9.99/mo) / Org ($29.99/mo)
- [x] Stripe Checkout integration (redirect flow via Supabase Edge Function)
- [x] Stripe Billing Portal (plan changes, cancellations)
- [x] Stripe webhook handler (checkout.session.completed, subscription.updated/deleted, invoice.payment_failed)
- [x] `user_subscriptions` table in Supabase with RLS
- [x] `subscription-service.ts` + `subscription-store.ts` (mirrors auth pattern; no-op when Supabase unconfigured)
- [x] Free tier enforcement: `createTournament` throws `FREE_TIER_LIMIT` when count ≥ 1
- [x] UpgradePrompt component (modal + inline) with Pro feature list
- [x] PricingCards component (3-column Free/Pro/Org grid)
- [x] SubscriptionBadge component (pill: Free/Pro/Org)
- [x] SettingsView: badge, renewal date, "Manage Billing" / "Upgrade Plan" buttons, inline PricingCards
- [x] SettingsView Cloud Sync section gated: shows UpgradePrompt when tier=Free
- [x] App.tsx: subscription init, user change effects, `?billing=success` redirect handler

**Deferred to Phase 6:**
- [ ] Admin dashboard for tournament organizers
- [ ] White-label branding: Custom logos, colors, domain
- [ ] REST/GraphQL API for third-party integrations
- [ ] Capacitor wrapper: Native iOS and Android apps in app stores

### Phase 4: Enhanced Immersion & Seasonal Experience (Weeks 25-28)
> Theme animations, seasonal overlays, hall of fame records, and optional sound effects

**Status: ✅ 4.1, 4.2, 4.3 COMPLETE** (4.4 optional)

**Delivered:**

**4.1 — Animated Species Illustrations** ✅
- [x] AnimatedSpeciesIcon wrapper component with 4 variants (idle, hero, loading, celebrate)
- [x] AmbientBackground water layer with animated sine-wave ripples
- [x] LoadingScreen component with themed spinner
- [x] Species-specific CSS swim animations (walleye drifts, bass bounces, pike darts, musky flows, salmon jumps)
- [x] GPU-accelerated animations (transform + opacity only)
- [x] Respects prefers-reduced-motion accessibility setting
- [x] Mobile/low-end device optimization
- [x] Integration: Dashboard, ScoreboardDisplay headers

**4.2 — Seasonal Themes** ✅
- [x] Season configuration (spring, summer, fall, winter) with color palettes
- [x] Auto-detection from tournament start date
- [x] CSS overlay system with season-specific color tints and filters
  - [x] Spring: +15° hue-rotate, +10% saturation (green tint)
  - [x] Summer: +20% saturation (warm gold tint)
  - [x] Fall: sepia(0.15) + saturation decrease (amber tint)
  - [x] Winter: -20° hue-rotate + saturation decrease (blue tint)
- [x] Season selector in theme switcher UI
- [x] localStorage persistence (resettable to "auto")
- [x] Seasonal greeting messages for each theme × season
- [x] CSS animations per season (shimmer, glow, fade, crystalline effects)

**4.3 — Hall of Fame & Trophy Showcase** ✅
- [x] Hall of Fame module with pure functions computing all-time records:
  - [x] Biggest Fish (across all tournaments)
  - [x] Best Team Total (day totals with release bonus)
  - [x] Most Consistent (lowest standard deviation)
- [x] Tier system: bronze/silver/gold/legendary (percentile-based)
- [x] AnimatedTrophy component with tier-specific styling and glow effects
- [x] RecordCard component displaying individual records
- [x] HallOfFameView full page with category filters and responsive layout
- [x] useHallOfFame hook for lazy-loading and memoization
- [x] Navigation integration (Trophy icon in sidebar)
- [x] Graceful empty states (zero tournaments)

**4.4 — Sound Effects (Optional)** ⏳
- [ ] useSoundEngine hook with HTML5 audio
- [ ] Species-specific ambient soundscapes
- [ ] Interaction SFX (achievement unlocks, weigh-in saves)
- [ ] SoundSettings UI with volume/preview controls
- [ ] Opt-in by default, respects autoplay policy

**Deferred items:**
- [ ] Sound effects (optional; can enhance Phase 3 or defer to Phase 5)

---

### Phase 6: Native Apps, Admin & Advanced Features
> Competitive differentiation + Phase 5 deferred items

**Status: 6a-6c COMPLETE** (6d deferred)

**Deliverables (completed):**

**6a — Native App (Capacitor)** ✅
- [x] Capacitor wrapper configuration for native iOS and Android shells
- [x] App Store / Play Store deployment pipeline docs
- [x] Native push notification library integration
- [x] Camera access library for fish photo capture
- [x] Native share sheet functionality

**6b — Admin & Multi-Tenant** ✅
- [x] Role-based access: owner / operator / viewer per tournament
- [x] Tournament member management (invite, remove, role assignment)
- [x] Spectator mode: public read-only view via slug (no auth)
- [x] Subscription tiers: Free / Pro / Org with tier enforcement
- [x] Supabase auth & backend integration
- [x] Stripe Checkout via Edge Functions
- [x] Multi-user tournament access with realtime sync
- [ ] Admin dashboard: manage tournaments across multiple Org-tier users (deferred to 6d)
- [ ] White-label branding: custom logo, colors, subdomain (deferred to 6d)
- [ ] REST API for third-party integrations (deferred to 6d)

**6c — Angler & Social Features** ✅
- [x] Angler profiles: create, edit, delete with CRUD API
- [x] Multi-tournament tracking: view angler's tournament history & career stats
- [x] Career statistics: best weight, avg weight, best rank across tournaments
- [x] Link anglers to teams in current tournament
- [x] Angler UI: AnglerList, AnglerProfile, AnglerLinkModal
- [ ] Digital signature capture on weight tickets (deferred to 6d)
- [ ] Photo capture: attach fish photos to weigh-in records (deferred to 6d)
- [ ] Social sharing: post results to Facebook, Instagram (deferred to 6d)
- [ ] GPS integration: log fishing areas (deferred to 6d)

### Phase 6d: Advanced Features & Intelligence (Deferred)
> Competitive differentiation for Phase 7+

**Deferred items from 6a-6c:**
- [ ] Admin dashboard: manage tournaments across multiple Org-tier users
- [ ] White-label branding: custom logo, colors, subdomain per organization
- [ ] REST API for third-party integrations
- [ ] Digital signature capture on weight tickets (tablet-optimized)
- [ ] Photo capture: attach fish photos to weigh-in records
- [ ] Social sharing: post results to Facebook, Instagram
- [ ] GPS integration: log fishing areas (anonymized for reports)

**New 6d Features:**
- [ ] AI-powered predictions: estimated final standings from Day 1 results
- [ ] Weather integration: correlate catch data with conditions
- [ ] Sponsor management: logos, thank-you reports
- [ ] Species-specific tracking: multi-species tournament support
- [ ] Automated bracket/elimination tournament formats

---

## 8. Project Structure

```
fishing-tourney/
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service worker
│   ├── icons/                     # App icons (multiple sizes)
│   └── offline.html               # Offline fallback
├── src/
│   ├── main.tsx                   # Entry point
│   ├── App.tsx                    # App shell with routing
│   ├── models/
│   │   ├── tournament.ts          # Tournament, TournamentRules
│   │   ├── team.ts                # Team
│   │   ├── weigh-in.ts            # WeighIn
│   │   ├── calcutta.ts            # CalcuttaGroup
│   │   ├── logo.ts                # Logo
│   │   └── stats.ts               # TournamentStats, TeamStanding
│   ├── db/
│   │   ├── database.ts            # Dexie.js schema & instance
│   │   ├── migrations.ts          # Schema versioning
│   │   └── seed.ts                # Demo data loader
│   ├── modules/
│   │   ├── tournaments/
│   │   │   ├── tournament-service.ts
│   │   │   └── tournament-store.ts
│   │   ├── teams/
│   │   │   ├── team-service.ts    # CRUD operations
│   │   │   └── team-store.ts      # Zustand store
│   │   ├── weigh-ins/
│   │   │   ├── weigh-in-service.ts
│   │   │   ├── calculations.ts    # Day total, grand total, rankings
│   │   │   └── weigh-in-store.ts
│   │   ├── calcutta/
│   │   │   ├── calcutta-service.ts
│   │   │   ├── group-generator.ts # Random team grouping
│   │   │   └── calcutta-store.ts
│   │   ├── stats/
│   │   │   ├── stats-engine.ts    # All statistical calculations
│   │   │   ├── parks-report.ts    # Wildlife management report
│   │   │   └── most-improved.ts   # Rank change calculations
│   │   ├── import/
│   │   │   ├── xlsm-parser.ts     # SheetJS-based XLSM import
│   │   │   └── data-mapper.ts     # Map spreadsheet to models
│   │   └── export/
│   │       ├── json-export.ts
│   │       ├── csv-export.ts
│   │       └── pdf-export.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx       # Sidebar + header + content
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── dashboard/
│   │   │   ├── Scoreboard.tsx     # Full-screen display mode
│   │   │   ├── StandingsTable.tsx # TanStack Table with sorting
│   │   │   ├── BigFishLeader.tsx
│   │   │   └── SummaryCards.tsx
│   │   ├── teams/
│   │   │   ├── TeamList.tsx
│   │   │   ├── TeamForm.tsx       # Add/edit modal
│   │   │   └── TeamDetail.tsx
│   │   ├── weigh-in/
│   │   │   ├── WeighInForm.tsx    # Quick entry
│   │   │   ├── WeightTicket.tsx   # Printable ticket
│   │   │   └── RecentWeighIns.tsx
│   │   ├── calcutta/
│   │   │   ├── CalcuttaManager.tsx
│   │   │   ├── GroupDraw.tsx
│   │   │   └── CalcuttaResults.tsx
│   │   ├── stats/
│   │   │   ├── StatsOverview.tsx
│   │   │   ├── HistoricalTrends.tsx
│   │   │   ├── MostImproved.tsx
│   │   │   └── ParksReport.tsx
│   │   ├── charts/
│   │   │   ├── WeightDistribution.tsx
│   │   │   ├── CatchByTeam.tsx
│   │   │   ├── BigFishTimeline.tsx
│   │   │   ├── YearOverYear.tsx
│   │   │   └── DayComparison.tsx
│   │   ├── logos/
│   │   │   ├── LogoUpload.tsx
│   │   │   ├── LogoGallery.tsx
│   │   │   └── LogoPreview.tsx
│   │   └── ui/                    # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── table.tsx
│   │       └── ...
│   ├── hooks/
│   │   ├── useStandings.ts        # Computed standings with rankings
│   │   ├── useStats.ts            # Computed statistics
│   │   ├── usePrint.ts            # Print functionality
│   │   └── useOffline.ts          # Online/offline detection
│   ├── utils/
│   │   ├── calculations.ts        # Pure calculation functions
│   │   ├── sorting.ts             # Multi-column sort logic
│   │   ├── formatting.ts          # Weight, date formatting
│   │   └── validation.ts          # Zod schemas
│   └── styles/
│       └── globals.css            # Tailwind + custom styles
├── tests/
│   ├── unit/
│   │   ├── calculations.test.ts
│   │   ├── stats-engine.test.ts
│   │   ├── xlsm-parser.test.ts
│   │   └── group-generator.test.ts
│   └── e2e/
│       ├── tournament-flow.test.ts
│       └── weigh-in-flow.test.ts
├── .python-version                 # pyenv: 3.12.8 (for any Python utilities)
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── roadmap.md                     # This file
```

---

## 9. UI/UX Best Practices

### 9.1 Design Principles

1. **Speed over beauty** -- At the weigh-in station, data entry speed is critical. Large input fields, tab-through forms, auto-focus, instant feedback.
2. **Glanceable scoreboard** -- The dashboard must be readable from 30 feet on a projector. Large fonts, high contrast, minimal decoration.
3. **Mobile-first, desktop-enhanced** -- Core weigh-in and viewing works on a phone. Statistics and management views expand for desktop.
4. **Offline confidence** -- Always show sync status. Green = synced, yellow = local changes pending, red = offline. Never lose data.
5. **Print-native** -- Weight tickets, standings, and reports must print cleanly. Use `@media print` CSS and PDF generation.

### 9.2 Color Scheme

- **Primary**: Deep blue (#1e3a5f) -- authority, trust, water theme
- **Accent**: Golden yellow (#f59e0b) -- highlights, first place, big fish
- **Success**: Green (#10b981) -- successful weigh-in, improving rank
- **Danger**: Red (#ef4444) -- DNF, data errors, delete actions
- **Background**: Slate (#0f172a dark / #f8fafc light)
- **Scoreboard dark mode**: Near-black (#020617) with bright text for outdoor projector visibility

### 9.3 Accessibility

- Minimum 4.5:1 contrast ratio for all text
- Keyboard navigable (Tab through weigh-in form fields)
- Screen reader labels on all inputs
- No color-only indicators (always include text/icon)

---

## 10. Verification & Testing Plan

### 10.1 Spreadsheet Parity

Before launch, verify that the application produces identical results to the XLSM for all historical data:

1. Import all year sheets (2016-2022) from the XLSM
2. For each year, verify:
   - All team standings match (place, grand total, day totals)
   - Day Total formula: `rawWeight + (released * 0.20)` matches column G/L
   - Grand Total: `day1Total + day2Total` matches column M
   - Big Fish values match columns H and N
3. Stats verification:
   - Average Day 1/2 weights match Stats sheet values
   - Big Fish Day 1/2 match
   - Total Caught and Released match
   - StDev values match (population StDev)
4. Most Improved calculation matches Most Improved sheet
5. Calcutta group scores match Calcutta sheet lookups

### 10.2 Test Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server
pnpm build            # Production build
pnpm preview          # Preview build
pnpm test             # Run all tests
pnpm test:parity      # Spreadsheet parity checks
pnpm typecheck        # TypeScript validation
```

---

## 11. Migration Path from XLSM

### Step 1: Import Historical Data
- Read all year sheets using SheetJS
- Parse team names (handle `\n` delimiter and inconsistent spacing from older years)
- Map columns A-R to data model fields
- Validate with Zod schemas
- Store in IndexedDB

### Step 2: Verify Calculations
- Run all statistics calculations against imported data
- Compare results to Stats sheet values
- Log any discrepancies (known: 2020 has duplicate team rows)

### Step 3: Parallel Operation
- Run the new app alongside the XLSM for one tournament season
- Enter data in both systems
- Verify all outputs match
- Build operator confidence

### Step 4: Full Cutover
- XLSM becomes archive/backup only
- New app is primary system
- Export to XLSM available for anyone still wanting spreadsheet access

---

## 12. Offline-First Architecture Detail

### How It Works

```
[User Device]
    │
    ├── React App (PWA - cached by Service Worker)
    ├── IndexedDB (Dexie.js - all data stored locally)
    ├── Service Worker (caches app shell + assets)
    │
    └── When online ──→ [Sync Engine]
                            │
                            ├── Push local changes to cloud
                            ├── Pull remote changes
                            └── Resolve conflicts (last-write-wins or CRDT)
                                    │
                                    └── [Supabase / PostgreSQL]
                                            │
                                            ├── Multi-tenant data storage
                                            ├── Realtime subscriptions
                                            └── Auth & billing
```

**Key Principle**: The app NEVER requires a network connection to function. All CRUD, calculations, statistics, printing, and exports work 100% locally. Cloud is a convenience layer for backup, multi-device sync, and subscription features.

### Conflict Resolution Strategy

When multiple devices edit the same tournament offline and later sync:
1. **Timestamps win for simple fields** -- Last edit timestamp determines winner
2. **Weigh-ins are append-only** -- New weigh-ins never conflict; updates use version vectors
3. **Team edits are rare** -- Prompt user to resolve if two devices edited the same team
4. **Statistics are computed** -- Never stored, always derived from weigh-in data, so no sync needed

---

*This roadmap is a living document. Update it as requirements evolve and phases complete.*
