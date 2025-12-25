# Rollout Strategies (Web MVP)

## Intent
Rollout Strategies turn Era planning into a reusable, auditable schedule. They live on the Era surface, expand into calendar entries, and can auto-run when the player enables them.

## Data Model
A Rollout Strategy is attached to an Act + Era and saved alongside other state.

Required fields:
- `id`
- `actId`
- `eraId`
- `weeks` (fixed-length husk)
- `status` (`Draft` | `Active` | `Archived`)
- `createdAt` (in-game timestamp)
- `source` (`PlayerPlanned` | `GeneratedAtEraEnd`)

Week husk structure:
- `weeks[n].drops[]`: release actions referencing content IDs.
- `weeks[n].events[]`: action types (promo/appearance/etc) with optional content IDs.

Per-item metadata (additive for scheduling + audits):
- `status` (`Planned` | `Scheduled` | `Completed` | `Blocked`)
- `scheduledAt`, `completedAt`
- `lastAttemptAt`, `lastAttemptReason` (auto-run diagnostics)

## Planning (Eras Surface)
- Create a strategy for an active Era; length is derived from the Era rollout weeks.
- Add drops/events into weekly slots; content must exist before it can be scheduled.
- Select a strategy and expand it to populate Calendar scheduling stores.
- Optional: enable auto-run per strategy.

## Husk → Calendar Expansion
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

## End-of-Era Husk Generation
At Era completion, the system generates a “what happened” husk:
- Releases and events within the Era window are grouped into weekly slots.
- Saved as a Rollout Strategy with `source = GeneratedAtEraEnd` and `status = Archived`.
- Opt-out flag: `state.meta.keepEraRolloutHusks` (default `true`) skips saving to reduce bloat.
