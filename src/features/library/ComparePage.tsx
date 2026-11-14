import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { COMPONENTS, COMPONENT_BY_ID } from '../../content/components'
import { COMPARISONS, COMPARISON_BY_ID, type ComparisonGuide } from '../../content/components/comparisons'
import { TEST_PROCEDURES } from '../../content/components/testing'
import { INSTRUMENTS } from '../../content/instruments'
import { useProgress } from '../../store/progressStore'
import type { ElectronicComponent } from '../../types/domain'
import { Button, Panel } from '../../ui/primitives'
import { ComponentSymbol } from '../../ui/symbols/Symbol'
import { Breadcrumb, LevelSelector } from './components/shared'
import { shortName } from './logic/format'
import { SpecTable } from './components/SpecTable'
import { CATEGORY_LABEL } from './logic/search'

/** Two-question understanding check; recorded as a library activity (feeds lesson cmp-05). */
function GuideCheck({ g }: { g: ComparisonGuide }) {
  const record = useProgress((s) => s.recordActivity)
  const level = useProgress((s) => s.level)
  const [answers, setAnswers] = useState<(number | null)[]>(() => g.check.map(() => null))
  const all = answers.every((a) => a !== null)
  const score = answers.filter((a, i) => a === g.check[i].correct).length
  const answer = (qi: number, oi: number) => {
    const next = answers.map((x, i) => (i === qi ? oi : x))
    setAnswers(next)
    if (next.every((x) => x !== null)) {
      const sc = next.filter((x, i) => x === g.check[i].correct).length
      record({ activityId: `library:compare:${g.id}`, label: `Comparison check · ${g.title}`, level, score: sc, maxScore: g.check.length })
    }
  }
  return (
    <div className="flex flex-col gap-4">
      {g.check.map((q, qi) => (
        <fieldset key={q.prompt}>
          <legend className="text-sm text-ink-100">
            {qi + 1}. {q.prompt}
          </legend>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {q.options.map((o, oi) => {
              const chosen = answers[qi] === oi
              const reveal = answers[qi] !== null
              const right = oi === q.correct
              return (
                <button
                  key={o}
                  type="button"
                  disabled={reveal}
                  onClick={() => answer(qi, oi)}
                  className={`min-h-10 rounded-md border px-3 text-left text-sm ${reveal && right ? 'border-live-400 bg-live-400/12 text-ink-100' : reveal && chosen ? 'border-danger-400 bg-danger-400/12 text-ink-100' : 'border-chassis-600 bg-chassis-900 text-ink-300 hover:border-signal-400 disabled:hover:border-chassis-600'}`}
                >
                  {o}
                </button>
              )
            })}
          </div>
          {answers[qi] !== null && <p className={`mt-2 text-sm ${answers[qi] === q.correct ? 'text-live-400' : 'text-caution-400'}`}>{q.explanation}</p>}
        </fieldset>
      ))}
      {all && (
        <p role="status" className="text-sm text-ink-300">
          Score {score}/{g.check.length}: recorded in your progress.{' '}
          <button type="button" className="text-signal-300 hover:text-ink-100" onClick={() => setAnswers(g.check.map(() => null))}>
            Try again
          </button>
        </p>
      )}
    </div>
  )
}

function GuideView({ g }: { g: ComparisonGuide }) {
  return (
    <div className="flex flex-col gap-5">
      <Panel title={g.title}>
        <p className="text-sm text-ink-300">{g.summary}</p>
        <div className="scroll mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr>
                <th className="w-40 pb-2 text-left text-xs font-medium text-ink-500">Criterion</th>
                {g.sides.map((s) => (
                  <th key={s.label} className="pb-2 text-left align-bottom">
                    <Link to={`/components/${s.componentId}`} className="flex items-center gap-2 text-ink-100 hover:text-signal-300">
                      <span className="text-ink-400">
                        <ComponentSymbol symbol={COMPONENT_BY_ID[s.componentId].symbol} className="h-9 w-14" />
                      </span>
                      <span className="text-sm font-semibold">{s.label}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-chassis-700 align-top">
              {g.rows.map((r) => (
                <tr key={r.criterion}>
                  <th scope="row" className="py-2 pr-3 text-left text-xs font-medium text-ink-400">
                    {r.criterion}
                  </th>
                  {r.values.map((v, i) => (
                    <td key={i} className="py-2 pr-3 text-ink-300">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row" className="py-2 pr-3 text-left text-xs font-medium text-ink-400">
                  Choose it when
                </th>
                {g.chooseWhen.map((v, i) => (
                  <td key={i} className="py-2 pr-3 text-ink-100">
                    {v}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 rounded-md border border-chassis-700 bg-chassis-900/60 p-3 text-sm text-ink-300">
          <span className="font-semibold text-ink-100">In the lab’s inverters: </span>
          {g.inverterExample}
        </p>
        <p className="mt-2 text-xs text-ink-500">Values are qualitative or typical ranges for teaching, not ratings of any specific part.</p>
      </Panel>
      <Panel title="Check your understanding">
        <GuideCheck key={g.id} g={g} />
      </Panel>
    </div>
  )
}

function Column({ c }: { c: ElectronicComponent }) {
  const instruments = [...new Set((TEST_PROCEDURES[c.id] ?? []).flatMap((p) => p.steps.map((s) => INSTRUMENTS[s.instrument].short)))]
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Link to={`/components/${c.id}`} className="flex items-center gap-3 text-ink-100 hover:text-signal-300">
        <span className="text-ink-400">
          <ComponentSymbol symbol={c.symbol} className="h-14 w-20" />
        </span>
        <span>
          <span className="block font-semibold">{shortName(c)}</span>
          <span className="text-xs text-ink-500">{CATEGORY_LABEL[c.category]}</span>
        </span>
      </Link>
      {[
        ['Function', c.function],
        ['Operating principle', c.operatingPrinciple],
        ['Input and output', c.ioBehaviour],
      ].map(([k, v]) => (
        <div key={k}>
          <h3 className="text-xs font-semibold text-ink-400">{k}</h3>
          <p className="mt-1 text-sm text-ink-300">{v}</p>
        </div>
      ))}
      <div>
        <h3 className="text-xs font-semibold text-ink-400">Terminals</h3>
        <p className="readout mt-1 text-sm text-caution-400">{c.terminals.map((t) => t.label).join(' · ')}</p>
      </div>
      <div>
        <h3 className="mb-1 text-xs font-semibold text-ink-400">Specifications</h3>
        <SpecTable specs={c.typicalSpecs} compact />
      </div>
      <div>
        <h3 className="text-xs font-semibold text-ink-400">Typical faults</h3>
        <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-ink-300">
          {c.failureSymptoms.slice(0, 3).map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-xs font-semibold text-ink-400">Tested with</h3>
        <p className="mt-1 text-sm text-ink-300">{instruments.join(', ')}</p>
      </div>
    </div>
  )
}

/** Comparison tool: curated guides, or any two components side by side. */
export default function ComparePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const visit = useProgress((s) => s.visitModule)
  useEffect(() => {
    visit('components')
  }, [visit])
  const guide = COMPARISON_BY_ID[params.get('guide') ?? '']
  const a = COMPONENT_BY_ID[params.get('a') ?? '']
  const b = COMPONENT_BY_ID[params.get('b') ?? '']
  const [pa, setPa] = useState(a?.id ?? 'mosfet')
  const [pb, setPb] = useState(b?.id ?? 'igbt')
  const matching = a && b ? COMPARISONS.find((g) => g.sides.some((s) => s.componentId === a.id) && g.sides.some((s) => s.componentId === b.id) && a.id !== b.id) : undefined

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-6 lg:px-6">
      <Breadcrumb trail={[{ to: '/', label: 'Dashboard' }, { to: '/components', label: 'Component Library' }, { label: 'Compare' }]} />
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold leading-tight sm:text-[32px]">Compare components</h1>
          <p className="mt-1 max-w-2xl text-ink-400">Curated guides explain the classic engineering choices; the side-by-side tool compares any two entries.</p>
        </div>
        <LevelSelector />
      </header>

      <form
        className="panel mb-5 flex flex-wrap items-end gap-2 p-3"
        onSubmit={(e) => {
          e.preventDefault()
          navigate(`/components/compare?a=${pa}&b=${pb}`)
        }}
      >
        {[
          ['First component', pa, setPa, 'cmp-a'],
          ['Second component', pb, setPb, 'cmp-b'],
        ].map(([label, val, set, id]) => (
          <label key={id as string} htmlFor={id as string} className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-ink-400">
            {label as string}
            <select id={id as string} value={val as string} onChange={(e) => (set as (v: string) => void)(e.target.value)} className="min-h-10 rounded-md border border-chassis-600 bg-chassis-900 px-2 text-sm text-ink-100">
              {COMPONENTS.map((x) => (
                <option key={x.id} value={x.id}>
                  {shortName(x)}
                </option>
              ))}
            </select>
          </label>
        ))}
        <Button type="submit" variant="primary" disabled={pa === pb}>
          Compare side by side
        </Button>
      </form>

      {guide ? (
        <GuideView g={guide} />
      ) : a && b ? (
        <div className="flex flex-col gap-5">
          {matching && (
            <p className="panel p-3 text-sm text-ink-300">
              A curated guide covers this pair:{' '}
              <Link to={`/components/compare?guide=${matching.id}`} className="text-signal-300 hover:text-ink-100">
                {matching.title} →
              </Link>
            </p>
          )}
          <div className="panel grid gap-6 p-4 md:grid-cols-2">
            <Column c={a} />
            <Column c={b} />
          </div>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {COMPARISONS.map((g) => (
            <li key={g.id}>
              <Link to={`/components/compare?guide=${g.id}`} className="panel flex h-full flex-col gap-2 p-4 hover:border-signal-500/60">
                <span className="flex gap-1 text-ink-400">
                  {g.sides.map((s, i) => (
                    <ComponentSymbol key={i} symbol={COMPONENT_BY_ID[s.componentId].symbol} className="h-9 w-14" />
                  ))}
                </span>
                <span className="font-semibold text-ink-100">{g.title}</span>
                <span className="text-sm text-ink-400">{g.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
