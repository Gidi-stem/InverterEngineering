import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { del, get, set } from 'idb-keyval'
import type { SimulationRun } from '../types/domain'
import type { ModuleId } from '../types/modules'
import type { ProgressData } from '../types/progress'
import { newId } from './id'
import { looksLikeBackup, sanitizeProgress } from './sanitize'

/** IndexedDB-backed storage with in-memory fallback (private mode / sandboxed frames). */
const memory = new Map<string, string>()
const idbStorage: StateStorage = {
  getItem: async (name) => {
    try {
      return (await get<string>(name)) ?? memory.get(name) ?? null
    } catch {
      return memory.get(name) ?? null
    }
  },
  setItem: async (name, value) => {
    memory.set(name, value)
    try {
      await set(name, value)
    } catch {
      /* storage unavailable: keep in memory for this session */
    }
  },
  removeItem: async (name) => {
    memory.delete(name)
    try {
      await del(name)
    } catch {
      /* ignore */
    }
  },
}

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
})

interface ProgressActions {
  hydrated: boolean
  visitModule: (id: ModuleId) => void
  recordSimulationRun: (run: Omit<SimulationRun, 'id' | 'at'>) => void
  clearSimulationHistory: () => void
  resetProgress: () => void
  importProgress: (data: unknown) => { ok: true } | { ok: false; error: string }
}

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
    }),
    {
      name: 'inverter-lab-progress',
      version: 1,
      storage: createJSONStorage(() => idbStorage),
      partialize: ({ hydrated: _h, visitModule: _a, recordSimulationRun: _b, clearSimulationHistory: _c, resetProgress: _d, importProgress: _e, ...data }) => data,
      // Validate whatever is in IndexedDB before it reaches the UI.
      merge: (persisted, current) => ({ ...current, ...sanitizeProgress(persisted, current.createdAt) }),
      onRehydrateStorage: () => () => useProgress.setState({ hydrated: true }),
    },
  ),
)

/** Extract the plain serialisable progress record from state. */
export function snapshot(s: ProgressState): ProgressData {
  const { hydrated: _h, visitModule: _a, recordSimulationRun: _b, clearSimulationHistory: _c, resetProgress: _d, importProgress: _e, ...data } = s
  return data
}
