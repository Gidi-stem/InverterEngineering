import { OrbitControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import type { PartGeometry } from '../../../types/domain'
import { PartVisual } from '../scene/factories/PartVisual'
import { hasWebGL } from '../logic/webgl'

/** Frames the camera on the single part once it has rendered. */
function Fit({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null!)
  const get = useThree((s) => s.get)
  useLayoutEffect(() => {
    const { camera, controls: ctl, invalidate } = get()
    const controls = ctl as unknown as { target: THREE.Vector3; update: () => void } | null
    const box = new THREE.Box3().setFromObject(g.current)
    if (box.isEmpty()) return
    const c = box.getCenter(new THREE.Vector3())
    const r = box.getSize(new THREE.Vector3()).length() / 2
    const d = r / Math.tan(((camera as THREE.PerspectiveCamera).fov * Math.PI) / 360) * 1.15
    camera.position.set(c.x + d * 0.55, c.y + d * 0.5, c.z + d * 0.7)
    camera.near = d / 100
    camera.far = d * 10
    camera.updateProjectionMatrix()
    camera.lookAt(c)
    if (controls) {
      controls.target.copy(c)
      controls.update()
    }
    invalidate()
  }, [get])
  return <group ref={g}>{children}</group>
}

/** Isolated, rotatable 3D view of one part (drag to rotate). Renders only on interaction. */
export function ComponentPreview({ id, geometry }: { id: string; geometry: PartGeometry }) {
  if (!hasWebGL())
    return <div className="grid h-36 w-full place-items-center rounded-md border border-dashed border-chassis-600 p-3 text-center text-xs text-ink-500">3D preview needs WebGL. The pin table and symbol show the same identification.</div>
  return (
    <div className="h-36 w-full overflow-hidden rounded-md border border-chassis-700 bg-[#0a0f1d]" title="Drag to rotate">
      <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ fov: 35 }} aria-label="3D preview of the selected part">
        <hemisphereLight args={['#e6edff', '#1a2030', 0.9]} />
        <directionalLight position={[3, 6, 4]} intensity={1.8} />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} />
        <Fit key={id}>
          <PartVisual id={`preview-${id}`} g={geometry} />
        </Fit>
        <OrbitControls makeDefault enablePan={false} enableDamping={false} />
      </Canvas>
    </div>
  )
}
