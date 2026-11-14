import { defaultParams, defaultStates, nextLabel, PART_DEFS, terminalPosition } from './parts'
import type { CircuitDoc, PartType, PlacedPart, Rotation, TerminalRef, Wire } from './types'

/**
 * Pure editing operations for the circuit editor. Every function returns a new document and leaves
 * its input untouched, so the editor can keep an undo history of plain snapshots.
 */
export type EditResult = { doc: CircuitDoc; error?: string }

const sameRef = (a: TerminalRef, b: TerminalRef) => a.partId === b.partId && a.terminalId === b.terminalId
const wireKey = (a: TerminalRef, b: TerminalRef) => [`${a.partId}:${a.terminalId}`, `${b.partId}:${b.terminalId}`].sort().join('|')
const terminalExists = (doc: CircuitDoc, r: TerminalRef) => {
  const p = doc.parts.find((x) => x.id === r.partId)
  return !!p && PART_DEFS[p.type].terminals.some((t) => t.id === r.terminalId)
}

function nextWireId(doc: CircuitDoc) {
  const used = new Set(doc.wires.map((w) => w.id))
  for (let i = doc.wires.length + 1; ; i++) if (!used.has(`w${i}`)) return `w${i}`
}

export function addPart(doc: CircuitDoc, type: PartType, x: number, y: number): EditResult & { id: string } {
  const label = nextLabel(doc.parts, type)
  const ids = new Set(doc.parts.map((p) => p.id))
  let id = label
  for (let i = 2; ids.has(id); i++) id = `${label}_${i}`
  const part: PlacedPart = { id, type, label, x: Math.round(x), y: Math.round(y), rotation: 0, params: defaultParams(type), states: defaultStates(type) }
  return { doc: { ...doc, parts: [...doc.parts, part] }, id }
}

const mapPart = (doc: CircuitDoc, id: string, f: (p: PlacedPart) => PlacedPart): CircuitDoc => ({ ...doc, parts: doc.parts.map((p) => (p.id === id ? f(p) : p)) })

export const movePart = (doc: CircuitDoc, id: string, x: number, y: number) => mapPart(doc, id, (p) => ({ ...p, x: Math.round(x), y: Math.round(y) }))
export const rotatePart = (doc: CircuitDoc, id: string) => mapPart(doc, id, (p) => ({ ...p, rotation: (((p.rotation + 90) % 360) as Rotation) }))
export const setParam = (doc: CircuitDoc, id: string, key: string, value: number) => mapPart(doc, id, (p) => ({ ...p, params: { ...p.params, [key]: value } }))
export const setState = (doc: CircuitDoc, id: string, key: string, value: number) => mapPart(doc, id, (p) => ({ ...p, states: { ...p.states, [key]: value } }))

/** Deleting a part deletes every wire attached to it. */
export function deletePart(doc: CircuitDoc, id: string): CircuitDoc {
  return { ...doc, parts: doc.parts.filter((p) => p.id !== id), wires: doc.wires.filter((w) => w.a.partId !== id && w.b.partId !== id) }
}

export function addWire(doc: CircuitDoc, a: TerminalRef, b: TerminalRef): EditResult & { id?: string } {
  if (!terminalExists(doc, a) || !terminalExists(doc, b)) return { doc, error: 'Both ends must be on a terminal.' }
  if (sameRef(a, b)) return { doc, error: 'A wire needs two different terminals.' }
  if (doc.wires.some((w) => wireKey(w.a, w.b) === wireKey(a, b))) return { doc, error: 'These terminals are already wired together.' }
  const id = nextWireId(doc)
  const wire: Wire = { id, a: { ...a }, b: { ...b } }
  return { doc: { ...doc, wires: [...doc.wires, wire] }, id }
}

export const deleteWire = (doc: CircuitDoc, id: string): CircuitDoc => ({ ...doc, wires: doc.wires.filter((w) => w.id !== id) })

/** Move one end of an existing wire to another terminal. */
export function reconnectWire(doc: CircuitDoc, id: string, end: 'a' | 'b', to: TerminalRef): EditResult {
  const w = doc.wires.find((x) => x.id === id)
  if (!w) return { doc, error: 'Wire not found.' }
  const other = end === 'a' ? w.b : w.a
  if (!terminalExists(doc, to)) return { doc, error: 'Drop the wire end on a terminal.' }
  if (sameRef(other, to)) return { doc, error: 'A wire needs two different terminals.' }
  if (doc.wires.some((x) => x.id !== id && wireKey(x.a, x.b) === wireKey(other, to))) return { doc, error: 'These terminals are already wired together.' }
  return { doc: { ...doc, wires: doc.wires.map((x) => (x.id === id ? { ...x, [end]: { ...to } } : x)) } }
}

/** Nearest terminal within `radius` grid units of a grid point. */
export function terminalAt(doc: CircuitDoc, gx: number, gy: number, radius = 0.7): TerminalRef | null {
  let best: TerminalRef | null = null
  let bd = radius * radius
  for (const p of doc.parts) {
    for (const t of PART_DEFS[p.type].terminals) {
      const [x, y] = terminalPosition(p, t.id)
      const d = (x - gx) ** 2 + (y - gy) ** 2
      if (d <= bd) {
        bd = d
        best = { partId: p.id, terminalId: t.id }
      }
    }
  }
  return best
}

/**
 * Validate a stored or imported circuit: unknown part types, missing terminals, duplicate ids and
 * non-finite numbers are dropped so a damaged save can never crash the editor.
 */
export function sanitizeDoc(input: unknown): CircuitDoc | null {
  if (!input || typeof input !== 'object') return null
  const o = input as { parts?: unknown; wires?: unknown }
  if (!Array.isArray(o.parts) || !Array.isArray(o.wires)) return null
  const finite = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d)
  const nums = (v: unknown, base: Record<string, number>) => {
    const out = { ...base }
    if (v && typeof v === 'object') for (const k of Object.keys(base)) out[k] = finite((v as Record<string, unknown>)[k], base[k])
    return out
  }
  const seen = new Set<string>()
  const parts: PlacedPart[] = []
  for (const raw of o.parts) {
    if (!raw || typeof raw !== 'object') continue
    const r = raw as Record<string, unknown>
    if (typeof r.id !== 'string' || typeof r.type !== 'string' || !(r.type in PART_DEFS) || seen.has(r.id)) continue
    const type = r.type as PartType
    const rot = [0, 90, 180, 270].includes(r.rotation as number) ? (r.rotation as Rotation) : 0
    const def = PART_DEFS[type]
    const params = nums(r.params, defaultParams(type))
    for (const q of def.params) params[q.key] = Math.min(q.max, Math.max(q.min, params[q.key]))
    const states = nums(r.states, defaultStates(type))
    for (const s of def.states ?? []) if (!s.options.some((x) => x.value === states[s.key])) states[s.key] = s.default
    seen.add(r.id)
    parts.push({ id: r.id, type, label: typeof r.label === 'string' ? r.label.slice(0, 12) : r.id, x: Math.round(finite(r.x, 0)), y: Math.round(finite(r.y, 0)), rotation: rot, params, states })
  }
  let doc: CircuitDoc = { version: 1, parts, wires: [] }
  for (const raw of o.wires) {
    if (!raw || typeof raw !== 'object') continue
    const w = raw as { a?: TerminalRef; b?: TerminalRef }
    if (!w.a || !w.b || typeof w.a.partId !== 'string' || typeof w.b.partId !== 'string') continue
    doc = addWire(doc, { partId: w.a.partId, terminalId: String(w.a.terminalId) }, { partId: w.b.partId, terminalId: String(w.b.terminalId) }).doc
  }
  return doc
}
