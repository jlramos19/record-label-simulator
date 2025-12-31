# Track Rollout Strategies (Web MVP)

## Intent
Track rollout strategies define per-track promo weighting and launch toggles. Players choose from a global template library (premade + player-saved) and can save unique strategies back into the global pool.

## Data Model (IndexedDB)

### rollout_strategy_templates
- `template_id` (string, primary key)
- `name` (string, focus-only)
- `primary_focus` (`interviews` | `live` | `eyeriSocial` | `tour` | `musicVideo`)
- `secondary_focus` (same enum or null, cannot equal primary)
- `weights_json` (object: interviews/live/eyeriSocial/tour, sum = 100)
- `toggles_json` (object: musicVideoOn/tourTieInOn/primeTimeLiveOn/isSingle)
- `created_source` (`premade` | `player_saved`)
- `fingerprint` (string, globally unique)
- `created_at_ts` (number)

### track_rollout_instances
- `instance_id` (string, primary key)
- `track_id` (string, unique)
- `template_id` (string or null)
- `primary_focus` (enum)
- `secondary_focus` (enum or null)
- `weights_json` (object, sum = 100)
- `toggles_json` (object)
- `status` (`draft` | `active` | `completed`)
- `updated_at_ts` (number)

## Focus + Naming
- Focuses are stored explicitly on templates/instances.
- If focuses are not pinned, derive from weights:
  - primary = max(weights)
  - secondary = second-highest if `second >= 25` and `(primary - second) <= 15`, else null
- Name format:
  - `{PrimaryLabel} focus`
  - `{PrimaryLabel} + {SecondaryLabel} focus`
- Labels:
  - Interviews
  - Live performance
  - eyeriSocial
  - Tour
  - Music video

## Weights + 5-Point Bucketing
For uniqueness, bucket weights into 5-point increments and renormalize to 100.

Algorithm:
1) Clamp each weight to [0, 100].
2) Round each to nearest 5.
3) Renormalize to sum = 100:
   - If sum == 0: default to 25/25/25/25.
   - Else:
     a) scale each by (100 / sum)
     b) round to nearest integer
     c) fix remainder with largest-remainder method, tie-breaking by channel order:
        order = [interviews, live, eyeriSocial, tour]

## Fingerprint (Canonical)
```
p={primary};s={secondary|none}|w=i:{I},l:{L},s:{S},t:{T}|t=video:{0|1},tour:{0|1},prime:{0|1},single:{0|1}
```
Weights use the bucketed/renormalized values.

## Premade Templates
- Source: `/data/rollout_premades.json`
- Loaded on boot and upserted by fingerprint.
- `created_source` is set to `premade`.
- Format:
  - `weights` (object)
  - `toggles` (object)
  - Optional: `primary_focus`, `secondary_focus` to pin focuses

## UI Behavior (Release Desk)
- Strategy Picker lists all templates by name with toggle tags only.
- Details panel shows:
  - Focuses (primary/secondary)
  - Weight sliders (0..100) with live sum preview
  - Toggle checkboxes
  - Apply to Track
  - Save as Global Template (shown when settings differ or no template selected)
- Save-if-unique:
  - If fingerprint exists, show "Already exists: {name}" and offer "Use existing template".
  - If unique, create a new global template and return it immediately to the picker.

## Event Log Verbs (Append-only)
- `ROLLOUT_TEMPLATE_CREATE_GLOBAL` { template_id, fingerprint, created_source }
- `TRACK_ROLLOUT_APPLY_TEMPLATE` { track_id, template_id }
- `TRACK_ROLLOUT_SET_WEIGHTS` { track_id, weights }
- `TRACK_ROLLOUT_SET_TOGGLES` { track_id, toggles }
- `TRACK_ROLLOUT_SAVE_GLOBAL` { track_id, template_id, fingerprint }
