import type { Course } from '../types'
import { P4_M1 } from './m1'
import { P4_M2 } from './m2'
import { P4_M3 } from './m3'

export const P4: Course = {
  id: 'P4',
  title: 'Inside a Real Inverter',
  level: 'intermediate',
  stage: 'practitioner',
  summary: 'A guided tour of two real inverter architectures in the 3D laboratory, safe disassembly and reassembly, and component identification on the boards.',
  prerequisites: ['F1'],
  recommended: ['F4'],
  status: 'published',
  phase: 9,
  competency: 'CU-09',
  modules: [P4_M1, P4_M2, P4_M3],
  exam: {
    pass: 0.8,
    minutes: 40,
    attempts: 3,
    cooldownHours: 24,
    questions: [
      { id: 'e1', type: 'mcq', prompt: 'The protective earth connection is removed...', options: ['last, and reconnected first', 'first, and reconnected last', 'at any convenient point', 'only on models without a battery'], answer: 0, explain: 'Minimising the unearthed window.' },
      { id: 'e2', type: 'mcq', prompt: 'A real power board mixing MOSFETs and IGBTs most likely reflects...', options: ['each device family used where its strengths suit a different stage', 'a manufacturing error', 'random selection', 'cost-cutting with no technical basis'], answer: 0, explain: 'Deliberate device selection per F4.M2.' },
      { id: 'e3', type: 'mcq', prompt: 'The LF-3K transformer\'s substantial mass for its power rating directly illustrates...', options: ['why line-frequency transformers are larger than HF-link designs of equal power', 'a design flaw', 'an oversized part', 'nothing relevant to magnetics design'], answer: 0, explain: 'A direct physical consequence of line-frequency operation.' },
      { id: 'e4', type: 'mcq', prompt: 'A board using both a microcontroller and a dedicated PWM IC does so because...', options: ['each control philosophy is matched to the job it suits best', 'one is a redundant leftover', 'microcontrollers cannot generate PWM', 'PWM ICs cannot coexist with microcontrollers'], answer: 0, explain: 'Deliberate matching of control technology to function.' },
      { id: 'e5', type: 'mcq', prompt: 'A fuse protects a circuit...', options: ['independently of what the sensing/control system reports', 'only with sensor confirmation', 'only when commanded by firmware', 'never without sensing input'], answer: 0, explain: 'Protection devices act on actual current, independent of sensing.' },
      { id: 'e6', type: 'mcq', prompt: 'A "wait a fixed time" discharge rule with no meter check is unsafe because...', options: ['a failed bleeder resistor can make real discharge time much longer than expected', 'capacitors never discharge', '5 minutes is always excessive', 'bleeder resistors cannot fail'], answer: 0, explain: 'Discharge time depends on R×C; a failed resistor changes R unpredictably.' },
      { id: 'e7', type: 'mcq', prompt: 'Confirming one bus-capacitor bank is discharged...', options: ['says nothing definite about a separate bank\'s state', 'confirms every bank in the unit is safe', 'confirms the AC output is isolated', 'means the bleeder resistors can be removed'], answer: 0, explain: 'Each voltage domain must be confirmed independently.' },
      { id: 'e8', type: 'mcq', prompt: 'Unclamping switches before removing the heat sink is a...', options: ['genuine mechanical dependency', 'arbitrary convention', 'step that can always be skipped', 'purely electrical requirement'], answer: 0, explain: 'The switches are physically clamped to the heat sink.' },
      { id: 'e9', type: 'mcq', prompt: 'Removing the fan before the heat sink is best described as...', options: ['a sensible convention, not a strict dependency', 'mechanically impossible to do otherwise', 'the same kind of constraint as switch-clamping', 'required by electrical safety rules'], answer: 0, explain: 'Aids access, but is not a hard mechanical requirement.' },
      { id: 'e10', type: 'mcq', prompt: 'During reassembly, the earth connection is reconnected...', options: ['first, not last', 'last, mirroring disassembly exactly', 'at any convenient point', 'only if time permits'], answer: 0, explain: 'The deliberate exception preserving the earthing-safety priority.' },
      { id: 'e11', type: 'mcq', prompt: 'A functional test after reassembly should proceed...', options: ['in stages, each confirmed before the next', 'straight to full load', 'by visual inspection only', 'with no particular order'], answer: 0, explain: 'Staged verification limits the consequence of any hidden fault.' },
      { id: 'e12', type: 'mcq', prompt: 'The most reliable single component identification cue, when legible, is...', options: ['the printed marking or datecode', 'package shape alone', 'circuit position alone', 'colour'], answer: 0, explain: 'Marking is specific; package and position can be shared across device types.' },
      { id: 'e13', type: 'mcq', prompt: 'A confidently WRONG component identification is costly mainly because...', options: ['it leads to the wrong test procedure or replacement part', 'it is slower than correct identification', 'it has no real consequence', 'it only affects a score'], answer: 0, explain: 'Wrong identification causes real downstream compatibility failures.' },
      { id: 'e14', type: 'mcq', prompt: 'SQ-1K lacks an MPPT charger stage mainly because...', options: ['it is a simpler, single-purpose design', 'MPPT is technically impossible on any square-wave unit', 'it has no power board', 'IGBTs cannot be manufactured'], answer: 0, explain: 'A deliberate scope and cost decision.' },
      { id: 'e15', type: 'mcq', prompt: 'Inferring a unit\'s capability from its components should rely on...', options: ['the pattern of components present or absent together', 'one isolated component', 'colour and size', 'the manufacturer\'s name'], answer: 0, explain: 'Capability is a property of the whole architecture, not one isolated part.' },
    ],
  },
}
