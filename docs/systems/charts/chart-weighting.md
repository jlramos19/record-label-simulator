# Chart Weighting

Defines how chart score weights map to regional consumption mixes and population blending across scopes.

## Channels
- Sales (digital + vinyl).
- Streaming (eyeriSocial Music streams).
- Airplay (radio, clubs, public venues).
- eyeriSocial usage (track used as background audio).

## Weight sources
- Regional weights are defined in `assets/js/data/constants.js` (`REGION_CONSUMPTION_WEIGHTS`).
- Missing or partial region entries fall back to the baseline `CHART_WEIGHTS`.
- All weights are normalized so the channel mix sums to 100%.

## Scope handling
- Regional weights: use the region's consumption mix directly.
- National weights: blend capital + elsewhere mixes via `REGION_CAPITAL_SHARE`.
- Global weights: blend national mixes using current population snapshot shares.
- Population shifts influence the global mix through nation population shares.

## Consistency and audit
- Weights always sum to 100% and use the same channel set across scopes.
- Consumption volume multipliers affect metric display, not the weight ratios used for ranking.

## Observability
- Charts view surfaces the active weight mix in the chart metadata line.
