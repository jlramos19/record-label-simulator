# Copilot / AI Agent Instructions — Record Label Simulator

Purpose: Quick, actionable guidance so an AI coding agent can be immediately productive in this repo.

- Project shape: this repo contains a web MVP (open `index.html`) implemented in plain ES6 scripts under `assets/js/app/` (not a bundler project), and a large set of Unity design documents under `Game Development Documents/` that define the intended Unity/ECS implementation.

- Entry points to read first:
  - [index.html](index.html) — single-page MVP UI and controls.
  - [assets/js/app/core.js](assets/js/app/core.js) — canonical global `state` shape, game loop, simulation helpers and persistence.
  - [assets/js/app/ui.js](assets/js/app/ui.js) — DOM wiring and UI actions (use this file as the example pattern for adding new UI handlers).
  - [Game Development Documents/RLS_Custom_Instructions_Assistant_and_Unity.md](Game Development Documents/RLS_Custom_Instructions_Assistant_and_Unity.md) — project-specific assistant rules (follow these CIs when producing multi-step support for Unity work).

- Key technical patterns (follow these precisely):
  - Single global `state` object in `core.js`. Mutate `state` with pure helper functions, then call the existing render/save helpers: `renderAll()` and `saveToActiveSlot()`.
  - ID generation: use `uid(prefix)` from `core.js` to create unique IDs.
  - UI handlers live in `ui.js`. New UI actions should validate input, update `state`, call `render...()` and persist with `saveToActiveSlot()` (see `createActFromUI()` and `startTrackFromUI()` for concrete examples).
  - Naming: camelCase for functions and variables, constants are ALL_CAPS (see `ACHIEVEMENTS`, `WEEK_HOURS`).
  - Persistence: session slots use `sessionStorage` and JSON blobs; see `getSlotData()` / `saveToActiveSlot()` usages in `core.js`.

- Data and assets:
  - Bulk game data is in `csv/` (many CSV sets) and `assets/js/data/` (JS data modules). Update or regenerate data consistently — the JS code expects specific property names (e.g., `creators`, `tracks`, `charts`). Inspect `core.js` to see expected keys.

- Unity / long-term engine guidance (from docs):
  - The intended Unity implementation uses ECS + ScriptableObjects, scheduled events, Odin Serializer for save data, and a `TopodaCharts` namespace pattern. See `Game Development Documents/Record Label Simulator – ECS Foundations and Performance Architecture.md` and the RLS CI file for specifics.
  - When working on engine-level systems, prefer data-driven components (ScriptableObjects) and single-responsibility systems that subscribe to scheduled events (the docs expect predictable update cycles and serialization-friendly state).

- Debugging & testing notes (project-specific):
  - For time/simulation tests, the design logs more precise time (hh:mm:ss) to the Unity console while the UI shows hour-level precision — follow the documented format for reproducing bugs (see `Module Calendar` and Unity docs).
  - For web MVP debugging, open `index.html` directly in the browser. No build step required for quick changes; edit `assets/js/app/*.js` and reload.

- Pull request / change guidelines for AI agents:
  - Small, focused diffs that preserve existing function names and hooks. Example: to add a new button, add handler to `ui.js`, implement helper in `core.js` (maintain single responsibility), call `renderAll()` and `saveToActiveSlot()` and add a short unit-like smoke test (manual reload + UI flow).
  - When modifying data shapes, update both the CSV/JS data source and any places that serialize/deserialize (search for `state.meta.version` and bump if required).

- Where to look for more context:
  - `Game Development Documents/Record Label Simulator (RLS) GDD- Data Architecture and Simulation Flow.md` — simulation backbone and data flows.
  - `Game Development Documents/RLS_Custom_Instructions_Assistant_and_Unity.md` — assistant rules to respect when performing multi-step changes tied to Unity work.

If any of the above is unclear or you want the instructions tailored to a specific task (UI change, add a new simulation rule, or start Unity integration), tell me which task and I'll extend this file with concrete checklist steps and example diffs.
