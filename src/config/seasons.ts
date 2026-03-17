/**
 * Seasonal Themes Configuration
 * Overlays seasonal personality on species themes
 */

export type SeasonId = 'spring' | 'summer' | 'fall' | 'winter' | 'auto'

export interface SeasonColors {
  tint: string // Subtle overlay color
  accent: string // Seasonal accent color shift
  hueShift?: number // Degrees for hue-rotate filter
  saturate?: number // 0-2 range for saturation
  sepia?: number // 0-1 range for sepia effect
}

export interface SeasonConfig {
  id: SeasonId
  label: string
  months: number[]
  description: string
  colors: SeasonColors
  emoji: string
  greetingPrefix: string
}

export const SEASONS: Record<SeasonId, SeasonConfig> = {
  spring: {
    id: 'spring',
    label: 'Spring',
    months: [3, 4, 5],
    description: 'March - May: Fresh and energetic',
    colors: {
      tint: 'rgba(0, 128, 0, 0.04)',
      accent: '#22c55e',
      hueShift: 15,
      saturate: 1.1
    },
    emoji: '🌱',
    greetingPrefix: 'Spring awakens the fish and the angler within'
  },
  summer: {
    id: 'summer',
    label: 'Summer',
    months: [6, 7, 8],
    description: 'June - August: Warm and vibrant',
    colors: {
      tint: 'rgba(255, 200, 0, 0.04)',
      accent: '#fbbf24',
      saturate: 1.2,
      hueShift: 0
    },
    emoji: '☀️',
    greetingPrefix: 'Summer brings the heat and the trophy fish'
  },
  fall: {
    id: 'fall',
    label: 'Fall',
    months: [9, 10, 11],
    description: 'September - November: Warm and contemplative',
    colors: {
      tint: 'rgba(180, 90, 0, 0.06)',
      accent: '#d97706',
      sepia: 0.15,
      saturate: 0.95
    },
    emoji: '🍂',
    greetingPrefix: 'Autumn feeds the fire of competitive angling'
  },
  winter: {
    id: 'winter',
    label: 'Winter',
    months: [12, 1, 2],
    description: 'December - February: Cool and crystalline',
    colors: {
      tint: 'rgba(100, 140, 200, 0.06)',
      accent: '#60a5fa',
      hueShift: -20,
      saturate: 0.9
    },
    emoji: '❄️',
    greetingPrefix: 'Winter reveals the deepest secrets of the water'
  },
  auto: {
    id: 'auto',
    label: 'Auto',
    months: [],
    description: 'Automatically detected from tournament date',
    colors: {
      tint: 'rgba(0, 0, 0, 0)',
      accent: '#000000'
    },
    emoji: '⚙️',
    greetingPrefix: 'Tournament spirit guides us'
  }
}

/**
 * Detect season from a date
 * @param date Date to check
 * @returns Season ID
 */
export function detectSeason(date: Date): Exclude<SeasonId, 'auto'> {
  const month = date.getMonth() + 1 // getMonth() is 0-indexed

  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

/**
 * Get all non-auto seasons
 */
export const SEASONAL_SEASONS = Object.values(SEASONS).filter(s => s.id !== 'auto')
