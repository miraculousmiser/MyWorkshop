import { useEffect, useState } from 'react'
import { advanceRun, finishDistance, gates, newRun, shiftDuration, type Run } from '../arcade/ledgerRunner'
import './ledger-runner.css'

const stops = [...gates, { at: finishDistance, kind: 'Finish', name: 'Closing Desk' }] as const
const buildings = [48, 64, 45, 80, 58, 90, 85, 54, 68, 45, 79, 55, 67, 93, 60, 80, 51, 70, 50, 84, 61, 54, 88, 62]
const creditBalance = (amount: number) => (Math.ceil(amount * 10) / 10).toFixed(1)

function isFinished(run: Run) {
  return run.phase === 'delivered' || run.phase === 'late' || run.phase === 'broke'
}

function RunnerScene({ run }: { run: Run }) {
  const roadOffset = (run.distance / 2) % 60

  return (
    <div className="runner-scene" aria-hidden="true">
      <div className="runner-moon" />
      <div className="runner-skyline">
        {buildings.map((height, index) => (
          <i key={index} style={{ height: `${height}%`, width: `${3 + (index % 4)}%` }} />
        ))}
      </div>
      <div className="runner-road" style={{ backgroundPositionX: `-${roadOffset}px` }} />
      {stops.map((stop, index) => {
        const position = 18 + (stop.at - run.distance) / 3.8
        if (position < -12 || position > 112) return null
        return (
          <div
            key={stop.at}
            className={`runner-stop runner-stop--${stop.kind.toLowerCase()}`}
            data-passed={index < run.gate}
            style={{ left: `${position}%` }}
          >
            {stop.kind}
          </div>
        )
      })}
      <div className="runner-courier" data-pace={run.pace} data-moving={run.phase === 'running'}>
        <i className="runner-courier__head" />
        <i className="runner-courier__body" />
        <i className="runner-courier__bag" />
        <i className="runner-courier__leg" />
        <i className="runner-courier__leg runner-courier__leg--back" />
      </div>
    </div>
  )
}

function receiptText(run: Run) {
  if (run.phase === 'delivered') {
    return `Delivered! ${creditBalance(run.reserves)} credits left in reserve.`
  }
  if (run.phase === 'late') return 'Time’s up. The closing desk has shut.'
  if (run.phase === 'broke') return `Out of reserves. ${run.receipt}`
  if (run.phase === 'paused') return 'Shift paused.'
  return run.receipt
}

function GateBrief({ run }: { run: Run }) {
  const gate = gates[run.gate]
  const nextName = gate?.name ?? 'Closing Desk'
  const distance = Math.max(0, Math.ceil(((gate?.at ?? finishDistance) - run.distance) / 5) * 5)
  const rule = gate?.kind === 'Invoice' ? 'Cruise +3 · Rush +9'
    : gate?.kind === 'Audit' ? 'Cruise free · Rush −9'
    : gate?.kind === 'Toll' ? '−4 credits at either pace'
    : 'Reach the desk before time runs out.'

  return (
    <div className="runner-gate" aria-label={isFinished(run) ? 'Shift result' : 'Next stop'}>
      <p className="runner-gate__label">
        {isFinished(run) ? 'Shift result' : `Next: ${gate?.kind ?? 'Finish'} · ${distance} m`}
      </p>
      <p className="runner-gate__name">{isFinished(run) ? (run.phase === 'delivered' ? 'Delivery complete' : 'Delivery missed') : nextName}</p>
      <p className="runner-gate__rule">{isFinished(run) ? run.receipt : rule}</p>
    </div>
  )
}

export function LedgerRunnerPage() {
  const [run, setRun] = useState(newRun)

  useEffect(() => {
    if (run.phase !== 'running') return
    let previous: number | undefined
    let frame = 0
    function tick(now: number) {
      previous ??= now
      const elapsed = now - previous
      if (elapsed >= 1000 / 32) {
        previous = now
        setRun((current) => advanceRun(current, Math.min(elapsed / 1000, 0.1)))
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [run.phase])

  useEffect(() => {
    function pauseWhenHidden() {
      if (document.hidden) {
        setRun((current) => current.phase === 'running' ? { ...current, phase: 'paused' } : current)
      }
    }
    document.addEventListener('visibilitychange', pauseWhenHidden)
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden)
  }, [])

  function changePace() {
    setRun((current) => {
      if (current.phase === 'ready') return { ...current, phase: 'running', receipt: 'Shift started.' }
      if (current.phase !== 'running') return current
      return { ...current, pace: current.pace === 'rush' ? 'cruise' : 'rush' }
    })
  }

  useEffect(() => {
    if (run.phase !== 'ready' && run.phase !== 'running') return
    function handleSpace(event: KeyboardEvent) {
      const interactive = event.target instanceof Element &&
        event.target.closest('button, a, input, select, textarea, [contenteditable]')
      if (event.code !== 'Space' || interactive || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return
      event.preventDefault()
      if (!event.repeat) changePace()
    }
    document.addEventListener('keydown', handleSpace)
    return () => document.removeEventListener('keydown', handleSpace)
  }, [run.phase])

  function togglePause() {
    setRun((current) => {
      if (current.phase === 'paused') return { ...current, phase: 'running' }
      if (current.phase === 'running') return { ...current, phase: 'paused' }
      return current
    })
  }

  const started = run.phase !== 'ready'
  const finished = isFinished(run)
  const rushActive = run.pace === 'rush'
  const primaryLabel = !started ? 'Start shift' : finished ? 'Run again' : 'Rush'

  return (
    <main id="main-content" className="page runner-page" tabIndex={-1}>
      <header className="runner-header">
        <p className="breadcrumb"><a href="#/arcade">Arcade</a><span aria-hidden="true">/</span>Ledger Runner</p>
        <h1>Ledger Runner</h1>
        <p>Deliver the ledger before the desk closes. Rush through invoices for extra pay and cruise through audits to avoid fines.</p>
      </header>

      <div className="runner-game">
        <dl className="runner-hud">
          <div data-low={run.reserves < 5}><dt>Reserves</dt><dd>{creditBalance(run.reserves)} <small>cr</small></dd></div>
          <div data-low={run.time < 5}><dt>Time left</dt><dd>{(Math.ceil(run.time * 10) / 10).toFixed(1)} <small>s</small></dd></div>
          <div><dt>Pace</dt><dd>{rushActive ? 'Rush' : 'Cruise'}</dd></div>
        </dl>

        <RunnerScene run={run} />
        <progress className="runner-progress" max={finishDistance} value={run.distance} aria-label="Route progress" />

        <div className="runner-console">
          <GateBrief run={run} />
          <div className="runner-controls">
            <div className="runner-actions">
              <button
                className="runner-primary"
                type="button"
                aria-pressed={started && !finished ? rushActive : undefined}
                aria-disabled={run.phase === 'paused'}
                onClick={() => {
                  if (finished) {
                    setRun({ ...newRun, phase: 'running', receipt: 'Shift started.' })
                    return
                  }
                  changePace()
                }}
              >
                {primaryLabel}
              </button>
              {started && !finished && (
                <>
                  <button className="runner-secondary" type="button" onClick={togglePause}>
                    {run.phase === 'paused' ? 'Resume' : 'Pause'}
                  </button>
                  <button className="runner-secondary" type="button" onClick={() => setRun(newRun)}>Reset</button>
                </>
              )}
            </div>
            <p className="runner-hint">Tap the button or press <kbd>Space</kbd> to switch pace. Rushing drains reserves.</p>
          </div>
        </div>

        <p className="runner-receipt" role="status" aria-atomic="true">{receiptText(run)}</p>
      </div>

      <p className="runner-rules">
        You have {shiftDuration} seconds. Watch the next stop and switch pace before you cross it.
      </p>
    </main>
  )
}
