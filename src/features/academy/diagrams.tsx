import { useMemo, type ReactNode } from 'react'
import { BUILD_PROJECT_BY_ID, suggestSelection } from '../../content/buildProjects'
import type { DiagramId } from '../../content/academy/types'
import { PART_DEFS, terminalPosition } from '../../engine/circuit/parts'
import type { CircuitDoc } from '../../engine/circuit/types'
import { calculate } from '../../engine/design/calc'
import { generateProject } from '../../engine/design/generate'
import { quasiSquareCrest, quasiSquareTHD } from '../../engine/design/testing'
import { PartGlyph } from '../circuit-lab/PartGlyph'

/** Lesson diagrams. Waveforms and responses are computed from the same formulas the engine uses. */
const W = 640
const txt = 'fill-ink-300 text-[11px]'
const dim = 'fill-ink-500 text-[10px]'

function Box({ x, y, w = 92, h = 34, label, sub, tone = 'n' }: { x: number; y: number; w?: number; h?: number; label: string; sub?: string; tone?: 'n' | 'p' | 's' | 'd' | 'c' }) {
  const cls = { n: 'fill-chassis-800 stroke-chassis-500', p: 'fill-live-400/10 stroke-live-400', s: 'fill-signal-500/10 stroke-signal-400', d: 'fill-danger-400/10 stroke-danger-400', c: 'fill-caution-400/10 stroke-caution-400' }[tone]
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5} className={cls} strokeWidth={1.2} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 2 : h / 2 + 4)} textAnchor="middle" className="fill-ink-100 text-[11px] font-medium">
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" className={dim}>
          {sub}
        </text>
      )}
    </g>
  )
}
const Arrow = ({ x1, y1, x2, y2, thick, cls = 'stroke-ink-400' }: { x1: number; y1: number; x2: number; y2: number; thick?: boolean; cls?: string }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} className={cls} strokeWidth={thick ? 2.6 : 1.3} markerEnd="url(#ac-arrow)" />
)
const Defs = () => (
  <defs>
    <marker id="ac-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10z" className="fill-ink-400" />
    </marker>
  </defs>
)
function Svg({ h, children, label }: { h: number; children: ReactNode; label: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${h}`} className="h-auto w-full" role="img" aria-label={label}>
      <Defs />
      {children}
    </svg>
  )
}

/** Polyline of a function sampled over [0,1] into a rectangle. */
function plot(f: (t: number) => number, x: number, y: number, w: number, h: number, lo: number, hi: number, n = 400) {
  let d = ''
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const v = f(t)
    const px = x + t * w
    const py = y + h - ((v - lo) / (hi - lo)) * h
    d += `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`
  }
  return d
}
function Trace({ d, cls }: { d: string; cls: string }) {
  return <path d={d} fill="none" className={cls} strokeWidth={1.5} />
}
const Axis = ({ x, y, w, label }: { x: number; y: number; w: number; label: string }) => (
  <g>
    <line x1={x} y1={y} x2={x + w} y2={y} className="stroke-chassis-600" strokeWidth={1} />
    <text x={x - 6} y={y + 4} textAnchor="end" className={dim}>
      {label}
    </text>
  </g>
)

const tri = (t: number) => {
  const p = t - Math.floor(t)
  return p < 0.5 ? 4 * p - 1 : 3 - 4 * p
}

export function Spwm({ m = 0.8, fr = 15 }: { m?: number; fr?: number }) {
  const ref = (t: number) => m * Math.sin(2 * Math.PI * t)
  const gate = (t: number) => (ref(t) > tri(t * fr) ? 1 : 0)
  // Filtered output: running average over one carrier period (first-order picture of the LC filter).
  const avg = (t: number) => {
    let s = 0
    for (let k = 0; k < 40; k++) s += gate(t - k / (40 * fr)) * 2 - 1
    return s / 40
  }
  const rows = [
    { y: 18, label: 'reference', el: <><Trace d={plot((t) => tri(t * fr), 70, 18, 550, 60, -1.1, 1.1, 1200)} cls="stroke-ink-500" /><Trace d={plot(ref, 70, 18, 550, 60, -1.1, 1.1)} cls="stroke-signal-300" /></> },
    { y: 98, label: 'gate Q1/Q4', el: <Trace d={plot(gate, 70, 98, 550, 40, -0.1, 1.1, 1500)} cls="stroke-caution-400" /> },
    { y: 158, label: 'bridge', el: <Trace d={plot((t) => gate(t) * 2 - 1, 70, 158, 550, 50, -1.2, 1.2, 1500)} cls="stroke-live-400" /> },
    { y: 228, label: 'filtered', el: <><Trace d={plot((t) => m * Math.sin(2 * Math.PI * t), 70, 228, 550, 60, -1.1, 1.1)} cls="stroke-ink-600" /><Trace d={plot(avg, 70, 228, 550, 60, -1.1, 1.1, 600)} cls="stroke-signal-300" /></> },
  ]
  return (
    <Svg h={300} label="SPWM: reference and carrier, gate signal, bridge voltage and filtered output">
      {rows.map((r) => (
        <g key={r.label}>
          <Axis x={70} y={r.y + (r.label === 'gate Q1/Q4' ? 36 : r.label === 'bridge' ? 25 : 30)} w={550} label={r.label} />
          {r.el}
        </g>
      ))}
      <text x={70} y={296} className={dim}>
        One 50 Hz cycle, carrier ratio {fr} (project D uses 100), m = {m.toFixed(2)}. Gate high while reference &gt; carrier; bridge = ±V_dc; filtered ≈ m·V_dc·sin ωt.
      </text>
    </Svg>
  )
}

function QuasiSquare() {
  const ds = [90, 120, 180]
  return (
    <Svg h={250} label="Stepped waves for 90, 120 and 180 degree conduction">
      {ds.map((d, i) => {
        const y = 14 + i * 76
        const half = d / 360
        const f = (t: number) => {
          const ph = (t * 2) % 1
          const sgn = Math.floor(t * 2) % 2 === 0 ? 1 : -1
          return Math.abs(ph - 0.5) < half ? sgn : 0
        }
        return (
          <g key={d}>
            <Axis x={70} y={y + 30} w={330} label={`δ = ${d}°`} />
            <Trace d={plot((t) => f(t), 70, y, 330, 60, -1.15, 1.15, 800)} cls="stroke-live-400" />
            <Trace d={plot((t) => Math.SQRT2 * Math.sin(2 * Math.PI * t) / Math.SQRT2, 70, y, 330, 60, -1.15, 1.15)} cls="stroke-ink-600" />
            <text x={420} y={y + 22} className={txt}>
              RMS = {Math.sqrt(d / 180).toFixed(3)} × V_pk
            </text>
            <text x={420} y={y + 38} className={txt}>
              crest factor = {quasiSquareCrest(d).toFixed(2)}
            </text>
            <text x={420} y={y + 54} className={txt}>
              THD = {(quasiSquareTHD(d) * 100).toFixed(1)} %
            </text>
          </g>
        )
      })}
      <text x={70} y={246} className={dim}>
        Grey: a sine of the same peak. THD from √(V_rms² − V₁²)/V₁ with V₁ = (4V/π)·sin(δ/2)/√2.
      </text>
    </Svg>
  )
}

export function LcFilter({ L = 1e-4, C = 1.88e-3, rated = 0.132, light = 5, fsw = 5000, note }: { L?: number; C?: number; rated?: number; light?: number; fsw?: number; note?: string }) {
  const fc = 1 / (2 * Math.PI * Math.sqrt(L * C))
  const mag = (f: number, R: number) => {
    const w = 2 * Math.PI * f
    const re = 1 - w * w * L * C
    const im = (w * L) / R
    return 20 * Math.log10(1 / Math.hypot(re, im))
  }
  const x0 = 70
  const w = 540
  const f0 = 10
  const f1 = 100000
  const fx = (f: number) => x0 + (Math.log10(f / f0) / Math.log10(f1 / f0)) * w
  const yv = (db: number) => 20 + ((20 - db) / 100) * 200
  const curve = (R: number) => {
    let d = ''
    for (let i = 0; i <= 300; i++) {
      const f = f0 * Math.pow(f1 / f0, i / 300)
      d += `${i ? 'L' : 'M'}${fx(f).toFixed(1)} ${Math.min(225, Math.max(15, yv(mag(f, R)))).toFixed(1)}`
    }
    return d
  }
  return (
    <Svg h={260} label="LC filter magnitude response">
      {[20, 0, -20, -40, -60, -80].map((db) => (
        <g key={db}>
          <line x1={x0} x2={x0 + w} y1={yv(db)} y2={yv(db)} className="stroke-chassis-700" />
          <text x={x0 - 6} y={yv(db) + 4} textAnchor="end" className={dim}>
            {db} dB
          </text>
        </g>
      ))}
      {[10, 100, 1000, 10000, 100000].map((f) => (
        <text key={f} x={fx(f)} y={240} textAnchor="middle" className={dim}>
          {f >= 1000 ? `${f / 1000} k` : f} Hz
        </text>
      ))}
      <Trace d={curve(rated)} cls="stroke-live-400" />
      <Trace d={curve(light)} cls="stroke-caution-400" />
      {[
        [50, '50 Hz'],
        [fc, `f_c ≈ ${fc.toFixed(0)} Hz`],
        [fsw, `carrier ${fsw / 1000} kHz`],
      ].map(([f, l]) => (
        <g key={String(l)}>
          <line x1={fx(f as number)} x2={fx(f as number)} y1={20} y2={225} className="stroke-signal-400" strokeDasharray="3 3" />
          <text x={fx(f as number) + 3} y={30} className="fill-signal-300 text-[10px]">
            {l}
          </text>
        </g>
      ))}
      <text x={x0} y={256} className={dim}>
        {note ?? `Project D filter referred to the primary (L = 0.1 mH, C = 1880 µF). Green: rated load (Q ≈ ${(rated * Math.sqrt(C / L)).toFixed(1)}). Amber: light load (Q ≈ ${(light * Math.sqrt(C / L)).toFixed(0)}) rings at f_c.`}
      </text>
    </Svg>
  )
}

function PvCurve() {
  const voc = 44
  const isc = 10
  const vk = 0.8 * voc
  const i = (v: number) => (v <= vk ? isc : Math.max(0, (isc * (voc - v)) / (voc - vk)))
  const x0 = 70
  const w = 480
  const xv = (v: number) => x0 + (v / 48) * w
  return (
    <Svg h={240} label="Simplified PV I-V and P-V curves">
      <line x1={x0} x2={x0 + w} y1={200} y2={200} className="stroke-chassis-600" />
      <Trace d={plot((t) => i(t * 48), x0, 20, w, 180, 0, 11)} cls="stroke-live-400" />
      <Trace d={plot((t) => (t * 48 * i(t * 48)) / 36, x0, 20, w, 180, 0, 11)} cls="stroke-caution-400" />
      <line x1={xv(vk)} x2={xv(vk)} y1={20} y2={200} className="stroke-signal-400" strokeDasharray="3 3" />
      <text x={xv(vk) + 4} y={34} className="fill-signal-300 text-[10px]">
        MPP: 35.2 V, 352 W (D = 24/35.2 = 0.68)
      </text>
      <line x1={xv(25.3)} x2={xv(25.3)} y1={120} y2={200} className="stroke-danger-400" strokeDasharray="3 3" />
      <text x={xv(25.3) - 4} y={130} textAnchor="end" className="fill-danger-400 text-[10px]">
        D = 0.95 → 25.3 V, 253 W
      </text>
      {[0, 12, 24, 36, 48].map((v) => (
        <text key={v} x={xv(v)} y={214} textAnchor="middle" className={dim}>
          {v} V
        </text>
      ))}
      <text x={x0 + w + 6} y={60} className="fill-live-400 text-[10px]">
        I (A)
      </text>
      <text x={x0 + w + 6} y={80} className="fill-caution-400 text-[10px]">
        P (W)
      </text>
      <text x={x0} y={234} className={dim}>
        Simplified model (V_oc = 44 V, I_sc = 10 A): constant current to a knee at 0.8·V_oc. Real modules have a rounded curve.
      </text>
    </Svg>
  )
}

function DeadTime() {
  const rows = [
    { y: 20, label: 'Q1 gate', f: (t: number) => (t > 0.05 && t < 0.45 ? 1 : 0) },
    { y: 70, label: 'Q2 gate', f: (t: number) => (t > 0.55 && t < 0.95 ? 1 : 0) },
    { y: 120, label: 'midpoint (i out)', f: (t: number) => (t > 0.05 && t < 0.45 ? 1 : 0) },
    { y: 170, label: 'midpoint (i in)', f: (t: number) => (t > 0.05 && t < 0.55) || t > 0.95 ? 1 : 0 },
  ]
  return (
    <Svg h={240} label="Dead time between complementary gate signals">
      {rows.map((r) => (
        <g key={r.label}>
          <Axis x={110} y={r.y + 36} w={500} label={r.label} />
          <Trace d={plot(r.f, 110, r.y, 500, 36, 0, 1, 1000)} cls={r.y < 100 ? 'stroke-caution-400' : 'stroke-live-400'} />
        </g>
      ))}
      {[0.45, 0.95].map((t) => (
        <rect key={t} x={110 + t * 500} y={14} width={0.1 * 500} height={200} className="fill-signal-500/10" />
      ))}
      <text x={110} y={234} className={dim}>
        Shaded: dead time (both off). The midpoint then follows the current: low-side diode if current flows out, high-side diode if it flows in.
      </text>
    </Svg>
  )
}

function HBridgeStates() {
  const cell = (x: number, title: string, on: number[], path: string, tone: string, note: string) => (
    <g key={title}>
      <text x={x + 70} y={16} textAnchor="middle" className="fill-ink-100 text-[11px] font-medium">
        {title}
      </text>
      <line x1={x + 10} x2={x + 130} y1={30} y2={30} className="stroke-ink-400" />
      <line x1={x + 10} x2={x + 130} y1={170} y2={170} className="stroke-ink-400" />
      {[
        [1, x + 30, 60],
        [2, x + 30, 130],
        [3, x + 110, 60],
        [4, x + 110, 130],
      ].map(([q, qx, qy]) => (
        <g key={q}>
          <rect x={qx - 12} y={qy - 18} width={24} height={36} rx={3} className={on.includes(q) ? 'fill-live-400/25 stroke-live-400' : 'fill-chassis-800 stroke-chassis-500'} />
          <text x={qx} y={qy + 4} textAnchor="middle" className="fill-ink-100 text-[10px]">
            Q{q}
          </text>
        </g>
      ))}
      <line x1={x + 30} x2={x + 30} y1={30} y2={42} className="stroke-ink-400" />
      <line x1={x + 30} x2={x + 30} y1={78} y2={112} className="stroke-ink-400" />
      <line x1={x + 30} x2={x + 30} y1={148} y2={170} className="stroke-ink-400" />
      <line x1={x + 110} x2={x + 110} y1={30} y2={42} className="stroke-ink-400" />
      <line x1={x + 110} x2={x + 110} y1={78} y2={112} className="stroke-ink-400" />
      <line x1={x + 110} x2={x + 110} y1={148} y2={170} className="stroke-ink-400" />
      <rect x={x + 55} y={88} width={30} height={14} rx={2} className="fill-chassis-700 stroke-ink-400" />
      <line x1={x + 30} x2={x + 55} y1={95} y2={95} className="stroke-ink-400" />
      <line x1={x + 85} x2={x + 110} y1={95} y2={95} className="stroke-ink-400" />
      <path d={path} fill="none" className={tone} strokeWidth={2.4} strokeDasharray="5 3" />
      <text x={x + 70} y={190} textAnchor="middle" className={dim}>
        {note}
      </text>
    </g>
  )
  return (
    <Svg h={200} label="H-bridge switch states">
      {cell(0, '+V_dc: Q1 + Q4', [1, 4], 'M30 34V95H110V166', 'stroke-live-400', 'current A → B')}
      {cell(160, '−V_dc: Q3 + Q2', [3, 2], 'M270 34V95H190V166', 'stroke-live-400', 'current B → A')}
      {cell(320, 'Zero: Q2 + Q4', [2, 4], 'M350 95V166H430V95', 'stroke-signal-300', 'load shorted (freewheel)')}
      {cell(480, 'FORBIDDEN: Q1 + Q2', [1, 2], 'M510 34V166', 'stroke-danger-400', 'shoot-through: bus short')}
    </Svg>
  )
}

function Chain({ items, h = 110, label, note }: { items: { l: string; s?: string; t?: 'n' | 'p' | 's' | 'd' | 'c' }[]; h?: number; label: string; note?: string }) {
  const n = items.length
  const bw = Math.min(96, (W - 20 - (n - 1) * 12) / n)
  return (
    <Svg h={h} label={label}>
      {items.map((it, i) => {
        const x = 10 + i * (bw + 12)
        return (
          <g key={i}>
            <Box x={x} y={30} w={bw} h={40} label={it.l} sub={it.s} tone={it.t} />
            {i < n - 1 && <Arrow x1={x + bw} y1={50} x2={x + bw + 11} y2={50} thick />}
          </g>
        )
      })}
      {note && (
        <text x={10} y={h - 10} className={dim}>
          {note}
        </text>
      )}
    </Svg>
  )
}

function InverterBlocks() {
  const top = ['Battery', 'Fuse', 'DC bus', 'H-bridge', 'L filter', 'Transformer', 'C filter', 'Breaker', 'Load']
  const bw = 62
  return (
    <Svg h={200} label="Power and signal chains of a sine-wave inverter">
      {top.map((l, i) => {
        const x = 8 + i * (bw + 9)
        return (
          <g key={l}>
            <Box x={x} y={22} w={bw} h={36} label={l} tone={l === 'Load' ? 'p' : l === 'Fuse' || l === 'Breaker' ? 'c' : 'n'} />
            {i < top.length - 1 && <Arrow x1={x + bw} y1={40} x2={x + bw + 8} y2={40} thick cls="stroke-live-400" />}
          </g>
        )
      })}
      <text x={8} y={14} className="fill-live-400 text-[10px]">
        POWER CHAIN
      </text>
      {['Voltage sensor', 'Regulator (m)', 'SPWM', 'Dead time', 'Gate drivers'].map((l, i) => (
        <g key={l}>
          <Box x={440 - i * 96} y={128} w={84} h={34} label={l} tone="s" />
          {i < 4 && <Arrow x1={440 - i * 96} y1={145} x2={440 - i * 96 - 11} y2={145} />}
        </g>
      ))}
      <text x={8} y={186} className="fill-signal-300 text-[10px]">
        SIGNAL CHAIN (feedback from the output back to the gates)
      </text>
      <Arrow x1={8 + 8 * 71 + 31} y1={58} x2={482} y2={127} />
      <Arrow x1={82} y1={128} x2={8 + 3 * 71 + 31} y2={59} />
    </Svg>
  )
}

function Thermal() {
  return (
    <Svg h={200} label="Thermal resistance network">
      {[0, 1, 2, 3].map((i) => {
        const x = 30 + i * 110
        return (
          <g key={i}>
            <Box x={x} y={14} w={86} h={30} label={`T_j  Q${i + 1}`} tone="c" />
            <Box x={x + 13} y={60} w={60} h={26} label="R_θjc" />
            <Box x={x + 13} y={98} w={60} h={26} label="R_θcs" />
            <line x1={x + 43} x2={x + 43} y1={44} y2={60} className="stroke-ink-400" />
            <line x1={x + 43} x2={x + 43} y1={86} y2={98} className="stroke-ink-400" />
            <line x1={x + 43} x2={x + 43} y1={124} y2={138} className="stroke-ink-400" />
          </g>
        )
      })}
      <line x1={73} x2={403} y1={138} y2={138} className="stroke-ink-300" strokeWidth={2} />
      <text x={410} y={142} className={txt}>
        heat sink (T_s)
      </text>
      <Box x={196} y={146} w={90} h={26} label="R_θsa" tone="s" />
      <line x1={241} x2={241} y1={138} y2={146} className="stroke-ink-400" />
      <text x={241} y={192} textAnchor="middle" className={txt}>
        ambient T_a = 40 °C
      </text>
      <text x={470} y={70} className={dim}>
        T_j = T_a + P_total·R_θsa
      </text>
      <text x={470} y={84} className={dim}>
        + P_each·(R_θjc + R_θcs)
      </text>
    </Svg>
  )
}

function PushPull() {
  return (
    <Svg h={210} label="Push-pull inverter with centre-tapped transformer">
      <rect x={250} y={30} width={14} height={140} rx={3} className="fill-chassis-700 stroke-ink-400" />
      <path d="M248 40c-14 0-14 20 0 20c-14 0-14 20 0 20c-14 0-14 20 0 20" className="stroke-live-400" fill="none" strokeWidth={1.6} />
      <path d="M248 100c-14 0-14 20 0 20c-14 0-14 20 0 20c-14 0-14 20 0 20" className="stroke-caution-400" fill="none" strokeWidth={1.6} />
      <path d="M266 60c14 0 14 20 0 20c14 0 14 20 0 20c14 0 14 20 0 20c14 0 14 20 0 20" className="stroke-ink-300" fill="none" strokeWidth={1.6} />
      <line x1={120} x2={236} y1={100} y2={100} className="stroke-ink-300" />
      <text x={60} y={104} className={txt}>
        + V_dc → centre tap
      </text>
      <line x1={236} x2={180} y1={40} y2={40} className="stroke-live-400" />
      <line x1={236} x2={180} y1={160} y2={160} className="stroke-caution-400" />
      <Box x={140} y={26} w={40} h={28} label="Q1" tone="p" />
      <Box x={140} y={146} w={40} h={28} label="Q2" />
      <text x={20} y={44} className={txt}>
        Q1 on: upper half +V_dc
      </text>
      <text x={20} y={164} className="fill-caution-400 text-[11px]">
        Q2 off: drain at 2·V_dc
      </text>
      <line x1={295} x2={360} y1={60} y2={60} className="stroke-ink-300" />
      <line x1={295} x2={360} y1={140} y2={140} className="stroke-ink-300" />
      <Box x={360} y={84} w={90} h={34} label="Breaker → load" tone="p" />
      <line x1={360} x2={360} y1={60} y2={140} className="stroke-ink-300" />
      <text x={470} y={70} className={dim}>
        Both switches on the − rail:
      </text>
      <text x={470} y={84} className={dim}>
        low-side drive only.
      </text>
      <text x={470} y={110} className={dim}>
        Leakage inductance adds
      </text>
      <text x={470} y={124} className={dim}>
        turn-off spikes (not modelled).
      </text>
    </Svg>
  )
}

function SolarPaths() {
  return (
    <Svg h={190} label="Energy paths of a solar inverter">
      <Box x={20} y={30} w={90} h={40} label="PV array" sub="current source" tone="c" />
      <Arrow x1={110} y1={50} x2={150} y2={50} thick cls="stroke-caution-400" />
      <Box x={150} y={30} w={100} h={40} label="MPPT buck" sub="V_pv = V_bat/D" tone="c" />
      <Arrow x1={250} y1={50} x2={290} y2={50} thick cls="stroke-caution-400" />
      <Box x={290} y={60} w={90} h={50} label="Battery" sub="shared DC bus" tone="s" />
      <Arrow x1={380} y1={90} x2={420} y2={90} thick cls="stroke-live-400" />
      <Box x={420} y={70} w={110} h={40} label="Sine inverter" sub="bridge · filter · T" />
      <Arrow x1={530} y1={90} x2={560} y2={90} thick cls="stroke-live-400" />
      <Box x={560} y={70} w={70} h={40} label="Load" tone="p" />
      <text x={150} y={100} className="fill-caution-400 text-[10px]">
        day: PV → battery (charging)
      </text>
      <text x={420} y={140} className="fill-live-400 text-[10px]">
        whenever the load runs: battery → load
      </text>
      <text x={20} y={180} className={dim}>
        The battery decouples the two paths. Phase 7 adds automatic MPPT and charge stages.
      </text>
    </Svg>
  )
}

function HybridPaths() {
  return (
    <Svg h={230} label="Energy paths of a hybrid inverter">
      <Box x={10} y={20} w={80} h={34} label="Grid" tone="s" />
      <Box x={10} y={80} w={80} h={34} label="Generator" tone="d" />
      <Box x={130} y={48} w={84} h={40} label="K2 selector" sub="NC grid / NO gen" />
      <Arrow x1={90} y1={37} x2={130} y2={58} />
      <Arrow x1={90} y1={97} x2={130} y2={80} />
      <Box x={270} y={48} w={84} h={40} label="K1 transfer" sub="NC AC / NO inv" />
      <Arrow x1={214} y1={68} x2={270} y2={68} thick cls="stroke-signal-400" />
      <Box x={410} y={48} w={70} h={40} label="Load" tone="p" />
      <Arrow x1={354} y1={68} x2={410} y2={68} thick />
      <Box x={130} y={150} w={84} h={40} label="Charger" sub="simplified" tone="c" />
      <Arrow x1={172} y1={88} x2={172} y2={150} cls="stroke-caution-400" />
      <Box x={250} y={150} w={80} h={40} label="Battery" tone="s" />
      <Arrow x1={214} y1={170} x2={250} y2={170} cls="stroke-caution-400" />
      <Box x={370} y={150} w={100} h={40} label="Inverter" sub="SPWM bridge" />
      <Arrow x1={330} y1={170} x2={370} y2={170} thick cls="stroke-live-400" />
      <Arrow x1={420} y1={150} x2={330} y2={90} thick cls="stroke-live-400" />
      <text x={500} y={40} className="fill-signal-300 text-[10px]">
        grid → load (bypass)
      </text>
      <text x={500} y={56} className="fill-caution-400 text-[10px]">
        grid → battery (charging)
      </text>
      <text x={500} y={72} className="fill-live-400 text-[10px]">
        battery → load (backup)
      </text>
      <text x={500} y={88} className="fill-danger-400 text-[10px]">
        generator → load
      </text>
      <text x={10} y={222} className={dim}>
        Changeover contacts are mutually exclusive: the unsynchronised grid and inverter are never paralleled.
      </text>
    </Svg>
  )
}

function ProtectionChain() {
  const items = [
    { l: 'Battery', s: '≈1000 A short circuit', t: 'c' as const },
    { l: 'DC fuse', s: 'protects wiring', t: 'c' as const },
    { l: 'Bus + bleeder', s: 'stored energy', t: 'd' as const },
    { l: 'Bridge', s: 'µs current trip', t: 'n' as const },
    { l: 'Heat sink', s: 'T_j ≤ limit', t: 'n' as const },
    { l: 'Breaker', s: 'output wiring', t: 'c' as const },
    { l: 'PE + RCD', s: 'shock', t: 'p' as const },
  ]
  return <Chain items={items} h={110} label="Protection chain" note="Each device protects against a specific harm. Fuses protect wiring, not semiconductors." />
}

function FeedbackLoop() {
  return (
    <Svg h={190} label="Voltage regulation loop">
      <Box x={10} y={40} w={80} h={34} label="Set-point" sub="230 V rms" />
      <circle cx={130} cy={57} r={14} className="fill-chassis-800 stroke-ink-400" />
      <text x={130} y={61} textAnchor="middle" className="fill-ink-100 text-[12px]">
        Σ
      </text>
      <Arrow x1={90} y1={57} x2={115} y2={57} />
      <Box x={170} y={40} w={100} h={34} label="Regulator" sub="m·(1 + k·e)" tone="s" />
      <Arrow x1={144} y1={57} x2={170} y2={57} />
      <Box x={300} y={40} w={70} h={34} label="SPWM" tone="s" />
      <Arrow x1={270} y1={57} x2={300} y2={57} />
      <Box x={400} y={40} w={120} h={34} label="Bridge · L · T · C" />
      <Arrow x1={370} y1={57} x2={400} y2={57} thick />
      <Box x={550} y={40} w={80} h={34} label="Output" tone="p" />
      <Arrow x1={520} y1={57} x2={550} y2={57} thick />
      <Box x={400} y={110} w={120} h={30} label="Sensor: RMS / cycle" tone="s" />
      <Arrow x1={590} y1={74} x2={520} y2={118} />
      <Arrow x1={400} y1={125} x2={132} y2={72} />
      <Box x={170} y={140} w={160} h={30} label="Protection overrides → gates off" tone="d" />
      <text x={10} y={186} className={dim}>
        e = (V_set − V_rms)/V_set, updated once per output cycle; m limited to 0.02…1.
      </text>
    </Svg>
  )
}

function TestBench() {
  const tests = [
    ['No-load', 'load removed'],
    ['Resistive', 'rated R'],
    ['Inductive', 'series L, PF ≈ 0.8'],
    ['Overload', '150 % load'],
    ['Short circuit', 'output shorted'],
    ['Low battery', 'V_min'],
    ['High battery', 'V_max'],
    ['Regulation', 'line and load'],
    ['Efficiency', 'P_out/P_in'],
    ['Thermal', 'T_j per switch'],
    ['Waveform', 'THD, f, crest'],
  ]
  return (
    <Svg h={160} label="Engineering test suite">
      {tests.map(([a, b], i) => (
        <Box key={a} x={10 + (i % 6) * 104} y={14 + Math.floor(i / 6) * 60} w={96} h={44} label={a} sub={b} tone={a === 'Short circuit' || a === 'Overload' ? 'c' : 's'} />
      ))}
      <text x={10} y={150} className={dim}>
        Each test changes one condition on your circuit as built and measures what the specification requires.
      </text>
    </Svg>
  )
}

function FaultMethod() {
  const steps = ['Symptom', 'Hypotheses', 'Distinguishing test', 'Conclusion', 'Repair', 'Verify']
  return (
    <Svg h={150} label="Troubleshooting cycle">
      {steps.map((s, i) => (
        <g key={s}>
          <Box x={10 + i * 104} y={40} w={92} h={40} label={s} tone={i === 2 ? 's' : 'n'} />
          {i < steps.length - 1 && <Arrow x1={102 + i * 104} y1={60} x2={113 + i * 104} y2={60} />}
        </g>
      ))}
      <path d="M574 80V110H56V82" fill="none" className="stroke-ink-500" strokeDasharray="4 3" markerEnd="url(#ac-arrow)" />
      <text x={300} y={128} textAnchor="middle" className={dim}>
        not solved: new symptom information → new hypotheses
      </text>
    </Svg>
  )
}

function DesignFlow() {
  return (
    <Chain
      label="Design flow"
      items={[{ l: 'Specify' }, { l: 'Calculate', t: 's' }, { l: 'Select', t: 's' }, { l: 'Assemble' }, { l: 'Simulate', t: 's' }, { l: 'Test', t: 'p' }, { l: 'Report', t: 'p' }]}
      note="Each build project follows this sequence; every arrow is a checkpoint in the laboratory."
    />
  )
}

function HfLink() {
  return (
    <Chain
      label="High-frequency inverter power path"
      items={[
        { l: 'Battery', s: '48 V' },
        { l: 'Push-pull', s: '10 kHz' },
        { l: 'Ferrite T', s: '1 : n_link', t: 's' },
        { l: 'Fast rectifier' },
        { l: 'HV bus', s: '≈360 V DANGER', t: 'd' },
        { l: 'HV bridge', s: 'SPWM' },
        { l: 'LC + load', t: 'p' },
      ]}
      note="The HV bus stays charged after switch-off: bleeder, labelled discharge time, prove dead."
    />
  )
}

/** Static schematic of a build project’s reference circuit, drawn with the laboratory’s own symbols. */
export function SchematicView({ doc, label }: { doc: CircuitDoc; label: string }) {
  const G = 14
  const pts = doc.parts.flatMap((p) => PART_DEFS[p.type].terminals.map((t) => terminalPosition(p, t.id)))
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const x0 = Math.min(...xs) - 4
  const y0 = Math.min(...ys) - 4
  const w = Math.max(...xs) - x0 + 8
  const h = Math.max(...ys) - y0 + 6
  const pos = (r: { partId: string; terminalId: string }) => {
    const p = doc.parts.find((q) => q.id === r.partId)
    return p ? terminalPosition(p, r.terminalId) : null
  }
  return (
    <svg viewBox={`${x0 * G} ${y0 * G} ${w * G} ${h * G}`} className="h-auto max-h-[460px] w-full" role="img" aria-label={label}>
      {doc.wires.map((wi) => {
        const a = pos(wi.a)
        const b = pos(wi.b)
        if (!a || !b) return null
        const [ax, ay] = [a[0] * G, a[1] * G]
        const [bx, by] = [b[0] * G, b[1] * G]
        const mx = Math.round((ax + bx) / 2 / G) * G
        const d = ax === bx || ay === by ? `M${ax} ${ay}L${bx} ${by}` : `M${ax} ${ay}H${mx}V${by}H${bx}`
        return <path key={wi.id} d={d} fill="none" className="stroke-live-400/80" strokeWidth={1.4} />
      })}
      {doc.parts.map((p) => (
        <g key={p.id} className="text-ink-200">
          <g transform={`translate(${p.x * G} ${p.y * G}) rotate(${p.rotation}) scale(${G})`}>
            <PartGlyph type={p.type} />
          </g>
          <text x={p.x * G + 2.6 * G} y={p.y * G - 1.6 * G} className="fill-ink-400 font-mono text-[11px]">
            {p.id}
          </text>
        </g>
      ))}
    </svg>
  )
}

function ProjectSchematic({ id }: { id: string }) {
  const doc = useMemo(() => {
    const p = BUILD_PROJECT_BY_ID[id]
    if (!p) return null
    const sel = suggestSelection(id, p.defaults)
    return generateProject(id, p.defaults, sel, calculate(id, p.defaults, sel).numbers).doc
  }, [id])
  return doc ? <SchematicView doc={doc} label={`Reference circuit of project ${id}`} /> : null
}

const DIAGRAMS: Record<Exclude<DiagramId, `schematic:${string}`>, () => ReactNode> = {
  'design-flow': DesignFlow,
  'inverter-blocks': InverterBlocks,
  'hbridge-states': HBridgeStates,
  'quasi-square': QuasiSquare,
  'push-pull': PushPull,
  'hf-link': HfLink,
  spwm: () => <Spwm />,
  deadtime: DeadTime,
  'lc-filter': () => <LcFilter />,
  'feedback-loop': FeedbackLoop,
  'thermal-network': Thermal,
  'solar-paths': SolarPaths,
  'hybrid-paths': HybridPaths,
  'pv-curve': PvCurve,
  'protection-chain': ProtectionChain,
  'test-bench': TestBench,
  'fault-method': FaultMethod,
}

export function Diagram({ id }: { id: DiagramId }) {
  if (id.startsWith('schematic:')) return <ProjectSchematic id={id.slice(10)} />
  const C = DIAGRAMS[id as keyof typeof DIAGRAMS]
  return C ? <C /> : null
}
