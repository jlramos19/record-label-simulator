# CCC Signing (MVP)

## Definitions
- Creators Community Chamber (CCC): A world-owned signing hub where labels browse and attempt to sign Creator IDs.
- Creator ID: A creator card with role, skill (level + EXP), stamina, catharsis (skill + stamina), and theme/mood preferences available for signing.
- Signing attempt: An executed offer that can be accepted or rejected by the Creator.
- Precondition failure: A failed attempt that does not consume a signing attempt (insufficient funds, roster full, or invalid state).
- Wallet (cash balance): `state.label.cash`, the funds available for signing costs.
- Signing cost: A deterministic cost computed from creator role + skill + market pressure and stored as `creator.signCost`.
- Skill: A persistent stat for prestige gates (venues, broadcasts) plus quality, signing cost, and acceptance logic.

## CCC Market View
- CCC pool persists until the next 12AM refresh or a manual refresh action.
- Filters: role, preferred Theme, preferred Mood.
- Sorting: preferred Theme/Mood (A-Z or Z-A) and quality (creator skill, hidden on cards) high/low.
- Locked (rejected) creators are sorted to the bottom of the CCC list within the active sort mode.
- Sign buttons disable when wallet cash is short and show "(not enough money)" in the label.
- Creator cards reserve a fixed 2:3 portrait placeholder for head-and-shoulders art.

## Retention + lifecycle
- Daily CCC refreshes despawn unsigned creators who have no signed-release or promo history (disposable pool).
- Previously signed creators with release or promo history remain in the CCC when unsigned, preserving their IDs.
- Unsigned creators continue aging yearly and can retire; IDs are memorialized at age 120.

## Catharsis (CCC)
- Catharsis is derived from skill and current stamina; higher skill keeps the catharsis floor higher even when stamina is low.
- Stamina still governs speed/throughput checks; catharsis weights content quality and modifiers.
- Signed creators can accrue an inactivity catharsis debuff (after 6 in-game months idle); it reduces catharsis only (skill stays 1-100) and recovers linearly over 14 days after the creator is used.
- Unsigned CCC creators never receive the inactivity catharsis debuff.

## Skill progression (signed roster)
- Skill rises from completed production stages plus a small, uncapped gain from promo runs and tour dates (based on stamina spent).

## Unsigned creator skill levels (CCC)
- Unsigned creators spawn with skill levels capped at 5 and weighted toward lower levels.
- Default weights: Level 1 30%, Level 2 25%, Level 3 20%, Level 4 15%, Level 5 10%.

## Acceptance Criteria (MVP Rule)
Creators resolve offers instantly using a single acceptance roll:
- Base acceptance chance: 70%.
- +8% if the Creator shares at least one preferred Theme with the label's focus Themes.
- +5% if the Creator shares at least one preferred Mood with the label's focus Moods.
- -8% if Creator skill >= 85.
- +5% if Creator skill <= 60.
- Market pressure adjusts acceptance (scarcity lowers acceptance; oversupply raises it).
- Clamp to the 35% - 90% range.

Accept if `random(0-1) < acceptanceChance`. This same rule applies to player and AI labels.

## Decline Feedback (MVP Rule)
If a Creator rejects the offer, the engine selects one or two decline drivers and surfaces them to the player:
- Focus mismatch: label focus Themes/Moods do not overlap the Creator preferences (or label focus is unset).
- High expectations: Creator skill >= 85.
- Hot market: role scarcity or market heat drives a negative acceptance delta.

The primary driver is stored on the CCC lockout record, logged to the system feed, and shown under the locked Sign button.

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
