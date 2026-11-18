import { useMemo, useState } from 'react'
import { captureScope, SCOPE_GRID } from '../../engine/instruments/scope'
import type { WaveformKind } from '../../types/domain'
import { Panel, Tag } from '../../ui/primitives'

const WAVEFORMS: { id: WaveformKind; label: string }[] = [
  { id: 'square', label: 'Square-wave inverter output' },
  { id: 'modified-sine', label: 'Modified sine wave' },
  { id: 'pure-sine', label: 'Pure sine (filtered SPWM)' },
  { id: 'pwm', label: 'Unfiltered SPWM / PWM' },
  { id: 'rectified', label: 'Rectified DC' },
]

const W = 640
const H = 320

export default function ScopePanel() {
  const [waveform, setWaveform] = useState<WaveformKind>('pure-sine')
  const [vdc, setVdc] = useState(325)
  const [frequencyHz, setFrequencyHz] = useState(50)
  const [conductionDeg, setConductionDeg] = useState(120)
  const [modulationIndex, setModulationIndex] = useState(1)
  const [carrierHz, setCarrierHz] = useState(1000)
  const [timePerDiv, setTimePerDiv] = useState(0.002)
  const [voltsPerDiv, setVoltsPerDiv] = useState(100)
  const [triggerLevel, setTriggerLevel] = useState(0)

  const trace = useMemo(() => captureScope({ waveform, params: { vdc, frequencyHz, conductionDeg, modulationIndex, carrierHz }, timePerDiv, voltsPerDiv, triggerLevel }), [waveform, vdc, frequencyHz, conductionDeg, modulationIndex, carrierHz, timePerDiv, voltsPerDiv, triggerLevel])

  const path = useMemo(() => {
    const divsV = SCOPE_GRID.divsV
    const x = (t: number) => (t / trace.frameSeconds) * W
    const y = (v: number) => H / 2 - (v / (voltsPerDiv * (divsV / 2))) * (H / 2)
    return trace.points.map(([t, v], i) => `${i === 0 ? 'M' : 'L'} ${x(t).toFixed(1)} ${Math.max(0, Math.min(H, y(v))).toFixed(1)}`).join(' ')
  }, [trace, voltsPerDiv])

  const m = trace.measurements

  return (
    <div className="space-y-5">
      <Panel title="Oscilloscope trace" action={<Tag tone="signal">Live from the Phase 5 waveform engine</Tag>}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-md border border-chassis-700 bg-chassis-950" role="img" aria-label="Oscilloscope trace">
          {Array.from({ length: SCOPE_GRID.divsH + 1 }).map((_, i) => (
            <line key={`v${i}`} x1={(i * W) / SCOPE_GRID.divsH} y1={0} x2={(i * W) / SCOPE_GRID.divsH} y2={H} stroke="currentColor" className="text-chassis-700" strokeWidth={1} />
          ))}
          {Array.from({ length: SCOPE_GRID.divsV + 1 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={(i * H) / SCOPE_GRID.divsV} x2={W} y2={(i * H) / SCOPE_GRID.divsV} stroke="currentColor" className="text-chassis-700" strokeWidth={1} />
          ))}
          <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="currentColor" className="text-chassis-500" strokeWidth={1.5} />
          <path d={path} fill="none" stroke="currentColor" className="text-live-400" strokeWidth={2} />
        </svg>
        <p className="mt-2 text-xs text-ink-500">Time/div: {(timePerDiv * 1000).toFixed(2)} ms · Volts/div: {voltsPerDiv} V · Trigger: {triggerLevel} V rising</p>
      </Panel>

      <Panel title="Controls">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-ink-300">
            Waveform (Phase 5 model)
            <select className="mt-1 w-full rounded-md border border-chassis-600 bg-chassis-900 px-2.5 py-2 text-sm text-ink-100" value={waveform} onChange={(e) => setWaveform(e.target.value as WaveformKind)}>
              {WAVEFORMS.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
            </select>
          </label>
          <label className="text-sm text-ink-300">
            DC bus / peak (V): {vdc}
            <input type="range" min={12} max={400} step={1} value={vdc} onChange={(e) => setVdc(Number(e.target.value))} className="mt-1 w-full" />
          </label>
          <label className="text-sm text-ink-300">
            Fundamental frequency (Hz): {frequencyHz}
            <input type="range" min={1} max={400} step={1} value={frequencyHz} onChange={(e) => setFrequencyHz(Number(e.target.value))} className="mt-1 w-full" />
          </label>
          <label className="text-sm text-ink-300">
            Time/div: {(timePerDiv * 1000).toFixed(2)} ms
            <input type="range" min={0.0001} max={0.02} step={0.0001} value={timePerDiv} onChange={(e) => setTimePerDiv(Number(e.target.value))} className="mt-1 w-full" />
          </label>
          <label className="text-sm text-ink-300">
            Volts/div: {voltsPerDiv} V
            <input type="range" min={5} max={200} step={5} value={voltsPerDiv} onChange={(e) => setVoltsPerDiv(Number(e.target.value))} className="mt-1 w-full" />
          </label>
          <label className="text-sm text-ink-300">
            Trigger level (V): {triggerLevel}
            <input type="range" min={-Math.round(vdc)} max={Math.round(vdc)} step={1} value={triggerLevel} onChange={(e) => setTriggerLevel(Number(e.target.value))} className="mt-1 w-full" />
          </label>
          {waveform === 'modified-sine' && (
            <label className="text-sm text-ink-300">
              Conduction angle (°): {conductionDeg}
              <input type="range" min={10} max={180} step={1} value={conductionDeg} onChange={(e) => setConductionDeg(Number(e.target.value))} className="mt-1 w-full" />
            </label>
          )}
          {waveform === 'pwm' && (
            <>
              <label className="text-sm text-ink-300">
                Modulation index: {modulationIndex.toFixed(2)}
                <input type="range" min={0.1} max={1} step={0.05} value={modulationIndex} onChange={(e) => setModulationIndex(Number(e.target.value))} className="mt-1 w-full" />
              </label>
              <label className="text-sm text-ink-300">
                Carrier (switching) frequency (Hz): {carrierHz}
                <input type="range" min={200} max={20000} step={100} value={carrierHz} onChange={(e) => setCarrierHz(Number(e.target.value))} className="mt-1 w-full" />
              </label>
            </>
          )}
        </div>
      </Panel>

      <Panel title="Cursor measurements">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Period" value={m.periodS ? `${(m.periodS * 1000).toFixed(2)} ms` : '—'} />
          <Stat label="Frequency" value={m.frequencyHz ? `${m.frequencyHz.toFixed(1)} Hz` : '—'} />
          <Stat label="Peak" value={`${m.vPeak.toFixed(1)} V`} />
          <Stat label="Peak-to-peak" value={`${m.vPeakToPeak.toFixed(1)} V`} />
          <Stat label="RMS" value={`${m.vRms.toFixed(1)} V`} />
          <Stat label="Duty cycle" value={m.dutyCycle !== null ? `${(m.dutyCycle * 100).toFixed(0)} %` : '—'} />
        </div>
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
