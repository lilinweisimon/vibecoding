import { ipcMain } from 'electron'
import Store from 'electron-store'

interface AppConfig {
  deepseekApiKey: string
  weatherApiKey: string
  weatherCity: string
  windowMode: 'float' | 'sidebar'
  alwaysOnTop: boolean
}

export const configStore = new Store<AppConfig>({
  defaults: {
    deepseekApiKey: '',
    weatherApiKey: '',
    weatherCity: '',
    windowMode: 'float',
    alwaysOnTop: true
  }
})

export function registerConfigHandlers(): void {
  ipcMain.handle('config:get', (_e, key: keyof AppConfig) => {
    return configStore.get(key)
  })

  ipcMain.handle('config:set', (_e, key: keyof AppConfig, value: unknown) => {
    configStore.set(key, value as never)
    return true
  })

  ipcMain.handle('config:get-all', () => {
    return configStore.store
  })
}
