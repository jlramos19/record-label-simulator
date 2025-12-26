# Structures and Slots

This document defines the structure and slot model for the web MVP and near-term roadmap.

## Structures (overview)
- Structures are facilities with owners, tiers, and slot capacity that gate production, promotion, and touring.
- Structure records include: `structure_id`, `structure_type`, `owner_id`, `scope` (global/nation/region), `tier`, `slot_capacity`, `upkeep`, and `availability`.
- Structures can be owned, leased, or public (booked on demand).

## Slot taxonomy
- ID slots: assign Creator IDs to run work orders (songwriter/recorder/producer, etc).
- Input slots: attach required content items (sheet, demo, track) to start a work order.
- Facility booking slots: reserve a facility for a date window (broadcast slot, filming slot, venue booking).
- Queue slots: optional "next up" staging for IDs or content in the same structure.
- Upgrade slots: attach gear, permits, or facility add-ons that change output or capacity.

## Slot rules (contract)
- A slot is blocked if required inputs are missing, the assigned ID is busy, or the structure is unavailable.
- Slot occupancy is time-bound; releases occur at completion or at UTC midnight for day-based facilities.
- Every blocked slot surfaces a reason code and warning message in the UI (observability first).
- Slot actions append to the event log and never silently fail.

## Studio families
- Recording studios: create sheet, demo, and master stages; use ID + input slots.
- Broadcast studios: host interviews/live performances; use day-based booking slots.
- Filming studios: required for music videos and multimedia promos; use day-based booking slots.
- Studio access can be owned or leased; public studios use booking fees and availability checks.

## Venues (touring roadmap)
- Venues are structures used for live events and touring.
- Venue tiers: Club, Theater, Amphitheater, Arena, Stadium.
- Touring is planned as the final promotion step of an Era and will live in the Touring tab to the right of Promotions.
- Capacity mismatch (too big/too small) shows warnings and projected impact before booking.

## Related
- `docs/systems/promo/broadcast-studios.md`
- `docs/systems/promo/filming-studios.md`
- `docs/systems/touring/venues.md`
- `docs/ui/touring-tab.md`
