# Laws of Form Dashboard

The project now ships a Vite-powered React + TypeScript dashboard (inside `app/`) that wraps the stochastic Laws of Form simulation in a responsive, shadcn/ui driven interface. The original static playground remains for reference.

## Getting Started

```bash
cd app
npm install            # or pnpm install / yarn install
npm run dev            # launches Vite dev server on http://localhost:5173
```

### Production Build

```bash
npm run build
npm run preview
```

### Tests & Linting

```bash
npm run test           # vitest unit tests for LOF algorithms & simulation engine
npm run lint           # eslint flat config
```

## Project Layout

- `app/src/features/lof` – modularised LOF engine:
  - `operations/` pure TS implementations of cancel/confirm/condense/compensate/measure with injectable randomness.
  - `metrics/` deterministic metric suite (entropy, assembly index, omega, etc.) plus helpers to snapshot/diff metrics.
  - `simulation/` configurable runner with batch/concurrency helpers.
  - `hooks/use-simulation-controller.ts` React hook that orchestrates state, autoplay, and batch execution.
- `app/src/components/ui` – shadcn/ui primitives (button, card, tabs, slider, select, switch, etc.).
- `app/src/components/layout` – application shell & header.
- `app/src/routes/DashboardPage.tsx` – main dashboard composition (canvas placeholder, metric cards, settings panel).

## Current UI

- **Two-column layout** (canvas & metrics on the left, settings drawer on the right) with mobile-friendly stacking.
- **Settings panel** exposes weight sliders for all LOF operations, metric preferences, and export stubs.
- **Simulation controls** (reset, step once, autoplay toggle, batch run) wired to the new TypeScript engine.
- **Metric pulse** card mirrors the live snapshot coming from the simulation controller.

## Notes

- The original vanilla JS files are untouched for historical context. All new work happens in `app/`.
- Canvas rendering and advanced charting remain placeholders; the computation layer and data plumbing are ready for integration.
- Batch simulations currently log their summary to the console; extend `runBatch` results into the UI as needed.*** End Patch