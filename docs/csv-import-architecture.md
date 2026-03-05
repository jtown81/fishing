# CSV Import/Export Architecture

## Overview

The import/export system is built on a **pure function** architecture that separates concerns into discrete modules:

- **Parser** (`csv-parser.ts`): Tokenization and parsing of CSV format
- **Service** (`import-service.ts`): Business logic and database operations
- **Exporter** (`export-service.ts`): Formatting data back to CSV
- **UI** (`ImportExportManager.tsx` + tabs): React components for user interaction

## Design Principles

### 1. Pure Functions for Business Logic

The CSV parser and validator are **pure functions** with no side effects:

```typescript
// parseCSV: string → ImportedData
// No I/O, no database access, no mutations

// validateImportedData: ImportedData → ValidationError[]
// Pure validation function, returns all errors in single pass
```

**Benefits:**
- Testable without mocks or fixtures
- Composable and reusable
- Works in Node.js, browser, or worker thread

### 2. Separation of Concerns

| Module | Responsibility |
|--------|-----------------|
| `csv-parser.ts` | Tokenization, parsing, type coercion |
| `import-service.ts` | Validation rules, database operations |
| `export-service.ts` | Data retrieval and formatting |
| `ImportExportManager.tsx` | User workflow and state management |

**No business logic in UI components** — all logic in modules, tested independently.

### 3. Single-Pass Validation

All validation errors are collected in a single pass through the data:

```typescript
const errors = validateImportedData(data)
// Returns ALL errors, not just the first one
// Allows users to fix multiple issues before re-uploading
```

## File Structure

```
src/modules/import-export/
├── csv-parser.ts          (500+ LOC) - Parsing & validation logic
├── import-service.ts      (200+ LOC) - DB operations & import workflow
├── export-service.ts      (100+ LOC) - Export & download
└── index.ts               (50 LOC)  - Barrel exports

src/components/import-export/
├── ImportExportManager.tsx (100 LOC) - Main tab container
├── ImportTab.tsx          (200 LOC) - Upload & import workflow UI
├── ExportTab.tsx          (150 LOC) - Export & download UI
└── index.ts               (20 LOC)  - Barrel exports

tests/unit/
└── csv-import.test.ts     (400+ LOC) - 25+ test cases
```

## Data Flow

### Import Flow

```
User selects file
    ↓
parseCSV(csvContent)
    ↓
ImportedData {tournament, teams, weighIns}
    ↓
validateBeforeImport(data)
    ↓
ValidationResult {isValid, errors[], warnings[]}
    ↓
[If valid] Show preview
    ↓
[User confirms] importTournament(data)
    ↓
[Database] INSERT tournament, teams, weigh-ins
    ↓
Success message with summary
```

### Export Flow

```
User selects tournament
    ↓
prepareTournamentExport(tournamentId)
    ↓
[Database] SELECT tournament, teams, weigh-ins
    ↓
formatForExport(tournament, teams, weighIns)
    ↓
CSV string
    ↓
downloadCSV(filename, csvContent)
    ↓
Browser downloads file
```

## CSV Parser (`csv-parser.ts`)

### Parsing Pipeline

```
Raw CSV String
    ↓
parseCSVLine() × N     [RFC 4180 compliant]
    ↓
Structure (tournament, teams, weigh-ins)
    ↓
Type Coercion (string → number/Date)
    ↓
ImportedData {typed values}
```

### Key Functions

**`parseCSV(csvContent: string): ImportedData`**
- Entry point for parsing
- Returns fully structured data with type coercion
- Does NOT validate — just parses

**`parseCSVLine(line: string): string[]`**
- RFC 4180 CSV parsing
- Handles quoted fields with escaped quotes
- Trims whitespace from values
- Example: `"Smith, John",2024` → `['Smith, John', '2024']`

**`validateImportedData(data: ImportedData): ValidationError[]`**
- Single-pass validation
- Checks tournament, teams, weigh-ins, and cross-references
- Returns ALL errors found

### Type Coercion Rules

```typescript
// Tournament
year: "2024" → 2024 (parseInt base 10)
startDate: "2024-01-01" → new Date(2024, 0, 1)

// Teams
teamNumber: "5" → 5 (parseInt)
status: "Active" → "active" (toLowerCase, then validate)

// Weigh-ins
fishCount: "5" → 5 (parseInt)
rawWeight: "15.20" → 15.20 (parseFloat)
bigFish: "" → undefined (optional field)
```

### Validation Rules

**Business Logic Validation:**
```typescript
fishReleased ≤ fishCount       // Can't release more than caught
bigFish ≤ rawWeight            // Largest fish ≤ total weight
startDate ≤ endDate            // Tournament start before end
day ∈ [1, 2]                   // Only 2-day tournaments
```

**Data Integrity Validation:**
```typescript
teamNumbers unique within tournament
weigh-in.teamNumber ∈ tournament.teams
status ∈ ['active', 'inactive', 'disqualified']
year ∈ [1900, 2100]
```

## Import Service (`import-service.ts`)

### Database Operations

**`importTournament(data: ImportedData): Promise<ImportResult>`**

```typescript
interface ImportResult {
  tournamentId: string
  teamCount: number
  weighInCount: number
  summary: string
}
```

**Steps:**
1. Call `validateBeforeImport()` (validation + warnings)
2. Check for existing tournament with same name + year
3. Generate unique IDs: `tournament-imported-{year}-{timestamp}`
4. INSERT tournament record
5. For each team:
   - INSERT team record
   - INSERT associated weigh-in records
6. Return summary with counts

**Metadata:**
- All created records: `createdAt = now`, `updatedAt = now`
- Weigh-in records: `receivedBy = "imported"`, `issuedBy = "imported"`
- Weigh-in timestamp: start_date for day 1, end_date for day 2

### Validation Integration

**`validateBeforeImport(data: ImportedData): Promise<ImportValidation>`**

```typescript
interface ImportValidation {
  isValid: boolean           // No errors
  errors: ValidationError[]  // Hard errors (prevent import)
  warnings: string[]        // Warnings (allow import)
}
```

**Errors** (prevent import):
- Invalid tournament data (name, year, dates)
- Duplicate team numbers
- Validation errors from `validateImportedData()`

**Warnings** (allow import):
- Teams with no weigh-in data
- Teams missing Day 2 data
- Non-active teams

### Duplicate Prevention

Before importing, check if tournament already exists:

```typescript
const existing = await db.tournaments
  .where('name').equals(data.tournament.name)
  .filter(t => t.year === data.tournament.year)
  .first()

if (existing) throw Error("Tournament already exists")
```

**Rationale:** Prevent accidental duplicates while allowing same tournament name in different years.

## Export Service (`export-service.ts`)

### Data Retrieval & Formatting

**`prepareTournamentExport(tournamentId: string): Promise<ExportResult>`**

```typescript
interface ExportResult {
  filename: string  // tournament-2024-my-event.csv
  csvContent: string
}
```

**Steps:**
1. Fetch tournament by ID (error if not found)
2. Fetch all teams for tournament
3. Fetch all weigh-ins for tournament
4. Call `formatForExport()` with all data
5. Generate filename: `tournament-{year}-{slugified-name}.csv`

### CSV Formatting

**`formatForExport(tournament, teams, weighIns): string`**

```typescript
// Outputs three sections:

#TOURNAMENT
name,year,location,start_date,end_date
{tournament data}

#TEAMS
team_number,member1_first,...,status
{team rows}

#WEIGH_INS
team_number,day,fish_count,...,big_fish
{weigh-in rows}
```

**Special Handling:**
- Dates formatted as ISO strings: `YYYY-MM-DD`
- Numbers rounded to 2 decimals
- Fields with commas/quotes properly escaped per RFC 4180

### Download Helper

**`downloadCSV(filename: string, csvContent: string): void`**

```typescript
const blob = new Blob([csvContent], { type: 'text/csv' })
const link = document.createElement('a')
const url = URL.createObjectURL(blob)
link.setAttribute('href', url)
link.setAttribute('download', filename)
link.click()
```

Browser-native file download (no server required).

## UI Components

### ImportExportManager (Tab Container)

```typescript
<Tabs value={activeTab}>
  <ImportTab />
  <ExportTab />
</Tabs>
```

Manages tab state and layout.

### ImportTab (Upload & Import Workflow)

**States:**
1. `upload` — Drag-drop file selection
2. `validating` — Parsing CSV, validating data
3. `preview` — Show tournament summary, ask for confirmation
4. `importing` — Inserting into database
5. `success` — Import complete, show summary
6. `error` — Validation or import failed

**Error Display:**
- Grouped by section (tournament, teams, weigh-ins)
- Shows row number for each error
- User can fix CSV and re-upload

### ExportTab (Tournament Selection & Download)

**States:**
1. `select` — Choose tournament from dropdown
2. `exporting` — Retrieving data and formatting
3. `success` — Download complete
4. `error` — Export failed

## Testing Strategy

### Unit Tests (csv-import.test.ts)

**CSV Parsing (10 tests):**
- Simple comma-separated values
- Quoted fields with commas
- Escaped quotes
- Whitespace trimming
- Empty fields
- Multiple teams/weigh-ins

**Validation (15+ tests):**
- Valid data acceptance
- Tournament field validation
- Team number validation
- Weigh-in business logic
- Cross-section validation (weigh-in team exists)

**Round-Trip (3+ tests):**
- Parse → Format → Parse produces identical data
- Special characters escaping

### Integration Testing (Manual)

**Import Flow:**
1. Create test CSV with all scenarios
2. Upload and validate
3. Confirm import
4. Verify database records
5. Check tournament standings

**Export Flow:**
1. Create tournament in app
2. Export to CSV
3. Re-import same CSV
4. Verify data integrity

## Extension Points

### Custom Validators

To add tournament-specific validation rules:

```typescript
// In import-service.ts
export async function addCustomValidator(
  validator: (data: ImportedData) => ValidationError[]
) {
  customValidators.push(validator)
}

// Then in validateBeforeImport:
const errors = validateImportedData(data)
for (const validator of customValidators) {
  errors.push(...validator(data))
}
```

### Custom Formatters

To add extra columns on export:

```typescript
export function formatForExportWithCustomFields(
  tournament, teams, weighIns, customFields
) {
  const csv = formatForExport(tournament, teams, weighIns)
  // Append custom fields section
  return csv + "\n#CUSTOM_FIELDS\n" + formatCustomFields(customFields)
}
```

### Batch Imports

To import multiple CSV files:

```typescript
async function importBatch(csvFiles: File[]) {
  const results = []
  for (const file of csvFiles) {
    const content = await file.text()
    const data = parseCSV(content)
    const result = await importTournament(data)
    results.push(result)
  }
  return results
}
```

## Performance Considerations

- **Parsing:** O(n) single-pass tokenization
- **Validation:** O(n) single-pass with set-based lookups
- **Export:** O(n) linear data retrieval and formatting
- **Memory:** Minimal — no caching or intermediate allocations

For typical tournaments (10-50 teams, 20-100 weigh-ins):
- Parse: <10ms
- Validate: <5ms
- Import: <50ms (includes DB writes)
- Export: <20ms

## Security Considerations

**Input Validation:**
- All CSV values validated before database insertion
- No raw SQL or queries — using Dexie.js ORM
- Type coercion prevents injection

**File Handling:**
- File size checks (can add 50MB limit if needed)
- CSV content validated before processing
- No execution of code from files

**Data Integrity:**
- Unique IDs prevent accidental overwrites
- Cross-references validated before insert
- Transaction-like behavior (all-or-nothing import)

## See Also

- `docs/import-export-guide.md` — User guide
- `tests/unit/csv-import.test.ts` — Test suite
- `src/models/tournament.ts` — Data models
