# Calendar Projection (Web MVP)

## Intent
The Calendar is a projection layer over existing scheduling data. It does not replace scheduling systems, change save formats, or introduce new event types. The Calendar view reads current state and renders timelines; simulation logic remains authoritative.

## Sources (Read-Only)
- Label scheduled drops: `state.releaseQueue`.
- Label released drops: `state.marketTracks` where `isPlayer` is true.
- Rival scheduled drops: `state.rivalReleaseQueue`.
- Rival released drops: `state.marketTracks` where `isPlayer` is false.
- Eras: `state.era.active` and active Act metadata.

## Projection Chain
1. `event_log` (narrative record) remains intact and deterministic.
2. `scheduled_content_projection` is derived from release queues and market entries.
3. `calendar_grid_projection` groups scheduled content into week/day buckets for rendering.

## UI Surfaces
- Calendar view (route `releases`, labeled "Calendar") shows a grid projection with Label/Public/Eras tabs and filters.
- A list view may be used for detail or overflow, but shares the same projection data.

## Defaults
- Week anchoring uses the current `weekIndex()` for the active week.
- Week window defaults to 6 weeks: preview week -1, active weeks 0-3, preview week +4.
- Filters default to showing scheduled + released items for label and rivals.

## Snap Behavior
- Calendar navigation snaps in full-week increments using an integer `calendarWeekIndex` anchor.
- Wheel delta accumulation, drag distance, and touch velocity advance the anchor by whole weeks.
- Snapping updates only the anchor index and does not mutate scheduling data.

## Compatibility Rules
- No renames of data stores or event types.
- Old saves load without migration changes to release scheduling.
- Calendar reads the same release queues used by Release Desk.
- Scheduled release entries must target a future in-game timestamp; releases trigger once `state.time.epochMs` meets or exceeds `releaseAt`.
