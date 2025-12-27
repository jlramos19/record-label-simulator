# Audience Chunks (Web MVP)

## Purpose
- Keep audience chunk age groups aligned with GDD 4-year cycles.
- Provide the age-group distribution used for population snapshots and creator ages.

## Current implementation
- `src/app/game.ts` defines 30 age groups (0-3 ... 116-119) in 4-year spans.
- `computePopulationSnapshot()` includes age groups for global and per-nation totals.
- Touring demand uses rotating age-group segments as a baseline interest modifier.

## Creator ID link
- Creator IDs are seeded from the audience age-group distribution.
- Creators are 20+; ages clamp to 20-119.
- Portrait matching maps ages into the Creator portrait bins (20-23 ... 76-120).

## Notes
- Audience chunks remain aggregate distributions; per-1,000 chunk entities are deferred.
