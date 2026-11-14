/**
 * Lightweight index of the Phase 5 simulation experiments (titles and the Inverter Fundamentals
 * lessons they earn). Kept free of engine imports so the app shell and module pages can use it
 * without loading the simulator.
 */
export const SIM_EXPERIMENT_TITLES: Record<string, string> = {
  'sim-01': 'RC charging and discharging',
  'sim-02': 'RL circuit response',
  'sim-03': 'Bridge rectification',
  'sim-04': 'Capacitor filtering',
  'sim-05': 'MOSFET switching',
  'sim-06': 'PWM generation',
  'sim-07': 'Half-bridge operation',
  'sim-08': 'H-bridge operation',
  'sim-09': 'Square-wave and modified-sine inverter',
  'sim-10': 'Pure sine-wave inverter',
}

/** Which Inverter Fundamentals lessons each experiment contributes to. */
export const FUNDAMENTALS_CRITERIA: { lessonId: string; experiments: string[]; summary: string }[] = [
  { lessonId: 'fun-01', experiments: ['sim-01', 'sim-03'], summary: 'Complete the RC and bridge-rectification experiments.' },
  { lessonId: 'fun-02', experiments: ['sim-05', 'sim-06'], summary: 'Complete the MOSFET switching and PWM experiments.' },
  { lessonId: 'fun-03', experiments: ['sim-07', 'sim-08'], summary: 'Complete the half-bridge and H-bridge experiments.' },
  { lessonId: 'fun-04', experiments: ['sim-09'], summary: 'Complete the square-wave / modified-sine inverter experiment.' },
  { lessonId: 'fun-05', experiments: ['sim-04', 'sim-10'], summary: 'Complete the filtering and pure-sine inverter experiments.' },
  { lessonId: 'fun-06', experiments: ['sim-02', 'sim-08'], summary: 'Complete the RL and H-bridge experiments (stored and returned energy).' },
  { lessonId: 'fun-07', experiments: ['sim-05', 'sim-09'], summary: 'Complete the MOSFET losses and inverter efficiency experiments.' },
]
