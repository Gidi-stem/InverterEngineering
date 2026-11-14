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
| Tests / lint | Vitest 5.1 (162 tests) / oxlint 1.9 (0 warnings) |

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
    modules.ts         12 sections, 59 lessons (single source for nav, routes, pathway)
    componentCatalogue.ts   the 24 components (index)
    components/        component database (single source):
                         power.ts, control.ts, protection.ts, io.ts, structural.ts   entries (13 panel fields + levels)
                         testing.ts       test procedures per component (virtual instruments, safety, readings)
                         comparisons.ts   curated comparison guides with understanding checks
                         index.ts         COMPONENTS, COMPONENT_BY_ID, PANEL_ENTRY_BY_ID (+ tests)
    instruments/       virtual instrument registry and shared safety precautions
    lessonCriteria.ts  completion criteria for lessons earned by doing (3D Lab and Library)
    models/            3D inverter model registry: lf3k.ts, sq1k.ts, index.ts
    badges.ts          9 badges (pure predicates over progress)
  types/               domain.ts (components, 3D models, procedures, circuits, simulation, faults), modules.ts, progress.ts
  engine/waveform/     waveforms.ts, scale.ts (+ tests)
  engine/circuit/      types, parts (20-part catalogue), topology (union-find nodes), solve (MNA), roles,
                       validate (fault rules), exercises (evaluators), edit (pure editing ops), build (+ tests)
  engine/simulation/ solar/ faults/    (Phases 5, 7, 9)
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
    build/ solar/ instruments/ repair/ assessments/   (Phases 5–10)
docs/ARCHITECTURE.md, docs/PHASE-2-PLAN.md, docs/PHASE-2-REPORT.md, docs/PHASE-3-REPORT.md
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

The simulator is educational, deterministic and physically grounded (quasi-steady-state, not SPICE). No random numbers are used for any electrical value.

| Layer | Model | Status |
|---|---|---|
| Waveforms | Ideal H-bridge: square, quasi-square (α), unipolar SPWM, ideal filtered sine, rectified. DFT harmonics, Parseval THD. Tested against closed forms. | Done (Phase 1) |
| Capacitor discharge | V(t) = V₀·e^(−t/RC), E = ½CV², I = V/R, P = V²/R, t_safe = RC·ln(V₀/50 V). Methods: built-in bleeder, 470 Ω/25 W and 2.2 kΩ/10 W tools, screwdriver (refused: peak current > 10 kA). Pulse capacity simplified as rated W × 5 s. | Done (Phase 2) |
| Operating point | R/RL load, transformer ratio, conduction + switching + magnetic losses, efficiency, I_dc. | Phase 5 |
| Thermal | T_j = T_amb + P_loss·ΣR_θ; fan failure raises R_θsa. | Phase 5 |
| Battery | Rint model, coulomb counting with Peukert correction, chemistry cut-offs. | Phase 5 |
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

## 9. Persistence and robustness

- Progress is a single `ProgressData` record (schema v1) in IndexedDB under `inverter-lab-progress`, kept in memory if storage is unavailable.
- `sanitizeProgress` validates every field on rehydration and on backup import, and upgrades older records (fields added in Phase 2 get defaults).
- `mergeProgress` combines stored data with anything recorded while IndexedDB was still loading (union of lists, latest visit times), so early actions are not lost.
- `newId` works in non-secure contexts (plain HTTP on a LAN IP).
- Without WebGL, the 3D lab shows a clear notice; the parts list, information panels and procedures still work.
- Saved circuits pass through `sanitizeDoc` (unknown parts, missing terminals, duplicate ids, non-finite or out-of-range values are dropped or clamped), so a damaged save cannot break the editor.

## 10. Safety design

- A permanent "Simulation environment" indicator; safety notices on every module.
- Guided disassembly enforces isolation and a verified discharge before any internal part can be touched, and explains every refused step.
- Unsafe methods (screwdriver discharge) are refused with the reason, never simulated as valid.
- Real-world caveats are stated where the model simplifies (dielectric absorption, bleeder failure, datasheet pin orders).
- Every test procedure begins with isolation (or is explicitly a qualified live measurement), and DC-bus parts require a verified discharge (enforced by tests).
- Circuit lab: practical exercises start with isolated, current-limited, low-voltage sources. Anything above 50 V DC or 25 V AC (source settings or solved node voltages) raises a hazardous-voltage warning and a "Simulated only" banner; battery short circuits, shoot-through, reverse-polarity electrolytics and over-rated parts are danger-level and block an exercise pass.

## 11. Roadmap

| Phase | Scope | Status |
|---|---|---|
| 1 | Foundation, navigation, dashboard, design system, progress persistence, waveform engine core | **Done, audited** |
| 2 | 3D inverter dissection laboratory: two models, 24 recognisable part types, 13-field panels, explode/hide/isolate, connection points, guided disassembly/reassembly, discharge simulation, identification challenge and asm-01, learner levels | **Done** (see PHASE-2-REPORT.md) |
| 3 | Searchable component library: catalogue, technical pages, pinouts, provenance-labelled specifications, virtual-instrument test procedures, comparisons, 3D links | **Done** (see PHASE-3-REPORT.md) |
| 4 | Circuit connection laboratory: schematic editor, 20 part types, connection graph, MNA solver, fault explanations, ten assessed exercises, saving | **Done** (see PHASE-4-REPORT.md) |
| 5 | Simulation engine (operating point, thermal, battery), Fundamentals lessons | Next |
| 6 | Build Your Own Inverter (eight projects) | |
| 7 | Solar and hybrid lab | |
| 8 | Virtual instruments bound to the simulation | |
| 9 | Repair workshop (17 scenarios) | |
| 10 | Assessments, projects, final integration | |

Gate for every phase: `npm run typecheck`, `npm test`, `npm run lint` (0 warnings) and `npm run build` pass; every route and control is smoke-tested in a browser (desktop, tablet, 390 px phone, plain-HTTP LAN access) with no console errors from app code; 3D rendering is checked with headless Chromium (SwiftShader WebGL 2); earlier phases are re-checked.

## 12. Known limitations after Phase 4

- Seven sections still show only their syllabus; their workspaces arrive in the phases above.
- Two of the ten badges and the project and troubleshooting counters depend on later phases (labelled in the UI).
- 3D parts are educational representations built from primitives: proportions and pinouts follow real packages, but surface detail is simplified.
- In the guided procedure, soldered parts are "removed" individually for inspection; in a real repair, boards are usually replaced as a unit (stated in the instructions).
- Discharge pulse capacity uses a simplified rated W × 5 s rule; the waveform bench still models an ideal bridge until Phase 5.
- Test-procedure readings are representative teaching values; interactive instruments connected to the simulation arrive in Phase 8.
- Circuit lab: DC and quasi-static AC only. Capacitors are open at DC and inductors are their winding resistance; switching transients, ripple waveforms, dead time, magnetic saturation and thermal effects are not simulated. RC curves are exponential responses calculated from the measured τ; filter ripple is the labelled approximation ΔV ≈ I/(2fC). Semiconductors are piecewise-linear. Wires are drawn with a simple orthogonal route and may cross parts.
- "Studied" means an entry or 3D panel was opened; reading depth is not measured.
- Progress and saved circuits are stored per browser; backup/restore and circuit export move them between devices.
