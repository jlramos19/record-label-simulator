# Economy - Topoda Charts Battle Pass

Status: Proposed

## Overview
The Topoda Charts Battle Pass is a seasonal progression system that rewards players for competing in the charts. It is optional, cosmetic-first, and framed as the "battle for the top of the charts."

## Naming and Brand Rationale
- "Battle" refers to the competition for chart dominance, not violence.
- "Topoda Charts" is the studio brand; "Topoda" derives from "Top of the."
- Default product name: "Topoda Charts Battle Pass" (short: "Topoda Pass").

## Design Goals
- Maintain a non-pay-to-win experience.
- Reward consistent play and creative output.
- Keep scope manageable for a solo developer.
- Align with existing chart-driven game loops.

## Structure
- Seasons are time-boxed (length TBD).
- Two tracks: Free and Premium.
- Tiers unlock via seasonal progress points.

### Progress Sources
- Chart performance (weekly chart score and placements).
- Content releases (tracks/projects).
- Promotions and tours.
- Optional seasonal goals (limited count per week).

## Reward Types
- Cosmetic packs (era themes, studio skins, UI accents).
- Radio packs (genre/era-aligned stations).
- Badges, titles, and profile cosmetics.
- In-game currency or vouchers (non-essential).

## Monetization Rules
- Premium track is paid; free track remains fully playable.
- No gameplay power locked behind payment.
- Cosmetic rewards must follow the Theme/Alignment/Country color rules.

## Implementation Notes (Web/PWA)
- Data-driven season definitions (JSON/CSV).
- Entitlements stored locally at first; server-backed later.
- Service worker caches audio for owned radio packs.

## Open Items
- Season length and tier count.
- Pricing range and regional adjustments.
- Purchase provider and refund policy.
