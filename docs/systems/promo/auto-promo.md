# Auto Promo Budgets

Auto promo uses a percentage-based allocation of the label wallet cash to fund promo pushes.

## Budget rule
- Allocation is split across up to four auto promo slots (Slot 1-4); each slot has its own budget percent.
- Total allocation across slots must be 100% or less.
- If no slot percentages are set, auto promo falls back to the global auto promo percent (default 5%).
- Budget per slot = wallet cash * slot percent (default 5% on Slot 1).
- The slot budget applies per promo type; total spend scales with the number of selected promo types.
- Auto promo only runs a slot when the computed budget meets the minimum promo spend ($100).
- Promo weeks still scale from budget using the existing 1-4 week rule.

## Timing
- Auto promo checks run during the weekly charts update after promo weeks age.
- Rival husk promos are scheduled into `state.rivalReleaseQueue` and execute on their scheduled hour.

## Player rules
- Auto promo is toggled in the Promotions view.
- Promotions shows the next auto-run window, budget math, and the steps auto promo will take.
- Auto promo uses the Auto Promo slots (up to four) with Act / Project / Track targets.
- Each slot resolves target priority: Track -> Project -> Act (Act-only promos are allowed for active eras).
- Auto promo skips slots with zero allocation, invalid targets, inactive eras, or existing promo weeks.
- Auto promo uses the current promo type selection and respects facility slot limits.

## AI rules
- Rival labels schedule promo events via the husk planner (primary path).
- If no husk promo is scheduled for the upcoming week, rivals may fall back to auto promo on their most recent released track without active promo weeks.
- AI promo budgets use a fixed wallet-percentage rule (default 5% of wallet cash) and ignore player auto promo settings.

## Related
- `docs/systems/promo/broadcast-studios.md`
- `docs/systems/promo/filming-studios.md`
