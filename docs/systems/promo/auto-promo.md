# Auto Promo Budgets

Auto promo uses a fixed percentage of the label wallet cash to fund promo pushes.

## Budget rule
- Budget = wallet cash * auto promo percent (default 5%).
- Auto promo only runs when the computed budget meets the minimum promo spend ($100).
- When multiple promo types are selected, the auto promo budget applies per type and total spend scales with the number of types.
- Promo weeks still scale from budget using the existing 1-4 week rule.

## Timing
- Auto promo checks run during the weekly charts update after promo weeks age.
- Rival husk promos are scheduled into `state.rivalReleaseQueue` and execute on their scheduled hour.

## Player rules
- Auto promo is toggled in the Promotions view.
- Auto promo uses the track assigned to the Promo Push slot.
- Auto promo derives the Act from the selected Track; Act-only promos are manual.
- Auto promo skips tracks that are not released, not in an active era, or already in promo weeks.
- Auto promo uses the current promo type selection and respects facility slot limits.

## AI rules
- Rival labels schedule promo events via the husk planner (primary path).
- If no husk promo is scheduled for the upcoming week, rivals may fall back to auto promo on their most recent released track without active promo weeks.
- AI promo budgets use a fixed wallet-percentage rule (independent of player settings).

## Related
- `docs/systems/promo/broadcast-studios.md`
- `docs/systems/promo/filming-studios.md`
