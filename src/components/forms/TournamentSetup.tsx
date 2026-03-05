import { useState } from 'react'
import { useTournamentStore } from '@modules/tournaments/tournament-store'

export default function TournamentSetup() {
  const {
    currentTournament,
    tournaments,
    setCurrentTournament,
    createTournament
  } = useTournamentStore()

  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [formData, setFormData] = useState({
    name: '',
    year: new Date().getFullYear(),
    location: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    rules: {
      maxFish: 5,
      releaseBonus: 0.2,
      teamSize: 2,
      days: 2
    }
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    if (name.startsWith('rules.')) {
      const ruleKey = name.split('.')[1] as keyof typeof formData.rules
      setFormData((prev) => ({
        ...prev,
        rules: {
          ...prev.rules,
          [ruleKey]: isNaN(Number(value)) ? value : Number(value)
        }
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const newTournament = await createTournament({
        name: formData.name,
        year: formData.year,
        location: formData.location,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        rules: formData.rules
      })

      setCurrentTournament(newTournament)
      setMode('list')
      setFormData({
        name: '',
        year: new Date().getFullYear(),
        location: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        rules: {
          maxFish: 5,
          releaseBonus: 0.2,
          teamSize: 2,
          days: 2
        }
      })
    } catch (error) {
      console.error('Failed to create tournament:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tournament Setup</h2>
      </div>

      {mode === 'list' && (
        <div className="space-y-4">
          <button
            onClick={() => setMode('create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create New Tournament
          </button>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Tournaments</h3>
            {tournaments.length === 0 ? (
              <p className="text-gray-600">No tournaments yet.</p>
            ) : (
              <div className="grid gap-2">
                {tournaments.map((tournament) => (
                  <button
                    key={tournament.id}
                    onClick={() => setCurrentTournament(tournament)}
                    className={`text-left p-4 rounded-lg border-2 transition-colors ${
                      currentTournament?.id === tournament.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <h4 className="font-semibold text-gray-900">
                      {tournament.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {tournament.location} • {tournament.year}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {mode === 'create' && (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tournament Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Max Fish per Team
                </label>
                <input
                  type="number"
                  name="rules.maxFish"
                  value={formData.rules.maxFish}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Release Bonus (lbs per fish)
                </label>
                <input
                  type="number"
                  name="rules.releaseBonus"
                  value={formData.rules.releaseBonus}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Team Size
                </label>
                <input
                  type="number"
                  name="rules.teamSize"
                  value={formData.rules.teamSize}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Days
                </label>
                <input
                  type="number"
                  name="rules.days"
                  value={formData.rules.days}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Tournament
            </button>
            <button
              type="button"
              onClick={() => setMode('list')}
              className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
