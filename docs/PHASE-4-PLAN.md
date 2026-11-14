# Phase 4 Plan: Circuit Connection Laboratory

Baseline: commit `8fa755a` (Phase 3 approved).

## 1. Goal

A schematic-capture workbench where students place parts, wire terminals and build circuits. The lab understands each circuit electrically: nodes, topology, DC operating point and switching states. It explains every incorrect connection.

## 2. Architecture

```
src/engine/circuit/            pure TypeScript, no React (unit-tested)
  types.ts        CircuitPart types, Terminal, PlacedPart, Wire, CircuitDoc, Node, Topology,
                  SimSettings, MeasurementPoint, ValidationIssue, Solution
  parts.ts        Part catalogue (battery, DC supply, AC source, gate driver source, resistor,
                  capacitor, electrolytic, inductor, diode, LED, MOSFET, IGBT, transformer, relay,
                  fuse, breaker, switch, ground, DC load, AC load). Each part declares its terminals
                  (ids match the component database where one exists), parameters with units and
                  limits, its electrical model and its schematic pin geometry.
  topology.ts     Union-find over terminals and wires → electrical nodes; ground reference;
                  per-node terminal lists; adjacency for path searches.
  solve.ts        Modified nodal analysis (dense Gaussian elimination with pivoting).
                  Element models (DC steady state):
                    R (resistor, loads, winding resistance, closed switch/fuse 1 mΩ, open 1 GΩ)
                    independent V source with internal resistance; current-limited supply (CV→CC)
                    capacitor = open (DC); inductor = winding resistance
                    diode / LED = piecewise-linear (off: 1 GΩ; on: V_f + R_d), state iteration
                    MOSFET = R_DS(on) when V_GS > V_th, else open, plus body diode S→D
                    IGBT = V_CE(sat) + R when V_GE > V_th, plus co-packed diode E→C
                    relay = coil resistance; contacts follow coil current (pull-in iteration)
                    transformer: DC mode = two winding resistances (no coupling);
                                 AC-snapshot mode = ideal transformer stamp (Vs = n·Vp, Ip = −n·Is)
                  AC sources are evaluated quasi-statically at +peak and −peak (two snapshots).
  analyse.ts      Derived quantities: part voltages/currents/power, Thevenin resistance seen by a
                  capacitor (V_oc / I_sc from two solves) → τ = R_th·C for charge/discharge.
  validate.ts     Generic electrical rules over topology + solution (independent of exercises):
                  short circuit of a source (zero-impedance path), reverse-polarity electrolytic,
                  reverse-biased LED/diode in a current path, LED or part overcurrent, fuse rating
                  exceeded, body diode conducting (drain/source swapped), gate tied into the power
                  path, gate drive not referenced to the switch source (high-side), shoot-through,
                  DC across a transformer winding, primary-secondary bridging (isolation lost),
                  unconnected terminals, part in no closed loop (open circuit), missing protection,
                  simulated hazardous voltage, supply in current limit.
  roles.ts        Topology-based role finding: which gate source drives which switch (through gate
                  resistors), high-side vs low-side, half-bridge legs, bridge output nodes.
  exercises.ts    Exercise evaluation: runs test states (switch and gate combinations, AC half-cycles)
                  through the solver and checks electrical assertions per criterion.
src/content/circuitExercises.ts   10 exercises: objectives, steps, toolbox, starter, criteria
src/features/circuit-lab/          React UI
  CircuitLabPage.tsx, store (document, selection, history, autosave), Workspace (SVG: grid,
  pan/zoom, parts, wires, terminals, node overlay), Toolbox, PropertiesPanel, ValidationPanel,
  ExercisePanel, StatusBar, schematic symbol drawings
```

Validation never counts wires. Every rule reads either the node graph or solved voltages and currents.

## 3. Exercises (each: objectives, steps, expected connections, criteria, assessment)

1. Battery and resistor: closed loop; I = V/R.
2. LED circuit: forward-biased; current-limited to 5–20 mA by a series resistor.
3. Capacitor charging and discharging: charge state V_oc = V_s with correct polarity; discharge path through a resistor; τ = R_th·C both ways.
4. Bridge rectifier: same load polarity on both half-cycles; two diodes conduct per half-cycle; no short.
5. DC filtering: electrolytic across the load with correct polarity on both half-cycles; ripple estimate ΔV ≈ I/(2fC) (labelled approximation) below the specification.
6. MOSFET switching: low-side switch; load off at gate low, on at gate high; source referenced; gate resistor.
7. Transformer connection: AC source on the primary; load on the secondary; V_s = n·V_p; no DC on the winding; isolation intact.
8. Half-bridge: high-side and low-side states give V_dc and 0 V; both-on is detected as shoot-through; floating high-side gate drive; fuse.
9. Full H-bridge: diagonal states give ±V across the load; shoot-through states detected; fuse. Also recorded as assessment asm-03.
10. Basic inverter architecture: battery, fuse, H-bridge, step-up transformer, AC load; alternating secondary polarity of n·V; hazardous secondary flagged (simulated).

## 4. Safety

- Sources default to isolated, low voltage. The DC supply defaults to 12 V with a 1 A current limit.
- Voltages above 50 V DC or 25 V AC rms are flagged as simulated hazardous voltage.
- Shorts, shoot-through, overcurrent and DC on windings are danger-level issues. A circuit with a danger issue never shows as passing.

## 5. Testing

- **Unit tests:** topology (nodes, ground), solver against hand calculations (divider, LED current, current-limited supply, ideal transformer), validation rules (each defect), role finding, all 10 exercises: a reference solution passes and typical faulty variants fail with the right issue.
- **Browser:** drag and drop (mouse), tap-to-place and wiring (touch), rotate, move, delete, reconnect, save and restore after reload, an exercise completed in the UI, tablet layout, plus Phase 1–3 regression.
