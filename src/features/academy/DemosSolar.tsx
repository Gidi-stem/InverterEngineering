import { useMemo, useState } from 'react'
import { simulateDispatch } from '../../engine/solar/dispatch'
import { SOLAR_PRESETS, SOLAR_PRESET_BY_ID } from '../../engine/solar/presets'
import { EXAMPLE_MODULES, MODULE_BY_ID, arrayCurve, mpp, operating, perturbObserve, pwmOperating } from '../../engine/solar/pv'
import { sizeSystem } from '../../engine/solar/sizing'
import { Bars, Legend, LineChart, Stat } from '../solar/charts'
import { Slider } from './Slider'

/** Solar lesson demonstrations (S2), computed live by the solar engine. Module values are illustrative. */
export type SolarDemoId = 'pv-iv' | 'load-profile' | 'array-config' | 'mppt-track' | 'energy-day'

function ModulePick({ id, set }: { id: string; set: (v: string) => void }) {
  return (
    <label className="block text-xs text-ink-400">
      Module (illustrative values)
      <select value={id} onChange={(e) => set(e.target.value)} className="mt-1 block w-full rounded bg-chassis-800 px-2 py-1 text-sm text-ink-100" data-testid="demo-module">
        {EXAMPLE_MODULES.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </label>
  )
}

function PvIv() {
  const [id, setId] = useState('mono-400')
  const [g, setG] = useState(1000)
  const [t, setT] = useState(25)
  const m = MODULE_BY_ID[id]
  const c = useMemo(() => arrayCurve(m, { series: 1, strings: 1, g, tCell: t }), [m, g, t])
  const ref = useMemo(() => arrayCurve(m, { series: 1, strings: 1, g: 1000, tCell: 25 }), [m])
  const p = mpp(c)
  const op = operating(m, g, t)
  return (
    <div className="space-y-3" data-testid="demo-pviv">
      <div className="grid gap-3 sm:grid-cols-3">
        <ModulePick id={id} set={setId} />
        <Slider label="Irradiance G" value={g} min={100} max={1100} step={50} onChange={setG} fmt={(v) => `${v} W/m²`} />
        <Slider label="Cell temperature" value={t} min={-10} max={75} step={1} onChange={setT} fmt={(v) => `${v} °C`} />
      </div>
      <LineChart
        label="Module I–V and P–V curves"
        xLabel="voltage (V)"
        yLabel="current (A)"
        yRightLabel="power (W)"
        xMax={Math.ceil(m.voc * 1.12)}
        yMax={Math.ceil(m.isc * 1.2)}
        yRightMax={Math.ceil(m.pmax * 1.2)}
        series={[
          { name: 'I (STC)', points: ref.map((x) => [x.v, x.i]), cls: 'stroke-ink-500', dashed: true },
          { name: 'I', points: c.map((x) => [x.v, x.i]), cls: 'stroke-live-400' },
          { name: 'P', points: c.map((x) => [x.v, x.p]), cls: 'stroke-caution-400', right: true },
        ]}
        marks={[{ x: p.v, label: `MPP ${p.p.toFixed(0)} W` }]}
      />
      <Legend items={[{ name: 'current at these conditions', cls: 'stroke-live-400' }, { name: 'power', cls: 'stroke-caution-400' }, { name: 'current at STC', cls: 'stroke-ink-500' }]} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="V_oc" value={`${op.voc.toFixed(1)} V`} testid="demo-pviv-voc" />
        <Stat label="I_sc" value={`${op.isc.toFixed(2)} A`} testid="demo-pviv-isc" />
        <Stat label="V_mp / I_mp" value={`${p.v.toFixed(1)} V / ${p.i.toFixed(2)} A`} />
        <Stat label="P_mp" value={`${p.p.toFixed(0)} W`} testid="demo-pviv-p" />
      </div>
      <p className="text-xs text-ink-400">Current is proportional to irradiance; voltage falls as the cells heat (β = {m.betaVoc} %/°C). Single-diode model fitted to the illustrative datasheet values.</p>
    </div>
  )
}

function ArrayConfig() {
  const [id, setId] = useState('mono-400')
  const [s, setS] = useState(3)
  const [p, setP] = useState(2)
  const [tmin, setTmin] = useState(5)
  const [vmax, setVmax] = useState(150)
  const m = MODULE_BY_ID[id]
  const vocCold = s * m.voc * (1 + (m.betaVoc / 100) * (tmin - 25))
  const over = vocCold > Math.min(vmax, m.maxSystemV)
  return (
    <div className="space-y-3" data-testid="demo-array">
      <div className="grid gap-3 sm:grid-cols-3">
        <ModulePick id={id} set={setId} />
        <Slider label="Modules in series" value={s} min={1} max={20} step={1} onChange={setS} fmt={(v) => `${v}`} />
        <Slider label="Parallel strings" value={p} min={1} max={6} step={1} onChange={setP} fmt={(v) => `${v}`} />
        <Slider label="Coldest ambient" value={tmin} min={-20} max={25} step={1} onChange={setTmin} fmt={(v) => `${v} °C`} />
        <Slider label="Controller maximum PV voltage" value={vmax} min={50} max={600} step={50} onChange={setVmax} fmt={(v) => `${v} V`} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Array power (STC)" value={`${(s * p * m.pmax).toLocaleString()} W`} />
        <Stat label="String V_oc at STC" value={`${(s * m.voc).toFixed(1)} V`} />
        <Stat label="String V_oc, coldest morning" value={`${vocCold.toFixed(1)} V`} tone={over ? 'bad' : 'ok'} testid="demo-array-voc" />
        <Stat label="Array I_sc (× 1.25 for design)" value={`${(p * m.isc).toFixed(1)} A (${(1.25 * p * m.isc).toFixed(1)} A)`} />
      </div>
      <p className={`text-xs ${over ? 'text-danger-400' : 'text-ink-400'}`} data-testid="demo-array-verdict">
        {over ? `Over the ${Math.min(vmax, m.maxSystemV)} V limit on a cold morning: this string would damage the controller. Use at most ${Math.floor(Math.min(vmax, m.maxSystemV) / (vocCold / s))} in series.` : `Within the ${Math.min(vmax, m.maxSystemV)} V limit. Series adds voltage; parallel strings add current${p >= 3 ? ' (check whether string fuses are needed)' : ''}.`}
        {s * m.voc > 120 && ' Above 120 V DC: hazardous voltage — simulated only in this programme.'}
      </p>
    </div>
  )
}

function MpptTrack() {
  const [shade, setShade] = useState(1000)
  const [vb, setVb] = useState(26.4)
  const m = MODULE_BY_ID['mono-400']
  const c = useMemo(() => arrayCurve(m, { series: 4, strings: 1, g: [shade, 1000, 1000, 1000], tCell: 45 }), [m, shade])
  const g = mpp(c)
  const po = perturbObserve(c, { steps: 80 })
  const pw = pwmOperating(c, vb)
  return (
    <div className="space-y-3" data-testid="demo-mppt">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Irradiance on module 1 (shading)" value={shade} min={100} max={1000} step={50} onChange={setShade} fmt={(v) => `${v} W/m²`} />
        <Slider label="Battery voltage (for PWM)" value={vb} min={12} max={60} step={0.2} onChange={setVb} fmt={(v) => `${v.toFixed(1)} V`} />
      </div>
      <LineChart
        label="String P–V curve with the P&O tracker’s path"
        xLabel="string voltage (V)"
        yLabel="power (W)"
        xMax={Math.ceil(c[c.length - 1].v * 1.05)}
        series={[
          { name: 'P', points: c.map((x) => [x.v, x.p]), cls: 'stroke-caution-400' },
          { name: 'path', points: po.path.map((x) => [x.v, x.p]), cls: 'stroke-signal-300', dashed: true },
        ]}
        marks={[
          { x: po.final.v, y: po.final.p, label: `P&O ${po.final.p.toFixed(0)} W` },
          { x: pw.v, label: `PWM ${pw.p.toFixed(0)} W`, cls: 'stroke-danger-400' },
        ]}
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Global maximum" value={`${g.p.toFixed(0)} W at ${g.v.toFixed(1)} V`} />
        <Stat label="P&O settles at" value={`${po.final.p.toFixed(0)} W`} tone={po.final.p < g.p * 0.95 ? 'warn' : 'ok'} testid="demo-mppt-po" />
        <Stat label="PWM at the battery voltage" value={`${pw.p.toFixed(0)} W`} tone={pw.p < g.p * 0.8 ? 'bad' : 'ok'} testid="demo-mppt-pwm" />
        <Stat label="MPPT advantage over PWM" value={`${pw.p > 0 ? ((po.final.p / pw.p - 1) * 100).toFixed(0) : '∞'} %`} />
      </div>
      <p className="text-xs text-ink-400">Four modules in series. Shade module 1 to create a second peak: perturb-and-observe climbs the nearest hill and can stop on a local maximum. A PWM controller is fixed at the battery voltage.</p>
    </div>
  )
}

function LoadProfile() {
  const [pid, setPid] = useState('offgrid-home')
  const d = useMemo(() => sizeSystem(SOLAR_PRESET_BY_ID[pid].spec), [pid])
  const prof = d.profileAc.map((v, i) => v + d.profileDc[i])
  const peakHour = prof.indexOf(Math.max(...prof))
  return (
    <div className="space-y-3" data-testid="demo-load">
      <label className="block text-xs text-ink-400">
        Load profile
        <select value={pid} onChange={(e) => setPid(e.target.value)} className="mt-1 block w-full rounded bg-chassis-800 px-2 py-1 text-sm text-ink-100">
          {SOLAR_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </label>
      <Bars values={prof} label="Average load in each hour" unit="W" hi={peakHour} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Daily load energy" value={`${((d.numbers.eAc + d.numbers.eDc) / 1000).toFixed(2)} kWh`} testid="demo-load-e" />
        <Stat label="At the battery (÷ η_inv)" value={`${(d.numbers.eDaily / 1000).toFixed(2)} kWh`} />
        <Stat label="Peak simultaneous load" value={`${d.numbers.pPeak.toFixed(0)} W`} />
        <Stat label="With motor starting" value={`${d.numbers.pSurge.toFixed(0)} W`} />
      </div>
      <ul className="text-xs text-ink-400">
        {d.spec.loads.map((l) => (
          <li key={l.id}>
            {l.name}: {l.watts} W × {l.qty}
            {l.duty < 1 ? ` × duty ${l.duty}` : ''} × {l.windows.map(([a, b]) => `${a}–${b} h`).join(', ')}
          </li>
        ))}
      </ul>
    </div>
  )
}

function EnergyDay() {
  const [pid, setPid] = useState('offgrid-home')
  const [w, setW] = useState(1)
  const [soc0, setSoc0] = useState(0.7)
  const d = useMemo(() => sizeSystem(SOLAR_PRESET_BY_ID[pid].spec), [pid])
  const r = useMemo(() => simulateDispatch(d, { days: 1, weather: [w], soc0 }), [d, w, soc0])
  const pts = (f: (s: (typeof r.steps)[number]) => number): [number, number][] => r.steps.map((s) => [s.t, f(s)])
  return (
    <div className="space-y-3" data-testid="demo-energy">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-xs text-ink-400">
          System
          <select value={pid} onChange={(e) => setPid(e.target.value)} className="mt-1 block w-full rounded bg-chassis-800 px-2 py-1 text-sm text-ink-100">
            {SOLAR_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <Slider label="Weather (× design-day sun)" value={w} min={0} max={1.2} step={0.05} onChange={setW} fmt={(v) => `${Math.round(v * 100)} %`} />
        <Slider label="Starting state of charge" value={soc0} min={0.2} max={1} step={0.05} onChange={setSoc0} fmt={(v) => `${Math.round(v * 100)} %`} />
      </div>
      <LineChart
        label="24-hour energy flows"
        xLabel="hour"
        yLabel="power (W)"
        yRightLabel={d.spec.type === 'grid-tied' ? undefined : 'state of charge (%)'}
        xMax={24}
        xTicks={[0, 6, 12, 18, 24]}
        yRightMax={100}
        series={[
          { name: 'PV', points: pts((s) => s.pv), cls: 'stroke-caution-400' },
          { name: 'load', points: pts((s) => s.load), cls: 'stroke-signal-300' },
          ...(d.spec.type === 'grid-tied' ? [] : [{ name: 'SOC', points: pts((s) => s.soc * 100), cls: 'stroke-live-400', right: true }]),
          { name: 'grid in', points: pts((s) => s.gridIn), cls: 'stroke-ink-400', dashed: true },
          { name: 'generator', points: pts((s) => s.gen), cls: 'stroke-danger-400', dashed: true },
        ]}
      />
      <Legend items={[{ name: 'PV', cls: 'stroke-caution-400' }, { name: 'load', cls: 'stroke-signal-300' }, { name: 'state of charge', cls: 'stroke-live-400' }, { name: 'grid import', cls: 'stroke-ink-400' }, { name: 'generator', cls: 'stroke-danger-400' }]} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="PV energy" value={`${(r.totals.pv / 1000).toFixed(2)} kWh`} testid="demo-energy-pv" />
        <Stat label="Load not supplied" value={`${(r.totals.unmet / 1000).toFixed(2)} kWh`} tone={r.totals.unmet > 1 ? 'bad' : 'ok'} testid="demo-energy-unmet" />
        <Stat label="Curtailed / exported" value={`${(r.totals.curtailed / 1000).toFixed(2)} / ${(r.totals.gridOut / 1000).toFixed(2)} kWh`} />
        <Stat label="Grid in / generator" value={`${(r.totals.gridIn / 1000).toFixed(2)} / ${(r.totals.gen / 1000).toFixed(2)} kWh`} />
      </div>
    </div>
  )
}

export function SolarDemo({ id }: { id: SolarDemoId }) {
  switch (id) {
    case 'pv-iv':
      return <PvIv />
    case 'array-config':
      return <ArrayConfig />
    case 'mppt-track':
      return <MpptTrack />
    case 'load-profile':
      return <LoadProfile />
    case 'energy-day':
      return <EnergyDay />
  }
}
