import { globalShortcut } from 'electron'
import { WindowManager } from './windows/WindowManager'

export function registerShortcuts(wm: WindowManager): void {
  globalShortcut.register('Ctrl+Shift+N', () => {
    wm.toggleVisible()
  })

  globalShortcut.register('Ctrl+Shift+M', () => {
    wm.switchMode()
  })
}
