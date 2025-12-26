# Audience Preference Drift (Web MVP)

## Intent
Keep audience alignment, themes, and moods evolving from base regional profiles so trends stay fresh without erasing canon.

## Inputs
- Base regional/national profiles (alignment, theme, moods).
- Recent chart entries (regional + national).
- Recent releases in the nation (last N weeks).
- Iconic era rate (Risky success) to boost risk appetite.

## Weekly Update
- Blend base preference with chart mix + release mix.
- Smooth drift to avoid sharp swings.
- Record per-scope `alignmentWeights`, `themes`, `moods`, `trendGenres`.

## Scoring Impact
- Alignment bonus uses dynamic weights.
- Theme/mood bonuses use evolved lists.
- Regional trend genres add a small bonus on top of global trends.
- Homeland boosts and cross-nation lore modifiers add small bonuses/penalties based on act/creator origins.
