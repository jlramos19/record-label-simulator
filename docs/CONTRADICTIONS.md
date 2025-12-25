# Contradictions Log

This file tracks known mismatches between the current web MVP implementation and the Drive GDD/UI specs.

## Status Legend
- OPEN: Unresolved contradiction or decision missing.
- TODO: Decision made; work not started.
- DOCS: Documentation update required or in progress.
- CODE: Code update required or in progress.
- PATCH: Patch note entry required or in progress.
- CLOSED: Fully resolved.

## Entries

### 2025-12-25-ui-structure-01 - Top bar trends summary
- ID: 2025-12-25-ui-structure-01
- Description: UI Design System expects a top bar trend summary; the web UI now includes it in the header. Spec: `Game Development Documents/02-UI/Record Label Simulator - UI and UX Design System.md`.
- Status: CLOSED
- Decision ID: None
- TODO notes: None
- Docs commit/PR: N/A
- Code commit/PR: N/A
- Patch note entry: N/A

### 2025-12-25-ui-structure-02 - Left/right panel architecture
- ID: 2025-12-25-ui-structure-02
- Description: UI Design System expects persistent left-side panels (Areas/Creators/Acts/Inventory/Items/Modifiers/Collabs) and right-side Calendar/Quests panels; current web router uses route-specific panels instead of fixed columns. Spec: `Game Development Documents/02-UI/Record Label Simulator - UI and UX Design System.md`.
- Status: OPEN
- Decision ID: TBD
- TODO notes: Decide whether to align the web layout with persistent columns or update docs to reflect the route-based layout.
- Docs commit/PR: TBD
- Code commit/PR: TBD
- Patch note entry: TBD

### 2025-12-25-visual-identity-01 - Mood identity icons
- ID: 2025-12-25-visual-identity-01
- Description: UI Design System requires moods to be icon-coded first; current UI uses text-only mood labels with no icons. Spec: `Game Development Documents/02-UI/Record Label Simulator - UI and UX Design System.md`.
- Status: OPEN
- Decision ID: TBD
- TODO notes: Define mood icon set and update UI and docs accordingly.
- Docs commit/PR: TBD
- Code commit/PR: TBD
- Patch note entry: TBD

### 2025-12-24-reorg-01 - Population splits (Campaign Era)
- ID: 2025-12-24-reorg-01
- Description: Legacy UI/docs used fixed Campaign Era percentages; JL directive and current code use target + variance ranges and display approximate ranges in UI. Sources: prior `index.html` display and `Game Development Documents/03-Systems/RLS Population Evolution.md`.
- Status: DOCS
- Decision ID: TBD
- TODO notes: Confirm variance width (current +/-5 or dynamic) and document the canonical range rule.
- Docs commit/PR: TBD
- Code commit/PR: Implemented (commit unknown)
- Patch note entry: TBD

### 2025-12-24-reorg-02 - Population cadence
- ID: 2025-12-24-reorg-02
- Description: Legacy docs described 4-year population reevaluations; JL directive sets yearly cadence and the web UI/sim uses yearly updates. Sources: `Game Development Documents/03-Systems/Commentary on the Revised Population Dynamics Document.md` and `Game Development Documents/03-Systems/RLS Population Evolution.md`.
- Status: PATCH
- Decision ID: TBD
- TODO notes: Add patch note entry for yearly cadence change (if required by closure workflow).
- Docs commit/PR: Documented (commit unknown)
- Code commit/PR: Implemented (commit unknown)
- Patch note entry: TBD

### 2025-12-24-web-01 - Unity vs web engine assumptions
- ID: 2025-12-24-web-01
- Description: Multiple GDD files assume Unity-specific tooling (Unity 6, GameObjects, ScriptableObjects, Prefabs, NavMesh, Unity services) while the project is a web app; Unity wording must be retconned to web equivalents. Sources: `Game Development Documents/07-Engineering/*` and related system docs.
- Status: DOCS
- Decision ID: DEC-20251225-002
- TODO notes: Rewrite Unity references to web equivalents and update glossary; archive or replace Unity-only guidance as needed.
- Docs commit/PR: TBD
- Code commit/PR: N/A
- Patch note entry: TBD

### 2025-12-24-seeding-01 - Pre-game simulation seeding cadence
- ID: 2025-12-24-seeding-01
- Description: Legacy docs describe continuous pre-game simulation from 2025-2400; JL directive and current code use 2025-2200 fixed baseline with 2200-2400 unique per seed. Sources: `Game Development Documents/03-Systems/Record Label Simulator - Simulation Timeline and Milestones.md` and `Game Development Documents/03-Systems/Time Progression System for Record Label Simulator.md`.
- Status: PATCH
- Decision ID: TBD
- TODO notes: Add patch note entry for baseline/seed split (if required by closure workflow).
- Docs commit/PR: Documented (commit unknown)
- Code commit/PR: Implemented (commit unknown)
- Patch note entry: TBD

### 2025-12-24-era-concurrency-01 - Era concurrency
- ID: 2025-12-24-era-concurrency-01
- Description: Docs implied a single active Era; JL directive and current UI support overlapping Eras across Acts and an Eras tab in Calendar. Source: `Game Development Documents/03-Systems/Calendar Module in Record Label Simulator video.md`.
- Status: PATCH
- Decision ID: TBD
- TODO notes: Add patch note entry for overlapping Era support (if required by closure workflow).
- Docs commit/PR: Documented (commit unknown)
- Code commit/PR: Implemented (commit unknown)
- Patch note entry: TBD

### 2025-12-24-eyerisocial-promo-01 - eyeriSocial promotions channel
- ID: 2025-12-24-eyerisocial-promo-01
- Description: UI docs separated Logs/Debug from Promotion; JL directive rebrands Logs as eyeriSocial public channel with internal scheduling until posted. Source: `Game Development Documents/02-UI/UI Elements displayed on screen of the Record Label Simulator Video Game Application.md`.
- Status: PATCH
- Decision ID: TBD
- TODO notes: Add patch note entry for eyeriSocial rebrand (if required by closure workflow).
- Docs commit/PR: Documented (commit unknown)
- Code commit/PR: Implemented (commit unknown)
- Patch note entry: TBD

### 2025-12-24-bailout-choice-01 - Bailout choice flow
- ID: 2025-12-24-bailout-choice-01
- Description: Legacy docs auto-trigger bailout at first bankruptcy; JL directive makes bailout optional with accept/decline and achievement lockout on acceptance. Source: `Game Development Documents/99-Archive/Winning and Losing Conditions in Record Label Simulator.md`.
- Status: PATCH
- Decision ID: TBD
- TODO notes: Add patch note entry for bailout choice flow (if required by closure workflow).
- Docs commit/PR: Documented (commit unknown)
- Code commit/PR: Implemented (commit unknown)
- Patch note entry: TBD

### 2025-12-24-economy-pricing-01 - Digital pricing table thresholds
- ID: 2025-12-24-economy-pricing-01
- Description: Pricing docs conflict on digital track thresholds and baselines (EP 4-7 tracks at $4.99 vs Single 1-4 tracks at $0.69 and LP 8 tracks at $6.99). Sources: `Game Development Documents/03-Systems/Economy/Pricing/...`.
- Status: OPEN
- Decision ID: TBD
- TODO notes: Choose canonical pricing table for digital projects (Option A or B).
- Docs commit/PR: TBD
- Code commit/PR: N/A
- Patch note entry: TBD

### 2025-12-24-economy-pricing-02 - Vinyl pricing baselines
- ID: 2025-12-24-economy-pricing-02
- Description: Pricing docs conflict on vinyl Side A baseline ($9.99 vs $24.99) and tier ranges. Sources: `Game Development Documents/03-Systems/Economy/Pricing/...`.
- Status: OPEN
- Decision ID: TBD
- TODO notes: Choose canonical vinyl pricing tier (Option A or B).
- Docs commit/PR: TBD
- Code commit/PR: N/A
- Patch note entry: TBD

### 2025-12-24-menu-reorg-01 - Menu and panel responsibilities
- ID: 2025-12-24-menu-reorg-01
- Description: UI docs list Campaigns as top-level and imply Calendar outside Era management; JL directive makes Create Content a dedicated view and moves Campaigns into Eras/Calendar with eyeriSocial as the public feed. Source: `Game Development Documents/02-UI/UI Elements displayed on screen of the Record Label Simulator Video Game Application.md`.
- Status: PATCH
- Decision ID: TBD
- TODO notes: Add patch note entry for menu reorg (if required by closure workflow).
- Docs commit/PR: Documented (commit unknown)
- Code commit/PR: Implemented (commit unknown)
- Patch note entry: TBD

### 2025-12-24-harmony-hub-acts-01 - Harmony Hub focus
- ID: 2025-12-24-harmony-hub-acts-01
- Description: UI docs framed Harmony Hub as owned spaces/tools/collabs; JL directive reserves it for Act formation and management with Creator IDs and Era participation. Source: `Game Development Documents/02-UI/UI Elements displayed on screen of the Record Label Simulator Video Game Application.md`.
- Status: PATCH
- Decision ID: TBD
- TODO notes: Add patch note entry for Harmony Hub scope change (if required by closure workflow).
- Docs commit/PR: Documented (commit unknown)
- Code commit/PR: Implemented (commit unknown)
- Patch note entry: TBD

### 2025-12-24-studios-filters-01 - Create Content studios filters
- ID: 2025-12-24-studios-filters-01
- Description: UI docs describe studios generically; JL directive adds filters for owned/unowned, owner entity, and occupancy and clarifies content vs broadcast studios. Source: `Game Development Documents/02-UI/UI Elements displayed on screen of the Record Label Simulator Video Game Application.md`.
- Status: PATCH
- Decision ID: TBD
- TODO notes: Add patch note entry for studios filters (if required by closure workflow).
- Docs commit/PR: Documented (commit unknown)
- Code commit/PR: Implemented (commit unknown)
- Patch note entry: TBD
