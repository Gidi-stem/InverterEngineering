/**
 * Digital multimeter engine. Models real measurement behaviour and its common failure modes —
 * students see the *consequence* of a wrong connection, not just a correct reading. Scenario values
 * are representative, Ohm's-law-consistent circuits (an educational approximation; a full multimeter
 * probing the student's own live circuit-lab build is out of scope for Phase 8 — see the Phase 8
 * report), not fabricated numbers: every value here is internally consistent (V = I·R) and chosen to
 * match the ranges already used elsewhere in the programme (F1/F2 teaching circuits, inverter buses).
 */

export type DmmFunction = 'dcv' | 'acv' | 'dca' | 'aca' | 'ohms' | 'continuity' | 'diode' | 'capacitance'
export type DmmPort = 'v-ohm' | 'ma' | '10a'

export interface DmmPoint {
  id: string
  label: string
  /** True while the circuit is energised. Resistance/continuity/diode test require this to be false. */
  isLive: boolean
  dcVoltage?: number
  acVoltageRms?: number
  acFrequencyHz?: number
  /** Only present at a point where the meter can be broken into the circuit in series. */
  seriesCurrentDc?: number
  seriesCurrentAcRms?: number
  /** Only meaningful once isolated (isLive: false twin of a live point, or a passive component). */
  resistanceOhms?: number
  capacitanceF?: number
}

export interface DmmScenario {
  id: string
  title: string
  description: string
  points: DmmPoint[]
}

export const DMM_SCENARIOS: DmmScenario[] = [
  {
    id: 'battery-resistor',
    title: '12 V battery and 4 Ω load (F2 teaching circuit)',
    description: 'A 12 V battery (internal resistance 0.1 Ω) feeds a 4 Ω resistive load through its leads.',
    points: [
      { id: 'terminals-live', label: 'Battery terminals (circuit on)', isLive: true, dcVoltage: 11.71, seriesCurrentDc: 2.86 },
      { id: 'terminals-off', label: 'Battery terminals (load disconnected)', isLive: false, dcVoltage: 12, resistanceOhms: 4 },
      { id: 'load', label: 'Across the load resistor', isLive: true, dcVoltage: 11.44, seriesCurrentDc: 2.86 },
    ],
  },
  {
    id: 'inverter-dc-bus',
    title: '48 V inverter DC bus, loaded',
    description: 'A 48 V LiFePO₄ bank supplies the inverter’s DC bus while it delivers 500 W of AC output at 90 % efficiency.',
    points: [
      { id: 'bus-live', label: 'DC bus, running', isLive: true, dcVoltage: 47.6, seriesCurrentDc: 11.58 },
      { id: 'bus-off', label: 'DC bus, isolated', isLive: false, dcVoltage: 0, resistanceOhms: 0.02 },
    ],
  },
  {
    id: 'socket-circuit',
    title: '230 V, 50 Hz socket circuit, 1 kW kettle load',
    description: 'A domestic single-phase circuit supplying a 1 kW kettle.',
    points: [
      { id: 'socket-live', label: 'Live to neutral, kettle running', isLive: true, acVoltageRms: 228, acFrequencyHz: 50, seriesCurrentAcRms: 4.39 },
      { id: 'socket-off', label: 'Live to neutral, isolated, kettle disconnected', isLive: false, acVoltageRms: 0, resistanceOhms: 52.4 },
    ],
  },
]

export const DMM_SCENARIO_BY_ID: Record<string, DmmScenario> = Object.fromEntries(DMM_SCENARIOS.map((s) => [s.id, s]))

export interface DmmResult {
  ok: boolean
  display: string
  note: string
}

const OL: DmmResult = { ok: false, display: 'OL', note: 'Over limit / open circuit: no reading on this range.' }

/**
 * Operates the meter: `fn` is the dial setting, `port` is which sockets the probes are actually in.
 * A current function with the probes in the voltage (v-ohm) sockets reads near zero (safe, but
 * wrong). A VOLTAGE or OHMS function with the probes left in a CURRENT socket (`ma`/`10a`) while
 * connected across a live source is the dangerous mistake: the current socket is a near-zero-
 * resistance shunt, so this is effectively a short across the source through the meter's fuse.
 */
export function operateDmm(point: DmmPoint, fn: DmmFunction, port: DmmPort): DmmResult {
  const wantsCurrent = fn === 'dca' || fn === 'aca'
  if (port !== 'v-ohm' && !wantsCurrent && point.isLive) {
    const amps = fn === 'dcv' ? point.dcVoltage ?? 0 : point.acVoltageRms ?? 0
    return { ok: false, display: 'FUSE', note: `The probes are in the current (${port === 'ma' ? 'mA' : '10 A'}) sockets, which are a near-zero-resistance shunt to measure current, not voltage. Connected across ${amps.toFixed(0)} V, this is effectively a short through the meter: the internal fuse opens (or, on an unfused meter, the source sees a hard short). Return the red probe to the VΩ socket before measuring voltage or resistance.` }
  }
  if (wantsCurrent && port === 'v-ohm') {
    return { ok: false, display: '0.00', note: 'Current function, but the probes are in the VΩ sockets: the meter is now in parallel across the circuit with its high voltage-input impedance, so almost no current flows through it. This reads close to zero and tells you nothing — it is not dangerous, but it is wrong. To measure current, break the circuit and put the meter in series, with the probes in the correct current socket for the expected current.' }
  }
  if (wantsCurrent) {
    if (fn === 'dca') {
      if (point.seriesCurrentDc === undefined) return { ok: false, display: 'OL', note: 'This point is not broken into the circuit in series, so no current path exists through the meter here.' }
      const port10aOk = port === '10a' || point.seriesCurrentDc <= 0.4 // typical mA-range fuse limit
      if (!port10aOk && port === 'ma') return { ok: false, display: 'FUSE', note: `${point.seriesCurrentDc.toFixed(2)} A exceeds the mA range's fuse rating. Use the 10 A socket for currents above a few hundred mA.` }
      return { ok: true, display: `${point.seriesCurrentDc.toFixed(2)} A`, note: 'Correct: meter in series, current socket matched to the expected current.' }
    }
    if (point.seriesCurrentAcRms === undefined) return { ok: false, display: 'OL', note: 'This point is not broken into the circuit in series, so no current path exists through the meter here.' }
    return { ok: true, display: `${point.seriesCurrentAcRms.toFixed(2)} A rms`, note: 'Correct: meter in series, current socket matched to the expected current.' }
  }
  if (fn === 'dcv') return point.dcVoltage === undefined ? OL : { ok: true, display: `${point.dcVoltage.toFixed(2)} V`, note: 'DC voltage, probes in VΩ sockets, meter in parallel across the two points. Correct technique.' }
  if (fn === 'acv') return point.acVoltageRms === undefined ? OL : { ok: true, display: `${point.acVoltageRms.toFixed(1)} V rms (${point.acFrequencyHz ?? 50} Hz)`, note: 'AC voltage, rms value shown. Correct technique.' }
  if (fn === 'ohms' || fn === 'continuity') {
    if (point.isLive) return { ok: false, display: 'unstable / wrong', note: 'Resistance and continuity ranges apply their own small test voltage and assume the circuit is dead. Measuring resistance on a live circuit gives a meaningless, unstable reading and risks damaging the meter. Isolate and prove dead first (F1.M3).' }
    if (point.resistanceOhms === undefined) return OL
    if (fn === 'continuity') return point.resistanceOhms < 1 ? { ok: true, display: `${point.resistanceOhms.toFixed(2)} Ω — continuous (beeps)`, note: 'Below the continuity threshold: a closed path.' } : { ok: true, display: 'OL — open', note: 'Above the continuity threshold: no path (open circuit or a path well over typical wiring resistance).' }
    return { ok: true, display: `${point.resistanceOhms.toFixed(point.resistanceOhms < 10 ? 2 : 0)} Ω`, note: 'Correct: circuit isolated, meter in parallel across the component or path.' }
  }
  return OL
}

/** Diode-test reference cases (values match the component library's own diode test procedure, so a
 * student sees the same numbers here and on the component reference page). */
export const DIODE_TEST_CASES = [
  { id: 'good', label: 'Good rectifier diode', forward: 0.55, reverse: null as number | null },
  { id: 'shorted', label: 'Shorted junction', forward: 0.0, reverse: 0.0 },
  { id: 'open', label: 'Open junction', forward: null as number | null, reverse: null as number | null },
  { id: 'leaky', label: 'Leaky / partially shorted', forward: 0.55, reverse: 0.08 },
]

export function operateDiodeTest(caseId: string, direction: 'forward' | 'reverse'): DmmResult {
  const c = DIODE_TEST_CASES.find((x) => x.id === caseId)
  if (!c) return OL
  const v = direction === 'forward' ? c.forward : c.reverse
  if (direction === 'forward') return v === null ? { ok: false, display: 'OL', note: 'Open junction: no forward conduction. Replace the diode.' } : v === 0 ? { ok: false, display: '0.00 V', note: 'Shorted junction: no forward voltage drop at all. Replace the diode.' } : { ok: true, display: `${v.toFixed(2)} V`, note: 'A silicon junction forward-conducts at roughly 0.5–0.8 V: healthy.' }
  return v === null ? { ok: true, display: 'OL', note: 'Blocks reverse current as expected: healthy.' } : { ok: false, display: `${v.toFixed(2)} V`, note: 'Conducts in reverse: the junction is leaky or shorted. Replace the diode.' }
}
