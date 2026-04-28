import { Cloud, CloudRain, Sun, Snowflake, CloudFog, CloudLightning, Wind, CloudOff, Loader2 } from 'lucide-react'
import { useWeatherStore } from '../../stores/weatherStore'

const weatherIcons: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Drizzle: CloudRain,
  Thunderstorm: CloudLightning,
  Snow: Snowflake,
  Mist: CloudFog,
  Haze: CloudFog,
  Fog: CloudFog,
  Dust: Wind
}

function getWeatherIcon(main: string) {
  const Icon = weatherIcons[main] || Cloud
  return Icon
}

export default function WeatherWidget() {
  const data = useWeatherStore((s) => s.data)
  const loading = useWeatherStore((s) => s.loading)
  const error = useWeatherStore((s) => s.error)

  if (loading && !data) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-dark-surface/80 backdrop-blur text-dark-muted text-xs">
        <Loader2 size={12} className="animate-spin" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-surface/80 backdrop-blur text-xs border border-yellow-500/30 cursor-default"
        title={`天气错误: ${error}`}
      >
        <CloudOff size={12} className="text-yellow-500" />
        <span className="text-yellow-500/70">天气异常</span>
      </div>
    )
  }

  if (!data) return null

  const weather = data.weather[0]
  const Icon = getWeatherIcon(weather.main)
  const temp = Math.round(data.main.temp)

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-surface/80 backdrop-blur text-dark-text text-xs border border-dark-border/50 hover:bg-dark-surface transition-colors cursor-default"
      title={`${data.name}: ${weather.description}, 体感 ${Math.round(data.main.feels_like)}°C, 湿度 ${data.main.humidity}%`}
    >
      <Icon size={14} className="text-dark-accent" />
      <span className="font-medium">{temp}°C</span>
      <span className="text-dark-muted">{data.name}</span>
    </div>
  )
}
