import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, Loader2, Sparkles } from 'lucide-react'
import { useAiStore } from '../../stores/aiStore'
import { useNoteStore } from '../../stores/noteStore'
import ChatMessage from './ChatMessage'
import ChapterOrganize from './ChapterOrganize'
import { useAI } from '../../hooks/useAI'

export default function AIPanel() {
  const messages = useAiStore((s) => s.messages)
  const isStreaming = useAiStore((s) => s.isStreaming)
  const streamingContent = useAiStore((s) => s.streamingContent)
  const clearMessages = useAiStore((s) => s.clearMessages)
  const currentCourse = useNoteStore((s) => s.currentCourse)
  const currentChapter = useNoteStore((s) => s.currentChapter)
  const content = useNoteStore((s) => s.content)

  const [input, setInput] = useState('')
  const [showOrganize, setShowOrganize] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { sendMessage, organize } = useAI()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return
    const userMsg = input.trim()
    setInput('')

    // Include current note context
    let contextMsg = userMsg
    if (currentChapter && content) {
      contextMsg = `【当前笔记上下文 - 课程:${currentCourse} 章节:${currentChapter}】\n${content.slice(0, 2000)}\n\n【用户问题】\n${userMsg}`
    }

    await sendMessage(contextMsg)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-dark-accent" />
          <span className="text-xs font-semibold text-dark-muted uppercase tracking-wider">AI 助手</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowOrganize(!showOrganize)}
            className={`p-1 rounded text-xs ${
              showOrganize ? 'bg-dark-accent/20 text-dark-accent' : 'text-dark-muted hover:text-dark-text'
            }`}
            title="章节整理"
          >
            <Sparkles size={13} />
          </button>
          <button
            onClick={clearMessages}
            className="p-1 rounded text-dark-muted hover:text-dark-text"
            title="清空对话"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Chapter organize panel */}
      {showOrganize && (
        <ChapterOrganize
          onClose={() => setShowOrganize(false)}
          course={currentCourse}
          chapter={currentChapter}
          notes={content}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && !isStreaming && (
          <div className="text-center text-dark-muted py-8">
            <Sparkles size={24} className="mx-auto mb-2 text-dark-muted/50" />
            <p className="text-xs">可以问我关于笔记内容的问题</p>
            <p className="text-[10px] mt-1 text-dark-muted/50">AI 会基于当前笔记上下文回答</p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Streaming message */}
        {isStreaming && streamingContent && (
          <ChatMessage
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingContent,
              isStreaming: true,
              timestamp: Date.now()
            }}
          />
        )}

        {isStreaming && !streamingContent && (
          <div className="flex items-center gap-2 text-dark-muted text-xs py-2">
            <Loader2 size={14} className="animate-spin" />
            AI 思考中...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-dark-border">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-dark-bg text-dark-text text-sm px-3 py-2 rounded-lg border border-dark-border focus:border-dark-accent outline-none resize-none"
            placeholder="输入问题... (Enter 发送)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="p-2 rounded-lg bg-dark-highlight text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-[10px] text-dark-muted/50 mt-1.5 text-center">
          DeepSeek AI · 基于当前笔记上下文回答
        </p>
      </div>
    </div>
  )
}
