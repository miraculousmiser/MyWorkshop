export type Point = { x: number; y: number }
export type AngleAndPower = { angle: number; power: number }

export const chartWidth = 800
export const chartHeight = 500
export const nursery = { x: 93, y: 273 }
export const seedSupply = 5
export const maxAngle = 70

export const gardens = [
  { id: 'marigold', name: 'Marigold', x: 515, y: 103, radius: 24, capture: 43, mass: 490000, color: '#f3bb75' },
  { id: 'fern', name: 'Fern', x: 339, y: 380, radius: 24, capture: 44, mass: 460000, color: '#92d4b2' },
  { id: 'aster', name: 'Aster', x: 686, y: 351, radius: 25, capture: 47, mass: 560000, color: '#c5b0f2' },
] as const

export type GardenId = (typeof gardens)[number]['id']

export const cinder = {
  id: 'cinder', name: 'Cinder', x: 467, y: 255, radius: 28, capture: 32, mass: 1730000, color: '#9aaabb',
} as const

const bodies = [...gardens, cinder]
const timeStep = 1 / 80

export type Flight = {
  points: Point[]
  result: { kind: 'garden'; garden: GardenId } | { kind: 'rock' } | { kind: 'lost' }
}

export function plotFlight({ angle, power }: AngleAndPower): Flight {
  const radians = (angle * Math.PI) / 180
  const speed = 110 + power * 2.55
  let vx = Math.cos(radians) * speed
  let vy = -Math.sin(radians) * speed
  let { x, y } = nursery
  const points = [{ x, y }]

  // Euler-Cromer stepping keeps the preview and the launched seed on the same path.
  for (let step = 0; step < 640; step++) {
    for (const body of bodies) {
      const dx = body.x - x
      const dy = body.y - y
      const distanceSquared = dx * dx + dy * dy + 28 * 28
      const pull = (body.mass * timeStep) / (distanceSquared * Math.sqrt(distanceSquared))
      vx += dx * pull
      vy += dy * pull
    }
    x += vx * timeStep
    y += vy * timeStep
    points.push({ x, y })

    for (const body of bodies) {
      if (Math.hypot(body.x - x, body.y - y) > body.capture) continue
      if (body.id === 'cinder') return { points, result: { kind: 'rock' } }
      return { points, result: { kind: 'garden', garden: body.id } }
    }
    if (x < -3 || y < -3 || x > chartWidth + 3 || y > chartHeight + 3) break
  }
  return { points, result: { kind: 'lost' } }
}
