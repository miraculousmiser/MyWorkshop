export const finishDistance = 1200
export const shiftDuration = 22
export const openingReserve = 15
export const rushCost = 1.35

export const gates = [
  { at: 130, kind: 'Invoice', name: 'Priority Mail', cruise: 3, rush: 9 },
  { at: 275, kind: 'Audit', name: 'Efficiency Review', cruise: 0, rush: -9 },
  { at: 425, kind: 'Toll', name: 'Processing Fee', cruise: -4, rush: -4 },
  { at: 570, kind: 'Invoice', name: 'Rush Rebate', cruise: 3, rush: 9 },
  { at: 735, kind: 'Audit', name: 'Surprise Inspection', cruise: 0, rush: -9 },
  { at: 900, kind: 'Invoice', name: 'Productivity Bonus', cruise: 3, rush: 9 },
  { at: 1060, kind: 'Audit', name: 'Audit of the Audits', cruise: 0, rush: -9 },
] as const

export type Run = {
  phase: 'ready' | 'running' | 'paused' | 'delivered' | 'late' | 'broke'
  pace: 'cruise' | 'rush'
  time: number
  reserves: number
  distance: number
  gate: number
  receipt: string
}

export const newRun: Run = {
  phase: 'ready', pace: 'cruise', time: shiftDuration,
  reserves: openingReserve, distance: 0, gate: 0, receipt: 'The ledger is ready for pickup.',
}

export function advanceRun(run: Run, seconds: number): Run {
  if (run.phase !== 'running') return run

  const speed = run.pace === 'rush' ? 94 : 48
  const burn = run.pace === 'rush' ? rushCost : 0
  const nextGate = gates[run.gate]
  const stop = nextGate?.at ?? finishDistance
  const toStop = (stop - run.distance) / speed
  const toBroke = burn ? run.reserves / burn : Infinity
  const step = Math.min(seconds, toStop, toBroke, run.time)
  const distance = run.distance + step * speed
  const time = Math.max(0, run.time - step)
  const reserves = Math.max(0, run.reserves - step * burn)
  const next = { ...run, distance, time, reserves }

  if (step === toBroke) return { ...next, phase: 'broke', receipt: 'The cash drawer is empty.' }
  if (step === toStop) {
    if (!nextGate) return { ...next, phase: 'delivered', receipt: 'The ledger reached the closing desk.' }

    const change = nextGate[run.pace]
    const balance = reserves + change
    const receipt = change === 0 ? `${nextGate.name}: cleared.`
      : `${nextGate.name}: ${change > 0 ? '+' : '−'}${Math.abs(change)} credits.`
    const crossed = { ...next, distance: stop, gate: run.gate + 1, reserves: Math.max(0, balance), receipt }
    if (balance <= 0) return { ...crossed, phase: 'broke' }
    return advanceRun(crossed, seconds - step)
  }
  if (time === 0) return { ...next, phase: 'late', receipt: 'The closing desk shut for the day.' }
  return next
}
