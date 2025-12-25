# CCC Signing Cash + Failure Handling

## Goal
Ensure CCC signing only deducts cash on successful sign attempts and that failed attempts gray out the sign button until the midnight market refresh.

## Canon Check (What the Docs Say)
- Canon spec lives in `docs/systems/ccc/signing.md`, including acceptance criteria and lockout timing.
- Reference-only GDD notes (`game-development-documents/03-Systems/record-label-simulator-how-to-sign-a-creator-system.md`) describe accept/reconsider/decline outcomes but do not define how creators decide.

## Current Behavior (Baseline)
- Successful sign removes the creator from the CCC market and adds them to the roster with a cash deduction.
- Rejections lock the creator's sign action until the next midnight refresh.
- Precondition failures (insufficient funds, roster full) do not lock out the creator.

## Implementation Plan
1. CCC signing flow (`src/app/game.ts` + `src/app/ui.ts`):
   - Centralize signing in a transaction helper that validates preconditions, resolves accept/reject, and applies state changes.
   - On accept, deduct cash, normalize the creator, move them to the roster, refresh the market pool, and post the signing email + social note (include the signing bonus amount).
   - On reject, set a lockout until the next midnight refresh (no cash deducted).
2. Daily refresh (`src/app/game.ts`):
   - Midnight refresh clears lockouts and rebuilds the market pool.

## Success Criteria
- Successful sign:
  - Label cash decreases by the sign cost.
  - Creator is removed from the CCC list and appears in the roster.
  - Contract email shows the signing bonus amount.
- Rejected sign:
  - Cash is unchanged.
  - The sign button is disabled/gray until the midnight refresh rebuilds the market.
- Precondition failure:
  - Cash is unchanged.
  - The sign button stays enabled after the player resolves the condition.

## Validation Steps (Manual)
1. Force a cash shortfall:
   - Set label cash below the creator's sign cost.
   - Click Sign and confirm cash does not change and the button remains enabled.
2. Confirm a success path:
   - Ensure label cash covers the sign cost.
   - Click Sign and confirm cash decreases by the cost and the creator appears in the roster.
3. Confirm a rejection path:
   - Sign a creator who rejects.
   - Confirm cash does not change and the button disables until the midnight refresh.

## Repeatable Workflow (Learning)
- Add a TODO entry in `docs/TODO.md`.
- Record missing rules in `docs/pending-concepts.md` (acceptance criteria).
- Document the implementation plan in `docs/`.
- Update code, then rebuild `assets/js/dist`.
- Finish with a patch note in `docs/PATCH_NOTES.md`.

## Open Questions
- Decide whether AI labels should pay signing costs or use a separate budget model.
