import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { idbStorage } from './idbStorage'
import type { SimulationRun } from '../types/domain'
import type { ModuleId } from '../types/modules'
import type { ActivityRecord, LearnerLevel, ProgressData } from '../types/progress'
import { newId } from './id'
import { looksLikeBackup, mergeProgress, sanitizeProgress } from './sanitize'

export const emptyProgress = (): ProgressData => ({
  schemaVersion: 1,
  createdAt: Date.now(),
  completedLessons: [],
  completedExercises: [],
  completedProjects: [],
  identifiedComponents: [],
  assessments: [],
  diagnoses: [],
  simulationRuns: [],
  moduleVisits: {},
  level: 'beginner',
  inspectedComponents: [],
  activities: [],
})

interface ProgressActions {
  hydrated: boolean
  visitModule: (id: ModuleId) => void
  recordSimulationRun: (run: Omit<SimulationRun, 'id' | 'at'>) => void
  clearSimulationHistory: () => void
  resetProgress: () => void
  importProgress: (data: unknown) => { ok: true } | { ok: false; error: string }
  setLevel: (level: LearnerLevel) => void
  inspectComponent: (componentId: string) => void
  identifyComponent: (componentId: string) => void
  completeLesson: (lessonId: string) => void
  recordActivity: (a: Omit<ActivityRecord, 'at'>) => void
  recordAssessment: (assessmentId: string, score: number, maxScore: number) => void
  /** A practical exercise passed: marks the exercise and its lesson complete. */
  completeExercise: (exerciseId: string) => void
}

const ACTION_KEYS = [
  'hydrated',
  'visitModule',
  'recordSimulationRun',
  'clearSimulationHistory',
  'resetProgress',
  'importProgress',
  'setLevel',
  'inspectComponent',
  'identifyComponent',
  'completeLesson',
  'recordActivity',
  'recordAssessment',
  'completeExercise',
] as const

const addUnique = (list: string[], id: string) => (list.includes(id) ? list : [...list, id])

export type ProgressState = ProgressData & ProgressActions

const MAX_RUNS = 200

export const useProgress = create<ProgressState>()(
  persist(
    (setState) => ({
      ...emptyProgress(),
      hydrated: false,
      visitModule: (id) => setState((s) => ({ moduleVisits: { ...s.moduleVisits, [id]: Date.now() } })),
      recordSimulationRun: (run) =>
        setState((s) => ({
          simulationRuns: [{ ...run, id: newId(), at: Date.now() }, ...s.simulationRuns].slice(0, MAX_RUNS),
        })),
      clearSimulationHistory: () => setState({ simulationRuns: [] }),
      resetProgress: () => setState(emptyProgress()),
      importProgress: (data) => {
        if (!looksLikeBackup(data)) return { ok: false, error: 'This file is not an Inverter Lab progress backup (schema v1).' }
        setState(sanitizeProgress(data))
        return { ok: true }
      },
      setLevel: (level) => setState({ level }),
      inspectComponent: (id) => setState((s) => ({ inspectedComponents: addUnique(s.inspectedComponents, id) })),
      identifyComponent: (id) => setState((s) => ({ identifiedComponents: addUnique(s.identifiedComponents, id) })),
      completeLesson: (id) => setState((s) => ({ completedLessons: addUnique(s.completedLessons, id) })),
      recordActivity: (a) => setState((s) => ({ activities: [{ ...a, at: Date.now() }, ...s.activities].slice(0, 300) })),
      recordAssessment: (assessmentId, score, maxScore) =>
        setState((s) => ({ assessments: [...s.assessments, { assessmentId, score, maxScore, at: Date.now() }] })),
      completeExercise: (id) => setState((s) => ({ completedExercises: addUnique(s.completedExercises, id), completedLessons: addUnique(s.completedLessons, id) })),
    }),
    {
      name: 'inverter-lab-progress',
      version: 1,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => snapshot(s),
      // Validate whatever is in IndexedDB before it reaches the UI, keeping anything recorded while it loaded.
      merge: (persisted, current) => ({ ...current, ...mergeProgress(sanitizeProgress(persisted, current.createdAt), snapshot(current)) }),
      onRehydrateStorage: () => () => useProgress.setState({ hydrated: true }),
    },
  ),
)

/** Extract the plain serialisable progress record from state. */
export function snapshot(s: ProgressState): ProgressData {
  const data: Record<string, unknown> = { ...s }
  for (const k of ACTION_KEYS) delete data[k]
  return data as unknown as ProgressData
}
