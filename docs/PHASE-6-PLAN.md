# Phase 6 Plan: Build Your Own Inverter (Interactive Engineering Construction Laboratory)

## 1. What is reused (no duplication)

| Existing system | Reused for |
|---|---|
| Component Library (24 entries, typical specs) | Every component role in a design refers to a library entry; selection pages link to it. Typical values are quoted from it, labelled "typical". |
| Circuit Connection Laboratory | The construction workspace **is** the circuit editor: same canvas, drag/drop, rotate, wiring, inspector, live checks, saving, undo. A project opens as a workspace (`/circuit-lab?ex=bld-a…h`) with a project panel and a parts kit. |
| Electrical Simulation Engine | The assembled circuit runs in Simulate mode unchanged. The engineering test suite runs the same `TransientSim` (in the worker) on load and supply variants of the student's own circuit. |
| 3D Dissection Laboratory | Each architecture stage links to the matching parts in the LF-3K / SQ-1K models (`/lab-3d?model=&part=`). |
| Progress architecture | `completedProjects` + lessons `bld-a…h`, activities, the existing "Inverter Designer" badge and the dashboard project counter. |

## 2. New engine capability (needed by the designs)

- **Centre-tapped transformer** (`transformer-ct`): a single-core coupled model with two primary halves and a secondary. It uses ampere-turn balance with two branch currents, plus winding resistance and magnetising inductance. Needed for push-pull (projects E, F).
- **Voltage sensor** (`vsense`): a high-impedance feedback point with a set-point (V rms).
- **Regulated SPWM** (generator mode 3): the modulation index is updated once per output cycle by an integral controller from the measured RMS at the sensor. Every regulated generator shares the controller, as one controller would drive all four gates. This gives feedback and regulation (project D) and a measurable line/load regulation test.
- **PV array** (`pv-array`): a simplified, labelled piecewise-linear I–V model (short-circuit current Isc up to the knee at 0.8·Voc, falling to zero at Voc). It prepares projects G and H; Phase 7 replaces it with the single-diode model and MPPT algorithm.

All new parts are supported by the netlist, topology checks and Phase 4 static analysis, with glyphs and inspector parameters.

## 3. Design engine (`src/engine/design/`, pure TypeScript, unit-tested)

- `types.ts`: `DesignSpec` covers DC input 12/24/48 V, output 110/230 V, 50/60 Hz, rated power, load (resistive or inductive with PF), topology, transformer configuration, switching frequency and waveform. Each project fixes or limits options.
- `calc.ts`: every result is an explained step: formula → substituted values → result → why, tagged `calculated` or `typical assumption`. It covers:
  - apparent power, output current and peak voltage;
  - DC input current (nominal and at low-battery cut-off) and conduction, switching, transformer and filter losses, giving efficiency;
  - transformer ratio and VA;
  - switch voltage/current requirements, dead time and gate drive;
  - LC filter (ripple-based L, corner-frequency C);
  - DC bus capacitor ripple;
  - fuse, breaker and low-voltage cut-off;
  - heat-sink thermal resistance required;
  - for solar/hybrid, PV array, MPPT window, charge current and transfer-switch rating.
- `compat.ts`: student component selections, as roles with generic ratings chosen from standard series. They are checked against the calculated requirements for voltage, current, switching characteristics, dissipation, thermal, topology, gate drive and protection. Every number is labelled **calculated**, **typical (library)**, **your selection (generic simulated part)** or **manufacturer data: not stored, confirm on the datasheet**.
- `generate.ts`: per project, the reference circuit is generated from the design and the selection. Its parts kit carries the selected ratings and calculated values, so the simulation reflects the student's choices. Board zones (input & protection, DC bus, power stage, control, output) are part of the generated layout.
- `assembly.ts`: assembly steps grouped by board/stage, verified on the connection graph. A requirement is a terminal-to-terminal connection or a series path through a symmetrical part, never placement. Instructions come in beginner, intermediate and advanced versions.
- `testing.ts`: the engineering test suite runs on the student's circuit and variants:
  - no load;
  - rated resistive load;
  - inductive load (series L inserted for the design PF);
  - overload (150 %) and short circuit;
  - low and high input voltage;
  - output regulation (no-load to full-load, and line);
  - efficiency;
  - thermal (T_j from simulated losses);
  - protection response (fuse/breaker I²t);
  - waveform quality (frequency, RMS, THD, crest factor).

  Each test returns measured results, a pass/fail criterion and an explanation.

## 4. Eight projects (`src/content/buildProjects.ts`)

| | Project | Architecture (simulated circuit) |
|---|---|---|
| A | Basic DC-to-AC inverter | Battery → fuse → MOSFET H-bridge at 50/60 Hz → low-voltage AC lamp (no transformer). |
| B | Square-wave inverter | + DC bus capacitor + LF step-up transformer to 110/230 V (simulated only). |
| C | Modified sine-wave inverter | Phase-shifted legs (α = 90° gives the sine's peak and RMS) + LF transformer. |
| D | Pure sine-wave inverter (in depth) | DC input & bus → gate drivers with dead time → H-bridge → regulated SPWM → LC filter (primary L, secondary C) → transformer → voltage feedback → output breaker. Scope presets relate V_GS, bridge voltage and filtered output. |
| E | Transformer-based (push-pull) inverter | Centre-tapped LF transformer with two low-side MOSFETs; isolation and earthing; switch stress 2·V_dc. |
| F | High-frequency inverter | Push-pull DC-DC at kHz through a ferrite CT transformer → fast-diode bridge → HV DC bus with bleeder (capacitor discharge) → HV H-bridge SPWM → LC filter. |
| G | Solar inverter | PV array → MPPT buck stage (duty set by the student, simulated) → battery → SPWM inverter + transformer. Energy paths PV→battery, battery→load. Automatic MPPT arrives in Phase 7. |
| H | Hybrid inverter | Grid and generator inputs, transfer relays, charger path (step-down, rectifier, current limit), battery inverter path and AC output. The energy paths diagram covers grid→load, grid→battery, battery→load and generator→load, with PV input reserved for Phase 7. |

Each project has learning objectives, required components (library roles), an architecture/energy-path diagram, assembly procedure, three architecture questions, a troubleshooting task, the configurator options it allows, and safety notes.

## 5. UI

- `/build`: project catalogue with architecture diagrams, levels, objectives and status, opening the construction workspace.
- In the Circuit Lab, a project workspace adds a **Project** tab with steps:
  1. Design (configurator + explained calculations).
  2. Components (selection + compatibility, with library links).
  3. Assembly (diagram, parts kit, stage-by-stage steps verified live, level-dependent instructions; beginner starts with parts placed on the boards).
  4. Tests (run the suite in the worker; engineering report).
  5. Assessment.

  Board zones are drawn on the canvas. The kit replaces the toolbox and places parts with their design values.

## 6. Assessment and completion

The criteria are:
- component selection (all compatibility checks pass);
- electrical connections (every assembly step verified, no danger issues);
- architecture understanding (questions);
- simulation results (required tests pass);
- protection design (protection checks and protection test);
- troubleshooting (diagnose a simulated fault injected into a copy of the student's circuit);
- final engineering performance (efficiency, regulation and THD thresholds).

Beginner, intermediate and advanced tasks require progressively more criteria and less guidance. Completion is recorded only when the required criteria pass on the circuit as built; placement alone never completes a project.

## 7. Safety

- Mains-voltage outputs and HV DC buses are simulated only, with a banner.
- Designs include isolation (transformer), DC and AC overcurrent protection, a bus bleeder or discharge, PE/earthing guidance, and thermal limits.
- Every design screen states that it is an educational estimate, not a certified construction design.

## 8. Tests

- Design calculations against hand-calculated values.
- Compatibility rules, including each pass and fail aspect.
- Assembly step verification: the reference passes, a missing or wrong connection fails, and symmetric parts are accepted either way round.
- Circuit integration: every generated circuit compiles, has no danger issues and simulates.
- Simulation results for every project: frequency, RMS, regulation and protection.
- New models: CT transformer, regulator, PV.
- The full browser regression for Phases 1–6.

## 9. Addendum: educational curriculum requirement (received during Phase 6)

The product direction changed during Phase 6: the platform must be a complete, structured engineering learning programme, and the existing tools must become teaching resources. The plan was extended as follows (full specification in `CURRICULUM-BLUEPRINT.md`):

1. **Master Curriculum and Competency Blueprint first.**
   - 15 courses in three stages (Foundation, Practitioner, Specialist), each mapped to modules, lessons, tools and prerequisites.
   - The 14-section lesson standard.
   - The assessment framework: checks, quizzes, assignments, practicals, examinations, competency.
   - 14 competency units, plus a gap analysis of Phases 1–5.
   - A proposed fourteen-phase delivery plan.
2. **Learning Academy framework in Phase 6:**
   - catalogue, enrolment and prerequisites;
   - the lesson renderer with glossary, diagrams and interactive demonstrations;
   - knowledge checks, quizzes, assignments, practicals verified by the tools, and a timed examination;
   - attempt history and competency record, included in the progress backup.
3. **Course S1 Inverter Design and Construction fully authored**, because it teaches this phase's projects:
   - 20 lessons, 6 module quizzes, 6 assignments, 14 practical tasks and a 20-question examination;
   - each project's lesson precedes its build;
   - the pure-sine inverter has its own six-lesson module.
4. **The other courses** appear with their syllabus as "scheduled"; there are no placeholder lessons.
5. **The build projects integrate with S1:**
   - projects, compatibility confirmation and troubleshooting are the S1 practical tasks;
   - the build page and every lesson link to each other.
6. **Existing functionality is unchanged.** Existing lesson ids keep their criteria; academy lessons reference them through `legacyId`.
