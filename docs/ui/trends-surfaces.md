# Trend Surfaces

This doc lists every surface that renders trend data and the display rules for the web MVP.

## Canonical data
- All non-community surfaces read from the same weekly `trendRanking` and `trends` lists.
- Trend refresh cadence is defined in `docs/systems/trends/trends-cadence.md`.

## Surfaces
- Header (global top bar): Top 3 trends, rendered beside Top Labels.
- Dashboard stat card: Top 1 trend (from `trendRanking[0]`).
- Create view: Uses the header summary (no separate Top Trends side panel).
- Community (world) view: See `docs/ui/community-trends.md` for the full list rules.
