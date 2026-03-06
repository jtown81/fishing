import { useState } from 'react'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import { useTeamStore } from '@modules/teams/team-store'
import { Plus, Trash2, Link } from 'lucide-react'
import TeamForm from './TeamForm'
import type { Team, TeamMember } from '@models/tournament'
import AnglerLinkModal from '@components/anglers/AnglerLinkModal'

export default function TeamList() {
  const currentTournament = useTournamentStore((s) => s.currentTournament)
  const teams = useTeamStore((s) => s.teams)
  const addTeam = useTeamStore((s) => s.addTeam)
  const deleteTeam = useTeamStore((s) => s.deleteTeam)

  const [showForm, setShowForm] = useState(false)
  const [linkTeam, setLinkTeam] = useState<Team | null>(null)

  if (!currentTournament) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-900">Please create a tournament first.</p>
        </div>
      </div>
    )
  }

  const handleAddTeam = async (members: TeamMember[], teamNumber: number) => {
    try {
      await addTeam({
        tournamentId: currentTournament.id,
        teamNumber,
        members,
        status: 'active'
      })
      setShowForm(false)
    } catch (error) {
      console.error('Failed to add team:', error)
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (confirm('Delete this team?')) {
      try {
        await deleteTeam(teamId)
      } catch (error) {
        console.error('Failed to delete team:', error)
      }
    }
  }

  // Find max team number to suggest next number
  const maxTeamNumber = teams.length > 0
    ? Math.max(...teams.map((t) => t.teamNumber))
    : 0

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
          <p className="text-gray-600">{teams.length} teams registered</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Team
        </button>
      </div>

      {showForm && (
        <TeamForm
          nextTeamNumber={maxTeamNumber + 1}
          onSubmit={handleAddTeam}
          onCancel={() => setShowForm(false)}
        />
      )}

      {teams.length === 0 ? (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-600">No teams yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Team #</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Members</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teams.map((team) => (
                <tr key={team.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    #{team.teamNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {team.members
                      .map((m) => `${m.firstName} ${m.lastName}`)
                      .join(', ')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        team.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : team.status === 'inactive'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {team.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setLinkTeam(team)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-xs"
                        title="Link angler profiles"
                      >
                        <Link size={16} />
                        Anglers
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Angler link modal */}
      {linkTeam && currentTournament && (
        <AnglerLinkModal
          team={linkTeam}
          tournamentId={currentTournament.id}
          onClose={() => setLinkTeam(null)}
        />
      )}
    </div>
  )
}
