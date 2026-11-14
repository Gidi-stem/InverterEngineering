import { PART_DEFS, param } from './parts'
import { driverOf, isSwitch, swPins } from './roles'
import { defaultModes, solveCircuit } from './solve'
import { buildTopology, connected, internalPaths, nodeOfTerminal, unconnectedTerminals } from './topology'
import type { CircuitDoc, SimMode, Solution, SolveOverrides, Topology, ValidationIssue } from './types'

/**
 * Generic electrical validation. Every rule reads the node graph or solved voltages/currents;
 * none counts wires. Issues explain what is wrong, what would happen in a real circuit, and how
 * to fix it. Danger-level issues mean the circuit must not be presented as working.
 */
const SAFE_DC = 50
const SAFE_AC_RMS = 25

const label = (doc: CircuitDoc, id: string) => doc.parts.find((p) => p.id === id)?.label ?? id
const fmt = (x: number, unit: string) => {
  const a = Math.abs(x)
  if (unit === 'A' && a < 1) return `${(x * 1000).toFixed(a < 0.01 ? 2 : 1)} mA`
  return `${x.toFixed(a >= 100 ? 0 : a >= 10 ? 1 : 2)} ${unit}`
}
const modeName = (m: SimMode) => (m.kind === 'dc' ? '' : m.polarity === 1 ? ' (positive half-cycle)' : ' (negative half-cycle)')

export function validateSolution(doc: CircuitDoc, topo: Topology, sol: Solution): ValidationIssue[] {
  const out: ValidationIssue[] = []
  const add = (i: ValidationIssue) => out.push(i)
  if (!sol.ok) {
    add({ id: `solver:${sol.error}`, kind: 'solver', severity: 'warning', title: 'The circuit could not be solved', explanation: sol.error ?? 'Unknown solver condition.', fix: 'Check for parts joined only to each other with no complete loop, or switching states that contradict each other.', parts: [] })
    if (!Object.keys(sol.parts).length) return out
  }
  const R = sol.parts
  const m = modeName(sol.mode)

  // ── Short circuits and shoot-through: source current far above what any load allows.
  for (const s of doc.parts.filter((p) => p.type === 'battery' || p.type === 'ac-source' || p.type === 'dc-supply')) {
    const r = R[s.id]
    if (!r) continue
    const isAc = s.type === 'ac-source'
    const V = isAc ? param(s, 'Vrms') * Math.SQRT2 : param(s, 'V')
    const vt = isAc ? r.v['1'] - r.v['2'] : r.v['+'] - r.v['-']
    let shorted = false
    if (s.type === 'dc-supply') shorted = r.state === 'current limit' && Math.abs(vt) < 0.1 * V
    else shorted = Math.abs(r.i) > V / ((s.type === 'battery' ? param(s, 'Rint') : 0.1) + 0.5) && Math.abs(r.i) > 1
    if (!shorted && s.type === 'dc-supply' && r.state === 'current limit') {
      add({
        id: `cc:${s.id}`,
        kind: 'current-limit',
        severity: 'warning',
        title: `${label(doc, s.id)} is in current limit${m}`,
        explanation: `The circuit tries to draw more than the ${fmt(param(s, 'Ilim'), 'A')} limit, so the supply has switched from constant voltage to constant current and its output has fallen to ${fmt(vt, 'V')} instead of ${fmt(V, 'V')}. Every voltage in the circuit is lower than designed.`,
        fix: 'Check the load resistance (I = V / R) against the current limit. Raise the limit only if every part is rated for the higher current; otherwise increase the load resistance.',
        parts: [s.id],
      })
    }
    if (!shorted) continue
    const path = doc.parts.filter((p) => p.id !== s.id && R[p.id] && Math.abs(R[p.id].i) > 0.5 * Math.abs(r.i)).map((p) => p.id)
    const onSwitches = path.filter((id) => {
      const p = doc.parts.find((x) => x.id === id)!
      return isSwitch(p) && R[id].state === 'on'
    })
    const through = path.length ? ` The fault current flows through ${path.map((id) => label(doc, id)).join(', ')}.` : ' Its terminals are joined directly by wire.'
    if (onSwitches.length >= 2) {
      add({
        id: `shoot:${s.id}:${onSwitches.join(',')}`,
        kind: 'shoot-through',
        severity: 'danger',
        title: `Shoot-through: ${onSwitches.map((id) => label(doc, id)).join(' and ')} are on together${m}`,
        explanation: `Both switches of a leg conduct at the same time, so they short the DC bus.${through} In a real inverter this destroys the switches in microseconds.`,
        fix: 'Never turn on the high-side and low-side switch of the same leg together. Drive them in complementary states, with dead-time between transitions.',
        parts: [s.id, ...path],
      })
    } else if (s.type === 'dc-supply') {
      add({ id: `short:${s.id}`, kind: 'short-circuit', severity: 'warning', title: `${label(doc, s.id)} output is short-circuited${m}`, explanation: `The supply has gone into current limit at ${fmt(param(s, 'Ilim'), 'A')} with its output pulled down to ${fmt(vt, 'V')}.${through} The current limit protects this bench circuit, but the same fault on a battery would be dangerous.`, fix: 'Find the zero-resistance path between + and − and put the intended load in the current path.', parts: [s.id, ...path] })
    } else {
      add({ id: `short:${s.id}`, kind: 'short-circuit', severity: 'danger', title: `Short circuit across ${label(doc, s.id)}${m}`, explanation: `Current is ${fmt(r.i, 'A')}, limited only by internal resistance.${through} A real ${isAc ? 'source' : 'battery'} would overheat, arc or burn the wiring.`, fix: `Remove the zero-resistance path between the ${isAc ? 'source terminals' : '+ and − terminals'} so that current must pass through a load${s.type === 'battery' ? ', and fit a fuse at the positive terminal' : ''}.`, parts: [s.id, ...path] })
    }
  }

  for (const p of doc.parts) {
    const r = R[p.id]
    if (!r) continue
    const L = p.label
    switch (p.type) {
      case 'electrolytic': {
        const vc = r.v['+'] - r.v['-']
        if (vc < -0.5)
          add({ id: `revpol:${p.id}`, kind: 'reverse-polarity', severity: 'danger', title: `${L} is connected with reversed polarity${m}`, explanation: `Its − terminal is ${fmt(-vc, 'V')} above its + terminal. Reverse voltage breaks down the oxide layer, the capacitor heats and can vent or burst.`, fix: `Turn ${L} round so its + terminal goes to the more positive node.`, parts: [p.id] })
        if (Math.abs(vc) > param(p, 'Vmax'))
          add({ id: `ovc:${p.id}`, kind: 'overcurrent', severity: 'danger', title: `${L} exceeds its voltage rating${m}`, explanation: `${fmt(Math.abs(vc), 'V')} across a ${param(p, 'Vmax')} V capacitor.`, fix: 'Choose a capacitor rated above the highest voltage it will see (allow 20–50 % margin).', parts: [p.id] })
        break
      }
      case 'led': {
        const vak = r.v.a - r.v.k
        if (r.state === 'off' && vak < -1)
          add({ id: `revled:${p.id}`, kind: 'reverse-bias', severity: vak < -5 ? 'danger' : 'warning', title: `${L} is reverse-biased${m}`, explanation: `Its cathode is ${fmt(-vak, 'V')} above its anode, so it blocks and does not light.${vak < -5 ? ' LEDs typically tolerate only about 5 V reverse, so this would damage it.' : ''}`, fix: `Swap the LED: anode (A) towards the positive side, cathode (K, flat edge) towards negative.`, parts: [p.id] })
        if (Math.abs(r.i) > param(p, 'Imax') / 1000)
          add({ id: `oc:${p.id}`, kind: 'overcurrent', severity: 'danger', title: `${L} overcurrent: ${fmt(r.i, 'A')}${m}`, explanation: `The LED is rated ${param(p, 'Imax')} mA. Without enough series resistance its current rises steeply above the knee voltage and it burns out.`, fix: `Add or increase a series resistor: R = (V_supply − V_f) / I, e.g. (9 V − 2 V) / 15 mA ≈ 470 Ω.`, parts: [p.id] })
        break
      }
      case 'diode':
        if (Math.abs(r.i) > param(p, 'Imax'))
          add({ id: `oc:${p.id}`, kind: 'overcurrent', severity: 'warning', title: `${L} carries ${fmt(r.i, 'A')}, above its ${param(p, 'Imax')} A rating${m}`, explanation: 'Overloaded diodes overheat and fail short or open.', fix: 'Reduce the load current or choose a diode with a higher current rating.', parts: [p.id] })
        break
      case 'resistor': {
        if (Math.abs(r.p) > param(p, 'Pmax'))
          add({ id: `pw:${p.id}`, kind: 'overcurrent', severity: Math.abs(r.p) > 2 * param(p, 'Pmax') ? 'danger' : 'warning', title: `${L} dissipates ${fmt(Math.abs(r.p), 'W')}, above its ${param(p, 'Pmax')} W rating${m}`, explanation: 'P = I²·R. An overloaded resistor overheats, discolours the board and can fail open.', fix: 'Use a higher power rating or a larger resistance.', parts: [p.id] })
        break
      }
      case 'fuse':
        if (Math.abs(r.i) > param(p, 'Irated'))
          add({ id: `fuse:${p.id}`, kind: 'fuse-blown', severity: 'danger', title: `${L} would blow: ${fmt(r.i, 'A')} through a ${param(p, 'Irated')} A fuse${m}`, explanation: 'The current exceeds the fuse rating, so in a real circuit the fuse opens and everything after it loses power. This usually indicates a fault or an undersized fuse.', fix: 'Find the cause of the excess current first. Only then choose a fuse rated just above the normal operating current.', parts: [p.id] })
        break
      case 'breaker': {
        const imax = Math.max(Math.abs(r.i), Math.abs(r.extra?.pole2 ?? 0))
        if (imax > param(p, 'Irated'))
          add({ id: `cb:${p.id}`, kind: 'fuse-blown', severity: 'danger', title: `${L} would trip: ${fmt(imax, 'A')}${m}`, explanation: `Above its ${param(p, 'Irated')} A rating.`, fix: 'Remove the overload or fault before resetting.', parts: [p.id] })
        break
      }
      case 'mosfet':
      case 'igbt': {
        if (Math.abs(r.i) > param(p, 'Imax'))
          add({ id: `oc:${p.id}`, kind: 'overcurrent', severity: 'danger', title: `${L} carries ${fmt(r.i, 'A')}, above its ${param(p, 'Imax')} A rating${m}`, explanation: 'The switch would overheat and fail, usually short-circuit.', fix: 'Reduce the load current or check for a short.', parts: [p.id] })
        if ((r.extra?.body ?? 0) > 1e-3 && sol.mode.kind === 'dc')
          add({ id: `body:${p.id}`, kind: 'body-diode', severity: 'warning', title: `${L} conducts through its internal diode while switched off`, explanation: `Current flows from ${p.type === 'mosfet' ? 'source to drain' : 'emitter to collector'} through the anti-parallel diode, so the switch cannot block it. With a resistive load this usually means ${p.type === 'mosfet' ? 'drain and source' : 'collector and emitter'} are swapped.`, fix: `Connect the ${p.type === 'mosfet' ? 'drain (D)' : 'collector (C)'} towards the load / positive side and the ${p.type === 'mosfet' ? 'source (S)' : 'emitter (E)'} towards the negative side.`, parts: [p.id] })
        break
      }
      case 'transformer':
        if (sol.mode.kind === 'dc' && Math.abs(r.i) + Math.abs(r.extra?.secondary ?? 0) > 0.1)
          add({ id: `xdc:${p.id}`, kind: 'transformer-dc', severity: 'danger', title: `DC is driving a winding of ${L}`, explanation: `A transformer only transfers changing voltage. With DC, nothing is induced in the other winding, and the winding is just ${param(p, 'Rw')} Ω of copper: ${fmt(Math.abs(r.i) || Math.abs(r.extra?.secondary ?? 0), 'A')} flows, the core saturates and the winding overheats.`, fix: 'Feed the primary from an AC source or from a switching bridge that alternates the polarity.', parts: [p.id] })
        break
    }
  }

  // Hazardous voltages anywhere in the circuit (simulated only).
  const hot = sol.nodeVoltages.map((v, n) => ({ v, n })).filter((x) => Math.abs(x.v) > SAFE_DC)
  if (hot.length) {
    const parts = [...new Set(hot.flatMap((h) => topo.nodes[h.n].terminals.map((t) => t.partId)))]
    const vmax = Math.max(...hot.map((h) => Math.abs(h.v)))
    add({ id: 'hv:nodes', kind: 'hazardous-voltage', severity: 'warning', title: `Hazardous voltage in the circuit: up to ${fmt(vmax, 'V')}${m}`, explanation: `Some nodes are more than ${SAFE_DC} V from the reference. Here it is simulated; on a real bench this circuit must only be built by a qualified person with isolation and protective equipment.`, fix: 'For hands-on practice, use the low-voltage pathway: isolated, current-limited sources below 50 V DC / 25 V AC.', parts })
  }
  return out
}

/** Rules that depend only on the connection graph (independent of the analysis mode). */
export function validateTopology(doc: CircuitDoc, topo: Topology): ValidationIssue[] {
  const out: ValidationIssue[] = []
  const add = (i: ValidationIssue) => out.push(i)
  const members = (n: number) => topo.nodes[n]?.terminals ?? []

  for (const p of doc.parts) {
    const free = unconnectedTerminals(doc, p)
    const all = PART_DEFS[p.type].terminals.length
    const relaySpare = p.type === 'relay' ? free.filter((t) => t !== 'no' && t !== 'nc') : free
    if (free.length === all && all > 0) {
      add({ id: `unwired:${p.id}`, kind: 'unconnected', severity: 'info', title: `${p.label} is not connected yet`, explanation: 'It has no wires, so it takes no part in the circuit.', fix: 'Wire its terminals, or delete it if it is not needed.', parts: [p.id] })
      continue
    }
    if (relaySpare.length) {
      const names = relaySpare.map((t) => PART_DEFS[p.type].terminals.find((x) => x.id === t)!.label)
      add({ id: `open-term:${p.id}`, kind: 'unconnected', severity: 'warning', title: `${p.label}: ${names.join(', ')} not connected`, explanation: `An unconnected terminal leaves an open circuit: no current can flow through that part of ${p.label}.`, fix: `Connect ${names.join(', ')} to the correct node.`, parts: [p.id] })
    }
  }

  // Open circuit: a fully wired part whose two ends are not joined by any other path.
  for (const p of doc.parts) {
    if (unconnectedTerminals(doc, p).length) continue
    if (['ground', 'gate-source'].includes(p.type)) continue
    for (const path of internalPaths(p)) {
      if (p.type === 'relay' && path[0] === 'com') continue
      const a = nodeOfTerminal(topo, p.id, path[0])
      const b = nodeOfTerminal(topo, p.id, path[1])
      if (a === b) continue
      if (!connected(doc, topo, a, b, { partId: p.id, path }, { gates: true })) {
        const what = p.type === 'transformer' ? (path[0] === 'p1' ? 'primary winding' : 'secondary winding') : p.type === 'relay' ? 'coil' : ''
        add({ id: `open:${p.id}:${path.join('-')}`, kind: 'open-circuit', severity: 'warning', title: `${p.label}${what ? ` ${what}` : ''} is not in a closed loop`, explanation: 'Current needs a complete path from a source, through the part, and back to the source. One side of this part leads nowhere, so no current can flow.', fix: 'Trace the loop from the source positive through this part and back to the source negative, and add the missing connection.', parts: [p.id] })
      }
    }
  }

  // Switch gate connections.
  for (const sw of doc.parts.filter(isSwitch)) {
    const { hi, lo } = swPins(sw)
    const g = nodeOfTerminal(topo, sw.id, 'g')
    const nHi = nodeOfTerminal(topo, sw.id, hi)
    const nLo = nodeOfTerminal(topo, sw.id, lo)
    if (unconnectedTerminals(doc, sw).includes('g')) continue
    if (members(g).length === 1) continue
    if (g === nLo)
      add({ id: `gs:${sw.id}`, kind: 'gate-in-power-path', severity: 'warning', title: `${sw.label}: gate shorted to ${sw.type === 'mosfet' ? 'source' : 'emitter'}`, explanation: 'V_GS is held at 0 V, so the switch can never turn on.', fix: 'Connect the gate to the gate-drive OUT (through a gate resistor), not to the source/emitter.', parts: [sw.id] })
    else if (g === nHi || members(g).some((t) => ['battery', 'dc-supply', 'ac-source'].includes(doc.parts.find((p) => p.id === t.partId)!.type)))
      add({ id: `gp:${sw.id}`, kind: 'gate-in-power-path', severity: 'warning', title: `${sw.label}: gate connected into the power path`, explanation: `The gate is tied to ${g === nHi ? (sw.type === 'mosfet' ? 'the drain' : 'the collector') : 'a power-supply terminal'}, so it is not controlled by a gate-drive signal. The gate's voltage limit (typically ±20 V) can also be exceeded.`, fix: 'Drive the gate from a gate-drive signal referenced to the source/emitter.', parts: [sw.id] })
    const drv = driverOf(doc, topo, sw)
    if (!drv && g !== nLo && g !== nHi)
      add({ id: `fg:${sw.id}`, kind: 'floating-gate', severity: 'warning', title: `${sw.label}: gate has no drive signal`, explanation: 'A floating gate picks up charge and can turn the switch partly on unpredictably. The lab treats it as off.', fix: 'Connect a gate-drive signal OUT to the gate (through a gate resistor) and its REF to the source/emitter.', parts: [sw.id] })
    if (drv) {
      const ref = nodeOfTerminal(topo, drv.id, '-')
      if (ref !== nLo)
        add({ id: `gref:${sw.id}`, kind: 'gate-reference', severity: 'warning', title: `${sw.label}: gate drive ${drv.label} is not referenced to its ${sw.type === 'mosfet' ? 'source' : 'emitter'}`, explanation: `A switch responds to V_GS, the voltage between gate and ${sw.type === 'mosfet' ? 'source' : 'emitter'}. ${drv.label}'s REF is on a different node, so V_GS changes as the ${sw.type === 'mosfet' ? 'source' : 'emitter'} voltage moves. High-side switches especially need a floating (bootstrap or isolated) driver whose REF sits on the switch node.`, fix: `Connect ${drv.label} REF directly to ${sw.label} ${sw.type === 'mosfet' ? 'S' : 'E'}.`, parts: [sw.id, drv.id] })
    }
  }

  // Transformer isolation.
  for (const t of doc.parts.filter((p) => p.type === 'transformer')) {
    const pri = new Set([nodeOfTerminal(topo, t.id, 'p1'), nodeOfTerminal(topo, t.id, 'p2')])
    const sec = [nodeOfTerminal(topo, t.id, 's1'), nodeOfTerminal(topo, t.id, 's2')]
    const wiredSec = !unconnectedTerminals(doc, t).some((x) => x.startsWith('s'))
    if (wiredSec && sec.some((n) => pri.has(n)))
      add({ id: `iso:${t.id}`, kind: 'isolation-bridged', severity: 'warning', title: `${t.label}: primary and secondary are joined`, explanation: 'A wire connects a primary terminal to a secondary terminal, so the windings are no longer isolated. The output is referenced to the input circuit, and a fault on one side appears on the other.', fix: 'Keep the primary and secondary circuits separate; each winding needs its own loop.', parts: [t.id] })
    if (sec[0] === sec[1] && wiredSec)
      add({ id: `xsec:${t.id}`, kind: 'short-circuit', severity: 'danger', title: `${t.label}: secondary winding shorted`, explanation: 'S1 and S2 are on the same node, so the secondary is a dead short. The reflected short makes the primary draw a very large current.', fix: 'Connect the load between S1 and S2.', parts: [t.id] })
  }

  // Missing protection: battery positive must go straight into a fuse or breaker.
  for (const b of doc.parts.filter((p) => p.type === 'battery')) {
    const n = nodeOfTerminal(topo, b.id, '+')
    const others = members(n).filter((t) => t.partId !== b.id)
    if (!others.length) continue
    const protectedBy = others.filter((t) => ['fuse', 'breaker'].includes(doc.parts.find((p) => p.id === t.partId)!.type))
    const bypass = others.filter((t) => !['fuse', 'breaker'].includes(doc.parts.find((p) => p.id === t.partId)!.type))
    if (!protectedBy.length || bypass.length)
      add({ id: `prot:${b.id}`, kind: 'missing-protection', severity: 'warning', title: `${b.label} has no fuse at its positive terminal`, explanation: protectedBy.length ? 'A fuse is present, but other parts connect to the battery positive before it, so a fault in those parts is not protected.' : 'A battery can deliver hundreds or thousands of amps into a fault. Without a fuse, a short circuit heats the wiring until it burns.', fix: `Connect ${b.label} + only to a fuse (rated just above the normal current), and feed the rest of the circuit from the fuse's other terminal.`, parts: [b.id] })
  }

  // Hazardous source settings (simulated).
  for (const s of doc.parts) {
    const hv = (s.type === 'battery' && param(s, 'V') > SAFE_DC) || (s.type === 'ac-source' && param(s, 'Vrms') > SAFE_AC_RMS)
    if (hv)
      add({ id: `hvsrc:${s.id}`, kind: 'hazardous-voltage', severity: 'warning', title: `${s.label} is set to a hazardous voltage (simulated)`, explanation: `Above ${s.type === 'ac-source' ? `${SAFE_AC_RMS} V AC` : `${SAFE_DC} V DC`}, contact can drive a dangerous current through the body.`, fix: 'Use the simulation for high voltages. For hands-on practice keep to the isolated low-voltage pathway.', parts: [s.id] })
  }

  if (doc.parts.length && !topo.hasGroundPart)
    add({ id: 'noref', kind: 'no-reference', severity: 'info', title: 'No ground / 0 V reference placed', explanation: 'Voltages are shown relative to the first source’s negative terminal. Placing a ground symbol makes the reference explicit.', fix: 'Add a ground part on the node you want to call 0 V.', parts: [] })
  return out
}

export interface CircuitAnalysis {
  topo: Topology
  solutions: Solution[]
  issues: ValidationIssue[]
}

/** Full analysis: topology rules plus every analysis mode the circuit needs (deduplicated issues). */
export function analyseCircuit(doc: CircuitDoc, overrides: SolveOverrides = {}): CircuitAnalysis {
  const topo = buildTopology(doc)
  const modes = defaultModes(doc)
  const solutions = doc.parts.length ? modes.map((m) => solveCircuit(doc, topo, m, overrides)) : []
  const seen = new Set<string>()
  const issues: ValidationIssue[] = []
  for (const i of [...validateTopology(doc, topo), ...solutions.flatMap((s) => validateSolution(doc, topo, s))]) {
    const key = i.id.replace(/:(pos|neg)$/, '')
    if (seen.has(key)) continue
    seen.add(key)
    issues.push(i)
  }
  const order = { danger: 0, warning: 1, info: 2 }
  issues.sort((a, b) => order[a.severity] - order[b.severity])
  return { topo, solutions, issues }
}

