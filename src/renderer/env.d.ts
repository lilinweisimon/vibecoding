/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
    switchMode: () => Promise<void>
    getMode: () => Promise<string>
    setAlwaysOnTop: (flag: boolean) => Promise<void>
    onModeChanged: (cb: (mode: string) => void) => () => void

    listCourses: () => Promise<Array<{ name: string; chapters: string[] }>>
    listChapters: (course: string) => Promise<string[]>
    readNote: (course: string, chapter: string) => Promise<{ success: boolean; content: string; error?: string }>
    saveNote: (course: string, chapter: string, content: string) => Promise<{ success: boolean }>
    createCourse: (name: string) => Promise<{ success: boolean; error?: string }>
    createChapter: (course: string, chapter: string) => Promise<{ success: boolean; error?: string }>
    deleteChapter: (course: string, chapter: string) => Promise<{ success: boolean }>
    deleteCourse: (course: string) => Promise<{ success: boolean }>
    renameChapter: (course: string, oldName: string, newName: string) => Promise<{ success: boolean }>

    aiChat: (messages: Array<{ role: string; content: string }>) => Promise<{ success: boolean; error?: string }>
    aiOrganize: (notes: string, chapterTitle: string) => Promise<{ success: boolean; error?: string }>
    aiAbort: () => Promise<boolean>
    onAiToken: (cb: (token: string) => void) => () => void
    onAiDone: (cb: () => void) => () => void
    onAiOrganizeToken: (cb: (token: string) => void) => () => void
    onAiOrganizeDone: (cb: (content: string) => void) => () => void
    onAiError: (cb: (error: string) => void) => () => void

    fetchWeather: (city?: string) => Promise<{ success: boolean; data?: WeatherData; error?: string; cached?: boolean }>
    getCachedWeather: () => Promise<{ success: boolean; data: WeatherData | null }>

    getConfig: (key: string) => Promise<string | boolean>
    setConfig: (key: string, value: unknown) => Promise<boolean>
    getAllConfig: () => Promise<Record<string, unknown>>

    onNavigateSettings: (cb: () => void) => () => void
  }
}

interface WeatherData {
  weather: Array<{ id: number; main: string; description: string; icon: string }>
  main: { temp: number; feels_like: number; humidity: number }
  wind: { speed: number }
  name: string
}
