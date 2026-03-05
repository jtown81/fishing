/**
 * Field Definition Form
 * Create and edit custom fields with formula support
 */

import React, { useState } from 'react'
import { AlertCircle, HelpCircle, Zap } from 'lucide-react'
import type { CustomField } from '@models/custom-field'
import { createCustomField, updateCustomField, validateFormula } from '@modules/custom-fields'
import { formulaLibrary } from '@modules/custom-fields'

interface FieldDefinitionFormProps {
  field?: CustomField
  tournamentId: string
  onSave: (field: CustomField) => void
  onCancel: () => void
}

export function FieldDefinitionForm({
  field,
  tournamentId,
  onSave,
  onCancel
}: FieldDefinitionFormProps) {
  const [formData, setFormData] = useState({
    name: field?.name || '',
    description: field?.description || '',
    fieldType: field?.fieldType || ('number' as const),
    formula: field?.formula || '',
    appliesTo: field?.appliesTo || ('weigh-in' as const),
    scope: field?.scope || ('both' as const)
  })

  const [formulaError, setFormulaError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear formula error when user edits
    if (name === 'formula') {
      setFormulaError(null)
    }
  }

  const handleValidateFormula = async () => {
    if (!formData.formula) {
      setFormulaError(null)
      return
    }

    const validation = await validateFormula(formData.formula, formData.scope)
    if (!validation.isValid) {
      setFormulaError(validation.errors.join('; '))
    } else {
      setFormulaError(null)
    }
  }

  const handleApplyTemplate = (templateId: string) => {
    const template = formulaLibrary.getTemplate(templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        name: template.name,
        description: template.description,
        formula: template.formula,
        fieldType: template.fieldType,
        appliesTo: template.appliesTo,
        scope: template.scope
      }))
      setShowTemplates(false)
    }
  }

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      setFormulaError('Field name is required')
      return
    }

    if (!formData.formula.trim()) {
      setFormulaError('Formula is required')
      return
    }

    // Validate formula
    const validation = await validateFormula(formData.formula, formData.scope)
    if (!validation.isValid) {
      setFormulaError(validation.errors.join('; '))
      return
    }

    setIsSaving(true)
    try {
      let savedField: CustomField
      if (field) {
        savedField = await updateCustomField(field.id, {
          ...formData,
          updatedAt: new Date()
        })
      } else {
        savedField = await createCustomField({
          ...formData,
          tournamentId,
          order: 0 // Will be handled by service
        })
      }
      onSave(savedField)
    } catch (err) {
      setFormulaError((err as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold">
        {field ? 'Edit Custom Field' : 'Create Custom Field'}
      </h3>

      {/* Field Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Field Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Release Bonus, Placement Award"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="What is this field for?"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Field Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Type *
          </label>
          <select
            name="fieldType"
            value={formData.fieldType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="text">Text</option>
            <option value="currency">Currency</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Scope *
          </label>
          <select
            name="scope"
            value={formData.scope}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day1">Day 1 Only</option>
            <option value="day2">Day 2 Only</option>
            <option value="both">Both Days</option>
          </select>
        </div>
      </div>

      {/* Applies To */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Applies To *
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="appliesTo"
              value="weigh-in"
              checked={formData.appliesTo === 'weigh-in'}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-sm">Weigh-In</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="appliesTo"
              value="team"
              checked={formData.appliesTo === 'team'}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-sm">Team</span>
          </label>
        </div>
      </div>

      {/* Formula */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Formula *
          </label>
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Zap size={14} />
            Use Template
          </button>
        </div>
        <textarea
          name="formula"
          value={formData.formula}
          onChange={handleChange}
          placeholder="e.g., fish_released * 0.25 or IF(rank == 1, 500, IF(rank == 2, 300, 0))"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Available fields depend on scope. Use IF, SUM, AVG, MAX, MIN, COUNT, ROUND, etc.
        </p>
      </div>

      {/* Template Browser */}
      {showTemplates && (
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Templates</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {formulaLibrary.getAllTemplates().slice(0, 8).map(template => (
              <button
                key={template.id}
                onClick={() => handleApplyTemplate(template.id)}
                className="text-left p-2 bg-white border border-blue-200 rounded hover:bg-blue-100 transition"
              >
                <div className="text-sm font-medium">{template.name}</div>
                <div className="text-xs text-gray-600">{template.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Formula Error */}
      {formulaError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex gap-2">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Formula Error</p>
            <p className="text-xs text-red-700">{formulaError}</p>
          </div>
        </div>
      )}

      {/* Available Fields Help */}
      <details className="bg-gray-50 p-3 rounded-md">
        <summary className="cursor-pointer flex items-center gap-2 text-sm font-medium text-gray-700">
          <HelpCircle size={16} />
          Available Fields
        </summary>
        <div className="mt-2 text-xs text-gray-600 space-y-1">
          {formData.appliesTo === 'weigh-in' && (
            <>
              <p><strong>Weigh-In Fields:</strong> fish_count, raw_weight, fish_released, big_fish, day, day_total, avg_weight, max_weight, min_weight</p>
            </>
          )}
          {formData.appliesTo === 'team' && (
            <>
              <p><strong>Team Fields:</strong> day1_total, day2_total, grand_total, total_fish, total_released, big_fish_day1, big_fish_day2, rank, day1_rank, day2_rank, rank_change, avg_weight, max_weight</p>
            </>
          )}
        </div>
      </details>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleValidateFormula}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Validate
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !formData.name || !formData.formula}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Field'}
        </button>
      </div>
    </div>
  )
}
