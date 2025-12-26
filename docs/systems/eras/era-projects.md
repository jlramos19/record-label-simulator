# Era Projects (Web MVP)

## Purpose
Define how releases attach to an Era's project cycle so singles, album tracks, and deluxe additions follow a consistent cadence.

## Core Rules
- Each active Era owns one "main project" (Album or EP) that collects all releases in the Era window.
- Every release prompts a release-type choice: `Single` or `Project track`.
- Singles still attach to the Era's main project; release type only affects pricing/demand logic.
- The main project stays open while the Era has recent release or promo activity within the gap window.
- If there is a gap with no release or promo activity, the Era project closes; the next release starts a new Era.
- When 32 tracks have released into the Era project, the album closes to new standard tracks.
- When the Era enters touring (Legacy stage), the main project locks and a Deluxe window opens.
- Deluxe allows up to 3 additional tracks; after that, new releases start a new Era.

## Gap Window
- The gap window is measured in weeks since the most recent release or promo activity.
- The default threshold is 26 weeks (6 months), aligned with the Era auto-end baseline.

## Touring + Deluxe
- Touring is represented by the Era entering the Legacy stage.
- Deluxe tracks are assigned to a separate deluxe project name for clarity:
  - `${projectName} (Deluxe)`

## Implementation Notes
- Era project name/type is seeded by the first release that opens the project.
- If the first project track is still labeled as a single, the project defaults to Album.
- Deluxe tracking is capped separately from the main project track limit.
