# Prerequisite Matrix

Companion to `docs/PHASE-7-ACCEPTANCE-REVIEW.md` §1. Two independent gate mechanisms exist, and both are listed below for every course and practical activity:

- **Course-page gate** (`courseUnlock()` in `content/academy/catalogueLogic.ts`) — controls whether a course's own lessons/quizzes/assignment/exam pages open in the Learning Academy. Driven by `Course.prerequisites`.
- **Lab-area gate** (`gateStatus()` in `content/academy/gates.ts`) — controls whether a practical workspace (circuit lab, build, solar, the 3D lab's guided procedure) opens, independent of how the student navigated there. Driven by `requiredCourses(area, exerciseId?)`.

A course or activity with "— none —" in a column has no gate of that kind: it is reachable with no prior progress.

## Courses (course-page gate)

| Course | Prerequisite(s) | Notes |
|---|---|---|
| F1 — Electrical Safety and Fundamentals | — none — | Entry point; cannot gate itself. |
| F2 — DC Electrical Systems and Fundamentals | F1 | |
| S1 — Inverter Design and Construction | F1, F2 | Recommended (non-blocking): F2 |
| S2 — Solar and Hybrid Engineering | F1, F2 | Recommended (non-blocking): S1, P5 |
| F3–F5, P1–P5, S3–S5 (11 courses) | n/a | Still "scheduled" placeholders (no lessons/practicals to gate yet); authored in later phases. |

## Practical activities (lab-area gate)

| Activity / exercise | `PracticalArea` | Required course(s) | Where it's reached |
|---|---|---|---|
| `f1-hazards-bench` (hazard ID, F1.M1) | n/a — part of F1 itself | F1's own course-page gate only | Academy → F1 |
| `f1-isolation-sequence` (sequence, F1.M3) | n/a — part of F1 itself | F1's own course-page gate only | Academy → F1 |
| `f1-prove-dead` (procedure, F1.M3) | n/a — part of F1 itself | F1's own course-page gate only | Academy → F1 |
| `f1-stored-energy` (calc, F1.M2) | n/a — part of F1 itself | F1's own course-page gate only | Academy → F1 |
| `f1-protection` (calc, F1.M4) | n/a — part of F1 itself | F1's own course-page gate only | Academy → F1 |
| `ckt-01` (circuit exercise, F2.M2) | `circuit` | **F1 only** | Circuit lab, `#/circuit-lab?ex=ckt-01` |
| `ckt-02` (circuit exercise, F2.M5) | `circuit` | **F1 only** | Circuit lab |
| `ckt-03` (circuit exercise, F2.M4) | `circuit` | **F1 only** | Circuit lab |
| `sim-01` (simulator activity, F2.M4) | `circuit` | **F1 only** | Circuit lab (simulator mode) |
| `sim-02` (simulator activity, F2.M4) | `circuit` | **F1 only** | Circuit lab (simulator mode) |
| `f2-units` (calc, F2.M1) | n/a — part of F2 itself | F2's own course-page gate (→ needs F1 complete) | Academy → F2 |
| `f2-circuit-analysis` (calc, F2.M3) | n/a — part of F2 itself | F2's own course-page gate (→ needs F1 complete) | Academy → F2 |
| `f2-dc-design` (calc, F2.M5) | n/a — part of F2 itself | F2's own course-page gate (→ needs F1 complete) | Academy → F2 |
| All other circuit-lab exercises (non-F2) | `circuit` | **F1 + F2** | Circuit lab |
| `bld-a` … `bld-h` (8 build projects) | `build` | **F1 + F2** | Build → Circuit lab (`#/circuit-lab?ex=bld-*`) |
| `lab3d:discharge` activity | n/a (activity evidence) | **F1 + F2** (the build gate it's evidenced against) | 3D lab |
| `sim:sim-10` activity | `circuit`/`build` context | **F1 + F2** | Circuit lab / simulator |
| 3D lab guided disassembly/reassembly procedure | `lab3d-procedure` | **F1 only** | 3D lab, procedure tab |
| 3D lab explore / identify modes | n/a | — none — | 3D lab |
| `solar:iv`, `solar:design-ok`, `solar:commission`, `solar:sim` | `solar` | **F1 + F2** | Solar laboratory |
| `solar:fault:shading`, `:voc-cold`, `:cable-drop`, `:gen-threshold` | `solar` | **F1 + F2** | Solar laboratory, troubleshooting tab |
| Component Library, academy lesson reading | n/a | — none — | Never gated. |

## Circularity check

No course or practical activity appears, directly or transitively, in its own prerequisite chain:

- F1 requires nothing.
- F2's course page requires F1 (not F2). F2's own circuit-lab practicals require F1 (not F2) — this is the one case the review brief specifically asked to be checked, since F2's practicals could otherwise have been mistakenly gated behind F2's own completion. They are not.
- S1/S2 and the remaining Build/Solar/3D-procedure practicals require F1+F2 (never S1, S2, or themselves).

A student can therefore always reach every activity needed to complete a course without first having completed that same course.
