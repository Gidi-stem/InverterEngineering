/**
 * Generated, lightweight stand-ins for the full, authored course catalogue (`catalogue.ts`).
 *
 * Same ids, titles, prerequisites, module/lesson/practical structure, quiz pass marks and exam
 * settings as the real courses — but with lesson content, quiz/exam questions and assignment tasks
 * stripped out (replaced with a `hasContent: true` marker per authored lesson, see
 * `lessonAuthored()` in ./types). This is what every prerequisite gate (./gates), the dashboard
 * banner, course-unlock checks and the competency record read — never the real catalogue — so that
 * none of them pull any course's actual content into their bundle. The Learning Academy's own pages
 * (features/academy/AcademyPages.tsx) load a course's real content on demand, per course, via
 * ./courseLoader; this file is what they show for a course before/without that content.
 *
 * Not regenerated automatically — see shells.test.ts, which fails if this drifts from the real
 * catalogue. Regenerate with the one-off generator kept in the Phase 8 history (not checked
 * in): a short Vitest file that imports catalogue.ts, strips the heavy fields, and writes this file.
 */
import type { Competency, Course } from './types'

export const SHELL_COURSES: Course[] = [
  {
    "id": "F1",
    "title": "Electrical Safety and Fundamentals",
    "level": "beginner",
    "stage": "foundation",
    "summary": "The mandatory first course: how electricity harms people, where energy is stored, safe isolation and proving dead, protection, earthing and safe workshop practice. Passing F1 (80 %) opens the practical laboratories.",
    "prerequisites": [],
    "recommended": [],
    "status": "published",
    "phase": 7,
    "competency": "CU-01",
    "modules": [
      {
        "id": "F1.M1",
        "title": "Electricity and its hazards",
        "summary": "What voltage, current and resistance are, and how electricity injures people and starts fires. This is the foundation for every safety rule in the programme.",
        "lessons": [
          {
            "id": "F1.M1.L1",
            "title": "Voltage, current, resistance and the circuit",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "F1.M1.L2",
            "title": "How electric current harms the body",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "F1.M1.L3",
            "title": "Shock, arc flash, burns and fire",
            "minutes": 35,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "F1.M1.P1",
            "title": "Identify the hazards on a workbench",
            "description": "Find every electrical hazard in a described workshop scene, and only the hazards.",
            "task": {
              "id": "f1-hazards-bench",
              "kind": "hazards",
              "title": "Workbench hazard identification",
              "brief": "Read the description of the workbench, then select every item that is an electrical hazard. Items that are good practice must not be selected.",
              "scene": "A technician is preparing to replace a fuse in a 12 V inverter connected to a 100 Ah battery. The bench has: a spanner lying across the battery terminals area; the technician wearing a metal watch; a battery with plastic terminal covers fitted on the negative but not the positive; a puddle of spilled coffee next to a mains extension lead; a voltage tester and its proving unit; an extension lead whose outer sheath is cracked, showing the coloured inner wires; a fire extinguisher rated for electrical fires on the wall; and the inverter still switched on with the battery connected.",
              "items": [
                {
                  "id": "spanner",
                  "label": "Spanner lying near the battery terminals",
                  "hazard": true,
                  "why": "It could bridge the terminals and short the battery: hundreds of amperes, burns and fire."
                },
                {
                  "id": "watch",
                  "label": "Metal watch on the wrist",
                  "hazard": true,
                  "why": "Metal jewellery can bridge terminals and heat instantly. Remove rings, watches and bracelets."
                },
                {
                  "id": "cover",
                  "label": "Positive terminal uncovered",
                  "hazard": true,
                  "why": "The exposed positive terminal can be shorted to the frame or a tool; covers should be on both."
                },
                {
                  "id": "liquid",
                  "label": "Spilled liquid beside the mains extension lead",
                  "hazard": true,
                  "why": "Liquid near mains lowers resistance and can cause shock or tracking."
                },
                {
                  "id": "tester",
                  "label": "Voltage tester with proving unit",
                  "hazard": false,
                  "why": "Good practice: needed to prove dead before work."
                },
                {
                  "id": "sheath",
                  "label": "Cracked extension-lead sheath",
                  "hazard": true,
                  "why": "Damaged insulation exposes conductors to touch and mechanical damage. Take the lead out of use."
                },
                {
                  "id": "extinguisher",
                  "label": "Electrical-rated fire extinguisher",
                  "hazard": false,
                  "why": "Good practice: correct extinguisher available."
                },
                {
                  "id": "live",
                  "label": "Inverter on and battery still connected while replacing a fuse",
                  "hazard": true,
                  "why": "The work must be done isolated: switch off, disconnect the battery and prove dead first."
                }
              ],
              "explain": "Hazards are anything that could create a short circuit, a shock path or an arc, or that leaves equipment energised during work. The tester and the extinguisher are controls, not hazards."
            },
            "evidence": {
              "kind": "task",
              "id": "f1-hazards-bench"
            }
          }
        ],
        "quiz": {
          "pass": 0.8,
          "questions": []
        },
        "assignment": {
          "id": "F1.M1.asg",
          "title": "Module assignment: hazard analysis of a battery workbench",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "F1.M2",
        "title": "Energy sources and stored energy",
        "summary": "The sources of energy in inverter and solar systems — batteries, capacitors, inductors, PV arrays, the grid and generators — and why each stays dangerous after an obvious switch has been turned off.",
        "lessons": [
          {
            "id": "F1.M2.L1",
            "title": "Batteries: short-circuit current, gases and chemicals",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "F1.M2.L2",
            "title": "Capacitors and inductors: stored energy",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "F1.M2.L3",
            "title": "Multiple sources: PV arrays, grid, generators and back-feed",
            "minutes": 35,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "F1.M2.P1",
            "title": "Stored-energy and fault-current assessment",
            "description": "Calculate the hazards of the energy sources in an inverter installation. All answers must be correct.",
            "task": {
              "id": "f1-stored-energy",
              "kind": "calc",
              "title": "Stored energy and fault current",
              "brief": "A 24 V battery bank (two 12 V batteries in series, each R_int = 7 mΩ) supplies an inverter with a 400 V internal bus of 330 µF and a 150 kΩ bleeder.",
              "questions": [
                {
                  "id": "c1",
                  "type": "numeric",
                  "prompt": "Prospective short-circuit current at the bank terminals, with a 1 mΩ fault (A)?",
                  "answer": 1600,
                  "tol": 0.02,
                  "unit": "A",
                  "explain": "24/(0.014 + 0.001) = 1600 A."
                },
                {
                  "id": "c2",
                  "type": "numeric",
                  "prompt": "Energy stored in the 400 V bus (J)?",
                  "answer": 26.4,
                  "tol": 0.02,
                  "unit": "J",
                  "explain": "½ × 330 × 10⁻⁶ × 160 000 = 26.4 J."
                },
                {
                  "id": "c3",
                  "type": "numeric",
                  "prompt": "Minimum waiting time for the bus to fall below 50 V (s)?",
                  "answer": 102.9,
                  "tol": 0.03,
                  "unit": "s",
                  "explain": "τ = 49.5 s; t = 49.5 × ln 8 = 102.9 s."
                },
                {
                  "id": "c4",
                  "type": "mcq",
                  "prompt": "After waiting that time, what must you do before touching the bus?",
                  "options": [
                    "Measure the bus voltage with a verified tester",
                    "Nothing more",
                    "Touch it briefly to check",
                    "Short it with a screwdriver"
                  ],
                  "answer": 0,
                  "explain": "The bleeder could have failed: prove dead."
                }
              ],
              "explain": "Batteries deliver huge fault currents and cannot be switched off; capacitors hold energy after switch-off. Calculation tells you the scale of the hazard and how long to wait, but only measurement proves it safe."
            },
            "evidence": {
              "kind": "task",
              "id": "f1-stored-energy"
            }
          }
        ],
        "quiz": {
          "pass": 0.8,
          "questions": []
        },
        "assignment": {
          "id": "F1.M2.asg",
          "title": "Module assignment: stored energy in an inverter",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "F1.M3",
        "title": "Safe isolation",
        "summary": "The procedure that makes electrical work safe: isolate every source, lock it off, discharge stored energy and prove dead with a verified tester. Practised here as assessed drills.",
        "lessons": [
          {
            "id": "F1.M3.L1",
            "title": "Isolation and lock-out/tag-out",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "F1.M3.L2",
            "title": "Proving dead",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "F1.M3.L3",
            "title": "Capacitor discharge and verification",
            "minutes": 35,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "F1.M3.P1",
            "title": "Safe isolation sequence drill",
            "description": "Build the safe-isolation procedure for a solar-battery-inverter system: choose the correct steps, reject the unsafe ones and put them in order.",
            "task": {
              "id": "f1-isolation-sequence",
              "kind": "sequence",
              "title": "Isolating a solar-battery-inverter system",
              "brief": "You must work on the AC output wiring of an off-grid inverter supplied by a battery bank and a PV string. Choose the steps you would carry out, in order. Some offered steps are wrong or unsafe.",
              "steps": [
                "Identify every source from the drawings and labels: battery, PV string, inverter output",
                "Inform the people who use the system",
                "Switch off the loads and the inverter",
                "Open the PV DC isolator and the battery breaker",
                "Lock and tag each isolator with your own lock",
                "Wait for the inverter’s capacitors to discharge (labelled time)",
                "Verify the voltage tester on the proving unit",
                "Test L–N, L–E and N–E at the point of work, and the DC terminals",
                "Verify the voltage tester on the proving unit again"
              ],
              "distractors": [
                {
                  "text": "Cover the PV array with a sheet instead of opening the isolator",
                  "why": "A covering can slip or leak light; the PV string must be isolated with its DC isolator."
                },
                {
                  "text": "Check for voltage with a non-contact detector only",
                  "why": "Non-contact detectors are not proof of dead and usually cannot detect DC."
                },
                {
                  "text": "Discharge the capacitors by shorting them with a screwdriver",
                  "why": "A short releases the energy as a violent arc; use a rated discharge resistor if needed, then measure."
                }
              ],
              "explain": "The sequence is identify → inform → switch off → isolate → secure → dissipate stored energy → test the tester → test → test the tester. Every source must be isolated and the result proved by measurement."
            },
            "evidence": {
              "kind": "task",
              "id": "f1-isolation-sequence"
            }
          },
          {
            "id": "F1.M3.P2",
            "title": "Prove-dead drill with a virtual tester",
            "description": "Perform proving dead on an isolated socket circuit, read each result and decide whether it is safe to work.",
            "task": {
              "id": "f1-prove-dead",
              "kind": "procedure",
              "title": "Proving dead an isolated circuit",
              "brief": "The breaker for a workshop socket circuit has been opened, locked and tagged. Carry out proving dead at the socket. Choose actions one at a time; each result is shown. Then record your conclusion.",
              "actions": [
                {
                  "id": "prove1",
                  "label": "Check the voltage tester on the proving unit",
                  "result": "Tester indicates 230 V on the proving unit: working."
                },
                {
                  "id": "ln",
                  "label": "Test line to neutral at the socket",
                  "result": "L–N: 0 V"
                },
                {
                  "id": "le",
                  "label": "Test line to earth at the socket",
                  "result": "L–E: 0 V"
                },
                {
                  "id": "ne",
                  "label": "Test neutral to earth at the socket",
                  "result": "N–E: 46 V"
                },
                {
                  "id": "prove2",
                  "label": "Check the voltage tester on the proving unit again",
                  "result": "Tester indicates 230 V on the proving unit: still working."
                },
                {
                  "id": "ncv",
                  "label": "Hold a non-contact detector near the socket",
                  "result": "The detector does not light. (Not proof of dead.)"
                },
                {
                  "id": "touch",
                  "label": "Touch the socket terminals to confirm they are dead",
                  "result": "—",
                  "unsafe": "Never touch conductors to “test” them. Use a verified tester."
                },
                {
                  "id": "trust",
                  "label": "Start work because the breaker is locked off",
                  "result": "—",
                  "unsafe": "A locked breaker is not proof: prove dead at the point of work first."
                }
              ],
              "required": [
                "prove1",
                "ln",
                "le",
                "ne",
                "prove2"
              ],
              "conclusion": {
                "prompt": "What do you conclude?",
                "options": [
                  "The circuit is dead: start work",
                  "The circuit is NOT dead: the neutral is at 46 V, probably shared with another live circuit; stop, find and isolate it, then test again",
                  "The tester is faulty"
                ],
                "answer": 1,
                "explain": "A verified tester showed 46 V between neutral and earth. The neutral is shared with another circuit that is still live (a borrowed neutral), so the circuit is not safe."
              },
              "explain": "Test the tester, test every combination, test the tester again — and believe the readings. Testing only L–N would have missed the live neutral."
            },
            "evidence": {
              "kind": "task",
              "id": "f1-prove-dead"
            }
          }
        ],
        "quiz": {
          "pass": 0.8,
          "questions": []
        },
        "assignment": {
          "id": "F1.M3.asg",
          "title": "Module assignment: isolation procedure for an inverter repair",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "F1.M4",
        "title": "Protection, earthing and workshop practice",
        "summary": "How fuses, breakers, earthing, RCDs and insulation protect people and property, and how to organise safe practical work: PPE, rated tools and instruments, risk assessment and knowing when to stop.",
        "lessons": [
          {
            "id": "F1.M4.L1",
            "title": "Fuses and circuit breakers",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "F1.M4.L2",
            "title": "Earthing, bonding, RCDs and insulation",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "F1.M4.L3",
            "title": "Workshop practice: PPE, tools, measurement categories and risk assessment",
            "minutes": 35,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "F1.M4.P1",
            "title": "Protection selection assessment",
            "description": "Select protective devices and check coordination for a battery-inverter installation. All answers must be correct.",
            "task": {
              "id": "f1-protection",
              "kind": "calc",
              "title": "Selecting protection",
              "brief": "A 24 V, 1500 W inverter (η = 0.92, battery cut-off 21 V) has cable rated I_z = 125 A. Battery fault current is 2.4 kA. Fuse sizes: 63, 80, 100, 125, 150 A. The 230 V output circuit has Z_s = 1.4 Ω and a 10 A type B breaker (magnetic trip at 5 × I_n).",
              "questions": [
                {
                  "id": "c1",
                  "type": "numeric",
                  "prompt": "Maximum DC current (A)?",
                  "answer": 77.6,
                  "tol": 0.02,
                  "unit": "A",
                  "explain": "1500/(0.92 × 21) = 77.6 A."
                },
                {
                  "id": "c2",
                  "type": "numeric",
                  "prompt": "Battery fuse rating (A)?",
                  "answer": 100,
                  "tol": 0.001,
                  "unit": "A",
                  "explain": "1.25 × 77.6 = 97 → 100 A; 100 ≤ 125 ✓."
                },
                {
                  "id": "c3",
                  "type": "numeric",
                  "prompt": "Earth-fault current on the output circuit (A)?",
                  "answer": 164.3,
                  "tol": 0.02,
                  "unit": "A",
                  "explain": "230/1.4 = 164 A."
                },
                {
                  "id": "c4",
                  "type": "mcq",
                  "prompt": "Does the 10 A type B breaker trip magnetically on that fault?",
                  "options": [
                    "Yes: 164 A > 50 A",
                    "No"
                  ],
                  "answer": 0,
                  "explain": "5 × 10 = 50 A."
                },
                {
                  "id": "c5",
                  "type": "mcq",
                  "prompt": "What protects a person touching line and neutral at the output?",
                  "options": [
                    "Nothing automatic: only insulation and isolation prevent it",
                    "The RCD",
                    "The fuse",
                    "The breaker"
                  ],
                  "answer": 0,
                  "explain": "No residual current and far below fuse ratings."
                }
              ],
              "explain": "Fuses and breakers are sized from the maximum current with margin and must not exceed the cable rating; earth faults must give enough current to trip quickly; no device protects against line–neutral contact, which is why isolation comes first."
            },
            "evidence": {
              "kind": "task",
              "id": "f1-protection"
            }
          }
        ],
        "quiz": {
          "pass": 0.8,
          "questions": []
        },
        "assignment": {
          "id": "F1.M4.asg",
          "title": "Module assignment: protecting a battery-inverter circuit",
          "brief": "",
          "tasks": [],
          "written": []
        }
      }
    ],
    "exam": {
      "pass": 0.8,
      "minutes": 45,
      "attempts": 3,
      "cooldownHours": 24,
      "questions": []
    }
  },
  {
    "id": "F2",
    "title": "DC Electrical Systems and Fundamentals",
    "level": "beginner",
    "stage": "foundation",
    "summary": "Charge, current, voltage and units; resistance, Ohm’s law, power and energy; series, parallel and Kirchhoff analysis; capacitors and inductors in time; batteries, DC wiring, voltage drop, fusing, polarity, diodes and LEDs. Passing F2 opens DC construction, battery and solar practicals.",
    "prerequisites": [
      "F1"
    ],
    "recommended": [],
    "status": "published",
    "phase": 7,
    "competency": "CU-02",
    "modules": [
      {
        "id": "F2.M1",
        "title": "Charge, current and voltage",
        "summary": "What electric charge is, why some materials conduct and others insulate, how current and voltage are defined and measured, and the units and prefixes engineers use every day.",
        "lessons": [
          {
            "id": "F2.M1.L1",
            "title": "Charge, conductors and insulators",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F2.M1.L2",
            "title": "Current and voltage",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "F2.M1.L3",
            "title": "Units, prefixes and engineering notation",
            "minutes": 30,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "F2.M1.P1",
            "title": "Units and conversions assessment",
            "description": "Convert and calculate with SI units and prefixes. All answers must be correct.",
            "task": {
              "id": "f2-units",
              "kind": "calc",
              "title": "Units, prefixes and quantities",
              "brief": "Work in base units, then express the answer in the unit asked.",
              "questions": [
                {
                  "id": "c1",
                  "type": "numeric",
                  "prompt": "6.8 kΩ in Ω?",
                  "answer": 6800,
                  "tol": 0.001,
                  "unit": "Ω",
                  "explain": "6.8 × 10³."
                },
                {
                  "id": "c2",
                  "type": "numeric",
                  "prompt": "0.000 33 F in µF?",
                  "answer": 330,
                  "tol": 0.001,
                  "unit": "µF",
                  "explain": "0.000 33 × 10⁶."
                },
                {
                  "id": "c3",
                  "type": "numeric",
                  "prompt": "A 25 mA LED current for 8 hours: charge (C)?",
                  "answer": 720,
                  "tol": 0.01,
                  "unit": "C",
                  "explain": "0.025 × 28 800 = 720 C."
                },
                {
                  "id": "c4",
                  "type": "numeric",
                  "prompt": "τ for 2.2 kΩ and 1000 µF (s)?",
                  "answer": 2.2,
                  "tol": 0.01,
                  "unit": "s",
                  "explain": "2200 × 0.001 = 2.2 s."
                },
                {
                  "id": "c5",
                  "type": "mcq",
                  "prompt": "A capacitor marked “473” is…",
                  "options": [
                    "47 nF",
                    "473 pF",
                    "47 µF",
                    "4.7 nF"
                  ],
                  "answer": 0,
                  "explain": "47 × 10³ pF = 47 nF."
                }
              ],
              "explain": "Convert every value to base units before calculating and check the units of the result."
            },
            "evidence": {
              "kind": "task",
              "id": "f2-units"
            }
          }
        ],
        "quiz": {
          "pass": 0.7,
          "questions": []
        },
        "assignment": {
          "id": "F2.M1.asg",
          "title": "Module assignment: quantities on a battery system",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "F2.M2",
        "title": "Resistance, Ohm's law and power",
        "summary": "What sets the resistance of a conductor, the relationship between voltage, current and resistance, and how electrical power and energy become heat — the calculations behind every cable, resistor and fuse.",
        "lessons": [
          {
            "id": "F2.M2.L1",
            "title": "Resistance and resistivity",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F2.M2.L2",
            "title": "Ohm's law",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F2.M2.L3",
            "title": "Power, energy and heat",
            "minutes": 35,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "F2.M2.P1",
            "title": "Circuit laboratory: verify Ohm's law (ckt-01)",
            "description": "Build the battery and resistor circuit, predict the current, read the solver’s current, and pass the exercise check, including the resistor power rating.",
            "link": {
              "kind": "circuit",
              "label": "Circuit lab: battery and resistor circuit",
              "ex": "ckt-01"
            },
            "evidence": {
              "kind": "exercise",
              "id": "ckt-01"
            }
          }
        ],
        "quiz": {
          "pass": 0.7,
          "questions": []
        },
        "assignment": {
          "id": "F2.M2.asg",
          "title": "Module assignment: a resistive heater on a battery",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "F2.M3",
        "title": "Circuits",
        "summary": "Series and parallel circuits, voltage and current dividers, Kirchhoff’s laws and combination circuits: the methods used to analyse any DC network, from sensor dividers to battery banks.",
        "lessons": [
          {
            "id": "F2.M3.L1",
            "title": "Series circuits and voltage dividers",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "F2.M3.L2",
            "title": "Parallel circuits and current dividers",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "F2.M3.L3",
            "title": "Kirchhoff's laws and combination circuits",
            "minutes": 40,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "F2.M3.P1",
            "title": "Circuit analysis assessment",
            "description": "Analyse series, parallel and combination circuits, including a two-source circuit. All answers must be correct.",
            "task": {
              "id": "f2-circuit-analysis",
              "kind": "calc",
              "title": "Analysing DC circuits",
              "brief": "Circuit 1: a 24 V supply feeds R₁ = 6 Ω in series with (R₂ = 12 Ω ∥ R₃ = 6 Ω). Circuit 2: node X connects a 13.6 V charger through 0.2 Ω, a 12.8 V battery through 0.05 Ω, and a 1.6 Ω load to 0 V.",
              "questions": [
                {
                  "id": "c1",
                  "type": "numeric",
                  "prompt": "Circuit 1: total resistance (Ω)?",
                  "answer": 10,
                  "tol": 0.01,
                  "unit": "Ω",
                  "explain": "12 ∥ 6 = 4 Ω; 6 + 4 = 10 Ω."
                },
                {
                  "id": "c2",
                  "type": "numeric",
                  "prompt": "Circuit 1: supply current (A)?",
                  "answer": 2.4,
                  "tol": 0.01,
                  "unit": "A",
                  "explain": "24/10."
                },
                {
                  "id": "c3",
                  "type": "numeric",
                  "prompt": "Circuit 1: current in R₂ (A)?",
                  "answer": 0.8,
                  "tol": 0.01,
                  "unit": "A",
                  "explain": "V_pair = 2.4 × 4 = 9.6 V; 9.6/12 = 0.8 A."
                },
                {
                  "id": "c4",
                  "type": "numeric",
                  "prompt": "Circuit 2: node voltage V_X (V)?",
                  "answer": 12.64,
                  "tol": 0.005,
                  "unit": "V",
                  "explain": "KCL: (13.6 − V)/0.2 + (12.8 − V)/0.05 = V/1.6 → 68 + 256 = V(5 + 20 + 0.625) → V = 324/25.625 = 12.644 V."
                },
                {
                  "id": "c5",
                  "type": "mcq",
                  "prompt": "Circuit 2: is the battery charging or discharging?",
                  "options": [
                    "Discharging: V_X is below 12.8 V",
                    "Charging: V_X is above 12.8 V"
                  ],
                  "answer": 0,
                  "explain": "Current flows from the battery to the node when V_X < 12.8 V."
                }
              ],
              "explain": "Reduce one-source circuits and work back out; for two sources write KCL at the shared node with each current as (V_source − V_X)/R."
            },
            "evidence": {
              "kind": "task",
              "id": "f2-circuit-analysis"
            }
          }
        ],
        "quiz": {
          "pass": 0.7,
          "questions": []
        },
        "assignment": {
          "id": "F2.M3.asg",
          "title": "Module assignment: a battery-sense circuit and a two-battery bank",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "F2.M4",
        "title": "Energy storage and time",
        "summary": "How capacitors and inductors store energy, why their voltages and currents change exponentially with a time constant, and what that means for filters, switching and safety. Practised in the simulator and circuit laboratory.",
        "lessons": [
          {
            "id": "F2.M4.L1",
            "title": "Capacitors and the RC time constant",
            "minutes": 40,
            "hasContent": true
          },
          {
            "id": "F2.M4.L2",
            "title": "Inductors and the RL time constant",
            "minutes": 40,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "F2.M4.P1",
            "title": "Simulator: measure an RC time constant (sim-01)",
            "description": "Run the RC experiment, measure the charging and discharging time constants from the oscilloscope and answer its questions.",
            "link": {
              "kind": "sim",
              "label": "sim-01 RC charging and discharging",
              "exp": "sim-01"
            },
            "evidence": {
              "kind": "activity",
              "id": "sim:sim-01"
            }
          },
          {
            "id": "F2.M4.P2",
            "title": "Circuit laboratory: capacitor charge and safe discharge (ckt-03)",
            "description": "Build the charge and discharge circuit with correct electrolytic polarity and a discharge resistor, and pass the exercise check.",
            "link": {
              "kind": "circuit",
              "label": "ckt-03 Capacitor charging and discharging",
              "ex": "ckt-03"
            },
            "evidence": {
              "kind": "exercise",
              "id": "ckt-03"
            }
          },
          {
            "id": "F2.M4.P3",
            "title": "Simulator: RL response (sim-02)",
            "description": "Run the RL experiment, measure τ = L/R and the peak current, and observe the reverse inductor voltage.",
            "link": {
              "kind": "sim",
              "label": "sim-02 RL circuit response",
              "exp": "sim-02"
            },
            "evidence": {
              "kind": "activity",
              "id": "sim:sim-02"
            }
          }
        ],
        "quiz": {
          "pass": 0.7,
          "questions": []
        },
        "assignment": {
          "id": "F2.M4.asg",
          "title": "Module assignment: pre-charge and freewheeling",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "F2.M5",
        "title": "DC sources and DC systems",
        "summary": "Batteries as real sources with EMF, internal resistance and capacity; the wiring of DC systems — conductor size, voltage drop, fusing and polarity; and diodes and LEDs as one-way devices. This module prepares for battery engineering (P5) and solar design (S2).",
        "lessons": [
          {
            "id": "F2.M5.L1",
            "title": "Batteries as sources: EMF, internal resistance, capacity, series and parallel",
            "minutes": 40,
            "hasContent": true
          },
          {
            "id": "F2.M5.L2",
            "title": "DC system wiring: conductor size, voltage drop, fusing and polarity",
            "minutes": 40,
            "hasContent": true
          },
          {
            "id": "F2.M5.L3",
            "title": "Diodes and LEDs: one-way valves and current limiting",
            "minutes": 35,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "F2.M5.P1",
            "title": "Circuit laboratory: LED current limiting (ckt-02)",
            "description": "Build the LED circuit with a correctly sized series resistor and correct polarity, and pass the exercise check (5–20 mA).",
            "link": {
              "kind": "circuit",
              "label": "ckt-02 LED circuit",
              "ex": "ckt-02"
            },
            "evidence": {
              "kind": "exercise",
              "id": "ckt-02"
            }
          },
          {
            "id": "F2.M5.P2",
            "title": "DC system design assessment",
            "description": "Design the battery bank, cable and fuse for a DC system. All answers must be correct.",
            "task": {
              "id": "f2-dc-design",
              "kind": "calc",
              "title": "Designing a battery-inverter DC circuit",
              "brief": "A 48 V system must deliver 3.6 kWh per day (inverter losses included) with 1 day of autonomy from 12.8 V, 100 Ah LiFePO₄ batteries (80 % DoD). The inverter draws at most 80 A, 3 m cable route, 1.5 % drop limit. Cable sizes: 10, 16, 25, 35 mm². Fuse sizes: 80, 100, 125, 160 A.",
              "questions": [
                {
                  "id": "c1",
                  "type": "numeric",
                  "prompt": "Nominal capacity required (Wh)?",
                  "answer": 4500,
                  "tol": 0.01,
                  "unit": "Wh",
                  "explain": "3600/0.8."
                },
                {
                  "id": "c2",
                  "type": "numeric",
                  "prompt": "Batteries in series per string (12.8 V each to ≈ 48 V)?",
                  "answer": 4,
                  "tol": 0.001,
                  "unit": "",
                  "explain": "4 × 12.8 = 51.2 V nominal."
                },
                {
                  "id": "c3",
                  "type": "numeric",
                  "prompt": "Parallel strings needed (each string 51.2 V × 100 Ah = 5120 Wh)?",
                  "answer": 1,
                  "tol": 0.001,
                  "unit": "",
                  "explain": "5120 ≥ 4500: one string."
                },
                {
                  "id": "c4",
                  "type": "numeric",
                  "prompt": "Minimum cable cross-section for 1.5 % at 48 V (mm²)?",
                  "answer": 11.47,
                  "tol": 0.01,
                  "unit": "mm²",
                  "explain": "0.0172 × 6 × 80/0.72 = 11.47 → 16 mm²."
                },
                {
                  "id": "c5",
                  "type": "numeric",
                  "prompt": "Fuse rating with the 1.25 margin (A)?",
                  "answer": 100,
                  "tol": 0.001,
                  "unit": "A",
                  "explain": "1.25 × 80 = 100 A."
                },
                {
                  "id": "c6",
                  "type": "mcq",
                  "prompt": "Before the final battery connection you must…",
                  "options": [
                    "verify polarity with a meter and keep the fuse open until connections are complete",
                    "connect quickly to avoid sparks",
                    "remove the fuse permanently",
                    "reverse the cables to test protection"
                  ],
                  "answer": 0,
                  "explain": "Polarity check and controlled energisation."
                }
              ],
              "explain": "Size the bank from daily energy, depth of discharge and voltage; size the cable for the drop limit and check its current capacity; fuse at 1.25 × the maximum current at the battery positive; verify polarity before connecting."
            },
            "evidence": {
              "kind": "task",
              "id": "f2-dc-design"
            }
          }
        ],
        "quiz": {
          "pass": 0.7,
          "questions": []
        },
        "assignment": {
          "id": "F2.M5.asg",
          "title": "Module assignment: a small off-grid DC system",
          "brief": "",
          "tasks": [],
          "written": []
        }
      }
    ],
    "exam": {
      "pass": 0.7,
      "minutes": 60,
      "attempts": 3,
      "cooldownHours": 24,
      "questions": []
    }
  },
  {
    "id": "F3",
    "title": "AC Electrical Fundamentals",
    "level": "beginner",
    "stage": "foundation",
    "summary": "Alternating quantities, RMS, reactance and impedance, AC power and power factor, harmonics, transformers and rectification.",
    "prerequisites": [
      "F2"
    ],
    "recommended": [],
    "status": "published",
    "phase": 8,
    "competency": "CU-03",
    "modules": [
      {
        "id": "F3.M1",
        "title": "Alternating quantities",
        "summary": "Why AC is used at all, and the vocabulary — amplitude, period, frequency, phase, peak, average and RMS — needed for everything else in this course.",
        "lessons": [
          {
            "id": "F3.M1.L1",
            "title": "Why AC is used",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F3.M1.L2",
            "title": "Sine waves: amplitude, period, frequency, phase",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F3.M1.L3",
            "title": "Peak, average and RMS",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "F3.M1.L4",
            "title": "Non-sinusoidal waveforms",
            "minutes": 25,
            "hasContent": true
          }
        ],
        "practicals": [],
        "quiz": {
          "pass": 0.8,
          "questions": []
        }
      },
      {
        "id": "F3.M2",
        "title": "Reactance and impedance",
        "summary": "How capacitors and inductors oppose AC current in a frequency-dependent way, how reactance and resistance combine as impedance, and how resonance and filters follow from these ideas.",
        "lessons": [
          {
            "id": "F3.M2.L1",
            "title": "Capacitive reactance",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F3.M2.L2",
            "title": "Inductive reactance",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F3.M2.L3",
            "title": "Impedance and phasors",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "F3.M2.L4",
            "title": "Resonance and filters",
            "minutes": 30,
            "hasContent": true
          }
        ],
        "practicals": [],
        "quiz": {
          "pass": 0.8,
          "questions": []
        }
      },
      {
        "id": "F3.M3",
        "title": "AC power",
        "summary": "Real, reactive and apparent power; power factor and why current can lag voltage; harmonics and THD as a power-quality concern; and what \"energy returned\" by a reactive load actually means.",
        "lessons": [
          {
            "id": "F3.M3.L1",
            "title": "Real, reactive and apparent power",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F3.M3.L2",
            "title": "Power factor and current lag",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F3.M3.L3",
            "title": "Harmonics and THD",
            "minutes": 25,
            "hasContent": true
          },
          {
            "id": "F3.M3.L4",
            "title": "Energy returned by reactive loads",
            "minutes": 25,
            "hasContent": true
          }
        ],
        "practicals": [],
        "quiz": {
          "pass": 0.8,
          "questions": []
        }
      },
      {
        "id": "F3.M4",
        "title": "Transformers",
        "summary": "Mutual induction and turns ratio, ideal versus real transformer behaviour, isolation and safety, and the main transformer connection types.",
        "lessons": [
          {
            "id": "F3.M4.L1",
            "title": "Mutual induction and turns ratio",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F3.M4.L2",
            "title": "Ideal and real transformers",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F3.M4.L3",
            "title": "Isolation and safety",
            "minutes": 25,
            "hasContent": true
          },
          {
            "id": "F3.M4.L4",
            "title": "Transformer connection",
            "minutes": 25,
            "hasContent": true
          }
        ],
        "practicals": [],
        "quiz": {
          "pass": 0.8,
          "questions": []
        }
      },
      {
        "id": "F3.M5",
        "title": "Rectification",
        "summary": "Half-wave and full-wave rectification, the bridge rectifier topology, and smoothing with ripple analysis — the AC-to-DC conversion this course set up as the opposite of inversion.",
        "lessons": [
          {
            "id": "F3.M5.L1",
            "title": "Half-wave and full-wave rectification",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F3.M5.L2",
            "title": "The bridge rectifier",
            "minutes": 25,
            "hasContent": true
          },
          {
            "id": "F3.M5.L3",
            "title": "Smoothing and ripple",
            "minutes": 30,
            "hasContent": true
          }
        ],
        "practicals": [],
        "quiz": {
          "pass": 0.8,
          "questions": []
        }
      }
    ],
    "exam": {
      "pass": 0.8,
      "minutes": 50,
      "attempts": 3,
      "cooldownHours": 24,
      "questions": []
    }
  },
  {
    "id": "F4",
    "title": "Electronic Components for Inverter Engineering",
    "level": "beginner",
    "stage": "foundation",
    "summary": "Passive, semiconductor, magnetic, protection, control, sensing and thermal components: how they work, their ratings, how to test them and how to identify faults and replacements.",
    "prerequisites": [
      "F2"
    ],
    "recommended": [
      "F3"
    ],
    "status": "published",
    "phase": 9,
    "competency": "CU-04",
    "modules": [
      {
        "id": "F4.M1",
        "title": "Passive components",
        "summary": "Resistors, capacitors and inductors: how each stores or dissipates energy, how to read their markings and ratings, and how to test each one out of circuit.",
        "lessons": [
          {
            "id": "F4.M1.L1",
            "title": "Resistors: types, codes, power, tolerance",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F4.M1.L2",
            "title": "Capacitors: electrolytic, film and ceramic; ESR; polarity",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F4.M1.L3",
            "title": "Inductors: cores, saturation, current rating",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F4.M1.L4",
            "title": "Testing passive components",
            "minutes": 30,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "F4.M1.P1",
            "title": "Passive component rating calculations",
            "description": "Check resistor power ratings, capacitor ESR heating and inductor saturation margin against real operating figures. All answers must be correct.",
            "task": {
              "id": "f4-passive-ratings",
              "kind": "calc",
              "title": "Rating a resistor, a capacitor and an inductor",
              "brief": "A 15 Ω bleeder resistor carries 3 A. A bus capacitor with ESR 0.25 Ω carries 2 A RMS ripple. An output choke of 1 mH is rated for a saturation current of 9 A.",
              "questions": [
                {
                  "id": "c1",
                  "type": "numeric",
                  "prompt": "Power dissipated in the bleeder resistor (W)?",
                  "answer": 135,
                  "tol": 0.02,
                  "unit": "W",
                  "explain": "P = I²R = 9×15 = 135 W."
                },
                {
                  "id": "c2",
                  "type": "numeric",
                  "prompt": "Self-heating in the bus capacitor from its ESR (W)?",
                  "answer": 1,
                  "tol": 0.02,
                  "unit": "W",
                  "explain": "P = I²·ESR = 4×0.25 = 1 W."
                },
                {
                  "id": "c3",
                  "type": "numeric",
                  "prompt": "Energy stored in the output choke at a load current of 6 A (J)?",
                  "answer": 0.018,
                  "tol": 0.03,
                  "unit": "J",
                  "explain": "½×0.001×36 = 0.018 J."
                },
                {
                  "id": "c4",
                  "type": "mcq",
                  "prompt": "If the load current rises to 10 A, what happens to the output choke?",
                  "options": [
                    "It exceeds its saturation rating and its effective inductance collapses",
                    "Nothing, it has unlimited headroom",
                    "Its resistance drops to zero",
                    "Its inductance increases to compensate"
                  ],
                  "answer": 0,
                  "explain": "10 A exceeds the 9 A saturation rating."
                }
              ],
              "explain": "Each rating (power, ESR heating, saturation current) is an independent check against the actual operating current — matching one specification (value) while ignoring another (rating) is the recurring mistake this module warns against."
            },
            "evidence": {
              "kind": "task",
              "id": "f4-passive-ratings"
            }
          },
          {
            "id": "F4.M1.P2",
            "title": "Diagnose a dried-out smoothing capacitor",
            "description": "Confirm, in the Repair Workshop, that you can apply the ESR-aging reasoning from this module to a real circuit-grounded fault.",
            "link": {
              "kind": "repair",
              "label": "Dried-out smoothing capacitor",
              "id": "rsc-04"
            },
            "evidence": {
              "kind": "troubleshoot",
              "project": "rsc-04"
            }
          }
        ],
        "quiz": {
          "pass": 0.8,
          "questions": []
        },
        "assignment": {
          "id": "F4.M1.assignment",
          "title": "Passive component selection and testing",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "F4.M2",
        "title": "Semiconductor devices",
        "summary": "Diodes, MOSFETs, IGBTs and the gate drivers that control them: how each works, how they switch and lose energy, how to test them, and how to recognise and safely replace a failed device.",
        "lessons": [
          {
            "id": "F4.M2.L1",
            "title": "Introduction to semiconductors",
            "minutes": 25,
            "hasContent": true
          },
          {
            "id": "F4.M2.L2",
            "title": "Diodes: forward and reverse behaviour, ratings",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F4.M2.L3",
            "title": "Rectification with diodes",
            "minutes": 25,
            "hasContent": true
          },
          {
            "id": "F4.M2.L4",
            "title": "MOSFETs: structure, V_th, R_DS(on), body diode",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "F4.M2.L5",
            "title": "IGBTs: V_CE(sat), tail current",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F4.M2.L6",
            "title": "Gate drivers: bootstrap, isolation, dead time",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F4.M2.L7",
            "title": "Switching characteristics and losses",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F4.M2.L8",
            "title": "Component testing: diode, MOSFET and IGBT checks",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F4.M2.L9",
            "title": "Fault identification: short, open, leakage",
            "minutes": 25,
            "hasContent": true
          },
          {
            "id": "F4.M2.L10",
            "title": "Component replacement and compatibility",
            "minutes": 25,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "F4.M2.P1",
            "title": "Semiconductor fault classification and loss calculations",
            "description": "Classify faults from readings and compute device losses. All answers must be correct.",
            "task": {
              "id": "f4-semiconductor-faults",
              "kind": "calc",
              "title": "Classifying faults and computing losses",
              "brief": "A diode reads 0.60 V forward / OL reverse (healthy reference). A suspect MOSFET reads 0.00 V in both diode-test directions across drain-source. A second MOSFET has R_DS(on)=18 mΩ and carries 24 A RMS, plus switching energy (E_on+E_off)=35 µJ at 15 kHz.",
              "questions": [
                {
                  "id": "c1",
                  "type": "mcq",
                  "prompt": "How is the suspect MOSFET's fault classified?",
                  "options": [
                    "Short",
                    "Open",
                    "Elevated leakage",
                    "Healthy"
                  ],
                  "answer": 0,
                  "explain": "0.00 V both ways where a diode drop is expected is a short."
                },
                {
                  "id": "c2",
                  "type": "numeric",
                  "prompt": "Conduction loss (W) of the second MOSFET?",
                  "answer": 10.368,
                  "tol": 0.02,
                  "unit": "W",
                  "explain": "24²×0.018=576×0.018=10.368 W."
                },
                {
                  "id": "c3",
                  "type": "numeric",
                  "prompt": "Switching loss (W) of the second MOSFET?",
                  "answer": 0.525,
                  "tol": 0.02,
                  "unit": "W",
                  "explain": "35e-6×15000=0.525 W."
                },
                {
                  "id": "c4",
                  "type": "numeric",
                  "prompt": "Total device loss (W)?",
                  "answer": 10.893,
                  "tol": 0.02,
                  "unit": "W",
                  "explain": "10.368+0.525=10.893 W."
                }
              ],
              "explain": "A full semiconductor fault assessment classifies the fault pattern correctly AND computes real operating losses — neither alone is a complete answer."
            },
            "evidence": {
              "kind": "task",
              "id": "f4-semiconductor-faults"
            }
          },
          {
            "id": "F4.M2.P2",
            "title": "Diagnose a MOSFET fault in the Repair Workshop",
            "description": "Confirm, on a real circuit-grounded fault, that you can apply the body-diode and gate-charge reasoning from this module.",
            "link": {
              "kind": "repair",
              "label": "MOSFET failed short",
              "id": "rsc-09"
            },
            "evidence": {
              "kind": "troubleshoot",
              "project": "rsc-09"
            }
          }
        ],
        "quiz": {
          "pass": 0.8,
          "questions": []
        },
        "assignment": {
          "id": "F4.M2.assignment",
          "title": "Semiconductor device selection and fault reasoning",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "F4.M3",
        "title": "Magnetic components",
        "summary": "Magnetic circuits and saturation, transformers at low and high frequency, output and filter inductors, and testing windings.",
        "lessons": [
          {
            "id": "F4.M3.L1",
            "title": "Magnetic circuits: flux, B-H, saturation",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F4.M3.L2",
            "title": "Transformers in inverters: LF vs HF",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F4.M3.L3",
            "title": "Output and filter inductors",
            "minutes": 25,
            "hasContent": true
          },
          {
            "id": "F4.M3.L4",
            "title": "Testing windings",
            "minutes": 25,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "F4.M3.P1",
            "title": "Diagnose an output inductor fault in the Repair Workshop",
            "description": "Confirm, on a real circuit-grounded fault, that you can apply the winding-test reasoning from this module.",
            "link": {
              "kind": "repair",
              "label": "Output inductor winding open",
              "id": "rsc-11"
            },
            "evidence": {
              "kind": "troubleshoot",
              "project": "rsc-11"
            }
          }
        ],
        "quiz": {
          "pass": 0.8,
          "questions": []
        },
        "assignment": {
          "id": "F4.M3.assignment",
          "title": "Magnetic component reasoning and testing",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "F4.M4",
        "title": "Protection and switching devices",
        "summary": "Fuses and circuit breakers, relays and contactors, and how electromechanical switching compares with the semiconductor switching of F4.M2.",
        "lessons": [
          {
            "id": "F4.M4.L1",
            "title": "Fuses: I²t, breaking capacity",
            "minutes": 25,
            "hasContent": true
          },
          {
            "id": "F4.M4.L2",
            "title": "Circuit breakers: thermal, magnetic",
            "minutes": 25,
            "hasContent": true
          },
          {
            "id": "F4.M4.L3",
            "title": "Relays and contactors",
            "minutes": 25,
            "hasContent": true
          },
          {
            "id": "F4.M4.L4",
            "title": "Relays versus semiconductor switches",
            "minutes": 25,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "F4.M4.P1",
            "title": "Diagnose a blown fuse in the Repair Workshop",
            "description": "Confirm, on a real circuit-grounded fault, that you can apply the continuity-test and root-cause reasoning from this module.",
            "link": {
              "kind": "repair",
              "label": "Blown fuse",
              "id": "rsc-02"
            },
            "evidence": {
              "kind": "troubleshoot",
              "project": "rsc-02"
            }
          }
        ],
        "quiz": {
          "pass": 0.8,
          "questions": []
        },
        "assignment": {
          "id": "F4.M4.assignment",
          "title": "Protection and switching device reasoning",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "F4.M5",
        "title": "Control, sensing and thermal",
        "summary": "PWM controllers and microcontrollers, voltage and current sensing, heat sinks and thermal resistance, and the PCBs, connectors and terminals that carry it all.",
        "lessons": [
          {
            "id": "F4.M5.L1",
            "title": "PWM controllers and microcontrollers",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F4.M5.L2",
            "title": "Voltage and current sensing",
            "minutes": 25,
            "hasContent": true
          },
          {
            "id": "F4.M5.L3",
            "title": "Thermal management: heat sinks and fans",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F4.M5.L4",
            "title": "PCBs, connectors and terminals",
            "minutes": 25,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "F4.M5.P1",
            "title": "Thermal and sensing calculation set",
            "description": "Apply shunt current sensing and junction-temperature calculations together. All answers must be correct.",
            "task": {
              "id": "f4-thermal-sensing",
              "kind": "calc",
              "title": "Sensing and thermal calculations",
              "brief": "A MOSFET dissipates 9 W total loss with a junction-to-ambient thermal resistance of 3.5 °C/W at a 30 °C ambient. Its current is measured by an 8 mΩ shunt showing a 0.24 V drop.",
              "questions": [
                {
                  "id": "c1",
                  "type": "numeric",
                  "prompt": "Junction temperature (°C)?",
                  "answer": 61.5,
                  "tol": 0.02,
                  "unit": "°C",
                  "explain": "30+9×3.5=61.5 °C."
                },
                {
                  "id": "c2",
                  "type": "numeric",
                  "prompt": "Measured current (A) from the shunt?",
                  "answer": 30,
                  "tol": 0.02,
                  "unit": "A",
                  "explain": "0.24/0.008=30 A."
                },
                {
                  "id": "c3",
                  "type": "mcq",
                  "prompt": "If the shunt's true resistance has drifted up by 20% without recalibration, the controller will believe current is...",
                  "options": [
                    "lower than it actually is",
                    "higher than it actually is",
                    "unaffected",
                    "exactly zero"
                  ],
                  "answer": 0,
                  "explain": "I=V/R: a higher R for the same V reads as a lower computed current, so the controller under-reads the true current."
                }
              ],
              "explain": "Thermal margin and sensing accuracy are independent checks that both feed into whether a system runs safely and is correctly controlled — this task exercises both calculations together."
            },
            "evidence": {
              "kind": "task",
              "id": "f4-thermal-sensing"
            }
          },
          {
            "id": "F4.M5.P2",
            "title": "Diagnose a gate-driver / control-path fault in the Repair Workshop",
            "description": "Confirm, on a real circuit-grounded fault, that you can apply the cross-subsystem fault-tracing reasoning from this module.",
            "link": {
              "kind": "repair",
              "label": "Gate-driver signal lost",
              "id": "rsc-10"
            },
            "evidence": {
              "kind": "troubleshoot",
              "project": "rsc-10"
            }
          }
        ],
        "quiz": {
          "pass": 0.8,
          "questions": []
        },
        "assignment": {
          "id": "F4.M5.assignment",
          "title": "Control, sensing and thermal integration",
          "brief": "",
          "tasks": [],
          "written": []
        }
      }
    ],
    "exam": {
      "pass": 0.8,
      "minutes": 60,
      "attempts": 3,
      "cooldownHours": 24,
      "questions": []
    }
  },
  {
    "id": "F5",
    "title": "Measurement and Virtual Instruments",
    "level": "beginner",
    "stage": "foundation",
    "summary": "Accuracy and uncertainty, measurement categories, the multimeter, clamp meter, oscilloscope and specialist instruments, used on realistic simulated scenarios and the Phase 5 waveform engine.",
    "prerequisites": [
      "F1",
      "F2"
    ],
    "recommended": [
      "F3"
    ],
    "status": "published",
    "phase": 8,
    "competency": "CU-05",
    "modules": [
      {
        "id": "F5.M1",
        "title": "Measurement basics",
        "summary": "Why a reading is only as good as its accuracy and resolution, how to choose a safe measurement category, and how to record a result so it means something later.",
        "lessons": [
          {
            "id": "F5.M1.L1",
            "title": "Accuracy, resolution and uncertainty",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F5.M1.L2",
            "title": "Measurement categories and probe safety",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F5.M1.L3",
            "title": "Recording results",
            "minutes": 25,
            "hasContent": true
          }
        ],
        "practicals": [],
        "quiz": {
          "pass": 0.8,
          "questions": []
        }
      },
      {
        "id": "F5.M2",
        "title": "Multimeter and clamp meter",
        "summary": "Operating the digital multimeter across every function and port, the diode test, and measuring current without breaking the circuit with a clamp meter.",
        "lessons": [
          {
            "id": "F5.M2.L1",
            "title": "Voltage, current, resistance, continuity and diode test",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "F5.M2.L2",
            "title": "Clamp meters and DC/AC current",
            "minutes": 25,
            "hasContent": true
          }
        ],
        "practicals": [],
        "quiz": {
          "pass": 0.8,
          "questions": []
        }
      },
      {
        "id": "F5.M3",
        "title": "Oscilloscope",
        "summary": "Timebase, volts/division and triggering; reading period, frequency, duty cycle and RMS off a real inverter waveform; and what harmonics and THD look like on screen.",
        "lessons": [
          {
            "id": "F5.M3.L1",
            "title": "Time base, volts per division and trigger",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F5.M3.L2",
            "title": "Measuring frequency, duty cycle and RMS",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F5.M3.L3",
            "title": "Spectrum and THD",
            "minutes": 25,
            "hasContent": true
          }
        ],
        "practicals": [],
        "quiz": {
          "pass": 0.8,
          "questions": []
        }
      },
      {
        "id": "F5.M4",
        "title": "Specialist instruments",
        "summary": "Insulation resistance testing (simulation and safety instruction only), LCR and ESR meters for component condition, and thermal measurement.",
        "lessons": [
          {
            "id": "F5.M4.L1",
            "title": "Insulation resistance testing",
            "minutes": 25,
            "hasContent": true
          },
          {
            "id": "F5.M4.L2",
            "title": "LCR and ESR meters",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "F5.M4.L3",
            "title": "Thermal imaging and temperature probes",
            "minutes": 20,
            "hasContent": true
          }
        ],
        "practicals": [],
        "quiz": {
          "pass": 0.8,
          "questions": []
        }
      }
    ],
    "exam": {
      "pass": 0.8,
      "minutes": 45,
      "attempts": 3,
      "cooldownHours": 24,
      "questions": []
    }
  },
  {
    "id": "P1",
    "title": "Circuit Analysis and Construction",
    "level": "intermediate",
    "stage": "practitioner",
    "summary": "Reading schematics, nodal analysis, Thevenin and Norton equivalents, non-linear devices, building and fault-finding circuits, and switching circuits up to the H-bridge.",
    "prerequisites": [
      "F2"
    ],
    "recommended": [
      "F4"
    ],
    "status": "scheduled",
    "phase": 10,
    "competency": "CU-06",
    "modules": [
      {
        "id": "P1.M1",
        "title": "Reading schematics",
        "summary": "",
        "lessons": [
          {
            "id": "P1.M1.L1",
            "title": "Symbols and pin identification",
            "minutes": 30
          },
          {
            "id": "P1.M1.L2",
            "title": "Nodes and the connection graph",
            "minutes": 30
          },
          {
            "id": "P1.M1.L3",
            "title": "Reference (ground) and measurement",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "P1.M2",
        "title": "Analysis methods",
        "summary": "",
        "lessons": [
          {
            "id": "P1.M2.L1",
            "title": "Nodal analysis by hand",
            "minutes": 30
          },
          {
            "id": "P1.M2.L2",
            "title": "Thevenin and Norton equivalents",
            "minutes": 30
          },
          {
            "id": "P1.M2.L3",
            "title": "Superposition",
            "minutes": 30
          },
          {
            "id": "P1.M2.L4",
            "title": "Non-linear devices and piecewise-linear models",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "P1.M3",
        "title": "Construction practice",
        "summary": "",
        "lessons": [
          {
            "id": "P1.M3.L1",
            "title": "Building and verifying circuits",
            "minutes": 30
          },
          {
            "id": "P1.M3.L2",
            "title": "Fault finding from symptoms",
            "minutes": 30
          },
          {
            "id": "P1.M3.L3",
            "title": "Validation messages and what they mean",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "P1.M4",
        "title": "Switching circuits",
        "summary": "",
        "lessons": [
          {
            "id": "P1.M4.L1",
            "title": "MOSFET switching circuits",
            "minutes": 30
          },
          {
            "id": "P1.M4.L2",
            "title": "The half-bridge",
            "minutes": 30
          },
          {
            "id": "P1.M4.L3",
            "title": "The H-bridge",
            "minutes": 30
          },
          {
            "id": "P1.M4.L4",
            "title": "Basic inverter architecture",
            "minutes": 30
          }
        ],
        "practicals": []
      }
    ]
  },
  {
    "id": "P2",
    "title": "Power Electronics Fundamentals",
    "level": "intermediate",
    "stage": "practitioner",
    "summary": "Switching conversion, PWM and DC-DC converters, switching devices in practice, losses and thermal design, bridges with inductive loads, filters and EMI.",
    "prerequisites": [
      "F3",
      "P1"
    ],
    "recommended": [
      "F4"
    ],
    "status": "scheduled",
    "phase": 10,
    "competency": "CU-07",
    "modules": [
      {
        "id": "P2.M1",
        "title": "Switching principles",
        "summary": "",
        "lessons": [
          {
            "id": "P2.M1.L1",
            "title": "Why switch instead of dissipate",
            "minutes": 30
          },
          {
            "id": "P2.M1.L2",
            "title": "PWM and averaging",
            "minutes": 30
          },
          {
            "id": "P2.M1.L3",
            "title": "Duty cycle and DC-DC conversion",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "P2.M2",
        "title": "Switching devices in practice",
        "summary": "",
        "lessons": [
          {
            "id": "P2.M2.L1",
            "title": "MOSFET switching",
            "minutes": 30
          },
          {
            "id": "P2.M2.L2",
            "title": "Conduction and switching losses",
            "minutes": 30
          },
          {
            "id": "P2.M2.L3",
            "title": "Thermal design",
            "minutes": 30
          },
          {
            "id": "P2.M2.L4",
            "title": "Gate drive and dead time",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "P2.M3",
        "title": "Bridges",
        "summary": "",
        "lessons": [
          {
            "id": "P2.M3.L1",
            "title": "Half-bridge operation",
            "minutes": 30
          },
          {
            "id": "P2.M3.L2",
            "title": "Full H-bridge operation",
            "minutes": 30
          },
          {
            "id": "P2.M3.L3",
            "title": "Inductive loads and freewheeling",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "P2.M4",
        "title": "Filters and EMI",
        "summary": "",
        "lessons": [
          {
            "id": "P2.M4.L1",
            "title": "LC filters and corner frequency",
            "minutes": 30
          },
          {
            "id": "P2.M4.L2",
            "title": "Ripple and filter sizing",
            "minutes": 30
          },
          {
            "id": "P2.M4.L3",
            "title": "Introduction to EMI and layout",
            "minutes": 30
          }
        ],
        "practicals": []
      }
    ]
  },
  {
    "id": "P3",
    "title": "Inverter Principles",
    "level": "intermediate",
    "stage": "practitioner",
    "summary": "From DC to AC: square-wave, modified-sine and sine-wave inverters, SPWM, filtering, regulation, waveform quality, efficiency and ratings.",
    "prerequisites": [
      "P2"
    ],
    "recommended": [],
    "status": "scheduled",
    "phase": 10,
    "competency": "CU-08",
    "modules": [
      {
        "id": "P3.M1",
        "title": "From DC to AC",
        "summary": "",
        "lessons": [
          {
            "id": "P3.M1.L1",
            "title": "The H-bridge and polarity reversal",
            "minutes": 30
          },
          {
            "id": "P3.M1.L2",
            "title": "Square-wave inverters",
            "minutes": 30
          },
          {
            "id": "P3.M1.L3",
            "title": "Modified sine and harmonic content",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "P3.M2",
        "title": "Sine-wave inverters",
        "summary": "",
        "lessons": [
          {
            "id": "P3.M2.L1",
            "title": "SPWM generation",
            "minutes": 30
          },
          {
            "id": "P3.M2.L2",
            "title": "Output filtering",
            "minutes": 30
          },
          {
            "id": "P3.M2.L3",
            "title": "Feedback and regulation",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "P3.M3",
        "title": "Ratings and performance",
        "summary": "",
        "lessons": [
          {
            "id": "P3.M3.L1",
            "title": "Waveform families and RMS",
            "minutes": 30
          },
          {
            "id": "P3.M3.L2",
            "title": "Harmonics, THD and filtering",
            "minutes": 30
          },
          {
            "id": "P3.M3.L3",
            "title": "Efficiency, losses and heat",
            "minutes": 30
          },
          {
            "id": "P3.M3.L4",
            "title": "Watts, VA and battery current",
            "minutes": 30
          }
        ],
        "practicals": []
      }
    ]
  },
  {
    "id": "P4",
    "title": "Inside a Real Inverter",
    "level": "intermediate",
    "stage": "practitioner",
    "summary": "A guided tour of two real inverter architectures in the 3D laboratory, safe disassembly and reassembly, and component identification on the boards.",
    "prerequisites": [
      "F1"
    ],
    "recommended": [
      "F4"
    ],
    "status": "published",
    "phase": 9,
    "competency": "CU-09",
    "modules": [
      {
        "id": "P4.M1",
        "title": "Architecture tour",
        "summary": "A guided tour of a real inverter's five functional areas in the 3D Dissection Laboratory: enclosure and terminals, power stage, magnetics, control electronics, and protection and sensing.",
        "lessons": [
          {
            "id": "P4.M1.L1",
            "title": "Enclosure, terminals and earthing",
            "minutes": 25,
            "hasContent": true
          },
          {
            "id": "P4.M1.L2",
            "title": "The power stage",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "P4.M1.L3",
            "title": "Magnetics",
            "minutes": 25,
            "hasContent": true
          },
          {
            "id": "P4.M1.L4",
            "title": "Control electronics",
            "minutes": 25,
            "hasContent": true
          },
          {
            "id": "P4.M1.L5",
            "title": "Protection and sensing",
            "minutes": 25,
            "hasContent": true
          }
        ],
        "practicals": [],
        "quiz": {
          "pass": 0.8,
          "questions": []
        }
      },
      {
        "id": "P4.M2",
        "title": "Safe disassembly and reassembly",
        "summary": "The complete, guided isolation, discharge, disassembly and reassembly sequence for a real inverter, performed in the 3D laboratory and verified with a functional test.",
        "lessons": [
          {
            "id": "P4.M2.L1",
            "title": "Isolation and discharge in practice",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "P4.M2.L2",
            "title": "Disassembly sequence and why",
            "minutes": 30,
            "hasContent": true
          },
          {
            "id": "P4.M2.L3",
            "title": "Reassembly and functional test",
            "minutes": 30,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "P4.M2.P1",
            "title": "Isolation, discharge and disassembly",
            "description": "Isolate every source, confirm bus-capacitor discharge, and complete the guided disassembly sequence on the LF-3K model.",
            "link": {
              "kind": "lab3d",
              "label": "Disassembly sequence",
              "model": "lf3k"
            },
            "evidence": {
              "kind": "activity",
              "id": "lab3d:disassembly"
            }
          },
          {
            "id": "P4.M2.P2",
            "title": "Reassembly and functional test",
            "description": "Reverse the sequence correctly and pass the staged functional test.",
            "link": {
              "kind": "lab3d",
              "label": "Reassembly and functional test",
              "model": "lf3k"
            },
            "evidence": {
              "kind": "activity",
              "id": "lab3d:reassembly"
            }
          }
        ],
        "quiz": {
          "pass": 0.8,
          "questions": []
        }
      },
      {
        "id": "P4.M3",
        "title": "Identification",
        "summary": "Timed, scored component identification on a real board, and a direct comparison of a square-wave inverter against a hybrid inverter's architecture.",
        "lessons": [
          {
            "id": "P4.M3.L1",
            "title": "Recognising components on a board",
            "minutes": 20,
            "hasContent": true
          },
          {
            "id": "P4.M3.L2",
            "title": "Comparing a square-wave and a hybrid inverter",
            "minutes": 25,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "P4.M3.P1",
            "title": "Component identification challenge",
            "description": "Identify at least 20 real inverter components by sight, under time pressure.",
            "link": {
              "kind": "lab3d",
              "label": "Identification challenge",
              "model": "lf3k"
            },
            "evidence": {
              "kind": "activity",
              "id": "lab3d:identify"
            }
          }
        ],
        "quiz": {
          "pass": 0.8,
          "questions": []
        }
      }
    ],
    "exam": {
      "pass": 0.8,
      "minutes": 40,
      "attempts": 3,
      "cooldownHours": 24,
      "questions": []
    }
  },
  {
    "id": "P5",
    "title": "Battery Engineering and Energy Storage",
    "level": "intermediate",
    "stage": "practitioner",
    "summary": "Battery technologies, capacity and state of charge, DC system design, cable sizing, fusing, charging profiles, battery management and energy storage, taught in the Phase 11 battery laboratory.",
    "prerequisites": [
      "F1",
      "F2"
    ],
    "recommended": [
      "S2"
    ],
    "status": "scheduled",
    "phase": 11,
    "competency": "CU-10",
    "modules": [
      {
        "id": "P5.M1",
        "title": "Battery technology",
        "summary": "",
        "lessons": [
          {
            "id": "P5.M1.L1",
            "title": "Lead-acid, LiFePO₄ and lithium-ion",
            "minutes": 30
          },
          {
            "id": "P5.M1.L2",
            "title": "Capacity, C-rate and Peukert",
            "minutes": 30
          },
          {
            "id": "P5.M1.L3",
            "title": "State of charge and depth of discharge",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "P5.M2",
        "title": "DC system design",
        "summary": "",
        "lessons": [
          {
            "id": "P5.M2.L1",
            "title": "Cable sizing and voltage drop",
            "minutes": 30
          },
          {
            "id": "P5.M2.L2",
            "title": "Fusing and isolation",
            "minutes": 30
          },
          {
            "id": "P5.M2.L3",
            "title": "Series and parallel banks, balancing",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "P5.M3",
        "title": "Charging and protection",
        "summary": "",
        "lessons": [
          {
            "id": "P5.M3.L1",
            "title": "Charge profiles",
            "minutes": 30
          },
          {
            "id": "P5.M3.L2",
            "title": "BMS and low-voltage disconnect",
            "minutes": 30
          },
          {
            "id": "P5.M3.L3",
            "title": "Battery safety and maintenance",
            "minutes": 30
          }
        ],
        "practicals": []
      }
    ]
  },
  {
    "id": "S1",
    "title": "Inverter Design and Construction",
    "level": "advanced",
    "stage": "specialist",
    "summary": "Design, assemble and test eight inverters, from a bare H-bridge to a hybrid inverter. You will learn the design method and the safety principles, then build square-wave, modified-sine, pure-sine, push-pull, high-frequency, solar and hybrid inverters. Every calculation is explained. Assembly is verified on the electrical connection graph, and every design is tested in the simulator.",
    "prerequisites": [
      "F1",
      "F2"
    ],
    "recommended": [
      "P2",
      "P3",
      "P4"
    ],
    "status": "published",
    "phase": 6,
    "competency": "CU-11",
    "modules": [
      {
        "id": "S1.M1",
        "title": "Design method and construction safety",
        "summary": "How an inverter design is taken from a requirement to a specification, with every current, loss, rating and protection device calculated and explained, and the safety principles that apply to every construction project.",
        "lessons": [
          {
            "id": "S1.M1.L1",
            "title": "Safety in inverter construction",
            "minutes": 40,
            "hasContent": true
          },
          {
            "id": "S1.M1.L2",
            "title": "From requirements to specification",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "S1.M1.L3",
            "title": "Design calculations: currents, losses and efficiency",
            "minutes": 45,
            "hasContent": true
          },
          {
            "id": "S1.M1.L4",
            "title": "Choosing switches, drivers and controllers",
            "minutes": 45,
            "hasContent": true
          },
          {
            "id": "S1.M1.L5",
            "title": "Transformer, filter, protection and thermal design",
            "minutes": 50,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "S1.M1.P1",
            "title": "Configure a fully compatible design",
            "description": "In project D, choose a component selection with no failed compatibility checks.",
            "link": {
              "kind": "build",
              "label": "Project D components",
              "project": "bld-d"
            },
            "evidence": {
              "kind": "activity",
              "id": "build:design-ok:bld-d"
            }
          },
          {
            "id": "S1.M1.P2",
            "title": "Discharge a capacitor bank safely",
            "description": "Complete the guided discharge procedure in the 3D laboratory.",
            "link": {
              "kind": "lab3d",
              "label": "LF-3K bus capacitors",
              "model": "lf3k",
              "part": "c1"
            },
            "evidence": {
              "kind": "activity",
              "id": "lab3d:discharge"
            }
          }
        ],
        "quiz": {
          "pass": 0.7,
          "questions": []
        },
        "assignment": {
          "id": "S1.M1.asg",
          "title": "Module assignment: complete design of a 24 V, 800 W square-wave inverter",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "S1.M2",
        "title": "Square-wave and modified-sine construction",
        "summary": "Build the three simplest inverters: a bare H-bridge, a square-wave inverter with a step-up transformer, and a phase-shifted \"modified sine\" inverter. Measure what each waveform really contains.",
        "lessons": [
          {
            "id": "S1.M2.L1",
            "title": "The basic DC-to-AC inverter (project A)",
            "minutes": 40,
            "hasContent": true
          },
          {
            "id": "S1.M2.L2",
            "title": "The square-wave inverter (project B)",
            "minutes": 45,
            "hasContent": true
          },
          {
            "id": "S1.M2.L3",
            "title": "The modified sine-wave inverter (project C)",
            "minutes": 45,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "S1.M2.P1",
            "title": "Build project A",
            "description": "Assemble the basic DC-to-AC inverter and pass its test suite.",
            "link": {
              "kind": "build",
              "label": "Project A",
              "project": "bld-a"
            },
            "evidence": {
              "kind": "project",
              "id": "bld-a"
            }
          },
          {
            "id": "S1.M2.P2",
            "title": "Build project B",
            "description": "Assemble the square-wave inverter and pass its test suite.",
            "link": {
              "kind": "build",
              "label": "Project B",
              "project": "bld-b"
            },
            "evidence": {
              "kind": "project",
              "id": "bld-b"
            }
          },
          {
            "id": "S1.M2.P3",
            "title": "Build project C",
            "description": "Assemble the modified sine-wave inverter and pass its test suite.",
            "link": {
              "kind": "build",
              "label": "Project C",
              "project": "bld-c"
            },
            "evidence": {
              "kind": "project",
              "id": "bld-c"
            }
          }
        ],
        "quiz": {
          "pass": 0.7,
          "questions": []
        },
        "assignment": {
          "id": "S1.M2.asg",
          "title": "Module assignment: compare three waveforms for one load",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "S1.M3",
        "title": "The pure sine-wave inverter",
        "summary": "The complete signal and power chain of a regulated sine-wave inverter: DC input stage and bus, gate drivers and dead time, the MOSFET H-bridge, SPWM generation, the LC filter, feedback regulation and output protection, culminating in project D.",
        "lessons": [
          {
            "id": "S1.M3.L1",
            "title": "The signal chain, DC input stage and DC bus",
            "minutes": 40,
            "hasContent": true
          },
          {
            "id": "S1.M3.L2",
            "title": "Gate drivers, dead time and H-bridge switching",
            "minutes": 45,
            "hasContent": true
          },
          {
            "id": "S1.M3.L3",
            "title": "SPWM generation",
            "minutes": 50,
            "hasContent": true
          },
          {
            "id": "S1.M3.L4",
            "title": "The LC output filter",
            "minutes": 45,
            "hasContent": true
          },
          {
            "id": "S1.M3.L5",
            "title": "Feedback, regulation and output protection",
            "minutes": 45,
            "hasContent": true
          },
          {
            "id": "S1.M3.L6",
            "title": "Building the pure sine-wave inverter (project D)",
            "minutes": 60,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "S1.M3.P1",
            "title": "Pure sine-wave experiment",
            "description": "Complete the Phase 5 pure sine-wave inverter experiment.",
            "link": {
              "kind": "sim",
              "label": "Pure sine-wave inverter",
              "exp": "sim-10"
            },
            "evidence": {
              "kind": "activity",
              "id": "sim:sim-10"
            }
          },
          {
            "id": "S1.M3.P2",
            "title": "Build project D",
            "description": "Assemble the pure sine-wave inverter and pass the full test suite.",
            "link": {
              "kind": "build",
              "label": "Project D",
              "project": "bld-d"
            },
            "evidence": {
              "kind": "project",
              "id": "bld-d"
            }
          },
          {
            "id": "S1.M3.P3",
            "title": "Troubleshoot project D",
            "description": "Diagnose project D’s fault from its test readings.",
            "link": {
              "kind": "build",
              "label": "Project D troubleshooting",
              "project": "bld-d"
            },
            "evidence": {
              "kind": "troubleshoot",
              "project": "bld-d"
            }
          }
        ],
        "quiz": {
          "pass": 0.7,
          "questions": []
        },
        "assignment": {
          "id": "S1.M3.asg",
          "title": "Module assignment: design review of a 12 V, 600 W pure sine inverter",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "S1.M4",
        "title": "Transformer and high-frequency topologies",
        "summary": "Two alternatives to the low-frequency full bridge: the push-pull inverter with a centre-tapped transformer, and the high-frequency inverter that uses a small ferrite transformer and a high-voltage DC bus.",
        "lessons": [
          {
            "id": "S1.M4.L1",
            "title": "The push-pull transformer inverter (project E)",
            "minutes": 45,
            "hasContent": true
          },
          {
            "id": "S1.M4.L2",
            "title": "The high-frequency inverter and the HV DC bus (project F)",
            "minutes": 55,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "S1.M4.P1",
            "title": "Build project E",
            "description": "Assemble the push-pull inverter and pass its test suite.",
            "link": {
              "kind": "build",
              "label": "Project E",
              "project": "bld-e"
            },
            "evidence": {
              "kind": "project",
              "id": "bld-e"
            }
          },
          {
            "id": "S1.M4.P2",
            "title": "Build project F",
            "description": "Assemble the high-frequency inverter and pass its test suite.",
            "link": {
              "kind": "build",
              "label": "Project F",
              "project": "bld-f"
            },
            "evidence": {
              "kind": "project",
              "id": "bld-f"
            }
          }
        ],
        "quiz": {
          "pass": 0.7,
          "questions": []
        },
        "assignment": {
          "id": "S1.M4.asg",
          "title": "Module assignment: compare a 1 kW LF and HF design",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "S1.M5",
        "title": "Solar and hybrid architectures",
        "summary": "Inverters that manage more than one energy source: a solar inverter with an MPPT charge stage, and a hybrid inverter that selects between grid, generator and battery. The focus is on energy paths: which source supplies which load, through which components, and when.",
        "lessons": [
          {
            "id": "S1.M5.L1",
            "title": "The solar inverter: PV input, MPPT stage and battery charging (project G)",
            "minutes": 50,
            "hasContent": true
          },
          {
            "id": "S1.M5.L2",
            "title": "The hybrid inverter: grid, generator, transfer switching and energy paths (project H)",
            "minutes": 55,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "S1.M5.P1",
            "title": "Build project G",
            "description": "Assemble the solar inverter, set the MPPT duty and pass its test suite.",
            "link": {
              "kind": "build",
              "label": "Project G",
              "project": "bld-g"
            },
            "evidence": {
              "kind": "project",
              "id": "bld-g"
            }
          },
          {
            "id": "S1.M5.P2",
            "title": "Build project H",
            "description": "Assemble the hybrid inverter and pass its grid, generator and backup tests.",
            "link": {
              "kind": "build",
              "label": "Project H",
              "project": "bld-h"
            },
            "evidence": {
              "kind": "project",
              "id": "bld-h"
            }
          }
        ],
        "quiz": {
          "pass": 0.7,
          "questions": []
        },
        "assignment": {
          "id": "S1.M5.asg",
          "title": "Module assignment: daily energy balance of a solar inverter",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "S1.M6",
        "title": "Engineering testing and troubleshooting",
        "summary": "How an inverter is verified against its specification, how test results are reported, and how faults are found systematically from measurements.",
        "lessons": [
          {
            "id": "S1.M6.L1",
            "title": "The engineering test suite and engineering reports",
            "minutes": 40,
            "hasContent": true
          },
          {
            "id": "S1.M6.L2",
            "title": "Troubleshooting a constructed inverter",
            "minutes": 45,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "S1.M6.P1",
            "title": "Troubleshoot project C",
            "description": "Diagnose the modified-sine phase fault.",
            "link": {
              "kind": "build",
              "label": "Project C",
              "project": "bld-c"
            },
            "evidence": {
              "kind": "troubleshoot",
              "project": "bld-c"
            }
          },
          {
            "id": "S1.M6.P2",
            "title": "Troubleshoot project E",
            "description": "Diagnose the push-pull winding fault.",
            "link": {
              "kind": "build",
              "label": "Project E",
              "project": "bld-e"
            },
            "evidence": {
              "kind": "troubleshoot",
              "project": "bld-e"
            }
          },
          {
            "id": "S1.M6.P3",
            "title": "Troubleshoot project H",
            "description": "Diagnose the hybrid transfer fault.",
            "link": {
              "kind": "build",
              "label": "Project H",
              "project": "bld-h"
            },
            "evidence": {
              "kind": "troubleshoot",
              "project": "bld-h"
            }
          }
        ],
        "quiz": {
          "pass": 0.7,
          "questions": []
        },
        "assignment": {
          "id": "S1.M6.asg",
          "title": "Module assignment: fault-finding report",
          "brief": "",
          "tasks": [],
          "written": []
        }
      }
    ],
    "exam": {
      "pass": 0.7,
      "minutes": 60,
      "attempts": 3,
      "cooldownHours": 24,
      "questions": []
    }
  },
  {
    "id": "S2",
    "title": "Solar PV and Hybrid Engineering",
    "level": "advanced",
    "stage": "specialist",
    "summary": "Photovoltaic fundamentals and module datasheets; strings, MPPT and PWM controllers and solar inverters; complete system design from an actual load profile (inverter, battery, array, controller, cables and protection); off-grid, grid-tied and hybrid systems with generator integration and energy management; installation design, commissioning and troubleshooting.",
    "prerequisites": [
      "F1",
      "F2"
    ],
    "recommended": [
      "S1",
      "P5"
    ],
    "status": "published",
    "phase": 7,
    "competency": "CU-12",
    "modules": [
      {
        "id": "S2.M1",
        "title": "Photovoltaic fundamentals",
        "summary": "How solar cells convert light to electricity, how modules are built and specified, and how to calculate their voltage, current and power under real irradiance and temperature.",
        "lessons": [
          {
            "id": "S2.M1.L1",
            "title": "Solar photovoltaic fundamentals",
            "minutes": 40,
            "hasContent": true
          },
          {
            "id": "S2.M1.L2",
            "title": "Solar panel construction and specifications",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "S2.M1.L3",
            "title": "PV voltage, current and power calculations",
            "minutes": 40,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "S2.M1.P1",
            "title": "PV I–V laboratory: predict and verify a string",
            "description": "Complete the I–V laboratory’s measurement task: predict a string’s V_oc, I_sc and P_mp for given conditions within tolerance.",
            "link": {
              "kind": "solar",
              "label": "PV I–V laboratory",
              "tab": "iv"
            },
            "evidence": {
              "kind": "activity",
              "id": "solar:iv"
            }
          }
        ],
        "quiz": {
          "pass": 0.7,
          "questions": []
        },
        "assignment": {
          "id": "S2.M1.asg",
          "title": "Module assignment: characterising an array",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "S2.M2",
        "title": "Arrays, controllers and conversion",
        "summary": "How modules are combined into strings and arrays, what shading and mismatch do, how MPPT and PWM charge controllers work, and how off-grid, grid-tied and hybrid inverters are built.",
        "lessons": [
          {
            "id": "S2.M2.L1",
            "title": "Series and parallel panel configurations",
            "minutes": 40,
            "hasContent": true
          },
          {
            "id": "S2.M2.L2",
            "title": "MPPT and PWM charge controllers",
            "minutes": 40,
            "hasContent": true
          },
          {
            "id": "S2.M2.L3",
            "title": "Solar inverter architecture",
            "minutes": 35,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "S2.M2.P1",
            "title": "Build project G: solar inverter with MPPT stage",
            "description": "Design, assemble and test the solar inverter in the build laboratory, including the MPPT stage and battery charging.",
            "link": {
              "kind": "build",
              "label": "Build project G",
              "project": "bld-g"
            },
            "evidence": {
              "kind": "project",
              "id": "bld-g"
            }
          },
          {
            "id": "S2.M2.P2",
            "title": "Array and controller configuration assessment",
            "description": "Configure strings and select a controller for a given site and battery. All answers must be correct.",
            "task": {
              "id": "s2-strings",
              "kind": "calc",
              "title": "Strings, fuses and controller",
              "brief": "Illustrative 400 W modules: V_oc 37.1 V, V_mp 31.0 V, I_sc 13.8 A, β −0.27 %/°C, NOCT 45 °C, max series fuse 25 A. Site: coldest −8 °C, hottest 40 °C. 48 V battery charging at 54 V; MPPT needs 5 V headroom. Controller classes 150/250 V. Six modules required.",
              "questions": [
                {
                  "id": "c1",
                  "type": "numeric",
                  "prompt": "Module V_oc on the coldest morning (V)?",
                  "answer": 40.41,
                  "tol": 0.01,
                  "unit": "V",
                  "explain": "37.1 × (1 + 0.0027 × 33) = 37.1 × 1.0891 = 40.41 V."
                },
                {
                  "id": "c2",
                  "type": "numeric",
                  "prompt": "Hot cell temperature at 800 W/m² (°C)?",
                  "answer": 65,
                  "tol": 0.01,
                  "unit": "°C",
                  "explain": "40 + 25."
                },
                {
                  "id": "c3",
                  "type": "numeric",
                  "prompt": "Module V_mp when hot (V)?",
                  "answer": 27.65,
                  "tol": 0.01,
                  "unit": "V",
                  "explain": "31.0 × (1 − 0.0027 × 40) = 31.0 × 0.892 = 27.65 V."
                },
                {
                  "id": "c4",
                  "type": "numeric",
                  "prompt": "Minimum modules in series?",
                  "answer": 3,
                  "tol": 0.001,
                  "unit": "",
                  "explain": "(54 + 5)/27.65 = 2.13 → 3."
                },
                {
                  "id": "c5",
                  "type": "numeric",
                  "prompt": "Maximum in series with a 150 V controller?",
                  "answer": 3,
                  "tol": 0.001,
                  "unit": "",
                  "explain": "150/40.41 = 3.71 → 3."
                },
                {
                  "id": "c6",
                  "type": "mcq",
                  "prompt": "Configuration and controller class?",
                  "options": [
                    "3 in series × 2 strings on a 150 V controller",
                    "6 in series on a 150 V controller",
                    "2 in series × 3 strings on 150 V",
                    "1 × 6 on 150 V"
                  ],
                  "answer": 0,
                  "explain": "3 × 2 fits the 150 V window (cold V_oc 121 V); 6 in series (242 V) would need 250 V; 2 in series is below the minimum."
                }
              ],
              "explain": "The string window comes from cold V_oc (maximum) and hot V_mp (minimum); then choose the configuration and check the controller voltage class."
            },
            "evidence": {
              "kind": "task",
              "id": "s2-strings"
            }
          }
        ],
        "quiz": {
          "pass": 0.7,
          "questions": []
        },
        "assignment": {
          "id": "S2.M2.asg",
          "title": "Module assignment: configuring an array and controller",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "S2.M3",
        "title": "System design from a load profile",
        "summary": "The complete sizing method: from a real list of appliances to daily energy and peak demand, then the inverter, the PV array and the battery bank, each with its formula, working and assumptions.",
        "lessons": [
          {
            "id": "S2.M3.L1",
            "title": "Load profiles and energy budgets",
            "minutes": 40,
            "hasContent": true
          },
          {
            "id": "S2.M3.L2",
            "title": "Solar array sizing",
            "minutes": 40,
            "hasContent": true
          },
          {
            "id": "S2.M3.L3",
            "title": "Battery bank sizing",
            "minutes": 40,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "S2.M3.P1",
            "title": "Solar laboratory: complete system design from a load profile",
            "description": "Design a complete system from a load profile in the solar laboratory with no design faults, and record it.",
            "link": {
              "kind": "solar",
              "label": "Solar laboratory: Design tab",
              "tab": "design"
            },
            "evidence": {
              "kind": "activity",
              "id": "solar:design-ok"
            }
          },
          {
            "id": "S2.M3.P2",
            "title": "Hand-sizing assessment",
            "description": "Size a small off-grid system by hand. All answers must be correct.",
            "task": {
              "id": "s2-sizing",
              "kind": "calc",
              "title": "Sizing an off-grid system",
              "brief": "Loads (AC, η_inv 0.9): 6 LED lamps 10 W for 5 h; a fridge 100 W with duty 0.5 for 24 h (starting 500 W); a TV 70 W for 4 h. Peak simultaneous load 230 W. 12 V LiFePO₄ 12.8 V 100 Ah batteries, DoD 0.8, η 0.95, 2 days autonomy. PSH 5; k 0.8; MPPT η 0.97. Inverter sizes 300, 500, 800 W; surge factor 2.",
              "questions": [
                {
                  "id": "c1",
                  "type": "numeric",
                  "prompt": "Daily AC energy (Wh)?",
                  "answer": 1780,
                  "tol": 0.01,
                  "unit": "Wh",
                  "explain": "300 + 1200 + 280."
                },
                {
                  "id": "c2",
                  "type": "numeric",
                  "prompt": "Energy at the battery (Wh)?",
                  "answer": 1977.8,
                  "tol": 0.01,
                  "unit": "Wh",
                  "explain": "1780/0.9."
                },
                {
                  "id": "c3",
                  "type": "numeric",
                  "prompt": "Inverter rating (W)?",
                  "answer": 500,
                  "tol": 0.001,
                  "unit": "W",
                  "explain": "Continuous 1.25 × 230 = 288 W; surge 230 + 400 = 630 W → 315 W; → 500 W (300 W is below 315 W)."
                },
                {
                  "id": "c4",
                  "type": "numeric",
                  "prompt": "Battery capacity at 12 V (Ah)?",
                  "answer": 412,
                  "tol": 0.01,
                  "unit": "Ah",
                  "explain": "1977.8 × 2 / 0.8 / 12 = 412 Ah."
                },
                {
                  "id": "c5",
                  "type": "numeric",
                  "prompt": "Number of 100 Ah batteries?",
                  "answer": 5,
                  "tol": 0.001,
                  "unit": "",
                  "explain": "⌈4.12⌉ = 5 in parallel (consider larger units)."
                },
                {
                  "id": "c6",
                  "type": "numeric",
                  "prompt": "Required array power (W)?",
                  "answer": 536.7,
                  "tol": 0.01,
                  "unit": "W",
                  "explain": "1977.8/(0.95 × 0.97 × 5 × 0.8) = 536.6 W."
                }
              ],
              "explain": "Energy sizes the battery and array; power and surge size the inverter. Every efficiency between the array and the loads is included."
            },
            "evidence": {
              "kind": "task",
              "id": "s2-sizing"
            }
          }
        ],
        "quiz": {
          "pass": 0.7,
          "questions": []
        },
        "assignment": {
          "id": "S2.M3.asg",
          "title": "Module assignment: size a complete off-grid system by hand",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "S2.M4",
        "title": "System types and energy management",
        "summary": "Off-grid, grid-connected and hybrid systems, generator integration, and the energy-management rules that decide where every watt-hour goes over a day — simulated in the laboratory’s 24-hour energy model.",
        "lessons": [
          {
            "id": "S2.M4.L1",
            "title": "Off-grid systems",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "S2.M4.L2",
            "title": "Grid-connected systems",
            "minutes": 35,
            "hasContent": true
          },
          {
            "id": "S2.M4.L3",
            "title": "Hybrid systems and generator integration",
            "minutes": 40,
            "hasContent": true
          },
          {
            "id": "S2.M4.L4",
            "title": "Energy management",
            "minutes": 40,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "S2.M4.P1",
            "title": "Solar laboratory: multi-day energy-management simulation",
            "description": "Run and record a multi-day energy simulation of a design and interpret its results.",
            "link": {
              "kind": "solar",
              "label": "Energy management",
              "tab": "energy"
            },
            "evidence": {
              "kind": "activity",
              "id": "solar:sim"
            }
          },
          {
            "id": "S2.M4.P2",
            "title": "Build project H: hybrid inverter",
            "description": "Design, assemble and test the hybrid inverter with grid/generator selection and transfer relay in the build laboratory.",
            "link": {
              "kind": "build",
              "label": "Build project H",
              "project": "bld-h"
            },
            "evidence": {
              "kind": "project",
              "id": "bld-h"
            }
          },
          {
            "id": "S2.M4.P3",
            "title": "Generator integration assessment",
            "description": "Size a generator and set its thresholds. All answers must be correct.",
            "task": {
              "id": "s2-generator",
              "kind": "calc",
              "title": "Generator back-up",
              "brief": "Off-grid 48 V LiFePO₄ bank of 300 Ah, DoD 0.8; charger 0.2 C at 55.2 V, η 0.9; peak load 2.4 kW. Generator sizes 5, 6, 8, 10 kVA (PF 0.8 rating basis).",
              "questions": [
                {
                  "id": "c1",
                  "type": "numeric",
                  "prompt": "Charger current (A)?",
                  "answer": 60,
                  "tol": 0.001,
                  "unit": "A",
                  "explain": "0.2 × 300."
                },
                {
                  "id": "c2",
                  "type": "numeric",
                  "prompt": "Charger power (W)?",
                  "answer": 3680,
                  "tol": 0.01,
                  "unit": "W",
                  "explain": "60 × 55.2 / 0.9 = 3680 W."
                },
                {
                  "id": "c3",
                  "type": "numeric",
                  "prompt": "Required generator rating (kVA)?",
                  "answer": 9.5,
                  "tol": 0.01,
                  "unit": "kVA",
                  "explain": "1.25 × 6080 / 0.8 = 9500 VA."
                },
                {
                  "id": "c4",
                  "type": "numeric",
                  "prompt": "Chosen size (kVA)?",
                  "answer": 10,
                  "tol": 0.001,
                  "unit": "kVA",
                  "explain": "Next size."
                },
                {
                  "id": "c5",
                  "type": "numeric",
                  "prompt": "Low-voltage disconnect SOC (%)?",
                  "answer": 20,
                  "tol": 0.001,
                  "unit": "%",
                  "explain": "1 − 0.8."
                },
                {
                  "id": "c6",
                  "type": "mcq",
                  "prompt": "Thresholds?",
                  "options": [
                    "start 30 %, stop 90 %",
                    "start 15 %, stop 90 %",
                    "start 30 %, stop 25 %",
                    "start 90 %, stop 30 %"
                  ],
                  "answer": 0,
                  "explain": "Start above the LVD; stop above start."
                }
              ],
              "explain": "The generator supplies the loads and the charger together with margin; the start threshold sits above the low-voltage disconnect and the stop threshold well above it."
            },
            "evidence": {
              "kind": "task",
              "id": "s2-generator"
            }
          }
        ],
        "quiz": {
          "pass": 0.7,
          "questions": []
        },
        "assignment": {
          "id": "S2.M4.asg",
          "title": "Module assignment: energy-management study of the clinic",
          "brief": "",
          "tasks": [],
          "written": []
        }
      },
      {
        "id": "S2.M5",
        "title": "Installation, commissioning and troubleshooting",
        "summary": "Turning a design into a safe installation: DC and AC protection, isolation and labelling; the commissioning sequence with predicted and measured values; and a systematic method for finding faults in solar and battery systems.",
        "lessons": [
          {
            "id": "S2.M5.L1",
            "title": "Installation design and commissioning",
            "minutes": 45,
            "hasContent": true
          },
          {
            "id": "S2.M5.L2",
            "title": "Solar system troubleshooting",
            "minutes": 45,
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "S2.M5.P1",
            "title": "Solar laboratory: commission a design",
            "description": "Predict the expected values, evaluate the as-built measurements and pass the commissioning record for a healthy installation.",
            "link": {
              "kind": "solar",
              "label": "Commissioning",
              "tab": "commission"
            },
            "evidence": {
              "kind": "activity",
              "id": "solar:commission"
            }
          },
          {
            "id": "S2.M5.P2",
            "title": "Troubleshooting: partial shading",
            "description": "Diagnose the shading scenario from its I–V and power readings.",
            "link": {
              "kind": "solar",
              "label": "Troubleshooting",
              "tab": "faults"
            },
            "evidence": {
              "kind": "activity",
              "id": "solar:fault:shading"
            }
          },
          {
            "id": "S2.M5.P3",
            "title": "Troubleshooting: cold-morning overvoltage",
            "description": "Diagnose the controller-overvoltage scenario.",
            "link": {
              "kind": "solar",
              "label": "Troubleshooting",
              "tab": "faults"
            },
            "evidence": {
              "kind": "activity",
              "id": "solar:fault:voc-cold"
            }
          },
          {
            "id": "S2.M5.P4",
            "title": "Troubleshooting: inverter cut-out on load",
            "description": "Diagnose the voltage-drop scenario.",
            "link": {
              "kind": "solar",
              "label": "Troubleshooting",
              "tab": "faults"
            },
            "evidence": {
              "kind": "activity",
              "id": "solar:fault:cable-drop"
            }
          },
          {
            "id": "S2.M5.P5",
            "title": "Troubleshooting: generator does not start",
            "description": "Diagnose the generator-threshold scenario.",
            "link": {
              "kind": "solar",
              "label": "Troubleshooting",
              "tab": "faults"
            },
            "evidence": {
              "kind": "activity",
              "id": "solar:fault:gen-threshold"
            }
          },
          {
            "id": "S2.M5.P6",
            "title": "Commissioning sequence drill",
            "description": "Put the commissioning steps for a PV-battery system in order, rejecting unsafe or wrong steps.",
            "task": {
              "id": "s2-commission-sequence",
              "kind": "sequence",
              "title": "Commissioning a PV and battery system",
              "brief": "Choose the steps you would carry out, in order, to commission a new off-grid PV and battery system. Some offered steps are wrong or unsafe.",
              "steps": [
                "Inspect the installation visually against the design and labels",
                "With the DC isolators open, check each string’s polarity",
                "Measure each string’s V_oc and I_sc, recording irradiance and module temperature",
                "Test the array insulation resistance against the standard’s limit",
                "Check the battery bank voltage and polarity before connection",
                "Set the controller and inverter from the battery datasheet",
                "Energise in the manufacturer’s order and carry out functional tests",
                "Complete and sign the commissioning record"
              ],
              "distractors": [
                {
                  "text": "Measure string I_sc by shorting the string with a wire and then pulling it off",
                  "why": "Breaking a DC short draws an arc; use a PV tester designed for I_sc."
                },
                {
                  "text": "Connect all strings first to see whether the controller reports a fault",
                  "why": "A reversed or overvoltage string can destroy equipment; test every string before connection."
                },
                {
                  "text": "Use generic charging voltages until the system has run for a week",
                  "why": "Set-points must come from the battery datasheet from the start."
                }
              ],
              "explain": "Inspect, test each string isolated (polarity, V_oc/I_sc with conditions, insulation), check the battery, configure from datasheets, energise in order with functional tests, and record."
            },
            "evidence": {
              "kind": "task",
              "id": "s2-commission-sequence"
            }
          }
        ],
        "quiz": {
          "pass": 0.7,
          "questions": []
        },
        "assignment": {
          "id": "S2.M5.asg",
          "title": "Module assignment: commissioning and fault report",
          "brief": "",
          "tasks": [],
          "written": []
        }
      }
    ],
    "exam": {
      "pass": 0.7,
      "minutes": 75,
      "attempts": 3,
      "cooldownHours": 24,
      "questions": []
    }
  },
  {
    "id": "S3",
    "title": "Installation and Commissioning",
    "level": "advanced",
    "stage": "specialist",
    "summary": "Planning, DC and AC installation, earthing, pre-energisation tests, staged commissioning, records and the role of standards and certification.",
    "prerequisites": [
      "F1",
      "F2"
    ],
    "recommended": [
      "S2",
      "F5"
    ],
    "status": "scheduled",
    "phase": 12,
    "competency": "CU-13",
    "modules": [
      {
        "id": "S3.M1",
        "title": "Planning",
        "summary": "",
        "lessons": [
          {
            "id": "S3.M1.L1",
            "title": "Site survey and load assessment",
            "minutes": 30
          },
          {
            "id": "S3.M1.L2",
            "title": "Equipment location, ventilation and clearances",
            "minutes": 30
          },
          {
            "id": "S3.M1.L3",
            "title": "Single-line diagrams",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "S3.M2",
        "title": "Installation",
        "summary": "",
        "lessons": [
          {
            "id": "S3.M2.L1",
            "title": "DC wiring and protection",
            "minutes": 30
          },
          {
            "id": "S3.M2.L2",
            "title": "AC wiring, earthing and RCDs",
            "minutes": 30
          },
          {
            "id": "S3.M2.L3",
            "title": "PV mounting and DC isolation",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "S3.M3",
        "title": "Commissioning",
        "summary": "",
        "lessons": [
          {
            "id": "S3.M3.L1",
            "title": "Pre-energisation checks",
            "minutes": 30
          },
          {
            "id": "S3.M3.L2",
            "title": "Staged energisation",
            "minutes": 30
          },
          {
            "id": "S3.M3.L3",
            "title": "Commissioning records and handover",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "S3.M4",
        "title": "Compliance",
        "summary": "",
        "lessons": [
          {
            "id": "S3.M4.L1",
            "title": "Standards and certification",
            "minutes": 30
          },
          {
            "id": "S3.M4.L2",
            "title": "Documentation and labelling",
            "minutes": 30
          }
        ],
        "practicals": []
      }
    ]
  },
  {
    "id": "S4",
    "title": "Advanced Diagnostics and Professional Repair",
    "level": "advanced",
    "stage": "specialist",
    "summary": "Systematic testing with virtual instruments, the troubleshooting method, seventeen repair scenarios from the repair workshop and professional repair practice: root-cause analysis, verification and return to service.",
    "prerequisites": [
      "F1",
      "F2"
    ],
    "recommended": [
      "F5",
      "P4",
      "S1"
    ],
    "status": "scheduled",
    "phase": 13,
    "competency": "CU-14",
    "modules": [
      {
        "id": "S4.M1",
        "title": "Systematic testing",
        "summary": "",
        "lessons": [
          {
            "id": "S4.M1.L1",
            "title": "Test plans",
            "minutes": 30
          },
          {
            "id": "S4.M1.L2",
            "title": "Measuring with virtual instruments",
            "minutes": 30
          },
          {
            "id": "S4.M1.L3",
            "title": "Interpreting results",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "S4.M2",
        "title": "Troubleshooting method",
        "summary": "",
        "lessons": [
          {
            "id": "S4.M2.L1",
            "title": "Symptom, hypothesis, test, conclusion",
            "minutes": 30
          },
          {
            "id": "S4.M2.L2",
            "title": "Fault trees",
            "minutes": 30
          },
          {
            "id": "S4.M2.L3",
            "title": "Safety during diagnosis",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "S4.M3",
        "title": "Repair workshop",
        "summary": "",
        "lessons": [
          {
            "id": "S4.M3.L1",
            "title": "Seventeen repair scenarios (one lesson each)",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "S4.M4",
        "title": "Professional repair practice",
        "summary": "",
        "lessons": [
          {
            "id": "S4.M4.L1",
            "title": "Component-level versus board-level repair",
            "minutes": 30
          },
          {
            "id": "S4.M4.L2",
            "title": "Root-cause analysis and failure reports",
            "minutes": 30
          },
          {
            "id": "S4.M4.L3",
            "title": "Verification and return to service",
            "minutes": 30
          }
        ],
        "practicals": []
      }
    ]
  },
  {
    "id": "S5",
    "title": "Maintenance, Standards and Professional Practice",
    "level": "advanced",
    "stage": "specialist",
    "summary": "Preventive maintenance of inverter, battery and PV systems; how standards and certification work; documentation, ethics and working within one’s competence; and the capstone project with the competency assessments and final examination.",
    "prerequisites": [
      "S1",
      "S2",
      "S3",
      "S4"
    ],
    "recommended": [],
    "status": "scheduled",
    "phase": 14,
    "competency": "CU-15",
    "modules": [
      {
        "id": "S5.M1",
        "title": "Preventive maintenance",
        "summary": "",
        "lessons": [
          {
            "id": "S5.M1.L1",
            "title": "Inspection schedules",
            "minutes": 30
          },
          {
            "id": "S5.M1.L2",
            "title": "Fans, filters, terminals and torque",
            "minutes": 30
          },
          {
            "id": "S5.M1.L3",
            "title": "Battery and PV maintenance",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "S5.M2",
        "title": "Standards and professional practice",
        "summary": "",
        "lessons": [
          {
            "id": "S5.M2.L1",
            "title": "How standards and certification work",
            "minutes": 30
          },
          {
            "id": "S5.M2.L2",
            "title": "Documentation, records and ethics",
            "minutes": 30
          },
          {
            "id": "S5.M2.L3",
            "title": "Working within one’s competence and supervised training",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "S5.M3",
        "title": "Capstone and certification",
        "summary": "",
        "lessons": [
          {
            "id": "S5.M3.L1",
            "title": "Capstone brief and requirements",
            "minutes": 30
          },
          {
            "id": "S5.M3.L2",
            "title": "Design, simulation and report",
            "minutes": 30
          },
          {
            "id": "S5.M3.L3",
            "title": "Practical competency tasks, final examination and virtual-competency record",
            "minutes": 30
          }
        ],
        "practicals": []
      }
    ]
  }
]

export const SHELL_BY_ID: Record<string, Course> = Object.fromEntries(SHELL_COURSES.map((c) => [c.id, c]))

export const SHELL_COMPETENCIES: Competency[] = [
  { id: 'CU-01', title: 'Apply electrical safety, isolation and discharge procedures', courses: ['F1'] },
  { id: 'CU-02', title: 'Analyse DC circuits and energy storage', courses: ['F2'] },
  { id: 'CU-03', title: 'Analyse AC circuits, power and transformers', courses: ['F3'] },
  { id: 'CU-04', title: 'Identify, test and select inverter components', courses: ['F4'] },
  { id: 'CU-05', title: 'Use measurement instruments safely and correctly', courses: ['F5'] },
  { id: 'CU-06', title: 'Build and verify circuits from schematics', courses: ['P1'] },
  { id: 'CU-07', title: 'Explain and analyse power-electronic switching circuits', courses: ['P2'] },
  { id: 'CU-08', title: 'Explain inverter operation and waveform quality', courses: ['P3'] },
  { id: 'CU-09', title: 'Disassemble and reassemble an inverter safely', courses: ['P4'] },
  { id: 'CU-10', title: 'Specify and protect battery DC systems', courses: ['P5'] },
  { id: 'CU-11', title: 'Design, assemble and test inverters to a specification', courses: ['S1'] },
  { id: 'CU-12', title: 'Design solar and hybrid systems', courses: ['S2'] },
  { id: 'CU-13', title: 'Plan installation and commissioning', courses: ['S3'] },
  { id: 'CU-14', title: 'Diagnose and repair inverter faults', courses: ['S4'] },
  { id: 'CU-15', title: 'Maintain systems and practise professionally to standards', courses: ['S5'] },
]

export const SHELL_VIRTUAL_COMPETENCY_NOTE = 'Virtual competency. Real-world practice requires supervised physical training and locally required qualifications.'
