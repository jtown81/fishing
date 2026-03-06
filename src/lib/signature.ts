/**
 * Signature capture abstraction — canvas-based drawing for both touch and mouse.
 */

let isDrawing = false
let lastX = 0
let lastY = 0

/**
 * Initialize signature capture on a canvas element.
 * Returns a cleanup function to unbind all event handlers.
 */
export function initCanvas(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  // Set canvas size to match display size
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = rect.height * window.devicePixelRatio
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  // Configure pen style
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 2
  ctx.strokeStyle = '#000000'

  const startDrawing = (e: PointerEvent) => {
    isDrawing = true
    const rect = canvas.getBoundingClientRect()
    lastX = e.clientX - rect.left
    lastY = e.clientY - rect.top
  }

  const draw = (e: PointerEvent) => {
    if (!isDrawing) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.stroke()

    lastX = x
    lastY = y
  }

  const stopDrawing = () => {
    isDrawing = false
  }

  canvas.addEventListener('pointerdown', startDrawing)
  canvas.addEventListener('pointermove', draw)
  canvas.addEventListener('pointerup', stopDrawing)
  canvas.addEventListener('pointerleave', stopDrawing)

  // Return cleanup function
  return () => {
    canvas.removeEventListener('pointerdown', startDrawing)
    canvas.removeEventListener('pointermove', draw)
    canvas.removeEventListener('pointerup', stopDrawing)
    canvas.removeEventListener('pointerleave', stopDrawing)
  }
}

/**
 * Clear the signature canvas.
 */
export function clearSignature(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

/**
 * Get the signature as a data URL. Returns null if canvas is empty.
 */
export function getSignatureDataUrl(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Check if canvas is empty by examining alpha channel
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 0) return canvas.toDataURL('image/png')
  }

  return null
}
