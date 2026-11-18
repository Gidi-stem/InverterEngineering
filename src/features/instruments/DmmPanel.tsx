import { useMemo, useState } from 'react'
import { DIODE_TEST_CASES, DMM_SCENARIOS, type DmmFunction, type DmmPoint, type DmmPort, operateDiodeTest, operateDmm } from '../../engine/instruments/dmm'
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
  const [scenarioId, setScenarioId] = useState(DMM_SCENARIOS[0].id)
  const scenario = DMM_SCENARIOS.find((s) => s.id === scenarioId)!
  const [pointId, setPointId] = useState<string>(scenario.points[0].id)
  const point: DmmPoint = scenario.points.find((p) => p.id === pointId) ?? scenario.points[0]
  const [fn, setFn] = useState<DmmFunction>('dcv')
  const [port, setPort] = useState<DmmPort>('v-ohm')
  const [measured, setMeasured] = useState<ReturnType<typeof operateDmm> | null>(null)

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

      <Panel title="Scenario and test point">
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
