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
- DEC-20251226-008: Solo act name generation excludes `groups_formations` nouns; the category weight is 0 for solo acts.
- DEC-20251226-009: Act names use semantic adjective+noun IDs with 15x20 pools, nation-weighted category bias, solo/group grammar, and Bytenza UI stacking (Hangul primary, English secondary, RR available for tooltip/debug).

## Economy + analytics
- DEC-20251226-001: Eras view replaces the Tracks panel with an Era Performance panel, showing per-track type, chart points, sales/stream metrics, costs, earnings, and an embedded chart history table for the focused era.
- DEC-20251226-002: Vinyl run recommendations use a demand curve (fan base, quality, trend alignment, project type, act size, promo lead time, and price sensitivity) plus baseline physical pricing to estimate unit cost, recommended units, and gross/cost projections for player planning.
- DEC-20251226-005: Project type track-count constraints follow `game-design-documents/03-Systems/Economy/Pricing/economy-pricing-and-track-limits-by-format.md` (Single 1-4, EP 5-7, Album 8-32) for create/release validation and seeded market projects.
- DEC-20251226-010: Streaming metrics scale up in volume but are down-weighted for chart/value tallies so streams are abundant yet less monetarily impactful than sales.

## Eras + projects
- DEC-20251226-006: Era projects auto-group releases within a 26-week release/promo gap; singles attach to the Era project, albums close at 32 released tracks, Legacy-stage touring opens a 3-track deluxe window, and new releases after closure start a new Era.

## Competitive balance
- DEC-20251226-003: Chart scoring applies label competition pressure from recent chart share to prevent runaway dominance, and modern-era seeds reduce dominant label bias.
- DEC-20251226-005: Chart scoring applies homeland bonuses from Act + Creator origins and uses Gaia nation relationship lore to bias international audience response.

## Cheater mode
- DEC-20251226-004: Cheater mode unlocks economy tuning in the tutorial and disables achievements + tasks while active.

## Game start defaults
- DEC-20251226-007: New games default to Modern Mode (2400), Medium difficulty, Fast speed (1h = 1s), and auto-save enabled every 2 minutes.
