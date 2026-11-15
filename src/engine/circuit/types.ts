/**
 * Circuit engine types. Pure data: no React, no DOM. Used by the editor, the validator,
 * the exercise evaluator and (Phase 5) the full simulation engine.
 * Units are SI. Geometry is in grid units (1 grid = 20 px in the editor).
 */

export type PartType =
  | 'pv-array'
  | 'transformer-ct'
  | 'vsense'
  | 'battery'
  | 'dc-supply'
  | 'ac-source'
  | 'gate-source'
  | 'resistor'
  | 'capacitor'
  | 'electrolytic'
  | 'inductor'
  | 'diode'
  | 'led'
  | 'mosfet'
  | 'igbt'
  | 'transformer'
  | 'relay'
  | 'fuse'
  | 'breaker'
  | 'switch'
  | 'ground'
  | 'dc-load'
  | 'ac-load'

export type Rotation = 0 | 90 | 180 | 270

export interface TerminalDef {
  id: string
  label: string
  /** Pin position in grid units, relative to the part origin, before rotation. */
  x: number
  y: number
}

export interface ParamDef {
  key: string
  label: string
  unit: string
  default: number
  min: number
  max: number
  step?: number
  /** Show only when a state has one of these values (e.g. generator settings per mode). */
  when?: { state: string; values: number[] }
  /** Used only by the transient simulation (Phase 5); the DC/±peak analysis ignores it. */
  simOnly?: boolean
}

/** Discrete operating state the student can set, e.g. switch open/closed, gate high/low. */
export interface StateDef {
  key: string
  label: string
  options: { value: number; label: string }[]
  default: number
  when?: { state: string; values: number[] }
}

export type PartGroup = 'sources' | 'passives' | 'semiconductors' | 'magnetics' | 'protection' | 'switching' | 'sensing' | 'loads' | 'reference'

export interface PartDef {
  type: PartType
  name: string
  /** Prefix for automatic labels, e.g. R → R1, R2. */
  prefix: string
  group: PartGroup
  /** Component Library entry this part is modelled on (single source of component information). */
  componentId?: string
  description: string
  terminals: TerminalDef[]
  params: ParamDef[]
  states?: StateDef[]
  /** Bounding box in grid units relative to the origin (for hit-testing and layout). */
  box: { x: number; y: number; w: number; h: number }
}

export interface PlacedPart {
  id: string
  type: PartType
  label: string
  x: number
  y: number
  rotation: Rotation
  params: Record<string, number>
  states: Record<string, number>
}

export interface TerminalRef {
  partId: string
  terminalId: string
}

export interface Wire {
  id: string
  a: TerminalRef
  b: TerminalRef
}

export interface CircuitDoc {
  version: 1
  parts: PlacedPart[]
  wires: Wire[]
}

/** An electrical node: every terminal joined by wires. */
export interface CircuitNode {
  id: number
  terminals: TerminalRef[]
  isGround: boolean
}

export interface Topology {
  /** "partId:terminalId" → node id */
  nodeOf: Map<string, number>
  nodes: CircuitNode[]
  /** Node used as 0 V reference (a ground part if present, else chosen automatically). */
  referenceNode: number | null
  hasGroundPart: boolean
}

/**
 * Analysis mode.
 *  dc          – steady state: capacitors open, inductors and windings resistive, transformers uncoupled
 *  ac-snapshot – quasi-static instant at the positive or negative peak of every AC source;
 *                transformers act as ideal (Vs = n·Vp). Also used for bridge switching states.
 */
export type SimMode = { kind: 'dc' } | { kind: 'ac-snapshot'; polarity: 1 | -1 }

export interface SolveOverrides {
  /** Replace part states for this solve, e.g. gate high/low for a test case. */
  states?: Record<string, Record<string, number>>
  /** Inject a test current into a part's terminals (used for Thevenin resistance). */
  inject?: { partId: string; plus: string; minus: string; amps: number }[]
  /** Treat these parts as removed (open) for this solve. */
  remove?: string[]
}

export interface PartResult {
  /** Voltage at each terminal (V, relative to the reference node). */
  v: Record<string, number>
  /** Main current in A: into the first listed terminal for 2-terminal parts; drain/collector current for switches; delivered current for sources. */
  i: number
  /** Power absorbed (W); negative for sources delivering power. */
  p: number
  /** Operating state for display, e.g. "on", "off", "current limit", "energised". */
  state?: string
  /** Extra currents (transformer secondary, relay coil, breaker second pole). */
  extra?: Record<string, number>
}

export interface Solution {
  ok: boolean
  error?: string
  mode: SimMode
  nodeVoltages: number[]
  parts: Record<string, PartResult>
  iterations: number
}

export type MeasurementPoint =
  | { kind: 'node-voltage'; node: number }
  | { kind: 'part-voltage'; partId: string; plus: string; minus: string }
  | { kind: 'part-current'; partId: string }

export type Severity = 'info' | 'warning' | 'danger'

export type IssueKind =
  | 'short-circuit'
  | 'shoot-through'
  | 'reverse-polarity'
  | 'reverse-bias'
  | 'overcurrent'
  | 'fuse-blown'
  | 'body-diode'
  | 'gate-in-power-path'
  | 'floating-gate'
  | 'gate-reference'
  | 'transformer-dc'
  | 'isolation-bridged'
  | 'unconnected'
  | 'open-circuit'
  | 'missing-protection'
  | 'hazardous-voltage'
  | 'current-limit'
  | 'no-reference'
  | 'solver'

export interface ValidationIssue {
  id: string
  kind: IssueKind
  severity: Severity
  title: string
  /** Why this is wrong and what would happen in a real circuit. */
  explanation: string
  fix: string
  parts: string[]
}

export interface CriterionResult {
  id: string
  label: string
  passed: boolean
  weight: number
  detail: string
}

export interface ExerciseResult {
  passed: boolean
  score: number
  maxScore: number
  criteria: CriterionResult[]
  /** Danger issues found while evaluating test states (block a pass). */
  blocking: ValidationIssue[]
  /** Quantities the evaluator computed (shown to the student), e.g. τ, ripple. */
  readings: { label: string; value: string }[]
  /** RC curves found in the circuit: V(t) = to + (from − to)·e^(−t/τ). */
  curves?: { label: string; tauS: number; from: number; to: number }[]
}
