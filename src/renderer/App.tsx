import { useEffect } from 'react'
import { useAppStore } from './stores/appStore'
import { useNoteStore } from './stores/noteStore'
import Layout from './components/Layout'
import SettingsDialog from './components/Settings/SettingsDialog'
import { useWeather } from './hooks/useWeather'
import { useKeyboard } from './hooks/useKeyboard'

export default function App() {
  const settingsOpen = useAppStore((s) => s.settingsOpen)
  const setWindowMode = useAppStore((s) => s.setWindowMode)
  const setCourses = useNoteStore((s) => s.setCourses)

  // Initialize: load courses and window mode
  useEffect(() => {
    async function init() {
      try {
        const courses = await window.electronAPI.listCourses()
        setCourses(courses)

        const mode = await window.electronAPI.getMode()
        setWindowMode(mode as 'float' | 'sidebar')
      } catch (e) {
        console.error('Init error:', e)
      }
    }
    init()

    const unsub = window.electronAPI.onModeChanged((mode) => {
      setWindowMode(mode as 'float' | 'sidebar')
    })

    return unsub
  }, [])

  // Weather hook (loads weather in background)
  useWeather()

  // Keyboard shortcuts
  useKeyboard()

  return (
    <div className="h-screen flex flex-col bg-dark-bg/85 text-dark-text">
      <Layout />
      {settingsOpen && <SettingsDialog />}
    </div>
  )
}
