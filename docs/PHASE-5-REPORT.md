# Phase 5 Completion Report: Electrical Simulation Engine

**Status:** complete. TypeScript, 196 unit tests (33 new), lint (0 warnings) and the production build pass. The Phase 5 browser test passes (28 checks: mouse and touch, desktop and tablet, no console errors), and so do the Phase 1–4 regression suites (evidence in §8).

The simulator lives inside the Circuit Connection Laboratory (`/circuit-lab`): **Build | Simulate** switches mode on the same circuit, and the ten experiments are listed in the exercise selector (`?ex=sim-01` … `sim-10`).

## 1. Inspection and decision

The Phase 4 topology, steady-state solver, part models, validation, exercises and tests were inspected (see `docs/PHASE-5-PLAN.md` §1). Nothing working was replaced:
- The connection graph and `CircuitDoc` are reused unchanged, so lab circuits run directly in the simulator.
- The steady-state solver is kept as the DC operating-point analysis and for Phase 4 checking.
- The piecewise-linear device models are shared, so both analyses agree.

**Numerical method:** time-domain modified nodal analysis with a fixed step.
- Trapezoidal companion models for capacitors and inductors.
- Backward-Euler restart steps after every discontinuity.
- Piecewise-linear device iteration at every step, with subdivision to h/8.
- Explicit convergence-failure and instability reporting.

The rejected alternatives and their reasons are in the plan.

## 2. Capabilities (A–O)

| | Capability | Implementation |
|---|---|---|
| A | DC operating point | Phase 4 MNA solver; table in the Simulate tab. |
| B | AC analysis | Complex MNA frequency sweep 1 Hz–100 kHz; Bode magnitude/phase, −3 dB, resonance. It says so when an input has no path to the output (for example, a gate driver). |
| C | Transient analysis | `TransientSim` (trapezoidal + backward Euler, piecewise-linear iteration, subdivision). |
| D | Capacitor charge/discharge | Companion model; experiment 1. |
| E | Inductor behaviour | Companion model with R_dc internal node; experiment 2, and freewheeling in experiments 6–8. |
| F | Rectification | Piecewise-linear diodes; experiment 3. |
| G | DC filtering | Experiment 4 (ripple, diode current pulses). |
| H | PWM generation | Generator PWM mode (frequency, duty, phase, invert, dead time); experiment 6. |
| I | MOSFET switching | Gate-controlled switch + body diode; experiment 5. |
| J | IGBT switching | V_CE(sat) piecewise-linear channel + co-pack diode; unit-tested. |
| K | Half-bridge | Complementary drive with dead time and body-diode conduction; experiment 7. |
| L | Full H-bridge | Experiment 8 (inductive load, energy returned to the supply). |
| M | DC-to-AC conversion | Experiments 9 (square / modified sine + transformer) and 10 (SPWM + LC filter). |
| N | Output waveform analysis | Mean, cycle RMS, pk-pk, frequency, duty, harmonic spectrum (dB) and THD per channel. |
| O | Thermal estimate | Conduction loss from simulated v·i; switching loss ½·V·I·t_sw per simulated edge; T_j = T_a + P·R_θ. |

## 3. Component models

All 14 required families are modelled behind the SPICE-like netlist primitives:

| Family | Model |
|---|---|
| Resistors and loads | Fixed resistance |
| Capacitors | Trapezoidal / backward-Euler companion models |
| Inductors | Companion model with winding resistance |
| Diodes and LEDs | Piecewise-linear: V_f + R_d, open when off |
| MOSFETs | R_DS(on) switch above V_th, plus body diode |
| IGBTs | V_CE(sat) + R channel, plus co-pack diode |
| Transformers | Ideal coupling with winding resistances and magnetising inductance (passes AC, drives a growing current under DC) |
| Switches | Manual switch |
| Relays | Coil resistance; contacts with 70 % pull-in / 30 % drop-out hysteresis |
| Fuses and breakers | Simplified I²t melting/tripping; breakers also trip magnetically above 5 × rating |
| Batteries | V + R_int |
| DC supplies | CV/CC with current limit |
| AC sources | Sine + 0.1 Ω |
| Pulse / gate generator | 10 Ω output, static / PWM / SPWM |

New parameters are labelled "sim" in the inspector, and their defaults leave all Phase 4 results unchanged:
- generator modes;
- typical t_sw and R_θ(j-a) for transistors;
- transformer L_m.

Validated physical models (exponential diode, Level-1 MOSFET) can replace the piecewise-linear elements without UI changes.

## 4. Waveforms, controls and integration

**Waveforms (all simulated):**
- square and modified-sine inverter output (exp. 9)
- pure sine after the LC filter (exp. 10)
- PWM (exp. 5–7)
- rectified AC (exp. 3) and filtered DC with capacitor ripple (exp. 4)
- inductor current (exp. 2, 6–8)
- MOSFET gate signals (V_GS)
- inverter output voltage and current

**Oscilloscope:**
- four channels; any part voltage, part current, node voltage or difference can go on any channel
- time/div from 1 µs to 1 s, V/div or A/div per channel, offset, auto-scale
- CH1 trigger and a dB spectrum view
- min/max column rendering keeps every PWM edge visible

**Controls:**
- RUN, PAUSE/RESUME, STOP, RESET
- STEP by 1 time step, 10 steps or 1 division
- speed in divisions per second, or Max
- time step (automatic or set)
- live parameter controls: input voltages, switching frequency, duty cycle, phase, modulation index, dead time, and load and component values

Changing a parameter while running applies immediately and keeps the circuit's state. A structural change restarts from t = 0 with a notice.

**Integration and future phases:**
- Any circuit built in the editor, Phase 4 exercise solutions included, runs in Simulate mode without being rebuilt (browser-tested).
- The engine is pure TypeScript behind a message protocol, ready for the Phase 6 inverter builder.
- Phase 8 virtual instruments can read the same probe keys and frames.

## 5. Experiments

Each experiment has learning objectives, circuit setup (an editable circuit that opens in the lab), expected results, observations measured from the run, three assessment questions (multiple choice, plus a numeric answer checked against the student's own measurement) and suggestions to explore. Expected values are independent closed forms recomputed from the current parameters; approximations are labelled.

Measured (simulated) against expected for the default circuits, from the test run:

| # | Experiment | Key observations (simulated / expected) |
|---|---|---|
| 1 | RC charge/discharge | τ 10.11 / 10.10 ms (both edges); V_max 9.930 / 9.930 V |
| 2 | RL response | τ 0.911 / 0.901 ms; I_pk 89.74 / 89.74 mA; v_L at switch-off −9.76 / −9.87 V |
| 3 | Bridge rectification | 100.0 / 100 Hz; peak 15.54 / 15.54 V; average 9.422 / 9.422 V |
| 4 | Capacitor filtering | ripple 1.26 V vs 1.55 V (approximation I/2fC); V_dc 14.89 / 14.76 V; diode peak ≈ 10× load current |
| 5 | MOSFET switching | I_on 0.4988 / 0.4988 A; V_DS 24.9 / 24.9 mV; P_cond 6.217 / 6.219 mW; P_sw 11.97 / 11.97 mW |
| 6 | PWM generation | 5000 Hz, duty 25.0 %; I_avg 0.2438 / 0.2438 A; ripple 47.6 / 47.7 mA |
| 7 | Half-bridge | V_out 11.68 / 11.68 V; I_avg 1.162 / 1.162 A; dead time 1.000 / 1.000 µs; body diode carries 1.31 A |
| 8 | H-bridge | 50.00 Hz; V_rms 23.93 / 24 V; I_pk 0.961 / 0.961 A; supply current down to −0.94 A (energy returned) |
| 9 | Square / modified-sine inverter | 50 Hz; 220 V rms (simulated only); V_rms/V_pk 0.999 / 1.000; THD 47.3 % / 48.3 %; efficiency 97.2 %. With 120°: THD < 35 %, matching √(α/π) and its Fourier closed form |
| 10 | Pure-sine inverter | 50 Hz; fundamental 21.65 / 21.75 V pk; 15.3 V rms; THD 1.75 % after the filter, 96.6 % before it |

Completing experiments earns the seven Inverter Fundamentals lessons, and that module is now live, with links from each lesson to its experiments. For example, experiments 1 and 3 complete lesson 1, which was browser-tested.

## 6. Engineering accuracy

| Requirement | How it is met |
|---|---|
| No random values or fabricated measurements | Every displayed waveform and measurement is computed from the solver state; the tests include a determinism check. |
| Values derived from the simulated circuit | Measurements are taken on simulated samples; thermal and energy figures come from simulated v·i. |
| Energy conservation | Delivered, dissipated and stored energy (½CV² + ½LI² from the state) and the balance error are shown live. RC test error < 0.5 % (measured 2.5 × 10⁻⁷). In the LC tank, energy follows e^(−Rt/L) within 0.2 % and the error does not grow while it oscillates. Events faster than h carry a reported, non-growing error. |
| Model assumptions documented | "What is simulated" panel, inspector "sim" labels, this report, ARCHITECTURE §9 and §13. |
| Convergence failures identified | Piecewise-linear states that cannot settle → subdivision → convergence-failure message with the time (unit- and browser-tested on a gate-to-drain MOSFET). |
| No misleading results from unstable runs | Failed or unstable runs stop: nothing is plotted after the failure, and the experiment observations are withheld. |
| Simulated vs real-world | Permanent "Simulation environment" header; measurement and experiment panels say "simulated"; approximations are labelled; mains-level outputs are marked simulated only. |

## 7. Performance

- The solver runs in a module Web Worker; the UI requests frames with one request in flight.
- Measured main-thread frame time while simulating the SPWM inverter at Max speed: about 20 ms average (33 ms worst).
- The heaviest experiment (SPWM, 55 000 steps, 10 nodes) takes about 1 s in Node.
- Bundles: worker 76 kB; circuit lab page 61.1 kB gzip (lazy); the dashboard bundle stays at 104.2 kB gzip. Lesson criteria use an engine-free index, so the app shell does not load the solver.

## 8. Evidence

| Check | Result |
|---|---|
| `npm run typecheck` | pass |
| `npm test` | 196 passed (163 before). New, 33. **Engine (18):** DC accuracy against hand and Phase 4 values; RC (v(τ), measured τ, energy split); RL; step-halving convergence; LC energy; bridge rectifier; PWM duty/frequency/mean; dead time; MOSFET switching and losses; IGBT; H-bridge polarity, frequency, RMS and THD; RMS of sine, square and PWM; square-wave THD; AC analysis (RC corner, LC resonance); convergence failure; fuse I²t; determinism. **Experiments (15):** content and lesson integrity; quasi-square closed forms; all ten experiments' observations against their expectations; the modified-sine variant; parameter changes alter results. |
| `npm run lint` | 0 warnings, 0 errors |
| `npm run build` | pass |
| Browser, Phase 5 (`/tmp/sim.py`, 28 checks) | run, pause, resume, live parameter change without restart, stop, reset, step by division and by one time step, time-scale change; experiment 1 and 3 measured, answered and recorded; Fundamentals lesson 1 completed; UI responsiveness at Max speed; spectrum THD < 5 % for the sine inverter; AC analysis explanation and LC resonance (≈ 519 Hz); thermal table; hazard labelling; convergence failure reported with no plot; a free circuit and a Phase 4 exercise circuit simulate directly; tablet touch run/pause/step; no overflow; no console errors |
| Regression | Phase 4 editor (47 checks), Phase 3 library, Phase 2 guided procedure and 3D picking, responsive/no-WebGL, and the Phase 1 audit: all pass |

## 9. Changes to existing code

- **`parts.ts`:**
  - The gate source became the "Pulse / gate-drive generator" (static / PWM / SPWM modes).
  - Transistors gain typical t_sw and R_θ(j-a); transformers gain L_m (`simOnly`).
  - Parameter and state definitions gain `when` (shown per mode).
- **Inspector:** shows only the settings that apply to the current mode.
- **Circuit Lab page:** Build/Simulate mode, oscilloscope, Simulate tab, experiments in the selector. Tab, mode and simulator state are now keyed to the workspace.
- **Fundamentals module:** live, with experiment links; `lessonCriteria` includes the Fundamentals lessons.
- **`build.ts`:** exports `CircuitBuilder`.

## 10. Known limitations

These are listed in ARCHITECTURE §13:

- **Semiconductors:** piecewise-linear and switching instantly, with ideal gates (no gate charge or reverse recovery).
- **Transformers:** no saturation or leakage inductance.
- **Other parts:** no capacitor ESR. Fuses and breakers use a simplified I²t model; relays switch instantly.
- **Losses and temperature:** switching loss uses a typical t_sw; T_j is a steady-state estimate.
- **Fixed time step:** PWM edges are quantised to h, and events faster than h carry a reported energy error.
- **Battery:** state of charge is not modelled yet (planned with the Phase 6 projects).

Phase 6 has not been started and awaits approval.
