/**
 * Phase 6 design types. A design is an EDUCATIONAL estimate: it teaches how the numbers relate and
 * drives the simulation, but it is not a certified construction design.
 */
export type Waveform = 'square' | 'modified' | 'sine'
/** How the power is converted, which fixes the circuit structure. */
export type Archetype = 'lv-bridge' | 'lf-bridge' | 'push-pull' | 'hf-link'

export interface DesignSpec {
  /** Nominal battery / DC input voltage (12, 24 or 48 V). */
  vdc: number
  /** Output voltage, V rms (110 or 230; for transformerless low-voltage demonstrators it equals V_dc). */
  vac: number
  /** Output frequency (50 or 60 Hz). */
  f: number
  /** Rated output (real) power, W. */
  power: number
  load: 'resistive' | 'inductive'
  /** Load power factor (1 for resistive). */
  pf: number
  /** Switching (SPWM carrier) frequency for sine designs, Hz; equals f for square/modified designs. */
  fsw: number
  /** DC-DC (high-frequency link) switching frequency, Hz (high-frequency designs only). */
  fswLink: number
  waveform: Waveform
  /** Solar: PV array open-circuit voltage and short-circuit current. */
  pvVoc: number
  pvIsc: number
  /** Solar: MPPT stage duty cycle chosen by the student (0–1). */
  mpptDuty: number
  /** Hybrid: charger current limit from the grid, A. */
  chargeCurrent: number
}

/** Generic ratings the student chooses for each component role (simulated generic parts, not catalogue parts). */
export interface Selection {
  switchType: 'mosfet' | 'igbt'
  /** Voltage rating V_DSS / V_CES of the main switches, V. */
  switchV: number
  /** Continuous current rating, A. */
  switchI: number
  /** MOSFET R_DS(on), mΩ. */
  ronMilli: number
  /** IGBT V_CE(sat), V. */
  vsat: number
  /** Switching time per edge (rise or fall), ns. */
  tsw: number
  /** Heat-sink thermal resistance sink→ambient for the switch heat sink, °C/W. */
  heatsink: number
  fan: boolean
  driver: 'low-side' | 'bootstrap' | 'isolated'
  controller: 'pwm-ic' | 'mcu'
  xfmrCore: 'laminated' | 'ferrite'
  /** Transformer rating, VA. */
  xfmrVA: number
  /** Output filter inductance (mH) and capacitance (µF). */
  filterL: number
  filterC: number
  filterCType: 'film-ac' | 'electrolytic'
  /** DC bus capacitor: capacitance (µF) and voltage rating (V). */
  busC: number
  busV: number
  /** DC input fuse and AC output breaker ratings, A. */
  fuse: number
  breaker: number
  vsensor: boolean
  csensor: boolean
  /** High-voltage bridge switches (high-frequency designs). */
  hvType: 'mosfet' | 'igbt'
  hvV: number
  hvI: number
  hvRonMilli: number
  /** Fast rectifier diodes (high-frequency link) or charger diodes: voltage and current rating. */
  diodeV: number
  diodeI: number
  bleeder: boolean
}

export type CalcKind = 'calculated' | 'assumption'
export interface CalcItem {
  id: string
  group: string
  label: string
  value: number
  unit: string
  /** Formula in symbols, the same with numbers substituted, and why it matters. */
  formula: string
  working: string
  why: string
  kind: CalcKind
}

/** Numbers the circuit generator and the test suite use. */
export interface DesignNumbers {
  vmin: number
  vmax: number
  s: number
  iout: number
  rload: number
  /** Inductive load: series R and L (H) giving the design power factor. */
  loadR: number
  loadL: number
  /** Transformer ratio (secondary / primary, or secondary / half-primary for push-pull). */
  n: number
  /** High-frequency link ratio and HV bus voltage. */
  nLink: number
  vbus: number
  /** SPWM modulation index at nominal input, modified-sine conduction angle (°). */
  m: number
  alpha: number
  iPriPk: number
  idc: number
  idcMax: number
  efficiency: number
  losses: number
  pCond: number
  pSw: number
  /** Suggested filter values: L (mH) on the bridge side, C (µF) where the filter capacitor sits. */
  filterL: number
  filterC: number
  fuse: number
  breaker: number
  /** Required ratings for the compatibility checks. */
  switchVReq: number
  switchIReq: number
  hvVReq: number
  hvIReq: number
  xfmrVAReq: number
  busVReq: number
  diodeVReq: number
  diodeIReq: number
  tj: number
  heatsinkReq: number
  /** Solar: maximum-power point of the simplified PV model, and the duty that reaches it. */
  pvVmp: number
  pvPmp: number
  mpptDutyIdeal: number
}

export interface CompatCheck {
  id: string
  role: string
  componentId: string
  aspect: 'voltage' | 'current' | 'switching' | 'power' | 'thermal' | 'topology' | 'gate-drive' | 'protection'
  status: 'pass' | 'warn' | 'fail'
  required: string
  selected: string
  explanation: string
}
