import { create } from 'zustand'

interface WeatherState {
  data: WeatherData | null
  loading: boolean
  error: string | null
  lastUpdated: number | null
  refreshTrigger: number

  setData: (data: WeatherData) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  triggerRefresh: () => void
}

export const useWeatherStore = create<WeatherState>((set) => ({
  data: null,
  loading: false,
  error: null,
  lastUpdated: null,
  refreshTrigger: 0,

  setData: (data) => set({ data, lastUpdated: Date.now(), error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  triggerRefresh: () => set((s) => ({ refreshTrigger: s.refreshTrigger + 1 }))
}))
