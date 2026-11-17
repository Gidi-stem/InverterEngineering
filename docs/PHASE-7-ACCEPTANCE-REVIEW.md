# Phase 7 Acceptance Review and Pre-Phase 8 Optimisation

**Status: provisional, awaiting sign-off. No Phase 8 implementation work has begun or will begin until this report is reviewed and approved.**

This review covers the five items requested before Phase 8 starts: prerequisite-gate verification, assessment-integrity verification, a curriculum-bundle optimisation, a regression pass, and this set of deliverables. It was carried out entirely by reading and testing the code already committed at `8874c82` (Phase 7), plus the optimisation changes described in §3 and verified in §4 below.

## 1. Prerequisite gate verification — PASS

Full detail: `docs/PREREQUISITE-MATRIX.md`.

Checked directly against `content/academy/gates.ts`, `content/academy/logic.ts`, and every gated page (`CircuitLabPage`, `BuildPage`, `SolarPage`, `Lab3DPage`, and the five gated Academy routes in `AcademyPages.tsx`):

- **F1 is reachable with no prior progress.** F1 has an empty `prerequisites: []`, and `gateStatus()` only ever evaluates the courses named in `requiredCourses()` — F1 never appears in its own requirement list, so it cannot lock itself. Confirmed live: opening `#/academy/F1` with empty `localStorage` renders the course, not a lock notice.
- **F1's own knowledge checks, exam and practicals are completable from an empty start.** Nothing in `lessonDone`, `moduleStatus`, `examStatus` or `markTask` reads any gate; they are pure functions of recorded attempts/activities only.
- **F1 completion unlocks subsequent practicals.** `requiredCourses('lab3d-procedure')` and `requiredCourses('circuit', ex)` for F2's own five exercises (`ckt-01`–`ckt-03`, `sim-01`, `sim-02`) return `['F1']` only — this is what lets F2 be studied (and its own practicals completed) without needing F2 to already be complete. This is the circular-dependency case called out explicitly in the task brief, and it does not occur: **a course is never a prerequisite of itself**, in either the F1→F2 pair or anywhere else in `requiredCourses()`.
- **F2 (as a course) is reachable only after F1 is complete, but F2's practicals are not locked behind F2 itself.** `courseUnlock()` (used by the Academy's own lesson/quiz/exam/practical routes) checks `c.prerequisites`, and F2's `prerequisites: ['F1']` — so the F2 *course pages* require F1 complete, while the F2 *circuit-lab exercises* (reached directly from the circuit lab, not through the Academy) require only F1, per the previous bullet. These are deliberately two different, independently-enforced gates (course-page gate in `courseUnlock`, lab-area gate in `gateStatus`), and neither can be completed by first completing the other — there is no cycle.
- **F1+F2 together gate the Build, Solar and remaining Circuit-lab practicals.** `requiredCourses()` returns `['F1', 'F2']` for every `PracticalArea`/exercise not covered by the two bullets above. Confirmed live: `#/build` (listing) shows a non-blocking notice but still lists projects; opening any project's actual workspace at `#/circuit-lab?ex=<id>` with empty progress renders the lock notice, not the editor. `#/solar` renders the lock notice directly (the five tab components are not even requested until the gate opens — `lazy()`-imported tabs).
- **No bypass via direct URL.** Every gated page independently calls `gateStatus()`/`courseUnlock()` on render and swaps its whole content tree for a lock notice when closed; none of them trust how the student arrived. Verified by direct-URL regression (`docs/BUNDLE-OPTIMISATION-REPORT.md` §4) against `#/circuit-lab?ex=ckt-01`, `#/circuit-lab?ex=bld-a`, `#/solar`, `#/academy/F2`, `#/academy/F2/m1` with empty progress: every one renders a lock, none renders the real workspace or lesson.
- **Existing progress records remain valid.** No change was made to `progressStore.ts`, `sanitize.ts`, course IDs, lesson IDs, practical IDs, or the persisted schema version (`version: 1`, unchanged). A progress blob injected directly into `localStorage` in the shape the store expects loaded without error (same regression run, §4).

No circular dependency, no bypass path, and no broken existing-progress case was found.

## 2. Assessment integrity verification — PASS

Full detail: `docs/ASSESSMENT-INTEGRITY-REPORT.md`.

- **Opening content never records completion.** `moduleVisits` (written by `visitModule()`, "studied" tracking only) is a structurally separate state slice from `activities` (written only by `recordActivity()`, the slice `evidenceMet()` actually reads). Nothing in any page calls `recordActivity` on mount; it is only called from explicit actions (e.g. clicking "Run" in `EnergyTab`, passing a circuit-lab exercise check, submitting a practical task).
- **Lesson completion requires a passed check**, not just opening the lesson (`lessonDone` = authored lesson AND best check score ≥ 70%).
- **Quiz/exam attempts are rate-limited and best-score-based**, not pass-on-open (`quizAvailability`: 3 attempts/24 h; `examStatus` similarly windowed).
- **Practical competency credit is double-gated**: `practicalCredited = evidenceMet(evidence) && moduleStatus(module).quizPassed` — genuine evidence (a task passed, a real circuit-lab/simulator exercise check passed, a project marked complete) is necessary but not sufficient; the module quiz must also be passed.
- **Strict pass/fail marking, no partial credit on failure**, for every practical task kind (`sequence`, `hazards`, `procedure`, `calc`) — confirmed by reading `markTask()`'s full branch logic for each kind.
- **Course completion requires every module complete (all lessons + quiz + assignment ≥ 70% + all practicals' evidence) and the course exam passed** (`courseComplete`).

No path was found by which opening a lesson, a lab tab, or a practical page alone awards any credit.

## 3. Curriculum bundle optimisation — DONE

Full detail and measured numbers: `docs/BUNDLE-OPTIMISATION-REPORT.md`.

Root cause: `content/academy/logic.ts` unconditionally imported the full, authored course catalogue to support two display-only functions (`courseUnlock`, `competencyRecord`) that are only ever used inside the Academy's own pages. Because every prerequisite gate and the dashboard's "what's next" banner also import `logic.ts` (for its catalogue-independent marking/completion functions), they were all transitively bundled with F1/F2/S1/S2's full content.

Fix: split `logic.ts` into a catalogue-free marking/completion layer (unchanged behaviour, now importing lightweight course "shells" instead of the real catalogue for its one data dependency, `ALL_LESSONS`) and a new `catalogueLogic.ts` carrying the two catalogue-dependent, Academy-only functions. See `docs/ARCHITECTURE.md` §10b for the full design and §14 for the updated limitations entry.

Result: the shared `logic.ts` chunk dropped from ≈670 kB to ≈40 kB; the dashboard and every gated laboratory page no longer load any course content at all. Course content now loads only when a student opens the Academy. No course ID, lesson ID, progress record, or backup format changed.

## 4. Regression testing — PASS

Full detail: `docs/BUNDLE-OPTIMISATION-REPORT.md` §4.

- Unit tests: 346/346 passing (343 existing + 3 new consistency checks for the generated course shells; **no existing test was removed or weakened**).
- Type checking (`tsc -b`): clean.
- Lint (`oxlint --max-warnings 0`): clean.
- Production build (`vite build`): succeeds; sizes reported in the bundle report.
- F1/F2 prerequisite behaviour: re-verified live (empty progress, every gated route) — see §1 above.
- Direct-URL bypass attempts: re-verified live — see §1 above.
- Student progress persistence: a progress blob was injected directly into `localStorage` in the shape the store persists and loaded without error.
- Desktop (1440×900) and mobile (390×844) viewports: dashboard and a gated laboratory page render without horizontal overflow or uncaught page errors at both sizes.

## 5. Recommendation

Phase 7's functionality is sound: the prerequisite system has no circular dependency and no bypass path, and the assessment/completion model cannot be gamed by merely opening content. The bundle issue flagged in the Phase 7 report has been fixed without changing any course ID, lesson ID, progress record, or backup format, and without the existing test suite losing any coverage.

One trade-off was made deliberately rather than silently: true per-course code-splitting *inside* the Academy's own router (so opening F1 doesn't also fetch F2/S1/S2) was scoped out as a materially larger rewrite than the measured problem required, and is recorded as an explicit follow-up in `docs/ARCHITECTURE.md` §10b, worth doing before Phases 8–14 add the remaining eleven courses.

**Per the governing instruction, no Phase 8 work has begun. This report awaits review and approval before any further implementation.**
