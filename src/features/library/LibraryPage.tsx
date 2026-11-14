import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { COMPARISONS } from '../../content/components/comparisons'
import { LIBRARY_LESSONS, lessonProgress } from '../../content/lessonCriteria'
import { INVERTER_MODELS } from '../../content/models'
import { MODULE_BY_ID } from '../../content/modules'
import { snapshot, useProgress } from '../../store/progressStore'
import type { ComponentCategory } from '../../types/domain'
import { Meter, Panel, Tag } from '../../ui/primitives'
import { ComponentSymbol } from '../../ui/symbols/Symbol'
import { Breadcrumb, LevelSelector } from './components/shared'
import { shortName } from './logic/format'
import { CATEGORY_LABEL, CATEGORY_ORDER, partsInModels, searchComponents } from './logic/search'

/** Searchable, filterable catalogue of the 24 inverter components. */
export default function LibraryPage() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const catParam = params.get('cat') ?? ''
  const cats = useMemo(() => catParam.split(',').filter(Boolean) as ComponentCategory[], [catParam])
  const modelId = params.get('model') ?? ''
  const visit = useProgress((s) => s.visitModule)
  const progress = useProgress(useShallow((s) => snapshot(s)))
  useEffect(() => {
    visit('components')
  }, [visit])

  // Read the live URL at the moment of the change, so quick successive changes never build on stale filters.
  const liveParams = () => new URLSearchParams(window.location.hash.split('?')[1] ?? '')
  const update = (patch: Record<string, string>) => {
    const next = liveParams()
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    setParams(next, { replace: true })
  }
  const toggleCat = (c: ComponentCategory) => {
    const cur = (liveParams().get('cat') ?? '').split(',').filter(Boolean)
    update({ cat: (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]).join(',') })
  }
  const hits = useMemo(() => searchComponents(query, { categories: cats, modelId: modelId || undefined }), [query, cats, modelId])
  const studied = progress.inspectedComponents
  const lessons = MODULE_BY_ID.components.lessons

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-6 lg:px-6">
      <Breadcrumb trail={[{ to: '/', label: 'Dashboard' }, { label: 'Component Library' }]} />
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-[28px] font-semibold leading-tight sm:text-[32px]">Component Library</h1>
          <p className="mt-1 text-ink-400">
            Engineering reference for every part inside the lab’s inverters: symbols, pinouts, operating principles, testing procedures, faults and replacement guidance. Every entry links to its part in the 3D laboratory.
          </p>
        </div>
        <LevelSelector />
      </header>

      <div className="panel mb-4 flex flex-col gap-3 p-3">
        <div className="flex flex-wrap gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search components</span>
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-500" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                update({ q: e.target.value })
              }}
              placeholder="Search by name, function, pin or fault, e.g. “bootstrap”, “ripple”, “gate”"
              className="min-h-11 w-full rounded-md border border-chassis-600 bg-chassis-950 pr-3 pl-9 text-base text-ink-100 placeholder:text-ink-500"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-400">
            In 3D model
            <select value={modelId} onChange={(e) => update({ model: e.target.value })} className="min-h-11 rounded-md border border-chassis-600 bg-chassis-900 px-2 text-sm text-ink-100">
              <option value="">Any</option>
              {INVERTER_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name.replace(/\s*\(.*\)/, '')}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          {CATEGORY_ORDER.map((c) => (
            <button key={c} type="button" aria-pressed={cats.includes(c)} onClick={() => toggleCat(c)} className={`min-h-8 rounded-full border px-3 text-xs ${cats.includes(c) ? 'border-signal-400 bg-signal-500/20 text-ink-100' : 'border-chassis-600 text-ink-400 hover:text-ink-100'}`}>
              {CATEGORY_LABEL[c]}
            </button>
          ))}
          {(cats.length > 0 || query || modelId) && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setParams(new URLSearchParams(), { replace: true })
              }}
              className="min-h-8 px-2 text-xs text-signal-300 hover:text-ink-100"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-label="Results">
          <p className="mb-2 text-xs text-ink-500" aria-live="polite">
            {hits.length} of 24 components
          </p>
          {hits.length === 0 ? (
            <p className="panel p-6 text-sm text-ink-400">No components match. Try a broader word, or clear the filters.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {hits.map(({ component: c, matchedIn }) => {
                const where = partsInModels(c.id)
                return (
                  <li key={c.id}>
                    <Link to={`/components/${c.id}`} className="group panel flex h-full flex-col gap-2 p-3 transition-colors hover:border-signal-500/60">
                      <div className="flex items-start gap-3">
                        <span className="grid h-14 w-20 shrink-0 place-items-center rounded-md bg-chassis-950 text-ink-300 group-hover:text-signal-300">
                          <ComponentSymbol symbol={c.symbol} className="h-12 w-18" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-ink-100">{shortName(c)}</span>
                          <span className="mt-1 flex flex-wrap gap-1">
                            <Tag>{CATEGORY_LABEL[c.category]}</Tag>
                            {studied.includes(c.id) && <Tag tone="live">Studied</Tag>}
                          </span>
                        </span>
                      </div>
                      <p className="line-clamp-3 text-sm text-ink-400">{c.plainSummary}</p>
                      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-500">
                        {where.map((w) => (
                          <span key={w.model.id}>
                            {w.model.name.split(' ')[0]}: {w.parts.length} part{w.parts.length > 1 ? 's' : ''}
                          </span>
                        ))}
                        {query && matchedIn && <span className="text-signal-300">matched in {matchedIn}</span>}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <aside className="flex flex-col gap-5">
          <Panel title="Comparison guides" action={<Link to="/components/compare" className="text-xs text-signal-300 hover:text-ink-100">Compare any two →</Link>}>
            <ul className="flex flex-col gap-1">
              {COMPARISONS.map((g) => {
                const done = progress.activities.some((a) => a.activityId === `library:compare:${g.id}`)
                return (
                  <li key={g.id}>
                    <Link to={`/components/compare?guide=${g.id}`} className="flex min-h-9 items-center justify-between gap-2 rounded px-2 text-sm text-ink-300 hover:bg-chassis-800 hover:text-ink-100">
                      {g.title}
                      {done && <span className="text-[11px] text-live-400">✓ checked</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Panel>
          <Panel title="Lessons in this library">
            <ol className="flex flex-col gap-3">
              {LIBRARY_LESSONS.map((c) => {
                const l = lessons.find((x) => x.id === c.lessonId)!
                const { done, total } = lessonProgress(progress, c)
                const complete = progress.completedLessons.includes(c.lessonId)
                return (
                  <li key={c.lessonId}>
                    <div className="flex justify-between gap-2 text-sm">
                      <span className={complete ? 'text-live-400' : 'text-ink-300'}>
                        {complete ? '✓ ' : ''}
                        {l.title}
                      </span>
                      <span className="readout text-xs text-ink-500">
                        {done}/{total}
                      </span>
                    </div>
                    <p className="text-xs text-ink-500">{c.summary}</p>
                    <div className="mt-1">
                      <Meter value={done / total} tone="live" label={`${l.title} progress`} />
                    </div>
                  </li>
                )
              })}
            </ol>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
