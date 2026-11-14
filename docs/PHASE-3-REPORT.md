# Phase 3 Completion Report: Searchable Engineering Component Library

**Status:** complete. TypeScript, 111 unit tests, lint (0 warnings) and the production build pass. The browser walkthrough of the library, plus full Phase 1 and Phase 2 regression, passes (evidence in §4).

## 1. Requirements and how they are met

| # | Requirement | Delivered |
|---|---|---|
| 1 | Searchable catalogue | `/components`: ranked full-text search over name, function, applications, pins, summary, principle, faults and replacement notes; every word must match; result shows where it matched. |
| 2 | Category filters | Nine category chips plus an "appears in 3D model" filter; filter state is kept in the URL (bookmarkable). |
| 3 | Comparison tool | `/components/compare`: side-by-side comparison of any two entries; curated guides when a pair is covered. |
| 4 | Detailed technical pages | `/components/:id`, one page per component, with an in-page section index and previous/next navigation. |
| 5 | Symbols and pinout diagrams | IEC symbol, plus a pinout diagram derived from the component's 3D geometry (TO-247 front view, SOIC-8/DIP-16 top view with pin 1, electrolytic with − stripe, axial band/colour code, terminal map otherwise) and the pin table. |
| 6 | Ratings and specifications | Specification table where every row carries a provenance label (Typical / Model value / Part type), with a "not manufacturer ratings" notice. |
| 7 | Operating principles | Operating principle, input/output behaviour, and explanations at three levels. |
| 8 | Typical inverter applications | Applications, plus where the part sits in each 3D model. |
| 9 | Testing with virtual instruments | 25 structured procedures (24 components and the enclosure) using nine instrument types. Each opens with safety preconditions; each step gives the instrument, setting and connection, and a virtual instrument face whose reading changes with the selected component condition (good, shorted, open and so on). |
| 10 | Common faults and symptoms | Failure-symptom list per component; fault readings in every test step. |
| 11 | Replacement and compatibility | Replacement notes, with a reminder to match the original part's datasheet, not typical values. |
| 12 | Related recommendations | Related components with summaries and a link to the matching guide or side-by-side view. |

**Additional requirements**

| Requirement | Delivered |
|---|---|
| Comparison pairs | Eight guides: MOSFET vs IGBT; electrolytic vs film vs ceramic; transformer vs inductor; relay vs semiconductor switch; fuse vs circuit breaker; PWM controller vs microcontroller; voltage vs current sensing; heat sink vs fan. Each has an understanding check that records progress. |
| Every entry connected to its 3D part | Every component appears in at least one model (tested); each entry lists every matching part in both models. |
| Navigate to the location in 3D | "Show in the 3D laboratory" opens `/lab-3d?model=…&part=…`: the lab switches model, selects the part and frames it. The 3D panel links back to the entry. |
| Beginner / intermediate / advanced | Explanation tabs open at the learner's level; the level selector is shared with the 3D lab. |
| Typical vs manufacturer-specific | `ComponentSpec.kind`: `typical`, `model` or `part-type` (only for industry-standard multi-source part types SG3525 and 1N5408, to be confirmed on the maker's datasheet). Tests enforce the labels. |
| No invented ratings or manufacturer claims | All 25 specification tables were rewritten as typical ranges or model values. Brand-specific markings were removed from the 3D models (see §2). A test fails if a brand-specific marking returns. |
| Safety in testing procedures | Every procedure starts with isolation or is explicitly a qualified live measurement. Every procedure on DC-bus parts requires verified discharge. Shared, consistent safety wording. Enforced by tests. |
| Visual consistency | Same design system, panels, tags, typography and level selector as Phases 1 and 2. |
| Single source, no duplicated database | The library and the 3D lab render the same records. The previous free-text `testingMethod` field was converted into the structured procedures and removed. |

## 2. Corrections to earlier work (with explanation)

Phase 2 used real manufacturer part numbers as markings on generic 3D parts (IRFP4468, 40N65H5, UCC27211, STM32F334). Some specification rows quoted datasheet figures for those exact parts from memory. Under the Phase 3 rules these could be read as claiming the generic models are those products, with unverified ratings. Changes:

- Markings are now generic (N-MOS 100V, IGBT 650V, HB DRIVER, MCU 32-BIT). SG3525 and 1N5408 remain because they are industry-standard part types made by several manufacturers.
- Specification rows are typical ranges, model design values, or labelled part-type characteristics.
- The gate-driver pinout is described as a representative 8-pin arrangement (pinouts differ between families). MCU pins are shown as functional groups.
- The "Practical Distinction" badge no longer says it unlocks in Phase 10; it has been earnable through asm-01 since Phase 2.

No Phase 1 or Phase 2 behaviour was removed. The 3D information panel now shows the structured test procedure and provenance-labelled specifications, and links to the library.

## 3. Progress integration

- Opening a library entry counts as studying the component (shared with the 3D lab).
- Lessons cmp-01 to cmp-05 complete from real criteria. cmp-05 needs the MOSFET vs IGBT and transformer vs inductor checks.
- A global lesson sync runs on every page; new badge "Reference Reader" (study all 24).
- The Component Library module is marked live.

## 4. Verification evidence

| Check | Result |
|---|---|
| TypeScript | Pass |
| Unit tests | **111 pass**: 74 earlier, plus test-procedure safety and completeness for all 25 entries, provenance labelling, brand-marking guard, search ranking and filters, comparison integrity, component-to-3D coverage |
| Lint | 0 warnings |
| Build | Main bundle 103.5 kB gzip (+1.4 kB versus Phase 2); library pages lazy (2.6–4.3 kB gzip each, plus a shared 31 kB gzip component chunk); 3D chunk 310 kB gzip |
| Catalogue | 24 cards. "bootstrap" ranks the gate driver first; "ripple" finds capacitors and the inductor; the Cooling filter shows the heat sink and fan; the SQ-1K filter shows 13 components |
| Detail page | All sections present; TO-247 pinout; provenance tags; virtual DMM reads 0.52 V for "Good" and 0.00 V for "Shorted D-S"; safety box first; level tabs switch |
| 3D links | Library → LF-3K Q1 selected and framed; library → SQ-1K U1 switches model and selects; 3D panel → library entry |
| Comparisons | MOSFET vs IGBT and transformer vs inductor checks recorded 2/2; side-by-side relay/MOSFET shows the curated-guide link |
| Lessons and persistence | After reload: cmp-01 and cmp-05 complete, control lesson 1/5 (one entry studied) |
| Phone (390 px) | No horizontal overflow on catalogue, detail and guide pages |
| Phase 2 regression | Full guided disassembly (4/4 checkpoints, 42 parts), reassembly, asm-01 19/20 by 3D clicks, hit rate 36/41, 0 idle frames, tablet/phone/keyboard/SQ-1K/no-WebGL all as before |
| Phase 1 regression | All routes, dashboard readouts unchanged (48.3 / 31.1 / 52.4 % THD), backup, restore and reset, malformed-backup and corrupted-storage recovery, phone drawer, LAN access |

**Defects found and fixed during testing**

1. **Library bundle growth:** the library inflated the dashboard bundle to 155 kB gzip. Library pages are now code-split, bringing it back to 103.5 kB.
2. **Stale filters:** quick successive filter changes could build on stale URL parameters, because React Router's functional updater reads render-time values. The page now reads the live URL.
3. **Search ranking:** "bootstrap" ranked the diode above the gate driver. Fixed with a higher pin-field weight and a score for matches across several fields.

## 5. Not included, and limitations

- Test-procedure readings are representative teaching values. Interactive instruments wired to the simulation are Phase 8.
- Specification values are deliberately not manufacturer ratings; there is no datasheet database.
- "Studied" records that an entry was opened, not how thoroughly it was read.
