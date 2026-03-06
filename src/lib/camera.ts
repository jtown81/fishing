/**
 * Camera abstraction — native (Capacitor) on iOS/Android, file input on web.
 */

import { Capacitor } from '@capacitor/core'

/**
 * Capture a photo and return a base64 JPEG data URL, or null if cancelled.
 */
export async function capturePhoto(): Promise<string | null> {
  if (Capacitor.isNativePlatform()) {
    return captureNative()
  }
  return captureWeb()
}

async function captureNative(): Promise<string | null> {
  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 80,
      allowEditing: false
    })
    return photo.dataUrl ?? null
  } catch {
    // User cancelled or permission denied
    return null
  }
}

function captureWeb(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'

    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) {
        resolve(null)
        return
      }
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    }

    input.oncancel = () => resolve(null)

    // Cleanup after 5 minutes
    setTimeout(() => resolve(null), 5 * 60 * 1000)

    input.click()
  })
}
