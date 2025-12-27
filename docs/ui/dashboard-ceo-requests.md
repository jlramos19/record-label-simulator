# Dashboard CEO Requests

Defines the Dashboard focus tab that surfaces CEO Requests (achievements) and the rival race.

## Placement
- Lives inside the Road to the Top panel alongside the Charts, Tasks, Requests, and Eras tabs.

## Purpose
- Keep the player aware of achievement progress without leaving the Dashboard.
- Show how rival labels are performing against the same CEO Requests.
- Reinforce the long-horizon competition loop through year 3000.

## Panel layout
- Summary line: player unlock count vs target, plus notes for bailout lock or cheater mode.
- Request list: each CEO Request with progress text and EXP reward.
- Label race list: each label (player + rivals) with a total progress bar and focus line.
- Expandable details: clicking a label reveals all 12 Requests with per-request progress bars.

## Observability
- Empty states when no requests are available.
- Achievement lock notices display when bailout is used or cheater mode pauses progress.

## Related
- `docs/systems/ai/rollout-husks.md`
