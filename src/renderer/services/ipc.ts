// Type-safe IPC wrapper
// All actual calls go through window.electronAPI exposed via contextBridge
// This file provides documentation and type exports

export type {
  // Types are defined in env.d.ts
}

// Helper: check if running in Electron
export const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined
