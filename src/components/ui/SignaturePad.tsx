import { useEffect, useRef } from 'react'
import { initCanvas, clearSignature, getSignatureDataUrl } from '@lib/signature'
import { RotateCcw, Check } from 'lucide-react'

interface SignaturePadProps {
  onCapture: (dataUrl: string) => void
  onClear: () => void
}

export default function SignaturePad({ onCapture, onClear }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize canvas drawing
    cleanupRef.current = initCanvas(canvasRef.current)

    return () => {
      cleanupRef.current?.()
    }
  }, [])

  const handleClear = () => {
    if (canvasRef.current) {
      clearSignature(canvasRef.current)
      onClear()
    }
  }

  const handleDone = () => {
    if (canvasRef.current) {
      const dataUrl = getSignatureDataUrl(canvasRef.current)
      if (dataUrl) {
        onCapture(dataUrl)
      }
    }
  }

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <p className="text-sm text-gray-600 mb-3">Draw your signature below:</p>
      <canvas
        ref={canvasRef}
        style={{ touchAction: 'none' }}
        className="w-full border border-gray-300 rounded bg-white"
        height={200}
      />
      <div className="flex gap-3 mt-3">
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition"
        >
          <RotateCcw size={14} />
          Clear
        </button>
        <button
          type="button"
          onClick={handleDone}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
        >
          <Check size={14} />
          Done
        </button>
      </div>
    </div>
  )
}
