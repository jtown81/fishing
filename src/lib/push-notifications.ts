/**
 * Push notification abstraction — native only (Capacitor).
 * All functions are no-ops on web.
 */

import { Capacitor } from '@capacitor/core'
import { supabase } from '@lib/supabase'

/**
 * Request push notification permissions. No-op on web.
 */
export async function requestPushPermissions(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  const { PushNotifications } = await import('@capacitor/push-notifications')
  const result = await PushNotifications.requestPermissions()
  if (result.receive === 'granted') {
    await PushNotifications.register()
  }
}

/**
 * Register the device push token with Supabase.
 * No-op on web or when Supabase is unconfigured.
 */
export async function registerPushDevice(userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform() || !supabase) return

  const { PushNotifications } = await import('@capacitor/push-notifications')
  const platform = Capacitor.getPlatform() as 'ios' | 'android'

  PushNotifications.addListener('registration', async (token) => {
    await supabase!
      .from('device_tokens')
      .upsert({ user_id: userId, platform, token: token.value }, { onConflict: 'user_id,token' })
  })
}

/**
 * Listen for incoming push notifications.
 * Returns an unsubscribe function. No-op on web.
 */
export function onPushReceived(handler: (data: unknown) => void): () => void {
  if (!Capacitor.isNativePlatform()) return () => {}

  let removeListener: (() => Promise<void>) | null = null

  import('@capacitor/push-notifications').then(({ PushNotifications }) => {
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      handler(notification.data)
    }).then((listener) => {
      removeListener = () => listener.remove()
    })
  })

  return () => {
    removeListener?.()
  }
}
