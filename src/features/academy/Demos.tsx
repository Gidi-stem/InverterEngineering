import { useMemo, useState } from 'react'
import type { DemoId } from '../../content/academy/types'
import { Link } from 'react-router-dom'
import { BUILD_PROJECT_BY_ID, suggestSelection } from '../../content/buildProjects'
import { calculate } from '../../engine/design/calc'
import { quasiSquareCrest, quasiSquareTHD } from '../../engine/design/testing'
import { LcFilter, Spwm } from './diagrams'
import { FoundationDemo } from './DemosF'
import { Slider } from './Slider'
import { SolarDemo } from './DemosSolar'

/** Interactive lesson demonstrations. Every number is computed live from the engine’s formulas. */
function SpwmChain() {
  const [m, setM] = useState(0.8)
  const [fr, setFr] = useState(15)
  return (
    <div className="space-y-3" data-testid="demo-spwm">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Modulation index m" value={m} min={0.1} max={1.2} step={0.05} onChange={setM} fmt={(v) => v.toFixed(2)} />
        <Slider label="Carrier ratio f_sw / f" value={fr} min={5} max={41} step={2} onChange={setFr} fmt={(v) => `${v}`} />
      </div>
      <Spwm m={m} fr={fr} />
      <p className="text-xs text-ink-400">
        Duty at the positive peak = (1 + m)/2 = {Math.min(100, ((1 + m) / 2) * 100).toFixed(0)} %. {m > 1 ? 'm > 1: over-modulation. Pulses merge near the peaks and low-order harmonics appear.' : 'The pulse width follows the sine; the filtered output is m·V_dc·sin ωt.'}
      </p>
    </div>
  )
}

function QuasiSquareDemo() {
  const [d, setD] = useState(90)
  const harm = [1, 3, 5, 7, 9, 11, 13, 15].map((k) => ({ k, a: Math.abs(Math.sin((k * d * Math.PI) / 360)) / k / Math.max(1e-9, Math.sin((d * Math.PI) / 360)) }))
  return (
    <div className="space-y-3" data-testid="demo-quasi">
      <Slider label="Conduction angle δ" value={d} min={30} max={180} step={5} onChange={setD} fmt={(v) => `${v}°`} />
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <svg viewBox="0 0 320 120" className="h-auto w-full" role="img" aria-label="Harmonic spectrum">
          {harm.map((h, i) => (
            <g key={h.k}>
              <rect x={20 + i * 37} y={100 - h.a * 90} width={24} height={h.a * 90} className={h.k === 1 ? 'fill-signal-400' : 'fill-caution-400/80'} />
              <text x={32 + i * 37} y={114} textAnchor="middle" className="fill-ink-500 text-[10px]">
                {h.k}
              </text>
            </g>
          ))}
        </svg>
        <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-1 self-center text-sm">
          <dt className="text-ink-400">RMS / V_pk</dt>
          <dd className="readout text-ink-100">{Math.sqrt(d / 180).toFixed(3)}</dd>
          <dt className="text-ink-400">Crest factor</dt>
          <dd className="readout text-ink-100">{quasiSquareCrest(d).toFixed(2)}</dd>
          <dt className="text-ink-400">THD</dt>
          <dd className="readout text-ink-100" data-testid="demo-quasi-thd">
            {(quasiSquareTHD(d) * 100).toFixed(1)} %
          </dd>
        </dl>
      </div>
      <p className="text-xs text-ink-400">Harmonic amplitudes relative to the fundamental: |sin(kδ/2)| / (k·sin(δ/2)). Find the angle with the lowest THD.</p>
    </div>
  )
}

function LcDemo() {
  const [L, setL] = useState(100)
  const [C, setC] = useState(1880)
  const [R, setR] = useState(0.132)
  const fc = 1 / (2 * Math.PI * Math.sqrt(L * 1e-6 * C * 1e-6))
  const q = R * Math.sqrt((C * 1e-6) / (L * 1e-6))
  return (
    <div className="space-y-3" data-testid="demo-lc">
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="L (primary)" value={L} min={20} max={500} step={10} onChange={setL} fmt={(v) => `${v} µH`} />
        <Slider label="C (referred to primary)" value={C} min={200} max={5000} step={20} onChange={setC} fmt={(v) => `${v} µF`} />
        <Slider label="Load R (referred)" value={R} min={0.05} max={2} step={0.01} onChange={setR} fmt={(v) => `${v.toFixed(2)} Ω`} />
      </div>
      <LcFilter L={L * 1e-6} C={C * 1e-6} rated={R} light={5} note={`Green: your load (Q = ${q.toFixed(2)}). Amber: light load. Corner ${fc.toFixed(0)} Hz; carrier attenuation ≈ ${((5000 / fc) ** 2).toFixed(0)}× at 5 kHz.`} />
      <p className="text-xs text-ink-400">
        Target: f_c ≈ f_sw/10 and ≥ 10 × 50 Hz. Now f_c/f = {(fc / 50).toFixed(1)} and f_sw/f_c = {(5000 / fc).toFixed(1)}.
      </p>
    </div>
  )
}

function DesignCalcDemo() {
  const [pid, setPid] = useState<'bld-b' | 'bld-d'>('bld-b')
  const p = BUILD_PROJECT_BY_ID[pid]
  const [vdc, setVdc] = useState(12)
  const [power, setPower] = useState(500)
  const nb = useMemo(() => {
    const d = { ...p.defaults, vdc, power }
    return calculate(pid, d, suggestSelection(pid, d)).numbers
  }, [p, pid, vdc, power])
  const rows: [string, string][] = [
    ['Transformer ratio n', nb.n.toFixed(2)],
    ['DC current at V_nom', `${nb.idc.toFixed(1)} A`],
    ['DC current at V_min', `${nb.idcMax.toFixed(1)} A`],
    ['Estimated efficiency', `${(nb.efficiency * 100).toFixed(1)} %`],
    ['DC fuse', `${nb.fuse} A`],
    ['Switch rating needed', `≥ ${nb.switchVReq.toFixed(0)} V, ≥ ${nb.switchIReq.toFixed(0)} A`],
  ]
  return (
    <div className="space-y-3" data-testid="demo-calc">
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="text-xs text-ink-400">
          Project
          <select className="mt-0.5 min-h-10 w-full rounded-md border border-chassis-600 bg-chassis-900 px-2 text-sm text-ink-100" value={pid} onChange={(e) => setPid(e.target.value as 'bld-b' | 'bld-d')}>
            <option value="bld-b">B. Square-wave</option>
            <option value="bld-d">D. Pure sine-wave</option>
          </select>
        </label>
        <label className="text-xs text-ink-400">
          Battery
          <select className="mt-0.5 min-h-10 w-full rounded-md border border-chassis-600 bg-chassis-900 px-2 text-sm text-ink-100" value={vdc} onChange={(e) => setVdc(Number(e.target.value))}>
            {[12, 24, 48].map((v) => (
              <option key={v} value={v}>
                {v} V
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-ink-400">
          Power
          <select className="mt-0.5 min-h-10 w-full rounded-md border border-chassis-600 bg-chassis-900 px-2 text-sm text-ink-100" value={power} onChange={(e) => setPower(Number(e.target.value))}>
            {[300, 500, 1000, 1500, 2000].map((v) => (
              <option key={v} value={v}>
                {v} W
              </option>
            ))}
          </select>
        </label>
      </div>
      <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
        {rows.map(([a, b]) => (
          <div key={a} className="contents">
            <dt className="text-ink-400">{a}</dt>
            <dd className="readout text-right text-ink-100">{b}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-ink-400">
        Computed with compatible generic ratings. The full, explained sheet is in the{' '}
        <Link to={`/circuit-lab?ex=${pid}`} className="text-signal-300 hover:underline">
          project configurator
        </Link>
        .
      </p>
    </div>
  )
}

export function Demo({ id }: { id: DemoId }) {
  switch (id) {
    case 'body-current':
    case 'cap-discharge':
    case 'ohms-law':
    case 'divider':
    case 'rc-charge':
    case 'voltage-drop':
    case 'battery-load':
      return <FoundationDemo id={id} />
    case 'spwm-chain':
      return <SpwmChain />
    case 'quasi-square':
      return <QuasiSquareDemo />
    case 'lc-filter':
      return <LcDemo />
    case 'design-calc':
      return <DesignCalcDemo />
    default:
      return <SolarDemo id={id} />
  }
}
