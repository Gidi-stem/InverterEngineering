import { describe, expect, it } from 'vitest'
import { CIRCUIT_EXERCISE_BY_ID } from '../../content/circuitExercises'
import { cloneDoc } from '../../engine/circuit/build'
import { nodeOfTerminal } from '../../engine/circuit/topology'
import { analyseCircuit } from '../../engine/circuit/validate'
import { floatingNodes, nodeVoltageLabels, partVisuals } from './analysis'
import { eng, partValue } from './format'

describe('circuit lab display helpers', () => {
  it('marks nodes cut off by an open switch and a capacitor as floating', () => {
    const d = cloneDoc(CIRCUIT_EXERCISE_BY_ID['ckt-03'].reference) // S1 and S2 open
    const a = analyseCircuit(d)
    const capPlus = nodeOfTerminal(a.topo, 'C1', '+')
    expect(floatingNodes(d, a).has(capPlus)).toBe(true)
    expect(nodeVoltageLabels(d, a).some((l) => l.text === 'floating')).toBe(true)
    d.parts.find((p) => p.id === 'S1')!.states.closed = 1
    const b = analyseCircuit(d)
    expect(floatingNodes(d, b).has(nodeOfTerminal(b.topo, 'C1', '+'))).toBe(false)
  })

  it('lights the LED only when it conducts', () => {
    const d = cloneDoc(CIRCUIT_EXERCISE_BY_ID['ckt-02'].reference)
    expect(partVisuals(d, analyseCircuit(d)).LED1.on).toBe(true)
    for (const w of d.wires) for (const e of [w.a, w.b]) if (e.partId === 'LED1') e.terminalId = e.terminalId === 'a' ? 'k' : 'a'
    expect(partVisuals(d, analyseCircuit(d)).LED1.on).toBe(false)
  })

  it('formats engineering values', () => {
    expect(eng(4700, 'Ω')).toBe('4.7 kΩ')
    expect(eng(0.015, 'A')).toBe('15 mA')
    expect(eng(-12, 'V')).toBe('-12 V')
    expect(partValue(CIRCUIT_EXERCISE_BY_ID['ckt-03'].reference.parts.find((p) => p.id === 'C1')!)).toBe('1000 µF 25 V')
  })
})
