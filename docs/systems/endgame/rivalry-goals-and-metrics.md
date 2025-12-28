# Rivalry Goals + Metrics (Web MVP)

## Purpose
Define how rivalry goals are measured across labels, how "above other CEOs" and "consumed more" are computed, and how Era outcomes summarize results for long-horizon rivalry tracking.

## Rivalry goals
- Win condition: complete 12 CEO Requests before any rival label does (see `docs/systems/endgame/win-loss.md`).
- Competitive posture: stay above other CEOs in the rivalry scoreboard (rank/share/points).
- Market dominance: lead consumption share (sales, streams, airplay, eyeriSocial usage).
- Era accountability: track Era financials, chart points, and awards for rivalry summaries.

## KPI 1: Above other CEOs (rank/share/points)

### Inputs (per label, per scope)
Scope defaults to Era; supports weekly, yearly, and lifetime aggregates.

- `consumptionShare` (see "Consumed more" math below).
- `labelChartPoints` (sum of weighted chart points across tracks/promos/tours).
- `labelAwardPoints` (weighted awards tally).
- `labelNet` (revenue - costs for the scope; negative values are clamped to 0 for index math).

### Chart points math (label)
Reuse the chart points ladder from `docs/systems/acts/act-popularity-leaderboards.md`:

- `chartPoints = chartSize + 1 - rank`
- Scope weights: Regional = 1, National = 2, Global = 3.
- Content weights: Tracks = 1.0, Promotions = 0.4, Tours = 0.4.
- `labelChartPoints = sum(chartPoints * scopeWeight * contentWeight)` across all entries for the scope window.

### Awards points math (label)
Weighted counts for rivalry only (tuning knobs, not awards outcomes):

- `awardPoints = annualWins * 5 + annualNoms * 2 + showWins * 1 + showNoms * 0.5`
- `labelAwardPoints = awardPoints` per scope window.

### Points (rivalry score)
Normalize each KPI against the leader in the same scope, then weight:

- `consumptionIndex = consumptionShare`
- `chartIndex = labelChartPoints / maxChartPoints`
- `awardIndex = labelAwardPoints / maxAwardPoints`
- `netIndex = labelNet / maxNetPositive`
- `rivalryPoints = 100 * (consumptionIndex * 0.35 + chartIndex * 0.25 + awardIndex * 0.20 + netIndex * 0.20)`

Notes:
- Clamp each index to `[0, 1]`.
- If a scope has no data for an index, log a warning and drop that index from the weighted sum (renormalize the weights).

### Rank
- `rivalryRank`: sort labels by `rivalryPoints` descending.
- Tie-break order: `consumptionShare`, `labelChartPoints`, `labelAwardPoints`, `labelNet`, then label name.

### Share
- `rivalryShare = rivalryPoints / sum(rivalryPoints)` for the scope window.
- `aboveOtherCeoPct = (labelCount - rivalryRank) / (labelCount - 1)` for UI shorthand.

## KPI 2: "Consumed more" math (sales/stream/airplay/social share)

### Channels
Use the chart-weighting channel set from `docs/systems/charts/chart-weighting.md`:

- Sales (digital + vinyl units).
- Streaming (eyeriSocial Music streams).
- Airplay (radio + venue spins).
- eyeriSocial usage (track used as background audio).

### Channel shares
Per scope window (week/era/year):

- `channelShare = labelChannelTotal / max(channelTotalAllLabels, 1)`

### Weighted consumption share
Use the same scope weights applied to charts (smoothed when needed):

- `consumptionShare = salesShare * wSales + streamShare * wStream + airplayShare * wAirplay + socialShare * wSocial`
- `consumptionPoints = consumptionShare * 100`

Notes:
- Weights (`wSales`, `wStream`, `wAirplay`, `wSocial`) come from chart weighting for the same scope window.
- If a channel total is missing, use the scope baseline mix and surface a warning badge in the rivalry UI.

## Era outcome summary schema (for rivalry)

Era outcome summaries live alongside existing Era outcome stats and are used for rivalry scoring, dashboards, and exports.

```json
{
  "eraId": "era_2401_07",
  "labelId": "label_player",
  "actId": "act_kyra",
  "startWeek": 62140,
  "endWeek": 62192,
  "revenue": {
    "chart": 0,
    "touring": 0,
    "merch": 0,
    "licensing": 0,
    "other": 0,
    "total": 0
  },
  "costs": {
    "production": 0,
    "promo": 0,
    "touring": 0,
    "distribution": 0,
    "overhead": 0,
    "other": 0,
    "total": 0
  },
  "net": 0,
  "chartPoints": {
    "tracks": { "regional": 0, "national": 0, "global": 0, "total": 0 },
    "promotions": { "regional": 0, "national": 0, "global": 0, "total": 0 },
    "tours": { "regional": 0, "national": 0, "global": 0, "total": 0 },
    "total": 0
  },
  "awards": {
    "annualWins": 0,
    "annualNoms": 0,
    "showWins": 0,
    "showNoms": 0,
    "awardPoints": 0
  }
}
```

Formulas:
- `revenue.total = sum(revenue.*)`; `costs.total = sum(costs.*)`.
- `net = revenue.total - costs.total`.
- `chartPoints.total = tracks.total + promotions.total + tours.total`.
- `awards.awardPoints = annualWins * 5 + annualNoms * 2 + showWins * 1 + showNoms * 0.5`.

## Creator endurance math (touring)

### Inputs
- `ACTIVITY_STAMINA_TOUR_DATE` (stamina spend per tour date).
- `STAMINA_REGEN_PER_HOUR` (idle regen).
- `STAMINA_OVERUSE_LIMIT`, `STAMINA_OVERUSE_STRIKES` (overuse contract).
- Act-level pooled stamina (sum of current stamina for participating creators).
- Touring pacing defaults: max 2 dates per week, min 1 rest day between dates.

### Max consecutive tour dates (Act)
Find the largest `D` (dates in sequence) that satisfies:

```
tourSpend = D * ACTIVITY_STAMINA_TOUR_DATE * memberCount
regenBetween = (D - 1) * STAMINA_REGEN_PER_HOUR * 24 * memberCount
actStaminaPoolStart + regenBetween >= tourSpend
```

Rules:
- Cap `D` by the touring tier max dates.
- If `ACTIVITY_STAMINA_TOUR_DATE <= STAMINA_REGEN_PER_HOUR * 24`, stamina does not bottleneck and the tier cap dominates.
- Planning UI should show `D` and warn when requested dates exceed the computed cap.

### Overuse thresholds
Daily tracking follows `docs/systems/stamina-and-hourly-ticks.md`:

- Each tour date increments `staminaSpentToday` for participating creators.
- If `staminaSpentToday > STAMINA_OVERUSE_LIMIT`, apply one overuse strike for that day.
- When a creator reaches `STAMINA_OVERUSE_STRIKES`, set `departurePending` with reason `"overuse"`.

### Recovery
After a tour date or heavy work:

- `staminaDebt = staminaMax - staminaCurrent`
- `recoveryHours = ceil(staminaDebt / STAMINA_REGEN_PER_HOUR)`
- `recoveryDays = ceil(recoveryHours / 24)`

Recovery guidance:
- If `recoveryDays >= 1`, surface a scheduling warning when another tour date is booked before recovery completes.
- When warnings stack (low stamina + overuse risk), include a reason code in the UI log for observability.

## Related
- `docs/systems/endgame/win-loss.md`
- `docs/systems/endgame/annual-awards.md`
- `docs/systems/charts/chart-weighting.md`
- `docs/systems/acts/act-popularity-leaderboards.md`
- `docs/systems/stamina-and-hourly-ticks.md`
- `docs/systems/touring/tuning-guide.md`
