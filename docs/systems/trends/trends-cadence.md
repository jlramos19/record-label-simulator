# Trends Cadence

This doc defines how trends are calculated and refreshed in the web MVP.

## Trend Ledger (MVP)
Consumption activity is recorded from weekly chart scoring. Each chart refresh produces a weekly snapshot used by the trend ledger.

Ledger snapshot fields:
- week: chart week index.
- updatedAt: in-game UTC timestamp of the chart refresh.
- totals: total consumption score per genre (global chart).
- alignmentScores: per-genre alignment totals (for "alignment push" display).
- chartGenres: unique list of genres present in the charted tracks.

## Rolling Window
- Window length: 28 days (4 weekly snapshots).
- Refresh cadence: weekly on Friday 12:00 (see `docs/systems/time/weekly-timing.md`).
- Aggregation: simple sum across the last 4 snapshots.

## Outputs
- trendRanking: global ordered list by total consumption score.
- trends (top list): top 3 genres from trendRanking.
- trendAlignmentScores: aggregated alignment totals for trendRanking.

## Notes
- If there is not enough ledger data, the UI falls back to seeded trends until the first ledger window is available.
- Seeded (2400) starts backfill the trend ledger from kickoff chart scores so Community trends populate immediately.

## Related
- `docs/systems/time/weekly-timing.md`
- `docs/ui/community-trends.md`
