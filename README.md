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

## Status: Phase 2 complete

- **Phase 1:** application shell with 12 sections, engineering dashboard with a live H-bridge waveform bench, learning pathway, badges, progress persistence with backup/restore.
- **Phase 2:** 3D Inverter Laboratory with two inverter models (LF-3K 3 kW hybrid, SQ-1K 1 kW square-wave):
  - 24 recognisable, procedurally built parts with datasheet pinouts, polarity marks and markings
  - 13-field information panels with a 3D preview and schematic symbol
  - explode, hide/reveal, isolate, labels and connection points
  - guided, sequential disassembly and reassembly with checkpoints
  - RC capacitor-discharge simulation with meter verification
  - identification challenge (advanced level = assessment asm-01)
  - beginner / intermediate / advanced levels; progress, lessons and an activity log update from real activities

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for architecture, data models, simulation strategy and roadmap, and [docs/PHASE-2-REPORT.md](docs/PHASE-2-REPORT.md) for the Phase 2 completion report.

> Educational simulation only. It does not qualify anyone to work on live electrical equipment.
