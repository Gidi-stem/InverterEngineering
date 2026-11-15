import { useMemo } from 'react'
import { sizeSystem } from '../../engine/solar/sizing'
import type { SolarDesign } from '../../engine/solar/types'
import { useSolarLab } from './solarStore'

/** The sized design for the learner's current specification. */
export function useDesign(): SolarDesign {
  const spec = useSolarLab((s) => s.spec)
  return useMemo(() => sizeSystem(spec), [spec])
}
