# Decision Register

This register is the canonical list of governance decisions for Record Label Simulator.
Decision IDs follow the format `DEC-YYYYMMDD-###`.

## Governance
- DEC-20251225-001: Canon rules live in GitHub `docs/`; Google Drive mirrors GitHub and is not canon; conflicts are resolved case-by-case with GitHub as the tie-breaker.

## Retcon policy
- DEC-20251225-002: Unity-era content is retconned into web equivalents; concepts stay intact while Unity-specific wording and tooling are rewritten.

## Debug and inspection policy
- DEC-20251225-003: Debugging uses a minimum in-app inspection concept plus deeper browser console tooling; a dedicated Simulation Inspector UI is postponed (nice-to-have).

## Closure workflow
- DEC-20251225-004: Closure workflow is TODO -> Docs -> Code -> Patch Notes.

## Release policy
- DEC-20251225-005: Release patch IDs use the timestamped format `RLS-PATCH-YYYYMMDD-HHMMZ` (UTC) and live in `assets/js/data/release.js`; patch notes must include the patch ID, and the service worker cache version must match the release stamp.

## Architecture
- DEC-20251225-006: UI render/DOM helpers live under `src/app/ui/`, and game logic triggers UI updates through `uiHooks` instead of calling renderers directly.

## Naming data
- DEC-20251225-007: Creator name pools live in `src/app/game/names.ts`, sourced from `game-development-documents/03-Systems/topoda-charts-alphabet-and-vocabulary.md`, ASCII-normalized, and mapped to Annglora/Bytenza/Crowlya regional lore.
