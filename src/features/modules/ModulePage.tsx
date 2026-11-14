import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LEVEL_LABEL, MODULE_BY_ID } from '../../content/modules'
import { FUNDAMENTALS_CRITERIA, SIM_EXPERIMENT_TITLES } from '../../content/fundamentalsCriteria'
import { useProgress } from '../../store/progressStore'
import type { ModuleId } from '../../types/modules'
import { Icon } from '../../ui/Icon'
import { Panel, SafetyNotice, Tag } from '../../ui/primitives'

/**
 * Module overview: syllabus, objectives, prerequisites and safety for a laboratory section.
 * Each phase replaces the "workspace" panel of its module with the interactive laboratory.
 */
export function ModulePage({ moduleId }: { moduleId: ModuleId }) {
  const m = MODULE_BY_ID[moduleId]
  const visit = useProgress((s) => s.visitModule)
  const completed = useProgress((s) => s.completedLessons)
  const activities = useProgress((s) => s.activities)
  useEffect(() => {
    visit(moduleId)
  }, [visit, moduleId])
  const total = m.lessons.reduce((t, l) => t + l.minutes, 0)

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 lg:px-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink-500">
        <Link to="/" className="hover:text-ink-300">
          Dashboard
        </Link>{' '}
        / <span className="text-ink-300">{m.title}</span>
      </nav>

      <header className="mb-5 flex flex-wrap items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-chassis-600 bg-chassis-800 text-signal-300">
          <Icon name={m.icon} className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] font-semibold leading-tight text-balance sm:text-[32px]">{m.title}</h1>
          <p className="mt-1 max-w-3xl text-ink-400">{m.summary}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Tag tone="signal">{LEVEL_LABEL[m.level]}</Tag>
            <Tag>
              {m.lessons.length} lessons · {total} min
            </Tag>
            {m.status === 'live' ? <Tag tone="live">Interactive</Tag> : <Tag>Interactive workspace: Phase {m.phase}</Tag>}
          </div>
        </div>
      </header>

      {m.status === 'planned' && (
        <div className="mb-5 rounded-lg border border-dashed border-chassis-600 bg-chassis-950/60 px-4 py-4 text-sm text-ink-400">
          <span className="font-medium text-ink-100">The interactive workspace for this section is built in Phase {m.phase}.</span> The syllabus, objectives and safety
          requirements below are final and will be used by the workspace and its assessments. Lessons are not marked complete until their interactive content exists.
        </div>
      )}

      {moduleId === 'fundamentals' && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-signal-500/40 bg-signal-500/5 px-4 py-3 text-sm">
          <span className="text-ink-300">
            <span className="font-medium text-ink-100">Learn by simulation.</span> Each lesson is completed through guided experiments in the Circuit Connection Laboratory: build or open the circuit, run it on the oscilloscope, compare measured and calculated values, and answer the questions.
          </span>
          <Link to="/circuit-lab?ex=sim-01" className="inline-flex min-h-10 items-center rounded-md border border-signal-400 bg-signal-500 px-3.5 font-medium text-white hover:bg-signal-400">
            Open the experiments
          </Link>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="Lesson sequence">
          <ol className="flex flex-col divide-y divide-chassis-700">
            {m.lessons.map((l, i) => {
              const done = completed.includes(l.id)
              return (
                <li key={l.id} className="flex items-center gap-3 py-2.5">
                  <span className={`readout grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs ${done ? 'border-live-400 text-live-400' : 'border-chassis-600 text-ink-500'}`}>{done ? '✓' : i + 1}</span>
                  <span className="min-w-0 flex-1 text-sm text-ink-100">
                    {l.title}
                    {moduleId === 'fundamentals' && (
                      <span className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-ink-500">
                        {(FUNDAMENTALS_CRITERIA.find((c) => c.lessonId === l.id)?.experiments ?? []).map((x) => (
                          <Link key={x} to={`/circuit-lab?ex=${x}`} className={`hover:underline ${activities.some((a) => a.activityId === `sim:${x}`) ? 'text-live-400' : 'text-signal-300'}`}>
                            {SIM_EXPERIMENT_TITLES[x]}
                          </Link>
                        ))}
                      </span>
                    )}
                  </span>
                  <span className="readout whitespace-nowrap text-xs text-ink-500">{l.minutes} min</span>
                </li>
              )
            })}
          </ol>
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel title="Learning objectives">
            <ul className="flex flex-col gap-2 text-sm text-ink-300">
              {m.objectives.map((o) => (
                <li key={o} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal-400" aria-hidden="true" />
                  {o}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Prerequisites">
            {m.prerequisites.length ? (
              <ul className="flex flex-wrap gap-2">
                {m.prerequisites.map((id) => (
                  <li key={id}>
                    <Link to={MODULE_BY_ID[id].path} className="inline-flex min-h-9 items-center gap-2 rounded-md border border-chassis-600 bg-chassis-800 px-3 text-sm text-ink-300 hover:text-ink-100">
                      <Icon name={MODULE_BY_ID[id].icon} className="h-4 w-4" />
                      {MODULE_BY_ID[id].title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-400">None. This is a starting module.</p>
            )}
          </Panel>

          {m.safety?.map((s) => (
            <SafetyNotice key={s}>{s}</SafetyNotice>
          ))}
        </div>
      </div>
    </div>
  )
}
