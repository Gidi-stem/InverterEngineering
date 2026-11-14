import type { ElectronicComponent } from '../../../types/domain'
import type { LearnerLevel } from '../../../types/progress'

export const LEVELS: { id: LearnerLevel; label: string }[] = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
]

/** Component name without its parenthetical qualifier, for cards and links. */
export const shortName = (c: ElectronicComponent) => c.name.replace(/\s*\(.*\)/, '')
