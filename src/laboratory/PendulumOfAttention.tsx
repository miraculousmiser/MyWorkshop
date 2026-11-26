import { useState } from 'react'
import { pendulumOfAttentionTitle } from '../content'
import { LabChart } from './LabChart'
import { attentionMinutes, attentionOverTime } from './models'
import { LabReadouts, LabSlider, Workbench } from './Workbench'

const initialRhythm = { interval: 24, interruption: 32, recovery: 8 }

export function PendulumOfAttention() {
  const [settings, setSettings] = useState(initialRhythm)
  const { interval, interruption, recovery } = settings
  const { levels, interruptions } = attentionOverTime(interval, interruption, recovery)
  // Average the simulated minutes. The initial state at time zero is outside that average.
  const average = (levels.reduce((sum, level) => sum + level, 0) - levels[0]) / attentionMinutes

  return (
    <Workbench title={pendulumOfAttentionTitle}
      description="Set the rhythm of a two-hour work session and watch a toy attention level dip and recover."
      theme="attention"
      display={
        <section className="lab-display" aria-labelledby="attention-chart-title">
          <h2 id="attention-chart-title">Attention level over time</h2>
          <LabReadouts values={[
            { label: 'Average level', value: `${Math.round(average)}%` },
            { label: 'Lowest level', value: `${Math.round(Math.min(...levels))}%` },
            { label: 'Interruptions', value: interruptions.length },
          ]} />
          <LabChart points={levels} events={interruptions} ceiling={100} timeUnit="Minutes"
            caption={<>
              <span><i className="lab-key" /> Attention level (%)</span>
              <span><i className="lab-key lab-key--event" /> Interruption</span>
            </>} />
        </section>
      }
      notes={<>Each interruption removes a share of the current level. Between interruptions, recovery closes half the remaining gap to full attention
        over the time you choose. These rules are invented for comparing rhythms. The percentages describe the model.</>}
    >
      <LabSlider label="Time between interruptions" value={interval} displayValue={`${interval} min`} min={5} max={60}
        onChange={(value) => setSettings({ ...settings, interval: value })} />
      <LabSlider label="Drop per interruption" value={interruption} displayValue={`${interruption}%`} min={0} max={80}
        onChange={(value) => setSettings({ ...settings, interruption: value })} />
      <LabSlider label="Time to recover half the gap" value={recovery} displayValue={`${recovery} min`} min={1} max={30}
        onChange={(value) => setSettings({ ...settings, recovery: value })} />
      <div className="lab-actions">
        <button type="button" onClick={() => setSettings(initialRhythm)}>Reset session</button>
      </div>
    </Workbench>
  )
}
