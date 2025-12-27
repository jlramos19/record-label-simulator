# Community Trends (Header Window)

The header Top Trends list is the canonical entry point for global trend rankings.

## Display rules
- Scope: Global only.
- Header shows the Top 3 trends as a preview.
- "More" opens a draggable, scrollable floating window with the Top 40 list.
- Update timing: Friday 12:00 (trend refresh time).
- The full list shows trend points, alignment push, and a status pill per genre.

## Status labels (MVP)
- EMERGING: genre is inside the emerging window (overrides other statuses).
- PEAKING: top-5 streak (shows `WK n` once the streak is 2+ weeks).
- HOT: week-over-week rank jump greater than 10.
- RISING: week-over-week rank jump greater than 5.
- FALLING: rank drop of 10+ over the last two snapshots.
- STABLE: rank variance within 5 over the last 2-3 snapshots (fallback state).

## Filtering rules
Trends must satisfy both:
- Consumption > 0 in the rolling 28-day window.
- Chart presence in the last 4 chart weeks (appears at least once in global chart entries).

## Notes
- This view reflects the same weekly trend ledger defined in `docs/systems/trends/trends-cadence.md`.
- The world view no longer includes a Top Trends panel.

## Related
- `docs/systems/time/weekly-timing.md`
- `docs/ui/trends-surfaces.md`
