# Chart Weighting

Defines how chart score weights adapt to audience consumption mix.

## Channels
- Sales (digital + vinyl).
- Streaming (eyeriSocial Music streams).
- Airplay (radio, clubs, public venues).
- eyeriSocial usage (track used as background audio).

## Dynamic weights
- At each weekly chart refresh, compute per-scope consumption totals from audience chunk activity.
- Weight per channel = channelTotal / totalConsumption for the scope.
- Apply smoothing (default: rolling 4-week average) and clamp to avoid extreme swings.
- If consumption data is missing or below a sample threshold, fall back to the baseline mix for that scope.

## Scope handling
- Regional weights: computed from regional audience chunk consumption.
- National weights: computed from aggregated regional totals (capital + elsewhere).
- Global weights: computed from aggregated national totals.
- Population shifts naturally influence weights via consumption totals; fallback uses population-share blending.

## Consistency and audit
- Weights always sum to 100% and use the same channel set across scopes.
- Applied weights are stored in weekly chart snapshots for inspection and record validation.
- Consumption volume multipliers affect metric display, not the weight ratios used for rank.

## Observability
- Charts view surfaces the active weight mix in a tooltip or details drawer.
- Warnings appear when fallback weights or partial samples are used.
