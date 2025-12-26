# Rival Husk Planner (Web MVP)

## Intent
Rival labels plan releases and promos from a shared husk library rather than targeting the player. At least one rival is always in competitive rollout mode each planning cycle.

## Husk Library
- Starter husks: baseline rollout templates for early game or fallback.
- Era husks: generated from completed eras (status `Complete`) regardless of owner.

Starter husks (shared rollout templates):
- Single Drip: 1 release + eyeriSocial post in week 0.
- Pulse Loop: 2 weekly single drops with matching social promo.
- Project Ladder: 3 spaced drops with interview support to build project momentum.
- Video Blitz: 2 drops with music video promo spikes.
- Tour Warmup: early drop, interview, then a live performance follow-up.

Each husk exposes:
- Cadence: a week-pattern of drops/events (release + promo steps with day/hour offsets).
- Eligible categories: expected release types and promo types.
- Context signature: alignment tags, trend/genre tags, and an outcome score (0-100).

## Decision Tree (Weekly)
At weekly checkpoints, each rival label:
1. Builds candidate husks from the shared library.
2. Scores candidates using public world inputs:
   - Trend fit (current trends vs husk tags).
   - Alignment fit (label alignment vs husk tags).
   - Budget fit (wallet cash vs implied promo intensity).
3. Picks the highest score with deterministic tie-breaks (seeded by week + label + husk ID).
4. Falls back to a default starter husk if no candidate is eligible.

## Competitive Rollout Mode (Definition)
A rival is in competitive rollout mode when it:
- Selects a husk and commits to it for the husk's era window.
- Schedules at least one upcoming release drop into the calendar stores.
- Schedules at least one promo/event action when the husk requires it (subject to budget/capacity).

## Participation Rule
- Planning cycle checkpoints: new game seed and weekly planning.
- Ensure at least one rival participates each cycle.
- Deterministic anchor selection (no player targeting):
  - Seeded dominant rival if available, else highest momentum.
  - Tie-break by cash, then label ID/name for stability.
- Other rivals participate only if they pass the budget gate.

## Budget Gate
Rivals are eligible to compete when they can cover:
- A minimum cash buffer above operating costs, and
- At least one drop plus required promo intensity for the next window.
- Operating cost estimates cap leased usage to preserve the planning reserve.
The anchor rival is forced into participation even if it is below the budget gate (promo may be skipped when unaffordable).

## Release Budget + Reserve
- Rival release planning uses a wallet-percent budget with a minimum cash reserve (mirrors auto-create math).
- Each scheduled release spends a fixed drop cost; scheduling stops when the budget cap or reserve is hit.
- Release volume is capped by signed Creator IDs (per-role capacity) before budget is applied.

## Chart Dominance Push
- Competitive rivals (anchor first, then high-ambition labels) queue extra releases to chase chart monopolies.
- Target scope follows their current focus (global/nation/region) and falls back to their home region when unspecified.
- The push size uses chart size minus current label presence, then caps by budget + roster capacity.

## CEO Requests + Ambition
- Rival labels track the same CEO Requests as the player and pursue them as internal record-breaking goals.
- Weekly evaluation updates each rival's unlocked request list and emits a log entry on unlocks.
- Ambition score combines request progress, label share pressure, and a pre-3000 boost.
- Ambition influences:
  - Roster targets (sign more Creator IDs when behind on Roster Builder).
  - Release quality boosts to drive chart performance.
  - Cash stabilization floors to keep all rivals active through year 3000.

## Scheduling Rules
- Uses `state.rivalReleaseQueue` (Calendar projection source).
- Releases always land on Friday 00:00 (next available window).
- Promo events snap to whole-hour timestamps and never schedule in the past (roll forward by weeks if needed).
- Duplicate schedules for the same label + week + event kind are skipped.
- All scheduled timestamps are whole-hour values (no minutes).
- Rival promos can lift full projects when multiple releases share a project name (project-level boosts apply across those tracks).

## Notes
- AI promo budgets use a fixed AI percent, independent of player settings.
- Rival focus themes/moods absorb husk trend tags over time to keep label templates adaptive.
- New AI metadata is optional and safe for existing saves.
