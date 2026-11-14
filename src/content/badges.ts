import type { Badge } from '../types/progress'

export const BADGES: Badge[] = [
  {
    id: 'first-light',
    title: 'First Light',
    description: 'Log your first waveform simulation run.',
    earned: (p) => p.simulationRuns.length >= 1,
  },
  {
    id: 'waveform-analyst',
    title: 'Waveform Analyst',
    description: 'Log runs for square, modified-sine and pure-sine outputs.',
    earned: (p) => {
      const kinds = new Set(p.simulationRuns.map((r) => r.params.waveform))
      return kinds.has('square') && kinds.has('modified-sine') && kinds.has('pure-sine')
    },
  },
  {
    id: 'explorer',
    title: 'Lab Explorer',
    description: 'Open five different laboratory sections.',
    earned: (p) => Object.keys(p.moduleVisits).length >= 5,
  },
  {
    id: 'component-spotter',
    title: 'Component Spotter',
    description: 'Identify 10 inverter components.',
    earned: (p) => p.identifiedComponents.length >= 10,
  },
  {
    id: 'safe-hands',
    title: 'Safe Hands',
    description: 'Discharge and verify a capacitor bank, then complete a guided disassembly.',
    earned: (p) => ['lab3d:discharge', 'lab3d:disassembly'].every((id) => p.activities.some((a) => a.activityId === id)),
  },
  {
    id: 'bench-hand',
    availableFromPhase: 4,
    title: 'Bench Hand',
    description: 'Complete three practical exercises.',
    earned: (p) => p.completedExercises.length >= 3,
  },
  {
    id: 'fault-finder',
    availableFromPhase: 9,
    title: 'Fault Finder',
    description: 'Correctly diagnose three fault scenarios.',
    earned: (p) => p.diagnoses.filter((d) => d.correct).length >= 3,
  },
  {
    id: 'designer',
    availableFromPhase: 6,
    title: 'Inverter Designer',
    description: 'Complete one Build Your Own Inverter project.',
    earned: (p) => p.completedProjects.length >= 1,
  },
  {
    id: 'certified-practical',
    availableFromPhase: 10,
    title: 'Practical Distinction',
    description: 'Score 80% or more on any practical assessment.',
    earned: (p) => p.assessments.some((a) => a.maxScore > 0 && a.score / a.maxScore >= 0.8),
  },
]
