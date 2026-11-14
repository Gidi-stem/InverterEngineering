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
    for (const list of [c.applications, c.failureSymptoms, c.replacementNotes, c.safety, c.related]) expect(list.length).toBeGreaterThan(0)
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

import { INSTRUMENTS } from '../instruments'
import { INVERTER_MODELS } from '../models'
import { TEST_PROCEDURES } from './testing'
import { PANEL_ENTRY_BY_ID } from './index'

describe('test procedures (virtual instruments)', () => {
  it.each(Object.values(PANEL_ENTRY_BY_ID).map((c) => [c.id] as const))('%s has a safe, complete procedure', (id) => {
    const procs = TEST_PROCEDURES[id]
    expect(procs?.length, id).toBeGreaterThan(0)
    for (const p of procs) {
      // Every procedure starts from isolation, or is explicitly a qualified live measurement.
      expect(p.safety.includes('isolate') || p.safety.includes('live-qualified'), p.id).toBe(true)
      for (const s of p.steps) {
        expect(INSTRUMENTS[s.instrument], s.instrument).toBeDefined()
        expect(s.readings.some((r) => r.good), `${p.id}: needs a good reading`).toBe(true)
        expect(s.readings.some((r) => !r.good), `${p.id}: needs a fault reading`).toBe(true)
      }
    }
  })

  it('requires capacitor discharge before probing parts on the DC bus', () => {
    for (const id of ['mosfet', 'igbt', 'capacitor', 'resistor', 'diode', 'gate-driver']) for (const p of TEST_PROCEDURES[id]) expect(p.safety, p.id).toContain('discharge')
  })

  it('has no procedures for unknown components', () => {
    for (const id of Object.keys(TEST_PROCEDURES)) expect(PANEL_ENTRY_BY_ID[id], id).toBeDefined()
  })
})

describe('specification provenance (no invented manufacturer ratings)', () => {
  const PART_TYPES = ['SG3525', '1N5408']
  it('labels every specification and limits "part-type" values to industry-standard part types', () => {
    for (const c of Object.values(PANEL_ENTRY_BY_ID))
      for (const s of c.typicalSpecs) {
        expect(['typical', 'model', 'part-type'], `${c.id}:${s.name}`).toContain(s.kind)
        if (s.kind === 'part-type') expect(PART_TYPES.some((t) => s.name.includes(t)), `${c.id}:${s.name}`).toBe(true)
      }
  })

  it('uses only generic or industry-standard markings on the 3D models', () => {
    const brandSpecific = /IRF|UCC|STM32|IKW|40N65|KA35|LEM|HASS/i
    for (const m of INVERTER_MODELS)
      for (const p of m.parts) {
        const g = p.geometry as { marking?: string }
        if (g.marking) expect(brandSpecific.test(g.marking), `${m.id}:${p.id} ${g.marking}`).toBe(false)
      }
  })
})
