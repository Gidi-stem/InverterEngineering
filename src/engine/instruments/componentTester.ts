/**
 * Component tester engine. The DMM and the ESR/LCR meter ask a student to choose a mode, range and
 * connection and read a raw number. The component tester is the complementary workflow: pick a
 * component and a condition, run the already-defined test procedure from the component reference
 * library (`content/components/testing.ts`) step by step, and get an automatic good/bad verdict —
 * the quick-triage habit a technician reaches for before reasoning about individual raw readings.
 * It reuses the SAME `TEST_PROCEDURES` data as the reference library and the DMM/ESR/LCR cases, so
 * nothing here is a second, inconsistent copy of the component specs.
 */
import { TEST_PROCEDURES } from '../../content/components/testing'
import type { InstrumentReading, TestProcedure } from '../../types/domain'

export interface ComponentTestRun {
  componentId: string
  procedure: TestProcedure
  /** One chosen reading per step (index-aligned with `procedure.steps`). */
  chosenReadingPerStep: InstrumentReading[]
}

export function availableProcedures(componentId: string): TestProcedure[] {
  return TEST_PROCEDURES[componentId] ?? []
}

export interface ComponentVerdict {
  verdict: 'good' | 'fault'
  failingSteps: string[]
  summary: string
}

/** Runs the chosen readings (one per step, as the student selects them) against the procedure and
 * returns an overall verdict — "good" only if every step's chosen reading is itself a "good" one. */
export function evaluateComponentTest(run: ComponentTestRun): ComponentVerdict {
  const failingSteps: string[] = []
  run.procedure.steps.forEach((step, i) => {
    const chosen = run.chosenReadingPerStep[i]
    if (!chosen || !chosen.good) failingSteps.push(step.instruction)
  })
  if (failingSteps.length === 0) return { verdict: 'good', failingSteps, summary: `Every step of "${run.procedure.title}" returned a healthy reading: the component passes.` }
  return { verdict: 'fault', failingSteps, summary: `${failingSteps.length} of ${run.procedure.steps.length} step(s) returned a faulty reading on "${run.procedure.title}": replace the component. See each flagged step for why.` }
}
