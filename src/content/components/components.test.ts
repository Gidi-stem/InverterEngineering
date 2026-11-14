import { describe, expect, it } from 'vitest'
import { COMPONENT_INDEX } from '../componentCatalogue'
import { SYMBOL_KEYS } from '../../ui/symbols/keys'
import { COMPONENTS, COMPONENT_BY_ID } from './index'

describe('component database integrity', () => {
  it('has exactly one full entry for every catalogued component', () => {
    expect(COMPONENTS.map((c) => c.id).sort()).toEqual(COMPONENT_INDEX.map((c) => c.id).sort())
    expect(new Set(COMPONENTS.map((c) => c.id)).size).toBe(COMPONENTS.length)
  })

  it('keeps catalogue categories in step with the full entries', () => {
    for (const i of COMPONENT_INDEX) expect(COMPONENT_BY_ID[i.id].category, i.id).toBe(i.category)
  })

  it.each(COMPONENTS.map((c) => [c.id, c] as const))('%s fills all 13 information-panel fields', (_id, c) => {
    expect(c.name.length).toBeGreaterThan(3)
    for (const f of [c.function, c.operatingPrinciple, c.ioBehaviour, c.plainSummary, c.advancedNote]) expect(f.length).toBeGreaterThan(60)
    for (const list of [c.applications, c.failureSymptoms, c.testingMethod, c.replacementNotes, c.safety, c.related]) expect(list.length).toBeGreaterThan(0)
    expect(c.terminals.length).toBeGreaterThan(0)
    expect(c.typicalSpecs.length).toBeGreaterThan(0)
    expect(SYMBOL_KEYS).toContain(c.symbol)
  })

  it('has unique terminal ids per component and resolvable related ids', () => {
    for (const c of COMPONENTS) {
      expect(new Set(c.terminals.map((t) => t.id)).size, c.id).toBe(c.terminals.length)
      for (const r of c.related) expect(COMPONENT_BY_ID[r], `${c.id} → ${r}`).toBeDefined()
      expect(c.related).not.toContain(c.id)
    }
  })

  it('uses datasheet pinouts for the TO-247 switches, gate driver and SG3525', () => {
    expect(COMPONENT_BY_ID.mosfet.terminals.map((t) => t.label.split(' ')[0])).toEqual(['G', 'D', 'S', 'Tab'])
    expect(COMPONENT_BY_ID.igbt.terminals.map((t) => t.label.split(' ')[0])).toEqual(['G', 'C', 'E', 'Tab'])
    expect(COMPONENT_BY_ID['gate-driver'].terminals.map((t) => t.label)).toEqual(['1 VDD', '2 HB', '3 HO', '4 HS', '5 HI', '6 LI', '7 VSS', '8 LO'])
    const sg = COMPONENT_BY_ID['pwm-controller'].terminals.map((t) => t.label)
    expect(sg).toHaveLength(16)
    expect(sg[15]).toBe('16 VREF')
    expect(sg[10]).toBe('11 OUT A')
    expect(sg[13]).toBe('14 OUT B')
  })
})
