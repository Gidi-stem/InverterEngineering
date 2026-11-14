import { useMemo, useState } from 'react'
import type { Observation, SimExperiment } from '../../../content/simExperiments'
import type { CircuitDoc } from '../../../engine/circuit/types'
import { Button, SafetyNotice, Tag } from '../../../ui/primitives'
import { eng } from '../format'
import type { ExperimentResult } from './useSimulation'

interface Props {
  experiment: SimExperiment
  doc: CircuitDoc
  completed: boolean
  onMeasure: () => Promise<ExperimentResult>
  onComplete: (score: number, max: number) => void
  onRestore: () => void
}

const LEVEL_TONE = { foundation: 'live', intermediate: 'signal', advanced: 'caution' } as const
const fmt = (v: number | null | undefined, unit: string) => (v === null || v === undefined || !Number.isFinite(v) ? '—' : unit === '' ? (Math.abs(v) <= 1.5 ? `${(v * 100).toFixed(1)} %` : v.toFixed(3)) : unit === '×' ? `${v.toFixed(1)} ×` : unit === '°C' ? `${v.toFixed(1)} °C` : eng(v, unit, 4))

/** One guided experiment: setup, live expectations, measured observations and assessment. */
export function ExperimentPanel({ experiment: e, doc, completed, onMeasure, onComplete, onRestore }: Props) {
  const expected = useMemo(() => {
    try {
      return e.expected(doc)
    } catch {
      return []
    }
  }, [e, doc])
  const [result, setResult] = useState<{ key: string; r: ExperimentResult; json: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [graded, setGraded] = useState<Record<string, boolean> | null>(null)
  const res = result && result.key === e.id ? result.r : null
  const stale = !!res && result!.json !== JSON.stringify(doc)
  const observations: Observation[] = res?.observations ?? []
  const obsPass = !!res && res.ok && observations.length > 0 && observations.every((o) => o.pass)

  const measure = async () => {
    setBusy(true)
    const r = await onMeasure()
    setResult({ key: e.id, r, json: JSON.stringify(doc) })
    setGraded(null)
    setBusy(false)
  }
  const grade = () => {
    const g: Record<string, boolean> = {}
    for (const q of e.questions) {
      const a = answers[q.id]
      if (q.kind === 'choice') g[q.id] = a === String(q.answer)
      else {
        const o = observations.find((x) => x.id === q.observation)
        const v = Number(a) * q.scale
        g[q.id] = !!o && o.measured !== null && a !== undefined && a !== '' && Number.isFinite(v) && Math.abs(v - o.measured) <= q.tol * Math.abs(o.measured)
      }
    }
    setGraded(g)
    const score = Object.values(g).filter(Boolean).length
    if (obsPass && !stale && score === e.questions.length) onComplete(score, e.questions.length)
  }
  const allRight = graded && Object.values(graded).every(Boolean)

  return (
    <div className="space-y-4" data-testid="experiment-panel">
      <div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Tag tone={LEVEL_TONE[e.level]}>{e.level}</Tag>
          <Tag tone="signal">simulation experiment</Tag>
          {completed && <Tag tone="live">Completed</Tag>}
        </div>
        <h3 className="text-base font-semibold text-ink-100">{e.title}</h3>
      </div>
      <SafetyNotice tone={/simulated only/i.test(e.safety) ? 'danger' : 'caution'}>{e.safety}</SafetyNotice>
      <section>
        <h4 className="mb-1 text-[11px] font-semibold tracking-wide text-ink-400 uppercase">Learning objectives</h4>
        <ul className="list-disc space-y-0.5 pl-5 text-sm text-ink-300">
          {e.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>
      <section>
        <h4 className="mb-1 text-[11px] font-semibold tracking-wide text-ink-400 uppercase">Circuit setup</h4>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-300">
          {e.setup.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="mt-1 text-xs text-ink-500">Press Run under the workspace to watch it on the oscilloscope. Any part can be edited; the expected values below update with your changes.</p>
        <button type="button" onClick={onRestore} className="mt-1 text-xs text-signal-300 hover:underline">
          Restore the original experiment circuit
        </button>
      </section>
      <section>
        <h4 className="mb-1 text-[11px] font-semibold tracking-wide text-ink-400 uppercase">Expected results (calculated)</h4>
        <dl className="space-y-1.5 text-xs" data-testid="expected">
          {expected.map((x) => (
            <div key={x.id} className="rounded-md bg-chassis-950 px-2 py-1.5">
              <div className="flex justify-between gap-2">
                <dt className="text-ink-300">
                  {x.label}
                  {x.approx && <span className="ml-1 text-caution-400">(approximation)</span>}
                </dt>
                <dd className="font-mono text-ink-100">{fmt(x.value, x.unit)}</dd>
              </div>
              <div className="font-mono text-[10px] text-ink-500">{x.formula}</div>
            </div>
          ))}
        </dl>
      </section>
      <section className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={measure} disabled={busy} data-testid="measure">
            {busy ? 'Simulating…' : 'Simulate and measure'}
          </Button>
          {res && <span className="text-xs text-ink-500">computed in {res.ms.toFixed(0)} ms</span>}
        </div>
        {res && !res.ok && <SafetyNotice tone="danger">{res.error}</SafetyNotice>}
        {res?.ok && (
          <div className={`rounded-md border p-2 ${stale ? 'opacity-60' : ''} ${obsPass ? 'border-live-400/40' : 'border-caution-400/40'}`} data-testid="observations">
            <h4 className="mb-1 text-xs font-semibold text-ink-100">Observations (measured from the simulation)</h4>
            {stale && <p className="mb-1 text-xs text-caution-400">The circuit changed since this measurement. Simulate again.</p>}
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-left text-ink-500">
                  <th className="font-medium" />
                  <th className="font-medium">Quantity</th>
                  <th className="text-right font-medium">Measured</th>
                  <th className="text-right font-medium">Expected</th>
                </tr>
              </thead>
              <tbody>
                {observations.map((o) => (
                  <tr key={o.id} className="border-t border-chassis-800 align-top" data-testid={`obs-${o.id}`} data-pass={o.pass}>
                    <td className={`pr-1 font-bold ${o.pass ? 'text-live-400' : 'text-danger-400'}`}>{o.pass ? '✓' : '✗'}</td>
                    <td className="text-ink-300">
                      {o.label}
                      {o.note && <div className="text-[10px] text-ink-500">{o.note}</div>}
                    </td>
                    <td className="text-right font-mono text-ink-100">{fmt(o.measured, o.unit)}</td>
                    <td className="text-right font-mono text-ink-400">
                      {o.expected !== undefined ? fmt(o.expected, o.unit) : '—'}
                      {o.tol !== undefined && <div className="text-[10px] text-ink-500">± {o.abs ? fmt(o.tol, o.unit) : `${(o.tol * 100).toFixed(0)} %`}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!obsPass && <p className="mt-1 text-xs text-caution-400">Some observations disagree with the expected behaviour. Check the circuit or restore the original.</p>}
          </div>
        )}
      </section>
      <section className="space-y-3">
        <h4 className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">Assessment questions</h4>
        {e.questions.map((q, n) => (
          <fieldset key={q.id} className="space-y-1.5" data-testid={`question-${q.id}`}>
            <legend className="text-sm text-ink-100">
              {n + 1}. {q.prompt}
            </legend>
            {q.kind === 'choice' ? (
              <div className="grid gap-1">
                {q.options.map((o, k) => (
                  <label key={o} className="flex min-h-9 items-center gap-2 rounded border border-chassis-700 px-2 text-sm text-ink-300 has-[:checked]:border-signal-400">
                    <input type="radio" name={`${e.id}-${q.id}`} value={k} checked={answers[q.id] === String(k)} onChange={() => setAnswers({ ...answers, [q.id]: String(k) })} className="accent-signal-500" />
                    {o}
                  </label>
                ))}
              </div>
            ) : (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={answers[q.id] ?? ''}
                  onChange={(ev) => setAnswers({ ...answers, [q.id]: ev.target.value })}
                  className="h-9 w-32 rounded-md border border-chassis-600 bg-chassis-950 px-2 text-right font-mono text-ink-100"
                  aria-label={q.prompt}
                />
                <span className="text-ink-400">{q.unit}</span>
                {!res && <span className="text-xs text-ink-500">(simulate first)</span>}
              </label>
            )}
            {graded && (
              <p className={`text-xs ${graded[q.id] ? 'text-live-400' : 'text-danger-400'}`}>
                {graded[q.id] ? 'Correct. ' : 'Not quite. '}
                <span className="text-ink-400">{q.explain}</span>
              </p>
            )}
          </fieldset>
        ))}
        <Button variant="primary" onClick={grade} disabled={!res} data-testid="submit-answers">
          Check answers
        </Button>
        {graded && (
          <p className={`text-sm ${allRight && obsPass && !stale ? 'text-live-400' : 'text-ink-300'}`} data-testid="experiment-outcome">
            {allRight && obsPass && !stale
              ? 'Experiment complete: recorded in your progress.'
              : `${Object.values(graded).filter(Boolean).length} of ${e.questions.length} correct.${!obsPass ? ' The observations must also agree with the expected results.' : ''}`}
          </p>
        )}
      </section>
      <section>
        <h4 className="mb-1 text-[11px] font-semibold tracking-wide text-ink-400 uppercase">Explore further</h4>
        <ul className="list-disc space-y-0.5 pl-5 text-sm text-ink-300">
          {e.explore.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
