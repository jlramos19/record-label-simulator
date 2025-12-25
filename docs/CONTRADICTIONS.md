# Contradictions Log

This file tracks known mismatches between the current web MVP implementation and the Drive GDD/UI specs.

## UI Structure

- Top Bar trends: Resolved in web UI (trend summary added to header). (Spec: `Game Development Documents/02-UI/Record Label Simulator - UI and UX Design System.md`)
- Left/right panel architecture: The UI Design System expects a persistent left-side panel set (Areas/Creators/Acts/Inventory/Items/Modifiers/Collabs) and right-side Calendar/Quests panels. Current view router uses route-specific panels instead of fixed left/right columns. (Spec: `Game Development Documents/02-UI/Record Label Simulator - UI and UX Design System.md`)

## Visual Identity

- Mood identity: The UI Design System requires moods to be icon-coded first. Current UI uses text-only mood labels/selects with no mood icons. (Spec: `Game Development Documents/02-UI/Record Label Simulator - UI and UX Design System.md`)

## Entries

### 2025-12-24-reorg-01
- Area/system: Population splits (Campaign Era)
- Statement A: Fixed Campaign Era percentages were previously shown as exact values (Annglora 52.5%, Bytenza 33.3%, Crowlya 14.2%).
- Statement B: JL directive requires variable ranges per Campaign Era (target + variance; ranges shown in UI).
- Why it matters: Split variability affects population totals, chart pools, and balance assumptions in the economy/trends loop.
- Source A: prior UI/notes using fixed constants (pre-change display in `index.html`).
- Source B: JL directive (chat) + `Game Development Documents/03-Systems/RLS Population Evolution.md` (variable ranges).
- Observed in code/UI: UI now shows approximate ranges; sim stores target + variance and persists realized split per era.
- Proposed resolution options:
  - A) Keep default variance at +/-5 percentage points (current implementation).

  - C) Use a dynamic variance tied to era difficulty or alignment.
- Question for JL: Which variance width should be canonical for Campaign Era splits (A/B/C)? A and C
- Phase: Answered .

### 2025-12-24-reorg-02
- Area/system: Population cadence
- Statement A: Legacy mirror docs described 4-year population reevaluations.
- Statement B: JL directive sets population updates to yearly (once per in-game year).
- Why it matters: Cadence changes the rate of demographic shifts and any systems that depend on population refresh.
- Source A: `Game Development Documents/03-Systems/Commentary on the Revised Population Dynamics Document.md` + `Game Development Documents/02-UI/Global Demographic Evolution- Growth and Control Guidelines.md`.
- Source B: JL directive + `Game Development Documents/03-Systems/RLS Population Evolution.md`.
- Observed in code/UI: UI and simulation use yearly cadence.
- Proposed resolution options:
  - A) Update all population cadence docs to yearly cadence.

- Question for JL: Confirm yearly cadence is canonical across population docs (A).
- Phase: Answered and documented.

### 2025-12-24-web-01
- Area/system: Engine assumptions across GDD (Unity vs Web app)
- Statement A: Multiple GDD files describe Unity-specific implementation (Unity 6, GameObjects, MonoBehaviour, ScriptableObject, Prefabs, NavMesh, Unity services).
- Statement B: JL directive: convert all Unity references to web application concepts (this project is web, not Unity).
- Why it matters: Engine assumptions affect architecture, data flow, tooling, and UI terminology; mixing Unity and web guidance causes implementation drift.
- Source A: Examples in `Game Development Documents/07-Engineering/*`, `Game Development Documents/03-Systems/In-Game Time Controller.md`, and other Unity-referenced docs (43 files flagged by scan).
- Source B: JL directive in chat (convert Unity references to web).
- Observed in code/UI: Web app uses TypeScript + static hosting; no Unity engine present.
- Proposed resolution options:
  - A) Rewrite Unity-specific sections to web equivalents and move legacy Unity-only docs into `99-Archive` with a legacy note.
  - B) Keep Unity references but add a top-level disclaimer in each doc that they are legacy/not applicable to web.
  - C) Delete Unity-specific docs and replace with concise web architecture equivalents.
- JL decision: C) Delete Unity-specific docs and replace with concise web architecture docs.
- Phase: Answered but undocumented.

### 2025-12-24-seeding-01
- Date/commit/task: 2025-12-24 / GDD reorg + seeding rule update
- Area/system: Pre-game simulation seeding cadence (2025-2400)
- Source A: `Game Development Documents/03-Systems/Record Label Simulator - Simulation Timeline and Milestones.md` + `Game Development Documents/03-Systems/Time Progression System for Record Label Simulator.md` describe a continuous pre-game simulation from 2025 to 2400.
- Source B: JL directive (chat): 2025-2200 is fixed/grounded history; 2200-2400 is unique per seed (variable), to reduce compute and ensure deterministic early history.
- Observed in code/UI: Web seed now uses 2025-2200 deterministic baseline and 2200-2400 seeded variance; history is exported in debug bundle.
- Proposed resolution options:
  - A) Update docs to state 2025-2200 fixed baseline + 2200-2400 unique per seed (JL directive).
  - B) Keep variability across 2025-2400 but add a deterministic "baseline" layer (not requested).
- Question for JL: Confirm that 2025-2200 must be fully deterministic across all runs, with 2200-2400 as the only unique seed window (Option A)?
- Phase: Answered and documented.

### 2025-12-24-era-concurrency-01
- Area/system: Era management + calendar
- Statement A: Calendar module and UI expectations imply a single active Era at a time, with a singular Era calendar.
- Statement B: JL directive: overlapping Eras across Acts are supported; one Act can participate in multiple concurrent Eras; scheduling or releasing a Track auto-starts an Era; Calendar includes an Eras tab.
- Why it matters: Era concurrency changes how releases map to Era cycles and how the Calendar surfaces current planning.
- Source A: `Game Development Documents/03-Systems/Calendar Module in Record Label Simulator video.md` (single Era note).
- Source B: JL directive (chat).
- Observed in code/UI: Multi-era state and Era tab added; releases auto-start Eras.
- Proposed resolution options:
  - A) Update Era and Calendar docs to allow concurrent Eras and include Era calendar tab (JL directive).
- Phase: Documented.

### 2025-12-24-eyerisocial-promo-01
- Area/system: UI navigation + promotions comms
- Statement A: UI had a Logs/Debug tab separate from Promotion, with generic "Post Template" wording.
- Statement B: JL directive: Logs are rebranded as eyeriSocial, which is the promotion-facing social channel; scheduling is internal until posted.
- Why it matters: Players need a clear channel for public announcements distinct from internal logs.
- Source A: `Game Development Documents/02-UI/UI Elements displayed on screen of the Record Label Simulator Video Game Application.md` (Logs/Promotion views).
- Source B: JL directive (chat).
- Observed in code/UI: Logs renamed to eyeriSocial, post UI reworded to publish updates, and templates include release announcements.
- Proposed resolution options:
  - A) Treat eyeriSocial as the public promotions channel; keep internal logs behind a toggle (JL directive).
- Phase: Documented.

### 2025-12-24-bailout-choice-01
- Area/system: Win/loss conditions
- Statement A: Bailout auto-triggers at first bankruptcy.
- Statement B: JL directive: Bailout is an option; declining immediately ends the game; accepting locks achievements.
- Why it matters: The choice affects difficulty and player agency during failure.
- Source A: `Game Development Documents/99-Archive/Winning and Losing Conditions in Record Label Simulator.md`.
- Source B: JL directive (chat).
- Observed in code/UI: Bailout offer modal added; accept/decline flow implemented.
- Proposed resolution options:
  - A) Offer bailout as a decision point (JL directive).
- Phase: Documented.

### 2025-12-24-economy-pricing-01
- Date/commit/task: 2025-12-24 / Economy doc reorg
- Area/system: Pricing tables (track counts and format thresholds)
- Source A: `Game Development Documents/03-Systems/Economy/Pricing/Economy - Track and Project Pricing Table.md` + `Game Development Documents/03-Systems/Economy/Pricing/Economy - Pricing Models (Further Refined).md` define EP as 4-7 tracks with a $4.99 starting point and LP as 8-30 tracks with a $8.99 starting point.
- Source B: `Game Development Documents/03-Systems/Economy/Pricing/Economy - Pricing and Track Limits by Format.md` defines Single as 1-4 tracks with a $0.69 starting point and LP as 8 tracks at $6.99.
- Observed in code/UI: Not implemented; docs only.
- Proposed resolution options:
  - A) Use the EP/LP thresholds and price baselines from the Track/Project Pricing Table and Pricing Models doc.
  - B) Use the thresholds and baselines from the Pricing and Track Limits doc (Single 1-4 tracks, LP 8 tracks at $6.99).
- Question for JL: Which pricing table and track-count thresholds are canonical for digital projects (A or B)?
- Phase: Unanswered

### 2025-12-24-economy-pricing-02
- Date/commit/task: 2025-12-24 / Economy doc reorg
- Area/system: Vinyl pricing baselines
- Source A: `Game Development Documents/03-Systems/Economy/Pricing/Economy - Track and Project Pricing Table.md` lists vinyl Side A at $9.99 (up to Side D at $24.99).
- Source B: `Game Development Documents/03-Systems/Economy/Pricing/Economy - Pricing and Track Limits by Format.md` and `Game Development Documents/03-Systems/Economy/Pricing/Economy - Pricing Models (Further Refined).md` reference vinyl Side A at $24.99 and higher tiers.
- Observed in code/UI: Not implemented; docs only.
- Proposed resolution options:
  - A) Use the lower vinyl pricing tier ($9.99 to $24.99).
  - B) Use the higher vinyl pricing tier ($24.99 to $39.99).
- Question for JL: Which vinyl pricing tier is canonical (A or B)?
- Phase: Unanswered

### 2025-12-24-menu-reorg-01
- Area/system: UI navigation + panel placement
- Statement A: UI docs list Campaigns as a top-level view and imply Calendar lives outside Era management, with Create Track available alongside Charts.
- Statement B: JL directive: Create Content is a dedicated nav view; Campaigns view is repurposed into Eras/Calendar; internal schedule lives in Eras; eyeriSocial is the live world feed with optional internal logs.
- Why it matters: Menu clarity affects era execution flow and the separation between internal scheduling and public announcements.
- Source A: `Game Development Documents/02-UI/UI Elements displayed on screen of the Record Label Simulator Video Game Application.md`.
- Source B: JL directive (chat).
- Observed in code/UI: Create Content is exclusive to the Create view; Eras view hosts Era Desk + Calendar + Campaigns; eyeriSocial defaults to public feed with an internal toggle.
- Proposed resolution options:
  - A) Update UI docs and task map to reflect new view responsibilities (JL directive).
- Phase: Documented.

### 2025-12-24-harmony-hub-acts-01
- Area/system: Harmony Hub role
- Statement A: UI docs described Harmony Hub as owned spaces/tools/collabs.
- Statement B: JL directive: Harmony Hub is reserved for forming/managing Acts with Creator IDs and showing Era participation.
- Why it matters: Act formation and Era oversight need a single, predictable home.
- Source A: `Game Development Documents/02-UI/UI Elements displayed on screen of the Record Label Simulator Video Game Application.md`.
- Source B: JL directive (chat).
- Observed in code/UI: Harmony Hub now hosts Act list, Act creation slots, Creator roster, and Era participation per Act.
- Proposed resolution options:
  - A) Update Harmony Hub description to Act management + Era participation (JL directive).
- Phase: Documented.

### 2025-12-24-studios-filters-01
- Area/system: Create Content studios
- Statement A: GDD/UI references studios as a generic production area without explicit ownership/occupancy filters.
- Statement B: JL directive: Create Content shows available studios with filters for owned/unowned, owner entity, and occupied/unoccupied slots; content studios are multipurpose and distinct from broadcast studios.
- Why it matters: Studio availability gates production planning and differentiates promotion workflows.
- Source A: `Game Development Documents/02-UI/UI Elements displayed on screen of the Record Label Simulator Video Game Application.md`.
- Source B: JL directive (chat).
- Observed in code/UI: Create Content view includes a Studios panel with filters and ownership/occupancy listing; copy clarifies broadcast studios are for promotion.
- Proposed resolution options:
  - A) Document the studios panel and multipurpose content studio rule (JL directive).
- Phase: Documented.
