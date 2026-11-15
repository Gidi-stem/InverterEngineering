import { useMemo, useState } from 'react'
import { arrayCurve, fitModule, mpp, operating, perturbObserve, pwmOperating } from '../../engine/solar/pv'
import { useProgress } from '../../store/progressStore'
import { Button, Panel } from '../../ui/primitives'
import { Slider } from '../academy/Slider'
import { Legend, LineChart, Stat } from './charts'
import { NumField } from './fields'
import { useSolarLab } from './solarStore'

/** Conditions for the prediction task: a fixed cycle so results are reproducible. */
const TASKS = [
  { g: 800, t: 45, series: 3 },
  { g: 600, t: 10, series: 4 },
  { g: 950, t: 58, series: 2 },
  { g: 400, t: 30, series: 5 },
]

export default function IvTab() {
  const m = useSolarLab((s) => s.spec.module)
  const record = useProgress((s) => s.recordActivity)
  const level = useProgress((s) => s.level)
  const [series, setSeries] = useState(3)
  const [strings, setStrings] = useState(1)
  const [g, setG] = useState(1000)
  const [t, setT] = useState(25)
  const [shade, setShade] = useState<number[]>([])
  const [vb, setVb] = useState(0)
  const gkey = Array.from({ length: series }, (_, k) => Math.min(g, shade[k] ?? g)).join(',')
  const c = useMemo(() => arrayCurve(m, { series, strings, g: gkey.split(',').map(Number), tCell: t, points: 300 }), [m, series, strings, t, gkey])
  const p = mpp(c)
  const po = perturbObserve(c, { steps: 80 })
  const pw = vb > 0 ? pwmOperating(c, vb) : null

  const [ti, setTi] = useState(0)
  const task = TASKS[ti % TASKS.length]
  const [ans, setAns] = useState({ voc: 0, isc: 0, p: 0 })
  const [res, setRes] = useState<null | { ok: boolean; rows: [string, number, number, boolean][] }>(null)
  const check = () => {
    const op = operating(m, task.g, task.t)
    const truth = { voc: task.series * op.voc, isc: op.isc, p: mpp(arrayCurve(m, { series: task.series, strings: 1, g: task.g, tCell: task.t, points: 600 })).p }
    const rows: [string, number, number, boolean][] = [
      ['String V_oc (V)', ans.voc, truth.voc, Math.abs(ans.voc - truth.voc) <= 0.03 * truth.voc],
      ['String I_sc (A)', ans.isc, truth.isc, Math.abs(ans.isc - truth.isc) <= 0.03 * truth.isc],
      ['String P_mp (W)', ans.p, truth.p, Math.abs(ans.p - truth.p) <= 0.05 * truth.p],
    ]
    const ok = rows.every((r) => r[3])
    setRes({ ok, rows })
    if (ok) record({ activityId: 'solar:iv', label: `Solar laboratory: predicted a PV string’s V_oc, I_sc and P_mp (${task.g} W/m², ${task.t} °C)`, level })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Panel title="PV I–V curve tracer">
        <div className="grid gap-3 sm:grid-cols-3">
          <Slider label="Modules in series" value={series} min={1} max={12} step={1} onChange={setSeries} fmt={(v) => `${v}`} />
          <Slider label="Parallel strings" value={strings} min={1} max={6} step={1} onChange={setStrings} fmt={(v) => `${v}`} />
          <Slider label="Irradiance" value={g} min={100} max={1100} step={50} onChange={setG} fmt={(v) => `${v} W/m²`} />
          <Slider label="Cell temperature" value={t} min={-10} max={75} step={1} onChange={setT} fmt={(v) => `${v} °C`} />
          <Slider label="Shade on module 1" value={shade[0] ?? g} min={50} max={g} step={50} onChange={(v) => setShade([v, ...shade.slice(1)])} fmt={(v) => `${v} W/m²`} />
          <Slider label="PWM: battery voltage (0 = MPPT only)" value={vb} min={0} max={60} step={0.2} onChange={setVb} fmt={(v) => (v ? `${v.toFixed(1)} V` : 'off')} />
        </div>
        <LineChart
          testid="iv-chart"
          label="Array I–V and P–V curves"
          xLabel="array voltage (V)"
          yLabel="current (A)"
          yRightLabel="power (W)"
          xMax={Math.max(10, Math.ceil(c[c.length - 1].v * 1.08))}
          yMax={Math.ceil(m.isc * strings * 1.25)}
          yRightMax={Math.ceil(m.pmax * series * strings * 1.25)}
          series={[
            { name: 'I', points: c.map((x) => [x.v, x.i]), cls: 'stroke-live-400' },
            { name: 'P', points: c.map((x) => [x.v, x.p]), cls: 'stroke-caution-400', right: true },
          ]}
          marks={[{ x: p.v, label: `MPP ${p.p.toFixed(0)} W` }, ...(pw ? [{ x: pw.v, label: `PWM ${pw.p.toFixed(0)} W`, cls: 'stroke-danger-400' }] : [])]}
        />
        <Legend items={[{ name: 'current', cls: 'stroke-live-400' }, { name: 'power', cls: 'stroke-caution-400' }]} />
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="V_oc" value={`${c[c.length - 1].v.toFixed(1)} V`} testid="iv-voc" />
          <Stat label="I_sc" value={`${c[0].i.toFixed(2)} A`} testid="iv-isc" />
          <Stat label="Global MPP" value={`${p.p.toFixed(0)} W @ ${p.v.toFixed(1)} V`} testid="iv-mpp" />
          <Stat label="P&O tracker settles" value={`${po.final.p.toFixed(0)} W`} tone={po.final.p < 0.95 * p.p ? 'warn' : 'ok'} testid="iv-po" />
        </div>
        <p className="mt-2 text-xs text-ink-500">
          Module: {m.name}
          {m.source === 'illustrative' ? ' (illustrative values)' : ''}. Single-diode model fitted to its datasheet values; bypass diodes modelled at 0.5 V. Change the module on the Design tab.
        </p>
      </Panel>
      <Panel title="Measurement task: predict the string’s values">
        <p className="text-sm text-ink-300" data-testid="iv-task">
          A string of <strong>{task.series}</strong> modules at <strong>{task.g} W/m²</strong> and a cell temperature of <strong>{task.t} °C</strong>. Using the datasheet values and coefficients (S2.M1), predict its open-circuit voltage, short-circuit current and maximum power. For this module the diode parameter is a = {(fitModule(m).a * ((task.t + 273.15) / 298.15)).toFixed(2)} V at {task.t} °C.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <NumField label="V_oc" unit="V" step={0.1} value={ans.voc} onChange={(v) => setAns({ ...ans, voc: v })} testid="iv-a-voc" />
          <NumField label="I_sc" unit="A" step={0.01} value={ans.isc} onChange={(v) => setAns({ ...ans, isc: v })} testid="iv-a-isc" />
          <NumField label="P_mp" unit="W" value={ans.p} onChange={(v) => setAns({ ...ans, p: v })} testid="iv-a-p" />
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="primary" onClick={check} data-testid="iv-check">
            Check against the tracer
          </Button>
          <Button
            onClick={() => {
              setTi(ti + 1)
              setRes(null)
            }}
            data-testid="iv-next"
          >
            New conditions
          </Button>
        </div>
        {res && (
          <div className="mt-3 space-y-1 text-sm" role="status" data-testid="iv-result" data-ok={res.ok}>
            {res.rows.map(([l, a, tr, ok]) => (
              <div key={l} className={ok ? 'text-live-400' : 'text-danger-400'}>
                {ok ? '✓' : '✗'} {l}: yours {a.toFixed(2)}, tracer {tr.toFixed(2)}
              </div>
            ))}
            <p className="text-xs text-ink-400">
              V_oc = n·[V_oc,STC(1 + β(T − 25)) + a·ln(G/1000)], with a = {(fitModule(m).a * ((task.t + 273.15) / 298.15)).toFixed(2)} V for this module at {task.t} °C (a ≈ n_d·N_cells·kT/q). I_sc = I_sc,STC × G/1000 × (1 + α(T − 25)). P_mp ≈ n·P_max × G/1000 × (1 + γ(T − 25)) × V_oc(G)/V_oc(1000 W/m²). Tolerances: 3 % for V and I, 5 % for P.
            </p>
            {res.ok && <p className="text-xs text-live-400">Recorded in your progress.</p>}
          </div>
        )}
      </Panel>
    </div>
  )
}
