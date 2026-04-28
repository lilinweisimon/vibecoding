import { BrowserWindow, screen, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

type WindowMode = 'float' | 'sidebar'

export class WindowManager {
  private window: BrowserWindow | null = null
  private mode: WindowMode = 'float'
  private windowState: { x?: number; y?: number } = {}

  getWindow(): BrowserWindow | null {
    return this.window
  }

  getMode(): WindowMode {
    return this.mode
  }

  toggleVisible(): void {
    if (!this.window) return
    if (this.window.isVisible()) {
      this.window.hide()
    } else {
      this.window.show()
      this.window.focus()
    }
  }

  createFloatWindow(): void {
    this.mode = 'float'
    const win = new BrowserWindow({
      width: 420,
      height: 600,
      x: this.windowState.x,
      y: this.windowState.y,
      frame: false,
      alwaysOnTop: true,
      resizable: true,
      minWidth: 360,
      minHeight: 400,
      skipTaskbar: true,
      title: 'BiliNote',
      backgroundColor: '#0d1117',
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false
      }
    })

    win.on('close', () => {
      const bounds = win.getBounds()
      this.windowState = { x: bounds.x, y: bounds.y }
    })

    win.on('closed', () => {
      this.window = null
    })

    this.setupWindow(win)
  }

  createSidebarWindow(): void {
    this.mode = 'sidebar'
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize
    const sidebarWidth = 420

    const win = new BrowserWindow({
      width: sidebarWidth,
      height: screenHeight,
      x: screenWidth - sidebarWidth,
      y: 0,
      frame: false,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      title: 'BiliNote',
      backgroundColor: '#0d1117',
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false
      }
    })

    win.setBounds({ x: screenWidth - sidebarWidth, y: 0, width: sidebarWidth, height: screenHeight })

    this.setupWindow(win)
  }

  switchMode(): void {
    if (!this.window) return
    const bounds = this.window.getBounds()
    this.windowState = { x: bounds.x, y: bounds.y }

    const oldWindow = this.window
    oldWindow.removeAllListeners('closed')
    oldWindow.close()
    this.window = null

    if (this.mode === 'float') {
      this.createSidebarWindow()
    } else {
      this.createFloatWindow()
    }

    if (this.window) {
      this.window.webContents.send('mode:changed', this.mode)
    }
  }

  setAlwaysOnTop(flag: boolean): void {
    this.window?.setAlwaysOnTop(flag)
  }

  private setupWindow(win: BrowserWindow): void {
    this.window = win

    win.on('ready-to-show', () => {
      win.show()
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      win.loadFile(join(__dirname, '../renderer/index.html'))
    }

    // IPC for window controls
    ipcMain.handle('window:minimize', () => win.minimize())
    ipcMain.handle('window:maximize', () => {
      if (win.isMaximized()) win.unmaximize()
      else win.maximize()
    })
    ipcMain.handle('window:close', () => win.hide())
    ipcMain.handle('window:switch-mode', () => this.switchMode())
    ipcMain.handle('window:get-mode', () => this.mode)
    ipcMain.handle('window:set-always-on-top', (_e, flag: boolean) => this.setAlwaysOnTop(flag))
  }
}
