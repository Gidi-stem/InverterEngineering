import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { BADGES } from '../../content/badges'
import { LEVEL_LABEL, PATHWAY } from '../../content/modules'
import { snapshot, useProgress } from '../../store/progressStore'
import { moduleCompletion, summarise } from '../../store/selectors'
import type { Level } from '../../types/modules'
import { Icon } from '../../ui/Icon'
import { Meter, Panel, SafetyNotice, Tag } from '../../ui/primitives'
import { SimulationHistory } from '../progress/SimulationHistory'
import { WaveformBench } from './WaveformBench'

function StatTile({ label, value, detail, frac }: { label: string; value: string; detail: string; frac?: number }) {
  return (
    <div className="panel px-4 py-3">
      <div className="text-xs text-ink-400">{label}</div>
      <div className="readout mt-1 text-2xl text-ink-100">{value}</div>
      <div className="mt-0.5 text-xs text-ink-500">{detail}</div>
      {frac !== undefined && (
        <div className="mt-2.5">
          <Meter value={frac} label={label} />
        </div>
      )}
    </div>
  )
}

const LEVELS: Level[] = ['foundation', 'intermediate', 'advanced']

export function DashboardPage() {
  const data = useProgress(useShallow((s) => snapshot(s)))
  const visit = useProgress((s) => s.visitModule)
  useEffect(() => {
    visit('dashboard')
  }, [visit])

  const s = summarise(data)
  const pct = (v: number | null) => (v === null ? '—' : `${v.toFixed(0)}%`)
  // Next step: first live module with unfinished lessons, else the first unfinished module.
  const incomplete = (m: (typeof PATHWAY)[number]) => moduleCompletion(data, m.lessons.map((l) => l.id)) < 1
  const next = PATHWAY.find((m) => m.status === 'live' && incomplete(m)) ?? PATHWAY.find(incomplete) ?? PATHWAY[PATHWAY.length - 1]

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-6 lg:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight text-balance sm:text-[34px]">Engineering Dashboard</h1>
          <p className="mt-1 max-w-2xl text-ink-400">
            Learn how inverters turn battery and solar DC into usable AC: take them apart, build them, test them and repair them in a simulated workshop.
          </p>
        </div>
        <div className="panel flex items-center gap-4 px-4 py-3">
          <div>
            <div className="text-xs text-ink-400">Overall progress</div>
            <div className="readout text-3xl text-ink-100">{s.overallPct.toFixed(1)}%</div>
          </div>
          <Link to={next.path} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-signal-400 bg-signal-500 px-3.5 text-sm font-medium text-white hover:bg-signal-400">
            Next: {next.short} →
          </Link>
        </div>
      </div>

      <WaveformBench />

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Lessons completed" value={`${s.lessons.done}/${s.lessons.total}`} detail="across all modules" frac={s.lessons.done / s.lessons.total} />
        <StatTile label="Practical exercises" value={`${s.exercises.done}/${s.exercises.total}`} detail="Circuit Connection Laboratory" frac={s.exercises.done / s.exercises.total} />
        <StatTile label="Engineering projects" value={`${s.projects.done}/${s.projects.total}`} detail="Build workshop · from Phase 6" frac={s.projects.done / s.projects.total} />
        <StatTile label="Assessment average" value={pct(s.assessments.averagePct)} detail={s.assessments.taken ? `${s.assessments.taken} of ${s.assessments.total} attempted` : 'Assessments · from Phase 10'} />
        <StatTile label="Troubleshooting success" value={pct(s.troubleshooting.ratePct)} detail={s.troubleshooting.attempts ? `${s.troubleshooting.correct} correct of ${s.troubleshooting.attempts}` : 'Repair workshop · from Phase 9'} />
        <StatTile label="Components identified" value={`${s.components.done}/${s.components.total}`} detail={`${s.studied.done} studied in the 3D Lab`} frac={s.components.done / s.components.total} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Learning pathway — beginner to advanced">
          <ol className="flex flex-col gap-5">
            {LEVELS.map((lvl) => (
              <li key={lvl}>
                <h3 className="mb-2 text-xs font-medium text-ink-400">{LEVEL_LABEL[lvl]}</h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {PATHWAY.filter((m) => m.level === lvl).map((m) => {
                    const done = moduleCompletion(data, m.lessons.map((l) => l.id))
                    return (
                      <li key={m.id}>
                        <Link to={m.path} className="group flex h-full gap-3 rounded-md border border-chassis-700 bg-chassis-900/70 p-3 transition-colors hover:border-signal-500/60 hover:bg-chassis-800">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-chassis-800 text-signal-300 group-hover:bg-signal-500/20">
                            <Icon name={m.icon} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium text-ink-100">{m.title}</span>
                            </span>
                            <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-500">
                              {m.lessons.length} lessons · {m.lessons.reduce((t, l) => t + l.minutes, 0)} min
                              {m.status === 'live' ? <Tag tone="live">Live</Tag> : <Tag>Phase {m.phase}</Tag>}
                            </span>
                            <span className="mt-2 block">
                              <Meter value={done} tone="live" label={`${m.title} completion`} />
                            </span>
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))}
          </ol>
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel title="Simulation history" action={<Link to="/progress" className="text-xs text-signal-300 hover:text-signal-400">All records →</Link>}>
            <SimulationHistory limit={5} />
          </Panel>

          <Panel title={`Achievement badges · ${s.badges.earned}/${s.badges.total}`}>
            <ul className="grid grid-cols-2 gap-2">
              {BADGES.map((b) => {
                const got = b.earned(data)
                return (
                  <li key={b.id} className={`rounded-md border p-2.5 ${got ? 'border-live-400/40 bg-live-400/8' : 'border-chassis-700 bg-chassis-900/60'}`}>
                    <div className={`flex items-center gap-1.5 text-sm font-medium ${got ? 'text-live-400' : 'text-ink-300'}`}>
                      <span aria-hidden="true">{got ? '◆' : '◇'}</span>
                      {b.title}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-500">{b.description}</p>
                    {!got && b.availableFromPhase && (
                      <p className="mt-1">
                        <Tag>Unlocks in Phase {b.availableFromPhase}</Tag>
                      </p>
                    )}
                    <span className="sr-only">{got ? 'Earned' : 'Not yet earned'}</span>
                  </li>
                )
              })}
            </ul>
          </Panel>

          <SafetyNotice>
            <strong>Educational simulation.</strong> Mains voltages and high-voltage DC buses here are modelled. Completing this lab does not qualify you to work on live equipment. For hands-on practice, use the isolated, current-limited low-voltage pathway (≤ 24 V, fused) under qualified supervision.
          </SafetyNotice>
        </div>
      </div>
    </div>
  )
}
