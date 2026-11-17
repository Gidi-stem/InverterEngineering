import { useEffect, useState } from 'react'
import { getCachedCourse, loadCourse } from './courseLoader'
import type { Course } from './types'

export type CourseLoad = { status: 'loading' } | { status: 'notfound' } | { status: 'error' } | { status: 'ready'; course: Course }

/**
 * Loads one course's complete data on demand (its own dynamic import if authored, its shell
 * otherwise — see `./courseLoader`), for any Academy page keyed by `:courseId`. Re-fetches only
 * when `id` changes to one not already cached, so switching between lessons, the quiz, the
 * assignment, the exam or a practical within the same course never triggers a second download.
 * `retry()` re-attempts a failed load (e.g. the course's chunk failed to fetch) without reloading
 * the page.
 *
 * The cache in `./courseLoader` is the single source of truth: this hook only tracks the outcome of
 * a failed resolution (not-found / error) for the current id, and forces a re-render once a fetch
 * resolves successfully so the next render picks the result straight out of the cache — it never
 * stores "loading" in state, since that's just whatever's left once "cached" and "failed" are ruled
 * out.
 */
export function useCourse(id: string): CourseLoad & { retry: () => void } {
  const [issue, setIssue] = useState<{ id: string; kind: 'notfound' | 'error' } | null>(null)
  const [version, setVersion] = useState(0)
  const cached = getCachedCourse(id)

  useEffect(() => {
    if (getCachedCourse(id)) return
    let alive = true
    loadCourse(id).then(
      (c) => {
        if (!alive) return
        if (c) setVersion((v) => v + 1) // force a re-render; the next render finds it in the cache
        else setIssue({ id, kind: 'notfound' })
      },
      () => {
        if (alive) setIssue({ id, kind: 'error' })
      },
    )
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version exists only to force a retry
  }, [id, version])

  const retry = () => {
    setIssue(null)
    setVersion((v) => v + 1)
  }

  if (cached) return { status: 'ready', course: cached, retry }
  if (issue?.id === id) return { status: issue.kind, retry }
  return { status: 'loading', retry }
}
