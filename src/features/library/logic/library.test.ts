import { describe, expect, it } from 'vitest'
import { COMPONENTS, COMPONENT_BY_ID } from '../../../content/components'
import { COMPARISONS, guidesFor } from '../../../content/components/comparisons'
import { partsInModels, searchComponents } from './search'

describe('component search', () => {
  const ids = (q: string, f = {}) => searchComponents(q, { categories: [], ...f }).map((h) => h.component.id)

  it('returns all 24 components for an empty query, grouped by category', () => {
    expect(ids('')).toHaveLength(24)
  })

  it('ranks name matches first', () => {
    expect(ids('mosfet')[0]).toBe('mosfet')
    expect(ids('gate driver')[0]).toBe('gate-driver')
    expect(ids('transformer')[0]).toBe('transformer')
    expect(ids('IGBT')[0]).toBe('igbt')
  })

  it('finds components by function and pins, requiring every word to match', () => {
    expect(ids('ripple')).toEqual(expect.arrayContaining(['capacitor', 'inductor']))
    expect(ids('bootstrap')[0]).toBe('gate-driver')
    expect(ids('tach')).toContain('cooling-fan')
    expect(ids('mosfet zzzz')).toEqual([])
  })

  it('applies category and 3D-model filters', () => {
    expect(ids('', { categories: ['cooling'] }).sort()).toEqual(['cooling-fan', 'heat-sink'])
    const sq = ids('', { modelId: 'sq1k' })
    expect(sq).toContain('mosfet')
    expect(sq).not.toContain('igbt')
  })

  it('locates every component in at least one 3D model', () => {
    for (const c of COMPONENTS) expect(partsInModels(c.id).length, c.id).toBeGreaterThan(0)
  })
})

describe('comparison guides', () => {
  it('covers the required pairs', () => {
    const titles = COMPARISONS.map((c) => c.id)
    for (const id of ['mosfet-vs-igbt', 'capacitor-types', 'transformer-vs-inductor', 'relay-vs-semiconductor']) expect(titles).toContain(id)
  })

  it('links every side to a real component and fills every cell', () => {
    for (const g of COMPARISONS) {
      for (const s of g.sides) expect(COMPONENT_BY_ID[s.componentId], `${g.id}:${s.componentId}`).toBeDefined()
      for (const r of g.rows) expect(r.values, `${g.id}:${r.criterion}`).toHaveLength(g.sides.length)
      expect(g.chooseWhen).toHaveLength(g.sides.length)
      expect(g.check.length).toBeGreaterThanOrEqual(2)
      for (const q of g.check) expect(q.correct).toBeLessThan(q.options.length)
    }
  })

  it('offers guides from component entries', () => {
    expect(guidesFor('mosfet').map((g) => g.id)).toEqual(expect.arrayContaining(['mosfet-vs-igbt', 'relay-vs-semiconductor']))
  })
})
