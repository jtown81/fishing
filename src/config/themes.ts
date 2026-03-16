/**
 * Theme Configuration System
 * Defines 5 fish-species themes with complete color, typography, and animation settings
 */

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  border: string
  gradient: {
    from: string
    to: string
  }
}

export interface ThemeTypography {
  fontFamily: string
  fontUrl?: string
}

export interface ThemeAnimations {
  enabled: boolean
  speed: 'slow' | 'normal' | 'fast'
}

export interface ThemeIcons {
  speciesEmoji: string
  fileName: string
}

export interface ThemeConfig {
  id: string
  name: string
  species: string
  description: string
  tagline: string
  colors: ThemeColors
  typography: ThemeTypography
  animations: ThemeAnimations
  icons: ThemeIcons
}

export const THEMES: Record<string, ThemeConfig> = {
  walleye: {
    id: 'walleye',
    name: 'Walleye',
    species: 'Walleye (Sander vitreus)',
    description: 'Professional, precise, technical. The twilight hunter with low-light precision.',
    tagline: 'The Twilight Hunter',
    colors: {
      primary: '#8B6914', // Deep amber
      secondary: '#2F3F4F', // Slate gray
      accent: '#DAA520', // Gold
      background: '#F5F3F0', // Off-white
      text: '#1a1a1a', // Near black
      border: '#C9B99E', // Tan
      gradient: {
        from: '#8B6914',
        to: '#1A3F5C', // Twilight blue
      },
    },
    typography: {
      fontFamily: "'Montserrat', sans-serif",
      fontUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap',
    },
    animations: {
      enabled: true,
      speed: 'slow',
    },
    icons: {
      speciesEmoji: '🌙',
      fileName: 'walleye',
    },
  },

  bass: {
    id: 'bass',
    name: 'Largemouth Bass',
    species: 'Largemouth Bass (Micropterus salmoides)',
    description: 'Energetic, explosive, mainstream appeal. The most popular game fish.',
    tagline: 'The Power Play',
    colors: {
      primary: '#1B4D2F', // Deep forest green
      secondary: '#B8860B', // Bronze
      accent: '#32CD32', // Lime green
      background: '#F0FDF4', // Very light green
      text: '#1a1a1a',
      border: '#86B367', // Sage green
      gradient: {
        from: '#1B4D2F',
        to: '#FF8C42', // Warm sunset
      },
    },
    typography: {
      fontFamily: "'Poppins', sans-serif",
      fontUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap',
    },
    animations: {
      enabled: true,
      speed: 'normal',
    },
    icons: {
      speciesEmoji: '⚡',
      fileName: 'bass',
    },
  },

  pike: {
    id: 'pike',
    name: 'Northern Pike',
    species: 'Northern Pike (Esox lucius)',
    description: 'Aggressive, predatory, voracious. The water wolf with thrilling strikes.',
    tagline: 'The Water Wolf',
    colors: {
      primary: '#4A4A4A', // Steel gray
      secondary: '#0B3D2C', // Dark forest
      accent: '#5DADE2', // Ice blue
      background: '#F0F8FF', // Alice blue
      text: '#1a1a1a',
      border: '#A9CCE3', // Lighter ice
      gradient: {
        from: '#4A4A4A',
        to: '#5DADE2', // Steel to ice
      },
    },
    typography: {
      fontFamily: "'Roboto Flex', sans-serif",
      fontUrl: 'https://fonts.googleapis.com/css2?family=Roboto+Flex:wght@400;600;700&display=swap',
    },
    animations: {
      enabled: true,
      speed: 'fast',
    },
    icons: {
      speciesEmoji: '🧊',
      fileName: 'pike',
    },
  },

  musky: {
    id: 'musky',
    name: 'Muskellunge',
    species: 'Muskellunge (Esox masquinongy)',
    description: 'Elite, legendary, prestigious. The ultimate challenge - "The fish of ten thousand casts".',
    tagline: 'The Ultimate Challenge',
    colors: {
      primary: '#8B0000', // Deep burgundy
      secondary: '#2C2C2C', // Charcoal
      accent: '#DAA520', // Gold
      background: '#FEFEFE', // Pearl white
      text: '#1a1a1a',
      border: '#D4AF37', // Brighter gold
      gradient: {
        from: '#8B0000',
        to: '#DAA520', // Burgundy to gold
      },
    },
    typography: {
      fontFamily: "'Crimson Text', 'Georgia', serif",
      fontUrl: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&display=swap',
    },
    animations: {
      enabled: true,
      speed: 'slow',
    },
    icons: {
      speciesEmoji: '👑',
      fileName: 'musky',
    },
  },

  salmon: {
    id: 'salmon',
    name: 'Salmon',
    species: 'Salmon (Salmo & Oncorhynchus spp.)',
    description: 'Adventurous, migratory, transformative. Epic upstream battles and journeys.',
    tagline: 'The Epic Adventure',
    colors: {
      primary: '#003D5C', // Deep ocean blue
      secondary: '#FF6B6B', // Rich coral
      accent: '#FF8C42', // Sunset orange
      background: '#F5F5F5', // Off-white
      text: '#1a1a1a',
      border: '#A8D8D8', // Sea foam
      gradient: {
        from: '#003D5C',
        to: '#FF8C42', // Ocean to sunset
      },
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
    },
    animations: {
      enabled: true,
      speed: 'normal',
    },
    icons: {
      speciesEmoji: '🌊',
      fileName: 'salmon',
    },
  },
}

export const DEFAULT_THEME_ID = 'bass' // Largemouth Bass - most accessible

export function getThemeConfig(themeId: string): ThemeConfig {
  return THEMES[themeId] || THEMES[DEFAULT_THEME_ID]
}

export function getAllThemes(): ThemeConfig[] {
  return Object.values(THEMES)
}

export function getThemeCSS(themeId: string): string {
  const theme = getThemeConfig(themeId)
  return `
    --color-primary: ${theme.colors.primary};
    --color-secondary: ${theme.colors.secondary};
    --color-accent: ${theme.colors.accent};
    --color-background: ${theme.colors.background};
    --color-text: ${theme.colors.text};
    --color-border: ${theme.colors.border};
    --gradient-from: ${theme.colors.gradient.from};
    --gradient-to: ${theme.colors.gradient.to};
    --font-family: ${theme.typography.fontFamily};
  `
}
