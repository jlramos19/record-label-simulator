# Weekly Timing

This spec defines the canonical weekly cadence for release processing, trends, and charts in the web MVP.

## Schedule (UTC)
- Release processing: Friday 00:00 (midnight).
- Trends update: Friday 12:00 (noon).
- Charts update: Saturday 00:00 (midnight).

## Weekly Timeline (UTC)
```
Thu 23:00  Fri 00:00           Fri 12:00           Sat 00:00
|----------|-------------------|-------------------|
           Release processing   Trends refresh      Charts refresh
```

## Definitions
- Release processing: The weekly release-day pass that processes scheduled releases queued for drop.
- Trends update: Weekly recompute of the global trend ranking from the rolling 28-day ledger.
- Charts update: Weekly chart scoring + chart history persistence.

## Ordering constraints
- Release processing happens before trends update in the same week.
- Trends update happens before charts update in the same week.

## Notes
- Times are evaluated against in-game UTC time.
- Schedule checks include a minute gate (minute 0) so weekly events fire once at the top of the hour even with quarter-hour ticks.
- Charts update is explicitly not Friday 00:00.
- Release Desk "Release ASAP" schedules to the next Friday 00:00 (midnight) in-game time; clicking at Friday 00:00 schedules the following week.
- Release Desk scheduling (+7d/+14d) snaps queued releases to the Friday 00:00 release window so calendar dates match release day.
- Distribution lead times apply before the Friday release window (Digital 1 week; Physical/Both 2 weeks; Digital rush = 0). Scheduling auto-delays to the next eligible Friday window with a warning.
- Week boundaries (Week X ranges and calendar weeks) anchor to Sunday 00:00 UTC.

## Related
- `docs/systems/trends/trends-cadence.md`
- `docs/systems/content/distribution-pipeline.md`
