import { useMemo, useState } from 'react'
import { simulateDispatch } from '../../engine/solar/dispatch'
import { useProgress } from '../../store/progressStore'
import { Button, Panel } from '../../ui/primitives'
import { Slider } from '../academy/Slider'
import { Legend, LineChart, Stat } from './charts'
import { Toggle } from './fields'
import { useDesign } from './useDesign'

/** 24–72 hour energy-management simulation of the learner's current design. */
export default function EnergyTab() {
  const d = useDesign()
  const s = d.spec
  const record = useProgress((x) => x.recordActivity)
  const level = useProgress((x) => x.level)
  const [days, setDays] = useState(3)
  const [weather, setWeather] = useState([1, 0.35, 0.8])
  const [soc0, setSoc0] = useState(0.7)
  const [outage, setOutage] = useState(false)
  const [oFrom, setOFrom] = useState(18)
  const [oLen, setOLen] = useState(6)
  const [ran, setRan] = useState(false)
  const r = useMemo(() => simulateDispatch(d, { days, weather, soc0, outage: outage ? [oFrom, oFrom + oLen] : undefined }), [d, days, weather, soc0, outage, oFrom, oLen])
  const pts = (f: (x: (typeof r.steps)[number]) => number): [number, number][] => r.steps.map((x) => [x.t, f(x)])
  const hasBat = s.type !== 'grid-tied'
  const t = r.totals
  const run = () => {
    setRan(true)
    record({ activityId: 'solar:sim', label: `Solar laboratory: ${days}-day energy-management simulation (${s.type})`, level })
  }
  return (
    <div className="space-y-4">
      <Panel title="Scenario">
        <div className="grid gap-3 sm:grid-cols-3">
          <Slider label="Days" value={days} min={1} max={3} step={1} onChange={setDays} fmt={(v) => `${v}`} />
          {hasBat && <Slider label="Starting state of charge" value={soc0} min={0.2} max={1} step={0.05} onChange={setSoc0} fmt={(v) => `${Math.round(v * 100)} %`} />}
          {Array.from({ length: days }, (_, k) => (
            <Slider key={k} label={`Day ${k + 1} sun (× design day)`} value={weather[k] ?? 1} min={0} max={1.2} step={0.05} onChange={(v) => setWeather(Array.from({ length: 3 }, (_, j) => (j === k ? v : (weather[j] ?? 1))))} fmt={(v) => `${Math.round(v * 100)} %`} />
          ))}
        </div>
        {s.type !== 'off-grid' && (
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            <Toggle label="Grid outage" value={outage} onChange={setOutage} testid="en-outage" />
            {outage && <Slider label="Outage starts (hour of run)" value={oFrom} min={0} max={days * 24 - 1} step={1} onChange={setOFrom} fmt={(v) => `${v} h`} />}
            {outage && <Slider label="Outage length" value={oLen} min={1} max={24} step={1} onChange={setOLen} fmt={(v) => `${v} h`} />}
          </div>
        )}
        <div className="mt-3">
          <Button variant="primary" onClick={run} data-testid="en-run">
            Run and record the simulation
          </Button>
          {ran && (
            <span className="ml-3 text-xs text-live-400" role="status" data-testid="en-recorded">
              Recorded in your progress.
            </span>
          )}
        </div>
      </Panel>
      <Panel title={`Energy flows: ${s.type} system, ${(d.numbers.arrayW / 1000).toFixed(2)} kWp${hasBat ? `, ${d.numbers.bankKWh.toFixed(1)} kWh battery` : ''}`}>
        <LineChart
          testid="en-chart"
          label="Energy flows over the simulated days"
          xLabel="hour of the run"
          yLabel="power (W)"
          yRightLabel={hasBat ? 'state of charge (%)' : undefined}
          xMax={days * 24}
          xTicks={Array.from({ length: days * 4 + 1 }, (_, k) => k * 6)}
          yRightMax={100}
          series={[
            { name: 'PV', points: pts((x) => x.pv), cls: 'stroke-caution-400' },
            { name: 'load', points: pts((x) => x.load), cls: 'stroke-signal-300' },
            ...(hasBat ? [{ name: 'SOC', points: pts((x) => x.soc * 100), cls: 'stroke-live-400', right: true }] : []),
            { name: 'grid in', points: pts((x) => x.gridIn), cls: 'stroke-ink-400', dashed: true },
            { name: 'grid out', points: pts((x) => x.gridOut), cls: 'stroke-ink-500', dashed: true },
            { name: 'generator', points: pts((x) => x.gen), cls: 'stroke-danger-400', dashed: true },
            { name: 'unmet', points: pts((x) => x.unmet), cls: 'stroke-danger-400' },
          ]}
        />
        <Legend items={[{ name: 'PV', cls: 'stroke-caution-400' }, { name: 'load', cls: 'stroke-signal-300' }, { name: 'state of charge', cls: 'stroke-live-400' }, { name: 'grid import', cls: 'stroke-ink-400' }, { name: 'grid export', cls: 'stroke-ink-500' }, { name: 'generator (dashed) / unmet (solid)', cls: 'stroke-danger-400' }]} />
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" data-testid="en-totals">
          <Stat label="PV energy" value={`${(t.pv / 1000).toFixed(2)} kWh`} testid="en-pv" />
          <Stat label="Load energy" value={`${(t.load / 1000).toFixed(2)} kWh`} />
          <Stat label="Not supplied" value={`${(t.unmet / 1000).toFixed(2)} kWh`} tone={t.unmet > 1 ? 'bad' : 'ok'} testid="en-unmet" />
          <Stat label="Curtailed" value={`${(t.curtailed / 1000).toFixed(2)} kWh`} />
          {s.type !== 'off-grid' && <Stat label="Grid import / export" value={`${(t.gridIn / 1000).toFixed(2)} / ${(t.gridOut / 1000).toFixed(2)} kWh`} />}
          {s.generator && <Stat label="Generator" value={`${(t.gen / 1000).toFixed(2)} kWh, ${t.genHours.toFixed(1)} h, ${t.genStarts} start(s)`} testid="en-gen" />}
          {hasBat && <Stat label="SOC range" value={`${Math.round(t.socMin * 100)}–${Math.round(t.socMax * 100)} %`} />}
          <Stat label="Supplied without grid or generator" value={`${Math.round(t.selfSufficiency * 100)} %`} />
        </div>
        <p className="mt-2 text-xs text-ink-500">
          Clear-sky sine irradiance scaled to the site’s peak sun hours, with each day’s weather factor; 10-minute steps. Dispatch: PV supplies the load, then charges the battery, then {s.type === 'hybrid' && s.exportAllowed ? 'exports' : 'is curtailed'}; shortfalls come from the battery down to its limit{s.type === 'hybrid' ? ' (the outage reserve while the grid is up), then the grid' : ''}{s.generator ? ', with the generator starting below its threshold' : ''}. An educational model, not a yield prediction.
        </p>
      </Panel>
    </div>
  )
}
