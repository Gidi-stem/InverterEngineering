import type { DiagnosisAttempt, SimulationRun } from './domain'
import type { ModuleId } from './modules'

export interface AssessmentResult {
  assessmentId: string
  at: number
  score: number
  maxScore: number
}

export interface ProgressData {
  schemaVersion: 1
  createdAt: number
  completedLessons: string[]
  completedExercises: string[]
  completedProjects: string[]
  identifiedComponents: string[]
  assessments: AssessmentResult[]
  diagnoses: DiagnosisAttempt[]
  simulationRuns: SimulationRun[]
  /** Module id → last time opened. */
  moduleVisits: Partial<Record<ModuleId, number>>
}

export interface Badge {
  id: string
  title: string
  description: string
  /** Roadmap phase whose features make this badge earnable (omit if earnable now). */
  availableFromPhase?: number
  /** Pure function of progress; no hidden state. */
  earned: (p: ProgressData) => boolean
}
