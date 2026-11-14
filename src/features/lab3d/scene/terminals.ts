import type { PartGeometry, Vec3 } from '../../../types/domain'
import { AC_BLOCK, AXIAL_R, BATT_TERM, BREAKER, DC_LUGS, DIP16, DISPLAY, DO201, FAN_WIRE, HALL, LQFP64, MC4, MEGA, PE_STUD, RELAY, SNAPIN_PITCH, SOIC8, TO247, VSENSE } from './dims'

export interface TerminalPoint {
  terminalId: string
  position: Vec3
}

/** Pin positions on SOIC/DIP packages: pins 1..n/2 along the front (+z) edge left→right, the rest back along the rear edge right→left. */
function dualRow(n: number, pitch: number, z: number, y: number): TerminalPoint[] {
  const half = n / 2
  const x0 = ((half - 1) * pitch) / 2
  return Array.from({ length: n }, (_, i) => {
    const front = i < half
    const k = front ? i : n - 1 - i
    return { terminalId: `p${i + 1}`, position: [-x0 + k * pitch, y, front ? z : -z] as Vec3 }
  })
}

/**
 * Local-space terminal positions for each part builder. Terminal ids match the component
 * database, so every 3D connection point links to its documented pin.
 */
export function terminalsFor(g: PartGeometry): TerminalPoint[] {
  switch (g.factory) {
    case 'to247': {
      const [a, b, c] = g.kind === 'mosfet' ? ['g', 'd', 's'] : ['g', 'c', 'e']
      return [
        { terminalId: a, position: [-TO247.pitch, 0, 0] },
        { terminalId: b, position: [0, 0, 0] },
        { terminalId: c, position: [TO247.pitch, 0, 0] },
        { terminalId: 'tab', position: [0, TO247.leadL + TO247.bodyH + TO247.tabAbove - TO247.holeY, -TO247.t / 2 - 0.1] },
      ]
    }
    case 'electrolytic':
      return [
        { terminalId: '+', position: [SNAPIN_PITCH / 2, 0, 0] },
        { terminalId: '-', position: [-SNAPIN_PITCH / 2, 0, 0] },
      ]
    case 'film-cap':
      return [
        { terminalId: '1', position: [-g.size[0] / 2 + 0.3, 0, 0] },
        { terminalId: '2', position: [g.size[0] / 2 - 0.3, 0, 0] },
      ]
    case 'axial-diode':
      return [
        { terminalId: 'a', position: [-DO201.span / 2, 0, 0] },
        { terminalId: 'k', position: [DO201.span / 2, 0, 0] },
      ]
    case 'axial-resistor':
      return [
        { terminalId: '1', position: [-AXIAL_R.span / 2, 0, 0] },
        { terminalId: '2', position: [AXIAL_R.span / 2, 0, 0] },
      ]
    case 'ei-transformer': {
      const [w, h, d] = g.size
      const y = h + 1.2
      return [
        { terminalId: 'p1', position: [-w * 0.3, y, d / 2 + 0.6] },
        { terminalId: 'p2', position: [-w * 0.12, y, d / 2 + 0.6] },
        { terminalId: 's1', position: [w * 0.12, y, d / 2 + 0.6] },
        { terminalId: 's2', position: [w * 0.3, y, d / 2 + 0.6] },
      ]
    }
    case 'toroid': {
      const r = g.outerDiameter / 2
      return [
        { terminalId: '1', position: [-0.5, 0, r + 0.4] },
        { terminalId: '2', position: [0.5, 0, r + 0.4] },
      ]
    }
    case 'ic':
      if (g.pkg === 'soic8') return dualRow(8, SOIC8.pitch, SOIC8.w / 2 + SOIC8.reach, 0)
      if (g.pkg === 'dip16') return dualRow(16, DIP16.pitch, DIP16.row / 2, 0)
      {
        // LQFP-64 pin groups (representative positions; several physical pins share a function).
        const e = LQFP64.l / 2 + LQFP64.reach
        const p = (n: number) => -LQFP64.l / 2 + 0.1 + n * LQFP64.pitch
        return [
          { terminalId: 'vdd', position: [-e, 0, p(1)] },
          { terminalId: 'nrst', position: [-e, 0, p(6)] },
          { terminalId: 'adc', position: [p(4), 0, e] },
          { terminalId: 'vss', position: [p(12), 0, e] },
          { terminalId: 'pwm', position: [e, 0, -p(6)] },
          { terminalId: 'swd', position: [-p(4), 0, -e] },
          { terminalId: 'boot0', position: [-p(12), 0, -e] },
        ]
      }
    case 'relay': {
      const [l, , w] = RELAY.size
      return [
        { terminalId: 'a1', position: [-l / 2 + 0.4, 0, -w / 2 + 0.5] },
        { terminalId: 'a2', position: [-l / 2 + 0.4, 0, w / 2 - 0.5] },
        { terminalId: 'com', position: [l / 2 - 0.45, 0, 0] },
        { terminalId: 'no', position: [0.2, 0, -w / 2 + 0.5] },
        { terminalId: 'nc', position: [0.2, 0, w / 2 - 0.5] },
      ]
    }
    case 'heatsink':
      return [{ terminalId: 'earth', position: [g.length / 2 - 0.6, g.height - 0.6, 0.05] }]
    case 'fan': {
      const s = g.size / 2
      return [
        { terminalId: 'v12', position: [g.depth / 2, -s + 0.4, s + FAN_WIRE] },
        { terminalId: 'gnd', position: [g.depth / 2, -s + 0.7, s + FAN_WIRE] },
        { terminalId: 'tach', position: [g.depth / 2, -s + 1.0, s + FAN_WIRE] },
      ]
    }
    case 'mega-fuse':
      return [
        { terminalId: '1', position: [-MEGA.lugX, MEGA.h + 0.35, 0] },
        { terminalId: '2', position: [MEGA.lugX, MEGA.h + 0.35, 0] },
      ]
    case 'din-breaker':
      return [
        { terminalId: 'in+', position: [-BREAKER.w / 4, BREAKER.h - 0.6, BREAKER.d - 1.2] },
        { terminalId: 'in-', position: [BREAKER.w / 4, BREAKER.h - 0.6, BREAKER.d - 1.2] },
        { terminalId: 'out+', position: [-BREAKER.w / 4, 0.6, BREAKER.d - 1.2] },
        { terminalId: 'out-', position: [BREAKER.w / 4, 0.6, BREAKER.d - 1.2] },
      ]
    case 'hall-sensor': {
      const x0 = (3 * HALL.pinPitch) / 2
      return ['v5', 'gnd', 'out', 'ref'].map((id, i) => ({ terminalId: id, position: [-x0 + i * HALL.pinPitch, 0, -HALL.size[2] / 2 + 0.2] as Vec3 }))
    }
    case 'voltage-sensor':
      return [
        { terminalId: 'in+', position: [-VSENSE.w / 2 + 0.4, 0.9, -0.35] },
        { terminalId: 'in-', position: [-VSENSE.w / 2 + 0.4, 0.9, 0.35] },
        { terminalId: 'vcc', position: [VSENSE.w / 2 - 0.25, 0.75, -0.25] },
        { terminalId: 'gnd', position: [VSENSE.w / 2 - 0.25, 0.75, 0] },
        { terminalId: 'out', position: [VSENSE.w / 2 - 0.25, 0.75, 0.25] },
      ]
    case 'pcb': {
      const [w, d] = g.size
      return [
        { terminalId: 'j-dc', position: [-w / 2 + 1.2, 0, d / 2 - 1.2] },
        { terminalId: 'j-ac', position: [w / 2 - 1.2, 0, d / 2 - 1.2] },
        { terminalId: 'j-ctrl', position: [w / 2 - 1.2, 0, -d / 2 + 1.0] },
      ]
    }
    case 'battery-terminal':
      return [{ terminalId: g.polarity, position: [0, BATT_TERM.studTop, 0] }]
    case 'dc-lugs':
      return [
        { terminalId: 'dc+', position: [-DC_LUGS.gap / 2, DC_LUGS.h + 0.25, 0] },
        { terminalId: 'dc-', position: [DC_LUGS.gap / 2, DC_LUGS.h + 0.25, 0] },
      ]
    case 'ac-terminal-block':
      return ['L', 'N', 'PE'].map((id, i) => ({ terminalId: id, position: [(i - 1) * AC_BLOCK.pitch, AC_BLOCK.h + 0.1, 0] as Vec3 }))
    case 'mc4':
      return [{ terminalId: g.polarity === '+' ? 'pv+' : 'pv-', position: [0, MC4.top, 0] }]
    case 'display-board':
      return ['vcc', 'gnd', 'sda', 'scl'].map((id, i) => ({ terminalId: id, position: [DISPLAY.w / 2 - 1.0, 0.8 + i * 0.25, -0.35] as Vec3 }))
    case 'pe-stud':
      return [{ terminalId: 'pe', position: [0, PE_STUD.top, 0] }]
    case 'enclosure-base':
    case 'enclosure-cover':
      return []
  }
}
