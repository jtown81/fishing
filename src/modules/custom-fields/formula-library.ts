/**
 * Formula Library
 * Pre-built formula templates for common tournament scoring scenarios
 */

import { evaluateFormula } from './formula-language'
import type { FormulaContext } from '@models/custom-field'

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export interface FormulaTemplate {
  id: string
  name: string
  description: string
  formula: string
  fieldType: 'number' | 'boolean' | 'text' | 'currency'
  appliesTo: 'weigh-in' | 'team'
  scope: 'day1' | 'day2' | 'both'
  parameters: TemplateParameter[]
  category: 'bonus' | 'penalty' | 'award' | 'multiplier' | 'calculation'
  example?: {
    context: Record<string, any>
    result: any
  }
}

export interface TemplateParameter {
  name: string
  type: 'number' | 'string'
  label: string
  description: string
  defaultValue: any
  required: boolean
}

// ============================================================================
// PRE-BUILT TEMPLATES
// ============================================================================

const RELEASE_BONUS_TEMPLATE: FormulaTemplate = {
  id: 'release-bonus-fixed',
  name: 'Fixed Release Bonus',
  description: 'Award a fixed bonus amount per fish released',
  formula: 'fish_released * {bonus_per_fish}',
  fieldType: 'number',
  appliesTo: 'weigh-in',
  scope: 'both',
  parameters: [
    {
      name: 'bonus_per_fish',
      type: 'number',
      label: 'Bonus per Fish Released',
      description: 'Award amount for each released fish (e.g., 0.25 lbs)',
      defaultValue: 0.25,
      required: true
    }
  ],
  category: 'bonus',
  example: {
    context: { fish_released: 5 },
    result: 1.25
  }
}

const TIERED_RELEASE_BONUS_TEMPLATE: FormulaTemplate = {
  id: 'release-bonus-tiered',
  name: 'Tiered Release Bonus',
  description: 'Award increasing bonus based on number of fish released',
  formula: 'IF(fish_released >= {tier3_min}, fish_released * {tier3_bonus}, IF(fish_released >= {tier2_min}, fish_released * {tier2_bonus}, fish_released * {tier1_bonus}))',
  fieldType: 'number',
  appliesTo: 'weigh-in',
  scope: 'both',
  parameters: [
    {
      name: 'tier1_bonus',
      type: 'number',
      label: 'Tier 1 Bonus (0-2 fish)',
      description: 'Bonus per fish for 0-2 released fish',
      defaultValue: 0.1,
      required: true
    },
    {
      name: 'tier2_min',
      type: 'number',
      label: 'Tier 2 Minimum',
      description: 'Minimum fish released to reach tier 2',
      defaultValue: 3,
      required: true
    },
    {
      name: 'tier2_bonus',
      type: 'number',
      label: 'Tier 2 Bonus',
      description: 'Bonus per fish for 3+ released fish',
      defaultValue: 0.2,
      required: true
    },
    {
      name: 'tier3_min',
      type: 'number',
      label: 'Tier 3 Minimum',
      description: 'Minimum fish released to reach tier 3',
      defaultValue: 5,
      required: true
    },
    {
      name: 'tier3_bonus',
      type: 'number',
      label: 'Tier 3 Bonus',
      description: 'Bonus per fish for 5+ released fish',
      defaultValue: 0.3,
      required: true
    }
  ],
  category: 'bonus'
}

const PLACEMENT_BONUS_TEMPLATE: FormulaTemplate = {
  id: 'placement-bonus',
  name: 'Placement Bonus',
  description: 'Award bonus based on final tournament ranking',
  formula: 'IF(rank == 1, {first_place}, IF(rank == 2, {second_place}, IF(rank == 3, {third_place}, 0)))',
  fieldType: 'number',
  appliesTo: 'team',
  scope: 'both',
  parameters: [
    {
      name: 'first_place',
      type: 'number',
      label: '1st Place Award',
      description: 'Award for 1st place finish',
      defaultValue: 500,
      required: true
    },
    {
      name: 'second_place',
      type: 'number',
      label: '2nd Place Award',
      description: 'Award for 2nd place finish',
      defaultValue: 300,
      required: true
    },
    {
      name: 'third_place',
      type: 'number',
      label: '3rd Place Award',
      description: 'Award for 3rd place finish',
      defaultValue: 150,
      required: true
    }
  ],
  category: 'award',
  example: {
    context: { rank: 2 },
    result: 300
  }
}

const IMPROVEMENT_BONUS_TEMPLATE: FormulaTemplate = {
  id: 'improvement-bonus',
  name: 'Most Improved Bonus',
  description: 'Award bonus for teams that improve from Day 1 to Day 2',
  formula: 'IF(rank_change > 0, {bonus_per_rank_improve} * rank_change, 0)',
  fieldType: 'number',
  appliesTo: 'team',
  scope: 'both',
  parameters: [
    {
      name: 'bonus_per_rank_improve',
      type: 'number',
      label: 'Bonus per Rank Improvement',
      description: 'Award amount for each position improved',
      defaultValue: 10,
      required: true
    }
  ],
  category: 'bonus',
  example: {
    context: { rank_change: 5 },
    result: 50
  }
}

const BIG_FISH_MULTIPLIER_TEMPLATE: FormulaTemplate = {
  id: 'big-fish-multiplier',
  name: 'Big Fish Weight Multiplier',
  description: 'Scale weight bonus based on largest fish caught',
  formula: 'IF(big_fish == null, 0, IF(big_fish >= {large_threshold}, big_fish * {large_multiplier}, IF(big_fish >= {medium_threshold}, big_fish * {medium_multiplier}, big_fish * {small_multiplier})))',
  fieldType: 'number',
  appliesTo: 'weigh-in',
  scope: 'both',
  parameters: [
    {
      name: 'small_multiplier',
      type: 'number',
      label: 'Small Fish Multiplier',
      description: 'Multiplier for fish under medium threshold (e.g., 1.0 for no bonus)',
      defaultValue: 1.0,
      required: true
    },
    {
      name: 'medium_threshold',
      type: 'number',
      label: 'Medium Fish Threshold',
      description: 'Weight threshold for medium fish bonus',
      defaultValue: 3.0,
      required: true
    },
    {
      name: 'medium_multiplier',
      type: 'number',
      label: 'Medium Fish Multiplier',
      description: 'Multiplier for fish at/above medium threshold',
      defaultValue: 1.1,
      required: true
    },
    {
      name: 'large_threshold',
      type: 'number',
      label: 'Large Fish Threshold',
      description: 'Weight threshold for large fish bonus',
      defaultValue: 5.0,
      required: true
    },
    {
      name: 'large_multiplier',
      type: 'number',
      label: 'Large Fish Multiplier',
      description: 'Multiplier for fish at/above large threshold',
      defaultValue: 1.25,
      required: true
    }
  ],
  category: 'multiplier'
}

const PENALTY_TEMPLATE: FormulaTemplate = {
  id: 'penalty-over-limit',
  name: 'Weight Limit Penalty',
  description: 'Deduct penalty for exceeding weight limit',
  formula: 'IF(raw_weight > {weight_limit}, (raw_weight - {weight_limit}) * {penalty_per_lb}, 0)',
  fieldType: 'number',
  appliesTo: 'weigh-in',
  scope: 'both',
  parameters: [
    {
      name: 'weight_limit',
      type: 'number',
      label: 'Weight Limit',
      description: 'Maximum allowed weight per weigh-in',
      defaultValue: 50,
      required: true
    },
    {
      name: 'penalty_per_lb',
      type: 'number',
      label: 'Penalty per Pound Over',
      description: 'Deduction amount per pound over limit',
      defaultValue: -1.0,
      required: true
    }
  ],
  category: 'penalty',
  example: {
    context: { raw_weight: 55 },
    result: -5.0
  }
}

const PARTICIPATION_BONUS_TEMPLATE: FormulaTemplate = {
  id: 'participation-bonus',
  name: 'Participation Bonus',
  description: 'Award bonus for completing both days of tournament',
  formula: 'IF(day1_total > 0 AND day2_total > 0, {bonus_amount}, 0)',
  fieldType: 'number',
  appliesTo: 'team',
  scope: 'both',
  parameters: [
    {
      name: 'bonus_amount',
      type: 'number',
      label: 'Bonus Amount',
      description: 'Award for completing both tournament days',
      defaultValue: 25,
      required: true
    }
  ],
  category: 'bonus',
  example: {
    context: { day1_total: 10, day2_total: 15 },
    result: 25
  }
}

const CONSISTENCY_BONUS_TEMPLATE: FormulaTemplate = {
  id: 'consistency-bonus',
  name: 'Consistency Bonus',
  description: 'Reward teams with similar daily totals',
  formula: 'IF(ABS(day1_total - day2_total) <= {variance_threshold}, {bonus_amount}, 0)',
  fieldType: 'number',
  appliesTo: 'team',
  scope: 'both',
  parameters: [
    {
      name: 'variance_threshold',
      type: 'number',
      label: 'Max Daily Variance',
      description: 'Maximum difference between day totals to earn bonus',
      defaultValue: 5,
      required: true
    },
    {
      name: 'bonus_amount',
      type: 'number',
      label: 'Bonus Amount',
      description: 'Award for consistent daily performance',
      defaultValue: 50,
      required: true
    }
  ],
  category: 'bonus'
}

// ============================================================================
// LIBRARY MANAGEMENT
// ============================================================================

const DEFAULT_TEMPLATES: FormulaTemplate[] = [
  RELEASE_BONUS_TEMPLATE,
  TIERED_RELEASE_BONUS_TEMPLATE,
  PLACEMENT_BONUS_TEMPLATE,
  IMPROVEMENT_BONUS_TEMPLATE,
  BIG_FISH_MULTIPLIER_TEMPLATE,
  PENALTY_TEMPLATE,
  PARTICIPATION_BONUS_TEMPLATE,
  CONSISTENCY_BONUS_TEMPLATE
]

export class FormulaLibrary {
  private customTemplates: Map<string, FormulaTemplate> = new Map()

  /**
   * Get all available templates (built-in + custom)
   */
  getAllTemplates(): FormulaTemplate[] {
    return [
      ...DEFAULT_TEMPLATES,
      ...Array.from(this.customTemplates.values())
    ]
  }

  /**
   * Get a template by ID
   */
  getTemplate(id: string): FormulaTemplate | undefined {
    // Check custom first
    if (this.customTemplates.has(id)) {
      return this.customTemplates.get(id)
    }
    // Then check defaults
    return DEFAULT_TEMPLATES.find(t => t.id === id)
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): FormulaTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category)
  }

  /**
   * Register a custom template
   */
  registerTemplate(template: FormulaTemplate): void {
    this.customTemplates.set(template.id, template)
  }

  /**
   * Apply a template with parameters
   */
  applyTemplate(
    templateId: string,
    parameters: Record<string, any>
  ): { formula: string; error?: string } {
    const template = this.getTemplate(templateId)
    if (!template) {
      return { formula: '', error: `Template ${templateId} not found` }
    }

    // Replace parameters in formula
    let formula = template.formula
    for (const [key, value] of Object.entries(parameters)) {
      const placeholder = new RegExp(`\\{${key}\\}`, 'g')
      formula = formula.replace(placeholder, String(value))
    }

    // Check for unresolved placeholders
    const unresolvedParams = formula.match(/\{[^}]+\}/g)
    if (unresolvedParams) {
      const missingParams = unresolvedParams.map(p => p.slice(1, -1)).join(', ')
      return {
        formula,
        error: `Missing parameters: ${missingParams}`
      }
    }

    return { formula }
  }

  /**
   * Validate template parameters
   */
  validateParameters(
    templateId: string,
    parameters: Record<string, any>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    const template = this.getTemplate(templateId)

    if (!template) {
      return { isValid: false, errors: [`Template ${templateId} not found`] }
    }

    // Check required parameters
    for (const param of template.parameters) {
      if (param.required && !(param.name in parameters)) {
        errors.push(`Missing required parameter: ${param.label}`)
      }

      // Check parameter type
      if (param.name in parameters) {
        const value = parameters[param.name]
        if (typeof value !== param.type) {
          errors.push(`Parameter ${param.label} must be of type ${param.type}`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Preview template result with parameters and context
   */
  previewTemplate(
    templateId: string,
    parameters: Record<string, any>,
    context: Partial<FormulaContext> = {}
  ): { result: any; error?: string } {
    const templateResult = this.applyTemplate(templateId, parameters)
    if (templateResult.error) {
      return { result: null, error: templateResult.error }
    }

    const evalResult = evaluateFormula(templateResult.formula, context as Record<string, any>)
    if (evalResult.error) {
      return { result: null, error: evalResult.error.message }
    }

    return { result: evalResult.value }
  }
}

// Export singleton instance
export const formulaLibrary = new FormulaLibrary()

/**
 * Export default templates for direct access
 */
export const DefaultTemplates = {
  releaseBonus: RELEASE_BONUS_TEMPLATE,
  tieredReleaseBonus: TIERED_RELEASE_BONUS_TEMPLATE,
  placementBonus: PLACEMENT_BONUS_TEMPLATE,
  improvementBonus: IMPROVEMENT_BONUS_TEMPLATE,
  bigFishMultiplier: BIG_FISH_MULTIPLIER_TEMPLATE,
  penalty: PENALTY_TEMPLATE,
  participationBonus: PARTICIPATION_BONUS_TEMPLATE,
  consistencyBonus: CONSISTENCY_BONUS_TEMPLATE
}
