import TitleBar from './TitleBar'
import CourseTree from './Sidebar/CourseTree'
import MarkdownEditor from './Editor/MarkdownEditor'
import AIPanel from './AI/AIPanel'
import WeatherWidget from './Weather/WeatherWidget'
import WeatherEffects from './Weather/WeatherEffects'
import { useAiStore } from '../stores/aiStore'
import { useNoteStore } from '../stores/noteStore'

export default function Layout() {
  const isAIPanelOpen = useAiStore((s) => s.isAIPanelOpen)
  const setAIPanelOpen = useAiStore((s) => s.setAIPanelOpen)
  const currentChapter = useNoteStore((s) => s.currentChapter)
  const isEditing = !!currentChapter

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Weather effects background */}
      <WeatherEffects />

      {/* Title bar */}
      <TitleBar
        onToggleAI={() => setAIPanelOpen(!isAIPanelOpen)}
        aiPanelOpen={isAIPanelOpen}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {isEditing ? (
          <>
            {/* Editor (full width when editing) */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <MarkdownEditor />
            </div>

            {/* AI Panel */}
            {isAIPanelOpen && (
              <div className="w-80 flex-shrink-0 border-l border-dark-border bg-dark-surface/85">
                <AIPanel />
              </div>
            )}
          </>
        ) : (
          /* Navigation view: Courses + Chapters */
          <div className="flex-1 bg-dark-surface/85 overflow-y-auto">
            <CourseTree />
          </div>
        )}
      </div>

      {/* Weather widget (bottom-right) */}
      <div className="absolute bottom-2 right-2 z-20">
        <WeatherWidget />
      </div>
    </div>
  )
}
