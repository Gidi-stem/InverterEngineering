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
  | { kind: 'solar'; label: string; tab: SolarTab }
  | { kind: 'instrument'; label: string; id: string; scenario?: string }

export const SOLAR_TABS = ['design', 'iv', 'energy', 'faults', 'commission'] as const
export type SolarTab = (typeof SOLAR_TABS)[number]

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
  'body-current',
  'circuit-loop',
  'isolation-flow',
  'rcd',
  'fault-loop',
  'risk-hierarchy',
  'series-parallel',
  'kirchhoff',
  'rc-curve',
  'rl-curve',
  'battery-model',
  'voltage-drop',
  'diode-led',
  'si-scale',
  'pv-cell',
  'iv-family',
  'string-config',
  'mppt-pwm',
  'charge-stages',
  'design-chain',
  'energy-balance',
  'system-types',
] as const
export type DiagramId = (typeof DIAGRAM_IDS)[number] | `schematic:${string}`

export type DemoId = 'spwm-chain' | 'quasi-square' | 'lc-filter' | 'design-calc' | 'body-current' | 'cap-discharge' | 'ohms-law' | 'divider' | 'rc-charge' | 'voltage-drop' | 'battery-load' | 'pv-iv' | 'load-profile' | 'array-config' | 'mppt-track' | 'energy-day'

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
  demo: { title: string; text: string; link: ToolLink; embed?: DemoId }
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
  /** Set on a lightweight course shell (shells.ts) in place of `content`, which it omits to keep
   * the shell small: true means the real, full course has authored content for this lesson. */
  hasContent?: boolean
}

/** True wherever a lesson has authored content available to study — either the content itself
 * (the full, authored course) or the `hasContent` marker (a lightweight shell, gates.ts/logic.ts
 * use this for prerequisite and progress checks without needing the lesson text at all). */
export const lessonAuthored = (l: Pick<AcademyLesson, 'content' | 'hasContent'>): boolean => !!l.content || !!l.hasContent

/**
 * A practical assessment carried out inside the academy (used where the laboratory itself is gated by
 * the course being taught, e.g. F1 safety drills). Marked strictly: a practical is passed or not.
 * - sequence: choose the correct steps (rejecting unsafe or useless ones) and put them in order;
 * - hazards: identify every hazard in a described scene, and only the hazards;
 * - procedure: perform actions one at a time and observe the results, then draw the conclusion;
 *   an unsafe action fails the attempt at once;
 * - calc: engineering calculations, all of which must be correct.
 */
export type PracticalTask =
  | { id: string; kind: 'sequence'; title: string; brief: string; steps: string[]; distractors: { text: string; why: string }[]; explain: string }
  | { id: string; kind: 'hazards'; title: string; brief: string; scene: string; items: { id: string; label: string; hazard: boolean; why: string }[]; explain: string }
  | {
      id: string
      kind: 'procedure'
      title: string
      brief: string
      actions: { id: string; label: string; result: string; unsafe?: string }[]
      /** Action ids that must all be performed, in this order (others may be interleaved). */
      required: string[]
      conclusion: { prompt: string; options: string[]; answer: number; explain: string }
      explain: string
    }
  | { id: string; kind: 'calc'; title: string; brief: string; questions: Question[]; explain: string }

/** Evidence a practical task is complete, read from the records the laboratories already write. */
export type Evidence =
  | { kind: 'project'; id: string }
  | { kind: 'exercise'; id: string }
  | { kind: 'activity'; id: string }
  | { kind: 'lesson'; id: string }
  | { kind: 'troubleshoot'; project: string }
  | { kind: 'task'; id: string }

export interface Practical {
  id: string
  title: string
  description: string
  /** Laboratory where the practical is done (absent for academy practical assessments). */
  link?: ToolLink
  /** Academy practical assessment (evidence kind 'task'). */
  task?: PracticalTask
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
  /** Advisory prior study (never a lock). */
  recommended?: string[]
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
