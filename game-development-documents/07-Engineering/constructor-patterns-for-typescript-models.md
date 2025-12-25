# Constructor Patterns for TypeScript Models

Use simple factory functions for simulation entities so they stay serializable.

## Core Constructors (Factories)

1. Record Label
   - Represents the player or AI label.
   - Holds cash, alignment, roster, and strategy state.

2. Community
   - Represents an audience chunk with preferences and budgets.
   - Drives engagement and chart outcomes.

3. Content
   - Represents any music output (Track or Project).
   - Stores theme, mood, quality, and release state.

4. Event (Calendar)
   - Represents a scheduled action (release, promotion, or production step).
   - Drives time-based execution.

## Example Factory

```ts
export const createRecordLabel = (id: string, name: string) => ({
  id,
  name,
  cash: 0,
  roster: [],
  alignment: 'neutral',
});
```

Factories keep the simulation data-driven and easy to persist.
