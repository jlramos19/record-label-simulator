# Trend Surfaces

This doc lists every surface that renders trend data and the display rules for the web MVP.

## Canonical data
- All non-community surfaces read from the same weekly `trendRanking` and `trends` lists.
- Trend refresh cadence is defined in `docs/systems/trends/trends-cadence.md`.

## Surfaces
- Header (global top bar): Top 3 trends, rendered beside Top Labels, with a "More" button opening the Top 40 window.
- Dashboard stat card: Top 1 trend (from `trendRanking[0]`).
- Create view: Uses the header summary (no separate Top Trends side panel).
- Floating ranking window: opened from the header "More" button to show the Top 40 list (see `docs/ui/community-trends.md`).

## Related
- `docs/systems/time/weekly-timing.md`
