/**
 * Season Utilities
 * Helpers for season detection and management
 */

import { detectSeason as detectSeasonFromDate, SeasonId } from '@config/seasons'

/**
 * Get season from tournament start date
 * @param startDate Tournament start date
 * @returns Season ID (never 'auto')
 */
export function getTournamentSeason(startDate?: Date | null): Exclude<SeasonId, 'auto'> {
  if (!startDate) {
    return detectSeasonFromDate(new Date())
  }
  return detectSeasonFromDate(new Date(startDate))
}

/**
 * Apply seasonal CSS variables to document
 * @param seasonId Season to apply
 */
export function applySeason(seasonId: SeasonId) {
  document.documentElement.setAttribute('data-season', seasonId)
}

/**
 * Get current season CSS filter
 * @param seasonId Season ID
 * @returns CSS filter string
 */
export function getSeasonFilter(seasonId: SeasonId): string {
  // Note: actual filter values are in seasonal.css
  // This is a helper for programmatic access if needed
  const filters: Record<SeasonId, string[]> = {
    spring: ['hue-rotate(15deg)', 'saturate(1.1)'],
    summer: ['saturate(1.2)'],
    fall: ['sepia(0.15)', 'saturate(0.95)'],
    winter: ['hue-rotate(-20deg)', 'saturate(0.9)'],
    auto: []
  }
  return filters[seasonId].join(' ')
}
