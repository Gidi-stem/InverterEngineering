# Phase 8 report: Virtual Instruments and Measurement Engineering

Baseline: Phase 7 (approved, commit `322a901`), plus a follow-up course-lazy-loading implementation approved before Phase 8 began. This report covers Phase 8 as authorised: "AUTHORISATION: PHASE 8 — VIRTUAL INSTRUMENTS AND MEASUREMENT ENGINEERING", **and its subsequent "PHASE 8 — FINAL ACCEPTANCE AND INTEGRATION REVIEW" remediation** (§10 below), which closed out every item the first review raised before Phase 9 was authorised to start. Nothing below is reported as done without a test, a build, or a worked calculation behind it.

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
- **DMM and clamp meter**: realistic, internally Ohm's-law-consistent **preset scenarios** (kept, as a guided introductory mode), **plus, since the final-acceptance remediation (§10), a live-circuit mode** — see §10.1 for exactly what it covers and how it avoids a second circuit-solving engine.
- **Battery tester ↔ S2's battery/solar curriculum**: a genuine, parameter-driven equivalent-circuit model, in the spirit of "connect to the existing battery engineering curriculum" — but not a live read of S2's own solar-lab battery state. A deep live integration with S2's specific battery/solar engine code was judged out of scope for this phase and is flagged as a simplification to revisit if a later phase needs it.
- **Insulation tester**: deliberately simulation-only, as required; no live integration was sought or implied.

## 4. F3 AC Electrical Fundamentals — fully authored

5 modules, 19 lessons, matching `catalogue.ts`'s pre-existing scheduled syllabus exactly (no course codes, titles or prerequisites invented): Alternating quantities (4) · Reactance and impedance (4) · AC power (4) · Transformers (4) · Rectification (3). `prerequisites: ['F2']`, `competency: 'CU-03'`, course exam (pass 80%, 50 min, 3 attempts/24h cool-down). Every lesson meets the full 14-section lesson standard at the same depth as F1/F2/S1/S2/F5 (objectives, introduction, lecture >1500 chars, technical >400 chars, ≥1 diagram, ≥1 formula, ≥2 worked examples each with ≥2 steps, applications, ≥3 mistakes, a real tool link, ≥3 check questions, ≥4 summary points, ≥2 homework items).

**★-marked activity links honoured where real:** F3.M3.L4 links `sim-08` (H-bridge/inductive load, energy returned to the supply), F3.M4.L4 links `ckt-07` (transformer connection exercise), F3.M5.L2 links `sim-03` + `ckt-04` (bridge rectifier), F3.M5.L3 links `sim-04` + `ckt-05` (DC filtering/ripple) — all real, pre-existing simulator experiments and circuit-lab exercises, reused rather than recreated.

**A blueprint gap found, documented, and since resolved (§10.2).** The blueprint also marks F3.M1.L1, F3.M3.L1 and F3.M3.L3 as reusing `fun-01`, `fun-06` and `fun-05` — lessons in the separate, standalone Fundamentals module (`content/modules.ts`/`fundamentalsCriteria.ts`). At first authoring, no course (F1, F2, S1, S2) had ever linked into a `fun-*` lesson, and the `ToolLink` union / `linkExists()` had no case for one, so those three lessons instead linked the Virtual Instruments lab, the component library and real components covering the same ground. The final-acceptance review asked this to be re-investigated rather than accepted as-is; §10.2 covers what that found and the small `ToolLink` extension that now links all three for real, alongside the links already there.

## 5. F5 Measurement and Virtual Instruments — fully authored

4 modules, 11 lessons: Measurement basics (3) · Multimeter and clamp meter (2) · Oscilloscope (3) · Specialist instruments (3: insulation resistance testing, LCR/ESR meters, thermal imaging). `prerequisites: ['F1', 'F2']`, `recommended: ['F3']`, `competency: 'CU-05'`, course exam (pass 80%, 45 min, 3 attempts/24h cool-down). Every lesson links a real instrument via the new `{ kind: 'instrument' }` `ToolLink`, cites exact engine-matching values (e.g. "0.04 Ω good / 1.6 Ω aged" ESR, matched against `battery.ts`'s own preset `healthFactor`), and meets the same 14-section standard as F3.

## 6. Content-model and architecture changes

- `ToolLink` gained `{ kind: 'instrument', label, id, scenario? }` (`types.ts`, `routes.ts`, `academy.test.ts`'s `linkExists()`, and `to.instrument()` in `s1/links.ts`). No new `DIAGRAM_IDS` or `DemoId` entries were needed anywhere in F3 or F5 — both courses reuse the existing 39 allowed diagram ids and the existing `demo.link` pattern (no `demo.embed`).
- `InstrumentId` (`types/domain.ts`) extended to the full eight; `content/instruments/index.ts`'s `INSTRUMENTS` registry gained `battery` and `component-tester`; `content/modules.ts`'s `instruments` module moved `status: 'planned'` → `'live'` with a safety note about non-certification.
- `App.tsx` added the lazy `/instruments/*` route; `gates.ts` added the `'instrument'` practical area; `glossary.ts` gained `phase`, `reactance`, `impedance`, `resonance` (plus the four terms added for F5 in the prior session: `accuracy`, `resolution`, `precision`, `cat-rating`).
- `catalogue.ts` and `courseLoader.ts` both now carry F3 and F5 as fully authored, per-course-lazy-loaded entries (§10c's architecture, unchanged in shape — one line per course). `shells.ts` was regenerated once, after both courses were wired in, to avoid regenerating it twice; see `docs/ARCHITECTURE.md` §10d.

## 7. Verification (first authoring pass)

- `npx tsc -b` — clean.
- `npx vitest run` — **405 passed, 0 failed**, across all 20 test files (engine, content, UI, academy). This includes 29 new instrument-engine tests across 3 files (`engine/instruments/scope.test.ts`, `dmm.test.ts`, `engine.test.ts`, covering the scope, DMM, clamp, ESR/LCR, battery, insulation and component-tester engines), and the full `academy.test.ts`/`shells.test.ts` suites against the now-six-course-authored catalogue. One pre-existing test (`competency CU-11 progresses…`) asserted CU-03 (F3) was "not yet available" as its example of a still-scheduled competency; updated to use CU-04 (F4, genuinely still scheduled) and to additionally assert CU-03 is now available — the only behavioural-test change this phase required.
- `npx oxlint --max-warnings 0` — clean.
- `npx vite build` — succeeds; F3 and F5 are each their own lazy-loaded chunk (confirmed in the build output), consistent with the per-course loading architecture — opening one course's content does not fetch another's.
- Measurement accuracy: every instrument's worked examples in the F3/F5 lesson text were checked by hand against the engine's own formulas (reactance, impedance, RMS, ripple, transformer ratios, rectifier drops) before being written into `check`/`homework` questions, and the `tol` on every numeric question is a relative tolerance ≤ 0.05 as `academy.test.ts`'s `questionValid()` enforces.
- **Not performed in this pass:** a live browser session exercising the new `/instruments/*` routes end-to-end — no browser tool was available in that session. Closed out in the final-acceptance remediation; see §10.3.

## 8. Known limitations after the first authoring pass (superseded in part by §10 — see §10.4 for the current list)

1. DMM and clamp meter use preset scenarios, not a live circuit-lab bridge (§3) — **resolved, §10.1.**
2. Battery tester is a genuine but simplified constant-R_int equivalent-circuit model, not live-wired to S2's own battery/solar engine state (§3) — **still true, see §10.4.**
3. Three blueprint ★ cross-references (`fun-01`, `fun-05`, `fun-06`) have no corresponding link (§4) — **resolved, §10.2.**
4. No browser regression pass this phase (§7) — **resolved, §10.3.**

None of these affected F3 or F5's content depth, correctness, or the genuine measurement physics behind the eight instruments — they were integration-boundary simplifications, stated honestly rather than worked around silently, and the final-acceptance review (§10) closed out everything but #2, which the review did not ask to be revisited and which remains an honest, stated simplification.

## 10. Final acceptance remediation

The requester's "PHASE 8 — FINAL ACCEPTANCE AND INTEGRATION REVIEW" asked for five things before Phase 9: DMM/clamp circuit integration, resolving `fun-01`/`fun-05`/`fun-06`, a browser regression pass (or an honest alternative), full regression protection, and this documentation update. Each is covered below.

### 10.1 DMM and clamp meter now measure a circuit the student actually built

**No second circuit-solving engine was introduced** — the explicit constraint. Every live-circuit reading is produced by one of the two solvers the Circuit Lab itself already runs the student's circuit through:

- **DC voltage, DC current, resistance, continuity** — the existing Phase 4 MNA solver (`buildTopology` + `solveCircuit`, `engine/circuit/solve.ts`), the same function that drives the lab's own live voltage labels and the Thevenin-resistance exercise grading in `exercises.ts`.
- **True AC rms voltage and current** — the existing Phase 5 time-domain engine (`recordRun` + `measure`, `engine/sim/record.ts`/`engine/sim/analysis.ts`), the same engine the Circuit Lab's own oscilloscope feature and experiment grader already run the doc through; here it runs a short headless burst (enough periods of the circuit's slowest drive to settle, then four more to measure) instead of a continuously streamed scope trace, and `measure()` returns a genuine `mean`/`rms`/`acRms`/`freq`, not an approximation from a single snapshot.
- **The one small, additive engine extension this needed**: `SolveOverrides.inject` (already used since Phase 4 for Thevenin-resistance grading, but only between a single part's own two terminals) can now also inject a test current directly between two raw node ids — the general case a real ohmmeter's two free leads need, since they can land on two different parts. Exposed as `measureResistance(doc, topo, nodeA, nodeB)` in `solve.ts`, built from two calls to the unchanged `solveCircuit`. The change is backward compatible (every existing caller of `inject` is untouched) and is forced to stay exhaustive by TypeScript's discriminated-union checking.
- **New module**: `engine/instruments/liveProbe.ts` wires a probed circuit into the shapes the *existing, unchanged* `operateDmm()`/`readClamp()` already consume (`DmmPoint`, `ClampScenario`), so every port-safety check, live-resistance warning and fault behaviour already built for preset scenarios applies identically to a real probe — none of that logic was duplicated. Unit-tested in `engine/instruments/liveProbe.test.ts` (10 new tests): correct DC voltage and current against hand-worked Ohm's-law values, resistance measured between two *different* parts' terminals (not just one part's own leads), a live-circuit flag, true AC rms voltage/frequency/current against an AC source's known rms value, and graceful handling of a stale probe selection after the circuit changes.
- **What stayed preset-only, and why**: capacitance and the diode test. Capacitance is a transient/frequency-domain property the quasi-static Phase 4 solver treats as an open circuit in both its DC and AC-snapshot modes (correctly — a capacitor's DC and snapshot behaviour really is "no current"), so a live capacitance reading would need either the Phase 5 transient engine's own impedance-sweep machinery or a dedicated small-signal AC analysis the existing engines don't expose as a reusable primitive; building that was judged disproportionate to a live capacitance *reading* when the ESR/LCR meter already measures real capacitor ESR/impedance from the component library's reference values. The diode test is a component-identification procedure (good/shorted/open/leaky junction), not a circuit-measurement one, and continues to use `DIODE_TEST_CASES` as before.
- **UI**: `DmmPanel.tsx`/`ClampPanel.tsx` gained a "Guided scenario" / "Your circuit" toggle. In live mode, the student picks one of their own saved Circuit Lab workspaces (via the same `useCircuitLab` store the lab itself uses — no separate circuit to maintain), then a part and terminal for each probe lead (or, for current, the one part to break the meter into series with); the clamp meter picks one part to represent the conductor it clamps around. Preset scenarios, the diode test and the guided exercise are all unchanged.
- **Verified for real, not just unit-tested**: a real headless-browser session (§10.3) seeded a real Circuit Lab exercise (`ckt-01`: a 12 V supply, a 1 kΩ resistor, ground), probed it with the live DMM across the resistor, and read back **12.00 V** — the physically correct answer — and clamped the resistor's lead with the live clamp meter, reading **0.01 A** (≈ 12 mA, correct to the display's two decimal places).

### 10.2 `fun-01`, `fun-05`, `fun-06` — re-investigated and resolved

Re-investigating rather than re-accepting the prior conclusion found that the standalone Fundamentals module (`content/modules.ts`, route `/fundamentals`) is a real, complete, `status: 'live'` section of the platform — seven authored lessons (`fun-01` … `fun-07`) with objectives, a safety note and per-lesson linked simulator experiments (`fundamentalsCriteria.ts`) — not unbuilt infrastructure. The only thing actually missing was a `ToolLink` case pointing into it, which is a small, additive, four-point change exactly like every other `ToolLink` kind already has:

1. `content/academy/types.ts` — added `{ kind: 'fundamentals'; label: string; lessonId: string }` to the `ToolLink` union.
2. `content/academy/routes.ts` — `routeOf()` gained `case 'fundamentals': return '/fundamentals'` (lessons there aren't individually deep-linkable — the module page lists the whole sequence and each lesson's own linked experiments — so the whole module page is the correct, honest target, not an invented per-lesson route).
3. `content/academy/academy.test.ts` — `linkExists()` gained a case checking the lesson id is real in `MODULE_BY_ID.fundamentals.lessons`, and `AcademyPages.tsx`'s activity-kind label map gained an entry — TypeScript's exhaustiveness checking on both switches made both additions mandatory, catching any gap at compile time.
4. `content/academy/s1/links.ts` — added `to.fun(label, lessonId)` alongside the other `to.*` constructors F3 already imports.

F3.M1.L1 ("Why AC is used", → `fun-01` "DC vs AC"), F3.M3.L1 ("Real, reactive and apparent power", → `fun-06`) and F3.M3.L3 ("Harmonics and THD", → `fun-05`) each now link the Fundamentals module *alongside* the Virtual Instruments/library/circuit links they already had (those were a reasonable choice on their own merits and are kept, not replaced). **No course codes were invented and no lessons were duplicated** — the three references now point at the lessons the blueprint always meant. Verified live in the browser pass (§10.3): opening F3.M1.L1 shows the new "Fundamentals: DC vs AC (fun-01)" activity link, and clicking it lands on the live `/fundamentals` page with that lesson visible.

### 10.3 Browser regression

A real browser automation environment *was* available in this session, even though no MCP browser/device-bridge tool was connected: this sandbox has a system Google Chrome binary (`/usr/bin/google-chrome-stable`), and Playwright (`playwright-core`, installed temporarily for this verification pass and removed afterward — it is not a project dependency) can drive it directly without downloading anything from outside the sandbox's network allowlist. The production build (`npx vite build`) was served statically (`vite preview`) and driven headlessly through this real browser — this is genuine browser verification, not a simulated or manual-only substitute, and the full, retained pass/fail log is below.

**Setup**: because `gateStatus('instrument')` correctly requires F1 and F2 to be complete before the instrument routes open (by design — this is the practical-area gate working as intended, not a bug), a `ProgressData` record with F1 and F2 genuinely complete (every lesson's `check` attempt passed, every quiz/assignment/exam attempt passed, using the real course content and the real grading functions — `moduleStatus`/`examStatus`/`evidenceMet` from `logic.ts` — not a hand-guessed shape) was written into the browser's IndexedDB before each page load, alongside a real seeded Circuit Lab exercise (`ckt-01`'s worked reference circuit). This is a reproducible test fixture, not a bypass of the gate's logic — the gate was exercised with real data and found to behave correctly (confirmed open only once F1+F2 were genuinely complete).

**Result: 34/34 checks passed**, at both a desktop viewport (1440×900) and a mobile viewport (390×844):
- All five top-level routes load without a console error: dashboard, Academy, Fundamentals, Circuit Lab, Instruments menu.
- All eight instrument panels open (via the menu tile, the way a student actually navigates) without a console error, at both viewport sizes.
- The progress gate is open with F1+F2 complete, as it should be.
- The pre-existing DMM preset-scenario flow still works (measured 11.71 V on the "battery-resistor" scenario, matching its fixture value).
- **The new DMM live-circuit mode**, probing the seeded `ckt-01` circuit's resistor, read **12.00 V** — the correct value for a 12 V ideal supply across a 1 kΩ resistor.
- **The new clamp-meter live-circuit mode**, clamping that same resistor's lead, read **0.01 A** (≈ 12 mA) — correct.
- The repaired `fun-01` activity link appears on F3.M1.L1 and, clicked, lands on the live `/fundamentals` page with that lesson visible — confirming §10.2's fix end-to-end, not just by code inspection.
- F3.M1.L1's lesson check (assessment) renders and is interactive (13 interactive elements: four MCQ questions' option buttons plus the answer-check control).
- F5's course page loads without a console error.

This is one specific, reproducible procedure, not every laboratory this platform has — it targets exactly what this remediation changed (the live DMM/clamp and the Fundamentals link) plus a general navigation/console-error sweep of all eight instruments and the five main routes, at two viewport sizes. **If a future session needs to repeat or extend it**: install `playwright-core` as a dev dependency (not saved to `package.json` for this pass), use `chromium.launch({ executablePath: '/usr/bin/google-chrome-stable' })` to avoid Playwright's own browser download (blocked by this sandbox's network allowlist), serve `dist/` with `vite preview`, seed `IndexedDB`'s `keyval-store` database (object store `keyval`) with the zustand-persist wire format (`{"state": ..., "version": 1}`) under the keys `inverter-lab-progress` and `inverter-lab-circuits`, and navigate with `#/route` paths (the app uses `HashRouter`). The full pass/fail log (34 entries) was retained for this review.

### 10.4 Current known limitations (supersedes §8)

1. Battery tester remains a genuine but simplified constant-R_int equivalent-circuit model, not live-wired to S2's own battery/solar engine state. The final-acceptance review did not ask for this to be revisited, so it was left as-is; carried forward honestly rather than silently dropped from the limitations list.
2. DMM/clamp live-circuit capacitance measurement and the diode test remain preset/reference-value only, for the reasons in §10.1.
3. Live AC measurement runs a short, bounded headless transient simulation per "Measure" click (typically a few hundred to a few thousand time steps) rather than being instantaneous; this is unnoticeable in normal use but is a genuine (small) computation, not a lookup.
4. The browser regression pass (§10.3) is one targeted, reproducible procedure covering this remediation's changes plus a general sweep — it is not a claim that every control of every instrument, in every mode, has been clicked in a browser.

## 11. Stop condition

Per the authorisation: **Phase 9 has not been started.** This report (including §10's remediation), the backup archive and the updated architecture/blueprint docs are delivered for review and approval before any further work begins.
