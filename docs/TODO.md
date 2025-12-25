# TODO

- [ ] RLS-AI-HUSK-001: Replace rival planning with husk-library decision trees and scheduled releases/promos (no player targeting).
- [ ] RLS-AI-COMPETE-001: Guarantee at least one rival in competitive rollout mode per planning cycle, with deterministic selection and budget gates.
- [ ] RLS-PROMO-AUTO-001: Define auto promo wallet-percentage budgeting for player + rivals and document the rule.
- [ ] RLS-OPS-LIVEEDIT-001: Define live-edit guardrails, release patch stamping, and cache/version rules for hosted builds.
- [ ] RLS-PROMO-LOGS-001: Remove Loss Archives and Debug Bundle panels from Promotions view; keep internal logging for balance review.
- [ ] RLS-CALENDAR-PROJ-001: Add the Calendar projection view (Releases -> Calendar), merge the Eras calendar panel, and keep scheduling data backward compatible.
- [ ] RLS-ERA-ROLLOUT-001: Implement rollout strategies (data model + Era planning + calendar expansion + auto-run + era completion husk).
- [ ] RLS-DOC-PATCH-001: Cross-link new docs, update testing checklist, and add consolidated patch note summary.
- [ ] RLS-ECONOMY-COSTS-001: Balance sheet/demo/master costs with quality scaling, creator supply-demand pressure, and skill progression/decay.
- [ ] RLS-ERA-FOCUS-001: Define Focus Era purpose, mechanics, and UX guardrails for quick decisions.
- [ ] Update chart metrics to use regional consumption weights and refresh chart documentation.
- [ ] RLS-UI-ACTIONS-001: Specify the Music Executive action buttons surface (panel/section), button copy, and status behavior (Live vs Simulated vs Placeholder).
- [ ] RLS-UI-ACTIONS-002: Create an action registry mapping verbs -> route/panel target + tooltip + status; align with `ROLE_ACTIONS` in `src/app/game.ts`.
- [ ] RLS-UI-ACTIONS-003: Render Music Executive action buttons with status badges and disabled states for simulated/placeholder actions.
- [ ] RLS-UI-ACTIONS-004: Wire live action buttons to navigation + focus behavior (CCC sign, Harmony Hub form, slot placement, Release Desk scheduling, Era Desk conduct, Calendar tours) and log UI events.
- [ ] RLS-UI-ACTIONS-005: Add a "not live yet" modal or toast for simulated/placeholder actions with the current behavior note (ex: negotiate auto-resolves on sign).
- [ ] RLS-UI-TRACK-HISTORY-001: Add an Eras tracks panel chart history table with DNC for non-charting weeks.
- [ ] RLS-UI-COMMUNITY-RANKINGS-001: Align Community rankings to show Top 8/Top 40 toggles for labels and trends, with a full-list "More" action on #1.
- [ ] Quarter-hour ticks: show stamina depletion + recharge every in-game hour across UI surfaces.
- [ ] Producer overuse: add observability (why overused; when overuse strikes happen; when/why departure triggers).
- [ ] Fix Producer overuse sensitivity: prevent accidental overuse via recommendations/auto-assign; ensure overuse/strikes are computed correctly and not double-counted.

Note: Items stay here until you confirm they are fulfilled.
