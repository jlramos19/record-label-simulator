# Annual Awards (CEO Requests)

Each in-game calendar year, the simulation computes 12 CEO Request awards at Gaia scope. Winners are Acts (not individual tracks), and a label earns the request when any of its Acts wins the category that year.

## Data sources
- Weekly chart results captured at the Saturday 00:00 UTC chart update and stored in the year-end chart ledger (`state.meta.annualAwardLedger`).
- Chart snapshots in IndexedDB remain a backfill source if the ledger is missing.
- Scope weights: Regional = 1, National = 2, Global = 3.

## Cadence + release
- Ledger updates once per weekly chart update (Saturday 00:00 UTC).
- Year-end charts release on the first Saturday of January for the prior calendar year.
- Award winners are stored in `state.meta.annualAwards` and used to unlock CEO Requests.

## Scoring rules
- Chart-topping awards (#1, #4, #7, #10):
  - Each week, each scope grants points to the #1 entry (Regional = 1, National = 2, Global = 3).
  - Totals are summed across the year for the winner.
- Sales/streams/views/attendance awards (#2, #5, #8, #11):
  - Tracks/projects: global yearly total of sales + streaming.
  - Promotions: global yearly total of the primary promo metric (views/likes/comments/concurrent).
  - Tours: global yearly total attendance.
- Critics awards (#3, #6, #9, #12):
  - Critic scores are weighted by scope and summed across the year.
  - Critics scores combine quality, alignment fit, and theme/mood fit, with stringency and saturation penalties.

## Tie-break ladder (no ties)
1. Sales/Streams (global yearly totals).
2. Critics (weighted by scope).
3. Awards (Critics Pick threshold = 90, weighted by scope).
4. First lead week (earliest week leading the primary metric).

If ties still remain after First Lead Week, the simulation falls back to deterministic alphabetical ordering to guarantee a single winner.

## Achievement unlocks
Each CEO Request unlocks when the player label wins that category in any year. Wins accumulate across years toward the 12-request victory condition.
