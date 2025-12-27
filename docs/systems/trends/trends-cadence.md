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

Ranking snapshot fields (history):
- week: chart week index.
- updatedAt: in-game UTC timestamp of the refresh.
- ranking: ordered list of genres for the week.
- Retention: last 20 weeks (see `TREND_RANKING_HISTORY_WEEKS`).

## Rolling Window
- Window length: 28 days (4 weekly snapshots).
- Refresh cadence: weekly on Friday 12:00 (see `docs/systems/time/weekly-timing.md`).
- Aggregation: simple sum across the last 4 snapshots.

## Outputs
- trendRanking: global ordered list by total consumption score (after dominance adjustments).
- trends (top list): top 3 genres from trendRanking.
- trendAlignmentScores: aggregated alignment totals for trendRanking.

## Dominance + emerging windows (MVP)
- The top genre gets a random dominance cap between 4-7 weeks.
- While a genre stays on top, its score is decayed (up to a 35% reduction) to prevent runaway dominance.
- When the streak hits its cap, a cultural reset pushes the top genre to the bottom of the ranking and logs an event.
- Reset genres enter an emerging window for 4 weeks once they reappear in the visible trend list.
- Emerging genres apply a chart score debuff (75% penalty) to cool off the surge.

## Notes
- If there is not enough ledger data, the UI falls back to seeded trends until the first ledger window is available.
- Seeded (2400) starts backfill the trend ledger from kickoff chart scores so Community trends populate immediately.
- Trend status labels (Emerging/Peaking/Hot/Rising/Falling/Stable) are derived from the rank history window.

## Related
- `docs/systems/time/weekly-timing.md`
- `docs/ui/community-trends.md`
