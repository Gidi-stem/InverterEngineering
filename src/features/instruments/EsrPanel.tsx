import { useState } from 'react'
import { LCR_CASES, measureLcr } from '../../engine/instruments/esrLcr'
import { Button, Panel, SafetyNotice } from '../../ui/primitives'

const CASES = LCR_CASES.filter((c) => c.kind === 'capacitor')

export default function EsrPanel() {
  const [caseId, setCaseId] = useState(CASES[0].id)
  const c = CASES.find((x) => x.id === caseId)!
  const [measured, setMeasured] = useState<ReturnType<typeof measureLcr> | null>(null)

  return (
    <div className="space-y-5">
      <SafetyNotice>Confirm the capacitor is discharged (DC V below ~1 V) before connecting the ESR meter. Never short the terminals to discharge a bank — use a bleed resistor.</SafetyNotice>
      <Panel title="Capacitor under test">
        <select className="w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={caseId} onChange={(e) => { setCaseId(e.target.value); setMeasured(null) }}>
          {CASES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
        </select>
      </Panel>
      <Panel title="Measurement">
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setMeasured(measureLcr(c, 'ESR'))}>Measure ESR</Button>
          <Button onClick={() => setMeasured(measureLcr(c, 'C'))}>Measure capacitance</Button>
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
