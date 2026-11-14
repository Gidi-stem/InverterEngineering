import type { ProgressData } from '../types/progress'

/**
 * Coerce any stored or imported value into a valid ProgressData record.
 * Used on IndexedDB rehydration and on backup import, so a corrupted or hand-edited
 * record can never put the app into a state that crashes on every load.
 */
export function sanitizeProgress(raw: unknown, fallbackCreatedAt = Date.now()): ProgressData {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const strings = (v: unknown) => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string'))] : [])
  const objects = <T,>(v: unknown, ok: (x: Record<string, unknown>) => boolean) =>
    (Array.isArray(v) ? v.filter((x) => x && typeof x === 'object' && ok(x as Record<string, unknown>)) : []) as T[]
  const num = (x: unknown) => typeof x === 'number' && Number.isFinite(x)

  const visits: ProgressData['moduleVisits'] = {}
  if (o.moduleVisits && typeof o.moduleVisits === 'object' && !Array.isArray(o.moduleVisits)) {
    for (const [k, v] of Object.entries(o.moduleVisits)) if (num(v)) (visits as Record<string, number>)[k] = v as number
  }

  return {
    schemaVersion: 1,
    createdAt: num(o.createdAt) ? (o.createdAt as number) : fallbackCreatedAt,
    completedLessons: strings(o.completedLessons),
    completedExercises: strings(o.completedExercises),
    completedProjects: strings(o.completedProjects),
    identifiedComponents: strings(o.identifiedComponents),
    assessments: objects(o.assessments, (a) => typeof a.assessmentId === 'string' && num(a.score) && num(a.maxScore) && num(a.at)),
    diagnoses: objects(o.diagnoses, (d) => typeof d.scenarioId === 'string' && typeof d.correct === 'boolean' && num(d.at)),
    simulationRuns: objects(o.simulationRuns, (r) => typeof r.id === 'string' && num(r.at) && typeof r.label === 'string' && !!r.params && typeof r.params === 'object' && !!r.results && typeof r.results === 'object'),
    moduleVisits: visits,
    level: o.level === 'intermediate' || o.level === 'advanced' ? o.level : 'beginner',
    inspectedComponents: strings(o.inspectedComponents),
    activities: objects(o.activities, (a) => typeof a.activityId === 'string' && num(a.at) && typeof a.label === 'string'),
  }
}

/** Identifies a backup file: must declare schema v1 and be an object. */
export function looksLikeBackup(raw: unknown): boolean {
  return !!raw && typeof raw === 'object' && !Array.isArray(raw) && (raw as Record<string, unknown>).schemaVersion === 1
}

/**
 * Merge stored progress with anything recorded in this session before storage finished loading
 * (IndexedDB hydrates asynchronously, so an early page visit must not be overwritten).
 */
export function mergeProgress(stored: ProgressData, early: ProgressData): ProgressData {
  const union = (a: string[], b: string[]) => [...new Set([...a, ...b])]
  const byKey = <T,>(a: T[], b: T[], key: (x: T) => string) => {
    const seen = new Set(a.map(key))
    return [...a, ...b.filter((x) => !seen.has(key(x)))]
  }
  const visits = { ...stored.moduleVisits }
  for (const [k, v] of Object.entries(early.moduleVisits)) {
    const key = k as keyof typeof visits
    visits[key] = Math.max(visits[key] ?? 0, v ?? 0)
  }
  return {
    ...stored,
    completedLessons: union(stored.completedLessons, early.completedLessons),
    completedExercises: union(stored.completedExercises, early.completedExercises),
    completedProjects: union(stored.completedProjects, early.completedProjects),
    identifiedComponents: union(stored.identifiedComponents, early.identifiedComponents),
    inspectedComponents: union(stored.inspectedComponents, early.inspectedComponents),
    assessments: byKey(stored.assessments, early.assessments, (a) => `${a.assessmentId}|${a.at}`),
    diagnoses: byKey(stored.diagnoses, early.diagnoses, (d) => `${d.scenarioId}|${d.at}`),
    simulationRuns: byKey(early.simulationRuns, stored.simulationRuns, (r) => r.id),
    activities: byKey(early.activities, stored.activities, (a) => `${a.activityId}|${a.at}`),
    moduleVisits: visits,
  }
}
