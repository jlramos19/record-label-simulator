# Touring Venues (MVP v0)

This document introduces venues for the touring feature and the booking rules that support live events.

## Venue tiers
- Club: 500 to 2,000 seats, intimate launches and niche tours.
- Theater: 2,000 to 5,000 seats, mid-size releases and regional legs.
- Amphitheater: 6,000 to 10,000 seats, seasonal outdoor runs.
- Arena: 11,000 to 40,000 seats, national tours.
- Stadium: 41,000 to 200,000 seats, flagship tours and era-defining runs.

## Venue data model (v0)
Venue records live in `assets/js/data/constants.js` and expose:
- `id`: unique venue ID.
- `label`: venue name for UI display.
- `tier`: Club/Theater/Amphitheater/Arena/Stadium.
- `capacity`: integer seat cap within tier range.
- `regionId`: matches `REGION_DEFS` (ex: `Annglora Capital`).
- `nation`: Annglora/Bytenza/Crowlya.
- `owner`: public or label name.
- `slotsPerDay`: available booking slots per day (default 1).

## Booking slots
- Venues expose booking slots by date; each booking reserves a full day.
- Slots are limited by venue availability and owner rules.
- Booked dates appear on the Calendar and block overlapping events for the Act.
  - Capacity is tracked by venue + day; if `slotsPerDay` is exhausted, booking is blocked.
  - Act double-booking on the same day is blocked with a reason code.
- Booking eligibility checks tier requirements and budget coverage before confirming a date.

## Demand and outcomes
- Attendance projection uses Act popularity, Era momentum, regional chart momentum, Trends, and promo spend.
- Revenue is derived from attendance, ticket price bands, and merch attach rates.
- Under-booking and over-booking both show warnings with projected impact.

## Booking fee pricing
- Venue booking fees scale with slot availability on the target date.
- High availability discounts fees down to free; scarcity adds a premium as slots fill.

## Pacing rules (draft)
- Lead time target: 2-6 weeks before the first date (warning if outside).
- Cadence target: max 2 dates per week; minimum 1 rest day between dates (warning if outside).
- Travel buffer target: 1-3 days between legs in different regions (warning if outside).
- Length caps: tier-driven max dates (Club 8-12, Theater 10-16, Amphitheater 12-20, Arena 14-24, Stadium 10-18).
- Length caps enforce the tier max (`maxDatesMax`) once the tour books that tier.
- Cooldown: 4-8 weeks between tours per Act to limit stacking (warning-only for now).

## Reason codes (booking)
- `TOUR_NO_DRAFT`: no tour draft selected.
- `TOUR_NO_ACT`: draft missing Act or Act not found.
- `TOUR_NO_ACTIVE_ERA`: act lacks an active Era.
- `TOUR_NO_RELEASED_CONTENT`: no released Project/Track anchor available.
- `TOUR_NO_VENUE`: venue not selected or not found.
- `TOUR_INVALID_WEEK`: invalid week selection for booking.
- `TOUR_INVALID_DATE`: invalid date.
- `TOUR_PAST_DATE`: date is not in the future.
- `TOUR_SLOT_CONFLICT`: act already booked on the same date.
- `TOUR_VENUE_FULL`: venue slots are exhausted for the date.
- `TOUR_DATE_OUTSIDE_WINDOW`: booking date not inside the tour window.
- `TOUR_TIER_LOCKED`: act has not met the charting threshold for the venue tier.
- `TOUR_BUDGET_SHORT`: insufficient cash to cover projected date costs.
- `TOUR_DEMAND_LOW`: projected sell-through falls below the booking threshold.
- `TOUR_LENGTH_CAP`: tour length cap reached for the active tier.

## Warning codes (pacing + projections)
- `TOUR_UNDERBOOKED`: projected sell-through below 50%.
- `TOUR_OVERBOOKED`: projected sell-through above 95%.
- `TOUR_LEAD_SHORT`: lead time below 2 weeks.
- `TOUR_LEAD_LONG`: lead time above 6 weeks.
- `TOUR_WEEKLY_CAP`: more than 2 dates scheduled in the same week.
- `TOUR_REST_DAY`: less than 1 rest day between dates.
- `TOUR_TRAVEL_BUFFER`: less than 1 day buffer between regions.
- `TOUR_COOLDOWN`: less than 4 weeks between tours.

## Projection model (draft)
```text
base_demand = popularity * era_momentum * trend_fit * region_affinity * regional_chart_boost * concert_interest
promo_lift = 1 + log1p(promo_spend / promo_scale) * promo_efficiency
announce_lead = clamp(lead_weeks / 6, 0.5, 1.2)
tier_draw = tier_draw_multiplier[tier]

desired_attendance = base_demand * promo_lift * announce_lead * tier_draw
sell_through = clamp(desired_attendance / capacity, 0.2, 1.1)
attendance = min(capacity, round(capacity * sell_through))
```

## Economy model (draft)
```text
ticket_price = tier_base_price[tier] * region_price_index * quality_premium
gross_ticket = attendance * ticket_price
merch = attendance * merch_attach_rate * merch_spend_per_fan
sponsorship = tier_sponsor_base[tier] * era_momentum

venue_fee = tier_venue_fee * availability_multiplier
revenue = gross_ticket + merch + sponsorship
costs = venue_fee + staffing + travel + production + marketing
profit = revenue - costs
```

## Balance knobs (tuning targets)
- `promo_scale`, `promo_efficiency`, and `tier_draw_multiplier` to tune demand.
- `ticket_price` bands and `merch_attach_rate` to tune cashflow.
- `cooldown_weeks` and `max_dates_per_week` to control pacing.
- Warning thresholds: under-booking at <50% projected sell-through, over-booking at >95%.
- Staffing stamina boost cap (max stamina efficiency from crew quality).

## Dependencies
- Tours require an active Era and at least one released Project or Track.
- Tour legs group dates by region to reduce travel costs and keep pacing consistent.

## Related
- `docs/systems/structures/structures-and-slots.md`
- `docs/systems/touring/tuning-guide.md`
- `docs/ui/touring-tab.md`
