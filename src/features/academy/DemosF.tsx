import { useState, type ReactNode } from 'react'
import { plot } from './plot'
import { Slider } from './Slider'

/**
 * Foundation demonstrations (F1, F2). Every value is computed live from the formulas taught in
 * the lessons. Body-current zones use the approximate ranges quoted in F1.M1.L2.
 */
export type FoundationDemoId = 'body-current' | 'cap-discharge' | 'ohms-law' | 'divider' | 'rc-charge' | 'voltage-drop' | 'battery-load'

const fmtR = (v: number) => (v >= 1e6 ? `${(v / 1e6).toFixed(2)} MΩ` : v >= 1000 ? `${(v / 1000).toFixed(v >= 1e4 ? 0 : 2)} kΩ` : `${v.toFixed(v < 10 ? 2 : 0)} Ω`)
const fmtA = (a: number) => (Math.abs(a) >= 1 ? `${a.toFixed(2)} A` : `${(a * 1000).toFixed(a * 1000 >= 10 ? 1 : 2)} mA`)
const fmtT = (s: number) => (s >= 1 ? `${s.toFixed(2)} s` : `${(s * 1000).toFixed(2)} ms`)
/** Logarithmic slider position ↔ value. */
const logv = (t: number, lo: number, hi: number) => lo * Math.pow(hi / lo, t)
const logt = (v: number, lo: number, hi: number) => Math.log(v / lo) / Math.log(hi / lo)

function Readouts({ rows, testid }: { rows: [string, ReactNode, string?][]; testid?: string }) {
  return (
    <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-sm" data-testid={testid}>
      {rows.map(([k, v, id]) => (
        <div key={k} className="contents">
          <dt className="text-ink-400">{k}</dt>
          <dd className="readout text-ink-100" data-testid={id}>
            {v}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Curve({ f, lo, hi, marks = [], label }: { f: (t: number) => number; lo: number; hi: number; marks?: { t: number; label: string }[]; label: string }) {
  return (
    <svg viewBox="0 0 320 130" className="h-auto w-full" role="img" aria-label={label}>
      <line x1={20} x2={310} y1={110} y2={110} className="stroke-chassis-600" />
      <line x1={20} x2={20} y1={10} y2={110} className="stroke-chassis-600" />
      <path d={plot(f, 20, 10, 290, 100, lo, hi)} fill="none" className="stroke-live-400" strokeWidth={1.6} />
      {marks.map((m) => (
        <g key={m.label}>
          <line x1={20 + m.t * 290} x2={20 + m.t * 290} y1={10} y2={110} className="stroke-signal-400" strokeDasharray="3 3" />
          <text x={22 + m.t * 290} y={124} className="fill-signal-300 text-[9px]">
            {m.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

function BodyCurrentDemo() {
  const [v, setV] = useState(230)
  const [rt, setRt] = useState(logt(1000, 500, 100_000))
  const r = logv(rt, 500, 100_000)
  const ma = (v / r) * 1000
  const zone = ma < 0.5 ? 'Usually not felt' : ma < 5 ? 'Perceptible to painful' : ma < 30 ? 'Around and above the let-go threshold: muscles may lock' : 'Fibrillation possible if the duration is long enough: potentially lethal'
  return (
    <div className="space-y-3" data-testid="demo-body">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Touch voltage" value={v} min={6} max={400} step={1} onChange={setV} fmt={(x) => `${x} V`} />
        <Slider label="Body resistance (wet ≈ 1 kΩ, dry ≈ tens of kΩ)" value={rt} min={0} max={1} step={0.005} onChange={setRt} fmt={() => fmtR(r)} />
      </div>
      <Readouts
        testid="demo-body-out"
        rows={[
          ['Body current I = V / R', `${ma.toFixed(ma < 10 ? 2 : 0)} mA`, 'demo-body-ma'],
          ['Likely effect (approximate)', zone],
        ]}
      />
      <p className="text-xs text-ink-400">Thresholds vary by person, path and duration. This demonstration is for understanding the hazard, never for judging a “safe” shock.</p>
    </div>
  )
}

function CapDischargeDemo() {
  const [c, setC] = useState(470)
  const [v0, setV0] = useState(400)
  const [rt, setRt] = useState(logt(10_000, 470, 470_000))
  const vs = 50
  const r = logv(rt, 470, 470_000)
  const tau = r * c * 1e-6
  const t = v0 > vs ? tau * Math.log(v0 / vs) : 0
  const e = 0.5 * c * 1e-6 * (v0 * v0 - Math.min(v0, vs) ** 2)
  return (
    <div className="space-y-3" data-testid="demo-capdis">
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Capacitance" value={c} min={100} max={4700} step={10} onChange={setC} fmt={(x) => `${x} µF`} />
        <Slider label="Initial voltage V₀" value={v0} min={60} max={450} step={5} onChange={setV0} fmt={(x) => `${x} V`} />
        <Slider label="Discharge resistor" value={rt} min={0} max={1} step={0.005} onChange={setRt} fmt={() => fmtR(r)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <Curve f={(x) => v0 * Math.exp((-x * Math.max(t * 1.5, 1e-6)) / tau)} lo={0} hi={v0} marks={[{ t: 1 / 1.5, label: `${vs} V at ${fmtT(t)}` }]} label="Capacitor voltage during discharge" />
        <Readouts
          rows={[
            ['τ = R·C', fmtT(tau), 'demo-capdis-tau'],
            [`Time to ${vs} V`, fmtT(t), 'demo-capdis-t'],
            ['Peak current V₀/R', fmtA(v0 / r)],
            ['Energy to the resistor', `${e.toFixed(1)} J`],
          ]}
        />
      </div>
      <p className="text-xs text-ink-400">Choose a resistor rated above V₀ that can absorb the energy as a pulse. After discharging, always measure with a verified tester.</p>
    </div>
  )
}

function OhmsLawDemo() {
  const [v, setV] = useState(12)
  const [rt, setRt] = useState(logt(1000, 10, 100_000))
  const r = logv(rt, 10, 100_000)
  const i = v / r
  return (
    <div className="space-y-3" data-testid="demo-ohm">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Voltage V" value={v} min={0} max={48} step={0.5} onChange={setV} fmt={(x) => `${x} V`} />
        <Slider label="Resistance R" value={rt} min={0} max={1} step={0.005} onChange={setRt} fmt={() => fmtR(r)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <Curve f={(x) => (x * 48) / r} lo={0} hi={Math.max(48 / r, 1e-9)} marks={[{ t: v / 48, label: `${v} V → ${fmtA(i)}` }]} label="Current against voltage for the chosen resistance" />
        <Readouts
          rows={[
            ['I = V / R', fmtA(i), 'demo-ohm-i'],
            ['P = V·I', `${(v * i).toFixed(v * i < 1 ? 3 : 2)} W`, 'demo-ohm-p'],
            ['Suggested rating (×2)', `≥ ${(2 * v * i).toFixed(2)} W`],
          ]}
        />
      </div>
      <p className="text-xs text-ink-400">The I–V line of a resistor is straight through the origin with slope 1/R. Build the same circuit in ckt-01 and compare the solver’s current.</p>
    </div>
  )
}

function DividerDemo() {
  const [vin, setVin] = useState(54)
  const [r1, setR1] = useState(56)
  const [r2, setR2] = useState(3.3)
  const [rlt, setRlt] = useState(1)
  const rl = logv(rlt, 1, 10_000) // kΩ
  const loaded = rlt < 1
  const r2e = loaded ? (r2 * rl) / (r2 + rl) : r2
  const vu = (vin * r2) / (r1 + r2)
  const vl = (vin * r2e) / (r1 + r2e)
  return (
    <div className="space-y-3" data-testid="demo-divider">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="V_in" value={vin} min={1} max={60} step={0.5} onChange={setVin} fmt={(x) => `${x} V`} />
        <Slider label="R₁" value={r1} min={1} max={220} step={1} onChange={setR1} fmt={(x) => `${x} kΩ`} />
        <Slider label="R₂" value={r2} min={0.1} max={47} step={0.1} onChange={setR2} fmt={(x) => `${x.toFixed(1)} kΩ`} />
        <Slider label="Load across R₂ (right = none)" value={rlt} min={0} max={1} step={0.005} onChange={setRlt} fmt={() => (loaded ? fmtR(rl * 1000) : 'none')} />
      </div>
      <Readouts
        rows={[
          ['Unloaded V_out = V_in·R₂/(R₁+R₂)', `${vu.toFixed(3)} V`, 'demo-div-vu'],
          ['Loaded V_out', `${vl.toFixed(3)} V`, 'demo-div-vl'],
          ['Loading error', `${(((vl - vu) / vu) * 100).toFixed(1)} %`],
          ['Divider current', fmtA(vin / ((r1 + r2e) * 1000))],
        ]}
      />
      <p className="text-xs text-ink-400">Keep the load at least 10× R₂ (ideally 100×). Dividers feed measuring inputs; they never power loads.</p>
    </div>
  )
}

const C_UNITS = [
  { l: 'µF', f: 1e-6 },
  { l: 'nF', f: 1e-9 },
  { l: 'mF', f: 1e-3 },
]
function RcChargeDemo() {
  const [r, setR] = useState(1)
  const [ru, setRu] = useState(1000)
  const [c, setC] = useState(1000)
  const [cu, setCu] = useState(0)
  const [v, setV] = useState(12)
  const tau = r * ru * c * C_UNITS[cu].f
  return (
    <div className="space-y-3" data-testid="demo-rc">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Slider label="R" value={r} min={0.1} max={100} step={0.1} onChange={setR} fmt={(x) => `${x.toFixed(1)} ${ru === 1000 ? 'kΩ' : ru === 1 ? 'Ω' : 'MΩ'}`} />
          <select aria-label="Resistance unit" value={ru} onChange={(e) => setRu(Number(e.target.value))} className="rounded bg-chassis-800 px-2 py-1 text-xs text-ink-100" data-testid="demo-rc-ru">
            <option value={1}>Ω</option>
            <option value={1000}>kΩ</option>
            <option value={1e6}>MΩ</option>
          </select>
        </div>
        <div className="space-y-1">
          <Slider label="C" value={c} min={1} max={4700} step={1} onChange={setC} fmt={(x) => `${x} ${C_UNITS[cu].l}`} />
          <select aria-label="Capacitance unit" value={cu} onChange={(e) => setCu(Number(e.target.value))} className="rounded bg-chassis-800 px-2 py-1 text-xs text-ink-100" data-testid="demo-rc-cu">
            {C_UNITS.map((u, i) => (
              <option key={u.l} value={i}>
                {u.l}
              </option>
            ))}
          </select>
        </div>
        <Slider label="Supply V" value={v} min={1} max={48} step={1} onChange={setV} fmt={(x) => `${x} V`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <Curve f={(x) => v * (1 - Math.exp(-x * 5))} lo={0} hi={v} marks={[{ t: 0.2, label: '1τ: 63.2 %' }, { t: 1, label: '5τ' }]} label="Capacitor charging over five time constants" />
        <Readouts
          rows={[
            ['τ = R·C', fmtT(tau), 'demo-rc-tau'],
            ['v_C at 1τ', `${(v * 0.632).toFixed(2)} V`],
            ['“Fully” charged (5τ)', fmtT(5 * tau)],
            ['Initial current V/R', fmtA(v / (r * ru))],
          ]}
        />
      </div>
      <p className="text-xs text-ink-400">Convert to base units: τ (s) = R (Ω) × C (F). Compare with the 63.2 % point you measure in sim-01.</p>
    </div>
  )
}

const SIZES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120]
function VoltageDropDemo() {
  const [i, setI] = useState(110)
  const [l, setL] = useState(2.5)
  const [ai, setAi] = useState(6)
  const [vs, setVs] = useState(24)
  const a = SIZES[ai]
  const rc = (0.0172 * 2 * l) / a
  const drop = i * rc
  const pct = (drop / vs) * 100
  return (
    <div className="space-y-3" data-testid="demo-vdrop">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Current" value={i} min={1} max={250} step={1} onChange={setI} fmt={(x) => `${x} A`} />
        <Slider label="Route length (one way)" value={l} min={0.5} max={30} step={0.5} onChange={setL} fmt={(x) => `${x} m`} />
        <Slider label="Copper cross-section" value={ai} min={0} max={SIZES.length - 1} step={1} onChange={setAi} fmt={() => `${a} mm²`} />
        <Slider label="System voltage" value={vs} min={12} max={48} step={12} onChange={setVs} fmt={(x) => `${x} V`} />
      </div>
      <Readouts
        rows={[
          ['R_cable = ρ·2L/A', `${(rc * 1000).toFixed(2)} mΩ`],
          ['Drop I·R', `${drop.toFixed(3)} V`, 'demo-vdrop-v'],
          ['Drop %', <span key="pct" className={pct > 3 ? 'text-danger-400' : pct > 1.5 ? 'text-caution-400' : 'text-live-400'}>{pct.toFixed(2)} %</span>, 'demo-vdrop-pct'],
          ['Cable loss I²R', `${(i * i * rc).toFixed(1)} W`],
          ['Voltage at the load', `${(vs - drop).toFixed(2)} V`],
        ]}
      />
      <p className="text-xs text-ink-400">Typical limits are 1–3 % for battery and PV circuits. After sizing for drop, check the cable’s current capacity in the manufacturer’s table and fuse it at the battery.</p>
    </div>
  )
}

function BatteryLoadDemo() {
  const [e, setE] = useState(25.6)
  const [r, setR] = useState(12)
  const [p, setP] = useState(1000)
  const [ah, setAh] = useState(200)
  const [dod, setDod] = useState(0.8)
  const eta = 0.92
  // Solve P_in = V·I with V = E − I·r  →  r·I² − E·I + P_in = 0.
  const pin = p / eta
  const rr = r / 1000
  const disc = e * e - 4 * rr * pin
  const ok = disc >= 0
  const i = ok ? (e - Math.sqrt(disc)) / (2 * rr) : NaN
  const vt = e - i * rr
  const runtime = (e * ah * dod * eta) / p
  return (
    <div className="space-y-3" data-testid="demo-battery">
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="EMF E" value={e} min={12} max={52} step={0.4} onChange={setE} fmt={(x) => `${x.toFixed(1)} V`} />
        <Slider label="Internal resistance r" value={r} min={1} max={60} step={1} onChange={setR} fmt={(x) => `${x} mΩ`} />
        <Slider label="AC load power" value={p} min={50} max={4000} step={50} onChange={setP} fmt={(x) => `${x} W`} />
        <Slider label="Capacity" value={ah} min={20} max={600} step={10} onChange={setAh} fmt={(x) => `${x} Ah`} />
        <Slider label="Allowed depth of discharge" value={dod} min={0.3} max={0.95} step={0.05} onChange={setDod} fmt={(x) => `${Math.round(x * 100)} %`} />
      </div>
      <Readouts
        rows={[
          ['Battery current (η = 92 %)', ok ? fmtA(i) : 'beyond the battery’s capability', 'demo-bat-i'],
          ['Terminal voltage E − I·r', ok ? `${vt.toFixed(2)} V` : '—', 'demo-bat-v'],
          ['Heat inside the battery I²r', ok ? `${(i * i * rr).toFixed(1)} W` : '—'],
          ['Runtime ≈ E·Ah·DoD·η / P', `${runtime.toFixed(2)} h`, 'demo-bat-t'],
        ]}
      />
      <p className="text-xs text-ink-400">Typical values for learning. The terminal voltage sags under load and recovers at rest; real limits and capacity at high discharge rates come from the battery datasheet.</p>
    </div>
  )
}

export function FoundationDemo({ id }: { id: FoundationDemoId }) {
  switch (id) {
    case 'body-current':
      return <BodyCurrentDemo />
    case 'cap-discharge':
      return <CapDischargeDemo />
    case 'ohms-law':
      return <OhmsLawDemo />
    case 'divider':
      return <DividerDemo />
    case 'rc-charge':
      return <RcChargeDemo />
    case 'voltage-drop':
      return <VoltageDropDemo />
    case 'battery-load':
      return <BatteryLoadDemo />
  }
}
