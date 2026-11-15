/**
 * Learning Academy content model (see docs/CURRICULUM-BLUEPRINT.md).
 * programme → course → module → lesson. A published lesson carries all fourteen sections of the
 * lesson standard; tests enforce it. Lesson text uses a small markdown subset (see `rich.ts`):
 * paragraphs, "- " lists, "1. " steps, "| tables |", "> notes", **bold**, *italic*, `code`,
 * and glossary terms written [[term]] or [[term|shown text]].
 */
export type Level = 'beginner' | 'intermediate' | 'advanced'
export type Stage = 'foundation' | 'practitioner' | 'specialist'

/** A link into one of the existing laboratories. Tests check that every target exists. */
export type ToolLink =
  | { kind: 'lab3d'; label: string; model?: 'lf3k' | 'sq1k'; part?: string }
  | { kind: 'library'; label: string; id: string }
  | { kind: 'procedure'; label: string; component: string; procedure: string }
  | { kind: 'compare'; label: string; id: string }
  | { kind: 'circuit'; label: string; ex: string }
  | { kind: 'sim'; label: string; exp: string }
  | { kind: 'build'; label: string; project: string }

export interface Formula {
  name: string
  /** Plain-text expression, e.g. "I_dc = P_out / (η · V_dc)". */
  expr: string
  /** Each symbol with its meaning and SI unit. */
  where: [symbol: string, meaning: string, unit: string][]
  note?: string
}

export interface WorkedExample {
  title: string
  problem: string
  /** Each step shows the substitution and result. */
  steps: string[]
  answer: string
  /** Sanity check of the result. */
  check?: string
}

export type Question =
  | { id: string; type: 'mcq'; prompt: string; options: string[]; answer: number; explain: string }
  | { id: string; type: 'multi'; prompt: string; options: string[]; answers: number[]; explain: string }
  | { id: string; type: 'numeric'; prompt: string; answer: number; /** relative tolerance, e.g. 0.02 */ tol: number; unit: string; explain: string }

export interface Assignment {
  id: string
  title: string
  brief: string
  /** Auto-marked parts. */
  tasks: Question[]
  /** Written parts, with a model answer the learner compares against. */
  written: { prompt: string; model: string }[]
}

/** Diagram ids are drawn by features/academy/diagrams; "schematic:<project>" renders a build project's reference circuit. */
export const DIAGRAM_IDS = [
  'design-flow',
  'inverter-blocks',
  'hbridge-states',
  'quasi-square',
  'push-pull',
  'hf-link',
  'spwm',
  'deadtime',
  'lc-filter',
  'feedback-loop',
  'thermal-network',
  'solar-paths',
  'hybrid-paths',
  'pv-curve',
  'protection-chain',
  'test-bench',
  'fault-method',
] as const
export type DiagramId = (typeof DIAGRAM_IDS)[number] | `schematic:${string}`

export interface LessonContent {
  objectives: string[]
  introduction: string
  lecture: string
  technical: string
  diagrams: { id: DiagramId; caption: string }[]
  formulas: Formula[]
  examples: WorkedExample[]
  applications: string
  mistakes: { mistake: string; correction: string }[]
  demo: { title: string; text: string; link: ToolLink; embed?: 'spwm-chain' | 'quasi-square' | 'lc-filter' | 'design-calc' }
  activities: ToolLink[]
  check: Question[]
  summary: string[]
  homework: Assignment
}

export interface AcademyLesson {
  id: string
  title: string
  minutes: number
  /** Existing platform lesson this academy lesson teaches (its practical credit carries over). */
  legacyId?: string
  /** Present when published. */
  content?: LessonContent
}

/** Evidence a practical task is complete, read from the records the laboratories already write. */
export type Evidence =
  | { kind: 'project'; id: string }
  | { kind: 'exercise'; id: string }
  | { kind: 'activity'; id: string }
  | { kind: 'lesson'; id: string }
  | { kind: 'troubleshoot'; project: string }

export interface Practical {
  id: string
  title: string
  description: string
  link: ToolLink
  evidence: Evidence
}

export interface AcademyModule {
  id: string
  title: string
  summary: string
  lessons: AcademyLesson[]
  quiz?: { questions: Question[]; pass: number }
  assignment?: Assignment
  practicals: Practical[]
}

export interface Course {
  id: string
  title: string
  level: Level
  stage: Stage
  summary: string
  prerequisites: string[]
  /** "published": fully authored; "scheduled": syllabus only, authored in `phase`. */
  status: 'published' | 'scheduled'
  phase: number
  competency: string
  modules: AcademyModule[]
  exam?: { questions: Question[]; pass: number; minutes: number; attempts: number; cooldownHours: number }
}

export interface Competency {
  id: string
  title: string
  courses: string[]
}
