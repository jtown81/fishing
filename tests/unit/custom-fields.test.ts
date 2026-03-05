/**
 * Custom Fields Service Tests
 * Tests for formula evaluation, field management, and caching
 */

import { describe, it, expect } from 'vitest'
import { evaluateFormula } from '@modules/custom-fields'
import { formulaLibrary, DefaultTemplates } from '@modules/custom-fields'

// ============================================================================
// FORMULA EVALUATION TESTS
// ============================================================================

describe('Formula Language - Real World Scenarios', () => {
  describe('Release Bonus Calculations', () => {
    it('calculates fixed release bonus', () => {
      const result = evaluateFormula('fish_released * 0.25', {
        fish_released: 5
      })
      expect(result.value).toBe(1.25)
    })

    it('calculates tiered release bonus', () => {
      // 0-2 fish: 0.1 per fish; 3-4 fish: 0.2 per fish; 5+ fish: 0.3 per fish
      const formula = 'IF(fish_released >= 5, fish_released * 0.3, IF(fish_released >= 3, fish_released * 0.2, fish_released * 0.1))'

      const result1 = evaluateFormula(formula, { fish_released: 2 })
      expect(result1.value).toBe(0.2)

      const result2 = evaluateFormula(formula, { fish_released: 4 })
      expect(result2.value).toBe(0.8)

      const result3 = evaluateFormula(formula, { fish_released: 5 })
      expect(result3.value).toBe(1.5)
    })
  })

  describe('Placement Awards', () => {
    it('awards based on rank', () => {
      const formula = 'IF(rank == 1, 500, IF(rank == 2, 300, IF(rank == 3, 150, 0)))'

      expect(evaluateFormula(formula, { rank: 1 }).value).toBe(500)
      expect(evaluateFormula(formula, { rank: 2 }).value).toBe(300)
      expect(evaluateFormula(formula, { rank: 3 }).value).toBe(150)
      expect(evaluateFormula(formula, { rank: 10 }).value).toBe(0)
    })
  })

  describe('Improvement Bonuses', () => {
    it('rewards rank improvement', () => {
      const formula = 'IF(rank_change > 0, rank_change * 10, 0)'

      expect(evaluateFormula(formula, { rank_change: 5 }).value).toBe(50)
      expect(evaluateFormula(formula, { rank_change: 0 }).value).toBe(0)
      expect(evaluateFormula(formula, { rank_change: -3 }).value).toBe(0)
    })
  })

  describe('Big Fish Multipliers', () => {
    it('scales weight by fish size', () => {
      const formula = 'IF(big_fish == null, 0, IF(big_fish >= 5, big_fish * 1.25, IF(big_fish >= 3, big_fish * 1.1, big_fish * 1.0)))'

      expect(evaluateFormula(formula, { big_fish: 2 }).value).toBe(2)
      expect(evaluateFormula(formula, { big_fish: 4 }).value).toBe(4.4)
      expect(evaluateFormula(formula, { big_fish: 6 }).value).toBe(7.5)
      expect(evaluateFormula(formula, { big_fish: null }).value).toBe(0)
    })
  })

  describe('Penalties', () => {
    it('deducts for exceeding weight limit', () => {
      const formula = 'IF(raw_weight > 50, (raw_weight - 50) * -1, 0)'

      expect(evaluateFormula(formula, { raw_weight: 45 }).value).toBe(0)
      expect(evaluateFormula(formula, { raw_weight: 55 }).value).toBe(-5)
      expect(evaluateFormula(formula, { raw_weight: 60 }).value).toBe(-10)
    })
  })

  describe('Participation Bonuses', () => {
    it('awards for completing both days', () => {
      const formula = 'IF(day1_total > 0 AND day2_total > 0, 25, 0)'

      expect(evaluateFormula(formula, { day1_total: 10, day2_total: 15 }).value).toBe(25)
      expect(evaluateFormula(formula, { day1_total: 0, day2_total: 15 }).value).toBe(0)
      expect(evaluateFormula(formula, { day1_total: 10, day2_total: 0 }).value).toBe(0)
    })
  })

  describe('Consistency Bonuses', () => {
    it('rewards similar daily totals', () => {
      const formula = 'IF(ABS(day1_total - day2_total) <= 5, 50, 0)'

      expect(evaluateFormula(formula, { day1_total: 10, day2_total: 12 }).value).toBe(50)
      expect(evaluateFormula(formula, { day1_total: 10, day2_total: 15 }).value).toBe(50)
      expect(evaluateFormula(formula, { day1_total: 10, day2_total: 16 }).value).toBe(0)
    })
  })
})

// ============================================================================
// FORMULA LIBRARY TESTS
// ============================================================================

describe('Formula Library', () => {
  describe('Template Management', () => {
    it('retrieves built-in templates', () => {
      const template = formulaLibrary.getTemplate('release-bonus-fixed')
      expect(template).toBeDefined()
      expect(template?.name).toBe('Fixed Release Bonus')
      expect(template?.fieldType).toBe('number')
    })

    it('gets templates by category', () => {
      const bonuses = formulaLibrary.getTemplatesByCategory('bonus')
      expect(bonuses.length).toBeGreaterThan(0)
      expect(bonuses.every(t => t.category === 'bonus')).toBe(true)
    })

    it('returns all templates', () => {
      const all = formulaLibrary.getAllTemplates()
      expect(all.length).toBeGreaterThanOrEqual(8)
    })
  })

  describe('Template Application', () => {
    it('applies template with parameters', () => {
      const result = formulaLibrary.applyTemplate('release-bonus-fixed', {
        bonus_per_fish: 0.3
      })
      expect(result.formula).toContain('0.3')
      expect(result.error).toBeUndefined()
    })

    it('reports missing parameters', () => {
      const result = formulaLibrary.applyTemplate('release-bonus-fixed', {})
      expect(result.error).toBeDefined()
      expect(result.error).toContain('Missing parameters')
    })
  })

  describe('Parameter Validation', () => {
    it('validates required parameters', () => {
      const validation = formulaLibrary.validateParameters('placement-bonus', {
        first_place: 500,
        second_place: 300,
        third_place: 150
      })
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('rejects missing required parameters', () => {
      const validation = formulaLibrary.validateParameters('placement-bonus', {
        first_place: 500
      })
      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    it('validates parameter types', () => {
      const validation = formulaLibrary.validateParameters('placement-bonus', {
        first_place: 'not a number',
        second_place: 300,
        third_place: 150
      })
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.includes('type'))).toBe(true)
    })
  })

  describe('Template Previews', () => {
    it('previews template with parameters and context', () => {
      const result = formulaLibrary.previewTemplate(
        'release-bonus-fixed',
        { bonus_per_fish: 0.25 },
        { fish_released: 5 }
      )
      expect(result.error).toBeUndefined()
      expect(result.result).toBe(1.25)
    })

    it('reports errors in preview', () => {
      const result = formulaLibrary.previewTemplate(
        'placement-bonus',
        {}, // Missing parameters
        { rank: 1 }
      )
      expect(result.error).toBeDefined()
    })
  })
})

// ============================================================================
// DEPENDENCY TRACKING TESTS
// ============================================================================

describe('Formula Dependency Tracking', () => {
  it('tracks field dependencies', () => {
    const result = evaluateFormula('fish_released * 0.25 + raw_weight', {
      fish_released: 5,
      raw_weight: 20
    })

    expect(result.dependencies.has('fish_released')).toBe(true)
    expect(result.dependencies.has('raw_weight')).toBe(true)
  })

  it('ignores non-field identifiers', () => {
    const result = evaluateFormula('5 + 10', {})
    expect(result.dependencies.size).toBe(0)
  })

  it('tracks dependencies in nested functions', () => {
    const result = evaluateFormula('IF(rank == 1, grand_total * 1.5, grand_total)', {
      rank: 1,
      grand_total: 100
    })

    expect(result.dependencies.has('rank')).toBe(true)
    expect(result.dependencies.has('grand_total')).toBe(true)
  })
})

// ============================================================================
// EDGE CASES & ERROR HANDLING
// ============================================================================

describe('Edge Cases', () => {
  it('handles null values in calculations', () => {
    const result = evaluateFormula('IF(big_fish == null, 0, big_fish * 2)', {
      big_fish: null
    })
    expect(result.value).toBe(0)
  })

  it('handles division by zero in functions', () => {
    const result = evaluateFormula('AVG(0, 0, 0)', {})
    expect(result.value).toBe(0)
  })

  it('short-circuits to prevent errors', () => {
    const result = evaluateFormula('false AND (1 / 0)', {})
    expect(result.error).toBeUndefined()
    expect(result.value).toBe(false)
  })

  it('handles complex nested conditions', () => {
    const formula = 'IF(rank == 1, 500, IF(rank == 2, IF(grand_total > 50, 350, 300), IF(rank == 3, 150, 0)))'

    expect(evaluateFormula(formula, { rank: 1, grand_total: 60 }).value).toBe(500)
    expect(evaluateFormula(formula, { rank: 2, grand_total: 60 }).value).toBe(350)
    expect(evaluateFormula(formula, { rank: 2, grand_total: 40 }).value).toBe(300)
    expect(evaluateFormula(formula, { rank: 3, grand_total: 100 }).value).toBe(150)
  })
})
