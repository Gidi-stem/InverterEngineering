import { useState } from 'react'
import { PANEL_ENTRY_BY_ID } from '../../../content/components'
import { useProgress } from '../../../store/progressStore'
import type { InverterModel, ModelPart } from '../../../types/domain'
import { ComponentSymbol } from '../../../ui/symbols/Symbol'
import { Tag } from '../../../ui/primitives'
import { useLab } from '../store/labStore'
import { Link } from 'react-router-dom'
import { TEST_PROCEDURES } from '../../../content/components/testing'
import { SpecTable } from '../../library/components/SpecTable'
import { TestProcedureView } from '../../library/components/TestProcedureView'
import { ComponentPreview } from './ComponentPreview'
import { formatOhms, resistorBands } from '../logic/resistor'

type TabId = 'overview' | 'pins' | 'testing' | 'safety'
const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'pins', label: 'Pins & I/O' },
  { id: 'testing', label: 'Faults & testing' },
  { id: 'safety', label: 'Safety' },
]

const H = ({ children }: { children: React.ReactNode }) => <h4 className="mt-4 mb-1.5 text-xs font-semibold text-ink-300 first:mt-0">{children}</h4>
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

/** The 13-field engineering information panel for a selected part. */
export function ComponentInfoPanel({ model, part }: { model: InverterModel; part: ModelPart }) {
  const c = PANEL_ENTRY_BY_ID[part.componentId]
  const level = useProgress((s) => s.level)
  const [tab, setTab] = useState<TabId>('overview')
  const select = useLab((s) => s.select)
  const hideOthers = useLab((s) => s.hideOthers)
  const showAll = useLab((s) => s.showAll)
  if (!c) return null
  const bands = part.geometry.factory === 'axial-resistor' ? resistorBands(part.geometry.ohms, part.geometry.tolerancePct) : null

  return (
    <article aria-label={`${c.name} information`}>
      <header>
        <div className="flex flex-wrap items-center gap-2">
          {part.designator && <Tag tone="signal">{part.designator}</Tag>}
          <Tag>{c.category.replace('-', ' ')}</Tag>
        </div>
        <h3 className="mt-1.5 text-lg font-semibold leading-snug text-ink-100">{c.name}</h3>
        <p className="text-sm text-ink-400">{part.label}</p>
        <Link to={`/components/${c.id}`} className="mt-1 inline-block text-xs text-signal-300 hover:text-ink-100">
          Open full entry in the Component Library →
        </Link>
      </header>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <ComponentPreview id={part.id} geometry={part.geometry} />
        <figure className="flex flex-col items-center text-ink-300">
          <ComponentSymbol symbol={c.symbol} className="h-20 w-32" />
          <figcaption className="text-[11px] text-ink-500">Schematic symbol</figcaption>
        </figure>
      </div>
      {bands && (
        <p className="mt-2 text-xs text-ink-400">
          Colour code: {bands.join(' · ')} = {formatOhms((part.geometry as { ohms: number }).ohms)} ±{(part.geometry as { tolerancePct: number }).tolerancePct}%
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button type="button" onClick={() => hideOthers(part.id)} className="min-h-8 rounded border border-chassis-600 bg-chassis-800 px-2 text-xs text-ink-300 hover:text-ink-100">
          Inspect alone
        </button>
        <button type="button" onClick={showAll} className="min-h-8 rounded border border-chassis-600 bg-chassis-800 px-2 text-xs text-ink-300 hover:text-ink-100">
          Show all parts
        </button>
      </div>

      <div role="tablist" aria-label="Information sections" className="mt-4 grid grid-cols-4 gap-1 rounded-md bg-chassis-950 p-1">
        {TABS.map((t) => (
          <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`min-h-8 rounded px-1 text-[12px] ${tab === t.id ? 'bg-chassis-700 text-ink-100' : 'text-ink-400 hover:text-ink-100'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-3">
        {tab === 'overview' && (
          <>
            {level === 'beginner' && (
              <div className="rounded-md border border-live-400/30 bg-live-400/8 p-3 text-sm text-ink-100">
                <div className="mb-1 text-xs font-semibold text-live-400">In plain words</div>
                {c.plainSummary}
              </div>
            )}
            {level === 'advanced' && (
              <div className="rounded-md border border-signal-500/40 bg-signal-500/10 p-3 text-sm text-ink-100">
                <div className="mb-1 text-xs font-semibold text-signal-300">Design note</div>
                {c.advancedNote}
              </div>
            )}
            <H>Function</H>
            <p className="text-sm text-ink-300">{c.function}</p>
            <H>Operating principle</H>
            <p className="text-sm text-ink-300">{c.operatingPrinciple}</p>
            <H>Common applications</H>
            <List items={c.applications} />
            <H>Specifications</H>
            <SpecTable specs={c.typicalSpecs} compact />
            {level !== 'beginner' && level !== 'advanced' && (
              <details className="mt-3 text-sm text-ink-300">
                <summary className="cursor-pointer text-ink-400">Plain-language summary and design note</summary>
                <p className="mt-2">{c.plainSummary}</p>
                <p className="mt-2">{c.advancedNote}</p>
              </details>
            )}
            {level === 'beginner' && (
              <details className="mt-3 text-sm text-ink-300">
                <summary className="cursor-pointer text-ink-400">Design note (advanced)</summary>
                <p className="mt-2">{c.advancedNote}</p>
              </details>
            )}
          </>
        )}
        {tab === 'pins' && (
          <>
            <H>Terminal and pin identification</H>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-500">
                  <th className="pb-1 font-medium">Pin</th>
                  <th className="pb-1 font-medium">Role</th>
                  <th className="pb-1 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chassis-700 align-top">
                {c.terminals.map((t) => (
                  <tr key={t.id}>
                    <td className="readout py-1.5 pr-2 whitespace-nowrap text-caution-400">{t.label}</td>
                    <td className="py-1.5 pr-2 text-xs whitespace-nowrap text-ink-500">{t.role}</td>
                    <td className="py-1.5 text-ink-300">{t.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-ink-500">Turn on “Connections” in the toolbar to see these pins marked on the 3D part.</p>
            <H>Input and output behaviour</H>
            <p className="text-sm text-ink-300">{c.ioBehaviour}</p>
          </>
        )}
        {tab === 'testing' && (
          <>
            <H>Common failure symptoms</H>
            <List items={c.failureSymptoms} />
            <H>Testing procedure</H>
            {(TEST_PROCEDURES[c.id] ?? []).map((t) => (
              <TestProcedureView key={t.id} procedure={t} compact />
            ))}
            <H>Replacement considerations</H>
            <List items={c.replacementNotes} />
          </>
        )}
        {tab === 'safety' && (
          <>
            <H>Safety precautions</H>
            <ul className="flex flex-col gap-2">
              {c.safety.map((s) => (
                <li key={s} className="rounded-md border border-caution-400/35 bg-caution-400/8 px-3 py-2 text-sm text-ink-300">
                  ⚠ {s}
                </li>
              ))}
            </ul>
            <H>Related components</H>
            <ul className="flex flex-wrap gap-1.5">
              {c.related.map((r) => {
                const target = model.parts.find((p) => p.componentId === r)
                const name = PANEL_ENTRY_BY_ID[r]?.name.replace(/\s*\(.*\)/, '') ?? r
                return (
                  <li key={r}>
                    {target ? (
                      <button type="button" onClick={() => select(target.id, true)} className="min-h-8 rounded border border-chassis-600 bg-chassis-800 px-2 text-xs text-signal-300 hover:text-ink-100">
                        {name} →
                      </button>
                    ) : (
                      <span className="inline-flex min-h-8 items-center rounded border border-dashed border-chassis-600 px-2 text-xs text-ink-500">{name} (not in this model)</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </article>
  )
}
