import { COMPONENTS } from '../../../content/components'
import { INVERTER_MODELS } from '../../../content/models'
import type { ComponentCategory, ElectronicComponent } from '../../../types/domain'

export const CATEGORY_LABEL: Record<ComponentCategory, string> = {
  'power-switching': 'Power switching',
  passive: 'Passive components',
  control: 'Control electronics',
  protection: 'Protection',
  measurement: 'Measurement',
  cooling: 'Cooling',
  'power-conversion': 'Power conversion',
  'battery-charging': 'Battery and charging',
  'io-connection': 'Input / output connections',
}
export const CATEGORY_ORDER = Object.keys(CATEGORY_LABEL) as ComponentCategory[]

export interface SearchFilters {
  categories: ComponentCategory[]
  /** Only components present in this 3D model. */
  modelId?: string
}

export interface SearchHit {
  component: ElectronicComponent
  score: number
  /** Field where the best match was found, shown to explain the result. */
  matchedIn: string | null
}

/** Weighted fields: a match in the name counts far more than one deep in the operating principle. */
function fields(c: ElectronicComponent): [string, string, number][] {
  return [
    ['name', c.name, 10],
    ['id', c.id.replace(/-/g, ' '), 8],
    ['category', CATEGORY_LABEL[c.category], 4],
    ['function', c.function, 3],
    ['applications', c.applications.join(' '), 3],
    ['terminals', c.terminals.map((t) => `${t.label} ${t.description}`).join(' '), 3],
    ['summary', c.plainSummary, 2],
    ['principle', c.operatingPrinciple, 1],
    ['faults', c.failureSymptoms.join(' '), 1],
    ['replacement', c.replacementNotes.join(' '), 1],
  ]
}

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')

/**
 * Ranked full-text search over the component database. Every query word must match somewhere
 * (AND); words matching at the start of a word score more than mid-word matches.
 */
export function searchComponents(query: string, filters: SearchFilters, entries: ElectronicComponent[] = COMPONENTS): SearchHit[] {
  const model = filters.modelId ? INVERTER_MODELS.find((m) => m.id === filters.modelId) : undefined
  const inModel = model ? new Set(model.parts.map((p) => p.componentId)) : null
  const words = norm(query).split(/[^a-z0-9µ²]+/).filter(Boolean)
  const pool = entries.filter((c) => (!filters.categories.length || filters.categories.includes(c.category)) && (!inModel || inModel.has(c.id)))
  if (!words.length) return pool.map((c) => ({ component: c, score: 0, matchedIn: null })).sort((a, b) => CATEGORY_ORDER.indexOf(a.component.category) - CATEGORY_ORDER.indexOf(b.component.category))
  const hits: SearchHit[] = []
  for (const c of pool) {
    let total = 0
    let best: [string, number] | null = null
    let all = true
    for (const w of words) {
      // Best field counts fully; matches in other fields add a quarter each (breadth of relevance).
      let top = 0
      let rest = 0
      for (const [name, text, weight] of fields(c)) {
        const t = norm(text)
        const idx = t.indexOf(w)
        if (idx < 0) continue
        const atWordStart = idx === 0 || !/[a-z0-9]/.test(t[idx - 1])
        const s = weight * (atWordStart ? 1 : 0.4)
        if (s > top) {
          rest += top
          top = s
        } else rest += s
        if (!best || s > best[1]) best = [name, s]
      }
      const wordScore = top + 0.25 * rest
      if (wordScore === 0) {
        all = false
        break
      }
      total += wordScore
    }
    if (all) hits.push({ component: c, score: total, matchedIn: best?.[0] ?? null })
  }
  return hits.sort((a, b) => b.score - a.score || a.component.name.localeCompare(b.component.name))
}

/** Parts that use this component in each 3D model (for "show in 3D" links). */
export function partsInModels(componentId: string) {
  return INVERTER_MODELS.map((m) => ({ model: m, parts: m.parts.filter((p) => p.componentId === componentId) })).filter((x) => x.parts.length > 0)
}
