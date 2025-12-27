# Task System (Quest Repurpose)

## Intent
- Quests are now Tasks: short, auto-fulfillable objectives that guide the player toward CEO Requests and endgame milestones.
- Tasks should be curated to advance achievements (not filler).

## Task model (MVP)
- Fields: id, text, story, reward, expReward, progress, target, createdAt, done, rewarded.
- Task-to-achievement alignment: each task declares which CEO Requests it supports (one or more IDs).

## Auto-fulfill button
- Each task includes an "Auto Fulfill" button in the task list.
- The button is enabled when automation criteria are met (cash, capacity, eligible content/acts, timing).
- When clicked, the system performs the minimal automated actions needed to satisfy or advance the task.
- If criteria are not met, disable the button and show a short block reason.
- Do not gray out when criteria are met; avoid false-negative gating.

## Alignment rules
- Task templates should map to CEO Requests categories (chart wins, sales/streams, promos, tours).
- Prefer tasks that move the player toward annual awards and 12-request victory tracking.
- Award show nominations and wins can satisfy or advance tasks when linked to the same CEO Request IDs.
- Project-release tasks count EP/Album releases only; Single albums do not satisfy project task progress.

## Observability
- Log auto-fulfill attempts and outcomes (success, skipped, blocked reason).
- Surface task progress, rewards, and linked CEO Request IDs in the UI.
- Road to the Top > Tasks tab is the primary surface for task status.

## Notes
- Internal data may still use "quest" keys for backward compatibility; UI copy should use "Task".

## Related
- `docs/systems/awards/award-shows.md`
