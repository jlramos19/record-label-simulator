# Web Module Types and Data Assets

## Purpose
Define how gameplay logic and data are organized in the web app. This replaces engine-specific object/component guidance with TypeScript modules and JSON/CSV assets.

## Module Types
- State modules: hold structured game state (acts, creators, tracks, economy, time).
- Systems/modules: pure functions that update state (charts update, time tick, population refresh).
- UI adapters: render state into DOM and handle user input.
- Services: persistence, export/import, CSV ingestion, and logging.

## Data Assets
- JSON: static data (themes, moods, modifiers, templates).
- CSV: tunable tables for balance (pricing, cadence, scaling).
- IDs: generated in-state with deterministic seeds; never tied to engine objects.

## Update Flow
1) User action or timer triggers a system.
2) System mutates state via predictable, bounded rules.
3) UI adapter re-renders the affected view.
4) Event log records the action and outcome.
