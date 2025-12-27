# Patch Notes

## 2025-12-27 (RLS-PATCH-20251227-2039Z)
- Tour dates and promo runs now spend pooled act stamina (members cover for each other), applied to player + rival labels with overdraw warnings. [PN-20251227-AC05]

## 2025-12-27 (RLS-PATCH-20251227-2037Z)
- Cultural reset genres now return with an EMERGING tag for 4 weeks, including a 75% activity debuff to reflect audience resistance.

## 2025-12-27 (RLS-PATCH-20251227-2021Z)
- Trend rankings now show status pills (Hot/Rising/Peaking/Falling/Stable) with trend point totals.
- Trend leaders now decay with audience fatigue, and extended dominance triggers a cultural reset drop to the bottom.
- Top Trends expanded view now shows theme + mood inline, with theme/mood pill widths kept consistent by type.
- Creator given-name pools now respect gender identity filters, and creator cards show gender identity beside age. [PN-20251227-AC04]

## 2025-12-27 (RLS-PATCH-20251227-2002Z)
- Tour auto-generation now clusters dates by region, respects travel-buffer gaps, and stops at tier length caps. [PN-20251227-AC01]
- Tour booking logs now include tour IDs; leg recap logs and eyeriSocial posts fire when dates resolve. [PN-20251227-AC02]
- Tour summaries now list regional leg counts, and cooldown warnings surface when tours stack too tightly. [PN-20251227-AC03]

## 2025-12-27 (RLS-PATCH-20251227-1949Z)
- Dashboard now splits Dashboard + Pipeline (left) and Road to the Top (right) with a resizable divider.
- Road to the Top scope filters now sit to the right of content tabs for cleaner chart-pulse navigation.
- Eras view now uses a resizable side-by-side split between Era Desk and Era Performance.
- Audience chunks moved into Charts > Demographics, and Bytenza creator names now show Hangul + romanized inline.

## 2025-12-27 (RLS-PATCH-20251227-0420Z)
- Creator ID cards now use a 3:2 layout with header/body/footer regions, a 2:3 portrait on the left, and footer-aligned stamina + action pills.
- Creator ID stats now drop the redundant skill value line while keeping skill level/EXP, catharsis, and stamina.

## 2025-12-27 (RLS-PATCH-20251227-0406Z)
- Creator portraits now pick from any preferred theme+mood pairing with available images, then keep the chosen genre for future age-bin updates while rechecking on preference changes.

## 2025-12-27 (RLS-PATCH-20251227-0330Z)
- Population snapshots now use nation-specific age pyramids, with Gaia age splits aggregated from the national distributions.
- Audience chunks now seed ages from the current population pyramid per nation, keeping 0-20 cohorts in the mix.
- Creator ID ages now skew younger (20+ only), drawing from a youth-biased age profile.
- Charts now include a Demographics tab that breaks down Gaia or nation population age splits with budget/engagement signals.

## 2025-12-27 (RLS-PATCH-20251227-0318Z)
- Chart weights now downshift streaming share across default and regional consumption mixes.
- Chart metrics now apply a 5x streaming volume multiplier so stream counts run higher than sales.
- Annual sales/streams awards now compute sales-equivalent totals with streams weighted at 0.1.

## 2025-12-27 (RLS-PATCH-20251227-0246Z)
- Dashboard now includes an Audience Chunks panel that surfaces age, generation, budget, engagement, and preference snapshots from the simulated chunk sample.
- Audience chunks now simulate yearly evolution (age, budget, engagement, time profile, preference drift) with reproduction/emigration events tied to age brackets.
- Creator cards now show age + age-group metadata across roster, CCC, and auto-assign views.
- Cheater mode now exposes CCC injection tools so you can spawn specific Creator IDs with portrait keys/files for testing.
- Dashboard footer panels now scroll to keep multi-row layouts visible.

## 2025-12-27 (RLS-PATCH-20251227-0155Z)
- Creator IDs now store age (20-119) and ageGroup (4-year bin) sourced from audience age-group distribution.
- Creator portraits now auto-assign from the manifest using theme-mood, portrait age bin, nationality, and gender identity; avatar tooltips flag missing tags or empty folders.
- Added a creator portrait manifest generator plus a `creator-portraits.js` data asset to sync dropped images.

## 2025-12-27 (RLS-PATCH-20251227-0131Z)
- Creator portrait age bins now use 20-23, 24-27, 28-31, 32-35, 36-43, 44-51, 52-75, and 76-120.
- Portrait genre reference now lives in `content-genres.md` under the PNG portraits root.

## 2025-12-27 (RLS-PATCH-20251227-0118Z)
- Year-end charts now track weekly results in save data and release on the first Saturday of January for the prior year.
- Annual awards now resolve from the saved ledger with chart snapshot fallback, keeping CEO Requests and tasks synced to the release.

## 2025-12-27 (RLS-PATCH-20251227-0116Z)
- Creator portrait folders now use `<theme>-<mood>/age-XX-YY/<nationality>-<gender>` for clearer image drop-ins.
- Replaced gNN mapping with explicit theme-mood folder names under the portraits genre map.

## 2025-12-27 (RLS-PATCH-20251227-0033Z)
- Creator cards now show catharsis (skill + stamina) alongside skill level/EXP and stamina.
- CCC market creators now spawn with skill levels capped at 5, weighted toward lower levels.
- Catharsis scoring now uses a skill-weighted stamina floor to keep high-skill creators steadier at low stamina.

## 2025-12-27 (RLS-PATCH-20251227-0025Z)
- Fixed the Calendar day detail click handler throwing a `root` reference error on load.

## 2025-12-27 (RLS-PATCH-20251227-0021Z)
- Creator IDs now carry a `genderIdentity` field (default null) to support portrait filtering.
- Added Creator ID portrait folder scaffolding with gender identity, nationality, theme, mood, genre, and 20+ age-group buckets for image drop-ins.


## 2025-12-27 (RLS-PATCH-20251227-0008Z)
- Creator ID portraits now render in a fixed 2:3 frame, with stacked fallback symbols to fit the tall placeholder.

## 2025-12-26 (RLS-PATCH-20251226-2358Z)
- Road to the Top now replaces Dashboard Focus and takes the top half of the Dashboard, with the overview + pipeline moved into a footer row.
- Act name pools now use 15 adjective + 15 noun categories (20 entries each) with solo/group rendering and nation-weighted selection.
- Bytenza act names now store Hangul + Revised Romanization, with UI tooltips exposing the romanized form alongside English stacking.
- Solo act generation now excludes `groups_formations` across all nation bias weights.

## 2025-12-26 (RLS-PATCH-20251226-2346Z)
- Release scheduling now snaps queued drops to the Friday 00:00 processing window so calendar dates match the actual release day.

## 2025-12-26 (RLS-PATCH-20251226-2330Z)
- Dashboard Focus now consolidates charts, quests, CEO Requests, and active eras into a tabbed panel for more space.
- Quests now align to CEO Request categories, prefer locked requests, and show linked request IDs in the list.
- Added quest objectives for project releases, promo campaigns, and tour bookings to support annual awards.

## 2025-12-26 (RLS-PATCH-20251226-2311Z)
- Rival labels completing all 12 CEO Requests now trigger a loss if the player has not secured a win state.
- Quest messaging now surfaces as Tasks in UI copy and social/email headers, aligning with the task repurpose.
- Documented task automation expectations and win/loss tracking rules.

## 2025-12-26 (RLS-PATCH-20251226-2254Z)
- Act name generator now uses 20x25 semantic adjective/noun pools with deterministic, nation-weighted selection and unique key support.
- Bytenza act names now stack Korean + English in UI surfaces using act name keys for translation.
- Added an act-name generator validation script for combinatorics, determinism, Spanish agreement, and Korean formatting.

## 2025-12-26 (RLS-PATCH-20251226-2141Z)
- Touring Desk now supports draft planning, venue filtering, booking dates, and route timelines with projection summaries + warnings.
- Tour bookings now render on the Calendar with warning styling, and touring charts rank acts by booked attendance so CEO Requests can progress.
- Touring balance toggle gates wallet/fan impact; weekly economy reports now include touring net when enabled.

## 2025-12-26 (RLS-PATCH-20251226-2105Z)
- Charts view scope tabs now stay on one row with content-type filters docked to the right.

## 2025-12-26 (RLS-PATCH-20251226-2047Z)
- Critics Councils now score releases by scope and adjust final quality, storing critic grades and deltas for awards and charts.
- CEO Requests now resolve yearly award winners for tracks, projects, promotions, and tours with the documented tie-break ladder.
- Chart snapshots now carry critic/quality metadata to support annual awards and history lookups.

## 2025-12-26 (RLS-PATCH-20251226-2042Z)
- Charts view now includes an Acts tab with a yearly, cumulative act popularity leaderboard (tracks/promos/tours points + activity weeks).
- Act popularity ledger updates weekly from chart data to keep era/achievement pacing visible.
- Documented default loop balance math and act leaderboard rules for balance review.

## 2025-12-26 (RLS-PATCH-20251226-2040Z)
- Rival rollout planning no longer forces an anchor label; all rivals follow the same eligibility gates.
- Rival dominance pushes now depend only on ambition/focus rules (no anchor boost).
- Rival rollout planning now logs when no labels pass the budget gate.

## 2025-12-26 (RLS-PATCH-20251226-2019Z)
- Rival rollout scheduling now applies a wallet-percent release budget and cash reserve before queuing drops.
- Competitive rivals can queue additional dominance drops toward target chart scopes when budget + roster capacity allow.
- Rival dominance pushes now surface a log entry when a chart push is queued.

## 2025-12-26 (RLS-PATCH-20251226-2009Z)
- Touring projections now factor regional chart momentum plus rotating concert-interest segments, with booking eligibility gating venue access.
- Touring desk drops goal/notes inputs, adds auto-generated dates with projected revenue, and blocks ineligible venue bookings in the UI.
- Promo pushes can be scheduled ahead by week/day/timeframe (including eyeriSocial), with facility availability checked against the scheduled window.
- Calendar now shows event execution times, and "+N more" opens a day-detail modal listing every event for that date.
- Population panels now surface audience age-group splits to match GDD chunking.

## 2025-12-26 (RLS-PATCH-20251226-2003Z)
- Dashboard now includes CEO Requests progress plus a rival race panel showing each label's unlocked count and focus request.
- Rival labels track CEO Requests, update ambition/cash floors, and boost roster growth + release quality to stay competitive through year 3000.
- Market track archives now store project types and trend-at-release flags for long-horizon achievement tracking.

## 2025-12-26 (RLS-PATCH-20251226-1859Z)
- Reduced redundant auto-save writes after full UI refreshes to keep interactions smoother.
- Bailout acceptance now avoids a duplicate stats render during the full UI refresh.

## 2025-12-26 (RLS-PATCH-20251226-1852Z)
- Auto promo targets now appear only while Auto Promo is enabled.

## 2025-12-26 (RLS-PATCH-20251226-1851Z)
- Trend/genre theme+mood pills now stack as "Theme but" over "it's Mood" to reduce overflow and preserve layout.

## 2025-12-26 (RLS-PATCH-20251226-1826Z)
- Top Labels "More" window now includes each label's most-used theme and mood column.
- Broadcast and filming studios now include regional facilities with five daily slots split across morning/afternoon/night timeframes.

## 2025-12-26 (RLS-PATCH-20251226-1822Z)
- UI panels, floating windows, and buttons now render with thicker borders for clearer separation.
- Theme/mood/country/alignment tags now normalize to fixed-width pills with wrapping text for consistent rows.
- Record label pills now stack label names over a dedicated "Record Label" line, and Top Labels points round to whole numbers.

## 2025-12-26 (RLS-PATCH-20251226-1807Z)
- Auto promo now supports four target slots (Act/Project/Track per slot) with per-slot budget allocations capped at 100% total.
- Auto promo slots can run act-only and report per-slot readiness in the Promotions summary.
- Auto promo selectors now exclude inactive acts/projects/tracks and avoid missing-era reference errors.

## 2025-12-26 (RLS-PATCH-20251226-1749Z)
- New games now default to Modern Mode (2400), Medium difficulty, and Fast time speed (1h = 1s).
- Auto-save now starts enabled at a 2-minute interval for new games.
- Game mode labels now use Mode naming (Founding Mode, Modern Mode) to avoid era overlap.

## 2025-12-26 (RLS-PATCH-20251226-1744Z)
- Act recommendations now weigh theme/mood preference matches, alignment fit, and catharsis-grade proximity to content quality.

## 2025-12-26 (RLS-PATCH-20251226-1733Z)
- Track title generation no longer appends content genre labels in parentheses.

## 2025-12-26 (RLS-PATCH-20251226-1726Z)
- Promotions now support Project targets between Act + Track, letting project-level promo boosts lift active-era tracks.
- Auto promo and rival rollout promos now apply project-level boosts when multiple releases share a project.

## 2025-12-26 (RLS-PATCH-20251226-1718Z)
- Gradients now only appear on image placeholders; UI panels, buttons, and progress fills are solid.

## 2025-12-26 (RLS-PATCH-20251226-1706Z)
- Calendar view now focuses on Label/Public scheduling; Eras lives only in its dedicated tab.
- Calendar view adds a Structures & Slots sidebar with rival recording studio capacity plus broadcast/filming availability.

## 2025-12-26 (RLS-PATCH-20251226-1705Z)
- Charts scope tabs now drill down from nation to region so the top row stays uncluttered.
- Charts content filters (Tracks, Projects, Promotions, Touring) remain reachable while switching scope.

## 2025-12-26 (RLS-PATCH-20251226-1700Z)
- App backgrounds now use solid grid-safe colors (#663300 dark, #CCFFFF light) instead of gradients.

## 2025-12-26 (RLS-PATCH-20251226-1651Z)
- Added rollout strategy templates and a UI picker so labels can seed competitive rollouts.
- Label competition scoring now aggregates tracks, promo, and tour charts across scopes.
- Monopoly rule now triggers an immediate loss when any label fills an entire chart.

## 2025-12-26 (RLS-PATCH-20251226-1251Z)
- Quick Act now randomly creates solo or group acts and only uses creators under the act membership cap.
- Act creation now blocks creators who already belong to 4 acts, with warning messaging.

## 2025-12-26 (RLS-PATCH-20251226-1649Z)
- Modifier tool base prices reduced to 20% of their previous values for one-use balancing.

## 2025-12-26 (RLS-PATCH-20251226-1640Z)
- Documented the working Run/Debug flow: manual `npm run start` + `npm run watch`, then launch `RLS: Edge`.

## 2025-12-26 (RLS-PATCH-20251226-1639Z)
- Act name pools now generate adjective + plural-noun group names in Annglora, Crowlya, and Bytenza with grammar-correct ordering.
- Expanded act adjective categories (size, temperature, speed, weight) plus noun sets (animals, plants, objects, instruments, celestial) for broader variety.

## 2025-12-26 (RLS-PATCH-20251226-1517Z)
- Simplified Run/Debug to only the `RLS: Edge (Dev)` config after removing Edge Tools, while keeping prelaunch watch + server tasks.
- Fixed the dev server task problem matcher so VS Code can treat the server as a background task.

## 2025-12-26 (RLS-PATCH-20251226-1453Z)
- VS Code Edge debug now launches through the Edge Tools config with prelaunch dev server + TypeScript watch tasks.
- React UI islands dev server now uses port 5174 to avoid conflicts with the main game server.
- Added VS Code extension recommendations plus ESLint/Markdownlint configuration and a lint script.

## 2025-12-26 (RLS-PATCH-20251226-1420Z)
- Release desk now lists only mastered tracks as release-ready (unfinished masters stay in the Create pipeline).
- Scheduled releases now exclude unmastered entries and surface a blocked summary for legacy or missing-track schedules.

## 2025-12-26 (RLS-PATCH-20251226-1416Z)
- Era projects now auto-group releases by promo/release activity; inactivity closes the project and later releases start a new Era, with album caps at 32 tracks.
- Legacy-stage touring locks the main project and opens a 3-track deluxe window.
- Release Desk now lets you tag releases as Singles vs Project tracks, and single pricing respects the release type even when attached to a project.

## 2025-12-26 (RLS-PATCH-20251226-1411Z)
- Added lore-aligned Bytenza Korean act/project names with English variations for stacked display.
- Expanded act/project name pools with GDD-aligned titles and country motif entries.
- Act name rendering now stacks Korean/English variants across focus, calendar, chart, and roster views.

## 2025-12-26 (RLS-PATCH-20251226-1344Z)
- Release scheduling now requires mastered (Ready) tracks, preventing past-due releases for in-progress masters.
- Release desk summaries now separate Ready vs Mastering counts, and past-due scheduled entries show pending production status.

## 2025-12-26 (RLS-PATCH-20251226-1311Z)
- Active-view re-renders now pause during pointer interactions to prevent missed button clicks at fast sim speeds.

## 2025-12-26 (RLS-PATCH-20251226-1256Z)
- Community Tools now docks as a right-side panel in the Community tab.

## 2025-12-26 (RLS-PATCH-20251226-1250Z)
- React calendar label text now uses grid-safe black/white for country color contrast.
- React islands now define a production env flag to avoid a browser-only process error.

## 2025-12-26 (RLS-PATCH-20251226-1219Z)
- Live Performance promo card now upgrades into Prime Time Showcases with eligibility gating and updated costs/requirements.
- Promo charts now surface concurrent live audience metrics for live performances and Prime Time showcases.
- Live performance broadcasts now generate EyeriS Video performance tapes, and auto promo respects Prime Time eligibility.

## 2025-12-26 (RLS-PATCH-20251226-1215Z)
- Added a UI theme selector with warm dark + cool light palettes and system preference support.
- Pills and tags now follow mode palettes with alignment-based mood colors plus hard-shadow styling.


## 2025-12-26 (RLS-PATCH-20251226-1213Z)
- Prime Time Showcase now enforces Top 10 Act + Top 20 Track peaks with quality 80+; live performance metrics use concurrent audience.
- Promo requirement copy updated to call out Prime Time upgrade and concurrent audience metrics.
- Fixed a malformed UI theme change handler that blocked `tsc` builds.

## 2025-12-26 (RLS-PATCH-20251226-1158Z)
- Added `UI_REACT_ISLANDS_ENABLED` to gate React islands vs legacy UI paths for pills/tags, calendar modal, and track slots.
- Legacy calendar modal and track-slot grid rendering are now skipped when React islands are enabled.
- Marked string-based pill/tag helpers as deprecated and added a React migration parity checklist.

## 2025-12-26 (RLS-PATCH-20251226-1150Z)
- Promotions now show Promo Alerts for active-era promo gaps (per type) plus stale-act warnings after 6 months without promo activity.
- Promo usage history now records per-type promos (including auto promo), and chart scoring applies promo-gap + stale-act penalties.
- Stale acts no longer shield creator inactivity checks, increasing drop risk when promo activity lapses.

## 2025-12-26 (RLS-PATCH-20251226-1144Z)
- Auto Day/Auto Week now run quick time jumps with the skip progress bar instead of interval auto-skips.
- Skip Time now includes 3-month and 6-month quick skip buttons, with shared quick-skip handling across header + modal.

## 2025-12-26 (RLS-PATCH-20251226-1139Z)
- Added touring draft state scaffolding to save slots for future tour planning.

## 2025-12-26 (RLS-PATCH-20251226-1132Z)
- Added an optional `ui-react/` Vite + React build that outputs UI island bundles into `assets/js/ui-react/`.
- Calendar modal + track slots now render via React islands with a shared state-change event bridge.
- Added a small React pill/tag token demo inside Create to validate reusable UI tokens.

## 2025-12-26 (RLS-PATCH-20251226-1113Z)
- Era Desk rollout strategy controls now use a wrapped grid layout for horizontal planning.

## 2025-12-26 (RLS-PATCH-20251226-1112Z)
- Charts now include Promotions and Touring tabs alongside Tracks and Projects.
- Promotions charts rank promo pushes by audience engagement (eyeriSocial likes, music video views, interview comments).
- Touring charts rank act draw by attendance derived from charting tracks.

## 2025-12-26 (RLS-PATCH-20251226-1111Z)
- Chart Pulse now streams six-hour projection windows for Top 5 tracks, projects, or promos per chart scope.

## 2025-12-26 (RLS-PATCH-20251226-1047Z)
- Charts view now relies on the header for Top Labels by removing the label rankings sidebar.
## 2025-12-26 (RLS-PATCH-20251226-1037Z)
- Release tab now shows a Ready-only badge for masters awaiting release.

## 2025-12-26 (RLS-PATCH-20251226-1036Z)
- Time controls now show real-time simulation ratios in their labels and rename auto controls to Auto Day/Auto Week.

## 2025-12-26 (RLS-PATCH-20251226-1034Z)
- Community + Create modifier panels now call out that modifiers are consumable per track.

## 2025-12-26 (RLS-PATCH-20251226-1026Z)
- Modifiers now consume per track; inventory tracks counts and Create shows remaining charges.
- Community Tools list now supports repeat purchases with owned counts and inflation-adjusted pricing.
- Modifier selection now includes remaining counts and hides tools with zero charges.

## 2025-12-26 (RLS-PATCH-20251226-1011Z)
- Create view now lets you toggle between Manual and Auto panels while keeping the Tracks panel visible.
- Auto Create now assigns Acts and auto-advances demo/master stages, using the same weekly budget rules and summary reporting.

## 2025-12-26 (RLS-PATCH-20251226-1008Z)
- Create tab now shows a pending pipeline badge with totals plus 🎼 sheet and 🎧 demo counts before mastering.

## 2025-12-26 (RLS-PATCH-20251226-1003Z)
- Time controls now enforce a single active mode; auto-skips pause manual speed and manual speed cancels auto-skips.

## 2025-12-26 (RLS-PATCH-20251226-1002Z)
- Chart update countdown now renders as fixed-width hours (000.00) to prevent layout jitter.

## 2025-12-26 (RLS-PATCH-20251226-1001Z)
- Community tab now lists modifier tools with inflation-adjusted pricing and purchase actions.
- Create view now includes a Modifier Inventory panel and modifier select is limited to owned tools.
- Added mood/theme/alignment-focused modifier tools with conditional quality boosts.

## 2025-12-26 (RLS-PATCH-20251226-0955Z)
- Tutorial now uses tabbed navigation (loops, concepts, economy, roles) and includes live economy formula readouts.
- Added cheater mode toggle in Settings to unlock economy tuning edits; cheater mode disables achievements and quests while active.

## 2025-12-26 (RLS-PATCH-20251226-0953Z)
- Added Auto Create rules in Create view (budget percent, cash reserve, max tracks, solo/collab) with weekly run status disclosure.
- Promotions now show auto promo schedule/budget/steps, plus an adjustable auto promo percent and clearer run logging.

## 2025-12-26 (RLS-PATCH-20251226-0952Z)
- Era Desk and Harmony Hub now use compact multi-column stacks for act targeting, act details, and act slots.

## 2025-12-26 (RLS-PATCH-20251226-0955Z)
- Tutorial now uses tabbed navigation (loops, concepts, economy, roles) and includes live economy formula readouts.
- Added cheater mode toggle in Settings to unlock economy tuning edits; cheater mode disables achievements and quests while active.

## 2025-12-26 (RLS-PATCH-20251226-0934Z)
- Create view Tracks panel now focuses on the creation pipeline and includes in-progress demo/master work orders.

## 2025-12-26 (RLS-PATCH-20251226-1004Z)
- Release Desk moved into a dedicated Release tab between Create and Calendar; Calendar now focuses solely on scheduling.
- Added Project Planner guidance in Release plus project track-count constraints (Single 1-4, EP 5-7, Album 8-32) across create/release flows.
- Charts now include a Projects mode alongside Tracks for project-level rankings.
- Modern Mode (2400) seeding now generates grouped projects (Singles/EPs/Albums) in the market.

## 2025-12-26 (RLS-PATCH-20251226-0927Z)
- Added a Touring tab placeholder in the primary nav with a stub Touring Desk view.

## 2025-12-26 (RLS-PATCH-20251226-0921Z)
- Header time controls now use Auto 24h (12s interval) and Auto 7d (7s interval); Skip 7d was removed.

## 2025-12-26 (RLS-PATCH-20251226-0919Z)
- Creation studios now show act-member stage names with real names in brackets beneath.

## 2025-12-26 (RLS-PATCH-20251226-0917Z)
- Chart scoring now applies Act + Creator homeland bonuses and lore-based international audience modifiers, with market entries tracking origin countries.

## 2025-12-26 (RLS-PATCH-20251226-0914Z)
- Widened the Top Labels and Top Trends header columns to better fill the space beside menu actions.

## 2025-12-26 (RLS-PATCH-20251226-0851Z)
- CCC preferred Theme/Mood filters now include Top 3 trend toggles that cycle through the first three trend slots.

## 2025-12-26 (RLS-PATCH-20251226-0849Z)
- Header action buttons now stack vertically, and Save Now is available in the header for manual saves.

## 2025-12-26 (RLS-PATCH-20251226-0846Z)
- eyeriSocial promo target slots now sit side-by-side, with promo tiles capped to rectangular widths.

## 2025-12-26 (RLS-PATCH-20251226-0833Z)
- CCC Sign buttons now disable when cash is short and show "(not enough money)" inline.

## 2025-12-26 (RLS-PATCH-20251226-0823Z)
- Creator cards now show skill level and EXP progress in roster, CCC, and auto-assign views.

## 2025-12-26 (RLS-PATCH-20251226-0758Z)
- Added external storage support via the File System Access API for logs, saves, and chart history.
- Logs view now includes external storage controls to sync/export and import save data + chart history.
- Save slots and chart snapshots now mirror into the selected folder automatically.

## 2025-12-26 (RLS-PATCH-20251226-0747Z)
- Added an Auto 7d time control to advance one week every 7 seconds for hands-off sims.

## 2025-12-26 (RLS-PATCH-20251226-0723Z)
- Chart scoring now applies label-competition pressure from recent chart share, and rival momentum scales with the same pressure to prevent runaway dominance.
- Modern-mode seed bias reduced (dominant label bonus + seed pick chance) to keep early rankings closer.

## 2025-12-26 (RLS-PATCH-20251226-0709Z)
- Added per-session usage logging with session IDs, action trail snapshots, and error capture for faster bug triage.
- Debug bundle now exports the current usage session log alongside UI and simulation logs.
- Guardrails now persist session logs and mark when runtime errors end a session.

## 2025-12-26 (RLS-PATCH-20251226-0700Z)
- Community label rankings now keep all known labels visible, with Inactive/Bankrupted status for zero-point labels.
- Label ranking rows now show a "Since" date under the label pill.

## 2025-12-26 (RLS-PATCH-20251226-0627Z)
- Split gameplay tuning constants into `src/app/game/config.ts` to reduce `game.ts` surface area.
- Split creator name pools into `src/app/game/names/` modules with `names.ts` as the barrel export.

## 2025-12-26 (RLS-PATCH-20251226-0556Z)
- Promo track selection now auto-fills the Act slot when it is empty.
- Fixed promo slot assignment crash caused by missing slot/field DOM helpers.

## 2025-12-26 (RLS-PATCH-20251226-0518Z)
- Promotions now target Acts directly (act-only or act+track) with a dedicated Act slot and focus-era picker; active promos list includes act pushes.
- Broadcast facilities now use EyeriS studio profiles + program tiers, including Prime Time Showcase eligibility checks (quality + charting).
- Creator role copy now labels Performers as Recorders across UI and GDD docs.

## 2025-12-26 (RLS-PATCH-20251226-0517Z)
- Audience preferences now drift from base regional profiles using recent releases + chart mix, with iconic Risky eras boosting risk appetite.
- Chart scoring now uses dynamic audience alignment weights and regional trend genres (worker + main thread).
- Rival focus themes/moods now adapt to husk trend tags as rollout templates evolve.

## 2025-12-26 (RLS-PATCH-20251226-0456Z)
- Rival rollout planning now preserves a cash reserve while scaling lease costs, so more labels schedule releases and promo.
- Era completion now records outcomes (Flop/Mid/Successful/Iconic) from track economy and alignment, surfaced in logs/social.
- Rollout strategy planner now shows base vs inflation-adjusted promo budget estimates with planned totals and per-type breakdowns.
- Era husk generation now includes archived market releases; promo spend is tracked per track.

## 2025-12-26 (RLS-PATCH-20251226-0446Z)
- Eras view now uses an Era Performance panel with per-track chart points, sales, costs, earnings, and recommended vinyl runs.
- Era Performance includes a full chart history table for the focused Era (DNC for non-charting weeks).
- Physical run estimates now factor fan base, quality, trend alignment, project type, promo lead, and pricing baselines.

## 2025-12-26 (RLS-PATCH-20251226-0442Z)
- Master stage stamina cost reduced to 100 (from 150) to increase producer throughput without raising daily overuse limits.
- Stamina timing docs now reflect quarter-hour tick slicing and the updated master stamina cost in guidance tables.

## 2025-12-26 (RLS-PATCH-20251226-0429Z)
- Regional chart labels now drop Capital and use Regional suffixes (Bloomville/Belltown/Campana City, plus Elsewhere regions).
- Release queue IDs now use the RQ prefix to reserve RL for Record Label.
- Acronym glossary updated to confirm AI/ID and reserve RL for Record Label.

## 2025-12-26 (RLS-PATCH-20251226-0415Z)
- Calendar view now uses a 2/3 + 1/3 split with Release Desk.
- Upcoming calendar footer now spans the full view width with a horizontal event-day row.
- Calendar tabs now expand without the mini scrollbar.

## 2025-12-26 (RLS-PATCH-20251226-0409Z)
- Chart scope labels now pair place + scope (Gaia/Global, nation/National, capital/Regional) across charts and history views.
- Chart news templates now default to scope-aware handles/titles when a chart scope is provided.
- Regional chart labels now use capital city naming (Bloomville, Belltown, Campana City) with Elsewhere regional counterparts.

## 2025-12-26 (RLS-PATCH-20251226-0402Z)
- Promo type cards now include per-type budgets with efficiency + audience-range lift guidance; total spend sums across selected promos.

## 2025-12-26 (RLS-PATCH-20251226-0401Z)
- Release Desk buttons now display the distribution fee, including $0 for digital releases.
- Physical/Both releases now charge a distribution fee when scheduled or released.

## 2025-12-26 (RLS-PATCH-20251226-0359Z)
- Calendar view now splits 50/50 with Release Desk and drops the duplicate Tracks panel.
- Upcoming calendar footer now shows only days with scheduled events in a horizontal scroll row.

## 2025-12-26 (RLS-PATCH-20251226-0322Z)
- Create-stage buttons now show costs and use Create wording for sheet, demo, and master actions.
- Creation guidance copy now uses Create verbs instead of Start for new label and content prompts.
- Promotions now show total multi-select spend on the budget helper and promo button.

## 2025-12-26 (RLS-PATCH-20251226-0318Z)
- Creator name pools now align to language-specific lists (Annglora = English, Bytenza = Korean, Crowlya = Spanish).
- Bytenza given names now spawn with 2/3/4 Hangul syllable weighting (85%/12.5%/2.5%) while surnames stay single-syllable.
- Promo pushes now work on scheduled tracks, banking pre-release momentum into launch.
- Music video promos unlock after release and are single-use per track, with disabled card states when unavailable.

## 2025-12-26 (RLS-PATCH-20251226-0307Z)
- Starting preferences now auto-fill two distinct Themes and Moods and normalize duplicates so Create New always proceeds.
- Theme/Mood pairings now render as pill tags with a "but it's" connector across trends, tracks, charts, and genre previews.

## 2025-12-26 (RLS-PATCH-20251226-0248Z)
- Calendar tabs no longer compress under the Calendar header.
- Rival calendar events now show label color cues in the grid and list views.
- Theme/mood selects now surface theme colors and mood emojis, including start preferences and filters.

## 2025-12-26 (RLS-PATCH-20251226-0243Z)
- Bytenza surnames now use single Hangul syllable blocks; given names now span 2-4 syllable blocks.

## 2025-12-26 (RLS-PATCH-20251226-0233Z)
- Creator name pools now store full given/surname parts, with Bytenza names using Hangul + romanized variants and surname-first ordering.
- Creator name displays now stack Hangul over romanized labels and apply the Korean font treatment.

## 2025-12-25 (RLS-PATCH-20251226-0231Z)
- CCC signing rejections now log why a Creator declined and show a short reason on locked CCC cards until the 12AM refresh.
- Tutorial now separates game loops from game concepts and calls out creator signing decision logic.

## 2025-12-25 (RLS-PATCH-20251226-0247Z)
- Critical runtime errors now surface as non-blocking, auto-dismiss in-app toasts (console logging remains the default elsewhere).

## 2025-12-25 (RLS-PATCH-20251226-0226Z)
- Starting preferences now require two distinct Themes and Moods before creating a new game slot.
- Added dice randomize controls for individual Theme/Mood picks, both Themes, both Moods, or all four.

## 2025-12-25 (RLS-PATCH-20251226-0206Z)
- Header Top Labels/Top Trends now include persistent "More" buttons that open a draggable, scrollable rankings window (Top 8 labels, Top 40 trends).
- Removed Top Labels/Top Trends panels from the Community view.

## 2025-12-25 (RLS-PATCH-20251226-0145Z)
- Community rankings now use separate size toggles: Labels (Top 3/Top 8) and Trends (Top 3/Top 40).

## 2025-12-25 (RLS-PATCH-20251225-1717Z)
- Guarded Creator roster rendering when the roster panel isn't mounted to prevent CCC sign crashes.

## 2025-12-25 (RLS-PATCH-20251225-1708Z)
- Fixed Calendar view rendering crash caused by a missing CalendarView import.

## 2025-12-25 (RLS-PATCH-20251225-1656Z)
- Calendar week headers now follow the projected week start day to remove one-day offsets.
- Upcoming calendar list now anchors to the next in-game week even when scrolling the grid.

## 2025-12-25 (RLS-PATCH-20251225-1644Z)
- UI render/DOM helpers now live in `src/app/ui/`, with game logic calling `uiHooks` for UI refreshes.
- Creator name pools moved into `src/app/game/names.ts`, sourced from the Record Label Simulator vocabulary and mapped to regional lore.
- Added `npm run report:lines` to regenerate `docs/reports/file-line-counts.csv`.

## 2025-12-25 (RLS-PATCH-20251225-1637Z)
- Service worker now fetches scripts/styles from the network first to avoid stale cached builds.
- Localhost and `?sw=off` runs auto-unregister old service workers and clear RLS caches (one-time reload).

## 2025-12-25 (RLS-PATCH-20251225-1628Z)
- Week boundaries now anchor to Sunday 00:00 UTC for week labels and calendar ranges.

## 2025-12-25 (RLS-PATCH-20251225-1620Z)
- Added safe quarter-hour defaults to prevent missing constant crashes when cached data assets lag behind.

## 2025-12-25 (RLS-PATCH-20251225-1614Z)
- Fixed weekly update logging crash caused by a missing timer reference.

## 2025-12-25 (RLS-PATCH-20251225-1605Z)
- Rival competitive rollout mode now guarantees one deterministic anchor rival per planning cycle, with additional rivals joining only when budget gates pass.
- Rival husk plans now commit to multi-week windows while keeping releases on Friday 00:00 and promos gated by budget + facility capacity.

## 2025-12-25 (RLS-PATCH-20251225-1604Z)
- Simulation ticks now advance in quarter-hour increments while keeping the clock display hour-only.
- Work order stamina and scheduled events now resolve on quarter-hour ticks with minute-gated weekly triggers.
- Progress bars now interpolate smoothly across quarter-hour updates.

## 2025-12-25 (RLS-PATCH-20251225-1600Z)
- Rival labels now plan releases/promos from a shared husk library (starter + completed era husks) using deterministic trend/alignment/budget scoring.
- Rival schedules snap releases to Friday 00:00 and promo events to whole-hour timestamps with duplicate-week guards and fallback to starter cadence.
- Rival promo budgets now use a fixed AI wallet percentage instead of player auto promo settings.

## 2025-12-25 (RLS-PATCH-20251225-1552Z)
- Rollout Strategies now persist per Era/Act with weekly drop/event husks, manual expansion, and auto-run gating that logs deterministic block reasons.
- Calendar projection now includes scheduled rollout events alongside release queue entries (all timestamps snap to whole-hour cadence; releases at Friday 00:00).
- Era completion generates a reusable "what happened" rollout husk with an opt-out flag to limit save bloat.

## 2025-12-25 (RLS-PATCH-20251225-1545Z)
- Rival AI now selects rollout husks (starter + era-derived) to schedule releases and promo events in the rival queue.
- Rollout events are tracked in `state.scheduledEvents` and surface in Calendar projections alongside scheduled releases.
- Rival promo budgets now use a fixed wallet-percentage independent of player auto promo settings.
- Era rollout strategy controls now create strategies, add drops/events, and expand schedules to the calendar.

## 2025-12-25 (RLS-PATCH-20251225-1530Z)
- Create pipeline now puts Recommend creator(s) above each stage start button and surfaces a short reason when start is disabled.
- Start buttons stay gated by stage prerequisites (inputs, assignments, cash, studio slots) while existing validation still blocks invalid creation.

## 2025-12-25 (RLS-PATCH-20251225-1522Z)
- Release Desk now schedules "Release ASAP" drops for the next Friday 00:00 and shows the scheduled time under the button.

## 2025-12-25 (RLS-PATCH-20251225-1327Z)
- Eras Tracks panel now includes a History tab that lists weekly chart positions per chart with DNC for non-charting weeks.

## 2025-12-25 (RLS-PATCH-20251225-1316Z)
- Restored market track active/archive limits so chart pagination no longer throws a ReferenceError.

## 2025-12-25 (RLS-PATCH-20251225-1258Z)
- Guarded quest rendering when `questList` is missing to prevent route crashes.

## 2025-12-25 (RLS-PATCH-20251225-1255Z)
- Release stamp updated; no gameplay changes.

## 2025-12-25 (Economy + Creator Skill)
- Content production now charges per stage with new cost tiers (Sheet/Demo/Master) and skill-based scaling.
- Stage availability checks now consider per-stage costs for Sheet/Demo/Master.
- Track quality now uses stamina-adjusted creator skill plus modifier impact.
- Creator skill now grows on stage completion and decays after sustained inactivity.
- CCC signing now applies market pressure (supply + heat) to signing costs and acceptance odds.
- Focus Era status now includes stage info for faster decisions.

## 2025-12-25 (Hourly Ticks + Overuse)
- Hourly resource ticks now show stamina recharge/depletion each in-game hour, including per-hour work-order spending.
- Added daily stamina usage tracking + overuse strike audit logs, plus a Resource Tick Summary panel in Logs.
- Producer recommendations/auto-assign now avoid daily overuse thresholds and log clearer overuse/departure triggers.

## 2025-12-25 (RLS-PATCH-20251225-1241Z)
- Release stamps now use timestamped patch IDs; service worker cache versions align with the release stamp.
- Live-edit guardrails added (auto-save on pagehide/visibility, safe-mode on init failure, and a `?sw=off` escape hatch).
- Canon governance established: `docs/` is canon and GitHub is the tie-breaker; Drive mirrors GitHub.
- Unity retcon policy established for Unity-era content and terminology.
- Contradiction closure workflow defined (TODO -> Docs -> Code -> Patch Notes).
- Agent instructions standardized (`AGENTS.md` and updated Copilot instructions).
- Weekly cadence now separates release processing (Fri 00:00), trend refresh (Fri 12:00), and charts update (Sat 00:00).
- Scheduled releases now require future in-game dates; the release queue triggers drops once the timestamp is reached.
- Trends now refresh weekly from a rolling 28-day ledger and feed a unified ranking across non-community surfaces.
- Top Trends summary now lives in the header as a top-3 list alongside Top Labels.
- Community tab now offers Top 8/Top 40 toggles for labels and trends, with a "More" action on #1 to open full lists.
- Modern mode now seeds the trend ledger from kickoff charts so Community trends populate immediately.
- CCC signing now deducts cash only on success; rejected attempts lock the Sign button until the next 12AM refresh; precondition failures do not lock out; CCC signing docs added.
- CCC market pool now persists across reloads until the daily/manual refresh; added preferred Theme/Mood filters and sorting by preference or quality (skill).
- Broadcast Studios now gate interviews and live performances with day-based slot availability (Sunday-heavy).
- Filming Studio slots now gate music videos and eyeriSocial ads; ads cost more and post as multimedia promos.
- Promotions tab now supports multi-select promo types and houses the eyeriSocial feed (renamed from the Social tab).
- Promotions tab no longer shows Loss Archives or Debug Bundle export; loss logging stays internal for balance review.
- Auto promo now spends a wallet-percentage budget (default 5%) per promo type for both player and rival labels.
- Create Content now shows Sheet/Demo/Master as side-by-side columns with available counts, per-stage studio lists, and always-visible start buttons (disabled until requirements are met).
- Calendar view now projects scheduling into a grid from existing release queues; Releases is labeled Calendar, and the Eras calendar panel is merged into the Calendar view (list modal retained).
- Calendar grid now renders a 6-week window with preview weeks and snap navigation (wheel/drag/touch) that only shifts the calendar anchor.
- Summary: weekly timing split (release/trends/charts), rolling trends with global/community views, and new promo facilities (broadcast/filming + ads).

## Patch Note Codes
- PN-20251227-AC01 (2025-12-27 20:02Z): Tour auto-generation now clusters dates by region, respects travel-buffer gaps, and stops at tier length caps.
- PN-20251227-AC02 (2025-12-27 20:02Z): Tour booking logs now include tour IDs; leg recap logs and eyeriSocial posts fire when dates resolve.
- PN-20251227-AC03 (2025-12-27 20:02Z): Tour summaries now list regional leg counts, and cooldown warnings surface when tours stack too tightly.
- PN-20251227-AC04 (2025-12-27 20:21Z): Creator given-name pools now respect gender identity filters, and creator cards show gender identity beside age.
- PN-20251227-AC05 (2025-12-27 20:39Z): Tour dates and promo runs now spend pooled act stamina (members cover for each other), applied to player + rival labels with overdraw warnings.
