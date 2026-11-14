import { MODEL_BY_ID } from '../../../content/models'
import type { PartGeometry } from '../../../types/domain'

/** The geometry recipe of the first 3D part using this component: the same source the 3D model is built from. */
export function geometryFor(componentId: string): PartGeometry | undefined {
  for (const m of Object.values(MODEL_BY_ID)) {
    const p = m.parts.find((x) => x.componentId === componentId)
    if (p) return p.geometry
  }
  return undefined
}
