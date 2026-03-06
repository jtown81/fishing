import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor Configuration
 * Builds native iOS/Android shells for Fishing Tournament Manager
 *
 * Build Commands:
 *   npm run build                    # Build web app
 *   npx cap sync ios|android        # Sync to native project
 *   npx cap open ios|android        # Open in Xcode/Android Studio
 *   npx cap run ios|android         # Run on simulator/emulator
 */

const config: CapacitorConfig = {
  // Core configuration
  appId: 'com.fishingtourney.app',
  appName: 'Fishing Tournament Manager',
  webDir: 'dist',

  // Server configuration
  server: {
    androidScheme: 'https',
    url: undefined, // Use local file:// by default
    cleartext: false // Only use HTTPS
  },

  // Platform-specific configurations
  ios: {
    preferredContentMode: 'mobile',
    contentInsetAdjustmentBehavior: 'automatic'
  },

  android: {
    usesCleartextTraffic: false,
    intentFilters: []
  },

  // Plugin configurations
  plugins: {
    // Core plugins (auto-enabled)
    CapacitorCookies: {
      enabled: true
    },
    CapacitorHttp: {
      enabled: true
    },

    // Camera plugin
    Camera: {
      permissions: ['photos', 'camera']
    },

    // Geolocation plugin
    Geolocation: {},

    // Push notifications plugin
    PushNotifications: {}
  }
}

export default config
