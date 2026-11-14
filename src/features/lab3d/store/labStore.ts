import { create } from 'zustand'
import { DEFAULT_MODEL_ID, MODEL_BY_ID } from '../../../content/models'
import { PANEL_ENTRY_BY_ID } from '../../../content/components'
import { useProgress } from '../../../store/progressStore'
import type { Assembly, InverterModel } from '../../../types/domain'
import type { LearnerLevel } from '../../../types/progress'
import { ASSESSMENT_ID, ATTEMPTS, PASS_FRACTION, buildChallenge, countsAsAssessment, type Prompt } from '../logic/identify'
import { canInstall, canRemove, currentInstallStage, currentRemovalStage } from '../logic/procedure'

export type LabMode = 'explore' | 'identify' | 'disassemble' | 'reassemble'
export type Tone = 'info' | 'ok' | 'wrong' | 'done'

export interface Challenge {
  level: LearnerLevel
  prompts: Prompt[]
  index: number
  attemptsLeft: number
  results: boolean[]
  startedAt: number
  finishedAt: number | null
  assessed: boolean
}

interface LabState {
  modelId: string
  mode: LabMode
  selectedId: string | null
  hoveredId: string | null
  explode: number
  hidden: string[]
  isolated: Assembly | null
  showLabels: boolean
  showConnections: boolean
  removed: string[]
  actionsDone: string[]
  disassemblyDone: boolean
  checkpoint: string | null
  checkpointScore: { correct: number; total: number }
  hintsUsed: number
  showHint: boolean
  flash: { partId: string; tone: 'ok' | 'wrong'; nonce: number } | null
  message: { tone: Tone; text: string } | null
  focus: { target: string[] | 'all' | 'reset'; nonce: number }
  challenge: Challenge | null

  setModel: (id: string) => void
  setMode: (mode: LabMode) => void
  select: (id: string | null, focus?: boolean) => void
  hover: (id: string | null) => void
  clickPart: (id: string) => void
  setExplode: (v: number) => void
  toggleHidden: (id: string) => void
  showAll: () => void
  hideOthers: (id: string) => void
  isolate: (a: Assembly | null) => void
  toggleLabels: () => void
  toggleConnections: () => void
  requestFocus: (target: string[] | 'all' | 'reset') => void
  completeAction: (stageId: string) => void
  answerCheckpoint: (choice: number) => void
  useHint: () => void
  startChallenge: () => void
  finishReassembly: () => void
  dismissMessage: () => void
}

export const getModel = (id: string): InverterModel => MODEL_BY_ID[id] ?? MODEL_BY_ID[DEFAULT_MODEL_ID]
const level = () => useProgress.getState().level
let nonce = 0

const freshProcedure = { removed: [] as string[], actionsDone: [] as string[], disassemblyDone: false, checkpoint: null, checkpointScore: { correct: 0, total: 0 }, hintsUsed: 0, showHint: false }

export const useLab = create<LabState>()((set, get) => {
  /** After a removal or action, detect stage completion: ask the checkpoint (intermediate/advanced) and finish the procedure. */
  const afterProgress = () => {
    const s = get()
    const m = getModel(s.modelId)
    const cur = currentRemovalStage(m, s.removed, s.actionsDone)
    // Ask the checkpoint of any completed stage not yet answered (intermediate and advanced only).
    const pending = level() === 'beginner' ? undefined : m.procedure.slice(0, cur).find((st) => st.checkpoint && !s.actionsDone.includes(`cp:${st.id}`))
    if (pending) {
      set({ checkpoint: pending.id })
      return
    }
    if (cur === m.procedure.length && !s.disassemblyDone) {
      const p = useProgress.getState()
      const sc = get().checkpointScore
      p.recordActivity({
        activityId: 'lab3d:disassembly',
        label: `Guided disassembly · ${m.name}`,
        level: level(),
        modelId: m.id,
        ...(sc.total ? { score: sc.correct, maxScore: sc.total } : {}),
      })
      set({ disassemblyDone: true, message: { tone: 'done', text: `Disassembly complete${sc.total ? `, checkpoints ${sc.correct}/${sc.total}` : ''}. Every part is out in a safe order. Start the reassembly to put it back together.` } })
    }
  }

  const finishChallenge = (c: Challenge) => {
    const m = getModel(get().modelId)
    const score = c.results.filter(Boolean).length
    const p = useProgress.getState()
    const assessed = countsAsAssessment(m, c.level, c.prompts.length)
    p.recordActivity({ activityId: 'lab3d:identify', label: `Identification challenge (${c.level}) · ${m.name}`, level: c.level, modelId: m.id, score, maxScore: c.prompts.length })
    if (assessed) {
      p.recordAssessment(ASSESSMENT_ID, score, c.prompts.length)
      if (score / c.prompts.length >= PASS_FRACTION) p.completeLesson(ASSESSMENT_ID)
    }
    return { ...c, finishedAt: Date.now(), assessed }
  }

  return {
    modelId: DEFAULT_MODEL_ID,
    mode: 'explore',
    selectedId: null,
    hoveredId: null,
    explode: 0,
    hidden: ['cover'],
    isolated: null,
    showLabels: false,
    showConnections: false,
    ...freshProcedure,
    flash: null,
    message: null,
    focus: { target: 'reset', nonce: 0 },
    challenge: null,

    setModel: (id) => set({ modelId: id, mode: 'explore', selectedId: null, hidden: ['cover'], isolated: null, explode: 0, ...freshProcedure, challenge: null, message: null, focus: { target: 'reset', nonce: ++nonce } }),

    setMode: (mode) => {
      const s = get()
      if (mode === s.mode) return
      if (mode === 'reassemble' && !s.disassemblyDone) {
        set({ message: { tone: 'info', text: 'Reassembly starts from a fully dismantled inverter. Complete the guided disassembly first.' } })
        return
      }
      const base = { mode, selectedId: null, hoveredId: null, isolated: null, flash: null }
      if (mode === 'explore') set({ ...base, ...freshProcedure, hidden: ['cover'], explode: 0, message: null, challenge: null })
      else if (mode === 'disassemble') set({ ...base, ...freshProcedure, hidden: [], explode: 0, showLabels: false, challenge: null, message: { tone: 'info', text: 'The inverter is assembled and connected. Follow the steps in order; the lab explains any step taken out of order.' } })
      else if (mode === 'reassemble') set({ ...base, hidden: [], explode: 0, checkpoint: null, message: { tone: 'info', text: 'Rebuild in reverse order. Parts are installed from the tray by clicking where they belong, or from the parts list.' } })
      else set({ ...base, ...freshProcedure, hidden: ['cover'], explode: 0, showLabels: false, message: null, challenge: null })
    },

    select: (id, focus = false) => set({ selectedId: id, ...(focus && id ? { focus: { target: [id], nonce: ++nonce } } : {}) }),
    hover: (id) => set({ hoveredId: id }),

    clickPart: (id) => {
      const s = get()
      const m = getModel(s.modelId)
      const part = m.parts.find((p) => p.id === id)
      if (!part) return
      if (s.mode === 'explore') {
        set({ selectedId: id })
        return
      }
      if (s.mode === 'identify') {
        const c = s.challenge
        if (!c || c.finishedAt) return
        const target = c.prompts[c.index]
        const right = part.componentId === target.componentId
        if (right) useProgress.getState().identifyComponent(target.componentId)
        if (right || c.attemptsLeft <= 1) {
          const results = [...c.results, right]
          const next = { ...c, results, index: c.index + 1, attemptsLeft: ATTEMPTS[c.level] }
          const done = next.index >= c.prompts.length
          const name = PANEL_ENTRY_BY_ID[target.componentId].name
          set({
            challenge: done ? finishChallenge(next) : next,
            flash: { partId: id, tone: right ? 'ok' : 'wrong', nonce: ++nonce },
            message: right ? { tone: 'ok', text: `Correct: that is the ${name}.` } : { tone: 'wrong', text: `That was the ${part.label}. The target was the ${name}; it will be shown in the results.` },
          })
        } else {
          set({ challenge: { ...c, attemptsLeft: c.attemptsLeft - 1 }, flash: { partId: id, tone: 'wrong', nonce: ++nonce }, message: { tone: 'wrong', text: `Not that one: you clicked the ${part.label}. ${c.attemptsLeft - 1} attempt${c.attemptsLeft - 1 === 1 ? '' : 's'} left for this prompt.` } })
        }
        return
      }
      if (s.checkpoint) {
        set({ message: { tone: 'info', text: 'Answer the checkpoint question to continue.' } })
        return
      }
      if (s.mode === 'disassemble') {
        if (s.disassemblyDone) return
        const r = canRemove(m, s.removed, s.actionsDone, id)
        if (!r.ok) {
          set({ flash: { partId: id, tone: 'wrong', nonce: ++nonce }, message: { tone: 'wrong', text: r.reason } })
          return
        }
        set({ removed: [...s.removed, id], selectedId: null, showHint: false, flash: { partId: id, tone: 'ok', nonce: ++nonce }, message: { tone: 'ok', text: `Removed: ${part.label}. ${part.removalNote}` } })
        afterProgress()
        return
      }
      if (s.mode === 'reassemble') {
        const r = canInstall(m, s.removed, id)
        if (!r.ok) {
          set({ flash: { partId: id, tone: 'wrong', nonce: ++nonce }, message: { tone: 'wrong', text: r.reason } })
          return
        }
        const removed = s.removed.filter((x) => x !== id)
        set({ removed, showHint: false, flash: { partId: id, tone: 'ok', nonce: ++nonce }, message: { tone: 'ok', text: `Installed: ${part.label}.` } })
        if (currentInstallStage(m, removed) === -1) set({ message: { tone: 'info', text: 'Every part is back in place. Complete the reconnection and functional-test checklist to finish.' } })
      }
    },

    setExplode: (v) => set({ explode: Math.max(0, Math.min(1, v)) }),
    toggleHidden: (id) => set((s) => ({ hidden: s.hidden.includes(id) ? s.hidden.filter((x) => x !== id) : [...s.hidden, id] })),
    showAll: () => set({ hidden: [], isolated: null }),
    hideOthers: (id) => set((s) => ({ hidden: getModel(s.modelId).parts.filter((p) => p.id !== id).map((p) => p.id), isolated: null, focus: { target: [id], nonce: ++nonce } })),
    isolate: (a) => {
      const m = getModel(get().modelId)
      set({ isolated: a, focus: { target: a ? m.parts.filter((p) => p.assembly === a).map((p) => p.id) : 'all', nonce: ++nonce } })
    },
    toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
    toggleConnections: () => set((s) => ({ showConnections: !s.showConnections })),
    requestFocus: (target) => set({ focus: { target, nonce: ++nonce } }),

    completeAction: (stageId) => {
      const s = get()
      if (s.actionsDone.includes(stageId)) return
      set({ actionsDone: [...s.actionsDone, stageId], message: { tone: 'ok', text: 'Step complete.' } })
      if (stageId === 'discharge') {
        const m = getModel(s.modelId)
        useProgress.getState().recordActivity({ activityId: 'lab3d:discharge', label: `Capacitor discharge verified · ${m.dischargeBank.label}`, level: level(), modelId: m.id })
      }
      afterProgress()
    },

    answerCheckpoint: (choice) => {
      const s = get()
      const m = getModel(s.modelId)
      const st = m.procedure.find((x) => x.id === s.checkpoint)
      if (!st?.checkpoint) return
      const right = choice === st.checkpoint.correct
      set({
        checkpoint: null,
        actionsDone: [...s.actionsDone, `cp:${st.id}`],
        checkpointScore: { correct: s.checkpointScore.correct + (right ? 1 : 0), total: s.checkpointScore.total + 1 },
        message: { tone: right ? 'ok' : 'wrong', text: `${right ? 'Correct.' : `Not quite. The answer is: ${st.checkpoint.options[st.checkpoint.correct]}.`} ${st.checkpoint.explanation}` },
      })
      afterProgress()
    },

    useHint: () => set((s) => ({ hintsUsed: s.hintsUsed + 1, showHint: true })),

    startChallenge: () => {
      const m = getModel(get().modelId)
      const lv = level()
      const prompts = buildChallenge(m, lv, Date.now() & 0xffffffff)
      set({ challenge: { level: lv, prompts, index: 0, attemptsLeft: ATTEMPTS[lv], results: [], startedAt: Date.now(), finishedAt: null, assessed: false }, message: null, selectedId: null })
    },

    finishReassembly: () => {
      const s = get()
      const m = getModel(s.modelId)
      useProgress.getState().recordActivity({ activityId: 'lab3d:reassembly', label: `Guided reassembly and functional test · ${m.name}`, level: level(), modelId: m.id })
      set({ ...freshProcedure, mode: 'explore', hidden: ['cover'], message: { tone: 'done', text: `Reassembly complete and functional test passed for the ${m.name}.` } })
    },

    dismissMessage: () => set({ message: null }),
  }
})

/** Parts currently drawn: not hidden, inside the isolated assembly (if any). Removed parts animate out separately. */
export function isPartShown(s: Pick<LabState, 'hidden' | 'isolated'>, m: InverterModel, id: string) {
  if (s.hidden.includes(id)) return false
  if (s.isolated) return m.parts.find((p) => p.id === id)?.assembly === s.isolated
  return true
}
