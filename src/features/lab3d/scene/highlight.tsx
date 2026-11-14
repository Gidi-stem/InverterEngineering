import type { ThreeElements } from '@react-three/fiber'
import { useContext, useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { HighlightContext, type Highlight } from './highlightContext'

const tint = (color: string, opacity: number) =>
  new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })

const TINTS: Record<Exclude<Highlight, 'none'>, THREE.MeshBasicMaterial> = {
  hover: tint('#9bb5ff', 0.32),
  selected: tint('#ffd166', 0.5),
  target: tint('#3ddc97', 0.45),
  wrong: tint('#ff6b6b', 0.6),
}
const noRaycast = () => {}

/**
 * Mesh that tints itself when its part is hovered, selected or targeted. The tint is a translucent
 * overlay sharing the mesh's geometry: robust on any shape (unlike normal-extruded outlines) and cheap.
 */
export function M({ children, ...props }: ThreeElements['mesh']) {
  const h = useContext(HighlightContext)
  const ref = useRef<THREE.Mesh>(null)
  useLayoutEffect(() => {
    const m = ref.current
    if (!m || h === 'none') return
    const overlay = new THREE.Mesh(m.geometry, TINTS[h])
    overlay.raycast = noRaycast
    overlay.renderOrder = 2
    m.add(overlay)
    return () => {
      m.remove(overlay)
    }
  }, [h])
  return (
    <mesh ref={ref} {...props}>
      {children}
    </mesh>
  )
}
