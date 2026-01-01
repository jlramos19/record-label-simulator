# Filming Studios

Filming studios are production facilities required for multimedia promo types.

## Structure context
- Filming studios are public facilities; booking uses facility slots (not creator ID slots).
- Slots are timeframe-based (morning/afternoon/night) and surface warnings when full or ineligible.

## Slot schedule (UTC)
- Daily capacity per studio: 5 slots.
- Timeframes: Morning 06:00-12:00 (2 slots), Afternoon 12:00-18:00 (1 slot), Night 18:00-24:00 (2 slots).
- Slots are booked for the current timeframe window and free at the next window boundary.

## Pricing
- Filming booking fees scale with slot availability for the target timeframe.
- High availability discounts fees down to free; scarcity adds a premium as slots fill.

## Filming studio catalog (MVP)
- EyeriS Filming Studio: Bloomville
  - Coverage: Annglora (Bloomville Capital)
- EyeriS Filming Studio: Annglora Elsewhere
  - Coverage: Annglora (Elsewhere)
- EyeriS Filming Studio: Belltown
  - Coverage: Bytenza (Belltown Capital)
- EyeriS Filming Studio: Bytenza Elsewhere
  - Coverage: Bytenza (Elsewhere)
- EyeriS Filming Studio: Campana City
  - Coverage: Crowlya (Campana City Capital)
- EyeriS Filming Studio: Crowlya Elsewhere
  - Coverage: Crowlya (Elsewhere)

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
