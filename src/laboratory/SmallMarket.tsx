import { useCallback, useEffect, useState } from 'react'
import { smallMarketTitle } from '../content'
import { initialMarket, lastMarketRound, marketRound, marketSize, seedMarket } from './models'
import { LabReadouts, LabSlider, Workbench } from './Workbench'

const initialSettings = { priceA: 5, priceB: 5, influence: 3 }
const initialRound = { choices: initialMarket, number: 0 }

export function SmallMarket() {
  const [settings, setSettings] = useState(initialSettings)
  const [round, setRound] = useState(initialRound)
  const [running, setRunning] = useState(false)
  const { priceA, priceB, influence } = settings
  const buyersA = round.choices.filter((stall) => stall === 'A').length
  const atEnd = round.number >= lastMarketRound
  const isRunning = running && !atEnd

  const advance = useCallback(() => {
    setRound((current) => {
      if (current.number >= lastMarketRound) return current
      return {
        choices: marketRound(current.choices, priceA, priceB, influence),
        number: current.number + 1,
      }
    })
  }, [priceA, priceB, influence])

  useEffect(() => {
    if (!isRunning) return
    const timer = window.setInterval(advance, 650)
    return () => window.clearInterval(timer)
  }, [advance, isRunning])

  function reset() {
    setRunning(false)
    setSettings(initialSettings)
    setRound(initialRound)
  }

  return (
    <Workbench title={smallMarketTitle}
      description="Two stalls sell the same goods. Follow the choices of 49 households as prices and neighborhood preferences pull them in different directions."
      theme="market"
      display={
        <section className="lab-display" aria-labelledby="market-map-title">
          <h2 id="market-map-title">Neighborhood purchases</h2>
          <LabReadouts values={[
            { label: 'Round', value: round.number },
            { label: 'Stall A buyers', value: buyersA },
            { label: 'Stall B buyers', value: marketSize - buyersA },
          ]} />
          <figure className="lab-market">
            <div className="lab-market__grid" aria-hidden="true">
              {round.choices.map((stall, index) => (
                <div className={`lab-market__cell lab-market__cell--${stall}`} key={index}
                  data-center={index === Math.floor(marketSize / 2) || undefined}><span>{stall}</span></div>
              ))}
            </div>
            <figcaption>Each square is a household. The letter shows its current stall.</figcaption>
          </figure>
        </section>
      }
      notes={<>Each household has a small fixed preference. In a new round, it weighs that preference, the price difference,
        and where its immediate neighbors bought in the previous round. Neighbors touch along an edge, and everyone updates at once.
        Prices are set by you and each stall has unlimited stock.</>}
    >
      <LabSlider label="Stall A price" value={priceA} displayValue={`${priceA} coins`} min={1} max={12}
        onChange={(value) => setSettings({ ...settings, priceA: value })} />
      <LabSlider label="Stall B price" value={priceB} displayValue={`${priceB} coins`} min={1} max={12}
        onChange={(value) => setSettings({ ...settings, priceB: value })} />
      <LabSlider label="Neighbor influence" value={influence} displayValue={influence.toFixed(1)} min={0} max={5} step={0.5}
        onChange={(value) => setSettings({ ...settings, influence: value })} />
      <p className="lab-hint">
        {atEnd
          ? 'Round limit reached. Reset the market to start again.'
          : 'Changes to prices and influence take effect in the next round. Seed the center to change nine neighboring choices immediately.'}
      </p>
      <div className="lab-actions">
        <button className="lab-action--primary" type="button" disabled={isRunning || atEnd} onClick={advance}>Next round</button>
        <button type="button" disabled={atEnd} onClick={() => setRunning(!running)}>{isRunning ? 'Pause' : 'Run rounds'}</button>
        <button type="button" disabled={atEnd}
          onClick={() => setRound((current) => ({ ...current, choices: seedMarket(current.choices) }))}>
          Seed center with A
        </button>
        <button type="button" onClick={reset}>Reset market</button>
      </div>
    </Workbench>
  )
}
