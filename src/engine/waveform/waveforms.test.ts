import { describe, expect, it } from 'vitest'
import { DEFAULT_PARAMS, analyse, sampleWaveform, theory } from './waveforms'

const P = { ...DEFAULT_PARAMS, vdc: 100 }
const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b)

describe('waveform engine validated against closed-form theory', () => {
  it('square wave: Vrms = Vdc, V1 = 4Vdc/(π√2), THD ≈ 48.3 %', () => {
    const a = analyse(sampleWaveform('square', P, 4000))
    expect(rel(a.rms, theory.squareRms(100))).toBeLessThan(1e-9)
    expect(rel(a.fundamentalRms, theory.squareFundamentalRms(100))).toBeLessThan(1e-3)
    expect(a.thd).toBeCloseTo(theory.squareThd(), 2)
    expect(a.thd).toBeCloseTo(0.4834, 2)
  })

  it('modified sine (120°): Vrms = Vdc√(α/180), THD ≈ 31 %', () => {
    const a = analyse(sampleWaveform('modified-sine', { ...P, conductionDeg: 120 }, 3600))
    expect(rel(a.rms, theory.modifiedRms(100, 120))).toBeLessThan(2e-3)
    expect(rel(a.fundamentalRms, theory.modifiedFundamentalRms(100, 120))).toBeLessThan(2e-3)
    expect(a.thd).toBeCloseTo(0.3108, 2)
    // 3rd harmonic is eliminated at 120° conduction.
    expect(a.harmonics[2] / a.harmonics[0]).toBeLessThan(0.01)
  })

  it('pure sine: Vrms = mVdc/√2, THD ≈ 0', () => {
    const a = analyse(sampleWaveform('pure-sine', { ...P, modulationIndex: 0.9 }))
    expect(rel(a.rms, theory.sineRms(100, 0.9))).toBeLessThan(1e-6)
    expect(a.thd).toBeLessThan(1e-4)
  })

  it('unipolar SPWM: fundamental peak ≈ m·Vdc', () => {
    const a = analyse(sampleWaveform('pwm', { ...P, modulationIndex: 0.8, carrierHz: 2000 }, 20000))
    expect(rel(a.harmonics[0], 0.8 * 100)).toBeLessThan(0.01)
  })

  it('unipolar SPWM (unfiltered): Vrms = Vdc·√(2m/π), THD ≈ 52.3 % at m = 1', () => {
    const a = analyse(sampleWaveform('pwm', { ...P, modulationIndex: 1, carrierHz: 2000 }, 20000))
    expect(rel(a.rms, 100 * Math.sqrt(2 / Math.PI))).toBeLessThan(0.01)
    expect(a.thd).toBeCloseTo(Math.sqrt(4 / Math.PI - 1), 1)
  })

  it('full-wave rectified: average = 2Vpk/π, no fundamental at the line frequency', () => {
    const a = analyse(sampleWaveform('rectified', P))
    expect(rel(a.average, theory.rectifiedAverage(100))).toBeLessThan(1e-5)
    expect(a.harmonics[0]).toBeLessThan(1e-6)
  })

  it('is deterministic', () => {
    const x = sampleWaveform('pwm', P)
    const y = sampleWaveform('pwm', P)
    expect(Array.from(x)).toEqual(Array.from(y))
  })
})
