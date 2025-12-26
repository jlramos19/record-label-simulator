# Default Loop Balance (Web MVP)

## Purpose
Provide a quick, in-world balance check using the live MVP formulas and default tuning values (not real-world economics).

## Default inputs (MVP)
- Difficulty: Medium (revenue mult 1.12, upkeep mult 0.92).
- Revenue: `revenuePerChartPoint = 22` => 22 * 1.12 = 24.64 per chart score point.
- Upkeep: `upkeepPerCreator = 150` per week, `upkeepPerOwnedStudio = 600` per week.
- Stage base costs: Sheet 50, Demo 500, Master 2500.
- Stage multipliers: crew +10% per extra creator; skill multiplier range 0.85 to 1.45.
- Promo budget: `promoWeekBudgetStep = 1200`, `promoWeekBase = 1`, `promoWeeksMin = 1`, `promoWeeksMax = 4`.
- Promo costs (per promo type): eyeriSocial post 600, interview 1200, live performance 3000, music video 7500, prime showcase 15000.
- Physical fees: `physicalReleaseFee = 500`, `physicalSingle = 4.99`, `physicalUnitCostRatio = 0.35`, `physicalUnitCostMin = 0.5`.

## Baseline assumptions
- Average creator skill = 70 (default generator range is 55 to 92).
- Crew size per stage = 1.
- Track score baseline = 84 (quality ~70 plus theme/mood alignment, light bonuses).
- Chart decay = 5% per week, floored at 40%.

## Example: production cost per track
Skill multiplier at 70:
- 0.85 + 0.70 * (1.45 - 0.85) = 1.27

Stage costs (crew size 1, no modifier cost delta):
- Sheet: 50 * 1.27 = 64
- Demo: 500 * 1.27 = 635
- Master: 2500 * 1.27 = 3175
- Total: 3874 per track

Crew size 2 example (crew multiplier 1.1): total ~4260.
Crew size 3 example (crew multiplier 1.2): total ~4648.

## Example: chart revenue per track
Weekly revenue formula:
- weeklyRevenue = chartScore * 24.64

At chartScore 84 (Week 1):
- 84 * 24.64 = 2069.76

12-week decay sum is 8.7, so total revenue is:
- 84 * 24.64 * 8.7 = 18007 (approx)

At chartScore 100:
- 100 * 24.64 * 8.7 = 21437 (approx)
- 20-week total at the floor: 29322 (approx)

## Upkeep break-even snapshot
Starting upkeep (3 creators + 2 studios):
- 3 * 150 + 2 * 600 = 1650 per week

Break-even chart score:
- 1650 / 24.64 = 67 (approx)

If average chart score falls below ~67, a single active track no longer covers baseline upkeep.

## Promo ROI signal (cash-only)
Promo weeks add +10 score while active. Act promo adds up to +6 (2 per week, cap 6).
Example boost: +14 score for 2 weeks.
- Weekly gain: 14 * 24.64 = 345
- 2-week gain: 690

Cost example:
- Budget 1200 per promo type => cash ROI is negative unless the promo materially improves rank or enables achievements/era wins.

## Physical release ROI signal
Physical fee adds 500 up front.
Unit cost ratio is 0.35 of unit price (floor 0.5).
Low-fan Acts will hit budget caps quickly; physical releases are best reserved for higher quality and trend-aligned releases.

## Balance flags to watch
- Revenue tied to chart score can make low-score weeks feel punishing if upkeep is high.
- Promo costs are intentionally steep vs immediate revenue; they are rank and achievement plays, not cash plays.
- Signing cost (approx 3500 to 4400 at skill 70) is 1 to 2 weeks of mid-chart revenue; roster growth needs parallel release pacing.

## Tuning knobs
- `revenuePerChartPoint`
- `upkeepPerCreator`, `upkeepPerOwnedStudio`
- Stage base costs and skill multiplier bands
- Promo budget step + max weeks
- Physical unit cost ratio + release fee

## References
- `src/app/game.ts` (getStageCost, updateEconomy, promoWeeksFromBudget)
- `assets/js/data/constants.js` (ECONOMY_BASELINES, ECONOMY_TUNING)
