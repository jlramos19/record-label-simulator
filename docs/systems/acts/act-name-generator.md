# Act Name Generator

## Overview
Act names are generated from a semantic pair:
- 1 adjective ID
- 1 noun ID

The semantic pair is the canonical identity for rendering, translation, and UI stacking. The stored key format is:
- `adj.<category>.<index>::noun.<category>.<index>`

## Pool Size + Combinatorics
- 15 adjective categories x 20 entries each = 300 adjectives
- 15 noun categories x 20 entries each = 300 nouns
- Unique base combinations = 90,000
- Solo vs group rendering doubles the output variants (up to 180,000 rendered variants)

## Categories
Adjectives (15):
1) Colors (basic)
2) Light / glow
3) Temperature
4) Texture
5) Material / substance
6) Size / scale
7) Shape / geometry
8) Speed / motion
9) Strength / power
10) Calm vs intense
11) Weather / sky
12) Time / age
13) Nature / ecology
14) Luxury / regality
15) Tech / digital

Nouns (15):
1) Animals (general)
2) Birds
3) Sea creatures
4) Insects / small critters
5) Flowers
6) Trees / woods
7) Gemstones / crystals
8) Metals / alloys
9) Tools / stationery
10) Household objects
11) Tech components
12) Sky / celestial nouns
13) Weather / water phenomena
14) Geography / places
15) Groups / formations

## Data Shape
Adjectives:
- `en`
- `es_m_s`, `es_f_s`, `es_m_p`, `es_f_p`
- `ko.hangul`, `ko.rr` (RR = Revised Romanization)

Nouns:
- `en.s`, `en.p`
- `es.gender`, `es.s`, `es.p`
- `ko.s.hangul`, `ko.s.rr`
- `ko.p.hangul`, `ko.p.rr`

## Grammar Rules (Rendering)
- Annglora (EN): `Adj + Noun`
  - Group acts use plural nouns.
  - Solo acts use singular nouns.
- Crowlya (ES): `Noun + Adj` with gender + number agreement.
  - Group acts use plural nouns and plural adjective forms.
  - Solo acts use singular nouns and singular adjective forms.
- Bytenza (KO): `Adj + Noun` using provided attributive forms.
  - Group acts use `ko.p` (group/collective marker included in the noun form).
  - Solo acts use `ko.s` (no group marker).

## ActKind Rules
- `group` uses plural noun forms.
- `solo` uses singular noun forms.
- `groups_formations` is disabled for solo acts (weight = 0).

## Nation-Weighted Selection
Category weights bias selection by nation (default weight = 1):
- Applied independently for adjective and noun category selection.
- Optional overrides per act kind (`group_weights`, `solo_weights`).

## UI Stacking (Bytenza)
When an Act name is Hangul and has a semantic key:
- Korean (Hangul) is primary.
- English is secondary.
- Romanized Hangul is available for debugging and optional tooltips.

## Source Files
- Data: `src/app/game/names/act-name-pools.ts`
- Generator: `src/app/game/names/act-name-generator.ts`
- Renderer: `src/app/game/names/act-name-renderer.ts`
