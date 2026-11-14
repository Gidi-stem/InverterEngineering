import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type PointerEvent as RPointerEvent, type Ref } from 'react'
import { terminalAt } from '../../engine/circuit/edit'
import { PART_DEFS, rotatePoint, terminalPosition } from '../../engine/circuit/parts'
import type { CircuitDoc, PartType, PlacedPart, TerminalRef } from '../../engine/circuit/types'
import { G, partValue } from './format'
import { PartGlyph } from './PartGlyph'

export type Selection = { kind: 'part'; id: string } | { kind: 'wire'; id: string } | null

export interface WorkspaceApi {
  /** Grid point under a client (screen) position, or null when outside the workspace. */
  clientToGrid: (cx: number, cy: number) => [number, number] | null
  fit: () => void
  zoom: (factor: number) => void
}

export interface NodeLabel {
  x: number
  y: number
  text: string
  hazard?: boolean
}

interface Props {
  doc: CircuitDoc
  selection: Selection
  wireFrom: TerminalRef | null
  armed: PartType | null
  /** Parts drawn as lit / conducting / closed. */
  visual: Record<string, { on: boolean; glow: number }>
  /** Parts named in the issue the student is looking at. */
  highlight: Set<string>
  /** Parts involved in a danger-level issue. */
  danger: Set<string>
  nodeLabels: NodeLabel[] | null
  /** Terminal keys "part:terminal" that belong to the selected node. */
  nodeTerminals: Set<string>
  apiRef: Ref<WorkspaceApi | null>
  onSelect: (s: Selection) => void
  onMove: (id: string, x: number, y: number) => void
  onTap: (id: string) => void
  onWire: (a: TerminalRef, b: TerminalRef) => void
  onWireFrom: (t: TerminalRef | null) => void
  onReconnect: (wireId: string, end: 'a' | 'b', to: TerminalRef) => void
  onPlace: (x: number, y: number) => void
}

type View = { x: number; y: number; s: number }
type Drag =
  | { kind: 'pan'; sx: number; sy: number; vx: number; vy: number }
  | { kind: 'part'; id: string; ox: number; oy: number; gx: number; gy: number; moved: boolean; sx: number; sy: number; wasSelected: boolean }
  | { kind: 'wire'; from: TerminalRef; gx: number; gy: number; moved: boolean; sx: number; sy: number }
  | { kind: 'end'; wireId: string; end: 'a' | 'b'; gx: number; gy: number }
  | { kind: 'pinch'; d0: number; s0: number; mx: number; my: number; vx: number; vy: number }

const route = (x1: number, y1: number, x2: number, y2: number) => {
  if (x1 === x2 || y1 === y2) return `M${x1} ${y1}L${x2} ${y2}`
  const mx = Math.round((x1 + x2) / 2 / G) * G
  return `M${x1} ${y1}H${mx}V${y2}H${x2}`
}
/** Non-polarised two-terminal parts: terminal numbers add clutter, not information. */
const UNLABELLED = new Set<PartType>(['resistor', 'capacitor', 'inductor', 'fuse', 'switch', 'ground', 'ac-load'])
const tk = (r: TerminalRef) => `${r.partId}:${r.terminalId}`

/** Bounding box of a placed part in absolute grid units, after rotation. */
function partBox(p: PlacedPart) {
  const b = PART_DEFS[p.type].box
  const pts = [rotatePoint(b.x, b.y, p.rotation), rotatePoint(b.x + b.w, b.y + b.h, p.rotation)]
  const xs = pts.map((q) => q[0] + p.x)
  const ys = pts.map((q) => q[1] + p.y)
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }
}

export function Workspace(props: Props) {
  const { doc, selection, wireFrom, armed, visual, highlight, danger, nodeLabels, nodeTerminals } = props
  const svgRef = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState({ w: 800, h: 560 })
  const [view, setView] = useState<View>({ x: -40, y: -40, s: 1 })
  const [drag, setDrag] = useState<Drag | null>(null)
  const [hover, setHover] = useState<[number, number] | null>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const dragRef = useRef<Drag | null>(null)
  const setD = (d: Drag | null) => {
    dragRef.current = d
    setDrag(d)
  }

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.max(200, e.contentRect.width), h: Math.max(200, e.contentRect.height) }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const toWorld = useCallback(
    (cx: number, cy: number): [number, number] => {
      const r = svgRef.current!.getBoundingClientRect()
      return [view.x + (cx - r.left) / view.s, view.y + (cy - r.top) / view.s]
    },
    [view],
  )
  const toGrid = useCallback((cx: number, cy: number): [number, number] => {
    const [wx, wy] = toWorld(cx, cy)
    return [wx / G, wy / G]
  }, [toWorld])

  const fit = useCallback(() => {
    if (!doc.parts.length) {
      setView({ x: -2 * G, y: -2 * G, s: 1 })
      return
    }
    const boxes = doc.parts.map(partBox)
    const x0 = Math.min(...boxes.map((b) => b.x0)) - 3
    const y0 = Math.min(...boxes.map((b) => b.y0)) - 3
    const x1 = Math.max(...boxes.map((b) => b.x1)) + 5
    const y1 = Math.max(...boxes.map((b) => b.y1)) + 3
    const s = Math.min(2, Math.max(0.35, Math.min(size.w / ((x1 - x0) * G), size.h / ((y1 - y0) * G))))
    setView({ x: ((x0 + x1) / 2) * G - size.w / s / 2, y: ((y0 + y1) / 2) * G - size.h / s / 2, s })
  }, [doc.parts, size])

  const zoomAt = useCallback((factor: number, cx?: number, cy?: number) => {
    setView((v) => {
      const s = Math.min(3, Math.max(0.3, v.s * factor))
      const r = svgRef.current?.getBoundingClientRect()
      const px = cx !== undefined && r ? cx - r.left : size.w / 2
      const py = cy !== undefined && r ? cy - r.top : size.h / 2
      const wx = v.x + px / v.s
      const wy = v.y + py / v.s
      return { s, x: wx - px / s, y: wy - py / s }
    })
  }, [size])

  useImperativeHandle(
    props.apiRef,
    () => ({
      clientToGrid: (cx, cy) => {
        const r = svgRef.current?.getBoundingClientRect()
        if (!r || cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return null
        return toGrid(cx, cy)
      },
      fit,
      zoom: (f) => zoomAt(f),
    }),
    [toGrid, fit, zoomAt],
  )

  // Wheel zoom needs a non-passive listener so the page does not scroll.
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX, e.clientY)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  const target = (e: RPointerEvent) => (e.target as Element).closest('[data-kind]') as HTMLElement | SVGElement | null

  const onDown = (e: RPointerEvent<SVGSVGElement>) => {
    svgRef.current!.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      setD({ kind: 'pinch', d0: Math.hypot(a.x - b.x, a.y - b.y), s0: view.s, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, vx: view.x, vy: view.y })
      return
    }
    const t = target(e)
    const [gx, gy] = toGrid(e.clientX, e.clientY)
    const kind = t?.dataset.kind
    if (kind === 'terminal') {
      const ref = { partId: t!.dataset.part!, terminalId: t!.dataset.term! }
      if (wireFrom && tk(wireFrom) !== tk(ref)) {
        props.onWire(wireFrom, ref)
        props.onWireFrom(null)
        return
      }
      setD({ kind: 'wire', from: ref, gx, gy, moved: false, sx: e.clientX, sy: e.clientY })
      return
    }
    if (kind === 'handle') {
      setD({ kind: 'end', wireId: t!.dataset.id!, end: t!.dataset.end as 'a' | 'b', gx, gy })
      return
    }
    if (kind === 'part') {
      const p = doc.parts.find((x) => x.id === t!.dataset.id)!
      const wasSelected = selection?.kind === 'part' && selection.id === p.id
      props.onSelect({ kind: 'part', id: p.id })
      props.onWireFrom(null)
      setD({ kind: 'part', id: p.id, ox: gx - p.x, oy: gy - p.y, gx: p.x, gy: p.y, moved: false, sx: e.clientX, sy: e.clientY, wasSelected })
      return
    }
    if (kind === 'wire') {
      props.onSelect({ kind: 'wire', id: t!.dataset.id! })
      props.onWireFrom(null)
      return
    }
    // Background.
    if (armed) {
      props.onPlace(Math.round(gx), Math.round(gy))
      return
    }
    if (wireFrom) props.onWireFrom(null)
    props.onSelect(null)
    setD({ kind: 'pan', sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y })
  }

  const onMoveEvt = (e: RPointerEvent<SVGSVGElement>) => {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const d = dragRef.current
    const [gx, gy] = toGrid(e.clientX, e.clientY)
    setHover([gx, gy])
    if (!d) return
    if (d.kind === 'pinch') {
      if (pointers.current.size < 2) return
      const [a, b] = [...pointers.current.values()]
      const s = Math.min(3, Math.max(0.3, (d.s0 * Math.hypot(a.x - b.x, a.y - b.y)) / Math.max(d.d0, 1)))
      const r = svgRef.current!.getBoundingClientRect()
      const px = d.mx - r.left
      const py = d.my - r.top
      const wx = d.vx + px / d.s0
      const wy = d.vy + py / d.s0
      const mx = (a.x + b.x) / 2 - r.left
      const my = (a.y + b.y) / 2 - r.top
      setView({ s, x: wx - mx / s, y: wy - my / s })
      return
    }
    if (d.kind === 'pan') {
      setView((v) => ({ ...v, x: d.vx - (e.clientX - d.sx) / v.s, y: d.vy - (e.clientY - d.sy) / v.s }))
      return
    }
    const far = 'sx' in d && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 5
    if (d.kind === 'part') setD({ ...d, gx: Math.round(gx - d.ox), gy: Math.round(gy - d.oy), moved: d.moved || far })
    else if (d.kind === 'wire') setD({ ...d, gx, gy, moved: d.moved || far })
    else setD({ ...d, gx, gy })
  }

  const onUp = (e: RPointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId)
    const d = dragRef.current
    if (!d) return
    if (d.kind === 'pinch') {
      if (pointers.current.size === 0) setD(null)
      return
    }
    setD(null)
    if (d.kind === 'part') {
      const p = doc.parts.find((x) => x.id === d.id)
      if (p && d.moved && (p.x !== d.gx || p.y !== d.gy)) props.onMove(d.id, d.gx, d.gy)
      else if (!d.moved && d.wasSelected) props.onTap(d.id)
    } else if (d.kind === 'wire') {
      const [gx, gy] = toGrid(e.clientX, e.clientY)
      const to = terminalAt(doc, gx, gy)
      if (to && tk(to) !== tk(d.from)) props.onWire(d.from, to)
      else if (!d.moved) props.onWireFrom(wireFrom && tk(wireFrom) === tk(d.from) ? null : d.from)
    } else if (d.kind === 'end') {
      const [gx, gy] = toGrid(e.clientX, e.clientY)
      const to = terminalAt(doc, gx, gy)
      if (to) props.onReconnect(d.wireId, d.end, to)
    }
  }

  const onCancel = (e: RPointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId)
    setD(null)
  }

  // Parts as drawn (a part being dragged is drawn at its preview position).
  const drawn = useMemo(() => doc.parts.map((p) => (drag?.kind === 'part' && drag.id === p.id ? { ...p, x: drag.gx, y: drag.gy } : p)), [doc.parts, drag])
  const byId = useMemo(() => new Map(drawn.map((p) => [p.id, p])), [drawn])
  const pos = (r: TerminalRef): [number, number] | null => {
    const p = byId.get(r.partId)
    if (!p) return null
    const [x, y] = terminalPosition(p, r.terminalId)
    return [x * G, y * G]
  }
  const degree = useMemo(() => {
    const m = new Map<string, number>()
    for (const w of doc.wires) for (const r of [w.a, w.b]) m.set(tk(r), (m.get(tk(r)) ?? 0) + 1)
    return m
  }, [doc.wires])

  const snap = hover && (drag?.kind === 'wire' || drag?.kind === 'end' || wireFrom) ? terminalAt(doc, hover[0], hover[1]) : null
  const vb = `${view.x} ${view.y} ${size.w / view.s} ${size.h / view.s}`
  const gx0 = Math.floor(view.x / G) * G
  const gy0 = Math.floor(view.y / G) * G

  let rubber: { from: [number, number]; to: [number, number] } | null = null
  if (drag?.kind === 'wire' && drag.moved) rubber = { from: pos(drag.from)!, to: [drag.gx * G, drag.gy * G] }
  else if (drag?.kind === 'end') {
    const w = doc.wires.find((x) => x.id === drag.wireId)
    if (w) rubber = { from: pos(drag.end === 'a' ? w.b : w.a)!, to: [drag.gx * G, drag.gy * G] }
  } else if (wireFrom && hover) rubber = { from: pos(wireFrom)!, to: [hover[0] * G, hover[1] * G] }

  return (
    <svg
      ref={svgRef}
      role="application"
      aria-label="Circuit workspace. Drag parts to move them, drag from a terminal to another terminal to draw a wire."
      data-testid="circuit-workspace"
      className={`h-full w-full touch-none select-none ${armed ? 'cursor-crosshair' : drag?.kind === 'pan' ? 'cursor-grabbing' : 'cursor-default'}`}
      viewBox={vb}
      onPointerDown={onDown}
      onPointerMove={onMoveEvt}
      onPointerUp={onUp}
      onPointerCancel={onCancel}
      onPointerLeave={() => setHover(null)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <defs>
        <pattern id="ckt-grid" x={0} y={0} width={G} height={G} patternUnits="userSpaceOnUse">
          <circle cx={0} cy={0} r={1} className="fill-chassis-600" />
        </pattern>
        <pattern id="ckt-grid5" x={0} y={0} width={G * 5} height={G * 5} patternUnits="userSpaceOnUse">
          <circle cx={0} cy={0} r={1.6} className="fill-chassis-500" />
        </pattern>
      </defs>
      <rect x={gx0} y={gy0} width={size.w / view.s + 2 * G} height={size.h / view.s + 2 * G} fill="url(#ckt-grid)" />
      <rect x={Math.floor(view.x / (5 * G)) * 5 * G} y={Math.floor(view.y / (5 * G)) * 5 * G} width={size.w / view.s + 10 * G} height={size.h / view.s + 10 * G} fill="url(#ckt-grid5)" />

      {/* Wires */}
      {doc.wires.map((w) => {
        const a = pos(w.a)
        const b = pos(w.b)
        if (!a || !b) return null
        const sel = selection?.kind === 'wire' && selection.id === w.id
        const inNode = nodeTerminals.has(tk(w.a))
        const hl = highlight.has(w.a.partId) && highlight.has(w.b.partId)
        const d = route(a[0], a[1], b[0], b[1])
        return (
          <g key={w.id} data-kind="wire" data-id={w.id} className="cursor-pointer">
            <path d={d} fill="none" stroke="transparent" strokeWidth={14} />
            <path
              d={d}
              fill="none"
              strokeWidth={sel ? 3 : 2}
              strokeLinejoin="round"
              className={sel ? 'stroke-signal-300' : hl ? 'stroke-danger-400' : inNode ? 'stroke-signal-400' : 'stroke-ink-300'}
            />
          </g>
        )
      })}

      {/* Parts */}
      {drawn.map((p) => {
        const sel = selection?.kind === 'part' && selection.id === p.id
        const b = partBox(p)
        const vis = visual[p.id]
        const tone = sel ? 'text-signal-300' : highlight.has(p.id) || danger.has(p.id) ? 'text-danger-400' : vis?.on ? 'text-live-400' : 'text-ink-100'
        return (
          <g key={p.id}>
            <g data-kind="part" data-id={p.id} data-testid={`part-${p.id}`} className={`cursor-move ${tone}`}>
              <rect
                x={b.x0 * G - 4}
                y={b.y0 * G - 4}
                width={(b.x1 - b.x0) * G + 8}
                height={(b.y1 - b.y0) * G + 8}
                rx={4}
                className={sel ? 'fill-signal-500/10 stroke-signal-400' : highlight.has(p.id) ? 'fill-danger-400/10 stroke-danger-400' : 'fill-transparent stroke-transparent'}
                strokeWidth={1}
                strokeDasharray={sel ? '4 3' : undefined}
              />
              <g transform={`translate(${p.x * G} ${p.y * G}) rotate(${p.rotation}) scale(${G})`}>
                <PartGlyph type={p.type} on={vis?.on} glow={vis?.glow} />
              </g>
            </g>
            <text x={b.x1 * G + 6} y={b.y0 * G + 12} className="pointer-events-none fill-ink-100 font-mono text-[11px] font-semibold">
              {p.label}
            </text>
            <text x={b.x1 * G + 6} y={b.y0 * G + 25} className="pointer-events-none fill-ink-400 font-mono text-[10px]">
              {partValue(p)}
            </text>
          </g>
        )
      })}

      {/* Terminals (drawn above parts so they are always reachable) */}
      {drawn.map((p) =>
        PART_DEFS[p.type].terminals.map((t) => {
          const [x, y] = terminalPosition(p, t.id)
          const key = `${p.id}:${t.id}`
          const [dx, dy] = rotatePoint(Math.sign(t.x), Math.sign(t.y), p.rotation)
          const vertical = Math.abs(dy) >= Math.abs(dx)
          const lx = x * G - dx * 11 + (vertical ? 8 : 0)
          const ly = y * G - dy * 11 + (vertical ? 4 : -6)
          const isFrom = (wireFrom && tk(wireFrom) === key) || (drag?.kind === 'wire' && tk(drag.from) === key)
          const isSnap = snap && tk(snap) === key
          const n = degree.get(key) ?? 0
          return (
            <g key={key} data-kind="terminal" data-part={p.id} data-term={t.id} data-testid={`term-${p.id}-${t.id}`} className="cursor-crosshair">
              <circle cx={x * G} cy={y * G} r={11} fill="transparent" />
              <circle
                cx={x * G}
                cy={y * G}
                r={isFrom || isSnap ? 6 : n > 1 ? 4 : 3.5}
                className={isFrom ? 'fill-signal-400 stroke-signal-200' : isSnap ? 'fill-live-400 stroke-live-400' : n ? 'fill-ink-200 stroke-ink-200' : 'fill-chassis-900 stroke-caution-400'}
                strokeWidth={1.5}
              />
              {!UNLABELLED.has(p.type) ? (
                <text x={lx} y={ly} textAnchor={vertical ? 'start' : 'middle'} className="pointer-events-none fill-signal-200 font-mono text-[9px]">
                  {t.label}
                </text>
              ) : null}
            </g>
          )
        }),
      )}

      {nodeLabels?.map((l, i) => (
        <g key={i} className="pointer-events-none">
          <rect x={l.x * G + 4} y={l.y * G - 7} width={l.text.length * 6.2 + 8} height={14} rx={3} className={l.hazard ? 'fill-danger-400/20 stroke-danger-400' : 'fill-chassis-950/90 stroke-live-400/50'} strokeWidth={0.75} />
          <text x={l.x * G + 8} y={l.y * G + 3.5} className={`font-mono text-[10px] ${l.hazard ? 'fill-danger-400' : 'fill-live-400'}`}>
            {l.text}
          </text>
        </g>
      ))}

      {rubber && <path d={route(rubber.from[0], rubber.from[1], rubber.to[0], rubber.to[1])} fill="none" strokeWidth={2} strokeDasharray="5 4" className="pointer-events-none stroke-signal-300" />}

      {/* End handles of the selected wire: drag to reconnect */}
      {selection?.kind === 'wire' &&
        (() => {
          const w = doc.wires.find((x) => x.id === selection.id)
          if (!w) return null
          return (['a', 'b'] as const).map((end) => {
            const q = pos(w[end])
            if (!q) return null
            return (
              <g key={end} data-kind="handle" data-id={w.id} data-end={end} data-testid={`handle-${end}`} className="cursor-grab">
                <circle cx={q[0]} cy={q[1]} r={13} fill="transparent" />
                <rect x={q[0] - 6} y={q[1] - 6} width={12} height={12} rx={2} className="fill-signal-500 stroke-signal-200" strokeWidth={1.5} />
              </g>
            )
          })
        })()}

      {armed && hover && (
        <g transform={`translate(${Math.round(hover[0]) * G} ${Math.round(hover[1]) * G}) scale(${G})`} className="pointer-events-none text-signal-300 opacity-60">
          <PartGlyph type={armed} />
        </g>
      )}
    </svg>
  )
}
