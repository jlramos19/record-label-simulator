# Broadcast Studios

Broadcast studios are eyeriS Corp facilities that host interviews, live performances, and broadcast programs.
They exist to promote an Act (and optionally its content) by putting it in front of targeted audience segments.

## Structure context
- Broadcast studios are public facilities owned by eyeriS; booking uses facility slots (not creator ID slots).
- Slots are timeframe-based (morning/afternoon/night) and surface warnings when full or ineligible.

## Promo targeting
- Promo pushes can target an Act only, or an Act plus an associated Track.
- Broadcast studio selection is automatic and scores for best fit.
- Fit signals include scope (global/nation/region), audience age bands, alignment, themes, and moods.
- Broadcast impact is strongest in the studio's coverage area and its audience profile.

## Slot schedule (UTC)
- Daily capacity per studio: 5 slots.
- Timeframes: Morning 06:00-12:00 (2 slots), Afternoon 12:00-18:00 (1 slot), Night 18:00-24:00 (2 slots).
- Slots reserve the active window; if booked outside a window, the next available window is used.

## Pricing
- Broadcast booking fees scale with slot availability for the target timeframe.
- High availability discounts fees down to free; scarcity adds a premium as slots fill.

## EyeriS studio catalog (MVP)

- EyeriS Prime (global)
  - Audience: 25-44
  - Alignment: Safe, Neutral
  - Theme focus: Freedom, Ambition
  - Mood focus: Uplifting, Energizing, Thrilling
- EyeriS Nationline: Annglora
  - Coverage: Annglora (Bloomville Capital, Elsewhere)
  - Audience: 25-49
  - Alignment: Safe
  - Theme focus: Freedom
  - Mood focus: Calming, Cheering, Uplifting
- EyeriS Nationline: Bytenza
  - Coverage: Bytenza (Belltown Capital, Elsewhere)
  - Audience: 16-29
  - Alignment: Neutral
  - Theme focus: Ambition
  - Mood focus: Energizing, Uplifting, Calming
- EyeriS Nationline: Crowlya
  - Coverage: Crowlya (Campana City Capital, Elsewhere)
  - Audience: 18-39
  - Alignment: Risky
  - Theme focus: Power
  - Mood focus: Daring, Thrilling, Angering
- EyeriS Regionline: Bloomville
  - Coverage: Annglora (Bloomville Capital)
  - Audience: 25-49
  - Alignment: Safe
  - Theme focus: Freedom
  - Mood focus: Uplifting, Cheering, Calming
- EyeriS Regionline: Annglora Elsewhere
  - Coverage: Annglora (Elsewhere)
  - Audience: 25-49
  - Alignment: Safe
  - Theme focus: Morality
  - Mood focus: Calming, Uplifting, Boring
- EyeriS Regionline: Belltown
  - Coverage: Bytenza (Belltown Capital)
  - Audience: 16-29
  - Alignment: Neutral
  - Theme focus: Ambition
  - Mood focus: Energizing, Thrilling, Uplifting
- EyeriS Regionline: Bytenza Elsewhere
  - Coverage: Bytenza (Elsewhere)
  - Audience: 16-29
  - Alignment: Neutral
  - Theme focus: Loyalty
  - Mood focus: Calming, Uplifting, Cheering
- EyeriS Regionline: Campana City
  - Coverage: Crowlya (Campana City Capital)
  - Audience: 18-39
  - Alignment: Risky
  - Theme focus: Power
  - Mood focus: Daring, Thrilling, Angering
- EyeriS Regionline: Crowlya Elsewhere
  - Coverage: Crowlya (Elsewhere)
  - Audience: 18-39
  - Alignment: Risky
  - Theme focus: Ambition
  - Mood focus: Daring, Energizing, Angering

## Program tiers
- Standard programs (interviews, live sets) require only an Act presence and a broadcast slot.
- High-stakes programs (prime-time TV showcases) are costly and require eligibility.
  - Minimum quality threshold (80+).
  - Current charting content (Act must have a charting Track, or the selected Track must be charting).
  - Act-only submissions are allowed if the Act already has charting content that meets quality.
- Live Performance promos can be upgraded to Prime Time Showcases via a toggle.
  - Requires Act prestige (Top 10 chart peak) and Track prestige (Top 20 chart peak) plus quality 80+.
  - Live performance metrics focus on concurrent live audience.
  - A performance tape is archived in the EyeriS Video division after airing.

## Slot usage rules
- Interview: requires a broadcast slot.
- Live performance: requires a broadcast slot.
- Prime-time showcase: requires a broadcast slot and eligibility checks.
- Slots are booked for the current timeframe window and free at the next window boundary.

## Rationale
Timeframes keep broadcast scheduling readable while reinforcing morning/afternoon/night programming cadence.

## Related
- `docs/systems/promo/auto-promo.md`
- `docs/systems/promo/filming-studios.md`
- `docs/systems/structures/structures-and-slots.md`
