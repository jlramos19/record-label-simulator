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
- Charts update is explicitly not Friday 00:00.
- Release Desk "Release ASAP" schedules to the next Friday 00:00 (midnight) in-game time; clicking at Friday 00:00 schedules the following week.

## Related
- `docs/systems/trends/trends-cadence.md`
