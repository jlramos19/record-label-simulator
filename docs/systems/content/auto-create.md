# Auto Create Content

Auto Create lets the player schedule automatic sheet music creation on a weekly cadence using budget and cash reserve rules.

## Toggle + cadence
- Enabled in the Create view.
- Runs during the weekly charts update after economy processing.

## Budget + gates
- Budget cap = wallet cash * auto-create percent.
- Minimum cash reserve blocks spending below the reserve.
- Max tracks per run caps the number of sheet music starts.
- Skips if no studio slots are available, no eligible Songwriter is ready, or the stage cost exceeds the budget cap.

## Selection rules
- Uses the top trend theme and mood recommendation.
- Uses overuse-safe creator picks (stamina ready, below daily limit, and not busy).
- Mode:
  - Solo: assign Songwriter only; Performer/Producer remain unassigned.
  - Collab: fills recommended Performer/Producer when available.
- Acts remain unassigned so Release Desk planning stays manual.
- Project type and modifier follow the recommendation engine; titles auto-generate when empty.

## Observability
- Create view shows the next run window, budget math, and the last auto-create outcome.
- Auto create logs a summary each run or skip with the reason.
