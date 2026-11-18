import { useMemo, useState } from 'react'
import { PART_DEFS } from '../../engine/circuit/parts'
import { DIODE_TEST_CASES, DMM_SCENARIOS, type DmmFunction, type DmmPoint, type DmmPort, operateDiodeTest, operateDmm } from '../../engine/instruments/dmm'
import { liveDmmSeriesPoint, liveDmmTwoProbePoint } from '../../engine/instruments/liveProbe'
import { SANDBOX, useCircuitLab } from '../circuit-lab/circuitStore'
import { Button, Panel, SafetyNotice, Tag } from '../../ui/primitives'

const FUNCTIONS: { id: DmmFunction; label: string }[] = [
  { id: 'dcv', label: 'DC V' },
  { id: 'acv', label: 'AC V' },
  { id: 'dca', label: 'DC A' },
  { id: 'aca', label: 'AC A' },
  { id: 'ohms', label: 'Ω' },
  { id: 'continuity', label: 'Continuity' },
]
const PORTS: { id: DmmPort; label: string }[] = [
  { id: 'v-ohm', label: 'VΩ socket' },
  { id: 'ma', label: 'mA socket' },
  { id: '10a', label: '10 A socket' },
]

function Readout({ result }: { result: { ok: boolean; display: string; note: string } | null }) {
  if (!result) return <div className="font-mono text-2xl text-ink-500">— — —</div>
  return (
    <div>
      <div className={`font-mono text-2xl ${result.ok ? 'text-live-400' : 'text-danger-400'}`}>{result.display}</div>
      <p className="mt-2 text-sm text-ink-300">{result.note}</p>
    </div>
  )
}

export default function DmmPanel() {
  const [source, setSource] = useState<'preset' | 'live'>('preset')
  const [scenarioId, setScenarioId] = useState(DMM_SCENARIOS[0].id)
  const scenario = DMM_SCENARIOS.find((s) => s.id === scenarioId)!
  const [pointId, setPointId] = useState<string>(scenario.points[0].id)
  const presetPoint: DmmPoint = scenario.points.find((p) => p.id === pointId) ?? scenario.points[0]
  const [fn, setFn] = useState<DmmFunction>('dcv')
  const [port, setPort] = useState<DmmPort>('v-ohm')
  const [measured, setMeasured] = useState<ReturnType<typeof operateDmm> | null>(null)

  // "Your circuit" mode: probe whatever the student has actually built in the Circuit Lab, using
  // the lab's own saved docs (no separate circuit to maintain here).
  const docs = useCircuitLab((s) => s.docs)
  const workspaceKeys = useMemo(() => Object.keys(docs).filter((k) => docs[k]?.parts.length).sort(), [docs])
  const [workspaceKey, setWorkspaceKey] = useState(SANDBOX)
  const liveDoc = docs[workspaceKey]
  const liveParts = liveDoc?.parts ?? []
  const wantsCurrent = fn === 'dca' || fn === 'aca'
  const [probePartId, setProbePartId] = useState('')
  const [probeTerminalId, setProbeTerminalId] = useState('')
  const [probeBPartId, setProbeBPartId] = useState('')
  const [probeBTerminalId, setProbeBTerminalId] = useState('')
  const probeTerminals = (pid: string) => (liveDoc?.parts.find((p) => p.id === pid) && PART_DEFS[liveDoc.parts.find((p) => p.id === pid)!.type].terminals) ?? []

  const livePoint: DmmPoint = useMemo(() => {
    if (!liveDoc || !probePartId) return { id: 'live', label: 'Pick a part to probe', isLive: false }
    if (wantsCurrent) return liveDmmSeriesPoint(liveDoc, probePartId)
    if (!probeBPartId) return { id: 'live', label: 'Pick a second probe point', isLive: false }
    const aPart = liveDoc.parts.find((p) => p.id === probePartId)
    const bPart = liveDoc.parts.find((p) => p.id === probeBPartId)
    const aTerm = probeTerminalId || (aPart ? PART_DEFS[aPart.type].terminals[0]?.id : '1') || '1'
    const bTerm = probeBTerminalId || (bPart ? PART_DEFS[bPart.type].terminals[0]?.id : '1') || '1'
    return liveDmmTwoProbePoint(liveDoc, { partId: probePartId, terminalId: aTerm }, { partId: probeBPartId, terminalId: bTerm })
  }, [liveDoc, probePartId, probeTerminalId, probeBPartId, probeBTerminalId, wantsCurrent])

  const point = source === 'preset' ? presetPoint : livePoint

  const [diodeCase, setDiodeCase] = useState(DIODE_TEST_CASES[0].id)
  const [diodeDir, setDiodeDir] = useState<'forward' | 'reverse'>('forward')
  const diodeResult = useMemo(() => operateDiodeTest(diodeCase, diodeDir), [diodeCase, diodeDir])

  // Guided exercise: find the inverter DC bus current correctly (series, 10 A socket, DC A).
  const [exerciseChecked, setExerciseChecked] = useState(false)
  const exerciseOk = fn === 'dca' && port === '10a' && pointId === 'bus-live' && scenarioId === 'inverter-dc-bus'

  return (
    <div className="space-y-5">
      <SafetyNotice>
        <strong>Before you measure:</strong> check the function matches what you want (V, A, Ω), and the probes are in the socket that matches the function. Using a current socket for a voltage measurement on a live source can blow the meter's fuse.
      </SafetyNotice>

      <Panel title="Where to measure">
        <div className="mb-3 flex flex-wrap gap-1.5">
          <Button variant={source === 'preset' ? 'primary' : 'secondary'} onClick={() => { setSource('preset'); setMeasured(null) }} data-testid="dmm-source-preset">Guided scenario</Button>
          <Button variant={source === 'live' ? 'primary' : 'secondary'} onClick={() => { setSource('live'); setMeasured(null) }} data-testid="dmm-source-live">Your circuit</Button>
        </div>

        {source === 'preset' ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-ink-300">
                Circuit
                <select className="mt-1 w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={scenarioId} onChange={(e) => { setScenarioId(e.target.value); setPointId(DMM_SCENARIOS.find((s) => s.id === e.target.value)!.points[0].id); setMeasured(null) }}>
                  {DMM_SCENARIOS.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </label>
              <label className="text-sm text-ink-300">
                Test point
                <select className="mt-1 w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={pointId} onChange={(e) => { setPointId(e.target.value); setMeasured(null) }}>
                  {scenario.points.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </label>
            </div>
            <p className="mt-2 text-xs text-ink-500">{scenario.description} {point.isLive ? <Tag tone="caution">Live</Tag> : <Tag tone="neutral">Isolated</Tag>}</p>
          </>
        ) : (
          <>
            <label className="text-sm text-ink-300">
              Saved circuit (from the Circuit Lab)
              <select className="mt-1 w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={workspaceKey} onChange={(e) => { setWorkspaceKey(e.target.value); setProbePartId(''); setProbeBPartId(''); setMeasured(null) }}>
                <option value={SANDBOX}>Sandbox</option>
                {workspaceKeys.filter((k) => k !== SANDBOX).map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </label>
            {!liveParts.length ? (
              <p className="mt-2 text-xs text-ink-500">This saved circuit is empty — build something in the Circuit Lab first (or pick another saved circuit above).</p>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-ink-300">
                  {wantsCurrent ? 'Break the meter in series with' : 'Probe A (red lead)'}
                  <select className="mt-1 w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={probePartId} onChange={(e) => { setProbePartId(e.target.value); setProbeTerminalId(''); setMeasured(null) }}>
                    <option value="">— select a part —</option>
                    {liveParts.map((p) => <option key={p.id} value={p.id}>{p.label} ({p.type})</option>)}
                  </select>
                  {!wantsCurrent && probePartId && (
                    <select className="mt-1 w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={probeTerminalId} onChange={(e) => { setProbeTerminalId(e.target.value); setMeasured(null) }}>
                      {probeTerminals(probePartId).map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  )}
                </label>
                {!wantsCurrent && (
                  <label className="text-sm text-ink-300">
                    Probe B (black lead)
                    <select className="mt-1 w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={probeBPartId} onChange={(e) => { setProbeBPartId(e.target.value); setProbeBTerminalId(''); setMeasured(null) }}>
                      <option value="">— select a part —</option>
                      {liveParts.map((p) => <option key={p.id} value={p.id}>{p.label} ({p.type})</option>)}
                    </select>
                    {probeBPartId && (
                      <select className="mt-1 w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={probeBTerminalId} onChange={(e) => { setProbeBTerminalId(e.target.value); setMeasured(null) }}>
                        {probeTerminals(probeBPartId).map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                    )}
                  </label>
                )}
              </div>
            )}
            <p className="mt-2 text-xs text-ink-500">{point.label} {point.isLive ? <Tag tone="caution">Live</Tag> : <Tag tone="neutral">Isolated</Tag>}</p>
          </>
        )}
      </Panel>

      <Panel title="Meter controls">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs text-ink-400">Function (dial)</p>
            <div className="flex flex-wrap gap-1.5">
              {FUNCTIONS.map((f) => (
                <Button key={f.id} variant={fn === f.id ? 'primary' : 'secondary'} onClick={() => { setFn(f.id); setMeasured(null) }} data-testid={`dmm-fn-${f.id}`}>
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs text-ink-400">Probe sockets</p>
            <div className="flex flex-wrap gap-1.5">
              {PORTS.map((p) => (
                <Button key={p.id} variant={port === p.id ? 'primary' : 'secondary'} onClick={() => { setPort(p.id); setMeasured(null) }} data-testid={`dmm-port-${p.id}`}>
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Button variant="primary" onClick={() => setMeasured(operateDmm(point, fn, port))} data-testid="dmm-measure">Measure</Button>
        </div>
      </Panel>

      <Panel title="Reading">
        <Readout result={measured} />
      </Panel>

      <Panel title="Guided exercise: measure the inverter's DC bus current safely">
        <p className="text-sm text-ink-300">Select the "48 V inverter DC bus, loaded" circuit, the "DC bus, running" point, the DC A function and the 10 A socket, then measure.</p>
        <div className="mt-3 flex items-center gap-3">
          <Button onClick={() => setExerciseChecked(true)} data-testid="dmm-exercise-check">Check my setup</Button>
          {exerciseChecked && (
            <Tag tone={exerciseOk ? 'signal' : 'danger'}>{exerciseOk ? 'Correct: series connection, matched socket, matched function.' : 'Not yet — check the scenario, point, function and socket.'}</Tag>
          )}
        </div>
      </Panel>

      <Panel title="Diode test">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-ink-300">
            Diode condition
            <select className="mt-1 w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={diodeCase} onChange={(e) => setDiodeCase(e.target.value)}>
              {DIODE_TEST_CASES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
          <div>
            <p className="mb-1.5 text-xs text-ink-400">Probe direction</p>
            <div className="flex gap-1.5">
              <Button variant={diodeDir === 'forward' ? 'primary' : 'secondary'} onClick={() => setDiodeDir('forward')}>Forward</Button>
              <Button variant={diodeDir === 'reverse' ? 'primary' : 'secondary'} onClick={() => setDiodeDir('reverse')}>Reverse</Button>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <Readout result={diodeResult} />
        </div>
      </Panel>
    </div>
  )
}
