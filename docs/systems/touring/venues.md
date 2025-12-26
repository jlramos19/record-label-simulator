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

## Pacing rules (draft)
- Lead time: tours must be announced 2-6 weeks before the first date.
- Cadence: max 2 dates per week; minimum 1 rest day between dates.
- Travel: 1-3 buffer days between legs in different regions.
- Length caps: tier-driven max dates (Club 8-12, Theater 10-16, Amphitheater 12-20, Arena 14-24, Stadium 10-18).
- Cooldown: 4-8 weeks between tours per Act to limit stacking.

## Projection model (draft)
```text
base_demand = popularity * era_momentum * trend_fit * region_affinity
promo_lift = 1 + log1p(promo_spend / promo_scale) * promo_efficiency
announce_lead = clamp(lead_weeks / 6, 0.5, 1.2)
tier_draw = tier_draw_multiplier[tier]
goal_weight = goal_visibility ? 1.1 : 0.95

desired_attendance = base_demand * promo_lift * announce_lead * tier_draw * goal_weight
sell_through = clamp(desired_attendance / capacity, 0.2, 1.1)
attendance = min(capacity, round(capacity * sell_through))
```

## Economy model (draft)
```text
ticket_price = tier_base_price[tier] * region_price_index * quality_premium
gross_ticket = attendance * ticket_price
merch = attendance * merch_attach_rate * merch_spend_per_fan
sponsorship = tier_sponsor_base[tier] * era_momentum * visibility_factor

revenue = gross_ticket + merch + sponsorship
costs = venue_fee + staffing + travel + production + marketing
profit = revenue - costs
```

## Balance knobs (tuning targets)
- `promo_scale`, `promo_efficiency`, and `tier_draw_multiplier` to tune demand.
- `ticket_price` bands and `merch_attach_rate` to tune cashflow.
- `cooldown_weeks` and `max_dates_per_week` to control pacing.
- Warning thresholds: under-booking at <50% projected sell-through, over-booking at >95%.

## Dependencies
- Tours require an active Era and at least one released Project or Track.
- Tour legs group dates by region to reduce travel costs and keep pacing consistent.

## Related
- `docs/systems/structures/structures-and-slots.md`
- `docs/systems/touring/tuning-guide.md`
- `docs/ui/touring-tab.md`
