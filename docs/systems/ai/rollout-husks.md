# Rival Rollout Plan Planner (Web MVP)

## Intent
Rival labels plan releases and promos from a shared rollout plan library rather than targeting the player. All rivals use the same eligibility rules with no forced anchor participant.

## Plan Library
- Starter plans: baseline rollout templates for early game or fallback.
- Era plans: generated from completed eras (status `Complete`) regardless of owner.
- Rival plans: plans that rivals actually executed, recorded with outcomes + market conditions.

Starter plans (shared rollout templates):
- eyeriSocial Post focus (1 drop): 1 release + eyeriSocial post in week 0.
- eyeriSocial Post focus (2 drops): 2 weekly single drops with matching social promo.
- Interview focus (3 drops): 3 spaced drops with interview support to build project momentum.
- Music Video focus (2 drops): 2 drops with music video promo spikes.
- Interview focus (tour lead-in): early drop, interview, then a live performance follow-up.

Each plan exposes:
- Cadence: a week-pattern of drops/events (release + promo steps with day/hour offsets).
- Eligible categories: expected release types and promo types.
- Focus type: Era/Release/Project/Tour/Campaign.
- Context signature: alignment tags, trend/genre tags, outcome score (0-100), and market conditions (trend ranks at release time).

## Decision Tree (Weekly)
At weekly checkpoints, each rival label:
1. Builds candidate plans from the shared library.
2. Scores candidates using public world inputs:
   - Trend fit (current trends vs plan tags).
   - Alignment fit (label alignment vs plan tags).
   - Budget fit (wallet cash + projected net vs implied promo intensity).
   - Action bias (CEO Request focus shifts release/promo/tour weighting).
3. Picks the highest score with deterministic tie-breaks (seeded by week + label + plan ID).
4. Falls back to a default starter plan if no candidate is eligible.

## Competitive Rollout Mode (Definition)
A rival is in competitive rollout mode when it:
- Selects a plan and commits to it for the plan's window.
- Schedules at least one upcoming release drop into the calendar stores.
- Schedules at least one promo/event action when the plan requires it (subject to budget/capacity).

## Participation Rule
- Planning cycle checkpoints: new game seed and weekly planning.
- All rivals evaluate the same budget gate and cadence rules (no anchor label).
- Participation depends on wallet cash and reserves; some cycles may have zero rival rollouts if budgets are tight.

## Budget Gate
Rivals are eligible to compete when they can cover:
- A minimum cash buffer above operating costs, and
- At least one drop plus required promo intensity for the next window.
- Operating cost estimates cap leased usage to preserve the planning reserve.
- Cash reserve gates use a multi-week planning window and project net (last revenue - upkeep) across the plan window.

## Release Budget + Reserve
- Rival release planning uses a wallet-percent budget with a minimum cash reserve (mirrors auto-create math).
- Each scheduled release spends a fixed drop cost; scheduling stops when the budget cap or reserve is hit.
- Release volume is capped by signed Creator IDs (per-role capacity) before budget is applied.

## AutoOps budget envelope
- Create budget: wallet percent with a minimum cash floor.
- Promo budget: wallet percent multiplied by planned promo steps.
- Tour reserve: estimated per-tour cost multiplied by planned tour steps.
- Reserve floor: cash buffer + drop cost + promo reserve + tour reserve before scheduling proceeds.

## Roster Targets + Signing
- Roster targets scale with rollout cadence and stamina capacity (more steps = higher target per role).
- Base roster targets start from mode defaults (Founding: 1/1/1, Modern: 15/10/5) before cadence/ambition/stamina boosts.
- Negative projected net halts new signing until the net turns positive again.

## Chart Dominance Push
- Competitive rivals with high ambition or focus triggers queue extra releases to chase chart monopolies.
- Target scope follows their current focus (global/nation/region) and falls back to their home region when unspecified.
- The push size uses chart size minus current label presence, then caps by budget + roster capacity.

## CEO Requests + Ambition
- Rival labels track the same CEO Requests as the player and pursue them as internal record-breaking goals.
- Weekly evaluation updates each rival's unlocked request list and emits a log entry on unlocks.
- Ambition score combines request progress (wins + focus progress), ahead/behind pressure versus the player/leader, and time-based boosts, with difficulty-scaled pacing.
- Promo focus progress counts scheduled promos in `state.rivalReleaseQueue` in addition to executed promo activity.
- Ambition influences:
  - Roster targets (sign more Creator IDs when behind on Roster Builder).
  - Release quality boosts to drive chart performance.
  - Cash stabilization floors to keep all rivals active through year 3000.
  - Action weights (release/promo/tour bias) when selecting plans.
  - Cadence dampeners (slow leaders, accelerate trailing rivals) during plan scoring and scheduling.
  - Observability logs for focus shifts and ambition changes.

## Scheduling Rules
- Uses `state.rivalReleaseQueue` (Calendar projection source).
- Releases always land on Friday 00:00 (next available window).
- Promo events snap to whole-hour timestamps and never schedule in the past (roll forward by weeks if needed); promos can land before releases while content is still scheduled.
- Duplicate schedules for the same label + week + event kind are skipped.
- All scheduled timestamps are whole-hour values (no minutes).
- Tour steps only schedule when the era is active and in the Promotion stage, rival momentum clears the tour gate, stamina can cover the tour date, and tour budget has room.
- Tour venue selection respects per-day slot availability, act booking conflicts, rest day spacing, travel buffers, and clusters regions when possible to keep legs grouped.
- Rival promos can lift full projects when multiple releases share a project name (project-level boosts apply across those tracks).
- Plan blockers record reasons (budget, capacity, stamina, facility limits) and emit "why" strings for observability.
- AutoOps logs include the chosen plan's scoring rationale plus any skipped steps with reasons.

## Notes
- AI promo budgets use a fixed AI percent, independent of player settings.
- Rival focus themes/moods absorb plan trend tags over time to keep label templates adaptive.
- New plan metadata is optional and safe for existing saves.
