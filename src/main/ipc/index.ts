import { WindowManager } from '../windows/WindowManager'
import { registerNoteHandlers } from './noteHandlers'
import { registerAiHandlers } from './aiHandlers'
import { registerWeatherHandlers } from './weatherHandlers'
import { registerConfigHandlers } from './configHandlers'

export function registerIpcHandlers(wm: WindowManager): void {
  registerNoteHandlers()
  registerAiHandlers(wm)
  registerWeatherHandlers()
  registerConfigHandlers()
}
