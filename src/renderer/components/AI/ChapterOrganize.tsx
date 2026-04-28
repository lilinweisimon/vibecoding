import { useState } from 'react'
import { Sparkles, Loader2, X, Save } from 'lucide-react'
import { useAI } from '../../hooks/useAI'
import { useAiStore } from '../../stores/aiStore'

interface Props {
  onClose: () => void
  course: string | null
  chapter: string | null
  notes: string
}

export default function ChapterOrganize({ onClose, course, chapter, notes }: Props) {
  const [result, setResult] = useState('')
  const isOrganizing = useAiStore((s) => s.isOrganizing)
  const { organize } = useAI()

  const handleOrganize = async () => {
    if (!notes.trim() || !chapter) return
    setResult('')
    await organize(notes, chapter, (tokens) => {
      setResult(tokens)
    })
  }

  const handleSave = async () => {
    if (!course || !chapter) return
    try {
      await window.electronAPI.saveNote(course, `${chapter}_整理`, result)
      onClose()
    } catch (e) {
      console.error('Save organized note error:', e)
    }
  }

  if (!course || !chapter) {
    return (
      <div className="p-4 text-center text-dark-muted text-xs">
        请先选择一个章节
      </div>
    )
  }

  return (
    <div className="border-b border-dark-border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-dark-text">📋 整理 "{chapter}"</span>
        <button onClick={onClose} className="p-0.5 rounded hover:bg-dark-border text-dark-muted">
          <X size={14} />
        </button>
      </div>

      {!result && !isOrganizing && (
        <div>
          <p className="text-[10px] text-dark-muted mb-2">
            AI 将分析本章节笔记，生成结构化的知识总结
          </p>
          <button
            onClick={handleOrganize}
            disabled={!notes.trim()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-dark-accent/10 text-dark-accent rounded-lg hover:bg-dark-accent/20 disabled:opacity-40 transition-colors text-xs"
          >
            <Sparkles size={14} />
            开始智能整理
          </button>
        </div>
      )}

      {isOrganizing && (
        <div className="flex items-center gap-2 text-dark-accent text-xs py-2">
          <Loader2 size={14} className="animate-spin" />
          AI 正在整理中...
        </div>
      )}

      {result && !isOrganizing && (
        <div className="space-y-2">
          <div className="max-h-64 overflow-y-auto bg-dark-bg rounded-lg p-3 text-xs text-dark-text whitespace-pre-wrap border border-dark-border">
            {result}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 bg-dark-highlight text-white rounded-lg hover:bg-blue-600 text-xs transition-colors"
            >
              <Save size={12} />
              保存整理结果
            </button>
            <button
              onClick={() => setResult('')}
              className="px-3 py-1.5 text-dark-muted hover:text-dark-text text-xs transition-colors"
            >
              重新整理
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
