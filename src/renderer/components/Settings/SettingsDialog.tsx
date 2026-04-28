import { useState, useEffect } from 'react'
import { X, Key, MapPin, Save } from 'lucide-react'
import { useAppStore } from '../../stores/appStore'
import { useWeatherStore } from '../../stores/weatherStore'

export default function SettingsDialog() {
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)
  const triggerWeatherRefresh = useWeatherStore((s) => s.triggerRefresh)
  const [deepseekKey, setDeepseekKey] = useState('')
  const [weatherKey, setWeatherKey] = useState('')
  const [city, setCity] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const config = await window.electronAPI.getAllConfig()
      setDeepseekKey((config.deepseekApiKey as string) || '')
      setWeatherKey((config.weatherApiKey as string) || '')
      setCity((config.weatherCity as string) || '')
    }
    load()
  }, [])

  const handleSave = async () => {
    await window.electronAPI.setConfig('deepseekApiKey', deepseekKey)
    await window.electronAPI.setConfig('weatherApiKey', weatherKey)
    await window.electronAPI.setConfig('weatherCity', city)
    triggerWeatherRefresh()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-96 bg-dark-surface border border-dark-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
          <h2 className="text-sm font-semibold text-dark-text">设置</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1 rounded hover:bg-dark-border text-dark-muted hover:text-dark-text"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5">
          {/* DeepSeek API */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-dark-text">
              <Key size={14} className="text-dark-accent" />
              DeepSeek API Key
            </div>
            <input
              type="password"
              className="w-full bg-dark-bg text-dark-text text-xs px-3 py-2 rounded-lg border border-dark-border focus:border-dark-accent outline-none"
              placeholder="sk-..."
              value={deepseekKey}
              onChange={(e) => setDeepseekKey(e.target.value)}
            />
            <p className="text-[10px] text-dark-muted">
              在 <a href="#" className="text-dark-accent hover:underline">platform.deepseek.com</a> 获取 API Key
            </p>
          </div>

          {/* OpenWeatherMap API */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-dark-text">
              <Key size={14} className="text-dark-accent" />
              OpenWeatherMap API Key
            </div>
            <input
              type="password"
              className="w-full bg-dark-bg text-dark-text text-xs px-3 py-2 rounded-lg border border-dark-border focus:border-dark-accent outline-none"
              placeholder="输入 API Key..."
              value={weatherKey}
              onChange={(e) => setWeatherKey(e.target.value)}
            />
            <p className="text-[10px] text-dark-muted">
              在 openweathermap.org 免费注册获取
            </p>
          </div>

          {/* City */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-dark-text">
              <MapPin size={14} className="text-dark-accent" />
              天气城市
            </div>
            <input
              type="text"
              className="w-full bg-dark-bg text-dark-text text-xs px-3 py-2 rounded-lg border border-dark-border focus:border-dark-accent outline-none"
              placeholder="例如: Beijing, Shanghai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <p className="text-[10px] text-dark-muted">
              填写英文城市名，用于天气查询
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-dark-border flex justify-between items-center">
          <p className="text-[10px] text-dark-muted">
            API Key 仅存储在本地
          </p>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-dark-highlight text-white rounded-lg hover:bg-blue-600 text-xs font-medium transition-colors"
          >
            <Save size={14} />
            {saved ? '已保存' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  )
}
