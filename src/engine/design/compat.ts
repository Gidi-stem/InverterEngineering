import { archetypeOf } from './calc'
import type { CompatCheck, DesignNumbers, DesignSpec, Selection } from './types'

/**
 * Component compatibility. The student chooses GENERIC ratings for each role; they are compared
 * with the requirements calculated from the design. No manufacturer datasheet values are stored:
 * a real build must confirm every rating on the chosen part's datasheet.
 */
const f = (x: number, d = 3) => Number(x.toPrecision(d)).toLocaleString('en-GB')

export function checkCompatibility(projectId: string, d: DesignSpec, sel: Selection, nb: DesignNumbers): CompatCheck[] {
  const arch = archetypeOf(projectId)
  const out: CompatCheck[] = []
  const add = (c: CompatCheck) => out.push(c)
  const sw = sel.switchType === 'mosfet' ? 'MOSFET' : 'IGBT'
  const swComp = sel.switchType
  const highestF = Math.max(d.waveform === 'sine' ? d.fsw : d.f, arch === 'hf-link' ? d.fswLink : 0)
  const stress = arch === 'push-pull' ? 2 * nb.vmax : arch === 'hf-link' ? nb.vmax * 2 : nb.vmax

  // Main switches
  add({
    id: 'sw-v', role: `Main switches (${sw})`, componentId: swComp, aspect: 'voltage',
    status: sel.switchV >= nb.switchVReq ? 'pass' : sel.switchV > stress ? 'warn' : 'fail',
    required: `≥ ${f(nb.switchVReq)} V (calculated: 1.5 × ${f(stress)} V)`, selected: `${sel.switchV} V`,
    explanation: sel.switchV >= nb.switchVReq ? 'Rated above the off-state voltage with margin for turn-off overshoot.' : sel.switchV > stress ? 'Above the steady off-state voltage but without margin: wiring inductance spikes at every turn-off can exceed it.' : `Below the voltage the switch must block${arch === 'push-pull' ? ' (in push-pull the off switch sees twice the supply)' : ''}: it would break down.`,
  })
  add({
    id: 'sw-i', role: `Main switches (${sw})`, componentId: swComp, aspect: 'current',
    status: sel.switchI >= nb.switchIReq ? 'pass' : sel.switchI >= nb.switchIReq / 2 ? 'warn' : 'fail',
    required: `≥ ${f(nb.switchIReq)} A (2 × peak at the lowest input)`, selected: `${sel.switchI} A`,
    explanation: sel.switchI >= nb.switchIReq ? 'Enough margin for heating and surges.' : sel.switchI >= nb.switchIReq / 2 ? 'Above the peak current but without the usual 2× margin (continuous ratings are quoted at 25 °C case).' : 'Below the peak current the switch must carry.',
  })
  const igbtLowV = sel.switchType === 'igbt' && d.vdc <= 48
  add({
    id: 'sw-sw', role: `Main switches (${sw})`, componentId: swComp, aspect: 'switching',
    status: sel.switchType === 'igbt' && highestF > 20000 ? 'fail' : igbtLowV ? (d.vdc <= 24 ? 'fail' : 'warn') : 'pass',
    required: `switch at ${f(highestF)} Hz from a ${d.vdc} V supply`, selected: `${sw}, t_sw = ${sel.tsw} ns`,
    explanation:
      sel.switchType === 'igbt' && highestF > 20000
        ? 'Library (typical): discrete IGBTs are practical up to about 20–40 kHz; their tail current makes switching losses climb above that.'
        : igbtLowV
          ? `Library (typical): V_CE(sat) ≈ 1.5–2.5 V. Two IGBTs in series drop ${f(2 * sel.vsat)} V of a ${d.vdc} V supply; low-voltage bridges use MOSFETs (R_DS(on) of a few mΩ).`
          : sel.switchType === 'mosfet'
            ? 'MOSFETs switch fast and suit low-voltage bridges and kHz switching.'
            : 'IGBTs suit high-voltage stages at moderate switching frequency.',
  })
  add({
    id: 'sw-p', role: 'Switch heat sink', componentId: 'heat-sink', aspect: 'thermal',
    status: nb.tj <= 125 ? 'pass' : nb.tj <= 150 ? 'warn' : 'fail',
    required: `T_j ≤ 125 °C design limit (R_θsa ≤ ${f(nb.heatsinkReq)} °C/W)`, selected: `R_θsa = ${sel.heatsink} °C/W${sel.fan ? ' with fan' : ''} → T_j ≈ ${f(nb.tj)} °C`,
    explanation: nb.tj <= 125 ? 'The junctions stay inside the design limit.' : nb.tj <= 150 ? 'Below a typical 150 °C maximum but with no margin: lifetime suffers. Use a better heat sink or a fan.' : 'Above a typical 150 °C maximum junction temperature: the switches would fail. Lower R_DS(on), a larger heat sink or a fan are needed.',
  })
  add({
    id: 'sw-loss', role: `Main switches (${sw})`, componentId: swComp, aspect: 'power',
    status: nb.pCond + nb.pSw <= 0.04 * d.power ? 'pass' : nb.pCond + nb.pSw <= 0.08 * d.power ? 'warn' : 'fail',
    required: 'switch losses ≤ 4 % of rated power (efficiency target)', selected: `${f(nb.pCond)} W conduction + ${f(nb.pSw)} W switching = ${f(((nb.pCond + nb.pSw) / d.power) * 100)} %`,
    explanation: 'Losses come from your R_DS(on) / V_CE(sat) and switching-time choices (see the Losses calculations).',
  })

  // Gate drive
  const needsHigh = arch !== 'push-pull'
  add({
    id: 'gd', role: 'Gate driver', componentId: 'gate-driver', aspect: 'gate-drive',
    status: !needsHigh ? 'pass' : sel.driver === 'low-side' ? 'fail' : sel.driver === 'bootstrap' && d.waveform !== 'sine' && arch !== 'hf-link' ? 'warn' : 'pass',
    required: needsHigh ? 'floating supply for the high-side switches (source moves with the output)' : 'low-side drive only (push-pull switches share the negative rail)', selected: sel.driver,
    explanation: !needsHigh
      ? 'Both push-pull switches are referenced to the battery negative, so simple low-side drivers work.'
      : sel.driver === 'low-side'
        ? 'A low-side driver cannot turn on a high-side MOSFET: its source rises to the bus, so V_GS collapses. Use a bootstrap or isolated driver.'
        : sel.driver === 'bootstrap' && d.waveform !== 'sine' && arch !== 'hf-link'
          ? 'Works, but at 50/60 Hz the bootstrap capacitor must hold the high-side gate charge for a whole half-cycle; an isolated supply or a large bootstrap capacitor is needed.'
          : 'Suitable floating drive for the high-side switches.',
  })
  // Controller
  const needsMcu = d.waveform === 'sine' || projectId === 'bld-g' || projectId === 'bld-h'
  add({
    id: 'ctl', role: 'Controller', componentId: sel.controller === 'mcu' ? 'microcontroller' : 'pwm-controller', aspect: 'topology',
    status: needsMcu && sel.controller !== 'mcu' ? 'fail' : d.waveform === 'modified' && sel.controller !== 'mcu' ? 'warn' : 'pass',
    required: needsMcu ? 'sinusoidal reference, feedback and supervisory logic (MCU)' : d.waveform === 'modified' ? 'two phase-shifted leg signals' : 'fixed-frequency complementary square-wave drive',
    selected: sel.controller === 'mcu' ? 'Microcontroller' : 'PWM controller IC (SG3525 class)',
    explanation: needsMcu && sel.controller !== 'mcu'
      ? `An SG3525-class PWM IC makes fixed-frequency PWM; it cannot generate the sine reference${projectId === 'bld-g' ? ', run MPPT' : projectId === 'bld-h' ? ', or run the transfer logic' : ''} alone.`
      : d.waveform === 'modified' && sel.controller !== 'mcu'
        ? 'Possible with extra logic, but the phase-shifted legs are easiest from a microcontroller.'
        : 'Suitable for this waveform.',
  })

  // Transformer
  if (arch !== 'lv-bridge') {
    const coreOk = arch === 'hf-link' ? sel.xfmrCore === 'ferrite' : sel.xfmrCore === 'laminated'
    add({
      id: 'xf-core', role: 'Transformer', componentId: 'transformer', aspect: 'topology',
      status: coreOk ? 'pass' : 'fail', required: arch === 'hf-link' ? `ferrite core for ${d.fswLink} Hz` : `laminated steel core for ${d.f} Hz`, selected: sel.xfmrCore,
      explanation: coreOk ? 'Core material suits the operating frequency.' : arch === 'hf-link' ? 'Laminated steel has very high eddy-current and hysteresis loss at kHz frequencies.' : 'A ferrite core sized for kHz would saturate at 50/60 Hz: the flux per half-cycle is hundreds of times larger.',
    })
    add({
      id: 'xf-va', role: 'Transformer', componentId: 'transformer', aspect: 'power',
      status: sel.xfmrVA >= nb.xfmrVAReq ? 'pass' : sel.xfmrVA >= nb.s ? 'warn' : 'fail',
      required: `≥ ${f(nb.xfmrVAReq)} VA (1.2 × S)`, selected: `${sel.xfmrVA} VA`,
      explanation: sel.xfmrVA >= nb.xfmrVAReq ? 'Adequate rating with margin.' : sel.xfmrVA >= nb.s ? 'Just above the apparent power: it will run hot at full load.' : 'Below the apparent power: it overheats and its voltage sags under load.',
    })
  }
  // Filter
  if (d.waveform === 'sine') {
    const cRef = arch === 'hf-link' ? sel.filterC : sel.filterC * nb.n * nb.n
    const fc = 1 / (2 * Math.PI * Math.sqrt(sel.filterL * 1e-3 * cRef * 1e-6))
    add({
      id: 'flt', role: 'Output LC filter', componentId: 'inductor', aspect: 'topology',
      status: fc >= 10 * d.f && fc <= d.fsw / 5 ? 'pass' : fc >= 5 * d.f && fc <= d.fsw / 2 ? 'warn' : 'fail',
      required: `corner between 10 × f = ${10 * d.f} Hz and f_sw / 5 = ${f(d.fsw / 5)} Hz (suggested L ≈ ${f(nb.filterL)} mH, C ≈ ${f(nb.filterC)} µF)`,
      selected: `L = ${sel.filterL} mH, C = ${sel.filterC} µF → f_c = ${f(fc)} Hz`,
      explanation: fc > d.fsw / 5 ? 'The corner is too close to the carrier: switching harmonics pass to the output.' : fc < 10 * d.f ? 'The corner is too close to the output frequency: the filter distorts and shifts the 50/60 Hz output and circulates large reactive current.' : 'Passes the fundamental and attenuates the carrier harmonics.',
    })
    add({
      id: 'flt-c', role: 'Output LC filter', componentId: 'capacitor', aspect: 'voltage',
      status: sel.filterCType === 'film-ac' ? 'pass' : 'fail', required: 'AC-rated film capacitor (non-polarised)', selected: sel.filterCType === 'film-ac' ? 'AC-rated film' : 'Electrolytic',
      explanation: sel.filterCType === 'film-ac' ? 'Film capacitors are non-polarised and rated for continuous AC (library: the LF-3K output capacitor is 10 µF / 275 V~ film).' : 'Electrolytic capacitors are polarised: on an AC output they are reverse-biased every half-cycle and fail.',
    })
  }
  // DC bus capacitor
  add({
    id: 'bus', role: arch === 'hf-link' ? 'HV bus capacitor' : 'DC bus capacitor', componentId: 'capacitor', aspect: 'voltage',
    status: sel.busV >= nb.busVReq ? 'pass' : sel.busV >= nb.busVReq / 1.25 ? 'warn' : 'fail',
    required: `≥ ${f(nb.busVReq)} V`, selected: `${sel.busC} µF / ${sel.busV} V`,
    explanation: sel.busV >= nb.busVReq ? 'Rated above the highest bus voltage with margin.' : sel.busV >= nb.busVReq / 1.25 ? 'Just above the bus voltage: no margin for transients.' : 'Below the highest bus voltage: the electrolytic would fail.',
  })
  // Protection
  add({
    id: 'fuse', role: 'DC input fuse', componentId: 'fuse', aspect: 'protection',
    status: sel.fuse < nb.idcMax ? 'fail' : sel.fuse > 2.5 * nb.idcMax || sel.fuse > 2 * sel.switchI ? 'warn' : 'pass',
    required: `between ${f(1.25 * nb.idcMax)} A and ${f(Math.min(2.5 * nb.idcMax, 2 * sel.switchI))} A (suggested ${nb.fuse} A)`, selected: `${sel.fuse} A`,
    explanation: sel.fuse < nb.idcMax ? 'Below the full-load input current at low battery: it would blow in normal use.' : sel.fuse > 2.5 * nb.idcMax || sel.fuse > 2 * sel.switchI ? 'Oversized: a fault could overheat the cables or switches before the fuse clears.' : 'Carries the full load and clears faults.',
  })
  if (arch !== 'lv-bridge')
    add({
      id: 'brk', role: 'AC output breaker', componentId: 'circuit-breaker', aspect: 'protection',
      status: sel.breaker < nb.iout ? 'fail' : sel.breaker > 2.5 * nb.iout ? 'warn' : 'pass',
      required: `between ${f(1.25 * nb.iout)} A and ${f(2.5 * nb.iout)} A (suggested ${nb.breaker} A)`, selected: `${sel.breaker} A`,
      explanation: sel.breaker < nb.iout ? 'Trips at rated load.' : sel.breaker > 2.5 * nb.iout ? 'Too large to protect the output wiring.' : 'Protects the output wiring and clears output short circuits.',
    })
  if (d.waveform === 'sine')
    add({
      id: 'vsense', role: 'Output voltage sensor (feedback)', componentId: 'voltage-sensor', aspect: 'protection',
      status: sel.vsensor ? 'pass' : 'fail', required: 'output voltage feedback for regulation', selected: sel.vsensor ? 'fitted' : 'not fitted',
      explanation: sel.vsensor ? 'The controller can regulate the output as the battery voltage and the load change.' : 'Without feedback the output follows the battery voltage and the load: no regulation.',
    })
  add({
    id: 'csense', role: 'Current sensor (overcurrent protection)', componentId: 'current-sensor', aspect: 'protection',
    status: sel.csensor ? 'pass' : d.waveform === 'sine' || arch === 'hf-link' ? 'warn' : 'pass', required: d.waveform === 'sine' || arch === 'hf-link' ? 'fast overcurrent shutdown (recommended)' : 'optional for this design', selected: sel.csensor ? 'fitted' : 'not fitted',
    explanation: sel.csensor ? 'The controller can shut the bridge down within microseconds on a short, before fuses act.' : 'Fuses and breakers protect wiring; switches usually need faster electronic current limiting.',
  })
  if (arch === 'hf-link') {
    add({ id: 'hv-v', role: 'HV bridge switches', componentId: sel.hvType, aspect: 'voltage', status: sel.hvV >= nb.hvVReq ? 'pass' : sel.hvV >= nb.vbus * 1.1 ? 'warn' : 'fail', required: `≥ ${f(nb.hvVReq)} V`, selected: `${sel.hvV} V ${sel.hvType}`, explanation: sel.hvV >= nb.hvVReq ? 'Suitable for the HV bus.' : 'Too close to (or below) the HV bus voltage.' })
    add({ id: 'hv-i', role: 'HV bridge switches', componentId: sel.hvType, aspect: 'current', status: sel.hvI >= nb.hvIReq ? 'pass' : sel.hvI >= nb.hvIReq / 2 ? 'warn' : 'fail', required: `≥ ${f(nb.hvIReq)} A`, selected: `${sel.hvI} A`, explanation: 'Must carry the output current with margin.' })
    add({ id: 'hv-sw', role: 'HV bridge switches', componentId: sel.hvType, aspect: 'switching', status: sel.hvType === 'igbt' && d.fsw > 20000 ? 'fail' : 'pass', required: `SPWM at ${d.fsw} Hz`, selected: sel.hvType, explanation: sel.hvType === 'igbt' && d.fsw > 20000 ? 'Library (typical): discrete IGBTs are practical up to about 20–40 kHz.' : 'Suitable for the carrier frequency.' })
    add({ id: 'diode', role: 'Fast rectifier diodes (HV bus)', componentId: 'diode', aspect: 'voltage', status: sel.diodeV >= nb.diodeVReq && sel.diodeI >= nb.diodeIReq ? 'pass' : 'fail', required: `≥ ${f(nb.diodeVReq)} V, ≥ ${f(nb.diodeIReq)} A, fast recovery at ${d.fswLink} Hz`, selected: `${sel.diodeV} V / ${sel.diodeI} A`, explanation: 'Standard 50 Hz rectifiers (e.g. the 1N5408 class) recover too slowly for kHz rectification; fast or ultrafast diodes are required.' })
    add({ id: 'bleed', role: 'Bus bleeder resistor', componentId: 'resistor', aspect: 'protection', status: sel.bleeder ? 'pass' : 'fail', required: 'discharge path for the HV bus capacitor', selected: sel.bleeder ? 'fitted' : 'not fitted', explanation: sel.bleeder ? 'The bus discharges after switch-off (still verify with a meter before touching).' : 'Without a bleeder the HV capacitor can stay charged for a long time after switch-off: a serious shock hazard.' })
  }
  if (projectId === 'bld-h')
    add({ id: 'diode', role: 'Charger rectifier diodes', componentId: 'diode', aspect: 'current', status: sel.diodeV >= nb.diodeVReq && sel.diodeI >= nb.diodeIReq ? 'pass' : 'fail', required: `≥ ${f(nb.diodeVReq)} V, ≥ ${f(nb.diodeIReq)} A`, selected: `${sel.diodeV} V / ${sel.diodeI} A`, explanation: 'The charger bridge carries the full charging current.' })
  return out
}

export const compatSummary = (c: CompatCheck[]) => ({ pass: c.filter((x) => x.status === 'pass').length, warn: c.filter((x) => x.status === 'warn').length, fail: c.filter((x) => x.status === 'fail').length })
