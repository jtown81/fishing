/**
 * Share abstraction — native share sheet on iOS/Android, clipboard/Web Share API on web.
 */

import { Capacitor } from '@capacitor/core'

/**
 * Share a URL with a title. Falls back to clipboard copy if native/web share is unavailable.
 */
export async function shareUrl(title: string, url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const { Share } = await import('@capacitor/share')
    await Share.share({ title, url, dialogTitle: title })
    return
  }

  if (navigator.share) {
    try {
      await navigator.share({ title, url })
      return
    } catch {
      // User cancelled or not supported — fall through to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(url)
  } catch {
    console.info('Share URL:', url)
  }
}
