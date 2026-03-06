/**
 * GPS location abstraction — native (Capacitor) on iOS/Android, Web Geolocation on web.
 */

import { Capacitor } from '@capacitor/core'

export interface Location {
  lat: number
  lng: number
}

/**
 * Get current user location. Returns null if permission denied, timed out, or error.
 * Never throws.
 */
export async function getCurrentLocation(): Promise<Location | null> {
  if (Capacitor.isNativePlatform()) {
    return getCurrentLocationNative()
  }
  return getCurrentLocationWeb()
}

async function getCurrentLocationNative(): Promise<Location | null> {
  try {
    // @ts-ignore - @capacitor/geolocation may not be installed in all environments
    const { Geolocation } = await import('@capacitor/geolocation')
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    })
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }
  } catch {
    return null
  }
}

function getCurrentLocationWeb(): Promise<Location | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    const timeoutId = setTimeout(() => {
      resolve(null)
    }, 10000)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId)
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      () => {
        clearTimeout(timeoutId)
        resolve(null)
      }
    )
  })
}
