import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  // Window controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  switchMode: () => ipcRenderer.invoke('window:switch-mode'),
  getMode: () => ipcRenderer.invoke('window:get-mode'),
  setAlwaysOnTop: (flag: boolean) => ipcRenderer.invoke('window:set-always-on-top', flag),
  onModeChanged: (cb: (mode: string) => void) => {
    ipcRenderer.on('mode:changed', (_e, mode) => cb(mode))
    return () => { ipcRenderer.removeAllListeners('mode:changed') }
  },

  // Notes
  listCourses: () => ipcRenderer.invoke('note:list-courses'),
  listChapters: (course: string) => ipcRenderer.invoke('note:list-chapters', course),
  readNote: (course: string, chapter: string) => ipcRenderer.invoke('note:read', course, chapter),
  saveNote: (course: string, chapter: string, content: string) =>
    ipcRenderer.invoke('note:save', course, chapter, content),
  createCourse: (name: string) => ipcRenderer.invoke('note:create-course', name),
  createChapter: (course: string, chapter: string) => ipcRenderer.invoke('note:create-chapter', course, chapter),
  deleteChapter: (course: string, chapter: string) => ipcRenderer.invoke('note:delete-chapter', course, chapter),
  deleteCourse: (course: string) => ipcRenderer.invoke('note:delete-course', course),
  renameChapter: (course: string, oldName: string, newName: string) =>
    ipcRenderer.invoke('note:rename-chapter', course, oldName, newName),

  // AI
  aiChat: (messages: Array<{ role: string; content: string }>) => ipcRenderer.invoke('ai:chat', messages),
  aiOrganize: (notes: string, chapterTitle: string) => ipcRenderer.invoke('ai:organize', notes, chapterTitle),
  aiAbort: () => ipcRenderer.invoke('ai:abort'),
  onAiToken: (cb: (token: string) => void) => {
    ipcRenderer.on('ai:token', (_e, token) => cb(token))
    return () => { ipcRenderer.removeAllListeners('ai:token') }
  },
  onAiDone: (cb: () => void) => {
    ipcRenderer.on('ai:done', () => cb())
    return () => { ipcRenderer.removeAllListeners('ai:done') }
  },
  onAiOrganizeToken: (cb: (token: string) => void) => {
    ipcRenderer.on('ai:organize-token', (_e, token) => cb(token))
    return () => { ipcRenderer.removeAllListeners('ai:organize-token') }
  },
  onAiOrganizeDone: (cb: (content: string) => void) => {
    ipcRenderer.on('ai:organize-done', (_e, content) => cb(content))
    return () => { ipcRenderer.removeAllListeners('ai:organize-done') }
  },
  onAiError: (cb: (error: string) => void) => {
    ipcRenderer.on('ai:error', (_e, error) => cb(error))
    return () => { ipcRenderer.removeAllListeners('ai:error') }
  },

  // Weather
  fetchWeather: (city?: string) => ipcRenderer.invoke('weather:fetch', city),
  getCachedWeather: () => ipcRenderer.invoke('weather:get-cached'),

  // Config
  getConfig: (key: string) => ipcRenderer.invoke('config:get', key),
  setConfig: (key: string, value: unknown) => ipcRenderer.invoke('config:set', key, value),
  getAllConfig: () => ipcRenderer.invoke('config:get-all'),

  // Navigation
  onNavigateSettings: (cb: () => void) => {
    ipcRenderer.on('navigate:settings', () => cb())
    return () => { ipcRenderer.removeAllListeners('navigate:settings') }
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
