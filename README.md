# Record Label Simulator (Web)

Record Label Simulator is a browser-based management/simulation game. This repo contains the TypeScript source, static HTML/CSS, and client-side persistence used for the current MVP.

Last updated: 2025-12-25 23:19:36 -04:00

## Quick start

### Prereqs
- Node.js (current LTS recommended)
- Python 3 (static file server for `npm run start`)
- Microsoft Edge (only required for `npm run dev:logs`)

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

### Dev with logs
```bash
npm run dev:logs
```

## Project scripts

- `npm run build` — compile TypeScript (`tsc -p tsconfig.json`)
- `npm run watch` — compile in watch mode (`tsc -p tsconfig.json --watch`)
- `npm run start` — serve via PowerShell + Python (`python -m http.server 5173`)
- `npm run dev:logs` — run watch + server + Edge (Puppeteer) with NDJSON logs in `usage-logs/`

## Runtime entrypoints

- `index.html` loads global data from `assets/js/data/*.js` and the app module from `assets/js/dist/main.js`.
- `src/main.ts` calls `initUI()` and registers `service-worker.js`.

## Docs

- Acronyms + abbreviations: `docs/glossary/acronyms.md`
- Unity to web glossary: `docs/glossary/unity-to-web.md`

## Code layout (high level)

- `src/main.ts` — bootstraps UI and service worker registration.
- `src/app/ui.ts` — UI composition, routing, panels, and event handlers.
- `src/app/game.ts` — simulation state, economy, progression, and render orchestration.
- `src/app/chartWorker.ts` — chart computation in a Web Worker.
- `src/app/db.ts` — IndexedDB helpers for chart history snapshots.
- `src/app/csv.ts` — CSV loading utilities for `csv/` mirror data.
- `src/app/globals.d.ts` — type declarations for globals from `assets/js/data/*.js`.
- `assets/js/dist/` — compiled JS output from `tsc` (commit contains generated output).

## Persistence

### IndexedDB

- Database: `rls_mvp_db`
- Store: `chart_history`
- Indexes: `by_scope`, `by_week`, `by_ts`

Used for chart history snapshots.

### localStorage

Used for save slots, UI state, and preferences:

- save slots keyed by `SLOT_PREFIX` (see `assets/js/data/constants.js`)
- panel + sidebar layout, per-view panel visibility
- UI event log and loss archive
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
- `ui.ts` and `game.ts` are large, multi-responsibility modules; consider splitting into smaller feature modules.
- Save/version migrations are ad hoc; consider formalized schema migrations alongside `state.meta.version`.
- Service worker cache version (`service-worker.js`) is manual; stale assets are possible without bumps.

## License

TODO
