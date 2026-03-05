# TourneyCalc Formula Language - Technical Reference

## Overview

TourneyCalc is a safe, sandboxed formula language for evaluating custom tournament scoring rules. It's implemented as a complete Lexer → Parser → Evaluator pipeline in TypeScript with secure execution.

**Design Goals:**
- Safety: No code injection or arbitrary execution risks
- Type Safety: Full TypeScript strict mode compliance
- Portability: Pure JavaScript, runs everywhere
- Efficiency: Single-pass evaluation with dependency tracking
- User-Friendly: Clear error messages with positions

## Architecture

### Lexer (Tokenization)

Converts input string into tokens.

**Token Types:**
- Literals: `NUMBER`, `STRING`, `IDENTIFIER`
- Operators: `PLUS`, `MINUS`, `MULTIPLY`, `DIVIDE`, `MODULO`, `POWER`
- Comparisons: `EQ`, `NEQ`, `LT`, `GT`, `LTE`, `GTE`
- Logical: `AND`, `OR`, `NOT`
- Ternary: `QUESTION`, `COLON`
- Delimiters: `LPAREN`, `RPAREN`, `COMMA`
- Keywords: `true`, `false`, `null` (recognized as IDENTIFIERs, converted in parser)
- Special: `EOF`, `INVALID`

**Example:**
```
Input:  "fish_released * 0.25"
Tokens: [
  { type: IDENTIFIER, value: "fish_released" },
  { type: MULTIPLY, value: "*" },
  { type: NUMBER, value: 0.25 },
  { type: EOF, value: undefined }
]
```

### Parser (Syntax Analysis)

Converts tokens into an Abstract Syntax Tree (AST).

**Operator Precedence (lowest to highest):**
1. Ternary: `? :`
2. Logical OR: `||`
3. Logical AND: `&&`
4. Equality: `==`, `!=`
5. Comparison: `<`, `>`, `<=`, `>=`
6. Additive: `+`, `-`
7. Multiplicative: `*`, `/`, `%`
8. Exponent: `^` (right-associative)
9. Unary: `-`, `+`, `NOT`
10. Postfix: function calls, parentheses

### Evaluator (Execution)

Walks the AST and computes results with context values.

**Type System:**

Values can be: `number | boolean | string | null`

Type coercion rules:
- `number + number` → arithmetic addition
- `string + anything` → concatenation
- `boolean + number` → coerce bool to 0/1, then add
- `null + number` → null becomes 0
- Comparisons coerce to numeric if types differ

**Short-Circuit Evaluation:**
- `AND`: stops if left is false (doesn't evaluate right)
- `OR`: stops if left is true (doesn't evaluate right)
- `IF`: only evaluates taken branch

**Dependency Tracking:**

During evaluation, tracks which context fields were referenced for cache invalidation.

## Public API

### parseFormula(formula: string): ASTNode

Parses formula string into AST.

**Throws:** `ParseError` if syntax invalid

```typescript
const ast = parseFormula('rank == 1 ? 500 : 0')
// Returns AST, throws if invalid
```

### evaluateFormula(formula: string, context: Record<string, Value>): EvaluationResult

Parses and evaluates formula with given context.

**Returns:**
```typescript
interface EvaluationResult {
  value: Value              // Computed result
  error?: EvaluationError   // Error if evaluation failed
  dependencies: Set<string> // Fields referenced in formula
}
```

**Example:**
```typescript
const result = evaluateFormula(
  'fish_released * 0.25',
  { fish_released: 5 }
)

console.log(result.value)        // 1.25
console.log(result.error)        // undefined
console.log(result.dependencies) // Set { 'fish_released' }
```

### Built-in Functions

**Conditional:**
```typescript
IF(condition: boolean, trueVal: any, falseVal: any): any
```

**Aggregation:**
```typescript
SUM(...values: any[]): number       // Ignores null
AVG(...values: any[]): number | null // Ignores null, returns null if all null
MAX(...values: any[]): number | null
MIN(...values: any[]): number | null
COUNT(...values: any[]): number     // Counts non-null values
```

**Math:**
```typescript
ROUND(value: any, decimals?: number): number // Default 0 decimals
FLOOR(value: any): number
CEIL(value: any): number
ABS(value: any): number
```

**Type Conversion:**
```typescript
STR(value: any): string  // Converts to string
NUM(value: any): number  // Converts to number, throws if invalid
```

## Error Handling

### ParseError

Thrown during parsing (syntax errors).

```typescript
interface ParseError extends Error {
  type: 'PARSE_ERROR'
  message: string
  position: number      // Position in input string
  context: string       // Surrounding context
  suggestion?: string   // Helpful suggestion
}
```

### EvaluationError

Thrown during evaluation (runtime errors).

```typescript
interface EvaluationError extends Error {
  type: 'EVALUATION_ERROR'
  message: string
  formula: string
  causingValue?: any
}
```

**Common Errors:**
- Division by zero: `10 / 0`
- Unknown field: `unknown_field + 5`
- Type mismatch: `"text" - 5`
- Invalid function arguments: `SUM()` (requires args)

## Implementation Example

Using custom fields in your tournament app:

```typescript
import {
  evaluateFormula,
  createCustomField,
  computeAllFieldValues
} from '@modules/custom-fields'

// Create a custom field
const field = await createCustomField({
  tournamentId: 'tournament-123',
  name: 'Release Bonus',
  formula: 'fish_released * 0.25',
  fieldType: 'number',
  appliesTo: 'weigh-in',
  scope: 'both'
})

// Evaluate for a specific weigh-in
const context = {
  fish_count: 5,
  raw_weight: 15.20,
  fish_released: 2,
  big_fish: 4.50,
  day: 1,
  day_total: 15.60,
  avg_weight: 3.04,
  max_weight: 4.50,
  min_weight: 3.04
}

const result = evaluateFormula(field.formula, context)
console.log(result.value)        // 0.5 (2 * 0.25)
console.log(result.dependencies) // Set { 'fish_released' }

// Compute all fields for an entity
const fieldValues = await computeAllFieldValues(
  'tournament-123',
  'weigh-in-456',
  context
)

// fieldValues is a Map<customFieldId, ComputedFieldValue>
```

## Performance Considerations

- **Parsing**: O(n) single pass
- **Evaluation**: O(n) depth-first traversal of AST
- **Memory**: Minimal, no intermediate allocations
- **Caching**: Computed values cached, invalidated when dependencies change

For 1000+ fields in tournament, evaluation should complete in <100ms total.

## Security

**No Injection Risks:**
- Complete custom lexer/parser implementation
- All operations sandboxed within evaluator
- No access to global scope or external functions
- Type system prevents invalid operations

**Input Validation:**
- Formulas validated before storage
- Context values type-checked
- Invalid operations caught and reported

**Safe for User Input:**
```typescript
// User provides formula, completely safe
const userFormula = req.body.formula  // "fish_released * 0.25"
const result = evaluateFormula(userFormula, context)
// Formula executes in isolated sandbox
```

## Testing

Test file: `tests/unit/custom-fields.test.ts`

**Coverage:**
- 50+ formula language tests
- 100+ integration tests with real-world scenarios
- 20+ error handling tests
- Edge cases (null values, type coercion, short-circuit)

Run tests:
```bash
npm run test tests/unit/custom-fields.test.ts
```

## See Also

- [Custom Fields User Guide](./custom-fields.md)
- [Formula Library Documentation](./api.md)
