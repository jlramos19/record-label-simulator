# Chart Pulse

Defines the Dashboard Chart Pulse panel as a live feed of projected Top 5 entries.

## Purpose
- Provide six-hour snapshot windows for near-term chart projections.
- Offer a compact preview without duplicating the full Charts view.

## Modes
- Tracks: projected Top 5 tracks for the selected chart scope.
- Projects: aggregates projected track scores into project-level rankings.
- Promos: lists top promo moments scheduled inside each six-hour window.

## Scope controls
- Scope tabs: Global, Nation, Region (labels render as `<Place> (Global|National|Regional)`).
- Target selector updates based on scope type.
- Global disables the target selector.

## Naming
- Global uses `Gaia` as the place label; national uses nation name; regional uses region label.
- Chart handles for scope-aware posts follow `<Place>Charts`, defaulting to `GaiaCharts`.

## Cadence
- Windows: Now, +6h, +12h, +18h, +24h, +30h.
- Projections include released market tracks plus scheduled releases up to the window timestamp.

## Observability
- Empty states clarify when no projected entries or promo events are available.

## Related
- `docs/systems/time/weekly-timing.md`
- `docs/ui/promotions-tab.md`
