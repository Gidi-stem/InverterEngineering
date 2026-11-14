import { useMemo } from 'react'
import * as THREE from 'three'
import { BAND_HEX, resistorBands } from '../../logic/resistor'
import { AXIAL_R, DIP16, DO201, LQFP64, SOIC8, TO247 } from '../dims'
import { M } from '../highlight'
import { cachedGeometry, faceMaterials, mergedBoxes } from '../geometry'
import { MAT, colourMaterial, labelMaterial } from '../materials'
import { markingTexture } from '../textures'

/** TO-247: pin 1 left (G), 2 centre (D/C), 3 right (S/E) viewed from the marked face; metal tab at the back with mounting hole. */
export function To247({ kind, marking }: { kind: 'mosfet' | 'igbt'; marking: string }) {
  const { w, bodyH, t, leadL, tabAbove, pitch, holeY } = TO247
  const pinRow = kind === 'mosfet' ? 'G   D   S' : 'G   C   E'
  const front = labelMaterial(`to247|${marking}`, markingTexture([marking, kind === 'mosfet' ? 'N-CHANNEL' : 'CO-PACK DIODE', pinRow], '#1a1c21', '#c9d0dc', { w: 256, h: 320 }))
  const tabGeo = cachedGeometry('to247-tab', () => {
    const s = new THREE.Shape()
    s.moveTo(-w / 2, 0)
    s.lineTo(w / 2, 0)
    s.lineTo(w / 2, bodyH + tabAbove)
    s.lineTo(-w / 2, bodyH + tabAbove)
    s.closePath()
    const hole = new THREE.Path()
    hole.absarc(0, bodyH + tabAbove - holeY, 0.18, 0, Math.PI * 2, true)
    s.holes.push(hole)
    return new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: false })
  })
  const leads = mergedBoxes('to247-leads', [-pitch, 0, pitch].map((x) => ({ size: [0.12, leadL, 0.06] as [number, number, number], at: [x, leadL / 2, 0] as [number, number, number] })))
  const mats = useMemo(() => faceMaterials(MAT.blackPlastic, front), [front])
  return (
    <group>
      <M geometry={leads} material={MAT.tin} />
      <M position={[0, leadL + bodyH / 2, 0]} material={mats}>
        <boxGeometry args={[w, bodyH, t]} />
      </M>
      <M geometry={tabGeo} material={MAT.tin} position={[0, leadL, -t / 2 - 0.2]} />
    </group>
  )
}

/** Gull-wing / through-hole IC packages with pin-1 marker. */
export function IcPackage({ pkg, marking }: { pkg: 'soic8' | 'dip16' | 'lqfp64'; marking: string }) {
  if (pkg === 'soic8') {
    const { l, w, h, pitch, reach } = SOIC8
    const pins = mergedBoxes('soic8-pins', Array.from({ length: 8 }, (_, i) => {
      const k = i < 4 ? i : 7 - i
      return { size: [0.04, 0.02, reach + 0.04] as [number, number, number], at: [-1.5 * pitch + k * pitch, 0.01, (i < 4 ? 1 : -1) * (w / 2 + reach / 2 - 0.02)] as [number, number, number] }
    }))
    const top = labelMaterial(`ic|${marking}|soic`, markingTexture(['●  ' + marking], '#202228', '#c7ccd6', { w: 512, h: 384, mono: true, scale: 0.9 }))
    return (
      <group>
        <M geometry={pins} material={MAT.tin} />
        <M position={[0, h / 2 + 0.01, 0]} material={[MAT.blackPlastic, MAT.blackPlastic, top, MAT.blackPlastic, MAT.blackPlastic, MAT.blackPlastic]}>
          <boxGeometry args={[l, h, w]} />
        </M>
      </group>
    )
  }
  if (pkg === 'dip16') {
    const { l, w, h, pitch, row, standoff } = DIP16
    const pins = mergedBoxes('dip16-pins', Array.from({ length: 16 }, (_, i) => {
      const k = i < 8 ? i : 15 - i
      return { size: [0.05, standoff + h * 0.6, 0.03] as [number, number, number], at: [-3.5 * pitch + k * pitch, (standoff + h * 0.6) / 2, (i < 8 ? 1 : -1) * row / 2] as [number, number, number] }
    }))
    const top = labelMaterial(`ic|${marking}|dip`, markingTexture(['◖ ' + marking], '#202228', '#c7ccd6', { w: 768, h: 256, mono: true }))
    return (
      <group>
        <M geometry={pins} material={MAT.tin} />
        <M position={[0, standoff + h / 2, 0]} material={[MAT.blackPlastic, MAT.blackPlastic, top, MAT.blackPlastic, MAT.blackPlastic, MAT.blackPlastic]}>
          <boxGeometry args={[l, h, w]} />
        </M>
      </group>
    )
  }
  const { l, h, pitch, reach, perSide } = LQFP64
  const pins = mergedBoxes('lqfp64-pins', Array.from({ length: perSide * 4 }, (_, i) => {
    const side = Math.floor(i / perSide)
    const k = (i % perSide) - (perSide - 1) / 2
    const e = l / 2 + reach / 2
    const along = k * pitch
    const at: [number, number, number] = side === 0 ? [-e, 0.01, along] : side === 1 ? [along, 0.01, e] : side === 2 ? [e, 0.01, -along] : [-along, 0.01, -e]
    const size: [number, number, number] = side % 2 === 0 ? [reach, 0.015, 0.022] : [0.022, 0.015, reach]
    return { size, at }
  }))
  const top = labelMaterial(`ic|${marking}|lqfp`, markingTexture(['●', marking, 'ARM'], '#202228', '#c7ccd6', { w: 384, h: 384, mono: true }))
  return (
    <group>
      <M geometry={pins} material={MAT.tin} />
      <M position={[0, h / 2 + 0.01, 0]} material={[MAT.blackPlastic, MAT.blackPlastic, top, MAT.blackPlastic, MAT.blackPlastic, MAT.blackPlastic]}>
        <boxGeometry args={[l, h, l]} />
      </M>
    </group>
  )
}

/** Axial lead that rises from the PCB and bends horizontally into the body. */
function bentLeads(key: string, span: number, lift: number, bodyLen: number) {
  return mergedBoxes(key, [-1, 1].flatMap((s) => [
    { size: [0.08, lift, 0.08] as [number, number, number], at: [(s * span) / 2, lift / 2, 0] as [number, number, number] },
    { size: [(span - bodyLen) / 2 + 0.08, 0.08, 0.08] as [number, number, number], at: [s * (span / 2 - (span - bodyLen) / 4), lift, 0] as [number, number, number] },
  ]))
}

/** DO-201AD rectifier: black body, silver cathode band at +x (terminal K). */
export function AxialDiode({ marking }: { marking: string }) {
  const { len, d, span, lift } = DO201
  const body = labelMaterial(`diode|${marking}`, markingTexture([marking], '#18191d', '#b9bec7', { w: 512, h: 128, scale: 0.6 }))
  return (
    <group>
      <M geometry={bentLeads('do201-leads', span, lift, len)} material={MAT.tin} />
      <M position={[0, lift, 0]} rotation={[0, 0, Math.PI / 2]} material={body}>
        <cylinderGeometry args={[d / 2, d / 2, len, 24]} />
      </M>
      <M position={[len / 2 - 0.12, lift, 0]} rotation={[0, 0, Math.PI / 2]} material={MAT.silverBand}>
        <cylinderGeometry args={[d / 2 + 0.005, d / 2 + 0.005, 0.12, 24]} />
      </M>
    </group>
  )
}

/** Axial resistor with IEC 60062 colour bands computed from its value. */
export function AxialResistor({ ohms, tolerancePct }: { ohms: number; tolerancePct: 1 | 2 | 5 | 10 }) {
  const { len, d, span, lift } = AXIAL_R
  const bands = resistorBands(ohms, tolerancePct)
  const xs = [-0.36, -0.2, -0.04, 0.34]
  return (
    <group>
      <M geometry={bentLeads('axr-leads', span, lift, len)} material={MAT.tin} />
      <M position={[0, lift, 0]} rotation={[0, 0, Math.PI / 2]} material={MAT.beige}>
        <capsuleGeometry args={[d / 2, len - d, 6, 20]} />
      </M>
      {bands.map((b, i) => (
        <M key={i} position={[xs[i], lift, 0]} rotation={[0, 0, Math.PI / 2]} material={colourMaterial(BAND_HEX[b], b === 'gold' || b === 'silver' ? 0.8 : 0, 0.4)}>
          <cylinderGeometry args={[d / 2 + 0.01, d / 2 + 0.01, 0.08, 20]} />
        </M>
      ))}
    </group>
  )
}
