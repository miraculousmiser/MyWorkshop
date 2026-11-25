import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { drawChart } from '../arcade/orbitalChart'
import {
  chartHeight, chartWidth, cinder, gardens, maxAngle, nursery, plotFlight, seedSupply,
  type Flight, type GardenId,
} from '../arcade/orbitalOrchard'
import './orbital-orchard.css'

const initialAim = { angle: 29, power: 58 }
const initialRound = { remaining: seedSupply, planted: [] as GardenId[], message: 'The nursery is ready.' }
const chartLabels = [
  { ...nursery, name: 'Nursery', capture: 20, labelAbove: false },
  ...gardens.map((garden) => ({ ...garden, labelAbove: garden.id === 'marigold' })),
  { ...cinder, labelAbove: false },
]

function landingText(result: Flight['result'], planted: GardenId[]) {
  if (result.kind === 'rock') return 'The flight path hits Cinder.'
  if (result.kind === 'lost') return 'The flight path misses the gardens.'
  const garden = gardens.find(({ id }) => id === result.garden)!
  return planted.includes(garden.id)
    ? `${garden.name} is already planted.`
    : `The flight path reaches ${garden.name}.`
}

type ChartProps = {
  angle: number
  planted: GardenId[]
  flight: Flight | null
  guide: Flight | undefined
  onAim: (event: MouseEvent<HTMLCanvasElement>) => void
  onFinish: (result: Flight['result']) => void
}

function OrbitalChart({ angle, planted, flight, guide, onAim, onFinish }: ChartProps) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const context = canvas.current?.getContext('2d', { alpha: false })
    if (!context) return

    drawChart(context, planted, guide, angle, flight ? { flight, progress: 0 } : undefined)
    if (!flight) return

    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 0
      : Math.min(2250, 440 + flight.points.length * 5)
    let start: number | undefined
    let frame = 0
    const advance = (now: number) => {
      start ??= now
      const progress = duration ? Math.min((now - start) / duration, 1) : 1
      drawChart(context, planted, undefined, angle, { flight, progress })
      if (progress < 1) {
        frame = requestAnimationFrame(advance)
      } else {
        onFinish(flight.result)
      }
    }
    frame = requestAnimationFrame(advance)
    return () => cancelAnimationFrame(frame)
  }, [angle, planted, flight, guide, onFinish])

  return (
    <div className="orchard-chart">
      <canvas ref={canvas} width={chartWidth} height={chartHeight} onClick={onAim} aria-hidden="true" />
      <div className="orchard-chart__labels" aria-hidden="true">
        {chartLabels.map(({ name, x, y, capture, labelAbove }) => (
          <span
            key={name}
            style={{ left: `${x / chartWidth * 100}%`, top: `${(y + (labelAbove ? -capture - 21 : capture + 6)) / chartHeight * 100}%` }}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}

export function OrbitalOrchardPage() {
  const [aim, setAim] = useState(initialAim)
  const [round, setRound] = useState(initialRound)
  const [flight, setFlight] = useState<Flight | null>(null)
  const [showGuide, setShowGuide] = useState(true)
  const preview = useMemo(() => plotFlight(aim), [aim])
  const victory = round.planted.length === gardens.length
  const finished = !flight && (victory || round.remaining === 0)
  const angleLabel = aim.angle === 0 ? 'Straight' : `${Math.abs(aim.angle)}° ${aim.angle > 0 ? 'up' : 'down'}`

  const finishFlight = useCallback((result: Flight['result']) => {
    setRound((current) => {
      if (result.kind === 'rock') return { ...current, message: 'Your seed hit Cinder.' }
      if (result.kind === 'lost') return { ...current, message: 'Your seed drifted past the gardens.' }
      const garden = gardens.find(({ id }) => id === result.garden)!
      if (current.planted.includes(garden.id)) {
        return { ...current, message: `${garden.name} already has a seed.` }
      }
      return { ...current, planted: [...current.planted, garden.id], message: `${garden.name} is planted.` }
    })
    setFlight(null)
  }, [])

  function launch() {
    if (flight || finished) return
    setRound((current) => ({ ...current, remaining: current.remaining - 1, message: 'Seed in flight.' }))
    setFlight(preview)
  }

  function restart() {
    setFlight(null)
    setRound(initialRound)
    setAim(initialAim)
  }

  function aimAtPoint(event: MouseEvent<HTMLCanvasElement>) {
    if (flight || finished) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * chartWidth
    const y = ((event.clientY - rect.top) / rect.height) * chartHeight
    const degrees = Math.atan2(nursery.y - y, x - nursery.x) * 180 / Math.PI
    const angle = Math.max(-maxAngle, Math.min(maxAngle, Math.round(degrees)))
    setAim({ ...aim, angle })
  }

  return (
    <main id="main-content" className="page orchard-page" tabIndex={-1}>
      <header className="orchard-header">
        <p className="breadcrumb"><a href="#/arcade">Arcade</a><span aria-hidden="true">/</span>Orbital Orchard</p>
        <h1>Orbital Orchard</h1>
        <p>Guide five seeds through a field of gravity. Plant all three gardens to complete the orchard.</p>
      </header>

      <div className="orchard-game">
        <OrbitalChart
          angle={aim.angle} planted={round.planted} flight={flight}
          guide={showGuide && !finished ? preview : undefined}
          onFinish={finishFlight} onAim={aimAtPoint}
        />

        <section className="orchard-controls" aria-labelledby="orchard-controls-title">
          <h2 id="orchard-controls-title">Seed launcher</h2>
          <p className="orchard-inventory"><strong>{round.remaining}</strong> of {seedSupply} seeds left</p>

          <div className="orchard-setting">
            <label htmlFor="orchard-angle">Direction <span aria-hidden="true">{angleLabel}</span></label>
            <input
              id="orchard-angle" type="range" min={-maxAngle} max={maxAngle} value={aim.angle}
              aria-valuetext={angleLabel} disabled={!!flight || finished}
              onChange={(event) => setAim({ ...aim, angle: event.currentTarget.valueAsNumber })}
            />
          </div>
          <div className="orchard-setting">
            <label htmlFor="orchard-power">Power <span aria-hidden="true">{aim.power}%</span></label>
            <input
              id="orchard-power" type="range" min={0} max={100} value={aim.power}
              aria-valuetext={`${aim.power}%`} disabled={!!flight || finished}
              onChange={(event) => setAim({ ...aim, power: event.currentTarget.valueAsNumber })}
            />
          </div>
          <label className="orchard-guide">
            <input type="checkbox" checked={showGuide} onChange={(event) => setShowGuide(event.currentTarget.checked)}
              disabled={!!flight || finished} />
            Show flight guide
          </label>
          <p className="orchard-forecast" aria-live="polite">
            {flight || finished ? '' : showGuide ? landingText(preview.result, round.planted) : 'Flight guide is off.'}
          </p>
          <div className="orchard-actions">
            <button className="orchard-launch" type="button" aria-disabled={!!flight || finished} onClick={launch}>
              Launch seed
            </button>
            <button className="orchard-restart" type="button" onClick={restart}>
              {finished ? 'Play again' : 'Restart'}
            </button>
          </div>

          <p className="orchard-result" role="status" aria-atomic="true">
            {victory
              ? `Orchard complete! ${round.remaining} ${round.remaining === 1 ? 'seed' : 'seeds'} to spare.`
              : finished ? `${round.message} Out of seeds. Try again to plant the whole orchard.` : round.message}
          </p>
        </section>
      </div>

      <div className="orchard-notes">
        <ul className="orchard-gardens" aria-label="Garden progress">
          {gardens.map((garden) => {
            const planted = round.planted.includes(garden.id)
            return <li key={garden.id}><strong>{garden.name}</strong> <span>{planted ? 'Planted' : 'Unplanted'}</span></li>
          })}
        </ul>
        <p>Tap the chart to aim or use the sliders. Aim for each garden’s dotted ring and steer clear of Cinder.</p>
      </div>
    </main>
  )
}
