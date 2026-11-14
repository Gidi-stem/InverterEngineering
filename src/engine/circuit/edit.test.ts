import { describe, expect, it } from 'vitest'
import { addPart, addWire, deletePart, deleteWire, movePart, reconnectWire, rotatePart, sanitizeDoc, terminalAt } from './edit'
import { terminalPosition } from './parts'
import { buildTopology, nodeOfTerminal } from './topology'
import type { CircuitDoc } from './types'

const empty = (): CircuitDoc => ({ version: 1, parts: [], wires: [] })
const ref = (partId: string, terminalId: string) => ({ partId, terminalId })

describe('circuit editing', () => {
  it('adds parts with unique labels and snaps them to the grid', () => {
    let d = empty()
    d = addPart(d, 'resistor', 3.4, 5.6).doc
    const r = addPart(d, 'resistor', 0, 0)
    expect(r.doc.parts.map((p) => [p.id, p.x, p.y])).toEqual([['R1', 3, 6], ['R2', 0, 0]])
    expect(d.parts).toHaveLength(1) // input unchanged
  })

  it('rotation moves terminals by 90° steps and keeps connectivity', () => {
    let d = addPart(empty(), 'resistor', 10, 10).doc
    d = addPart(d, 'battery', 0, 10).doc
    d = addWire(d, ref('B1', '+'), ref('R1', '1')).doc
    expect(terminalPosition(d.parts[0], '1')).toEqual([8, 10])
    d = rotatePart(d, 'R1')
    expect(terminalPosition(d.parts[0], '1')).toEqual([10, 8])
    d = rotatePart(rotatePart(rotatePart(d, 'R1'), 'R1'), 'R1')
    expect(d.parts[0].rotation).toBe(0)
    d = movePart(d, 'R1', 20, 4)
    const t = buildTopology(d)
    expect(nodeOfTerminal(t, 'B1', '+')).toBe(nodeOfTerminal(t, 'R1', '1'))
  })

  it('rejects self-wires, duplicates and missing terminals', () => {
    let d = addPart(addPart(empty(), 'resistor', 0, 0).doc, 'resistor', 6, 0).doc
    expect(addWire(d, ref('R1', '1'), ref('R1', '1')).error).toBeTruthy()
    expect(addWire(d, ref('R1', '1'), ref('R1', 'x')).error).toBeTruthy()
    d = addWire(d, ref('R1', '2'), ref('R2', '1')).doc
    expect(addWire(d, ref('R2', '1'), ref('R1', '2')).error).toMatch(/already/)
  })

  it('deleting a part removes its wires; wires can be deleted and reconnected', () => {
    let d = addPart(addPart(addPart(empty(), 'resistor', 0, 0).doc, 'resistor', 6, 0).doc, 'resistor', 12, 0).doc
    d = addWire(d, ref('R1', '2'), ref('R2', '1')).doc
    d = addWire(d, ref('R2', '2'), ref('R3', '1')).doc
    const moved = reconnectWire(d, 'w1', 'b', ref('R3', '2'))
    expect(moved.error).toBeUndefined()
    expect(moved.doc.wires[0].b).toEqual(ref('R3', '2'))
    expect(reconnectWire(d, 'w1', 'b', ref('R1', '2')).error).toBeTruthy()
    expect(deleteWire(d, 'w1').wires.map((w) => w.id)).toEqual(['w2'])
    expect(deletePart(d, 'R2').wires).toEqual([])
  })

  it('finds the terminal nearest to a point', () => {
    const d = addPart(empty(), 'mosfet', 5, 5).doc
    expect(terminalAt(d, 3.2, 5.1)).toEqual(ref('Q1', 'g'))
    expect(terminalAt(d, 6, 3)).toEqual(ref('Q1', 'd'))
    expect(terminalAt(d, 5, 5)).toBeNull()
  })

  it('sanitises damaged saves', () => {
    const d = sanitizeDoc({
      parts: [
        { id: 'R1', type: 'resistor', x: 1.2, y: 'x', rotation: 45, params: { R: Number.NaN, Pmax: 1e9 } },
        { id: 'R1', type: 'resistor', x: 0, y: 0 },
        { id: 'Z1', type: 'flux-capacitor', x: 0, y: 0 },
        { id: 'S1', type: 'switch', x: 4, y: 0, states: { closed: 7 } },
      ],
      wires: [{ a: { partId: 'R1', terminalId: '2' }, b: { partId: 'S1', terminalId: '1' } }, { a: { partId: 'R1', terminalId: '1' }, b: { partId: 'Z1', terminalId: '1' } }, 'junk'],
    })!
    expect(d.parts.map((p) => p.id)).toEqual(['R1', 'S1'])
    expect(d.parts[0]).toMatchObject({ x: 1, y: 0, rotation: 0, params: { R: 1000 } })
    expect(d.parts[0].params.Pmax).toBeLessThanOrEqual(100)
    expect(d.parts[1].states.closed).toBe(0)
    expect(d.wires).toHaveLength(1)
    expect(sanitizeDoc(null)).toBeNull()
    expect(sanitizeDoc({ parts: 1 })).toBeNull()
  })
})
