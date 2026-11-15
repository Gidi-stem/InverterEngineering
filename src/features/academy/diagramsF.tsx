import { Arrow, Box, Chain, Svg, Trace, W, dim, txt } from './diagramKit'
import { plot } from './plot'

/**
 * Foundation-course diagrams (F1, F2). Curves are computed from the formulas taught in the
 * lessons; current thresholds are the approximate published ranges quoted in F1.M1.L2.
 */

export function BodyCurrent() {
  // Log scale 0.1 mA … 1 A.
  const x0 = 60
  const w = 540
  const xl = (mA: number) => x0 + ((Math.log10(mA) + 1) / 4) * w
  const zones = [
    { a: 0.1, b: 0.5, l: 'Usually not felt', c: 'fill-live-400/25' },
    { a: 0.5, b: 5, l: 'Perception → pain', c: 'fill-caution-400/20' },
    { a: 5, b: 30, l: 'Let-go threshold, muscle lock', c: 'fill-caution-400/40' },
    { a: 30, b: 1000, l: 'Fibrillation possible (duration-dependent)', c: 'fill-danger-400/30' },
  ]
  return (
    <Svg h={170} label="Approximate effects of current through the body">
      {zones.map((z) => (
        <g key={z.l}>
          <rect x={xl(z.a)} y={30} width={xl(z.b) - xl(z.a)} height={60} className={z.c} />
          <text x={(xl(z.a) + xl(z.b)) / 2} y={64} textAnchor="middle" className="fill-ink-100 text-[10px]">
            {z.l}
          </text>
        </g>
      ))}
      {[0.1, 1, 10, 100, 1000].map((v) => (
        <text key={v} x={xl(v)} y={106} textAnchor="middle" className={dim}>
          {v < 1 ? `${v} mA` : v < 1000 ? `${v} mA` : '1 A'}
        </text>
      ))}
      {[
        { v: 20, l: 'LED 20 mA' },
        { v: 30, l: 'RCD 30 mA' },
        { v: 230, l: '230 V / 1 kΩ' },
      ].map((m) => (
        <g key={m.l}>
          <line x1={xl(m.v)} x2={xl(m.v)} y1={24} y2={96} className="stroke-signal-400" strokeDasharray="3 3" />
          <text x={xl(m.v)} y={20} textAnchor="middle" className="fill-signal-300 text-[10px]">
            {m.l}
          </text>
        </g>
      ))}
      <text x={x0} y={130} className={dim}>
        Approximate ranges for hand-to-hand or hand-to-foot paths (after IEC 60479). Effects depend on current, path, duration and the person.
      </text>
      <text x={x0} y={146} className={dim}>
        Body resistance varies widely (≈ 1 kΩ wet to tens of kΩ dry): never plan to receive any shock.
      </text>
    </Svg>
  )
}

export function CircuitLoop() {
  return (
    <Svg h={200} label="A closed circuit with source, load, voltmeter and ammeter">
      <rect x={140} y={40} width={300} height={110} rx={4} fill="none" className="stroke-live-400" strokeWidth={2} />
      <Box x={110} y={78} w={60} h={34} label="E" sub="source" tone="p" />
      <text x={128} y={74} className="fill-live-400 text-[12px]">+</text>
      <text x={128} y={128} className="fill-ink-400 text-[12px]">−</text>
      <Box x={410} y={78} w={60} h={34} label="R" sub="load" />
      <Box x={262} y={23} w={56} h={34} label="A" sub="in series" tone="s" />
      <line x1={470} y1={60} x2={540} y2={60} className="stroke-signal-400" strokeDasharray="3 2" />
      <line x1={470} y1={130} x2={540} y2={130} className="stroke-signal-400" strokeDasharray="3 2" />
      <Box x={520} y={78} w={60} h={34} label="V" sub="across" tone="s" />
      <Arrow x1={330} y1={150} x2={250} y2={150} thick cls="stroke-live-400" />
      <text x={290} y={170} textAnchor="middle" className={txt}>
        conventional current I = V / R (+ → load → −)
      </text>
      <text x={20} y={192} className={dim}>
        The same current flows everywhere in the loop. Open it anywhere and the current stops everywhere.
      </text>
    </Svg>
  )
}

export function IsolationFlow() {
  const steps = ['Identify sources', 'Inform', 'Switch off load', 'Isolate each source', 'Lock + tag', 'Dissipate stored energy', 'Prove dead', 'Work', 'Restore']
  const bw = 62
  return (
    <Svg h={150} label="Safe isolation sequence">
      {steps.map((s, i) => {
        const x = 6 + i * (bw + 7)
        const tone = i === 6 ? 'c' : i === 7 ? 'p' : i === 4 ? 'd' : 'n'
        const [a, b] = s.includes(' ') ? [s.slice(0, s.indexOf(' ')), s.slice(s.indexOf(' ') + 1)] : [s, undefined]
        return (
          <g key={s}>
            <Box x={x} y={30} w={bw} h={46} label={a} sub={b} tone={tone} />
            {i < steps.length - 1 && <Arrow x1={x + bw} y1={53} x2={x + bw + 6} y2={53} />}
          </g>
        )
      })}
      <text x={6} y={100} className={txt}>
        Prove dead = test the tester on a proving unit → test every combination (L–N, L–E, N–E; DC + −, + E, − E) → test the tester again.
      </text>
      <text x={6} y={120} className={dim}>
        Each worker fits their own lock. Any unexpected voltage: stop, find the source, isolate it, test again.
      </text>
    </Svg>
  )
}

export function Rcd() {
  return (
    <Svg h={200} label="Residual current device principle">
      <circle cx={200} cy={90} r={46} fill="none" className="stroke-signal-400" strokeWidth={6} />
      <line x1={40} y1={78} x2={560} y2={78} className="stroke-live-400" strokeWidth={2} />
      <line x1={40} y1={102} x2={560} y2={102} className="stroke-ink-300" strokeWidth={2} />
      <text x={44} y={72} className="fill-live-400 text-[11px]">L  I_line →</text>
      <text x={44} y={118} className={txt}>N  ← I_neutral</text>
      <Box x={170} y={150} w={60} h={30} label="trip" sub="if I_Δ ≥ 30 mA" tone="d" />
      <line x1={200} y1={136} x2={200} y2={150} className="stroke-signal-400" />
      <Box x={430} y={66} w={70} h={48} label="Load" />
      <line x1={520} y1={102} x2={520} y2={170} className="stroke-danger-400" strokeDasharray="4 3" strokeWidth={1.5} />
      <text x={526} y={150} className="fill-danger-400 text-[10px]">leak I_Δ</text>
      <text x={526} y={164} className="fill-danger-400 text-[10px]">to earth</text>
      <line x1={500} y1={172} x2={540} y2={172} className="stroke-live-400" strokeWidth={2} />
      <text x={260} y={30} className={txt}>
        I_Δ = I_line − I_neutral: zero when healthy; a leak to earth leaves a residual current.
      </text>
      <text x={260} y={46} className={dim}>
        Line-to-neutral contact returns on N: no residual current, no trip.
      </text>
    </Svg>
  )
}

export function FaultLoop() {
  return (
    <Svg h={210} label="Earth-fault loop">
      <Box x={20} y={60} w={80} h={60} label="Source" sub="U₀ = 230 V" tone="p" />
      <line x1={100} y1={70} x2={250} y2={70} className="stroke-live-400" strokeWidth={2.2} />
      <Box x={180} y={52} w={60} h={34} label="Fuse/MCB" tone="c" />
      <rect x={300} y={40} width={150} height={110} rx={6} fill="none" className="stroke-ink-400" strokeWidth={1.5} />
      <text x={375} y={58} textAnchor="middle" className={txt}>metal case</text>
      <line x1={250} y1={70} x2={360} y2={70} className="stroke-live-400" strokeWidth={2.2} />
      <text x={366} y={92} className="fill-danger-400 text-[11px]">✕ insulation fault</text>
      <line x1={360} y1={70} x2={360} y2={150} className="stroke-danger-400" strokeWidth={2.2} />
      <line x1={360} y1={150} x2={360} y2={180} className="stroke-live-400" strokeWidth={2.2} />
      <line x1={60} y1={180} x2={360} y2={180} className="stroke-live-400" strokeWidth={2.2} />
      <line x1={60} y1={120} x2={60} y2={180} className="stroke-live-400" strokeWidth={2.2} />
      <text x={200} y={196} textAnchor="middle" className="fill-live-400 text-[11px]">protective earth (PE) back to the source</text>
      <text x={470} y={70} className={txt}>I_f = U₀ / Z_s</text>
      <text x={470} y={88} className={dim}>large → fuse/MCB</text>
      <text x={470} y={102} className={dim}>operates quickly</text>
      <text x={470} y={124} className={txt}>U_touch ≈ I_f · R_PE</text>
      <text x={470} y={140} className={dim}>only until disconnection</text>
    </Svg>
  )
}

export function RiskHierarchy() {
  const rows = [
    { l: 'Eliminate', s: 'work dead, isolate', w: 560 },
    { l: 'Substitute', s: 'low-voltage, current-limited practice supply', w: 470 },
    { l: 'Engineering controls', s: 'guards, covers, fuses, RCDs, interlocks', w: 380 },
    { l: 'Administrative', s: 'procedures, permits, training, labels', w: 290 },
    { l: 'PPE', s: 'last line of defence', w: 200 },
  ]
  return (
    <Svg h={220} label="Hierarchy of controls">
      {rows.map((r, i) => (
        <g key={r.l}>
          <rect x={(W - r.w) / 2} y={14 + i * 38} width={r.w} height={32} rx={4} className={i === 0 ? 'fill-live-400/20 stroke-live-400' : i === 4 ? 'fill-caution-400/15 stroke-caution-400' : 'fill-chassis-800 stroke-chassis-500'} />
          <text x={W / 2} y={28 + i * 38} textAnchor="middle" className="fill-ink-100 text-[11px] font-medium">
            {r.l}
          </text>
          <text x={W / 2} y={41 + i * 38} textAnchor="middle" className={dim}>
            {r.s}
          </text>
        </g>
      ))}
      <text x={10} y={212} className={dim}>
        Most effective at the top. Risk = likelihood × severity (an illustrative matrix method).
      </text>
    </Svg>
  )
}

export function SeriesParallel() {
  return (
    <Svg h={220} label="Series and parallel circuits">
      <text x={20} y={20} className="fill-ink-100 text-[12px] font-medium">Series</text>
      <line x1={30} y1={60} x2={290} y2={60} className="stroke-live-400" strokeWidth={1.6} />
      {[0, 1, 2].map((i) => (
        <Box key={i} x={60 + i * 75} y={44} w={56} h={32} label={`R${i + 1}`} sub={`V${i + 1}`} />
      ))}
      <text x={30} y={100} className={txt}>same I; V = V₁ + V₂ + V₃</text>
      <text x={30} y={116} className={txt}>R_T = R₁ + R₂ + R₃</text>
      <text x={30} y={132} className={dim}>cells and PV modules in series add voltage</text>
      <text x={340} y={20} className="fill-ink-100 text-[12px] font-medium">Parallel</text>
      <line x1={350} y1={40} x2={350} y2={150} className="stroke-live-400" strokeWidth={1.6} />
      <line x1={600} y1={40} x2={600} y2={150} className="stroke-live-400" strokeWidth={1.6} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <line x1={350} y1={50 + i * 40} x2={600} y2={50 + i * 40} className="stroke-live-400/60" />
          <Box x={445} y={36 + i * 40} w={60} h={28} label={`R${i + 1}`} sub={`I${i + 1}`} />
        </g>
      ))}
      <text x={340} y={176} className={txt}>same V; I = I₁ + I₂ + I₃</text>
      <text x={340} y={192} className={txt}>1/R_T = 1/R₁ + 1/R₂ + 1/R₃</text>
      <text x={340} y={208} className={dim}>batteries and strings in parallel add current</text>
    </Svg>
  )
}

export function Kirchhoff() {
  return (
    <Svg h={200} label="Kirchhoff's current and voltage laws">
      <circle cx={140} cy={100} r={7} className="fill-signal-400" />
      <Arrow x1={40} y1={60} x2={130} y2={95} cls="stroke-live-400" />
      <Arrow x1={40} y1={140} x2={130} y2={105} cls="stroke-live-400" />
      <Arrow x1={147} y1={100} x2={250} y2={100} cls="stroke-live-400" />
      <text x={40} y={52} className={txt}>I₁ = 3 A</text>
      <text x={40} y={158} className={txt}>I₂ = 2 A</text>
      <text x={200} y={92} className={txt}>I₃ = 5 A</text>
      <text x={40} y={190} className="fill-ink-100 text-[11px]">KCL: currents in = currents out</text>
      <rect x={340} y={40} width={240} height={110} rx={4} fill="none" className="stroke-live-400" strokeWidth={1.6} />
      <Box x={310} y={78} w={60} h={34} label="24 V" sub="EMF" tone="p" />
      <Box x={420} y={24} w={70} h={32} label="10 V" sub="R₁ drop" />
      <Box x={550} y={78} w={60} h={34} label="8 V" sub="R₂ drop" />
      <Box x={420} y={134} w={70} h={32} label="6 V" sub="R₃ drop" />
      <text x={340} y={190} className="fill-ink-100 text-[11px]">KVL: 24 = 10 + 8 + 6 around the loop</text>
    </Svg>
  )
}

function ExpCurve({ label, rise, quantity, note }: { label: string; rise: boolean; quantity: string; note: string }) {
  const x0 = 70
  const w = 520
  const f = (t: number) => (rise ? 1 - Math.exp(-t * 5) : Math.exp(-t * 5))
  const xt = (k: number) => x0 + (k / 5) * w
  return (
    <Svg h={220} label={label}>
      <line x1={x0} x2={x0 + w} y1={180} y2={180} className="stroke-chassis-600" />
      <line x1={x0} x2={x0} y1={20} y2={180} className="stroke-chassis-600" />
      <Trace d={plot(f, x0, 20, w, 160, 0, 1)} cls="stroke-live-400" />
      {[1, 2, 3, 4, 5].map((k) => (
        <g key={k}>
          <line x1={xt(k)} x2={xt(k)} y1={20} y2={180} className="stroke-chassis-700" strokeDasharray="2 4" />
          <text x={xt(k)} y={194} textAnchor="middle" className={dim}>
            {k}τ
          </text>
          <text x={xt(k)} y={180 - f(k / 5) * 160 - 6} textAnchor="middle" className="fill-ink-300 text-[10px]">
            {(f(k / 5) * 100).toFixed(1)} %
          </text>
        </g>
      ))}
      <text x={x0 - 8} y={24} textAnchor="end" className={dim}>
        100 %
      </text>
      <text x={x0 + 8} y={36} className="fill-live-400 text-[11px]">
        {quantity}
      </text>
      <text x={x0} y={212} className={dim}>
        {note}
      </text>
    </Svg>
  )
}

export const RcCurve = () => (
  <div className="space-y-2">
    <ExpCurve label="RC charging" rise quantity="v_C = V(1 − e^(−t/τ)), τ = R·C" note="Charging: 63.2 % after 1τ, 99.3 % after 5τ." />
    <ExpCurve label="RC discharging" rise={false} quantity="v_C = V₀·e^(−t/τ)" note="Discharging: 36.8 % remains after 1τ; time to a safe voltage t = τ·ln(V₀/V_s)." />
  </div>
)

export const RlCurve = () => (
  <div className="space-y-2">
    <ExpCurve label="RL current rise" rise quantity="i = (V/R)(1 − e^(−t/τ)), τ = L/R" note="Current cannot change instantly; it rises with τ = L / R_total." />
    <ExpCurve label="RL current decay" rise={false} quantity="i = I₀·e^(−t/τ) through a freewheeling path" note="When the source is removed the inductor drives the current on: its voltage reverses." />
  </div>
)

export function BatteryModel() {
  return (
    <Svg h={190} label="Battery model with internal resistance">
      <rect x={30} y={30} width={190} height={120} rx={8} fill="none" className="stroke-ink-500" strokeDasharray="5 4" />
      <text x={36} y={24} className={dim}>battery</text>
      <Box x={50} y={72} w={60} h={34} label="E" sub="EMF" tone="p" />
      <Box x={140} y={72} w={60} h={34} label="r" sub="internal" tone="c" />
      <line x1={110} y1={89} x2={140} y2={89} className="stroke-live-400" strokeWidth={1.6} />
      <line x1={200} y1={89} x2={300} y2={89} className="stroke-live-400" strokeWidth={1.6} />
      <Box x={300} y={72} w={70} h={34} label="R_cable" sub="2L·ρ/A" tone="c" />
      <line x1={370} y1={89} x2={440} y2={89} className="stroke-live-400" strokeWidth={1.6} />
      <Box x={440} y={66} w={90} h={46} label="Load / inverter" sub="P = V·I" />
      <text x={230} y={128} className={txt}>V_terminal = E − I·r</text>
      <text x={380} y={140} className={txt}>V_load = E − I·(r + R_cable)</text>
      <text x={30} y={176} className={dim}>
        Losses: I²r inside the battery and I²R_cable in the wiring become heat. Short circuit: I_sc = E / r.
      </text>
    </Svg>
  )
}

export function VoltageDrop() {
  return (
    <Svg h={200} label="Voltage drop in a DC cable">
      <Box x={20} y={60} w={80} h={70} label="Battery" sub="V_s" tone="p" />
      <line x1={100} y1={74} x2={480} y2={74} className="stroke-danger-400" strokeWidth={3} />
      <line x1={100} y1={116} x2={480} y2={116} className="stroke-ink-300" strokeWidth={3} />
      <text x={290} y={64} textAnchor="middle" className="fill-danger-400 text-[11px]">+ conductor: L metres, drop I·R/2</text>
      <text x={290} y={134} textAnchor="middle" className={txt}>− conductor: L metres, drop I·R/2</text>
      <Box x={480} y={60} w={110} h={70} label="Load" sub="V_s − I·R_cable" />
      <text x={20} y={164} className={txt}>R_cable = ρ · 2L / A   (ρ_Cu = 0.0172 Ω·mm²/m)</text>
      <text x={20} y={182} className={dim}>Design limit typically 1–3 % for battery and PV circuits; size A, then check current capacity and fusing.</text>
    </Svg>
  )
}

export function DiodeLed() {
  return (
    <Svg h={200} label="Diode bias and LED current limiting">
      <polygon points="80,40 80,80 115,60" className="fill-ink-300" />
      <line x1={115} y1={40} x2={115} y2={80} className="stroke-ink-300" strokeWidth={3} />
      <line x1={40} y1={60} x2={80} y2={60} className="stroke-ink-300" />
      <line x1={115} y1={60} x2={155} y2={60} className="stroke-ink-300" />
      <text x={60} y={100} className={txt}>A (anode)</text>
      <text x={110} y={116} className={txt}>K (cathode, band)</text>
      <text x={40} y={140} className="fill-live-400 text-[11px]">forward: A &gt; K by V_f → conducts</text>
      <text x={40} y={158} className="fill-danger-400 text-[11px]">reverse: K &gt; A → blocks</text>
      <rect x={300} y={40} width={280} height={110} rx={4} fill="none" className="stroke-live-400" strokeWidth={1.6} />
      <Box x={270} y={78} w={60} h={34} label="V_s" tone="p" />
      <Box x={400} y={24} w={80} h={32} label="R" sub="(V_s − V_f)/I" />
      <Box x={550} y={78} w={60} h={34} label="LED" sub="V_f" tone="s" />
      <text x={330} y={182} className={dim}>Without R the LED current is limited only by the supply: it burns out.</text>
    </Svg>
  )
}

export function SiScale() {
  const p = [
    ['G', '10⁹'],
    ['M', '10⁶'],
    ['k', '10³'],
    ['—', '1'],
    ['m', '10⁻³'],
    ['µ', '10⁻⁶'],
    ['n', '10⁻⁹'],
    ['p', '10⁻¹²'],
  ]
  return (
    <Chain
      label="SI prefixes"
      h={120}
      items={p.map(([l, s], i) => ({ l, s, t: i === 3 ? 's' : undefined }))}
      note="Each step is ×1000. Watch the capitals: m (milli) and M (mega) differ by 10⁹."
    />
  )
}
