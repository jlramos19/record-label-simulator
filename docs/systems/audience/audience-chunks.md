# Audience Chunks (MVP)

Audience chunks are the simulated, 1,000-member units that represent the player-facing audience in Record Label Simulator. They are derived from the GDD chunk model but kept lightweight for the web MVP.

## Chunk Properties
- `id`: Unique chunk identifier.
- `nation`: Current location (Annglora, Bytenza, Crowlya).
- `age`: Current age in years.
- `ageGroup`: 4-year age bin label (ex: `20-23`).
- `generation`: 16-year generation label (ex: `32-47`).
- `weeklyBudget`: Weekly music spend (hidden from player).
- `engagementRate`: Likelihood to respond to promotions (hidden from player).
- `timeProfile`: Diurnal or nocturnal active hours (MVP: 6AM-6PM vs 6PM-6AM).
- `lifeExpectancy`: 4-year bracket that sets the chunk retirement window.
- `reproductionRate`: 0-4 scale that determines the chance of preference drift.
- `emigrationRate`: Chance to relocate to another nation on yearly ticks.
- `prefThemes` (2), `prefMoods` (2), `prefGenres` (4 combos): Preference set that defines the chunk's community.
- `communityId`: Primary genre community (theme + mood).
- `size`: Always 1000 members (simulation unit size).

## Evolution Rules
- Each in-game year: age increments by 1.
- Every 4 years: budget and engagement drift, time profile may flip, and preference drift can occur (1 theme, 1 mood, 1 genre swap).
- If age exceeds `lifeExpectancy.max`, the chunk retires and a new chunk is spawned to keep the sample stable.
- Emigration checks run yearly to keep national mixes evolving.

## Dashboard Surface
The Dashboard includes an Audience Chunks panel that summarizes the sample size, refresh year, and a rotating list of chunk cards (location, age group, generation, budget, engagement, active hours, and preferences).

## Cheater Tools
When Cheater Mode is enabled, the Community view exposes a CCC injection helper that can spawn specific Creator IDs into the market pool for portrait testing.
