import { create } from 'zustand'

interface AppState {
  windowMode: 'float' | 'sidebar'
  alwaysOnTop: boolean
  settingsOpen: boolean
  setWindowMode: (mode: 'float' | 'sidebar') => void
  setAlwaysOnTop: (flag: boolean) => void
  setSettingsOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  windowMode: 'float',
  alwaysOnTop: true,
  settingsOpen: false,
  setWindowMode: (mode) => set({ windowMode: mode }),
  setAlwaysOnTop: (flag) => set({ alwaysOnTop: flag }),
  setSettingsOpen: (open) => set({ settingsOpen: open })
}))
