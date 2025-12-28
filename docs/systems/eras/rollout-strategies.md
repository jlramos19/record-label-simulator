# Rollout Strategy Plans (Web MVP)

## Intent
Rollout Strategy Plans turn rollout planning into a reusable, auditable schedule. Plans can scope to an Era, a single release, a project release, a tour, or a promo campaign. They live on the Era surface today, expand into calendar entries, and can auto-run when the player enables them.

## Data Model
A Rollout Strategy Plan is attached to an Act + focus target (Era/Release/Project/Tour/Campaign) and saved alongside other state.

Required fields:
- `id`
- `actId`
- `eraId` (nullable for non-era scopes)
- `focusType` (`Era` | `Release` | `Project` | `Tour` | `Campaign`)
- `focusId` (nullable content/tour/campaign ID)
- `focusLabel` (human label for the focus target)
- `weeks` (fixed-length plan slots)
- `status` (`Draft` | `Active` | `Archived`)
- `createdAt` (in-game timestamp)
- `source` (`PlayerPlanned` | `GeneratedAtEraEnd`)

Plan slot structure:
- `weeks[n].drops[]`: release actions referencing content IDs.
- `weeks[n].events[]`: action types (promo/appearance/etc) with optional content IDs (Track ID or Project ID for project promos).

Per-item metadata (additive for scheduling + audits):
- `status` (`Planned` | `Scheduled` | `Completed` | `Blocked`)
- `scheduledAt`, `completedAt`
- `lastAttemptAt`, `lastAttemptReason` (auto-run diagnostics)

Plan context (archived/library entries):
- `context.alignmentTags` (top alignments from releases)
- `context.trendTags` (top genres from releases)
- `context.outcomeScore` (0-100 composite score)
- `context.marketConditions` (trend ranks + top-trends snapshot at release time)
- `context.outcomes` (release count, avg quality, avg peak, avg weeks-on-chart)

## Plan Library
- The player has access to the full Plan Library: starter plans, player-used plans, and rival-used plans.
- Plans list their outcomes and market conditions so the player can see what worked and why (ex: trend rank positions when releases landed).
- Any library plan can seed a new strategy to prefill drop/event slots.

## Planning (Eras Surface)
- Create a plan for an active Era (default focus); length is derived from the Era rollout weeks.
- Set the plan focus to Era/Release/Project/Tour/Campaign to clarify what the plan is driving.
- Add drops/events into weekly slots; content must exist before it can be scheduled (projects must be in an active era).
- Optional: seed a strategy from the Plan Library (starter + player/rival plans) to prefill drop/event slots.
- Select a strategy and expand it to populate Calendar scheduling stores.
- Optional: enable auto-run per strategy.

Date labels:
- Week numbers are displayed as compact date ranges: `YY-MMM-DD to YY-MMM-DD` (UTC, week anchored).

## Budget Estimate (Planner)
- The planner summarizes promo budget needs for the strategy.
- Totals show base cost, inflation-adjusted cost, and the current planned spend.
- Planned spend uses the promo budget inputs (change them to adapt on the fly).

## Plan -> Calendar Expansion
Expansion converts planned items into scheduling stores (Calendar remains read-only):
- Drops create entries in `state.releaseQueue` (same store used by Release Desk).
- Events create entries in `state.scheduledEvents` (new schedule store projected by Calendar).

Scheduling rules:
- Releases snap to Friday 00:00 (whole-hour timestamp).
- Events snap to a fixed weekly window: Tuesday 12:00 UTC + 1h offsets per event index.
- Any scheduled timestamp must be in the future.
- Expansion only schedules; Calendar projections remain read-only.

## Auto-Run (per strategy)
When auto-run is enabled, the system attempts to schedule upcoming items using deterministic gating:
- Content readiness: drops require Ready or Mastering tracks; events referencing content require valid IDs.
- Capacity: event types requiring facilities must have available capacity for that day.
- Calendar validity: timestamps must be in the future and follow release/event cadence.

If any check fails, auto-run pauses for that item and logs the reason (`lastAttemptReason` + event log).

## End-of-Era Plan Snapshot
At Era completion, the system generates a "what happened" plan snapshot:
- Releases and events within the Era window are grouped into weekly slots.
- Saved as a Rollout Strategy with `source = GeneratedAtEraEnd` and `status = Archived`.
- Opt-out flag: `state.meta.keepEraRolloutPlans` (default `true`) skips saving to reduce bloat.
