import { useMemo } from 'react'
import { useWeatherStore } from '../../stores/weatherStore'

function RainEffect() {
  const drops = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${0.7 + Math.random() * 0.8}s`,
        delay: `${Math.random() * 2}s`
      })),
    []
  )

  return (
    <div className="rain-container">
      {drops.map((d) => (
        <div
          key={d.id}
          className="rain-drop"
          style={
            {
              '--left': d.left,
              '--duration': d.duration,
              '--delay': d.delay
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

function SnowEffect() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${5 + Math.random() * 6}s`,
        delay: `${Math.random() * 8}s`,
        size: `${3 + Math.random() * 4}px`
      })),
    []
  )

  return (
    <div className="rain-container">
      {flakes.map((f) => (
        <div
          key={f.id}
          className="snowflake"
          style={
            {
              '--left': f.left,
              '--duration': f.duration,
              '--delay': f.delay,
              width: f.size,
              height: f.size
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

function CloudEffect() {
  const clouds = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        top: `${5 + i * 15}%`,
        width: `${80 + Math.random() * 80}px`,
        height: `${30 + Math.random() * 20}px`,
        duration: `${15 + Math.random() * 15}s`,
        delay: `${-Math.random() * 15}s`
      })),
    []
  )

  return (
    <>
      {clouds.map((c) => (
        <div
          key={c.id}
          className="cloud"
          style={
            {
              top: c.top,
              width: c.width,
              height: c.height,
              '--duration': c.duration,
              '--delay': c.delay
            } as React.CSSProperties
          }
        />
      ))}
    </>
  )
}

function FogEffect() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'linear-gradient(to bottom, rgba(180,190,200,0.08), transparent 40%, transparent 60%, rgba(180,190,200,0.08))',
        backdropFilter: 'blur(1px)'
      }}
    />
  )
}

export default function WeatherEffects() {
  const data = useWeatherStore((s) => s.data)

  if (!data) return null

  const weatherMain = data.weather[0]?.main

  return (
    <div className="weather-effects">
      {weatherMain === 'Rain' || weatherMain === 'Drizzle' ? (
        <RainEffect />
      ) : weatherMain === 'Thunderstorm' ? (
        <>
          <RainEffect />
          <div className="lightning-flash" />
        </>
      ) : weatherMain === 'Snow' ? (
        <SnowEffect />
      ) : weatherMain === 'Clouds' ? (
        <CloudEffect />
      ) : weatherMain === 'Clear' ? (
        <div className="sun-glow" />
      ) : weatherMain === 'Mist' || weatherMain === 'Haze' || weatherMain === 'Fog' ? (
        <FogEffect />
      ) : null}
    </div>
  )
}
