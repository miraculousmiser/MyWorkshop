import { useEffect, useRef, useState } from 'react'
import { drawWeather, sceneHeight, sceneWidth, type Weather } from '../arcade/weatherScene'
import './pocket-weather.css'

const presets: { name: string; weather: Weather }[] = [
  { name: 'Clear morning', weather: { clouds: 12, wind: 10, hour: 8, rain: false } },
  { name: 'Passing shower', weather: { clouds: 92, wind: 58, hour: 14.5, rain: true } },
  { name: 'Quiet dusk', weather: { clouds: 35, wind: 20, hour: 18.75, rain: false } },
]
const initialWeather = presets[2].weather

function formatHour(hour: number) {
  const hours = Math.floor(hour)
  const minutes = Math.round((hour - hours) * 60)
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`
}

function WeatherScene({ weather, paused }: { weather: Weather; paused: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const elapsed = useRef({ time: 0, airDistance: 0 })

  useEffect(() => {
    const context = canvas.current?.getContext('2d', { alpha: false })
    if (!context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let previous: number | undefined
    const paint = () => drawWeather(context, weather, elapsed.current.airDistance, elapsed.current.time)

    function animate(now: number) {
      if (previous === undefined) previous = now
      const delta = (now - previous) / 1000
      if (delta >= 1 / 32) {
        const step = Math.min(delta, 0.05)
        previous = now
        elapsed.current.time += step
        elapsed.current.airDistance += step * weather.wind * 0.9
        paint()
      }
      frame = requestAnimationFrame(animate)
    }

    function updateMotion() {
      cancelAnimationFrame(frame)
      previous = undefined
      paint()
      if (!paused && !reducedMotion.matches && (weather.wind > 0 || weather.rain)) {
        frame = requestAnimationFrame(animate)
      }
    }

    updateMotion()
    reducedMotion.addEventListener('change', updateMotion)
    return () => {
      cancelAnimationFrame(frame)
      reducedMotion.removeEventListener('change', updateMotion)
    }
  }, [weather, paused])

  const timeOfDay = weather.hour < 7 ? 'Dawn' : weather.hour < 12 ? 'Morning' :
    weather.hour < 17 ? 'Afternoon' : weather.hour < 20.25 ? 'Evening' : 'Night'
  const sky = weather.rain ? 'rain over the lake' : weather.clouds >= 75 ? 'an overcast sky' :
    weather.clouds >= 20 ? 'scattered clouds' : 'a mostly clear sky'

  return (
    <figure className="weather-scene">
      <canvas ref={canvas} width={sceneWidth} height={sceneHeight} aria-hidden="true" />
      <figcaption>{timeOfDay} at the lake · {sky}</figcaption>
    </figure>
  )
}

type WeatherSliderProps = {
  id: string
  label: string
  value: number
  displayValue: string
  min?: number
  max?: number
  step?: number
  start: string
  end: string
  onChange: (value: number) => void
}

function WeatherSlider({
  id, label, value, displayValue, min = 0, max = 100, step = 1, start, end, onChange,
}: WeatherSliderProps) {
  return (
    <div className="weather-slider">
      <div className="weather-slider__heading">
        <label htmlFor={id}>{label}</label>
        <span aria-hidden="true">{displayValue}</span>
      </div>
      <input
        type="range" id={id} min={min} max={max} step={step} value={value}
        aria-valuetext={displayValue} onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
      />
      <div className="weather-slider__ends" aria-hidden="true"><span>{start}</span><span>{end}</span></div>
    </div>
  )
}

export function PocketWeatherPage() {
  const [weather, setWeather] = useState<Weather>(initialWeather)
  const [paused, setPaused] = useState(false)
  const windLabel = weather.wind === 0 ? 'Still' : weather.wind < 35 ? 'Breeze' : weather.wind < 70 ? 'Brisk' : 'Strong'

  return (
    <main id="main-content" className="page weather-page" tabIndex={-1}>
      <header className="weather-page__header">
        <p className="breadcrumb"><a href="#/arcade">Arcade</a><span>/</span>Pocket Weather</p>
        <h1>Pocket Weather</h1>
        <p>Set the weather over a small mountain lake. Pick a preset or make an afternoon of your own.</p>
      </header>

      <div className="weather-workbench">
        <WeatherScene weather={weather} paused={paused} />
        <section className="weather-controls" aria-labelledby="weather-controls-title">
          <h2 id="weather-controls-title">Weather controls</h2>
          <div className="weather-presets" role="group" aria-label="Weather presets">
            {presets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                aria-pressed={preset.weather.clouds === weather.clouds && preset.weather.wind === weather.wind &&
                  preset.weather.hour === weather.hour && preset.weather.rain === weather.rain}
                onClick={() => setWeather(preset.weather)}
              >
                {preset.name}
              </button>
            ))}
          </div>
          <WeatherSlider
            id="weather-clouds" label="Cloud cover" value={weather.clouds} displayValue={`${weather.clouds}%`}
            start="Clear" end="Overcast" onChange={(clouds) => setWeather((current) => ({ ...current, clouds }))}
          />
          <WeatherSlider
            id="weather-wind" label="Wind" value={weather.wind} displayValue={`${windLabel} · ${weather.wind}%`}
            start="Still" end="Strong" onChange={(wind) => setWeather((current) => ({ ...current, wind }))}
          />
          <WeatherSlider
            id="weather-hour" label="Time of day" value={weather.hour} displayValue={formatHour(weather.hour)}
            min={5} max={22} step={0.25} start="5 AM" end="10 PM"
            onChange={(hour) => setWeather((current) => ({ ...current, hour }))}
          />
          <div className="weather-controls__footer">
            <label className="weather-rain">
              <input type="checkbox" checked={weather.rain}
                onChange={(event) => setWeather({ ...weather, rain: event.currentTarget.checked })} />
              Rain
            </label>
            <button className="weather-motion" type="button" onClick={() => setPaused((current) => !current)}>
              {paused ? 'Resume motion' : 'Pause motion'}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
