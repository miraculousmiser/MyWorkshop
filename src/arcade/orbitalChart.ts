import { chartHeight, chartWidth, cinder, gardens, nursery, type Flight, type GardenId, type Point } from './orbitalOrchard'

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
}

function drawSky(ctx: CanvasRenderingContext2D) {
  const sky = ctx.createRadialGradient(490, 245, 12, 470, 265, 540)
  sky.addColorStop(0, '#253747')
  sky.addColorStop(1, '#101924')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, chartWidth, chartHeight)

  ctx.lineWidth = 1
  ctx.strokeStyle = '#d4e7ef14'
  ctx.beginPath()
  for (let x = 25.5; x < chartWidth; x += 50) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, chartHeight)
  }
  for (let y = 25.5; y < chartHeight; y += 50) {
    ctx.moveTo(0, y)
    ctx.lineTo(chartWidth, y)
  }
  ctx.stroke()

  ctx.fillStyle = '#e3edf1'
  for (let i = 1; i <= 63; i++) {
    const x = (i * 347.619) % chartWidth
    const y = (i * 213.497) % chartHeight
    ctx.globalAlpha = 0.14 + (i % 5) * 0.09
    circle(ctx, x, y, i % 9 === 0 ? 1.5 : 0.8)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  ctx.strokeStyle = '#d8e5ec50'
  ctx.setLineDash([2, 8])
  for (const radius of [62, 93]) {
    circle(ctx, cinder.x, cinder.y, radius)
    ctx.stroke()
  }
  ctx.setLineDash([])
}

function drawBody(
  ctx: CanvasRenderingContext2D,
  body: (typeof gardens)[number] | typeof cinder,
  planted: boolean,
) {
  const { x, y, radius, color, capture } = body
  ctx.strokeStyle = body.id === 'cinder' ? '#d5dfe449' : color + (planted ? 'db' : 'a0')
  ctx.lineWidth = planted ? 2 : 1.4
  ctx.setLineDash(planted ? [] : [3, 6])
  circle(ctx, x, y, capture)
  ctx.stroke()
  ctx.setLineDash([])

  const surface = ctx.createRadialGradient(x - radius / 3, y - radius / 2, 0, x, y, radius * 1.12)
  surface.addColorStop(0, color)
  surface.addColorStop(0.55, color + 'a4')
  surface.addColorStop(1, color + '30')
  circle(ctx, x, y, radius)
  ctx.fillStyle = surface
  ctx.fill()

  ctx.save()
  ctx.clip()
  ctx.strokeStyle = '#1019243b'
  ctx.lineWidth = 4
  for (const offset of [-9, 1, 12]) {
    ctx.beginPath()
    ctx.ellipse(x - 5, y + offset, radius * 1.7, 12, -0.23, 0, Math.PI)
    ctx.stroke()
  }
  ctx.restore()

  if (planted) {
    // A small branching sprout appears in the center of a planted planet.
    ctx.strokeStyle = '#142c2a'
    ctx.lineWidth = 2.7
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x, y + 13)
    ctx.lineTo(x, y - 4)
    ctx.quadraticCurveTo(x + 2, y - 15, x + 12, y - 14)
    ctx.quadraticCurveTo(x + 12, y - 4, x, y - 4)
    ctx.quadraticCurveTo(x - 3, y - 10, x - 11, y - 9)
    ctx.quadraticCurveTo(x - 10, y, x, y + 1)
    ctx.stroke()
  }
}

function trace(ctx: CanvasRenderingContext2D, points: Point[], count: number, color: string, dashed: boolean) {
  ctx.strokeStyle = color
  ctx.lineWidth = dashed ? 2 : 2.6
  ctx.setLineDash(dashed ? [3, 7] : [])
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let index = 1; index < count; index++) ctx.lineTo(points[index].x, points[index].y)
  ctx.stroke()
  ctx.setLineDash([])
}

export function drawChart(
  ctx: CanvasRenderingContext2D,
  planted: GardenId[],
  guide: Flight | undefined,
  angle: number,
  moving?: { flight: Flight; progress: number },
) {
  drawSky(ctx)
  for (const garden of gardens) drawBody(ctx, garden, planted.includes(garden.id))
  drawBody(ctx, cinder, false)

  const guideColor = '#f5deb2'
  if (guide && !moving) trace(ctx, guide.points, guide.points.length, guideColor + 'b8', true)

  ctx.strokeStyle = '#f5deb25c'
  ctx.lineWidth = 1.25
  circle(ctx, nursery.x, nursery.y, 18)
  ctx.stroke()
  circle(ctx, nursery.x, nursery.y, 12)
  ctx.stroke()

  let seed = nursery
  if (moving) {
    const { points } = moving.flight
    const count = Math.floor(moving.progress * (points.length - 1)) + 1
    trace(ctx, points, count, guideColor + '8a', false)
    seed = points[count - 1]
  } else {
    const radians = (angle * Math.PI) / 180
    ctx.strokeStyle = guideColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(nursery.x + Math.cos(radians) * 13, nursery.y - Math.sin(radians) * 13)
    ctx.lineTo(nursery.x + Math.cos(radians) * 36, nursery.y - Math.sin(radians) * 36)
    ctx.stroke()
  }

  ctx.fillStyle = guideColor
  ctx.shadowColor = guideColor
  ctx.shadowBlur = 12
  circle(ctx, seed.x, seed.y, 5)
  ctx.fill()
  ctx.shadowBlur = 0
}
