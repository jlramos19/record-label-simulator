# Dashboard CEO Requests

Defines the Dashboard focus tab that surfaces CEO Requests (achievements) and the rival race.

## Placement
- Lives inside the Road to the Top panel alongside the Charts, Tasks, Requests, and Eras tabs.
- Road to the Top tabs stay pinned at the top of the panel so focus switching is always visible while scrolling.

## Purpose
- Keep the player aware of achievement progress without leaving the Dashboard.
- Show how rival labels are performing against the same CEO Requests.
- Reinforce the long-horizon competition loop through year 3000.

## Panel layout
- Summary line: player unlock count vs target, plus notes for bailout-used runs (leaderboards) or cheater mode.
- Request list: each CEO Request with progress text (Wins 0/1, then WON / WON xN) and EXP reward.
- Label race list: each label (player + rivals) with a total progress bar and focus line.
- Expandable details: clicking a label reveals all 12 Requests with per-request progress bars.

## Observability
- Empty states when no requests are available.
- Bailout notices remind players that achievements keep tracking while wins are flagged for leaderboards.
- Cheater mode notices clarify achievements and tasks pause while active.

## Related
- `docs/systems/ai/rollout-husks.md` (rollout plan library + rival planning)
