# Import/Export Guide

## Overview

The Fishing Tournament Manager supports importing tournament data from CSV files and exporting existing tournaments to CSV format. This makes it easy to:

- Migrate data from other systems
- Back up tournament data
- Share tournaments with others
- Edit tournament data in Excel or any spreadsheet application

## CSV Format

All import/export files use a simple three-section CSV format that works with Excel, Google Sheets, and any text editor.

### File Structure

A CSV import file contains three sections, identified by section headers (lines starting with `#`):

```
#TOURNAMENT
name,year,location,start_date,end_date
HPA Annual Tournament,2024,Lake XYZ,2024-06-01,2024-06-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,Brandon,Seitz,Rob,Crandall,active
2,John,Doe,Jane,Smith,active
3,Matt,James,Chad,Porsch,inactive

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,5,15.20,2,4.50
1,2,4,12.80,3,4.20
2,1,6,18.00,1,5.25
2,2,5,16.50,2,5.10
3,1,0,0,0,
```

### Section 1: TOURNAMENT

**Header line:** `#TOURNAMENT`

**Required columns:**
| Column | Type | Format | Example |
|--------|------|--------|---------|
| `name` | text | Tournament display name | "HPA Annual Tournament" |
| `year` | number | Competition year | 2024 |
| `location` | text | Tournament location | "Lake XYZ" |
| `start_date` | date | YYYY-MM-DD format | 2024-06-01 |
| `end_date` | date | YYYY-MM-DD format | 2024-06-02 |

**Rules:**
- Exactly one tournament per CSV file
- Start date must be before or equal to end date
- Year must be between 1900 and 2100

### Section 2: TEAMS

**Header line:** `#TEAMS`

**Required columns:**
| Column | Type | Format | Example |
|--------|------|--------|---------|
| `team_number` | number | Unique team ID (1-80+) | 1 |
| `member1_first` | text | First name of member 1 | "Brandon" |
| `member1_last` | text | Last name of member 1 | "Seitz" |
| `member2_first` | text | First name of member 2 | "Rob" |
| `member2_last` | text | Last name of member 2 | "Crandall" |
| `status` | enum | active, inactive, or disqualified | "active" |

**Rules:**
- Minimum 1 team required
- Team numbers must be unique and positive (no duplicates, no zeros)
- Member names required (cannot be empty)
- Status is case-insensitive (automatically normalized to lowercase)

### Section 3: WEIGH_INS

**Header line:** `#WEIGH_INS`

**Columns:**
| Column | Type | Format | Required | Example |
|--------|------|--------|----------|---------|
| `team_number` | number | Team ID from TEAMS section | Yes | 1 |
| `day` | number | 1 or 2 only | Yes | 1 |
| `fish_count` | number | Number of fish caught (≥0) | Yes | 5 |
| `raw_weight` | number | Total weight in pounds (2 decimals) | Yes | 15.20 |
| `fish_released` | number | Fish released (≤ fish_count) | Yes | 2 |
| `big_fish` | number | Largest single fish weight | Optional | 4.50 |

**Rules:**
- Each team can have 0, 1, or 2 weigh-in records (one per day)
- Day must be 1 or 2
- Fish count, weight, and released must be non-negative
- Fish released cannot exceed fish count
- Big fish weight cannot exceed total raw weight
- If team has no weigh-ins, that's okay (team marked as DNF)
- If team missing Day 2 data, Day 2 is treated as no-show
- Team numbers in weigh-ins must exist in TEAMS section

## Importing Tournament Data

### Step-by-Step Import Process

1. **Prepare CSV File**
   - Create or download a CSV file in the format above
   - Double-check for errors (especially dates, team numbers, fish released)

2. **Open Import Tab**
   - Click "Import / Export" in the sidebar
   - Click the "Import Tournament" tab

3. **Select File**
   - Drag and drop your CSV file into the upload area, OR
   - Click "Choose File" and select your CSV

4. **Review & Validate**
   - The app parses and validates your data
   - If errors found, they're displayed with explanations
   - Fix the CSV and upload again
   - Warnings (non-fatal issues) allow you to proceed

5. **Confirm Import**
   - Review tournament name, year, team count
   - Click "Confirm & Import"
   - Tournament is added to your list

### Common Errors & Fixes

**"Tournament year must be between 1900 and 2100"**
- Check the year column - it should be a 4-digit number (2024, not 24)

**"fish_released cannot exceed fish_count"**
- You have more fish released than caught (impossible!)
- Check row: fish_count value might be wrong

**"big_fish cannot exceed raw_weight"**
- The largest single fish weighs more than the total catch
- Check the big_fish and raw_weight values

**"Duplicate team number"**
- You have two teams with the same number
- Team numbers must be unique within the tournament

**"Team X not found in teams list"**
- A weigh-in references a team that doesn't exist in the TEAMS section
- Check the team_number in both sections

**"Weigh-in for team X Day 1 has 0 fish but team status is active"**
- Active teams should have at least some data
- Either add weigh-in data or change team status to "inactive" or "dnf"

## Exporting Tournament Data

### Step-by-Step Export Process

1. **Open Export Tab**
   - Click "Import / Export" in the sidebar
   - Click the "Export Tournament" tab

2. **Select Tournament**
   - Choose the tournament from the dropdown list
   - Preview shows tournament name, location, and date range

3. **Download CSV**
   - Click "Download CSV"
   - File downloads automatically to your computer
   - Filename format: `tournament-{year}-{name-slugified}.csv`

### Using Exported Files

**Edit in Excel:**
1. Open the CSV in Excel
2. Make edits (team names, weigh-in data, etc.)
3. Save as CSV (File → Save As → CSV UTF-8)
4. Import back into the app

**Share with Others:**
1. Email the CSV file
2. Other users can import it into their own tournament manager
3. CSV format is human-readable and editable

**Backup:**
1. Export all tournaments regularly
2. Store CSV files in cloud storage or external drive
3. Re-import if data is ever lost

## Tips & Tricks

### Excel Tips

**Prevent Leading Zeros from Being Removed:**
- If you create a CSV in Excel, numbers like "01" might become "1"
- Solution: After opening in Excel, right-click column → Format Cells → Text
- Or add a leading apostrophe: `'01`

**Keep Dates Formatted Correctly:**
- Excel might auto-format dates (Jan 1, 2024 instead of 2024-01-01)
- Solution: Format column as Text before editing dates

**Adding New Teams:**
1. Open exported CSV in Excel
2. Add new rows in TEAMS section
3. Update team_number to be unique
4. Save as CSV
5. Import into app

### Handling Missing Data

**Teams with No Weigh-Ins:**
- Leave WEIGH_INS section empty for that team
- Team will be imported but have no day totals
- Mark status as "inactive" or "dnf"

**Teams Missing Day 2:**
- Add only Day 1 weigh-in for that team
- Day 2 will be treated as no-show (zero weight)
- Team will have standings based on Day 1 only

**Partial Fish Data:**
- If you don't have big_fish recorded, leave that column blank
- App will calculate based on raw_weight only

## Data Validation

The app validates your CSV data thoroughly:

**Hard Errors (prevents import):**
- Missing required fields
- Invalid data types (text in number field)
- Business logic violations (fish_released > fish_count)
- Duplicate team numbers
- Invalid dates

**Warnings (allow import with caution):**
- Teams with no weigh-in data
- Teams missing Day 2 data
- Non-active teams

## FAQ

**Q: Can I have team numbers that skip? (1, 3, 5 instead of 1, 2, 3)**
- Yes, team numbers can be any unique positive number. Skipping is fine.

**Q: What if I don't have big_fish data?**
- Leave the big_fish column empty for that row. Calculations will work without it.

**Q: Can I edit the CSV after importing?**
- Yes, you can modify the app data directly in the UI after import.

**Q: How do I import historical data from last year?**
- Export last year's tournament from the old system as CSV
- Upload to the new app via Import
- The app validates and integrates the data

**Q: Can I import multiple tournaments at once?**
- No, import one CSV file = one tournament
- To import multiple, repeat the process for each file

**Q: What if my CSV has extra columns?**
- Extra columns are ignored
- Only the required columns are used

**Q: Can I import without a Day 2?**
- Yes, just leave Day 2 weigh-ins out of the CSV
- Tournament will have only Day 1 standings

## Data Portability

Your data is stored locally in your browser's storage. The CSV export feature ensures you can always:

1. **Extract your data** at any time without vendor lock-in
2. **Port to another system** by importing the CSV elsewhere
3. **Keep backups** of all tournaments in a standard format

All tournament data (teams, members, weigh-ins) can be exported and re-imported without loss.
