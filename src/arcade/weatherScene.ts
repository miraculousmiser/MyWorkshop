export type Weather = {
  clouds: number
  wind: number
  hour: number
  rain: boolean
}

export const sceneWidth = 1080
export const sceneHeight = 660

// Each palette follows the same order: sky, horizon, far ridge, near ridge, water.
const palettes = [
  { hour: 5, colors: ['#303d62', '#ce8986', '#655d81', '#3e5066', '#4c5878'] },
  { hour: 8, colors: ['#8db4bc', '#f2dfba', '#829a9d', '#476e72', '#648f94'] },
  { hour: 13, colors: ['#699bb4', '#e0e7cf', '#769caa', '#527c78', '#588b96'] },
  { hour: 17, colors: ['#758eaa', '#f2cca7', '#8e8298', '#536b79', '#617b8f'] },
  { hour: 19.5, colors: ['#505781', '#e9a58a', '#786782', '#44566f', '#525e81'] },
  { hour: 22, colors: ['#1d2a48', '#59617e', '#434e6a', '#2e4057', '#394d6a'] },
]

function mix(from: string, to: string, amount: number) {
  const start = Number.parseInt(from.slice(1), 16)
  const end = Number.parseInt(to.slice(1), 16)
  const color = [16, 8, 0].reduce((result, shift) => {
    const a = (start >> shift) & 255
    const b = (end >> shift) & 255
    return (result << 8) + Math.round(a + (b - a) * amount)
  }, 0)
  return `#${color.toString(16).padStart(6, '0')}`
}

function skyPalette(weather: Weather) {
  const right = palettes.findIndex((palette) => palette.hour >= weather.hour)
  const end = palettes[Math.max(right, 1)]
  const start = palettes[Math.max(right - 1, 0)]
  const blend = (weather.hour - start.hour) / (end.hour - start.hour)
  const storm = (weather.rain ? 0.23 : 0) + weather.clouds * 0.002
  return start.colors.map((color, index) => mix(mix(color, end.colors[index], blend), '#576577', storm))
}

function noise(n: number) {
  const value = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return value - Math.floor(value)
}

function ridge(ctx: CanvasRenderingContext2D, points: [number, number][], fill: string) {
  ctx.beginPath()
  ctx.moveTo(...points[0])
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i]
    const [nextX, nextY] = points[i + 1]
    ctx.quadraticCurveTo(x, y, (x + nextX) / 2, (y + nextY) / 2)
  }
  ctx.lineTo(...points[points.length - 1])
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
}

function pine(ctx: CanvasRenderingContext2D, x: number, y: number, height: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(x - height * 0.022, y - height * 0.23, height * 0.044, height * 0.25)
  ctx.beginPath()
  ctx.moveTo(x, y - height)
  for (const side of [-1, 1]) {
    for (const [width, depth] of (side === -1
      ? [[0.13, 0.40], [0.07, 0.37], [0.21, 0.62], [0.13, 0.57], [0.29, 0.83]]
      : [[0.29, 0.83], [0.13, 0.57], [0.21, 0.62], [0.07, 0.37], [0.13, 0.40]])) {
      ctx.lineTo(x + height * width * side, y - height * (1 - depth))
    }
    if (side === -1) ctx.lineTo(x, y - height * 0.24)
  }
  ctx.closePath()
  ctx.fill()
}

const clouds = [
  [73, 120, 1.15], [300, 165, 0.72], [680, 110, 1.15], [959, 196, 0.85],
  [475, 79, 0.9], [790, 240, 0.63], [145, 235, 0.65], [1040, 65, 0.92],
]

function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size, size)
  ctx.beginPath()
  ctx.moveTo(-112, 13)
  ctx.bezierCurveTo(-114, 1, -84, -9, -68, -9)
  ctx.bezierCurveTo(-63, -27, -39, -33, -22, -22)
  ctx.bezierCurveTo(-2, -51, 31, -44, 46, -20)
  ctx.bezierCurveTo(66, -30, 82, -15, 89, -4)
  ctx.bezierCurveTo(116, -5, 129, 8, 119, 16)
  ctx.bezierCurveTo(102, 29, -104, 29, -112, 13)
  ctx.fill()
  ctx.restore()
}

export function drawWeather(
  ctx: CanvasRenderingContext2D,
  weather: Weather,
  airDistance: number,
  time: number,
) {
  const [sky, horizon, far, near, water] = skyPalette(weather)
  const w = sceneWidth
  const h = sceneHeight
  const shore = 399
  const night = Math.max(0, (weather.hour - 19.5) / 2.5, (7 - weather.hour) / 3)
  const wind = weather.wind / 100
  const rain = weather.rain
  const skyGradient = ctx.createLinearGradient(0, 0, 0, shore)
  skyGradient.addColorStop(0, sky)
  skyGradient.addColorStop(1, horizon)
  ctx.fillStyle = skyGradient
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = '#fff4d8'
  for (let i = 0; i < 54 && night > 0; i++) {
    ctx.globalAlpha = night * (1 - weather.clouds / 120) * (0.23 + noise(i * 3) * 0.6)
    ctx.beginPath()
    ctx.arc(noise(i * 3 + 1) * w, noise(i * 3 + 2) * 265 + 10, 0.7 + noise(i + 210) * 1.2, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  const sunThroughSky = (weather.hour - 5) / 15
  const sunX = 230 + sunThroughSky * 620
  const sunY = 310 - Math.sin(sunThroughSky * Math.PI) * 235
  const isNight = weather.hour >= 20.25
  const lightX = isNight ? 760 : sunX
  const lightY = isNight ? 170 - (weather.hour - 20.25) * 36 : sunY
  const radius = isNight ? 24 : 35
  const haze = ctx.createRadialGradient(lightX, lightY, radius * 0.6, lightX, lightY, radius * 4.3)
  haze.addColorStop(0, isNight ? 'rgba(237, 232, 202, .18)' : 'rgba(255, 205, 140, .45)')
  haze.addColorStop(1, 'rgba(255, 205, 140, 0)')
  ctx.globalAlpha = 1 - weather.clouds / 165 - (rain ? 0.18 : 0)
  ctx.fillStyle = haze
  ctx.fillRect(0, 0, w, shore)
  ctx.fillStyle = isNight ? '#eee7ca' : '#ffe8ad'
  ctx.beginPath()
  ctx.arc(lightX, lightY, radius, 0, Math.PI * 2)
  if (isNight) {
    ctx.save()
    ctx.clip()
    ctx.moveTo(lightX + radius + 10, lightY - 9)
    ctx.arc(lightX + 10, lightY - 9, radius, 0, Math.PI * 2)
    ctx.fill('evenodd')
    ctx.restore()
  } else {
    ctx.fill()
  }

  ctx.fillStyle = mix('#fff0d8', '#5a637e', Math.min(0.94, night * 0.64 + weather.clouds / 250 + (rain ? 0.21 : 0)))
  clouds.forEach(([x, y, size], index) => {
    ctx.globalAlpha = Math.max(0, Math.min(0.88, weather.clouds / 17 - index * 0.72))
    if (ctx.globalAlpha > 0) {
      const travel = airDistance * (0.7 + size * 0.2)
      const cloudX = (x + 185 + travel) % (w + 370) - 185
      cloud(ctx, cloudX, y, size)
    }
  })
  ctx.globalAlpha = 1

  ridge(ctx, [[-20, 262], [90, 211], [184, 273], [281, 286], [393, 200], [490, 255], [571, 211], [657, 270], [730, 235], [856, 300], [1000, 190], [1100, 240], [1100, 420], [-20, 420]], far)
  ridge(ctx, [[-20, 293], [110, 302], [177, 334], [277, 318], [365, 330], [463, 289], [546, 331], [624, 343], [760, 281], [878, 321], [989, 276], [1100, 289], [1100, 420], [-20, 420]], near)
  ridge(ctx, [[-20, 341], [100, 354], [216, 374], [330, 392], [490, 383], [608, 390], [760, 362], [870, 375], [977, 347], [1100, 348], [1100, 420], [-20, 420]], mix(near, '#1b3e42', 0.46))

  const lake = ctx.createLinearGradient(0, shore, 0, h)
  lake.addColorStop(0, mix(water, horizon, 0.38))
  lake.addColorStop(0.53, water)
  lake.addColorStop(1, mix(water, '#233d51', 0.59))
  ctx.fillStyle = lake
  ctx.fillRect(0, shore, w, h - shore)

  ctx.lineCap = 'round'
  for (let i = 0; i < 104; i++) {
    const depth = noise(i + 300) ** 1.55
    const y = shore + 5 + depth * (h - shore)
    const phase = time * wind * 1.7 + i * 2.7
    const x = noise(i + 410) * w + Math.sin(phase) * wind * 11
    const extent = (5 + noise(i + 550) * 65) * (0.32 + depth)
    ctx.globalAlpha = (0.12 + depth * 0.18) * (0.65 + wind * 0.35)
    ctx.strokeStyle = i % 3 === 0 ? horizon : near
    ctx.lineWidth = 0.7 + depth * 0.75
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + extent, y)
    ctx.stroke()
  }
  ctx.strokeStyle = isNight ? '#e9e1c9' : '#ffdcaa'
  for (let i = 0; i < 31; i++) {
    const depth = i / 31
    const y = shore + 5 + depth ** 1.6 * 260
    const x = lightX + (noise(i + 20) - 0.5) * depth * 160 + Math.sin(time * 1.5 + i) * wind * 12
    const halfWidth = 3 + noise(i + 680) * (22 + depth * 54)
    ctx.lineWidth = 1 + depth * 1.5
    ctx.globalAlpha = (0.23 - depth * 0.12) * (1 - weather.clouds / 125) * (rain ? 0.35 : 1)
    ctx.beginPath()
    ctx.moveTo(x - halfWidth, y)
    ctx.lineTo(x + halfWidth, y)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  const bank = mix(near, '#183438', 0.69)
  const shadow = mix(near, '#132a30', 0.83)
  ridge(ctx, [[-30, 440], [74, 461], [99, 514], [176, 548], [103, 626], [202, 681], [-30, 681]], bank)
  ridge(ctx, [[1110, 489], [1005, 541], [967, 586], [804, 646], [748, 681], [1110, 681]], shadow)
  for (let i = 0; i < 18; i++) {
    const x = i < 9 ? noise(i + 782) * 98 : 990 + noise(i + 782) * 115
    const y = (i < 9 ? 486 : 558) + noise(i + 815) * 93
    const height = 18 + noise(i + 840) * 82
    pine(ctx, x, y, height, i % 3 === 0 ? bank : shadow)
  }

  if (rain) {
    ctx.strokeStyle = '#e0e9ed'
    for (let i = 0; i < 130; i++) {
      const speed = 260 + noise(i + 931) * 235
      const x = (noise(i + 920) * (w + 100) + time * wind * 180) % (w + 100) - 50
      const y = (noise(i + 960) * (h + 70) + time * speed) % (h + 70) - 35
      ctx.globalAlpha = 0.17 + noise(i + 980) * 0.24
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + wind * 9, y + speed / 32)
      ctx.stroke()
    }
  }
  ctx.globalAlpha = 1
}
