import { useEffect, useRef, type ReactNode } from 'react'

type LabChartProps = {
  points: readonly number[]
  comparison?: readonly number[]
  events?: readonly number[]
  ceiling: number
  timeUnit: string
  caption: ReactNode
}

export function LabChart({ points, comparison, events, ceiling, timeUnit, caption }: LabChartProps) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const surface = canvas.current
    const context = surface?.getContext('2d')
    if (!surface || !context) return

    function draw(surface: HTMLCanvasElement, context: CanvasRenderingContext2D) {
      const { width, height } = surface.getBoundingClientRect()
      if (width === 0 || height === 0) return
      const styles = getComputedStyle(surface)
      const ink = styles.getPropertyValue('--lab-ink').trim()
      const scale = Math.min(window.devicePixelRatio || 1, 2)
      surface.width = Math.round(width * scale)
      surface.height = Math.round(height * scale)
      context.scale(scale, scale)

      const left = 49
      const right = width - 16
      const top = 14
      const bottom = height - 45
      const x = (index: number) => left + (right - left) * index / (points.length - 1)
      const y = (value: number) => bottom - (bottom - top) * value / ceiling

      context.font = '12px Consolas, monospace'
      context.strokeStyle = styles.getPropertyValue('--line').trim()
      context.fillStyle = styles.getPropertyValue('--muted').trim()
      context.lineWidth = 1
      context.textBaseline = 'middle'
      context.textAlign = 'right'
      for (let tick = 0; tick <= 4; tick++) {
        const amount = ceiling * tick / 4
        const row = y(amount)
        context.beginPath()
        context.moveTo(left, row)
        context.lineTo(right, row)
        context.stroke()
        context.fillText(String(amount), left - 8, row)
      }

      context.textAlign = 'center'
      for (let tick = 0; tick <= 4; tick++) {
        const index = Math.round((points.length - 1) * tick / 4)
        const column = x(index)
        context.beginPath()
        context.moveTo(column, top)
        context.lineTo(column, bottom)
        context.stroke()
        context.fillText(String(index), column, bottom + 13)
      }
      context.fillText(timeUnit, (left + right) / 2, bottom + 33)

      function trace(values: readonly number[]) {
        context.beginPath()
        context.moveTo(x(0), y(values[0]))
        for (let index = 1; index < values.length; index++) {
          context.lineTo(x(index), y(values[index]))
        }
      }

      trace(points)
      context.lineTo(right, bottom)
      context.lineTo(left, bottom)
      context.closePath()
      context.fillStyle = ink
      context.globalAlpha = 0.14
      context.fill()
      context.globalAlpha = 1

      context.setLineDash([4, 4])
      if (events) {
        context.strokeStyle = styles.getPropertyValue('--lab-event').trim()
        for (const index of events) {
          context.beginPath()
          context.moveTo(x(index), top)
          context.lineTo(x(index), bottom)
          context.stroke()
        }
      }
      if (comparison) {
        trace(comparison)
        context.strokeStyle = styles.getPropertyValue('--lab-comparison').trim()
        context.lineWidth = 1.5
        context.stroke()
      }
      context.setLineDash([])
      trace(points)
      context.strokeStyle = ink
      context.lineWidth = 2.5
      context.lineJoin = 'round'
      context.stroke()

      context.fillStyle = ink
      context.beginPath()
      context.arc(right, y(points[points.length - 1]), 3.5, 0, 2 * Math.PI)
      context.fill()
    }

    const paint = () => draw(surface, context)
    paint()
    const observer = new ResizeObserver(paint)
    observer.observe(surface)
    return () => observer.disconnect()
  }, [points, comparison, events, ceiling, timeUnit])

  return (
    <figure className="lab-chart">
      <canvas ref={canvas} aria-hidden="true" />
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
