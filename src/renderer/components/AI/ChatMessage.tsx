import { User, Sparkles } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  isStreaming?: boolean
  timestamp: number
}

interface Props {
  message: Message
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-dark-highlight' : 'bg-dark-accent/20'
        }`}
      >
        {isUser ? (
          <User size={12} className="text-white" />
        ) : (
          <Sparkles size={12} className="text-dark-accent" />
        )}
      </div>

      {/* Content */}
      <div
        className={`flex-1 rounded-lg px-3 py-2 text-xs leading-relaxed ${
          isUser
            ? 'bg-dark-highlight/20 text-dark-text'
            : 'bg-dark-bg text-dark-text border border-dark-border'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-2 h-3 ml-0.5 bg-dark-accent animate-pulse align-middle" />
          )}
        </div>
      </div>
    </div>
  )
}
