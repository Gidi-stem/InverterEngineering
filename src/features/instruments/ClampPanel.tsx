import { useMemo, useState } from 'react'
import { CLAMP_SCENARIOS, type ClampPlacement, type ClampScenario, readClamp } from '../../engine/instruments/clamp'
import { liveClampScenario } from '../../engine/instruments/liveProbe'
import { SANDBOX, useCircuitLab } from '../circuit-lab/circuitStore'
import { Button, Panel, SafetyNotice, Tag } from '../../ui/primitives'

const PLACEMENTS: { id: ClampPlacement; label: string }[] = [
  { id: 'open-not-clamped', label: 'Jaws open (not clamped)' },
  { id: 'single-conductor', label: 'Single conductor clamped' },
  { id: 'both-conductors', label: 'Both conductors clamped together' },
]

const EMPTY_SCENARIO: ClampScenario = { id: 'live-empty', title: 'Pick a conductor', description: 'Select a saved circuit and a part whose lead to clamp.', steadyCurrentRms: 0 }

export default function ClampPanel() {
  const [source, setSource] = useState<'preset' | 'live'>('preset')
  const [scenarioId, setScenarioId] = useState(CLAMP_SCENARIOS[0].id)
  const presetScenario = CLAMP_SCENARIOS.find((s) => s.id === scenarioId)!

  // "Your circuit" mode: clamp around one part's lead in a circuit the student built in the lab.
  const docs = useCircuitLab((s) => s.docs)
  const workspaceKeys = useMemo(() => Object.keys(docs).filter((k) => docs[k]?.parts.length).sort(), [docs])
  const [workspaceKey, setWorkspaceKey] = useState(SANDBOX)
  const liveDoc = docs[workspaceKey]
  const liveParts = liveDoc?.parts ?? []
  const [conductorPartId, setConductorPartId] = useState('')
  const liveScenario = useMemo(() => (liveDoc && conductorPartId ? liveClampScenario(liveDoc, conductorPartId) ?? EMPTY_SCENARIO : EMPTY_SCENARIO), [liveDoc, conductorPartId])

  const scenario = source === 'preset' ? presetScenario : liveScenario
  const [placement, setPlacement] = useState<ClampPlacement>('open-not-clamped')
  const [tMs, setTMs] = useState(0)
  const result = readClamp(scenario, placement, tMs)

  return (
    <div className="space-y-5">
      <SafetyNotice>
        A clamp meter senses the magnetic field around ONE current-carrying conductor. It never needs to break the circuit — but it only works correctly around a single conductor.
      </SafetyNotice>

      <Panel title="Where to measure">
        <div className="mb-3 flex flex-wrap gap-1.5">
          <Button variant={source === 'preset' ? 'primary' : 'secondary'} onClick={() => setSource('preset')} data-testid="clamp-source-preset">Guided scenario</Button>
          <Button variant={source === 'live' ? 'primary' : 'secondary'} onClick={() => setSource('live')} data-testid="clamp-source-live">Your circuit</Button>
        </div>
        {source === 'preset' ? (
          <>
            <select className="w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={scenarioId} onChange={(e) => { setScenarioId(e.target.value); setTMs(0) }}>
              {CLAMP_SCENARIOS.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
            <p className="mt-2 text-xs text-ink-500">{presetScenario.description}</p>
          </>
        ) : (
          <>
            <label className="text-sm text-ink-300">
              Saved circuit (from the Circuit Lab)
              <select className="mt-1 w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={workspaceKey} onChange={(e) => { setWorkspaceKey(e.target.value); setConductorPartId('') }}>
                <option value={SANDBOX}>Sandbox</option>
                {workspaceKeys.filter((k) => k !== SANDBOX).map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </label>
            {!liveParts.length ? (
              <p className="mt-2 text-xs text-ink-500">This saved circuit is empty — build something in the Circuit Lab first (or pick another saved circuit above).</p>
            ) : (
              <label className="mt-3 block text-sm text-ink-300">
                Conductor (part lead) to clamp
                <select className="mt-1 w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={conductorPartId} onChange={(e) => setConductorPartId(e.target.value)}>
                  <option value="">— select a part —</option>
                  {liveParts.map((p) => <option key={p.id} value={p.id}>{p.label} ({p.type})</option>)}
                </select>
              </label>
            )}
            <p className="mt-2 text-xs text-ink-500">{scenario.description}</p>
          </>
        )}
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
