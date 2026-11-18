import { describe, expect, it } from 'vitest'
import { circuit } from '../circuit/build'
import { liveClampScenario, liveDmmSeriesPoint, liveDmmTwoProbePoint } from './liveProbe'

describe('liveDmmTwoProbePoint — DC voltage and resistance on a real circuit', () => {
  it('reads the correct DC voltage across a loaded resistor', () => {
    const d = circuit().add('B1', 'battery', 0, 0, 0, { V: 12, Rint: 0.1 }).add('R1', 'resistor', 3, -2, 0, { R: 4 }).wire('B1.+', 'R1.1').wire('R1.2', 'B1.-').doc
    const point = liveDmmTwoProbePoint(d, { partId: 'R1', terminalId: '1' }, { partId: 'R1', terminalId: '2' })
    // I = 12 / 4.1 = 2.927 A, V_R = I * 4 = 11.71 V
    expect(point.dcVoltage).toBeCloseTo(11.707, 2)
    expect(point.isLive).toBe(true)
  })

  it('reads the open-circuit terminal voltage with no load connected (isolated — resistance meaningful)', () => {
    const d = circuit().add('B1', 'battery', 0, 0, 0, { V: 9 }).doc
    const point = liveDmmTwoProbePoint(d, { partId: 'B1', terminalId: '+' }, { partId: 'B1', terminalId: '-' })
    expect(point.dcVoltage).toBeCloseTo(9, 3)
  })

  it('measures resistance between two different parts (general ohmmeter, not just one part\'s own leads)', () => {
    // An open chain (no source, no closed loop): the only path between the two outer leads is
    // through both resistors in series, so this exercises probing across two different parts'
    // terminals rather than one part's own two leads (which `exercises.ts`'s thevenin() already covered).
    const d = circuit().add('R1', 'resistor', 0, 0, 0, { R: 100 }).add('R2', 'resistor', 3, 0, 0, { R: 220 }).wire('R1.2', 'R2.1').doc
    const point = liveDmmTwoProbePoint(d, { partId: 'R1', terminalId: '1' }, { partId: 'R2', terminalId: '2' })
    expect(point.resistanceOhms).toBeCloseTo(320, 0)
    expect(point.isLive).toBe(false)
  })

  it('flags the circuit as live (and still reports a number) when sources are energised', () => {
    const d = circuit().add('B1', 'battery', 0, 0, 0, { V: 12, Rint: 0.1 }).add('R1', 'resistor', 3, -2, 0, { R: 4 }).wire('B1.+', 'R1.1').wire('R1.2', 'B1.-').doc
    const point = liveDmmTwoProbePoint(d, { partId: 'R1', terminalId: '1' }, { partId: 'R1', terminalId: '2' })
    expect(point.isLive).toBe(true)
    expect(point.resistanceOhms).toBeGreaterThan(0)
  })

  it('returns an inert point when a probed part no longer exists (stale selection)', () => {
    const d = circuit().add('R1', 'resistor', 0, 0).doc
    const point = liveDmmTwoProbePoint(d, { partId: 'GONE', terminalId: '1' }, { partId: 'R1', terminalId: '2' })
    expect(point.isLive).toBe(false)
    expect(point.dcVoltage).toBeUndefined()
  })
})

describe('liveDmmTwoProbePoint / liveClampScenario — true AC rms from the transient engine', () => {
  it('reads the correct rms voltage and frequency across an AC-loaded resistor', () => {
    const d = circuit().add('AC', 'ac-source', 0, 0, 0, { Vrms: 20, f: 50 }).add('R1', 'resistor', 3, 0, 0, { R: 100 }).wire('AC.1', 'R1.1').wire('R1.2', 'AC.2').doc
    const point = liveDmmTwoProbePoint(d, { partId: 'R1', terminalId: '1' }, { partId: 'R1', terminalId: '2' })
    expect(point.acVoltageRms).toBeDefined()
    expect(point.acVoltageRms!).toBeCloseTo(20, 0)
    expect(point.acFrequencyHz).toBeCloseTo(50, 0)
  })

  it('reads the correct rms current through a clamped branch', () => {
    const d = circuit().add('AC', 'ac-source', 0, 0, 0, { Vrms: 20, f: 50 }).add('R1', 'resistor', 3, 0, 0, { R: 100 }).wire('AC.1', 'R1.1').wire('R1.2', 'AC.2').doc
    const scenario = liveClampScenario(d, 'R1')
    expect(scenario).not.toBeNull()
    // I_rms ≈ 20 V / 100 Ω = 0.2 A
    expect(scenario!.steadyCurrentRms).toBeCloseTo(0.2, 1)
    expect(scenario!.acFrequencyHz).toBeCloseTo(50, 0)
  })

  it('leaves AC fields undefined on a purely DC circuit (no periodic source to sample)', () => {
    const d = circuit().add('B1', 'battery', 0, 0, 0, { V: 12 }).add('R1', 'resistor', 3, -2, 0, { R: 4 }).wire('B1.+', 'R1.1').wire('R1.2', 'B1.-').doc
    const point = liveDmmTwoProbePoint(d, { partId: 'R1', terminalId: '1' }, { partId: 'R1', terminalId: '2' })
    expect(point.acVoltageRms).toBeUndefined()
  })
})

describe('liveDmmSeriesPoint — ammeter broken into a branch', () => {
  it('reads the correct DC current through the branch', () => {
    const d = circuit().add('B1', 'battery', 0, 0, 0, { V: 12, Rint: 0.1 }).add('R1', 'resistor', 3, -2, 0, { R: 4 }).wire('B1.+', 'R1.1').wire('R1.2', 'B1.-').doc
    const point = liveDmmSeriesPoint(d, 'R1')
    expect(point.seriesCurrentDc).toBeCloseTo(2.927, 2)
  })

  it('returns no current path for a part with no current flowing through it', () => {
    const d = circuit().add('R1', 'resistor', 0, 0).doc
    const point = liveDmmSeriesPoint(d, 'R1')
    expect(point.seriesCurrentDc ?? 0).toBeCloseTo(0, 6)
  })
})
