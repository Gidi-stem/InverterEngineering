# Phase 2 Plan: Interactive 3D Inverter Dissection Laboratory

Status: **planned, not started.** Phase 1 audit is complete (see the audit commit on `main`).

## 1. Goal

Turn the 3D Inverter Laboratory section into the centre of the application: one complete, recognisable 3 kW hybrid inverter that students can rotate, zoom, pan, take apart, inspect part by part and put back together. Every part opens an information panel with the 13 fields from the project brief, and identification and lesson progress are recorded for real.

## 2. Requirement coverage (brief §4)

| Requirement | How Phase 2 delivers it |
|---|---|
| 360° rotate, zoom, pan | drei `CameraControls` (camera-controls 2.x): orbit, dolly, truck, damping, distance limits, touch gestures |
| Select / highlight / name | R3F pointer events with `stopPropagation`; hover cursor (`useCursor`); selected part gets `Outlines` + emissive tint; `Html` name tag |
| Information panel (13 fields) | `ComponentInfoPanel` reading `ElectronicComponent` data: name, 3D preview, SVG symbol, function, principle, applications, pinout, I/O behaviour, failure symptoms, test method, replacement notes, safety, related parts (clickable) |
| Exploded view / separate / reassemble | Explode factor 0–1, eased in `useFrame`; each part moves along its own `explodeOffset`. Reassemble animates back. A guided disassembly/reassembly mode enforces a valid order |
| Hide and reveal | Per-part and per-assembly visibility toggles, "Show all", "Hide others" |
| Inspect individual boards | Isolate an assembly (power board, control board, display board, terminal block, cooling); camera fits it with `CameraControls.fitToBox` |
| Connection points | Toggle shows terminal markers on every part with pin labels (G/D/S, C/G/E, +/−, L/N/PE, PV+/PV−) |
| Recognisable models, not cubes | Parametric part factories (§4), no generic boxes |

## 3. Key decisions

1. **Procedural geometry, not downloaded GLB files.** Each part is built from Three.js primitives, extrusions, lathes and instancing by a typed factory. Benefits: no asset pipeline or licensing, small bundle, works offline and inside sandboxed viewers (no network), parts can be parameterised (resistor colour bands are computed from the resistance value), and every mesh carries its own part id for selection.
2. **Pull the 24 component data entries forward from Phase 3.** The info panel needs full `ElectronicComponent` records and SVG symbols now. Phase 2 writes `src/content/components/*.ts` (24 entries) and `src/ui/symbols/` (schematic symbol set). Phase 3 then builds the library UI (search, filters, compare) on the same data, with no duplication.
3. **Lazy-loaded route.** Three + R3F + drei are roughly 700 kB minified. The 3D lab is `React.lazy`-loaded, so the dashboard bundle does not grow. A WebGL capability check shows a clear fallback (the parts list and info panels still work) where WebGL is unavailable.
4. **No CDN assets.** No `<Environment preset>` (it fetches HDR maps) and no drei `<Text>` (it fetches fonts). Lighting is built from local lights plus `<Environment>` with `<Lightformer>` children; labels use `Html` with the app's bundled fonts.
5. **Render on demand.** `frameloop="demand"` with `invalidate()` during animation, so a static scene uses no GPU on laptops and tablets.
6. **Accessible twin of the 3D scene.** A parts tree lists every part by assembly. Selecting in the list selects in 3D and moves the camera; everything works by keyboard and screen reader.

## 4. The model: 3 kW hybrid inverter (`content/models/hybrid-3kw.ts`)

`InverterModel` data with about 45 `ModelPart` instances, covering all 24 component types in the catalogue:

| Assembly | Parts (factory) |
|---|---|
| Chassis | Enclosure base and removable cover (sheet metal, vents, screw bosses), protective-earth stud with green/yellow lead |
| Terminal block | Battery terminals (red/black bolt posts), DC input, AC output block (L/N/PE), solar MC4 pair, DC circuit breaker (DIN), blade/glass fuses |
| Power board | 4× MOSFET TO-247 (H-bridge), 2× IGBT TO-247 (boost leg), gate-driver ICs (SOIC-8), DC-bus electrolytic capacitors (sleeve, vent score, polarity stripe), film capacitor, freewheel diodes (DO-201, cathode band), bleed resistors (colour bands from value), main PCB with copper-trace texture |
| Magnetics | Line-frequency transformer (E-I laminated core and copper windings on a bobbin), toroidal output inductor (helical copper winding) |
| Control board | Microcontroller (LQFP-64), PWM controller (DIP-16), relay (sugar-cube, coil/contact pins), Hall current sensor (toroid and module), voltage-sensing divider module |
| Cooling | Extruded aluminium heat sink (instanced fins), 80 mm cooling fan (frame, hub, swept blades) |
| Display board | LCD panel (canvas texture showing live readings from the waveform engine), push buttons, status LEDs |

`ModelPart` gains: `factory` (geometry key), `params` (factory parameters), `removalStep` and `dependsOn` (for guided disassembly), and `connectionPoints` (already in the type). The data model stays the single source for positions, explode offsets and assembly membership.

## 5. Code structure

```
src/features/lab3d/
  Lab3DPage.tsx            route entry (lazy); layout: parts tree | canvas | info panel
  scene/
    LabCanvas.tsx          <Canvas> setup, lights, Lightformer environment, ContactShadows, demand frameloop
    InverterAssembly.tsx   maps model parts → <PartMesh>, applies explode/visibility/isolation
    PartMesh.tsx           selection, hover, outline, label, connection markers for one part
    CameraRig.tsx          CameraControls, focus/fit on selection or isolated assembly, reset view
    factories/             one file per part family: to247.ts, electrolytic.ts, transformer.ts, toroid.ts,
                           resistor.ts, ic-packages.ts, heatsink.ts, fan.ts, terminals.ts, pcb.ts, relay.ts, ...
  panels/
    PartsTree.tsx          assemblies → parts, visibility toggles, keyboard navigation
    ComponentInfoPanel.tsx 13-field panel with tabs (Overview · Pins · Testing · Safety)
    Toolbar.tsx            explode slider, reassemble, labels, connections, isolate, mode, reset view
    TaskPanel.tsx          guided tasks: identification quiz, disassembly, reassembly
  store/labStore.ts        selection, hover, explode, hidden set, isolated assembly, mode, removed parts
  logic/
    disassembly.ts         valid-order checks and explanations (pure, tested)
    discharge.ts           DC-bus capacitor discharge V(t) = V₀·e^(−t/RC) for the safety step (pure, tested)
src/content/components/    24 ElectronicComponent entries
src/content/models/        hybrid-3kw.ts
src/ui/symbols/            SVG schematic symbols (IEC style)
```

The progress store gains `identifyComponent(id)` and `completeLesson(id)`.

## 6. Learning interactions that write real progress

- **Identification challenge:** "Click the gate driver." A correct click adds the component to `identifiedComponents` (this drives the dashboard counter and the Component Spotter badge). A wrong click explains what the student actually clicked.
- **Guided disassembly:** remove parts in a safe order. The cover comes first, then isolation of the battery, then a capacitor discharge step (shown as a live V(t) curve through the bleed resistor until it falls below 50 V), then boards and parts. An out-of-order attempt is blocked with an explanation (for example "The heat sink is bolted through the MOSFET tabs; remove the clamp screws first").
- **Reassembly:** rebuild from the parts tray in reverse dependency order, with the same explanations.
- **Lesson completion criteria** for l3d-01 to l3d-06, for example l3d-02 is complete when every power-board part has been inspected and the DC-bus path has been traced. These mark lessons complete in the progress store.

## 7. Layout and responsiveness

- **Desktop:** parts tree (left, 280 px) | canvas (centre, flexible) | info panel (right, 380 px); toolbar over the canvas.
- **Tablet:** canvas full width; tree and info panel open as side drawers.
- **Phone:** canvas fills the screen; the info panel is a bottom sheet with tabs; toolbar condensed to icons with labels in a menu.
- Device pixel ratio capped at 2, shadows reduced on low-power devices (`PerformanceMonitor`).

## 8. Build order

1. Component data (24 entries) and SVG symbol set, with integrity tests.
2. Lazy route, canvas, lights, camera rig, WebGL fallback.
3. Part factories, verified one family at a time in an isolated preview.
4. Model data and assembly; parts tree.
5. Selection, highlight, labels, info panel.
6. Explode/reassemble animation, hide/reveal, isolate, connection points.
7. Guided disassembly/reassembly, discharge step, identification challenge, lesson completion.
8. Responsive layouts, keyboard paths, performance pass.
9. Full regression of Phase 1 and the phase gate.

## 9. Testing and acceptance

**Unit (Vitest)**
- Every model part references an existing component; every catalogued component appears in the model at least once.
- Unique part ids; non-zero explode offsets; the disassembly dependency graph is acyclic and every part is reachable.
- Disassembly and reassembly order rules, with explanations returned for invalid moves.
- Capacitor discharge maths against the closed form (time to fall below 50 V = RC·ln(V₀/50)).
- Resistor colour-band computation from value.

**Browser (Playwright, headless Chromium with SwiftShader WebGL 2, already confirmed to work in this environment)**
- The scene renders a non-blank canvas with no console errors.
- Selecting each part from the tree opens the matching info panel; selecting by canvas click works through an exposed test hook.
- Exploding moves parts (positions read from the store); reassembling restores them.
- Hide, isolate and connection toggles change what is drawn.
- The identification challenge updates the dashboard counter.
- Screenshots at desktop, tablet and 390 px phone widths; no horizontal overflow.
- The dashboard's main bundle does not grow; the 3D code is in its own lazy-loaded file.

**Phase gate:** typecheck, tests, 0 lint warnings, and the build all pass; Phase 1 regression passes.

## 10. Risks

| Risk | Mitigation |
|---|---|
| Low-end school tablets struggle with the full model | Demand rendering, instancing, merged static geometry, adaptive DPR, shadow downgrade |
| Procedural parts look crude | Bevelled edges, lathe profiles, correct proportions from real package drawings (TO-247, SOIC-8, LQFP-64, DO-201), PBR materials with roughness/metalness per material |
| Info content accuracy | Each entry reviewed against manufacturer application notes and textbook definitions; sources noted in the data file |
| WebGL unavailable or context lost | Capability check and fallback view; context-loss handler with a restore button |
