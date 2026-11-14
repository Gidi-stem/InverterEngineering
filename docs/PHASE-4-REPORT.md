# Phase 4 Completion Report: Circuit Connection Laboratory

**Status:** complete. TypeScript, 163 unit tests (52 new for the circuit lab), lint (0 warnings) and the production build pass. The browser test of the circuit editor (47 checks, mouse and touch, desktop and two tablet orientations, plus a 390 px phone check) passes with no console errors. The Phase 1–3 regression suites also pass (evidence in §5).

Route: `/circuit-lab` (`?ex=ckt-01` … `ckt-10`, or `?ex=sandbox` for free building).

## 1. Required features

| # | Requirement | Delivered |
|---|---|---|
| 1 | Interactive circuit workspace | SVG schematic on a 20 px grid with pan (drag background), zoom (wheel, pinch, + / − buttons), Fit, and live node-voltage tags. |
| 2 | Drag-and-drop components | Drag from the toolbox onto the workspace (mouse, pen, touch), or tap a part and tap the workspace (touch-friendly path). |
| 3 | Rotation and repositioning | Drag to move (snaps to the grid, wires follow); Rotate button / `R` key in 90° steps; terminals rotate with the part. |
| 4 | Wire drawing, terminal to terminal | Drag from one terminal to another, or tap two terminals. The nearest terminal under the pointer is highlighted. Wires always end on terminals. Self-wires and duplicate wires are refused with a message. |
| 5 | Wire deletion and reconnection | Select a wire, then Delete (button or key). Drag either square end handle onto another terminal to reconnect. Undo (60 steps, Ctrl+Z). |
| 6 | Selection and inspection | Inspect tab: description, link to the Component Library entry, editable parameters (range-checked), states (switch, breaker, gate signal), and terminal table with node and voltage per solved mode. Also current, power, state and extra currents (body diode, relay coil, transformer secondary). Selecting a wire shows every terminal on that electrical node. With nothing selected, the full connection graph (node → terminals → voltage) is shown. |
| 7 | Electrical symbols and pin identification | IEC 60617-style symbols for all 20 parts. Polarised and multi-pin parts are labelled on the workspace (+/−, A/K, G/D/S, G/C/E, P1/P2/S1/S2, A1/A2/COM/NC/NO, L/N, OUT/REF). Unwired terminals are ringed in amber. |
| 8 | Saving and restoration | Auto-save per exercise to IndexedDB (sanitised on load, "Saved hh:mm" in the status bar), export/import as JSON, two-step Reset to the starter circuit. |
| 9 | Circuit validation | Live on every edit: node graph + nodal solution + 19 issue kinds (§3). |
| 10 | Educational feedback | Each issue has a title, an explanation of what is physically happening (with the solved values), a concrete fix and the parts involved. Hovering an issue highlights its parts; clicking a part name selects it. |

**Circuit library (20 part types, linked to the existing component database where a library entry exists):** battery, bench DC supply (CV/CC), isolated AC source, gate-drive signal, resistor, film capacitor, electrolytic capacitor, inductor, diode, LED, N-channel MOSFET, IGBT, transformer, relay, fuse, 2-pole DC breaker, SPST switch, ground/0 V reference, DC load (lamp), AC load. Parameters are typical educational values and are labelled as such in the inspector. No manufacturer ratings are claimed.

## 2. Practical exercises

Each exercise has learning objectives, step-by-step instructions, expected connections (collapsible hint), an assessment statement, a suggested toolbox, a starter circuit (exercises 8–10 start with the parts placed but unwired), safety guidance and a worked solution.

| # | Exercise | Assessed (weighted criteria from solved circuits) |
|---|---|---|
| 1 | Battery and resistor | Closed loop; V_R = source voltage; I = V/R within 1 %; resistor power within rating. |
| 2 | LED circuit | LED forward-biased; a resistor carries the same current; 5–20 mA. Reports the resistor needed for 15 mA. |
| 3 | Capacitor charging/discharging | Every switch combination is evaluated: one charges the capacitor to the supply through a resistor with correct polarity, and one discharges it through a resistor, not a dead short. τ = R_th·C for both, with R_th measured by a test-current injection. RC curves are drawn. |
| 4 | Bridge rectifier | Same-direction load current on both half-cycles; V ≈ V_pk − 2V_f; a different pair of diodes conducts each half-cycle. |
| 5 | DC filtering | Rectifier criteria; electrolytic across the load with + on the positive output; ripple approximation ΔV ≈ I/(2fC) ≤ 1 V; voltage rating above the peak. |
| 6 | MOSFET switching | Low-side role; gate resistor; REF on the source; gate low → < 1 mA; gate high → full current within 5 %. Reports V_DS and I²R_DS(on). |
| 7 | Transformer connection | Source on P1–P2, load on S1–S2, no DC on a winding, windings isolated, V_s = n·V_p within 3 % on both half-cycles. |
| 8 | Half-bridge | Leg found from topology; fused bus; each switch driven; high-side drive floating on the switch node; output = V_bus / 0 V in the two complementary states. Demonstrates shoot-through. |
| 9 | Full H-bridge | Two legs; load across the outputs; drives referenced correctly; +V_bus in state A and −V_bus in state B. Also records practical assessment asm-03. |
| 10 | Basic inverter architecture | Battery fused first; bridge drives the primary; AC load on the secondary; secondary voltage reverses between states at n × the bridge voltage. Output (~120 V) is flagged hazardous and simulated only. |

A danger-level issue in the as-built circuit, or in any test state the evaluator needs, blocks a pass. A pass marks the exercise and its lesson complete and logs an activity. After a failed check, the worked solution can be loaded for study; passing with it loaded earns no credit until the circuit is reset.

## 3. Electrical validation (graph and solver, never wire counts)

`buildTopology` merges wired terminals into nodes (union-find). `solveCircuit` builds a modified nodal analysis system for each required mode: DC, or the AC source at its positive and negative peaks. It iterates the piecewise-linear devices until consistent. Rules then read node membership, topological roles and solved values.

| Required detection | Issue kinds and basis |
|---|---|
| Reversed polarity | `reverse-polarity` (electrolytic with V(+) − V(−) < −0.5 V; also over-voltage), `reverse-bias` (LED cathode above anode), `body-diode` (MOSFET/IGBT conducting backwards, e.g. D and S swapped). |
| Incorrect pin connections | `gate-in-power-path` (gate tied to drain/source or in the load current), `gate-reference` (driver REF not on the switch's source/emitter), `floating-gate`. |
| Open circuits | `open-circuit` (no other path joins a part's two ends; gate-drive loops count through the gate–source input), `unconnected` (partly wired parts). |
| Short circuits | `short-circuit`: source current far above what any load allows. Danger for batteries and AC sources; a warning for a current-limited bench supply. The fault path is listed. |
| Missing connections | `unconnected`, `no-reference`, plus exercise criteria that name the missing connection. |
| Incorrect switching configurations | `shoot-through` (two switches on across a source), exercise state tests, and gate-reference checks for high-side drives. |
| Missing protection | `missing-protection` (anything other than a fuse/breaker on the battery positive node), `fuse-blown` / overcurrent against fuse and breaker ratings. |
| Invalid transformer connections | `transformer-dc` (DC current in a winding), `isolation-bridged` (primary and secondary joined), shorted secondary. |
| Ratings and supply state | `overcurrent` (LED, diode, switch, resistor power), `current-limit` (bench supply sagging under overload), `hazardous-voltage` (source settings or solved nodes above 50 V DC / 25 V AC), `solver`. |

**What is calculated, and what is not.** DC operating points, and quasi-static AC at ±peak. Capacitors are open at DC; inductors are their winding resistance. Transformers are ideal with winding resistance. RC τ comes from the measured Thevenin resistance. Ripple is a labelled approximation. Nodes with no conducting path to the reference are shown as "floating" rather than a number, and sub-millivolt leakage reads 0 V. Switching transients, dead time, ripple waveforms, saturation and thermal behaviour are not simulated, and the UI says so ("What the simulator calculates" in the Checks tab). No random values are used.

## 4. Safety

- Exercises 1–9 use isolated, current-limited, low-voltage sources; the exercise panel states this.
- Battery short circuits, shoot-through, reversed electrolytics and over-rated parts are danger-level, shown in red on the workspace, and block an exercise pass.
- Hazardous settings or solved voltages (> 50 V DC or > 25 V AC) raise a warning and a red "Simulated only" banner over the workspace. Exercise 10 is labelled simulated only.
- Capacitor discharge guidance: through a resistor, never with a screwdriver (exercise 3, plus the dead-short discharge criterion).

## 5. Evidence

| Check | Result |
|---|---|
| `npm run typecheck` | pass |
| `npm test` | 163 passed (111 before). New, 52: solver and topology 12; exercises and validation 31 (content integrity, ten worked solutions that pass and are warning-free, starters that fail, 17 fault cases, topological roles); editing and sanitising 6; display helpers 3. |
| `npm run lint` | 0 warnings, 0 errors |
| `npm run build` | pass; circuit lab chunk 38.3 kB gzip (lazy); dashboard bundle unchanged at 103.6 kB gzip |
| Browser, desktop 1440 × 900, mouse | exercise 1 built by hand: drag-and-drop ×2, tap-to-place, drag wire, tap-tap wire; check passes and is recorded; rotate, move (wires follow), inspector values (12 mA), parameter edit + over-power warning + undo; wire select/delete/undo; end-handle reconnection; reload restores the circuit from IndexedDB; reset; reversed LED explained and failing; all ten exercises (starter fails, worked solution passes without credit); exercise 10 running shows the hazard banner; dashboard shows 1/10 exercises |
| Browser, tablet 1024 × 768 and 768 × 1024, touch | tap-to-place, touch drag-to-place, tap-tap and drag wiring, part drag, pinch zoom, battery short flagged danger, no horizontal overflow |
| Browser, phone 390 × 844 | exercise 6 check + worked solution; no horizontal overflow; no errors |
| Phase 1–3 regression | `audit3` (routes, waveform bench, progress backup/restore, corrupted IndexedDB, mobile drawer, LAN), `flow` (guided disassembly/reassembly), `hits` (3D picking), `resp` (responsive + no-WebGL), `lib` (library): all pass. The only error lines are Vite dev-server WebSocket refusals in the deliberate LAN (non-secure context) test, which are not app code. |

## 6. Changes to existing code

- `modules.ts`: Circuit Lab lessons are now the ten exercises; the module is live.
- `progressStore.ts`: new `completeExercise`; the IndexedDB storage adapter moved to `store/idbStorage.ts` so saved circuits share it.
- `badges.ts`: "Bench Hand" is earnable now.
- Dashboard: the exercise tile no longer says "from Phase 4".
- `App.tsx`: lazy `/circuit-lab` route.
- `types/domain.ts`: the placeholder circuit types were replaced by `engine/circuit/types.ts`.

Deviation from PHASE-4-PLAN.md: the planned separate `analyse.ts` (Thevenin helper) lives inside `exercises.ts`, its only user.

## 7. Known limitations

- DC / quasi-static AC only (see §3). The H-bridge and inverter exercises check switching states, not PWM waveforms; those arrive with the Phase 5 simulation engine.
- Wires use a simple orthogonal route and can cross parts; there is no manual wire routing or wire-to-wire junction (join wires at terminals).
- One MOSFET type (N-channel enhancement) and one IGBT; no P-channel devices, op-amps or controllers yet.
- Saved circuits are per browser; use export/import to move them.

Phase 5 has not been started and awaits approval.
