import type { Archetype, CalcItem, DesignNumbers, DesignSpec, Selection } from './types'

/**
 * Educational design calculations. Every result is an explained step (formula, numbers, why).
 * Values tagged "assumption" are typical engineering figures, quoted from the Component Library
 * where it gives one; they are not datasheet values and the design is not a certified design.
 */
const SQ2 = Math.SQRT2
export const STANDARD_FUSES = [1, 2, 3, 5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100, 125, 150, 200, 250, 300, 400]
export const STANDARD_BREAKERS = [1, 2, 3, 4, 6, 10, 13, 16, 20, 25, 32, 40, 50, 63]
const nextStd = (list: number[], x: number) => list.find((v) => v >= x - 1e-9) ?? list[list.length - 1]
const r = (x: number, d = 3) => Number(x.toPrecision(d))
const fmt = (x: number, d = 3) => r(x, d).toLocaleString('en-GB', { maximumFractionDigits: 6 })

/** Typical design assumptions (labelled in the output). */
export const ASSUME = {
  /** Lead-acid battery: low-voltage cut-off 10.5 V and charging voltage 14.4 V per 12 V block. */
  vminPer12: 10.5,
  vmaxPer12: 14.4,
  /** Design modulation index at the lowest battery voltage (leaves headroom for regulation). */
  mAtVmin: 0.95,
  /** Transformer efficiency: laminated low-frequency and ferrite high-frequency. */
  etaXfmrLF: 0.96,
  etaXfmrHF: 0.97,
  /** Filter inductor copper loss and control/standby power as a fraction of rated power. */
  filterLossFrac: 0.005,
  controlLossFrac: 0.005,
  controlLossMin: 3,
  /** Ambient inside the enclosure and design junction-temperature limit (typical T_j(max) is 150 °C). */
  ambient: 40,
  tjLimit: 125,
  /** Junction-to-case and case-to-sink thermal resistance of a TO-247 device with an insulating pad. */
  rthJC: 0.5,
  rthCS: 0.3,
  /** Silicon rectifier forward voltage (library: ≈ 0.9–1.2 V at rated current). */
  vfRect: 1.0,
  /** Filter ripple target: inductor ripple current as a fraction of its peak current; corner at f_sw / 10. */
  rippleFrac: 0.25,
  cornerDiv: 10,
  /** Simplified PV model: maximum power at 0.8·V_oc and I_sc. */
  pvVmpFrac: 0.8,
  /** Battery internal resistance per 12 V block (healthy lead-acid, typical) and DC fuse plus wiring resistance. */
  rintPer12: 0.01,
  rFuseWiring: 0.005,
}

/** Resistive voltage drop of the transformer windings at full load, as a fraction (copper loss ≈ 60 % of the transformer losses). */
export const xfmrRegulation = (eta: number) => 0.6 * (1 / eta - 1)
export const batteryRint = (vdc: number) => Math.max(0.005, ASSUME.rintPer12 * (vdc / 12))

export function archetypeOf(projectId: string): Archetype {
  return projectId === 'bld-a' ? 'lv-bridge' : projectId === 'bld-e' ? 'push-pull' : projectId === 'bld-f' ? 'hf-link' : 'lf-bridge'
}

export function calculate(projectId: string, d: DesignSpec, sel: Selection): { items: CalcItem[]; numbers: DesignNumbers } {
  const arch = archetypeOf(projectId)
  const items: CalcItem[] = []
  const add = (id: string, group: string, label: string, value: number, unit: string, formula: string, working: string, why: string, kind: CalcItem['kind'] = 'calculated') => {
    items.push({ id, group, label, value, unit, formula, working, why, kind })
    return value
  }
  const per12 = d.vdc / 12
  // ── Input range ─────────────────────────────────────────────────────────
  const vmin = add('vmin', 'Input', 'Lowest battery voltage (low-voltage cut-off)', ASSUME.vminPer12 * per12, 'V', 'V_min = 10.5 V × (V_dc / 12 V)', `10.5 × ${d.vdc}/12 = ${fmt(ASSUME.vminPer12 * per12)} V`, 'Lead-acid batteries are protected from deep discharge near 10.5 V per 12 V block. The design must still deliver its output here, where currents are highest.', 'assumption')
  const vmax = add('vmax', 'Input', 'Highest battery voltage (while charging)', ASSUME.vmaxPer12 * per12, 'V', 'V_max = 14.4 V × (V_dc / 12 V)', `14.4 × ${d.vdc}/12 = ${fmt(ASSUME.vmaxPer12 * per12)} V`, 'Charging raises the battery voltage. Switches and capacitors are rated against this highest value.', 'assumption')

  // ── Output side ─────────────────────────────────────────────────────────
  const vout = arch === 'lv-bridge' ? d.vdc : d.vac
  const s = add('s', 'Output', 'Apparent power', d.power / d.pf, 'VA', 'S = P / PF', `${d.power} W / ${d.pf} = ${fmt(d.power / d.pf)} VA`, 'Transformers, switches and cables carry the current of the apparent power, not just the real power. An inductive load (PF < 1) needs a bigger inverter for the same watts.')
  const iout = add('iout', 'Output', 'Rated output current', s / vout, 'A rms', 'I_out = S / V_out', `${fmt(s)} VA / ${vout} V = ${fmt(s / vout)} A`, 'Sets the output breaker, output cable and secondary-winding ratings.')
  const z = vout / iout
  const rload = add('rload', 'Output', 'Equivalent load resistance at rated power', (vout * vout) / d.power, 'Ω', 'R = V_out² / P (resistive load)', `${vout}² / ${d.power} = ${fmt((vout * vout) / d.power)} Ω`, 'This is the resistive test load used in the simulated full-load test.')
  const phi = Math.acos(Math.min(1, d.pf))
  const loadR = z * d.pf
  const loadL = d.pf < 1 ? (z * Math.sin(phi)) / (2 * Math.PI * d.f) : 0
  if (d.load === 'inductive')
    add('lload', 'Output', 'Inductive test load: series R and L', loadL * 1000, 'mH', 'Z = V/I, R = Z·PF, X_L = Z·sin φ, L = X_L / (2πf)', `Z = ${fmt(z)} Ω, R = ${fmt(loadR)} Ω, X = ${fmt(z * Math.sin(phi))} Ω, L = ${fmt(loadL * 1000)} mH`, 'An inductive load makes the current lag the voltage; the bridge then returns energy to the DC side through the body diodes every half-cycle.')

  // ── Conversion stage ────────────────────────────────────────────────────
  const ron = (sel.ronMilli / 1000) as number
  const isMos = sel.switchType === 'mosfet'
  let n = 1
  let nLink = 0
  let vbus = d.vdc
  let m = 0
  let alpha = 180
  let iPriPk = 0
  let iPriRms = 0
  // Drop estimate across the conducting switches (2 in series for a bridge, 1 for push-pull), iterated once with the primary current.
  const switchesInPath = arch === 'push-pull' ? 1 : 2
  const rSource = batteryRint(d.vdc) + ASSUME.rFuseWiring
  const drop = (ipk: number) => (isMos ? switchesInPath * ipk * ron : switchesInPath * sel.vsat) + ipk * rSource
  if (arch === 'lv-bridge') {
    n = 1
    iPriRms = iout
    iPriPk = iout * (d.waveform === 'square' ? 1 : SQ2)
    add('vout-lv', 'Conversion', 'Output voltage (no transformer)', d.vdc - drop(iPriPk), 'V', 'V_out ≈ V_dc − 2·I·R_DS(on)', `${d.vdc} − 2 × ${fmt(iPriPk)} × ${fmt(ron)} = ${fmt(d.vdc - drop(iPriPk))} V`, 'Without a transformer the H-bridge can only produce ±V_dc: this is a low-voltage AC demonstrator, not a mains inverter.')
  } else if (arch === 'hf-link') {
    const vbusMin = (d.vac * SQ2) / ASSUME.mAtVmin
    vbus = add('vbus', 'Conversion', 'High-voltage DC bus (at the lowest battery voltage)', vbusMin, 'V', 'V_bus ≥ V_out,pk / m_max = √2·V_out / 0.95', `√2 × ${d.vac} / 0.95 = ${fmt(vbusMin)} V`, 'The second (HV) H-bridge can only make an output peak below its DC bus. 0.95 is the largest modulation index used, leaving headroom for regulation.')
    let ipk = (s / (vmin * 0.9)) * SQ2
    for (let k = 0; k < 3; k++) {
      nLink = (vbusMin + 2 * ASSUME.vfRect) / (vmin - (isMos ? ipk * ron : sel.vsat))
      ipk = (s / (vmin * 0.9)) * 1.1
    }
    add('nlink', 'Transformer', 'High-frequency transformer ratio N_s / N_half', nLink, '', 'n = (V_bus + 2·V_f) / (V_min − I·R_DS(on))', `(${fmt(vbusMin)} + 2 × ${ASSUME.vfRect}) / (${fmt(vmin)} − drop) = ${fmt(nLink)}`, 'The push-pull stage applies V_dc across each half of the primary; the secondary gives n·V_dc, rectified by fast diodes (two drops) into the HV bus.')
    vbus = nLink * (d.vdc - (isMos ? ipk * ron : sel.vsat)) - 2 * ASSUME.vfRect
    add('vbusnom', 'Conversion', 'HV bus at nominal battery voltage', vbus, 'V', 'V_bus = n·(V_dc − drop) − 2·V_f', `${fmt(nLink)} × (${d.vdc} − drop) − 2 = ${fmt(vbus)} V`, 'This is the bus the second bridge switches. It is hazardous (simulated only) and needs a discharge path.')
    m = add('m', 'Conversion', 'Modulation index at nominal input', Math.min(1, (d.vac * SQ2) / vbus), '', 'm = V_out,pk / V_bus', `√2 × ${d.vac} / ${fmt(vbus)} = ${fmt((d.vac * SQ2) / vbus)}`, 'Bipolar SPWM makes a fundamental of peak m·V_bus.')
    iPriPk = (s / (d.vdc * 0.9)) * 1.0
    iPriRms = s / (d.vdc * 0.9)
  } else {
    // Low-frequency transformer after the bridge (or the push-pull primary).
    const xreg = xfmrRegulation(ASSUME.etaXfmrLF) + (d.waveform === 'sine' ? ASSUME.filterLossFrac : 0)
    let ipk = (s / vmin) * SQ2
    for (let k = 0; k < 12; k++) {
      // Unregulated waveforms are designed at the nominal battery voltage; the regulated sine at the minimum.
      const vb = ((d.waveform === 'sine' ? vmin : d.vdc) - drop(ipk)) * (1 - xreg)
      if (d.waveform === 'square') n = d.vac / vb
      else if (d.waveform === 'modified') n = (d.vac * SQ2) / vb
      else n = (d.vac * SQ2) / (ASSUME.mAtVmin * vb)
      ipk = n * iout * (d.waveform === 'square' ? 1 : SQ2)
    }
    const label = arch === 'push-pull' ? 'Transformer ratio N_s / N_half (centre-tapped primary)' : 'Transformer ratio N_s / N_p'
    const f =
      d.waveform === 'square'
        ? ['n = V_out / ((V_nom − drop)·(1 − r_x))', `${d.vac} / ((${d.vdc} − ${fmt(drop(ipk))}) × ${fmt(1 - xreg)}) = ${fmt(n)}`, `A square wave has V_rms = V_peak, so the secondary must give the full output voltage. There is no feedback, so the ratio is set at the nominal battery voltage: the output then follows the battery, about ${fmt((vmin / d.vdc - 1) * 100)} % at the low-voltage cut-off and +${fmt((vmax / d.vdc - 1) * 100)} % while charging.`]
        : d.waveform === 'modified'
          ? ['n = √2·V_out / ((V_nom − drop)·(1 − r_x))', `√2 × ${d.vac} / ((${d.vdc} − ${fmt(drop(ipk))}) × ${fmt(1 - xreg)}) = ${fmt(n)}`, `The modified sine keeps the same peak as a sine wave (√2·V_out) and gets the right RMS by staying at zero part of the time. Unregulated, so designed at the nominal battery voltage: the output follows the battery (${fmt((vmin / d.vdc - 1) * 100)} % / +${fmt((vmax / d.vdc - 1) * 100)} %).`]
          : ['n = √2·V_out / (m_max·(V_min − drop)·(1 − r_x))', `√2 × ${d.vac} / (0.95 × (${fmt(vmin)} − ${fmt(drop(ipk))}) × ${fmt(1 - xreg)}) = ${fmt(n)}`, 'The SPWM bridge gives a fundamental of m·V_dc; the ratio is chosen so the full output is still reached at the lowest battery voltage with m = 0.95. At higher battery voltage the feedback reduces m.']
    add('drop', 'Conversion', 'Voltage drop at full load (switches, battery, fuse, wiring)', drop(ipk), 'V', isMos ? 'drop = I_pk·(k·R_DS(on) + R_bat + R_fuse+wiring)' : 'drop = k·V_CE(sat) + I_pk·(R_bat + R_fuse+wiring)', `k = ${switchesInPath} switches in the path; R_bat = ${fmt(batteryRint(d.vdc))} Ω, R_fuse+wiring = ${ASSUME.rFuseWiring} Ω (typical assumptions)`, 'Every resistance between the battery and the transformer lowers the voltage the primary actually receives; the ratio must allow for it or the output is low at full load.', 'assumption')
    add('xreg', 'Transformer', 'Transformer resistive regulation r_x', xreg, '', 'r_x ≈ 0.6·(1/η_T − 1)' + (d.waveform === 'sine' ? ' + filter loss fraction' : ''), `0.6 × (1/${ASSUME.etaXfmrLF} − 1)${d.waveform === 'sine' ? ` + ${ASSUME.filterLossFrac}` : ''} = ${fmt(xreg)}`, 'About 60 % of a transformer’s loss is copper loss in the windings; at full load that resistance drops the output by roughly the same fraction.', 'assumption')
    add('n', 'Transformer', label, n, '', f[0], f[1], f[2])
    if (d.waveform === 'modified') {
      alpha = add('alpha', 'Conversion', 'Conduction angle per half-cycle', 90, '°', 'V_rms = V_pk·√(α/180°) = V_pk/√2  ⇒  α = 90°', `√(90/180) = ${fmt(Math.sqrt(0.5))}`, 'With the sine-wave peak, a 90° pulse gives exactly the sine-wave RMS. Projects set it by delaying one bridge leg by 180° − 90° = 90°.')
    }
    if (d.waveform === 'sine') {
      m = add('m', 'Conversion', 'Modulation index at nominal input', Math.min(1, (d.vac * SQ2) / (n * (d.vdc - drop(ipk)))), '', 'm = √2·V_out / (n·(V_dc − drop))', `√2 × ${d.vac} / (${fmt(n)} × (${d.vdc} − drop)) = ${fmt((d.vac * SQ2) / (n * (d.vdc - drop(ipk))))}`, 'The regulator starts here and adjusts m every cycle to hold the output on its set-point.')
    }
    iPriPk = ipk
    iPriRms = n * iout
    add('ipri', 'Transformer', 'Primary current at rated power (lowest input)', iPriRms * (d.vdc / vmin), 'A rms', 'I_p ≈ n·I_out × (V_dc / V_min)', `${fmt(n)} × ${fmt(iout)} × ${d.vdc}/${fmt(vmin)} = ${fmt(iPriRms * (d.vdc / vmin))} A`, 'The low-voltage side carries n times the output current; this sets the primary winding, the switches and the battery cables.')
  }

  // ── Losses and efficiency ───────────────────────────────────────────────
  const priRms = iPriRms
  const pCond =
    arch === 'hf-link'
      ? priRms * priRms * ron * 1 + ((d.vac * iout) / vbus) ** 2 * (sel.hvRonMilli / 1000) * 2
      : isMos
        ? priRms * priRms * ron * switchesInPath
        : sel.vsat * priRms * 0.9 * switchesInPath
  add('pcond', 'Losses', 'Switch conduction loss', pCond, 'W', isMos ? 'P_cond = I_rms² × R_DS(on) × (switches in the current path)' : 'P_cond ≈ V_CE(sat) × I_avg × (switches in the path)', isMos ? `${fmt(priRms)}² × ${fmt(ron)} × ${switchesInPath}${arch === 'hf-link' ? ' + HV bridge' : ''} = ${fmt(pCond)} W` : `${sel.vsat} × ${fmt(priRms * 0.9)} × ${switchesInPath} = ${fmt(pCond)} W`, 'Heat in the switches while they are on. MOSFET loss grows with I², so low R_DS(on) matters most at 12 V.')
  const tsw = sel.tsw * 1e-9
  const pSw =
    d.waveform === 'sine' || arch === 'hf-link'
      ? arch === 'hf-link'
        ? 2 * 2 * d.fswLink * 0.5 * (2 * d.vdc) * priRms * tsw + (8 / Math.PI) * d.fsw * vbus * (iout * SQ2) * tsw
        : (8 / Math.PI) * d.fsw * d.vdc * iPriPk * tsw
      : 4 * 2 * d.f * 0.5 * d.vdc * iPriPk * tsw
  add('psw', 'Losses', 'Switching loss', pSw, 'W', d.waveform === 'sine' ? 'P_sw = (8/π)·f_sw·V_dc·I_pk·t_sw (four switches, two edges per carrier period, average |i| = 2I_pk/π)' : 'P_sw = 4 switches × 2 edges × f × ½·V·I·t_sw', `t_sw = ${sel.tsw} ns → ${fmt(pSw)} W`, 'Energy lost while a switch passes through the region where voltage and current are both present. It grows with switching frequency, so SPWM designs pay more than 50 Hz square-wave designs.')
  const etaX = arch === 'lv-bridge' ? 1 : arch === 'hf-link' ? ASSUME.etaXfmrHF : ASSUME.etaXfmrLF
  const pX = arch === 'lv-bridge' ? 0 : d.power * (1 / etaX - 1)
  if (arch !== 'lv-bridge') add('pxfmr', 'Losses', 'Transformer copper and core loss', pX, 'W', 'P_T = P·(1/η_T − 1)', `${d.power} × (1/${etaX} − 1) = ${fmt(pX)} W`, `Typical ${arch === 'hf-link' ? 'ferrite high-frequency' : 'laminated 50/60 Hz'} transformer efficiency of ${etaX * 100} % (assumption).`, 'assumption')
  const pF = d.waveform === 'sine' || arch === 'hf-link' ? ASSUME.filterLossFrac * d.power : 0
  if (pF) add('pfilter', 'Losses', 'Output filter inductor loss', pF, 'W', 'P_L ≈ 0.5 % × P', `0.005 × ${d.power} = ${fmt(pF)} W`, 'Copper and core loss in the filter choke (typical assumption).', 'assumption')
  const pCtl = Math.max(ASSUME.controlLossMin, ASSUME.controlLossFrac * d.power)
  add('pctl', 'Losses', 'Control, gate drive and standby', pCtl, 'W', 'P_ctl ≈ max(3 W, 0.5 % × P)', `max(3, 0.005 × ${d.power}) = ${fmt(pCtl)} W`, 'Controller, gate drivers, sensing and display; also the no-load consumption floor (assumption).', 'assumption')
  const losses = pCond + pSw + pX + pF + pCtl
  const eta = add('eta', 'Losses', 'Conversion efficiency at rated power', d.power / (d.power + losses), '', 'η = P / (P + ΣP_loss)', `${d.power} / (${d.power} + ${fmt(losses)}) = ${fmt((d.power / (d.power + losses)) * 100)} %`, 'The losses become heat inside the enclosure, and the battery must supply them too.')

  // ── Input current ───────────────────────────────────────────────────────
  const pin = d.power / eta
  const idc = add('idc', 'Input', 'DC input current at nominal voltage', pin / d.vdc, 'A', 'I_dc = P_in / V_dc = P / (η·V_dc)', `${d.power} / (${fmt(eta)} × ${d.vdc}) = ${fmt(pin / d.vdc)} A`, 'Battery current is large at low voltage: 1 kW from 12 V is about 90 A.')
  const idcMax = add('idcmax', 'Input', 'DC input current at the lowest battery voltage', pin / vmin, 'A', 'I_dc,max = P_in / V_min', `${fmt(pin)} / ${fmt(vmin)} = ${fmt(pin / vmin)} A`, 'Sizes the battery fuse, cables and the DC side of the switches.')
  if (d.waveform === 'sine' || arch === 'hf-link')
    add('iripple', 'Input', 'DC-side ripple current at 2·f', idc / SQ2, 'A rms', 'I_ripple ≈ I_dc / √2', `${fmt(idc)} / √2 = ${fmt(idc / SQ2)} A`, 'A single-phase inverter draws power pulsating at twice the output frequency; the battery and the DC bus capacitors carry this ripple (approximation for a sine output).')

  // ── Switching requirements ──────────────────────────────────────────────
  const stress = arch === 'push-pull' ? 2 * vmax : vmax
  const switchVReq = add('swv', 'Switching', 'Main switch voltage rating needed', (arch === 'push-pull' ? 1.5 : 1.5) * stress, 'V', arch === 'push-pull' ? 'V_DSS ≥ 1.5 × 2·V_max (push-pull: the off switch sees twice the supply)' : 'V_DSS ≥ 1.5 × V_max', `1.5 × ${fmt(stress)} = ${fmt(1.5 * stress)} V`, 'Margin for overshoot from wiring inductance at turn-off (a 1.5× margin is a common educational rule).')
  const switchIReq = add('swi', 'Switching', 'Main switch current rating needed', 2 * iPriPk * (d.vdc / vmin), 'A', 'I_D ≥ 2 × I_peak (at V_min)', `2 × ${fmt(iPriPk * (d.vdc / vmin))} = ${fmt(2 * iPriPk * (d.vdc / vmin))} A`, 'Continuous current ratings are quoted at 25 °C case; a 2× margin allows for heating and start-up surges.')
  let hvVReq = 0
  let hvIReq = 0
  if (arch === 'hf-link') {
    hvVReq = add('hvv', 'Switching', 'HV bridge switch voltage rating needed', 1.5 * vbus * (vmax / d.vdc), 'V', 'V ≥ 1.5 × V_bus,max', `1.5 × ${fmt(vbus * (vmax / d.vdc))} = ${fmt(1.5 * vbus * (vmax / d.vdc))} V`, 'The HV bridge switches the full DC bus; 600/650 V devices are the usual class for 230 V outputs.')
    hvIReq = add('hvi', 'Switching', 'HV bridge switch current rating needed', 2 * iout * SQ2, 'A', 'I ≥ 2 × I_out,pk', `2 × ${fmt(iout * SQ2)} = ${fmt(2 * iout * SQ2)} A`, 'Margin as above.')
  }
  add('deadtime', 'Switching', 'Dead time between complementary switches', isMos ? 1 : 2, 'µs', 'typical: 0.5–2 µs (MOSFET), 1–3 µs (IGBT)', isMos ? '1 µs' : '2 µs', 'Both switches of a leg must never conduct together (shoot-through). Real turn-off takes time, so the next turn-on is delayed.', 'assumption')
  add('gatedrive', 'Switching', 'Gate drive voltage', isMos ? 12 : 15, 'V', 'MOSFET 10–12 V, IGBT 15 V (typical)', isMos ? '12 V' : '15 V', 'Enough above the threshold to make the switch fully on (low R_DS(on)). High-side switches need a floating (bootstrap or isolated) supply referenced to their source.', 'assumption')

  // ── Filter (sine designs) ───────────────────────────────────────────────
  let filterL = 0
  let filterC = 0
  if (d.waveform === 'sine') {
    const vb = arch === 'hf-link' ? vbus : d.vdc
    const ipk = arch === 'hf-link' ? iout * SQ2 : iPriPk
    filterL = add('fl', 'Filter', 'Filter inductance (bridge side)', (vb / (2 * d.fsw * ASSUME.rippleFrac * ipk)) * 1000, 'mH', 'L = V_bus / (2 · f_sw · ΔI),  ΔI = 25 % × I_pk', `${fmt(vb)} / (2 × ${d.fsw} × 0.25 × ${fmt(ipk)}) = ${fmt((vb / (2 * d.fsw * ASSUME.rippleFrac * ipk)) * 1000)} mH`, 'Bipolar SPWM puts ±V_bus across the filter at the carrier frequency; the inductor limits the resulting current ripple (worst near the zero crossing).')
    const fc = d.fsw / ASSUME.cornerDiv
    const cRef = 1 / ((2 * Math.PI * fc) ** 2 * (filterL / 1000))
    const cAt = arch === 'hf-link' ? cRef : cRef / (n * n)
    filterC = add('fc', 'Filter', arch === 'hf-link' ? 'Filter capacitance' : 'Filter capacitance (on the secondary)', cAt * 1e6, 'µF', arch === 'hf-link' ? 'f_c = f_sw/10;  C = 1 / ((2π·f_c)²·L)' : 'f_c = f_sw/10;  C_ref = 1/((2π·f_c)²·L),  C_sec = C_ref / n²', `f_c = ${fmt(fc)} Hz → C = ${fmt(cAt * 1e6)} µF`, 'A corner a decade below the carrier attenuates the switching harmonics about 100× while passing 50/60 Hz. A capacitor on the secondary appears n² times larger on the primary.')
    add('fcheck', 'Filter', 'Filter corner relative to the output frequency', fc / d.f, '×', 'f_c / f', `${fmt(fc)} / ${d.f} = ${fmt(fc / d.f)}`, 'The corner must be well above the output frequency (≥ 10×) so the 50/60 Hz output is not attenuated or shifted, and well below f_sw.')
  }

  // ── Transformer requirements ────────────────────────────────────────────
  const xfmrVAReq = arch === 'lv-bridge' ? 0 : add('xva', 'Transformer', 'Transformer rating needed', 1.2 * s, 'VA', 'VA ≥ 1.2 × S', `1.2 × ${fmt(s)} = ${fmt(1.2 * s)} VA`, `${arch === 'hf-link' ? 'Ferrite core at ' + d.fswLink + ' Hz: small and light.' : 'Laminated steel core at ' + d.f + ' Hz (library: peak flux ≈ 1.2–1.5 T): heavy but robust.'} 20 % margin for surges and the magnetising current. It also provides galvanic isolation between battery and mains output.`)

  // ── DC bus capacitor ────────────────────────────────────────────────────
  const busVReq = add('busv', 'DC bus', arch === 'hf-link' ? 'HV bus capacitor voltage rating needed' : 'DC bus capacitor voltage rating needed', arch === 'hf-link' ? 1.25 * vbus * (vmax / d.vdc) : 1.25 * vmax, 'V', 'V_C ≥ 1.25 × V_bus,max', `1.25 × ${fmt(arch === 'hf-link' ? vbus * (vmax / d.vdc) : vmax)} = ${fmt(arch === 'hf-link' ? 1.25 * vbus * (vmax / d.vdc) : 1.25 * vmax)} V`, 'Electrolytic capacitors fail quickly above their rated voltage.')
  if (arch === 'hf-link') {
    const cb = d.power / (2 * Math.PI * d.f * vbus * (0.05 * vbus))
    add('busc', 'DC bus', 'HV bus capacitance for 5 % ripple at 2·f', cb * 1e6, 'µF', 'C = P / (ω·V_bus·ΔV),  ΔV = 5 % × V_bus', `${d.power} / (2π × ${d.f} × ${fmt(vbus)} × ${fmt(0.05 * vbus)}) = ${fmt(cb * 1e6)} µF`, 'The bus capacitor supplies the power that pulsates at twice the output frequency.')
    const rb = 60 / (cb * Math.log(vbus / 50))
    add('bleeder', 'Protection', 'Bus bleeder resistor (discharge to 50 V within 60 s)', rb / 1000, 'kΩ', 'R ≤ t / (C · ln(V₀ / 50 V))', `60 / (${fmt(cb * 1e6)} µF × ln(${fmt(vbus)}/50)) = ${fmt(rb / 1000)} kΩ, ${fmt((vbus * vbus) / rb)} W`, 'A charged HV capacitor is dangerous after switch-off; the bleeder discharges it (a typical safety target is below 50 V within a minute). Always verify with a meter before touching.')
  }

  // ── Protection ──────────────────────────────────────────────────────────
  const fuse = add('fuse', 'Protection', 'DC input fuse rating', nextStd(STANDARD_FUSES, 1.25 * idcMax), 'A', 'I_fuse ≥ 1.25 × I_dc,max → next standard size', `1.25 × ${fmt(idcMax)} = ${fmt(1.25 * idcMax)} A → ${nextStd(STANDARD_FUSES, 1.25 * idcMax)} A`, 'Fitted at the battery positive. It must carry the full-load current at low battery but blow on a short; its DC voltage and breaking-capacity ratings must suit the battery (library: breaking capacity must exceed the prospective short-circuit current).')
  const breaker = arch === 'lv-bridge' ? 0 : add('breaker', 'Protection', 'AC output breaker rating', nextStd(STANDARD_BREAKERS, 1.25 * iout), 'A', 'I_n ≥ 1.25 × I_out → next standard size', `1.25 × ${fmt(iout)} = ${fmt(1.25 * iout)} A → ${nextStd(STANDARD_BREAKERS, 1.25 * iout)} A`, 'Protects the output wiring; its magnetic trip (library: C-curve 5–10 × I_n) clears short circuits quickly.')
  add('lvd', 'Protection', 'Low-voltage disconnect', vmin, 'V', 'LVD = V_min', `${fmt(vmin)} V`, 'Stops the inverter before the battery is damaged by deep discharge.', 'assumption')
  if (arch !== 'lv-bridge') add('earth', 'Protection', 'Output earthing and RCD', 30, 'mA', 'RCD trip current (typical)', '30 mA', 'Bond the output neutral to protective earth and the enclosure where local wiring rules require it, and protect sockets with a residual-current device. This is educational guidance, not a wiring-code design.', 'assumption')

  // ── Thermal ─────────────────────────────────────────────────────────────
  const nSw = arch === 'push-pull' ? 2 : arch === 'hf-link' ? 6 : 4
  const pSwTot = pCond + pSw
  const pEach = pSwTot / nSw
  const sinkRth = sel.fan ? sel.heatsink * 0.4 : sel.heatsink
  const tSink = ASSUME.ambient + pSwTot * sinkRth
  const tj = tSink + pEach * (ASSUME.rthJC + ASSUME.rthCS)
  add('psw-tot', 'Thermal', 'Heat to remove from the switch heat sink', pSwTot, 'W', 'P = P_cond + P_sw', `${fmt(pCond)} + ${fmt(pSw)} = ${fmt(pSwTot)} W`, `Shared by ${nSw} switches on one heat sink.`)
  const heatsinkReq = add('rsa', 'Thermal', 'Largest heat-sink thermal resistance allowed', Math.max(0, (ASSUME.tjLimit - ASSUME.ambient - pEach * (ASSUME.rthJC + ASSUME.rthCS)) / Math.max(pSwTot, 1e-6)), '°C/W', 'R_θsa ≤ (T_j,lim − T_a − P_each·(R_θjc + R_θcs)) / P_total', `(125 − 40 − ${fmt(pEach)} × 0.8) / ${fmt(pSwTot)} = ${fmt((ASSUME.tjLimit - ASSUME.ambient - pEach * 0.8) / Math.max(pSwTot, 1e-6))} °C/W`, 'Keeps the hottest junction at or below a 125 °C design limit with 40 °C inside the enclosure (R_θjc 0.5 and R_θcs 0.3 °C/W are typical TO-247 assumptions). Below about 1 °C/W a fan is usually needed (library: the LF-3K sink is 1.2 °C/W natural, 0.3 °C/W with its fan).')
  add('tj', 'Thermal', 'Estimated junction temperature with your heat sink', tj, '°C', 'T_j = T_a + P_total·R_θsa(eff) + P_each·(R_θjc + R_θcs)', `40 + ${fmt(pSwTot)} × ${fmt(sinkRth)} + ${fmt(pEach)} × 0.8 = ${fmt(tj)} °C${sel.fan ? ' (fan: R_θsa × 0.4)' : ''}`, 'Steady-state estimate; the simulation gives the same figure from simulated losses in the thermal test.')

  // ── Solar / hybrid extras ───────────────────────────────────────────────
  let pvVmp = 0
  let pvPmp = 0
  let mpptDutyIdeal = 0
  if (projectId === 'bld-g') {
    pvVmp = add('vmp', 'Solar', 'PV maximum-power voltage (simplified model)', ASSUME.pvVmpFrac * d.pvVoc, 'V', 'V_mp ≈ 0.8·V_oc', `0.8 × ${d.pvVoc} = ${fmt(0.8 * d.pvVoc)} V`, 'Where the simplified PV curve delivers most power. Phase 7 uses the single-diode model with temperature and irradiance.', 'assumption')
    pvPmp = add('pmp', 'Solar', 'PV maximum power', pvVmp * d.pvIsc, 'W', 'P_mp ≈ V_mp × I_sc', `${fmt(pvVmp)} × ${d.pvIsc} = ${fmt(pvVmp * d.pvIsc)} W`, 'The MPPT stage tries to operate the array here.')
    mpptDutyIdeal = add('dmp', 'Solar', 'Buck MPPT duty cycle that reaches the maximum-power point', Math.min(0.98, d.vdc / pvVmp), '', 'D = V_bat / V_mp (ideal buck)', `${d.vdc} / ${fmt(pvVmp)} = ${fmt(d.vdc / pvVmp)}`, 'A buck converter makes V_bat = D·V_pv, so choosing D sets the PV voltage. The array voltage must stay above the highest battery voltage for a buck MPPT.')
    add('ichg', 'Solar', 'Battery charging current at maximum power', (pvPmp * 0.96) / d.vdc, 'A', 'I_chg = η·P_mp / V_bat (η ≈ 0.96 assumed)', `0.96 × ${fmt(pvPmp)} / ${d.vdc} = ${fmt((pvPmp * 0.96) / d.vdc)} A`, 'Sets the charge-controller rating and the PV-to-battery cable.')
    add('pvfuse', 'Solar', 'PV string fuse rating', nextStd(STANDARD_FUSES, 1.56 * d.pvIsc), 'A', 'I ≥ 1.25 × 1.25 × I_sc', `1.56 × ${d.pvIsc} = ${fmt(1.56 * d.pvIsc)} A`, 'Common rule: 125 % for high irradiance times 125 % continuous-duty margin. PV is a current source and cannot be switched off by covering it, so DC isolators are needed.', 'assumption')
    add('pvvcold', 'Solar', 'Array voltage in cold weather (charge-controller input limit)', 1.15 * d.pvVoc, 'V', 'V_oc,cold ≈ 1.15 × V_oc', `1.15 × ${d.pvVoc} = ${fmt(1.15 * d.pvVoc)} V`, 'PV voltage rises as cells get colder; the controller input must withstand it (typical assumption).', 'assumption')
  }
  if (projectId === 'bld-h') {
    add('transfer', 'Hybrid', 'Transfer relay contact rating', nextStd(STANDARD_BREAKERS, 1.25 * iout), 'A', 'I_contact ≥ 1.25 × I_out', `1.25 × ${fmt(iout)} = ${fmt(1.25 * iout)} A`, 'The transfer relay carries the whole load from grid, generator or inverter.')
    add('pchg', 'Hybrid', 'Charger power from the grid', d.chargeCurrent * vmax, 'W', 'P_chg = I_chg × V_max', `${d.chargeCurrent} × ${fmt(vmax)} = ${fmt(d.chargeCurrent * vmax)} W`, 'In grid mode the grid supplies the load and recharges the battery at the same time; the grid input must carry both.')
    add('igrid', 'Hybrid', 'Grid input current (load + charger)', iout + (d.chargeCurrent * vmax) / d.vac, 'A', 'I_grid ≈ I_out + P_chg / V_ac', `${fmt(iout)} + ${fmt((d.chargeCurrent * vmax) / d.vac)} = ${fmt(iout + (d.chargeCurrent * vmax) / d.vac)} A`, 'Sizes the grid input breaker.')
    add('ttransfer', 'Hybrid', 'Typical transfer time', 15, 'ms', 'relay operate time (typical)', '10–20 ms', 'A relay-based transfer interrupts the load for about one cycle; most appliances ride through it, computers may need a UPS-grade transfer.', 'assumption')
  }

  const numbers: DesignNumbers = {
    vmin, vmax, s, iout, rload, loadR, loadL, n, nLink, vbus, m, alpha, iPriPk, idc, idcMax, efficiency: eta, losses, pCond, pSw,
    filterL, filterC, fuse, breaker, switchVReq, switchIReq, hvVReq, hvIReq, xfmrVAReq, busVReq,
    diodeVReq: arch === 'hf-link' ? 1.5 * vbus * (vmax / d.vdc) : projectId === 'bld-h' ? 3 * d.vdc : 2 * d.vdc,
    diodeIReq: arch === 'hf-link' ? 2 * ((d.power / vbus) * 1.2) : projectId === 'bld-h' ? 2 * d.chargeCurrent : 2 * iout,
    tj, heatsinkReq, pvVmp, pvPmp, mpptDutyIdeal,
  }
  return { items, numbers }
}
