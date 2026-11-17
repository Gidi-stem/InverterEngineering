import { Link } from 'react-router-dom'
import { ALL_LESSONS, lessonDone } from '../../content/academy/logic'
import { lessonAuthored } from '../../content/academy/types'
import type { ProgressData } from '../../types/progress'

/**
 * Learning Academy entry: the next lesson to study in the published courses. Reads only the
 * lightweight course shells (via `ALL_LESSONS`) — never the full, authored lesson content — so
 * this banner does not pull the Academy's course content into the dashboard's bundle.
 */
export default function AcademyBanner({ data }: { data: ProgressData }) {
  const next = ALL_LESSONS.find((x) => lessonAuthored(x.lesson) && !lessonDone(data, x.lesson))
  const passed = ALL_LESSONS.filter((x) => lessonAuthored(x.lesson) && lessonDone(data, x.lesson)).length
  const total = ALL_LESSONS.filter((x) => lessonAuthored(x.lesson)).length
  return (
    <section className="panel mb-5 flex flex-wrap items-center justify-between gap-4 px-4 py-3" data-testid="academy-banner">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-ink-100">Learning Academy</h2>
        <p className="text-sm text-ink-400">
          Structured courses from electrical safety to advanced inverter design, with lessons, quizzes, assignments, laboratory tasks, examinations and a competency record. {passed}/{total} published lessons passed.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to="/academy" className="inline-flex min-h-10 items-center rounded-md border border-chassis-600 bg-chassis-800 px-3.5 text-sm text-ink-100 hover:bg-chassis-700">
          Course catalogue
        </Link>
        {next && (
          <Link to={`/academy/${next.course.id}/${next.lesson.id}`} className="inline-flex min-h-10 items-center rounded-md border border-signal-400 bg-signal-500 px-3.5 text-sm font-medium text-white hover:bg-signal-400" data-testid="academy-next">
            Continue: {next.lesson.title} →
          </Link>
        )}
      </div>
    </section>
  )
}
