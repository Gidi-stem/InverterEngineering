import { describe, expect, it } from 'vitest'
import { captureScope } from './scope'
import { DEFAULT_PARAMS } from '../waveform/waveforms'

const within = (x: number, target: number, tol: number) => Math.abs(x - target) <= Math.abs(target) * tol

describe('virtual oscilloscope (scope.ts)', () => {
  it('measures RMS of a pure sine as Vpeak/√2, against the real waveform engine', () => {
    const params = { ...DEFAULT_PARAMS, vdc: 325, frequencyHz: 50 }
    const trace = captureScope({ waveform: 'pure-sine', params, timePerDiv: 0.002, voltsPerDiv: 100, triggerLevel: 0 })
    expect(within(trace.measurements.vRms, 325 / Math.sqrt(2), 0.01)).toBe(true)
    expect(within(trace.measurements.vPeak, 325, 0.01)).toBe(true)
    expect(within(trace.measurements.vPeakToPeak, 650, 0.01)).toBe(true)
    expect(trace.measurements.frequencyHz).toBe(50)
    expect(within(trace.measurements.periodS!, 1 / 50, 0.001)).toBe(true)
  })

  it('measures an ideal square wave as RMS = Vdc, duty cycle ≈ 50 %', () => {
    const params = { ...DEFAULT_PARAMS, vdc: 48, frequencyHz: 50 }
    const trace = captureScope({ waveform: 'square', params, timePerDiv: 0.002, voltsPerDiv: 20, triggerLevel: 0 })
    expect(within(trace.measurements.vRms, 48, 0.02)).toBe(true)
    expect(within(trace.measurements.dutyCycle!, 0.5, 0.02)).toBe(true)
  })

  it('a narrower modified-sine conduction angle lowers RMS below Vdc', () => {
    const wide = captureScope({ waveform: 'modified-sine', params: { ...DEFAULT_PARAMS, vdc: 230, frequencyHz: 50, conductionDeg: 170 }, timePerDiv: 0.002, voltsPerDiv: 100, triggerLevel: 0 })
    const narrow = captureScope({ waveform: 'modified-sine', params: { ...DEFAULT_PARAMS, vdc: 230, frequencyHz: 50, conductionDeg: 60 }, timePerDiv: 0.002, voltsPerDiv: 100, triggerLevel: 0 })
    expect(narrow.measurements.vRms).toBeLessThan(wide.measurements.vRms)
    expect(wide.measurements.vRms).toBeLessThan(230)
  })

  it('the frame spans exactly 10 horizontal divisions', () => {
    const trace = captureScope({ waveform: 'pure-sine', params: DEFAULT_PARAMS, timePerDiv: 0.001, voltsPerDiv: 100, triggerLevel: 0 })
    expect(trace.frameSeconds).toBeCloseTo(0.01, 6)
    expect(trace.points.at(-1)![0]).toBeCloseTo(0.01, 6)
  })

  it('a DC-side measurement (rectified) has no negative excursion', () => {
    const trace = captureScope({ waveform: 'rectified', params: { ...DEFAULT_PARAMS, vdc: 325, frequencyHz: 50 }, timePerDiv: 0.002, voltsPerDiv: 100, triggerLevel: 0 })
    expect(trace.points.every(([, v]) => v >= -1e-6)).toBe(true)
    expect(within(trace.measurements.vAverage, (2 * 325) / Math.PI, 0.02)).toBe(true)
  })
})
