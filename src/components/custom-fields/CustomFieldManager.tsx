/**
 * Custom Field Manager
 * Manage all custom fields for a tournament
 */

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ChevronDown } from 'lucide-react'
import type { CustomField } from '@models/custom-field'
import { getCustomFieldsByTournament, deleteCustomField } from '@modules/custom-fields'
import { FieldDefinitionForm } from './FieldDefinitionForm'

interface CustomFieldManagerProps {
  tournamentId: string
  onFieldsChange?: (fields: CustomField[]) => void
}

export function CustomFieldManager({ tournamentId, onFieldsChange }: CustomFieldManagerProps) {
  const [fields, setFields] = useState<CustomField[]>([])
  const [editingField, setEditingField] = useState<CustomField | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  // Load fields
  useEffect(() => {
    loadFields()
  }, [tournamentId])

  const loadFields = async () => {
    setIsLoading(true)
    try {
      const loadedFields = await getCustomFieldsByTournament(tournamentId)
      setFields(loadedFields)
      onFieldsChange?.(loadedFields)
    } catch (err) {
      console.error('Failed to load fields:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveField = async (_field: CustomField) => {
    await loadFields()
    setEditingField(null)
    setIsCreating(false)
  }

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Delete this field? This will remove all computed values.')) {
      return
    }

    try {
      await deleteCustomField(fieldId)
      await loadFields()
    } catch (err) {
      console.error('Failed to delete field:', err)
    }
  }

  const toggleExpanded = (fieldId: string) => {
    setExpandedFields(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fieldId)) {
        newSet.delete(fieldId)
      } else {
        newSet.add(fieldId)
      }
      return newSet
    })
  }

  if (isCreating || editingField) {
    return (
      <FieldDefinitionForm
        field={editingField || undefined}
        tournamentId={tournamentId}
        onSave={handleSaveField}
        onCancel={() => {
          setEditingField(null)
          setIsCreating(false)
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Custom Fields</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          <Plus size={16} />
          New Field
        </button>
      </div>

      {/* Fields List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading fields...</div>
      ) : fields.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No custom fields yet.</p>
          <p className="text-sm text-gray-500 mt-1">
            Create custom fields to add bonuses, penalties, and awards to your tournament.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map(field => (
            <div key={field.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              {/* Field Header */}
              <button
                onClick={() => toggleExpanded(field.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-gray-900">{field.name}</h4>
                  <p className="text-sm text-gray-600">
                    {field.appliesTo === 'weigh-in' ? 'Per Weigh-In' : 'Per Team'} • {field.fieldType}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      setEditingField(field)
                    }}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                    title="Edit field"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      handleDeleteField(field.id)
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete field"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${
                      expandedFields.has(field.id) ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Field Details */}
              {expandedFields.has(field.id) && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 space-y-2 text-sm">
                  {field.description && (
                    <div>
                      <p className="text-gray-600">{field.description}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Formula:</p>
                    <code className="block bg-white p-2 rounded border border-gray-200 text-xs text-gray-600 overflow-auto max-h-24">
                      {field.formula}
                    </code>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div>
                      <p className="font-medium text-gray-700">Scope</p>
                      <p>{field.scope === 'both' ? 'Both Days' : field.scope === 'day1' ? 'Day 1' : 'Day 2'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Field Type</p>
                      <p className="capitalize">{field.fieldType}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Created</p>
                      <p>{new Date(field.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {fields.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
          <p>
            <strong>{fields.length}</strong> custom field{fields.length !== 1 ? 's' : ''} configured.
            These fields will be calculated for all{' '}
            {fields.some(f => f.appliesTo === 'weigh-in') ? 'weigh-ins' : ''}
            {fields.some(f => f.appliesTo === 'weigh-in') && fields.some(f => f.appliesTo === 'team') ? ' and ' : ''}
            {fields.some(f => f.appliesTo === 'team') ? 'teams' : ''}.
          </p>
        </div>
      )}
    </div>
  )
}
