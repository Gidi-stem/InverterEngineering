import type { InverterModel, ModelPart, ProcedureStage } from '../../../types/domain'

/**
 * Guided disassembly / reassembly rules. Pure functions over the model data, so every model
 * in the registry gets correct sequencing and explanations without model-specific code.
 */
export type Check = { ok: true } | { ok: false; reason: string }

const partById = (m: InverterModel, id: string) => m.parts.find((p) => p.id === id)

/** Parts that must be removed before `partId`: its explicit dependsOn plus everything mounted on it. */
export function removalPrerequisites(m: InverterModel, partId: string): string[] {
  const p = partById(m, partId)
  const mounted = m.parts.filter((q) => q.mountedOn === partId).map((q) => q.id)
  return [...new Set([...(p?.dependsOn ?? []), ...mounted])]
}

export function stageOf(m: InverterModel, partId: string): number {
  return m.procedure.findIndex((s) => s.partIds.includes(partId))
}

/** Index of the first unfinished disassembly stage (= procedure.length when complete). */
export function currentRemovalStage(m: InverterModel, removed: readonly string[], actionsDone: readonly string[]): number {
  return m.procedure.findIndex((s) => (s.action && !actionsDone.includes(s.id)) || s.partIds.some((id) => !removed.includes(id))) === -1
    ? m.procedure.length
    : m.procedure.findIndex((s) => (s.action && !actionsDone.includes(s.id)) || s.partIds.some((id) => !removed.includes(id)))
}

export function actionLabel(a: NonNullable<ProcedureStage['action']>): string {
  return a === 'isolate' ? 'isolate every energy source' : a === 'discharge' ? 'discharge and verify the capacitor bank' : 'verify the circuit is dead'
}

const names = (m: InverterModel, ids: string[]) => ids.map((id) => partById(m, id)?.label ?? id).join(', ')

export function canRemove(m: InverterModel, removed: readonly string[], actionsDone: readonly string[], partId: string): Check {
  const p = partById(m, partId)
  if (!p) return { ok: false, reason: 'Unknown part.' }
  if (removed.includes(partId)) return { ok: false, reason: `${p.label} has already been removed.` }
  const si = stageOf(m, partId)
  if (si === -1) return { ok: false, reason: p.removalNote }
  const cur = currentRemovalStage(m, removed, actionsDone)
  if (si > cur) {
    const stage = m.procedure[cur]
    if (stage.action && !actionsDone.includes(stage.id)) return { ok: false, reason: `Not yet: first you must ${actionLabel(stage.action)} (step “${stage.title}”). ${stage.why}` }
    return { ok: false, reason: `Not yet. ${p.label}: ${p.removalNote} Current step: “${stage.title}”.` }
  }
  const stage = m.procedure[si]
  if (stage.action && !actionsDone.includes(stage.id)) return { ok: false, reason: `Before removing anything in “${stage.title}”, you must ${actionLabel(stage.action)}.` }
  const pending = removalPrerequisites(m, partId).filter((id) => !removed.includes(id))
  if (pending.length) return { ok: false, reason: `${p.label} is still held in place: remove ${names(m, pending)} first. ${p.removalNote}` }
  return { ok: true }
}

/** Index of the stage currently being reassembled (stages replay in reverse); −1 when every part is installed. */
export function currentInstallStage(m: InverterModel, removed: readonly string[]): number {
  for (let i = m.procedure.length - 1; i >= 0; i--) if (m.procedure[i].partIds.some((id) => removed.includes(id))) return i
  return -1
}

export function canInstall(m: InverterModel, removed: readonly string[], partId: string): Check {
  const p = partById(m, partId)
  if (!p) return { ok: false, reason: 'Unknown part.' }
  if (!removed.includes(partId)) return { ok: false, reason: `${p.label} is already installed.` }
  const si = stageOf(m, partId)
  const cur = currentInstallStage(m, removed)
  if (si !== cur) {
    const stage = m.procedure[cur]
    return { ok: false, reason: `Not yet. Reassembly runs in reverse order; finish “${stage.title}” first. ${stage.reassemblyTip}` }
  }
  // Anything that had to come out before this part must now go in after it, so the parts it supports go in first.
  const mustBeFirst = m.parts.filter((q) => removed.includes(q.id) && removalPrerequisites(m, q.id).includes(partId)).map((q) => q.id)
  if (mustBeFirst.length) return { ok: false, reason: `${p.label} goes in after ${names(m, mustBeFirst)}: it was removed before them, so it is installed after them. ${m.procedure[si].reassemblyTip}` }
  return { ok: true }
}

export function removableNow(m: InverterModel, removed: readonly string[], actionsDone: readonly string[]): ModelPart[] {
  return m.parts.filter((p) => canRemove(m, removed, actionsDone, p.id).ok)
}

export function installableNow(m: InverterModel, removed: readonly string[]): ModelPart[] {
  return m.parts.filter((p) => canInstall(m, removed, p.id).ok)
}

/** Every part that takes part in the procedure (the chassis frame stays in place). */
export function procedureParts(m: InverterModel): string[] {
  return m.procedure.flatMap((s) => s.partIds)
}
