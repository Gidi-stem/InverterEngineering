import type { CircuitExercise } from '../../content/circuitExercises'
import type { ExerciseResult } from '../../engine/circuit/types'
import { Button, SafetyNotice, Tag } from '../../ui/primitives'

interface Props {
  exercise: CircuitExercise | null
  result: ExerciseResult | null
  /** The result no longer matches the circuit (edited since the check). */
  stale: boolean
  completed: boolean
  solutionUsed: boolean
  onCheck: () => void
  onLoadSolution: () => void
}

const LEVEL_TONE = { foundation: 'live', intermediate: 'signal', advanced: 'caution' } as const

/** RC charge/discharge curves V(t) = V_end + (V_start − V_end)·e^(−t/τ), drawn from the measured τ. */
function RcChart({ curves }: { curves: NonNullable<ExerciseResult['curves']> }) {
  const W = 300
  const H = 120
  const tMax = Math.max(...curves.map((c) => 5 * c.tauS))
  const vMax = Math.max(1e-6, ...curves.flatMap((c) => [Math.abs(c.from), Math.abs(c.to)]))
  const x = (t: number) => 30 + (t / tMax) * (W - 40)
  const y = (v: number) => H - 18 - (v / vMax) * (H - 30)
  const path = (c: (typeof curves)[number]) =>
    Array.from({ length: 61 }, (_, i) => {
      const t = (i / 60) * 5 * c.tauS
      const v = c.to + (c.from - c.to) * Math.exp(-t / c.tauS)
      return `${i ? 'L' : 'M'}${x(t).toFixed(1)} ${y(v).toFixed(1)}`
    }).join('')
  const fmt = (t: number) => (t < 1 ? `${(t * 1000).toFixed(0)} ms` : `${t.toFixed(1)} s`)
  return (
    <figure className="rounded-md bg-chassis-950 p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Capacitor voltage against time for charging and discharging">
        <line x1={30} y1={H - 18} x2={W - 10} y2={H - 18} className="stroke-chassis-600" />
        <line x1={30} y1={10} x2={30} y2={H - 18} className="stroke-chassis-600" />
        {curves.map((c, i) => (
          <path key={c.label} d={path(c)} fill="none" strokeWidth={2} className={i ? 'stroke-caution-400' : 'stroke-signal-400'} />
        ))}
        <text x={26} y={y(vMax) + 4} textAnchor="end" className="fill-ink-500 text-[9px]">
          {vMax.toFixed(1)} V
        </text>
        <text x={26} y={H - 15} textAnchor="end" className="fill-ink-500 text-[9px]">
          0
        </text>
        <text x={W - 10} y={H - 4} textAnchor="end" className="fill-ink-500 text-[9px]">
          {fmt(tMax)}
        </text>
        <text x={30} y={H - 4} className="fill-ink-500 text-[9px]">
          t = 0 (switch operated)
        </text>
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-3 text-[11px] text-ink-400">
        {curves.map((c, i) => (
          <span key={c.label} className="flex items-center gap-1">
            <span className={`h-0.5 w-4 ${i ? 'bg-caution-400' : 'bg-signal-400'}`} />
            {c.label}: τ = {fmt(c.tauS)}
          </span>
        ))}
        <span>Calculated from the measured R and C (exponential response), not a transient simulation.</span>
      </figcaption>
    </figure>
  )
}

export function ExercisePanel({ exercise, result, stale, completed, solutionUsed, onCheck, onLoadSolution }: Props) {
  if (!exercise)
    return (
      <div className="space-y-3 text-sm text-ink-300" data-testid="exercise-panel">
        <h3 className="text-base font-semibold text-ink-100">Free build</h3>
        <p>Build any circuit from the parts toolbox. The live checks analyse it as you wire it: node voltages, currents, polarity, short circuits, switching configuration and protection.</p>
        <SafetyNotice>Bench practice starts with isolated, current-limited, low-voltage circuits. Anything above 50 V DC or 25 V AC is simulated only and flagged as hazardous.</SafetyNotice>
      </div>
    )
  return (
    <div className="space-y-4" data-testid="exercise-panel">
      <div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Tag tone={LEVEL_TONE[exercise.level]}>{exercise.level}</Tag>
          {completed && <Tag tone="live">Completed</Tag>}
        </div>
        <h3 className="text-base font-semibold text-ink-100">{exercise.title}</h3>
      </div>
      {exercise.safety && <SafetyNotice tone={/simulated only/i.test(exercise.safety) ? 'danger' : 'caution'}>{exercise.safety}</SafetyNotice>}
      <section>
        <h4 className="mb-1 text-[11px] font-semibold tracking-wide text-ink-400 uppercase">Learning objectives</h4>
        <ul className="list-disc space-y-0.5 pl-5 text-sm text-ink-300">
          {exercise.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>
      <section>
        <h4 className="mb-1 text-[11px] font-semibold tracking-wide text-ink-400 uppercase">Instructions</h4>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-300">
          {exercise.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>
      <details className="rounded-md border border-chassis-700 px-3 py-2 text-sm">
        <summary className="cursor-pointer text-ink-300">Expected connections (hint)</summary>
        <ul className="mt-2 space-y-0.5 font-mono text-xs text-ink-300">
          {exercise.expected.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </details>
      <section>
        <h4 className="mb-1 text-[11px] font-semibold tracking-wide text-ink-400 uppercase">Assessment</h4>
        <p className="text-sm text-ink-300">{exercise.assessment}</p>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={onCheck} data-testid="check-exercise">
          Check exercise
        </Button>
        {result && !result.passed && (
          <Button variant="ghost" onClick={onLoadSolution} data-testid="load-solution">
            Load worked solution
          </Button>
        )}
      </div>

      {result && (
        <section className={`space-y-3 rounded-md border p-3 ${stale ? 'opacity-60' : ''} ${result.passed ? 'border-live-400/40 bg-live-400/5' : 'border-chassis-600 bg-chassis-900'}`} data-testid="exercise-result" aria-live="polite">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`text-sm font-semibold ${result.passed ? 'text-live-400' : 'text-ink-100'}`}>{result.passed ? 'Exercise passed' : 'Not yet passing'}</h4>
            <span className="font-mono text-xs text-ink-300">
              {result.score}/{result.maxScore}
            </span>
          </div>
          {stale && <p className="text-xs text-caution-400">The circuit changed since this check. Check again.</p>}
          {result.passed && solutionUsed && <p className="text-xs text-caution-400">Passed with the worked solution loaded, so no completion credit. Reset the circuit and build it yourself to complete the exercise.</p>}
          <ul className="space-y-1.5">
            {result.criteria.map((c) => (
              <li key={c.id} className="flex gap-2 text-xs" data-testid={`criterion-${c.id}`} data-passed={c.passed}>
                <span aria-hidden="true" className={`mt-px font-bold ${c.passed ? 'text-live-400' : 'text-danger-400'}`}>
                  {c.passed ? '✓' : '✗'}
                </span>
                <span>
                  <span className={c.passed ? 'text-ink-200' : 'text-ink-100'}>
                    {c.label}
                    {c.weight > 1 && <span className="text-ink-500"> ({c.weight} pts)</span>}
                  </span>
                  <span className="block font-mono text-[11px] text-ink-400">{c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          {result.blocking.length > 0 && (
            <div className="space-y-1">
              <h5 className="text-xs font-semibold text-danger-400">Unsafe condition: fix before the exercise can pass</h5>
              <ul className="list-disc pl-5 text-xs text-ink-300">
                {result.blocking.map((b) => (
                  <li key={b.id}>
                    <span className="text-ink-100">{b.title}.</span> {b.fix}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.readings.length > 0 && (
            <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 border-t border-chassis-700 pt-2 text-xs">
              {result.readings.map((r) => (
                <div key={r.label} className="contents">
                  <dt className="text-ink-400">{r.label}</dt>
                  <dd className="text-right font-mono text-ink-100">{r.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {result.curves && <RcChart curves={result.curves} />}
        </section>
      )}
    </div>
  )
}
