import { describe, expect, it } from 'vitest'
import { DMM_SCENARIO_BY_ID, operateDiodeTest, operateDmm } from './dmm'

const battery = DMM_SCENARIO_BY_ID['battery-resistor']
const live = battery.points.find((p) => p.id === 'terminals-live')!
const off = battery.points.find((p) => p.id === 'terminals-off')!

describe('DMM engine (dmm.ts)', () => {
  it('reads correct DC voltage with probes in the right sockets', () => {
    const r = operateDmm(live, 'dcv', 'v-ohm')
    expect(r.ok).toBe(true)
    expect(r.display).toBe('11.71 V')
  })

  it('flags the dangerous mistake: VΩ function with probes left in a current socket on a live source', () => {
    const r = operateDmm(live, 'dcv', '10a')
    expect(r.ok).toBe(false)
    expect(r.display).toBe('FUSE')
  })

  it('current function with probes in the VΩ sockets reads near zero, not dangerous but wrong', () => {
    const r = operateDmm(live, 'dca', 'v-ohm')
    expect(r.ok).toBe(false)
    expect(r.display).toBe('0.00')
  })

  it('correct current measurement: meter broken in series, right socket', () => {
    const r = operateDmm(live, 'dca', '10a')
    expect(r.ok).toBe(true)
    expect(r.display).toContain('2.86')
  })

  it('refuses a resistance reading on a live circuit', () => {
    const r = operateDmm(live, 'ohms', 'v-ohm')
    expect(r.ok).toBe(false)
  })

  it('reads resistance correctly once isolated', () => {
    const r = operateDmm(off, 'ohms', 'v-ohm')
    expect(r.ok).toBe(true)
    expect(r.display).toBe('4.00 Ω')
  })

  it('diode test: good diode conducts forward ~0.5-0.8V and blocks reverse', () => {
    expect(operateDiodeTest('good', 'forward').display).toBe('0.55 V')
    expect(operateDiodeTest('good', 'reverse').display).toBe('OL')
  })

  it('diode test: shorted junction reads 0V both ways and fails', () => {
    expect(operateDiodeTest('shorted', 'forward').ok).toBe(false)
    expect(operateDiodeTest('shorted', 'reverse').ok).toBe(false)
  })
})
