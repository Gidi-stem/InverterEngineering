import type { InverterModel } from '../../types/domain'
import { LF3K } from './lf3k'
import { SQ1K } from './sq1k'

/** Registry of 3D inverter models. Add a model here and the 3D lab, procedures and challenges pick it up. */
export const INVERTER_MODELS: InverterModel[] = [LF3K, SQ1K]

export const MODEL_BY_ID: Record<string, InverterModel> = Object.fromEntries(INVERTER_MODELS.map((m) => [m.id, m]))

export const DEFAULT_MODEL_ID = LF3K.id
