import { app, BrowserWindow, Tray, Menu, nativeImage, globalShortcut } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { is } from '@electron-toolkit/utils'
import { WindowManager } from './windows/WindowManager'
import { registerIpcHandlers } from './ipc'
import { registerShortcuts } from './shortcuts'

let tray: Tray | null = null
let windowManager: WindowManager | null = null

function createTrayIcon(): Electron.NativeImage {
  const iconPath = join(__dirname, '../../resources/tray-icon.png')
  if (existsSync(iconPath)) {
    return nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  }
  // Create a simple 16x16 blue/white icon programmatically
  const size = 16
  const buffer = Buffer.alloc(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    const x = i % size
    const y = Math.floor(i / size)
    const isBorder = x < 2 || x >= size - 2 || y < 2 || y >= size - 2
    const isInner = x >= 4 && x < size - 4 && y >= 4 && y < size - 4
    const offset = i * 4
    if (isBorder) {
      buffer[offset] = 31     // R
      buffer[offset + 1] = 111  // G
      buffer[offset + 2] = 235  // B
      buffer[offset + 3] = 255  // A
    } else if (isInner) {
      buffer[offset] = 31
      buffer[offset + 1] = 111
      buffer[offset + 2] = 235
      buffer[offset + 3] = 200
    } else {
      buffer[offset] = 13
      buffer[offset + 1] = 17
      buffer[offset + 2] = 23
      buffer[offset + 3] = 200
    }
  }
  return nativeImage.createFromBuffer(buffer, { width: size, height: size })
}

function createTray(): void {
  const icon = createTrayIcon()
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示/隐藏',
      click: () => windowManager?.toggleVisible()
    },
    {
      label: '切换窗口模式',
      click: () => windowManager?.switchMode()
    },
    { type: 'separator' },
    {
      label: '设置',
      click: () => windowManager?.getWindow()?.webContents.send('navigate:settings')
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('BiliNote')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => windowManager?.toggleVisible())
}

app.whenReady().then(() => {
  windowManager = new WindowManager()
  windowManager.createFloatWindow()

  registerIpcHandlers(windowManager)
  registerShortcuts(windowManager)
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager?.createFloatWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Don't quit, keep running in tray
  }
})

app.on('before-quit', () => {
  globalShortcut.unregisterAll()
})

// Extend App type to include isQuitting
declare module 'electron' {
  interface App {
    isQuitting?: boolean
  }
}
