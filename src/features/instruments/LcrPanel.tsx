import { useState } from 'react'
import { LCR_CASES, type LcrMode, measureLcr } from '../../engine/instruments/esrLcr'
import { Button, Panel } from '../../ui/primitives'

export default function LcrPanel() {
  const [caseId, setCaseId] = useState(LCR_CASES[0].id)
  const c = LCR_CASES.find((x) => x.id === caseId)!
  const [frequency, setFrequency] = useState(1000)
  const [measured, setMeasured] = useState<ReturnType<typeof measureLcr> | null>(null)

  const modes: { id: LcrMode; label: string }[] = c.kind === 'capacitor' ? [{ id: 'C', label: 'C' }, { id: 'ESR', label: 'ESR' }, { id: 'Z', label: 'Z (impedance)' }] : [{ id: 'L', label: 'L' }, { id: 'DCR', label: 'DCR' }, { id: 'Z', label: 'Z (impedance)' }]

  return (
    <div className="space-y-5">
      <Panel title="Component under test" action={<span className="text-xs text-ink-500">Shared data with the Component Library</span>}>
        <select className="w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={caseId} onChange={(e) => { setCaseId(e.target.value); setMeasured(null) }}>
          {LCR_CASES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
        </select>
      </Panel>
      <Panel title="Test frequency (affects impedance, X = f(frequency))">
        <label className="text-sm text-ink-300">
          {frequency.toLocaleString()} Hz
          <input type="range" min={20} max={50000} step={20} value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} className="mt-1 w-full" />
        </label>
      </Panel>
      <Panel title="Measurement">
        <div className="flex flex-wrap gap-2">
          {modes.map((m) => (
            <Button key={m.id} variant="primary" onClick={() => setMeasured(measureLcr(c, m.id, frequency))}>{m.label}</Button>
          ))}
        </div>
        {measured && (
          <div className="mt-3">
            <div className={`font-mono text-2xl ${measured.ok ? 'text-live-400' : 'text-danger-400'}`}>{measured.display}</div>
            <p className="mt-2 text-sm text-ink-300">{measured.note}</p>
          </div>
        )}
      </Panel>
    </div>
  )
}
