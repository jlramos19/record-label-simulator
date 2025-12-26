# Touring Venues (Planned)

This document introduces venues for the touring feature and the booking rules that support live events.

## Venue tiers
- Club: 500 to 2,000 seats, intimate launches and niche tours.
- Theater: 2,000 to 5,000 seats, mid-size releases and regional legs.
- Amphitheater: 6,000 to 10,000 seats, seasonal outdoor runs.
- Arena: 11,000 to 40,000 seats, national tours.
- Stadium: 41,000 to 200,000 seats, flagship tours and era-defining runs.

## Booking slots
- Venues expose booking slots by date; each booking reserves a full day.
- Slots are limited by venue availability and owner rules.
- Booked dates appear on the Calendar and block overlapping events for the Act.

## Demand and outcomes
- Attendance projection uses Act popularity, Era momentum, Trends, and promo spend.
- Revenue is derived from attendance, ticket price bands, and merch attach rates.
- Under-booking and over-booking both show warnings with projected impact.

## Dependencies
- Tours require an active Era and at least one released Project or Track.
- Tour legs group dates by region to reduce travel costs and keep pacing consistent.

## Related
- `docs/systems/structures/structures-and-slots.md`
- `docs/ui/touring-tab.md`
