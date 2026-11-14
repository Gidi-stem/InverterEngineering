# Inverter Engineering Lab

An interactive 3D engineering and repair simulator for learning how electrical inverters are designed, built, tested and repaired.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # TypeScript project check
npm test           # engine, store and selector unit tests
npm run lint       # oxlint
npm run build      # production build in dist/ (relative paths, so it runs from any folder)
npm run preview    # serve the production build
```

## Status: Phase 1 complete

- App shell with all 12 sections in the navigation, responsive sidebar and mobile drawer
- Engineering dashboard: a live H-bridge waveform bench (square, modified sine, SPWM, pure sine, rectified) with a scope trace, RMS/peak/THD readouts and a harmonic spectrum. All values come from a unit-tested waveform engine.
- Learning pathway (foundation → advanced), stat tiles, simulation history and badges, all derived from stored progress
- Student Progress page: summary, per-module completion, history, backup (copy or download), restore from file and reset
- Progress is saved in IndexedDB and survives reloads
- Every planned section has a page with its final syllabus, objectives, prerequisites and safety notes

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the architecture, data models, simulation strategy and roadmap, and [docs/PHASE-2-PLAN.md](docs/PHASE-2-PLAN.md) for the 3D dissection laboratory plan.

> Educational simulation only. It does not qualify anyone to work on live electrical equipment.
