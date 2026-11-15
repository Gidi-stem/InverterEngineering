import { useMemo, useState } from 'react'
import { markTask, seededOrder, type TaskMark } from '../../content/academy/logic'
import type { PracticalTask } from '../../content/academy/types'
import { Button, Tag } from '../../ui/primitives'
import { QuestionSet } from './QuestionSet'
import { Inline } from './Rich'

/**
 * Runs an academy practical assessment (sequence, hazards, procedure or calculation) and reports a
 * strict pass/fail mark with feedback. A new attempt starts from scratch.
 */
export function TaskRunner({ task, onMarked }: { task: PracticalTask; onMarked: (m: TaskMark, answers: Record<string, number | number[] | null>) => void }) {
  const [round, setRound] = useState(0)
  return (
    <div key={round} className="space-y-4" data-testid={`task-${task.id}`}>
      <p className="text-ink-300">
        <Inline text={task.brief} />
      </p>
      {task.kind === 'sequence' && <Sequence task={task} seed={round + 7} onMarked={onMarked} onRetry={() => setRound(round + 1)} />}
      {task.kind === 'hazards' && <Hazards task={task} onMarked={onMarked} onRetry={() => setRound(round + 1)} />}
      {task.kind === 'procedure' && <Procedure task={task} onMarked={onMarked} onRetry={() => setRound(round + 1)} />}
      {task.kind === 'calc' && (
        <QuestionSet
          questions={task.questions}
          mode="practice"
          testid="calc"
          allowRetry
          onSubmit={(r) => {
            const m = markTask(task, { kind: 'calc', answers: r.answers })
            onMarked(m, r.answers)
          }}
        />
      )}
    </div>
  )
}

function Result({ m, explain, onRetry }: { m: TaskMark; explain: string; onRetry: () => void }) {
  return (
    <div className={`rounded-md border p-3 text-sm ${m.passed ? 'border-live-400/40 bg-live-400/5' : 'border-danger-400/40 bg-danger-400/5'}`} data-testid="task-result" data-passed={m.passed ? '1' : '0'}>
      <p className={m.passed ? 'font-semibold text-live-400' : 'font-semibold text-danger-400'}>{m.passed ? 'Passed: practical assessment complete.' : 'Not yet passed.'}</p>
      {m.feedback.length > 0 && (
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-ink-300">
          {m.feedback.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-ink-400">
        <Inline text={explain} />
      </p>
      {!m.passed && (
        <Button className="mt-2" onClick={onRetry} data-testid="task-retry">
          New attempt
        </Button>
      )}
    </div>
  )
}

function Sequence({ task, seed, onMarked, onRetry }: { task: Extract<PracticalTask, { kind: 'sequence' }>; seed: number; onMarked: (m: TaskMark, a: Record<string, number | number[] | null>) => void; onRetry: () => void }) {
  const pool = useMemo(() => {
    const all = [...task.steps, ...task.distractors.map((d) => d.text)]
    return seededOrder(all.length, seed).map((i) => all[i])
  }, [task, seed])
  const [chosen, setChosen] = useState<string[]>([])
  const [mark, setMark] = useState<TaskMark | null>(null)
  const move = (i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= chosen.length) return
    const c = [...chosen]
    ;[c[i], c[j]] = [c[j], c[i]]
    setChosen(c)
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h3 className="mb-1 text-xs font-semibold tracking-wide text-ink-400 uppercase">Available steps</h3>
        <ul className="space-y-1.5">
          {pool.map((t, i) => {
            const used = chosen.includes(t)
            return (
              <li key={t}>
                <button type="button" disabled={used || !!mark} onClick={() => setChosen([...chosen, t])} data-testid={`pool-${i}`} data-step={t} className="w-full rounded-md border border-chassis-600 px-2.5 py-2 text-left text-sm text-ink-200 hover:border-chassis-500 disabled:opacity-40">
                  + {t}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <div>
        <h3 className="mb-1 text-xs font-semibold tracking-wide text-ink-400 uppercase">Your procedure</h3>
        {chosen.length === 0 ? (
          <p className="text-sm text-ink-500">Add steps in the order you would carry them out.</p>
        ) : (
          <ol className="space-y-1.5" data-testid="chosen">
            {chosen.map((t, i) => (
              <li key={t} className="flex items-center gap-1.5 rounded-md border border-chassis-700 px-2 py-1.5 text-sm">
                <span className="readout w-5 text-ink-500">{i + 1}</span>
                <span className="flex-1 text-ink-100">{t}</span>
                {!mark && (
                  <>
                    <button type="button" aria-label="Move up" className="min-h-8 min-w-8 text-ink-400 hover:text-ink-100" onClick={() => move(i, -1)}>
                      ↑
                    </button>
                    <button type="button" aria-label="Move down" className="min-h-8 min-w-8 text-ink-400 hover:text-ink-100" onClick={() => move(i, 1)}>
                      ↓
                    </button>
                    <button type="button" aria-label="Remove" className="min-h-8 min-w-8 text-danger-400" onClick={() => setChosen(chosen.filter((x) => x !== t))}>
                      ×
                    </button>
                  </>
                )}
              </li>
            ))}
          </ol>
        )}
        {!mark && (
          <Button
            variant="primary"
            className="mt-3"
            disabled={!chosen.length}
            data-testid="task-submit"
            onClick={() => {
              const m = markTask(task, { kind: 'sequence', chosen })
              setMark(m)
              onMarked(m, { order: chosen.map((t) => pool.indexOf(t)) })
            }}
          >
            Submit procedure
          </Button>
        )}
      </div>
      {mark && (
        <div className="md:col-span-2">
          <Result m={mark} explain={task.explain} onRetry={onRetry} />
        </div>
      )}
    </div>
  )
}

function Hazards({ task, onMarked, onRetry }: { task: Extract<PracticalTask, { kind: 'hazards' }>; onMarked: (m: TaskMark, a: Record<string, number | number[] | null>) => void; onRetry: () => void }) {
  const [sel, setSel] = useState<string[]>([])
  const [mark, setMark] = useState<TaskMark | null>(null)
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-chassis-700 bg-chassis-950 p-3 text-sm text-ink-300">
        <p className="mb-1 text-xs font-semibold tracking-wide text-ink-400 uppercase">The scene</p>
        <Inline text={task.scene} />
      </div>
      <p className="text-xs text-ink-500">Select every item that is a hazard, and only those.</p>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {task.items.map((it) => {
          const on = sel.includes(it.id)
          const r = mark ? it.hazard === on : null
          return (
            <li key={it.id}>
              <label className={`flex min-h-11 cursor-pointer items-start gap-2 rounded-md border px-2.5 py-2 text-sm ${r === null ? 'border-chassis-600' : r ? 'border-live-400/40' : 'border-danger-400/50'}`}>
                <input type="checkbox" className="mt-0.5 accent-signal-500" checked={on} disabled={!!mark} onChange={() => setSel(on ? sel.filter((x) => x !== it.id) : [...sel, it.id])} data-testid={`hz-${it.id}`} />
                <span className="text-ink-200">
                  {it.label}
                  {mark && <span className="mt-0.5 block text-xs text-ink-400">{it.why}</span>}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
      {!mark ? (
        <Button
          variant="primary"
          data-testid="task-submit"
          onClick={() => {
            const m = markTask(task, { kind: 'hazards', selected: sel })
            setMark(m)
            onMarked(m, { selected: sel.map((id) => task.items.findIndex((i) => i.id === id)) })
          }}
        >
          Submit
        </Button>
      ) : (
        <Result m={mark} explain={task.explain} onRetry={onRetry} />
      )}
    </div>
  )
}

function Procedure({ task, onMarked, onRetry }: { task: Extract<PracticalTask, { kind: 'procedure' }>; onMarked: (m: TaskMark, a: Record<string, number | number[] | null>) => void; onRetry: () => void }) {
  const [log, setLog] = useState<string[]>([])
  const [concl, setConcl] = useState<number | null>(null)
  const [mark, setMark] = useState<TaskMark | null>(null)
  const finish = (l: string[], c: number | null) => {
    const m = markTask(task, { kind: 'procedure', log: l, conclusion: c })
    setMark(m)
    onMarked(m, { log: l.map((id) => task.actions.findIndex((a) => a.id === id)), conclusion: c })
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h3 className="mb-1 text-xs font-semibold tracking-wide text-ink-400 uppercase">Actions</h3>
        <ul className="space-y-1.5">
          {task.actions.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                disabled={!!mark}
                data-testid={`act-${a.id}`}
                onClick={() => {
                  const l = [...log, a.id]
                  setLog(l)
                  if (a.unsafe) finish(l, null)
                }}
                className="w-full rounded-md border border-chassis-600 px-2.5 py-2 text-left text-sm text-ink-200 hover:border-chassis-500 disabled:opacity-50"
              >
                {a.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-1 text-xs font-semibold tracking-wide text-ink-400 uppercase">What happened</h3>
        {log.length === 0 ? (
          <p className="text-sm text-ink-500">Choose actions one at a time; each result appears here.</p>
        ) : (
          <ol className="space-y-1.5" data-testid="proc-log">
            {log.map((id, i) => {
              const a = task.actions.find((x) => x.id === id)!
              return (
                <li key={i} className="rounded-md border border-chassis-700 px-2.5 py-1.5 text-sm">
                  <span className="text-ink-100">
                    {i + 1}. {a.label}
                  </span>
                  <span className="mt-0.5 block font-mono text-xs text-signal-200">{a.result}</span>
                </li>
              )
            })}
          </ol>
        )}
        {!mark && log.length > 0 && (
          <div className="mt-3 rounded-md border border-chassis-600 p-2.5 text-sm">
            <p className="text-ink-100">{task.conclusion.prompt}</p>
            {task.conclusion.options.map((o, i) => (
              <label key={i} className="mt-1 flex min-h-10 cursor-pointer items-start gap-2">
                <input type="radio" name="concl" className="mt-1 accent-signal-500" checked={concl === i} onChange={() => setConcl(i)} data-testid={`concl-${i}`} />
                <span className="text-ink-300">{o}</span>
              </label>
            ))}
            <Button variant="primary" className="mt-2" disabled={concl === null} onClick={() => finish(log, concl)} data-testid="task-submit">
              Record conclusion
            </Button>
          </div>
        )}
      </div>
      {mark && (
        <div className="md:col-span-2">
          <Result m={mark} explain={task.explain} onRetry={onRetry} />
        </div>
      )}
    </div>
  )
}

export function TaskTag({ passed }: { passed: boolean }) {
  return <Tag tone={passed ? 'live' : 'neutral'}>{passed ? 'Passed' : 'Not yet passed'}</Tag>
}
