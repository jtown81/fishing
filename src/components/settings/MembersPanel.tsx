/**
 * MembersPanel — Org-tier tournament member management.
 * Lists current members, supports invite and remove actions.
 */
import { useState } from 'react'
import { useRoleStore } from '@modules/roles'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import type { TournamentRole } from '@modules/roles'
import { UserPlus, Trash2, Loader2 } from 'lucide-react'

const ROLE_LABELS: Record<TournamentRole, string> = {
  owner: 'Owner',
  operator: 'Operator',
  viewer: 'Viewer'
}

const ROLE_COLORS: Record<TournamentRole, string> = {
  owner: 'bg-purple-100 text-purple-800',
  operator: 'bg-blue-100 text-blue-800',
  viewer: 'bg-gray-100 text-gray-700'
}

export default function MembersPanel() {
  const currentTournament = useTournamentStore((s) => s.currentTournament)
  const { members, currentRole, isLoading, inviteMember, removeMember } = useRoleStore()

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'operator' | 'viewer'>('operator')
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [isInviting, setIsInviting] = useState(false)

  if (!currentTournament) {
    return (
      <p className="text-sm text-gray-500">Select a tournament to manage members.</p>
    )
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviteError(null)
    setInviteSuccess(false)
    setIsInviting(true)
    try {
      const result = await inviteMember(currentTournament.id, inviteEmail.trim(), inviteRole)
      if (result.error) {
        setInviteError(result.error)
      } else {
        setInviteSuccess(true)
        setInviteEmail('')
        setTimeout(() => setInviteSuccess(false), 3000)
      }
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this member from the tournament?')) return
    const result = await removeMember(currentTournament.id, userId)
    if (result.error) alert(result.error)
  }

  const isOwner = currentRole === 'owner'

  return (
    <div className="space-y-4">
      {/* Members list */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Loader2 size={14} className="animate-spin" />
          Loading members…
        </div>
      ) : members.length === 0 ? (
        <p className="text-sm text-gray-500">No members yet. Invite someone below.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-900 font-medium">{member.userId}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[member.role]}`}>
                  {ROLE_LABELS[member.role]}
                </span>
              </div>
              {isOwner && member.role !== 'owner' && (
                <button
                  onClick={() => handleRemove(member.userId)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Remove member"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Invite form — only owners can invite */}
      {isOwner && (
        <form onSubmit={handleInvite} className="space-y-3 pt-2 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Invite Member</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'operator' | 'viewer')}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="operator">Operator</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              type="submit"
              disabled={isInviting}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isInviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              Invite
            </button>
          </div>
          {inviteError && (
            <p className="text-xs text-red-600">{inviteError}</p>
          )}
          {inviteSuccess && (
            <p className="text-xs text-green-600">Invitation sent successfully.</p>
          )}
        </form>
      )}
    </div>
  )
}
