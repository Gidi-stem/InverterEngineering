import type { ProgressData } from '../types/progress'

/**
 * Completion criteria for lessons that are earned by doing (3D Lab l3d-01…06, Component Library
 * cmp-01…05). A lesson is complete when the learner has studied the listed components (in a 3D
 * information panel or a library entry) and/or completed the listed activities.
 */
export interface LessonCriteria {
  lessonId: string
  inspect?: string[]
  activities?: string[]
  summary: string
}

export const LAB3D_LESSONS: LessonCriteria[] = [
  { lessonId: 'l3d-01', inspect: ['enclosure', 'battery-terminals', 'ac-output', 'solar-input', 'protective-earth'], summary: 'Study the enclosure, battery, AC, PV terminals and earth stud.' },
  { lessonId: 'l3d-02', inspect: ['mosfet', 'igbt', 'heat-sink', 'cooling-fan', 'capacitor', 'main-pcb', 'dc-input'], summary: 'Study the power switches, heat sink, fan, DC-bus capacitors, PCB and DC input.' },
  { lessonId: 'l3d-03', inspect: ['transformer', 'inductor'], summary: 'Study the transformer and output inductor.' },
  { lessonId: 'l3d-04', inspect: ['microcontroller', 'pwm-controller', 'gate-driver', 'display-board'], summary: 'Study the MCU, PWM controller, gate drivers and display.' },
  { lessonId: 'l3d-05', inspect: ['fuse', 'circuit-breaker', 'relay', 'current-sensor', 'voltage-sensor', 'resistor', 'diode'], summary: 'Study protection and sensing parts.' },
  { lessonId: 'l3d-06', activities: ['lab3d:discharge', 'lab3d:disassembly', 'lab3d:reassembly'], summary: 'Discharge the capacitors, then complete a full disassembly and reassembly.' },
]

export const LIBRARY_LESSONS: LessonCriteria[] = [
  { lessonId: 'cmp-01', inspect: ['mosfet', 'igbt'], summary: 'Study the MOSFET and IGBT entries.' },
  { lessonId: 'cmp-02', inspect: ['capacitor', 'inductor', 'resistor', 'diode', 'transformer'], summary: 'Study the passive components and the transformer.' },
  { lessonId: 'cmp-03', inspect: ['gate-driver', 'pwm-controller', 'microcontroller', 'display-board', 'main-pcb'], summary: 'Study the control electronics.' },
  { lessonId: 'cmp-04', inspect: ['relay', 'fuse', 'circuit-breaker', 'voltage-sensor', 'current-sensor', 'protective-earth'], summary: 'Study the protection and measurement devices.' },
  { lessonId: 'cmp-05', activities: ['library:compare:mosfet-vs-igbt', 'library:compare:transformer-vs-inductor'], summary: 'Complete the MOSFET vs IGBT and transformer vs inductor comparison checks.' },
]

export const ALL_LESSON_CRITERIA = [...LAB3D_LESSONS, ...LIBRARY_LESSONS]

export function lessonProgress(p: ProgressData, c: LessonCriteria): { done: number; total: number } {
  const ins = c.inspect ?? []
  const act = c.activities ?? []
  const done = ins.filter((id) => p.inspectedComponents.includes(id)).length + act.filter((id) => p.activities.some((a) => a.activityId === id)).length
  return { done, total: ins.length + act.length }
}

/** Lessons whose criteria are met but which are not yet marked complete. */
export function newlySatisfiedLessons(p: ProgressData): string[] {
  return ALL_LESSON_CRITERIA.filter((c) => !p.completedLessons.includes(c.lessonId)).filter((c) => {
    const { done, total } = lessonProgress(p, c)
    return done === total
  }).map((c) => c.lessonId)
}
