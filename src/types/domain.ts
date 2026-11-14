/**
 * Core engineering domain models shared by every phase.
 * Phase 1 defines the contracts; later phases populate them with data and behaviour.
 * Units are SI unless the field name says otherwise (V, A, W, Hz, °C, Ω, F, H).
 */

// ───────────── Electronic components ─────────────

export type ComponentCategory =
  | 'power-switching'
  | 'passive'
  | 'control'
  | 'protection'
  | 'measurement'
  | 'cooling'
  | 'power-conversion'
  | 'battery-charging'
  | 'io-connection'

export interface Terminal {
  id: string
  /** Pin label as printed on a datasheet, e.g. "G", "D", "S", "+", "L". */
  label: string
  role: 'power-in' | 'power-out' | 'control' | 'sense' | 'ground' | 'earth' | 'passive'
  description: string
}

export interface ComponentSpec {
  name: string
  value: number
  unit: string
}

export interface ElectronicComponent {
  id: string
  name: string
  category: ComponentCategory
  /** Key into the schematic symbol library (SVG). */
  symbol: string
  function: string
  operatingPrinciple: string
  applications: string[]
  terminals: Terminal[]
  ioBehaviour: string
  failureSymptoms: string[]
  testingMethod: string[]
  replacementNotes: string[]
  safety: string[]
  related: string[]
  typicalSpecs?: ComponentSpec[]
}

// ───────────── 3D inverter models ─────────────

export type Vec3 = [number, number, number]

export interface ModelPart {
  /** Unique within the model; also the selection id. */
  id: string
  componentId: string
  label: string
  position: Vec3
  rotation?: Vec3
  /** Offset applied in exploded view. */
  explodeOffset: Vec3
  /** Board or assembly this part belongs to. */
  assembly: 'chassis' | 'power-board' | 'control-board' | 'display-board' | 'terminal-block' | 'cooling'
  connectionPoints?: { terminalId: string; position: Vec3 }[]
}

export type InverterTopology =
  | 'basic-dc-ac'
  | 'square-wave'
  | 'modified-sine'
  | 'pure-sine'
  | 'transformer-based'
  | 'high-frequency'
  | 'solar'
  | 'hybrid'

export interface InverterModel {
  id: string
  name: string
  topology: InverterTopology
  ratedPowerW: number
  dcBusV: number
  outputVrms: number
  outputHz: 50 | 60
  parts: ModelPart[]
}

// ───────────── Circuits ─────────────

export interface PlacedComponent {
  instanceId: string
  componentId: string
  x: number
  y: number
  rotation: 0 | 90 | 180 | 270
  /** Instance parameters, e.g. { resistance: 100 }. */
  params: Record<string, number>
}

export interface Wire {
  id: string
  from: { instanceId: string; terminalId: string }
  to: { instanceId: string; terminalId: string }
}

export interface Circuit {
  id: string
  name: string
  components: PlacedComponent[]
  wires: Wire[]
}

export type ConnectionIssueKind =
  | 'short-circuit'
  | 'reverse-polarity'
  | 'shoot-through'
  | 'open-circuit'
  | 'floating-gate'
  | 'missing-protection'
  | 'missing-earth'

export interface ConnectionIssue {
  kind: ConnectionIssueKind
  severity: 'info' | 'warning' | 'danger'
  involved: string[]
  /** Educational explanation of why the connection is wrong and what would happen. */
  explanation: string
  fix: string
}

// ───────────── Simulation ─────────────

export type WaveformKind = 'square' | 'modified-sine' | 'pure-sine' | 'pwm' | 'rectified'

export interface SimulationParams {
  topology: InverterTopology
  waveform: WaveformKind
  dcInputV: number
  frequencyHz: number
  loadW: number
  loadPowerFactor: number
  /** Modulation index for SPWM (0–1). */
  modulationIndex: number
  /** Conduction angle per half-cycle for modified sine, degrees. */
  conductionDeg: number
  switchingHz: number
  ambientC: number
  batteryCapacityAh: number
  stateOfCharge: number
}

export interface Measurements {
  dcInputV: number
  dcInputA: number
  acOutputVrms: number
  acOutputArms: number
  frequencyHz: number
  realPowerW: number
  apparentPowerVA: number
  powerFactor: number
  efficiency: number
  heatsinkTempC: number
  stateOfCharge: number
  thd: number
}

export interface SimulationRun {
  id: string
  at: number
  source: string
  label: string
  params: Partial<SimulationParams>
  results: Partial<Measurements>
}

// ───────────── Faults & repair ─────────────

export type InverterSection =
  | 'dc-input'
  | 'power-stage'
  | 'control'
  | 'output'
  | 'protection'
  | 'cooling'
  | 'charging'
  | 'solar-input'
  | 'sensing'

export interface FaultScenario {
  id: string
  title: string
  symptom: string
  difficulty: 1 | 2 | 3
  faultySection: InverterSection
  faultyPartId: string
  /** Simulation overrides that produce the fault's observable behaviour. */
  effects: Partial<Measurements>
  explanation: string
  repair: string
  hints: string[]
}

export interface DiagnosisAttempt {
  scenarioId: string
  at: number
  sectionGuess: InverterSection
  partGuess: string
  correct: boolean
  usedHints: number
  testsPerformed: number
}
