export const startingGarden = 20

export function gardenGrowth(weeks: number, growth: number, decay: number) {
  const multiplier = (1 + growth / 100) * (1 - decay / 100)
  const firstChange = startingGarden * (multiplier - 1)

  return {
    compounding: Array.from({ length: weeks + 1 }, (_, week) => startingGarden * multiplier ** week),
    linear: Array.from({ length: weeks + 1 }, (_, week) => Math.max(0, startingGarden + week * firstChange)),
    weeklyChange: (multiplier - 1) * 100,
  }
}

export const marketSide = 7
export const marketSize = marketSide ** 2
export const lastMarketRound = 36
type Stall = 'A' | 'B'

// Each household keeps a fixed, small preference so a reset is reproducible.
const tastes = Array.from({ length: marketSize }, (_, index) => ((index * 31 + 7) % 19 - 9) / 10)
const neighbors = tastes.map((_, index) => {
  const column = index % marketSide
  return [
    ...(index >= marketSide ? [index - marketSide] : []),
    ...(column > 0 ? [index - 1] : []),
    ...(column < marketSide - 1 ? [index + 1] : []),
    ...(index < marketSize - marketSide ? [index + marketSide] : []),
  ]
})

export const initialMarket: readonly Stall[] = tastes.map((taste) => taste >= 0 ? 'A' : 'B')

export function marketRound(previous: readonly Stall[], priceA: number, priceB: number, influence: number): Stall[] {
  return previous.map((current, index) => {
    const adjacent = neighbors[index]
    const signal = adjacent.reduce((total, neighbor) => total + (previous[neighbor] === 'A' ? 1 : -1), 0)
    const score = tastes[index] + (priceB - priceA) + influence * signal / adjacent.length
    if (Math.abs(score) < 1e-9) return current
    return score > 0 ? 'A' : 'B'
  })
}

export function seedMarket(previous: readonly Stall[]): Stall[] {
  const center = Math.floor(marketSide / 2)
  return previous.map((stall, index) =>
    Math.abs(index % marketSide - center) <= 1 && Math.abs(Math.floor(index / marketSide) - center) <= 1 ? 'A' : stall,
  )
}

export const attentionMinutes = 120

export function attentionOverTime(interval: number, interruption: number, recovery: number) {
  const levels = [100]
  const interruptions: number[] = []
  const remainingGap = 0.5 ** (1 / recovery)

  for (let minute = 1; minute <= attentionMinutes; minute++) {
    let level = 100 - (100 - levels[minute - 1]) * remainingGap
    if (interruption > 0 && minute % interval === 0 && minute < attentionMinutes) {
      level *= 1 - interruption / 100
      interruptions.push(minute)
    }
    levels.push(level)
  }

  return { levels, interruptions }
}
