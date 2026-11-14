import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { sanitizeDoc } from '../../engine/circuit/edit'
import type { CircuitDoc } from '../../engine/circuit/types'
import { idbStorage } from '../../store/idbStorage'

/**
 * Saved circuits, one per workspace (each exercise id, plus "sandbox" for free building).
 * Persisted to IndexedDB and sanitised on load. The undo history lives in memory only.
 */
export const SANDBOX = 'sandbox'
const MAX_UNDO = 60

interface CircuitLabState {
  docs: Record<string, CircuitDoc>
  savedAt: Record<string, number>
  /** Workspaces where the worked solution was loaded; passing there earns no credit until reset. */
  solutionUsed: Record<string, boolean>
  undo: Record<string, CircuitDoc[]>
  hydrated: boolean
  commit: (key: string, doc: CircuitDoc) => void
  undoLast: (key: string) => void
  restore: (key: string, doc: CircuitDoc, opts?: { solution?: boolean }) => void
}

export const useCircuitLab = create<CircuitLabState>()(
  persist(
    (set) => ({
      docs: {},
      savedAt: {},
      solutionUsed: {},
      undo: {},
      hydrated: false,
      commit: (key, doc) =>
        set((s) => ({
          undo: { ...s.undo, [key]: [...(s.undo[key] ?? []), s.docs[key] ?? { version: 1, parts: [], wires: [] }].slice(-MAX_UNDO) },
          docs: { ...s.docs, [key]: doc },
          savedAt: { ...s.savedAt, [key]: Date.now() },
        })),
      undoLast: (key) =>
        set((s) => {
          const stack = s.undo[key] ?? []
          if (!stack.length) return s
          return { docs: { ...s.docs, [key]: stack[stack.length - 1] }, undo: { ...s.undo, [key]: stack.slice(0, -1) }, savedAt: { ...s.savedAt, [key]: Date.now() } }
        }),
      restore: (key, doc, opts) =>
        set((s) => ({
          undo: { ...s.undo, [key]: [...(s.undo[key] ?? []), ...(s.docs[key] ? [s.docs[key]] : [])].slice(-MAX_UNDO) },
          docs: { ...s.docs, [key]: doc },
          savedAt: { ...s.savedAt, [key]: Date.now() },
          solutionUsed: { ...s.solutionUsed, [key]: !!opts?.solution },
        })),
    }),
    {
      name: 'inverter-lab-circuits',
      version: 1,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({ docs: s.docs, savedAt: s.savedAt, solutionUsed: s.solutionUsed }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Pick<CircuitLabState, 'docs' | 'savedAt' | 'solutionUsed'>>
        const docs: Record<string, CircuitDoc> = {}
        for (const [k, v] of Object.entries(p.docs ?? {})) {
          const d = sanitizeDoc(v)
          if (d && /^[a-z0-9-]{1,24}$/.test(k)) docs[k] = d
        }
        const bools = Object.fromEntries(Object.entries(p.solutionUsed ?? {}).filter(([, v]) => v === true)) as Record<string, boolean>
        const times = Object.fromEntries(Object.entries(p.savedAt ?? {}).filter(([, v]) => typeof v === 'number')) as Record<string, number>
        // Anything edited while IndexedDB was loading wins over the stored copy.
        return { ...current, docs: { ...docs, ...current.docs }, savedAt: { ...times, ...current.savedAt }, solutionUsed: { ...bools, ...current.solutionUsed } }
      },
      onRehydrateStorage: () => () => useCircuitLab.setState({ hydrated: true }),
    },
  ),
)
