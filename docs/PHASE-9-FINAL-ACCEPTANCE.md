# Phase 9 final acceptance: browser verification

## 1. Status

Baseline commit **d9fd3d5** (unchanged — confirmed `git log`/`git status` clean before and after writing this report; no files touched, no student progress affected). This report covers only the one remaining open item from Phase 9 acceptance: browser-based verification of F4, P4 and the Repair Workshop.

> **Update:** the structural blocker described below (no public URL, no connected browser) was subsequently resolved with your approval — the build was deployed to GitHub Pages and driven with a real connected browser. See `docs/PHASE-9-BROWSER-VERIFICATION-RESULTS.md` for the actual test results, including what was and was not reached. The manual script below remains valid and reproducible for anyone testing locally; it is no longer the only verification on record.

**Browser automation was not available in this environment at the time this section was written, and the limitation was structural, not a one-off failure:**

1. `mcp__claude-in-chrome__list_connected_browsers` was called and reports the Chrome extension is **not connected** — there is no browser under this session's control right now.
2. Even if a browser were connected, it would be the user's own Chrome (or the Claude desktop app's built-in browser) — a browser running on the user's machine. This coding session runs in an isolated cloud sandbox whose proxy configuration is **outbound-only** (confirmed via the agent-proxy status: it tunnels outbound HTTPS to an allow-listed set of hosts; there is no inbound tunnel or public URL for anything served from inside this sandbox). A locally-run `vite preview`/`vite dev` server here has no address reachable from outside the sandbox, so a browser on the user's computer could not reach it even once connected.

Both conditions would need to be false for automated verification to be possible here, and neither is. No test below was run in a real browser; nothing in this document should be read as a browser having actually loaded the app. What follows is the reproducible manual test script requested as the fallback, written against this specific build (commit d9fd3d5) so it can be run as-is on a machine with the repository and a browser.

## 2. Running the build for this test

```
npm install
npm run build && npm run preview   # or: npm run dev
```

`vite preview` prints a local URL (default `http://localhost:4173/`); `npm run dev` prints `http://localhost:5173/`. The app uses a **hash router**, so every route below is appended after `/#`, e.g. `http://localhost:4173/#/academy/F4`.

To test from a clean slate, open DevTools → Application → IndexedDB → delete the `inverter-lab-progress` database (this is where progress is persisted — not `localStorage`) before starting, or use a fresh private/incognito window.

## 3. Test script

### 3.1 Course navigation and lesson rendering (F4, P4)

1. Navigate to `/#/academy`. Confirm F4 ("Electronic Components for Inverter Engineering") and P4 ("Inside a Real Inverter") are both listed with status **Published**, not "Scheduled".
2. Navigate to `/#/academy/F4`. Confirm 5 modules are listed (M1 Passive components, M2 Semiconductor devices ×10 lessons, M3 Magnetic components, M4 Protection and switching devices, M5 Control, sensing and thermal) — 26 lessons in total.
3. Open a lesson from each F4 module, e.g. `/#/academy/F4/F4.M1.L1`, `/#/academy/F4/F4.M2.L1`, `/#/academy/F4/F4.M3.L1`, `/#/academy/F4/F4.M4.L1`, `/#/academy/F4/F4.M5.L1`. Confirm each renders all 14 sections (objectives, introduction, lecture, technical, diagrams, formulas, examples, applications, mistakes, demo, activities, knowledge check, summary, homework) with no blank section and no console errors.
4. Repeat for P4: `/#/academy/P4`, confirming 3 modules / 10 lessons, then open `/#/academy/P4/P4.M1.L1`, `/#/academy/P4/P4.M2.L1`, `/#/academy/P4/P4.M3.L1`.
5. Confirm the "Next lesson" / "Previous lesson" navigation at the bottom of each lesson page advances correctly through a module and across module boundaries (e.g. F4.M1.L4 → F4.M2.L1).

### 3.2 Quizzes, assignments and examinations

1. Enrol in F4 (`/#/academy/F4`, click **Enrol** — requires F2 already complete; see §3.7 for the locked case).
2. Visit `/#/academy/F4/quiz/F4.M1` and confirm the 6-question M1 quiz renders and can be submitted; repeat for one quiz in each of F4's 5 modules (`quiz/F4.M2` … `quiz/F4.M5`) and one in each of P4's 3 modules (`quiz/P4.M1` … `quiz/P4.M3`).
3. Visit `/#/academy/F4/assignment/F4.M1` and confirm the assignment brief, tasks and written-response field render and accept a submission; repeat for one other module.
4. Visit `/#/academy/F4/exam` — confirm it is **locked** (not eligible) until every F4 module is complete, per `examStatus().eligible`; after completing every module's quiz and practicals, confirm the 22-question exam becomes available, renders, and records a scored attempt. Repeat for `/#/academy/P4/exam` (15 questions).

### 3.3 3D component links and disassembly dependencies

1. From an F4 lesson (e.g. F4.M2.L4, MOSFETs), click its library/3D cross-reference and confirm it opens `/#/lab-3d?model=lf3k&part=q1` and highlights the correct part on the LF-3K model.
2. From P4.M1.L2 ("The power stage"), confirm its 3D links resolve to real parts: `/#/lab-3d?model=lf3k&part=q1` (MOSFET), `?part=u2` (gate driver), `?part=c1` (bus capacitor).
3. From P4.M2 ("Safe disassembly and reassembly"), open the module's practical links (`to.lab3d('…', 'lf3k')`, no `part` — i.e. `/#/lab-3d?model=lf3k`) and run the guided disassembly sequence in the 3D lab. Confirm the sequence enforces the dependencies documented in P4.M2.L2: the heat sink cannot be removed before the power switches (Q1–Q6) are unclamped, and the transformer (T1) cannot be removed before the output filter (L1, C7) is disconnected.
4. Run the reassembly sequence and confirm the functional test is staged (earth continuity → standby → no-load output → loaded output), and that recording it marks the `lab3d:reassembly` activity (visible in Progress → recent activity).
5. From P4.M3.L2, open `/#/lab-3d?model=sq1k` and confirm the SQ-1K model loads independently of LF-3K, with its own distinct part set (no MPPT/IGBT parts).

### 3.4 Numerical assessment inputs

1. Visit `/#/academy/F4/practical/f4-semiconductor-faults` ("Classifying faults and computing losses"). Confirm question `c1` is multiple-choice and `c2`–`c4` are **numeric input fields** with a unit label (W).
2. Enter `10.368` for c2, `0.525` for c3, `10.893` for c4 (the documented correct answers) and confirm the practical registers as passed with these exact values, and also with values inside the stated ±2% tolerance (e.g. `10.4` for c2).
3. Enter a value clearly outside tolerance (e.g. `5` for c2) and confirm it is marked incorrect with the worked explanation shown.
4. Repeat for `/#/academy/F4/practical/f4-passive-ratings` and `/#/academy/F4/practical/f4-thermal-sensing`, confirming each accepts numeric input against its own documented tolerance.

### 3.5 Repair scenario completion and retry

1. Visit `/#/repair`. Confirm all 17 existing scenarios are listed, unchanged.
2. Open `rsc-09` ("MOSFET failed short", linked from F4.M2.P2) via `/#/repair?scenario=rsc-09`. Work through it to a passing result. Confirm the result screen shows a **Retry** action (`data-testid="retry-scenario"`).
3. Click Retry and confirm the scenario resets for a fresh attempt without losing the previously recorded best score (the scoring/progress summary should keep reflecting the earlier pass).
4. Open `rsc-02` (linked from F4.M4.P1) and `rsc-10` (linked from F4.M5.P2/P4.M1.L5) and confirm both still function identically to before this phase's F4/P4 authoring — no change to scenario content or the repair engine was made.
5. Back in `/#/academy/F4/F4.M2.L8` (or any lesson linking a repair scenario), confirm the activity recorded by completing `rsc-09` is what satisfies F4.M2.P2's practical (`evidence: { kind: 'troubleshoot', project: 'rsc-09' }`) — the practical should show as passed on the course page without a separate "mark complete" step.

### 3.6 Progress persistence after refreshing

1. After completing a lesson, a quiz, and a Repair Workshop scenario as above, open DevTools → Application → IndexedDB → `inverter-lab-progress` and confirm entries exist (completedLessons, attempts, activities).
2. Hard-refresh the page (Ctrl/Cmd+Shift+R) and confirm: the completed lesson still shows as done on the course page, the quiz attempt and score are still shown, the Repair Workshop scenario still shows passed, and the sidebar/course progress percentages are unchanged from before the refresh.
3. Close the tab entirely, reopen the app fresh, and repeat step 2's checks — this confirms persistence survives a full session end, not just an in-page reload.

### 3.7 Prerequisite enforcement and direct URL access

1. In a fresh profile (no F2 completed), navigate directly to `/#/academy/F4` (course page) and then directly to `/#/academy/F4/F4.M1.L1` (a specific lesson), **without** going through the catalogue first. Confirm the lesson page renders a locked panel (`data-testid="course-locked"`) naming F2 as the missing prerequisite, not the lesson content.
2. Attempt the same direct-URL access for `/#/academy/F4/quiz/F4.M1`, `/#/academy/F4/assignment/F4.M1`, and `/#/academy/F4/exam` — confirm each is also locked and shows the missing-prerequisite message rather than rendering its content.
3. Complete F2 (or use a backup/import that already has it complete), then repeat steps 1–2 and confirm every page now unlocks correctly.
4. Repeat the same sequence for P4, whose required prerequisite is F1 (with F4 only recommended, not required) — confirm P4 unlocks on F1 alone, independent of F4's own completion state.
5. Attempt a direct URL to a nonexistent lesson id, e.g. `/#/academy/F4/F4.M9.L1`, and confirm it redirects to `/#/academy/F4` rather than erroring.

### 3.8 Desktop and mobile layouts

1. At a desktop width (≥1280px), open an F4 lesson and the Repair Workshop result screen; confirm the layout uses the full width sensibly (no excessive whitespace, no horizontal scroll) and the 3D lab's part-highlight panel is legible alongside the model.
2. Using DevTools' device toolbar (or an actual phone), set a mobile viewport (375×667, e.g. iPhone SE) and repeat: open `/#/academy/F4`, a lesson, a quiz, a numeric-input practical, the Repair Workshop, and the 3D lab. Confirm: no horizontal overflow/clipping, numeric input fields are usable with a mobile keyboard, the 3D lab's canvas resizes to the viewport rather than being cut off, and navigation (course/module/lesson breadcrumbs) remains reachable without a desktop-only hover menu.
3. Confirm the retry button on the Repair Workshop result screen and the Enrol/quiz-submit buttons are large enough to tap reliably at the mobile width (no two adjacent controls closer than a comfortable tap target).

## 4. What is and is not claimed here

- **Claimed:** the routes, data-testids, evidence wiring, prerequisite logic and numeric-tolerance values referenced above are read directly from this build's source (`routes.ts`, `AcademyPages.tsx`, `logic.ts`, `progressStore.ts`, the F4/P4 content files, `RepairWorkshopPage.tsx`) as of commit d9fd3d5, so the script above is accurate to what the code actually does.
- **Not claimed:** that any of the above was exercised in a live, rendered browser. No screenshots, console logs or interaction recordings exist for this phase's F4/P4/Repair Workshop acceptance, because no such browser was reachable from this session.

## 5. Recommendation

Phase 9's implementation (Repair Workshop retrofit, F4, P4) is code-complete, regression-clean (tsc, oxlint, vitest 474/474, production build with correct per-course chunks), and architecturally and curriculum-conformant per the earlier review. The one remaining gap is genuinely interactive browser verification, which requires either: (a) running the script in §3 on a machine with a real browser and this repository, or (b) a future session in an environment with an actual reachable browser connection. Phase 10 should not begin until that verification is completed and reviewed, per the standing instruction.
