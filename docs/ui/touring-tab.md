# Touring Tab

This doc defines the Touring view (planned) for the future touring feature.

## Status
- UI stub is live in the primary nav with a placeholder Touring Desk view.
- Booking logic, calendar integration, and costs remain planned.

## Placement
- The tab sits to the right of Promotions in the primary nav.
- Touring is the final promotion step of an Era, following standard promos.

## Scope
- Plan and book tours for an Act and Era.
- Select the anchored Project or Track(s) for the tour.
- Build tour legs, book venues, and schedule dates on the calendar.

## Core panels (planned)
- Tour Planner: Act, Era, tour name, length, and goal (visibility vs revenue).
- Venue Finder: filters for region, capacity tier, availability, and alignment fit.
- Route Timeline: drag/drop date slots, conflicts, and travel buffers.
- Budget + Staffing: venue fees, travel, staffing requirements, and projected profit.

## Slot and gating rules
- Touring requires an active Era and at least one released Project or Track.
- Each tour date consumes a venue booking slot.
- Acts cannot double-book dates; conflicts are blocked with a visible reason.
- Capacity mismatch surfaces a warning instead of a hard block.

## Observability
- Invalid bookings show reason codes (no slots, missing permits, schedule conflicts).
- Warnings appear in the Touring tab and in the Calendar timeline.

## Related
- `docs/systems/touring/venues.md`
- `docs/systems/structures/structures-and-slots.md`
- `docs/ui/promotions-tab.md`
