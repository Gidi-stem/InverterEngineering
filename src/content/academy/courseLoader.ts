import { SHELL_BY_ID } from './shells'
import type { Course } from './types'

type Loader = () => Promise<Course>

/**
 * One entry per fully-authored course, each its own dynamic `import()` — so that opening one
 * course's content never pulls another course's content into the same network request or chunk.
 * Add one line here as each new course is authored (Phases 8–14); nothing else in this file, or in
 * the pages that call `loadCourse`/`useCourse`, needs to change.
 *
 * A course with no entry here is not yet authored: its shell (`./shells`) *is* its complete data —
 * a "scheduled" stub with a syllabus but no lesson content — so there is nothing further to fetch.
 */
const COURSE_CONTENT: Record<string, Loader> = {
  F1: () => import('./f1').then((m) => m.F1),
  F2: () => import('./f2').then((m) => m.F2),
  S1: () => import('./s1').then((m) => m.S1),
  S2: () => import('./s2').then((m) => m.S2),
  F3: () => import('./f3').then((m) => m.F3),
  F4: () => import('./f4').then((m) => m.F4),
  P4: () => import('./p4').then((m) => m.P4),
  F5: () => import('./f5').then((m) => m.F5),
}

const cache = new Map<string, Course>()
const inflight = new Map<string, Promise<Course | undefined>>()

/** True for a course whose full content is fetched on demand (as opposed to a "scheduled" course,
 * whose shell is already everything there is to show). */
export function isAuthored(id: string): boolean {
  return id in COURSE_CONTENT
}

/**
 * Resolves a course's complete data: for an authored course, its own dynamic import (cached after
 * the first successful load — re-opening the course, or navigating between its lessons, quiz,
 * assignment, exam or practicals, never re-fetches it); for a course that is still "scheduled",
 * its already-complete shell, resolved immediately with no network request. Resolves to `undefined`
 * for an id that matches no course at all.
 */
export function loadCourse(id: string): Promise<Course | undefined> {
  const hit = cache.get(id)
  if (hit) return Promise.resolve(hit)
  const already = inflight.get(id)
  if (already) return already
  const loader = COURSE_CONTENT[id]
  const promise: Promise<Course | undefined> = (loader ? loader() : Promise.resolve(SHELL_BY_ID[id])).then(
    (c) => {
      inflight.delete(id)
      if (c) cache.set(id, c)
      return c
    },
    (e) => {
      inflight.delete(id)
      throw e
    },
  )
  inflight.set(id, promise)
  return promise
}

/** Synchronous read of whatever `loadCourse` has already resolved for this id, if anything. */
export function getCachedCourse(id: string): Course | undefined {
  return cache.get(id)
}
