import { useCallback, useRef } from 'react'
import { useAiStore } from '../stores/aiStore'

export function useAI() {
  const addMessage = useAiStore((s) => s.addMessage)
  const setStreaming = useAiStore((s) => s.setStreaming)
  const setStreamingContent = useAiStore((s) => s.setStreamingContent)
  const appendStreamingContent = useAiStore((s) => s.appendStreamingContent)
  const isStreaming = useAiStore((s) => s.isStreaming)
  const setIsOrganizing = useAiStore((s) => s.setIsOrganizing)

  const cleanupRef = useRef<Array<() => void>>([])

  const sendMessage = useCallback(async (content: string) => {
    if (isStreaming) return

    // Add user message
    addMessage({
      id: '',
      role: 'user',
      content,
      timestamp: Date.now()
    })

    // Add placeholder assistant message
    addMessage({
      id: '',
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    })

    setStreaming(true)
    setStreamingContent('')

    // Setup IPC listeners
    const unsubToken = window.electronAPI.onAiToken((token) => {
      appendStreamingContent(token)
    })

    const unsubDone = window.electronAPI.onAiDone(() => {
      cleanup()
      setStreaming(false)
      const currentContent = useAiStore.getState().streamingContent
      if (currentContent) {
        // Update the assistant message with final content
        const msgs = useAiStore.getState().messages
        const lastMsg = msgs[msgs.length - 1]
        if (lastMsg && lastMsg.role === 'assistant') {
          useAiStore.getState().updateLastMessage(currentContent)
        }
      }
      setStreamingContent('')
    })

    const unsubError = window.electronAPI.onAiError((error) => {
      cleanup()
      setStreaming(false)
      setStreamingContent(error)
      const msgs = useAiStore.getState().messages
      const lastMsg = msgs[msgs.length - 1]
      if (lastMsg && lastMsg.role === 'assistant') {
        useAiStore.getState().updateLastMessage(`❌ 错误: ${error}`)
      }
      setStreamingContent('')
    })

    const cleanup = () => {
      unsubToken()
      unsubDone()
      unsubError()
    }

    cleanupRef.current.push(cleanup)

    // Build message history for context
    const messages = useAiStore.getState().messages
      .filter((m) => m.role !== 'system')
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }))

    await window.electronAPI.aiChat(messages)
  }, [isStreaming])

  const organize = useCallback(
    async (notes: string, chapterTitle: string, onTokens?: (tokens: string) => void) => {
      setIsOrganizing(true)

      let accumulated = ''

      const unsubToken = window.electronAPI.onAiOrganizeToken((token) => {
        accumulated += token
        if (onTokens) {
          onTokens(accumulated)
        }
      })

      const unsubDone = window.electronAPI.onAiOrganizeDone((content) => {
        setIsOrganizing(false)
        unsubToken()
        unsubDone()
        useAiStore.getState().setOrganizeResult(content || accumulated)
      })

      const unsubError = window.electronAPI.onAiError((error) => {
        setIsOrganizing(false)
        unsubToken()
        unsubDone()
        unsubError()
        useAiStore.getState().setOrganizeResult(`❌ 错误: ${error}`)
      })

      await window.electronAPI.aiOrganize(notes, chapterTitle)
    },
    []
  )

  const abort = useCallback(() => {
    window.electronAPI.aiAbort()
    cleanupRef.current.forEach((fn) => fn())
    cleanupRef.current = []
    setStreaming(false)
  }, [])

  return { sendMessage, organize, abort }
}
