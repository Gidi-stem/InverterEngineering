# Phase 5 Plan: Electrical Simulation Engine

## 1. What exists (Phase 4 inspection)

| Area | Phase 4 state | Phase 5 decision |
|---|---|---|
| Topology | `buildTopology`: union-find nodes, reference node | **Reused unchanged.** The transient netlist is compiled from the same `CircuitDoc` + `Topology`, so any circuit built in the lab runs without being recreated. |
| Steady-state solver | `solveCircuit`: MNA, Norton sources, piecewise-linear (PWL) diodes/switches iterated to consistency; capacitors open, inductors = R_dc; AC at ±peak snapshots | **Kept** as the DC operating-point analysis and for Phase 4 validation/exercises. Its device models (V_f, R_d, R_on, V_sat, body diodes, CV/CC supply, relay pull-in) are reused in the transient engine so both analyses agree. |
| Component models | 20 part types in `PART_DEFS` | Extended with simulation parameters (generator modes, switching time, thermal resistance, transformer magnetising inductance). Defaults keep Phase 4 results identical. |
| Validation | 19 issue kinds over the graph and DC/±peak solutions | Unchanged; still runs live while editing. |
| Measurement points | `MeasurementPoint` type, node voltages in the inspector | Replaced by **signals**: node voltages, voltage across a part, current through a part, V_GS, transformer primary/secondary, all computed from the solution. |
| Exercises / tests | 10 evaluators, 163 tests | Unchanged; Phase 5 adds experiments and engine tests. |

## 2. Numerical method decision

**Modified nodal analysis, time-domain, fixed step with event restarts.**

- **Unknowns:** node voltages, internal nodes (inductor series resistance, transformer winding resistance), and one branch current per ideal transformer.
- **Energy storage — companion models.** The trapezoidal rule (TR) is the default. It is second-order accurate and preserves the energy of lossless LC circuits, so it introduces no artificial damping. Backward Euler (BE) is used for the first steps and for the two steps after any discontinuity, meaning a device changes state. This is the standard SPICE remedy for the trapezoidal "ringing" on discontinuities.
  - Capacitor, TR: i = (2C/h)·v − (2C/h·vₙ + iₙ). BE: i = (C/h)·(v − vₙ).
  - Inductor, TR: i = (h/2L)·v + (iₙ + h/2L·vₙ). BE: i = (h/L)·v + iₙ.
- **Switching devices.** Diodes, LEDs, MOSFETs, IGBTs, relays and the current-limited supply are piecewise linear, the same models as Phase 4. At each time step the state assignment is iterated until it is self-consistent. If iteration does not settle, the step is subdivided (h/2, h/4, h/8). If it still fails, the run stops with a **convergence failure** at that time, and nothing after it is displayed.
- **Instability guard.** NaN, Inf, or any node voltage above 1 MV ends the run with an instability error. Results are not plotted past that point and measurements are withheld.
- **Sources.** AC sources are evaluated at the step time. The pulse/gate generator produces static, PWM (frequency, duty, phase, invert, dead time) or bipolar SPWM (carrier, modulating frequency, modulation index) logic. Edges fall on step boundaries, so duty resolution is h/T (documented; the automatic step gives ≤ 0.5 %).
- **Time step.** Automatic: the smallest of AC period/400, PWM period/200, SPWM carrier period/100, and a floor of 0.5 µs. The user can override it. Fixed steps keep runs deterministic and make waveforms comparable.
- **Linear algebra.** Dense LU with partial pivoting (circuits here have fewer than about 60 unknowns).
- **SPICE compatibility.** The element set (R, C, L, V/I sources, ideal transformer, switch, PWL diode) maps one-to-one onto SPICE primitives. The engine stores device models behind a small interface, so validated physical models (exponential diode, Level-1 MOSFET) can replace the PWL ones later without UI changes. A full Newton–Raphson nonlinear solver is not needed for PWL models and is deferred.

**Rejected alternatives:** explicit integration (unstable for stiff switching circuits); per-waveform formulas (would not reflect the circuit); a WASM SPICE port (large, opaque, poor for teaching and for this bundle budget).

## 3. Analyses

| Analysis | How |
|---|---|
| A. DC operating point | Phase 4 `solveCircuit` (capacitors open, inductors = R_dc). |
| B. AC analysis | Complex MNA frequency sweep (1 Hz–100 kHz, log): R, jωC, R_dc + jωL, ideal transformer + jωL_m. Switches and diodes are held in their DC operating state. Output: Bode magnitude/phase, −3 dB and resonance. |
| C–M. Transient | The engine above, with experiments covering RC, RL, rectification, filtering, PWM, MOSFET/IGBT switching, half-bridge, H-bridge and DC→AC. |
| N. Waveform analysis | Per channel: mean, RMS (whole cycles), min/max/pk-pk, frequency (crossings), duty, ripple, harmonic spectrum and THD (DFT over whole cycles of the detected fundamental). |
| O. Thermal | Conduction energy from simulated v·i of each switch/diode. Switching energy ½·V·I·t_sw per simulated edge, using the simulated V and I and a labelled typical t_sw. Steady-state T_j = T_a + P·R_θ(j-a); thermal capacitance is not modelled. |

**Energy accounting:** energy delivered by sources, dissipated in resistive and semiconductor elements, and stored (½CV² + ½LI² from the state variables). The balance error is reported. TR conserves energy exactly; BE restart steps introduce small, measured losses.

## 4. Architecture

```
engine/sim/        (pure TypeScript, no DOM: runs in a Web Worker and in tests)
  compile.ts       CircuitDoc + Topology → netlist (elements, internal nodes, signals)
  sources.ts       AC, PWM/SPWM generator logic with dead time
  transient.ts     TransientSim: step(), companion models, PWL iteration, events, energy, thermal
  linalg.ts        dense LU
  analysis.ts      RMS, mean, frequency, duty, DFT/THD, ripple
  ac.ts            complex MNA frequency response
features/circuit-lab/sim/
  sim.worker.ts    owns TransientSim + ring buffer; answers frame requests
  useSimulation.ts controller hook: run / pause / stop / reset / step / speed
  Scope.tsx        4-channel oscilloscope (time/div, V/div or A/div, offset, trigger, spectrum)
  SimPanel.tsx     controls, settings, measurements, thermal, energy
  Bode.tsx         AC analysis plot
content/simExperiments.ts   10 guided experiments
```

The worker keeps the last two screen-widths of every signal in a ring buffer. The UI requests a frame (the displayed window, decimated min/max per column, plus measurements) at most once per animation frame. The UI never waits on the solver.

**Live changes:** if parts and wires are unchanged, a parameter or switch change is applied to the running simulation, keeping capacitor voltages and inductor currents, so students see the response. A topology change resets the run.

## 5. Experiments (sim-01 … sim-10)

1. RC charge/discharge (pulse generator, τ = RC measured)
2. RL response (τ = L/R, final current)
3. Bridge rectification
4. Capacitor filtering (ripple vs C)
5. MOSFET switching (V_DS, I_D, losses, T_j)
6. PWM generation and averaging (duty, mean, RL smoothing)
7. Half-bridge (complementary drive, dead time, body-diode freewheeling)
8. H-bridge (bipolar output, inductive current)
9. Square-wave / modified-sine inverter (transformer step-up, simulated mains)
10. Pure-sine inverter (SPWM + LC filter, THD)

Each experiment has objectives, setup (a circuit that opens in the lab, editable), expected results (independent closed-form calculations), observations (measured from the run and compared with the expected values), and assessment questions (multiple choice, plus numeric answers checked against the measurement). Completing them feeds the Inverter Fundamentals lessons, and that module goes live.

## 6. Tests (against independent closed-form references)

DC solver accuracy; RC (v(τ) = 63.2 %, energy split ½CV²/½CV²); RL (τ = L/R, I∞); LC tank energy conservation (TR); rectifier peak/frequency; PWM duty and mean; MOSFET switching; H-bridge polarity; waveform frequency; RMS of sine, square and PWM; THD of a square wave (48.3 %); numerical stability (step-size convergence, convergence-failure and instability reporting); AC analysis (RC corner, LC resonance); determinism.
