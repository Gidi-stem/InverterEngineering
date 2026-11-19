# Phase 9 — final manual browser acceptance verification: results

## 1. What changed since the previous report

`docs/PHASE-9-FINAL-ACCEPTANCE.md` (committed as `1890300`) correctly reported that browser automation could not reach the app, because this sandbox has no inbound/public URL. That blocker has since been resolved with your approval: the Phase 9 build was deployed to GitHub Pages, and the connected Chrome browser (device `ed82efa4-…`, Windows) was used to drive it directly. **This document supersedes the "not performed" status in §1 of the previous report for the tests listed below; the previous report's manual test script remains valid for anyone who prefers to run it locally.**

- **Deployed build:** `dist/` output of commit `1890300` (the approved baseline — no source files were changed to produce this build).
- **Live URL:** `https://gidi-stem.github.io/InverterEngineering/`
- **Deployment branch:** `gh-pages` (orphan branch holding only the static build; `main` is untouched).
- **Browser used:** the user's own Chrome, via the Claude in Chrome extension — a real browser, not a headless shim.
- **Git state at time of testing:** `main` at `1890300`, working tree clean, confirmed again after testing (no source changes were made).

## 2. Scope actually exercised, and scope not reached

Per your instruction, nothing below is reported as passed unless it was actually clicked through in the live browser. Two structural facts shaped what could be reached in this pass:

- **F4, P4 and the Repair Workshop all gate behind completed prerequisite courses** (F4 and the Repair Workshop require F1 *and* F2 passed; P4 requires F1 passed). This is correct, intended behaviour — not a defect — but it means that reaching their *unlocked* interior (taking F4's own quizzes, disassembling the P4 model, running a repair scenario) as a real student requires first passing F1 and F2 in full: 24 lessons, 8 module quizzes, 8 assignments, multiple practical tasks and two examinations.
- Completing that full prerequisite chain by genuine UI interaction in one sitting was not undertaken in this pass — it is a multi-hour task in its own right, and I was not going to compress it by faking progress or skipping steps.

What this pass *did* do, and why it still constitutes real coverage: the lesson engine, quiz engine, numeric-question validator, pass-threshold logic, evidence recorder and progress store are the same shared components across every course (confirmed by reading `src/content/academy/logic.ts`, `src/store/progressStore.ts` and the `Question`/`PracticalTask` types) — F1, F4 and P4 all render through the identical `LessonPage`, quiz and exam components. Exercising them live on F1, which is reachable from a blank profile, is therefore real evidence about the code F4 and P4 also run — but it is evidence by shared implementation, not a substitute for driving F4/P4/Repair Workshop's own unlocked screens, and the table below marks those specifically as **not reached**, not as passed.

## 3. Results

| # | Test | Expected result | Actual result | Status |
|---|------|------------------|----------------|--------|
| A.1 | Deploy reachability | Built app loads at a public URL | Loaded correctly at `https://gidi-stem.github.io/InverterEngineering/`; dashboard rendered with real data (0/127 lessons, 10 badges, waveform bench) | **PASS** |
| A.2 | Console errors on load | No JS errors | `read_console_messages` (onlyErrors) after a fresh reload: none | **PASS** |
| A.3 | Course navigation / lesson rendering | Lesson renders all sections | `F1.M1.L1` opened directly; all 14 sections rendered (objectives, intro, lecture, technical notes, diagrams, formulas, worked examples, applications, common mistakes, interactive demo, lab activities, knowledge check, summary, homework) | **PASS** |
| B.1 | F4 course page (locked state) | Shows locked banner, correct unlock requirement, full module/lesson structure still visible | `/#/academy/F4` showed "Locked: pass F2 first", a link to F2, and all 5 modules / lessons / quiz / assignment / practical-task labels rendered correctly under the lock | **PASS** |
| B.2 | F4 direct lesson URL while locked | Lesson content replaced by the same lock gate, not bypassed | `/#/academy/F4/F4.M1.L1` navigated to directly — showed the lock gate, no lesson content leaked | **PASS** |
| B.3 | F4 unlocked interior (own quizzes, numeric practicals, exam) | — | Requires F2 passed first; not reached in this pass | **NOT REACHED** |
| C.1 | P4 unlocked interior (3D disassembly within P4, practical assessment, exam) | — | Requires F1 passed first; not reached in this pass (see §4 for the 3D disassembly gate, which *was* exercised directly in the 3D Lab) | **NOT REACHED** |
| D.1 | 3D Lab — Explore mode | Model loads, parts list populates, camera controls work | `/#/lab-3d?model=lf3k` — LF-3K hybrid inverter model rendered in WebGL with a full parts list (chassis/earth, terminal block, power board…), Explode slider, Labels/Connections toggles | **PASS** |
| D.2 | 3D Lab — Disassemble mode, prerequisite gate | Disassembly blocked until F1 passed | Clicking "Disassemble" showed "Complete the prerequisite course first" with a link to F1; Explore/Identify stayed open | **PASS** |
| D.3 | 3D Lab — Identify challenge, part-level hit detection | Clicking the wrong part names the part actually clicked; unlimited attempts as stated | Challenge started ("Prompt 1 of 8", live timer); clicking the wrong region returned "Not that one: you clicked the Battery terminal – (black). Infinity attempts left for this prompt." — precise, not generic | **PASS** |
| E.1 | Numeric assessment — correct answer | Accepted within stated tolerance, explanation shown | Q4 ("Power drawn by a 12 Ω resistor on 12 V") answered `12` → "Correct. I = 1 A; P = 12 × 1 = 12 W." | **PASS** |
| E.2 | Numeric assessment — incorrect answer | Rejected, correct value and working shown | Q1 answered `99` against a true answer of 5 A (±1 %) → "Not correct. The answer is 5 A (±1 %). I = 230/46 = 5 A." | **PASS** |
| E.3 | Mixed-score pass threshold | Lesson completes at ≥70% even with one wrong answer | 3/4 (75%) scored → "Knowledge check passed" banner shown, lesson marked complete | **PASS** |
| F.1 | Progress persistence — course/lesson level | Survives a hard reload | After F5 reload: course page showed "✓ passed" on M1.L1, "1/3 lessons", "Enrolled" — all correct | **PASS** |
| F.2 | Progress persistence — underlying store | Data genuinely durable (IndexedDB), not an in-memory artifact | Read the `keyval-store` IndexedDB database directly: `completedLessons: ["F1.M1.L1"]`, the exact submitted answers (`{k1:99,k2:0,k3:0,k4:12}`), score `3/4`, enrolment record, module-visit timestamps — all present after reload | **PASS** |
| F.3 | In-lesson quiz widget rehydration | *(not a stated requirement — recorded as a finding; see §4)* | The knowledge-check form itself resets to blank/unanswered inputs on reload, even though the authoritative "passed" status is correct everywhere else | **FINDING (minor)** |
| G.1 | Prerequisite enforcement — exam direct URL | Exam blocked with a precise reason, not a blank page or crash | `/#/academy/F1/exam` with modules incomplete showed a per-module requirements breakdown ("Electricity and its hazards: lessons 1/3, quiz ✗, assignment ✗, practicals 0/1" …) instead of exam questions | **PASS** |
| G.2 | Prerequisite enforcement — Repair Workshop route | Blocked until F1 and F2 both passed | `/#/repair` showed "Complete the prerequisite courses first", listing F1 and F2 by name with links | **PASS** |
| H.1 | Repair Workshop — scenario completion, retry, eight-category rubric | — | Blocked behind F1+F2 (see G.2); not reached in this pass | **NOT REACHED** |
| I.1 | Responsive / mobile layout | Usable at mobile viewport widths | `resize_window` to 390×844 reported success, but `window.innerWidth` read back as 1707 (unchanged) — the tool did not actually change the browser's rendering viewport in this session | **NOT VERIFIED — tooling limitation** |
| I.2 | Responsive layout — static evidence | — | Source check: Tailwind responsive classes (`sm:`/`md:`/`lg:`) are present in the Academy, Repair Workshop and 3D Lab page components (`AcademyPages.tsx`, `RepairWorkshopPage.tsx`, `Lab3DPage.tsx`, `TaskRunner.tsx`, `Demos*.tsx`) | **STATIC CHECK ONLY — not a substitute for I.1** |

## 4. Findings

**Finding 1 (minor, cosmetic): the in-lesson knowledge-check widget does not rehydrate after a reload.**
After passing `F1.M1.L1`'s knowledge check and reloading, the course page, sidebar and progress store all correctly show the lesson as passed (§F.1–F.2). But the knowledge-check form itself, inside the lesson page, redisplays as blank/unanswered ("0/4 answered") rather than showing the previous answers in a disabled, already-passed state. A student who revisits a passed lesson would briefly see an unanswered-looking quiz above a "Knowledge check passed" banner — confusing, but not a data-loss or correctness defect: the authoritative record is intact and correct everywhere it is checked. I have not changed any code for this, per your instruction not to modify the Phase 9 implementation without your direction; I'm flagging it as a candidate for a small, separately-scoped fix if you want one.

**Finding 2: `resize_window` did not change the actual rendering viewport in this session.**
The tool reported success, but `window.innerWidth` read back unchanged at desktop width after the call. This means the mobile-layout test (I.1) could not be genuinely exercised through this browser connection, and I'm not claiming it passed. The one thing I can offer in its place — a static check that responsive classes exist in the relevant components (I.2) — is evidence of intent, not of rendered behaviour, and I've labelled it as such.

**No regressions, no console errors, and no source changes.** `main` is unchanged at `1890300`; only a new orphan `gh-pages` branch was added for hosting. `git status` is clean.

## 5. Recommendation

The mechanics that matter most — numeric-tolerance grading with correct/incorrect feedback, mixed-score pass thresholds, prerequisite gating enforced at the course page, the lesson page, the exam route and the Repair Workshop route (including against direct URL navigation), and durable IndexedDB persistence across reloads — are now demonstrated working in a real browser against the deployed Phase 9 build, not merely asserted from code reading or regression-test output.

Two things remain genuinely open, and I'd rather say so than round them up:
1. **F4's, P4's and the Repair Workshop's own unlocked screens** (their quizzes, P4's actual disassembly sequence, a completed repair scenario with retry) were not driven live in this pass, because reaching them honestly requires first completing F1 and F2 in full. If you want that level of end-to-end coverage, I can continue and work through F1 and F2 to unlock them — it's a large but mechanical task, and I'd flag it as a separate, bounded piece of work rather than folding it silently into this report.
2. **Mobile/responsive rendering** could not be verified through this browser connection (Finding 2). If you want this checked properly, the practical options are: a real mobile device with the Chrome extension, or DevTools' device-emulation toolbar driven manually.

Everything else requested — course navigation, lesson rendering, quizzes/numeric assessments, 3D component interaction and its disassembly gate, progress persistence, and prerequisite enforcement including direct-URL access — has been verified against the live deployment, with the evidence recorded above. I have not started Phase 10, and I have not implemented authentication, registration, cloud sync or an admin dashboard.

## 6. Note for future student-identity / enrolment architecture

Nothing found in this pass changes anything about course content or logic, but one operational fact is worth carrying into the wider academy-architecture planning you've deferred to later: progress is keyed entirely to the browser's local IndexedDB (`inverter-lab-progress`), with no student identity attached to a record at all — the enrolment record captured in §F.2 (`{"courseId":"F1","at":...}`) has no student field. That's expected and correct for Phase 9's scope, but it means today's records are tied to a device/browser profile, not a person, and will need to be given an owner once student identity, enrolment and competency-record ownership are designed — consistent with what Phase 9's own acceptance report already flagged as out of scope here.
