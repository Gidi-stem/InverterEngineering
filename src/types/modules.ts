/** Learning-module registry types. The registry drives navigation, routing, dashboard and pathway. */

export type ModuleId =
  | 'dashboard'
  | 'academy'
  | 'fundamentals'
  | 'lab3d'
  | 'components'
  | 'circuit-lab'
  | 'build'
  | 'solar'
  | 'instruments'
  | 'repair'
  | 'projects'
  | 'assessments'
  | 'progress'

export type Level = 'foundation' | 'intermediate' | 'advanced'

/** Delivery status of a module in the phased roadmap. */
export type BuildStatus = 'live' | 'planned'

export interface Lesson {
  id: string
  title: string
  /** Estimated study time in minutes. */
  minutes: number
}

export interface LearningModule {
  id: ModuleId
  path: string
  title: string
  short: string
  icon: IconName
  level: Level
  /** Roadmap phase that delivers this module's interactive content. */
  phase: number
  status: BuildStatus
  summary: string
  objectives: string[]
  lessons: Lesson[]
  /** Modules a student should finish first (pathway order). */
  prerequisites: ModuleId[]
  /** Module-specific safety notes shown on the module page. */
  safety?: string[]
}

export type IconName =
  | 'gauge'
  | 'academy'
  | 'book'
  | 'cube'
  | 'chip'
  | 'circuit'
  | 'wrench-build'
  | 'sun'
  | 'scope'
  | 'repair'
  | 'folder'
  | 'check'
  | 'chart'
