# Inverter Engineering Lab: Architecture and Roadmap

## 1. Environment

| Item | Version |
|---|---|
| Node.js | 22.23 |
| Vite / @vitejs/plugin-react | 8.3 / 6.3 |
| React / React DOM | 19.3 |
| TypeScript | 7.0 (`tsc -b`, strict bundler mode, `verbatimModuleSyntax`, `erasableSyntaxOnly`) |
| Three.js / React Three Fiber / Drei | 0.187 / 9.8 / 10.7. Installed, not yet imported (Phase 2) |
| Tailwind CSS | 4.3 (via `@tailwindcss/vite`) |
| Zustand | 5.1 (with `persist` middleware) |
| Persistence | IndexedDB via `idb-keyval`, with an in-memory fallback; every load is validated (see §6) |
| Routing | `react-router-dom` `HashRouter`, so deep links work on any static host |
| Tests / lint | Vitest 5.1 (15 tests) / oxlint 1.9 (0 warnings) |

Scripts: `npm run dev`, `npm run typecheck`, `npm test`, `npm run lint`, `npm run build`, `npm run preview`.

## 2. Architecture principles

1. **Engines are pure TypeScript.** Simulation, waveform and fault logic contain no React code, so they can be unit-tested and reused by every module. For example, the oscilloscope, the Build workshop and the Repair workshop all read the same engine.
2. **Content is data.** Modules, lessons, components, badges, fault scenarios and assessments live in `src/content/`. Navigation, routes, the dashboard and the pathway are generated from that data, so content is never duplicated in UI code.
3. **One progress store.** Modules record outcomes through actions on `useProgress`. The dashboard derives its numbers from that store using pure selectors (`summarise`). Phase 1 actions: `visitModule`, `recordSimulationRun`, `clearSimulationHistory`, `resetProgress` and `importProgress`. Later phases add `completeLesson`, `identifyComponent`, `completeExercise`, `completeProject`, `recordAssessment` and `recordDiagnosis`; the data fields for them already exist.
4. **No fake functionality.** If a module's interactive workspace is not built yet, its page shows the final syllabus and states the phase that builds it. There are no dead buttons.
5. **Each feature is isolated.** Every feature folder owns its UI. An `ErrorBoundary` around the routed outlet keeps a failure in one section from blanking the rest of the app.

## 3. Folder structure

Items marked *(Phase N)* do not exist yet; everything else is in the repository now.

```
src/
  app/layout/          AppShell: sidebar, mobile drawer (Escape + focus handling), simulation banner, per-route ErrorBoundary
  content/             modules.ts (12 sections, 59 lessons), componentCatalogue.ts (24 parts), badges.ts (8)
                       (Phase 2+) components/, models/, faults/, assessments/, projects/
  types/               domain.ts, modules.ts, progress.ts
  engine/
    waveform/          waveforms.ts (+ tests): ideal H-bridge waveforms and harmonic analysis
                       scale.ts: 1-2-5 scope scale steps
    simulation/        (Phase 5) operating-point solver: power, efficiency, thermal, battery
    circuit/           (Phase 4) netlist builder, connection validator, nodal DC solver
    solar/             (Phase 7) PV I–V model, MPPT, energy-flow dispatcher
    faults/            (Phase 9) fault injection: scenario → simulation overrides
  store/               progressStore.ts (Zustand + IndexedDB), selectors.ts, sanitize.ts, id.ts (+ tests)
  ui/                  primitives (Panel, Button, Tag, Meter, SafetyNotice), Icon, ErrorBoundary
  features/
    dashboard/         DashboardPage, WaveformBench, ScopeTrace
    modules/           ModulePage (syllabus/overview used by the 10 sections not yet interactive)
    progress/          ProgressPage, SimulationHistory
    lab3d/             (Phase 2) see docs/PHASE-2-PLAN.md
    components/        (Phase 3) library, search/filter, compare
    circuit-lab/       (Phase 4) workbench canvas, wiring, exercises
    build/             (Phase 6) eight design projects
    solar/             (Phase 7) system builder, energy-flow diagram
    instruments/       (Phase 8) DMM, scope, clamp, continuity, PSU, load bank, freq, thermal
    repair/            (Phase 9) scenario runner, test bench, diagnosis form
    assessments/       (Phase 10) marked practicals
docs/ARCHITECTURE.md, docs/PHASE-2-PLAN.md
```

## 4. Data models (`src/types/domain.ts`)

- **ElectronicComponent**: id, category (nine library categories), symbol key, function, operating principle, applications, terminals (pin label and role), input/output behaviour, failure symptoms, test method, replacement notes, safety, related ids, typical specs. Each entry supplies the 13 fields of the component information panel.
- **InverterModel / ModelPart**: topology, rating, DC bus, output voltage and frequency. Each part has a position, an exploded-view offset, the assembly it belongs to and its 3D connection points.
- **Circuit / PlacedComponent / Wire / ConnectionIssue**: the circuit-lab netlist. A `ConnectionIssue` carries an educational *explanation* and a *fix*, not just an error code.
- **SimulationParams / Measurements / SimulationRun**: all simulator inputs and outputs (DC V/A, AC V/A, Hz, W, VA, PF, efficiency, temperature, SoC, THD). Runs are stored in progress for the history view.
- **FaultScenario / DiagnosisAttempt**: symptom, faulty section and part, simulation `effects` that create the observable behaviour, explanation, repair and hints. The solution is only shown after the student submits a diagnosis or asks for help.
- **ProgressData / Badge**: lessons, exercises, projects, identified components, assessment results, diagnoses, simulation runs and module visits. Each badge is a pure predicate over progress.

## 5. Simulation strategy

The simulator is educational, deterministic and physically grounded. It is quasi-steady-state, not SPICE.

| Layer | Model |
|---|---|
| Waveforms (live) | Ideal H-bridge output: square, quasi-square with conduction angle α, unipolar SPWM, ideal filtered sine, full-wave rectified. Harmonics come from a DFT; THD uses Parseval's theorem. Unit-tested against closed-form results: square THD 48.3 %, 120° modified sine THD 31.1 %, SPWM fundamental = m·Vdc. |
| Operating point (Phase 5) | Load modelled as R or RL from P and PF. AC Vrms comes from the waveform engine and the transformer ratio. P_out = V·I·PF and S = V·I. Losses are switching conduction I²R_ds(on), switching energy × f_sw, transformer core and copper, and fixed control overhead. η = P_out / (P_out + losses). I_dc = P_in / V_dc. |
| Thermal | First-order RC: T_j = T_amb + P_loss·(R_θjc + R_θcs + R_θsa(fan)). Fan failure raises R_θsa, so over-temperature emerges naturally from the model. |
| Battery | Rint model: V = OCV(SoC) − I·R_int. SoC is integrated by coulomb counting with a Peukert correction. There are low-voltage cutoff thresholds per chemistry. |
| Circuit lab (Phase 4) | Netlist graph, then a validator that flags shorts, reverse polarity, shoot-through, floating gates, missing fuse and missing earth, then modified nodal analysis for DC operating points. Switching devices are modelled as ideal or R_on switches. Unsafe circuits are never shown as working designs. |
| Solar (Phase 7) | Single-diode PV model scaled by irradiance and temperature. MPPT uses perturb-and-observe on that curve; PWM charging clamps PV to battery voltage. A priority dispatcher handles PV → load → battery → grid/generator, with transfer-switch logic. |
| Faults (Phase 9) | Each scenario applies parameter overrides (for example an open MOSFET leg, raised ESR, a stalled fan or a sensor offset). Instruments read the faulted simulation, so the evidence is physically consistent. |

No random numbers are used. Model assumptions are shown in the UI next to every result.

## 6. Persistence and robustness

- Progress is a single `ProgressData` record (schema v1) in IndexedDB under `inverter-lab-progress`. If storage is unavailable (private mode, sandboxed frame) it is kept in memory for the session.
- `sanitizeProgress` validates every field on rehydration and on backup import. Malformed entries are dropped and missing fields are filled in, so a corrupted or hand-edited record can never crash the app.
- `newId` falls back to `crypto.getRandomValues` where `crypto.randomUUID` is missing (plain HTTP on a LAN IP, a common classroom setup).
- Each route renders inside its own `ErrorBoundary`, so one failing section leaves navigation working.

## 7. Safety design

- A permanent "Simulation environment, modelled values" indicator in the header.
- Every module carries its own safety notices (stored-charge, PV-always-live, scope-ground, isolation).
- A low-voltage pathway (≤ 24 V, fused, isolated, current-limited bench supply) for physical practice under supervision.
- Unsafe configurations raise a danger-level `ConnectionIssue` and block a "working" result.

## 8. Roadmap

| Phase | Scope | Status |
|---|---|---|
| 1 | Foundation, navigation, dashboard, design system, progress persistence, waveform engine core | **Done, audited** |
| 2 | 3D inverter: recognisable part models, orbit/zoom/pan, select/highlight, explode/reassemble, hide/isolate, board inspection, connection points, info panel (see PHASE-2-PLAN.md) | Next |
| 3 | Component library: 24+ entries, search/filter, compare view, SVG symbols | |
| 4 | Circuit lab: drag/drop, wiring, validator with explanations, DC solver, six guided exercises | |
| 5 | Simulation engine: operating point, thermal, battery, PWM, Fundamentals lessons | |
| 6 | Build Your Own Inverter: eight projects A–H | |
| 7 | Solar and hybrid lab | |
| 8 | Virtual instruments bound to the simulation | |
| 9 | Repair workshop: 17 scenarios | |
| 10 | Assessments, projects, final integration | |

Gate for every phase: `npm run typecheck`, `npm test`, `npm run lint` (0 warnings) and `npm run build` pass; every route and control is smoke-tested in a browser (desktop, 390 px phone, and plain-HTTP LAN access) with no console errors from app code; existing features are re-checked.

## 9. Known limitations after Phase 1

- Ten of the twelve sections show their final syllabus only; their interactive workspaces arrive in the phases listed above. Lessons cannot be marked complete until that content exists.
- Five of the eight badges, and the exercise, project, assessment, troubleshooting and component counters, depend on later phases. The UI labels each with the phase that makes it earnable.
- The waveform bench models an ideal bridge (no dead-time, losses or bus ripple). Those effects are added by the Phase 5 simulation engine.
- Progress is stored per browser; moving to another device needs the backup/restore feature.
