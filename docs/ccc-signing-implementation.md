# CCC Signing Cash + Failure Handling

## Goal
Ensure CCC signing only deducts cash on successful sign attempts and that failed attempts gray out the sign button until the midnight market refresh.

## Canon Check (What the Docs Say)
- `docs/` has no explicit creator acceptance criteria for signing offers.
- Reference-only GDD notes (`Game Development Documents/03-Systems/Record Label Simulator How To Sign a Creator System.md`) describe accept/reconsider/decline outcomes but do not define how creators decide.

## Current Behavior (Baseline)
- Successful sign removes the creator from the CCC market and adds them to the roster.
- Failed sign due to insufficient cash sets a daily failure flag; the CCC market refresh at midnight rebuilds the pool.

## Implementation Plan
1. CCC signing flow (`src/app/ui.ts`):
   - Calculate sign cost and confirm the attempt is not already on a same-day cooldown.
   - If insufficient cash, mark the creator as failed for the day, log the reason, and re-render the CCC list (button disabled/gray).
   - If accepted, deduct cash, normalize the creator, move them to the roster, refresh the market pool, and post the signing email + social note (include the signing bonus amount).
2. Daily refresh (`src/app/game.ts`):
   - Midnight refresh rebuilds the market, clearing the failed-day marker naturally.

## Success Criteria
- Successful sign:
  - Label cash decreases by the sign cost.
  - Creator is removed from the CCC list and appears in the roster.
  - Contract email shows the signing bonus amount.
- Failed sign:
  - Cash is unchanged.
  - The sign button is disabled/gray until the midnight refresh rebuilds the market.

## Validation Steps (Manual)
1. Force a cash shortfall:
   - Set label cash below the creator's sign cost.
   - Click Sign and confirm the CCC button disables and cash does not change.
2. Confirm a success path:
   - Ensure label cash covers the sign cost.
   - Click Sign and confirm cash decreases by the cost and the creator appears in the roster.

## Repeatable Workflow (Learning)
- Add a TODO entry in `docs/TODO.md`.
- Record missing rules in `docs/pending-concepts.md` (acceptance criteria).
- Document the implementation plan in `docs/`.
- Update code, then rebuild `assets/js/dist`.
- Finish with a patch note in `docs/PATCH_NOTES.md`.

## Open Questions
- Define creator acceptance criteria (accept/reconsider/decline) for player and AI labels.
- Decide whether AI labels should pay signing costs or use a separate budget model.
