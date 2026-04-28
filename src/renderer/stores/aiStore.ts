import { create } from 'zustand'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  isStreaming?: boolean
  timestamp: number
}

interface AIState {
  messages: ChatMessage[]
  isStreaming: boolean
  streamingContent: string
  organizeResult: string
  isOrganizing: boolean
  isAIPanelOpen: boolean

  addMessage: (msg: ChatMessage) => void
  updateLastMessage: (content: string) => void
  setStreaming: (streaming: boolean) => void
  setStreamingContent: (content: string) => void
  appendStreamingContent: (token: string) => void
  clearMessages: () => void
  setOrganizeResult: (result: string) => void
  setIsOrganizing: (organizing: boolean) => void
  setAIPanelOpen: (open: boolean) => void
}

let msgCounter = 0

export const useAiStore = create<AIState>((set) => ({
  messages: [],
  isStreaming: false,
  streamingContent: '',
  organizeResult: '',
  isOrganizing: false,
  isAIPanelOpen: false,

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, { ...msg, id: msg.id || String(++msgCounter) }]
    })),

  updateLastMessage: (content) =>
    set((state) => {
      const msgs = [...state.messages]
      const last = msgs[msgs.length - 1]
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content, isStreaming: false }
      }
      return { messages: msgs }
    }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setStreamingContent: (content) => set({ streamingContent: content }),
  appendStreamingContent: (token) =>
    set((state) => ({
      streamingContent: state.streamingContent + token
    })),

  clearMessages: () => set({ messages: [], streamingContent: '' }),

  setOrganizeResult: (result) => set({ organizeResult: result }),
  setIsOrganizing: (organizing) => set({ isOrganizing: organizing }),
  setAIPanelOpen: (open) => set({ isAIPanelOpen: open })
}))
