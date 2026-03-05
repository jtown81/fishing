# Custom Fields & Formula Language - User Guide

## Overview

Custom fields allow tournament organizers to define additional scoring rules specific to their tournament. You can create bonuses for releasing fish, penalties for exceeding weight limits, awards for placement, and more.

**Key Features:**
- Safe formula evaluation (no code injection risks)
- Pre-built templates for common scenarios
- Real-time formula validation
- Per-weigh-in and per-team calculations
- Day-specific or both-days scoping

## Getting Started

### Creating Your First Custom Field

1. **Navigate to Custom Fields**
   - Go to tournament settings or admin area
   - Find "Custom Fields" section

2. **Click "New Field"**
   - Fill in the field name (e.g., "Release Bonus")
   - Select field type: Number, Boolean, Text, or Currency
   - Choose scope: Day 1 Only, Day 2 Only, or Both Days
   - Select applies to: Weigh-In or Team

3. **Enter Formula**
   - Write a formula using available fields
   - Example: `fish_released * 0.25`
   - Click "Validate" to check syntax
   - Or use a template from "Use Template" button

4. **Save Field**
   - Click "Save Field"
   - Field is now active and will calculate for all applicable records

### Using Templates

Pre-built templates save time for common scenarios:

**Release Bonuses:**
- Fixed: `fish_released * bonus_per_fish`
- Tiered: Progressive bonuses based on number of released fish

**Awards:**
- Placement: Award based on rank (1st, 2nd, 3rd place, etc.)
- Improvement: Bonus for rank improvement between days
- Participation: Bonus for completing both days

**Scoring Multipliers:**
- Big Fish Multiplier: Scale weight based on largest fish size

**Penalties:**
- Weight Limit: Deduct for exceeding tournament limit

**Advanced:**
- Consistency: Reward teams with similar daily totals

## Formula Reference

### Available Fields by Scope

#### Weigh-In Fields (Per-weigh-in calculations)
- `fish_count` - Number of fish caught in this weigh-in
- `raw_weight` - Total weight in pounds
- `fish_released` - Number of fish released
- `big_fish` - Weight of largest single fish (null if none)
- `day` - Day number (1 or 2)
- `day_total` - Calculated total with release bonus
- `avg_weight` - Average weight per fish
- `max_weight` - Largest fish weight
- `min_weight` - Smallest fish weight

#### Team Fields (Per-team calculations)
- `day1_total` - Day 1 total weight with bonuses
- `day2_total` - Day 2 total weight with bonuses
- `grand_total` - Combined two-day total
- `total_fish` - Total fish caught across both days
- `total_released` - Total fish released across both days
- `big_fish_day1` - Largest fish from Day 1 (null if none)
- `big_fish_day2` - Largest fish from Day 2 (null if none)
- `rank` - Final tournament ranking
- `rank_change` - Rank improvement/decline (positive = improved)
- `avg_weight` - Average weight per fish across both days
- `max_weight` - Largest fish caught
- `status` - Team status (active, inactive, disqualified)

### Built-in Functions

**Conditional:**
- `IF(condition, true_value, false_value)` - If-then-else logic

**Aggregation:**
- `SUM(val1, val2, ...)` - Sum of values (ignores nulls)
- `AVG(val1, val2, ...)` - Average of values (ignores nulls)
- `MAX(val1, val2, ...)` - Maximum value
- `MIN(val1, val2, ...)` - Minimum value
- `COUNT(val1, val2, ...)` - Count of non-null values

**Math:**
- `ROUND(value, decimals)` - Round to decimal places
- `FLOOR(value)` - Round down
- `CEIL(value)` - Round up
- `ABS(value)` - Absolute value

**Type Conversion:**
- `STR(value)` - Convert to string
- `NUM(value)` - Convert to number

### Operators

**Arithmetic:**
- `+` addition
- `-` subtraction
- `*` multiplication
- `/` division
- `%` modulo (remainder)
- `^` power/exponent

**Comparison:**
- `==` equal to
- `!=` not equal to
- `<` less than
- `>` greater than
- `<=` less than or equal to
- `>=` greater than or equal to

**Logical:**
- `AND` logical AND (short-circuits)
- `OR` logical OR (short-circuits)
- `NOT` logical NOT

**Ternary:**
- `condition ? true_value : false_value`

### Literals

- **Numbers:** `5`, `3.14`, `0.25`
- **Strings:** `"text"` (use double quotes)
- **Booleans:** `true`, `false`
- **Null:** `null`

## Example Formulas

### Release Bonus (Fixed Amount)
```
fish_released * 0.25
```
Awards 0.25 lbs per fish released.

### Release Bonus (Tiered)
```
IF(fish_released >= 5, fish_released * 0.3, IF(fish_released >= 3, fish_released * 0.2, fish_released * 0.1))
```
- 0-2 fish: 0.1 lb per fish
- 3-4 fish: 0.2 lb per fish
- 5+ fish: 0.3 lb per fish

### Placement Awards
```
IF(rank == 1, 500, IF(rank == 2, 300, IF(rank == 3, 150, 0)))
```
Awards: 1st=$500, 2nd=$300, 3rd=$150, other=$0

### Rank Improvement Bonus
```
IF(rank_change > 0, rank_change * 10, 0)
```
Awards $10 per position improved from Day 1 to Day 2.

### Big Fish Multiplier
```
IF(big_fish == null, 0, IF(big_fish >= 5, big_fish * 1.25, IF(big_fish >= 3, big_fish * 1.1, big_fish)))
```
- Fish under 3 lbs: no bonus (1.0x)
- Fish 3-5 lbs: 1.1x multiplier
- Fish 5+ lbs: 1.25x multiplier

### Weight Penalty
```
IF(raw_weight > 50, (raw_weight - 50) * -1, 0)
```
Deducts 1 point per pound over 50 lb limit.

### Participation Bonus
```
IF(day1_total > 0 AND day2_total > 0, 50, 0)
```
Awards 50 points for fishing both days.

### Consistency Bonus
```
IF(ABS(day1_total - day2_total) <= 5, 100, 0)
```
Awards 100 points if daily totals differ by 5 lbs or less.

## Tips & Best Practices

1. **Test Before Activating**
   - Click "Validate" to check formula syntax
   - Preview template results if using templates
   - Test with sample data to ensure expected behavior

2. **Use Clear Names**
   - "Release Bonus" instead of "RB"
   - "Day 2 Participation Bonus" for scoped fields
   - Include value in currency fields: "Award ($)" or "Bonus ($)"

3. **Order Matters for Display**
   - Order fields to group related calculations
   - Place overall bonuses before day-specific ones

4. **Documentation**
   - Use the Description field to explain your bonus
   - Note any tournament-specific rules
   - Record parameter values (e.g., "0.25 bonus per released fish")

5. **Scope Considerations**
   - **Day 1 Only**: Encourages early participation
   - **Day 2 Only**: Rewards late comeback potential
   - **Both Days**: Applied whenever either day completes

6. **Type Selection**
   - **Number**: For weight bonuses, points, fish counts
   - **Currency**: For dollar amounts, prizes
   - **Boolean**: For yes/no awards (e.g., trophy eligible)
   - **Text**: For categorical awards (e.g., "Big Fish Winner")

## Common Errors & Solutions

### "Formula Error: Unknown field"
- Check field name spelling (case-sensitive)
- Make sure field is available in your scope (weigh-in vs team)
- Verify you're in correct day scope

**Example Error:**
```
Formula: fish_released * 0.25
Error: Unknown field: fish_released
```
**Solution:** You're in a Team field. Use team fields like `total_released` instead.

### "Division by zero"
- Use IF to check denominators
- Example: `IF(fish_count > 0, raw_weight / fish_count, 0)`

### "Formula returns wrong value"
- Check operator precedence (^ > * / % > + - > == != < > <= >= > AND > OR)
- Use parentheses to clarify: `(fish_released * 0.25) + 5`
- Verify field values in preview

### "Unexpected type error"
- Check if you're mixing incompatible types
- Strings can't be subtracted: `"text" - 5` is invalid
- Use `NUM()` to convert strings to numbers

## Troubleshooting

**Fields not calculating?**
1. Verify formula validates without errors
2. Check field scope matches data (day1 field won't calculate on day2-only tournaments)
3. Ensure weigh-in/team selection matches your intent
4. Refresh the page to see updated values

**Formula works in preview but not in standings?**
1. Preview uses example values; verify with actual tournament data
2. Check if fields are Day 1 vs Day 2 specific
3. Ensure field is saved (not just edited)

**Performance issues with many fields?**
1. Fields compute on-demand (only when viewed)
2. Simplify complex nested IFs if possible
3. Contact support if performance is still slow

## See Also

- [Formula Language Specification](./formula-language.md) - Complete technical reference
- [API Documentation](./api.md) - Developer integration guide
