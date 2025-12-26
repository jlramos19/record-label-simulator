# Record Label Simulator Web Modules

## Purpose
Define the module responsibilities for the charts system in the web app.

## Modules
- ChartEngine: computes weekly rankings and scores.
- ChartViews: renders table rows for the selected region.
- ChartHistory: stores weekly snapshots for trends and milestones.
- ChartFilters: handles tabs and region selection.

## Data Flow
1) Weekly tick triggers ChartEngine.
2) Engine writes new chart arrays into state.
3) ChartViews renders the active chart table.
4) ChartHistory appends the snapshot for logs and UI summaries.
