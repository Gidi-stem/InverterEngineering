# Assessment Integrity Report

Companion to `docs/PHASE-7-ACCEPTANCE-REVIEW.md` §2. This reviews how the platform records lesson completion, knowledge-check results, exam attempts, practical assessment evidence, course completion and competency records, and specifically whether opening content alone can ever award credit.

## The two progress-store slices, and why the separation matters

`src/store/progressStore.ts` keeps two structurally separate pieces of state:

- **`moduleVisits`** — written only by `visitModule(id)`, a timestamp per module id. This is "studied" tracking: it answers "has this module been opened," nothing more. Nothing that grants credit reads it.
- **`activities`** (and `attempts`) — written only by `recordActivity(a)` / `recordAttempt(a)`, each an explicit, typed event (a task response, a quiz/exam attempt, a circuit-lab/simulator exercise pass). `evidenceMet()`, `bestScore()`, and therefore every completion/credit function, read only these.

A student visiting a module (opening a lesson, a lab tab, a practical page) updates `moduleVisits` at most — never `activities`. Credit requires an entry in `activities`/`attempts`, which is only written by an explicit, graded action.

Confirmed directly in the solar laboratory (`EnergyTab.tsx`): `record({ activityId: 'solar:sim', ... })` is called only inside the handler bound to the "Run" button's `onClick`, not in any mount-time effect — opening the Energy tab does not itself record the activity.

## Lesson completion

`lessonDone(p, l) = lessonAuthored(l) && bestScore(p, 'check', l.id) >= 0.7` (`LESSON_CHECK_PASS`). A lesson is only "done" once its knowledge check has been attempted and scored at least 70% on the best attempt — opening the lesson page records nothing toward this.

## Knowledge checks, quizzes and exams

- Module quizzes: `quizAvailability()` enforces 3 attempts per rolling 24-hour window; `moduleStatus().quizPassed` is based on the best recorded attempt against `m.quiz.pass`, not the act of starting a quiz.
- Exams: `examStatus()` is similarly attempt-limited and windowed (`c.exam.attempts`, `c.exam.cooldownHours`) and based on best recorded score against `c.exam.pass`.
- Assignments: `bestScore(p, 'assignment', m.assignment.id) >= 0.7` is required for module completion; self-reviewed against model answers (stated in `docs/ARCHITECTURE.md` §14 as a known limitation — not stored or teacher-marked — but still requires an explicit submitted attempt, not merely opening the assignment).

## Practical task marking (strict, no partial credit on failure)

`markTask()` (`content/academy/logic.ts`) marks each of the four task kinds strictly:

- **`sequence`** — the student's submitted order must exactly match the correct order; any distractor step included, any required step missing, or any wrong ordering fails the attempt outright.
- **`hazards`** — the student must select exactly the hazardous items in the scene; one missed hazard or one incorrectly flagged safe item fails the attempt.
- **`procedure`** — the student chooses actions one at a time against a simulated scene; choosing an unsafe action fails immediately regardless of what follows, and otherwise both the full required-action subsequence and the final conclusion must be correct.
- **`calc`** — every question in the attached question set must be answered correctly (`markAll`, no partial credit).

None of these can be passed by opening the task page without submitting a qualifying response — `<TaskRunner>`/`<QuestionSet>` only call `recordAttempt`/credit logic once the student actually submits, and `PracticalPage` is what wires a passed attempt into the module's evidence/credit rules.

## Practical competency credit (double-gated)

`practicalCredited(p, m, x) = evidenceMet(p, x.evidence) && moduleStatus(p, m).quizPassed`

A practical is credited only when **both**:

1. Its specific evidence condition is met — a passed task (`kind: 'task'`), a passed circuit-lab/simulator exercise check (`kind: 'exercise'` / `'activity'`), or a marked-complete build/design project (`kind: 'project'`) — each of these is itself an explicit, graded event, never a page-open.
2. The module's own quiz has also been passed.

This means a student cannot obtain practical competency credit merely by opening a lab activity or triggering a simulation step without satisfying the real assessment criteria tied to it — both the specific evidence and the module quiz are required, independently of each other.

## Course completion and competency record

- `courseComplete(p, c) = c.status === 'published' && every module complete (lessons done + quiz passed + assignment ≥ 70% + every practical's evidence met) && exam passed`.
- `competencyRecord()` derives `none` / `awareness` / `applied` / `virtual-competency` levels purely from the functions above — awareness requires at least one lesson check passed; applied requires every module's quiz passed and every practical's evidence met; virtual-competency requires full `courseComplete` on every course mapped to that competency unit, including the exam. None of these levels can be reached by visiting pages alone.

## Conclusion

No path was found, in any gated page or in the marking/completion functions themselves, by which opening a lesson, a lab tab, or a practical page — without satisfying its actual assessment criteria — awards lesson completion, quiz/exam credit, practical evidence, course completion, or competency credit. The `moduleVisits` / `activities` separation is the structural guarantee underlying this: "studied" and "credited" are different state, written by different code paths, and only the latter is read by any completion function.
