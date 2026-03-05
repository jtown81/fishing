# CSV Import/Export Guide

## Overview

The Fishing Tournament App supports importing and exporting tournament data using CSV (Comma-Separated Values) files. This allows you to:

- **Import** historical tournament data from spreadsheets or other systems
- **Export** tournament data for backup, sharing, or external analysis
- **Edit** tournament data in Excel, Google Sheets, or any text editor

## CSV File Format

Tournament data is organized into three sections, each with a header line starting with `#`:

### File Structure

```
#TOURNAMENT
[tournament metadata]

#TEAMS
[team roster]

#WEIGH_INS
[catch data for both days]
```

### Section 1: TOURNAMENT

Contains metadata about the tournament.

**Header Line:** `#TOURNAMENT`

**Columns:**
| Column | Type | Example | Required | Notes |
|--------|------|---------|----------|-------|
| `name` | Text | "HPA Annual Tournament" | Yes | Tournament display name |
| `year` | Number | 2024 | Yes | Competition year |
| `location` | Text | "Lake XYZ" | Yes | Tournament location |
| `start_date` | Date | 2024-06-01 | Yes | Format: YYYY-MM-DD |
| `end_date` | Date | 2024-06-02 | Yes | Format: YYYY-MM-DD |

**Rules:**
- Exactly **one tournament record** per CSV file
- Dates must be in ISO format: `YYYY-MM-DD`
- `start_date` must be before or equal to `end_date`

**Example:**
```csv
#TOURNAMENT
name,year,location,start_date,end_date
HPA Annual Tournament,2024,Lake XYZ,2024-06-01,2024-06-02
```

### Section 2: TEAMS

Lists all teams that participated in the tournament.

**Header Line:** `#TEAMS`

**Columns:**
| Column | Type | Example | Required | Notes |
|--------|------|---------|----------|-------|
| `team_number` | Number | 1 | Yes | Unique within tournament (1-80+) |
| `member1_first` | Text | "Brandon" | Yes | First name of member 1 |
| `member1_last` | Text | "Seitz" | Yes | Last name of member 1 |
| `member2_first` | Text | "Rob" | Yes | First name of member 2 |
| `member2_last` | Text | "Crandall" | Yes | Last name of member 2 |
| `status` | Enum | "active" | Yes | One of: `active`, `inactive`, `disqualified` |

**Rules:**
- Minimum **one team** required
- `team_number` must be unique and positive (no duplicates)
- Team numbers do **not** need to be consecutive
- All member names are required (no empty fields)
- Status is case-insensitive (normalized to lowercase internally)

**Example:**
```csv
#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,Brandon,Seitz,Rob,Crandall,active
2,John,Doe,Jane,Smith,active
3,Matt,James,Chad,Porsch,inactive
```

### Section 3: WEIGH_INS

Records fish catches for each day of the tournament.

**Header Line:** `#WEIGH_INS`

**Columns:**
| Column | Type | Example | Required | Notes |
|--------|------|---------|----------|-------|
| `team_number` | Number | 1 | Yes | Must reference a team from TEAMS section |
| `day` | Number | 1 | Yes | Day 1 or Day 2 (must be 1 or 2) |
| `fish_count` | Number | 5 | Yes | Number of fish caught |
| `raw_weight` | Decimal | 15.20 | Yes | Total weight in pounds (max 2 decimals) |
| `fish_released` | Number | 2 | Yes | Number of fish released back to water |
| `big_fish` | Decimal | 4.50 | Optional | Weight of largest single fish (omit if none recorded) |

**Rules:**
- Each team may have **0, 1, or 2 weigh-in records** (one per day maximum)
- `day` value must be `1` or `2` only
- `fish_count` ≥ 0
- `raw_weight` ≥ 0, with maximum 2 decimal places
- `fish_released` ≤ `fish_count` (cannot release more than caught)
- `big_fish` is **optional**; if provided, must be ≤ `raw_weight`
- Team numbers in weigh-ins must exist in the TEAMS section
- No duplicate entries (same team_number + day)

**Example:**
```csv
#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,5,15.20,2,4.50
1,2,4,12.80,3,4.20
2,1,6,18.00,1,5.25
2,2,5,16.50,2,5.10
3,1,4,13.24,2,4.80
3,2,3,10.50,1,3.90
```

## Minimal Valid CSV

The simplest valid import file with one team and one day of weigh-ins:

```csv
#TOURNAMENT
name,year,location,start_date,end_date
Test Tournament,2024,Anywhere,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,0,0,0,
```

## Advanced Features

### Quoted Fields (with commas or special characters)

If a field contains a comma or newline, enclose it in double quotes:

```csv
"Tournament, Inc.",2024,"Lake, State",2024-01-01,2024-01-02
"Doe, Jr.","Smith, III"
```

### Optional Day 2 Weigh-Ins

Teams that didn't fish Day 2 (DNF) can be marked with `inactive` status and have no Day 2 weigh-in:

```csv
#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,active
2,Bob,Jones,Alice,Brown,inactive

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,5,15.20,1,4.50
1,2,4,12.80,2,4.20
2,1,6,18.00,1,5.25
```

Team 2 has DNF (inactive) status and only a Day 1 weigh-in — this is valid.

### Missing Big Fish Data

If big fish weight was not recorded, leave the field empty:

```csv
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,5,15.00,2,
2,1,3,10.50,1,4.25
```

## How to Import

### Step 1: Prepare Your CSV File

- Create a CSV file in Excel, Google Sheets, or a text editor
- Follow the format specification above
- Save as `.csv` format

### Step 2: Upload to the App

1. Navigate to **Import / Export** in the sidebar
2. Click **Select CSV File** or drag-and-drop a CSV file
3. The app will automatically parse and validate the file

### Step 3: Review & Confirm

If the file is valid:
- Preview shows tournament name, year, location
- Summary displays team count and weigh-in count
- Click **Confirm Import** to save to the database

If errors appear:
- Review the error messages (e.g., "fish_released cannot exceed fish_count")
- Fix the CSV file and re-upload
- Common issues are listed below

## How to Export

### Export an Existing Tournament

1. Navigate to **Import / Export** in the sidebar
2. Select the **Export** tab
3. Choose a tournament from the dropdown
4. Click **Download CSV**
5. The CSV file will be saved to your downloads folder

The exported CSV contains all tournament data and can be:
- Edited and re-imported
- Shared with other users
- Archived for historical records
- Converted to other formats

## Troubleshooting

### Common Validation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `year must be a number` | Year column contains text | Ensure year is numeric, e.g., `2024` not `"2024"` |
| `start_date must be in YYYY-MM-DD format` | Date format incorrect | Use ISO format: `2024-01-15` (not `1/15/2024` or `01-15-24`) |
| `team_number must be a positive integer` | Team number is 0, negative, or text | Team numbers must be positive integers: 1, 2, 3, etc. |
| `Duplicate team_number: 5` | Same team number used twice | Ensure each team has a unique number |
| `fish_released cannot exceed fish_count` | Released more fish than caught | `fish_released` must be ≤ `fish_count` |
| `big_fish cannot exceed raw_weight` | Big fish weight > total weight | Single fish cannot weigh more than total catch |
| `Weigh-in references non-existent team_number: 10` | Weigh-in team number doesn't exist in TEAMS section | Add team 10 to the TEAMS section, or fix the weigh-in |

### Excel Tips

**Preserve CSV Format:**
- Save as "CSV (Comma delimited)" not "Excel Workbook (.xlsx)"
- On Mac: File → Save As → Format: **CSV (Comma delimited)**
- On Windows: File → Save As → Save as type: **CSV (Comma delimited)**

**Avoid Date Auto-Conversion:**
- Excel may convert `2024-01-01` to a different format
- To prevent this, format the date column as **Text** before entering dates
- Or prefix dates with an apostrophe: `'2024-01-01` (apostrophe won't be saved)

**Copy/Paste from Spreadsheet:**
- Can copy data from an Excel spreadsheet and paste into a text editor
- Ensure the structure matches the CSV format (headers and three sections)

### Large Files

For tournaments with 100+ teams, the import may take a few seconds. The app will show a progress indicator.

## Data Integrity

When you import a CSV:

1. **No automatic conversion** — Data is imported exactly as-is
2. **Validation required** — All constraints (numeric ranges, date formats, etc.) are checked before import
3. **All-or-nothing** — If any record fails validation, the entire import is rejected
4. **Metadata set to "imported"** — Weigh-in records get `received_by = "imported"` and `issued_by = "imported"` (can be edited afterward)

## FAQ

**Q: Can I import data from an Excel file directly?**
A: No, but you can export your Excel data as CSV using File → Save As → CSV format, then import it.

**Q: Can I import data from other tournament management systems?**
A: Yes, if they support CSV export. You may need to reorganize columns to match the format.

**Q: What happens if I import data to an existing tournament name/year?**
A: The app prevents duplicate tournament entries. Use a different year or name for new imports.

**Q: Can I edit the CSV after export, then re-import?**
A: Yes! Export, edit, and re-import with a different tournament name/year.

**Q: Are there file size limits?**
A: No hard limit, but very large files (10,000+ rows) may take longer to process.

**Q: Can I import historical data from multiple years?**
A: Yes, one tournament per CSV file. Run separate imports for each year.

## Technical Details

- **Format:** RFC 4180 CSV (standard)
- **Encoding:** UTF-8
- **Line endings:** LF or CRLF (both supported)
- **Decimal separator:** Period (`.`) for weights
- **Date format:** ISO 8601 (YYYY-MM-DD)
- **Quote character:** Double quote (`"`)
- **Escape method:** Double quote for quotes in fields (`""`)

## Support

If you encounter issues:

1. Check the **Validation Errors** panel for specific problems
2. Review the **CSV Format** section above
3. Verify your file follows the exact structure (section headers, column names, data types)
4. Try with the minimal valid example and build up gradually
