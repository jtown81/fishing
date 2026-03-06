import { useState } from 'react'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import { useTeamStore } from '@modules/teams/team-store'
import { useWeighInStore } from '@modules/weigh-ins/weigh-in-store'
import { calculateDayTotal } from '@utils/calculations'
import { capturePhoto } from '@lib/camera'
import { Camera, X } from 'lucide-react'

export default function WeighInForm() {
  const currentTournament = useTournamentStore((s) => s.currentTournament)
  const teams = useTeamStore((s) => s.teams)
  const addWeighIn = useWeighInStore((s) => s.addWeighIn)

  const [formData, setFormData] = useState({
    teamNumber: '',
    day: '1' as const,
    fishCount: '',
    rawWeight: '',
    fishReleased: '',
    bigFishWeight: '',
    receivedBy: '',
    issuedBy: ''
  })
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const releaseBonus = currentTournament?.rules.releaseBonus || 0.2

  const dayTotal = formData.rawWeight && formData.fishReleased
    ? calculateDayTotal(
      parseFloat(formData.rawWeight),
      parseInt(formData.fishReleased),
      releaseBonus
    )
    : 0

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddPhoto = async () => {
    setIsCapturing(true)
    try {
      const dataUrl = await capturePhoto()
      if (dataUrl) setPhotoDataUrl(dataUrl)
    } finally {
      setIsCapturing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const team = teams.find((t) => t.teamNumber === parseInt(formData.teamNumber))
    if (!team) {
      alert('Team not found')
      return
    }

    try {
      await addWeighIn({
        tournamentId: currentTournament!.id,
        teamId: team.id,
        teamNumber: team.teamNumber,
        day: parseInt(formData.day) as 1 | 2,
        fishCount: parseInt(formData.fishCount),
        rawWeight: parseFloat(formData.rawWeight),
        fishReleased: parseInt(formData.fishReleased),
        bigFishWeight: formData.bigFishWeight
          ? parseFloat(formData.bigFishWeight)
          : undefined,
        receivedBy: formData.receivedBy,
        issuedBy: formData.issuedBy,
        photoDataUrl: photoDataUrl ?? undefined,
        timestamp: new Date()
      })

      // Reset form
      setFormData({
        teamNumber: '',
        day: '1',
        fishCount: '',
        rawWeight: '',
        fishReleased: '',
        bigFishWeight: '',
        receivedBy: '',
        issuedBy: ''
      })
      setPhotoDataUrl(null)

      alert('Weigh-in recorded successfully')
    } catch (error) {
      console.error('Failed to add weigh-in:', error)
      alert('Failed to add weigh-in')
    }
  }

  if (!currentTournament) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-900">Please create a tournament first.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Weigh-In Entry</h2>
        <p className="text-gray-600">{currentTournament.name}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border border-gray-200 p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Team #
            </label>
            <select
              name="teamNumber"
              value={formData.teamNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a team...</option>
              {teams.map((team) => (
                <option key={team.id} value={team.teamNumber}>
                  Team {team.teamNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Day
            </label>
            <select
              name="day"
              value={formData.day}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Day 1</option>
              <option value="2">Day 2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Fish Count
            </label>
            <input
              type="number"
              name="fishCount"
              value={formData.fishCount}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Raw Weight (lbs)
            </label>
            <input
              type="number"
              name="rawWeight"
              value={formData.rawWeight}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Fish Released
            </label>
            <input
              type="number"
              name="fishReleased"
              value={formData.fishReleased}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Big Fish Weight (optional)
            </label>
            <input
              type="number"
              name="bigFishWeight"
              value={formData.bigFishWeight}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Received By
            </label>
            <input
              type="text"
              name="receivedBy"
              value={formData.receivedBy}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Issued By
            </label>
            <input
              type="text"
              name="issuedBy"
              value={formData.issuedBy}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Day Total display */}
        {dayTotal > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Calculated Day Total:</p>
            <p className="text-2xl font-bold text-blue-900">
              {dayTotal.toFixed(2)} lbs
            </p>
            <p className="text-xs text-gray-600 mt-2">
              = {formData.rawWeight} + ({formData.fishReleased} × {releaseBonus})
            </p>
          </div>
        )}

        {/* Photo capture */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddPhoto}
            disabled={isCapturing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <Camera size={16} />
            {isCapturing ? 'Capturing…' : photoDataUrl ? 'Replace Photo' : 'Add Photo'}
          </button>

          {photoDataUrl && (
            <div className="relative inline-block">
              <img
                src={photoDataUrl}
                alt="Weigh-in photo"
                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => setPhotoDataUrl(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          Record Weigh-In
        </button>
      </form>
    </div>
  )
}
