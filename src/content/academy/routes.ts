import type { ToolLink } from './types'

/** Route (hash path) of a laboratory link. Pure string building: link targets are validated by tests. */
export function routeOf(l: ToolLink): string {
  switch (l.kind) {
    case 'lab3d': {
      const q = new URLSearchParams()
      if (l.model) q.set('model', l.model)
      if (l.part) q.set('part', l.part)
      const s = q.toString()
      return `/lab-3d${s ? `?${s}` : ''}`
    }
    case 'library':
      return `/components/${l.id}`
    case 'procedure':
      return `/components/${l.component}`
    case 'compare':
      return `/components/compare?guide=${l.id}`
    case 'circuit':
      return `/circuit-lab?ex=${l.ex}`
    case 'sim':
      return `/circuit-lab?ex=${l.exp}`
    case 'build':
      return `/circuit-lab?ex=${l.project}`
    case 'solar':
      return l.tab === 'design' ? '/solar' : `/solar?tab=${l.tab}`
    case 'instrument':
      return `/instruments/${l.id}${l.scenario ? `?scenario=${l.scenario}` : ''}`
    case 'fundamentals':
      // Lessons aren't individually routable: the module page lists the whole sequence (and the
      // lesson's own linked experiments), so the whole module is the correct, honest target.
      return '/fundamentals'
  }
}

export const lessonRoute = (courseId: string, lessonId: string) => `/academy/${courseId}/${lessonId}`
export const courseRoute = (courseId: string) => `/academy/${courseId}`
