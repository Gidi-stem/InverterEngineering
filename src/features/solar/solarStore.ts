import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { SOLAR_PRESET_BY_ID } from '../../engine/solar/presets'
import type { Load, SolarSpec } from '../../engine/solar/types'
import { idbStorage } from '../../store/idbStorage'

/**
 * Solar laboratory state: the learner's working system specification (persisted to IndexedDB and
 * validated field by field against a preset on load, so a corrupted record cannot break the page).
 */
interface SolarState {
  spec: SolarSpec
  presetId: string
  setSpec: (s: SolarSpec) => void
  loadPreset: (id: string) => void
}

const DEFAULT_PRESET = 'offgrid-home'
const CHOICES: Record<string, string[]> = { type: ['off-grid', 'grid-tied', 'hybrid'], controller: ['mppt', 'pwm'], chem: ['lead-acid', 'lifepo4'], source: ['illustrative', 'user'] }

function cleanObj<T extends object>(base: T, raw: unknown): T {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const out = { ...base } as Record<string, unknown>
  for (const [k, v] of Object.entries(base)) {
    const r = o[k]
    if (typeof v === 'number' && typeof r === 'number' && Number.isFinite(r)) out[k] = r
    else if (typeof v === 'boolean' && typeof r === 'boolean') out[k] = r
    else if (typeof v === 'string' && typeof r === 'string' && (!CHOICES[k] || CHOICES[k].includes(r))) out[k] = r.slice(0, 120)
  }
  return out as T
}

function cleanLoad(raw: unknown, i: number): Load | null {
  if (!raw || typeof raw !== 'object') return null
  const base: Load = { id: `l${i}`, name: 'Load', watts: 0, qty: 1, windows: [], duty: 1, surgeW: 0, ac: true }
  const l = cleanObj(base, raw)
  const w = (raw as { windows?: unknown }).windows
  l.windows = Array.isArray(w) ? w.filter((x): x is [number, number] => Array.isArray(x) && x.length === 2 && x.every((n) => typeof n === 'number' && n >= 0 && n <= 24)).slice(0, 6) : []
  l.watts = Math.max(0, Math.min(20000, l.watts))
  l.qty = Math.max(0, Math.min(100, Math.round(l.qty)))
  l.duty = Math.max(0, Math.min(1, l.duty))
  l.surgeW = Math.max(l.watts, Math.min(100000, l.surgeW))
  return l
}

export function sanitizeSpec(raw: unknown, presetId = DEFAULT_PRESET): SolarSpec {
  const base = (SOLAR_PRESET_BY_ID[presetId] ?? SOLAR_PRESET_BY_ID[DEFAULT_PRESET]).spec
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const s = cleanObj(base, r)
  s.site = cleanObj(base.site, r.site)
  s.battery = cleanObj(base.battery, r.battery)
  s.module = cleanObj(base.module, r.module)
  s.loads = Array.isArray(r.loads) ? r.loads.slice(0, 40).map(cleanLoad).filter((x): x is Load => !!x) : base.loads
  if (![0, 12, 24, 48].includes(s.vsys)) s.vsys = base.vsys
  s.battery.dod = Math.max(0.1, Math.min(1, s.battery.dod))
  s.battery.eff = Math.max(0.5, Math.min(1, s.battery.eff))
  s.battery.unitV = Math.max(1, s.battery.unitV)
  s.battery.unitAh = Math.max(1, s.battery.unitAh)
  s.autonomy = Math.max(0, Math.min(10, s.autonomy))
  s.site.psh = Math.max(0.5, Math.min(9, s.site.psh))
  s.inverterEff = Math.max(0.5, Math.min(0.99, s.inverterEff))
  s.inverterSurge = Math.max(1, Math.min(5, s.inverterSurge))
  const m = s.module
  if (!(m.isc > m.imp && m.voc > m.vmp && m.imp > 0 && m.vmp > 0 && m.cells > 0)) s.module = base.module
  return s
}

export const useSolarLab = create<SolarState>()(
  persist(
    (set) => ({
      spec: SOLAR_PRESET_BY_ID[DEFAULT_PRESET].spec,
      presetId: DEFAULT_PRESET,
      setSpec: (spec) => set({ spec }),
      loadPreset: (id) => set({ presetId: id, spec: SOLAR_PRESET_BY_ID[id]?.spec ?? SOLAR_PRESET_BY_ID[DEFAULT_PRESET].spec }),
    }),
    {
      name: 'inverter-lab-solar',
      version: 1,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({ spec: s.spec, presetId: s.presetId }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Pick<SolarState, 'spec' | 'presetId'>>
        const presetId = typeof p.presetId === 'string' && SOLAR_PRESET_BY_ID[p.presetId] ? p.presetId : DEFAULT_PRESET
        return { ...current, presetId, spec: p.spec ? sanitizeSpec(p.spec, presetId) : SOLAR_PRESET_BY_ID[presetId].spec }
      },
    },
  ),
)
