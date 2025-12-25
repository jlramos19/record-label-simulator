# Stamina and Hourly Ticks

This document defines how stamina depletion, recharge, and overuse are processed on the hourly tick in the MVP.

## A) Hourly tick contract

- The hourly tick is the only place where stamina changes (regen + depletion).
- Each in-game hour triggers exactly one `applyHourlyResourceTick` call.
- Idle recharge rule: creators who are not in an active work order gain +50 stamina per full in-game hour (clamped to `STAMINA_MAX`).
- Depletion visibility rule: stamina spent on multi-hour work is applied per hour (not only in a lump at start or completion). The hourly slices must sum to the stage stamina cost.

## B) Daily usage + overuse strike contract

- Each creator tracks `staminaSpentToday` (reset at 12AM UTC).
- If `staminaSpentToday` exceeds `STAMINA_OVERUSE_LIMIT` at any point in a day:
  - The creator gains at most 1 overuse strike for that day.
  - An audit entry is recorded with: creator id, role, stage/work id, timestamp, and the amount that crossed the limit.
- `overuseFlaggedDayKey` (stored as `lastOveruseDay`) prevents multiple strikes in the same day.

## C) Departure contract (observability + rules)

- "Departure state" means `departurePending` is set on the creator with reason `"overuse"` (not an immediate removal).
- Departure is evaluated when an overuse strike is applied.
- The creator is actually removed when `processCreatorDepartures` runs and the creator is not busy.
- Tuning knobs:
  - `STAMINA_OVERUSE_LIMIT`
  - `STAMINA_OVERUSE_STRIKES`
  - `lastOveruseDay` (one strike per day guard)

## D) Debugging method (repeatable)

1) Add per-hour audit logs (regen totals, spend totals, overuse strike events).
2) Reproduce in a controlled scenario (single producer, queue multiple masters).
3) Verify per-hour deltas and daily counters reset at 12AM.
4) Only then adjust recommendation/auto-assign logic to avoid overuse.
