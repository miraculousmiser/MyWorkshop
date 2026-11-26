import { useState } from 'react'
import { compoundingGardenTitle } from '../content'
import { LabChart } from './LabChart'
import { gardenGrowth, startingGarden } from './models'
import { LabReadouts, LabSlider, Workbench } from './Workbench'

const initialGarden = { weeks: 20, growth: 10, decay: 4 }
const units = new Intl.NumberFormat('en', { maximumFractionDigits: 1 })
const signedPercent = new Intl.NumberFormat('en', { maximumFractionDigits: 1, signDisplay: 'exceptZero' })

export function CompoundingGarden() {
  const [settings, setSettings] = useState(initialGarden)
  const { weeks, growth, decay } = settings
  const { compounding, linear, weeklyChange } = gardenGrowth(weeks, growth, decay)
  const maximum = Math.max(...compounding, ...linear)
  const step = 10 ** Math.floor(Math.log10(maximum / 4))
  const ceiling = 4 * step * Math.ceil(maximum / (4 * step))

  return (
    <Workbench title={compoundingGardenTitle}
      description="Grow a garden one week at a time. See what happens when each week’s growth and loss start from a different amount."
      theme="garden"
      display={
        <section className="lab-display" aria-labelledby="garden-chart-title">
          <h2 id="garden-chart-title">Garden size over time</h2>
          <LabReadouts values={[
            { label: `Week ${weeks} · compounding`, value: units.format(compounding[weeks]) },
            { label: `Week ${weeks} · fixed change`, value: units.format(linear[weeks]) },
            { label: 'Net change per week', value: `${signedPercent.format(weeklyChange)}%` },
          ]} />
          <LabChart points={compounding} comparison={linear} ceiling={ceiling} timeUnit="Weeks"
            caption={<>
              <span><i className="lab-key" /> Compounding</span>
              <span><i className="lab-key lab-key--dashed" /> Fixed change</span>
            </>} />
        </section>
      }
      notes={<>The garden starts at {startingGarden} units. Each week adds the growth percentage, then removes the decay percentage from the resulting amount.
        The dashed line repeats week one’s change as a fixed number of units and stops at zero. This model assumes steady rates and unlimited room to grow.</>}
    >
      <LabSlider label="Growth per week" value={growth} displayValue={`${growth}%`} min={0} max={25}
        onChange={(value) => setSettings({ ...settings, growth: value })} />
      <LabSlider label="Decay per week" value={decay} displayValue={`${decay}%`} min={0} max={22}
        onChange={(value) => setSettings({ ...settings, decay: value })} />
      <LabSlider label="Time horizon" value={weeks} displayValue={`${weeks} weeks`} min={4} max={36}
        onChange={(value) => setSettings({ ...settings, weeks: value })} />
      <div className="lab-actions">
        <button type="button" onClick={() => setSettings(initialGarden)}>Reset garden</button>
      </div>
    </Workbench>
  )
}
