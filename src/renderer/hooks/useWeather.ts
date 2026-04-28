import { useEffect, useRef } from 'react'
import { useWeatherStore } from '../stores/weatherStore'

export function useWeather() {
  const setData = useWeatherStore((s) => s.setData)
  const setLoading = useWeatherStore((s) => s.setLoading)
  const setError = useWeatherStore((s) => s.setError)
  const refreshTrigger = useWeatherStore((s) => s.refreshTrigger)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(false)

  const fetchWeather = async () => {
    setLoading(true)
    try {
      const result = await window.electronAPI.fetchWeather()
      if (result.success && result.data) {
        setData(result.data)
      } else if (result.error) {
        setError(result.error)
      }
    } catch (e) {
      setError('获取天气失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial load: cached first, then fresh
    window.electronAPI.getCachedWeather().then((r) => {
      if (r.success && r.data) {
        setData(r.data)
      }
    })
    fetchWeather()
    mountedRef.current = true

    // Refresh every 30 minutes
    intervalRef.current = setInterval(fetchWeather, 30 * 60 * 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Re-fetch weather when settings change (refreshTrigger increments)
  useEffect(() => {
    if (mountedRef.current) {
      fetchWeather()
    }
  }, [refreshTrigger])
}
