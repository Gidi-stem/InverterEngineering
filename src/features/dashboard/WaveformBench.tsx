import { useMemo, useState } from 'react'
import type { WaveformKind } from '../../types/domain'
import { DEFAULT_PARAMS, analyse, sampleWaveform, type WaveformParams } from '../../engine/waveform/waveforms'
import { useProgress } from '../../store/progressStore'
import { Button, Panel } from '../../ui/primitives'
import { ScopeTrace } from './ScopeTrace'

const KINDS: { id: WaveformKind; label: string; note: string }[] = [
  { id: 'square', label: 'Square', note: 'Bridge switches once per half-cycle: ±Vdc.' },
  { id: 'modified-sine', label: 'Modified sine', note: 'Quasi-square: ±Vdc with a zero-voltage dwell. 120° removes the 3rd harmonic.' },
  { id: 'pwm', label: 'SPWM (unfiltered)', note: 'Unipolar sinusoidal PWM at the bridge terminals, before the LC filter.' },
  { id: 'pure-sine', label: 'Pure sine', note: 'Ideal filtered SPWM output: m·Vdc·sin ωt.' },
  { id: 'rectified', label: 'Rectified', note: 'Full-wave rectified sine (ideal diodes), peak = Vdc.' },
]

function fmt(v: number, digits = 1) {
  return Number.isFinite(v) ? v.toFixed(digits) : '—'
}

function Slider(props: { id: string; label: string; unit: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label htmlFor={props.id} className="flex items-baseline justify-between text-xs text-ink-400">
        {props.label}
        <span className="readout text-sm text-ink-100">
          {props.value}
          <span className="ml-0.5 text-ink-500">{props.unit}</span>
        </span>
      </label>
      <input id={props.id} type="range" className="range mt-1.5" min={props.min} max={props.max} step={props.step} value={props.value} onChange={(e) => props.onChange(Number(e.target.value))} />
    </div>
  )
}

export function WaveformBench() {
  const [kind, setKind] = useState<WaveformKind>('modified-sine')
  const [p, setP] = useState<WaveformParams>(DEFAULT_PARAMS)
  const [logged, setLogged] = useState(false)
  const record = useProgress((s) => s.recordSimulationRun)
  const upd = (patch: Partial<WaveformParams>) => {
    setP((x) => ({ ...x, ...patch }))
    setLogged(false)
  }

  const cycles = 2
  const display = useMemo(() => sampleWaveform(kind, p, kind === 'pwm' ? 3000 : 800, cycles), [kind, p])
  const a = useMemo(() => analyse(sampleWaveform(kind, p, kind === 'pwm' ? 8000 : 3600), 1, 15), [kind, p])
  const meta = KINDS.find((k) => k.id === kind)!
  const showM = kind === 'pwm' || kind === 'pure-sine'

  const logRun = () => {
    record({
      source: 'dashboard-bench',
      label: `${meta.label} · ${p.vdc} V · ${p.frequencyHz} Hz`,
      params: { waveform: kind, dcInputV: p.vdc, frequencyHz: p.frequencyHz, conductionDeg: p.conductionDeg, modulationIndex: p.modulationIndex, switchingHz: p.carrierHz },
      results: { acOutputVrms: a.rms, thd: a.thd, frequencyHz: p.frequencyHz },
    })
    setLogged(true)
  }

  const readouts = [
    { k: 'V peak', v: fmt(a.peak), u: 'V' },
    { k: 'V rms', v: fmt(a.rms), u: 'V' },
    { k: 'Fundamental', v: fmt(a.fundamentalRms), u: 'V rms' },
    { k: kind === 'rectified' ? 'V average' : 'THD', v: kind === 'rectified' ? fmt(a.average) : fmt(a.thd * 100), u: kind === 'rectified' ? 'V' : '%' },
  ]
  const maxH = Math.max(...a.harmonics, 1e-9)

  return (
    <Panel
      title="Output stage bench — H-bridge waveform"
      action={
        <Button variant={logged ? 'ghost' : 'primary'} onClick={logRun} disabled={logged}>
          {logged ? 'Run logged ✓' : 'Log this run'}
        </Button>
      }
    >
      <div className="mb-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Waveform">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            role="radio"
            aria-checked={kind === k.id}
            onClick={() => {
              setKind(k.id)
              setLogged(false)
            }}
            className={`min-h-9 rounded-md border px-3 text-sm transition-colors ${kind === k.id ? 'border-signal-400 bg-signal-500/20 text-ink-100' : 'border-chassis-600 bg-chassis-800 text-ink-400 hover:text-ink-100'}`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          <ScopeTrace samples={display} spanS={cycles / p.frequencyHz} peak={kind === 'pure-sine' ? p.vdc : a.peak} rms={a.rms} />
          <p className="mt-2 text-sm text-ink-400">{meta.note}</p>
        </div>

        <div className="flex flex-col gap-4">
          <dl className="grid grid-cols-2 gap-2">
            {readouts.map((r) => (
              <div key={r.k} className="rounded-md border border-chassis-700 bg-chassis-950/70 px-3 py-2">
                <dt className="text-[11px] text-ink-500">{r.k}</dt>
                <dd className="readout text-lg text-ink-100">
                  {r.v}
                  <span className="ml-1 text-xs text-ink-500">{r.u}</span>
                </dd>
              </div>
            ))}
          </dl>
          <Slider id="vdc" label="DC bus voltage" unit="V" min={12} max={400} step={1} value={p.vdc} onChange={(vdc) => upd({ vdc })} />
          <div>
            <span className="text-xs text-ink-400">Output frequency</span>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {([50, 60] as const).map((f) => (
                <button key={f} type="button" aria-pressed={p.frequencyHz === f} onClick={() => upd({ frequencyHz: f })} className={`readout min-h-9 rounded-md border text-sm ${p.frequencyHz === f ? 'border-signal-400 bg-signal-500/20' : 'border-chassis-600 bg-chassis-800 text-ink-400'}`}>
                  {f} Hz
                </button>
              ))}
            </div>
          </div>
          {kind === 'modified-sine' && <Slider id="alpha" label="Conduction angle α" unit="°" min={30} max={180} step={1} value={p.conductionDeg} onChange={(conductionDeg) => upd({ conductionDeg })} />}
          {showM && <Slider id="m" label="Modulation index m" unit="" min={0.1} max={1} step={0.01} value={p.modulationIndex} onChange={(modulationIndex) => upd({ modulationIndex })} />}
          {kind === 'pwm' && <Slider id="fc" label="Carrier frequency" unit="Hz" min={500} max={5000} step={50} value={p.carrierHz} onChange={(carrierHz) => upd({ carrierHz })} />}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-xs font-medium text-ink-300">Harmonic spectrum (orders 1–15, % of fundamental)</h3>
        </div>
        <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] items-end gap-1" style={{ height: 72 }}>
          {a.harmonics.map((hv, i) => {
            const rel = a.harmonics[0] > 1e-9 ? hv / a.harmonics[0] : hv / maxH
            return (
              <div key={i} className="flex h-full flex-col justify-end" title={`H${i + 1}: ${fmt(rel * 100)} %`}>
                <div className={`rounded-sm ${i === 0 ? 'bg-live-400' : 'bg-signal-500'}`} style={{ height: `${Math.max(rel * 100, rel > 0.001 ? 3 : 0)}%` }} />
              </div>
            )
          })}
        </div>
        <div className="readout mt-1 grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1 text-center text-[10px] text-ink-500">
          {a.harmonics.map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
      </div>

      <details className="mt-4 rounded-md border border-chassis-700 bg-chassis-950/50 px-3 py-2 text-sm text-ink-400">
        <summary className="cursor-pointer text-ink-300">Model assumptions and equations</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Ideal switches (no on-resistance, switching time or dead-time) and a stiff DC bus with no ripple.</li>
          <li>Square wave: V<sub>rms</sub> = V<sub>dc</sub>, V<sub>1,rms</sub> = 4V<sub>dc</sub>/(π√2) ≈ 0.900 V<sub>dc</sub>, THD ≈ 48.3 %.</li>
          <li>Modified sine: V<sub>rms</sub> = V<sub>dc</sub>√(α/180°), V<sub>1,peak</sub> = (4V<sub>dc</sub>/π)·sin(α/2).</li>
          <li>SPWM: fundamental peak = m·V<sub>dc</sub> for m ≤ 1; pure sine is that fundamental after an ideal LC filter.</li>
          <li>THD is computed numerically with Parseval's theorem: √(V<sub>rms</sub>² − V<sub>0</sub>² − V<sub>1</sub>²)/V<sub>1</sub>. The engine is unit-tested against the closed forms above.</li>
          <li>A 325 V bus gives ≈230 V rms only for a pure sine with m = 1; real inverters use a transformer or boost stage to reach mains voltage from a 12–48 V battery.</li>
        </ul>
      </details>
    </Panel>
  )
}
