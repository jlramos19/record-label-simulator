# Act Popularity Leaderboards (Yearly)

## Purpose
Expose a yearly Act popularity leaderboard so Acts remain the primary driver for Eras and CEO Requests.

## Cadence
- Accumulates once per weekly chart update (Saturday 00:00 UTC).
- Resets each calendar year, while prior years remain stored for history.

## Scoring (weekly)
Act popularity points are derived from the active charts each week.

1) Chart points per entry:
- chartPoints = (chartSize + 1 - rank)

2) Weight by content type + scope:

Tracks:
- Global 1.0
- National 0.55
- Regional 0.35

Promotions:
- Global 0.4
- National 0.3
- Regional 0.2

Tours:
- Global 0.4
- National 0.3
- Regional 0.2

3) Weekly Act points:
- actWeeklyPoints = sum(chartPoints * weight) across all chart entries for the Act
- Tracks, promos, and tours are summed separately and then rolled into the yearly total.

## Storage
- `state.meta.actPopularity.years[year].acts[actKey]`
- `actKey` uses `actId` when available, otherwise `actName::label` to avoid collisions.
- Each Act entry stores:
  - `points`, `trackPoints`, `promoPoints`, `tourPoints`
  - `weeksActive`, `lastWeek`
  - `actId`, `actName`, `label`, `isPlayer`

## UI surface
- Charts view includes an "Acts" tab.
- The tab shows the current year YTD leaderboard with totals and splits.

## Award boosts
- Award show wins and nominations apply temporary popularity boosts after weekly chart points are tallied.
- Boosts expire on their award timer and do not stack beyond one active award boost.

## Observability
- Empty leaderboard message appears until the first weekly chart update runs.

## References
- `src/app/game.ts` (updateActPopularityLedger, getActPopularityLeaderboard)
- `docs/ui/charts-view.md`
- `docs/systems/awards/award-shows.md`
