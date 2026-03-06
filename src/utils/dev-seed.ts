/**
 * Development Seed Utility
 * Load historical tournament test data into IndexedDB
 *
 * Usage in browser console:
 * 1. Open browser DevTools console
 * 2. Run: window.__seedHistoricalData?.()
 * 3. Or: window.__clearHistoricalData?.()
 *
 * This is development-only. Not included in production builds.
 */

import { seedHistoricalData, clearHistoricalData } from '@db/seed/history-seeder'

export function initDevSeedTools() {
  if (process.env.NODE_ENV === 'development') {
    // Expose seeding functions globally for console access
    window.__seedHistoricalData = async () => {
      console.log('📊 Loading historical tournament data (2016-2022)...')
      try {
        await seedHistoricalData()
        console.log('✅ Historical data loaded! Refresh page to see tournaments.')
        return true
      } catch (err) {
        console.error('❌ Seeding failed:', err)
        return false
      }
    }

    window.__clearHistoricalData = async () => {
      if (confirm('⚠️  Clear all historical tournament data? This cannot be undone.')) {
        console.log('🗑️  Clearing historical data...')
        try {
          await clearHistoricalData()
          console.log('✅ Historical data cleared! Refresh page.')
          return true
        } catch (err) {
          console.error('❌ Clear failed:', err)
          return false
        }
      }
      return false
    }

    // Auto-seed when ?seed param is present in the URL
    const params = new URLSearchParams(window.location.search)
    if (params.has('seed')) {
      console.log('📊 Auto-seeding historical data (?seed param detected)...')
      seedHistoricalData()
        .then(() => {
          console.log('✅ Seed complete. Reloading...')
          // Remove ?seed from URL then reload so app initialises cleanly
          const clean = window.location.pathname
          window.location.replace(clean)
        })
        .catch((err) => console.error('❌ Auto-seed failed:', err))
      return // skip further init while seeding
    }

    console.log('🛠️  Dev tools loaded. Available commands:')
    console.log('  - window.__seedHistoricalData()    → Load 2016-2022 test data')
    console.log('  - window.__clearHistoricalData()   → Clear all historical tournaments')
  }
}

// Extend window type for TypeScript
declare global {
  interface Window {
    __seedHistoricalData?: () => Promise<boolean>
    __clearHistoricalData?: () => Promise<boolean>
  }
}
