# Scripts Formatting in Record Label Simulator Web Project

## Purpose
Establish consistent formatting for TypeScript modules in this web app.

## Structure
- File header: brief purpose comment if needed.
- Exported types first (interfaces, enums).
- Pure functions before DOM wiring.
- Avoid deep nesting; prefer helpers.

## Logging
- Use structured log entries for actions and outcomes.
- Avoid console spam in production builds.
