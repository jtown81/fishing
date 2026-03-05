/**
 * Calcutta Service
 * Handles group generation, random draw, and auction management
 *
 * Calcutta is an auction-style betting pool where:
 * - Teams are randomly grouped (3 or 4 per group)
 * - Each group is "sold" to a buyer at auction
 * - The group with the best-performing team (highest grand total) wins
 */

import type { Team } from '@models/tournament'

export interface CalcuttaGroup {
  id: string
  groupNumber: number
  teamIds: string[]
  teamNumbers: number[]
  buyer?: string
  amount?: number
  winningTeamId?: string
  winningTeamNumber?: number
  winningScore?: number
  createdAt: Date
}

export interface CalcuttaGroupWithTeams extends CalcuttaGroup {
  teamNames: string[]
}

/**
 * Generate random Calcutta groups
 * Shuffles teams and divides into equal-sized groups
 *
 * @param teams - All registered teams
 * @param groupSize - Teams per group (3 or 4, default 4)
 * @returns Array of calcutta groups with random team assignments
 */
export function generateCalcuttaGroups(
  teams: Team[],
  groupSize: number = 4
): CalcuttaGroup[] {
  if (teams.length === 0) {
    return []
  }

  // Validate group size
  if (groupSize !== 3 && groupSize !== 4) {
    throw new Error('Group size must be 3 or 4')
  }

  // Shuffle teams using Fisher-Yates algorithm
  const shuffled = [...teams].sort(() => Math.random() - 0.5)

  // Divide into groups
  const groups: CalcuttaGroup[] = []
  let groupNumber = 1

  for (let i = 0; i < shuffled.length; i += groupSize) {
    const groupTeams = shuffled.slice(i, Math.min(i + groupSize, shuffled.length))

    // Skip incomplete last group if it would be too small
    if (groupTeams.length < 3) {
      // Redistribute into previous group if possible
      if (groups.length > 0 && groups[groups.length - 1].teamIds.length < 5) {
        groups[groups.length - 1].teamIds.push(...groupTeams.map(t => t.id))
        groups[groups.length - 1].teamNumbers.push(...groupTeams.map(t => t.teamNumber))
        continue
      }
    }

    groups.push({
      id: `calcutta-group-${Date.now()}-${groupNumber}`,
      groupNumber,
      teamIds: groupTeams.map(t => t.id),
      teamNumbers: groupTeams.map(t => t.teamNumber),
      createdAt: new Date()
    })

    groupNumber++
  }

  return groups
}

/**
 * Update group buyer and amount
 */
export function updateGroupBuyer(
  group: CalcuttaGroup,
  buyer: string,
  amount: number
): CalcuttaGroup {
  return {
    ...group,
    buyer,
    amount
  }
}

/**
 * Calculate total pool value
 */
export function calculatePoolValue(groups: CalcuttaGroup[]): number {
  return groups.reduce((sum, group) => sum + (group.amount || 0), 0)
}

/**
 * Validate all groups have buyers
 */
export function isPoolComplete(groups: CalcuttaGroup[]): boolean {
  return groups.every(group => group.buyer && group.amount !== undefined && group.amount > 0)
}

/**
 * Format group display name
 */
export function formatGroupName(group: CalcuttaGroup): string {
  const teamList = group.teamNumbers.join(', ')
  return `Group ${group.groupNumber}: Teams #${teamList}`
}

/**
 * Export Calcutta results for printing or archiving
 */
export interface CalcuttaResult {
  groupNumber: number
  teams: number[]
  buyer: string
  amount: number
  winningTeam: number
  winningScore: number
  profit?: number
}

export function exportCalcuttaResults(groups: CalcuttaGroup[]): CalcuttaResult[] {
  return groups.map(group => ({
    groupNumber: group.groupNumber,
    teams: group.teamNumbers,
    buyer: group.buyer || 'N/A',
    amount: group.amount || 0,
    winningTeam: group.winningTeamNumber || 0,
    winningScore: group.winningScore || 0
  }))
}
