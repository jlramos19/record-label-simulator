# Copilot / AI Agent Instructions - Record Label Simulator

Purpose: Quick, actionable guidance so an AI coding agent can be immediately productive in this repo.

- Primary instructions: read `AGENTS.md` first.
- Canon docs: `docs/` is the source of truth; decision register is `docs/DECISIONS.md`; contradictions log is `docs/CONTRADICTIONS.md`.
- Project shape: web-first app. Open `index.html` directly or run `npm run start` for a local server.
- Source of truth for code: TypeScript in `src/` compiled to `assets/js/dist/` via `npm run build` or `npm run watch`.
- Entry points: `src/app/game.ts` (simulation and state), `src/app/ui.ts` (UI wiring), and `index.html` (page shell).
- Data and assets: `csv/` and `assets/js/data/` contain bulk game data; keep property names consistent with code expectations.
- Debugging: use in-app inspection where available plus browser console tooling; a dedicated Simulation Inspector UI is postponed.
