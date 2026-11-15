import type { Course } from '../types'
import { S2_M1 } from './m1'
import { S2_M2 } from './m2'
import { S2_M3 } from './m3'
import { S2_M4 } from './m4'
import { S2_M5 } from './m5'

/** S2 Solar PV and Hybrid Engineering (Phase 7), taught with the Solar and Hybrid Engineering Laboratory. */
export const S2: Course = {
  id: 'S2',
  title: 'Solar PV and Hybrid Engineering',
  level: 'advanced',
  stage: 'specialist',
  summary: 'Photovoltaic fundamentals and module datasheets; strings, MPPT and PWM controllers and solar inverters; complete system design from an actual load profile (inverter, battery, array, controller, cables and protection); off-grid, grid-tied and hybrid systems with generator integration and energy management; installation design, commissioning and troubleshooting.',
  prerequisites: ['F1', 'F2'],
  recommended: ['S1', 'P5'],
  status: 'published',
  phase: 7,
  competency: 'CU-12',
  modules: [S2_M1, S2_M2, S2_M3, S2_M4, S2_M5],
  exam: {
    pass: 0.7,
    minutes: 75,
    attempts: 3,
    cooldownHours: 24,
    questions: [
      { id: 'e1', type: 'mcq', prompt: 'A PV module behaves as a current source because…', options: ['its current is set by irradiance over most of its voltage range', 'it stores charge', 'its voltage is fixed', 'it contains a battery'], answer: 0, explain: 'The flat part of the I–V curve.' },
      { id: 'e2', type: 'numeric', prompt: 'Cell temperature: NOCT 45 °C, ambient 30 °C, 800 W/m² (°C)?', answer: 55, tol: 0.01, unit: '°C', explain: '30 + 25.' },
      { id: 'e3', type: 'numeric', prompt: 'P_max of a 400 W module (γ −0.35 %/°C) at 55 °C, 1000 W/m² (W)?', answer: 358, tol: 0.01, unit: 'W', explain: '400 × (1 − 0.105).' },
      { id: 'e4', type: 'numeric', prompt: 'Module V_oc (37.1 V, β −0.27 %/°C) at −5 °C (V)?', answer: 40.11, tol: 0.01, unit: 'V', explain: '37.1 × 1.081.' },
      { id: 'e5', type: 'numeric', prompt: 'Maximum in series under 150 V with V_oc,cold 40.11 V?', answer: 3, tol: 0.001, unit: '', explain: '3.74 → 3.' },
      { id: 'e6', type: 'numeric', prompt: 'Reverse current into a faulty string, 4 strings of I_sc 13.8 A (A)?', answer: 51.75, tol: 0.01, unit: 'A', explain: '3 × 1.25 × 13.8.' },
      { id: 'e7', type: 'numeric', prompt: 'Minimum string fuse for I_sc 13.8 A (A)?', answer: 21.53, tol: 0.01, unit: 'A', explain: '1.56 × 13.8.' },
      { id: 'e8', type: 'mcq', prompt: 'With PWM on a 12 V battery, a 72-cell module operates…', options: ['near battery voltage, far below its MPP', 'at its MPP', 'at V_oc', 'at zero current'], answer: 0, explain: 'PWM connects array to battery.' },
      { id: 'e9', type: 'numeric', prompt: 'MPPT output current: 3 kW array, η 0.97, 48 V (A)?', answer: 60.63, tol: 0.01, unit: 'A', explain: '2910/48.' },
      { id: 'e10', type: 'mcq', prompt: 'Grid-tied inverters stop during an outage because of…', options: ['anti-islanding', 'battery protection', 'MPPT', 'overload'], answer: 0, explain: 'Protects line workers.' },
      { id: 'e11', type: 'numeric', prompt: 'Daily energy: fridge 150 W, duty 0.4, 24 h (Wh)?', answer: 1440, tol: 0.01, unit: 'Wh', explain: '150 × 0.4 × 24.' },
      { id: 'e12', type: 'numeric', prompt: 'Inverter for a 1.6 kW peak with 1.25 margin (W)?', answer: 2000, tol: 0.01, unit: 'W', explain: '1.25 × 1600.' },
      { id: 'e13', type: 'numeric', prompt: 'P_array: E_d 4.5 kWh, η_bat 0.95, η_ctrl 0.97, PSH 5, k 0.8 (W)?', answer: 1221, tol: 0.01, unit: 'W', explain: '4500/3.686 = 1221 W.' },
      { id: 'e14', type: 'numeric', prompt: 'Battery energy: E_d 4.5 kWh, 2 days, DoD 0.8 (kWh)?', answer: 11.25, tol: 0.01, unit: 'kWh', explain: '4.5 × 2 / 0.8.' },
      { id: 'e15', type: 'numeric', prompt: 'Capacity of 11.25 kWh at 24 V (Ah)?', answer: 468.75, tol: 0.01, unit: 'Ah', explain: '11 250/24.' },
      { id: 'e16', type: 'numeric', prompt: 'Battery fuse for I_max 84 A (sizes 80/100/125 A) (A)?', answer: 125, tol: 0.001, unit: 'A', explain: '1.25 × 84 = 105 → 125 A.' },
      { id: 'e17', type: 'numeric', prompt: 'Generator for P_peak 1.8 kW and charger 3.2 kW (kVA)?', answer: 7.8125, tol: 0.01, unit: 'kVA', explain: '1.25 × 5000 / 0.8.' },
      { id: 'e18', type: 'mcq', prompt: 'Lead-acid at 50 % DoD: valid generator thresholds?', options: ['start 55 %, stop 90 %', 'start 30 %, stop 90 %', 'start 55 %, stop 50 %', 'start 10 %, stop 60 %'], answer: 0, explain: 'Start above the LVD (50 %), stop above start.' },
      { id: 'e19', type: 'numeric', prompt: 'Expected I_sc at 800 W/m², 25 °C, for 14.0 A STC (A)?', answer: 11.2, tol: 0.01, unit: 'A', explain: '14 × 0.8.' },
      { id: 'e20', type: 'mcq', prompt: 'All strings read 25 % low in current with V_oc normal and no shade. Likely cause?', options: ['Soiling', 'Reversed string', 'Cold overvoltage', 'Battery ageing'], answer: 0, explain: 'Uniform light loss.' },
      { id: 'e21', type: 'mcq', prompt: 'A string reads a negative voltage during commissioning. You…', options: ['keep it isolated and correct its polarity', 'insert the fuse', 'connect it to test', 'ignore it'], answer: 0, explain: 'Reversed polarity.' },
      { id: 'e22', type: 'numeric', prompt: 'Battery-to-inverter path resistance: 3 V drop at 100 A (mΩ)?', answer: 30, tol: 0.01, unit: 'mΩ', explain: '3/100.' },
      { id: 'e23', type: 'numeric', prompt: 'Annual yield: 4 kWp, PSH 4.5, PR 0.8 (kWh)?', answer: 5256, tol: 0.01, unit: 'kWh', explain: '4 × 4.5 × 365 × 0.8.' },
      { id: 'e24', type: 'multi', prompt: 'Which belong to an installation’s DC protection and isolation? (select all)', options: ['String fuses where required', 'Lockable PV DC isolator', 'Battery fuse at the positive terminal', 'A wire link to short strings for testing'], answers: [0, 1, 2], explain: 'Never improvise shorting links.' },
      { id: 'e25', type: 'mcq', prompt: 'The insulation-resistance limit for commissioning comes from…', options: ['the applicable standard for the system voltage', 'the controller manual only', 'a universal 10 kΩ', 'the installer’s choice'], answer: 0, explain: 'Standards set it.' },
    ],
  },
}
