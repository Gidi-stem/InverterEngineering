import { Html } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { PANEL_ENTRY_BY_ID } from '../../../content/components'
import { useProgress } from '../../../store/progressStore'
import type { InverterModel, ModelPart, Vec3 } from '../../../types/domain'
import { canInstall, canRemove } from '../logic/procedure'
import { isPartShown, useLab } from '../store/labStore'
import { PartVisual } from './factories/PartVisual'
import { HighlightContext, type Highlight } from './highlightContext'
import { MAT } from './materials'
import { partObjects } from './registry'
import { terminalsFor } from './terminals'

const MIN_HIT = 0.9
/** Parts with gaps between their pieces (lug pairs, studs with leads) get a full-bounds hit target. */
const SPARSE_VOLUME = 8
const markerGeo = new THREE.SphereGeometry(0.13, 10, 8)
const noRaycast = () => null

/** World-space explode direction: the part's own offset plus that of the board it is mounted on. */
function explodeVector(model: InverterModel, part: ModelPart): Vec3 {
  const board = part.mountedOn ? model.parts.find((p) => p.id === part.mountedOn) : undefined
  const b = board?.explodeOffset ?? [0, 0, 0]
  return [part.explodeOffset[0] + b[0], part.explodeOffset[1] + b[1], part.explodeOffset[2] + b[2]]
}

export function PartNode({ model, part }: { model: InverterModel; part: ModelPart }) {
  const outer = useRef<THREE.Group>(null!)
  const inner = useRef<THREE.Group>(null!)
  const invalidate = useThree((s) => s.invalidate)
  const [box, setBox] = useState<{ center: Vec3; size: Vec3; top: Vec3 } | null>(null)
  const [flash, setFlash] = useState<'ok' | 'wrong' | null>(null)
  const level = useProgress((s) => s.level)

  const shown = useLab((s) => isPartShown(s, model, part.id))
  const removed = useLab((s) => s.removed.includes(part.id))
  const explode = useLab((s) => s.explode)
  const showLabel = useLab((s) => s.showLabels && s.mode !== 'identify')
  const showConn = useLab((s) => s.showConnections && s.mode !== 'identify')
  const flashEvt = useLab((s) => (s.flash?.partId === part.id ? s.flash : null))
  const highlight = useLab((s): Highlight => {
    if (s.selectedId === part.id && s.mode === 'explore') return 'selected'
    if (s.hoveredId === part.id) return 'hover'
    const guided = level === 'beginner' || s.showHint
    if (guided && s.mode === 'disassemble' && !s.checkpoint && canRemove(model, s.removed, s.actionsDone, part.id).ok) return 'target'
    if (guided && s.mode === 'reassemble' && canInstall(model, s.removed, part.id).ok) return 'target'
    return 'none'
  })
  const selected = useLab((s) => s.selectedId === part.id)
  const xray = useLab((s) => part.geometry.factory === 'enclosure-base' && (s.hidden.includes('cover') || s.removed.includes('cover')))
  const clickPart = useLab((s) => s.clickPart)
  const hover = useLab((s) => s.hover)

  const ex = useMemo(() => explodeVector(model, part), [model, part])
  const lift = useRef(removed ? 1 : 0)
  const LIFT = model.size[1] * 1.8
  const terminals = useMemo(() => terminalsFor(part.geometry), [part.geometry])

  const target = (e: number, l: number): [number, number, number] => [part.position[0] + ex[0] * e, part.position[1] + ex[1] * e + l * LIFT, part.position[2] + ex[2] * e]

  useLayoutEffect(() => {
    const o = outer.current
    o.position.set(...target(explode, lift.current))
    partObjects.set(part.id, o)
    // Local bounding box (for hit target, label anchor and camera framing).
    o.updateWorldMatrix(true, true)
    const b = new THREE.Box3().setFromObject(inner.current, true)
    if (!b.isEmpty()) {
      b.applyMatrix4(o.matrixWorld.clone().invert())
      const c = b.getCenter(new THREE.Vector3())
      const sz = b.getSize(new THREE.Vector3())
      setBox({ center: c.toArray() as Vec3, size: sz.toArray() as Vec3, top: [c.x, b.max.y + 0.35, c.z] })
    }
    return () => {
      partObjects.delete(part.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part.id])

  useEffect(() => {
    if (!flashEvt) return
    setFlash(flashEvt.tone)
    const t = setTimeout(() => setFlash(null), 1100)
    return () => clearTimeout(t)
  }, [flashEvt])

  useEffect(() => invalidate(), [explode, removed, shown, highlight, flash, xray, invalidate])

  useFrame((_, dt) => {
    const o = outer.current
    const want = removed ? 1 : 0
    lift.current = THREE.MathUtils.damp(lift.current, want, 5, dt)
    if (Math.abs(lift.current - want) < 0.002) lift.current = want
    const [tx, ty, tz] = target(explode, lift.current)
    const k = 1 - Math.exp(-7 * dt)
    o.position.x += (tx - o.position.x) * k
    o.position.y += (ty - o.position.y) * k
    o.position.z += (tz - o.position.z) * k
    const dist = Math.hypot(tx - o.position.x, ty - o.position.y, tz - o.position.z)
    if (dist < 0.005) o.position.set(tx, ty, tz)
    o.visible = shown && !(removed && lift.current > 0.97)
    if (dist >= 0.005 || lift.current !== want) invalidate()
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6) return
    e.stopPropagation()
    clickPart(part.id)
  }
  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    hover(part.id)
    document.body.style.cursor = 'pointer'
  }
  const onOut = () => {
    if (useLab.getState().hoveredId === part.id) hover(null)
    document.body.style.cursor = ''
  }

  const h: Highlight = flash === 'wrong' ? 'wrong' : flash === 'ok' ? 'target' : highlight
  const small = box && (Math.max(...box.size) < MIN_HIT || box.size[0] * box.size[1] * box.size[2] < SPARSE_VOLUME)
  const entry = PANEL_ENTRY_BY_ID[part.componentId]

  return (
    <group ref={outer} rotation={part.rotation} onClick={onClick} onPointerOver={onOver} onPointerOut={onOut} name={part.id}>
      <HighlightContext.Provider value={h}>
        <group ref={inner}>
          <PartVisual id={part.id} g={part.geometry} xray={xray} />
        </group>
      </HighlightContext.Provider>
      {small && box && (
        <mesh position={box.center} material={MAT.hit}>
          <boxGeometry args={box.size.map((v) => Math.max(v, MIN_HIT)) as Vec3} />
        </mesh>
      )}
      {showLabel && box && shown && !removed && (
        <Html position={box.top} center zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded border border-chassis-600 bg-chassis-950/90 px-1.5 py-0.5 text-[11px] text-ink-100 shadow">
            {part.designator ? <span className="readout mr-1 text-signal-300">{part.designator}</span> : null}
            {part.label.replace(/\s*\(.*\)/, '').replace(part.designator ?? '\u0000', '').trim()}
          </div>
        </Html>
      )}
      {showConn && shown && !removed &&
        terminals.map((t) => {
          const role = entry?.terminals.find((x) => x.id === t.terminalId)?.role
          const mat = role === 'earth' || role === 'ground' ? MAT.markerEarth : role === 'control' || role === 'sense' ? MAT.markerControl : MAT.marker
          return (
            <group key={t.terminalId} position={t.position}>
              <mesh geometry={markerGeo} material={mat} raycast={noRaycast} />
              {selected && (
                <Html center position={[0, 0.35, 0]} zIndexRange={[40, 0]} style={{ pointerEvents: 'none' }}>
                  <div className="readout whitespace-nowrap rounded bg-black/80 px-1 text-[10px] text-caution-400">{entry?.terminals.find((x) => x.id === t.terminalId)?.label}</div>
                </Html>
              )}
            </group>
          )
        })}
    </group>
  )
}
