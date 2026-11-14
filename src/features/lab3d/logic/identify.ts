import { PANEL_ENTRY_BY_ID } from '../../../content/components'
import { COMPONENT_INDEX } from '../../../content/componentCatalogue'
import type { InverterModel } from '../../../types/domain'
import type { LearnerLevel } from '../../../types/progress'

/**
 * Component-identification challenge. Difficulty scales with the learner level:
 *  beginner     – 8 large, distinctive parts, named in the prompt, with a hint, unlimited attempts
 *  intermediate – 12 parts described by FUNCTION only, 2 attempts each
 *  advanced     – 20 parts by name, 1 attempt, no labels: scored as assessment asm-01
 */
export const BEGINNER_SET = ['battery-terminals', 'ac-output', 'fuse', 'cooling-fan', 'heat-sink', 'transformer', 'capacitor', 'display-board', 'protective-earth', 'main-pcb']

export const CHALLENGE_SIZE: Record<LearnerLevel, number> = { beginner: 8, intermediate: 12, advanced: 20 }
export const ATTEMPTS: Record<LearnerLevel, number> = { beginner: Infinity, intermediate: 2, advanced: 1 }
export const ASSESSMENT_ID = 'asm-01'

export interface Prompt {
  componentId: string
  text: string
  hint?: string
}

/** Deterministic PRNG (mulberry32) so a challenge can be replayed from its seed. */
export function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffle<T>(items: T[], seed: number): T[] {
  const r = seeded(seed)
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const firstSentence = (s: string) => s.split(/(?<=\.)\s/)[0]

export function buildChallenge(model: InverterModel, level: LearnerLevel, seed: number): Prompt[] {
  const catalogued = new Set(COMPONENT_INDEX.map((c) => c.id))
  const present = [...new Set(model.parts.map((p) => p.componentId))].filter((id) => catalogued.has(id))
  const pool = level === 'beginner' ? present.filter((id) => BEGINNER_SET.includes(id)) : present
  const chosen = shuffle(pool, seed).slice(0, CHALLENGE_SIZE[level])
  return chosen.map((id) => {
    const c = PANEL_ENTRY_BY_ID[id]
    if (level === 'intermediate') return { componentId: id, text: `Find the part that does this: “${firstSentence(c.function)}”` }
    return { componentId: id, text: `Click the ${c.name.replace(/\s*\(.*\)/, '').toLowerCase()}.`, hint: level === 'beginner' ? firstSentence(c.plainSummary) : undefined }
  })
}

/** Advanced runs count as the asm-01 assessment only when the model supports the full 20 prompts. */
export function countsAsAssessment(model: InverterModel, level: LearnerLevel, promptCount: number) {
  return level === 'advanced' && promptCount === CHALLENGE_SIZE.advanced && model.parts.length > 0
}

export const PASS_FRACTION = 0.5
