# Phase 8 report: Virtual Instruments and Measurement Engineering

Baseline: Phase 7 (approved, commit `322a901`), plus a follow-up course-lazy-loading implementation approved before Phase 8 began. This report covers Phase 8 as authorised: "AUTHORISATION: PHASE 8 — VIRTUAL INSTRUMENTS AND MEASUREMENT ENGINEERING". Nothing below is reported as done without a test, a build, or a worked calculation behind it.

## 1. Scope resolution

The authorisation text named "F5 and S4.M1" as the courses this phase authors. `docs/CURRICULUM-BLUEPRINT.md`'s own approved delivery plan (§8, the table every phase follows) assigns Phase 8 to **F3 and F5**; S4 is assigned to Phase 13, after P4 and S1 (its own prerequisites) exist. This discrepancy was raised before any authoring began, and the answer was explicit: **"F3 + F5, per the blueprint."** Phase 8 therefore authored F3 (AC Electrical Fundamentals) and F5 (Measurement and Virtual Instruments) in full. S4 was not touched and remains scheduled for Phase 13.

## 2. Eight virtual instruments, with genuine measurement physics

| Instrument | Engine (`engine/instruments/`) | What it actually measures |
|---|---|---|
| Oscilloscope | `scope.ts` | Calls the real Phase 5 transient-engine waveform function (`engine/waveform/waveforms.ts`'s `instantaneous(kind, params, t)`) directly, then derives RMS, peak, peak-to-peak, average, period, frequency and duty cycle by dense sampling — not a canned trace. |
| Digital multimeter | `dmm.ts` | Voltage/current/resistance/continuity on realistic preset scenarios; a true diode-test mode (`DIODE_TEST_CASES`) with forward/reverse behaviour; the full meter-port-error consequence (voltage function with probes in the current sockets is a near-short through the meter; current function with probes in the VΩ sockets reads near zero) is simulated, not just described. |
| Clamp meter | `clamp.ts` | Magnetic-sensing current reading on preset scenarios, including the "clamp both conductors together → near-zero, misleading" fault and inrush-current behaviour. |
| ESR meter | `esrLcr.ts` (ESR mode) | Reuses the Phase 3 component library's real `TEST_PROCEDURES` reference values (`content/components/testing.ts`) as ground truth — not a second, invented set of numbers. |
| LCR meter | `esrLcr.ts` (LCR mode) | Same real reference values; computes impedance Z = √(R² + X²) from the component's reactance at the chosen test frequency and its ESR/DCR, so Z genuinely varies with test frequency as the underlying physics (F3.M2) predicts. |
| Battery tester / capacity analyser | `battery.ts` | A real equivalent-circuit model: V_loaded = OCV(SoC) − I·R_int, with chemistry-specific OCV curves (lead-acid linear, LiFePO4 flat-plateau) and a coulomb-counting capacity-test simulation — parameter-driven physics, not fabricated readings. |
| Insulation resistance tester | `insulation.ts` | Explicitly **simulation and safety-instruction only** per the authorisation's safety requirement. The UI gates the simulated measurement behind an explicit, checked-off safety-procedure checklist (isolate, verify, discharge, confirm no one else is working on the circuit) rather than a passive disclaimer — the safety discipline itself is the interactive content. |
| Component tester | `componentTester.ts` | Wraps the same real `TEST_PROCEDURES` the library already uses, so a diode/capacitor/resistor "test" in this instrument and a "test procedure" read in the Component Library agree with each other by construction. |

Each instrument has its own panel (`features/instruments/*Panel.tsx`), its own operating instructions, measurement modes and controls, and realistic scenarios with guided exercises, routed through the new `/instruments/*` lazy-loaded route (`InstrumentsLabPage.tsx`), gated like every other practical area (`gates.ts` gained a `PracticalArea = 'instrument'`).

**No superficial dashboard.** Every instrument's reading is computed from a real model or a real reference table, not drawn from a static lookup keyed only on "which button did the student press". Faults (meter port errors, failed-open bridge diodes, a shorted or open capacitor, an aged battery pack) produce their actual characteristic symptom, not a scripted message.

## 3. Integration achieved versus simplified (stated honestly, as required)

- **Oscilloscope ↔ Phase 5 simulation engine**: full, direct integration — same waveform function, not a re-implementation.
- **ESR/LCR/component tester ↔ Phase 3 component library**: full, direct integration — same reference values.
- **DMM and clamp meter**: realistic, internally Ohm's-law-consistent **preset scenarios**, not a live bridge to the student's own saved circuit-lab document. Building that bridge (resolving an arbitrary saved circuit document to a probe position and computing a live reading) was judged too large an integration for this phase; the authorisation explicitly allows a clearly identified educational approximation where full integration is not technically feasible, and this is flagged here rather than silently built around.
- **Battery tester ↔ S2's battery/solar curriculum**: a genuine, parameter-driven equivalent-circuit model, in the spirit of "connect to the existing battery engineering curriculum" — but not a live read of S2's own solar-lab battery state. A deep live integration with S2's specific battery/solar engine code was judged out of scope for this phase and is flagged as a simplification to revisit if a later phase needs it.
- **Insulation tester**: deliberately simulation-only, as required; no live integration was sought or implied.

## 4. F3 AC Electrical Fundamentals — fully authored

5 modules, 19 lessons, matching `catalogue.ts`'s pre-existing scheduled syllabus exactly (no course codes, titles or prerequisites invented): Alternating quantities (4) · Reactance and impedance (4) · AC power (4) · Transformers (4) · Rectification (3). `prerequisites: ['F2']`, `competency: 'CU-03'`, course exam (pass 80%, 50 min, 3 attempts/24h cool-down). Every lesson meets the full 14-section lesson standard at the same depth as F1/F2/S1/S2/F5 (objectives, introduction, lecture >1500 chars, technical >400 chars, ≥1 diagram, ≥1 formula, ≥2 worked examples each with ≥2 steps, applications, ≥3 mistakes, a real tool link, ≥3 check questions, ≥4 summary points, ≥2 homework items).

**★-marked activity links honoured where real:** F3.M3.L4 links `sim-08` (H-bridge/inductive load, energy returned to the supply), F3.M4.L4 links `ckt-07` (transformer connection exercise), F3.M5.L2 links `sim-03` + `ckt-04` (bridge rectifier), F3.M5.L3 links `sim-04` + `ckt-05` (DC filtering/ripple) — all real, pre-existing simulator experiments and circuit-lab exercises, reused rather than recreated.

**A blueprint gap found and documented, not worked around.** The blueprint also marks F3.M1.L1, F3.M3.L1 and F3.M3.L3 as reusing `fun-01`, `fun-06` and `fun-05` — lessons in the separate, standalone Fundamentals module (`content/modules.ts`/`fundamentalsCriteria.ts`). No course authored before this phase (F1, F2, S1, S2) has ever linked into a `fun-*` lesson, and the `ToolLink` union / `linkExists()` has no case for one — this cross-reference was a planning-document note, not built infrastructure. Building a new `ToolLink` kind (plus a route and a test case) purely to satisfy three cross-references into a module the authorisation's own integration requirements do not mention was judged out of scope for this phase. Those three lessons instead link the Virtual Instruments lab, the component library and real components covering the same ground (e.g. F3.M3.L3 links the oscilloscope and the PWM controller library entry for harmonic/distorted-current content). Flagged in `docs/ARCHITECTURE.md` §10d and `docs/CURRICULUM-BLUEPRINT.md`'s F3 table as a known, intentional gap for a future phase to close if it becomes a priority.

## 5. F5 Measurement and Virtual Instruments — fully authored

4 modules, 11 lessons: Measurement basics (3) · Multimeter and clamp meter (2) · Oscilloscope (3) · Specialist instruments (3: insulation resistance testing, LCR/ESR meters, thermal imaging). `prerequisites: ['F1', 'F2']`, `recommended: ['F3']`, `competency: 'CU-05'`, course exam (pass 80%, 45 min, 3 attempts/24h cool-down). Every lesson links a real instrument via the new `{ kind: 'instrument' }` `ToolLink`, cites exact engine-matching values (e.g. "0.04 Ω good / 1.6 Ω aged" ESR, matched against `battery.ts`'s own preset `healthFactor`), and meets the same 14-section standard as F3.

## 6. Content-model and architecture changes

- `ToolLink` gained `{ kind: 'instrument', label, id, scenario? }` (`types.ts`, `routes.ts`, `academy.test.ts`'s `linkExists()`, and `to.instrument()` in `s1/links.ts`). No new `DIAGRAM_IDS` or `DemoId` entries were needed anywhere in F3 or F5 — both courses reuse the existing 39 allowed diagram ids and the existing `demo.link` pattern (no `demo.embed`).
- `InstrumentId` (`types/domain.ts`) extended to the full eight; `content/instruments/index.ts`'s `INSTRUMENTS` registry gained `battery` and `component-tester`; `content/modules.ts`'s `instruments` module moved `status: 'planned'` → `'live'` with a safety note about non-certification.
- `App.tsx` added the lazy `/instruments/*` route; `gates.ts` added the `'instrument'` practical area; `glossary.ts` gained `phase`, `reactance`, `impedance`, `resonance` (plus the four terms added for F5 in the prior session: `accuracy`, `resolution`, `precision`, `cat-rating`).
- `catalogue.ts` and `courseLoader.ts` both now carry F3 and F5 as fully authored, per-course-lazy-loaded entries (§10c's architecture, unchanged in shape — one line per course). `shells.ts` was regenerated once, after both courses were wired in, to avoid regenerating it twice; see `docs/ARCHITECTURE.md` §10d.

## 7. Verification

- `npx tsc -b` — clean.
- `npx vitest run` — **405 passed, 0 failed**, across all 20 test files (engine, content, UI, academy). This includes 29 new instrument-engine tests across 3 files (`engine/instruments/scope.test.ts`, `dmm.test.ts`, `engine.test.ts`, covering the scope, DMM, clamp, ESR/LCR, battery, insulation and component-tester engines), and the full `academy.test.ts`/`shells.test.ts` suites against the now-six-course-authored catalogue. One pre-existing test (`competency CU-11 progresses…`) asserted CU-03 (F3) was "not yet available" as its example of a still-scheduled competency; updated to use CU-04 (F4, genuinely still scheduled) and to additionally assert CU-03 is now available — the only behavioural-test change this phase required.
- `npx oxlint --max-warnings 0` — clean.
- `npx vite build` — succeeds; F3 and F5 are each their own lazy-loaded chunk (confirmed in the build output), consistent with the per-course loading architecture — opening one course's content does not fetch another's.
- Measurement accuracy: every instrument's worked examples in the F3/F5 lesson text were checked by hand against the engine's own formulas (reactance, impedance, RMS, ripple, transformer ratios, rectifier drops) before being written into `check`/`homework` questions, and the `tol` on every numeric question is a relative tolerance ≤ 0.05 as `academy.test.ts`'s `questionValid()` enforces.
- **Not performed this phase:** a live browser session (Playwright or manual) exercising the new `/instruments/*` routes and the F3/F5 lesson pages end-to-end. The build, type-check, lint and full unit/content test suite all pass, and the instrument engines and UI panels follow the same patterns as the Phase 3–7 laboratories that did receive a browser pass — but no browser tool was available in this session to repeat that specific step. Flagged honestly rather than reported as done.

## 8. Known limitations (carried into `docs/ARCHITECTURE.md` §10d and §14)

1. DMM and clamp meter use preset scenarios, not a live circuit-lab bridge (§3).
2. Battery tester is a genuine but simplified constant-R_int equivalent-circuit model, not live-wired to S2's own battery/solar engine state (§3).
3. Three blueprint ★ cross-references (`fun-01`, `fun-05`, `fun-06`) have no corresponding link, because no `ToolLink` kind exists for the standalone Fundamentals module and building one was out of scope (§4).
4. No browser regression pass this phase (§7).

None of these affect F3 or F5's content depth, correctness, or the genuine measurement physics behind the eight instruments — they are integration-boundary simplifications, each stated in the UI or lesson text where it matters, exactly as the authorisation required.

## 9. Stop condition

Per the authorisation: **Phase 9 has not been started.** This report, the backup archive and the updated architecture/blueprint docs are delivered for review and approval before any further work begins.
