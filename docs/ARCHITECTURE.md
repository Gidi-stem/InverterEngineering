# Inverter Engineering Lab: Architecture and Roadmap

## 1. Environment

| Item | Version |
|---|---|
| Node.js | 22.23 |
| Vite | 8.3 |
| React / React DOM | 19.3 |
| TypeScript | 7.0 (`tsc -b`, strict bundler mode, `verbatimModuleSyntax`, `erasableSyntaxOnly`) |
| Three.js / React Three Fiber / Drei | installed for Phase 2 |
| Tailwind CSS | 4.3 (via `@tailwindcss/vite`) |
| Zustand | 5 (with `persist` middleware) |
| Persistence | IndexedDB via `idb-keyval`, with an in-memory fallback |
| Routing | `react-router-dom` `HashRouter`, so deep links work on any static host |
| Tests | Vitest |

Scripts: `npm run dev`, `npm run typecheck`, `npm test`, `npm run build`, `npm run preview`.

## 2. Architecture principles

1. **Engines are pure TypeScript.** Simulation, waveform and fault logic contain no React code, so they can be unit-tested and reused by every module. For example, the oscilloscope, the Build workshop and the Repair workshop all read the same engine.
2. **Content is data.** Modules, lessons, components, badges, fault scenarios and assessments live in `src/content/`. Navigation, routes, the dashboard and the pathway are generated from that data, so content is never duplicated in UI code.
3. **One progress store.** Every module records outcomes through actions on `useProgress`. The dashboard derives its numbers from that store using pure selectors (`summarise`).
4. **No fake functionality.** If a module's interactive workspace is not built yet, its page shows the final syllabus and states the phase that builds it. There are no dead buttons.
5. **Each feature is isolated.** Every feature folder owns its UI. An `ErrorBoundary` around the routed outlet keeps a failure in one section from blanking the rest of the app.

## 3. Folder structure

```
src/
  app/layout/          AppShell (sidebar, mobile drawer, simulation banner, error boundary)
  content/             modules.ts, componentCatalogue.ts, badges.ts
                       (later: components/, faults/, assessments/, projects/)
  types/               domain.ts (components, 3D models, circuits, simulation, faults)
                       modules.ts, progress.ts
  engine/
    waveform/          waveforms.ts (+ tests): ideal H-bridge waveforms and harmonic analysis
    simulation/        (Phase 5) operating-point solver: power, efficiency, thermal, battery
    circuit/           (Phase 4) netlist builder, connection validator, nodal DC solver
    solar/             (Phase 7) PV I–V model, MPPT, energy-flow dispatcher
    faults/            (Phase 9) fault injection: scenario → simulation overrides
  store/               progressStore.ts (Zustand + IndexedDB), selectors.ts (+ tests)
  ui/                  primitives (Panel, Button, Tag, Meter, SafetyNotice), Icon, ErrorBoundary
  features/
    dashboard/         DashboardPage, WaveformBench, ScopeTrace
    modules/           ModulePage (syllabus and overview for each section)
    progress/          ProgressPage, SimulationHistory
    lab3d/             (Phase 2) R3F scene, part models, explode/reassemble, info panel
    components/        (Phase 3) library, search/filter, compare, SVG symbol set
    circuit-lab/       (Phase 4) workbench canvas, wiring, exercises
    build/             (Phase 6) eight design projects
    solar/             (Phase 7) system builder, energy-flow diagram
    instruments/       (Phase 8) DMM, scope, clamp, continuity, PSU, load bank, freq, thermal
    repair/            (Phase 9) scenario runner, test bench, diagnosis form
    assessments/       (Phase 10) marked practicals
docs/ARCHITECTURE.md
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

## 6. Safety design

- A permanent "Simulation environment, modelled values" indicator in the header.
- Every module carries its own safety notices (stored-charge, PV-always-live, scope-ground, isolation).
- A low-voltage pathway (≤ 24 V, fused, isolated, current-limited bench supply) for physical practice under supervision.
- Unsafe configurations raise a danger-level `ConnectionIssue` and block a "working" result.

## 7. Roadmap

| Phase | Scope | Status |
|---|---|---|
| 1 | Foundation, navigation, dashboard, design system, progress persistence, waveform engine core | **Done** |
| 2 | 3D inverter: recognisable part models, orbit/zoom/pan, select/highlight, explode/reassemble, hide/isolate, board inspection, connection points, info panel | Next |
| 3 | Component library: 24+ entries, search/filter, compare view, SVG symbols | |
| 4 | Circuit lab: drag/drop, wiring, validator with explanations, DC solver, six guided exercises | |
| 5 | Simulation engine: operating point, thermal, battery, PWM, Fundamentals lessons | |
| 6 | Build Your Own Inverter: eight projects A–H | |
| 7 | Solar and hybrid lab | |
| 8 | Virtual instruments bound to the simulation | |
| 9 | Repair workshop: 17 scenarios | |
| 10 | Assessments, projects, final integration | |

Gate for every phase: `npm run typecheck`, `npm test` and `npm run build` pass; every route is smoke-tested in a browser with no console errors; existing features are re-checked.
