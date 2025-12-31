# Chart Sizes (Display vs Evaluation)

Defines the visible chart sizes and the larger internal evaluation pools used for pacing and dominance logic.

## Display charts
- Global: 100
- Nation: 40
- Region: 10

These sizes are the only ranks surfaced in the Charts UI and exports.

## Internal evaluation pools
- Global: 1000
- Nation: 400
- Region: 100

Internal pools are computed by selecting the Top-K entries by chart score, then slicing
the visible display charts from that internal ordering.

## Telemetry + monopoly
- Dominance telemetry counts label presence inside the internal Top-K pools.
- Monopoly checks only trigger when a single label occupies all K slots in a scope.
