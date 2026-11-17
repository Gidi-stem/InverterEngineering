# Bundle Optimisation Report

Companion to `docs/PHASE-7-ACCEPTANCE-REVIEW.md` §3–4 and `docs/ARCHITECTURE.md` §10b.

## 1. Problem, as measured after Phase 7 (`8874c82`)

From the Phase 7 report: the shared `logic.ts` chunk had grown to ≈670 kB (from ≈245 kB after Phase 6) because it carried F1/F2/S1/S2's full authored content. The main entry bundle itself was ≈333 kB and unaffected.

Root cause, traced in the code: `content/academy/logic.ts` unconditionally imported the full catalogue (`catalogue.ts`, which imports every course module) at its top level, for two functions (`courseUnlock`, `competencyRecord`) that are only ever called from the Academy's own pages. Because the dashboard's "what's next" banner (`AcademyBanner.tsx`) and every prerequisite gate (`gates.ts`, used by the circuit lab, build, solar and 3D-lab pages) also import `logic.ts` — for functions that never touch lesson/quiz/exam content — they were all transitively bundled with the full catalogue regardless of whether they needed it.

## 2. Fix

Full design in `docs/ARCHITECTURE.md` §10b. Summary:

- `logic.ts` no longer imports `catalogue.ts`. Its marking/completion functions (`markTask`, `lessonDone`, `moduleStatus`, `examStatus`, `courseComplete`, `evidenceMet`, `quizAvailability`) are already generic over whatever course/module/lesson shape they're given, so this required no behavioural change to any of them — only updating two `.content`-truthy checks (`lessonDone`, `moduleStatus`'s lesson filter) to also recognise a new `hasContent` marker.
- A new, generated file `content/academy/shells.ts` provides a structurally-identical-but-content-light `Course[]` (same ids, titles, prerequisites, module/lesson/practical/exam structure; lesson `content` and quiz/exam questions stripped, replaced with a `hasContent: true` marker per authored lesson). `gates.ts` and `logic.ts`'s `ALL_LESSONS` now read from this instead of the real catalogue.
- A new file `content/academy/catalogueLogic.ts` holds `courseUnlock()` and `competencyRecord()` (which do need real course titles), importing the full `catalogue.ts`. It is used only by `features/academy/AcademyPages.tsx`, already a separately lazy-loaded route, so this changes nothing about when that content loads.
- A new test, `content/academy/shells.test.ts`, checks `shells.ts` stays structurally in sync with `catalogue.ts` (ids and order, prerequisites, module/lesson/practical ids and evidence, quiz pass marks, exam settings, competency units) so a future course edit that isn't mirrored into the shell fails the test suite instead of silently drifting.

**No course ID, lesson ID, practical ID, progress-record field, or the persisted-progress schema version changed.** `catalogue.ts`, `progressStore.ts` and `sanitize.ts` were not modified.

## 3. Measured bundle sizes (production build, `vite build`)

| Chunk | Before (Phase 7 report) | After | What loads here |
|---|---|---|---|
| `logic-*.js` (marking/completion + gates' shared logic) | ≈670 kB | **40.19 kB** (10.34 kB gzip) | Pure rules + course shells — no lesson/quiz/exam content. |
| `gates-*.js` | bundled inside the 670 kB chunk | **0.38 kB** (0.29 kB gzip) | Prerequisite lookup only. |
| `AcademyBanner-*.js` (dashboard banner) | bundled inside the 670 kB chunk | **1.40 kB** (0.68 kB gzip) | Dashboard "what's next" lookup against shells. |
| `index-*.js` (main entry) | ≈333 kB | **333.39 kB** (105.25 kB gzip) | Unchanged, as expected — the dashboard itself was never the heavy part. |
| `AcademyPages-*.js` (Academy route) | content was spread across the 670 kB shared chunk | **808.14 kB** (255.74 kB gzip) | All of F1/F2/S1/S2's full lesson/quiz/exam content, plus `catalogueLogic.ts` and the Academy UI — fetched only when a student opens the Academy. |

**What loads on the dashboard now:** the main entry bundle plus (lazily) the 1.4 kB `AcademyBanner` chunk and whatever shared chunk it needs (`logic`, now 40 kB) — no course content at all.

**What loads inside a course:** opening the Academy fetches `AcademyPages-*.js` (808 kB) once; this is unchanged in principle from Phase 7 (the Academy route was already lazy) — the fix is that visiting the dashboard, the circuit lab, the build lab, the solar lab or the 3D lab no longer forces that same content to load as a side effect of a shared chunk.

**What loads on a gated laboratory page** (circuit lab, build, solar, 3D-lab procedure tab): the 40 kB `logic` chunk and the 0.4 kB `gates` chunk — no course content, regardless of gate state.

## 4. Regression testing performed

- **Unit tests**: `npx vitest run` → 346/346 passing (343 pre-existing + 3 new in `shells.test.ts`). No existing test was removed, skipped, or weakened to pass.
- **Type checking**: `npx tsc -b` → clean.
- **Lint**: `npx oxlint --max-warnings 0` → clean.
- **Production build**: `npx vite build` → succeeds; sizes above.
- **F1/F2 prerequisite tests**: covered by the existing `academy.test.ts` gate-matrix tests (all passing, now exercising the shell-backed `gates.ts`) and by a live browser pass (below).
- **Direct URL access (no-bypass) tests**: a Playwright script loaded the built app (`vite preview`) with empty `localStorage` and navigated directly to `#/circuit-lab?ex=ckt-01`, `#/circuit-lab?ex=bld-a`, `#/solar`, `#/academy/F2`, and `#/academy/F2/m1` — every one rendered its lock notice, none rendered the real workspace or lesson content; `#/academy/F1` (no prerequisite) opened normally with empty progress.
- **Student progress persistence**: a progress object in the exact shape `progressStore.ts` persists (including F1 quiz/exam attempts and practical activity records) was written directly into `localStorage` under its existing key (`inverter-lab-progress`) and the app reloaded without error — confirming the refactor didn't change what a stored backup needs to look like.
- **Desktop and mobile viewport checks**: the dashboard and a gated laboratory page were loaded at 1440×900 and 390×844; neither produced horizontal overflow or an uncaught page error at either size.

All checks passed; no regression was found against Phase 1–7 functionality.

## 5. Scoped out (flagged, not silently dropped)

True per-course code-splitting *inside* the Academy's own router — so that opening F1 doesn't also fetch F2/S1/S2's content within the 808 kB `AcademyPages` chunk — would require converting six synchronous `COURSE_BY_ID[courseId]` lookups in `AcademyPages.tsx` to async/Suspense-based loading. This is a materially larger rewrite of the Academy's own routing than the measured problem (content forced onto the dashboard and the gated laboratory pages) required, and conflicts with the standing instruction to avoid unnecessary architectural rewrites. It is recorded as a follow-up in `docs/ARCHITECTURE.md` §10b and is worth doing before Phases 8–14 add the remaining eleven courses, since the Academy's own chunk will keep growing with every course authored.
