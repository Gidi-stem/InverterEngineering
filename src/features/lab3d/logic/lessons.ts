import type { ProgressData } from '../../../types/progress'

/**
 * Completion criteria for the 3D Lab lessons (l3d-01 … l3d-06). A lesson is complete when
 * the learner has studied the information panels of the listed components and/or completed
 * the listed activities. Criteria are by component, so they work for any inverter model.
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

export function lessonProgress(p: ProgressData, c: LessonCriteria): { done: number; total: number } {
  const ins = c.inspect ?? []
  const act = c.activities ?? []
  const done = ins.filter((id) => p.inspectedComponents.includes(id)).length + act.filter((id) => p.activities.some((a) => a.activityId === id)).length
  return { done, total: ins.length + act.length }
}

/** Lessons whose criteria are met but which are not yet marked complete. */
export function newlySatisfiedLessons(p: ProgressData): string[] {
  return LAB3D_LESSONS.filter((c) => !p.completedLessons.includes(c.lessonId)).filter((c) => {
    const { done, total } = lessonProgress(p, c)
    return done === total
  }).map((c) => c.lessonId)
}
