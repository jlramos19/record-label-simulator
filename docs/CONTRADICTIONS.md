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

### 2025-12-25-ccc-signing-01 - CCC signing transaction + lockout
- ID: 2025-12-25-ccc-signing-01
- Description: CCC signing UX/logic mismatch: wallet deduction must occur only on success; failures should lock the creator until the next CCC refresh at 12AM. Legacy docs mention reconsider timers; MVP uses instant resolution with a midnight lockout instead.
- Status: PATCH
- Decision ID: None
- TODO notes: None.
- Docs commit/PR: Local changes.
- Code commit/PR: Local changes.
- Patch note entry: 2025-12-25.

### 2025-12-25-ui-structure-01 - Top bar trends summary
- ID: 2025-12-25-ui-structure-01
- Description: UI Design System expects a top bar trend summary; the web UI now includes it in the header. Spec: `game-design-documents/02-UI/record-label-simulator-ui-and-ux-design-system.md`.
- Status: CLOSED
- Decision ID: None
- TODO notes: None
- Docs commit/PR: N/A
- Code commit/PR: N/A
- Patch note entry: N/A

### 2025-12-25-ui-structure-02 - Left/right panel architecture
- ID: 2025-12-25-ui-structure-02
- Description: UI Design System expects persistent left-side panels (Areas/Creators/Acts/Inventory/Items/Modifiers/Collabs) and right-side Calendar/Quests panels; current web router uses route-specific panels instead of fixed columns. Spec: `game-design-documents/02-UI/record-label-simulator-ui-and-ux-design-system.md`.
- Status: OPEN
- Decision ID: TBD
- TODO notes: Decide whether to align the web layout with persistent columns or update docs to reflect the route-based layout.
- Docs commit/PR: TBD
- Code commit/PR: TBD
- Patch note entry: TBD

### 2025-12-25-visual-identity-01 - Mood identity icons
- ID: 2025-12-25-visual-identity-01
- Description: UI Design System requires moods to be icon-coded first; current UI uses text-only mood labels with no icons. Spec: `game-design-documents/02-UI/record-label-simulator-ui-and-ux-design-system.md`.
- Status: OPEN
- Decision ID: TBD
- TODO notes: Define mood icon set and update UI and docs accordingly.
- Docs commit/PR: TBD
- Code commit/PR: TBD
- Patch note entry: TBD

### 2025-12-24-reorg-01 - Population splits (Campaign Era)
- ID: 2025-12-24-reorg-01
- Description: Legacy UI/docs used fixed Campaign Era percentages; JL directive and current code use target + variance ranges and display approximate ranges in UI. Sources: prior `index.html` display and `game-design-documents/03-Systems/rls-population-evolution.md`.
- Status: DOCS
- Decision ID: TBD
- TODO notes: Confirm variance width (current +/-5 or dynamic) and document the canonical range rule.
- Docs commit/PR: TBD
- Code commit/PR: Implemented (commit unknown)
- Patch note entry: TBD

### 2025-12-24-reorg-02 - Population cadence
- ID: 2025-12-24-reorg-02
- Description: Legacy docs described 4-year population reevaluations; JL directive sets yearly cadence and the web UI/sim uses yearly updates. Sources: `game-design-documents/03-Systems/commentary-on-the-revised-population-dynamics-document.md` and `game-design-documents/03-Systems/rls-population-evolution.md`.
- Status: PATCH
- Decision ID: TBD
- TODO notes: Add patch note entry for yearly cadence change (if required by closure workflow).
- Docs commit/PR: Documented (commit unknown)
- Code commit/PR: Implemented (commit unknown)
- Patch note entry: TBD

### 2025-12-24-web-01 - Unity vs web engine assumptions
- ID: 2025-12-24-web-01
- Description: Multiple GDD files assume Unity-specific tooling (Unity 6, GameObjects, ScriptableObjects, Prefabs, NavMesh, Unity services) while the project is a web app; Unity wording must be retconned to web equivalents. Sources: `game-design-documents/07-Engineering/*` and related system docs.
- Status: DOCS
- Decision ID: DEC-20251225-002
- TODO notes: Rewrite Unity references to web equivalents and update glossary; archive or replace Unity-only guidance as needed.
- Docs commit/PR: TBD
- Code commit/PR: N/A
- Patch note entry: TBD

### 2025-12-24-seeding-01 - Pre-game simulation seeding cadence
- ID: 2025-12-24-seeding-01
- Description: Legacy docs describe continuous pre-game simulation from 2025-2400; JL directive and current code use 2025-2200 fixed baseline with 2200-2400 unique per seed. Sources: `game-design-documents/03-Systems/record-label-simulator-simulation-timeline-and-milestones.md` and `game-design-documents/03-Systems/time-progression-system-for-record-label-simulator.md`.
- Status: PATCH
- Decision ID: TBD
- TODO notes: Add patch note entry for baseline/seed split (if required by closure workflow).
- Docs commit/PR: Documented (commit unknown)
- Code commit/PR: Implemented (commit unknown)
- Patch note entry: TBD

### 2025-12-24-era-concurrency-01 - Era concurrency
- ID: 2025-12-24-era-concurrency-01
- Description: Docs implied a single active Era; JL directive and current UI support overlapping Eras across Acts and an Eras tab in Calendar. Source: `game-design-documents/03-Systems/calendar-module-in-record-label-simulator-video.md`.
- Status: PATCH
- Decision ID: TBD
- TODO notes: Add patch note entry for overlapping Era support (if required by closure workflow).
- Docs commit/PR: Documented (commit unknown)
- Code commit/PR: Implemented (commit unknown)
- Patch note entry: TBD

### 2025-12-24-eyerisocial-promo-01 - eyeriSocial promotions channel
- ID: 2025-12-24-eyerisocial-promo-01
- Description: UI docs separated Logs/Debug from Promotion; JL directive rebrands Logs as eyeriSocial public channel with internal scheduling until posted. Source: `game-design-documents/02-UI/ui-elements-displayed-on-screen-of-the-record-label-simulator-video-game-application.md`.
- Status: PATCH
- Decision ID: TBD
- TODO notes: Add patch note entry for eyeriSocial rebrand (if required by closure workflow).
- Docs commit/PR: Documented (commit unknown)
- Code commit/PR: Implemented (commit unknown)
- Patch note entry: TBD

### 2025-12-24-bailout-choice-01 - Bailout choice flow
- ID: 2025-12-24-bailout-choice-01
- Description: Legacy docs auto-trigger bailout at first bankruptcy; JL directive makes bailout optional with accept/decline, keeps achievements tracking, and flags bailout wins for leaderboards. Source: `game-design-documents/99-Archive/winning-and-losing-conditions-in-record-label-simulator.md`.
- Status: PATCH
- Decision ID: TBD
- TODO notes: Add patch note entry for bailout choice flow (if required by closure workflow).
- Docs commit/PR: Documented (commit unknown)
- Code commit/PR: Implemented (commit unknown)
- Patch note entry: TBD

### 2025-12-24-economy-pricing-01 - Digital pricing table thresholds
- ID: 2025-12-24-economy-pricing-01
- Description: Pricing docs conflict on digital track thresholds and baselines (EP 4-7 tracks at $4.99 vs Single 1-4 tracks at $0.69 and LP 8 tracks at $6.99). Sources: `game-design-documents/03-Systems/Economy/Pricing/...`.
- Status: DOCS
- Decision ID: DEC-20251226-005
- TODO notes: Align pricing docs to track-count thresholds (Single 1-4, EP 5-7, Album 8-32); confirm pricing baselines separately.
- Docs commit/PR: TBD
- Code commit/PR: Local changes
- Patch note entry: 2025-12-26

### 2025-12-24-economy-pricing-02 - Vinyl pricing baselines
- ID: 2025-12-24-economy-pricing-02
- Description: Pricing docs conflict on vinyl Side A baseline ($9.99 vs $24.99) and tier ranges. Sources: `game-design-documents/03-Systems/Economy/Pricing/...`.
- Status: OPEN
- Decision ID: TBD
- TODO notes: Choose canonical vinyl pricing tier (Option A or B).
- Docs commit/PR: TBD
- Code commit/PR: N/A
- Patch note entry: TBD

### 2025-12-24-menu-reorg-01 - Menu and panel responsibilities
- ID: 2025-12-24-menu-reorg-01
- Description: UI docs list Campaigns as top-level and imply Calendar outside Era management; JL directive makes Create Content a dedicated view and moves Campaigns into Eras/Calendar with eyeriSocial as the public feed. Source: `game-design-documents/02-UI/ui-elements-displayed-on-screen-of-the-record-label-simulator-video-game-application.md`.
- Status: PATCH
- Decision ID: TBD
- TODO notes: Add patch note entry for menu reorg (if required by closure workflow).
- Docs commit/PR: Documented (commit unknown)
- Code commit/PR: Implemented (commit unknown)
- Patch note entry: TBD

### 2025-12-24-harmony-hub-acts-01 - Harmony Hub focus
- ID: 2025-12-24-harmony-hub-acts-01
- Description: UI docs framed Harmony Hub as owned spaces/tools/collabs; JL directive reserves it for Act formation and management with Creator IDs and Era participation. Source: `game-design-documents/02-UI/ui-elements-displayed-on-screen-of-the-record-label-simulator-video-game-application.md`.
- Status: PATCH
- Decision ID: TBD
- TODO notes: Add patch note entry for Harmony Hub scope change (if required by closure workflow).
- Docs commit/PR: Documented (commit unknown)
- Code commit/PR: Implemented (commit unknown)
- Patch note entry: TBD

### 2025-12-24-studios-filters-01 - Create Content studios filters
- ID: 2025-12-24-studios-filters-01
- Description: UI docs describe studios generically; JL directive adds filters for owned/unowned, owner entity, and occupancy and clarifies content vs broadcast studios. Source: `game-design-documents/02-UI/ui-elements-displayed-on-screen-of-the-record-label-simulator-video-game-application.md`.
- Status: PATCH
- Decision ID: TBD
- TODO notes: Add patch note entry for studios filters (if required by closure workflow).
- Docs commit/PR: Documented (commit unknown)
- Code commit/PR: Implemented (commit unknown)
- Patch note entry: TBD
