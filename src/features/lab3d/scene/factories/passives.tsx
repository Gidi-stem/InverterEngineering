import * as THREE from 'three'
import type { Vec3 } from '../../../../types/domain'
import { SNAPIN_PITCH } from '../dims'
import { M } from '../highlight'
import { cachedGeometry, faceMaterials, mergedBoxes } from '../geometry'
import { MAT, labelMaterial } from '../materials'
import { capacitorSleeve, laminationTexture, markingTexture } from '../textures'

/** Snap-in aluminium electrolytic: sleeve with negative stripe on the −x side (over the − pin), vented aluminium top. */
export function Electrolytic({ diameter, height, rating }: { diameter: number; height: number; rating: string }) {
  const r = diameter / 2
  const sleeve = labelMaterial(`sleeve|${rating}`, capacitorSleeve(rating))
  const vent = mergedBoxes('cap-vent', [
    { size: [r * 1.3, 0.03, 0.06], at: [0, 0, 0] },
    { size: [r * 1.3, 0.03, 0.06], at: [0, 0, 0], rotY: Math.PI / 2 },
    { size: [r * 1.3, 0.03, 0.06], at: [0, 0, 0], rotY: Math.PI / 4 },
  ])
  return (
    <group>
      <M position={[SNAPIN_PITCH / 2, 0.08, 0]} material={MAT.tin}>
        <boxGeometry args={[0.12, 0.16, 0.06]} />
      </M>
      <M position={[-SNAPIN_PITCH / 2, 0.08, 0]} material={MAT.tin}>
        <boxGeometry args={[0.12, 0.16, 0.06]} />
      </M>
      <M position={[0, 0.16 + height / 2, 0]} material={[sleeve, MAT.aluminium, MAT.blackPlastic]}>
        <cylinderGeometry args={[r, r, height, 40]} />
      </M>
      <M position={[0, 0.16 + height + 0.005, 0]} geometry={vent} material={MAT.vent} />
    </group>
  )
}

/** Box-type polypropylene film capacitor with printed rating. */
export function FilmCap({ size, rating }: { size: Vec3; rating: string }) {
  const [w, h, t] = size
  const front = labelMaterial(`film|${rating}`, markingTexture(['MKP', rating], '#e1b02a', '#3b2d06', { w: 384, h: 320 }))
  return (
    <group>
      <M geometry={mergedBoxes(`film-leads-${w}`, [-1, 1].map((s) => ({ size: [0.08, 0.3, 0.08] as [number, number, number], at: [s * (w / 2 - 0.3), 0.15, 0] as [number, number, number] })))} material={MAT.tin} />
      <M position={[0, 0.3 + h / 2, 0]} material={faceMaterials(MAT.filmYellow, front)}>
        <boxGeometry args={[w, h, t]} />
      </M>
    </group>
  )
}

/** E-I laminated transformer: lamination stack with two windows filled by the winding, clamp feet, thick primary and thin secondary leads. */
export function EiTransformer({ size, rating }: { size: Vec3; rating: string }) {
  const [w, h, d] = size
  const leg = w * 0.17
  const yoke = h * 0.17
  const lam = labelMaterial('lamination', laminationTexture(), { metalness: 0.65, roughness: 0.45 })
  const sticker = labelMaterial(`xfmr|${rating}`, markingTexture(['T1  ' + rating, 'PRI P1–P2   SEC S1–S2', '⚠ 230 V OUTPUT'], '#f1f1ec', '#1d2230', { w: 640, h: 256 }))
  const coilW = w - 2 * leg
  const coilH = h - 2 * yoke
  const base = 0.4
  const leadMat = (i: number) => (i === 0 ? MAT.redPlastic : i === 1 ? MAT.blackPlastic : MAT.greyPlastic)
  return (
    <group>
      {/* Steel clamp feet */}
      <M position={[0, base / 2, 0]} material={MAT.steel}>
        <boxGeometry args={[w + 2.2, base * 0.5, d * 0.7]} />
      </M>
      {/* Lamination frame: two outer legs, top and bottom yokes */}
      <group position={[0, base, 0]}>
        <M position={[-w / 2 + leg / 2, h / 2, 0]} material={lam}>
          <boxGeometry args={[leg, h, d]} />
        </M>
        <M position={[w / 2 - leg / 2, h / 2, 0]} material={lam}>
          <boxGeometry args={[leg, h, d]} />
        </M>
        <M position={[0, yoke / 2, 0]} material={lam}>
          <boxGeometry args={[w - 2 * leg, yoke, d]} />
        </M>
        <M position={[0, h - yoke / 2, 0]} material={faceMaterials(lam, sticker)}>
          <boxGeometry args={[w - 2 * leg, yoke, d]} />
        </M>
        {/* Winding on the centre leg, protruding front and back */}
        <M position={[0, h / 2, 0]} material={MAT.enamel}>
          <boxGeometry args={[coilW * 0.98, coilH * 0.96, d + 1.6]} />
        </M>
        <M position={[0, h / 2, 0]} material={MAT.tape}>
          <boxGeometry args={[coilW * 0.99, coilH * 0.3, d + 1.7]} />
        </M>
        {/* Leads: thick primary (P1 red, P2 black), thin secondary (S1, S2 grey) */}
        {[-0.3, -0.12, 0.12, 0.3].map((fx, i) => {
          const thick = i < 2
          const len = 1.3
          return (
            <group key={fx} position={[fx * w, h - yoke * 0.5, d / 2 + 0.6]}>
              <M position={[0, len / 2 + 0.2, 0]} material={leadMat(i)}>
                <cylinderGeometry args={[thick ? 0.22 : 0.11, thick ? 0.22 : 0.11, len, 12]} />
              </M>
              <M position={[0, len + 0.25, 0]} rotation={[Math.PI / 2, 0, 0]} material={MAT.tin}>
                <torusGeometry args={[thick ? 0.26 : 0.16, 0.06, 8, 16]} />
              </M>
            </group>
          )
        })}
      </group>
    </group>
  )
}

/** Iron-powder toroid with a helical enamelled winding; axis vertical, leads exit at +z. */
export function Toroid({ outerDiameter, height, turns, rating }: { outerDiameter: number; height: number; turns: number; rating: string }) {
  const tube = height / 2
  const R = outerDiameter / 2 - tube
  const winding = cachedGeometry(`toroid-wind|${outerDiameter}|${height}|${turns}`, () => {
    class Helix extends THREE.Curve<THREE.Vector3> {
      constructor() {
        super()
      }
      getPoint(t: number, target = new THREE.Vector3()) {
        const phi = t * Math.PI * 2 * 0.86 + Math.PI * 0.57
        const theta = phi * turns
        const r = tube + 0.09
        return target.set((R + r * Math.cos(theta)) * Math.cos(phi), r * Math.sin(theta), (R + r * Math.cos(theta)) * Math.sin(phi))
      }
    }
    return new THREE.TubeGeometry(new Helix(), turns * 18, 0.07, 6, false)
  })
  const label = labelMaterial(`toroid|${rating}`, markingTexture([rating], '#d9c43a', '#3a2f05', { w: 256, h: 96 }))
  return (
    <group position={[0, tube + 0.05, 0]}>
      <M rotation={[Math.PI / 2, 0, 0]} material={MAT.ironPowder}>
        <torusGeometry args={[R, tube, 18, 48]} />
      </M>
      <M geometry={winding} material={MAT.enamel} />
      <M position={[0, tube + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={label}>
        <planeGeometry args={[1.6, 0.6]} />
      </M>
      {/* Centre mounting bolt and washer */}
      <M position={[0, 0, 0]} material={MAT.steel}>
        <cylinderGeometry args={[0.25, 0.25, height + 0.4, 12]} />
      </M>
      {[-0.5, 0.5].map((x) => (
        <M key={x} position={[x, -tube / 2, outerDiameter / 2 + 0.2]} material={MAT.enamel}>
          <boxGeometry args={[0.14, tube + 0.2, 0.6]} />
        </M>
      ))}
    </group>
  )
}
