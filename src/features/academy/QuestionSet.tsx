import { useEffect, useMemo, useRef, useState } from 'react'
import { markAll, restoredText, seededOrder, type Answer } from '../../content/academy/logic'
import type { Question } from '../../content/academy/types'
import { Button, Tag } from '../../ui/primitives'
import { Inline } from './Rich'

export type SetMode = 'practice' | 'quiz' | 'exam'

interface Props {
  questions: Question[]
  mode: SetMode
  /** Shuffle seed (quiz and exam); the same seed reproduces the order. */
  seed?: number
  /** Called once per submission with the marked result. */
  onSubmit: (r: { score: number; max: number; answers: Record<string, Answer>; durationMs: number }) => void
  /** Practice sets may be retried at once; quizzes and exams are retried from their page. */
  allowRetry?: boolean
  testid?: string
  /** Disables the inputs. */
  locked?: boolean
  /** Examination deadline (epoch ms): the set is submitted automatically when it passes. */
  deadline?: number
  /**
   * Previously-submitted answers to restore on mount (practice sets only — a quiz or exam attempt
   * is always a fresh attempt, never resumed). When given, the set opens already marked, exactly as
   * it was left after the last submission, instead of appearing blank under a "passed" status shown
   * elsewhere on the page. "Try again" still clears it, same as before.
   */
  restore?: Record<string, Answer> | null
}

/**
 * A marked question set. Practice (knowledge checks, homework, assignments): feedback after each
 * check. Quiz: feedback after submission. Exam: no feedback until submitted, then the full review.
 */
export function QuestionSet({ questions, mode, seed, onSubmit, allowRetry = true, testid, locked, deadline, restore }: Props) {
  const order = useMemo(() => (seed !== undefined && mode !== 'practice' ? seededOrder(questions.length, seed) : questions.map((_, i) => i)), [questions, seed, mode])
  const [answers, setAnswers] = useState<Record<string, Answer>>(() => restore ?? {})
  const [text, setText] = useState<Record<string, string>>(() => (restore ? restoredText(questions, restore) : {}))
  const [result, setResult] = useState<ReturnType<typeof markAll> | null>(() => (restore ? markAll(questions, restore) : null))
  const [started] = useState(() => Date.now())
  const correct = useMemo(() => new Map(result?.results.map((r) => [r.id, r.correct])), [result])
  const answered = questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== null && !(Array.isArray(answers[q.id]) && !(answers[q.id] as number[]).length)).length
  const disabled = !!result || !!locked

  const submit = () => {
    const r = markAll(questions, answers)
    setResult(r)
    onSubmit({ score: r.score, max: r.max, answers, durationMs: Date.now() - started })
  }
  // Timed examination: submit whatever has been answered when the time is up.
  const submitRef = useRef(submit)
  const doneRef = useRef(false)
  useEffect(() => {
    submitRef.current = submit
    doneRef.current = !!result
  })
  useEffect(() => {
    if (!deadline) return
    const t = window.setInterval(() => {
      if (!doneRef.current && Date.now() >= deadline) submitRef.current()
    }, 500)
    return () => window.clearInterval(t)
  }, [deadline])

  return (
    <div className="space-y-4" data-testid={testid}>
      <ol className="space-y-4">
        {order.map((qi, n) => {
          const q = questions[qi]
          const ok = correct.get(q.id)
          return (
            <li key={q.id} className={`rounded-md border p-3 ${result ? (ok ? 'border-live-400/40' : 'border-danger-400/40') : 'border-chassis-700'}`} data-testid={`q-${q.id}`}>
              <p className="text-ink-100">
                <span className="readout mr-1.5 text-ink-500">{n + 1}.</span>
                <Inline text={q.prompt} />
              </p>
              {q.type === 'numeric' ? (
                <label className="mt-2 flex items-center gap-2 text-sm">
                  <input
                    type="text"
                    inputMode="decimal"
                    aria-label={`Answer ${n + 1}${q.unit ? ` in ${q.unit}` : ''}`}
                    disabled={disabled}
                    value={text[q.id] ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value
                      setText({ ...text, [q.id]: raw })
                      const v = Number(raw.replace(',', '.').replace(/\s/g, ''))
                      setAnswers({ ...answers, [q.id]: raw.trim() === '' || !Number.isFinite(v) ? null : v })
                    }}
                    className="min-h-10 w-36 rounded-md border border-chassis-600 bg-chassis-900 px-2 text-ink-100"
                    data-testid={`ans-${q.id}`}
                  />
                  <span className="text-ink-400">{q.unit}</span>
                </label>
              ) : (
                <div className="mt-2 space-y-1">
                  {q.options.map((o, i) => {
                    const chosen = q.type === 'mcq' ? answers[q.id] === i : Array.isArray(answers[q.id]) && (answers[q.id] as number[]).includes(i)
                    const isRight = q.type === 'mcq' ? i === q.answer : q.answers.includes(i)
                    return (
                      <label key={i} className={`flex min-h-10 cursor-pointer items-start gap-2 rounded px-2 py-1.5 ${result && mode !== 'exam' ? (isRight ? 'bg-live-400/10' : chosen ? 'bg-danger-400/10' : '') : result && isRight ? 'bg-live-400/10' : 'hover:bg-chassis-800'}`}>
                        <input
                          type={q.type === 'mcq' ? 'radio' : 'checkbox'}
                          name={`${testid}-${q.id}`}
                          className="mt-1 accent-signal-500"
                          disabled={disabled}
                          checked={chosen}
                          onChange={() => {
                            if (q.type === 'mcq') setAnswers({ ...answers, [q.id]: i })
                            else {
                              const cur = new Set(Array.isArray(answers[q.id]) ? (answers[q.id] as number[]) : [])
                              if (cur.has(i)) cur.delete(i)
                              else cur.add(i)
                              setAnswers({ ...answers, [q.id]: [...cur].sort((a, b) => a - b) })
                            }
                          }}
                          data-testid={`opt-${q.id}-${i}`}
                        />
                        <span className="text-ink-300">
                          <Inline text={o} />
                        </span>
                      </label>
                    )
                  })}
                  {q.type === 'multi' && <p className="text-[11px] text-ink-500">Select all that apply.</p>}
                </div>
              )}
              {result && (
                <div className="mt-2 text-sm">
                  <p className={ok ? 'text-live-400' : 'text-danger-400'}>
                    {ok ? 'Correct.' : 'Not correct.'}
                    {!ok && q.type === 'numeric' && ` The answer is ${q.answer} ${q.unit} (±${Math.round(q.tol * 100)} %).`}
                  </p>
                  <p className="mt-0.5 text-ink-400">
                    <Inline text={q.explain} />
                  </p>
                </div>
              )}
            </li>
          )
        })}
      </ol>
      {!result ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={submit} disabled={!!locked || answered === 0} data-testid={`${testid}-submit`}>
            {mode === 'practice' ? 'Check answers' : 'Submit'}
          </Button>
          <span className="text-xs text-ink-500">
            {answered}/{questions.length} answered
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3" data-testid={`${testid}-result`}>
          <Tag tone={result.score / result.max >= 0.7 ? 'live' : 'caution'}>
            {result.score} / {result.max} ({Math.round((result.score / result.max) * 100)} %)
          </Tag>
          {allowRetry && (
            <Button
              variant="ghost"
              onClick={() => {
                setResult(null)
                setAnswers({})
                setText({})
              }}
            >
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
