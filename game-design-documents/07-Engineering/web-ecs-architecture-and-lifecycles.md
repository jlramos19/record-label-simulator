# Web ECS Architecture and Lifecycles

## Overview
In the web app, gameplay entities (Acts, Creators, Tracks, Studios, Audience Chunks) are stored as data records. Systems operate on these records in deterministic updates.

## Entity Records
- Act, Creator, Track, Project, Studio, AudienceChunk, Trend, Era.
- Each record is keyed by a stable ID and stored in arrays/maps in the app state.

## Component-Like Fields
- Instead of engine components, each record carries component data as fields:
  - alignment, stamina, quality, status, timestamps, metrics.

## System Flow
- Time tick updates cadence (weekly charts, 4-week population refresh).
- Systems read/write state and emit event log entries.
- UI views render a slice of state for the active route.

## Lifecycles
- Create -> Active -> Archived patterns are modeled by status fields.
- Deactivation is a state change, not a scene object removal.
