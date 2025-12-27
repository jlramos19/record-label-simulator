# Touring Tuning Guide (Draft)

This guide defines how touring logic, pacing, and economy should be tuned while the feature is still evolving.

## Principles
- Process-first: model real-world touring steps even when the mechanics are stubbed.
- Placeholder math: use explicit defaults for unknown concepts and log when placeholders are applied.
- Feature flag gating: keep gameplay impact behind the touring balance flag until tuning is approved.
- Observability first: every block or warning includes a reason code and a user-facing message.

## Core game loop (target)
1) Plan: pick Act + active Era + anchor release/track, set window + route targets.
2) Route: build regional legs with auto travel/rest buffers, conflict previews, and auto-generate options.
3) Book: reserve venue slots, validate availability, and lock dates on the Calendar.
4) Execute: resolve attendance + finances per date, post to eyeriSocial and event log.
5) Settle: summarize leg outcomes and update Era momentum and Act popularity.

## Pacing targets
- Lead time: 2-6 weeks between announcement and first date.
- Cadence: max 2 dates per week, minimum 1 rest day between dates.
- Travel buffers: 1-3 days between legs in different regions.
- Tour length caps: tier-driven max dates to prevent infinite touring loops.
- Cooldown: 4-8 weeks between tours per Act.

## Economy and effects (draft)
```text
attendance = capacity * sell_through
sell_through = clamp(desired_attendance / capacity, 0.2, 1.1)

ticket_price = tier_base_price * region_price_index * quality_premium
gross_ticket = attendance * ticket_price
merch = attendance * merch_attach_rate * merch_spend_per_fan
revenue = gross_ticket + merch + sponsorship
costs = venue_fee + staffing + travel + production + marketing
profit = revenue - costs
```

## Initial defaults (v0)
These values lock the first-pass implementation and are expected to move after telemetry.
Applied in `assets/js/data/constants.js` as touring tier config.

Ticket + draw + sponsor:

| Tier | Base ticket price | Draw multiplier | Sponsor base |
| --- | --- | --- | --- |
| Club | 25 | 0.8 | 0 |
| Theater | 35 | 0.95 | 2000 |
| Amphitheater | 50 | 1.0 | 8000 |
| Arena | 70 | 1.1 | 25000 |
| Stadium | 95 | 1.2 | 100000 |

Merch defaults:

| Tier | Merch attach rate | Spend per fan |
| --- | --- | --- |
| Club | 0.08 | 18 |
| Theater | 0.1 | 22 |
| Amphitheater | 0.12 | 26 |
| Arena | 0.15 | 30 |
| Stadium | 0.18 | 35 |

Cost floors (per date):

| Tier | Venue fee floor | Staffing base | Travel base |
| --- | --- | --- | --- |
| Club | 2000 | 1500 | 800 |
| Theater | 6000 | 3000 | 1500 |
| Amphitheater | 14000 | 5500 | 3500 |
| Arena | 30000 | 10000 | 8000 |
| Stadium | 75000 | 22000 | 18000 |

Global multipliers:
- `region_price_index`: 0.9 to 1.15 (default 1.0).
- `quality_premium`: 0.9 to 1.2 (default 1.0).
- `regional_chart_boost`: 0.9 to 1.2 (default 1.0).
- `concert_interest`: 0.85 to 1.15 (default 1.0).
- `promo_scale`: 5000.
- `promo_efficiency`: 0.35.

World and gameplay effects to tune:
- Popularity lift: post-show increase to Act popularity and Era momentum.
- Chart impact: temporary boost to streaming/sales momentum after show weeks.
- Cashflow swings: touring should be lucrative but spiky, with real downside risk.
- Rival pressure: AI tours can create regional demand shifts and crowd calendars.

## Telemetry to watch
- Sell-through distribution per tier and region (target median 70-85%).
- Profit distribution by tier (Arena/Stadium should be higher variance).
- Calendar conflicts vs successful bookings (target <10% conflicts once tuned).
- Tour fatigue impact on Act performance (ensure diminishing returns).

## Feature flag path
- `RLS-TOUR-BALANCE-001`: disable all wallet and momentum effects; log only.
- Gradually enable effects by tier once tuning looks stable.

## Notes for v0
- Booking projections always render; balance effects only apply when the flag is enabled.
- Attendance-derived touring charts are computed from booked tour dates.

## Related
- `docs/ui/touring-tab.md`
- `docs/systems/touring/venues.md`
- `docs/systems/structures/structures-and-slots.md`
