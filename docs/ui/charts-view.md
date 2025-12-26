# Charts View

Defines the full Charts gameplay view, including scope drilldown and content filters.

## Purpose
- Provide ranked charts across Global, nation, and regional scopes.
- Switch between Tracks, Projects, Promotions, and Touring rankings.

## Scope controls
- Primary tabs show Global plus the three nations.
- Selecting a nation reveals its two regional tabs for drilldown.
- Selecting Global hides regional tabs.

## Content filters
- Tabs: Tracks, Projects, Promotions, Touring.
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
