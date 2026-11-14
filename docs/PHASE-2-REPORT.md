# Phase 2 Completion Report: 3D Inverter Dissection Laboratory

**Status:** complete. All checks pass (TypeScript, 74 unit tests, lint with 0 warnings, production build, full browser walkthrough including 3D, mobile and persistence).

## 1. What was built, by plan step

| Step | Delivered |
|---|---|
| 1. Component data and symbols | 24 full `ElectronicComponent` entries (13 panel fields plus beginner summary and advanced design note), plus a structural entry for the enclosure. IEC-style SVG symbols for all 24. Datasheet pinouts for TO-247 (G-D-S / G-C-E, tab = drain/collector), UCC27211 SOIC-8 and SG3525 DIP-16. |
| 2. Route, canvas, camera, fallback | `React.lazy` route; demand-rendered canvas; local light-formers instead of downloaded HDR maps; `CameraControls` with angle-preserving focus; WebGL fallback that keeps the lists, panels and procedures working. |
| 3. Part builders | 24 procedural builders. Terminal positions are derived from the same dimensions, and a test confirms every 3D pin exists in the component data. Canvas-drawn markings (part numbers, ratings), electrolytic negative stripe on the − side, diode cathode band, IEC 60062 resistor colour bands computed from the value, pin-1 dots and notches, L/N/PE colours, PV+/PV−, battery +/−, earth symbol, PCB silkscreen designators, a live LCD and a nameplate with the stored-energy warning. |
| 4. Models and parts tree | Model registry with **LF-3K** (3 kW hybrid, 43 parts, 42 removable, covering all 24 components) and **SQ-1K** (1 kW square-wave, 20 parts). Accessible parts tree grouped by assembly. |
| 5. Selection and information panel | Click or tap selection with hit targets for small or sparse parts; tint highlight; labels; 13-field panel in four tabs (Overview, Pins & I/O, Faults & testing, Safety) with a rotatable 3D preview and schematic symbol; related parts link to the model. |
| 6. Explode, visibility, connections | Animated explode with board-relative offsets; hide/reveal per part; "Inspect alone"; isolate any assembly with camera framing; connection-point markers coloured by role, with pin labels on the selected part. |
| 7. Guided activities and progress | 11-stage LF-3K procedure (9 for SQ-1K) with isolation checklist, discharge simulator, ordering rules from `mountedOn`/`dependsOn`, explanations for every refused step and four checkpoint questions. Reverse-order reassembly from a parts tray, ending in a reconnect and functional-test checklist. Identification challenge at three levels; the advanced run records assessment **asm-01**. Six 3D Lab lessons complete automatically from studied components and finished activities. |
| 8. Responsive, keyboard, performance | Desktop three-column layout; tablet and phone stack with the canvas first; touch orbit, pinch and tap; every action reachable from the parts list and activity panel by keyboard; Escape clears selection; render on demand. |
| 9. Gate and documentation | This report, updated ARCHITECTURE.md and README. |

## 2. Additional requirements

| Requirement | How it is met |
|---|---|
| 1. Recognisable models with accurate terminals, polarity and labels | Real package proportions; pinouts from datasheets; polarity marks as listed in step 3; test `places 3D terminals only on pins documented for that component`. |
| 2. Detailed information panel for every component | All 24 components plus the enclosure; test enforces all fields with minimum content. |
| 3. Interactive, sequential, educational disassembly and reassembly | Stage gating, dependency rules, why-now text, refusal explanations, checkpoints, reverse reassembly with tips. Test proves both models can be fully disassembled and reassembled by following the rules (no dead ends). |
| 4. Meaningful capacitor discharge | RC decay with live V, E, I, P and curve; bleeder versus tool trade-offs (time, pulse energy); screwdriver refused (> 10 kA peak); meter verification required; advanced prediction of RC·ln(V₀/50). Example: LF-3K 940 µF at 420 V = 82.9 J; 470 Ω tool τ = 0.44 s; bleeders take 3.1 min. |
| 5. Beginner, intermediate, advanced | Level selector stored in progress; changes panel emphasis, guidance, hints, checkpoints, discharge prediction and challenge size and format (table in ARCHITECTURE §6). |
| 6. Progress reflects activities and assessments | New progress fields: `level`, `inspectedComponents`, `activities`. Dashboard counters, lessons, the asm-01 assessment, an activity log and a new "Safe Hands" badge all update from real actions. |
| 7. Architecture for multiple models | Data-only model registry, shared builders, generic procedure and challenge logic, per-model tests; proven with a second model. |
| 8. Optimised for laptops and tablets | Demand rendering (0 idle frames measured), shared materials, merged geometry, adaptive DPR, shadows and environment rendered once, code-split 343 kB gzip chunk; dashboard bundle +6 kB only. |

## 3. Verification results

| Check | Result |
|---|---|
| TypeScript (`tsc -b`) | Pass |
| Unit tests | **74 pass** (15 from Phase 1 + 59 new: component integrity, model integrity ×2 models, sequencing, discharge physics, challenge generation, lesson criteria, colour code, progress merge) |
| Lint (oxlint) | 0 warnings |
| Production build | Pass; main 322 kB (102 kB gzip), 3D chunk 1.25 MB (343 kB gzip) |
| Phase 1 regression walkthrough | All 12 routes, dashboard bench readouts unchanged (48.3 %, 31.1 %, 52.4 % THD), backup/copy/download/restore/reset, malformed-backup and corrupted-IndexedDB recovery, phone drawer, LAN (non-secure) access |
| 3D rendering (headless Chromium, SwiftShader WebGL 2) | Both models render; about 350 draw calls; 0 frames while idle |
| 3D interaction | Real canvas clicks select parts; centre-click hit rate 36/41 from the default view (the rest are correctly occluded or land on a part mounted on top); explode, isolate, labels, connections, focus |
| Guided disassembly (intermediate) | Out-of-order attempts refused with explanation; isolation checklist; screwdriver refused; meter 420 V before and 20.9 V after; 4/4 checkpoints; 42 parts removed |
| Reassembly | All parts reinstalled in valid reverse order; functional-test checklist completes and records the activity |
| Advanced identification | 20 prompts answered by real 3D clicks (19 correct), recorded as asm-01 pass |
| Mobile and tablet | 390 px and 820 px: no horizontal overflow; touch tap selects; panel readable |
| Keyboard | Parts list Enter selects; Escape clears |
| No WebGL | Notice shown; parts list and information panel work |
| Persistence | After reload: level, identified components (19/24), activities (4), asm-01 (95 %), lessons, badges and section visits all restored |

## 4. Defects found and fixed during Phase 2 testing

1. **Hidden and removed parts captured clicks.** Three.js raycasting does not skip invisible objects. Fixed with a pointer-event filter that ignores invisible branches.
2. **Enclosure walls and the heat sink hid interior parts from clicks** (hit rate 17/41). Fixed with X-ray walls when the cover is off, a steeper default view and full-size hit targets for sparse parts (now 36/41).
3. **Outline highlight produced large artefacts** on extruded shapes with holes (TO-247 tab). Replaced with a tint overlay that shares the mesh geometry.
4. **Actions taken before IndexedDB finished loading were lost** (for example a page visit on reload). Fixed with `mergeProgress` (tested).
5. **Information panel failed without WebGL** because of the preview canvas. The preview now checks for WebGL.
6. **Phone overflow** from the long model names in the selector. Fixed with a shrinkable selector and short option names.
7. **Camera focus** snapped to axis views (`fitToBox` behaviour) and clipped into neighbouring parts. Fixed with `fitToSphere`, a minimum radius and a steeper polar angle.

## 5. Notes and limitations

- Console messages seen in testing, not from app code: a `THREE.Clock` deprecation warning from inside React Three Fiber, and SwiftShader performance hints in the headless browser.
- Parts are educational representations; see ARCHITECTURE §10 for the full list.
- The component database written here is reused by Phase 3, so Phase 3 builds only the library interface.
