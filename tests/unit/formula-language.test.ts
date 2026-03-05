import { describe, it, expect } from 'vitest'
import {
  parseFormula,
  evaluateFormula,
  Lexer,
  Parser,
  Evaluator,
  TokenType
} from '@modules/custom-fields/formula-language'

// ============================================================================
// LEXER TESTS
// ============================================================================

describe('Lexer', () => {
  describe('Numbers', () => {
    it('tokenizes integers', () => {
      const lexer = new Lexer('42')
      const tokens = lexer.tokenize()
      expect(tokens[0].type).toBe(TokenType.NUMBER)
      expect(tokens[0].value).toBe(42)
    })

    it('tokenizes decimals', () => {
      const lexer = new Lexer('3.14159')
      const tokens = lexer.tokenize()
      expect(tokens[0].value).toBe(3.14159)
    })

    it('tokenizes zero', () => {
      const lexer = new Lexer('0')
      const tokens = lexer.tokenize()
      expect(tokens[0].value).toBe(0)
    })
  })

  describe('Strings', () => {
    it('tokenizes strings', () => {
      const lexer = new Lexer('"hello"')
      const tokens = lexer.tokenize()
      expect(tokens[0].type).toBe(TokenType.STRING)
      expect(tokens[0].value).toBe('hello')
    })

    it('handles escaped quotes', () => {
      const lexer = new Lexer('"say \\"hi\\""')
      const tokens = lexer.tokenize()
      expect(tokens[0].value).toBe('say "hi"')
    })
  })

  describe('Identifiers', () => {
    it('tokenizes identifiers', () => {
      const lexer = new Lexer('fish_count')
      const tokens = lexer.tokenize()
      expect(tokens[0].type).toBe(TokenType.IDENTIFIER)
      expect(tokens[0].value).toBe('fish_count')
    })

    it('allows underscores and numbers', () => {
      const lexer = new Lexer('day1_total _field x2')
      const tokens = lexer.tokenize()
      expect(tokens[0].value).toBe('day1_total')
      expect(tokens[1].value).toBe('_field')
      expect(tokens[2].value).toBe('x2')
    })
  })

  describe('Keywords', () => {
    it('tokenizes AND', () => {
      const lexer = new Lexer('AND')
      const tokens = lexer.tokenize()
      expect(tokens[0].type).toBe(TokenType.AND)
    })

    it('tokenizes OR', () => {
      const lexer = new Lexer('OR')
      const tokens = lexer.tokenize()
      expect(tokens[0].type).toBe(TokenType.OR)
    })

    it('tokenizes NOT', () => {
      const lexer = new Lexer('NOT')
      const tokens = lexer.tokenize()
      expect(tokens[0].type).toBe(TokenType.NOT)
    })

    it('case-insensitive keywords', () => {
      const lexer = new Lexer('and AND And')
      const tokens = lexer.tokenize()
      expect(tokens[0].type).toBe(TokenType.AND)
      expect(tokens[1].type).toBe(TokenType.AND)
      expect(tokens[2].type).toBe(TokenType.AND)
    })
  })

  describe('Operators', () => {
    it('tokenizes arithmetic operators', () => {
      const lexer = new Lexer('+ - * / % ^')
      const tokens = lexer.tokenize()
      expect(tokens[0].type).toBe(TokenType.PLUS)
      expect(tokens[1].type).toBe(TokenType.MINUS)
      expect(tokens[2].type).toBe(TokenType.MULTIPLY)
      expect(tokens[3].type).toBe(TokenType.DIVIDE)
      expect(tokens[4].type).toBe(TokenType.MODULO)
      expect(tokens[5].type).toBe(TokenType.POWER)
    })

    it('tokenizes comparison operators', () => {
      const lexer = new Lexer('== != < > <= >=')
      const tokens = lexer.tokenize()
      expect(tokens[0].type).toBe(TokenType.EQ)
      expect(tokens[1].type).toBe(TokenType.NEQ)
      expect(tokens[2].type).toBe(TokenType.LT)
      expect(tokens[3].type).toBe(TokenType.GT)
      expect(tokens[4].type).toBe(TokenType.LTE)
      expect(tokens[5].type).toBe(TokenType.GTE)
    })
  })

  describe('Whitespace', () => {
    it('skips whitespace', () => {
      const lexer = new Lexer('  5   +   3  ')
      const tokens = lexer.tokenize()
      expect(tokens).toHaveLength(4) // 5, +, 3, EOF
      expect(tokens[0].value).toBe(5)
      expect(tokens[2].value).toBe(3)
    })
  })
})

// ============================================================================
// PARSER TESTS
// ============================================================================

describe('Parser', () => {
  describe('Literals', () => {
    it('parses numbers', () => {
      const ast = parseFormula('42')
      expect(ast.type).toBe('LITERAL')
      expect((ast as any).value).toBe(42)
    })

    it('parses strings', () => {
      const ast = parseFormula('"hello"')
      expect(ast.type).toBe('LITERAL')
      expect((ast as any).value).toBe('hello')
    })
  })

  describe('Identifiers', () => {
    it('parses identifiers', () => {
      const ast = parseFormula('fish_count')
      expect(ast.type).toBe('IDENTIFIER')
      expect((ast as any).name).toBe('fish_count')
    })
  })

  describe('Arithmetic', () => {
    it('parses addition', () => {
      const ast = parseFormula('5 + 3')
      expect(ast.type).toBe('BINARY_OP')
      expect((ast as any).operator).toBe('+')
    })

    it('parses complex expression', () => {
      const ast = parseFormula('5 + 3 * 2')
      // Should be: 5 + (3 * 2), not (5 + 3) * 2
      expect(ast.type).toBe('BINARY_OP')
      expect((ast as any).operator).toBe('+')
      expect((ast as any).right.operator).toBe('*')
    })

    it('respects operator precedence', () => {
      const ast = parseFormula('2 + 3 * 4 ^ 5')
      // Right-most should be power
      let node: any = ast
      while (node.type === 'BINARY_OP') {
        if (node.operator === '^') {
          expect(true).toBe(true)
          return
        }
        node = node.right
      }
      expect(true).toBe(false) // Should find power operator
    })
  })

  describe('Functions', () => {
    it('parses function calls', () => {
      const ast = parseFormula('IF(rank == 1, 100, 50)')
      expect(ast.type).toBe('FUNCTION_CALL')
      expect((ast as any).name).toBe('IF')
      expect((ast as any).arguments).toHaveLength(3)
    })

    it('parses nested functions', () => {
      const ast = parseFormula('MAX(5, MIN(10, 15))')
      expect(ast.type).toBe('FUNCTION_CALL')
      expect((ast as any).name).toBe('MAX')
    })

    it('parses function with no arguments', () => {
      const ast = parseFormula('COUNT()')
      expect(ast.type).toBe('FUNCTION_CALL')
      expect((ast as any).arguments).toHaveLength(0)
    })
  })

  describe('Ternary', () => {
    it('parses ternary operator', () => {
      const ast = parseFormula('a ? b : c')
      expect(ast.type).toBe('TERNARY')
      expect((ast as any).condition.name).toBe('a')
    })

    it('parses nested ternary', () => {
      const ast = parseFormula('a ? b : c ? d : e')
      expect(ast.type).toBe('TERNARY')
    })
  })

  describe('Error handling', () => {
    it('throws on invalid syntax', () => {
      expect(() => parseFormula('5 +')).toThrow()
    })

    it('throws on mismatched parentheses', () => {
      expect(() => parseFormula('(5 + 3')).toThrow()
    })

    it('parses unary plus operator', () => {
      const ast = parseFormula('5 + + 3')
      expect(ast).toBeDefined()
      // Should evaluate to 8 (5 + (+3))
      const result = evaluateFormula('5 + + 3', {})
      expect(result.value).toBe(8)
    })
  })
})

// ============================================================================
// EVALUATOR TESTS
// ============================================================================

describe('Evaluator', () => {
  describe('Arithmetic', () => {
    it('evaluates addition', () => {
      const result = evaluateFormula('5 + 3', {})
      expect(result.value).toBe(8)
    })

    it('evaluates subtraction', () => {
      const result = evaluateFormula('10 - 3', {})
      expect(result.value).toBe(7)
    })

    it('evaluates multiplication', () => {
      const result = evaluateFormula('4 * 2.5', {})
      expect(result.value).toBe(10)
    })

    it('evaluates division', () => {
      const result = evaluateFormula('10 / 4', {})
      expect(result.value).toBe(2.5)
    })

    it('evaluates modulo', () => {
      const result = evaluateFormula('10 % 3', {})
      expect(result.value).toBe(1)
    })

    it('evaluates exponent', () => {
      const result = evaluateFormula('2 ^ 10', {})
      expect(result.value).toBe(1024)
    })

    it('throws on division by zero', () => {
      const result = evaluateFormula('10 / 0', {})
      expect(result.error).toBeDefined()
    })
  })

  describe('Field References', () => {
    it('evaluates field reference', () => {
      const result = evaluateFormula('fish_released * 0.25', {
        fish_released: 3
      })
      expect(result.value).toBe(0.75)
    })

    it('tracks dependencies', () => {
      const result = evaluateFormula('fish_released * 0.25', {
        fish_released: 3
      })
      expect(result.dependencies.has('fish_released')).toBe(true)
    })

    it('throws on unknown field', () => {
      const result = evaluateFormula('unknown_field * 2', {})
      expect(result.error).toBeDefined()
    })
  })

  describe('Comparisons', () => {
    it('evaluates equality', () => {
      const result = evaluateFormula('5 == 5', {})
      expect(result.value).toBe(true)
    })

    it('evaluates inequality', () => {
      const result = evaluateFormula('5 != 3', {})
      expect(result.value).toBe(true)
    })

    it('evaluates less than', () => {
      const result = evaluateFormula('3 < 5', {})
      expect(result.value).toBe(true)
    })

    it('evaluates greater than', () => {
      const result = evaluateFormula('5 > 3', {})
      expect(result.value).toBe(true)
    })

    it('evaluates less than or equal', () => {
      const result = evaluateFormula('5 <= 5', {})
      expect(result.value).toBe(true)
    })

    it('evaluates greater than or equal', () => {
      const result = evaluateFormula('5 >= 3', {})
      expect(result.value).toBe(true)
    })
  })

  describe('Logical Operators', () => {
    it('evaluates AND', () => {
      const result = evaluateFormula('true AND false', {})
      expect(result.value).toBe(false)
    })

    it('evaluates OR', () => {
      const result = evaluateFormula('true OR false', {})
      expect(result.value).toBe(true)
    })

    it('evaluates NOT', () => {
      const result = evaluateFormula('NOT true', {})
      expect(result.value).toBe(false)
    })

    it('short-circuits AND', () => {
      const result = evaluateFormula('false AND (1 / 0)', {})
      expect(result.value).toBe(false)
      expect(!result.error).toBe(true)
    })

    it('short-circuits OR', () => {
      const result = evaluateFormula('true OR (1 / 0)', {})
      expect(result.value).toBe(true)
      expect(!result.error).toBe(true)
    })
  })

  describe('Ternary Operator', () => {
    it('evaluates ternary with true condition', () => {
      const result = evaluateFormula('5 > 3 ? 100 : 50', {})
      expect(result.value).toBe(100)
    })

    it('evaluates ternary with false condition', () => {
      const result = evaluateFormula('3 > 5 ? 100 : 50', {})
      expect(result.value).toBe(50)
    })

    it('only evaluates taken branch', () => {
      const result = evaluateFormula('true ? 100 : (1 / 0)', {})
      expect(result.value).toBe(100)
      expect(!result.error).toBe(true)
    })
  })

  describe('Type Coercion', () => {
    it('coerces string to number in arithmetic', () => {
      const result = evaluateFormula('"5" + 3', {})
      expect(result.value).toBe('53') // String concatenation
    })

    it('coerces boolean to number', () => {
      const result = evaluateFormula('true + 5', {})
      expect(result.value).toBe(6) // true = 1
    })

    it('coerces null to zero', () => {
      const result = evaluateFormula('null + 5', {})
      expect(result.value).toBe(5)
    })
  })

  describe('Built-in Functions', () => {
    it('IF function', () => {
      const result = evaluateFormula('IF(1 == 1, 100, 50)', {})
      expect(result.value).toBe(100)
    })

    it('SUM function', () => {
      const result = evaluateFormula('SUM(5, 10, 15)', {})
      expect(result.value).toBe(30)
    })

    it('SUM ignores null', () => {
      const result = evaluateFormula('SUM(5, null, 10)', {})
      expect(result.value).toBe(15)
    })

    it('AVG function', () => {
      const result = evaluateFormula('AVG(10, 20, 30)', {})
      expect(result.value).toBe(20)
    })

    it('AVG ignores null', () => {
      const result = evaluateFormula('AVG(5, null, 10)', {})
      expect(result.value).toBe(7.5)
    })

    it('MAX function', () => {
      const result = evaluateFormula('MAX(5, 10, 3)', {})
      expect(result.value).toBe(10)
    })

    it('MIN function', () => {
      const result = evaluateFormula('MIN(5, 10, 3)', {})
      expect(result.value).toBe(3)
    })

    it('COUNT function', () => {
      const result = evaluateFormula('COUNT(5, null, 10, null, 3)', {})
      expect(result.value).toBe(3)
    })

    it('ROUND function', () => {
      const result = evaluateFormula('ROUND(3.14159, 2)', {})
      expect(result.value).toBe(3.14)
    })

    it('FLOOR function', () => {
      const result = evaluateFormula('FLOOR(3.9)', {})
      expect(result.value).toBe(3)
    })

    it('CEIL function', () => {
      const result = evaluateFormula('CEIL(3.1)', {})
      expect(result.value).toBe(4)
    })

    it('ABS function', () => {
      const result = evaluateFormula('ABS(-5)', {})
      expect(result.value).toBe(5)
    })

    it('STR function', () => {
      const result = evaluateFormula('STR(5)', {})
      expect(result.value).toBe('5')
    })

    it('NUM function', () => {
      const result = evaluateFormula('NUM("5")', {})
      expect(result.value).toBe(5)
    })
  })
})

// ============================================================================
// INTEGRATION TESTS (Real-world scenarios)
// ============================================================================

describe('Integration Tests', () => {
  it('Release bonus calculation', () => {
    const result = evaluateFormula('fish_released * 0.25', {
      fish_released: 3
    })
    expect(result.value).toBe(0.75)
  })

  it('Tiered release bonus', () => {
    const result = evaluateFormula(
      'IF(fish_released >= 3, fish_released * 0.35, fish_released * 0.20)',
      { fish_released: 4 }
    )
    expect(result.value).toBe(1.4)
  })

  it('Placement bonus', () => {
    const result = evaluateFormula(
      'IF(rank == 1, 100, IF(rank == 2, 75, IF(rank == 3, 50, 0)))',
      { rank: 3 }
    )
    expect(result.value).toBe(50)
  })

  it('Above-average bonus', () => {
    const result = evaluateFormula(
      'IF(grand_total > avg_weight, ROUND((grand_total - avg_weight) * 10, 2), 0)',
      { grand_total: 25.5, avg_weight: 18.75 }
    )
    expect(result.value).toBe(67.5)
  })

  it('Participation bonus', () => {
    const result = evaluateFormula('IF(COUNT(day1_total, day2_total) == 2, 10, 0)', {
      day1_total: 15.2,
      day2_total: 18.5
    })
    expect(result.value).toBe(10)
  })

  it('Improvement bonus', () => {
    const result = evaluateFormula(
      'IF(rank_change >= 20, 100, IF(rank_change >= 10, 50, IF(rank_change >= 5, 25, 0)))',
      { rank_change: 35 }
    )
    expect(result.value).toBe(100)
  })

  it('Undersized penalty', () => {
    const result = evaluateFormula('IF(big_fish < 8, -10, 0)', {
      big_fish: 7.5
    })
    expect(result.value).toBe(-10)
  })

  it('Day multiplier', () => {
    const result = evaluateFormula('IF(day == 2, day_total * 2, day_total)', {
      day: 2,
      day_total: 18.5
    })
    expect(result.value).toBe(37)
  })

  it('Complex nested logic', () => {
    const result = evaluateFormula(
      'IF(rank <= 3, 500 + (4 - rank) * 100, IF(rank <= 10, 200 + MAX(0, 10 - rank) * 20, IF(rank <= 25, 100 - (rank - 10), 0)))',
      { rank: 5 }
    )
    expect(result.value).toBe(300)
  })
})

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

describe('Error Handling', () => {
  it('handles division by zero', () => {
    const result = evaluateFormula('10 / 0', {})
    expect(result.error).toBeDefined()
    expect(result.error?.message).toContain('Division by zero')
  })

  it('handles unknown fields', () => {
    const result = evaluateFormula('unknown_field * 2', {})
    expect(result.error).toBeDefined()
    expect(result.error?.message).toContain('Unknown field')
  })

  it('handles invalid function arguments', () => {
    const result = evaluateFormula('IF(1, 2)', {})
    expect(result.error).toBeDefined()
  })

  it('handles type conversion errors', () => {
    const result = evaluateFormula('NUM("not a number")', {})
    expect(result.error).toBeDefined()
  })
})
