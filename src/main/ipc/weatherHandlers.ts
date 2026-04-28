import { ipcMain } from 'electron'
import { configStore } from './configHandlers'

const OWM_BASE = 'https://api.openweathermap.org/data/2.5'

interface WeatherCache {
  data: WeatherData | null
  timestamp: number
}

interface WeatherData {
  weather: Array<{ id: number; main: string; description: string; icon: string }>
  main: { temp: number; feels_like: number; humidity: number }
  wind: { speed: number }
  name: string
}

const cache: WeatherCache = {
  data: null,
  timestamp: 0
}

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

export function registerWeatherHandlers(): void {
  ipcMain.handle('weather:fetch', async (_e, city?: string) => {
    const apiKey = configStore.get('weatherApiKey')
    const savedCity = configStore.get('weatherCity')

    if (!apiKey) {
      return { success: false, error: '请先在设置中配置 OpenWeatherMap API Key' }
    }

    const targetCity = city || savedCity
    if (!targetCity) {
      return { success: false, error: '请先在设置中填写城市名称' }
    }

    // Check cache
    if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
      return { success: true, data: cache.data, cached: true }
    }

    try {
      const geoParams = new URLSearchParams({ q: targetCity, limit: '1', appid: apiKey })
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?${geoParams}`)
      const geoData = await geoRes.json()

      if (!geoRes.ok) {
        const msg = (geoData as { message?: string }).message || geoRes.status
        return { success: false, error: `天气 API 错误 (${msg})，请检查 API Key 是否有效` }
      }

      if (!Array.isArray(geoData) || !geoData.length) {
        return { success: false, error: `找不到城市: ${targetCity}` }
      }

      const { lat, lon } = geoData[0]

      const weatherParams = new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
        appid: apiKey,
        units: 'metric',
        lang: 'zh_cn'
      })
      const weatherRes = await fetch(`${OWM_BASE}/weather?${weatherParams}`)
      const weatherData = await weatherRes.json()

      if (!weatherRes.ok) {
        const msg = (weatherData as { message?: string }).message || weatherRes.status
        return { success: false, error: `天气 API 错误 (${msg})` }
      }

      cache.data = weatherData as WeatherData
      cache.timestamp = Date.now()

      return { success: true, data: weatherData, cached: false }
    } catch (error) {
      const message = error instanceof Error ? error.message : '请求失败'
      return { success: false, error: message }
    }
  })

  ipcMain.handle('weather:get-cached', () => {
    if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
      return { success: true, data: cache.data, cached: true }
    }
    return { success: true, data: null }
  })
}
