/**
 * Custom Field Service
 * Handles CRUD operations, validation, formula evaluation, and cache management
 */

import { db } from '@db/database'
import type { CustomField, ComputedFieldValue, FormulaContext } from '@models/custom-field'
import { evaluateFormula } from './formula-language'

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Create a new custom field
 */
export async function createCustomField(
  field: Omit<CustomField, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CustomField> {
  const now = new Date()
  const customField: CustomField = {
    ...field,
    id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now
  }

  // Validate formula if provided
  if (customField.formula) {
    await validateFormula(customField.formula, customField.scope)
  }

  await db.customFields.add(customField)
  return customField
}

/**
 * Get a custom field by ID
 */
export async function getCustomField(id: string): Promise<CustomField | undefined> {
  return db.customFields.get(id)
}

/**
 * Get all custom fields for a tournament
 */
export async function getCustomFieldsByTournament(tournamentId: string): Promise<CustomField[]> {
  return db.customFields
    .where('tournamentId')
    .equals(tournamentId)
    .sortBy('order')
}

/**
 * Update a custom field
 */
export async function updateCustomField(id: string, updates: Partial<CustomField>): Promise<CustomField> {
  const field = await getCustomField(id)
  if (!field) {
    throw new Error(`Custom field ${id} not found`)
  }

  // Validate formula if being updated
  if (updates.formula) {
    await validateFormula(updates.formula, updates.scope || field.scope)
  }

  const updated: CustomField = {
    ...field,
    ...updates,
    updatedAt: new Date()
  }

  await db.customFields.update(id, {
    ...updates,
    updatedAt: new Date()
  })

  return updated
}

/**
 * Delete a custom field
 */
export async function deleteCustomField(id: string): Promise<void> {
  // Delete all computed values for this field
  const values = await db.computedFieldValues
    .where('customFieldId')
    .equals(id)
    .toArray()

  for (const value of values) {
    await db.computedFieldValues.delete(value.id)
  }

  await db.customFields.delete(id)
}

/**
 * Reorder custom fields in a tournament
 */
export async function reorderCustomFields(
  tournamentId: string,
  fieldIds: string[]
): Promise<void> {
  const fields = await getCustomFieldsByTournament(tournamentId)

  for (let i = 0; i < fieldIds.length; i++) {
    const field = fields.find(f => f.id === fieldIds[i])
    if (field) {
      await db.customFields.update(field.id, { order: i })
    }
  }
}

// ============================================================================
// FORMULA VALIDATION
// ============================================================================

/**
 * Validate a formula for syntax and field references
 */
export async function validateFormula(
  formula: string,
  _scope: 'day1' | 'day2' | 'both'
): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = []

  try {
    const result = evaluateFormula(formula, {})
    if (result.error) {
      errors.push(result.error.message)
    }
  } catch (err) {
    errors.push((err as Error).message)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// ============================================================================
// COMPUTATION & CACHING
// ============================================================================

/**
 * Compute a custom field value for an entity
 */
export async function computeFieldValue(
  customFieldId: string,
  entityId: string,
  context: FormulaContext
): Promise<ComputedFieldValue> {
  const field = await getCustomField(customFieldId)
  if (!field) {
    throw new Error(`Custom field ${customFieldId} not found`)
  }

  if (!field.formula) {
    throw new Error(`Custom field ${customFieldId} has no formula`)
  }

  const result = evaluateFormula(field.formula, context as Record<string, any>)
  const now = new Date()

  // Extract dependencies from the formula evaluation
  const dependencies = Array.from(result.dependencies)

  const computedValue: ComputedFieldValue = {
    id: `value-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    entityId,
    customFieldId,
    value: result.value,
    dependsOn: dependencies,
    lastComputed: now,
    isDirty: false
  }

  return computedValue
}

/**
 * Get or compute a field value, using cache if available and not dirty
 */
export async function getOrComputeFieldValue(
  customFieldId: string,
  entityId: string,
  context: FormulaContext
): Promise<ComputedFieldValue> {
  // Try to get cached value
  const cached = await db.computedFieldValues
    .where('[customFieldId+entityId]')
    .equals([customFieldId, entityId])
    .first()

  // If cached and not dirty, return it
  if (cached && !cached.isDirty) {
    return cached
  }

  // Otherwise compute new value
  const newValue = await computeFieldValue(customFieldId, entityId, context)

  // Upsert into database
  if (cached) {
    await db.computedFieldValues.update(cached.id, {
      value: newValue.value,
      dependsOn: newValue.dependsOn,
      lastComputed: newValue.lastComputed,
      isDirty: false
    })
    return {
      ...cached,
      value: newValue.value,
      dependsOn: newValue.dependsOn,
      lastComputed: newValue.lastComputed,
      isDirty: false
    }
  } else {
    await db.computedFieldValues.add(newValue)
    return newValue
  }
}

/**
 * Mark all computed values as dirty (needing recomputation)
 */
export async function invalidateCachedValues(dependencyName: string): Promise<void> {
  const allValues = await db.computedFieldValues.toArray()

  for (const value of allValues) {
    if (value.dependsOn.includes(dependencyName)) {
      await db.computedFieldValues.update(value.id, { isDirty: true })
    }
  }
}

/**
 * Invalidate cached values for a specific entity when its data changes
 */
export async function invalidateEntityCache(entityId: string): Promise<void> {
  const values = await db.computedFieldValues
    .where('entityId')
    .equals(entityId)
    .toArray()

  for (const value of values) {
    await db.computedFieldValues.update(value.id, { isDirty: true })
  }
}

/**
 * Invalidate cached values for a custom field
 */
export async function invalidateFieldCache(customFieldId: string): Promise<void> {
  const values = await db.computedFieldValues
    .where('customFieldId')
    .equals(customFieldId)
    .toArray()

  for (const value of values) {
    await db.computedFieldValues.update(value.id, { isDirty: true })
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Compute all custom field values for an entity
 */
export async function computeAllFieldValues(
  tournamentId: string,
  entityId: string,
  context: FormulaContext
): Promise<Map<string, ComputedFieldValue>> {
  const fields = await getCustomFieldsByTournament(tournamentId)
  const results = new Map<string, ComputedFieldValue>()

  for (const field of fields) {
    if (field.formula) {
      const value = await getOrComputeFieldValue(field.id, entityId, context)
      results.set(field.id, value)
    }
  }

  return results
}

/**
 * Get all computed values for an entity
 */
export async function getEntityComputedValues(entityId: string): Promise<ComputedFieldValue[]> {
  return db.computedFieldValues
    .where('entityId')
    .equals(entityId)
    .toArray()
}

/**
 * Delete all computed values for an entity (e.g., when entity is deleted)
 */
export async function deleteEntityComputedValues(entityId: string): Promise<void> {
  const values = await getEntityComputedValues(entityId)
  for (const value of values) {
    await db.computedFieldValues.delete(value.id)
  }
}
