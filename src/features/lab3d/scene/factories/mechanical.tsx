import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Vec3 } from '../../../../types/domain'
import { DISPLAY, FAN_WIRE } from '../dims'
import { M } from '../highlight'
import { cachedGeometry, mergedBoxes } from '../geometry'
import { MAT, labelMaterial } from '../materials'
import { lcdTexture, markingTexture, pcbTexture } from '../textures'

/** Extruded aluminium heat sink: mounting face at z = 0 (devices clamp here), fins extend towards −z. */
export function HeatSink({ length, height, finDepth, fins }: { length: number; height: number; finDepth: number; fins: number }) {
  const base = 0.6
  const finGeo = mergedBoxes(`fins|${length}|${height}|${finDepth}|${fins}`, Array.from({ length: fins }, (_, i) => ({
    size: [0.18, height, finDepth] as [number, number, number],
    at: [-length / 2 + 0.09 + (i * (length - 0.18)) / (fins - 1), height / 2, -base - finDepth / 2] as [number, number, number],
  })))
  return (
    <group>
      <M position={[0, height / 2, -base / 2]} material={MAT.anodised}>
        <boxGeometry args={[length, height, base]} />
      </M>
      <M geometry={finGeo} material={MAT.anodised} />
      <M position={[length / 2 - 0.6, height - 0.6, 0.05]} rotation={[Math.PI / 2, 0, 0]} material={MAT.steel}>
        <cylinderGeometry args={[0.22, 0.22, 0.12, 12]} />
      </M>
    </group>
  )
}

/** Axial fan, airflow along +x: square frame, hub with rating sticker, seven pitched blades, three-wire lead. */
export function Fan({ size, depth, rating }: { size: number; depth: number; rating: string }) {
  const s = size / 2
  const hub = labelMaterial(`fan|${rating}`, markingTexture(['DC 12V', rating], '#15171b', '#c9ced8', { w: 256, h: 256 }))
  const frame = mergedBoxes(`fan-frame|${size}|${depth}`, [
    { size: [depth, 0.5, size], at: [0, s - 0.25, 0] },
    { size: [depth, 0.5, size], at: [0, -s + 0.25, 0] },
    { size: [depth, size, 0.5], at: [0, 0, s - 0.25] },
    { size: [depth, size, 0.5], at: [0, 0, -s + 0.25] },
  ])
  const blades = cachedGeometry(`fan-blades|${size}`, () => {
    const parts: THREE.BufferGeometry[] = []
    for (let i = 0; i < 7; i++) {
      const g = new THREE.BoxGeometry(0.08, s - 1.6, 1.5)
      g.translate(0, (s - 1.6) / 2 + 1.25, 0)
      g.rotateY(0.45)
      g.rotateX((i / 7) * Math.PI * 2)
      parts.push(g)
    }
    return mergeGeometries(parts)
  })
  const wireCols = [MAT.redPlastic, MAT.blackPlastic, MAT.yellowPlastic]
  return (
    <group>
      <M geometry={frame} material={MAT.blackPlastic} />
      <M rotation={[0, 0, Math.PI / 2]} material={[MAT.blackPlastic, hub, hub]}>
        <cylinderGeometry args={[1.3, 1.3, depth * 0.8, 24]} />
      </M>
      <M geometry={blades} material={MAT.blackPlastic} />
      {wireCols.map((m, i) => (
        <M key={i} position={[depth / 2, -s + 0.4 + i * 0.3, s + FAN_WIRE / 2]} rotation={[Math.PI / 2, 0, 0]} material={m}>
          <cylinderGeometry args={[0.07, 0.07, FAN_WIRE, 6]} />
        </M>
      ))}
    </group>
  )
}

const noRaycast = () => {}

/** Printed circuit board on standoffs. Origin is the top copper surface; standoffs reach down to y = −1. */
export function Pcb({ id, size, color, silk }: { id: string; size: [number, number]; color: 'green' | 'blue'; silk: { at: [number, number]; text: string }[] }) {
  const [w, d] = size
  const tex = pcbTexture(id, size, color, silk)
  const top = labelMaterial(`pcb|${id}`, tex)
  const edge = color === 'green' ? MAT.pcbGreen : MAT.pcbBlue
  const standoffs = mergedBoxes(`standoffs|${w}|${d}`, [-1, 1].flatMap((sx) => [-1, 1].map((sz) => ({ size: [0.35, 0.84, 0.35] as [number, number, number], at: [sx * (w / 2 - 0.45), -0.58, sz * (d / 2 - 0.45)] as [number, number, number] }))))
  return (
    <group>
      <M position={[0, -0.08, 0]} material={[edge, edge, top, edge, edge, edge]}>
        <boxGeometry args={[w, 0.16, d]} />
      </M>
      <M geometry={standoffs} material={MAT.brass} />
    </group>
  )
}

/** Enclosure tray: base plate, side walls with vent slots, back wall, and a front wall with the display window. */
export function EnclosureBase({ size, displayWindow, xray = false }: { size: Vec3; displayWindow: boolean; xray?: boolean }) {
  const [W, H, D] = size
  const t = 0.15
  const front = cachedGeometry(`front-wall|${W}|${H}|${displayWindow}`, () => {
    const s = new THREE.Shape()
    s.moveTo(-W / 2, 0)
    s.lineTo(W / 2, 0)
    s.lineTo(W / 2, H)
    s.lineTo(-W / 2, H)
    s.closePath()
    const win = new THREE.Path()
    win.moveTo(2.5, 3.2)
    win.lineTo(10.5, 3.2)
    win.lineTo(10.5, 7.9)
    win.lineTo(2.5, 7.9)
    win.closePath()
    if (displayWindow) s.holes.push(win)
    return new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false })
  })
  const vents = mergedBoxes(`vents|${W}|${H}|${D}`, [-1, 1].flatMap((sx) =>
    Array.from({ length: 9 }, (_, i) => ({ size: [0.05, H * 0.45, 0.45] as [number, number, number], at: [sx * (W / 2 + 0.01), H * 0.5, -D / 2 + 3 + i * ((D - 6) / 8)] as [number, number, number] })),
  ))
  // In X-ray view the walls are drawn see-through and ignore clicks; the base plate still selects the enclosure.
  const wall = xray ? MAT.chassisXray : MAT.chassis
  const rc = xray ? noRaycast : undefined
  return (
    <group>
      <M position={[0, t / 2, 0]} material={MAT.chassisInner}>
        <boxGeometry args={[W, t, D]} />
      </M>
      <M position={[-W / 2 + t / 2, H / 2, 0]} material={wall} raycast={rc}>
        <boxGeometry args={[t, H, D]} />
      </M>
      <M position={[W / 2 - t / 2, H / 2, 0]} material={wall} raycast={rc}>
        <boxGeometry args={[t, H, D]} />
      </M>
      <M position={[0, H / 2, -D / 2 + t / 2]} material={wall} raycast={rc}>
        <boxGeometry args={[W, H, t]} />
      </M>
      <M geometry={front} position={[0, 0, D / 2 - t]} material={wall} raycast={rc} />
      {!xray && <M geometry={vents} material={MAT.vent} />}
    </group>
  )
}

/** Top cover with louvres and nameplate carrying the stored-energy warning. */
export function EnclosureCover({ size, nameplate }: { size: Vec3; nameplate: string[] }) {
  const [W, H, D] = size
  const plate = labelMaterial(`nameplate|${nameplate.join('/')}`, markingTexture(nameplate, '#e9ebef', '#1b2130', { w: 768, h: 384 }))
  const louvres = mergedBoxes(`louvres|${W}|${D}`, Array.from({ length: 10 }, (_, i) => ({ size: [0.5, 0.05, D * 0.35] as [number, number, number], at: [-W / 2 + 3 + i * 1.0, 0.1, -D * 0.15] as [number, number, number] })))
  return (
    <group position={[0, H, 0]}>
      <M position={[0, 0.075, 0]} material={MAT.chassis}>
        <boxGeometry args={[W + 0.3, 0.15, D + 0.3]} />
      </M>
      <M geometry={louvres} material={MAT.vent} />
      <M position={[W * 0.18, 0.16, D * 0.12]} rotation={[-Math.PI / 2, 0, 0]} material={plate}>
        <planeGeometry args={[14, 7]} />
      </M>
    </group>
  )
}

/** Front display board: vertical PCB facing +z, LCD with live readings, three buttons and status LEDs. */
export function DisplayBoard({ lines }: { lines: string[] }) {
  const { w, h } = DISPLAY
  const lcd = labelMaterial(`lcd|${lines.join('/')}`, lcdTexture(lines), { emissive: true })
  const buttons = mergedBoxes('disp-buttons', [-1.8, -0.6, 0.6].map((x) => ({ size: [0.6, 0.6, 0.3] as [number, number, number], at: [x, 0.9, 0.25] as [number, number, number] })))
  return (
    <group>
      <M position={[0, h / 2, -0.08]} material={MAT.pcbGreen}>
        <boxGeometry args={[w, h, 0.16]} />
      </M>
      <M position={[0, h * 0.6, 0.2]} material={MAT.blackPlastic}>
        <boxGeometry args={[6.4, 3.0, 0.4]} />
      </M>
      <M position={[0, h * 0.6, 0.41]} material={lcd}>
        <planeGeometry args={[6.0, 2.6]} />
      </M>
      <M geometry={buttons} material={MAT.greyPlastic} />
      {[MAT.ledGreen, MAT.ledAmber, MAT.ledRed].map((m, i) => (
        <M key={i} position={[1.9 + i * 0.6, 0.9, 0.12]} material={m}>
          <sphereGeometry args={[0.16, 12, 8]} />
        </M>
      ))}
      <M geometry={mergedBoxes('disp-header', [0, 1, 2, 3].map((i) => ({ size: [0.08, 0.08, 0.45] as [number, number, number], at: [w / 2 - 1.0, 0.8 + i * 0.25, -0.35] as [number, number, number] })))} material={MAT.brass} />
    </group>
  )
}
