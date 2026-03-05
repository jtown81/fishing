/**
 * Calcutta Groups List
 * Shows all groups with buyer and amount entry
 */

import { useState } from 'react'
import { useCalcuttaStore } from '@modules/calcutta/calcutta-store'
import { useTeamStore } from '@modules/teams/team-store'
import { calculatePoolValue, isPoolComplete } from '@modules/calcutta/calcutta-service'
import { formatCurrency } from '@utils/formatting'
import { Users, DollarSign, AlertCircle } from 'lucide-react'

export default function CalcuttaGroupsList() {
  const groups = useCalcuttaStore((s) => s.groups)
  const updateBuyer = useCalcuttaStore((s) => s.updateBuyer)
  const teams = useTeamStore((s) => s.teams)

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editBuyer, setEditBuyer] = useState('')
  const [editAmount, setEditAmount] = useState('')

  if (groups.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 text-center">
        <Users size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">Generate groups first</p>
      </div>
    )
  }

  const teamMap = new Map(teams.map(t => [t.id, t]))
  const poolValue = calculatePoolValue(groups)
  const isComplete = isPoolComplete(groups)

  const handleSave = (groupId: string) => {
    if (!editBuyer.trim() || !editAmount.trim()) {
      alert('Please enter both buyer name and amount')
      return
    }

    const amount = parseFloat(editAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    updateBuyer(groupId, editBuyer.trim(), amount)
    setEditingGroupId(null)
    setEditBuyer('')
    setEditAmount('')
  }

  const handleEdit = (group: any) => {
    setEditingGroupId(group.id)
    setEditBuyer(group.buyer || '')
    setEditAmount(group.amount?.toString() || '')
  }

  return (
    <div className="space-y-4">
      {/* Pool Summary */}
      <div className={`rounded-lg p-4 border-2 ${
        isComplete
          ? 'bg-green-50 border-green-200'
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-sm font-medium ${
              isComplete ? 'text-green-900' : 'text-yellow-900'
            }`}>
              Pool Value: <strong>{formatCurrency(poolValue)}</strong>
            </p>
            <p className={`text-xs mt-1 ${
              isComplete ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {groups.filter(g => g.buyer && g.amount).length} / {groups.length} groups sold
            </p>
          </div>
          {!isComplete && (
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {groups.map((group) => {
          const isEditing = editingGroupId === group.id
          const teamNames = group.teamIds
            .map(id => teamMap.get(id))
            .filter(Boolean)
            .map(t => `#${t!.teamNumber}`)
            .join(', ')

          return (
            <div
              key={group.id}
              className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
            >
              {/* Group Header */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">Group {group.groupNumber}</p>
                    <p className="text-sm text-gray-600">Teams: {teamNames}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {group.teamIds.length}
                    </p>
                    <p className="text-xs text-gray-600">teams</p>
                  </div>
                </div>
              </div>

              {/* Group Content */}
              <div className="p-4 space-y-4">
                {isEditing ? (
                  <>
                    {/* Edit Mode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buyer Name
                      </label>
                      <input
                        type="text"
                        value={editBuyer}
                        onChange={(e) => setEditBuyer(e.target.value)}
                        placeholder="Enter buyer name"
                        autoFocus
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <div className="relative">
                        <DollarSign
                          size={18}
                          className="absolute left-3 top-2.5 text-gray-400"
                        />
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleSave(group.id)}
                        className="flex-1 py-2 px-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingGroupId(null)}
                        className="flex-1 py-2 px-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Display Mode */}
                    {group.buyer ? (
                      <>
                        <div>
                          <p className="text-xs text-gray-600">Buyer</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {group.buyer}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Sold For</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(group.amount || 0)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleEdit(group)}
                          className="w-full py-2 px-3 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition text-sm"
                        >
                          Edit
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-500 text-center py-4">Not yet sold</p>
                        <button
                          onClick={() => handleEdit(group)}
                          className="w-full py-2 px-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                        >
                          Add Buyer & Amount
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
