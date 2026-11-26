import { useId, type ReactNode } from 'react'
import './laboratory.css'

export function Workbench({ title, description, theme, display, children, notes }: {
  title: string
  description: string
  theme: 'garden' | 'market' | 'attention'
  display: ReactNode
  children: ReactNode
  notes: ReactNode
}) {
  return (
    <main id="main-content" className={`page lab-page lab-page--${theme}`} tabIndex={-1}>
      <header className="lab-heading">
        <p className="breadcrumb"><a href="#/laboratory">Laboratory</a><span aria-hidden="true">/</span>{title}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <div className="lab-workbench">
        {display}
        <section className="lab-controls" aria-labelledby="lab-controls-title">
          <h2 id="lab-controls-title">Controls</h2>
          {children}
        </section>
      </div>
      <section className="lab-notes" aria-labelledby="lab-notes-title">
        <h2 id="lab-notes-title">How it works</h2>
        <p>{notes}</p>
      </section>
    </main>
  )
}

export function LabSlider({ label, value, displayValue, min, max, step = 1, onChange }: {
  label: string
  value: number
  displayValue: string
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}) {
  const id = useId()

  return (
    <div className="lab-slider">
      <div><label htmlFor={id}>{label}</label><span aria-hidden="true">{displayValue}</span></div>
      <input id={id} type="range" value={value} min={min} max={max} step={step}
        aria-valuetext={displayValue} onChange={(event) => onChange(event.currentTarget.valueAsNumber)} />
    </div>
  )
}

export function LabReadouts({ values }: { values: readonly { label: string, value: string | number }[] }) {
  return (
    <dl className="lab-readouts">
      {values.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
  )
}
