/**
 * AnglerProfile — detailed view for a single angler.
 * Shows career stats, tournament history, and edit controls.
 */
import { useState, useEffect } from 'react'
import { useAnglerStore, getAnglerHistory, computeAnglerStats } from '@modules/anglers'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import { useWeighInStore } from '@modules/weigh-ins/weigh-in-store'
import { useStandings } from '@hooks/useStandings'
import type { AnglerAppearance } from '@models/tournament'
import { ArrowLeft, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react'
import { formatWeight } from '@utils/formatting'

interface AnglerProfileProps {
  anglerId: string
  onBack: () => void
}

export default function AnglerProfile({ anglerId, onBack }: AnglerProfileProps) {
  const { anglers, updateAngler, deleteAngler } = useAnglerStore()
  const currentTournament = useTournamentStore((s) => s.currentTournament)
  const weighIns = useWeighInStore((s) => s.weighIns)
  const standings = useStandings()

  const angler = anglers.find((a) => a.id === anglerId)

  const [appearances, setAppearances] = useState<AnglerAppearance[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editFirst, setEditFirst] = useState('')
  const [editLast, setEditLast] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getAnglerHistory(anglerId).then(setAppearances)
  }, [anglerId])

  if (!angler) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Angler not found.</p>
        <button onClick={onBack} className="mt-3 text-blue-600 hover:underline text-sm">
          ← Back
        </button>
      </div>
    )
  }

  const stats = computeAnglerStats(appearances, weighIns, standings)

  const startEdit = () => {
    setEditFirst(angler.firstName)
    setEditLast(angler.lastName)
    setEditEmail(angler.email ?? '')
    setEditNotes(angler.notes ?? '')
    setIsEditing(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateAngler({
        ...angler,
        firstName: editFirst.trim(),
        lastName: editLast.trim(),
        email: editEmail.trim() || undefined,
        notes: editNotes.trim() || undefined
      })
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete ${angler.firstName} ${angler.lastName}? This will remove all tournament links.`)) return
    await deleteAngler(angler.id)
    onBack()
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Anglers
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {isEditing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First name"
                value={editFirst}
                onChange={(e) => setEditFirst(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Last name"
                value={editLast}
                onChange={(e) => setEditLast(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Notes (optional)"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold">
                {angler.firstName[0]}{angler.lastName[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {angler.firstName} {angler.lastName}
                </h1>
                {angler.email && (
                  <p className="text-sm text-gray-500 mt-0.5">{angler.email}</p>
                )}
                {angler.notes && (
                  <p className="text-sm text-gray-600 mt-1 italic">{angler.notes}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
              >
                <Edit2 size={14} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Tournaments" value={String(stats.tournaments)} />
        <StatCard label="Best Weight" value={stats.bestGrandTotal > 0 ? formatWeight(stats.bestGrandTotal) : '—'} />
        <StatCard
          label="Avg Weight"
          value={stats.avgGrandTotal > 0 ? formatWeight(stats.avgGrandTotal) : '—'}
        />
        <StatCard label="Best Rank" value={stats.bestRank !== null ? `#${stats.bestRank}` : '—'} />
      </div>

      {/* Tournament history */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Tournament History</h2>
        </div>
        {appearances.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            No tournament links yet.
            {currentTournament && ' Link this angler to a team in the Teams view.'}
          </p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tournament</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Team #</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appearances.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{app.tournamentId}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">#{app.teamNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
