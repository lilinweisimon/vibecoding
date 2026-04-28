import { useEffect } from 'react'
import { useAiStore } from '../stores/aiStore'
import { useNoteStore } from '../stores/noteStore'

export function useKeyboard() {
  const setAIPanelOpen = useAiStore((s) => s.setAIPanelOpen)
  const isAIPanelOpen = useAiStore((s) => s.isAIPanelOpen)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+A: toggle AI panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        setAIPanelOpen(!isAIPanelOpen)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAIPanelOpen])
}
