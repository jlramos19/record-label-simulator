# Touring Tab

This doc defines the Touring view (planned) for the future touring feature.

## Status
- Touring Desk includes draft planning, venue browsing, booking actions, and projection summaries.
- Bookings render on the Calendar and log event entries with reason codes for blocks.
- Touring charts still rank attendance draw, now sourced from booked tour activity.
- Touring impact on wallet/fans is gated by the touring balance flag.

## Development route
- Start with real-world touring workflow steps, even when mechanics are rough.
- Use placeholder calculations plus reason-code logging for undefined concepts.
- Keep gameplay impact behind a feature flag until tuning is approved; projections always render.

## Placement
- The tab sits to the right of Promotions in the primary nav.
- Touring is the final promotion step of an Era, following standard promos.

## Scope
- Plan and book tours for an Act and Era.
- Select the anchored Project or Track(s) for the tour.
- Build tour legs, book venues, and schedule dates on the calendar.
- Regional chart momentum adjusts venue demand projections.

## Core panels
- Tour Planner: Act, Era, tour name, anchor project/track, date window, auto-generate route.
- Venue Finder: filters for region, capacity tier, availability; includes a venue list and quick-select.
- Route Timeline: date + venue bookings list with conflict warnings and removal actions.
- Budget + Staffing: per-show projection totals and a tour-wide summary (revenue, costs, profit, attendance).

## Slot and gating rules
- Touring requires an active Era and at least one released Project or Track.
- Each tour date consumes a venue booking slot.
- Venue booking eligibility checks chart momentum and budget before allowing confirmation.
- Acts cannot double-book dates; conflicts are blocked with a visible reason.
- Capacity mismatch surfaces a warning instead of a hard block.
- Lead-time and cadence targets surface as warnings when out of bounds.

## Observability
- Invalid bookings show reason codes (no slots, missing era/content, schedule conflicts).
- Warnings appear in the Touring tab and in the Calendar timeline.
- Booking attempts always log an event with the tour ID and failure reason.

## Related
- `docs/systems/touring/venues.md`
- `docs/systems/touring/tuning-guide.md`
- `docs/systems/structures/structures-and-slots.md`
- `docs/ui/promotions-tab.md`
