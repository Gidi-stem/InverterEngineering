import { useState } from 'react'
import { CLAMP_SCENARIOS, type ClampPlacement, readClamp } from '../../engine/instruments/clamp'
import { Button, Panel, SafetyNotice, Tag } from '../../ui/primitives'

const PLACEMENTS: { id: ClampPlacement; label: string }[] = [
  { id: 'open-not-clamped', label: 'Jaws open (not clamped)' },
  { id: 'single-conductor', label: 'Single conductor clamped' },
  { id: 'both-conductors', label: 'Both conductors clamped together' },
]

export default function ClampPanel() {
  const [scenarioId, setScenarioId] = useState(CLAMP_SCENARIOS[0].id)
  const scenario = CLAMP_SCENARIOS.find((s) => s.id === scenarioId)!
  const [placement, setPlacement] = useState<ClampPlacement>('open-not-clamped')
  const [tMs, setTMs] = useState(0)
  const result = readClamp(scenario, placement, tMs)

  return (
    <div className="space-y-5">
      <SafetyNotice>
        A clamp meter senses the magnetic field around ONE current-carrying conductor. It never needs to break the circuit — but it only works correctly around a single conductor.
      </SafetyNotice>

      <Panel title="Scenario">
        <select className="w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={scenarioId} onChange={(e) => { setScenarioId(e.target.value); setTMs(0) }}>
          {CLAMP_SCENARIOS.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
        <p className="mt-2 text-xs text-ink-500">{scenario.description}</p>
      </Panel>

      <Panel title="Jaw placement">
        <div className="flex flex-wrap gap-1.5">
          {PLACEMENTS.map((p) => (
            <Button key={p.id} variant={placement === p.id ? 'primary' : 'secondary'} onClick={() => setPlacement(p.id)} data-testid={`clamp-placement-${p.id}`}>
              {p.label}
            </Button>
          ))}
        </div>
        {scenario.inrushPeakCurrent && (
          <div className="mt-4">
            <label className="text-xs text-ink-400">Time since start: {tMs} ms</label>
            <input type="range" min={0} max={scenario.inrushDecayMs} step={10} value={tMs} onChange={(e) => setTMs(Number(e.target.value))} className="mt-1 w-full" />
          </div>
        )}
      </Panel>

      <Panel title="Reading">
        <div className={`font-mono text-2xl ${result.ok ? 'text-live-400' : 'text-danger-400'}`}>{result.display}</div>
        <p className="mt-2 text-sm text-ink-300">{result.note}</p>
        {placement === 'both-conductors' && <Tag tone="caution">Common mistake</Tag>}
      </Panel>
    </div>
  )
}
