import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { BUILD_PROJECT_BY_ID, DEFAULT_SELECTION } from '../../content/buildProjects'
import type { TestResult } from '../../engine/design/testing'
import type { DesignSpec, Selection } from '../../engine/design/types'
import { idbStorage } from '../../store/idbStorage'

/**
 * Per-project design state of the build laboratory: configurator inputs, component selection and
 * the last test-suite report. Persisted to IndexedDB; every value is validated against the
 * project's defaults on load, so a corrupted record can never break the page.
 */
export interface SuiteRecord {
  at: number
  /** JSON of the circuit the suite ran on: a report is "current" only for that exact circuit. */
  docJson: string
  results: TestResult[]
}

interface BuildState {
  design: Record<string, DesignSpec>
  selection: Record<string, Selection>
  suites: Record<string, SuiteRecord>
  setDesign: (id: string, d: DesignSpec) => void
  setSelection: (id: string, s: Selection) => void
  saveSuite: (id: string, r: SuiteRecord) => void
}

/** Allowed values of the string (choice) fields; anything else keeps the project default. */
const CHOICES: Record<string, string[]> = {
  switchType: ['mosfet', 'igbt'],
  hvType: ['mosfet', 'igbt'],
  driver: ['low-side', 'bootstrap', 'isolated'],
  controller: ['pwm-ic', 'mcu'],
  xfmrCore: ['laminated', 'ferrite'],
  filterCType: ['film-ac', 'electrolytic'],
  load: ['resistive', 'inductive'],
}

function clean<T extends object>(base: T, raw: unknown): T {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const out = { ...base } as Record<string, unknown>
  for (const [k, v] of Object.entries(base)) {
    const r = o[k]
    if (typeof v === 'number' && typeof r === 'number' && Number.isFinite(r)) out[k] = r
    else if (typeof v === 'boolean' && typeof r === 'boolean') out[k] = r
    else if (typeof v === 'string' && typeof r === 'string' && CHOICES[k]?.includes(r)) out[k] = r
  }
  return out as T
}

export const useBuildLab = create<BuildState>()(
  persist(
    (set) => ({
      design: {},
      selection: {},
      suites: {},
      setDesign: (id, d) => set((s) => ({ design: { ...s.design, [id]: d } })),
      setSelection: (id, x) => set((s) => ({ selection: { ...s.selection, [id]: x } })),
      saveSuite: (id, r) => set((s) => ({ suites: { ...s.suites, [id]: r } })),
    }),
    {
      name: 'inverter-lab-build',
      version: 1,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({ design: s.design, selection: s.selection, suites: s.suites }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Pick<BuildState, 'design' | 'selection' | 'suites'>>
        const design: Record<string, DesignSpec> = {}
        const selection: Record<string, Selection> = {}
        const suites: Record<string, SuiteRecord> = {}
        for (const [id, proj] of Object.entries(BUILD_PROJECT_BY_ID)) {
          if (p.design?.[id]) design[id] = clean(proj.defaults, p.design[id])
          if (p.selection?.[id]) selection[id] = clean(DEFAULT_SELECTION, p.selection[id])
          const su = p.suites?.[id]
          if (su && typeof su.at === 'number' && typeof su.docJson === 'string' && Array.isArray(su.results)) suites[id] = su
        }
        return { ...current, design, selection, suites }
      },
    },
  ),
)
