import { useMemo, useState, type ReactNode } from 'react'
import { PART_DEFS } from '../../../engine/circuit/parts'
import { solveCircuit } from '../../../engine/circuit/solve'
import { buildTopology } from '../../../engine/circuit/topology'
import type { CircuitDoc } from '../../../engine/circuit/types'
import type { AcResult } from '../../../engine/sim/ac'
import type { Frame, ProbeInfo } from '../../../engine/sim/session'
import { Button, SafetyNotice, Tag } from '../../../ui/primitives'
import { eng, shown, volts } from '../format'
import { ParamInput } from '../InspectPanel'
import { Bode } from './Bode'
import { autoScale, A_DIVS, CH_COLORS, fmtSec, V_DIVS } from './scale'
import type { ScopeSettings, SimState } from './useSimulation'

interface Props {
  doc: CircuitDoc
  state: SimState
  frame: Frame | null
  probes: ProbeInfo[]
  h: number | null
  computeMs: number
  error: string | null
  settings: ScopeSettings
  onSettings: (s: ScopeSettings) => void
  timeStep: number | undefined
  onTimeStep: (h: number | undefined) => void
  onParam: (id: string, key: string, v: number) => void
  onState: (id: string, key: string, v: number) => void
  runAc: (doc: CircuitDoc, input: string, output: string) => Promise<AcResult | { error: string }>
}

/** Parameters worth having at hand while a simulation runs. */
const QUICK: Record<string, string[]> = {
  battery: ['V'],
  'dc-supply': ['V', 'Ilim'],
  'ac-source': ['Vrms', 'f'],
  'gate-source': ['f', 'duty', 'phase', 'fm', 'm', 'td'],
  resistor: ['R'],
  'dc-load': ['R'],
  'ac-load': ['R'],
  capacitor: ['C'],
  electrolytic: ['C'],
  inductor: ['L'],
  transformer: ['n'],
  'transformer-ct': ['n'],
  'pv-array': ['Voc', 'Isc'],
  vsense: ['Vset'],
}
const STEPS = [undefined, 1e-7, 2e-7, 5e-7, 1e-6, 2e-6, 5e-6, 1e-5, 2e-5, 5e-5, 1e-4]

function Section({ title, children, open = true }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-t border-chassis-700 pt-2">
      <summary className="cursor-pointer text-[11px] font-semibold tracking-wide text-ink-400 uppercase">{title}</summary>
      <div className="mt-2 space-y-2">{children}</div>
    </details>
  )
}

export function SimPanel(p: Props) {
  const { doc, frame, settings, onSettings } = p
  const [acIn, setAcIn] = useState('')
  const [acOut, setAcOut] = useState('')
  const [ac, setAc] = useState<AcResult | { error: string } | null>(null)
  const [acBusy, setAcBusy] = useState(false)
  const groups = useMemo(() => {
    const g = new Map<string, ProbeInfo[]>()
    for (const x of p.probes) g.set(x.group, [...(g.get(x.group) ?? []), x])
    return [...g.entries()]
  }, [p.probes])
  const dcop = useMemo(() => {
    const topo = buildTopology(doc)
    const s = doc.parts.length && topo.referenceNode !== null ? solveCircuit(doc, topo, { kind: 'dc' }) : null
    return { topo, s }
  }, [doc])
  const sources = doc.parts.filter((x) => x.type === 'ac-source' || x.type === 'gate-source')
  const voltProbes = p.probes.filter((x) => x.unit === 'V')
  const setCh = (i: number, patch: Partial<ScopeSettings['channels'][number]>) => onSettings({ ...settings, channels: settings.channels.map((c, k) => (k === i ? { ...c, ...patch } : c)) })
  const unitOf = (key: string) => p.probes.find((x) => x.key === key)?.unit ?? (key.startsWith('I') ? 'A' : 'V')

  return (
    <div className="space-y-3 text-sm" data-testid="sim-panel">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Tag tone={p.state === 'running' ? 'live' : p.state === 'error' ? 'danger' : 'neutral'}>{p.state}</Tag>
        <span className="font-mono text-ink-300">t = {frame ? fmtSec(frame.t) : '0 s'}</span>
        {p.h && <span className="font-mono text-ink-400">h = {fmtSec(p.h)}</span>}
        {frame && <span className="font-mono text-ink-500">{frame.steps.toLocaleString()} steps</span>}
        {p.state === 'running' && <span className="text-ink-500">{p.computeMs.toFixed(0)} ms per frame</span>}
      </div>
      {p.error && (
        <SafetyNotice tone="danger">
          <strong>Simulation stopped.</strong> {p.error}
        </SafetyNotice>
      )}
      {frame && (frame.events.blown.length > 0 || frame.events.tripped.length > 0) && (
        <SafetyNotice tone="danger">
          {frame.events.blown.length > 0 && <span>Fuse blown: {frame.events.blown.join(', ')}. </span>}
          {frame.events.tripped.length > 0 && <span>Breaker tripped: {frame.events.tripped.join(', ')}. </span>}
          Find the fault, then Reset the simulation to replace it.
        </SafetyNotice>
      )}

      <Section title="Channels">
        {settings.channels.map((c, i) => {
          const unit = unitOf(c.key)
          return (
            <div key={i} className="space-y-1 rounded-md border border-chassis-700 p-2" data-testid={`channel-${i}`}>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs font-semibold" style={{ color: CH_COLORS[i] }}>
                  <input type="checkbox" checked={c.on} onChange={(e) => setCh(i, { on: e.target.checked })} className="accent-signal-500" />
                  CH{i + 1}
                </label>
                <select value={c.key} onChange={(e) => setCh(i, { key: e.target.value, on: true })} aria-label={`CH${i + 1} signal`} className="h-8 min-w-0 flex-1 rounded border border-chassis-600 bg-chassis-950 px-1 text-xs text-ink-100">
                  <option value="">— choose a signal —</option>
                  {c.key && !p.probes.some((x) => x.key === c.key) && <option value={c.key}>{c.key}</option>}
                  {groups.map(([g, list]) => (
                    <optgroup key={g} label={g}>
                      {list.map((x) => (
                        <option key={x.key} value={x.key}>
                          {x.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-400">
                <select value={c.perDiv} onChange={(e) => setCh(i, { perDiv: Number(e.target.value) })} aria-label={`CH${i + 1} scale`} className="h-8 rounded border border-chassis-600 bg-chassis-950 px-1 font-mono text-ink-100">
                  {(unit === 'A' ? A_DIVS : V_DIVS).map((d) => (
                    <option key={d} value={d}>
                      {eng(d, unit)}/div
                    </option>
                  ))}
                </select>
                <span>offset</span>
                <button type="button" className="h-8 w-8 rounded border border-chassis-600" aria-label={`CH${i + 1} up`} onClick={() => setCh(i, { offset: c.offset + 0.5 })}>
                  ▲
                </button>
                <button type="button" className="h-8 w-8 rounded border border-chassis-600" aria-label={`CH${i + 1} down`} onClick={() => setCh(i, { offset: c.offset - 0.5 })}>
                  ▼
                </button>
                <span className="font-mono">{c.offset.toFixed(1)} div</span>
              </div>
            </div>
          )
        })}
        <Button
          variant="secondary"
          disabled={!frame}
          onClick={() =>
            onSettings({
              ...settings,
              channels: settings.channels.map((c) => {
                const ch = frame?.channels.find((x) => x.key === c.key)
                if (!c.on || !ch?.meas) return c
                const mid = (ch.meas.max + ch.meas.min) / 2
                const per = autoScale(ch.meas.pkpk, ch.unit, Math.max(Math.abs(ch.meas.max), Math.abs(ch.meas.min)))
                return { ...c, perDiv: per, offset: Math.abs(mid) / per > 3 ? -Math.round((mid / per) * 2) / 2 : 0 }
              }),
            })
          }
        >
          Auto-scale channels
        </Button>
      </Section>

      <Section title="Measurements (displayed window)">
        {!frame ? (
          <p className="text-xs text-ink-500">Run the simulation to measure.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-[11px]" data-testid="measurements">
              <thead>
                <tr className="text-left text-ink-500">
                  <th className="pr-2 font-medium">CH</th>
                  <th className="pr-2 text-right font-medium">Mean</th>
                  <th className="pr-2 text-right font-medium">RMS</th>
                  <th className="pr-2 text-right font-medium">Pk-pk</th>
                  <th className="pr-2 text-right font-medium">Freq</th>
                  <th className="text-right font-medium">Duty</th>
                </tr>
              </thead>
              <tbody>
                {settings.channels.map((c, i) => {
                  const ch = frame.channels.find((x) => x.key === c.key)
                  if (!c.on || !ch) return null
                  const m = ch.meas
                  return (
                    <tr key={i} className="border-t border-chassis-800" style={{ color: CH_COLORS[i] }}>
                      <td className="pr-2">{i + 1}</td>
                      <td className="pr-2 text-right">{m ? eng(m.mean, ch.unit) : '—'}</td>
                      <td className="pr-2 text-right">{m ? eng(m.rms, ch.unit) : '—'}</td>
                      <td className="pr-2 text-right">{m ? eng(m.pkpk, ch.unit) : '—'}</td>
                      <td className="pr-2 text-right">{m?.freq ? eng(m.freq, 'Hz') : '—'}</td>
                      <td className="text-right">{m?.duty !== null && m?.duty !== undefined ? `${(m.duty * 100).toFixed(1)} %` : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="mt-1 text-[10px] text-ink-500">Mean, RMS and duty are taken over whole cycles when a frequency is found. Values are simulated, not measured on hardware.</p>
          </div>
        )}
      </Section>

      <Section title="Energy and losses">
        {frame ? (
          <>
            <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 font-mono text-[11px]" data-testid="energy">
              <dt className="text-ink-400">Delivered by sources</dt>
              <dd className="text-right text-ink-100">{eng(frame.energy.delivered, 'J')}</dd>
              <dt className="text-ink-400">Dissipated</dt>
              <dd className="text-right text-ink-100">{eng(frame.energy.dissipated, 'J')}</dd>
              <dt className="text-ink-400">Stored now (½CV² + ½LI²)</dt>
              <dd className="text-right text-ink-100">{eng(frame.energy.stored, 'J')}</dd>
              <dt className="text-ink-400">Energy balance error</dt>
              <dd className="text-right text-ink-100">{frame.energy.delivered > 0 ? `${((Math.abs(frame.energy.error) / frame.energy.delivered) * 100).toFixed(3)} %` : '—'}</dd>
            </dl>
            {frame.thermal.length > 0 && (
              <table className="w-full font-mono text-[11px]" data-testid="thermal">
                <thead>
                  <tr className="text-left text-ink-500">
                    <th className="font-medium">Switch</th>
                    <th className="text-right font-medium">Cond.</th>
                    <th className="text-right font-medium">Switching</th>
                    <th className="text-right font-medium">T_j est.</th>
                  </tr>
                </thead>
                <tbody>
                  {frame.thermal.map((t) => (
                    <tr key={t.part} className="border-t border-chassis-800">
                      <td className="text-ink-100">{t.label}</td>
                      <td className="text-right text-ink-200">{eng(t.pCond, 'W')}</td>
                      <td className="text-right text-ink-200">{eng(t.pSw, 'W')}</td>
                      <td className={`text-right ${t.tj > 150 ? 'text-danger-400' : t.tj > 100 ? 'text-caution-400' : 'text-ink-100'}`}>{t.tj.toFixed(1)} °C</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="text-[10px] text-ink-500">
              Conduction loss is the simulated v·i of each switch and its diode. Switching loss is ½·V·I·t_sw per simulated edge, using the typical t_sw parameter. T_j is a steady-state estimate, T_a + P·R_θ(j-a) with T_a = 25 °C; thermal capacitance is not modelled. The energy error measures numerical accuracy; it grows when events are faster than the time step.
            </p>
          </>
        ) : (
          <p className="text-xs text-ink-500">Run the simulation to see energy and losses.</p>
        )}
      </Section>

      <Section title="Parameters (changes apply while running)">
        {doc.parts
          .filter((x) => QUICK[x.type])
          .map((x) => {
            const def = PART_DEFS[x.type]
            const keys = QUICK[x.type].filter((k) => shown(x, def.params.find((q) => q.key === k)?.when))
            const modeDef = x.type === 'gate-source' ? def.states?.filter((s) => shown(x, s.when)) : undefined
            return (
              <div key={x.id} className="space-y-1.5 rounded-md border border-chassis-800 p-2">
                <div className="font-mono text-xs font-semibold text-ink-100">
                  {x.label} <span className="font-sans font-normal text-ink-400">{def.name}</span>
                </div>
                {modeDef?.map((st) => (
                  <div key={st.key} className="flex flex-wrap items-center gap-1 text-xs" role="group" aria-label={`${x.label} ${st.label}`}>
                    <span className="w-16 text-ink-400">{st.label}</span>
                    {st.options.map((o) => (
                      <button key={o.value} type="button" aria-pressed={(x.states[st.key] ?? st.default) === o.value} onClick={() => p.onState(x.id, st.key, o.value)} className={`min-h-8 rounded px-2 ${(x.states[st.key] ?? st.default) === o.value ? 'bg-signal-500 text-white' : 'border border-chassis-600 text-ink-300'}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                ))}
                {keys.map((k) => (
                  <ParamInput key={`${x.id}-${k}`} part={x} def={def.params.find((q) => q.key === k)!} onCommit={(v) => p.onParam(x.id, k, v)} />
                ))}
              </div>
            )
          })}
      </Section>

      <Section title="Time step" open={false}>
        <label className="flex items-center gap-2 text-xs text-ink-300">
          Step
          <select value={p.timeStep ?? ''} onChange={(e) => p.onTimeStep(e.target.value ? Number(e.target.value) : undefined)} className="h-8 rounded border border-chassis-600 bg-chassis-950 px-1 font-mono text-ink-100" data-testid="time-step">
            {STEPS.map((s) => (
              <option key={s ?? 'auto'} value={s ?? ''}>
                {s ? fmtSec(s) : `Automatic${p.h && p.timeStep === undefined ? ` (${fmtSec(p.h)})` : ''}`}
              </option>
            ))}
          </select>
        </label>
        <p className="text-[11px] text-ink-500">Automatic resolves every source period (AC/400, PWM/200, SPWM carrier/100). A smaller step is more accurate and slower. Changing it applies at the next Run or Reset.</p>
      </Section>

      <Section title="DC operating point" open={false}>
        {dcop.s?.ok ? (
          <table className="w-full font-mono text-[11px]" data-testid="dc-op">
            <tbody>
              {dcop.topo.nodes
                .filter((n) => n.id !== dcop.topo.referenceNode && n.terminals.length > 1)
                .map((n) => (
                  <tr key={n.id} className="border-t border-chassis-800">
                    <td className="text-ink-400">N{n.id}</td>
                    <td className="text-ink-300">{n.terminals.slice(0, 3).map((t) => `${doc.parts.find((x) => x.id === t.partId)?.label}.${t.terminalId}`).join(', ')}</td>
                    <td className="text-right text-ink-100">{volts(dcop.s!.nodeVoltages[n.id])}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p className="text-xs text-ink-500">{dcop.s?.error ?? 'Build a circuit with a reference node first.'}</p>
        )}
        <p className="text-[11px] text-ink-500">Steady DC state with capacitors open, inductors as their winding resistance and AC sources at 0 V; generators at their static level.</p>
      </Section>

      <Section title="AC analysis (frequency response)" open={false}>
        <div className="grid gap-2 text-xs">
          <label className="grid gap-1 text-ink-400">
            Input source (1 V)
            <select value={acIn} onChange={(e) => setAcIn(e.target.value)} className="h-8 rounded border border-chassis-600 bg-chassis-950 px-1 text-ink-100" data-testid="ac-input">
              <option value="">— choose —</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} ({PART_DEFS[s.type].name})
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-ink-400">
            Output
            <select value={acOut} onChange={(e) => setAcOut(e.target.value)} className="h-8 rounded border border-chassis-600 bg-chassis-950 px-1 text-ink-100" data-testid="ac-output">
              <option value="">— choose a voltage —</option>
              {voltProbes
                .filter((x) => !x.key.startsWith('N:'))
                .map((x) => (
                  <option key={x.key} value={x.key}>
                    {x.label}
                  </option>
                ))}
            </select>
          </label>
          <Button
            variant="secondary"
            disabled={!acIn || !acOut || acBusy}
            data-testid="ac-run"
            onClick={async () => {
              setAcBusy(true)
              setAc(await p.runAc(doc, acIn, acOut))
              setAcBusy(false)
            }}
          >
            {acBusy ? 'Calculating…' : 'Run AC sweep (1 Hz – 100 kHz)'}
          </Button>
        </div>
        {ac && ('error' in ac ? <p className="text-xs text-danger-400">{ac.error}</p> : <Bode result={ac} />)}
        <p className="text-[11px] text-ink-500">Small-signal response of the linear circuit; diodes and transistors stay in their DC operating state.</p>
      </Section>

      <Section title="What is simulated" open={false}>
        <p className="text-[11px] leading-relaxed text-ink-400">
          Time-domain modified nodal analysis with a fixed step: trapezoidal integration, with backward Euler at start-up and after every switching event. Diodes, LEDs, MOSFETs and IGBTs are piecewise-linear (knee voltage + resistance,
          on-resistance or V_CE(sat), body diodes) and switch instantly. Gates are ideal (no gate charge). Transformers are ideal with winding resistance and magnetising inductance; there is no saturation or leakage inductance. Fuses and breakers use a
          simplified I²t model; relays switch instantly with 70 % pull-in and 30 % drop-out. If the device states cannot be made consistent, or values become unstable, the run stops and says so instead of showing wrong results.
        </p>
      </Section>
    </div>
  )
}
