import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const geoCache = new Map<string, THREE.BufferGeometry>()

/** Cached geometry: built once per key and shared by every instance (e.g. all four MOSFETs). */
export function cachedGeometry(key: string, build: () => THREE.BufferGeometry): THREE.BufferGeometry {
  let g = geoCache.get(key)
  if (!g) geoCache.set(key, (g = build()))
  return g
}

/** Merge many translated boxes into one geometry: one draw call for fins, pins, vents. */
export function mergedBoxes(key: string, boxes: { size: [number, number, number]; at: [number, number, number]; rotY?: number }[]) {
  return cachedGeometry(key, () =>
    mergeGeometries(
      boxes.map((b) => {
        const g = new THREE.BoxGeometry(...b.size)
        if (b.rotY) g.rotateY(b.rotY)
        g.translate(...b.at)
        return g
      }),
    ),
  )
}

/** Box with a labelled +z face (BoxGeometry face order: +x, −x, +y, −y, +z, −z). */
export function faceMaterials(side: THREE.Material, front: THREE.Material, top?: THREE.Material): THREE.Material[] {
  return [side, side, top ?? side, side, front, side]
}
