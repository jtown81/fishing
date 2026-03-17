/**
 * useAchievements Hook
 * Tracks tournament achievements and milestones
 */

import { useState, useCallback, useMemo } from 'react'
import { useStandings } from './useStandings'
import { useThemeMessage } from './useThemeMessage'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
  type: 'bronze' | 'silver' | 'gold' | 'legendary'
}

export function useAchievements() {
  const standings = useStandings()
  useThemeMessage() // Initialize message system
  const [unlockedAchievements, setUnlockedAchievements] = useState<
    Set<string>
  >(new Set())

  // Calculate achievements based on standings
  const achievements = useMemo(() => {
    const achievements: Achievement[] = []

    if (standings.length === 0) return achievements

    // Largest catch (Big Fish)
    const bigFish = standings.reduce(
      (max, team) => (team.grandTotal > max.grandTotal ? team : max),
      standings[0]
    )
    if (bigFish) {
      achievements.push({
        id: 'big-fish',
        title: 'Trophy Hunter',
        description: `Caught the largest fish: ${bigFish.grandTotal.toFixed(1)} lbs`,
        icon: '🏆',
        unlocked: !unlockedAchievements.has('big-fish'),
        type: 'gold',
      })
    }

    // Most consistent (lowest variance)
    if (standings.length > 1) {
      const avgWeight =
        standings.reduce((sum, t) => sum + t.grandTotal, 0) / standings.length
      const variances = standings.map((t) => ({
        team: t,
        variance: Math.abs(t.grandTotal - avgWeight),
      }))
      const mostConsistent = variances.reduce((min, v) =>
        v.variance < min.variance ? v : min
      )

      achievements.push({
        id: 'consistent',
        title: 'Steady Angler',
        description: `Most consistent catches: ${mostConsistent.team.teamNumber}`,
        icon: '📊',
        unlocked: !unlockedAchievements.has('consistent'),
        type: 'silver',
      })
    }

    // Best improvement (Day 1 vs Day 2)
    const improvements = standings.map((t) => ({
      team: t,
      improvement: t.day2Total - t.day1Total,
    }))
    const bestImprovement = improvements.reduce((max, i) =>
      i.improvement > max.improvement ? i : max
    )
    if (bestImprovement.improvement > 0) {
      achievements.push({
        id: 'improved',
        title: 'Rising Star',
        description: `Best improvement: +${bestImprovement.improvement.toFixed(1)} lbs Day 2`,
        icon: '📈',
        unlocked: !unlockedAchievements.has('improved'),
        type: 'silver',
      })
    }

    // Participation badge (all teams caught fish)
    const teamsCaughtFish = standings.filter((t) => t.grandTotal > 0).length
    if (teamsCaughtFish === standings.length) {
      achievements.push({
        id: 'participation',
        title: 'Perfect Participation',
        description: `All ${standings.length} teams caught fish!`,
        icon: '👥',
        unlocked: !unlockedAchievements.has('participation'),
        type: 'gold',
      })
    }

    // Perfect day (all teams with great catches)
    const avgGrandTotal =
      standings.reduce((sum, t) => sum + t.grandTotal, 0) / standings.length
    if (avgGrandTotal > 10) {
      achievements.push({
        id: 'perfect-day',
        title: 'Golden Day',
        description: `Average weight: ${avgGrandTotal.toFixed(1)} lbs - Exceptional!`,
        icon: '✨',
        unlocked: !unlockedAchievements.has('perfect-day'),
        type: 'legendary',
      })
    }

    return achievements
  }, [standings, unlockedAchievements])

  const unlockAchievement = useCallback((achievementId: string) => {
    setUnlockedAchievements((prev) => new Set(prev).add(achievementId))
  }, [])

  return {
    achievements,
    unlockedAchievements,
    unlockAchievement,
  }
}
