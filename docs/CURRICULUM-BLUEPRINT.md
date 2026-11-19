# Inverter Engineering Lab: Master Curriculum and Competency Blueprint

Version 2.0, updated at the start of Phase 7 (approved decisions: fourteen-phase roadmap; F1 and F2 mandatory and delivered before the solar laboratory). Version 1.0 was prepared with Phase 6. This document defines the complete learning programme. It covers:
- what is taught, in what order, and with which prerequisites;
- how every lesson is structured and how each one uses the platform's engineering tools;
- how learning is assessed, and how competencies are recorded.

It also identifies the educational gaps in Phases 1–5 and schedules the work to close them.

> **Scope statement.** The academy develops knowledge and virtual practical skill from complete beginner to advanced inverter engineering. Simulated practice is not a qualification. Work on real batteries, inverters, PV arrays and mains installations requires supervised physical training and the qualifications required locally. Every course states this, and competency records are labelled "virtual competency".

---

## 1. Programme structure

| Stage | Level | Purpose | Courses |
|---|---|---|---|
| **Foundation** | Beginner | Safety, electrical principles and components for learners who have never studied electricity | F1–F5 |
| **Practitioner** | Intermediate | Circuits, power electronics, inverter principles, real inverter anatomy, batteries | P1–P5 |
| **Specialist** | Advanced | Design, construction, solar/hybrid systems, installation, testing, maintenance and repair, capstone | S1–S5 |

**Hierarchy:** programme → course → module → lesson → sub-lesson (sections of the lesson standard, §3).

**IDs:** course `F1`, module `F1.M2`, lesson `F1.M2.L3`. Existing platform lesson ids (`fun-*`, `l3d-*`, `cmp-*`, `ckt-*`, `bld-*`, `asm-*`) remain and are mapped to academy lessons (§6), so existing progress carries over.

### 1.1 Course map and prerequisites

| Course | Title | Level | Required prerequisites | Recommended | Main platform resources | Authored in |
|---|---|---|---|---|---|---|
| F1 | Electrical Safety and Fundamentals | Beginner | none (**mandatory first course**) | — | Academy practical assessments (isolation drill, prove-dead drill, hazard identification, protection sizing), 3D lab (view), library (fuse, breaker, PE) | **Phase 7 (done)** |
| F2 | DC Electrical Systems and Fundamentals | Beginner | F1 | — | Circuit lab (ckt-01…03), simulator (sim-01, sim-02), academy calculation tasks | **Phase 7 (done)** |
| F3 | AC Electrical Fundamentals | Beginner | F2 | — | Simulator (AC source, AC analysis, sim-03/04/08), waveform bench, transformer models (ckt-07), Phase 8 instruments | **Phase 8 (done)** |
| F4 | Electronic Components for Inverter Engineering | Beginner → Intermediate | F2 | F3 | Component library (24 entries, test procedures, comparisons), 3D lab, circuit lab, Phase 9 workshop | **Phase 9 (done)** |
| F5 | Measurement and Virtual Instruments | Beginner → Intermediate | F1, F2 | F3 | Phase 8 virtual instruments, library test procedures, simulator oscilloscope | **Phase 8 (done)** |
| P1 | Circuit Analysis and Construction | Intermediate | F2 | F4 | Circuit lab (editor, checks, exercises ckt-01…10) | Phase 10 |
| P2 | Power Electronics Fundamentals | Intermediate | F3, P1 | F4 | Simulator (sim-03…08), circuit lab, thermal and loss tools | Phase 10 |
| P3 | Inverter Principles | Intermediate | P2 | — | Simulator (sim-08…10), waveform bench, Fundamentals lessons fun-01…07 | Phase 10 |
| P4 | Inside a Real Inverter | Intermediate | F1 | F4 | 3D lab (LF-3K, SQ-1K), guided disassembly/reassembly, asm-01, Phase 9 workshop | **Phase 9 (done)** |
| P5 | Battery Engineering and Energy Storage | Intermediate | F1, F2 | S2 | Phase 11 battery laboratory, solar lab battery sizing, library battery terminals | Phase 11 |
| S1 | Inverter Design and Construction | Advanced | F1, F2 | P2, P3, P4 | Build lab (bld-a…h), configurator, compatibility, test suite, simulator | **Phase 6 (done)** |
| S2 | Solar PV and Hybrid Engineering | Advanced | F1, F2 | S1, P5 | Phase 7 Solar and Hybrid Engineering Laboratory (load profile → complete system design, PV I–V lab, 24 h energy management, troubleshooting, commissioning), bld-g, bld-h | Phase 7 |
| S3 | Installation and Commissioning | Advanced | F1, F2 | S2, F5 | Phase 12 installation and commissioning laboratory, solar lab designs, instruments | Phase 12 |
| S4 | Advanced Diagnostics and Professional Repair | Advanced | F1, F2 | F5, P4, S1 | Phase 9 repair workshop (17 scenarios), Phase 13 advanced diagnostics, instruments | Phase 13 |
| S5 | Maintenance, Standards and Professional Practice (with capstone) | Advanced | S1, S2, S3, S4 | all | Phase 14 maintenance planner, standards and documentation, capstone and certification | Phase 14 |

**Progression rules (enforced):**
- **F1 is mandatory** before any practical laboratory activity involving electrical systems: the circuit laboratory, the simulator experiments, the build projects, the solar and hybrid laboratory, and the guided disassembly, discharge and reassembly procedures of the 3D laboratory. Reading the library and exploring the 3D models remain open, because they are study, not practice.
- **F2 is mandatory** before DC circuit construction, battery engineering and solar/battery practical activities: all circuit-lab exercises and experiments except F2's own practical tasks (ckt-01, ckt-02, ckt-03, sim-01, sim-02, which need F1 only), the build projects, the solar and hybrid laboratory and the Phase 11 battery laboratory.
- A course's lessons, quizzes and examination open when all its required prerequisite courses are passed. Recommended courses are shown as advice, never as locks.
- Passing a course means: every lesson's knowledge check passed (≥ 70 %), every module quiz (≥ 70 %; **≥ 80 % in F1**) and assignment (≥ 70 %) passed, every practical assessment completed, and the formal examination passed (≥ 70 %; **≥ 80 % in F1**).
- Within a course, a module's practical tasks are credited after its quiz is passed. Existing laboratory progress always remains valid and keeps its date.
- A required prerequisite that is not yet authored is shown as recommended until it is published. By the end of Phase 14 every course is authored, so this rule then no longer applies.

---

## 2. Course, module and lesson map

Notation: **L** = lesson. Sub-lessons are the standard sections of §3. *Tools* lists the integrated activities. Lessons marked ★ already have assessed practical activities on the platform.

### F1 Electrical Safety and Fundamentals (Beginner): mandatory first course, Phase 7
| Module | Lessons | Tools and practical assessments |
|---|---|---|
| F1.M1 Electricity and its hazards | L1 Voltage, current, resistance and the circuit · L2 How electric current harms the body · L3 Shock, arc flash, burns and fire | Ohm's-law body-current calculator demonstration; practical: hazard identification on a workbench scene |
| F1.M2 Energy sources and stored energy | L1 Batteries: short-circuit current, gases and chemicals · L2 Capacitors and inductors: stored energy · L3 Multiple sources: PV arrays, grid, generators and back-feed | Capacitor discharge demonstration; library fuse, capacitor, solar input; practical: stored-energy and discharge-time assessment |
| F1.M3 Safe isolation | L1 Isolation and lock-out/tag-out · L2 Proving dead · L3 Capacitor discharge and verification | Practicals: safe-isolation sequence drill, prove-dead drill with a virtual voltage tester |
| F1.M4 Protection, earthing and workshop practice | L1 Fuses and circuit breakers · L2 Earthing, bonding, RCDs and insulation · L3 Workshop practice: PPE, tools, measurement categories and risk assessment | Library fuse, breaker, PE, comparison fuse vs breaker; practical: protection selection assessment |

F1 passes at 80 % (quizzes and examination), reflecting its safety role.

### F2 DC Electrical Systems and Fundamentals (Beginner): mandatory before DC, battery and solar practicals, Phase 7
| Module | Lessons | Tools and practical assessments |
|---|---|---|
| F2.M1 Charge, current and voltage | L1 Charge, conductors and insulators · L2 Current and voltage · L3 Units, prefixes and engineering notation | Circuit lab node voltages; practical: unit-conversion assessment |
| F2.M2 Resistance, Ohm's law and power | L1 Resistance and resistivity · L2 Ohm's law · L3 Power, energy and heat | ckt-01 ★, Ohm's-law demonstration; library resistor |
| F2.M3 Circuits | L1 Series circuits and voltage dividers · L2 Parallel circuits and current dividers · L3 Kirchhoff's laws and combination circuits | Circuit-solver demonstration; practical: circuit analysis assessment |
| F2.M4 Energy storage and time | L1 Capacitors and the RC time constant · L2 Inductors and the RL time constant | sim-01 ★, ckt-03 ★, sim-02 ★ |
| F2.M5 DC sources and DC systems | L1 Batteries as sources: EMF, internal resistance, capacity, series and parallel · L2 DC system wiring: conductor size, voltage drop, fusing and polarity · L3 Diodes and LEDs: one-way valves and current limiting | ckt-02 ★, voltage-drop demonstration; practical: DC system design assessment |

### F3 AC Electrical Fundamentals (Beginner)
| Module | Lessons | Tools |
|---|---|---|
| F3.M1 Alternating quantities | L1 Why AC is used (fun-01†) · L2 Sine waves: amplitude, period, frequency, phase · L3 Peak, average and RMS (derivation of V_pk/√2) · L4 Non-sinusoidal waveforms (square, modified, PWM) | Waveform bench, simulator AC source + oscilloscope, build bld-b/bld-d |
| F3.M2 Reactance and impedance | L1 Capacitive reactance · L2 Inductive reactance · L3 Impedance and phasors (with complex numbers introduced gently) · L4 Resonance and filters (AC analysis Bode) | Library capacitor/inductor + LCR meter, build bld-d |
| F3.M3 AC power | L1 Real, reactive and apparent power (fun-06†) · L2 Power factor and current lag · L3 Harmonics and THD (fun-05†) · L4 Energy returned by reactive loads ★ (sim-08) | sim-08 ★ (linked) |
| F3.M4 Transformers | L1 Mutual induction and turns ratio · L2 Ideal vs real transformers (winding resistance, magnetising current, saturation) · L3 Isolation and safety · L4 Transformer connection ★ (ckt-07) | ckt-07 ★ (linked), library transformer, insulation tester |
| F3.M5 Rectification | L1 Half-wave and full-wave · L2 Bridge rectifier ★ (sim-03, ckt-04) · L3 Smoothing and ripple ★ (sim-04, ckt-05) | sim-03/04 ★ (linked), ckt-04/05 ★ (linked) |

**Authored (Phase 8):** all ★ cross-references into the simulator (`sim-*`) and circuit lab (`ckt-*`) are live `ToolLink`s in the authored lessons. †The three `fun-*` Fundamentals-module references were unresolved at Phase 8 acceptance review and are now live: a `fundamentals` `ToolLink` kind was added (`content/academy/types.ts`, `routes.ts`, `linkExists()`), and F3.M1.L1 (fun-01), F3.M3.L1 (fun-06) and F3.M3.L3 (fun-05) each now link the standalone Fundamentals module (`content/modules.ts`, route `/fundamentals`) alongside the Virtual Instruments/library/circuit links they already had — the module is a real, published, `status: 'live'` section of the platform, not infrastructure that needed building. Lessons there aren't individually deep-linkable (the module page lists the whole sequence), so the link targets the module page as a whole; this was judged sufficient rather than adding per-lesson routing for a cross-reference. See PHASE-8-REPORT.md.

### F4 Electronic Components for Inverter Engineering (Beginner → Intermediate)
| Module | Lessons | Tools |
|---|---|---|
| F4.M1 Passive components | L1 Resistors: types, codes, power, tolerance · L2 Capacitors: electrolytic, film, ceramic; ESR; polarity · L3 Inductors: cores, saturation, current rating · L4 Testing passives (meter, LCR, ESR) | Library resistor/capacitor/inductor + procedures, comparison capacitor-types, 3D parts |
| F4.M2 Semiconductor devices | L1 Introduction to semiconductors (doping, PN junction) · L2 Diodes (forward/reverse, V_f, ratings) · L3 Rectification with diodes · L4 MOSFETs (structure, V_th, R_DS(on), body diode) · L5 IGBTs (V_CE(sat), tail current) · L6 Gate drivers (bootstrap, isolation, dead time) · L7 Switching characteristics and losses · L8 Component testing (diode test, MOSFET/IGBT checks) · L9 Fault identification (short, open, leakage) · L10 Component replacement and compatibility | Library mosfet/igbt/diode/gate-driver + test procedures, comparison mosfet-vs-igbt, 3D q1–q6, circuit lab (ckt-06 ★), simulator sim-05 ★ |
| F4.M3 Magnetic components | L1 Magnetic circuits (flux, B-H, saturation) · L2 Transformers in inverters (LF vs HF) · L3 Output and filter inductors · L4 Testing windings | Library transformer/inductor, comparison transformer-vs-inductor, 3D t1/l1 |
| F4.M4 Protection and switching devices | L1 Fuses (I²t, breaking capacity) · L2 Circuit breakers (thermal, magnetic) · L3 Relays and contactors · L4 Relays vs semiconductor switches | Library fuse/breaker/relay, comparisons fuse-vs-breaker, relay-vs-semiconductor |
| F4.M5 Control, sensing and thermal | L1 PWM controllers vs microcontrollers · L2 Voltage and current sensing · L3 Heat sinks, fans, thermal resistance · L4 PCBs, connectors and terminals | Library control/sensing/thermal entries, comparisons, 3D boards |

**Authored (Phase 9):** all 26 lessons across the 5 modules are fully authored (objectives, introduction, lecture, technical notes, diagrams, formulas, worked examples, applications, common mistakes, demo, activities, knowledge checks, summary, homework), each with real, verified cross-references into the Component Library, 3D Dissection Laboratory, Circuit Lab, Simulator and Repair Workshop. Numerical/calculation-based checkpoints are included throughout, not only multiple-choice. F4.M4 and F4.M5 were authored strictly against this blueprint's exact lesson breakdown (fuses/breakers/relays/relays-vs-semiconductor for M4; PWM/MCU, sensing, thermal, PCBs-connectors-terminals for M5) rather than the earlier syllabus-stub wording. See PHASE-9-REPORT.md.

### F5 Measurement and Virtual Instruments (Beginner → Intermediate)
| Module | Lessons | Tools |
|---|---|---|
| F5.M1 Measurement basics | L1 Accuracy, resolution, uncertainty · L2 Measurement categories (CAT) and probe safety · L3 Recording results | Library instruments |
| F5.M2 Multimeter and clamp meter | L1 Voltage, current, resistance, continuity, diode test · L2 Clamp meters and DC/AC current | Library procedures (Phase 3), Phase 8 instruments |
| F5.M3 Oscilloscope | L1 Time base, V/div, trigger · L2 Measuring frequency, duty, RMS · L3 Spectrum and THD | Simulator oscilloscope (Phase 5) |
| F5.M4 Specialist instruments | L1 Insulation resistance testing · L2 LCR and ESR meters · L3 Thermal imaging and temperature probes | Phase 8 instruments |

### P1 Circuit Analysis and Construction (Intermediate)
| Module | Lessons | Tools |
|---|---|---|
| P1.M1 Reading schematics | L1 Symbols and pin identification · L2 Nodes and the connection graph · L3 Reference (ground) and measurement | Circuit lab inspector, connection graph |
| P1.M2 Analysis methods | L1 Nodal analysis by hand (the method the simulator uses) · L2 Thevenin and Norton equivalents · L3 Superposition · L4 Non-linear devices (piecewise-linear models) | Circuit lab, DC operating point |
| P1.M3 Construction practice | L1 Building and verifying circuits ★ (ckt-01…05) · L2 Fault finding from symptoms · L3 Validation messages and what they mean | Circuit lab exercises ★, checks panel |
| P1.M4 Switching circuits | L1 MOSFET switching circuits ★ (ckt-06) · L2 Half-bridge ★ (ckt-08) · L3 H-bridge ★ (ckt-09) · L4 Basic inverter architecture ★ (ckt-10) | ckt-06…10 ★ |

### P2 Power Electronics Fundamentals (Intermediate)
| Module | Lessons | Tools |
|---|---|---|
| P2.M1 Switching principles | L1 Why switch instead of dissipate (fun-02) · L2 PWM and averaging ★ (sim-06) · L3 Duty cycle and DC-DC conversion (buck, boost) | sim-06 ★, bld-g MPPT buck |
| P2.M2 Switching devices in practice | L1 MOSFET switching ★ (sim-05) · L2 Conduction and switching losses · L3 Thermal design (R_θ, heat sinks) · L4 Gate drive and dead time ★ (sim-07) | sim-05/07 ★, thermal panel |
| P2.M3 Bridges | L1 Half-bridge operation ★ (sim-07) · L2 Full H-bridge ★ (sim-08) · L3 Inductive loads and freewheeling | sim-07/08 ★ |
| P2.M4 Filters and EMI | L1 LC filters and corner frequency (AC analysis) · L2 Ripple and filter sizing · L3 Introduction to EMI and layout | Simulator AC analysis, sim-10 |

### P3 Inverter Principles (Intermediate)
| Module | Lessons | Tools |
|---|---|---|
| P3.M1 From DC to AC | L1 The H-bridge and polarity reversal (fun-03) · L2 Square-wave inverters ★ (sim-09) · L3 Modified sine and harmonic cancellation ★ (sim-09) | sim-09 ★, waveform bench |
| P3.M2 Sine-wave inverters | L1 SPWM generation (unipolar and bipolar) · L2 Output filtering ★ (sim-10) · L3 Feedback and regulation (regulated SPWM) | sim-10 ★, regulated SPWM |
| P3.M3 Ratings and performance | L1 Waveform families and RMS (fun-04) · L2 Harmonics, THD and filtering (fun-05) · L3 Efficiency, losses and heat (fun-07) · L4 Watts, VA and battery current | Simulator energy and thermal panels |

### P4 Inside a Real Inverter (Intermediate)
| Module | Lessons | Tools |
|---|---|---|
| P4.M1 Architecture tour | L1 Enclosure, terminals and earthing (l3d-01) · L2 Power stage (l3d-02) · L3 Magnetics (l3d-03) · L4 Control electronics (l3d-04) · L5 Protection and sensing (l3d-05) | 3D lab panels, library links |
| P4.M2 Safe disassembly and reassembly | L1 Isolation and discharge in practice ★ · L2 Disassembly sequence and why ★ · L3 Reassembly and functional test ★ (l3d-06) | 3D guided procedure ★ |
| P4.M3 Identification | L1 Recognising components on a board ★ (asm-01) · L2 Comparing a square-wave and a hybrid inverter (SQ-1K vs LF-3K) | 3D identification ★, model comparison |

**Authored (Phase 9):** all 10 lessons across the 3 modules are fully authored. Practical evidence is tied to the 3D laboratory's real recorded activity ids (`lab3d:disassembly`, `lab3d:reassembly`, `lab3d:identify`) rather than the legacy, non-Academy `l3d-*`/`asm-*` module lessons, since no generic `ToolLink` kind exists for linking those directly; `lab3d` tool links instead reference real model/part ids on the LF-3K and SQ-1K models. See PHASE-9-REPORT.md.

### P5 Battery Engineering and Energy Storage (Intermediate): Phase 11
| Module | Lessons | Tools |
|---|---|---|
| P5.M1 Battery technology | L1 Lead-acid, LiFePO₄, lithium-ion · L2 Capacity, C-rate, Peukert · L3 State of charge and depth of discharge | Phase 11 battery laboratory |
| P5.M2 DC system design | L1 Cable sizing and voltage drop · L2 Fusing and isolation · L3 Series/parallel banks and balancing | Library battery terminals/fuse, simulator |
| P5.M3 Charging and protection | L1 Charge profiles (bulk/absorption/float, CC/CV) · L2 BMS and low-voltage disconnect · L3 Battery safety and maintenance | Phase 11 charger model |

### S1 Inverter Design and Construction (Advanced): authored in Phase 6
| Module | Lessons | Tools |
|---|---|---|
| S1.M1 Design method and construction safety | L1 Safety in inverter construction: simulation versus certification, isolation, overcurrent protection, capacitor discharge, earthing, thermal safety · L2 From requirements to specification (power, VA, voltages, load) · L3 Design calculations: currents, losses, efficiency · L4 Choosing switches, drivers and controllers (ratings, typical versus manufacturer data) · L5 Transformer, filter, protection and thermal design | Build configurator, compatibility checks, library, 3D discharge |
| S1.M2 Square-wave and modified-sine construction | L1 Basic DC-to-AC inverter (bld-a) ★ · L2 Square-wave inverter (bld-b) ★ · L3 Modified sine-wave inverter (bld-c) ★ | Build lab ★, sim-08, sim-09 |
| S1.M3 Pure sine-wave inverter | L1 The signal chain, DC input stage and DC bus · L2 Gate drivers, dead time and full H-bridge switching · L3 SPWM generation · L4 The LC output filter · L5 Feedback, regulation and output protection · L6 Building the pure sine-wave inverter (bld-d) ★ | Build lab ★, sim-06/07/10, live SPWM demonstration (switching signals → bridge voltage → filtered output) |
| S1.M4 Transformer and high-frequency topologies | L1 Push-pull transformer inverter (bld-e) ★ · L2 High-frequency inverter and the HV DC bus (bld-f) ★ | Build lab ★, 3D T1/C5 |
| S1.M5 Solar and hybrid architectures | L1 Solar inverter: PV input, MPPT stage and battery charging (bld-g) ★ · L2 Hybrid inverter: grid, generator, transfer switching and energy paths (bld-h) ★ | Build lab ★ (Phase 7 extends) |
| S1.M6 Engineering testing and troubleshooting | L1 The engineering test suite and engineering reports · L2 Troubleshooting a constructed inverter | Test suite, build troubleshooting tasks |

S1 contains 20 lessons, six module quizzes, six assignments, eight practical build tasks, eight troubleshooting tasks and a formal course examination. It supplies the evidence for competency unit CU-11.

### S2 Solar PV and Hybrid Engineering (Advanced): Phase 7
A complete solar and hybrid engineering programme. Students design a complete installation from an actual electrical load profile in the Solar and Hybrid Engineering Laboratory.

| Module | Lessons | Tools |
|---|---|---|
| S2.M1 Photovoltaic fundamentals | L1 Solar photovoltaic fundamentals (photovoltaic effect, cells, single-diode model, I–V and P–V curves) · L2 Solar panel construction and specifications (datasheets, STC, NOCT, temperature coefficients, ratings) · L3 PV voltage, current and power calculations (irradiance, temperature, cold V_oc) | Solar lab PV I–V laboratory |
| S2.M2 Arrays, controllers and conversion | L1 Series and parallel panel configurations (strings, mismatch, shading, bypass diodes) · L2 MPPT and PWM charge controllers (perturb and observe, charging stages) · L3 Solar inverter architecture | Solar lab array configuration and MPPT tracking; bld-g ★ |
| S2.M3 System design from a load profile | L1 Load profiles and energy budgets · L2 Solar array sizing · L3 Battery bank sizing | Solar lab load profile, array and battery sizing |
| S2.M4 System types and energy management | L1 Off-grid systems · L2 Grid-connected systems · L3 Hybrid systems and generator integration · L4 Energy management | Solar lab 24 h energy simulation (off-grid, grid-tied, hybrid with generator); bld-h ★ |
| S2.M5 Installation, commissioning and troubleshooting | L1 Installation design and commissioning · L2 Solar system troubleshooting | Solar lab protection, cables and commissioning checklist; troubleshooting scenarios |

### S3 Installation and Commissioning (Advanced): Phase 12
| Module | Lessons |
|---|---|
| S3.M1 Planning | L1 Site survey and load assessment · L2 Equipment location, ventilation, clearances · L3 Single-line diagrams |
| S3.M2 Installation | L1 DC wiring and protection · L2 AC wiring, earthing and RCDs · L3 PV mounting and DC isolation |
| S3.M3 Commissioning | L1 Pre-energisation checks (continuity, insulation, polarity) · L2 Staged energisation · L3 Commissioning records and handover |
| S3.M4 Compliance | L1 Standards and certification (what they are, who certifies) · L2 Documentation and labelling |

### S4 Advanced Diagnostics and Professional Repair (Advanced): Phase 13 (repair workshop from Phase 9)
| Module | Lessons |
|---|---|
| S4.M1 Systematic testing | L1 Test plans · L2 Measuring with virtual instruments on live simulations · L3 Interpreting results |
| S4.M2 Troubleshooting method | L1 Symptom → hypothesis → test → conclusion · L2 Fault trees · L3 Safety during diagnosis |
| S4.M3 Repair workshop | L1–L17 One lesson per repair scenario, each with diagnosis, repair and verification |
| S4.M4 Professional repair practice | L1 Component-level versus board-level repair · L2 Root-cause analysis and failure reports · L3 Verification and return to service |

### S5 Maintenance, Standards and Professional Practice (Advanced): Phase 14
| Module | Lessons |
|---|---|
| S5.M1 Preventive maintenance | L1 Inspection schedules · L2 Fans, filters, terminals and torque · L3 Battery and PV maintenance |
| S5.M2 Standards and professional practice | L1 How standards and certification work · L2 Documentation, records and ethics · L3 Working within one's competence and supervised training |
| S5.M3 Capstone and certification | L1 Capstone brief and requirements · L2 Design, simulation and report · L3 Practical competency tasks, final examination and virtual-competency record |

---

## 3. Lesson standard (every lesson)

Every lesson contains the fourteen sections you specified. The academy page renders them in this order, and authoring is checked by tests: every published lesson must contain them all, with minimum content.

| # | Section | Content requirement |
|---|---|---|
| 1 | Learning objectives | 3–6 measurable objectives ("calculate…", "identify…", "explain…") |
| 2 | Introduction | Why it matters and where it appears in a real inverter |
| 3 | Lecture notes | Full explanation for a learner with no prior study; new terms defined at first use (glossary tooltips) |
| 4 | Technical explanation | Deeper engineering detail: models, assumptions, limits; simplified models clearly labelled |
| 5 | Diagrams | At least one diagram (SVG, schematic, block diagram or live circuit) |
| 6 | Formulas | Formulas with every symbol and unit defined; derivations where needed |
| 7 | Worked examples | At least two, step by step, with substituted numbers and a sanity check |
| 8 | Applications | Real engineering use, with typical values labelled "typical" |
| 9 | Common mistakes | Misconceptions and errors, each with the correction |
| 10 | Interactive demonstration | An embedded or linked live tool activity (circuit, simulation, 3D, library) |
| 11 | 3D / laboratory activities | Deep links into the 3D lab, library entries, test procedures, circuit exercises, experiments or build projects |
| 12 | Knowledge check | 3–6 auto-marked questions with feedback; unlimited attempts (formative) |
| 13 | Summary | Key points |
| 14 | Homework / assignment | Calculation, design or written task; auto-marked parts plus model answer for self-review |

---

## 4. Assessment framework

| Instrument | Where | Marking | Pass mark | Attempts and feedback |
|---|---|---|---|---|
| Knowledge check | End of every lesson | Auto (multiple choice, numeric with tolerance) | n/a (formative) | Unlimited; immediate explanation |
| Module quiz | End of every module | Auto, drawn from the module question bank | 70 % (F1: 80 %) | 3 attempts, feedback after each; best score recorded |
| Assignment | Per lesson or module | Auto for numeric and structured parts; model answer for written parts | 70 % of auto-marked parts | Unlimited resubmission; history kept |
| Practical laboratory task | Per module | Verified by the tool: 3D procedure completed, circuit exercise passed, experiment observations, build project tests | All required criteria | Unlimited; each attempt logged |
| Formal examination | End of every course | Auto, timed, wider question bank, no feedback until submitted | 70 % (F1: 80 %) | 3 attempts, 24 h cool-down; score, date and per-topic feedback recorded |
| Competency assessment | Per competency unit (§5) | Combination of required practicals plus exam topics | All evidence present | Recorded as "virtual competency achieved" with date and evidence |

**Recorded for every learner:** enrolments, lessons completed (with date), every attempt (score, maximum, answers, time), feedback shown, practical evidence (tool and result), exam results and competency status. The export/backup on the Progress page includes these records.

**Integrity:**
- Question banks are shuffled.
- Numeric answers use tolerances.
- Practical tasks are verified electrically or procedurally by the tools, never by placement or page visits alone. This replaces the "opened a panel = studied" completion of Phases 2–3 for credit purposes.

---

## 5. Competency framework (virtual competency)

| Unit | Title | Evidence |
|---|---|---|
| CU-01 | Apply electrical safety, isolation and discharge procedures | F1 exam; F1 practical assessments (hazard identification, isolation sequence, prove-dead, stored energy, protection selection) |
| CU-02 | Analyse DC circuits, energy storage and DC systems | F2 exam; ckt-01…03; sim-01, sim-02; F2 practical assessments |
| CU-03 | Analyse AC circuits, power and transformers | F3 exam; sim-03, sim-08; ckt-07 |
| CU-04 | Identify, test and select inverter components | F4 exam; library test-procedure checks; comparisons; component compatibility (S1) |
| CU-05 | Use measurement instruments safely and correctly | F5 exam; Phase 8 instrument tasks |
| CU-06 | Build and verify circuits from schematics | P1 exam; ckt-04…10 |
| CU-07 | Explain and analyse power-electronic switching circuits | P2 exam; sim-05…08 |
| CU-08 | Explain inverter operation and waveform quality | P3 exam; sim-09, sim-10 |
| CU-09 | Disassemble and reassemble an inverter safely | P4 exam; l3d-06 procedure |
| CU-10 | Specify and protect battery DC systems | P5 exam; Phase 11 battery tasks |
| CU-11 | Design, assemble and test inverters to a specification | S1 exam; build projects passing their test suites |
| CU-12 | Design solar and hybrid systems | S2 exam; solar lab design, energy-management and troubleshooting tasks; bld-g, bld-h |
| CU-13 | Plan installation and commissioning | S3 exam; commissioning tasks |
| CU-14 | Diagnose and repair inverter faults | S4 exam; Phase 9 repair scenarios; Phase 13 diagnostics |
| CU-15 | Maintain systems and practise professionally to standards | S5 exam; maintenance planning; capstone |

Each unit has a level: **Awareness** (lessons and checks done), **Applied** (module quizzes and practicals passed) or **Virtual competency** (all evidence, including the exam). The record always states: *"Virtual competency. Real-world practice requires supervised physical training and locally required qualifications."*

---

## 6. Mapping of existing platform content

| Existing | Becomes | Status |
|---|---|---|
| Fundamentals lessons fun-01…07 (Phase 5) | P3 lessons (+ F3.M1 L1, F3.M3 L1, L3) | Activities exist; lecture content to author |
| 3D lessons l3d-01…06, asm-01 (Phase 2) | P4.M1–M3 | Activities exist; lecture content to author |
| Library lessons cmp-01…05 (Phase 3) | F4.M1–M5 | Reference and test procedures exist; lessons to author |
| Circuit exercises ckt-01…10 (Phase 4) | Practical tasks in F2, F3, P1 | Practicals exist |
| Experiments sim-01…10 (Phase 5) | Practical tasks in F2, F3, P2, P3 | Practicals exist (objectives, observations, questions) |
| Build projects bld-a…h (Phase 6) | S1 practical tasks | Built in Phase 6 |
| Practical assessments asm-01…09 (module "Practical Assessments") | Competency evidence: asm-01 → CU-01/CU-04; asm-02, asm-03 → CU-06; asm-04 → CU-06; asm-05 → CU-14; asm-06 → CU-10; asm-07 → CU-12; asm-08 → CU-14; asm-09 → CU-08 | asm-01 exists; others built in Phases 7–10 |
| Solar lessons sol-01…05 (Phase 7 module) | S2.M1–M3 (sol-03 → P5.M3) | Phase 7 |
| Instrument lessons ins-01…05 (Phase 8 module) | F5.M2–M4 | Phase 8 |
| Repair lessons rep-01…05 (Phase 9 module) | S4.M3–M4 | Phase 9 |
| Engineering projects prj-01…03 | S2.M4 worked system design; S5.M1 capstone briefs | Phases 7 and 10 |
| Waveform bench (Phase 1) | Interactive demonstration in F3.M1 and P3.M3 | Exists |

---

## 7. Educational gap analysis: Phases 1–5

| Phase | What exists | Educational gaps |
|---|---|---|
| 1 Foundation | Navigation, dashboard, progress store, module syllabi, waveform bench | No courses, enrolment, prerequisites, lesson pages, quizzes, exams, attempt history, feedback or competency records. Module pages are syllabi only. No safety course or DC/AC fundamentals teaching. |
| 2 3D laboratory | Detailed 3D models, 13-field information panels, guided procedures, discharge simulator, identification challenge | Lessons complete by opening panels ("studied"), which is not demonstrated understanding. No lecture notes or worked examples behind the panels; no quizzes. |
| 3 Component library | 24 detailed reference entries, three explanation levels, test procedures, comparisons | Reference, not instruction: no lesson sequence from basics, no semiconductor physics introduction, few calculations and worked examples, no module quizzes. Completion by opening entries. |
| 4 Circuit laboratory | Editor, live electrical checks, ten assessed exercises | Practicals without preceding theory (schematic reading, KCL/KVL, nodal analysis, Thevenin). No knowledge checks outside the exercises. |
| 5 Simulation engine | Transient engine, oscilloscope, AC analysis, ten experiments with questions | Experiments assume the theory (RC/RL, rectification, PWM, SPWM, THD) without lecture notes, derivations or worked examples. Fundamentals lessons are completed by experiments alone. |
| Cross-cutting | n/a | Missing subjects: electrical safety, DC and AC fundamentals, measurement theory, batteries, installation/commissioning, maintenance. No homework or assignments, formal examinations or competency assessments. No glossary. |

---

## 8. Delivery plan: fourteen phases (approved)

The ten original development phases are retained and four are added. **Every course is fully authored by the end of Phase 14**; no course remains scheduled or syllabus-only when the programme is declared complete. Each engineering phase also authors the courses that teach through its tools.

| Phase | Engineering deliverable | Courses completed | Status |
|---|---|---|---|
| 1–5 | Foundation, 3D lab, library, circuit lab, simulation engine | (mapped in §6; taught by the courses below) | Done |
| 6 | Build Your Own Inverter; Academy framework | **S1** | Done |
| 7 | Solar and Hybrid Engineering Laboratory; prerequisite enforcement; practical assessments | **F1, F2** (first, mandatory), **S2** | Done |
| 8 | Virtual instruments bound to the simulation | **F3, F5** | Done |
| 9 | Repair workshop (17 scenarios) | **F4, P4** | Done |
| 10 | Assessments and engineering projects | **P1, P2, P3** | |
| 11 | Battery Engineering and Energy Storage (battery laboratory) | **P5** | |
| 12 | Installation and Commissioning (installation laboratory) | **S3** | |
| 13 | Advanced Diagnostics and Professional Repair | **S4** | |
| 14 | Maintenance, Standards and Professional Practice; final integration and audit | **S5** | |

Course count check: S1 (6) + F1, F2, S2 (7) + F3, F5 (8) + F4, P4 (9) + P1, P2, P3 (10) + P5 (11) + S3 (12) + S4 (13) + S5 (14) = 15 courses.

**Phase 7 order:**
1. This blueprint update.
2. F1 and F2 fully authored.
3. Prerequisite enforcement.
4. Verification of F1/F2 examinations and practical assessments.
5. The solar and hybrid laboratory and S2.

## 9. Academy architecture (integration with the existing platform)

- **Content** (`src/content/academy/`): courses, modules, lessons and question banks as typed data.
  - Lesson bodies use a small block language: paragraphs, lists, tables, notes, formulas, worked-example steps, and glossary terms written `[[term]]`.
  - Diagrams are React SVG components or live schematics rendered from circuit documents, drawn with the circuit lab's own part glyphs.
  - Tool links are typed (`lab3d`, `library`, `procedure`, `compare`, `circuit`, `sim`, `build`) and resolved to the existing routes. Tests check that every link resolves to a real part, entry, exercise, experiment or project.
- **No duplication:**
  - Lessons link to the existing tools; they never re-implement them.
  - Practical credit comes from the records those tools already write (`completedExercises`, `completedProjects`, `activities`, `completedLessons`).
  - Existing lesson ids stay; academy lessons reference them through `legacyId`.
- **Records:** the progress store gains `enrolments` and `attempts`.
  - Each attempt holds kind, target, score, maximum, answers, feedback flag, start time and duration.
  - Both fields are optional in stored data and sanitised on load and import, so older backups still import.
  - The competency record is derived from progress by pure functions, like the badges.
- **Marking:**
  - Multiple choice, numeric with a relative tolerance and unit, and multi-select.
  - Question order is shuffled per attempt with a stored seed.
  - Examinations are timed, show no feedback until submitted, are limited to 3 attempts, and have a 24 h cool-down.
- **Tests:**
  - Structure: every published lesson has all 14 sections and meets the minimum counts.
  - Every tool link and glossary term resolves.
  - Marking and tolerance work as specified.
  - Prerequisite and unlock rules hold.
  - The competency derivation is correct.
  - Worked-example numbers are recomputed from the design engine wherever the engine can produce them.

## 10. Content quality rules

1. Write for a learner with no prior electrical study: define every term at first use and link it to the glossary.
2. Use correct terminology and SI units; show derivations; give at least two worked examples per lesson.
3. Label simplified models (e.g. "piecewise-linear diode", "simplified PV model") and typical values; never present them as manufacturer data or certified design values.
4. Every practical names its safety context. Mains and HV work is simulated only.
5. Every lesson connects to at least one platform tool.
6. Tests enforce the structure: all 14 sections present, objectives ≥ 3, worked examples ≥ 2, knowledge-check questions ≥ 3, and all tool links resolving to real routes, parts, entries, exercises, experiments or projects.
