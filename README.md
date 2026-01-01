# Record Label Simulator (Web)

Record Label Simulator is a browser-based management/simulation game. This repo contains the TypeScript source, static HTML/CSS, and client-side persistence used for the current MVP.

Last updated: 2025-12-31 22:16:44 -04:00

## Quick start

### Prereqs
- Node.js 24 LTS (npm 11)
- pnpm 10.26+ (optional; npm is the repo default)
- Python 3 (static file server for `npm run start`)
- Microsoft Edge (VS Code Run/Debug target; optional otherwise)

### Install
```bash
npm install
```

### Build
```bash
npm run build
```

### Run locally (static server)
```bash
npm run start
```

### Dev (TypeScript watch)
```bash
npm run watch
```

### VS Code Run/Debug (Edge)
- Terminal A: `npm run start`
- Terminal B: `npm run watch`
- Then launch the `RLS: Edge` Run/Debug config to open the game at `http://localhost:5173`.

### React SPA (optional)
```bash
cd ui-react
npm install
npm run build
npm run dev
```
`npm run build` outputs the SPA bundle to `assets/js/ui-react-spa/`, and `/ui-react/` is served from the main static server.
`npm run dev` serves the React SPA preview on `http://localhost:5174`.

### React UI islands dev (optional)
```bash
cd ui-react
npm run dev:islands
```
`npm run dev:islands` serves the React islands preview on `http://localhost:5175`.

## Project scripts

- `npm run build` - compile TypeScript (`tsc -p tsconfig.json`)
- `npm run watch` - compile in watch mode (`tsc -p tsconfig.json --watch`)
- `npm run start` - serve via PowerShell + Python (`python -m http.server 5173`)
- `npm run optimize:portraits` - generate resized creator portraits into `assets/png/portraits/creator-ids-optimized` (build will prefer optimized assets when present)
- `npm run watch:portraits` - watch creator portrait folders and auto-optimize on add/change/remove
- `npm run lint` - lint JS/MJS/CJS files with ESLint (TypeScript checks stay in `tsc`)

## Runtime entrypoints

- `index.html` loads global data from `assets/js/data/*.js` and the app module from `assets/js/dist/main.js`.
- React UI islands (optional) load from `assets/js/ui-react/ui-react.js` + `assets/js/ui-react/ui-react.css`.
- React SPA bundle (optional) loads from `assets/js/ui-react-spa/ui-react-spa.js` + `assets/js/ui-react-spa/ui-react-spa.css` via `/ui-react/`.
- `src/main.ts` calls `initUI()` and registers `service-worker.js`.

## Gameplay defaults (new game)

- Game mode: Modern Mode (2400).
- Difficulty: Medium.
- Time speed: Fast (1h = 1s).
- Auto-save: enabled every 2 minutes.

## Terminology

- Projects are release containers (Albums, EPs, Single albums), not individual tracks.

## Docs

- Acronyms + abbreviations: `docs/glossary/acronyms.md`
- Dev environment: `docs/dev-environment.md`
- Tutorial draft: `docs/tutorial-draft.md`
- Unity to web glossary: `docs/glossary/unity-to-web.md`
- Awards circuit: `docs/systems/awards/award-shows.md`
- Annual awards: `docs/systems/endgame/annual-awards.md`
- Track rollout strategies: `docs/systems/content/track-rollout-strategies.md`
- IndexedDB schema: `docs/systems/data/indexeddb-schema.md`
- Rivalry goals + KPIs: `docs/systems/endgame/rivalry-goals-and-metrics.md`

## Code layout (high level)

- `src/main.ts` - bootstraps UI and service worker registration.
- `src/app/ui.ts` - UI composition, routing, panels, and event handlers.
- `src/app/game.ts` - simulation state, economy, progression, and render orchestration.
- `src/app/game/config.ts` - gameplay tuning constants and scheduling defaults.
- `src/app/game/names.ts` - name pools barrel; region lists live in `src/app/game/names/`.
- `src/app/chartWorker.ts` - chart computation in a Web Worker.
- `src/app/db.ts` — IndexedDB helpers for chart history snapshots.
- `src/app/csv.ts` — CSV loading utilities for `csv/` mirror data.
- `src/app/globals.d.ts` — type declarations for globals from `assets/js/data/*.js`.
- `assets/js/dist/` — compiled JS output from `tsc` (commit contains generated output).

## Persistence

### IndexedDB

- Database: `record-label-simulator`
- Stores: `chart_history`, `chart_week_index`, `file_handles`, `event_log`, `rollout_strategy_templates`, `track_rollout_instances`, `release_production_view`, `kpi_snapshot`
- Indexes:
  - `chart_history`: `by_scope`, `by_week`, `by_ts`, `by_week_scope`, `by_scope_week`
  - `chart_week_index`: `by_ts`
  - `event_log`: `by_occurred_at_hour`, `by_entity`, `by_event_type`
  - `rollout_strategy_templates`: `by_fingerprint`, `by_created_source`, `by_name`
  - `track_rollout_instances`: `by_track_id`, `by_template_id`
  - `release_production_view`: `by_current_step`, `by_overall_risk`, `by_eta_hour`
  - `kpi_snapshot`: `by_entity_kpi`, `by_calculated_at_hour`

Used for chart history snapshots, event logging, and KPI/materialized projections.

### localStorage

Used for save slots, UI state, and preferences:

- save slots keyed by `SLOT_PREFIX` (see `assets/js/data/constants.js`)
- panel + sidebar layout, per-view panel visibility
- UI event log and loss archive
- usage session index + per-session logs (session IDs, action trail, error capture)
- external storage mirror (File System Access API) for logs, saves, and chart history
- selected game mode, difficulty, and start preferences

### sessionStorage

- `rls_active_slot` tracks the active slot for the session.

## Development conventions

- Edit TypeScript under `src/`; run `npm run build` to emit JS into `assets/js/dist/`.
- Service worker registration is disabled on localhost; local runs auto-unregister any existing worker and clear `rls-cache-*`.
- Global constants live in `assets/js/data/*.js` and are referenced via `src/app/globals.d.ts`.
- Manual test checklist is in `TESTING.md`.

## Known tech debt / next steps

- `src/app/game.ts` and `src/app/ui.ts` use `// @ts-nocheck`; migrate core state/interfaces to typed boundaries.
- `ui.ts` and `game.ts` are large, multi-responsibility modules; continue splitting into feature modules beyond the `game/config` + `game/names` extraction.
- Save/version migrations are ad hoc; consider formalized schema migrations alongside `state.meta.version`.
- Service worker cache version (`service-worker.js`) is manual; stale assets are possible without bumps.

## License

TODO
