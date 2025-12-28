# Charts View

Defines the full Charts gameplay view, including scope drilldown and content filters.

## Purpose
- Provide ranked charts across Gaia (Global), nation (National), and region (Regional) scopes.
- Switch between Tracks, Projects, Promotions, Touring, Acts (yearly popularity), Records, and Demographics views.
- Records highlights current record holders, recent breaks, and publish-ready metadata for eyeriSocial posts.
- Demographics surfaces Gaia and nation population breakdowns to forecast audience waves.

## Scope controls
- Primary tabs show Global plus the three nations.
- Selecting a nation reveals its two regional tabs for drilldown.
- Selecting Global hides regional tabs.
- Demographics uses Global and nation scopes; regional tabs are suppressed.

## Naming
- Scope label format: `<Place> (Global|National|Regional)`.
- Global uses `Gaia` as the place label; national uses nation name; regional uses region label.
- Chart news/eyeriSocial handles follow `<Place>Charts`, defaulting to `GaiaCharts` for Global.

## Content filters
- Tabs: Tracks, Projects, Promotions, Touring, Acts (yearly popularity), Records, Demographics.
- Filter choice persists while switching chart scope.
- Projects aggregate track charts into project-level rankings (Albums, EPs, and Single albums).

## Records tab
- Shows the current record book for the selected scope and content type.
- Record categories include fastest to #1, biggest debut, biggest week (sales/streams/airplay/eyeriSocial), longest #1 streak, and fastest-to-milestone windows (ex: 1M streams in 4 weeks).
- Each record row surfaces Act, content title, scope, record value, window, chart issue date achieved, and release date (weeks-to-record).
- Recent breaks show the previous holder and delta so eyeriSocial copy can call out the change.

## History
- Date-range picker opens chart history by current scope + content filter.
- Acts leaderboard is yearly and does not use chart history snapshots.

## Observability
- Empty states surface when charts are locked or no data exists.
- History view warns when a snapshot is missing.
- Demographics warns when a region scope is selected (regional population is not modeled yet).
- Records warns when record history is insufficient or data gaps block a record calculation.

## Related
- `docs/ui/chart-pulse.md`
- `docs/ui/promotions-tab.md`
- `docs/ui/touring-tab.md`
- `docs/systems/charts/chart-records.md`
- `docs/systems/charts/chart-weighting.md`
