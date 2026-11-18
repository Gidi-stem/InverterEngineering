# Inverter Engineering Lab: Architecture and Roadmap

## 1. Environment

| Item | Version |
|---|---|
| Node.js | 22.23 |
| Vite / @vitejs/plugin-react | 8.3 / 6.3 |
| React / React DOM | 19.3 |
| TypeScript | 7.0 (`tsc -b`, strict bundler mode, `verbatimModuleSyntax`, `erasableSyntaxOnly`) |
| Three.js / React Three Fiber / drei / camera-controls | 0.187 / 9.8 / 10.7 / 3.1, used only by the lazily loaded 3D lab |
| Tailwind CSS | 4.3 (via `@tailwindcss/vite`) |
| Zustand | 5.1 (`persist` middleware for progress; plain store for the 3D lab) |
| Persistence | IndexedDB via `idb-keyval`, with an in-memory fallback; every load is validated and merged (see §7) |
| Routing | `react-router-dom` `HashRouter`, so deep links work on any static host |
| Tests / lint | Vitest 5.1 (196 tests) / oxlint 1.9 (0 warnings) |

Scripts: `npm run dev`, `npm run typecheck`, `npm test`, `npm run lint`, `npm run build`, `npm run preview`.

## 2. Architecture principles

1. **Engines and rules are pure TypeScript.** Waveform maths, discharge physics, disassembly sequencing, challenge generation and lesson criteria contain no React code and are unit-tested directly.
2. **Content is data, written once.** Modules, lessons, the 24 components, test procedures, comparison guides, instruments, 3D models, procedures, badges and lesson criteria live in `src/content/`. The 3D lab, the Component Library and the dashboard all render from the same records; nothing is written twice.
3. **One progress store.** All modules record outcomes through actions on `useProgress`: `visitModule`, `recordSimulationRun`, `clearSimulationHistory`, `resetProgress`, `importProgress`, `setLevel`, `inspectComponent`, `identifyComponent`, `completeLesson`, `recordActivity` and `recordAssessment`. The dashboard derives every number from it through pure selectors. Later phases add `completeExercise`, `completeProject` and `recordDiagnosis`; their data fields already exist.
4. **No invented ratings.** Every specification carries a provenance label (`typical`, `model` or `part-type`, see §4). Generic 3D parts carry generic markings; no manufacturer-specific part numbers are presented as the model's parts (enforced by a test).
5. **No fake functionality.** Sections without an interactive workspace show their final syllabus and the phase that builds them. Badges and counters for future features say which phase unlocks them.
6. **Isolation of failures.** Each route renders in its own `ErrorBoundary`; the 3D lab and the library are code-split.

## 3. Folder structure

Items marked *(Phase N)* do not exist yet.

```
src/
  app/layout/          AppShell: sidebar, mobile drawer, simulation banner, per-route ErrorBoundary
  content/
    modules.ts         13 sections incl. the Learning Academy entry (single source for nav, routes, pathway)
    academy/           Learning Academy (Phase 6), see §10: types, catalogue (15 courses), s1/ (course S1: 6 modules,
                       20 lessons), f3/ (course F3: 5 modules, 19 lessons, Phase 8), f5/ (course F5: 4 modules,
                       11 lessons, Phase 8), glossary, logic (marking, completion, unlock, competency), routes (+ tests)
    buildProjects.ts   the eight Build Your Own Inverter projects (Phase 6): architecture, roles, options, questions,
                       troubleshooting faults, safety; suggestSelection
    componentCatalogue.ts   the 24 components (index)
    components/        component database (single source):
                         power.ts, control.ts, protection.ts, io.ts, structural.ts   entries (13 panel fields + levels)
                         testing.ts       test procedures per component (virtual instruments, safety, readings)
                         comparisons.ts   curated comparison guides with understanding checks
                         index.ts         COMPONENTS, COMPONENT_BY_ID, PANEL_ENTRY_BY_ID (+ tests)
    instruments/       virtual instrument registry and shared safety precautions (content/instruments/, metadata only)
    lessonCriteria.ts  completion criteria for lessons earned by doing (3D Lab and Library)
    models/            3D inverter model registry: lf3k.ts, sq1k.ts, index.ts
    badges.ts          9 badges (pure predicates over progress)
  types/               domain.ts (components, 3D models, procedures, circuits, simulation, faults), modules.ts, progress.ts
  engine/waveform/     waveforms.ts, scale.ts (+ tests)
  engine/circuit/      types, parts (20-part catalogue), topology (union-find nodes), solve (MNA), roles,
                       validate (fault rules), exercises (evaluators), edit (pure editing ops), build (+ tests)
  engine/sim/          netlist, sources, transient (TransientSim), linalg, analysis, ac, record, session (+ tests)
  engine/design/       Phase 6 design engine, see §9a: calc (explained calculations), compat (compatibility checks),
                       generate (project circuits, assembly steps, zones, probes), assembly (step verification),
                       testing (engineering test suite), kit (parts kit, design sync) (+ tests)
  engine/solar/ faults/    (Phases 7, 9)
  engine/instruments/  Phase 8 virtual-instrument engines: scope, dmm, clamp, esrLcr, battery, insulation,
                       componentTester, index (+ INSTRUMENT_SCENARIO_IDS) (+ tests)
  store/               progressStore.ts, idbStorage.ts, selectors.ts, sanitize.ts (validate + merge), id.ts (+ tests)
  ui/                  primitives, Icon, ErrorBoundary, symbols/ (IEC schematic symbols for all 24 components)
  features/
    dashboard/         DashboardPage, WaveformBench, ScopeTrace
    modules/           ModulePage (syllabus view for sections not yet interactive)
    progress/          ProgressPage (summary, activity log, history, backup/restore/reset), SimulationHistory
    lab3d/             3D Inverter Laboratory (Phase 2), see §6
      Lab3DPage.tsx    route entry (React.lazy), layout, modes, levels, lesson sync
      scene/           LabCanvas, PartNode, highlight, geometry, materials, textures, dims, terminals, registry
        factories/     procedural part builders: semiconductors, passives, protection, mechanical, connections, PartVisual
      panels/          PartsTree, ComponentInfoPanel, ComponentPreview, Toolbar, IdentifyPanel, ProcedurePanel,
                       DischargeSimulator, LessonsPanel
      store/labStore.ts      interaction state (not persisted)
      logic/           procedure.ts, discharge.ts, identify.ts, lessons.ts, resistor.ts, format.ts, webgl.ts (+ tests)
    library/           Component Library (Phase 3), see §7
      LibraryPage.tsx, ComponentDetailPage.tsx, ComparePage.tsx   (each React.lazy)
      components/      SpecTable, TestProcedureView, PinoutDiagram, shared (levels, explanation tabs, breadcrumb)
      logic/           search.ts (ranked search, filters, parts-in-models), geometry.ts, format.ts (+ tests)
    circuit-lab/       CircuitLabPage, Workspace (SVG editor), Toolbox, Inspect/Checks/Exercise panels, PartGlyph,
                       circuitStore (saved circuits + undo), analysis.ts, format.ts (+ tests)
      sim/             sim.worker, protocol, useSimulation, Scope, SimBar, SimPanel, Bode, ExperimentPanel, defaults, scale
    build/             BuildPage, ProjectPanel (brief, design, components, assembly, tests, troubleshoot, assessment),
                       KitToolbox, buildStore, useProject, suite.worker + useSuite, report
    academy/           AcademyPages (catalogue, course, lesson, quiz, assignment, exam, record), Rich (lesson text +
                       glossary), QuestionSet, diagrams (17 computed diagrams + schematics), Demos, AcademyBanner
    instruments/       Virtual Instruments Laboratory (Phase 8): InstrumentsLabPage.tsx (route entry, React.lazy,
                       gated), one panel per instrument (Dmm/Clamp/Scope/Esr/Lcr/Battery/Insulation/ComponentTester)
    solar/ repair/ assessments/   (Phases 7, 9–10)
docs/ARCHITECTURE.md, docs/CURRICULUM-BLUEPRINT.md, docs/PHASE-N-PLAN.md, docs/PHASE-N-REPORT.md
```

## 4. Data models (`src/types/`)

- **ElectronicComponent**: id, category, symbol key, function, operating principle, applications, terminals (pin label, role, description), I/O behaviour, failure symptoms, replacement notes, safety, related ids, specifications, plus a `plainSummary` (beginner) and `advancedNote` (design level). Testing lives in `TEST_PROCEDURES`, keyed by the same id.
- **ComponentSpec** `{ name, value, unit, kind }` with `kind`:
  - `typical`: a typical range for the class of component
  - `model`: a design value of the simulated inverter
  - `part-type`: a published characteristic of an industry-standard multi-source part type (SG3525, 1N5408), to be confirmed on the actual maker's datasheet

  None of these is presented as a manufacturer rating.
- **TestProcedure**: title, purpose, `safety` (keys into shared `SAFETY_TEXT`), extra precautions, and steps (`instrument`, setting, connection, `readings[]` with condition, representative display, meaning and good/fault).
- **ComparisonGuide**: sides (each linked to a component id), criterion rows, "choose when", inverter example, understanding-check questions.
- **InverterModel**: id, name, topology, ratings, enclosure size, assemblies, `parts`, `procedure` (ordered `ProcedureStage[]`) and `dischargeBank` (`CapacitorBank`: C, V₀, bleeder R).
- **ModelPart**: component id, label, PCB designator, assembly, position/rotation, `explodeOffset`, `geometry: PartGeometry` (a discriminated union naming the procedural builder and its parameters), optional `mountedOn` (board) and `dependsOn` (order rules), and a `removalNote` explaining what holds it in place.
- **ProcedureStage**: title, instruction, why-now explanation, optional action (`isolate`, `discharge`), part ids, reassembly tip, optional checkpoint question.
- **ProgressData**: lessons, exercises, projects, identified and inspected components, assessments, diagnoses, simulation runs, module visits, `level` (`beginner` / `intermediate` / `advanced`) and `activities` (`ActivityRecord` with level, model and optional score).
- **Circuit types** (Phase 4) live in `src/engine/circuit/types.ts`: `PartDef` / `TerminalDef` / `ParamDef`, `PlacedPart`, `Wire` (terminal-to-terminal), `CircuitDoc`, `Topology` (nodes), `SimMode`, `Solution`, `MeasurementPoint`, `ValidationIssue`, `ExerciseResult`.
- **SimulationParams / Measurements**, **FaultScenario / DiagnosisAttempt**: defined for Phases 5 and 9.

## 5. Simulation strategy

The simulator is educational, deterministic and physically grounded. Since Phase 5, circuits built in the lab are simulated in the time domain by a SPICE-style transient engine (modified nodal analysis with numerical integration). No random numbers are used for any electrical value.

| Layer | Model | Status |
|---|---|---|
| Waveforms | Ideal H-bridge: square, quasi-square (α), unipolar SPWM, ideal filtered sine, rectified. DFT harmonics, Parseval THD. Tested against closed forms. | Done (Phase 1) |
| Capacitor discharge | V(t) = V₀·e^(−t/RC), E = ½CV², I = V/R, P = V²/R, t_safe = RC·ln(V₀/50 V). Methods: built-in bleeder, 470 Ω/25 W and 2.2 kΩ/10 W tools, screwdriver (refused: peak current > 10 kA). Pulse capacity simplified as rated W × 5 s. | Done (Phase 2) |
| Transient engine | MNA in the time domain: trapezoidal companion models, backward-Euler restarts after switching events, piecewise-linear devices iterated per step, step subdivision, convergence-failure and instability detection, energy accounting. | Done (Phase 5) |
| AC analysis | Complex MNA frequency sweep (Bode magnitude/phase, −3 dB, resonance). | Done (Phase 5) |
| Waveform analysis | Mean, cycle RMS, pk-pk, frequency, duty, harmonic spectrum, THD from simulated samples. | Done (Phase 5) |
| Thermal | Conduction loss from simulated v·i, switching loss ½·V·I·t_sw per simulated edge, steady-state T_j = T_a + P·R_θ(j-a). Fan failure (R_θsa) arrives with the repair scenarios. | Done (Phase 5) / Phase 9 |
| Battery | Internal-resistance model (Phases 4–5); state of charge, Peukert and chemistry cut-offs with the inverter projects. | Phase 6 |
| Circuit lab | Node graph (union-find), modified nodal analysis with piecewise-linear diodes/LEDs, gate-controlled MOSFET/IGBT with body diodes, current-limited supply, relays, ideal transformer (AC snapshots at ±peak). 19 fault rules over nodes and solved values. RC τ from Thevenin resistance. | Done (Phase 4) |
| Solar | Single-diode PV model, P&O MPPT, PWM charging, priority dispatcher with transfer switching. | Phase 7 |
| Faults | Scenario → parameter overrides; instruments read the faulted simulation. | Phase 9 |

Model assumptions are displayed beside each result in the UI.

## 6. 3D laboratory architecture (Phase 2)

**Multiple models.** `INVERTER_MODELS` is a registry. A model is pure data: parts, assemblies, procedure and capacitor bank. The scene, parts tree, procedures, discharge simulator, identification challenge and lessons all work from that data, so a new model needs no new code unless it introduces a new part shape. Two models ship: LF-3K (3 kW hybrid, 43 parts of which 42 are removable, all 24 components) and SQ-1K (1 kW square-wave, 20 parts, 13 component types). Integrity tests run over every registered model.

**Procedural parts.** Each `PartGeometry.factory` maps to a builder in `scene/factories/` that composes Three.js primitives, extrusions, tubes and merged geometry. Dimensions come from `scene/dims.ts` (JEDEC TO-247, SOIC-8, DIP-16, LQFP-64, DO-201AD and so on). `scene/terminals.ts` derives each part's pin positions from the same dimensions, and a test checks that every 3D terminal id exists in the component's documented pinout. Markings, polarity stripes, colour bands, silkscreen, the LCD and nameplates are canvas-generated textures, so the lab makes no network requests and ships no image assets.

**Scene graph and interaction.** `PartNode` wraps each part: it animates position (explode offset plus its board's offset; lift-out when removed), sets visibility (hidden, isolated, removed), applies the highlight tint, adds a hit target for small or sparse parts, and draws labels and connection markers. Pointer events pass through a filter that ignores invisible objects. With the cover off, the enclosure walls switch to an X-ray material that ignores clicks.

**Camera.** drei `CameraControls` (orbit, dolly, truck, touch). Focus requests use `fitToSphere`, which keeps the viewing angle (`fitToBox` snaps to an axis). Single parts are framed from a steeper angle with a minimum radius so neighbours do not block them.

**State.** `labStore` (Zustand, not persisted) holds mode, selection, explode, visibility, procedure progress, checkpoints, hints and challenge state. Outcomes are written to `useProgress`: inspected and identified components, activities, the asm-01 assessment, and lessons completed by `logic/lessons.ts` criteria.

**Learning levels.**

| | Beginner | Intermediate | Advanced |
|---|---|---|---|
| Information panel | opens with a plain-language summary | function and principle first; summary and design note on demand | opens with the design note and specifications |
| Disassembly / reassembly | valid next parts outlined in green | hints on request (counted); checkpoint questions | no highlighting; checkpoints |
| Discharge | run and verify | run and verify | must predict t_safe (±15 %) before running |
| Identification | 8 distinctive parts, named, with hints, unlimited attempts | 12 parts by function, 2 attempts | 20 parts by name, 1 attempt: assessment asm-01 |

**Rendering budget.** `frameloop="demand"` (measured: 0 frames rendered while idle). Shared materials and cached or merged geometry; DPR 1.5, lowered to 1 by `PerformanceMonitor` on slow devices. Contact shadows and the light-former environment are rendered once. Full LF-3K scene: about 350 draw calls per rendered frame. Code-split chunk: about 1.25 MB raw / 343 kB gzip; the dashboard bundle stays at about 102 kB gzip.

## 7. Component Library architecture (Phase 3)

- **Single source.** The library renders the same `ElectronicComponent` records, symbols, test procedures and 3D geometry recipes as the 3D lab. The pinout diagram for each component is derived from the geometry recipe of its 3D part, and the 3D information panel reuses the library's `SpecTable` and `TestProcedureView`.
- **Catalogue.** Ranked full-text search: every word must match. Each word's score is its best field (name 10, id 8, category 4, function, applications and pins 3, summary 2, principle, faults and replacement 1; ×0.4 for mid-word matches) plus 25 % of its other field matches. Filters cover category and "appears in 3D model". All filter state lives in the URL, so a filtered view can be bookmarked or shared.
- **Detail page.** Ten sections:
  - beginner, intermediate and advanced explanations (opening at the learner's level)
  - operating principle and I/O behaviour
  - inverter applications and where the part sits in each model
  - symbol, pinout diagram and pin table
  - specifications with provenance
  - test procedures with a virtual instrument face and selectable component condition
  - faults
  - replacement and compatibility
  - safety
  - related components with compare links

  Previous/next navigation is included.
- **3D links.** "Show in the 3D laboratory" opens `/lab-3d?model=…&part=…`. The lab switches model, enters Explore, selects the part and frames it with the camera. The 3D information panel links back to the library entry.
- **Comparison.** Eight curated guides, including the four requested pairs. A side-by-side tool compares any two entries and points to a curated guide when one exists. Answering a guide's check records `library:compare:<guide>`.
- **Progress.** Opening an entry counts as studying it (shared with the 3D panels). Lessons cmp-01 to cmp-05 complete from `content/lessonCriteria.ts`, and a global lesson sync in `AppShell` completes lessons on any page. New badge: Reference Reader.
- **Bundles.** Library pages are lazy (2.6–4.3 kB gzip each, plus a shared 31 kB gzip component-database chunk also used by the 3D lab). The dashboard bundle stays at 103.5 kB gzip.

## 8. Circuit Connection Laboratory (Phase 4)

**Documents.** A circuit is `CircuitDoc { parts, wires }`. Parts sit on a 20 px grid with 90° rotations; each part type defines its terminals in local grid coordinates (`PART_DEFS`), so terminal positions, hit-testing and pin labels all come from one table. A wire joins two terminals; there are no free-floating wire ends, so the netlist is exact.

**Pipeline (on every edit).** `buildTopology` merges wired terminals into nodes (union-find) and picks the reference (ground part, else the source negative) → `solveCircuit` builds and solves the MNA system for each mode from `defaultModes` (DC, or the AC source at its positive and negative peaks), iterating piecewise-linear devices to a consistent state → `validateTopology` + `validateSolution` produce `ValidationIssue`s with explanation, fix and the parts involved. Nothing counts wires: every rule reads node membership, part roles or solved currents and voltages.

**Roles.** `roles.ts` finds what a switch is doing from the graph: its gate driver (directly or through one gate resistor), the DC bus (through the fuse, closed switches and breaker poles), high-side / low-side position and half-bridge legs. Exercises use these to put the circuit into test states (for example the two diagonal H-bridge states) and to check gate references.

**Exercises.** `content/circuitExercises.ts` holds ten exercises (objectives, steps, expected connections, assessment, toolbox, starter and a worked solution). `engine/circuit/exercises.ts` evaluates each one with weighted criteria computed from solves in the required states; a danger-level issue in the as-built circuit or a required test state blocks a pass. Worked solutions are tested to pass and to be warning-free; faulty variants are tested to fail with the expected issue. Passing marks the exercise and its lesson complete (ckt-09 also records practical assessment asm-03); passing with the worked solution loaded earns no credit until the circuit is reset.

**Editor.** One SVG with pointer events (mouse, pen, touch): drag-and-drop or tap-to-place from the toolbox, drag or tap-tap terminal wiring, wire end handles for reconnection, drag to move, rotate, delete, undo (60 steps), wheel and pinch zoom, pan, keyboard shortcuts. Circuits are saved per exercise in IndexedDB (`inverter-lab-circuits`, sanitised on load) and can be exported and imported as JSON. `window.__circuitLab` is a test hook used by the browser regression script.

**Bundle.** The page is lazy-loaded: 38 kB gzip; the dashboard bundle stays at 103.6 kB gzip.

## 9. Electrical simulation engine (Phase 5)

**Numerical method.** Modified nodal analysis in the time domain with a fixed step h (automatic: AC period/400, PWM period/200, SPWM carrier/100, otherwise 20 µs; the user can override it). Capacitors and inductors use trapezoidal companion models, which are second order and add no numerical damping (an LC tank's energy follows the analytic e^(−Rt/L) to 10⁻⁶). Backward Euler is used for the first steps and for two steps after any device state change, the standard cure for trapezoidal ringing at discontinuities. Piecewise-linear devices (Phase 4 models) are iterated to a consistent state at every step. A step that does not settle is subdivided to h/8; if it still fails, the run stops with a convergence-failure message and nothing after that time is shown. NaN, Inf or |V| > 1 MV stops the run as unstable.

**Netlist.** `engine/sim/netlist.ts` compiles a `CircuitDoc` over the Phase 4 topology into SPICE-like primitives: R, Norton V source, current-limited supply, C, L (with an internal node for R_dc), piecewise-linear diode, controlled switch (gate, relay, fuse, breaker, manual), IGBT channel, and ideal transformer (branch current) with series winding resistances and magnetising inductance. Because the netlist comes from the same graph, a circuit built for a Phase 4 exercise runs unchanged.

**Sources.** AC sine; the pulse/gate generator provides static, PWM (frequency, duty, phase, inverted, dead time) and bipolar SPWM (carrier, modulating frequency, index). Dead time delays each turn-on edge, as a gate-driver dead-time circuit does.

**Measurements and energy.** Signals are node voltages, voltage across a part, current through a part, V_GS/V_GE, transformer primary/secondary/magnetising current, and differences of any two (`T:part.terminal`, `A|B`). Source and dissipated energies are trapezoidal integrals of v·i (so an ideal switching edge costs nothing). Stored energy is ½CV² + ½LI² from the state variables, and the balance error (delivered − dissipated − stored) is shown to the student.

**Execution.** `SimSession` (pure TypeScript) owns the simulator and a 40 000-row ring buffer (Float32) covering 2.5 screen widths. It produces frames: 600 min/max columns per channel, so PWM edges survive decimation, plus measurements over the displayed window, a spectrum, energy, and per-switch losses over the window. It runs in a module Web Worker (`sim.worker.ts`, 76 kB). `useSimulation` streams time at the chosen speed (divisions per second, or Max) with one request in flight, so slow computers run slower instead of freezing; measured UI frame time while simulating at Max is about 20 ms. Parameter and switch changes while running are applied without resetting state if the topology is unchanged; a topology change restarts the run with a notice.

**Experiments.** `content/simExperiments.ts` holds ten experiments. Expected values are independent closed forms computed from the circuit's current parameters; observations are measured from a full run in the worker. The test suite runs every experiment and requires all observations to agree. Completing experiments earns the Inverter Fundamentals lessons (`content/fundamentalsCriteria.ts`, kept engine-free so the app shell stays light).

## 9a. Build Your Own Inverter: the design engine (Phase 6)

**Principle: no new tool, no duplicated model.** A build project is a Circuit Lab workspace (`?ex=bld-a…h`). The editor, connection graph, Phase 4 validator, Phase 5 transient engine and Component Library are reused unchanged. Phase 6 adds only:

- the design engine (`engine/design/`);
- three parts: PV array, centre-tapped transformer, voltage sensor;
- two netlist primitives (current source IS, three-winding ideal transformer X3);
- a once-per-cycle RMS regulator for SPWM ("SPWM reg." gate mode);
- an LU-factor cache in the transient engine.

**Pipeline**, all pure functions of (project, design spec, selection):

1. `calculate` returns every design quantity as an explained item: formula, substituted working, reason, and a calculated/typical-assumption label.
2. `checkCompatibility` gives pass/warn/fail per role and aspect, citing library typical values. It never invents datasheet figures.
3. `generateProject` gives the reference circuit with the design's values, assembly zones, assembly steps (connection or series requirements, with text at three learner levels) and probes.
4. `verifySteps` checks each step on the connection graph. Placement alone never satisfies a step.
5. `runSuite` runs up to 14 test kinds (no-load, resistive, inductive, overload, short circuit, low/high battery, regulation, efficiency, thermal, waveform, MPPT, grid, generator), each a transient simulation of the student's own circuit changed only by the test condition. Six output cycles are simulated and the last three measured. The suite runs in a dedicated worker.

**Parts kit.** The generated parts carry fixed ids, so steps and fault injections address them.

- Beginners start with every part placed and no wires; intermediate and advanced learners place, rotate and position the parts themselves.
- `syncToDesign` updates a built circuit when the design or selection changes, remapping terminals when a switch changes type.
- A test report is "current" only for the exact circuit it ran on.

**Assessment.** The criteria are connections, architecture questions, simulation results, component selection, protection, troubleshooting and final performance. The learner level selects which are required. Completion writes `completedProjects` and the lesson id.

## 10. Learning Academy (Phase 6)

The curriculum and competency framework are specified in `docs/CURRICULUM-BLUEPRINT.md`.

**Content model** (`content/academy/types.ts`):

- course → module → lesson, with a published/scheduled status and the authoring phase;
- every published lesson has the fourteen sections of the lesson standard;
- lesson text uses a small markdown subset with glossary links `[[term]]`;
- lab links are typed (`lab3d`, `library`, `procedure`, `compare`, `circuit`, `sim`, `build`) and built into routes by `routes.ts`;
- diagrams are ids drawn by `features/academy/diagrams.tsx`, computed from the engine's own formulas, or `schematic:<project>` drawn with the circuit lab's symbols.

**Records.** `ProgressData` gains `enrolments` and `attempts` (kind, ref, score, max, answers, duration). Both are optional in stored data, sanitised on load and import, and merged during hydration, so older backups still import.

**Rules** (`logic.ts`, pure and tested):

- A lesson is complete when its knowledge check reaches 70 %.
- A module is complete when all its lessons, its quiz, its assignment (≥ 70 %) and its practicals are done. Practicals are read from the laboratories' existing records and credited only after the quiz is passed.
- Quizzes allow 3 attempts per 24 h, and the best score counts.
- The examination opens when every module is complete. It is timed, auto-submits when time runs out, allows 3 attempts with a 24 h cool-down, and shows no feedback until submitted.
- Scheduled prerequisites are "recommended", not locks.
- Competency levels are derived as awareness → applied → virtual competency.

**Code splitting.** Course content and Academy pages are lazy chunks. `catalogue.ts` (every course) is imported by `logic.ts`, so the full course catalogue is one chunk; it stayed essentially flat through Phase 6 and grew with Phase 7's content (see §10a). The main entry bundle itself did not grow (≈333 kB before and after Phase 7).

**Tests** enforce the lesson standard and minimum depth. They also check every lab link, diagram id and glossary term, the answer keys and marking, progression, the examination cool-down, competency derivation and record sanitising.

## 10a. Prerequisite gates, F1/F2, and the Solar and Hybrid Engineering Laboratory (Phase 7)

**Gates** (`content/academy/gates.ts`). A `PracticalArea` (`'circuit' | 'build' | 'solar' | 'lab3d-procedure'`) maps to the mandatory prerequisite courses it needs:

- F1 (Electrical Safety and Fundamentals) alone gates the 3D lab's guided disassembly/reassembly procedure and F2's own circuit-lab exercises (`ckt-01`…`ckt-03`, `sim-01`, `sim-02`), since those are F2's own practicals and F2 cannot be locked behind itself.
- F1 **and** F2 gate everything else practical: the Build laboratory, every other circuit-lab exercise, and the Solar laboratory.
- `gateStatus(progress, area, exerciseId?)` returns `{ open, missing }`; `requiredCourses()` is the pure lookup the tests enumerate against. Reading the Component Library, exploring the 3D models (not the guided procedure) and studying academy lessons are never gated.
- `<GateNotice>` renders the closed state (`data-testid="practical-gate"`, one `data-testid="gate-course-<id>"` link per missing course) in the circuit lab, the 3D lab's procedure tab and the Solar laboratory. The Build laboratory shows a non-blocking notice instead (`data-testid="build-gate"`) and still lists its projects, since each project's own gate is enforced where it opens in the circuit lab.

**Practical task engine** (`content/academy/types.ts`, `logic.ts`). A `PracticalTask` is one of four kinds, each strictly marked (no partial credit) by `markTask()`:

- `sequence` — order a pool of steps (with distractors) correctly; any distractor, any missing step, or the wrong order fails.
- `hazards` — select exactly the hazardous items from a scene; one miss or one false positive fails.
- `procedure` — choose actions one at a time against a simulated scene; an unsafe action fails immediately, otherwise the required action subsequence and the final conclusion must both be correct.
- `calc` — a `QuestionSet` in practice mode; every question must be correct.

`<TaskRunner>` (sequence/hazards/procedure) and `<QuestionSet testid="calc">` (calc) render these; both report to `PracticalPage`, which calls `recordAttempt` and credits the practical through the module's existing evidence/credit rules (quiz passed first) — no new credit path was added.

**F1 (Electrical Safety and Fundamentals) and F2 (DC Electrical Systems and Fundamentals)** are now fully authored, published courses, no longer "scheduled" placeholders:

- F1 — 4 modules (shock physiology and PPE; hazard identification; safe isolation and proving dead; protection, earthing and workshop practice), 12 lessons, practicals `f1-isolation-sequence` (sequence), `f1-prove-dead` (procedure), `f1-hazards-bench` (hazards) and `f1-stored-energy` (calc), examination (pass 80 %, 45 min, 3 attempts/24 h).
- F2 — 5 modules (charge/current/voltage; resistance/Ohm's law/power; series/parallel circuits and Kirchhoff's laws; RC/RL time constants; DC sources and systems), 14 lessons, a mix of practicals linking to existing circuit-lab/simulation exercises plus new calc tasks, examination (pass 70 %, 60 min, 3 attempts/24 h).
- New foundation diagrams and demonstrations (`features/academy/diagramsF.tsx`, `DemosF.tsx`) are driven by the same engines used elsewhere (Ohm's law, RC/RL exponentials, voltage drop, battery internal resistance), not bespoke illustrations.

**Solar engine** (`engine/solar/`), independent of the UI and fully unit-tested:

- `pv.ts` — single-diode PV model (`I = I_ph − I₀·[e^((V+I·Rs)/a) − 1]`) fitted by bisection to datasheet V_oc/I_sc/V_mp/I_mp with temperature coefficients and NOCT-based cell temperature; `arrayCurve()` composes series/parallel strings with per-module irradiance (shading) and bypass diodes; `perturbObserve()` is a real perturb-and-observe MPPT tracker (can settle on a local peak under partial shading, as the real algorithm does); `pwmOperating()` models a PWM controller clamping array voltage to the battery.
- `sizing.ts` — `sizeSystem()` is the full load-profile-to-installation method: hourly load profile → daily energy/peak/surge → inverter → system voltage → battery bank (autonomy, DoD, round-trip efficiency) → PV array (temperature/soiling/wiring/mismatch derates, string-voltage window from cold V_oc and hot V_mp) → controller → cables (voltage-drop sizing) → protection (1.25×/1.56× fusing factors) → generator (start/stop SOC with hysteresis above the low-voltage disconnect). Every figure is returned as a `SizedItem` with its formula, worked numbers and rationale — nothing is a bare result.
- `dispatch.ts` — multi-day, 10-minute-step clear-sky dispatch simulation (off-grid/grid-tied/hybrid priorities, anti-islanding, generator auto-start/stop).
- `faults.ts`, `commissioning.ts` — ten troubleshooting scenarios and a predict/measure/compare commissioning workflow, both driven by the same sizing/PV engine so readings are internally consistent with the learner's own design.
- Example modules and presets are explicitly tagged `source: 'illustrative'` and never presented as manufacturer datasheets (per the standing "do not invent datasheet values" constraint).

**Solar laboratory UI** (`features/solar/`) — five tabs on `/solar`, gated by F1+F2: System design (editable load table, site/system/battery/module/cable configuration, a fully explained calculation list, downloadable Markdown report, "record this design" once no danger-level issue remains), PV I–V laboratory (interactive tracer with a rotating prediction task checked against the engine), Energy management (1–3 day dispatch simulation with weather and outage controls), Troubleshooting (ten scenarios, readings generated by the fault engine, graded diagnosis) and Commissioning (predict/measure/compare, with injectable practice faults; recording requires both correct predictions and a healthy as-built system).

**S2 (Solar and Hybrid Engineering)** — 5 modules, 15 lessons, prerequisites F1+F2, recommended S1+P5, examination (pass 70 %, 75 min). Its practicals are evidenced by the solar laboratory's own recorded activities (`solar:design-ok`, `solar:iv`, `solar:sim`, `solar:commission`, four `solar:fault:<id>`) and by hand-worked sizing/commissioning-sequence calc/sequence tasks, alongside the design-chain projects already in Build.

**Verification.** Unit tests (`academy.test.ts`, `solar.test.ts`) cover gate matrices, task marking (every failure mode per task kind, plus a "perfect response passes" check), the PV model against hand-calculated datasheet points, the sizing method against a hand check, dispatch totals, fault scenarios and commissioning. A qualified-learner browser pass (Playwright, with a pre-built "F1+F2 complete" IndexedDB state injected) exercises every gate, the F1 practical tasks, and all five solar-lab tabs end-to-end, at desktop and 390 px-phone viewports, with no console errors.

## 10b. Catalogue/logic split: course shells (Phase 7 acceptance review)

A Phase 7 acceptance review (before Phase 8 began) found that `content/academy/logic.ts` unconditionally imported the full, authored course catalogue (`catalogue.ts`) to support two functions — `courseUnlock()` and `competencyRecord()` — that are only ever called from the Learning Academy's own pages. Because `logic.ts` is also the module every prerequisite gate and the dashboard banner import for their (catalogue-independent) marking/completion functions, every consumer of `logic.ts` was transitively bundled with F1/F2/S1/S2's full lesson/quiz/exam content, regardless of whether that consumer ever needed it. This is what had grown the shared `logic.ts` chunk to ≈670 kB after Phase 7 (§14).

The fix separates the two concerns along the line that was already implicit in the code:

- **`content/academy/logic.ts`** — pure marking and completion rules (`markTask`, `lessonDone`, `moduleStatus`, `examStatus`, `courseComplete`, `evidenceMet`, `quizAvailability`, `ALL_LESSONS`). Every function here is generic over whatever `Course`/`AcademyModule`/`AcademyLesson` shape it is given; none of it needs lesson prose, quiz questions or exam questions. **This file no longer imports `catalogue.ts` at all.**
- **`content/academy/shells.ts`** (new, generated) — a mechanically-produced, byte-light `Course[]` with the exact same ids, titles, prerequisites, module/lesson/practical structure, quiz pass marks and exam settings as the real catalogue, but with lesson `content`, quiz/exam `questions` and assignment `tasks` stripped out. Each lesson instead carries a `hasContent: true` marker (`AcademyLesson.hasContent`, and the shared `lessonAuthored()` helper in `types.ts` that treats either `content` or `hasContent` as "this lesson has material to study"). `ALL_LESSONS` (used by the dashboard banner) and `gates.ts`'s `COURSE_BY_ID` (used by every prerequisite gate) now read from `shells.ts`, not `catalogue.ts`.
- **`courseUnlock()` and `competencyRecord()`** — originally moved to a short-lived `catalogueLogic.ts` alongside the full catalogue; superseded in §10c below, where they moved back into `logic.ts`, now reading the shells (including practical titles) instead of the real catalogue, once nothing left needed the full catalogue at all.
- **`content/academy/shells.test.ts`** (new) — a consistency test that fails if `shells.ts` ever drifts from the real catalogue (ids, order, prerequisites, module/lesson/practical structure and titles, `hasContent` flags, quiz/exam settings, competency units). `shells.ts` is not regenerated automatically; a future course author who adds or restructures a course must regenerate it (the one-off generator script used to produce it is not checked in — it is a short Vitest file that imports `catalogue.ts` and writes `shells.ts`, deleted after use) and this test is what catches a forgotten regeneration.

Nothing about course IDs, lesson IDs, progress-record shape, or the IndexedDB backup format changed — `catalogue.ts` itself, `progressStore.ts` and `sanitize.ts` were not touched. See the Phase 7 acceptance review and bundle optimisation report (`docs/PHASE-7-ACCEPTANCE-REVIEW.md`, `docs/BUNDLE-OPTIMISATION-REPORT.md`) for the verification performed and the measured before/after bundle sizes.

The true per-course splitting flagged here as a follow-up was requested and completed next — see §10c.

## 10c. True per-course content loading (Phase 7.2 / final Academy performance task)

§10b removed course content from everything *outside* the Academy, but the Academy's own route (`features/academy/AcademyPages.tsx`) still statically imported the full catalogue at module scope, so opening the Academy — any course, or just the catalogue listing — bundled and fetched F1/F2/S1/S2's content together in one `AcademyPages-*.js` chunk. This section replaces that static import with genuine per-course, on-demand loading.

- **`content/academy/courseLoader.ts`** (new) — one dynamic `import()` per authored course (`F1`, `F2`, `S1`, `S2` today; add one line per course as Phases 8–14 author more). `loadCourse(id)` returns that course's full `Course` object, fetched from its own chunk, cached after the first successful load (module-level `Map`, deduplicated against concurrent requests for the same id) so re-opening a course or navigating between its lessons, quiz, assignment, exam and practicals never re-fetches it. A course with no entry here (still "scheduled", not yet authored) resolves immediately to its shell — a stub with a syllabus and no content, so there is nothing to fetch.
- **`content/academy/useCourse.ts`** (new) — the React hook every course-keyed Academy page uses in place of the old synchronous `COURSE_BY_ID[courseId]` lookup. Returns `{ status: 'loading' | 'ready' | 'notfound' | 'error', course?, retry() }`; `'notfound'` redirects to the catalogue exactly as the old "course doesn't exist" case did, `'error'` shows a retry panel (e.g. the course's chunk failed to fetch — offline, a stale deployed index after a new release), and `'loading'` shows a simple loading panel. The cache in `courseLoader.ts` is the single source of truth — the hook never stores "loading" as state, only the outcome of a failed resolution, and forces a re-render on success so the next render reads the course straight out of the cache.
- **`features/academy/AcademyPages.tsx`** — `CoursePage`, `LessonPage`, `useCourseModule` (shared by `QuizPage`/`AssignmentPage`), `ExamPage` and `PracticalPage` all now call `useCourse(courseId)` instead of indexing the old static `COURSE_BY_ID`. The catalogue listing (`Catalogue`) and every cross-reference to *another* course's title (a locked prerequisite in `CourseLock`, a recommended course in `CoursePage`) now read `SHELL_COURSES`/`SHELL_BY_ID` from `./shells` — metadata only, never that other course's content. `courseUnlock()` and `competencyRecord()` moved back into `logic.ts`, now shell-based (shell practicals carry their `title` precisely so `competencyRecord`'s evidence list still reads correctly) — so `logic.ts` remains the single, catalogue-free home for every piece of Academy logic, and `catalogueLogic.ts` (§10b) was deleted as no longer needed.
- Every course ID, lesson ID, practical ID and the persisted-progress schema are unchanged; `catalogue.ts` itself (still the single source of truth for authored content), `progressStore.ts` and `sanitize.ts` were not touched.

Verification (measured sizes, chunk-isolation checks and regression results): `docs/BUNDLE-OPTIMISATION-REPORT.md` §5–7.

## 10d. Virtual instruments and F3/F5 (Phase 8)

Phase 8's authorisation named F5 and S4.M1, but S4 is a Phase 13 course per the roadmap (§13) and the curriculum blueprint's own course table assigns Phase 8 to **F3 and F5** — confirmed with the requester before authoring began. Phase 8 therefore authored F3 (AC Electrical Fundamentals) and F5 (Measurement and Virtual Instruments) in full, and built the eight virtual instruments both courses rely on. S4 is untouched and remains scheduled for Phase 13.

**Instrument engine (`engine/instruments/`)** — one module per instrument, each a pure function of its inputs, independent of any UI framework:
- `scope.ts` — `captureScope(settings)` reuses the Phase 5 transient engine's own `instantaneous(kind, params, t)` waveform function directly (`engine/waveform/waveforms.ts`), so the oscilloscope reads the same waveform model the rest of the simulator uses, then derives RMS/peak/peak-to-peak/average/period/frequency/duty-cycle by dense sampling — a genuine, not fabricated, measurement.
- `esrLcr.ts`, `componentTester.ts` — reuse the Phase 3 component library's real `TEST_PROCEDURES` reference values (`content/components/testing.ts`) as the ground truth for ESR/LCR/diode-test readings, rather than inventing a second set of numbers.
- `dmm.ts`, `clamp.ts` — realistic, Ohm's-law-consistent **preset scenarios** (unchanged, kept as a guided introductory mode), plus, since the Phase 8 final-acceptance remediation, a **live-circuit mode**: `engine/instruments/liveProbe.ts` builds a `DmmPoint`/`ClampScenario` from a circuit the student has actually built in the Circuit Lab, which `operateDmm()`/`readClamp()` then consume completely unchanged — so the same port-safety and live-resistance checks apply to a real probe exactly as they do to a scripted scenario. No second circuit-solving engine was introduced: DC voltage/current and resistance/continuity come from the existing Phase 4 MNA solver (`buildTopology` + `solveCircuit`, `engine/circuit/solve.ts`); true AC rms voltage/current comes from the existing Phase 5 time-domain engine (`recordRun` + `measure`, `engine/sim/*`) run for a short headless burst — the identical engine the Circuit Lab's own oscilloscope and experiment grader already use, just not continuously streamed. The one small, additive engine extension this needed: `SolveOverrides.inject` (used since Phase 4 for Thevenin-resistance exercise grading) can now also inject between two raw node ids, not only a single part's own two terminals — the general case a real ohmmeter's two free leads need — exposed as `measureResistance()` in `solve.ts`. See PHASE-8-REPORT.md for exactly which measurement functions are live vs. still preset-only.
- `battery.ts` — a genuine equivalent-circuit model (`V_loaded = OCV(SoC) − I·R_int`, chemistry-specific OCV curves for lead-acid and LiFePO4, coulomb-counting capacity test) — parameter-driven physics, not fabricated numbers, though it is a simplified model and not wired into S2's own solar/battery engine state (flagged in PHASE-8-REPORT.md).
- `insulation.ts` — explicitly simulation-and-safety-instruction only, per the authorisation's safety requirement; its UI gates the (simulated) measurement behind an explicit safety-procedure checklist rather than a passive disclaimer.

**Instrument UI (`features/instruments/`)** — `InstrumentsLabPage.tsx` is the lazy-loaded `/instruments/*` route (added to `App.tsx`'s route table and its generic-module exclusion list), gated like any other practical area (`gates.ts`'s `PracticalArea` gained `'instrument'`), with one panel component per instrument. `content/modules.ts`'s `instruments` module entry moved from `status: 'planned'` to `'live'`.

**Content model extension.** `ToolLink` gained an `'instrument'` variant (`{ kind: 'instrument', id, scenario? }`, with a route and a `linkExists()` case checking `INSTRUMENTS`/`INSTRUMENT_SCENARIO_IDS`), so F3 and F5 lessons link into specific instruments and scenarios the same way earlier courses link into the library, circuit lab or simulator. No new `DIAGRAM_IDS` or `DemoId` entries were needed — both courses reuse existing ids.

**F3 and F5 authoring** followed §10c's per-course loading exactly: `content/academy/f3/` and `content/academy/f5/` (5 and 4 modules), each added to `COURSE_CONTENT` in `courseLoader.ts` and to `COURSES` in `catalogue.ts`, each lesson meeting the full 14-section lesson standard (`academy.test.ts`'s depth checks) as F1/F2/S1/S2 already do. `shells.ts` was regenerated once, after both courses were wired in, to avoid regenerating twice.

**A blueprint gap found during authoring, resolved at final acceptance.** The curriculum blueprint's F3 lesson table marks several lessons with ★ as reusing existing Fundamentals-module activities (`fun-01`, `fun-05`, `fun-06` in `content/modules.ts`/`fundamentalsCriteria.ts`). No prior course (F1, F2, S1, S2) had ever linked to a `fun-*` lesson, and `ToolLink`/`linkExists()` had no case for one. At first authoring this was treated as out of scope; on final-acceptance review it was re-investigated rather than re-accepted, and turned out to be a small, additive gap rather than missing infrastructure: the standalone Fundamentals module (`content/modules.ts`, route `/fundamentals`) is itself a real, published (`status: 'live'`) section of the platform — it simply had no `ToolLink` case pointing into it. A `fundamentals` `ToolLink` variant (`{ kind: 'fundamentals', lessonId }`) was added — a route (`routes.ts`: `/fundamentals`, since lessons there aren't individually deep-linkable and the module page lists the whole sequence), a `linkExists()` case (checks the lesson id is real in `MODULE_BY_ID.fundamentals`), a `to.fun()` constructor (`s1/links.ts`) and a label in the activity-kind map (`AcademyPages.tsx`) — exactly the same four-point extension every other `ToolLink` kind already has, with TypeScript's exhaustiveness checking on the two switches forcing every call site to be updated. F3.M1.L1 (fun-01), F3.M3.L1 (fun-06) and F3.M3.L3 (fun-05) now link the Fundamentals module alongside the sim/circuit/instrument activities they already had. No course codes were invented and no lessons were duplicated — the three references now point at the real existing lessons the blueprint always meant.

## 11. Persistence and robustness

- Progress is a single `ProgressData` record (schema v1) in IndexedDB under `inverter-lab-progress`, kept in memory if storage is unavailable.
- `sanitizeProgress` validates every field on rehydration and on backup import, and upgrades older records (fields added in Phase 2 get defaults).
- `mergeProgress` combines stored data with anything recorded while IndexedDB was still loading (union of lists, latest visit times), so early actions are not lost.
- `newId` works in non-secure contexts (plain HTTP on a LAN IP).
- Without WebGL, the 3D lab shows a clear notice; the parts list, information panels and procedures still work.
- Build-lab state (designs, selections, last test reports) is validated against each project's defaults on load; choice fields accept only their allowed values.
- Saved circuits pass through `sanitizeDoc` (unknown parts, missing terminals, duplicate ids, non-finite or out-of-range values are dropped or clamped), so a damaged save cannot break the editor.

## 12. Safety design

- A permanent "Simulation environment" indicator; safety notices on every module.
- Guided disassembly enforces isolation and a verified discharge before any internal part can be touched, and explains every refused step.
- Unsafe methods (screwdriver discharge) are refused with the reason, never simulated as valid.
- Real-world caveats are stated where the model simplifies (dielectric absorption, bleeder failure, datasheet pin orders).
- Every test procedure begins with isolation (or is explicitly a qualified live measurement), and DC-bus parts require a verified discharge (enforced by tests).
- Build projects: every mains or HV project carries a "Simulated only" notice, and the configurator states that designs are educational estimates, not certified construction designs. The academy states that simulated practice is not a qualification, and competency records are labelled "virtual competency".
- Circuit lab: practical exercises start with isolated, current-limited, low-voltage sources. Anything above 50 V DC or 25 V AC (source settings or solved node voltages) raises a hazardous-voltage warning and a "Simulated only" banner; battery short circuits, shoot-through, reverse-polarity electrolytics and over-rated parts are danger-level and block an exercise pass.

## 13. Roadmap

| Phase | Scope | Status |
|---|---|---|
| 1 | Foundation, navigation, dashboard, design system, progress persistence, waveform engine core | **Done, audited** |
| 2 | 3D inverter dissection laboratory: two models, 24 recognisable part types, 13-field panels, explode/hide/isolate, connection points, guided disassembly/reassembly, discharge simulation, identification challenge and asm-01, learner levels | **Done** (see PHASE-2-REPORT.md) |
| 3 | Searchable component library: catalogue, technical pages, pinouts, provenance-labelled specifications, virtual-instrument test procedures, comparisons, 3D links | **Done** (see PHASE-3-REPORT.md) |
| 4 | Circuit connection laboratory: schematic editor, 20 part types, connection graph, MNA solver, fault explanations, ten assessed exercises, saving | **Done** (see PHASE-4-REPORT.md) |
| 5 | Electrical simulation engine: transient MNA, AC analysis, PWM/SPWM, switching, thermal estimate, oscilloscope, ten experiments, Fundamentals lessons | **Done** (see PHASE-5-REPORT.md) |
| 6 | Build Your Own Inverter (eight projects, design engine, test suite) + Learning Academy framework and course S1 | **Done** (see PHASE-6-REPORT.md) |
| 7 | F1 and F2 fully authored; prerequisite gates; Solar and Hybrid Engineering Laboratory and course S2 | **Done** (see PHASE-7-REPORT.md) |
| 8 | Virtual instruments bound to the simulation + F3, F5 | **Done** (see PHASE-8-REPORT.md) |
| 9 | Repair workshop (17 scenarios) + S4 | |
| 10 | Assessments, projects, final integration | |
| 11 | Battery Engineering and Energy Storage | |
| 12 | Installation and Commissioning | |
| 13 | Advanced Diagnostics and Professional Repair | |
| 14 | Maintenance, Standards and Professional Practice | |

Gate for every phase: `npm run typecheck`, `npm test`, `npm run lint` (0 warnings) and `npm run build` pass; every route and control is smoke-tested in a browser (desktop, tablet, 390 px phone, plain-HTTP LAN access) with no console errors from app code; 3D rendering is checked with headless Chromium (SwiftShader WebGL 2); earlier phases are re-checked.

## 14. Known limitations after Phase 7

- Five sections still show only their syllabus; their workspaces arrive in the phases above.
- One badge and the troubleshooting counter depend on later phases (labelled in the UI).
- Learning Academy: F1, F2, F3, F5, S1 and S2 are authored and published; the other nine courses show their syllabus as "scheduled". Written homework and assignment parts are self-reviewed against model answers (not stored or teacher-marked). Records are per browser; there is no teacher or institution account.
- Solar laboratory: the single-diode model and sizing method are an educational estimate with typical allowances (stated throughout the UI and reports), not a certified design; example PV modules and all other illustrative component values are explicitly labelled and never presented as manufacturer datasheets. The dispatch simulation uses a clear-sky model with a per-day weather scaling factor, not real weather or an hourly solar-resource dataset. The P&O MPPT demonstration can settle on a local peak under partial shading, as the real algorithm does — this is a teaching point, not a bug.
- Code splitting: **fully resolved, see §10b–10c.** `logic.ts` and the Academy pages no longer import the full course catalogue anywhere; every prerequisite gate, the dashboard banner, the catalogue listing and every cross-course reference read lightweight course shells (`shells.ts`), and each authored course (F1, F2, S1, S2) loads its own content from its own chunk, on demand, only when a student opens that specific course (`courseLoader.ts`/`useCourse.ts`). Opening one course never fetches another's content. Add one line to `courseLoader.ts` per course as Phases 8–14 author more — no other change is needed for the architecture to keep scaling.
- Build projects use simplified models, all labelled in the UI:
  - PV array: piecewise-linear, with the MPP at the knee.
  - Hybrid charger: resistor-limited, delivering about a fifth of the design current.
  - Transfer relays: driven by static controllers set per test; no detection algorithm.
  - Push-pull transformer: no leakage spikes.
  - Electronic overcurrent shut-down: described but not simulated.
  - Simulated switching frequencies: limited to 5–10 kHz so test suites finish in seconds.
- Build projects, manual settings: the MPPT duty is set by hand (automatic tracking in Phase 7), and the HV bus of the high-frequency design is unregulated.
- 3D parts are educational representations built from primitives: proportions and pinouts follow real packages, but surface detail is simplified.
- In the guided procedure, soldered parts are "removed" individually for inspection; in a real repair, boards are usually replaced as a unit (stated in the instructions).
- Discharge pulse capacity uses a simplified rated W × 5 s rule. The dashboard waveform bench still shows ideal formula waveforms (labelled); circuit waveforms now come from the transient engine.
- Test-procedure readings are representative teaching values. Phase 8 added interactive virtual instruments (§10d); the oscilloscope and the ESR/LCR/diode/component-tester instruments read real simulation and component-reference data. The DMM and clamp meter offer both a preset-scenario mode (realistic, internally consistent values, kept as a guided introduction) and a live-circuit mode that measures a circuit the student actually built in the Circuit Lab, for every DMM function except capacitance and the diode test (see §10d and PHASE-8-REPORT.md for exactly which).
- Transient engine: piecewise-linear semiconductors with instantaneous switching and ideal gates (no gate charge, no reverse recovery). There is no transformer saturation or leakage inductance, and no capacitor ESR. Fuses and breakers use a simplified I²t model; relays have no operate time. Switching loss uses a typical t_sw parameter; T_j is a steady-state estimate without thermal capacitance. The step is fixed, so PWM edges are quantised to h (≤ 0.5 % of a period with the automatic step), and events faster than h carry a reported energy error. Battery state of charge is not modelled yet.
- Circuit editor: wires use a simple orthogonal route and may cross parts.
- "Studied" means an entry or 3D panel was opened; reading depth is not measured.
- Progress and saved circuits are stored per browser; backup/restore and circuit export move them between devices.
