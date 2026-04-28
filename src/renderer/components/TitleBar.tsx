import { ArrowLeft, MessageSquare, Settings, Minimize2, Maximize2, X } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import { useNoteStore } from '../stores/noteStore'

interface Props {
  onToggleAI: () => void
  aiPanelOpen: boolean
}

export default function TitleBar({ onToggleAI, aiPanelOpen }: Props) {
  const windowMode = useAppStore((s) => s.windowMode)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)
  const currentCourse = useNoteStore((s) => s.currentCourse)
  const currentChapter = useNoteStore((s) => s.currentChapter)
  const setCurrentCourse = useNoteStore((s) => s.setCurrentCourse)
  const isEditing = !!currentChapter

  const handleBack = () => {
    setCurrentCourse(null)
  }

  return (
    <div className="drag-region h-9 flex items-center justify-between bg-dark-surface/85 border-b border-dark-border px-2 flex-shrink-0 z-30 backdrop-blur-sm">
      <div className="flex items-center gap-1 no-drag">
        {isEditing ? (
          <>
            <button
              onClick={handleBack}
              className="p-1.5 rounded hover:bg-dark-border text-dark-muted hover:text-dark-text transition-colors"
              title="返回目录"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="text-xs text-dark-accent">{currentCourse}</span>
            <span className="text-dark-muted text-xs">/</span>
            <span className="text-xs text-dark-text">{currentChapter}</span>
          </>
        ) : (
          <>
            <span className="text-xs text-dark-muted ml-1 font-medium">BiliNote</span>
            <span className="text-[10px] text-dark-muted bg-dark-border px-1.5 py-0.5 rounded ml-1">
              {windowMode === 'float' ? '浮动' : '侧边栏'}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1 no-drag">
        <button
          onClick={onToggleAI}
          className={`p-1.5 rounded hover:bg-dark-border transition-colors ${
            aiPanelOpen ? 'text-dark-accent' : 'text-dark-muted'
          }`}
          title="AI 助手"
        >
          <MessageSquare size={16} />
        </button>
        <button
          onClick={() => window.electronAPI.switchMode()}
          className="p-1.5 rounded hover:bg-dark-border text-dark-muted hover:text-dark-text transition-colors"
          title="切换窗口模式"
        >
          <Maximize2 size={16} />
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-1.5 rounded hover:bg-dark-border text-dark-muted hover:text-dark-text transition-colors"
          title="设置"
        >
          <Settings size={16} />
        </button>
        <button
          onClick={() => window.electronAPI.minimize()}
          className="p-1.5 rounded hover:bg-dark-border text-dark-muted hover:text-dark-text transition-colors"
        >
          <Minimize2 size={16} />
        </button>
        <button
          onClick={() => window.electronAPI.close()}
          className="p-1.5 rounded hover:bg-red-500/20 text-dark-muted hover:text-red-400 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
