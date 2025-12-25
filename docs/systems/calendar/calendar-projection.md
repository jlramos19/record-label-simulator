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
- Week window defaults to the current week plus the next 3 weeks (4 total).
- Filters default to showing scheduled + released items for label and rivals.

## Compatibility Rules
- No renames of data stores or event types.
- Old saves load without migration changes to release scheduling.
- Calendar reads the same release queues used by Release Desk.
