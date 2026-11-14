import type { ElectronicComponent } from '../../types/domain'
import { CONTROL_COMPONENTS } from './control'
import { IO_COMPONENTS } from './io'
import { POWER_COMPONENTS } from './power'
import { PROTECTION_COMPONENTS } from './protection'
import { STRUCTURAL_COMPONENTS } from './structural'

/** Full educational entries for every catalogued component (single source for the 3D lab and the library). */
export const COMPONENTS: ElectronicComponent[] = [...POWER_COMPONENTS, ...CONTROL_COMPONENTS, ...PROTECTION_COMPONENTS, ...IO_COMPONENTS]

export const COMPONENT_BY_ID: Record<string, ElectronicComponent> = Object.fromEntries(COMPONENTS.map((c) => [c.id, c]))

/** Everything that can open an information panel in the 3D lab (library components plus structural parts). */
export const PANEL_ENTRY_BY_ID: Record<string, ElectronicComponent> = {
  ...COMPONENT_BY_ID,
  ...Object.fromEntries(STRUCTURAL_COMPONENTS.map((c) => [c.id, c])),
}
