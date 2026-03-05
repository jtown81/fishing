import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { TeamMember } from '@models/tournament'

interface TeamFormProps {
  nextTeamNumber: number
  onSubmit: (members: TeamMember[], teamNumber: number) => void
  onCancel: () => void
}

export default function TeamForm({
  nextTeamNumber,
  onSubmit,
  onCancel
}: TeamFormProps) {
  const [teamNumber, setTeamNumber] = useState(nextTeamNumber)
  const [members, setMembers] = useState<TeamMember[]>([
    { firstName: '', lastName: '' },
    { firstName: '', lastName: '' }
  ])

  const handleMemberChange = (
    index: number,
    field: 'firstName' | 'lastName',
    value: string
  ) => {
    const newMembers = [...members]
    newMembers[index] = { ...newMembers[index], [field]: value }
    setMembers(newMembers)
  }

  const handleAddMember = () => {
    setMembers([...members, { firstName: '', lastName: '' }])
  }

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validMembers = members.filter(
      (m) => m.firstName.trim() && m.lastName.trim()
    )

    if (validMembers.length === 0) {
      alert('Please enter at least one team member')
      return
    }

    onSubmit(validMembers, teamNumber)
  }

  return (
    <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Team Number
          </label>
          <input
            type="number"
            value={teamNumber}
            onChange={(e) => setTeamNumber(Number(e.target.value))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Team Members</h3>
          <div className="space-y-3">
            {members.map((member, index) => (
              <div key={index} className="flex gap-2 items-end">
                <input
                  type="text"
                  placeholder="First Name"
                  value={member.firstName}
                  onChange={(e) =>
                    handleMemberChange(index, 'firstName', e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={member.lastName}
                  onChange={(e) =>
                    handleMemberChange(index, 'lastName', e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddMember}
            className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Plus size={18} />
            Add Another Member
          </button>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Team
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
