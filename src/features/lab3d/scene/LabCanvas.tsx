import { CameraControls, ContactShadows, Environment, Grid, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { Canvas, events as pointerEvents, useThree } from '@react-three/fiber'
import type CameraControlsImpl from 'camera-controls'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { InverterModel } from '../../../types/domain'
import { useLab } from '../store/labStore'
import { PartNode } from './PartNode'
import { partObjects } from './registry'

/** Three's raycaster also hits invisible objects; hidden and removed parts must never take a click. */
function visibleChain(o: THREE.Object3D | null): boolean {
  for (let n = o; n; n = n.parent) if (!n.visible) return false
  return true
}
const filteredEvents: typeof pointerEvents = (store) => ({
  ...pointerEvents(store),
  filter: (items) => items.filter((i) => visibleChain(i.object)),
})

function defaultView(m: InverterModel) {
  const [W, H] = m.size
  // ≈56° elevation from front-right: high enough to see over the front wall and heat sink.
  return { pos: [W * 0.45, W * 1.25, W * 0.7] as const, target: [0, H * 0.2, 0] as const }
}

/** Camera: orbit (left drag / one finger), dolly (wheel / pinch), truck (right drag / two fingers); frames selections smoothly. */
function CameraRig({ model }: { model: InverterModel }) {
  const ref = useRef<CameraControlsImpl>(null)
  const focus = useLab((s) => s.focus)
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    // Wait one frame so newly mounted parts have registered and laid out.
    const id = requestAnimationFrame(() => {
      const smooth = focus.nonce > 0
      const ids = focus.target === 'all' || focus.target === 'reset' ? [...partObjects.keys()] : focus.target
      const box = new THREE.Box3()
      for (const pid of ids) {
        const o = partObjects.get(pid)
        if (o && o.visible) box.expandByObject(o)
      }
      if (focus.target === 'reset') {
        // Three-quarter view from front-right and above, then fit the whole model (fitToSphere keeps the angle).
        const v = defaultView(model)
        void c.setLookAt(...v.pos, ...v.target, false)
      }
      const single = Array.isArray(focus.target) && focus.target.length <= 2
      if (single) {
        // Look down steeply at small parts so taller neighbours (capacitors, heat sink) do not block the view.
        void c.rotatePolarTo(0.62, smooth)
      }
      if (!box.isEmpty()) {
        const sphere = box.getBoundingSphere(new THREE.Sphere())
        sphere.radius = Math.max(sphere.radius * (focus.target === 'reset' ? 0.82 : 1.1), single ? 4 : 1.5)
        void c.fitToSphere(sphere, smooth)
      }
      invalidate()
    })
    return () => cancelAnimationFrame(id)
  }, [focus, model, invalidate])

  return <CameraControls ref={ref} makeDefault minDistance={3} maxDistance={model.size[0] * 4} smoothTime={0.3} dollyToCursor />
}

function Lighting() {
  return (
    <>
      <hemisphereLight args={['#dfe8ff', '#141a2a', 0.55]} />
      <directionalLight position={[20, 40, 25]} intensity={1.7} />
      <directionalLight position={[-30, 18, -20]} intensity={0.45} color="#b8c8ff" />
      {/* Local light-formers: reflections for metal parts without downloading an HDR map. */}
      <Environment resolution={64} frames={1}>
        <Lightformer intensity={2.2} position={[0, 8, 6]} scale={[12, 4, 1]} />
        <Lightformer intensity={1.2} position={[-8, 3, -4]} scale={[6, 6, 1]} rotation-y={Math.PI / 2} color="#9bb5ff" />
        <Lightformer intensity={0.8} position={[8, 2, -6]} scale={[6, 4, 1]} rotation-y={-Math.PI / 2} />
      </Environment>
    </>
  )
}

/** Debug and browser-test hook (read-only views of the live scene). */
function TestHook({ model }: { model: InverterModel }) {
  const invalidate = useThree((s) => s.invalidate)
  const gl = useThree((s) => s.gl)
  const get = useThree((s) => s.get)
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>
    w.__inverterLab = {
      state: () => useLab.getState(),
      position: (id: string) => partObjects.get(id)?.position.toArray(),
      visible: (id: string) => partObjects.get(id)?.visible,
      drawCalls: () => gl.info.render.calls,
      frames: () => gl.info.render.frame,
      partsOf: (componentId: string) => model.parts.filter((p) => p.componentId === componentId).map((p) => p.id),
      /** Canvas-relative pixel position of a part's bounding-box centre (for click tests). */
      screen: (id: string) => {
        const o = partObjects.get(id)
        if (!o) return null
        const { camera, size } = get()
        const c = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()).project(camera)
        const r = gl.domElement.getBoundingClientRect()
        return { x: r.left + ((c.x + 1) / 2) * size.width, y: r.top + ((1 - c.y) / 2) * size.height }
      },
      invalidate,
    }
    return () => {
      delete w.__inverterLab
    }
  }, [invalidate, gl, get, model])
  return null
}

export function LabCanvas({ model }: { model: InverterModel }) {
  const [dpr, setDpr] = useState(1.5)
  const select = useLab((s) => s.select)
  const v = defaultView(model)
  return (
    <Canvas
      frameloop="demand"
      events={filteredEvents}
      dpr={dpr}
      camera={{ position: [...v.pos], fov: 35, near: 0.5, far: 600 }}
      gl={{ antialias: true, powerPreference: 'default' }}
      onPointerMissed={(e) => {
        if (e.type === 'click' && useLab.getState().mode === 'explore') select(null)
      }}
      aria-label="Interactive 3D inverter model"
    >
      <color attach="background" args={['#0b1020']} />
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(Math.min(window.devicePixelRatio, 1.75))} />
      <Lighting />
      <Grid position={[0, -0.01, 0]} args={[200, 200]} cellSize={1} cellThickness={0.5} cellColor="#1a2340" sectionSize={10} sectionThickness={1} sectionColor="#2a3656" fadeDistance={160} fadeStrength={1.5} infiniteGrid />
      <ContactShadows position={[0, 0, 0]} scale={model.size[0] * 2} blur={2.2} far={14} opacity={0.55} resolution={512} frames={1} />
      <group key={model.id}>
        {model.parts.map((p) => (
          <PartNode key={p.id} model={model} part={p} />
        ))}
      </group>
      <CameraRig model={model} />
      <TestHook model={model} />
    </Canvas>
  )
}
