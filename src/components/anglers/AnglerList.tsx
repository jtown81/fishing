/**
 * AnglerList — searchable list of all angler profiles.
 * Shows stats summary and supports creating new anglers.
 */
import { useState } from 'react'
import { useAnglerStore } from '@modules/anglers'
import { Search, Plus, User, Loader2 } from 'lucide-react'
import type { Angler } from '@models/tournament'

interface AnglerListProps {
  onSelectAngler: (id: string) => void
}

export default function AnglerList({ onSelectAngler }: AnglerListProps) {
  const { anglers, isLoading, createAngler } = useAnglerStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newFirst, setNewFirst] = useState('')
  const [newLast, setNewLast] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const filtered = anglers.filter((a) => {
    const q = search.toLowerCase()
    return (
      a.firstName.toLowerCase().includes(q) ||
      a.lastName.toLowerCase().includes(q)
    )
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFirst.trim() || !newLast.trim()) return
    setIsCreating(true)
    try {
      await createAngler({
        firstName: newFirst.trim(),
        lastName: newLast.trim(),
        email: newEmail.trim() || undefined
      })
      setNewFirst('')
      setNewLast('')
      setNewEmail('')
      setShowForm(false)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Angler Profiles</h1>
          <p className="text-gray-600 mt-1">{anglers.length} anglers on record</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Angler
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
        >
          <p className="text-sm font-semibold text-gray-700">New Angler</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="First name *"
              value={newFirst}
              onChange={(e) => setNewFirst(e.target.value)}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Last name *"
              value={newLast}
              onChange={(e) => setNewLast(e.target.value)}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isCreating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isCreating && <Loader2 size={14} className="animate-spin" />}
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm py-8 justify-center">
          <Loader2 size={16} className="animate-spin" />
          Loading anglers…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {search ? 'No anglers match your search.' : 'No anglers yet. Add one to get started.'}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((angler: Angler) => (
                <tr key={angler.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold">
                        {angler.firstName[0]}{angler.lastName[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {angler.firstName} {angler.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {angler.email ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onSelectAngler(angler.id)}
                      className="flex items-center gap-1.5 ml-auto px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <User size={14} />
                      Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
