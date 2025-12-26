# Music Executive Action Buttons

Defines the action button surface for the CEO/Music Executive role.

## Status
- Spec only; UI surface not implemented yet.
- Data source is `ROLE_ACTIONS` in `src/app/game/config.ts` (CEO -> Music Executive).

## Placement
- Dashboard > Overview panel.
- Insert a new section labeled "Executive Actions" beneath the stats grid and above Quick Actions.

## Button set + copy
Use a compact grid of buttons with a status badge on each button.

- Negotiate Contracts (Simulated)
  - Detail: Contracts with Creators; auto-resolves on sign.
- Sign Creators (Live)
  - Detail: Open CCC to sign new Creator IDs.
- Form Acts (Live)
  - Detail: Open Harmony Hub to create or edit Acts.
- Place IDs (Live)
  - Detail: Open Create view to place Creator IDs in track slots.
- Schedule Release (Live)
  - Detail: Open Release > Release Desk to schedule drops.
- Conduct Era (Live)
  - Detail: Open Eras > Era Desk to launch/manage an Era.
- Plan Tours (Placeholder)
  - Detail: Touring Desk (planned).
- Terminate Contract (Placeholder)
  - Detail: Contract termination (planned).
- Lease Studios (Placeholder)
  - Detail: Studio leasing/structures (planned).

## Status behavior
- Live: enabled button, routes to the target view and focuses the relevant panel.
- Simulated: disabled styling + badge; clicking shows "Not live yet" note and logs UI event (no navigation).
- Placeholder: disabled styling + badge; clicking shows "Planned" note and logs UI event (no navigation).

## Observability
- Clicking any action logs a UI event with `actionVerb`, `status`, and `routeTarget`.
- If Live action is blocked (missing prerequisites), show a warning toast and log a reason code.

## Related
- `docs/ui/touring-tab.md`
- `docs/ui/promotions-tab.md`
