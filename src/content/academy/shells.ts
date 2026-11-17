/**
 * Lightweight structural facts for every course: ids, titles, prerequisites, lesson/module
 * presence, quiz pass marks, practicals' evidence and exam configuration — everything the
 * prerequisite gates (gates.ts), course-unlock logic and the dashboard banner need, with NONE
 * of the heavy authored content (lesson bodies, worked examples, question text, diagrams,
 * assignment briefs). This keeps the dashboard and the circuit/build/solar/3D laboratory pages
 * from pulling in the full course catalogue merely to check a prerequisite.
 *
 * GENERATED from the real catalogue (content/academy/_genshells.test.ts, run once and removed).
 * A consistency test (shells.test.ts) checks this file stays in sync with the real courses:
 * regenerate it (temporarily restore _genshells.test.ts) whenever a course's structure changes
 * (a lesson, module, practical or exam is added, removed or renamed).
 */
import type { Course } from './types'

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
            "evidence": {
              "kind": "task",
              "id": "f1-isolation-sequence"
            }
          },
          {
            "id": "F1.M3.P2",
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
            "evidence": {
              "kind": "activity",
              "id": "sim:sim-01"
            }
          },
          {
            "id": "F2.M4.P2",
            "evidence": {
              "kind": "exercise",
              "id": "ckt-03"
            }
          },
          {
            "id": "F2.M4.P3",
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
            "evidence": {
              "kind": "exercise",
              "id": "ckt-02"
            }
          },
          {
            "id": "F2.M5.P2",
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
    "status": "scheduled",
    "phase": 8,
    "competency": "CU-03",
    "modules": [
      {
        "id": "F3.M1",
        "title": "Alternating quantities",
        "summary": "",
        "lessons": [
          {
            "id": "F3.M1.L1",
            "title": "Why AC is used",
            "minutes": 30
          },
          {
            "id": "F3.M1.L2",
            "title": "Sine waves: amplitude, period, frequency, phase",
            "minutes": 30
          },
          {
            "id": "F3.M1.L3",
            "title": "Peak, average and RMS",
            "minutes": 30
          },
          {
            "id": "F3.M1.L4",
            "title": "Non-sinusoidal waveforms",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "F3.M2",
        "title": "Reactance and impedance",
        "summary": "",
        "lessons": [
          {
            "id": "F3.M2.L1",
            "title": "Capacitive reactance",
            "minutes": 30
          },
          {
            "id": "F3.M2.L2",
            "title": "Inductive reactance",
            "minutes": 30
          },
          {
            "id": "F3.M2.L3",
            "title": "Impedance and phasors",
            "minutes": 30
          },
          {
            "id": "F3.M2.L4",
            "title": "Resonance and filters",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "F3.M3",
        "title": "AC power",
        "summary": "",
        "lessons": [
          {
            "id": "F3.M3.L1",
            "title": "Real, reactive and apparent power",
            "minutes": 30
          },
          {
            "id": "F3.M3.L2",
            "title": "Power factor and current lag",
            "minutes": 30
          },
          {
            "id": "F3.M3.L3",
            "title": "Harmonics and THD",
            "minutes": 30
          },
          {
            "id": "F3.M3.L4",
            "title": "Energy returned by reactive loads",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "F3.M4",
        "title": "Transformers",
        "summary": "",
        "lessons": [
          {
            "id": "F3.M4.L1",
            "title": "Mutual induction and turns ratio",
            "minutes": 30
          },
          {
            "id": "F3.M4.L2",
            "title": "Ideal and real transformers",
            "minutes": 30
          },
          {
            "id": "F3.M4.L3",
            "title": "Isolation and safety",
            "minutes": 30
          },
          {
            "id": "F3.M4.L4",
            "title": "Transformer connection",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "F3.M5",
        "title": "Rectification",
        "summary": "",
        "lessons": [
          {
            "id": "F3.M5.L1",
            "title": "Half-wave and full-wave rectification",
            "minutes": 30
          },
          {
            "id": "F3.M5.L2",
            "title": "The bridge rectifier",
            "minutes": 30
          },
          {
            "id": "F3.M5.L3",
            "title": "Smoothing and ripple",
            "minutes": 30
          }
        ],
        "practicals": []
      }
    ]
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
    "status": "scheduled",
    "phase": 9,
    "competency": "CU-04",
    "modules": [
      {
        "id": "F4.M1",
        "title": "Passive components",
        "summary": "",
        "lessons": [
          {
            "id": "F4.M1.L1",
            "title": "Resistors",
            "minutes": 30
          },
          {
            "id": "F4.M1.L2",
            "title": "Capacitors: electrolytic, film and ceramic",
            "minutes": 30
          },
          {
            "id": "F4.M1.L3",
            "title": "Inductors",
            "minutes": 30
          },
          {
            "id": "F4.M1.L4",
            "title": "Testing passive components",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "F4.M2",
        "title": "Semiconductor devices",
        "summary": "",
        "lessons": [
          {
            "id": "F4.M2.L1",
            "title": "Introduction to semiconductors",
            "minutes": 30
          },
          {
            "id": "F4.M2.L2",
            "title": "Diodes",
            "minutes": 30
          },
          {
            "id": "F4.M2.L3",
            "title": "Rectification with diodes",
            "minutes": 30
          },
          {
            "id": "F4.M2.L4",
            "title": "MOSFETs",
            "minutes": 30
          },
          {
            "id": "F4.M2.L5",
            "title": "IGBTs",
            "minutes": 30
          },
          {
            "id": "F4.M2.L6",
            "title": "Gate drivers",
            "minutes": 30
          },
          {
            "id": "F4.M2.L7",
            "title": "Switching characteristics",
            "minutes": 30
          },
          {
            "id": "F4.M2.L8",
            "title": "Component testing",
            "minutes": 30
          },
          {
            "id": "F4.M2.L9",
            "title": "Fault identification",
            "minutes": 30
          },
          {
            "id": "F4.M2.L10",
            "title": "Component replacement",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "F4.M3",
        "title": "Magnetic components",
        "summary": "",
        "lessons": [
          {
            "id": "F4.M3.L1",
            "title": "Magnetic circuits and saturation",
            "minutes": 30
          },
          {
            "id": "F4.M3.L2",
            "title": "Transformers in inverters",
            "minutes": 30
          },
          {
            "id": "F4.M3.L3",
            "title": "Output and filter inductors",
            "minutes": 30
          },
          {
            "id": "F4.M3.L4",
            "title": "Testing windings",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "F4.M4",
        "title": "Protection and switching devices",
        "summary": "",
        "lessons": [
          {
            "id": "F4.M4.L1",
            "title": "Fuses",
            "minutes": 30
          },
          {
            "id": "F4.M4.L2",
            "title": "Circuit breakers",
            "minutes": 30
          },
          {
            "id": "F4.M4.L3",
            "title": "Relays and contactors",
            "minutes": 30
          },
          {
            "id": "F4.M4.L4",
            "title": "Relays versus semiconductor switches",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "F4.M5",
        "title": "Control, sensing and thermal",
        "summary": "",
        "lessons": [
          {
            "id": "F4.M5.L1",
            "title": "PWM controllers and microcontrollers",
            "minutes": 30
          },
          {
            "id": "F4.M5.L2",
            "title": "Voltage and current sensing",
            "minutes": 30
          },
          {
            "id": "F4.M5.L3",
            "title": "Heat sinks, fans and thermal resistance",
            "minutes": 30
          },
          {
            "id": "F4.M5.L4",
            "title": "PCBs, connectors and terminals",
            "minutes": 30
          }
        ],
        "practicals": []
      }
    ]
  },
  {
    "id": "F5",
    "title": "Measurement and Virtual Instruments",
    "level": "beginner",
    "stage": "foundation",
    "summary": "Accuracy and uncertainty, measurement categories, the multimeter, clamp meter, oscilloscope and specialist instruments, used on live simulations.",
    "prerequisites": [
      "F1",
      "F2"
    ],
    "recommended": [
      "F3"
    ],
    "status": "scheduled",
    "phase": 8,
    "competency": "CU-05",
    "modules": [
      {
        "id": "F5.M1",
        "title": "Measurement basics",
        "summary": "",
        "lessons": [
          {
            "id": "F5.M1.L1",
            "title": "Accuracy, resolution and uncertainty",
            "minutes": 30
          },
          {
            "id": "F5.M1.L2",
            "title": "Measurement categories and probe safety",
            "minutes": 30
          },
          {
            "id": "F5.M1.L3",
            "title": "Recording results",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "F5.M2",
        "title": "Multimeter and clamp meter",
        "summary": "",
        "lessons": [
          {
            "id": "F5.M2.L1",
            "title": "Voltage, current, resistance, continuity and diode test",
            "minutes": 30
          },
          {
            "id": "F5.M2.L2",
            "title": "Clamp meters and DC/AC current",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "F5.M3",
        "title": "Oscilloscope",
        "summary": "",
        "lessons": [
          {
            "id": "F5.M3.L1",
            "title": "Time base, volts per division and trigger",
            "minutes": 30
          },
          {
            "id": "F5.M3.L2",
            "title": "Measuring frequency, duty and RMS",
            "minutes": 30
          },
          {
            "id": "F5.M3.L3",
            "title": "Spectrum and THD",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "F5.M4",
        "title": "Specialist instruments",
        "summary": "",
        "lessons": [
          {
            "id": "F5.M4.L1",
            "title": "Insulation resistance testing",
            "minutes": 30
          },
          {
            "id": "F5.M4.L2",
            "title": "LCR and ESR meters",
            "minutes": 30
          },
          {
            "id": "F5.M4.L3",
            "title": "Thermal imaging and temperature probes",
            "minutes": 30
          }
        ],
        "practicals": []
      }
    ]
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
    "status": "scheduled",
    "phase": 9,
    "competency": "CU-09",
    "modules": [
      {
        "id": "P4.M1",
        "title": "Architecture tour",
        "summary": "",
        "lessons": [
          {
            "id": "P4.M1.L1",
            "title": "Enclosure, terminals and earthing",
            "minutes": 30
          },
          {
            "id": "P4.M1.L2",
            "title": "The power stage",
            "minutes": 30
          },
          {
            "id": "P4.M1.L3",
            "title": "Magnetics",
            "minutes": 30
          },
          {
            "id": "P4.M1.L4",
            "title": "Control electronics",
            "minutes": 30
          },
          {
            "id": "P4.M1.L5",
            "title": "Protection and sensing",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "P4.M2",
        "title": "Safe disassembly and reassembly",
        "summary": "",
        "lessons": [
          {
            "id": "P4.M2.L1",
            "title": "Isolation and discharge in practice",
            "minutes": 30
          },
          {
            "id": "P4.M2.L2",
            "title": "Disassembly sequence and why",
            "minutes": 30
          },
          {
            "id": "P4.M2.L3",
            "title": "Reassembly and functional test",
            "minutes": 30
          }
        ],
        "practicals": []
      },
      {
        "id": "P4.M3",
        "title": "Identification",
        "summary": "",
        "lessons": [
          {
            "id": "P4.M3.L1",
            "title": "Recognising components on a board",
            "minutes": 30
          },
          {
            "id": "P4.M3.L2",
            "title": "Comparing a square-wave and a hybrid inverter",
            "minutes": 30
          }
        ],
        "practicals": []
      }
    ]
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
            "evidence": {
              "kind": "activity",
              "id": "build:design-ok:bld-d"
            }
          },
          {
            "id": "S1.M1.P2",
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
            "legacyId": "bld-a",
            "hasContent": true
          },
          {
            "id": "S1.M2.L2",
            "title": "The square-wave inverter (project B)",
            "minutes": 45,
            "legacyId": "bld-b",
            "hasContent": true
          },
          {
            "id": "S1.M2.L3",
            "title": "The modified sine-wave inverter (project C)",
            "minutes": 45,
            "legacyId": "bld-c",
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "S1.M2.P1",
            "evidence": {
              "kind": "project",
              "id": "bld-a"
            }
          },
          {
            "id": "S1.M2.P2",
            "evidence": {
              "kind": "project",
              "id": "bld-b"
            }
          },
          {
            "id": "S1.M2.P3",
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
            "legacyId": "bld-d",
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "S1.M3.P1",
            "evidence": {
              "kind": "activity",
              "id": "sim:sim-10"
            }
          },
          {
            "id": "S1.M3.P2",
            "evidence": {
              "kind": "project",
              "id": "bld-d"
            }
          },
          {
            "id": "S1.M3.P3",
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
            "legacyId": "bld-e",
            "hasContent": true
          },
          {
            "id": "S1.M4.L2",
            "title": "The high-frequency inverter and the HV DC bus (project F)",
            "minutes": 55,
            "legacyId": "bld-f",
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "S1.M4.P1",
            "evidence": {
              "kind": "project",
              "id": "bld-e"
            }
          },
          {
            "id": "S1.M4.P2",
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
            "legacyId": "bld-g",
            "hasContent": true
          },
          {
            "id": "S1.M5.L2",
            "title": "The hybrid inverter: grid, generator, transfer switching and energy paths (project H)",
            "minutes": 55,
            "legacyId": "bld-h",
            "hasContent": true
          }
        ],
        "practicals": [
          {
            "id": "S1.M5.P1",
            "evidence": {
              "kind": "project",
              "id": "bld-g"
            }
          },
          {
            "id": "S1.M5.P2",
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
            "evidence": {
              "kind": "troubleshoot",
              "project": "bld-c"
            }
          },
          {
            "id": "S1.M6.P2",
            "evidence": {
              "kind": "troubleshoot",
              "project": "bld-e"
            }
          },
          {
            "id": "S1.M6.P3",
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
            "evidence": {
              "kind": "project",
              "id": "bld-g"
            }
          },
          {
            "id": "S2.M2.P2",
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
            "evidence": {
              "kind": "activity",
              "id": "solar:design-ok"
            }
          },
          {
            "id": "S2.M3.P2",
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
            "evidence": {
              "kind": "activity",
              "id": "solar:sim"
            }
          },
          {
            "id": "S2.M4.P2",
            "evidence": {
              "kind": "project",
              "id": "bld-h"
            }
          },
          {
            "id": "S2.M4.P3",
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
            "evidence": {
              "kind": "activity",
              "id": "solar:commission"
            }
          },
          {
            "id": "S2.M5.P2",
            "evidence": {
              "kind": "activity",
              "id": "solar:fault:shading"
            }
          },
          {
            "id": "S2.M5.P3",
            "evidence": {
              "kind": "activity",
              "id": "solar:fault:voc-cold"
            }
          },
          {
            "id": "S2.M5.P4",
            "evidence": {
              "kind": "activity",
              "id": "solar:fault:cable-drop"
            }
          },
          {
            "id": "S2.M5.P5",
            "evidence": {
              "kind": "activity",
              "id": "solar:fault:gen-threshold"
            }
          },
          {
            "id": "S2.M5.P6",
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
] as Course[]

export const SHELL_BY_ID: Record<string, Course> = Object.fromEntries(SHELL_COURSES.map((c) => [c.id, c]))

export const SHELL_COMPETENCIES = [
  {
    "id": "CU-01",
    "title": "Apply electrical safety, isolation and discharge procedures",
    "courses": [
      "F1"
    ]
  },
  {
    "id": "CU-02",
    "title": "Analyse DC circuits and energy storage",
    "courses": [
      "F2"
    ]
  },
  {
    "id": "CU-03",
    "title": "Analyse AC circuits, power and transformers",
    "courses": [
      "F3"
    ]
  },
  {
    "id": "CU-04",
    "title": "Identify, test and select inverter components",
    "courses": [
      "F4"
    ]
  },
  {
    "id": "CU-05",
    "title": "Use measurement instruments safely and correctly",
    "courses": [
      "F5"
    ]
  },
  {
    "id": "CU-06",
    "title": "Build and verify circuits from schematics",
    "courses": [
      "P1"
    ]
  },
  {
    "id": "CU-07",
    "title": "Explain and analyse power-electronic switching circuits",
    "courses": [
      "P2"
    ]
  },
  {
    "id": "CU-08",
    "title": "Explain inverter operation and waveform quality",
    "courses": [
      "P3"
    ]
  },
  {
    "id": "CU-09",
    "title": "Disassemble and reassemble an inverter safely",
    "courses": [
      "P4"
    ]
  },
  {
    "id": "CU-10",
    "title": "Specify and protect battery DC systems",
    "courses": [
      "P5"
    ]
  },
  {
    "id": "CU-11",
    "title": "Design, assemble and test inverters to a specification",
    "courses": [
      "S1"
    ]
  },
  {
    "id": "CU-12",
    "title": "Design solar and hybrid systems",
    "courses": [
      "S2"
    ]
  },
  {
    "id": "CU-13",
    "title": "Plan installation and commissioning",
    "courses": [
      "S3"
    ]
  },
  {
    "id": "CU-14",
    "title": "Diagnose and repair inverter faults",
    "courses": [
      "S4"
    ]
  },
  {
    "id": "CU-15",
    "title": "Maintain systems and practise professionally to standards",
    "courses": [
      "S5"
    ]
  }
]

export const SHELL_VIRTUAL_COMPETENCY_NOTE = "Virtual competency. Real-world practice requires supervised physical training and locally required qualifications."
