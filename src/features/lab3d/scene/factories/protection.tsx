import { BREAKER, HALL, MEGA, RELAY, VSENSE } from '../dims'
import { M } from '../highlight'
import { faceMaterials, mergedBoxes } from '../geometry'
import { MAT, labelMaterial } from '../materials'
import { markingTexture } from '../textures'
import { terminalsFor } from '../terminals'
import { IcPackage } from './semiconductors'

/** Sugar-cube power relay with terminal designations moulded on the top beside each pin. */
export function Relay({ marking }: { marking: string }) {
  const [l, h, w] = RELAY.size
  const front = labelMaterial(`relay|${marking}`, markingTexture([marking, 'COIL 12VDC', '30A 250VAC~'], '#1f4fa6', '#e8edf6', { w: 384, h: 320 }))
  const top = labelMaterial('relay-top', markingTexture(['A1        NO', '          COM', 'A2        NC'], '#1f4fa6', '#e8edf6', { w: 384, h: 320, mono: true }))
  const pins = terminalsFor({ factory: 'relay', marking })
  return (
    <group>
      <M geometry={mergedBoxes('relay-pins', pins.map((p) => ({ size: [0.1, 0.3, 0.3] as [number, number, number], at: [p.position[0], 0.15, p.position[2]] as [number, number, number] })))} material={MAT.tin} />
      <M position={[0, 0.3 + h / 2, 0]} material={faceMaterials(MAT.bluePlastic, front, top)}>
        <boxGeometry args={[l, h, w]} />
      </M>
    </group>
  )
}

/** Bolt-down MEGA fuse on an insulating holder: clear body showing the fusible copper link. */
export function MegaFuse({ amps }: { amps: number }) {
  const label = labelMaterial(`mega|${amps}`, markingTexture([`MEGA ${amps}A`, '70V DC'], '#e8442e', '#ffffff', { w: 256, h: 160 }))
  return (
    <group>
      <M position={[0, MEGA.h / 2, 0]} material={MAT.blackPlastic}>
        <boxGeometry args={[MEGA.len, MEGA.h, 2.2]} />
      </M>
      <M position={[0, MEGA.h + 0.12, 0]} material={MAT.copper}>
        <boxGeometry args={[MEGA.len - 0.4, 0.06, 1.0]} />
      </M>
      <M position={[0, MEGA.h + 0.4, 0]} material={MAT.clear}>
        <boxGeometry args={[3.2, 0.8, 1.5]} />
      </M>
      <M position={[0, MEGA.h + 0.81, 0]} rotation={[-Math.PI / 2, 0, 0]} material={label}>
        <planeGeometry args={[2.2, 1.0]} />
      </M>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * MEGA.lugX, MEGA.h + 0.15, 0]}>
          <M material={MAT.steel}>
            <cylinderGeometry args={[0.42, 0.42, 0.12, 6]} />
          </M>
          <M position={[0, 0.14, 0]} material={MAT.steel}>
            <cylinderGeometry args={[0.18, 0.18, 0.3, 10]} />
          </M>
        </group>
      ))}
    </group>
  )
}

/** Two-pole polarised DC MCB on a DIN rail; front faces +z, line terminals at the top. */
export function DinBreaker({ rating }: { rating: string }) {
  const { w, h, d } = BREAKER
  const face = labelMaterial(`mcb|${rating}`, markingTexture(['+ ↑      − ↑', rating, 'DC 500V', '', 'I-ON  O-OFF', '+ ↓      − ↓'], '#eceef1', '#1e2430', { w: 256, h: 512 }))
  const pts = terminalsFor({ factory: 'din-breaker', rating })
  return (
    <group>
      <M position={[0, h / 2, 0.4]} material={MAT.steel}>
        <boxGeometry args={[w + 2, 3.5, 0.15]} />
      </M>
      <M position={[0, h / 2, d / 2]} material={faceMaterials(MAT.lightPlastic, face)}>
        <boxGeometry args={[w, h, d - 1.4]} />
      </M>
      <M position={[0, h / 2, d - 0.4]} material={MAT.lightPlastic}>
        <boxGeometry args={[w, h * 0.45, 0.8]} />
      </M>
      {/* Toggle handle (ON = up) */}
      <M position={[0, h / 2 + 0.6, d + 0.2]} material={MAT.blackPlastic}>
        <boxGeometry args={[w * 0.8, 0.9, 0.9]} />
      </M>
      {pts.map((p) => (
        <M key={p.terminalId} position={[p.position[0], p.position[1], p.position[2] + 0.25]} rotation={[Math.PI / 2, 0, 0]} material={MAT.steel}>
          <cylinderGeometry args={[0.28, 0.28, 0.12, 12]} />
        </M>
      ))}
    </group>
  )
}

/** Hall-effect current sensor: housing with square primary aperture and a busbar through it; four pins underneath. */
export function HallSensor({ marking }: { marking: string }) {
  const [l, h, w] = HALL.size
  const a = 0.9
  const side = (l - a) / 2
  const label = labelMaterial(`hall|${marking}`, markingTexture([marking, '→ I'], '#1a1c21', '#cfd5df', { w: 256, h: 160 }))
  const pins = terminalsFor({ factory: 'hall-sensor', marking })
  const y0 = 0.25
  return (
    <group>
      <M geometry={mergedBoxes('hall-pins', pins.map((p) => ({ size: [0.06, y0, 0.06] as [number, number, number], at: [p.position[0], y0 / 2, p.position[2]] as [number, number, number] })))} material={MAT.tin} />
      <group position={[0, y0, 0]}>
        <M position={[-(a + side) / 2, h / 2, 0]} material={MAT.blackPlastic}>
          <boxGeometry args={[side, h, w]} />
        </M>
        <M position={[(a + side) / 2, h / 2, 0]} material={faceMaterials(MAT.blackPlastic, label)}>
          <boxGeometry args={[side, h, w]} />
        </M>
        <M position={[0, (h - a) / 4, 0]} material={MAT.blackPlastic}>
          <boxGeometry args={[a, (h - a) / 2, w]} />
        </M>
        <M position={[0, h - (h - a) / 4, 0]} material={MAT.blackPlastic}>
          <boxGeometry args={[a, (h - a) / 2, w]} />
        </M>
        <M position={[0, h / 2, 0]} material={MAT.copper}>
          <boxGeometry args={[0.6, 0.35, w + 2.2]} />
        </M>
      </group>
    </group>
  )
}

/** Isolated voltage-sensing module: divider chain, isolation amplifier, HV screw terminal and LV header. */
export function VoltageSensor({ marking }: { marking: string }) {
  const { w, d } = VSENSE
  const label = labelMaterial(`vs|${marking}`, markingTexture([marking, 'HV ⚠    |    LV'], '#1c3f8f', '#e6ecf7', { w: 384, h: 256 }))
  return (
    <group>
      <M position={[0, 0.3, 0]} material={[MAT.pcbBlue, MAT.pcbBlue, label, MAT.pcbBlue, MAT.pcbBlue, MAT.pcbBlue]}>
        <boxGeometry args={[w, 0.16, d]} />
      </M>
      <M position={[-w / 2 + 0.4, 0.65, 0]} material={MAT.greenPlastic}>
        <boxGeometry args={[0.7, 0.55, 1.2]} />
      </M>
      <M position={[w / 2 - 0.25, 0.55, 0]} material={MAT.blackPlastic}>
        <boxGeometry args={[0.25, 0.25, 0.8]} />
      </M>
      <M geometry={mergedBoxes('vs-header', [-0.25, 0, 0.25].map((z) => ({ size: [0.06, 0.4, 0.06] as [number, number, number], at: [w / 2 - 0.25, 0.75, z] as [number, number, number] })))} material={MAT.brass} />
      <M geometry={mergedBoxes('vs-res', [-0.5, 0, 0.5].map((z) => ({ size: [0.6, 0.12, 0.2] as [number, number, number], at: [-0.4, 0.44, z] as [number, number, number] })))} material={MAT.blackPlastic} />
      <group position={[0.6, 0.38, 0]}>
        <IcPackage pkg="soic8" marking="ISO AMP" />
      </group>
    </group>
  )
}
