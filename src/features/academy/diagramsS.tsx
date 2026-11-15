import { useMemo } from 'react'
import { MODULE_BY_ID, arrayCurve, mpp, pwmOperating } from '../../engine/solar/pv'
import { irradiance } from '../../engine/solar/dispatch'
import { Arrow, Box, Chain, Svg, Trace, dim, txt } from './diagramKit'
import { plot } from './plot'

/**
 * S2 solar diagrams. Curves come from the solar engine's single-diode model of the illustrative
 * 400 W example module, so they match the laboratory.
 */
const M = MODULE_BY_ID['mono-400']

export function PvCell() {
  return (
    <Svg h={220} label="Photovoltaic cell and its single-diode model">
      <rect x={20} y={40} width={200} height={26} className="fill-signal-500/25 stroke-signal-400" />
      <text x={120} y={58} textAnchor="middle" className={txt}>n-type layer (thin)</text>
      <rect x={20} y={66} width={200} height={70} className="fill-caution-400/15 stroke-caution-400" />
      <text x={120} y={106} textAnchor="middle" className={txt}>p-type silicon</text>
      <line x1={20} y1={66} x2={220} y2={66} className="stroke-ink-100" strokeWidth={2} strokeDasharray="4 3" />
      <text x={226} y={70} className={dim}>junction field</text>
      {[50, 100, 150].map((x) => (
        <line key={x} x1={x - 20} y1={6} x2={x} y2={36} className="stroke-caution-400" markerEnd="url(#ac-arrow)" />
      ))}
      <text x={20} y={16} className="fill-caution-400 text-[10px]">photons</text>
      <text x={20} y={156} className={txt}>light frees electron–hole pairs; the junction field separates them → current</text>
      <text x={20} y={174} className={dim}>one silicon cell: ≈ 0.6–0.7 V open circuit; current ∝ area × irradiance</text>
      <Box x={340} y={40} w={70} h={40} label="I_ph" sub="light current" tone="c" />
      <Box x={430} y={40} w={60} h={40} label="D" sub="diode" />
      <Box x={510} y={40} w={60} h={40} label="R_s" sub="series" />
      <line x1={410} y1={60} x2={430} y2={60} className="stroke-ink-400" />
      <line x1={490} y1={60} x2={510} y2={60} className="stroke-ink-400" />
      <Arrow x1={570} y1={60} x2={620} y2={60} cls="stroke-live-400" />
      <text x={600} y={52} className="fill-live-400 text-[10px]">I</text>
      <text x={340} y={110} className={txt}>I = I_ph − I₀·[e^((V + I·R_s)/a) − 1]</text>
      <text x={340} y={128} className={dim}>a = n·N_cells·kT/q; fitted to the datasheet in the laboratory</text>
      <text x={340} y={146} className={dim}>(the shunt resistance is taken as very large)</text>
      <text x={20} y={206} className={dim}>Modules connect 36–144 (half-)cells in series behind glass, with bypass diodes in the junction box.</text>
    </Svg>
  )
}

export function IvFamily() {
  const curves = useMemo(
    () => [
      { l: '1000 W/m², 25 °C', c: arrayCurve(M, { series: 1, strings: 1, g: 1000, tCell: 25 }), cls: 'stroke-live-400' },
      { l: '600 W/m², 25 °C', c: arrayCurve(M, { series: 1, strings: 1, g: 600, tCell: 25 }), cls: 'stroke-signal-300' },
      { l: '1000 W/m², 65 °C', c: arrayCurve(M, { series: 1, strings: 1, g: 1000, tCell: 65 }), cls: 'stroke-danger-400' },
    ],
    [],
  )
  const X = (v: number) => 60 + (v / 40) * 520
  const Y = (i: number) => 190 - (i / 15) * 170
  return (
    <Svg h={240} label="I–V curves at different irradiance and temperature">
      <line x1={60} x2={580} y1={190} y2={190} className="stroke-chassis-600" />
      <line x1={60} x2={60} y1={20} y2={190} className="stroke-chassis-600" />
      {curves.map((k, j) => {
        const p = mpp(k.c)
        return (
          <g key={k.l}>
            <path d={k.c.map((q, i) => `${i ? 'L' : 'M'}${X(q.v).toFixed(1)} ${Y(q.i).toFixed(1)}`).join('')} fill="none" className={k.cls} strokeWidth={1.7} />
            <circle cx={X(p.v)} cy={Y(p.i)} r={3.5} className="fill-ink-100" />
            <text x={430} y={34 + j * 16} className="fill-ink-300 text-[10px]">
              {k.l}: MPP {p.p.toFixed(0)} W at {p.v.toFixed(1)} V
            </text>
          </g>
        )
      })}
      {[0, 10, 20, 30, 40].map((v) => (
        <text key={v} x={X(v)} y={204} textAnchor="middle" className={dim}>
          {v} V
        </text>
      ))}
      {[0, 5, 10, 15].map((i) => (
        <text key={i} x={54} y={Y(i) + 4} textAnchor="end" className={dim}>
          {i} A
        </text>
      ))}
      <text x={60} y={232} className={dim}>
        Example 400 W module (illustrative values). Current follows irradiance; voltage (and power) falls as the cells heat. Dots: maximum power points.
      </text>
    </Svg>
  )
}

export function StringConfig() {
  return (
    <Svg h={230} label="Series strings, parallel strings and bypass diodes">
      {[0, 1].map((s) => (
        <g key={s}>
          {[0, 1, 2].map((k) => (
            <g key={k}>
              <Box x={40 + k * 110} y={30 + s * 80} w={80} h={34} label={`PV ${s * 3 + k + 1}`} sub={`V_mp ${M.vmp} V`} tone={s === 1 && k === 1 ? 'd' : 'c'} />
              {k < 2 && <line x1={120 + k * 110} y1={47 + s * 80} x2={150 + k * 110} y2={47 + s * 80} className="stroke-live-400" strokeWidth={1.6} />}
              <text x={80 + k * 110} y={78 + s * 80} textAnchor="middle" className="fill-ink-500 text-[9px]">
                bypass ▷|
              </text>
            </g>
          ))}
          <line x1={360} y1={47 + s * 80} x2={420} y2={47 + s * 80} className="stroke-live-400" strokeWidth={1.6} />
          <Box x={420} y={34 + s * 80} w={50} h={26} label="fuse" tone="n" />
        </g>
      ))}
      <line x1={470} y1={47} x2={500} y2={47} className="stroke-live-400" strokeWidth={1.6} />
      <line x1={470} y1={127} x2={500} y2={127} className="stroke-live-400" strokeWidth={1.6} />
      <line x1={500} y1={47} x2={500} y2={127} className="stroke-live-400" strokeWidth={1.6} />
      <Box x={520} y={70} w={100} h={40} label="Combiner" sub="+ DC isolator" tone="s" />
      <text x={40} y={180} className={txt}>series: V_string = n × V_module (cold V_oc must stay below the controller limit)</text>
      <text x={40} y={196} className={txt}>parallel: I_array = strings × I_string; a faulty string is back-fed by the others</text>
      <text x={40} y={214} className={dim}>Shaded module (red): its bypass diode conducts, the string loses about one module’s voltage, and the P–V curve gains a second peak.</text>
    </Svg>
  )
}

export function MpptPwm() {
  const c = useMemo(() => arrayCurve(M, { series: 1, strings: 1, g: 1000, tCell: 45 }), [])
  const p = mpp(c)
  const w = pwmOperating(c, 13.2)
  const X = (v: number) => 60 + (v / 40) * 520
  const Y = (pw: number) => 180 - (pw / 420) * 160
  return (
    <Svg h={230} label="MPPT and PWM operating points on a P–V curve">
      <line x1={60} x2={580} y1={180} y2={180} className="stroke-chassis-600" />
      <path d={c.map((q, i) => `${i ? 'L' : 'M'}${X(q.v).toFixed(1)} ${Y(q.p).toFixed(1)}`).join('')} fill="none" className="stroke-caution-400" strokeWidth={1.7} />
      <circle cx={X(p.v)} cy={Y(p.p)} r={4} className="fill-live-400" />
      <text x={X(p.v) + 6} y={Y(p.p) - 6} className="fill-live-400 text-[11px]">MPPT: {p.p.toFixed(0)} W at {p.v.toFixed(1)} V</text>
      <circle cx={X(w.v)} cy={Y(w.p)} r={4} className="fill-danger-400" />
      <text x={X(w.v) + 6} y={Y(w.p) + 16} className="fill-danger-400 text-[11px]">PWM on a 12 V battery: {w.p.toFixed(0)} W at {w.v.toFixed(1)} V</text>
      {[0, 10, 20, 30, 40].map((v) => (
        <text key={v} x={X(v)} y={194} textAnchor="middle" className={dim}>
          {v} V
        </text>
      ))}
      <text x={60} y={214} className={dim}>
        PWM connects the array to the battery, so it works at battery voltage. MPPT is a DC-DC converter that holds the array at its MPP and converts the power to battery voltage.
      </text>
    </Svg>
  )
}

export function ChargeStages() {
  const x0 = 60
  const w = 520
  const v = (t: number) => (t < 0.45 ? 0.6 + (t / 0.45) * 0.4 : t < 0.75 ? 1 : 0.92)
  const i = (t: number) => (t < 0.45 ? 1 : t < 0.75 ? Math.exp(-(t - 0.45) * 9) : 0.06)
  return (
    <Svg h={220} label="Bulk, absorption and float charging stages">
      <Trace d={plot(v, x0, 20, w, 140, 0, 1.1)} cls="stroke-live-400" />
      <Trace d={plot(i, x0, 20, w, 140, 0, 1.1)} cls="stroke-caution-400" />
      {[0.45, 0.75].map((t) => (
        <line key={t} x1={x0 + t * w} x2={x0 + t * w} y1={20} y2={160} className="stroke-chassis-500" strokeDasharray="3 3" />
      ))}
      <text x={x0 + 0.2 * w} y={176} textAnchor="middle" className={txt}>bulk (constant current)</text>
      <text x={x0 + 0.6 * w} y={176} textAnchor="middle" className={txt}>absorption (constant voltage)</text>
      <text x={x0 + 0.88 * w} y={176} textAnchor="middle" className={txt}>float</text>
      <text x={x0 + 4} y={30} className="fill-live-400 text-[10px]">battery voltage</text>
      <text x={x0 + 4} y={44} className="fill-caution-400 text-[10px]">charge current</text>
      <text x={x0} y={204} className={dim}>Set-points (absorption and float voltages, current limits, temperature compensation) come from the battery datasheet; LiFePO₄ usually has no float or a low one.</text>
    </Svg>
  )
}

export function DesignChain() {
  return (
    <Chain
      label="Design sequence from a load profile"
      h={130}
      items={[
        { l: 'Load profile', s: 'Wh/day, peak, surge', t: 'p' },
        { l: 'Inverter', s: '1.25 × peak, surge' },
        { l: 'System V', s: '12/24/48 V' },
        { l: 'Battery', s: 'E × days / DoD', t: 's' },
        { l: 'PV array', s: 'E / (η·PSH·k)', t: 'c' },
        { l: 'Strings', s: 'cold V_oc, hot V_mp', t: 'c' },
        { l: 'Controller', s: 'A, V limit' },
        { l: 'Cables + protection', s: 'drop, fuses, isolators', t: 'd' },
      ]}
      note="Every step uses the result of the one before; the laboratory explains each number with its formula and working."
    />
  )
}

export function EnergyBalance() {
  const x0 = 60
  const w = 520
  const pv = (t: number) => irradiance(t * 24, 4.5) / 1000
  const load = (t: number) => {
    const h = t * 24
    return 0.12 + (h >= 6 && h < 7 ? 0.7 : 0) + (h >= 18 && h < 23 ? 0.18 : 0) + (h >= 12 && h < 17 ? 0.1 : 0)
  }
  return (
    <Svg h={220} label="Daily PV production against the load profile">
      <Trace d={plot(pv, x0, 20, w, 150, 0, 1)} cls="stroke-caution-400" />
      <Trace d={plot(load, x0, 20, w, 150, 0, 1)} cls="stroke-signal-300" />
      {[0, 6, 12, 18, 24].map((h) => (
        <text key={h} x={x0 + (h / 24) * w} y={186} textAnchor="middle" className={dim}>
          {String(h).padStart(2, '0')}:00
        </text>
      ))}
      <text x={x0 + 0.5 * w} y={44} textAnchor="middle" className="fill-caution-400 text-[10px]">PV surplus → charges the battery (or exports)</text>
      <text x={x0 + 0.86 * w} y={120} textAnchor="middle" className="fill-signal-300 text-[10px]">evening load → from the battery</text>
      <text x={x0} y={208} className={dim}>Off-grid: daily PV energy (after losses) must exceed daily load energy; the battery moves energy from midday to night and cloudy days.</text>
    </Svg>
  )
}

export function SystemTypes() {
  return (
    <Svg h={250} label="Off-grid, grid-tied and hybrid system architectures">
      {[
        { y: 16, t: 'Off-grid', items: ['PV', 'Controller', 'Battery', 'Inverter', 'Loads'], extra: 'generator (optional) → charger' },
        { y: 96, t: 'Grid-tied', items: ['PV', 'Grid inverter', 'Meter', 'Grid ⇄', 'Loads'], extra: 'no battery; stops when the grid fails (anti-islanding)' },
        { y: 176, t: 'Hybrid', items: ['PV', 'Hybrid inverter', 'Battery', 'Grid ⇄', 'Backed-up loads'], extra: 'self-consumption, export, back-up during outages; optional generator' },
      ].map((r) => (
        <g key={r.t}>
          <text x={8} y={r.y + 22} className="fill-ink-100 text-[11px] font-medium">
            {r.t}
          </text>
          {r.items.map((it, k) => (
            <g key={it}>
              <Box x={80 + k * 108} y={r.y + 4} w={90} h={30} label={it} tone={k === 0 ? 'c' : it.includes('Battery') ? 's' : it.includes('Load') ? 'p' : 'n'} />
              {k < r.items.length - 1 && <Arrow x1={170 + k * 108} y1={r.y + 19} x2={187 + k * 108} y2={r.y + 19} />}
            </g>
          ))}
          <text x={80} y={r.y + 50} className={dim}>
            {r.extra}
          </text>
        </g>
      ))}
    </Svg>
  )
}
