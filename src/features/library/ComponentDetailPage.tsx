import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { COMPONENTS, COMPONENT_BY_ID } from '../../content/components'
import { guidesFor } from '../../content/components/comparisons'
import { TEST_PROCEDURES } from '../../content/components/testing'
import { useProgress } from '../../store/progressStore'
import { Panel, SafetyNotice, Tag } from '../../ui/primitives'
import { ComponentSymbol } from '../../ui/symbols/Symbol'
import { PinoutDiagram } from './components/PinoutDiagram'
import { Breadcrumb, ExplanationLevels, LevelSelector } from './components/shared'
import { shortName } from './logic/format'
import { SpecTable } from './components/SpecTable'
import { TestProcedureView } from './components/TestProcedureView'
import { CATEGORY_LABEL, partsInModels } from './logic/search'

const List = ({ items }: { items: string[] }) => (
  <ul className="flex flex-col gap-1.5 text-sm text-ink-300">
    {items.map((i) => (
      <li key={i} className="flex gap-2">
        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal-400" aria-hidden="true" />
        <span>{i}</span>
      </li>
    ))}
  </ul>
)

const SECTIONS = [
  ['explain', 'Explanation'],
  ['principle', 'Operating principle'],
  ['applications', 'Inverter applications'],
  ['pinout', 'Symbol and pinout'],
  ['specs', 'Specifications'],
  ['testing', 'Testing procedure'],
  ['faults', 'Faults and symptoms'],
  ['replacement', 'Replacement'],
  ['safety', 'Safety'],
  ['related', 'Related components'],
] as const

/** Full technical entry for one component, linked to its parts in the 3D laboratory. */
export default function ComponentDetailPage() {
  const { id = '' } = useParams()
  const c = COMPONENT_BY_ID[id]
  const inspect = useProgress((s) => s.inspectComponent)
  const visit = useProgress((s) => s.visitModule)
  const navigate = useNavigate()
  const [compareWith, setCompareWith] = useState('')
  useEffect(() => {
    if (c) inspect(c.id)
    visit('components')
  }, [c, inspect, visit])
  if (!c) return <Navigate to="/components" replace />

  const where = partsInModels(c.id)
  const guides = guidesFor(c.id)
  const idx = COMPONENTS.findIndex((x) => x.id === c.id)
  const prev = COMPONENTS[(idx + COMPONENTS.length - 1) % COMPONENTS.length]
  const next = COMPONENTS[(idx + 1) % COMPONENTS.length]

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-6 lg:px-6">
      <Breadcrumb trail={[{ to: '/', label: 'Dashboard' }, { to: '/components', label: 'Component Library' }, { label: shortName(c) }]} />
      <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-1.5">
            <Tag tone="signal">{CATEGORY_LABEL[c.category]}</Tag>
            <Tag>{c.terminals.length} terminals</Tag>
          </div>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight sm:text-[32px]">{c.name}</h1>
          <p className="mt-1 text-ink-400">{c.function}</p>
        </div>
        <LevelSelector />
      </header>

      <section aria-label="Find this component in the 3D laboratory" className="panel mb-5 flex flex-wrap items-center gap-2 p-3">
        <span className="mr-1 text-sm text-ink-300">Show in the 3D laboratory:</span>
        {where.flatMap((w) =>
          w.parts.map((p) => (
            <Link key={`${w.model.id}-${p.id}`} to={`/lab-3d?model=${w.model.id}&part=${p.id}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-chassis-600 bg-chassis-800 px-2.5 text-xs text-ink-300 hover:border-signal-400 hover:text-ink-100">
              <span className="text-ink-500">{w.model.name.split(' ')[0]}</span>
              {p.designator ?? p.label}
            </Link>
          )),
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[200px_minmax(0,1fr)_340px]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-4 flex flex-col gap-0.5 text-sm">
            {SECTIONS.map(([sid, label]) => (
              <li key={sid}>
                <a href={`#${sid}`} onClick={(e) => { e.preventDefault(); document.getElementById(sid)?.scrollIntoView({ behavior: 'smooth' }) }} className="block rounded px-2 py-1 text-ink-400 hover:bg-chassis-800 hover:text-ink-100">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-col gap-5">
          <Panel title="Explanation">
            <div id="explain" className="scroll-mt-4">
              <ExplanationLevels c={c} />
            </div>
          </Panel>
          <Panel title="Operating principle">
            <div id="principle" className="scroll-mt-4">
              <p className="text-[15px] leading-relaxed text-ink-300">{c.operatingPrinciple}</p>
              <h3 className="mt-4 mb-1.5 text-xs font-semibold text-ink-300">Input and output behaviour</h3>
              <p className="text-sm text-ink-300">{c.ioBehaviour}</p>
            </div>
          </Panel>
          <Panel title="Typical inverter applications">
            <div id="applications" className="scroll-mt-4">
              <List items={c.applications} />
              <h3 className="mt-4 mb-1.5 text-xs font-semibold text-ink-300">In this laboratory’s inverters</h3>
              <ul className="flex flex-col gap-1 text-sm text-ink-300">
                {where.map((w) => (
                  <li key={w.model.id}>
                    <span className="text-ink-100">{w.model.name}:</span> {w.parts.map((p) => p.label).join('; ')}
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
          <Panel title="Testing procedure (virtual instruments)">
            <div id="testing" className="flex scroll-mt-4 flex-col gap-6">
              {(TEST_PROCEDURES[c.id] ?? []).map((t) => (
                <TestProcedureView key={t.id} procedure={t} />
              ))}
              <p className="text-xs text-ink-500">Readings are representative examples for teaching. Interactive instruments connected to the live simulation arrive in Phase 8.</p>
            </div>
          </Panel>
          <Panel title="Common faults and symptoms">
            <div id="faults" className="scroll-mt-4">
              <List items={c.failureSymptoms} />
            </div>
          </Panel>
          <Panel title="Replacement and compatibility">
            <div id="replacement" className="scroll-mt-4">
              <List items={c.replacementNotes} />
              <p className="mt-3 text-xs text-ink-500">Match a replacement against the original part’s datasheet, not against the typical values on this page.</p>
            </div>
          </Panel>
          <Panel title="Safety precautions">
            <div id="safety" className="flex scroll-mt-4 flex-col gap-2">
              {c.safety.map((s) => (
                <SafetyNotice key={s}>{s}</SafetyNotice>
              ))}
            </div>
          </Panel>
          <Panel title="Related components">
            <div id="related" className="scroll-mt-4">
              <ul className="grid gap-2 sm:grid-cols-2">
                {c.related.map((r) => {
                  const rc = COMPONENT_BY_ID[r]
                  const guide = guides.find((g) => g.sides.some((s) => s.componentId === r))
                  return (
                    <li key={r} className="rounded-md border border-chassis-700 bg-chassis-900/60 p-3">
                      <Link to={`/components/${r}`} className="text-sm font-medium text-signal-300 hover:text-ink-100">
                        {shortName(rc)} →
                      </Link>
                      <p className="mt-1 line-clamp-2 text-xs text-ink-400">{rc.plainSummary}</p>
                      <Link to={guide ? `/components/compare?guide=${guide.id}` : `/components/compare?a=${c.id}&b=${r}`} className="mt-1 inline-block text-[11px] text-ink-500 hover:text-ink-100">
                        {guide ? `Guide: ${guide.title}` : 'Compare side by side'}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </Panel>
          <nav aria-label="Browse components" className="flex justify-between gap-2 text-sm">
            <Link to={`/components/${prev.id}`} className="text-ink-400 hover:text-ink-100">
              ← {shortName(prev)}
            </Link>
            <Link to={`/components/${next.id}`} className="text-right text-ink-400 hover:text-ink-100">
              {shortName(next)} →
            </Link>
          </nav>
        </div>

        <aside className="flex flex-col gap-5">
          <Panel title="Symbol and pinout">
            <div id="pinout" className="scroll-mt-4 text-ink-300">
              <div className="flex justify-center">
                <ComponentSymbol symbol={c.symbol} className="h-28 w-44" />
              </div>
              <div className="mt-3 rounded-md border border-chassis-700 bg-chassis-950/60 p-2">
                <PinoutDiagram component={c} />
              </div>
              <table className="mt-3 w-full text-sm">
                <tbody className="divide-y divide-chassis-700 align-top">
                  {c.terminals.map((t) => (
                    <tr key={t.id}>
                      <td className="readout py-1.5 pr-2 whitespace-nowrap text-caution-400">{t.label}</td>
                      <td className="py-1.5 text-xs text-ink-400">{t.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          <Panel title="Specifications">
            <div id="specs" className="scroll-mt-4">
              <SpecTable specs={c.typicalSpecs} />
            </div>
          </Panel>
          <Panel title="Compare">
            <div className="flex flex-col gap-2">
              {guides.map((g) => (
                <Link key={g.id} to={`/components/compare?guide=${g.id}`} className="text-sm text-signal-300 hover:text-ink-100">
                  {g.title} →
                </Link>
              ))}
              <form
                className="mt-1 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (compareWith) navigate(`/components/compare?a=${c.id}&b=${compareWith}`)
                }}
              >
                <label className="sr-only" htmlFor="compare-with">
                  Compare with
                </label>
                <select id="compare-with" value={compareWith} onChange={(e) => setCompareWith(e.target.value)} className="min-h-10 min-w-0 flex-1 rounded-md border border-chassis-600 bg-chassis-900 px-2 text-sm text-ink-100">
                  <option value="">Compare with…</option>
                  {COMPONENTS.filter((x) => x.id !== c.id).map((x) => (
                    <option key={x.id} value={x.id}>
                      {shortName(x)}
                    </option>
                  ))}
                </select>
                <button type="submit" disabled={!compareWith} className="min-h-10 rounded-md border border-signal-400 bg-signal-500 px-3 text-sm text-white disabled:opacity-40">
                  Go
                </button>
              </form>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
