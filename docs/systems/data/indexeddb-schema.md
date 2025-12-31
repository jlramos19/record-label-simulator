# IndexedDB Schema (Web MVP)

## Intent
Define the IndexedDB physical schema used by the web client for append-only logs and materialized views. The schema complements localStorage save slots and is optimized for indexed queries.

## Database
- Name: `record-label-simulator`
- Version: `1`

## Stores

### event_log (append-only)
- Key path: `event_id`
- Indexes:
  - `by_occurred_at_hour` -> `occurred_at_hour`
  - `by_entity` -> [`entity_type`, `entity_id`]
  - `by_event_type` -> `event_type`

### release_production_view (materialized)
- Key path: `release_id`
- Indexes:
  - `by_current_step` -> `current_step`
  - `by_overall_risk` -> `overall_risk`
  - `by_eta_hour` -> `eta_hour`

### kpi_snapshot (materialized)
- Key path: `snapshot_id`
- Indexes:
  - `by_entity_kpi` -> [`entity_type`, `entity_id`, `kpi_type`]
  - `by_calculated_at_hour` -> `calculated_at_hour`

## Manual check
In a browser console, run:
```js
import("/assets/js/dist/app/db.js").then((db) => db.verifyIndexedDbSchema().then(console.log));
```
Confirm the result shows `ok: true` and no missing stores or indexes.
