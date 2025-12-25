# Record Label Simulator - Web Build Notes

## Tooling
- Web app built with HTML, CSS, and TypeScript.
- Static hosting (local `python -m http.server` or equivalent).
- Data stored locally (localStorage/IndexedDB) with JSON export/import.

## Time System
- In-game time runs in deterministic ticks and supports pause/fast/skip controls.
- Time displays down to the hour for players; finer-grain timing is internal.
- Events trigger on cadence (weekly charts, yearly population refresh).

## Patch Notes (2025-12-24)
- Charts view now shows a week-range selector with a chart history modal and snapshot export support.
- Global chart stays locked until 100 entries exist; regional/national charts show N/A for empty ranks.
- Label rankings moved into a right-side panel in the Charts view.
- Panel mini state collapses into the dock with no layout footprint; hidden panels stay recoverable.
- Time control highlighting now matches the active speed state.
- Auto-rollout toggle added (hook/state only; rules pending).
- Seeding split enforced (2025-2200 deterministic baseline, 2200-2400 seeded) with hidden dominant rival bias.
- Population updates moved to yearly cadence.
- Create Content uses stage buttons (Sheet/Demo/Master) and studio slot columns (5 slots per column; 3/2/1 columns for Songwriters/Performers/Producers).
