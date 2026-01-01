# Dashboard Tasks

Defines the Road to the Top tab that surfaces active tasks aligned to CEO Requests.

## Purpose
- Provide short-term objectives that push toward CEO Requests.
- Show task progress and rewards at a glance.
- Refresh tasks once per day at 12AM UTC; other events only update progress.

## Panel layout
- Summary line: active vs completed count, plus cheater-mode note when paused.
- Task list: ID, objective text, story, status badge, progress detail, reward line.
- Alignment line: linked CEO Request IDs per task (supports list).
- Task actions: Auto Fulfill button per task, enabled only when criteria are met and showing a short block reason when disabled.

## Observability
- Empty state when no tasks are active.
- Cheater mode disables task progress and displays the pause notice.

## Related
- `docs/systems/tasks/task-system.md`
- `docs/ui/dashboard-ceo-requests.md`
