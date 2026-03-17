/**
 * Theme-Specific Messaging System
 * Congratulatory messages and flavor text based on species theme
 */

export type ThemeId = 'walleye' | 'bass' | 'pike' | 'musky' | 'salmon'

export interface ThemeMessages {
  congratulations: string[]
  newRecord: string[]
  bigCatch: string[]
  consistent: string[]
  improved: string[]
  teamwork: string[]
  dashboardLoad: string[]
  tournamentStart: string[]
  endOfDay: string[]
}

export const themeMessages: Record<ThemeId, ThemeMessages> = {
  walleye: {
    congratulations: [
      '🌙 Perfect precision strike! You\'ve mastered the twilight hunting.',
      '⚡ Flawless execution! That\'s textbook walleye expertise.',
      '🎯 Excellent low-light vision at work! You caught it all.',
      '🌙 Another perfect night hunt! Your strategy is impeccable.',
    ],
    newRecord: [
      '🏆 NEW RECORD! You\'ve shattered the previous mark with precision!',
      '⭐ Record-breaking performance! The twilight hunter reigns supreme!',
      '🌙 Historic catch! This will be remembered as a legendary moment!',
    ],
    bigCatch: [
      '🎣 That\'s a monster walleye! The size is astounding!',
      '💪 Absolutely massive! You\'ve landed a trophy-class fish!',
      '🌙 What a specimen! Your technique brought in a giant!',
    ],
    consistent: [
      '⚡ Rock-solid performance! Your consistency is remarkable.',
      '🎯 Day after day, you deliver! That\'s true mastery.',
      '📈 Your steady approach is paying off beautifully!',
    ],
    improved: [
      '📈 Major improvement! You\'re getting better every round!',
      '🌟 Look at that progress! You\'ve leveled up significantly!',
      '💡 Smart adjustments paying off! You\'re on fire!',
    ],
    teamwork: [
      '👥 Great teamwork! Your partner brought the power!',
      '🤝 Perfect balance between both anglers! Excellent coordination!',
      '⚙️ Working like a well-oiled machine! Both teammates delivered!',
    ],
    dashboardLoad: [
      '🌙 Welcome back to the twilight hunt, angler.',
      '⭐ Time to review your precision catches.',
      '🎯 Let\'s see how your strategy paid off.',
    ],
    tournamentStart: [
      '🌙 The twilight hunt begins! Show everyone your expertise.',
      '⚡ Time to demonstrate true walleye mastery.',
      '🎣 Your precision awaits. Let\'s catch some legends.',
    ],
    endOfDay: [
      '🌙 Another successful night of hunting. Great work!',
      '⭐ Day complete. Your catches will be remembered.',
      '🎯 Solid precision throughout. Well executed!',
    ],
  },

  bass: {
    congratulations: [
      '⚡ EXPLOSIVE! That\'s the power play we\'re talking about!',
      '💥 YES! Aggressive hunting at its finest!',
      '🎆 That\'s INTENSE! Your strikes are LEGENDARY!',
      '🔥 PHENOMENAL! You\'re on FIRE right now!',
    ],
    newRecord: [
      '🏆 RECORD BREAKER! You\'ve DOMINATED the competition!',
      '⭐ HISTORIC! This is a moment for the ages!',
      '🎉 ALL-TIME BEST! Nobody can touch your performance!',
    ],
    bigCatch: [
      '💪 MONSTER BASS! That\'s absolutely MASSIVE!',
      '🎣 MEGA CATCH! Your strength brought it in!',
      '🌊 EXPLOSIVE strike results in a TROPHY!',
    ],
    consistent: [
      '📈 UNSTOPPABLE! Your consistency is INCREDIBLE!',
      '🔥 ON FIRE! Day after day, you DOMINATE!',
      '⚡ POWERED UP! Your performance is RELENTLESS!',
    ],
    improved: [
      '🚀 BREAKTHROUGH! You\'re SURGING forward!',
      '📊 SKYROCKETING! Your improvement is SPECTACULAR!',
      '💥 TRANSFORMATION! You\'re a NEW player!',
    ],
    teamwork: [
      '👥 POWER TEAM! You and your partner are UNSTOPPABLE!',
      '🤝 DYNAMIC DUO! The chemistry is ELECTRIC!',
      '⚙️ SYNCHRONIZED DESTRUCTION! Perfect teamwork!',
    ],
    dashboardLoad: [
      '⚡ Welcome back, champion! Let\'s see your EXPLOSIVE results!',
      '🎉 Ready to celebrate your POWER moves?',
      '💪 Time to review your DOMINANT performance!',
    ],
    tournamentStart: [
      '⚡ POWER PLAY TIME! Show them your aggression!',
      '💥 The hunt is ON! EXPLODE onto the scene!',
      '🔥 Let\'s DOMINATE this tournament!',
    ],
    endOfDay: [
      '⚡ INCREDIBLE day of POWERFUL fishing!',
      '🎉 You brought the EXPLOSIVENESS today!',
      '💪 DOMINANT performance throughout!',
    ],
  },

  pike: {
    congratulations: [
      '🧊 STRIKE! That\'s pure predatory excellence!',
      '💧 Crystalline execution! Your hunting is SHARP!',
      '⚔️ PREDATORY perfection! You\'ve struck with precision!',
      '🌀 Icy cold calculations paid off! Excellent work!',
    ],
    newRecord: [
      '🏆 LEGENDARY STRIKE! The water wolf reigns supreme!',
      '⭐ RECORD-BREAKING prowess! You are the apex predator!',
      '💎 CRYSTALLINE brilliance! History is made!',
    ],
    bigCatch: [
      '🐺 MASSIVE PREDATOR! That\'s an absolute BEAST!',
      '❄️ That pike is ENORMOUS! Your strength conquered it!',
      '⚔️ APEX hunter bringing in a TROPHY!',
    ],
    consistent: [
      '🧊 RELENTLESS predator! Your consistency is DEVASTATING!',
      '💧 Day after day, you STRIKE with precision!',
      '🌀 Icy determination paying off EVERY time!',
    ],
    improved: [
      '📈 SHARPER instincts! Your improvement is RAZOR-EDGED!',
      '❄️ CRYSTALLIZING your skills! You\'re ASCENDANT!',
      '💎 GLACIAL progress turning into DOMINANCE!',
    ],
    teamwork: [
      '👥 PREDATORY pair! You and your partner HUNT together!',
      '🤝 COORDINATED strikes! Your teamwork is VICIOUS!',
      '⚙️ TWO apex predators! UNSTOPPABLE combination!',
    ],
    dashboardLoad: [
      '🧊 Welcome, water wolf. Review your strikes.',
      '❄️ Time to see your predatory performance.',
      '⚔️ Your icy excellence awaits review.',
    ],
    tournamentStart: [
      '🧊 The predator emerges. TIME TO HUNT!',
      '⚔️ Sharpen your instincts. The competition begins!',
      '🌀 Release the water wolf. STRIKE!',
    ],
    endOfDay: [
      '🧊 Another day of CRYSTALLINE excellence!',
      '⭐ Your predatory skills DOMINATED today!',
      '⚔️ The water wolf has FEASTED!',
    ],
  },

  musky: {
    congratulations: [
      '👑 LEGENDARY performance! You\'ve mastered the ultimate challenge!',
      '✨ MAGNIFICENT execution! The trophy is YOURS!',
      '🎖️ REGAL excellence! Your mastery is UNQUESTIONABLE!',
      '💎 ORNATE perfection! That\'s championship-level fishing!',
    ],
    newRecord: [
      '🏆 HISTORIC MOMENT! You\'ve etched your name in LEGEND!',
      '👑 ALL-TIME CHAMPION! This record will STAND!',
      '⭐ IMMORTAL achievement! You are the MASTER!',
    ],
    bigCatch: [
      '🎖️ TROPHY OF TROPHIES! That musky is ELITE!',
      '💎 MAGNIFICENT specimen! Your legend GROWS!',
      '👑 REGAL catch! You\'ve claimed your CROWN!',
    ],
    consistent: [
      '✨ MASTERY realized! Your consistency is UNMATCHED!',
      '🎖️ Day after day, you prove your SUPREMACY!',
      '💎 Ornate execution, EVERY single time!',
    ],
    improved: [
      '📈 ASCENDING to GREATNESS! Your progress is STELLAR!',
      '👑 LEVELING UP your mastery! TRULY exceptional!',
      '✨ TRANSCENDENT improvement! You\'re LEGENDARY!',
    ],
    teamwork: [
      '👥 ELITE partnership! You and your partner are ELITE!',
      '🤝 REGAL teamwork! The chemistry is MAJESTIC!',
      '⚙️ TWO masters in harmony! CHAMPIONSHIP caliber!',
    ],
    dashboardLoad: [
      '👑 Welcome, master angler. Behold your achievements.',
      '✨ Time to review your LEGENDARY exploits.',
      '🎖️ Your mastery awaits recognition.',
    ],
    tournamentStart: [
      '👑 The ultimate challenge BEGINS! Show your mastery!',
      '✨ The ten thousand casts await. CONQUER them!',
      '🎖️ Time for LEGENDARY performance!',
    ],
    endOfDay: [
      '👑 Another day of LEGENDARY achievement!',
      '✨ Your mastery SHINED brilliantly today!',
      '🎖️ CHAMPIONSHIP-level performance throughout!',
    ],
  },

  salmon: {
    congratulations: [
      '🌊 EPIC journey! You\'ve conquered the upstream battle!',
      '🐟 POWERFUL execution! Your adventure is LEGENDARY!',
      '⛰️ TRIUMPHANT migration! You\'ve reached the summit!',
      '🌅 TRANSFORMATIVE catch! Your progress is INSPIRING!',
    ],
    newRecord: [
      '🏆 HISTORIC JOURNEY! You\'ve made it to the TOP!',
      '⭐ EPIC MILESTONE! Your salmon story is IMMORTAL!',
      '🌊 LEGENDARY ASCENT! You\'ve claimed VICTORY!',
    ],
    bigCatch: [
      '🐟 MAGNIFICENT salmon! That\'s a POWERFUL specimen!',
      '🌊 MIGHTY catch! Your strength brought in a GIANT!',
      '⛰️ TROPHY salmon! You\'ve proven your METTLE!',
    ],
    consistent: [
      '📈 RELENTLESS journey! Your upstream progress is STEADY!',
      '🌊 Day after day, you navigate the CURRENT!',
      '⛰️ Your persistent climb is INSPIRING!',
    ],
    improved: [
      '🚀 ACCELERATING upstream! Your progress is SWIFT!',
      '📊 SURGING forward! Your journey is ASCENDANT!',
      '💪 GAINING strength! Your transformation is EPIC!',
    ],
    teamwork: [
      '👥 JOURNEYING together! You and your partner are UNSTOPPABLE!',
      '🤝 SYNCHRONIZED migration! Perfect TEAMWORK!',
      '⚙️ TWO salmon swimming upstream! TOGETHER!',
    ],
    dashboardLoad: [
      '🌊 Welcome, brave migrant. See how far you\'ve come.',
      '🐟 Time to review your epic upstream journey.',
      '⛰️ Your adventure awaits appreciation.',
    ],
    tournamentStart: [
      '🌊 The epic JOURNEY begins! SWIM UPSTREAM!',
      '🐟 Time to TRANSFORM your fishing game!',
      '⛰️ The mountain AWAITS. CLIMB IT!',
    ],
    endOfDay: [
      '🌊 Another day of EPIC progress upstream!',
      '⭐ Your journey is INSPIRING and POWERFUL!',
      '⛰️ You\'ve reached NEW HEIGHTS today!',
    ],
  },
}

/**
 * Seasonal Greeting Messages
 * Short flavor text for each season overlay
 */
export type SeasonId = 'spring' | 'summer' | 'fall' | 'winter'

export const seasonalGreetings: Record<SeasonId, string[]> = {
  spring: [
    '🌱 Spring awakens the fish and the angler within',
    '🌸 Fresh season, fresh catches await',
    '🌿 The water comes alive with spring energy',
    '🦋 Renewal season brings new tournament spirit',
  ],
  summer: [
    '☀️ Summer brings the heat and the trophy fish',
    '🌞 Long days ahead for legendary catches',
    '🌊 Peak season is here—bring your A-game',
    '🔥 Summer heat fuels competitive fire',
  ],
  fall: [
    '🍂 Autumn feeds the fire of competitive angling',
    '🎃 Fall colors match our tournament passion',
    '🌤️ Cooling waters bring aggressive fish',
    '🍁 Harvest season extends to your catch',
  ],
  winter: [
    '❄️ Winter reveals the deepest secrets of the water',
    '⛸️ Cold waters challenge the best anglers',
    '🌨️ Winter mystery calls to the brave',
    '🧊 Ice-breaker tournament season begins',
  ],
}

/**
 * Get a random seasonal greeting
 */
export function getSeasonalGreeting(seasonId: SeasonId): string {
  const greetings = seasonalGreetings[seasonId]
  return greetings[Math.floor(Math.random() * greetings.length)]
}

/**
 * Get a random message from a theme's message category
 */
export function getThemeMessage(
  themeId: ThemeId,
  category: keyof ThemeMessages
): string {
  const messages = themeMessages[themeId][category]
  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Get a random dashboard message
 */
export function getDashboardMessage(themeId: ThemeId): string {
  return getThemeMessage(themeId, 'dashboardLoad')
}

/**
 * Get a random tournament start message
 */
export function getTournamentStartMessage(themeId: ThemeId): string {
  return getThemeMessage(themeId, 'tournamentStart')
}

/**
 * Get a random end-of-day message
 */
export function getEndOfDayMessage(themeId: ThemeId): string {
  return getThemeMessage(themeId, 'endOfDay')
}

/**
 * Get congratulations message for an achievement
 */
export function getCongratulationsMessage(
  themeId: ThemeId,
  type: 'newRecord' | 'bigCatch' | 'consistent' | 'improved' | 'teamwork'
): string {
  return getThemeMessage(themeId, type)
}
