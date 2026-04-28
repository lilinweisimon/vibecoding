import { useEffect, useRef, useCallback } from 'react'
import { Editor } from '@bytemd/react'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import 'bytemd/dist/index.css'
import { useNoteStore } from '../../stores/noteStore'
import { useAiStore } from '../../stores/aiStore'

const plugins = [gfm(), highlight()]

export default function MarkdownEditor() {
  const currentCourse = useNoteStore((s) => s.currentCourse)
  const currentChapter = useNoteStore((s) => s.currentChapter)
  const content = useNoteStore((s) => s.content)
  const isDirty = useNoteStore((s) => s.isDirty)
  const setContent = useNoteStore((s) => s.setContent)
  const setIsDirty = useNoteStore((s) => s.setIsDirty)
  const isAIPanelOpen = useAiStore((s) => s.isAIPanelOpen)
  const setAIPanelOpen = useAiStore((s) => s.setAIPanelOpen)

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-save with 2s debounce
  const debouncedSave = useCallback(
    (value: string) => {
      setContent(value)
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        if (currentCourse && currentChapter) {
          try {
            await window.electronAPI.saveNote(currentCourse, currentChapter, value)
            setIsDirty(false)
          } catch (e) {
            console.error('Save error:', e)
          }
        }
      }, 2000)
    },
    [currentCourse, currentChapter]
  )

  // Manual save on Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (currentCourse && currentChapter && isDirty) {
          if (saveTimer.current) clearTimeout(saveTimer.current)
          window.electronAPI.saveNote(currentCourse, currentChapter, content)
          setIsDirty(false)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentCourse, currentChapter, content, isDirty])

  // Cleanup save timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  if (!currentCourse || !currentChapter) {
    return (
      <div className="flex-1 flex items-center justify-center text-dark-muted bg-transparent">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-sm">从左侧目录选择一个章节开始记笔记</p>
          <p className="text-xs mt-2 text-dark-muted/60">
            Ctrl+Shift+A 打开 AI 助手
          </p>
          {!isAIPanelOpen && (
            <button
              onClick={() => setAIPanelOpen(true)}
              className="mt-4 px-3 py-1.5 text-xs bg-dark-highlight text-white rounded hover:bg-blue-600 transition-colors"
            >
              打开 AI 助手
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Status bar (minimal) */}
      <div className="flex items-center px-4 py-1 bg-dark-surface/70 border-b border-dark-border text-[10px] text-dark-muted backdrop-blur-sm gap-3">
        {isDirty && <span className="text-yellow-500">● 未保存</span>}
        <span className="ml-auto">{content.length} 字</span>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden bytemd-container">
        <Editor
          value={content}
          plugins={plugins}
          onChange={(v) => debouncedSave(v)}
          mode="split"
        />
      </div>
    </div>
  )
}
