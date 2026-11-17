# Bundle Optimisation Report

Companion to `docs/PHASE-7-ACCEPTANCE-REVIEW.md` §3–4 and `docs/ARCHITECTURE.md` §10b–10c. §1–4 cover the first pass (decoupling the dashboard and prerequisite gates from course content); §5–8 cover the second pass (true per-course content loading within the Academy itself).

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

## 5. Scoped out in the first pass, then completed (§6–7)

The first pass (§1–4) left one thing open: true per-course code-splitting *inside* the Academy's own router, so that opening F1 doesn't also fetch F2/S1/S2's content within a single shared `AcademyPages` chunk. That was flagged in `docs/ARCHITECTURE.md` §10b as a follow-up rather than done immediately, since it needed six synchronous `COURSE_BY_ID[courseId]` lookups converted to async loading — a larger change than the first pass's measured problem (content forced onto the dashboard and the gated laboratory pages) required. It was requested as a named follow-up task and is reported here.

## 6. Per-course content loading — fix

Full design in `docs/ARCHITECTURE.md` §10c. Summary:

- **`content/academy/courseLoader.ts`** (new) — one dynamic `import()` per authored course (`F1`, `F2`, `S1`, `S2`), each its own Vite chunk. `loadCourse(id)` caches the result after the first successful load and de-duplicates concurrent requests for the same id, so navigating between a course's lessons, quiz, assignment, exam and practicals never re-fetches it. A "scheduled" (not-yet-authored) course has no entry and resolves immediately to its already-complete shell.
- **`content/academy/useCourse.ts`** (new) — the hook every course-keyed Academy page now uses instead of the old synchronous catalogue lookup; exposes `loading` / `ready` / `notfound` / `error` states and a `retry()`.
- **`features/academy/AcademyPages.tsx`** — `CoursePage`, `LessonPage`, `useCourseModule` (shared by `QuizPage`/`AssignmentPage`), `ExamPage` and `PracticalPage` converted to `useCourse`. The catalogue listing and every cross-course title reference (a locked prerequisite, a recommended course) now read the shells, never another course's content. `courseUnlock()`/`competencyRecord()` moved back into `logic.ts`, now shell-based (shell practicals gained a `title` field so the competency record's evidence list still reads correctly) — `catalogueLogic.ts` was deleted, since nothing needs the full catalogue outside the Academy's per-course loader and the test suite.

**No course ID, lesson ID, practical ID, or progress-record/backup format changed.** `catalogue.ts` (still the one source of truth for authored content), `progressStore.ts` and `sanitize.ts` were not modified.

## 7. Measured results (production build, `vite build`)

| Chunk | Size | What it is |
|---|---|---|
| Academy catalogue (opening `/academy`) | **fetches no course-content chunk at all** (confirmed live, §8) | Listing page reads only the shells. |
| `AcademyPages-*.js` (Academy UI + shell-based logic, no course content) | **146.58 kB** (43.52 kB gzip) | Down from 808.14 kB when this chunk carried every course's content. |
| `f1-*.js` (F1 content, its own chunk) | **138.21 kB** (44.83 kB gzip) | Fetched only when F1 is opened. |
| `f2-*.js` (F2 content, its own chunk) | **131.92 kB** (43.48 kB gzip) | Fetched only when F2 is opened. |
| `s1-*.js` (S1 content, its own chunk) | **228.29 kB** (76.46 kB gzip) | Fetched only when S1 is opened. |
| `s2-*.js` (S2 content, its own chunk) | **154.17 kB** (48.81 kB gzip) | Fetched only when S2 is opened. |
| `logic-*.js` (shell-based marking/completion/unlock/competency logic) | **44.25 kB** (11.46 kB gzip) | Slightly larger than §3's 40.19 kB now that `courseUnlock`/`competencyRecord` moved back in — still no course content. |
| `gates-*.js` | **0.38 kB** | Unchanged. |
| `index-*.js` (main entry) | **333.39 kB** (105.24 kB gzip) | Unchanged. |

**Whether opening one course downloads another's content: no.** Verified live (Playwright, built app under `vite preview`, network responses captured per navigation):

- Opening the Academy catalogue (`#/academy`) fetched none of the `f1`/`f2`/`s1`/`s2` chunks.
- Opening F1 (`#/academy/F1`) fetched the `f1` chunk and none of `f2`/`s1`/`s2`.
- Opening F2 fetched only `f2`; opening S1 fetched only `s1`; opening S2 fetched only `s2` — each checked in a fresh browser context, with none of the other three courses' chunks present in that session's network log.
- Navigating from the F1 course page to one of its lessons triggered no further request for the `f1` chunk (already cached) — confirming no duplicate download when moving between lessons of the same course.

**Loading and error states**: a course not yet resolved shows a loading panel (`data-testid="course-loading"`); a resolution failure (e.g. the course's chunk fails to fetch) shows a retry panel (`data-testid="course-load-error"`) rather than a blank or broken page; an invalid course id still redirects to the catalogue, exactly as before.

**Examinations and practical assessments**: re-verified live post-refactor — F1's lesson page (knowledge check + homework), quiz page (`#/academy/F1/quiz/F1.M1`) and practical page (`#/academy/F1/practical/f1-hazards-bench`) all render their real, course-specific content with no console errors once the course's chunk has loaded.

## 8. Regression testing performed (second pass)

- **Unit tests**: `npx vitest run` → 346/346 passing, unchanged from §4 (no test removed or weakened by this pass either).
- **Type checking**: `npx tsc -b` → clean.
- **Lint**: `npx oxlint --max-warnings 0` → clean (one `react-hooks`-style warning on the first draft of `useCourse.ts`, about deriving "loading" via `setState` inside an effect rather than at render time, was fixed by restructuring the hook to compute `'loading'` as whatever's left once the cache and a tracked failure are ruled out, rather than storing it as state).
- **Production build**: succeeds; sizes in §7.
- **Chunk-isolation checks**: §7, above — opening one course never fetches another's chunk, and re-navigating within a course never re-fetches it.
- **Direct URL / gate regression**: re-ran the full direct-URL-bypass and legacy-progress-injection checks from §4 against the rebuilt app — same results, no regression.
- **Desktop and mobile viewports**: unchanged from §4 — no horizontal overflow or console errors.

All checks passed; no regression was found against Phase 1–7 functionality, and the architecture now fully meets the Academy performance objective: opening the catalogue, or any one course, never downloads another course's content, and the pattern needs only one new line in `courseLoader.ts` per course as Phases 8–14 author more.
