# Phase 7 report: F1/F2, prerequisite gates, and the Solar and Hybrid Engineering Laboratory

Baseline: Phase 6 (approved). You approved Phase 7 with this sequence: (1) update the master curriculum and competency blueprint; (2) complete F1 and F2 as fully developed courses; (3) implement prerequisite enforcement; (4) verify that their examinations and practical assessments work; (5) proceed with the solar and hybrid engineering laboratory. This report follows that order. Nothing below is reported as done without a test or a browser check behind it.

## 1. Curriculum and competency blueprint

`docs/CURRICULUM-BLUEPRINT.md` now carries the fourteen-phase roadmap you approved: the original ten phases retained, plus Phase 11 (Battery Engineering and Energy Storage), Phase 12 (Installation and Commissioning), Phase 13 (Advanced Diagnostics and Professional Repair) and Phase 14 (Maintenance, Standards and Professional Practice), with every one of the fifteen courses (F1–F5, P1–P5, S1–S5) mapped to the phase that authors it. F1 and F2 are marked mandatory prerequisites: F1 before any practical electrical activity, F2 before DC circuit construction, battery engineering and solar/battery practicals (with F2's own practicals — `ckt-01`–`ckt-03`, `sim-01`, `sim-02` — needing F1 only, so F2 is never locked behind itself).

## 2. F1 and F2: fully developed courses

| Requirement | Delivered |
|---|---|
| **F1 Electrical Safety and Fundamentals** | 4 modules, 12 lessons: shock physiology and PPE; hazard identification; safe isolation, lock-out/tag-out and proving dead (including a borrowed-neutral prove-dead drill); protection, earthing/bonding/RCDs/insulation, and workshop practice. 4 practicals, one of each task kind: an isolation sequence, a prove-dead procedure, a hazard-identification bench and a stored-energy/fault-current calculation. Examination: pass 80 %, 45 minutes, 3 attempts/24 h cool-down. |
| **F2 DC Electrical Systems and Fundamentals** | 5 modules, 14 lessons: charge/current/voltage; resistance, Ohm's law and power; series/parallel circuits and Kirchhoff's laws; RC and RL time constants; DC sources, wiring, polarity, diodes and LEDs. Practicals mix new calculation tasks with the course's own existing circuit-lab and simulator exercises (`ckt-01`, `ckt-02`, `ckt-03`, `sim-01`, `sim-02`), so no laboratory time is duplicated. Examination: pass 70 %, 60 minutes, 3 attempts/24 h cool-down. |
| **No shallow placeholders** | Every lesson meets the Phase 6 lesson standard (14 sections, minimum depth) and links to a real tool: the foundation diagrams and demonstrations added this phase (Ohm's law, voltage divider, RC/RL exponential curves, body-current path, capacitor discharge, voltage drop, battery internal resistance) are computed from the same formulas the engine uses elsewhere, not drawn by hand. |
| **Practical activities connected to real tools** | F2's circuit-lab and simulator links are to the existing, already-tested exercises; nothing new was built in those laboratories to support F2. |

## 3. Prerequisite enforcement (gates)

`content/academy/gates.ts` adds a `PracticalArea` (`circuit`, `build`, `solar`, `lab3d-procedure`) to `requiredCourses()`/`gateStatus()`:

- **F1 only** gates the 3D lab's guided disassembly/reassembly procedure, and F2's own circuit-lab/simulator exercises.
- **F1 and F2 together** gate the Build laboratory, every other circuit-lab exercise, and the new Solar laboratory.
- Reading the Component Library, exploring the 3D models (outside the guided procedure) and studying lessons are never gated, as before.

`<GateNotice>` is the shared closed-state UI (used by the circuit lab, the 3D lab and the Solar lab); the Build lab shows a non-blocking notice instead and still lists its projects, since each project's prerequisite is enforced where it opens in the circuit lab. A new, shared `<TaskRunner>`/`markTask()` engine strictly marks the four practical-task kinds (sequence, hazards, procedure, calc) with no partial credit — every failure mode (a distractor, a missing or misordered step, an extra or missing hazard, an unsafe action, a wrong conclusion, any wrong answer) is enforced and tested.

## 4. Verification of F1/F2 examinations and practical assessments

Unit tests exercise every failure mode of `markTask()` per task kind, a "perfect response passes every task" check, the full gate matrix (which course(s) open which area, including the F1-only/F2-own-exercises exception), and that F1 and F2 are not credited complete without their practicals and examination both passed.

A qualified-learner browser pass (Playwright, with a pre-built "F1 and F2 both complete" IndexedDB progress record injected, matching the schema `sanitizeProgress` accepts) then confirmed this in the running app: a fresh learner sees F1/F2 open and S1/S2/the Build lab/the circuit lab's gated exercises/the Solar lab/the 3D disassembly procedure all correctly closed with the right missing-course links; the F1 isolation sequence, prove-dead procedure (including the unsafe-touch failure and the engine-generated proving-unit readings) and stored-energy calculation all pass and fail correctly through the live UI; a qualified learner sees every one of those areas open.

## 5. Solar and Hybrid Engineering Laboratory (Phase 7 main deliverable)

### Solar engine (`engine/solar/`, UI-independent, unit-tested on its own)

- **PV model** (`pv.ts`): single-diode model fitted by bisection to datasheet V_oc/I_sc/V_mp/I_mp, with temperature coefficients and NOCT-based cell temperature; `arrayCurve()` composes series/parallel strings with per-module irradiance (partial shading) and bypass diodes; `perturbObserve()` is a genuine perturb-and-observe tracker, including its real failure mode (settling on a local peak under shading); `pwmOperating()` models a PWM controller clamping array voltage to the battery.
- **Sizing** (`sizing.ts`): `sizeSystem()` runs the complete method from an electrical load profile to a finished installation — load profile → daily energy/peak/surge → inverter → system voltage → battery bank (autonomy, depth of discharge, round-trip efficiency) → PV array (temperature/soiling/wiring/mismatch derates, string-voltage window from cold V_oc and hot V_mp) → charge controller → cables (voltage-drop sizing) → protection (1.25×/1.56× fusing) → generator (start/stop state-of-charge thresholds with hysteresis above the low-voltage disconnect). Every number is returned with its formula, worked substitution and rationale, flagged as calculated, a typical assumption or a user-selected value — none is a bare result.
- **Dispatch** (`dispatch.ts`): multi-day, 10-minute-step clear-sky simulation with off-grid/grid-tied/hybrid dispatch priorities, anti-islanding and generator auto-start/stop.
- **Faults and commissioning** (`faults.ts`, `commissioning.ts`): ten troubleshooting scenarios and a predict/measure/compare commissioning workflow, both generated from the same PV/sizing engine as the learner's own design, so readings are internally consistent.
- Example PV modules and presets are explicitly tagged `source: 'illustrative'` and labelled as such everywhere they appear; no manufacturer datasheet value is invented, consistent with the standing constraint.

### Solar laboratory UI (`features/solar/`, `/solar`, gated by F1+F2)

Five tabs: **System design** (editable load table with a 14-appliance library, site/system/battery/module/cable configuration, a fully explained, grouped calculation list, a downloadable Markdown design report, and "record this design" once no danger-level issue remains); **PV I–V laboratory** (interactive tracer — series/strings/irradiance/temperature/per-module shading/PWM battery-voltage controls — with a rotating prediction task checked against the live engine, tolerant to 3 % on V/I and 5 % on P); **Energy management** (1–3 day dispatch simulation with per-day weather and an optional outage); **Troubleshooting** (ten scenarios, readings generated by the fault engine, graded diagnosis with the fix explained once solved); **Commissioning** (predict, then compare against measured values from an as-built model that can carry an injectable practice fault — reversed string, undervoltage string, failed insulation — with recording gated on both correct predictions and a healthy as-built system).

### S2 Solar and Hybrid Engineering (course)

5 modules, 15 lessons (photovoltaic fundamentals; arrays/controllers/conversion; system design from a load profile; system types and energy management; installation, commissioning and troubleshooting). Prerequisites F1+F2; recommended S1+P5. Practicals are evidenced by the laboratory's own recorded activities (a completed design, a correct I–V prediction, a run simulation, four distinct fault diagnoses, a passed commissioning record) plus hand-worked sizing and commissioning-sequence assessments, so "students must be able to calculate the requirements for a complete solar installation based on an actual electrical load profile" is assessed directly, not just read about. Examination: pass 70 %, 75 minutes, 3 attempts/24 h cool-down.

Students can now take a real electrical load profile (the design tab's load table, or their own figures) all the way through to a sized inverter, battery bank, PV array, string configuration, controller, cable set and protection, with every step's formula and working shown, and then test that same design against the I–V, energy-management, fault and commissioning laboratories.

## 6. Problems found and fixed during the phase

1. **A teaching error of my own** (THD, carried forward as a lesson learned from Phase 6): re-checked; not repeated here.
2. **Single-step worked examples.** A handful of F1/F2 lesson examples had only one step, failing the lesson-standard minimum. Fixed by adding the missing formula-statement step to each.
3. **Two broken library links** and **one wrong procedure id** in F1 lessons (an enclosure link pointed at the wrong lookup table; a fuse-test procedure link used a nonexistent id). Fixed to the correct `lab3d`/`procedure` targets.
4. **PV sizing hand-check mismatch.** My first sizing-method test expected a 4×1 array; the method's own string-window logic correctly preferred 2×2 (lower string voltage, two parallel strings) for that preset. The test's expectation was wrong, not the method; corrected the test.
5. **Generator never starting in the `clinic-hybrid` preset.** Its low-voltage disconnect was shedding load before the generator's start threshold was reached. Raised the generator start threshold above the lead-acid LVD and corrected an unrelated controller-voltage preset value found in the same pass.
6. **Hybrid preset never showing a grid export.** Its battery was sized too small ever to have surplus to export; raised to a storage size for which exporting is physically possible, which is also the more realistic sizing for that preset's stated use case.
7. **An oxlint `jsx-key` warning** on an array literal inside a demonstration component. Fixed by keying the element.
8. **Calculation-task completion UI.** My first qualified-learner browser script assumed every task kind reported pass/fail through the same element; calculation tasks (routed through the existing `QuestionSet` component) report their own score banner instead. No application code was wrong — the check was corrected to read the right element.

## 7. Verification

| Check | Result |
|---|---|
| TypeScript (`tsc -b`) | Pass |
| Lint (`oxlint --max-warnings 0`) | Pass, 0 warnings |
| Unit and integration tests | **343 passed** (Phase 6 baseline 270). New: F1/F2 lesson-standard and content tests; practical-task and gate tests (every failure mode per task kind, the full gate matrix, F1/F2 completion requiring practicals and exam); 20 solar-engine tests (PV model accuracy against hand-calculated datasheet points, sizing hand-checks, dispatch totals, fault scenarios, commissioning). |
| Production build | Pass. The main entry bundle is unchanged (≈333 kB before and after). Academy content and the solar lab are lazy chunks; the shared `logic.ts` chunk (course catalogue + marking rules) grew from ≈245 kB to ≈670 kB because it now carries F1/F2/S2's full content as well — flagged in ARCHITECTURE §14 as worth splitting before Phases 11–14 add the remaining eleven courses, but out of scope for this phase's approved sequence. |
| Qualified-learner browser pass (new, this phase) | **50/50**: every gate (open/closed, correct missing-course links) across the circuit lab, build lab, 3D lab procedure, and solar lab; F1's four practical tasks exercised live (sequence, prove-dead procedure with its unsafe-action and wrong-conclusion failure modes, hazard bench, stored-energy calculation); S2 and the gated circuit-lab exercise open for a qualified learner; all five solar-lab tabs exercised end-to-end (design summary and report against a hand-checkable preset, live calculation list, load-profile editing, I–V tracer and shading, a rejected-then-accepted prediction, an energy simulation recorded, a fault correctly diagnosed, a commissioning record rejected-then-accepted and a reversed-string practice fault detected); S2 lesson rendering; no console errors; no horizontal overflow at a 390 px phone viewport across nine Academy/solar routes. |
| Phase 1–6 regression | Circuit editor `ckt` 47/47; simulator `sim` 28/28; `lib`, `flow`, `resp`, `phone`, `phone5`, `phone6` as before; `hits` 36/41 (Phase 2 baseline, unrelated to this phase); `bld` 37/37 after updating one assertion's expected scheduled-course count (14 → 11, since F1/F2/S2 are now published rather than scheduled); `audit3`: all routes including `/solar`, no overflow, dashboard and mobile-drawer behaviour unchanged, only the expected LAN dev-server WebSocket refusals in the console. |

## 8. Known limitations

These are listed in ARCHITECTURE §14 and labelled in the UI.

**Learning Academy** — F1, F2, S1 and S2 are authored and published; the other eleven courses remain scheduled.

**Solar laboratory** — an educational estimate with typical allowances, not a certified design; illustrative module/component values are labelled throughout and never presented as manufacturer datasheets; the dispatch simulation is clear-sky with a per-day weather scaling factor, not a real weather dataset; the P&O MPPT demonstration can settle on a local peak under partial shading, which is the real algorithm's known behaviour and a teaching point, not a defect.

**Code splitting** — the `logic.ts` chunk now bundles every authored course's content (≈670 kB); worth splitting before the remaining eleven courses are authored (Phases 8–14).

Build-lab limitations (PV array model, hybrid charger, relays, manual MPPT duty, etc.) are unchanged from Phase 6 and listed in ARCHITECTURE §14; nothing in those projects was touched this phase.

## 9. Decisions needed from you

None required to proceed. Phase 8 (virtual instruments bound to the simulation, plus F5 and S4.M1) is next per the roadmap, and will not begin without your explicit approval.
