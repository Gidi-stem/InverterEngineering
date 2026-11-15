# Phase 6 report: Build Your Own Inverter and the Learning Academy

Baseline: commit f573c38 (Phase 5, approved). Phase 6 delivers two things:

- the interactive construction laboratory requested for Phase 6;
- the educational curriculum requirement that arrived during the phase: the Master Curriculum and Competency Blueprint, the Learning Academy framework, and course S1 fully authored.

Everything below was verified by the checks listed in §4. Nothing is reported as done without a test or a browser check behind it.

## 1. Build Your Own Inverter

| Requirement | Delivered |
|---|---|
| **1. Eight projects** | A basic DC-to-AC, B square-wave, C modified sine, D pure sine, E transformer-based push-pull, F high-frequency, G solar, H hybrid. Each has its own architecture stages with 3D links, energy paths, component roles (library entries), configurator options, assembly sequence, learning objectives, architecture questions, troubleshooting fault and safety text (`content/buildProjects.ts`). |
| **2. Configurator** | Inputs: DC input (12/24/48 V), AC output (110/230 V), 50/60 Hz, power, load characteristics, switching frequency and (where relevant) HF link, PV and charge parameters. Topology, transformer and waveform are fixed by each project's architecture and stated. Calculations cover DC current (nominal and worst case), apparent power, output current, losses by type, efficiency, transformer ratio and VA, switching requirements, filter L/C, protection (fuse, breaker, LVD, RCD) and thermal (R_θsa and T_j). Each comes with its formula, substituted working, an explanation, and a label of *calculated* or *typical assumption*. The banner reads "Educational estimate, not a certified construction design". |
| **3. Component selection** | Generic ratings per role, checked for voltage, current, switching characteristics, power dissipation, thermal, topology, gate drive and protection. Every check gives required versus selected values and an explanation, and links to the Component Library. The UI and report separate typical library values, simulated values and manufacturer datasheet ratings, and no datasheet figure is invented. Beginners can request compatible generic ratings. |
| **4. Assembly workspace** | The Circuit Lab, reused, with a parts kit carrying the design's values. Students select, place (drag or tap), rotate and reposition parts and connect terminals. Zones mark the input/protection, power, control, output and feedback stages. Steps are grouped by stage, with text at beginner, intermediate and advanced depth. Beginners get pre-placed parts; intermediate and advanced learners place them; advanced learners see missing connections only on request. |
| **5. Integration** | Every project opens in the Circuit Lab and simulates in the Phase 5 engine without conversion. Steps are verified on the connection graph, and placement alone completes nothing (tested in the engine and in the browser). The ten-test suite runs on the student's own circuit. Completion requires correct connections and passing electrical tests. |
| **6. Pure sine (special attention)** | Project D covers the DC input stage and bus, gate drivers with dead time, a MOSFET full bridge, regulated SPWM (a new "SPWM reg." gate mode with RMS feedback), the LC filter, voltage feedback and output protection. Course S1 Module 3 teaches it in six lessons. An interactive demonstration shows the relationship between switching signals, bridge voltage and filtered output. |
| **7. Solar and hybrid (Phase 7 groundwork)** | G: PV array model, buck MPPT stage, battery charging, battery to inverter. H: grid and generator inputs with breakers, source-selector and transfer relays, a charger, battery and inverter, and AC output protection. Energy paths are drawn per project and in S1 Module 5. |
| **8. Testing** | No-load, resistive, inductive, overload, short-circuit protection, input voltage variation (low and high), regulation, efficiency, thermal and waveform quality, plus MPPT (G) and grid and generator modes (H). Tests run in a worker with live progress. The engineering report gives readings, criteria, explanations and limitations, and exports as Markdown. |
| **9. Assessment** | Criteria: connections, architecture understanding, simulation results, component selection, protection design, troubleshooting and final performance. Beginners need the first three, intermediate learners add selection and protection, and advanced learners need all seven. Each project has a troubleshooting task that injects a real fault into the student's circuit and compares readings. |
| **10. Safety** | "Simulated only" on every mains or HV project, the build page and the hazardous-voltage banner. S1 L1 covers isolation, overcurrent, capacitor discharge (with calculations), earthing, thermal safety and simulation versus certification. HV bus bleeder and discharge time are covered in project F and lesson S1.M4.L2. |

### Engine additions (reused by all projects)

- **New parts:** PV array, centre-tapped transformer and voltage sensor.
- **New netlist primitives:** a current source and a three-winding ideal transformer.
- **Regulation:** an SPWM RMS regulator, which updates m once per cycle.
- **Topology:** multiple ground symbols are merged into one node.
- **Performance:** LU-factor caching, so the matrix is re-stamped only when the switch state changes; Phase 5's sim-10 runs at about 15 µs per step.

## 2. Learning Academy (curriculum requirement)

| Requirement | Delivered |
|---|---|
| **Blueprint first** | `docs/CURRICULUM-BLUEPRINT.md`, sent to you during the phase. It maps 15 courses (F1–F5, P1–P5, S1–S5), every module and lesson, practical activities, assessments, prerequisites and 14 competency units, with a gap analysis of Phases 1–5 and a proposed fourteen-phase plan. |
| **1. Structured courses** | Course → module → lesson, with ids such as `S1.M3.L2`. The "Electronic Components" example is course F4, module F4.M2, with the ten lessons you listed. |
| **2. Lesson structure** | All 14 sections render in order, with a section navigator. Tests enforce every section and minimum depth: at least 3 objectives, 2 worked examples, 3 mistakes, 3 check questions and 4 summary points, plus minimum lengths. |
| **3. Teaching through interaction** | Every lesson links to real 3D parts, library entries, test procedures, comparisons, exercises, experiments or projects. A test checks every link. Four interactive demonstrations are computed live: the SPWM chain, the stepped-wave spectrum, the LC filter and the design calculator. Diagrams are computed from the engine's formulas, and project schematics use the lab's own symbols. |
| **4. Progressive learning** | Beginner, intermediate and advanced courses, with prerequisite locks once a prerequisite course is published (scheduled prerequisites are "recommended", so no learner is blocked by unwritten content). Practicals are credited after the module quiz. |
| **5. Assessment** | Knowledge checks (formative), module quizzes (3 attempts per 24 h, best score kept), assignments, practical lab tasks, a timed formal examination (auto-submit, 3 attempts, 24 h cool-down, no feedback until submitted) and competency levels. Scores, attempts, answers, durations and completed lessons are recorded, shown in the competency record, and included in the backup. |
| **6. Content depth** | S1 has about 38,000 words, 41 worked examples, 230 marked questions and an 80-term glossary written for learners with no prior study. Simplified models and typical values are labelled throughout. Every worked-example and answer-key number was recomputed by hand. Examples that quote simulated results use the suite's actual readings. |
| **7. Curriculum-wide** | Phases 1–5 content is mapped to the curriculum (blueprint §6). Existing lesson ids keep their criteria and are referenced through `legacyId`. |
| **8. Approach** | Architecture integrated without rewriting existing features: new store fields only, with older backups still importing. |

## 3. Problems found and fixed during the phase

1. **A teaching error in my own plan.** A modified sine at 90° conduction has 48.3 % THD, the same as a square wave, not lower. The minimum (31 %) is at 120°, where the third harmonic vanishes. The waveform test, project C's text and its questions now use the exact quasi-square theory (THD and crest factor for the design's conduction angle), and a misconception entry teaches it.
2. **The unregulated design point.** Designing the square-wave ratio at the 10.5 V cut-off made the output +14 % at nominal voltage and +37 % while charging. Unregulated designs are now set at nominal voltage, which gives −12 %/+20 %, and the calculation sheet says so.
3. **Headroom.** The ratio ignored battery, fuse and winding drops, so project D could not regulate at low battery. Both drops are now explicit, labelled assumptions in the ratio, consistent with the generated circuit.
4. **Hybrid charger resistor overload.** This was a validator danger. The charger was redesigned to keep its peak dissipation within rating, and its limitation is documented.
5. **Missing frequency readings.** The F, G and H suites measured too few cycles to read frequency. Every test now measures three cycles.
6. **Troubleshooting fault D was not diagnostic.** With a rated resistive load, the filter inductor alone gives about 2 % THD, which is physically correct. Fault D is now a lost voltage-feedback sensor, which is diagnostic and taught in lesson S1.M3.L5.
7. **Lesson text clipped on phones.** Grid column sizing caused it. Fixed, and the phone test now checks content boxes against the viewport, not just page scroll.
8. **Over-sized heat sinks.** Suggested heat sinks are now sized for the 150 % overload test as well as rated load.

## 4. Verification

| Check | Result |
|---|---|
| TypeScript (`tsc -b`) | Pass |
| Lint (`oxlint --max-warnings 0`) | Pass, 0 warnings |
| Unit and integration tests | **270 passed** (Phase 5 baseline 196). New tests: 3 engine models, 28 design (calculations, compatibility, assembly, kit, integration of all eight projects, simulation of all eight, full suites for A and D, all eight faults), and 43 Academy (structure, lesson standard for all 20 lessons, questions and answer keys, links, diagrams, glossary, marking, progression, examination, competency, records). |
| Production build | Pass. Academy content and pages are lazy chunks; the main bundle is not increased by course content. |
| Phase 6 browser, desktop mouse (`bld.py`) | **37/37**: catalogue, course, enrolment, locked examination; lesson sections, diagram, demonstration, glossary, worked example, wrong and right knowledge checks; quiz marked; competency record; build page; project A beginner flow (pre-placed, no step from placement, verified wiring, 11 tests passing in the worker, report export, architecture questions, completion, troubleshooting); design change syncs the circuit and invalidates the report; intermediate kit placement by tap and by drag; rotation; dashboard and navigation; no console errors. |
| Phase 6 browser, phone touch (`phone6.py`) | **11/11**: no overflow or clipped content on six Academy and Build routes, knowledge check answered by tap, demonstration (120° → 31.1 % THD), kit part placed by tap-tap. |
| Phase 1–5 regression | Circuit editor `ckt` 47/47; simulator `sim` 28/28. `lib`, `flow`, `resp`, `phone`, `phone5` as before. `hits` 36/41 (Phase 2 baseline). `audit3`: all routes, including `/academy` and `/build`, with no overflow; waveform bench, backup and restore, corrupted IndexedDB and mobile drawer as before. The only error lines are the deliberate LAN dev-server WebSocket refusals, as in earlier phases. |

## 5. Known limitations

These are listed in ARCHITECTURE §14 and labelled in the UI.

**Learning Academy**
- Only S1 is authored; the other courses are scheduled.
- Written answers are self-reviewed against model answers.
- There are no teacher accounts.

**Build models**
- PV array: simplified piecewise-linear model.
- Hybrid charger: simplified (about a fifth of the design current in grid mode).
- Relays: driven by static controllers.
- Push-pull: no leakage spikes.
- Electronic overcurrent shut-down: described, not simulated.
- Switching frequencies: limited to 5–10 kHz in simulation.

**Manual settings**
- The MPPT duty is set by hand (automatic tracking arrives in Phase 7).
- The HF bus is unregulated.

## 6. Decisions needed from you

1. **The fourteen-phase plan** (blueprint §8). The repository roadmap had ten phases; I mapped the extra curriculum work to Phases 11–14. Please confirm or correct the list.
2. **Order.** Should Foundation courses F1 (Safety) and F2 (DC fundamentals) move ahead of the solar lab (Phase 7)? Every practical depends on them.

Phase 7 will not begin without your approval.
