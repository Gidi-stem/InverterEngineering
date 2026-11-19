/**
 * Repair and Troubleshooting Workshop — data model (Phase 9; docs/CURRICULUM-BLUEPRINT.md §8).
 *
 * A scenario never duplicates a solving engine. Where a scenario is grounded in a circuit, its
 * readings are produced by the one real circuit engine (`engine/circuit/solve.ts`,
 * `engine/sim/record.ts`+`analysis.ts`) through the same instrument functions Phase 8 already
 * built (`engine/instruments/liveProbe.ts`), via `measure.ts` in this folder. Where a scenario is
 * not a circuit at all (a mechanical, thermal or system-dispatch fault), its readings are produced
 * by the one real engine for that subject (the Phase 7 solar/dispatch engine) exactly as
 * `engine/solar/faults.ts` already does, or are stated as authored, physically-reasoned figures in
 * the same way `engine/solar/faults.ts` already states some of its own (clearly not a measurement
 * the platform computed live) — never invented to make the "right answer" easier to spot.
 */

/** The eight things §7 of the brief says a diagnostic attempt must be scored on. Every checkpoint
 * in a scenario is tagged with exactly one, so a scenario's total score is a genuine rubric, not a
 * single "did you guess the fault" mark. */
export type Rubric = 'symptom' | 'instrument' | 'procedure' | 'interpret' | 'eliminate' | 'diagnose' | 'repair' | 'verify'

export const RUBRIC_LABEL: Record<Rubric, string> = {
  symptom: 'Correct identification of symptoms',
  instrument: 'Selection of suitable instruments',
  procedure: 'Correct measurement procedure',
  interpret: 'Interpretation of readings',
  eliminate: 'Elimination of incorrect hypotheses',
  diagnose: 'Identification of the actual fault',
  repair: 'Selection of an appropriate repair',
  verify: 'Successful post-repair verification',
}
export const RUBRIC_ORDER: Rubric[] = ['symptom', 'instrument', 'procedure', 'interpret', 'eliminate', 'diagnose', 'repair', 'verify']

export type Checkpoint =
  | { id: string; rubric: Rubric; type: 'mcq'; prompt: string; options: string[]; answer: number; explain: string }
  | { id: string; rubric: Rubric; type: 'multi'; prompt: string; options: string[]; answers: number[]; explain: string }
  | { id: string; rubric: Rubric; type: 'numeric'; prompt: string; answer: number; tol: number; unit: string; explain: string }

export interface RepairReading {
  label: string
  value: number
  unit: string
  /** What the same reading would be with no fault present, where that comparison is meaningful. */
  healthy?: number
}

/** Fixed repair-workflow taxonomy (brief §5). Every scenario's `repairSteps` names a subset of
 * these ids, in order, with scenario-specific detail text — the steps themselves are never
 * reinvented per scenario so the workflow stays the one the student is actually taught. */
export type RepairStepId =
  | 'inspect'
  | 'isolate'
  | 'discharge'
  | 'visual'
  | 'measure'
  | 'remove'
  | 'replace'
  | 'solder'
  | 'post-test'
  | 'verify'
  | 'document'

export interface RepairStepDetail {
  id: RepairStepId
  /** What doing this step means for this particular scenario. */
  detail: string
}

export type RepairDomain = 'component' | 'inverter' | 'solar'
export type RepairCategoryId = 'rep-01' | 'rep-02' | 'rep-03' | 'rep-04' | 'rep-05'

export interface RepairScenario {
  id: string
  category: RepairCategoryId
  domain: RepairDomain
  title: string
  /** §3.1 — the reported problem, as the customer or technician describes it. */
  reportedProblem: string
  /** §3.2 — the equipment configuration. */
  equipment: string
  /** §3.3 — initial symptoms observed before any instrument is used. */
  initialSymptoms: string[]
  /** §3.4 — instruments that are actually useful here; the checkpoint set also offers distractor
   * instruments that would not help, so picking "every instrument" is never the safe answer. */
  usefulInstruments: string[]
  unhelpfulInstruments: string[]
  /** §3.5 — circuit diagram, where applicable: textual description of the equipment's relevant
   * section (no scenario needs more circuit than the reading table already conveys). */
  diagram: string
  /** Readings compared healthy vs faulted — see the module doc comment for how each is produced.
   * A function, not stored data: every call genuinely re-runs the real engine (or, for the small
   * number of scenarios noted in the Phase 9 report, the authored physical reasoning), so the
   * numbers shown are never stale or decorative. */
  readings: () => RepairReading[]
  /** §3.6 — diagnostic checkpoints: the structured investigation the student must complete before
   * the final diagnosis is revealed. Always ends with a 'diagnose' checkpoint, a 'repair' checkpoint
   * and a 'verify' checkpoint, never fewer than one checkpoint per rubric category. */
  checkpoints: Checkpoint[]
  /** §3.7 — candidate causes shown to the student before they must narrow them down (used by the
   * scenario's 'eliminate' checkpoint, which asks which of these the evidence rules out). */
  candidateCauses: string[]
  /** §3.9 — the confirmed fault, named in full once the diagnosis checkpoint is answered. */
  confirmedFault: string
  /** §3.10 — the recommended repair, as an ordered subset of the fixed taxonomy above. */
  repairSteps: RepairStepDetail[]
  /** §3.11 — what verification after repair actually checks, in this scenario's terms. */
  verificationNote: string
  /** Safety context named for this specific scenario (brief §8). */
  safety: string
}
