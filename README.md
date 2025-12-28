# Record Label Simulator (Web)

Record Label Simulator is a browser-based management/simulation game. This repo contains the TypeScript source, static HTML/CSS, and client-side persistence used for the current MVP.

Last updated: 2025-12-28 03:10:45 -04:00

## Quick start

### Prereqs
- Node.js (current LTS recommended)
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

### React UI islands (optional)
```bash
cd ui-react
npm install
npm run build
npm run dev
```
`npm run dev` serves the React islands preview on `http://localhost:5174`.

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
- Unity to web glossary: `docs/glossary/unity-to-web.md`
- Awards circuit: `docs/systems/awards/award-shows.md`
- Annual awards: `docs/systems/endgame/annual-awards.md`

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

- Database: `rls_mvp_db`
- Stores: `chart_history`, `file_handles`
- Indexes: `by_scope`, `by_week`, `by_ts`

Used for chart history snapshots.

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

