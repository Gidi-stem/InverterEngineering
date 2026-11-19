import type { RepairStepId } from './types'

/**
 * The repair workflow taught across every scenario (brief §5). Fixed order, fixed meaning —
 * scenarios only supply *which* of these apply and the scenario-specific detail, never a
 * different workflow. This is what keeps "diagnosis" and "repair confirmation" distinct (brief
 * §5, last line): a scenario's diagnosis checkpoint ends at `measure`; nothing is "repaired" until
 * `replace`/`solder` and `post-test`/`verify` are also done.
 */
export const REPAIR_PROCEDURE: { id: RepairStepId; title: string; summary: string }[] = [
  { id: 'inspect', title: 'Preliminary inspection', summary: 'Read the reported problem and nameplate/rating data; decide what is safe to check with the equipment as found.' },
  { id: 'isolate', title: 'Safe isolation', summary: 'Isolate every source (mains, battery, PV, generator), lock off, and inform anyone who uses the equipment.' },
  { id: 'discharge', title: 'Capacitor discharge and voltage verification', summary: 'Wait out or actively discharge stored energy in bus and filter capacitors, then prove dead with a verified tester before touching conductors.' },
  { id: 'visual', title: 'Visual inspection', summary: 'Look for scorch marks, bulged or vented capacitors, cracked solder joints, discolouration and loose connectors before powering anything.' },
  { id: 'measure', title: 'Measurement and diagnosis', summary: 'Take the measurements the checkpoints call for, interpret them against the healthy values, and narrow the candidate causes to one confirmed fault.' },
  { id: 'remove', title: 'Component removal', summary: 'Isolate and remove the identified component without damaging the board or neighbouring parts (correct desoldering/unclamping technique).' },
  { id: 'replace', title: 'Component replacement', summary: 'Fit a replacement of correct rating and polarity/orientation; like-for-like unless a documented upgrade is specified.' },
  { id: 'solder', title: 'Soldering and connection inspection', summary: 'Make sound joints and connections; inspect every joint disturbed during the repair, not only the replaced part\'s own leads.' },
  { id: 'post-test', title: 'Post-repair testing', summary: 'Re-energise under controlled conditions (current-limited supply, no load first) before returning the equipment to normal use.' },
  { id: 'verify', title: 'Functional verification', summary: 'Re-take the original diagnostic measurement and confirm it now matches the healthy reading, under the equipment\'s normal operating condition.' },
  { id: 'document', title: 'Documentation of repairs', summary: 'Record the symptom, the confirmed fault, the part replaced and the verification result for the equipment\'s history.' },
]
export const REPAIR_PROCEDURE_BY_ID = Object.fromEntries(REPAIR_PROCEDURE.map((s) => [s.id, s]))
