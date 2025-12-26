# Filming Studios

Filming studios are production facilities required for multimedia promo types.

## Structure context
- Filming studios are public facilities; booking uses facility slots (not creator ID slots).
- Slots are day-based and surface warnings when full or ineligible.

## Slot capacity (MVP)
- Static capacity: 2 slots per day.
- Slots are booked for the remainder of the current day and free at the next midnight.

## Promo type requirements
- Music video: requires a filming slot.
- eyeriSocial Ad (multimedia post): requires a filming slot.
- eyeriSocial post (standard): no filming slot required.
- Filming promos always require content; Act-only promos are not eligible.

## Ad definition
- "eyeriSocial Ad" is a multimedia post with higher cost than a standard eyeriSocial post.
- Base cost rule (MVP): 3x the standard eyeriSocial post base cost.

## Related
- `docs/systems/promo/auto-promo.md`
- `docs/systems/promo/broadcast-studios.md`
- `docs/systems/structures/structures-and-slots.md`
