import { useState } from 'react'
import { BATTERY_PRESETS, readBattery, simulateCapacityTest } from '../../engine/instruments/battery'
import { Button, Panel, SafetyNotice } from '../../ui/primitives'

export default function BatteryPanel() {
  const [presetId, setPresetId] = useState(Object.keys(BATTERY_PRESETS)[0])
  const pack = BATTERY_PRESETS[presetId]
  const [testCurrent, setTestCurrent] = useState(10)
  const reading = readBattery(pack, testCurrent)
  const [capacity, setCapacity] = useState<ReturnType<typeof simulateCapacityTest> | null>(null)
  const cutoff = pack.chemistry === 'lead-acid' ? pack.nominalVoltage * 0.875 : pack.nominalVoltage * 0.9167

  return (
    <div className="space-y-5">
      <SafetyNotice>Connects to the same lead-acid and LiFePO₄ models used in the solar and battery curriculum (S2), with a simplified constant internal-resistance approximation — see the course notes for what this simplifies.</SafetyNotice>

      <Panel title="Battery pack">
        <select className="w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={presetId} onChange={(e) => { setPresetId(e.target.value); setCapacity(null) }}>
          {Object.entries(BATTERY_PRESETS).map(([id, p]) => <option key={id} value={id}>{id} — {p.nominalVoltage} V {p.chemistry}, {p.stateOfChargePct}% SoC</option>)}
        </select>
      </Panel>

      <Panel title="Open-circuit and loaded voltage">
        <label className="text-sm text-ink-300">
          Test load current (A): {testCurrent}
          <input type="range" min={1} max={40} step={1} value={testCurrent} onChange={(e) => setTestCurrent(Number(e.target.value))} className="mt-1 w-full" />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Open-circuit V" value={`${reading.openCircuitVoltage.toFixed(2)} V`} />
          <Stat label="Loaded V" value={`${reading.loadedVoltage.toFixed(2)} V`} />
          <Stat label="Internal R" value={`${(reading.internalResistanceOhm * 1000).toFixed(1)} mΩ`} />
          <Stat label="Sag" value={`${reading.voltageSagV.toFixed(2)} V (${reading.dropPct.toFixed(1)} %)`} />
        </div>
        <p className="mt-3 text-sm text-ink-300">Verdict: <strong className={reading.verdict === 'healthy' ? 'text-live-400' : reading.verdict === 'weak' ? 'text-caution-400' : 'text-danger-400'}>{reading.verdict}</strong> — a sag under 5 % of OCV is healthy, 5–15 % is weak/aged, above 15 % is failing.</p>
      </Panel>

      <Panel title="Capacity test (constant-current discharge, coulomb counting)">
        <Button variant="primary" onClick={() => setCapacity(simulateCapacityTest(pack, testCurrent, cutoff))}>Run discharge test to {cutoff.toFixed(1)} V cutoff</Button>
        {capacity && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Duration" value={`${capacity.durationHours.toFixed(2)} h`} />
            <Stat label="Measured Ah" value={`${capacity.measuredAh.toFixed(1)} Ah`} />
            <Stat label="Measured Wh" value={`${capacity.measuredWh.toFixed(0)} Wh`} />
            <Stat label="% of rated" value={`${capacity.pctOfRated.toFixed(0)} %`} />
          </div>
        )}
      </Panel>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-chassis-700 bg-chassis-900 p-3">
      <div className="text-[11px] text-ink-500">{label}</div>
      <div className="mt-0.5 font-mono text-lg text-ink-100">{value}</div>
    </div>
  )
}
