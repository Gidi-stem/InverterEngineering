import { AC_BLOCK, BATT_TERM, DC_LUGS, MC4, PE_STUD } from '../dims'
import { M } from '../highlight'
import { MAT, labelMaterial } from '../materials'
import { earthStripeTexture, markingTexture } from '../textures'

/** Battery stud terminal: insulating base, M8 stud with nut, coloured boot, engraved polarity mark. */
export function BatteryTerminal({ polarity }: { polarity: '+' | '-' }) {
  const pos = polarity === '+'
  const mark = labelMaterial(`batt|${polarity}`, markingTexture([pos ? '+ BAT' : '− BAT'], pos ? '#c4262e' : '#1a1c21', '#ffffff', { w: 256, h: 128 }))
  return (
    <group>
      <M position={[0, 0.5, 0]} material={[MAT.greyPlastic, MAT.greyPlastic, mark, MAT.greyPlastic, MAT.greyPlastic, MAT.greyPlastic]}>
        <boxGeometry args={[2.4, 1.0, 2.4]} />
      </M>
      <M position={[0, 1.0 + (BATT_TERM.studTop - 1.0) / 2, 0]} material={MAT.brass}>
        <cylinderGeometry args={[0.4, 0.4, BATT_TERM.studTop - 1.0, 16]} />
      </M>
      <M position={[0, 1.55, 0]} material={MAT.steel}>
        <cylinderGeometry args={[0.72, 0.72, 0.35, 6]} />
      </M>
      <M position={[0, 1.95, 0.0]} material={pos ? MAT.redPlastic : MAT.blackPlastic}>
        <cylinderGeometry args={[0.95, 1.05, 0.35, 20, 1, true]} />
      </M>
    </group>
  )
}

/** PCB-mounted DC input lugs, DC+ (red mark) and DC− (black mark). */
export function DcLugs() {
  return (
    <group>
      {[-1, 1].map((s) => {
        const plus = s < 0
        const mark = labelMaterial(`dclug|${plus}`, markingTexture([plus ? 'DC+' : 'DC−'], plus ? '#c4262e' : '#1a1c21', '#fff', { w: 128, h: 128 }))
        return (
          <group key={s} position={[(s * DC_LUGS.gap) / 2, 0, 0]}>
            <M position={[0, DC_LUGS.h / 2, 0]} material={[MAT.tin, MAT.tin, mark, MAT.tin, MAT.tin, MAT.tin]}>
              <boxGeometry args={[1.1, DC_LUGS.h, 1.1]} />
            </M>
            <M position={[0, DC_LUGS.h + 0.12, 0]} material={MAT.steel}>
              <cylinderGeometry args={[0.36, 0.36, 0.25, 6]} />
            </M>
          </group>
        )
      })}
    </group>
  )
}

/** Three-way AC output block: L (brown), N (blue), PE (green/yellow) with rising-clamp screws. */
export function AcTerminalBlock() {
  const mats = [MAT.brownPlastic, MAT.bluePlastic, null] as const
  const labels = ['L', 'N', 'PE']
  const stripe = labelMaterial('earth-stripe', earthStripeTexture())
  return (
    <group>
      {labels.map((l, i) => {
        const top = labelMaterial(`acb|${l}`, markingTexture([l], i === 0 ? '#7b4a24' : i === 1 ? '#1f4fa6' : '#2e9d44', '#ffffff', { w: 128, h: 128 }))
        const body = mats[i] ?? stripe
        return (
          <group key={l} position={[(i - 1) * AC_BLOCK.pitch, 0, 0]}>
            <M position={[0, AC_BLOCK.h / 2, 0]} material={[MAT.greyPlastic, MAT.greyPlastic, top, MAT.greyPlastic, body, MAT.greyPlastic]}>
              <boxGeometry args={[0.98, AC_BLOCK.h, 1.8]} />
            </M>
            <M position={[0, AC_BLOCK.h + 0.03, -0.45]} material={MAT.steel}>
              <cylinderGeometry args={[0.26, 0.26, 0.08, 12]} />
            </M>
          </group>
        )
      })}
    </group>
  )
}

/** Panel-mount MC4-type PV connector (male body for PV+, female sleeve for PV−) with moulded marking. */
export function Mc4({ polarity }: { polarity: '+' | '-' }) {
  const plus = polarity === '+'
  const mark = labelMaterial(`mc4|${polarity}`, markingTexture([plus ? 'PV+' : 'PV−'], plus ? '#c4262e' : '#1a1c21', '#fff', { w: 128, h: 128 }))
  return (
    <group>
      <M position={[0, 0.1, 0]} material={[MAT.greyPlastic, MAT.greyPlastic, mark, MAT.greyPlastic, MAT.greyPlastic, MAT.greyPlastic]}>
        <boxGeometry args={[1.6, 0.2, 1.6]} />
      </M>
      <M position={[0, 0.38, 0]} material={MAT.blackPlastic}>
        <cylinderGeometry args={[0.75, 0.75, 0.35, 6]} />
      </M>
      <M position={[0, 0.55 + (MC4.top - 0.55) / 2, 0]} material={MAT.blackPlastic}>
        <cylinderGeometry args={plus ? [0.42, 0.42, MC4.top - 0.55, 20] : [0.55, 0.55, MC4.top - 0.55, 20]} />
      </M>
      {plus ? (
        <M position={[0, MC4.top - 0.3, 0]} material={MAT.tin}>
          <cylinderGeometry args={[0.15, 0.15, 0.6, 12]} />
        </M>
      ) : (
        <M position={[0, MC4.top - 0.2, 0]} material={MAT.rubber}>
          <cylinderGeometry args={[0.32, 0.32, 0.42, 16]} />
        </M>
      )}
      <M position={[0, MC4.top - 0.9, 0]} material={plus ? MAT.redPlastic : MAT.bluePlastic}>
        <torusGeometry args={[plus ? 0.43 : 0.56, 0.05, 6, 20]} />
      </M>
    </group>
  )
}

/** Protective-earth stud: brass stud, star washer, nut, ring lug and green/yellow conductor, earth symbol plate. */
export function PeStud() {
  const plate = labelMaterial('pe-plate', markingTexture(['⏚', 'PE'], '#2e9d44', '#ffffff', { w: 128, h: 128 }))
  const stripe = labelMaterial('earth-stripe', earthStripeTexture())
  return (
    <group>
      <M position={[0, 0.05, 0]} material={[MAT.steel, MAT.steel, plate, MAT.steel, MAT.steel, MAT.steel]}>
        <boxGeometry args={[1.6, 0.1, 1.6]} />
      </M>
      <M position={[0, PE_STUD.top / 2, 0]} material={MAT.brass}>
        <cylinderGeometry args={[0.25, 0.25, PE_STUD.top, 12]} />
      </M>
      <M position={[0, 0.55, 0]} material={MAT.steel}>
        <cylinderGeometry args={[0.48, 0.48, 0.25, 6]} />
      </M>
      <M position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} material={MAT.tin}>
        <torusGeometry args={[0.38, 0.08, 8, 16]} />
      </M>
      <M position={[0, 0.35, 1.3]} rotation={[Math.PI / 2, 0, 0]} material={stripe}>
        <cylinderGeometry args={[0.16, 0.16, 2.0, 10]} />
      </M>
    </group>
  )
}
