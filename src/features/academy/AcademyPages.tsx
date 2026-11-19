import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { bestScore, competencyRecord, courseComplete, courseUnlock, evidenceMet, examStatus, lessonDone, LESSON_CHECK_PASS, moduleStatus, practicalCredited, quizAvailability } from '../../content/academy/logic'
import { SHELL_BY_ID, SHELL_COURSES, SHELL_VIRTUAL_COMPETENCY_NOTE } from '../../content/academy/shells'
import { useCourse, type CourseLoad } from '../../content/academy/useCourse'
import { TaskRunner } from './TaskRunner'
import { routeOf } from '../../content/academy/routes'
import { lessonAuthored, type AcademyLesson, type AcademyModule, type Course, type Level, type Stage } from '../../content/academy/types'
import { useProgress } from '../../store/progressStore'
import type { ProgressData } from '../../types/progress'
import { Button, Meter, Panel, SafetyNotice, Tag } from '../../ui/primitives'
import { snapshot } from '../../store/progressStore'
import { Demo } from './Demos'
import { Diagram } from './diagrams'
import { QuestionSet } from './QuestionSet'
import { Inline, Rich } from './Rich'

/**
 * Every page here keyed by `:courseId` loads that one course's full content on demand via
 * `useCourse` (`../../content/academy/courseLoader`) — its own dynamic import per authored course —
 * so opening F1 never fetches F2/S1/S2, and vice versa. `SHELL_*` is the lightweight catalogue
 * metadata (ids, titles, prerequisites, structure) used for the course listing and for naming
 * *other* courses in cross-references (a locked prerequisite's title, a recommended course's title)
 * without loading their content.
 */
function CourseLoading() {
  return (
    <Page>
      <p className="animate-pulse text-sm text-ink-400" data-testid="course-loading" role="status">
        Loading course…
      </p>
    </Page>
  )
}

function CourseLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <Page>
      <div className="panel space-y-2 p-4" role="alert" data-testid="course-load-error">
        <p className="font-semibold text-danger-400">This course couldn't be loaded.</p>
        <p className="text-sm text-ink-400">Check your connection and try again.</p>
        <Button variant="primary" onClick={onRetry}>
          Retry
        </Button>
      </div>
    </Page>
  )
}

/** Renders the shared loading/not-found/error states of a `useCourse` result; returns `null` once
 * the course is `ready`, so the caller continues with `course`. */
function CourseLoadFallback({ load }: { load: CourseLoad & { retry: () => void } }) {
  if (load.status === 'loading') return <CourseLoading />
  if (load.status === 'notfound') return <Navigate to="/academy" replace />
  if (load.status === 'error') return <CourseLoadError onRetry={load.retry} />
  return null
}

/** Learning Academy: catalogue, courses, lessons, quizzes, assignments, examinations and the competency record. */
const STAGE: Record<Stage, string> = { foundation: 'Foundation (beginner)', practitioner: 'Practitioner (intermediate)', specialist: 'Specialist (advanced)' }
const LEVEL_TONE: Record<Level, 'live' | 'signal' | 'caution'> = { beginner: 'live', intermediate: 'signal', advanced: 'caution' }

function useData(): ProgressData {
  return snapshot(useProgress())
}

function Crumbs({ items }: { items: [string, string | null][] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-1 text-xs text-ink-500">
      {items.map(([label, to], i) => (
        <span key={i}>
          {i > 0 && ' / '}
          {to ? (
            <Link to={to} className="hover:text-ink-300">
              {label}
            </Link>
          ) : (
            <span className="text-ink-300">{label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

const Page = ({ children }: { children: ReactNode }) => <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6">{children}</div>

const ScopeNote = () => (
  <SafetyNotice>
    <strong>Educational programme.</strong> The academy develops knowledge and virtual practical skill. Simulated practice is not a qualification: work on real batteries, inverters, PV arrays and mains installations requires supervised physical training and the qualifications required where you live.
  </SafetyNotice>
)

/** Lessons, quizzes, assignments, practicals and the examination of a locked course stay closed. */
function CourseLock({ c, p }: { c: Course; p: ProgressData }) {
  const u = courseUnlock(p, c)
  if (u.unlocked) return null
  return (
    <div className="panel my-4 space-y-2 p-4" role="alert" data-testid="course-locked">
      <p className="font-semibold text-ink-100">This course opens when its prerequisite courses are passed.</p>
      <ul className="space-y-1">
        {u.missing.map((id) => (
          <li key={id}>
            <Link to={`/academy/${id}`} className="text-signal-300 hover:underline">
              {id} {SHELL_BY_ID[id].title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function courseProgress(p: ProgressData, c: Course) {
  const lessons = c.modules.flatMap((m) => m.lessons).filter(lessonAuthored)
  const done = lessons.filter((l) => lessonDone(p, l)).length
  return { done, total: lessons.length }
}

function Catalogue() {
  const p = useData()
  const visit = useProgress((s) => s.visitModule)
  useEffect(() => {
    visit('academy')
  }, [visit])
  return (
    <Page>
      <Crumbs items={[['Dashboard', '/'], ['Learning Academy', null]]} />
      <h1 className="text-[26px] font-semibold">Learning Academy</h1>
      <p className="mt-1 max-w-3xl text-ink-400">
        A structured programme from complete beginner to advanced inverter engineering. It has fifteen courses in three stages. Each course is made up of modules and lessons. Every lesson has notes, worked examples, demonstrations, laboratory activities, a knowledge check and homework. Every module has a quiz, an assignment and practical laboratory tasks, and every course ends with an examination. Your attempts and results build a competency record.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link to="/academy/record" className="inline-flex min-h-10 items-center rounded-md border border-chassis-600 bg-chassis-800 px-3.5 text-sm text-ink-100 hover:bg-chassis-700" data-testid="open-record">
          Competency record
        </Link>
      </div>
      <div className="mt-4">
        <ScopeNote />
      </div>
      {(['foundation', 'practitioner', 'specialist'] as Stage[]).map((st) => (
        <section key={st} className="mt-6">
          <h2 className="mb-2 text-sm font-semibold tracking-wide text-ink-300 uppercase">{STAGE[st]}</h2>
          <ul className="grid gap-3 sm:grid-cols-2" data-testid={`stage-${st}`}>
            {SHELL_COURSES.filter((c) => c.stage === st).map((c) => {
              const pr = courseProgress(p, c)
              const done = courseComplete(p, c)
              const enrolled = p.enrolments.some((e) => e.courseId === c.id)
              return (
                <li key={c.id}>
                  <Link to={`/academy/${c.id}`} className="block h-full" data-testid={`course-${c.id}`}>
                    <Panel className="h-full transition-colors hover:border-chassis-500">
                      <div className="flex items-start justify-between gap-2">
                        <span className="readout text-lg font-semibold text-signal-300">{c.id}</span>
                        <div className="flex flex-wrap justify-end gap-1">
                          <Tag tone={LEVEL_TONE[c.level]}>{c.level}</Tag>
                          {c.status === 'published' ? <Tag tone={done ? 'live' : enrolled ? 'signal' : 'neutral'}>{done ? 'Passed' : enrolled ? 'Enrolled' : 'Open'}</Tag> : <Tag>Scheduled · Phase {c.phase}</Tag>}
                        </div>
                      </div>
                      <h3 className="mt-1 font-semibold text-ink-100">{c.title}</h3>
                      <p className="mt-1 line-clamp-3 text-xs text-ink-400">{c.summary}</p>
                      <p className="mt-2 text-[11px] text-ink-500">
                        {c.modules.length} modules · {c.modules.reduce((n, m) => n + m.lessons.length, 0)} lessons{c.prerequisites.length ? ` · prerequisites ${c.prerequisites.join(', ')}` : ''}
                      </p>
                      {c.status === 'published' && (
                        <div className="mt-2">
                          <Meter value={pr.total ? pr.done / pr.total : 0} label={`${c.id} lessons complete`} />
                        </div>
                      )}
                    </Panel>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </Page>
  )
}

function CoursePage() {
  const { courseId = '' } = useParams()
  const load = useCourse(courseId)
  const p = useData()
  const enrol = useProgress((s) => s.enrol)
  if (load.status !== 'ready') return <CourseLoadFallback load={load} />
  const c = load.course
  const unlock = courseUnlock(p, c)
  const enrolled = p.enrolments.some((e) => e.courseId === c.id)
  const ex = examStatus(p, c)
  return (
    <Page>
      <Crumbs items={[['Learning Academy', '/academy'], [`${c.id} ${c.title}`, null]]} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold">
            <span className="text-signal-300">{c.id}</span> {c.title}
          </h1>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Tag tone={LEVEL_TONE[c.level]}>{c.level}</Tag>
            <Tag>{STAGE[c.stage]}</Tag>
            <Tag>Competency {c.competency}</Tag>
            {courseComplete(p, c) && <Tag tone="live">Passed</Tag>}
          </div>
        </div>
        {c.status === 'published' && (enrolled ? <Tag tone="signal">Enrolled</Tag> : <Button variant="primary" onClick={() => enrol(c.id)} disabled={!unlock.unlocked} data-testid="enrol">Enrol</Button>)}
      </div>
      <p className="mt-2 max-w-3xl text-ink-300">{c.summary}</p>
      {(unlock.missing.length > 0 || unlock.recommended.length > 0) && (
        <div className="mt-3 space-y-1 text-sm">
          {unlock.missing.length > 0 && (
            <p className="text-caution-400">
              Locked: pass {unlock.missing.map((id) => <Link key={id} to={`/academy/${id}`} className="mx-0.5 underline">{id}</Link>)} first.
            </p>
          )}
          {unlock.recommended.length > 0 && (
            <p className="text-ink-400" data-testid="recommended">
              Recommended prior study (scheduled courses; not required until published):{' '}
              {unlock.recommended.map((id) => (
                <Link key={id} to={`/academy/${id}`} className="mx-0.5 text-signal-300 hover:underline">
                  {id} {SHELL_BY_ID[id].title}
                </Link>
              ))}
              . Until then, the laboratory tools listed in each lesson cover the essentials.
            </p>
          )}
        </div>
      )}
      {c.status === 'published' && <CourseLock c={c} p={p} />}
      {c.status === 'scheduled' ? (
        <div className="mt-5 space-y-3">
          <SafetyNotice>
            This course is <strong>scheduled for Phase {c.phase}</strong>. Its syllabus is shown below. Lessons are published only when they are fully written: there are no placeholder pages.
          </SafetyNotice>
          {c.modules.map((m, i) => (
            <Panel key={m.id} title={`Module ${i + 1}: ${m.title}`}>
              <ol className="list-decimal space-y-0.5 pl-5 text-sm text-ink-400">
                {m.lessons.map((l) => (
                  <li key={l.id}>{l.title}</li>
                ))}
              </ol>
            </Panel>
          ))}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {c.modules.map((m, i) => (
            <ModuleCard key={m.id} c={c} m={m} n={i + 1} p={p} />
          ))}
          {c.exam && (
            <Panel title="Formal examination">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="space-y-0.5 text-ink-400">
                  <p>
                    {c.exam.questions.length} questions · {c.exam.minutes} minutes · pass {Math.round(c.exam.pass * 100)} % · {c.exam.attempts} attempts · {c.exam.cooldownHours} h between attempts
                  </p>
                  <p>{ex.passed ? `Passed (best ${Math.round(ex.best * 100)} %).` : ex.attempts ? `Best ${Math.round(ex.best * 100)} %, ${ex.remaining} attempt(s) left.` : 'Opens when every module is complete.'}</p>
                </div>
                <Link to={`/academy/${c.id}/exam`} className={`inline-flex min-h-10 items-center rounded-md border px-3.5 ${ex.eligible ? 'border-signal-400 bg-signal-500 text-white' : 'border-chassis-600 text-ink-400'}`} data-testid="open-exam">
                  {ex.eligible ? 'Go to the examination' : 'Requirements'}
                </Link>
              </div>
            </Panel>
          )}
        </div>
      )}
    </Page>
  )
}

function ModuleCard({ c, m, n, p }: { c: Course; m: AcademyModule; n: number; p: ProgressData }) {
  const st = moduleStatus(p, m)
  return (
    <Panel title={`Module ${n}: ${m.title}`} action={st.complete ? <Tag tone="live">Complete</Tag> : <Tag>{st.lessonsDone}/{st.lessons} lessons</Tag>}>
      <p className="text-sm text-ink-400">{m.summary}</p>
      <ol className="mt-3 space-y-1" data-testid={`module-${m.id}`}>
        {m.lessons.map((l) => {
          const done = lessonDone(p, l)
          return (
            <li key={l.id}>
              <Link to={`/academy/${c.id}/${l.id}`} className="flex min-h-10 items-center justify-between gap-2 rounded px-2 hover:bg-chassis-800" data-testid={`lesson-link-${l.id}`}>
                <span className="text-ink-200">
                  <span className="readout mr-2 text-[11px] text-ink-500">{l.id.split('.').slice(1).join('.')}</span>
                  {l.title}
                </span>
                <span className="shrink-0 text-xs text-ink-500">{done ? <span className="text-live-400">✓ passed</span> : `${l.minutes} min`}</span>
              </Link>
            </li>
          )
        })}
      </ol>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {m.quiz && (
          <Link to={`/academy/${c.id}/quiz/${m.id}`} className="rounded-md border border-chassis-600 p-2.5 text-sm hover:border-chassis-500" data-testid={`quiz-link-${m.id}`}>
            <p className="font-medium text-ink-100">Module quiz</p>
            <p className="text-xs text-ink-400">{st.quizAttempts ? `Best ${Math.round(st.quizBest * 100)} % · ${st.quizPassed ? 'passed' : `pass ${Math.round(m.quiz.pass * 100)} %`}` : `${m.quiz.questions.length} questions · pass ${Math.round(m.quiz.pass * 100)} %`}</p>
          </Link>
        )}
        {m.assignment && (
          <Link to={`/academy/${c.id}/assignment/${m.id}`} className="rounded-md border border-chassis-600 p-2.5 text-sm hover:border-chassis-500">
            <p className="font-medium text-ink-100">Assignment</p>
            <p className="text-xs text-ink-400">{bestScore(p, 'assignment', m.assignment.id) ? `Best ${Math.round(st.assignmentBest * 100)} %` : m.assignment.title.replace(/^Module assignment: /, '')}</p>
          </Link>
        )}
        <div className="rounded-md border border-chassis-600 p-2.5 text-sm">
          <p className="font-medium text-ink-100">Practical tasks</p>
          <ul className="mt-1 space-y-1 text-xs">
            {m.practicals.map((x) => {
              const met = evidenceMet(p, x.evidence)
              const credited = practicalCredited(p, m, x)
              return (
                <li key={x.id}>
                  <Link to={x.task ? `/academy/${c.id}/practical/${x.task.id}` : routeOf(x.link!)} className="text-signal-300 hover:underline" data-testid={`practical-link-${x.id}`}>
                    {x.title}
                  </Link>{' '}
                  <span className={credited ? 'text-live-400' : met ? 'text-caution-400' : 'text-ink-500'}>{credited ? '✓' : met ? '(done; credited after the quiz)' : ''}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </Panel>
  )
}

const SECTIONS = ['Learning objectives', 'Introduction', 'Lecture notes', 'Technical explanation', 'Diagrams', 'Formulas', 'Worked examples', 'Engineering applications', 'Common mistakes and misconceptions', 'Interactive demonstration', 'Laboratory activities', 'Knowledge check', 'Summary', 'Homework'] as const

function H({ n, children }: { n: number; children?: ReactNode }) {
  return (
    <h2 id={`s${n}`} className="mt-8 mb-2 scroll-mt-20 border-b border-chassis-700 pb-1 text-lg font-semibold text-ink-100">
      <span className="readout mr-2 text-sm text-ink-500">{n}</span>
      {children ?? SECTIONS[n - 1]}
    </h2>
  )
}

function LessonPage() {
  const { courseId = '', lessonId = '' } = useParams()
  const load = useCourse(courseId)
  const c = load.status === 'ready' ? load.course : undefined
  const flat = useMemo(() => (c ? c.modules.flatMap((m) => m.lessons.map((l) => ({ m, l }))) : []), [c])
  const idx = flat.findIndex((x) => x.l.id === lessonId)
  const p = useData()
  const recordAttempt = useProgress((s) => s.recordAttempt)
  const completeLesson = useProgress((s) => s.completeLesson)
  const enrol = useProgress((s) => s.enrol)
  if (!c) return <CourseLoadFallback load={load} />
  if (idx < 0) return <Navigate to={`/academy/${c.id}`} replace />
  const { m, l } = flat[idx]
  const prev = flat[idx - 1]
  const next = flat[idx + 1]
  if (!l.content) return <Navigate to={`/academy/${c.id}`} replace />
  if (!courseUnlock(p, c).unlocked)
    return (
      <Page>
        <Crumbs items={[['Learning Academy', '/academy'], [c.id, `/academy/${c.id}`], [l.id, null]]} />
        <h1 className="text-[24px] font-semibold">{l.title}</h1>
        <CourseLock c={c} p={p} />
      </Page>
    )
  const k = l.content
  const done = lessonDone(p, l)
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-6 px-4 py-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:px-6">
      <aside className="hidden lg:block">
        <nav aria-label="Lesson sections" className="sticky top-4 space-y-0.5 text-xs">
          {SECTIONS.map((s, i) => (
            <a key={s} href={`#s${i + 1}`} onClick={(e) => { e.preventDefault(); document.getElementById(`s${i + 1}`)?.scrollIntoView({ behavior: 'smooth' }) }} className="block rounded px-2 py-1 text-ink-400 hover:bg-chassis-800 hover:text-ink-100">
              {i + 1}. {s}
            </a>
          ))}
        </nav>
      </aside>
      <article data-testid="lesson" data-lesson={l.id} className="min-w-0">
        <Crumbs items={[['Learning Academy', '/academy'], [`${c.id}`, `/academy/${c.id}`], [m.title, `/academy/${c.id}`], [l.id, null]]} />
        <h1 className="text-[26px] leading-tight font-semibold">{l.title}</h1>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <Tag>{l.minutes} min</Tag>
          <Tag tone={LEVEL_TONE[c.level]}>{c.level}</Tag>
          {done ? <Tag tone="live">Knowledge check passed</Tag> : <Tag>Pass the knowledge check ({Math.round(LESSON_CHECK_PASS * 100)} %) to complete</Tag>}
          {l.legacyId && (
            <Link to={`/circuit-lab?ex=${l.legacyId}`}>
              <Tag tone="signal">Practical: project {l.legacyId.slice(-1).toUpperCase()}</Tag>
            </Link>
          )}
        </div>

        <H n={1} />
        <ul className="list-disc space-y-1 pl-5 text-ink-300">
          {k.objectives.map((o) => (
            <li key={o}>
              <Inline text={o} />
            </li>
          ))}
        </ul>
        <H n={2} />
        <Rich text={k.introduction} />
        <H n={3} />
        <Rich text={k.lecture} />
        <H n={4} />
        <Rich text={k.technical} />
        <H n={5} />
        <div className="space-y-4">
          {k.diagrams.map((d) => (
            <figure key={d.id} className="rounded-md border border-chassis-700 bg-chassis-950 p-3" data-testid={`diagram-${d.id}`}>
              <Diagram id={d.id} />
              <figcaption className="mt-2 text-xs text-ink-400">{d.caption}</figcaption>
            </figure>
          ))}
        </div>
        <H n={6} />
        <div className="space-y-3">
          {k.formulas.map((f) => (
            <div key={f.name} className="rounded-md border border-chassis-700 p-3">
              <p className="text-xs text-ink-400">{f.name}</p>
              <p className="mt-1 font-mono text-[15px] text-signal-200">{f.expr}</p>
              {f.where.length > 0 && (
                <dl className="mt-2 grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-0.5 text-xs">
                  {f.where.map(([s, meaning, unit]) => (
                    <div key={s} className="contents">
                      <dt className="font-mono text-ink-100">{s}</dt>
                      <dd className="text-ink-400">{meaning}</dd>
                      <dd className="text-right text-ink-500">{unit}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {f.note && <p className="mt-1 text-xs text-caution-400">{f.note}</p>}
            </div>
          ))}
        </div>
        <H n={7} />
        <div className="space-y-4">
          {k.examples.map((e, i) => (
            <WorkedExample key={e.title} n={i + 1} e={e} />
          ))}
        </div>
        <H n={8} />
        <Rich text={k.applications} />
        <H n={9} />
        <ul className="space-y-2">
          {k.mistakes.map((x) => (
            <li key={x.mistake} className="rounded-md border border-chassis-700 p-2.5 text-sm">
              <p className="text-danger-400">✗ {x.mistake}</p>
              <p className="mt-1 text-ink-300">
                ✓ <Inline text={x.correction} />
              </p>
            </li>
          ))}
        </ul>
        <H n={10}>{`Interactive demonstration: ${k.demo.title}`}</H>
        <p className="text-ink-300">
          <Inline text={k.demo.text} />
        </p>
        {k.demo.embed && (
          <div className="mt-3 rounded-md border border-chassis-700 bg-chassis-950 p-3">
            <Demo id={k.demo.embed} />
          </div>
        )}
        <Link to={routeOf(k.demo.link)} className="mt-3 inline-flex min-h-10 items-center rounded-md border border-signal-400 bg-signal-500 px-3.5 text-sm font-medium text-white hover:bg-signal-400" data-testid="demo-link">
          {k.demo.link.label}
        </Link>
        <H n={11} />
        <ul className="grid gap-2 sm:grid-cols-2">
          {k.activities.map((a) => (
            <li key={a.label}>
              <Link to={routeOf(a)} className="flex min-h-11 items-center justify-between gap-2 rounded-md border border-chassis-600 px-3 text-sm hover:border-chassis-500">
                <span className="text-ink-200">{a.label}</span>
                <span className="text-[11px] text-ink-500">{{ lab3d: '3D lab', library: 'Library', procedure: 'Test procedure', compare: 'Comparison', circuit: 'Circuit lab', sim: 'Simulator', build: 'Build lab', solar: 'Solar lab', instrument: 'Instruments lab', fundamentals: 'Fundamentals module', repair: 'Repair workshop' }[a.kind]}</span>
              </Link>
            </li>
          ))}
        </ul>
        <H n={12} />
        <QuestionSet
          key={`${l.id}-check`}
          questions={k.check}
          mode="practice"
          testid="check"
          onSubmit={(r) => {
            enrol(c.id)
            recordAttempt({ kind: 'check', ref: l.id, score: r.score, max: r.max, durationMs: r.durationMs, answers: r.answers })
            if (r.score / r.max >= LESSON_CHECK_PASS) completeLesson(l.id)
          }}
        />
        <H n={13} />
        <ul className="list-disc space-y-1 pl-5 text-ink-300">
          {k.summary.map((s) => (
            <li key={s}>
              <Inline text={s} />
            </li>
          ))}
        </ul>
        <H n={14}>{`Homework: ${k.homework.title}`}</H>
        <Homework lesson={l} onSubmit={(score, max, answers, durationMs) => recordAttempt({ kind: 'assignment', ref: k.homework.id, score, max, durationMs, answers })} />
        <nav className="mt-10 flex flex-wrap justify-between gap-2 border-t border-chassis-700 pt-4 text-sm">
          {prev ? (
            <Link to={`/academy/${c.id}/${prev.l.id}`} className="text-signal-300 hover:underline" data-testid="prev-lesson">
              ← {prev.l.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={`/academy/${c.id}/${next.l.id}`} className="text-signal-300 hover:underline" data-testid="next-lesson">
              {next.l.title} →
            </Link>
          ) : (
            <Link to={`/academy/${c.id}`} className="text-signal-300 hover:underline">
              Back to the course →
            </Link>
          )}
        </nav>
      </article>
    </div>
  )
}

function WorkedExample({ n, e }: { n: number; e: { title: string; problem: string; steps: string[]; answer: string; check?: string } }) {
  const [shown, setShown] = useState(0)
  const all = shown >= e.steps.length
  return (
    <div className="rounded-md border border-chassis-700 p-3" data-testid={`example-${n}`}>
      <p className="font-medium text-ink-100">
        Example {n}: {e.title}
      </p>
      <p className="mt-1 text-sm text-ink-300">
        <Inline text={e.problem} />
      </p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 font-mono text-[13px] text-ink-200">
        {e.steps.slice(0, shown).map((s) => (
          <li key={s}>
            <Inline text={s} />
          </li>
        ))}
      </ol>
      {!all ? (
        <div className="mt-2 flex gap-2">
          <Button onClick={() => setShown(shown + 1)} data-testid={`example-${n}-next`}>
            Show step {shown + 1} of {e.steps.length}
          </Button>
          <Button variant="ghost" onClick={() => setShown(e.steps.length)}>
            Show all
          </Button>
        </div>
      ) : (
        <div className="mt-2 space-y-1 text-sm">
          <p className="text-live-400">
            <Inline text={e.answer} />
          </p>
          {e.check && (
            <p className="text-xs text-ink-400">
              Sanity check: <Inline text={e.check} />
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function Homework({ lesson, onSubmit }: { lesson: AcademyLesson; onSubmit: (score: number, max: number, answers: Record<string, number | number[] | null>, ms: number) => void }) {
  const hw = lesson.content!.homework
  const [open, setOpen] = useState<Record<number, boolean>>({})
  return (
    <div className="space-y-3" data-testid="homework">
      <p className="text-ink-300">
        <Inline text={hw.brief} />
      </p>
      {hw.tasks.length > 0 && <QuestionSet key={hw.id} questions={hw.tasks} mode="practice" testid="hw" onSubmit={(r) => onSubmit(r.score, r.max, r.answers, r.durationMs)} />}
      {hw.written.map((w, i) => (
        <div key={i} className="rounded-md border border-chassis-700 p-3 text-sm">
          <p className="text-ink-100">
            Written task: <Inline text={w.prompt} />
          </p>
          <textarea aria-label="Your written answer" className="mt-2 min-h-24 w-full rounded-md border border-chassis-600 bg-chassis-900 p-2 text-ink-100" placeholder="Write your answer, then compare it with the model answer." />
          <Button variant="ghost" onClick={() => setOpen({ ...open, [i]: !open[i] })}>
            {open[i] ? 'Hide' : 'Show'} model answer
          </Button>
          {open[i] && (
            <p className="mt-1 rounded bg-chassis-800 p-2 text-ink-300">
              <Inline text={w.model} />
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function useCourseModule() {
  const { courseId = '', moduleId = '' } = useParams()
  const load = useCourse(courseId)
  const c = load.status === 'ready' ? load.course : undefined
  const m = c?.modules.find((x) => x.id === moduleId)
  return { load, c, m }
}

function QuizPage() {
  const { load, c, m } = useCourseModule()
  const p = useData()
  const recordAttempt = useProgress((s) => s.recordAttempt)
  const enrol = useProgress((s) => s.enrol)
  const [seed, setSeed] = useState<number | null>(null)
  if (!c) return <CourseLoadFallback load={load} />
  if (!m?.quiz) return <Navigate to="/academy" replace />
  const av = quizAvailability(p, m)
  const st = moduleStatus(p, m)
  if (!courseUnlock(p, c).unlocked)
    return (
      <Page>
        <CourseLock c={c} p={p} />
      </Page>
    )
  return (
    <Page>
      <Crumbs items={[['Learning Academy', '/academy'], [c.id, `/academy/${c.id}`], [`${m.title}: quiz`, null]]} />
      <h1 className="text-[24px] font-semibold">Module quiz: {m.title}</h1>
      <p className="mt-1 text-sm text-ink-400">
        {m.quiz.questions.length} questions · pass {Math.round(m.quiz.pass * 100)} % · {av.used} of 3 attempts used in the last 24 h · best {Math.round(st.quizBest * 100)} %. Feedback is shown after you submit. Passing the quiz credits this module’s practical tasks.
      </p>
      <div className="mt-4">
        {seed === null ? (
          av.allowed ? (
            <Button variant="primary" onClick={() => setSeed(Date.now() % 2147483647)} data-testid="start-quiz">
              Start attempt
            </Button>
          ) : (
            <p className="text-caution-400">Three attempts used. The next attempt is available {new Date(av.nextAt).toLocaleString()}. Review the module’s lessons in the meantime.</p>
          )
        ) : (
          <QuestionSet
            key={seed}
            questions={m.quiz.questions}
            mode="quiz"
            seed={seed}
            allowRetry={false}
            testid="quiz"
            onSubmit={(r) => {
              enrol(c.id)
              recordAttempt({ kind: 'quiz', ref: m.id, score: r.score, max: r.max, durationMs: r.durationMs, answers: r.answers })
            }}
          />
        )}
        {seed !== null && (
          <Link to={`/academy/${c.id}`} className="mt-4 inline-block text-sm text-signal-300 hover:underline">
            ← Back to the course
          </Link>
        )}
      </div>
    </Page>
  )
}

function AssignmentPage() {
  const { load, c, m } = useCourseModule()
  const p = useData()
  const recordAttempt = useProgress((s) => s.recordAttempt)
  const [open, setOpen] = useState<Record<number, boolean>>({})
  if (!c) return <CourseLoadFallback load={load} />
  if (!m?.assignment) return <Navigate to="/academy" replace />
  if (!courseUnlock(p, c).unlocked)
    return (
      <Page>
        <CourseLock c={c} p={p} />
      </Page>
    )
  const a = m.assignment
  return (
    <Page>
      <Crumbs items={[['Learning Academy', '/academy'], [c.id, `/academy/${c.id}`], [a.title, null]]} />
      <h1 className="text-[24px] font-semibold">{a.title}</h1>
      <p className="mt-2 text-ink-300">
        <Inline text={a.brief} />
      </p>
      <div className="mt-4">
        <QuestionSet questions={a.tasks} mode="practice" testid="assignment" onSubmit={(r) => recordAttempt({ kind: 'assignment', ref: a.id, score: r.score, max: r.max, durationMs: r.durationMs, answers: r.answers })} />
      </div>
      {a.written.map((w, i) => (
        <div key={i} className="mt-4 rounded-md border border-chassis-700 p-3 text-sm">
          <p className="text-ink-100">
            Written part: <Inline text={w.prompt} />
          </p>
          <textarea aria-label="Your written answer" className="mt-2 min-h-28 w-full rounded-md border border-chassis-600 bg-chassis-900 p-2 text-ink-100" />
          <Button variant="ghost" onClick={() => setOpen({ ...open, [i]: !open[i] })}>
            {open[i] ? 'Hide' : 'Show'} model answer
          </Button>
          {open[i] && (
            <p className="mt-1 rounded bg-chassis-800 p-2 text-ink-300">
              <Inline text={w.model} />
            </p>
          )}
        </div>
      ))}
      <p className="mt-4 text-xs text-ink-500">The auto-marked parts count towards the module (≥ 70 %). Written parts are for self-review against the model answer; a teacher may also mark them.</p>
    </Page>
  )
}

function ExamPage() {
  const { courseId = '' } = useParams()
  const load = useCourse(courseId)
  const c = load.status === 'ready' ? load.course : undefined
  const p = useData()
  const recordAttempt = useProgress((s) => s.recordAttempt)
  const [session, setSession] = useState<{ seed: number; deadline: number } | null>(null)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!session) return
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [session])
  if (!c) return <CourseLoadFallback load={load} />
  if (!c.exam) return <Navigate to="/academy" replace />
  if (!courseUnlock(p, c).unlocked)
    return (
      <Page>
        <CourseLock c={c} p={p} />
      </Page>
    )
  const ex = examStatus(p, c, now)
  const left = session ? Math.max(0, session.deadline - now) : 0
  return (
    <Page>
      <Crumbs items={[['Learning Academy', '/academy'], [c.id, `/academy/${c.id}`], ['Examination', null]]} />
      <h1 className="text-[24px] font-semibold">
        {c.id} formal examination: {c.title}
      </h1>
      <p className="mt-1 text-sm text-ink-400">
        {c.exam.questions.length} questions · {c.exam.minutes} minutes · pass {Math.round(c.exam.pass * 100)} % · {ex.remaining} of {c.exam.attempts} attempts remaining. No feedback is shown until you submit; the paper is submitted automatically when the time is up.
      </p>
      <div className="mt-4" data-testid="exam-area">
        {!session ? (
          ex.passed ? (
            <p className="text-live-400">Passed with {Math.round(ex.best * 100)} %. Your competency record has been updated.</p>
          ) : !ex.eligible ? (
            <div className="space-y-2 text-sm" data-testid="exam-locked">
              <p className="text-caution-400">The examination opens when every module is complete: all lesson checks, module quizzes and assignments passed, and all practical tasks done.</p>
              <ul className="list-disc pl-5 text-ink-400">
                {c.modules.map((m) => {
                  const st = moduleStatus(p, m)
                  return (
                    <li key={m.id}>
                      {m.title}: lessons {st.lessonsDone}/{st.lessons}, quiz {st.quizPassed ? '✓' : '✗'}, assignment {st.assignmentBest >= 0.7 ? '✓' : '✗'}, practicals {st.practicalsDone}/{st.practicals}
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : ex.remaining <= 0 ? (
            <p className="text-caution-400">No attempts remaining. Ask your teacher or programme administrator about a re-sit.</p>
          ) : ex.nextAt > now ? (
            <p className="text-caution-400">Next attempt available {new Date(ex.nextAt).toLocaleString()}.</p>
          ) : (
            <Button variant="primary" onClick={() => setSession({ seed: Date.now() % 2147483647, deadline: Date.now() + c.exam!.minutes * 60_000 })} data-testid="start-exam">
              Start the examination
            </Button>
          )
        ) : (
          <>
            <p className="sticky top-0 z-10 mb-3 rounded-md border border-chassis-600 bg-chassis-900/95 px-3 py-2 text-sm text-ink-100" data-testid="exam-timer">
              Time remaining: <span className="readout">{Math.floor(left / 60000)}:{String(Math.floor((left % 60000) / 1000)).padStart(2, '0')}</span>
            </p>
            <QuestionSet
              key={session.seed}
              questions={c.exam.questions}
              mode="exam"
              seed={session.seed}
              deadline={session.deadline}
              allowRetry={false}
              testid="exam"
              onSubmit={(r) => {
                recordAttempt({ kind: 'exam', ref: c.id, score: r.score, max: r.max, durationMs: r.durationMs, answers: r.answers })
              }}
            />
          </>
        )}
      </div>
    </Page>
  )
}

function PracticalPage() {
  const { courseId = '', taskId = '' } = useParams()
  const load = useCourse(courseId)
  const c = load.status === 'ready' ? load.course : undefined
  const p = useData()
  const recordAttempt = useProgress((s) => s.recordAttempt)
  const enrol = useProgress((s) => s.enrol)
  const found = c?.modules.flatMap((m) => m.practicals.map((x) => ({ m, x }))).find(({ x }) => x.task?.id === taskId)
  if (!c) return <CourseLoadFallback load={load} />
  if (!found) return <Navigate to={`/academy/${c.id}`} replace />
  const { m, x } = found
  const passed = evidenceMet(p, x.evidence)
  return (
    <Page>
      <Crumbs items={[['Learning Academy', '/academy'], [c.id, `/academy/${c.id}`], [`${m.title}: practical`, null]]} />
      <h1 className="text-[24px] font-semibold">Practical assessment: {x.task!.title}</h1>
      <div className="mt-1 flex flex-wrap gap-1.5">
        <Tag tone={passed ? 'live' : 'neutral'}>{passed ? 'Passed' : 'Not yet passed'}</Tag>
        <Tag>{m.title}</Tag>
      </div>
      <p className="mt-2 text-sm text-ink-400">{x.description} Practical assessments are marked pass or fail; you may attempt them as often as you need. It is credited to the module once the module quiz is passed.</p>
      {!courseUnlock(p, c).unlocked ? (
        <CourseLock c={c} p={p} />
      ) : (
        <div className="mt-4">
          <TaskRunner
            task={x.task!}
            onMarked={(mk, answers) => {
              enrol(c.id)
              recordAttempt({ kind: 'practical', ref: x.task!.id, score: mk.score, max: mk.max, durationMs: 0, answers })
            }}
          />
        </div>
      )}
      <Link to={`/academy/${c.id}`} className="mt-6 inline-block text-sm text-signal-300 hover:underline">
        ← Back to the course
      </Link>
    </Page>
  )
}

function RecordPage() {
  const p = useData()
  const rec = competencyRecord(p)
  const recent = p.attempts.slice(0, 40)
  const label = { none: 'Not started', awareness: 'Awareness', applied: 'Applied', 'virtual-competency': 'Virtual competency' } as const
  return (
    <Page>
      <Crumbs items={[['Learning Academy', '/academy'], ['Competency record', null]]} />
      <h1 className="text-[24px] font-semibold">Competency record</h1>
      <p className="mt-1 text-sm text-ink-400">
        Levels: <strong className="text-ink-200">Awareness</strong> (lesson checks passed), <strong className="text-ink-200">Applied</strong> (module quizzes and practical tasks), <strong className="text-ink-200">Virtual competency</strong> (all evidence including the examination).
      </p>
      <div className="mt-3">
        <SafetyNotice>{SHELL_VIRTUAL_COMPETENCY_NOTE}</SafetyNotice>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm" data-testid="competency-table">
          <thead>
            <tr className="border-b border-chassis-600 text-left text-ink-400">
              <th className="py-2 font-medium">Unit</th>
              <th className="py-2 font-medium">Competency</th>
              <th className="py-2 font-medium">Level</th>
              <th className="py-2 font-medium">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {rec.map((r) => (
              <tr key={r.id} className="border-b border-chassis-700 align-top">
                <td className="readout py-2 text-ink-300">{r.id}</td>
                <td className="py-2 text-ink-200">{r.title}</td>
                <td className="py-2">{r.available ? <Tag tone={r.level === 'virtual-competency' ? 'live' : r.level === 'none' ? 'neutral' : 'signal'}>{label[r.level]}</Tag> : <Tag>Course scheduled</Tag>}</td>
                <td className="py-2 text-xs text-ink-400">{r.evidence.length ? r.evidence.join(' · ') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mt-8 mb-2 text-lg font-semibold">Recent attempts</h2>
      {recent.length === 0 ? (
        <p className="text-sm text-ink-400">No attempts yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm" data-testid="attempt-table">
            <thead>
              <tr className="border-b border-chassis-600 text-left text-ink-400">
                <th className="py-1.5 font-medium">When</th>
                <th className="py-1.5 font-medium">Type</th>
                <th className="py-1.5 font-medium">Item</th>
                <th className="py-1.5 text-right font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((a) => (
                <tr key={a.id} className="border-b border-chassis-700">
                  <td className="py-1.5 text-xs text-ink-400">{new Date(a.at).toLocaleString()}</td>
                  <td className="py-1.5 text-ink-300">{a.kind}</td>
                  <td className="readout py-1.5 text-ink-300">{a.ref}</td>
                  <td className="readout py-1.5 text-right text-ink-100">
                    {a.score}/{a.max}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-ink-500">The full record (every attempt, answer and practical result) is included in the backup on the Progress page.</p>
    </Page>
  )
}

export default function AcademyRouter() {
  return (
    <Routes>
      <Route index element={<Catalogue />} />
      <Route path="record" element={<RecordPage />} />
      <Route path=":courseId" element={<CoursePage />} />
      <Route path=":courseId/quiz/:moduleId" element={<QuizPage />} />
      <Route path=":courseId/assignment/:moduleId" element={<AssignmentPage />} />
      <Route path=":courseId/exam" element={<ExamPage />} />
      <Route path=":courseId/practical/:taskId" element={<PracticalPage />} />
      <Route path=":courseId/:lessonId" element={<LessonPage />} />
    </Routes>
  )
}
