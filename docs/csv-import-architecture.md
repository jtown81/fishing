# CSV Import/Export Architecture

## Overview

The CSV import/export system is designed with clean separation of concerns:

- **csv-parser.ts**: Pure functions for parsing and formatting CSV
- **import-service.ts**: Database operations for importing
- **export-service.ts**: Preparing data for export
- **ImportExportManager.tsx**: User interface component

This document describes the architecture and implementation details for developers.

## Module: `/src/modules/import-export/`

### File Structure

```
src/modules/import-export/
├── csv-parser.ts          # Pure functions: parse, validate, format
├── import-service.ts      # Database operations: import, validate
├── export-service.ts      # Data preparation: export, filename generation
└── index.ts               # Barrel export
```

### Design Principles

1. **Pure Functions First**: Core parsing logic has zero dependencies on React, Zustand, or database
2. **Validation as a Separate Step**: Parsing and validation are distinct operations
3. **Type Safety**: Full TypeScript with strict mode; all data structures are typed
4. **Explicit Errors**: Clear, actionable error messages for users

## CSV Parser (`csv-parser.ts`)

### Public Functions

#### `parseCSV(csvContent: string): ImportedData`

Parses raw CSV string into structured tournament data.

**Input:** Raw CSV string (supports both LF and CRLF line endings)

**Output:** `ImportedData` object with tournament, teams, and weigh-ins

**Throws:** Error if parsing fails (invalid format, missing sections, type mismatches)

**Algorithm:**
1. Split content by newlines
2. Identify sections by `#SECTION` headers
3. Extract headers from first row of each section
4. Parse data rows using RFC 4180 CSV rules
5. Convert and validate data types
6. Return structured data or throw descriptive error

**Example:**
```typescript
const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test,2024,Lake,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish`

const data = parseCSV(csv)
// data.tournament.name === 'Test'
// data.teams.length === 1
```

#### `validateImportedData(data: ImportedData): { isValid, errors[], warnings[] }`

Validates parsed data against business rules.

**Input:** `ImportedData` object from `parseCSV()`

**Output:** `{ isValid: boolean, errors: string[], warnings: string[] }`

**Validations Performed:**
- Tournament: required fields, date range
- Teams: at least 1 team, unique team numbers
- Weigh-ins: team references exist, no duplicates
- Cross-section: weigh-ins reference valid teams

**Errors (fail import):**
- Missing required fields
- Invalid date ranges
- Duplicate team numbers
- Weigh-in references non-existent team

**Warnings (allow import):**
- Active team with no weigh-in data
- Missing Day 2 weigh-in (partial data)

**Example:**
```typescript
const data = parseCSV(csvContent)
const validation = validateImportedData(data)

if (!validation.isValid) {
  console.error(validation.errors) // ["Duplicate team_number: 5"]
}
if (validation.warnings.length > 0) {
  console.warn(validation.warnings) // ["Team 3 has no weigh-in data"]
}
```

#### `formatForExport(tournament, teams, weighIns): string`

Formats tournament data as CSV string.

**Input:**
- `tournament`: Tournament metadata (name, year, location, dates)
- `teams`: Array of teams with members and status
- `weighIns`: Array of weigh-in records

**Output:** CSV string ready for download

**Features:**
- Escapes special characters (commas, quotes, newlines)
- Formats decimals to 2 places
- Sorts sections in standard order
- Includes blank lines for readability

**Example:**
```typescript
const csv = formatForExport(
  { name: 'Test', year: 2024, location: 'Lake', ... },
  [{ teamNumber: 1, members: [...], status: 'active' }],
  [{ teamNumber: 1, day: 1, fishCount: 5, ... }]
)
// csv contains "#TOURNAMENT\n#TEAMS\n#WEIGH_INS\n..."
```

### Type Definitions

```typescript
interface TournamentImport {
  name: string
  year: number
  location: string
  startDate: Date
  endDate: Date
}

interface TeamImport {
  teamNumber: number
  member1First: string
  member1Last: string
  member2First: string
  member2Last: string
  status: 'active' | 'inactive' | 'disqualified'
}

interface WeighInImport {
  teamNumber: number
  day: 1 | 2
  fishCount: number
  rawWeight: number
  fishReleased: number
  bigFish?: number  // Optional
}

interface ImportedData {
  tournament: TournamentImport
  teams: TeamImport[]
  weighIns: WeighInImport[]
}
```

### CSV Parsing Rules

**Section Detection:**
- Lines starting with `#TOURNAMENT`, `#TEAMS`, `#WEIGH_INS` trigger section change
- First non-comment/non-blank line after section is the header row
- Headers must match exactly (case-sensitive)

**Field Parsing:**
- RFC 4180 compliant CSV
- Quoted fields allow commas and newlines
- Escaped quotes inside quoted fields: `""` → `"`
- Whitespace trimmed from all fields

**Type Conversion:**
- Numbers: `parseInt()`, `parseFloat()`
- Dates: ISO 8601 format `YYYY-MM-DD`
- Enums: lowercase normalization for status

**Precision:**
- `rawWeight` and `bigFish` rounded to 2 decimal places
- ISO dates in UTC

## Import Service (`import-service.ts`)

### Public Functions

#### `validateBeforeImport(data: ImportedData): ImportValidation`

Final validation before database operations.

**Input:** Parsed `ImportedData`

**Output:** `{ isValid: boolean, errors: string[], warnings: string[] }`

**Additional Checks:**
- CSV validation via `validateImportedData()`
- Tournament uniqueness: no existing tournament with same name+year
- Database connectivity (implicit in `db.tournaments.where()`)

**Example:**
```typescript
const validation = await validateBeforeImport(parsedData)
if (!validation.isValid) {
  throw new Error(validation.errors.join('\n'))
}
```

#### `importTournament(data: ImportedData): Promise<ImportResult>`

Imports tournament data into IndexedDB.

**Input:** Validated `ImportedData`

**Output:** `{ tournamentId, tournamentName, teamCount, weighInCount }`

**Process:**
1. Final validation via `validateBeforeImport()`
2. Generate IDs (tournament, teams, weigh-ins)
3. Create tournament record
4. Bulk insert teams with generated IDs
5. Build team ID map (teamNumber → teamId)
6. Bulk insert weigh-ins with team ID references
7. Return summary

**Timestamps:**
- Weigh-in Day 1: `timestamp = tournament.startDate`
- Weigh-in Day 2: `timestamp = tournament.endDate`
- `receivedBy` and `issuedBy` set to `"imported"`

**Error Handling:**
- If any step fails, rollback (delete inserted tournament)
- Throw descriptive error with original issue
- Database errors propagate to caller

**Example:**
```typescript
try {
  const result = await importTournament(parsedData)
  console.log(`Imported ${result.teamCount} teams`)
  // Reload tournament list from store
  await loadTournaments()
} catch (err) {
  console.error(`Import failed: ${err.message}`)
}
```

### Type Definitions

```typescript
interface ImportResult {
  tournamentId: string
  tournamentName: string
  teamCount: number
  weighInCount: number
}

interface ImportValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}
```

## Export Service (`export-service.ts`)

### Public Functions

#### `prepareTournamentExport(tournamentId: string): Promise<string>`

Fetches tournament from database and formats as CSV.

**Input:** Tournament ID

**Output:** CSV string ready for download

**Process:**
1. Fetch tournament by ID
2. Fetch all teams for tournament
3. Fetch all weigh-ins for tournament
4. Call `formatForExport()` with fetched data
5. Return CSV string

**Error Handling:**
- Throw if tournament not found
- Return errors to caller (not silent failures)

**Example:**
```typescript
const csvContent = await prepareTournamentExport(tournamentId)
const blob = new Blob([csvContent], { type: 'text/csv' })
const url = URL.createObjectURL(blob)
// Download or share
```

#### `generateExportFilename(name: string, year: number): string`

Creates a download filename from tournament metadata.

**Input:** Tournament name and year

**Output:** Filename string (e.g., `hpa-annual-2024-2024-03-05.csv`)

**Rules:**
- Lowercase tournament name
- Replace spaces with hyphens
- Remove non-alphanumeric characters (except hyphens)
- Append year and ISO date
- `.csv` extension

**Example:**
```typescript
const filename = generateExportFilename('HPA Annual Tournament', 2024)
// filename === 'hpa-annual-tournament-2024-2024-03-05.csv'
```

## UI Component (`ImportExportManager.tsx`)

### Component Structure

Main component with two sub-components:
- `ImportTab`: File upload, parsing, validation, confirmation
- `ExportTab`: Tournament selector, download

### State Management

Uses React hooks for local state; integrates with Zustand stores for data operations.

**Import Tab State:**
- `importFile`: Currently selected file
- `parsedData`: Parsed CSV data (or null)
- `validationErrors`: Array of error messages
- `validationWarnings`: Array of warning messages
- `isImporting`: Loading state during import
- `importSuccess`: Success message (if import completed)

**Export Tab State:**
- `selectedTournamentId`: Currently selected tournament for export
- `isExporting`: Loading state during export
- `exportError`: Error message (if export failed)

### Event Flow

**Import:**
1. User selects file → `handleFileSelect()`
2. Read file → `file.text()`
3. Parse CSV → `parseCSV()`
4. Validate → `validateImportedData()`
5. Show errors/warnings or preview
6. User clicks "Confirm Import" → `handleImportConfirm()`
7. Import to DB → `importTournament()`
8. Reload stores → `loadTournaments()`, `loadTeams()`, `loadWeighIns()`
9. Show success message

**Export:**
1. User selects tournament
2. Clicks "Download CSV" → `handleExport()`
3. Fetch data → `prepareTournamentExport()`
4. Generate filename → `generateExportFilename()`
5. Create blob and trigger download

## Extension Points

### Custom Validators

To add business-logic validators without modifying `csv-parser.ts`:

```typescript
const { isValid, errors, warnings } = validateImportedData(data)

// Add custom validation
if (data.tournament.year < 2020) {
  errors.push('Tournament year must be 2020 or later')
}

if (!isValid) {
  throw new Error(errors.join('\n'))
}
```

### Custom Field Mapping

To support additional fields in future versions:

```typescript
// In parseCSV(), after extracting row values:
const custom = {
  ...parsed,
  customField: row.custom_field  // New column
}
```

### Different CSV Dialects

The parser currently assumes RFC 4180 with:
- Comma delimiter (not tab or semicolon)
- Double-quote escaping

To support other dialects, create wrapper functions:

```typescript
export function parseCSVTabDelimited(content: string) {
  const csv = content.replace(/\t/g, ',') // Convert tabs to commas
  return parseCSV(csv)
}
```

## Testing Strategy

See `tests/unit/csv-parser.test.ts` for comprehensive unit tests.

**Test Categories:**
- Valid CSV parsing (minimal, complete, with edge cases)
- Invalid CSV (missing sections, bad types, constraint violations)
- Validation (business logic, duplicate detection, warnings)
- Export formatting (escaping, precision, special characters)

**Coverage:**
- ✓ Happy path: minimal valid CSV
- ✓ Edge cases: quoted fields, blank lines, whitespace
- ✓ Error cases: type conversion, validation, constraints
- ✓ Round-trip: export → parse → validate ≈ import

## Performance Considerations

- **Parsing:** O(n) where n = file size; no re-parsing
- **Validation:** O(m) where m = number of records; single pass
- **Import:** O(m) database operations; could batch insert for large datasets
- **Export:** O(m) database queries + O(n) formatting; linear
- **File Size:** Tested up to 10,000 records; no known limits

## Security

- **No external dependencies:** CSV parsing is native JavaScript
- **Type-safe:** All inputs validated against types
- **No code injection:** User data is treated as data, not code
- **Local-only:** All processing happens in-browser; no network calls
- **Input validation:** All constraints enforced before DB write

## Backwards Compatibility

Current version: 1.0

**Future Compatibility:**
- Field additions: Mark as optional with default values
- Enum changes: Validate against known values, error on unknown
- Structure changes: Version field or date-based migration
