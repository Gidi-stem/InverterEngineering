import { useState } from 'react'
import { describeSafetyProcedure, INSULATION_SCENARIOS, readInsulation, type TestVoltageV } from '../../engine/instruments/insulation'
import { Button, Panel, SafetyNotice, Tag } from '../../ui/primitives'

const VOLTAGES: TestVoltageV[] = [250, 500, 1000]

export default function InsulationPanel() {
  const [scenarioId, setScenarioId] = useState(INSULATION_SCENARIOS[0].id)
  const scenario = INSULATION_SCENARIOS.find((s) => s.id === scenarioId)!
  const [voltage, setVoltage] = useState<TestVoltageV>(500)
  const [confirmed, setConfirmed] = useState(false)
  const [result, setResult] = useState<ReturnType<typeof readInsulation> | null>(null)

  return (
    <div className="space-y-5">
      <SafetyNotice tone="danger">
        <strong>Simulation only.</strong> A real insulation tester applies a high DC test voltage. This instrument never drives anything real — it exists to teach the procedure and how to read the result. Completing this exercise does not certify you to carry out a live insulation test.
      </SafetyNotice>

      <Panel title="Safety procedure (must confirm before testing)">
        <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-300">
          {describeSafetyProcedure().map((s) => <li key={s}>{s}</li>)}
        </ol>
        <label className="mt-3 flex items-center gap-2 text-sm text-ink-300">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
          I have carried out (in simulation) every step above.
        </label>
      </Panel>

      <Panel title="Test setup">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-ink-300">
            Cable / circuit under test
            <select className="mt-1 w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={scenarioId} onChange={(e) => { setScenarioId(e.target.value); setResult(null) }}>
              {INSULATION_SCENARIOS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
          <div>
            <p className="mb-1.5 text-xs text-ink-400">Test voltage</p>
            <div className="flex gap-1.5">
              {VOLTAGES.map((v) => (
                <Button key={v} variant={voltage === v ? 'primary' : 'secondary'} onClick={() => setVoltage(v)}>{v} V</Button>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-ink-500">{scenario.description}</p>
        <div className="mt-4">
          <Button variant="primary" disabled={!confirmed} onClick={() => setResult(readInsulation(scenario, voltage))} data-testid="insulation-measure">
            Apply test voltage and measure
          </Button>
          {!confirmed && <span className="ml-2 text-xs text-ink-500">Confirm the safety procedure first.</span>}
        </div>
      </Panel>

      <Panel title="Reading">
        {result ? (
          <>
            <div className={`font-mono text-2xl ${result.ok ? 'text-live-400' : 'text-danger-400'}`}>{result.display}</div>
            <p className="mt-2 text-sm text-ink-300">{result.note}</p>
            {!result.ok && <Tag tone="danger">Do not energise</Tag>}
          </>
        ) : (
          <div className="font-mono text-2xl text-ink-500">— — —</div>
        )}
      </Panel>
    </div>
  )
}
