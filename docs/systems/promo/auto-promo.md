# Auto Promo Budgets

Auto promo uses a fixed percentage of the label wallet cash to fund promo pushes.

## Budget rule
- Budget = wallet cash * auto promo percent (default 5%).
- Auto promo only runs when the computed budget meets the minimum promo spend ($100).
- When multiple promo types are selected, the auto promo budget applies per type and total spend scales with the number of types.
- Promo weeks still scale from budget using the existing 1-4 week rule.

## Timing
- Auto promo checks run during the weekly charts update after promo weeks age.

## Player rules
- Auto promo is toggled in the Promotions view.
- Auto promo uses the track assigned to the Promo Push slot.
- Auto promo skips tracks that are not released, not in an active era, or already in promo weeks.
- Auto promo uses the current promo type selection and respects facility slot limits.

## AI rules
- Rival labels auto promo their most recent released track without active promo weeks.
- AI promo budgets use the same wallet-percentage rule.

## Related
- `docs/systems/promo/broadcast-studios.md`
- `docs/systems/promo/filming-studios.md`
