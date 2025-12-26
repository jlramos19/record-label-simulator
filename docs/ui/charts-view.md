# Charts View

Defines the full Charts gameplay view, including scope drilldown and content filters.

## Purpose
- Provide ranked charts across Gaia (Global), nation (National), and region (Regional) scopes.
- Switch between Tracks, Projects, Promotions, Touring, and Acts (yearly popularity) rankings.

## Scope controls
- Primary tabs show Global plus the three nations.
- Selecting a nation reveals its two regional tabs for drilldown.
- Selecting Global hides regional tabs.

## Naming
- Scope label format: `<Place> (Global|National|Regional)`.
- Global uses `Gaia` as the place label; national uses nation name; regional uses region label.
- Chart news/eyeriSocial handles follow `<Place>Charts`, defaulting to `GaiaCharts` for Global.

## Content filters
- Tabs: Tracks, Projects, Promotions, Touring, Acts (yearly popularity).
- Filter choice persists while switching chart scope.

## History
- Week picker opens chart history by current scope + content filter.

## Observability
- Empty states surface when charts are locked or no data exists.
- History view warns when a snapshot is missing.

## Related
- `docs/ui/chart-pulse.md`
- `docs/ui/promotions-tab.md`
- `docs/ui/touring-tab.md`
