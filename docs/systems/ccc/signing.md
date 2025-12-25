# CCC Signing (MVP)

## Definitions
- Creators Community Chamber (CCC): A world-owned signing hub where labels browse and attempt to sign Creator IDs.
- Creator ID: A creator card with role, skill, stamina, and theme/mood preferences available for signing.
- Signing attempt: An executed offer that can be accepted or rejected by the Creator.
- Precondition failure: A failed attempt that does not consume a signing attempt (insufficient funds, roster full, or invalid state).
- Wallet (cash balance): `state.label.cash`, the funds available for signing costs.
- Signing cost: A deterministic cost computed from creator role + skill and stored as `creator.signCost`.

## Acceptance Criteria (MVP Rule)
Creators resolve offers instantly using a single acceptance roll:
- Base acceptance chance: 70%.
- +8% if the Creator shares at least one preferred Theme with the label's focus Themes.
- +5% if the Creator shares at least one preferred Mood with the label's focus Moods.
- -8% if Creator skill >= 85.
- +5% if Creator skill <= 60.
- Clamp to the 35% - 90% range.

Accept if `random(0-1) < acceptanceChance`. This same rule applies to player and AI labels.

## MVP Rules
1. Preconditions (no lockout)
   - If wallet cash < signing cost, do not consume the attempt; do not lock out; show "Insufficient funds".
   - If roster capacity is full (max 125 Creator IDs), do not consume the attempt; do not lock out; show "Roster full".
   - If the Creator ID is no longer available or already signed, treat as invalid; do not lock out.
2. Attempt resolution
   - Success (accepted):
     - Deduct signing cost from wallet.
     - Move Creator ID from CCC pool to the signed roster.
     - Log an event and record the signing bonus in the contract email.
   - Rejection:
     - Do not deduct cash.
     - Disable the Sign action for that Creator ID until the next CCC refresh at 12AM.
     - Log a rejection event with the lockout time.
3. Midnight behavior
   - `lockedUntilEpochMs` is computed by `nextMidnightEpochMs(nowEpochMs)` using the game clock (UTC-based).
   - At 12AM, CCC refresh clears all sign lockouts and refreshes the market pool.
