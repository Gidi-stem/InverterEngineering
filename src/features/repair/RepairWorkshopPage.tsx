import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { gateStatus } from '../../content/academy/gates'
import { MODULE_BY_ID } from '../../content/modules'
import type { RepairCategoryId } from '../../engine/repair/types'
import { RUBRIC_LABEL, RUBRIC_ORDER } from '../../engine/repair/types'
import { REPAIR_PROCEDURE_BY_ID } from '../../engine/repair/procedures'
import { REPAIR_CATEGORY_SCENARIOS, REPAIR_SCENARIO_BY_ID } from '../../engine/repair/scenarios'
import { markCheckpoint, scoreScenario, type RepairAnswer } from '../../engine/repair/scoring'
import { bestScore } from '../../content/academy/logic'
import { snapshot, useProgress } from '../../store/progressStore'
import { GateNotice } from '../academy/GateNotice'
import { Button, Panel, SafetyNotice, Tag } from '../../ui/primitives'

const CATEGORY_ORDER: RepairCategoryId[] = ['rep-01', 'rep-02', 'rep-03', 'rep-04', 'rep-05']

function Breadcrumb({ current }: { current?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-1 text-xs text-ink-500">
      <Link to="/" className="hover:text-ink-300">Dashboard</Link> <span aria-hidden="true">/</span>{' '}
      <Link to="/repair" className="hover:text-ink-300">Repair and Troubleshooting Workshop</Link>
      {current && (
        <>
          {' '}
          <span aria-hidden="true">/</span> <span className="text-ink-300">{current}</span>
        </>
      )}
    </nav>
  )
}

function CategoryMenu() {
  const visit = useProgress((s) => s.visitModule)
  const attempts = useProgress((s) => s.attempts)
  const completedLessons = useProgress((s) => s.completedLessons)
  const completeLesson = useProgress((s) => s.completeLesson)
  // `attempts` and `completedLessons` are the store's own granular selectors (stable references that
  // only change when that slice actually updates) — `progress` below is a fresh object built from
  // them for `bestScore` to read, computed during render, not depended on by the effect itself.
  const progress = snapshot(useProgress())
  useEffect(() => {
    visit('repair')
  }, [visit])

  // A category's own lesson is marked complete once every one of its scenarios has been passed.
  // Deliberately keyed on the stable `attempts`/`completedLessons` slices below, not on the freshly
  // built `progress` object (which `bestScore` reads), to avoid re-running this effect every render.
  useEffect(() => {
    for (const cat of CATEGORY_ORDER) {
      if (completedLessons.includes(cat)) continue
      const ids = REPAIR_CATEGORY_SCENARIOS[cat]
      if (ids.length && ids.every((id) => bestScore(progress, 'troubleshoot', id) >= 1)) completeLesson(cat)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts, completedLessons, completeLesson])

  const m = MODULE_BY_ID.repair
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
      <Breadcrumb />
      <h1 className="mt-2 text-xl font-semibold text-ink-100">{m.title}</h1>
      <p className="mt-2 max-w-3xl text-sm text-ink-300">{m.summary}</p>
      <SafetyNotice>
        Every repair here is virtual. Mains and high-voltage work is never performed on real equipment without qualified, in-person supervision — completing these scenarios is not a professional certification.
      </SafetyNotice>

      <div className="mt-6 flex flex-col gap-4">
        {CATEGORY_ORDER.map((cat, i) => {
          const lesson = m.lessons.find((l) => l.id === cat)!
          const ids = REPAIR_CATEGORY_SCENARIOS[cat]
          const passed = ids.filter((id) => bestScore(progress, 'troubleshoot', id) >= 1).length
          return (
            <Panel key={cat} title={`${i + 1}. ${lesson.title}`}>
              <ul className="grid gap-2 sm:grid-cols-2">
                {ids.map((id) => {
                  const s = REPAIR_SCENARIO_BY_ID[id]
                  const score = bestScore(progress, 'troubleshoot', id)
                  return (
                    <li key={id}>
                      <Link
                        to={`/repair?scenario=${id}`}
                        className="flex min-h-14 items-center justify-between gap-2 rounded-md border border-chassis-600 px-3 py-2 text-sm hover:border-signal-400/50 hover:bg-chassis-800"
                        data-testid={`repair-scenario-${id}`}
                      >
                        <span className="min-w-0">
                          <span className="block text-ink-100">{s.title}</span>
                          <span className="block text-xs text-ink-500">{s.domain}</span>
                        </span>
                        <Tag tone={score >= 1 ? 'live' : 'neutral'}>{score >= 1 ? 'Solved' : score > 0 ? 'Attempted' : 'Not started'}</Tag>
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-2 text-xs text-ink-500">{passed} of {ids.length} scenarios solved.</p>
            </Panel>
          )
        })}
      </div>
    </div>
  )
}

function CheckpointInput({
  type,
  options,
  unit,
  value,
  onChange,
}: {
  type: 'mcq' | 'multi' | 'numeric'
  options?: string[]
  unit?: string
  value: RepairAnswer
  onChange: (v: RepairAnswer) => void
}) {
  if (type === 'numeric') {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="any"
          inputMode="decimal"
          className="min-h-10 w-40 rounded-md border border-chassis-600 bg-chassis-900 px-3 text-sm text-ink-100"
          value={typeof value === 'number' ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        />
        {unit && <span className="text-sm text-ink-500">{unit}</span>}
      </div>
    )
  }
  const multi = type === 'multi'
  const selected = new Set(Array.isArray(value) ? value : value !== null && value !== undefined ? [value as number] : [])
  return (
    <div className="flex flex-col gap-1.5">
      {options!.map((opt, i) => (
        <label key={i} className="flex min-h-9 items-center gap-2 rounded-md border border-chassis-700 px-3 text-sm text-ink-200 hover:border-chassis-500">
          <input
            type={multi ? 'checkbox' : 'radio'}
            checked={selected.has(i)}
            onChange={() => {
              if (!multi) return onChange(i)
              const next = new Set(selected)
              if (next.has(i)) next.delete(i)
              else next.add(i)
              onChange(Array.from(next).sort((a, b) => a - b))
            }}
          />
          {opt}
        </label>
      ))}
    </div>
  )
}

function ScenarioWorkbench({ id }: { id: string }) {
  const s = REPAIR_SCENARIO_BY_ID[id]
  const recordAttempt = useProgress((s) => s.recordAttempt)
  const [answers, setAnswers] = useState<Record<string, RepairAnswer>>({})
  const [submitted, setSubmitted] = useState(false)
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const readings = useMemo(() => s.readings(), [s])
  const result = useMemo(() => (submitted ? scoreScenario(s.checkpoints, answers) : null), [submitted, s.checkpoints, answers])

  const submit = () => {
    const score = scoreScenario(s.checkpoints, answers)
    recordAttempt({ kind: 'troubleshoot', ref: s.id, score: score.score, max: score.max, durationMs: Date.now() - startedAt, answers })
    setSubmitted(true)
  }

  // Clears every answer and re-opens the investigation panel so the student can take another pass
  // at this same scenario — a fresh Attempt is recorded on the next submit, and the best-attempt
  // score (bestScore) is what the category menu and progress summary read, so retrying never loses
  // an earlier pass.
  const retry = () => {
    setAnswers({})
    setSubmitted(false)
    setStartedAt(Date.now())
  }

  if (!s) return null

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6">
      <Breadcrumb current={s.title} />
      <h1 className="mt-2 text-xl font-semibold text-ink-100">{s.title}</h1>
      <div className="mt-1.5 flex gap-2">
        <Tag>{s.domain}</Tag>
        <Tag>{s.category}</Tag>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Panel title="Reported problem">
            <p className="text-sm text-ink-200">{s.reportedProblem}</p>
            <dl className="mt-3 grid gap-2 text-sm">
              <div><dt className="text-ink-500">Equipment</dt><dd className="text-ink-200">{s.equipment}</dd></div>
              <div><dt className="text-ink-500">Initial symptoms</dt><dd className="text-ink-200">{s.initialSymptoms.join('; ')}</dd></div>
              <div><dt className="text-ink-500">Circuit / diagram</dt><dd className="text-ink-200">{s.diagram}</dd></div>
            </dl>
          </Panel>

          <Panel title="Available instruments">
            <p className="text-sm text-ink-300"><span className="text-ink-500">Useful here: </span>{s.usefulInstruments.join(', ')}</p>
            <p className="mt-1 text-sm text-ink-500">Not useful for this fault: {s.unhelpfulInstruments.join(', ')}</p>
          </Panel>

          <Panel title="Measurements">
            <table className="w-full text-sm">
              <tbody>
                {readings.map((r) => (
                  <tr key={r.label} className="border-b border-chassis-800 last:border-0">
                    <td className="py-1.5 pr-3 text-ink-400">{r.label}</td>
                    <td className="readout py-1.5 text-right text-ink-100">{r.value} {r.unit}</td>
                    {r.healthy !== undefined && <td className="readout py-1.5 pl-3 text-right text-ink-500">(healthy: {r.healthy} {r.unit})</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Candidate causes">
            <ul className="flex flex-wrap gap-2">
              {s.candidateCauses.map((c) => (
                <li key={c} className="rounded-full border border-chassis-700 px-2.5 py-1 text-xs text-ink-300">{c}</li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="flex flex-col gap-5">
          <Panel title="Investigation">
            <div className="flex flex-col gap-4">
              {RUBRIC_ORDER.map((rubric) => {
                const cps = s.checkpoints.filter((c) => c.rubric === rubric)
                if (!cps.length) return null
                return (
                  <div key={rubric}>
                    <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-500">{RUBRIC_LABEL[rubric]}</h3>
                    {cps.map((c) => {
                      const correct = submitted && markCheckpoint(c, answers[c.id] ?? null)
                      return (
                        <div key={c.id} className="mb-3">
                          <p className="mb-1.5 text-sm text-ink-200">{c.prompt}</p>
                          <CheckpointInput
                            type={c.type}
                            options={'options' in c ? c.options : undefined}
                            unit={'unit' in c ? c.unit : undefined}
                            value={answers[c.id] ?? null}
                            onChange={(v) => setAnswers((a) => ({ ...a, [c.id]: v }))}
                          />
                          {submitted && (
                            <p className={`mt-1 text-xs ${correct ? 'text-live-400' : 'text-signal-400'}`}>{correct ? '✓ Correct. ' : '✗ Not quite. '}{c.explain}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
              {!submitted && (
                <Button variant="primary" onClick={submit} data-testid="submit-investigation">
                  Submit investigation
                </Button>
              )}
            </div>
          </Panel>

          {result && (
            <Panel title={result.passed ? 'Confirmed and repaired' : 'Investigation scored'}>
              <Tag tone={result.passed ? 'live' : 'neutral'}>{result.score} / {result.max} checkpoints correct</Tag>
              <ul className="mt-2 flex flex-col gap-1 text-xs text-ink-400">
                {result.byRubric.map((r) => (
                  <li key={r.rubric}>{RUBRIC_LABEL[r.rubric]}: {r.correct}/{r.total}</li>
                ))}
              </ul>
              {!result.passed && (
                <p className="mt-3 text-sm text-ink-300">Some checkpoints were not answered correctly, so the repair is not yet confirmed. Review the explanations above, then try again.</p>
              )}
              <Button variant={result.passed ? 'secondary' : 'primary'} onClick={retry} className="mt-3" data-testid="retry-scenario">
                {result.passed ? 'Attempt again' : 'Try again'}
              </Button>
              {result.passed && (
                <div className="mt-3 flex flex-col gap-3 text-sm">
                  <div><h3 className="text-ink-500">Confirmed fault</h3><p className="text-ink-100">{s.confirmedFault}</p></div>
                  <div>
                    <h3 className="text-ink-500">Repair procedure</h3>
                    <ol className="mt-1 flex flex-col gap-1.5">
                      {s.repairSteps.map((r) => (
                        <li key={r.id} className="text-ink-200"><span className="font-medium text-ink-100">{REPAIR_PROCEDURE_BY_ID[r.id].title}:</span> {r.detail}</li>
                      ))}
                    </ol>
                  </div>
                  <div><h3 className="text-ink-500">Verification</h3><p className="text-ink-200">{s.verificationNote}</p></div>
                  <SafetyNotice>{s.safety}</SafetyNotice>
                </div>
              )}
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RepairWorkshopPage() {
  const [params] = useSearchParams()
  const progress = snapshot(useProgress())
  const gate = gateStatus(progress, 'repair')
  const scenarioId = params.get('scenario')

  if (!gate.open) return <GateNotice status={gate} activity="The Repair and Troubleshooting Workshop" />
  if (scenarioId && REPAIR_SCENARIO_BY_ID[scenarioId]) return <ScenarioWorkbench key={scenarioId} id={scenarioId} />
  return <CategoryMenu />
}
