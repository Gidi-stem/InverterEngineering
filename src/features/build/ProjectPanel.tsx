import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SELECTION_OPTIONS, suggestSelection } from '../../content/buildProjects'
import type { CircuitDoc } from '../../engine/circuit/types'
import { verifySteps, type StepStatus } from '../../engine/design/assembly'
import { STAGE_LABEL, type AssemblyStep } from '../../engine/design/generate'
import { inSyncWithDesign, syncToDesign } from '../../engine/design/kit'
import { suitePassed, TEST_TITLE, type TestKind, type TestResult } from '../../engine/design/testing'
import type { DesignSpec, Selection } from '../../engine/design/types'
import { useProgress } from '../../store/progressStore'
import type { LearnerLevel } from '../../types/progress'
import { Button, SafetyNotice, Tag } from '../../ui/primitives'
import { LevelSelector } from '../library/components/shared'
import { useBuildLab } from './buildStore'
import { projectReport } from './report'
import { modelOf, type ProjectModel } from './useProject'
import { useSuite } from './useSuite'

type Sub = 'brief' | 'design' | 'components' | 'assembly' | 'tests' | 'fault' | 'assess'
const SUBS: [Sub, string][] = [
  ['brief', 'Brief'],
  ['design', 'Design'],
  ['components', 'Components'],
  ['assembly', 'Assembly'],
  ['tests', 'Tests'],
  ['fault', 'Troubleshoot'],
  ['assess', 'Assessment'],
]

const fmt = (v: number | null | undefined) => {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—'
  const a = Math.abs(v)
  return a >= 1000 ? v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : a >= 100 ? v.toFixed(1) : a >= 10 ? v.toFixed(2) : a >= 0.01 || a === 0 ? v.toFixed(3) : v.toExponential(2)
}
const partsOfStep = (s: AssemblyStep) => [...new Set(s.req.flatMap((r) => (r.kind === 'conn' ? [r.a, r.b] : [r.a, r.b, `${r.part}.x`]).map((t) => t.split('.')[0])))]

interface Props {
  model: ProjectModel
  doc: CircuitDoc
  level: LearnerLevel
  dangerCount: number
  onCommit: (doc: CircuitDoc) => void
  onFocus: (parts: string[] | null) => void
  flash: (text: string, tone?: 'info' | 'error' | 'ok') => void
}

/**
 * Build Your Own Inverter: the project tab of the circuit laboratory. Brief, configurator with the
 * explained calculation sheet, component selection with compatibility checks, verified assembly
 * steps, the engineering test suite, troubleshooting and the assessment.
 */
export function ProjectPanel({ model, doc, level, dangerCount, onCommit, onFocus, flash }: Props) {
  const { project: p } = model
  const [sub, setSub] = useState<Sub>('brief')
  const steps = useMemo(() => verifySteps(doc, model.build.steps), [doc, model.build.steps])
  const stepsDone = steps.filter((s) => s.done).length
  const assembled = stepsDone === steps.length && dangerCount === 0
  const docJson = useMemo(() => JSON.stringify(doc), [doc])
  const suiteRec = useBuildLab((s) => s.suites[p.id])
  const saveSuite = useBuildLab((s) => s.saveSuite)
  const setDesign = useBuildLab((s) => s.setDesign)
  const setSelection = useBuildLab((s) => s.setSelection)
  const attempts = useProgress((s) => s.attempts)
  const completed = useProgress((s) => s.completedProjects.includes(p.id))
  const recordAttempt = useProgress((s) => s.recordAttempt)
  const recordActivity = useProgress((s) => s.recordActivity)
  const completeProject = useProgress((s) => s.completeProject)
  const suite = useSuite()
  const faultRef = useSuite()
  const faultBad = useSuite()

  const results: TestResult[] = suite.run.running || suite.run.results.length ? suite.run.results : (suiteRec?.results ?? [])
  const reportCurrent = !!suiteRec && suiteRec.docJson === docJson && !suite.run.running
  const synced = inSyncWithDesign(doc, model.build)
  const fails = model.compat.filter((c) => c.status === 'fail').length

  // Assessment criteria (all derived from records: nothing is credited for placement alone).
  const archBest = attempts.filter((a) => a.kind === 'check' && a.ref === `build:${p.id}`).reduce((b, a) => Math.max(b, a.max ? a.score / a.max : 0), 0)
  const faultSolved = attempts.some((a) => a.kind === 'troubleshoot' && a.ref === p.id && a.score >= a.max && a.max > 0)
  const curResults = reportCurrent ? suiteRec!.results : []
  const passOf = (k: TestKind) => curResults.find((r) => r.kind === k)?.status !== 'fail' && curResults.some((r) => r.kind === k)
  const protCompat = model.compat.filter((c) => c.aspect === 'protection').every((c) => c.status !== 'fail')
  const criteria: { id: string; label: string; ok: boolean; levels: LearnerLevel[]; how: string }[] = [
    { id: 'connections', label: 'Connections', ok: assembled, levels: ['beginner', 'intermediate', 'advanced'], how: 'Every assembly step verified on the connection graph, and no danger-level issue.' },
    { id: 'architecture', label: 'Architecture understanding', ok: archBest >= 2 / 3 - 1e-9, levels: ['beginner', 'intermediate', 'advanced'], how: 'At least two of the three architecture questions (Brief) answered correctly.' },
    { id: 'simulation', label: 'Simulation results', ok: assembled && (passOf('resistive') || passOf('grid')) && (p.id === 'bld-h' || passOf('waveform')), levels: ['beginner', 'intermediate', 'advanced'], how: 'The rated-load and waveform tests pass on the circuit as built (current report).' },
    { id: 'components', label: 'Component selection', ok: fails === 0 && synced, levels: ['intermediate', 'advanced'], how: 'No failed compatibility check, and the circuit carries the selected values.' },
    { id: 'protection', label: 'Protection design', ok: protCompat && passOf('protection'), levels: ['intermediate', 'advanced'], how: 'Fuse and breaker checks pass and the short-circuit test operates a protective device.' },
    { id: 'troubleshooting', label: 'Troubleshooting', ok: faultSolved, levels: ['advanced'], how: 'The troubleshooting task diagnosed correctly.' },
    { id: 'performance', label: 'Final performance', ok: reportCurrent && assembled && suitePassed(curResults), levels: ['advanced'], how: 'Every engineering test passes (current report).' },
  ]
  const required = criteria.filter((c) => c.levels.includes(level))
  const allMet = required.every((c) => c.ok)

  const tryComplete = (extra?: { results?: TestResult[]; arch?: number; fault?: boolean }) => {
    if (completed) return
    const res = extra?.results ?? curResults
    const ok = (k: string) => {
      if (k === 'architecture') return (extra?.arch ?? archBest) >= 2 / 3 - 1e-9
      if (k === 'troubleshooting') return extra?.fault ?? faultSolved
      if (k === 'simulation') return assembled && res.some((r) => (r.kind === 'resistive' || r.kind === 'grid') && r.status !== 'fail') && (p.id === 'bld-h' || res.some((r) => r.kind === 'waveform' && r.status !== 'fail'))
      if (k === 'protection') return protCompat && res.some((r) => r.kind === 'protection' && r.status !== 'fail')
      if (k === 'performance') return assembled && suitePassed(res)
      return criteria.find((c) => c.id === k)!.ok
    }
    if (required.every((c) => ok(c.id))) {
      completeProject(p.id)
      recordActivity({ activityId: `build:${p.id}`, label: `Build project ${p.letter}: ${p.title}`, level })
      flash(`Project ${p.letter} complete: recorded in your progress.`, 'ok')
    }
  }

  const applyModel = (d: DesignSpec, s: Selection) => {
    setDesign(p.id, d)
    setSelection(p.id, s)
    const next = modelOf(p, d, s)
    onCommit(syncToDesign(doc, next.build))
  }

  const runSuite = () =>
    suite.start(doc, model.ctx, undefined, (res) => {
      saveSuite(p.id, { at: Date.now(), docJson, results: res })
      tryComplete({ results: res })
    })

  const exportReport = () => {
    const md = projectReport(model, steps, results, suiteRec?.at ?? Date.now())
    const blob = new Blob([md], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `report-${p.id}.md`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-4 text-sm" data-testid="project-panel">
      <header>
        <p className="text-[11px] font-medium tracking-wide text-ink-500 uppercase">Build project {p.letter} · {p.level}</p>
        <h2 className="text-base font-semibold text-ink-100">{p.title}</h2>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <Tag tone={assembled ? 'live' : 'neutral'}>
            Assembly {stepsDone}/{steps.length}
          </Tag>
          <Tag tone={fails ? 'danger' : 'live'}>{fails ? `${fails} compatibility failures` : 'Components compatible'}</Tag>
          {completed && <Tag tone="live">Completed ✓</Tag>}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-ink-400">
          Level <LevelSelector />
        </div>
      </header>
      <div role="tablist" aria-label="Project sections" className="flex flex-wrap gap-1">
        {SUBS.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={sub === id} data-testid={`ptab-${id}`} onClick={() => setSub(id)} className={`min-h-9 rounded-md border px-2.5 text-xs font-medium ${sub === id ? 'border-signal-400 bg-signal-500/15 text-ink-100' : 'border-chassis-600 text-ink-400 hover:text-ink-100'}`}>
            {label}
          </button>
        ))}
      </div>

      {p.hazardous && (
        <SafetyNotice tone="danger">
          <strong>Simulated only.</strong> {p.safety}
        </SafetyNotice>
      )}

      {sub === 'brief' && <Brief model={model} onAnswered={(score, max) => {
        recordAttempt({ kind: 'check', ref: `build:${p.id}`, score, max, durationMs: 0, answers: {} })
        tryComplete({ arch: score / max })
      }} />}

      {sub === 'design' && <DesignTab model={model} onChange={(d) => applyModel(d, model.sel)} />}

      {sub === 'components' && (
        <ComponentsTab
          model={model}
          level={level}
          onChange={(s) => applyModel(model.design, s)}
          onSuggest={() => {
            applyModel(model.design, suggestSelection(p.id, model.design))
            flash('Compatible generic ratings applied. Check each one against a real datasheet before any real build.', 'info')
          }}
          onConfirm={() => {
            if (fails) flash('Resolve the failed checks first.', 'error')
            else {
              recordActivity({ activityId: `build:design-ok:${p.id}`, label: `Project ${p.letter}: compatible component selection`, level })
              flash('Selection confirmed: no compatibility failures.', 'ok')
            }
          }}
        />
      )}

      {sub === 'assembly' && <AssemblyTab model={model} steps={steps} level={level} synced={synced} onSync={() => onCommit(syncToDesign(doc, model.build))} onFocus={onFocus} dangerCount={dangerCount} />}

      {sub === 'tests' && (
        <section className="space-y-3">
          <p className="text-ink-400">
            Each test is a full transient simulation of <strong className="text-ink-200">your circuit as built</strong>, changed only by the test condition. The results are simulated with educational models.
          </p>
          {!assembled && <SafetyNotice>Complete and correct every assembly step first: tests on an incomplete circuit cannot earn credit.</SafetyNotice>}
          {!synced && <SafetyNotice>Your circuit does not carry the current design values. Update it on the Assembly tab.</SafetyNotice>}
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={runSuite} disabled={suite.run.running} data-testid="run-suite">
              {suite.run.running ? `Running… ${suite.run.done}/${suite.run.total || '…'}` : 'Run the engineering test suite'}
            </Button>
            {suite.run.running && <Button onClick={suite.cancel}>Cancel</Button>}
            {results.length > 0 && !suite.run.running && <Button onClick={exportReport} data-testid="export-report">Export report</Button>}
          </div>
          {suiteRec && !suite.run.running && <p className="text-xs text-ink-500">{reportCurrent ? `Report for the current circuit (${new Date(suiteRec.at).toLocaleString()}).` : 'The circuit has changed since this report: run the suite again.'}</p>}
          {suite.run.error && <p className="text-danger-400" data-testid="suite-error">{suite.run.error}</p>}
          <ul className="space-y-2" data-testid="suite-results">
            {results.map((r) => (
              <TestCard key={r.kind} r={r} />
            ))}
          </ul>
        </section>
      )}

      {sub === 'fault' && (
        <section className="space-y-3">
          <p className="text-ink-200">{p.troubleshoot.prompt}</p>
          {!assembled ? (
            <SafetyNotice>Complete the assembly first: the fault is injected into your own circuit.</SafetyNotice>
          ) : (
            <>
              <Button
                variant="primary"
                data-testid="run-fault"
                disabled={faultRef.run.running || faultBad.run.running}
                onClick={() => {
                  faultRef.start(doc, model.ctx, [p.troubleshoot.test])
                  faultBad.start(p.troubleshoot.apply(doc), model.ctx, [p.troubleshoot.test])
                }}
              >
                {faultRef.run.running || faultBad.run.running ? 'Measuring…' : `Measure: ${TEST_TITLE[p.troubleshoot.test]}`}
              </Button>
              {faultRef.run.results[0] && faultBad.run.results[0] && <FaultCompare good={faultRef.run.results[0]} bad={faultBad.run.results[0]} />}
              {faultBad.run.results[0] && (
                <Diagnosis
                  key={p.id}
                  options={p.troubleshoot.options}
                  answer={p.troubleshoot.answer}
                  explain={p.troubleshoot.explain}
                  onAnswer={(correct, choice) => {
                    recordAttempt({ kind: 'troubleshoot', ref: p.id, score: correct ? 1 : 0, max: 1, durationMs: 0, answers: { diagnosis: choice } })
                    if (correct) tryComplete({ fault: true })
                  }}
                />
              )}
            </>
          )}
        </section>
      )}

      {sub === 'assess' && (
        <section className="space-y-3">
          <p className="text-ink-400">
            Your level (<strong className="text-ink-200">{level}</strong>) sets the assembly guidance and which criteria this project requires. Change it with the level selector above.
          </p>
          <ul className="space-y-2" data-testid="assess-list">
            {criteria.map((c) => {
              const req = c.levels.includes(level)
              return (
                <li key={c.id} className={`rounded-md border p-2.5 ${req ? 'border-chassis-600' : 'border-chassis-700 opacity-60'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-ink-100">{c.label}</span>
                    {req ? <Tag tone={c.ok ? 'live' : 'caution'}>{c.ok ? 'Met' : 'Not yet'}</Tag> : <Tag>Not required at this level</Tag>}
                  </div>
                  <p className="mt-1 text-xs text-ink-400">{c.how}</p>
                </li>
              )
            })}
          </ul>
          {completed ? (
            <p className="text-live-400" data-testid="project-complete">This project is complete and recorded in your progress.</p>
          ) : allMet ? (
            <Button variant="primary" onClick={() => tryComplete()}>Record completion</Button>
          ) : (
            <p className="text-ink-400">Complete the outstanding criteria to finish this project.</p>
          )}
        </section>
      )}
    </div>
  )
}

function Brief({ model, onAnswered }: { model: ProjectModel; onAnswered: (score: number, max: number) => void }) {
  const p = model.project
  const [ans, setAns] = useState<Record<string, number>>({})
  const [checked, setChecked] = useState(false)
  const score = p.questions.filter((q) => ans[q.id] === q.answer).length
  return (
    <section className="space-y-4">
      <p className="text-ink-300">{p.summary}</p>
      <div>
        <h3 className="mb-1 text-xs font-semibold tracking-wide text-ink-400 uppercase">Learning objectives</h3>
        <ul className="list-disc space-y-1 pl-5 text-ink-300">
          {p.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-1 text-xs font-semibold tracking-wide text-ink-400 uppercase">Architecture</h3>
        <ol className="space-y-1.5">
          {p.stages.map((s, i) => (
            <li key={s.label} className="flex gap-2">
              <span className="readout mt-0.5 w-5 shrink-0 text-right text-[11px] text-ink-500">{i + 1}</span>
              <span className="min-w-0">
                <span className="font-medium text-ink-100">{s.label}</span> <span className="text-ink-400">— {s.detail}</span>
                {s.model && s.part && (
                  <Link className="ml-1 text-xs text-signal-300 hover:underline" to={`/lab-3d?model=${s.model}&part=${s.part}`}>
                    see it in 3D
                  </Link>
                )}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <h3 className="mb-1 text-xs font-semibold tracking-wide text-ink-400 uppercase">Energy paths</h3>
        <ul className="space-y-2">
          {p.paths.map((x) => (
            <li key={x.label}>
              <p className="text-xs text-ink-300">{x.label}</p>
              <p className="mt-1 flex flex-wrap items-center gap-1 text-[11px]">
                {x.route.map((r, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <Tag tone={x.tone === 'danger' ? 'danger' : x.tone === 'caution' ? 'caution' : x.tone === 'signal' ? 'signal' : 'live'}>{r}</Tag>
                    {i < x.route.length - 1 && <span className="text-ink-500">→</span>}
                  </span>
                ))}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-1 text-xs font-semibold tracking-wide text-ink-400 uppercase">Component roles (Component Library)</h3>
        <ul className="space-y-1">
          {p.roles.map((r) => (
            <li key={r.role} className="text-ink-300">
              <Link to={`/components/${r.componentId}`} className="text-signal-300 hover:underline">
                {r.role}
              </Link>{' '}
              <span className="text-ink-500">— {r.why}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-1 text-xs font-semibold tracking-wide text-ink-400 uppercase">Architecture questions</h3>
        <ol className="space-y-3" data-testid="arch-questions">
          {p.questions.map((q, qi) => (
            <li key={q.id}>
              <p className="text-ink-200">
                {qi + 1}. {q.prompt}
              </p>
              <div className="mt-1 space-y-1">
                {q.options.map((o, i) => (
                  <label key={i} className={`flex min-h-9 cursor-pointer items-start gap-2 rounded px-2 py-1 ${checked ? (i === q.answer ? 'bg-live-400/10' : ans[q.id] === i ? 'bg-danger-400/10' : '') : 'hover:bg-chassis-800'}`}>
                    <input type="radio" name={`${p.id}-${q.id}`} className="mt-1 accent-signal-500" checked={ans[q.id] === i} onChange={() => !checked && setAns({ ...ans, [q.id]: i })} disabled={checked} />
                    <span className="text-ink-300">{o}</span>
                  </label>
                ))}
              </div>
              {checked && <p className="mt-1 text-xs text-ink-400">{q.explain}</p>}
            </li>
          ))}
        </ol>
        {!checked ? (
          <Button
            className="mt-2"
            disabled={Object.keys(ans).length < p.questions.length}
            onClick={() => {
              setChecked(true)
              onAnswered(score, p.questions.length)
            }}
            data-testid="arch-check"
          >
            Check answers
          </Button>
        ) : (
          <div className="mt-2 flex items-center gap-3">
            <span className={score >= 2 ? 'text-live-400' : 'text-caution-400'}>
              {score} / {p.questions.length} correct
            </span>
            <Button variant="ghost" onClick={() => { setAns({}); setChecked(false) }}>
              Try again
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

const OPTION_LABEL: Partial<Record<keyof DesignSpec, [string, string, (v: number) => string]>> = {
  vdc: ['DC input voltage', 'V', (v) => `${v}`],
  vac: ['AC output voltage', 'V rms', (v) => `${v}`],
  f: ['Output frequency', 'Hz', (v) => `${v}`],
  power: ['Rated power', 'W', (v) => `${v}`],
  fsw: ['Switching (SPWM carrier) frequency', 'Hz', (v) => `${v}`],
  fswLink: ['High-frequency link frequency', 'Hz', (v) => `${v}`],
  pvVoc: ['PV open-circuit voltage V_oc', 'V', (v) => `${v}`],
  pvIsc: ['PV short-circuit current I_sc', 'A', (v) => `${v}`],
  mpptDuty: ['MPPT duty cycle', '%', (v) => `${Math.round(v * 100)}`],
  chargeCurrent: ['Charge current limit', 'A', (v) => `${v}`],
}

function Field({ label, children, note }: { label: string; children: ReactNode; note?: string }) {
  return (
    <label className="block">
      <span className="text-xs text-ink-400">{label}</span>
      {children}
      {note && <span className="mt-0.5 block text-[11px] text-ink-500">{note}</span>}
    </label>
  )
}
const selCls = 'mt-0.5 min-h-10 w-full rounded-md border border-chassis-600 bg-chassis-900 px-2 text-sm text-ink-100'

function DesignTab({ model, onChange }: { model: ProjectModel; onChange: (d: DesignSpec) => void }) {
  const { project: p, design: d } = model
  const groups = useMemo(() => {
    const m = new Map<string, typeof model.items>()
    for (const it of model.items) m.set(it.group, [...(m.get(it.group) ?? []), it])
    return [...m.entries()]
  }, [model])
  const topology = { 'bld-a': 'H-bridge, no transformer', 'bld-e': 'Push-pull, centre-tapped transformer', 'bld-f': 'HF push-pull link + HV H-bridge' }[p.id] ?? 'H-bridge + 50/60 Hz transformer'
  return (
    <section className="space-y-4">
      <SafetyNotice>
        <strong>Educational estimate, not a certified construction design.</strong> Formulas are standard first-order engineering estimates; values marked <em>typical assumption</em> stand in for datasheet figures of real parts.
      </SafetyNotice>
      <div className="grid grid-cols-2 gap-2" data-testid="design-form">
        {(Object.keys(p.options) as (keyof DesignSpec)[]).map((k) => {
          const meta = OPTION_LABEL[k]
          if (!meta) return null
          return (
            <Field key={k} label={`${meta[0]} (${meta[1]})`}>
              <select data-testid={`design-${k}`} className={selCls} value={d[k] as number} onChange={(e) => onChange({ ...d, [k]: Number(e.target.value) })}>
                {p.options[k]!.map((v) => (
                  <option key={v} value={v}>
                    {meta[2](v)}
                  </option>
                ))}
              </select>
            </Field>
          )
        })}
        <Field label="Load characteristics">
          <select data-testid="design-load" className={selCls} value={d.load} onChange={(e) => onChange({ ...d, load: e.target.value as DesignSpec['load'], pf: e.target.value === 'inductive' ? 0.8 : 1 })}>
            <option value="resistive">Resistive (PF 1)</option>
            <option value="inductive">Inductive (PF 0.8)</option>
          </select>
        </Field>
        <Field label="Topology / transformer / waveform" note="Set by this project’s architecture">
          <p className="mt-0.5 rounded-md border border-chassis-700 px-2 py-2 text-xs text-ink-300">
            {topology} · {d.waveform === 'sine' ? 'pure sine (SPWM)' : d.waveform === 'modified' ? 'modified sine' : 'square'}
          </p>
        </Field>
      </div>
      <div className="space-y-3" data-testid="calc-sheet">
        {groups.map(([g, items]) => (
          <div key={g}>
            <h3 className="mb-1 text-xs font-semibold tracking-wide text-ink-400 uppercase">{g}</h3>
            <ul className="space-y-1.5">
              {items.map((it) => (
                <li key={it.id}>
                  <details className="rounded-md border border-chassis-700 px-2.5 py-1.5">
                    <summary className="flex cursor-pointer items-baseline justify-between gap-2">
                      <span className="text-ink-300">{it.label}</span>
                      <span className="readout shrink-0 text-ink-100">
                        {fmt(it.value)} {it.unit}
                      </span>
                    </summary>
                    <div className="mt-1.5 space-y-1 text-xs">
                      <p className="font-mono text-signal-200">{it.formula}</p>
                      <p className="font-mono text-ink-300">{it.working}</p>
                      <p className="text-ink-400">{it.why}</p>
                      {it.kind === 'assumption' && <Tag tone="caution">Typical assumption</Tag>}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function NumSel({ label, value, list, unit, onChange, test }: { label: string; value: number; list: number[]; unit: string; onChange: (v: number) => void; test: string }) {
  const opts = list.includes(value) ? list : [...list, value].sort((a, b) => a - b)
  return (
    <Field label={`${label} (${unit})`}>
      <select data-testid={`sel-${test}`} className={selCls} value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {opts.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </Field>
  )
}

function ComponentsTab({ model, level, onChange, onSuggest, onConfirm }: { model: ProjectModel; level: LearnerLevel; onChange: (s: Selection) => void; onSuggest: () => void; onConfirm: () => void }) {
  const { sel: s, project: p, design: d } = model
  const O = SELECTION_OPTIONS
  const set = <K extends keyof Selection>(k: K, v: Selection[K]) => onChange({ ...s, [k]: v })
  const sine = d.waveform === 'sine'
  const hf = p.id === 'bld-f'
  const diodes = hf || p.id === 'bld-h'
  return (
    <section className="space-y-4">
      <p className="text-ink-400">
        Choose generic ratings for each role. Library figures are <strong className="text-ink-200">typical values</strong>; a real build must use parts whose <strong className="text-ink-200">manufacturer datasheets</strong> meet every requirement. The laboratory never invents datasheet values.
      </p>
      {level === 'beginner' && (
        <Button onClick={onSuggest} data-testid="suggest">
          Suggest compatible ratings (beginner)
        </Button>
      )}
      <div className="grid grid-cols-2 gap-2" data-testid="selection-form">
        <Field label="Main switch type">
          <select data-testid="sel-switchType" className={selCls} value={s.switchType} onChange={(e) => set('switchType', e.target.value as Selection['switchType'])}>
            <option value="mosfet">MOSFET</option>
            <option value="igbt">IGBT</option>
          </select>
        </Field>
        <NumSel label="Switch voltage rating" unit="V" value={s.switchV} list={O.switchV} onChange={(v) => set('switchV', v)} test="switchV" />
        <NumSel label="Switch current rating" unit="A" value={s.switchI} list={O.switchI} onChange={(v) => set('switchI', v)} test="switchI" />
        {s.switchType === 'mosfet' ? <NumSel label="R_DS(on)" unit="mΩ" value={s.ronMilli} list={O.ronMilli} onChange={(v) => set('ronMilli', v)} test="ronMilli" /> : <NumSel label="V_CE(sat)" unit="V" value={s.vsat} list={O.vsat} onChange={(v) => set('vsat', v)} test="vsat" />}
        <NumSel label="Switching time per edge" unit="ns" value={s.tsw} list={O.tsw} onChange={(v) => set('tsw', v)} test="tsw" />
        <NumSel label="Heat sink R_θsa" unit="°C/W" value={s.heatsink} list={O.heatsink} onChange={(v) => set('heatsink', v)} test="heatsink" />
        <Field label="Gate driver">
          <select data-testid="sel-driver" className={selCls} value={s.driver} onChange={(e) => set('driver', e.target.value as Selection['driver'])}>
            <option value="low-side">Low-side only</option>
            <option value="bootstrap">Bootstrap half-bridge</option>
            <option value="isolated">Isolated</option>
          </select>
        </Field>
        <Field label="Controller">
          <select data-testid="sel-controller" className={selCls} value={s.controller} onChange={(e) => set('controller', e.target.value as Selection['controller'])}>
            <option value="pwm-ic">PWM controller IC</option>
            <option value="mcu">Microcontroller</option>
          </select>
        </Field>
        {p.id !== 'bld-a' && (
          <>
            <Field label="Transformer core">
              <select data-testid="sel-xfmrCore" className={selCls} value={s.xfmrCore} onChange={(e) => set('xfmrCore', e.target.value as Selection['xfmrCore'])}>
                <option value="laminated">Laminated steel (50/60 Hz)</option>
                <option value="ferrite">Ferrite (kHz)</option>
              </select>
            </Field>
            <NumSel label="Transformer rating" unit="VA" value={s.xfmrVA} list={O.xfmrVA} onChange={(v) => set('xfmrVA', v)} test="xfmrVA" />
            <NumSel label="Bus capacitor" unit="µF" value={s.busC} list={O.busC} onChange={(v) => set('busC', v)} test="busC" />
            <NumSel label="Bus capacitor voltage" unit="V" value={s.busV} list={O.busV} onChange={(v) => set('busV', v)} test="busV" />
          </>
        )}
        {sine && (
          <>
            <NumSel label="Filter inductance" unit="mH" value={s.filterL} list={O.filterL} onChange={(v) => set('filterL', v)} test="filterL" />
            <NumSel label="Filter capacitance" unit="µF" value={s.filterC} list={O.filterC} onChange={(v) => set('filterC', v)} test="filterC" />
            <Field label="Filter capacitor type">
              <select data-testid="sel-filterCType" className={selCls} value={s.filterCType} onChange={(e) => set('filterCType', e.target.value as Selection['filterCType'])}>
                <option value="film-ac">AC film (polypropylene)</option>
                <option value="electrolytic">Electrolytic</option>
              </select>
            </Field>
          </>
        )}
        <NumSel label="DC input fuse" unit="A" value={s.fuse} list={O.fuse} onChange={(v) => set('fuse', v)} test="fuse" />
        {p.id !== 'bld-a' && <NumSel label="AC output breaker" unit="A" value={s.breaker} list={O.breaker} onChange={(v) => set('breaker', v)} test="breaker" />}
        {hf && (
          <>
            <Field label="HV bridge switch type">
              <select data-testid="sel-hvType" className={selCls} value={s.hvType} onChange={(e) => set('hvType', e.target.value as Selection['hvType'])}>
                <option value="igbt">IGBT</option>
                <option value="mosfet">MOSFET</option>
              </select>
            </Field>
            <NumSel label="HV switch voltage" unit="V" value={s.hvV} list={O.hvV} onChange={(v) => set('hvV', v)} test="hvV" />
            <NumSel label="HV switch current" unit="A" value={s.hvI} list={O.hvI} onChange={(v) => set('hvI', v)} test="hvI" />
            {s.hvType === 'mosfet' && <NumSel label="HV R_DS(on)" unit="mΩ" value={s.hvRonMilli} list={O.hvRonMilli} onChange={(v) => set('hvRonMilli', v)} test="hvRonMilli" />}
          </>
        )}
        {diodes && (
          <>
            <NumSel label="Rectifier diode voltage" unit="V" value={s.diodeV} list={O.diodeV} onChange={(v) => set('diodeV', v)} test="diodeV" />
            <NumSel label="Rectifier diode current" unit="A" value={s.diodeI} list={O.diodeI} onChange={(v) => set('diodeI', v)} test="diodeI" />
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-300">
        {(
          [
            ['fan', 'Cooling fan'],
            ['vsensor', 'Output voltage sensor (feedback)'],
            ['csensor', 'Current sensor (protection)'],
            ...(hf ? ([['bleeder', 'HV bus bleeder resistor']] as const) : []),
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="flex min-h-9 items-center gap-2">
            <input type="checkbox" data-testid={`sel-${k}`} className="accent-signal-500" checked={s[k]} onChange={(e) => set(k, e.target.checked)} />
            {label}
          </label>
        ))}
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-xs font-semibold tracking-wide text-ink-400 uppercase">Compatibility checks</h3>
          <Button variant="ghost" onClick={onConfirm} data-testid="confirm-selection">
            Confirm selection
          </Button>
        </div>
        <ul className="space-y-1.5" data-testid="compat-list">
          {model.compat.map((c) => (
            <li key={c.id} className={`rounded-md border p-2 ${c.status === 'fail' ? 'border-danger-400/40' : c.status === 'warn' ? 'border-caution-400/40' : 'border-chassis-700'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-200">
                  {c.role} · <span className="text-ink-400">{c.aspect}</span>
                </span>
                <Tag tone={c.status === 'fail' ? 'danger' : c.status === 'warn' ? 'caution' : 'live'}>{c.status === 'fail' ? 'Fail' : c.status === 'warn' ? 'Warning' : 'Pass'}</Tag>
              </div>
              <p className="mt-0.5 text-xs text-ink-400">
                Required {c.required} · selected {c.selected}
              </p>
              <p className="mt-0.5 text-xs text-ink-300">
                {c.explanation}{' '}
                <Link to={`/components/${c.componentId}`} className="text-signal-300 hover:underline">
                  Library
                </Link>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function AssemblyTab({ model, steps, level, synced, onSync, onFocus, dangerCount }: { model: ProjectModel; steps: StepStatus[]; level: LearnerLevel; synced: boolean; onSync: () => void; onFocus: (p: string[] | null) => void; dangerCount: number }) {
  const byId = new Map(model.build.steps.map((s) => [s.id, s]))
  const stages = [...new Set(model.build.steps.map((s) => s.stage))]
  const [reveal, setReveal] = useState(false)
  const showMissing = level !== 'advanced' || reveal
  return (
    <section className="space-y-3">
      <p className="text-ink-400">
        {level === 'beginner'
          ? 'Every part is already placed in its zone. Connect the terminals step by step; each step turns green when the connection graph shows it is correct.'
          : 'Place the kit parts in the outlined zones (drag, or tap then tap the workspace; R rotates), then connect them. Steps are verified on the connection graph, not by position.'}
      </p>
      {!synced && (
        <SafetyNotice>
          Your circuit’s parts carry older values than the current design.{' '}
          <button type="button" className="font-semibold text-signal-300 underline" onClick={onSync} data-testid="sync-design">
            Update parts to the current design
          </button>
        </SafetyNotice>
      )}
      {dangerCount > 0 && <SafetyNotice tone="danger">The circuit has {dangerCount} danger-level issue(s): see the Checks tab.</SafetyNotice>}
      {level === 'advanced' && (
        <label className="flex items-center gap-2 text-xs text-ink-400">
          <input type="checkbox" className="accent-signal-500" checked={reveal} onChange={(e) => setReveal(e.target.checked)} />
          Show what is missing
        </label>
      )}
      {stages.map((st) => (
        <div key={st}>
          <h3 className="mb-1 text-xs font-semibold tracking-wide text-ink-400 uppercase">{STAGE_LABEL[st]}</h3>
          <ol className="space-y-1.5">
            {steps
              .filter((x) => byId.get(x.id)!.stage === st)
              .map((x) => {
                const s = byId.get(x.id)!
                return (
                  <li key={x.id} data-testid={`step-${x.id}`} data-done={x.done ? '1' : '0'} className={`rounded-md border p-2 ${x.done ? 'border-live-400/40 bg-live-400/5' : 'border-chassis-700'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-ink-100">
                        {x.done ? '✓ ' : ''}
                        {s.title}
                      </span>
                      <button type="button" className="shrink-0 text-[11px] text-signal-300 hover:underline" onMouseEnter={() => onFocus(partsOfStep(s))} onMouseLeave={() => onFocus(null)} onClick={() => onFocus(partsOfStep(s))}>
                        Highlight
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-300">{s.text[level]}</p>
                    {!x.done && showMissing && x.missing.length > 0 && (
                      <ul className="mt-1 list-disc pl-4 text-[11px] text-caution-400">
                        {x.missing.map((mm) => (
                          <li key={mm}>{mm}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
          </ol>
        </div>
      ))}
    </section>
  )
}

function TestCard({ r }: { r: TestResult }) {
  return (
    <li className={`rounded-md border p-2.5 ${r.status === 'fail' ? 'border-danger-400/40' : 'border-chassis-700'}`} data-testid={`result-${r.kind}`} data-status={r.status}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-ink-100">{r.title}</span>
        <Tag tone={r.status === 'fail' ? 'danger' : r.status === 'info' ? 'signal' : 'live'}>{r.status === 'fail' ? 'Fail' : r.status === 'info' ? 'Info' : 'Pass'}</Tag>
      </div>
      <p className="mt-0.5 text-xs text-ink-400">{r.criterion}</p>
      {r.readings.length > 0 && (
        <dl className="mt-1.5 grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 text-xs">
          {r.readings.map((x) => (
            <div key={x.label} className="contents">
              <dt className="text-ink-400">{x.label}</dt>
              <dd className="readout text-right text-ink-100">{x.text ?? `${fmt(x.value)} ${x.unit}`}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-1.5 text-xs text-ink-300">{r.explanation}</p>
    </li>
  )
}

function FaultCompare({ good, bad }: { good: TestResult; bad: TestResult }) {
  return (
    <div className="overflow-x-auto" data-testid="fault-compare">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-ink-400">
            <th className="py-1 font-medium">Reading</th>
            <th className="py-1 text-right font-medium">Your build</th>
            <th className="py-1 text-right font-medium">Faulty build</th>
          </tr>
        </thead>
        <tbody>
          {bad.readings.map((x, i) => {
            const g = good.readings[i]
            return (
              <tr key={x.label} className="border-t border-chassis-700">
                <td className="py-1 text-ink-300">{x.label}</td>
                <td className="readout py-1 text-right text-ink-100">{g ? (g.text ?? `${fmt(g.value)} ${g.unit}`) : '—'}</td>
                <td className="readout py-1 text-right text-caution-400">{x.text ?? `${fmt(x.value)} ${x.unit}`}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Diagnosis({ options, answer, explain, onAnswer }: { options: string[]; answer: number; explain: string; onAnswer: (correct: boolean, choice: number) => void }) {
  const [choice, setChoice] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  return (
    <div className="space-y-2" data-testid="diagnosis">
      <h3 className="text-xs font-semibold tracking-wide text-ink-400 uppercase">Your diagnosis</h3>
      {options.map((o, i) => (
        <label key={i} className={`flex min-h-9 cursor-pointer items-start gap-2 rounded px-2 py-1 ${done ? (i === answer ? 'bg-live-400/10' : choice === i ? 'bg-danger-400/10' : '') : 'hover:bg-chassis-800'}`}>
          <input type="radio" name="diagnosis" className="mt-1 accent-signal-500" checked={choice === i} disabled={done} onChange={() => setChoice(i)} />
          <span className="text-ink-300">{o}</span>
        </label>
      ))}
      {!done ? (
        <Button
          disabled={choice === null}
          onClick={() => {
            setDone(true)
            onAnswer(choice === answer, choice!)
          }}
          data-testid="submit-diagnosis"
        >
          Submit diagnosis
        </Button>
      ) : (
        <div className="space-y-2">
          <p className={choice === answer ? 'text-live-400' : 'text-caution-400'}>{choice === answer ? 'Correct.' : 'Not correct.'}</p>
          <p className="text-xs text-ink-300">{explain}</p>
          <Button variant="ghost" onClick={() => { setDone(false); setChoice(null) }}>
            Try again
          </Button>
        </div>
      )}
    </div>
  )
}
