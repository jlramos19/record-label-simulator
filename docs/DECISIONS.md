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
- DEC-20251225-007: Creator name pools live in `src/app/game/names.ts`, sourced from `game-design-documents/03-Systems/record-label-simulator-alphabet-and-vocabulary.md`, ASCII-normalized, and mapped to Annglora/Bytenza/Crowlya regional lore.
- DEC-20251225-008: Creator name pools are language-specific (Annglora = English, Bytenza = Korean, Crowlya = Spanish), with Bytenza surnames constrained to single Hangul syllable blocks and given names weighted toward 2/3/4 syllable blocks (85%/12.5%/2.5%); this supersedes the earlier vocabulary-source constraint for creator pools.

## Economy + analytics
- DEC-20251226-001: Eras view replaces the Tracks panel with an Era Performance panel, showing per-track type, chart points, sales/stream metrics, costs, earnings, and an embedded chart history table for the focused era.
- DEC-20251226-002: Vinyl run recommendations use a demand curve (fan base, quality, trend alignment, project type, act size, promo lead time, and price sensitivity) plus baseline physical pricing to estimate unit cost, recommended units, and gross/cost projections for player planning.

## Competitive balance
- DEC-20251226-003: Chart scoring applies label competition pressure from recent chart share to prevent runaway dominance, and modern-era seeds reduce dominant label bias.
- DEC-20251226-005: Chart scoring applies homeland bonuses from Act + Creator origins and uses Gaia nation relationship lore to bias international audience response.

## Cheater mode
- DEC-20251226-004: Cheater mode unlocks economy tuning in the tutorial and disables achievements + quests while active.
