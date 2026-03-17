/**
 * Message Container Component
 * Renders messages at the top-right of the app
 */

import ThemeMessage from './ThemeMessage'

export interface Message {
  id: string
  text: string
  type: 'success' | 'info' | 'achievement'
  autoClose?: boolean
  duration?: number
}

interface MessageContainerProps {
  messages: Message[]
  onRemove: (id: string) => void
}

export default function MessageContainer({
  messages,
  onRemove,
}: MessageContainerProps) {
  return (
    <div className="fixed top-6 right-6 z-50 space-y-3">
      {messages.map((msg) => (
        <ThemeMessage
          key={msg.id}
          message={msg.text}
          type={msg.type}
          autoClose={msg.autoClose !== false}
          autoCloseDuration={msg.duration || 5000}
          onClose={() => onRemove(msg.id)}
        />
      ))}
    </div>
  )
}
