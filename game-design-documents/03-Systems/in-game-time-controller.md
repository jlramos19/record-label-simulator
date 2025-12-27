# In-Game Time Controller (Web)

## Description
The web app uses a deterministic time controller that advances in-game time on a fixed cadence. One real-time second maps to one in-game hour (configurable) for the MVP simulation loop.

## Features
- Frame-rate independent updates (time loop is not tied to rendering).
- Real-time to in-game time conversion (default: 1s = 1 in-game hour).
- Event-driven hooks for weekly charts and yearly population refresh.
- Configurable start date for the simulation calendar.

## Implementation Notes
- Use a single timer loop (setInterval) to advance ticks.
- Emit events into the event log on hour/day/week boundaries.
- UI renders the hour-level timestamp; finer-grain timing is internal only.

## Configuration
- Tick rate and time scale are defined in the time module.
- Pausing stops the loop; fast/skip modes advance by batching ticks.
