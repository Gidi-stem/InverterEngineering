import type { SolarTab, ToolLink } from '../types'

/** Shorthand constructors for links into the existing laboratories. */
export const to = {
  lab3d: (label: string, model?: 'lf3k' | 'sq1k', part?: string): ToolLink => ({ kind: 'lab3d', label, model, part }),
  lib: (label: string, id: string): ToolLink => ({ kind: 'library', label, id }),
  proc: (label: string, component: string, procedure: string): ToolLink => ({ kind: 'procedure', label, component, procedure }),
  cmp: (label: string, id: string): ToolLink => ({ kind: 'compare', label, id }),
  ckt: (label: string, ex: string): ToolLink => ({ kind: 'circuit', label, ex }),
  sim: (label: string, exp: string): ToolLink => ({ kind: 'sim', label, exp }),
  build: (label: string, project: string): ToolLink => ({ kind: 'build', label, project }),
  solar: (label: string, tab: SolarTab = 'design'): ToolLink => ({ kind: 'solar', label, tab }),
  instrument: (label: string, id: string, scenario?: string): ToolLink => ({ kind: 'instrument', label, id, scenario }),
  fun: (label: string, lessonId: string): ToolLink => ({ kind: 'fundamentals', label, lessonId }),
  repair: (label: string, id: string): ToolLink => ({ kind: 'repair', label, id }),
}
