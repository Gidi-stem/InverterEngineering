# Phase 9 report: Repair and Troubleshooting Workshop, F4 and P4 authoring

## 1. Scope

Per the approval and instruction: retain the existing 17 Repair Workshop scenarios and the current repair-engine architecture; incorporate three additional requirements into the Repair Workshop (numerical diagnostic exercises, a clear retry/restart action on the result screen, verified persistence of solved scenarios); then fully author F4 (Electronic Components for Inverter Engineering) and P4 (Inside a Real Inverter) against the approved curriculum blueprint, integrated with the Component Library, 3D Dissection Laboratory and Repair Workshop, with practical assessments connected to real workshop activities. S4 is explicitly **not** authored in this phase (remains allocated to Phase 13). Phase 10 is not started.

## 2. Repair Workshop: three additional requirements

These were implemented and reviewed, and approved as satisfactory, before this report's F4/P4 authoring work:

1. **Numerical diagnostic exercises.** Scenarios include measurement-interpretation and engineering-calculation steps, not only multiple-choice diagnosis.
2. **Retry/restart on the result screen.** A clear retry/restart action is present on the Repair Workshop's result screen.
3. **Persistence and the 8/8-vs-0% discrepancy.** Completed scenarios persist and correctly show as solved on return to the workshop. The reported "8/8 result but 0.0% overall progress" was investigated: course-level progress (`courseComplete`/`moduleStatus` in `logic.ts`) requires every module's quiz and practicals across the *whole course* to be satisfied, not just the Repair-linked scenarios in isolation — so a scenario set being solved does not, by itself, move an unrelated course's sidebar percentage. This is correct, intentional behaviour, not a persistence fault, and the 17 scenarios and repair-engine architecture were otherwise left unchanged.

The 17 existing scenarios and the repair engine (`src/engine/repair/`, `src/features/repair/`) are unchanged by this phase's F4/P4 authoring work.

## 3. F4 Electronic Components for Inverter Engineering — fully authored

5 modules, 26 lessons, each meeting the platform's full 14-section lesson standard (objectives, introduction, lecture, technical notes, diagrams, formulas, worked examples, applications, common mistakes, demo, activities, knowledge checks, summary, homework):

| Module | Lessons |
|---|---|
| F4.M1 Passive components | 4 |
| F4.M2 Semiconductor devices | 10 |
| F4.M3 Magnetic components | 4 |
| F4.M4 Protection and switching devices | 4 |
| F4.M5 Control, sensing and thermal | 4 |

Numerical/calculation checkpoints (power loss, I²t, thermal resistance, RC discharge, voltage-drop-under-load, etc.) are woven throughout, satisfying the "not exclusively MCQs" requirement. Every `ToolLink` (Component Library, test procedures, comparisons, 3D Dissection Laboratory, Circuit Lab, Simulator, Repair Workshop) was verified against the platform's real data rather than assumed:

- `componentCatalogue.ts`'s 24 real component ids (no `contactor` or `surge-protector`/TVS as separate library entries — these concepts are taught via prose and glossary, linked to the real adjacent components `relay`, `diode`, `fuse` instead of inventing non-existent library entries).
- The real `DIAGRAM_IDS` list, `GLOSSARY` keys, and `lf3k.ts`/`sq1k.ts` 3D-model part ids (e.g. the LF-3K transformer's real part id is `t1`, not `transformer`).

**A blueprint-conformance correction made during authoring.** An initial draft of F4.M4 merged fuses and breakers into one lesson and added an invented "surge protection" lesson not in the blueprint; F4.M5's L4 was initially an invented "system integration" lesson. Re-reading `CURRICULUM-BLUEPRINT.md` (required by the "strictly follow the approved curriculum blueprint" instruction) surfaced the mismatch before acceptance. Both modules were rewritten to match the blueprint's exact lesson breakdown: F4.M4 → Fuses / Circuit breakers / Relays and contactors / Relays vs semiconductor switches; F4.M5.L4 → PCBs, connectors and terminals. The pre-existing `scheduled()` stub syllabus strings in `catalogue.ts` (written before F4 was wired in as a real authored course) were superseded by the blueprint, which is authoritative.

## 4. P4 Inside a Real Inverter — fully authored

3 modules, 10 lessons, same 14-section lesson standard:

| Module | Lessons |
|---|---|
| P4.M1 Architecture tour | 5 |
| P4.M2 Safe disassembly and reassembly | 3 |
| P4.M3 Identification | 2 |

P4's content is grounded directly in the real LF-3K and SQ-1K 3D models: real part ids (`q1`–`q6` MOSFETs/IGBTs, `u1`/`u6`/`u7` control ICs, `c1`–`c7` capacitors, `t1`/`l1` magnetics, `hall`/`k1`/`dc-lugs`, etc.), their real removal-order dependencies (mechanical: switches clamped to the heat sink; electrical: the transformer's leads connect to the output filter; spatial: the control board sits above the power board's cable path) and real removal notes, rather than invented generic descriptions.

**Practical evidence.** P4's practicals use the 3D laboratory's real recorded activity ids — `{ kind: 'activity', id: 'lab3d:disassembly' }`, `lab3d:reassembly`, `lab3d:identify` — confirmed directly against `labStore.ts`'s `recordActivity()` calls, rather than the legacy, pre-Academy `l3d-*`/`asm-*` module lessons the blueprint's "Tools" column names for P4. No `ToolLink` kind exists for linking directly to those legacy lessons (only `lab3d`, for real 3D model/part ids, and `fundamentals`, for the standalone Fundamentals module) — this is a real, structural limitation of the current `ToolLink` union, not an oversight in this phase's authoring; P4's `lab3d` links instead reference real part ids on the LF-3K/SQ-1K models, and its practicals' evidence correctly reads the real recorded activities students actually perform.

**Exam.** P4 did not originally have an `exam` object in its `scheduled()` stub. Investigating `logic.ts`'s `examStatus()`/`courseComplete()` showed that a course with no `exam` can never register as complete (`passed = !!ex && ...` is always `false` without one) — a genuine functional requirement, not a stylistic choice, confirmed by every other published course having one. A 15-question exam spanning all 3 modules was added.

## 5. Content-model and architecture changes

- `catalogue.ts`: F4 and P4's `scheduled()` stub entries replaced with the real, authored `Course` objects; both added to the `COURSES` array.
- `courseLoader.ts`: `F4` and `P4` added to `COURSE_CONTENT`, each as its own dynamic `import()` — required both for runtime lazy-loading and for Vite's per-course code splitting at build time (confirmed: omitting this is what caused F4's chunk to be missing from an earlier build within this phase, before the line was added).
- `shells.ts`: regenerated once, after both F4 and P4 were wired in (via the same one-off, not-checked-in generator script described in `ARCHITECTURE.md` §10d), to avoid regenerating twice.
- `glossary.ts`: 4 new entries added to support F4.M4 (`contact-bounce`, `protection-coordination`, `selectivity`, `tvs-diode`); 2 of these ended up unreferenced after the blueprint-conformance rewrite dropped the invented surge-protection lesson — they remain harmlessly in the glossary (unused entries are not checked by the test suite, only unresolved `[[...]]` references are).
- `academy.test.ts`: one assertion updated — a test that used `CU-04` (F4's competency) as its example of a still-"scheduled", not-yet-available competency was updated to use `CU-13` (S3, still scheduled), since CU-04 correctly became available once F4 was published; this preserves the test's original intent without masking the correct new behaviour.

No changes were made to existing course ids, lesson ids, progress-record shapes, or the per-course lazy-loading architecture itself — all extended by the same established pattern (`ARCHITECTURE.md` §10c/§10d), not altered.

## 6. Verification

- **Type checking:** `npx tsc -b` — clean, no errors.
- **Lint:** `npx oxlint` — clean, no warnings.
- **Unit/integration tests:** `npx vitest run` — **474/474 passing** (23 test files), including the full `academy.test.ts` depth-minimum, link-validity, glossary-reference and progress/gating suites.
- **Production build:** `npm run build` — succeeds; F4 (`f4-*.js`, 277.93 kB) and P4 (`p4-*.js`, 107.84 kB) each produce their own lazy-loaded chunk, confirming course-level code splitting continues to scale correctly.
- **Browser testing — honest limitation.** This phase's work was carried out in a sandboxed cloud session with no connection to a live, user-operated browser: the Chrome-extension and built-in-browser tools available in this environment act on a browser the session does not actually have access to in this context, and no Playwright/Puppeteer or other e2e framework exists in this repository (confirmed: no config file, no `package.json` script, no installed binary). A `vite preview` server was started and smoke-tested with `curl` (returns HTTP 200 with valid HTML), but this is **not** a substitute for interactive, visual verification — opening the Learning Academy, navigating into F4/P4's actual modules and lessons, exercising Repair Workshop links, and checking the browser console for runtime errors. That verification genuinely was not performed and should not be read as done. The 474 passing tests do exercise F4/P4's full content structure, every `ToolLink` target, every diagram/glossary reference and every progress/gating interaction programmatically, which is meaningful coverage, but it is not the same as seeing the pages render.

## 7. Known limitations

- Interactive browser verification of F4/P4 (see §6) has not been performed in this environment.
- 2 of the 4 glossary entries added for F4.M4 (`protection-coordination`, `tvs-diode`) are currently unreferenced, having been added before the blueprint-conformance rewrite dropped the lessons that would have used them. Harmless (not test-checked), but worth removing or using in a future pass if noticed.
- P4's `lab3d` tool links point at real 3D model/part ids rather than the legacy `l3d-*`/`asm-*` module lessons the blueprint's "Tools" column names, because no `ToolLink` kind exists for the latter — a structural gap in the current content model, not specific to this phase, flagged here for visibility rather than addressed (adding such a kind was not requested and was judged out of scope for this phase).

## 8. Stop condition

Per the governing instruction, S4 was not touched in this phase (remains allocated to Phase 13), and Phase 10 is not started. This report, the updated `CURRICULUM-BLUEPRINT.md` and `ARCHITECTURE.md`, and the commit/backup described alongside it are submitted for review and await approval before any Phase 10 work begins.
