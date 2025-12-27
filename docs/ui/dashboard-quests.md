# Dashboard Quests (Tasks)

Defines the Road to the Top tab that surfaces active quests/tasks aligned to CEO Requests.

## Purpose
- Provide short-term objectives that push toward CEO Requests.
- Show quest progress and rewards at a glance.

## Panel layout
- Summary line: active vs completed count, plus cheater-mode note when paused.
- Quest list: ID, objective text, story, status badge, progress detail, reward line.
- Alignment line: linked CEO Request IDs per quest (supports list).

## Observability
- Empty state when no quests are active.
- Cheater mode disables quest progress and displays the pause notice.

## Related
- `docs/systems/tasks/task-system.md`
- `docs/ui/dashboard-ceo-requests.md`
