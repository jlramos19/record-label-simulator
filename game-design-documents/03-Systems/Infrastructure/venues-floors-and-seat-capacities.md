# Venues, Floors, and Seat Capacities

Venues are touring structures that host live events. Capacity is derived from floors and seat bands, giving a consistent way to scale demand, revenue, and visibility.

## Venue tiers and capacity bands
- Club: 500 to 2,000 seats, 1 to 2 floors (500 to 1,000 per floor).
- Theater: 2,000 to 5,000 seats, 2 to 5 floors (1,000 per floor).
- Amphitheater: 6,000 to 10,000 seats, 3 to 5 floors (2,000 per floor).
- Arena: 11,000 to 40,000 seats, 3 to 8 floors (5,000 per floor).
- Stadium: 41,000 to 200,000 seats, 5 to 20 floors (10,000 per floor).

## Booking model
- Each venue exposes booking slots by date (one booking per date).
- Bookings reserve the date for an Act and appear on the Calendar.
- Availability is scoped by region and owner rules.

## Attendance and revenue
- Attendance projection uses Act popularity, Era momentum, Trends, and promo spend.
- Revenue uses projected attendance, ticket price bands, and merch attach rates.
- Over-booking and under-booking show warnings before confirmation.

## Data model (web)
- `venue_id`, `tier`, `capacity`, `floors`, `region_scope`, `owner_id`, `booking_slots`.
- Bookings create events with `act_id`, `tour_id`, `date`, and `expected_attendance`.

## Observability
- Booking failures show a reason code (no slots, conflict, or missing requirements).
- Warnings appear in the Touring tab and the Calendar timeline.
