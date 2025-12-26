# Act Name Generator (Group Acts)

## Overview
Group Act names are generated from a semantic pair:
- 1 adjective ID
- 1 plural-noun ID

The semantic pair is the canonical identity for translation, rendering, and UI stacking.

## Categories
Adjectives (20 categories, 25 tokens each):
1) Colors (basic)
2) Light / glow
3) Temperature (hot/cold)
4) Texture (soft/rough)
5) Material / substance (wood/metal/glass)
6) Size (big/small)
7) Height / length (tall/short/long)
8) Shape / geometry (round/sharp/angular)
9) Speed / motion (fast/slow)
10) Strength / power (strong/gentle)
11) Calm vs intense (calm/fierce)
12) Weather / sky (stormy/sunny)
13) Time / age (new/ancient)
14) Nature / ecology (wild/leafy)
15) Luxury / regality (royal/elegant)
16) Tech / digital (digital/encoded)
17) Precision / quality (precise/clean)
18) Mystery / magic tone (mystic/secret)
19) Urban / place vibe (urban/coastal)
20) Rarity / value (rare/common)

Nouns (20 categories, 25 tokens each):
1) Animals (general)
2) Birds
3) Sea creatures
4) Insects / small critters
5) Flowers
6) Herbs / plants / foliage
7) Trees / woods
8) Gemstones
9) Crystals / minerals
10) Metals / alloys
11) Tools / stationery
12) Household objects
13) Tech components
14) Vehicles / transport nouns
15) Sky / celestial nouns
16) Weather / water phenomena
17) Geography / places
18) Music / sound nouns
19) Regalia / ritual objects
20) Groups / formations

## Grammar Rules (Rendering)
- Annglora: `{Adj_EN} {NounPlural_EN}`
- Crowlya: `{NounPlural_ES} {Adj_ES}` with gender + plural agreement
- Bytenza: `{Adj_KO} {Noun_KO} {CollectiveSuffix?}` (use group markers when available; fall back to 들 only when needed)

## UI Stacking (Bytenza)
Bytenza Act names stack Korean (primary) with English translation (secondary) using the semantic pair.

## Nation-Weighted Selection
Category weights bias selection by nation (default weight = 1):
- Annglora: boost flowers/plants/trees + nature/light/season adjectives
- Crowlya: boost gemstones/metals/regalia + luxury/radiance/mystery adjectives
- Bytenza: boost animals/tech/components/formations + tech/geometry/precision/speed adjectives

## Combinatorics
- 20 x 25 adjectives = 500
- 20 x 25 nouns = 500
- Unique base pairs = 500 x 500 = 250,000
- Rendered across 3 nations = 750,000 nation strings
- If Bytenza stacks Korean + English, upper bound display lines = 1,000,000
