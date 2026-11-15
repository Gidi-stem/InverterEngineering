import { useState } from 'react'
import { LOAD_LIBRARY, SOLAR_PRESETS } from '../../engine/solar/presets'
import { EXAMPLE_MODULES, MODULE_BY_ID, type ModuleSpec } from '../../engine/solar/pv'
import type { Load, SizedItem, SolarSpec } from '../../engine/solar/types'
import { useProgress } from '../../store/progressStore'
import { Button, Panel, Tag } from '../../ui/primitives'
import { Bars, Stat } from './charts'
import { NumField, SelectField, Toggle, WindowsField } from './fields'
import { designReport } from './report'
import { useSolarLab } from './solarStore'
import { useDesign } from './useDesign'

const GROUPS: SizedItem['group'][] = ['Loads', 'Inverter', 'Battery', 'PV array', 'Controller', 'Cables', 'Protection', 'Generator', 'Grid']

function ItemRow({ it }: { it: SizedItem }) {
  const v = Math.abs(it.value) >= 100 ? it.value.toFixed(0) : Math.abs(it.value) >= 1 ? it.value.toFixed(2) : it.value.toFixed(3)
  return (
    <details className="rounded border border-chassis-700 bg-chassis-850 px-3 py-2" data-testid={`item-${it.id}`}>
      <summary className="flex cursor-pointer list-none flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm text-ink-300">{it.label}</span>
        <span className="readout text-sm text-ink-100">
          {v} {it.unit}
          {it.kind === 'assumption' && <span className="ml-2 text-[10px] text-caution-400">assumption</span>}
          {it.kind === 'selected' && <span className="ml-2 text-[10px] text-signal-300">selected</span>}
        </span>
      </summary>
      <div className="mt-2 space-y-1 text-xs">
        <div className="readout text-ink-300">{it.formula}</div>
        <div className="readout break-words text-ink-400">{it.working}</div>
        <p className="text-ink-400">{it.why}</p>
      </div>
    </details>
  )
}

export default function DesignTab() {
  const { spec, setSpec, presetId, loadPreset } = useSolarLab()
  const d = useDesign()
  const record = useProgress((s) => s.recordActivity)
  const level = useProgress((s) => s.level)
  const [libId, setLibId] = useState(LOAD_LIBRARY[0].id)
  const [saved, setSaved] = useState<string | null>(null)
  const set = (p: Partial<SolarSpec>) => setSpec({ ...spec, ...p })
  const setLoad = (i: number, p: Partial<Load>) => set({ loads: spec.loads.map((l, k) => (k === i ? { ...l, ...p } : l)) })
  const setModule = (p: Partial<ModuleSpec>) => set({ module: { ...spec.module, ...p, source: 'user', id: 'user', name: p.name ?? (spec.module.source === 'user' ? spec.module.name : `${spec.module.name} (edited)`) } })
  const danger = d.issues.filter((i) => i.severity === 'danger')
  const grid = spec.type === 'grid-tied'
  const prof = d.profileAc.map((v, i) => v + d.profileDc[i])
  const n = d.numbers

  const recordDesign = () => {
    if (danger.length || !spec.loads.length) return
    record({ activityId: 'solar:design-ok', label: `Solar laboratory: complete ${spec.type} system design (${(n.eDaily / 1000).toFixed(2)} kWh/day)`, level })
    setSaved('Design recorded in your progress. It counts as the S2 design practical when you have studied the course.')
  }
  const download = () => {
    const blob = new Blob([designReport(d)], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `solar-design-${spec.type}.md`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="min-w-0 space-y-4">
        <Panel title="1. Start from an example or your own data">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <SelectField label="Example system" value={presetId} options={SOLAR_PRESETS.map((p) => ({ value: p.id, label: p.title }))} onChange={loadPreset} testid="solar-preset" />
            <Button onClick={() => loadPreset(presetId)} data-testid="solar-reset">
              Reset to example
            </Button>
          </div>
          <p className="mt-2 text-xs text-ink-400">{SOLAR_PRESETS.find((p) => p.id === presetId)?.summary}</p>
        </Panel>

        <Panel title="2. Load profile" action={<Tag tone="signal">{(n.eAc + n.eDc).toFixed(0)} Wh/day</Tag>}>
          <div className="space-y-2" data-testid="load-table">
            {spec.loads.map((l, i) => (
              <div key={l.id + i} className="grid grid-cols-2 gap-2 rounded border border-chassis-700 p-2 sm:grid-cols-[1.5fr_0.8fr_0.6fr_0.6fr_0.8fr_1.2fr_auto]" data-testid={`load-${i}`}>
                <input aria-label="Load name" value={l.name} onChange={(e) => setLoad(i, { name: e.target.value })} className="col-span-2 min-w-0 rounded border border-chassis-600 bg-chassis-850 px-2 py-1 text-sm text-ink-100 sm:col-span-1" />
                <NumField label="W" value={l.watts} min={0} max={20000} onChange={(v) => setLoad(i, { watts: v, surgeW: Math.max(v, l.surgeW) })} testid={`load-${i}-w`} />
                <NumField label="Qty" value={l.qty} min={0} max={100} onChange={(v) => setLoad(i, { qty: Math.round(v) })} testid={`load-${i}-qty`} />
                <NumField label="Duty" value={l.duty} step={0.05} min={0} max={1} onChange={(v) => setLoad(i, { duty: v })} />
                <NumField label="Start W" value={l.surgeW} min={0} max={100000} onChange={(v) => setLoad(i, { surgeW: Math.max(v, l.watts) })} />
                <label className="block text-xs text-ink-400">
                  Hours on
                  <WindowsField value={l.windows} onChange={(w) => setLoad(i, { windows: w })} testid={`load-${i}-h`} />
                </label>
                <div className="flex items-end gap-1">
                  <Button className="min-h-8 px-2 text-xs" onClick={() => setLoad(i, { ac: !l.ac })} aria-label={`Switch ${l.name} between AC and DC`}>
                    {l.ac ? 'AC' : 'DC'}
                  </Button>
                  <Button variant="ghost" className="min-h-8 px-2 text-xs" onClick={() => set({ loads: spec.loads.filter((_, k) => k !== i) })} aria-label={`Remove ${l.name}`} data-testid={`load-${i}-remove`}>
                    ✕
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-48 flex-1">
                <SelectField label="Add an appliance" value={libId} options={LOAD_LIBRARY.map((l) => ({ value: l.id, label: `${l.name} (${l.watts} W)` }))} onChange={setLibId} testid="load-lib" />
              </div>
              <Button onClick={() => set({ loads: [...spec.loads, { ...LOAD_LIBRARY.find((l) => l.id === libId)!, id: `${libId}-${spec.loads.length}` }] })} data-testid="load-add">
                Add
              </Button>
            </div>
            <p className="text-xs text-ink-500">Hours as ranges such as “18-23, 5-7” (wrap past midnight with “22-6”). Duty is the fraction of on-time a cycling load (fridge) actually runs. Typical appliance values for learning: use nameplate or measured values for a real design.</p>
          </div>
          <Bars values={prof} label="Hourly load profile" unit="W" testid="load-profile" hi={prof.indexOf(Math.max(...prof))} />
        </Panel>

        <Panel title="3. Site and system">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <SelectField label="System type" value={spec.type} options={[{ value: 'off-grid', label: 'Off-grid' }, { value: 'hybrid', label: 'Hybrid (grid + battery)' }, { value: 'grid-tied', label: 'Grid-tied (no battery)' }]} onChange={(v) => set({ type: v })} testid="sys-type" />
            {!grid && <SelectField label="Battery voltage" value={spec.vsys} options={[{ value: 0, label: 'Automatic' }, { value: 12, label: '12 V' }, { value: 24, label: '24 V' }, { value: 48, label: '48 V' }]} onChange={(v) => set({ vsys: v })} testid="sys-v" />}
            <NumField label="Peak sun hours (design month)" unit="kWh/m²/day" value={spec.site.psh} step={0.1} min={0.5} max={9} onChange={(v) => set({ site: { ...spec.site, psh: v } })} testid="site-psh" />
            <NumField label="Coldest ambient" unit="°C" value={spec.site.tMin} min={-40} max={40} onChange={(v) => set({ site: { ...spec.site, tMin: v } })} testid="site-tmin" />
            <NumField label="Hottest ambient" unit="°C" value={spec.site.tMax} min={-10} max={55} onChange={(v) => set({ site: { ...spec.site, tMax: v } })} />
            <NumField label="Inverter efficiency" value={spec.inverterEff} step={0.01} min={0.5} max={0.99} onChange={(v) => set({ inverterEff: v })} />
            {!grid && <NumField label="Inverter surge factor (datasheet)" value={spec.inverterSurge} step={0.1} min={1} max={5} onChange={(v) => set({ inverterSurge: v })} />}
            {!grid && <NumField label={spec.type === 'hybrid' ? 'Storage (days of daily energy)' : 'Days of autonomy'} value={spec.autonomy} step={0.1} min={0} max={10} onChange={(v) => set({ autonomy: v })} testid="sys-autonomy" />}
            {!grid && <SelectField label="Charge controller" value={spec.controller} options={[{ value: 'mppt', label: 'MPPT' }, { value: 'pwm', label: 'PWM' }]} onChange={(v) => set({ controller: v })} testid="sys-ctrl" />}
            <SelectField label={grid ? 'Inverter maximum DC voltage' : 'Controller maximum PV voltage'} value={spec.controllerMaxV} options={[50, 100, 150, 250, 450, 600, 1000].map((v) => ({ value: v, label: `${v} V` }))} onChange={(v) => set({ controllerMaxV: v })} testid="sys-vmax" />
            {grid && <NumField label="Inverter MPPT minimum" unit="V" value={spec.mpptMinV} min={20} max={600} onChange={(v) => set({ mpptMinV: v })} />}
            {grid && <NumField label="Fraction of daily load to offset" value={spec.gridOffset} step={0.05} min={0.1} max={2} onChange={(v) => set({ gridOffset: v })} />}
            {spec.type !== 'off-grid' && <Toggle label="Export surplus allowed" value={spec.exportAllowed} onChange={(v) => set({ exportAllowed: v })} />}
            {spec.type === 'hybrid' && <NumField label="Outage reserve (SOC)" value={spec.reserve} step={0.05} min={0} max={0.9} onChange={(v) => set({ reserve: v })} />}
          </div>
        </Panel>

        {!grid && (
          <Panel title="4. Battery">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <SelectField label="Chemistry" value={spec.battery.chem} options={[{ value: 'lifepo4', label: 'LiFePO₄' }, { value: 'lead-acid', label: 'Lead-acid (AGM/gel/flooded)' }]} onChange={(v) => set({ battery: { ...spec.battery, chem: v, dod: v === 'lead-acid' ? 0.5 : 0.8, eff: v === 'lead-acid' ? 0.85 : 0.95 } })} testid="bat-chem" />
              <NumField label="Battery (block) voltage" unit="V" value={spec.battery.unitV} step={0.1} min={1} max={60} onChange={(v) => set({ battery: { ...spec.battery, unitV: v } })} testid="bat-v" />
              <NumField label="Battery capacity" unit="Ah" value={spec.battery.unitAh} min={1} max={5000} onChange={(v) => set({ battery: { ...spec.battery, unitAh: v } })} testid="bat-ah" />
              <NumField label="Depth of discharge" value={spec.battery.dod} step={0.05} min={0.1} max={1} onChange={(v) => set({ battery: { ...spec.battery, dod: v } })} testid="bat-dod" />
              <NumField label="Round-trip efficiency" value={spec.battery.eff} step={0.01} min={0.5} max={1} onChange={(v) => set({ battery: { ...spec.battery, eff: v } })} />
            </div>
            <Toggle label="Generator back-up with automatic start" value={spec.generator} onChange={(v) => set({ generator: v })} testid="gen-on" />
            {spec.generator && (
              <div className="grid grid-cols-2 gap-3">
                <NumField label="Start below SOC" value={spec.genStart} step={0.05} min={0} max={1} onChange={(v) => set({ genStart: v })} testid="gen-start" />
                <NumField label="Stop above SOC" value={spec.genStop} step={0.05} min={0} max={1} onChange={(v) => set({ genStop: v })} />
              </div>
            )}
          </Panel>
        )}

        <Panel title={`${grid ? 4 : 5}. PV module`} action={spec.module.source === 'illustrative' ? <Tag tone="caution">illustrative values</Tag> : <Tag tone="signal">your datasheet</Tag>}>
          <SelectField label="Example module" value={MODULE_BY_ID[spec.module.id] ? spec.module.id : 'user'} options={[...EXAMPLE_MODULES.map((m) => ({ value: m.id, label: m.name })), { value: 'user', label: 'Your datasheet (edit the fields)' }]} onChange={(v) => v !== 'user' && set({ module: MODULE_BY_ID[v] })} testid="mod-pick" />
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {(
              [
                ['pmax', 'P_max', 'W'],
                ['voc', 'V_oc', 'V'],
                ['isc', 'I_sc', 'A'],
                ['vmp', 'V_mp', 'V'],
                ['imp', 'I_mp', 'A'],
                ['betaVoc', 'β V_oc', '%/°C'],
                ['alphaIsc', 'α I_sc', '%/°C'],
                ['gammaPmax', 'γ P_max', '%/°C'],
                ['noct', 'NOCT', '°C'],
                ['cells', 'Cells', ''],
                ['maxFuse', 'Max series fuse', 'A'],
                ['maxSystemV', 'Max system V', 'V'],
              ] as const
            ).map(([k, l, u]) => (
              <NumField key={k} label={l} unit={u || undefined} step={0.01} value={spec.module[k]} onChange={(v) => setModule({ [k]: v })} testid={`mod-${k}`} />
            ))}
          </div>
        </Panel>

        <Panel title={`${grid ? 5 : 6}. Cable routes and allowances`}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <NumField label="PV string route" unit="m" value={spec.routePv} min={1} max={200} onChange={(v) => set({ routePv: v })} />
            <NumField label="Combiner/controller to battery route" unit="m" value={spec.routeCtrl} min={0.5} max={50} onChange={(v) => set({ routeCtrl: v })} />
            {!grid && <NumField label="Battery to inverter route" unit="m" value={spec.routeInv} min={0.3} max={20} onChange={(v) => set({ routeInv: v })} testid="route-inv" />}
            <NumField label="PV drop limit" value={spec.dropPv} step={0.005} min={0.005} max={0.1} onChange={(v) => set({ dropPv: v })} />
            {!grid && <NumField label="DC drop limit" value={spec.dropDc} step={0.005} min={0.005} max={0.1} onChange={(v) => set({ dropDc: v })} />}
            <NumField label="Soiling factor" value={spec.soiling} step={0.01} min={0.5} max={1} onChange={(v) => set({ soiling: v })} />
            <NumField label="Wiring factor" value={spec.wiring} step={0.01} min={0.5} max={1} onChange={(v) => set({ wiring: v })} />
            <NumField label="Mismatch factor" value={spec.mismatch} step={0.01} min={0.5} max={1} onChange={(v) => set({ mismatch: v })} />
          </div>
        </Panel>
      </div>

      <div className="min-w-0 space-y-4">
        <Panel title="Design summary" action={danger.length ? <Tag tone="danger">{danger.length} must fix</Tag> : <Tag tone="live">checks passed</Tag>}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" data-testid="solar-summary">
            <Stat label="Daily energy at battery" value={`${(n.eDaily / 1000).toFixed(2)} kWh`} testid="sum-e" />
            <Stat label="Peak / surge" value={`${n.pPeak.toFixed(0)} / ${n.pSurge.toFixed(0)} W`} />
            <Stat label={grid ? 'Grid inverter' : 'Inverter'} value={`${n.inverterW} W${grid ? '' : ` @ ${n.vsys} V`}`} testid="sum-inv" />
            {!grid && <Stat label="Battery bank" value={`${n.batSeries}S × ${n.batParallel}P = ${n.bankKWh.toFixed(2)} kWh`} testid="sum-bank" />}
            <Stat label="PV array" value={`${n.series} × ${n.strings} = ${n.modules} modules, ${(n.arrayW / 1000).toFixed(2)} kWp`} testid="sum-array" />
            <Stat label="String V_oc (cold)" value={`${n.vocColdString.toFixed(1)} V`} tone={n.vocColdString > Math.min(spec.controllerMaxV, spec.module.maxSystemV) ? 'bad' : 'ok'} testid="sum-voc" />
            {!grid && <Stat label="Controller" value={`${spec.controller.toUpperCase()} ${n.controllerA} A, ${spec.controllerMaxV} V`} testid="sum-ctrl" />}
            {!grid && <Stat label="Battery fuse / cable" value={`${n.batteryFuse} A / ${n.cableInv} mm²`} />}
            {spec.generator && !grid && <Stat label="Generator" value={`${n.generatorKVA} kVA`} />}
            {grid && <Stat label="Annual yield (estimate)" value={`${n.annualKWh.toFixed(0)} kWh`} />}
          </div>
          {d.issues.length > 0 && (
            <ul className="mt-3 space-y-1.5" data-testid="solar-issues">
              {d.issues.map((i) => (
                <li key={i.code} className={`rounded border px-3 py-2 text-xs ${i.severity === 'danger' ? 'border-danger-400/50 bg-danger-400/10 text-danger-400' : i.severity === 'warning' ? 'border-caution-400/40 bg-caution-400/8 text-caution-400' : 'border-chassis-600 text-ink-400'}`} data-testid={`issue-${i.code}`}>
                  {i.message}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="primary" disabled={danger.length > 0 || !spec.loads.length} onClick={recordDesign} data-testid="solar-record">
              Record this design
            </Button>
            <Button onClick={download} data-testid="solar-download">
              Download design report
            </Button>
          </div>
          {saved && (
            <p className="mt-2 text-xs text-live-400" role="status" data-testid="solar-saved">
              {saved}
            </p>
          )}
        </Panel>
        <Panel title="Every calculation, explained">
          <div className="space-y-4" data-testid="solar-items">
            {GROUPS.filter((g) => d.items.some((i) => i.group === g)).map((g) => (
              <section key={g}>
                <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-ink-400 uppercase">{g}</h3>
                <div className="space-y-1.5">
                  {d.items
                    .filter((i) => i.group === g)
                    .map((i) => (
                      <ItemRow key={i.id} it={i} />
                    ))}
                </div>
              </section>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-500">Educational design estimate with typical allowances. A real installation is designed to the applicable standards with the manufacturers’ data and installed, inspected and certified by qualified persons.</p>
        </Panel>
      </div>
    </div>
  )
}
