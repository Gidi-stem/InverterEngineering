import type { DiagnosisAttempt, SimulationRun } from './domain'
import type { ModuleId } from './modules'

export interface AssessmentResult {
  assessmentId: string
  at: number
  score: number
  maxScore: number
}

export type LearnerLevel = 'beginner' | 'intermediate' | 'advanced'

export interface ActivityRecord {
  /** e.g. "lab3d:disassembly", "lab3d:identify", "lab3d:discharge" */
  activityId: string
  at: number
  label: string
  level: LearnerLevel
  modelId?: string
  score?: number
  maxScore?: number
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
  /** Learner's chosen level; adjusts guidance, challenge size and panel depth. */
  level: LearnerLevel
  /** Components whose information panel the learner has studied. */
  inspectedComponents: string[]
  /** Completed practical activities, newest first. */
  activities: ActivityRecord[]
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
