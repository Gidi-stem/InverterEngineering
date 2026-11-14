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
  typicalSpecs: ComponentSpec[]
  /** Plain-language explanation for beginners. */
  plainSummary: string
  /** Design-level note for advanced learners (selection, derating, layout). */
  advancedNote: string
}

// ───────────── 3D inverter models ─────────────

export type Vec3 = [number, number, number]

/** Geometry recipe for a part. `factory` selects the procedural 3D builder; the rest are its parameters. */
export type PartGeometry =
  | { factory: 'to247'; kind: 'mosfet' | 'igbt'; marking: string }
  | { factory: 'electrolytic'; diameter: number; height: number; rating: string }
  | { factory: 'film-cap'; size: Vec3; rating: string }
  | { factory: 'axial-diode'; marking: string }
  | { factory: 'axial-resistor'; ohms: number; tolerancePct: 1 | 2 | 5 | 10; watts: number }
  | { factory: 'ei-transformer'; size: Vec3; rating: string }
  | { factory: 'toroid'; outerDiameter: number; height: number; turns: number; rating: string }
  | { factory: 'ic'; pkg: 'soic8' | 'dip16' | 'lqfp64'; marking: string }
  | { factory: 'relay'; marking: string }
  | { factory: 'heatsink'; length: number; height: number; finDepth: number; fins: number }
  | { factory: 'fan'; size: number; depth: number; rating: string }
  | { factory: 'mega-fuse'; amps: number }
  | { factory: 'din-breaker'; rating: string }
  | { factory: 'hall-sensor'; marking: string }
  | { factory: 'voltage-sensor'; marking: string }
  | { factory: 'pcb'; size: [number, number]; color: 'green' | 'blue'; silk: { at: [number, number]; text: string }[] }
  | { factory: 'battery-terminal'; polarity: '+' | '-' }
  | { factory: 'dc-lugs' }
  | { factory: 'ac-terminal-block' }
  | { factory: 'mc4'; polarity: '+' | '-' }
  | { factory: 'display-board'; lines: string[] }
  | { factory: 'pe-stud' }
  | { factory: 'enclosure-base'; size: Vec3; displayWindow: boolean }
  | { factory: 'enclosure-cover'; size: Vec3; nameplate: string[] }

export type Assembly = 'chassis' | 'terminal-block' | 'power-board' | 'magnetics' | 'control-board' | 'cooling' | 'display-board'

export interface ModelPart {
  /** Unique within the model; also the selection id. */
  id: string
  componentId: string
  label: string
  /** PCB reference designator printed in the silkscreen, e.g. "Q1". */
  designator?: string
  assembly: Assembly
  position: Vec3
  /** Euler rotation in radians. */
  rotation?: Vec3
  /** Offset applied at full exploded view. */
  explodeOffset: Vec3
  geometry: PartGeometry
  /** Board this part is soldered/fixed to: it moves with the board and the board cannot be removed before it. */
  mountedOn?: string
  /** Parts that must be removed before this one (order rules within a stage). */
  dependsOn?: string[]
  /** What physically holds the part in place; shown when a removal is attempted out of order. */
  removalNote: string
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

export interface CheckpointQuestion {
  prompt: string
  options: string[]
  correct: number
  explanation: string
}

/** One stage of the guided disassembly. Reassembly replays stages in reverse. */
export interface ProcedureStage {
  id: string
  title: string
  /** What to do in this stage. */
  instruction: string
  /** Why this stage comes at this point in the sequence. */
  why: string
  /** A required action before any parts in this stage can be removed. */
  action?: 'isolate' | 'discharge' | 'verify-dead'
  partIds: string[]
  /** Tip shown when this stage is replayed during reassembly. */
  reassemblyTip: string
  /** Asked at intermediate and advanced levels when the stage is completed. */
  checkpoint?: CheckpointQuestion
}

export interface CapacitorBank {
  label: string
  partIds: string[]
  /** Total bank capacitance (F). */
  capacitanceF: number
  /** Voltage on the bank when the inverter is isolated (V). */
  initialV: number
  /** Built-in bleeder resistance across the bank (Ω). */
  bleederOhms: number
}

export interface InverterModel {
  id: string
  name: string
  summary: string
  topology: InverterTopology
  ratedPowerW: number
  batteryV: number
  outputVrms: number
  outputHz: 50 | 60
  /** Overall enclosure size in model units (1 unit = 10 mm). */
  size: Vec3
  assemblies: { id: Assembly; label: string }[]
  parts: ModelPart[]
  procedure: ProcedureStage[]
  dischargeBank: CapacitorBank
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
