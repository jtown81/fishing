/**
 * AnglerLinkModal — links/unlinks team members to angler profiles.
 */
import { useState, useEffect } from 'react'
import { useAnglerStore, getAppearancesForTeam } from '@modules/anglers'
import type { Team, AnglerAppearance } from '@models/tournament'
import { X, Link, Unlink, Plus, Loader2 } from 'lucide-react'

interface AnglerLinkModalProps {
  team: Team
  tournamentId: string
  onClose: () => void
}

export default function AnglerLinkModal({ team, tournamentId, onClose }: AnglerLinkModalProps) {
  const { anglers, createAngler, linkToTeam, unlinkAppearance, loadAnglers } = useAnglerStore()
  const [appearances, setAppearances] = useState<AnglerAppearance[]>([])
  const [selectedAnglerId, setSelectedAnglerId] = useState('')
  const [newFirst, setNewFirst] = useState('')
  const [newLast, setNewLast] = useState('')
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      await loadAnglers()
      const apps = await getAppearancesForTeam(team.id)
      setAppearances(apps.filter((a) => a.tournamentId === tournamentId))
      setIsLoading(false)
    }
    load()
  }, [team.id, tournamentId, loadAnglers])

  const linkedAnglerIds = new Set(appearances.map((a) => a.anglerId))

  const handleLink = async () => {
    if (!selectedAnglerId && !isCreatingNew) return
    setIsLinking(true)
    try {
      let anglerId = selectedAnglerId
      if (isCreatingNew) {
        if (!newFirst.trim() || !newLast.trim()) return
        const created = await createAngler({ firstName: newFirst.trim(), lastName: newLast.trim() })
        anglerId = created.id
      }
      const app = await linkToTeam(anglerId, tournamentId, team.id, team.teamNumber)
      setAppearances((prev) => [...prev.filter((a) => a.anglerId !== anglerId), app])
      setSelectedAnglerId('')
      setNewFirst('')
      setNewLast('')
      setIsCreatingNew(false)
    } finally {
      setIsLinking(false)
    }
  }

  const handleUnlink = async (appearanceId: string) => {
    await unlinkAppearance(appearanceId)
    setAppearances((prev) => prev.filter((a) => a.id !== appearanceId))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Link Anglers — Team #{team.teamNumber}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
              <Loader2 size={14} className="animate-spin" />
              Loading…
            </div>
          ) : (
            <>
              {/* Current links */}
              {appearances.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Linked Anglers
                  </p>
                  <ul className="space-y-2">
                    {appearances.map((app) => {
                      const angler = anglers.find((a) => a.id === app.anglerId)
                      return (
                        <li key={app.id} className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                          <span className="text-sm font-medium text-blue-900">
                            {angler ? `${angler.firstName} ${angler.lastName}` : app.anglerId}
                          </span>
                          <button
                            onClick={() => handleUnlink(app.id)}
                            className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs"
                          >
                            <Unlink size={12} />
                            Unlink
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {/* Link controls */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Add Link
                </p>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setIsCreatingNew(false)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${!isCreatingNew ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                  >
                    Existing Angler
                  </button>
                  <button
                    onClick={() => setIsCreatingNew(true)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border transition-colors ${isCreatingNew ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Plus size={10} />
                    New Angler
                  </button>
                </div>

                {isCreatingNew ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="First name *"
                      value={newFirst}
                      onChange={(e) => setNewFirst(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Last name *"
                      value={newLast}
                      onChange={(e) => setNewLast(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <select
                    value={selectedAnglerId}
                    onChange={(e) => setSelectedAnglerId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select an angler…</option>
                    {anglers
                      .filter((a) => !linkedAnglerIds.has(a.id))
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.firstName} {a.lastName}
                        </option>
                      ))}
                  </select>
                )}

                <button
                  onClick={handleLink}
                  disabled={isLinking || (!selectedAnglerId && !isCreatingNew) || (isCreatingNew && (!newFirst.trim() || !newLast.trim()))}
                  className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isLinking ? <Loader2 size={14} className="animate-spin" /> : <Link size={14} />}
                  Link
                </button>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
