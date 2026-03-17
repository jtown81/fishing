/**
 * Theme-Specific Statistics Labels
 * Different stat names and descriptions based on species theme
 */

export type ThemeId = 'walleye' | 'bass' | 'pike' | 'musky' | 'salmon'

export interface StatLabel {
  label: string
  description: string
}

export interface ThemeStatsLabels {
  avgDay1Weight: StatLabel
  avgDay2Weight: StatLabel
  bigFishDay1: StatLabel
  bigFishDay2: StatLabel
  totalFishCaught: StatLabel
  releaseRate: StatLabel
  avgCatchPerTeam: StatLabel
  teamsFishing: StatLabel
}

export const themeStatsLabels: Record<ThemeId, ThemeStatsLabels> = {
  walleye: {
    avgDay1Weight: {
      label: 'Twilight Strike Avg',
      description: 'Average weight of Day 1 catches (precise hunting)',
    },
    avgDay2Weight: {
      label: 'Night Hunt Avg',
      description: 'Average weight of Day 2 catches (enhanced vision)',
    },
    bigFishDay1: {
      label: 'Largest Day 1 Strike',
      description: 'Biggest single fish caught on Day 1',
    },
    bigFishDay2: {
      label: 'Largest Night Catch',
      description: 'Biggest single fish caught on Day 2',
    },
    totalFishCaught: {
      label: 'Total Precision Catches',
      description: 'Combined fish count across both days',
    },
    releaseRate: {
      label: 'Conservation Rate',
      description: 'Percentage of fish released (walleye conservation)',
    },
    avgCatchPerTeam: {
      label: 'Avg Catches/Team',
      description: 'Average fish per team across both days',
    },
    teamsFishing: {
      label: 'Teams Hunting',
      description: 'Teams that caught at least one fish',
    },
  },

  bass: {
    avgDay1Weight: {
      label: 'Power Play Avg D1',
      description: 'Average aggressive catch weight (Day 1)',
    },
    avgDay2Weight: {
      label: 'Explosive Avg D2',
      description: 'Average aggressive catch weight (Day 2)',
    },
    bigFishDay1: {
      label: 'BIGGEST Strike D1',
      description: 'MASSIVE single fish on Day 1',
    },
    bigFishDay2: {
      label: 'BIGGEST Strike D2',
      description: 'MASSIVE single fish on Day 2',
    },
    totalFishCaught: {
      label: 'POWER Catches Total',
      description: 'Total aggressive strikes across both days',
    },
    releaseRate: {
      label: 'Tournament Release %',
      description: 'Percentage of fish released back',
    },
    avgCatchPerTeam: {
      label: 'Avg Strikes/Team',
      description: 'Average fish caught per team',
    },
    teamsFishing: {
      label: 'Teams in Action',
      description: 'Teams with at least one catch',
    },
  },

  pike: {
    avgDay1Weight: {
      label: 'Predator Avg D1',
      description: 'Average hunting success on Day 1',
    },
    avgDay2Weight: {
      label: 'Strike Avg D2',
      description: 'Average hunting success on Day 2',
    },
    bigFishDay1: {
      label: 'Apex Catch D1',
      description: 'Largest apex predator on Day 1',
    },
    bigFishDay2: {
      label: 'Apex Catch D2',
      description: 'Largest apex predator on Day 2',
    },
    totalFishCaught: {
      label: 'Total Hunts',
      description: 'Total predatory strikes across both days',
    },
    releaseRate: {
      label: 'Conservation %',
      description: 'Percentage of fish released (water wolf ethics)',
    },
    avgCatchPerTeam: {
      label: 'Avg Hunts/Team',
      description: 'Average predatory success per team',
    },
    teamsFishing: {
      label: 'Hunting Teams',
      description: 'Teams that successfully hunted',
    },
  },

  musky: {
    avgDay1Weight: {
      label: 'Mastery Avg D1',
      description: 'Average catch weight demonstrating expertise',
    },
    avgDay2Weight: {
      label: 'Excellence Avg D2',
      description: 'Average catch weight on Day 2',
    },
    bigFishDay1: {
      label: 'Trophy D1',
      description: 'Championship-level catch on Day 1',
    },
    bigFishDay2: {
      label: 'Trophy D2',
      description: 'Championship-level catch on Day 2',
    },
    totalFishCaught: {
      label: 'Total Legendary Catches',
      description: 'Total catches across the ultimate challenge',
    },
    releaseRate: {
      label: 'Stewardship %',
      description: 'Percentage of fish released (mastery includes ethics)',
    },
    avgCatchPerTeam: {
      label: 'Avg Mastery Score',
      description: 'Average catch quality per team',
    },
    teamsFishing: {
      label: 'Teams in Contention',
      description: 'Teams that competed successfully',
    },
  },

  salmon: {
    avgDay1Weight: {
      label: 'Upstream Avg D1',
      description: 'Average weight of Day 1 journey catches',
    },
    avgDay2Weight: {
      label: 'Summit Avg D2',
      description: 'Average weight of Day 2 catches (approaching peak)',
    },
    bigFishDay1: {
      label: 'Mighty Salmon D1',
      description: 'Largest migration specimen on Day 1',
    },
    bigFishDay2: {
      label: 'Peak Salmon D2',
      description: 'Largest specimen caught near the summit',
    },
    totalFishCaught: {
      label: 'Total Journey Catches',
      description: 'All fish caught during the epic upstream journey',
    },
    releaseRate: {
      label: 'Migration %',
      description: 'Percentage of fish released (supporting population)',
    },
    avgCatchPerTeam: {
      label: 'Avg Climbs/Team',
      description: 'Average catches per team on the journey',
    },
    teamsFishing: {
      label: 'Teams Migrating',
      description: 'Teams that successfully caught salmon',
    },
  },
}

/**
 * Get a stat label for the current theme
 */
export function getStatLabel(
  themeId: ThemeId,
  statKey: keyof ThemeStatsLabels
): StatLabel {
  return themeStatsLabels[themeId][statKey]
}
