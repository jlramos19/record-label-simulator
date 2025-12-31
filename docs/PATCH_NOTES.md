# Patch Notes

## 2025-12-31 (RLS-PATCH-20251231-1326Z)
- Charts now include a Rollout Strategies tab with plan usage, outcomes, preference signals, cadence, and rival adoption odds for analytics. [PN-20251231-AC117]
- Acts now track Active/Legacy lifecycles with reactivation on releases, CCC retention preserves previously signed creators while disposable unsigneds despawn, and non-charting releases surface as DNC in archives/performance. [PN-20251231-AC118]

## 2025-12-31 (RLS-PATCH-20251231-1208Z)
- Debug bundle exports now include a promo overlap snapshot (scheduled promos + banked momentum), and pre-release momentum banking logs are emitted for player + rivals. [PN-20251231-AC116]

## 2025-12-31 (RLS-PATCH-20251231-1205Z)
- Harmony Hub Acts now shows a Current Acts roster with selection that sets Create/Release targets, plus act summaries and inline rename. [PN-20251231-AC115]

## 2025-12-31 (RLS-PATCH-20251231-1100Z)
- Exported `renderActNameByNation` from the game module so UI render imports resolve and boot doesn't halt. [PN-20251231-AC114]

## 2025-12-31 (RLS-PATCH-20251231-1046Z)
- Chart history queries now cache week lists and reset failed IndexedDB opens to recover faster from blocked upgrades. [PN-20251231-AC113]

## 2025-12-31 (RLS-PATCH-20251231-1029Z)
- Boot diagnostics now surface missing global data/DOM roots and prompt a reload when the release stamp changes, preventing stale cached builds from leaving the UI unresponsive. [PN-20251231-AC110]
- UI render hooks now coalesce into a single animation frame to cut full rerender/save churn during fast sim ticks. [PN-20251231-AC111]
- IndexedDB chart history now uses compound indexes plus a week metadata store with cached lookups for faster chart-week queries. [PN-20251231-AC112]

## 2025-12-31 (RLS-PATCH-20251231-0940Z)
- Tour dates now sell DVD merch from released or shelved catalog inventory (scheduled-only blocked), consuming units and logging sale details. [PN-20251231-AC109]
- Release Desk now shows a shelved-physical readiness badge next to physical eligibility for faster physical planning. [PN-20251231-AC108]
- Shelved releases now represent the physical/legacy lifecycle, generating long-tail catalog sales from tracked inventory and tagging tour merch pulls against shelved stock. [PN-20251231-AC107]
- Release execution now gates scheduled releases by releaseAt, applies banked pre-release momentum on launch week for player + rival queues, clears banked momentum deterministically, and logs the applied momentum to prevent double-release. [PN-20251231-AC106]
- Track release status is now canonical (unreleased → scheduled → released → shelved) across UI, promos, logs, and release execution for player + rival content, with save migration defaults. [PN-20251231-AC105]

## 2025-12-31 (RLS-PATCH-20251231-0833Z)
- Promotions now allow scheduled targets, bank pre-release momentum, and convert it on release for player + rival launches, with updated promo messaging. [PN-20251231-AC104]

## 2025-12-31 (RLS-PATCH-20251231-0825Z)
- Label Settings now apply alignment changes consistently from the dropdown or confirm button, with status feedback when the label state is unavailable. [PN-20251231-AC103]

## 2025-12-31 (RLS-PATCH-20251231-0835Z)
- Rival AutoOps now runs weekly with deterministic plan selection, budgets, release/promo/tour scheduling, and blocker + action observability logs. [PN-20251231-AC102]

## 2025-12-31 (RLS-PATCH-20251231-0810Z)
- Monopoly checks now read internal Top-K evaluation pools (1000/400/100) across track/promo/tour scopes and log dominance detection telemetry so losses only trigger under full-pool control. [PN-20251231-AC101]

## 2025-12-31 (RLS-PATCH-20251231-0752Z)
- Charts now compute internal Top-K evaluation pools (1000/400/100) to drive dominance telemetry and rival pacing while keeping visible charts at 100/40/10. [PN-20251231-AC100]

## 2025-12-31 (RLS-PATCH-20251231-0749Z)
- Harmony Hub now splits into Acts and Creators views, and the Menu groups navigation into era stages plus a World bucket for Calendar/Community/Rivals. [PN-20251231-AC99]

## 2025-12-31 (RLS-PATCH-20251231-0745Z)
- Bytenese and Crowlish branding now tags Hangul/Spanish-accented content names, including creator stage names and track/project titles. [PN-20251231-AC98]

## 2025-12-31 (RLS-PATCH-20251231-0723Z)
- Bytenese and Crowlish content names now render with language-specific fonts and in-game language branding. [PN-20251231-AC97]

## 2025-12-31 (RLS-PATCH-20251231-0620Z)
- Rival Rosters now open in a dedicated floating window from the Menu and label pills, with roster selection synced across the window and Community panel. [PN-20251231-AC95]
- Guardrails now ignore extension-origin errors, and GitHub Pages loads assets from a base href so the menu layout stays stable. [PN-20251231-AC96]

## 2025-12-31 (RLS-PATCH-20251231-0520Z)
- React SPA now ships as a bundled static entry so `/ui-react/` works off the main server without Vite. [PN-20251231-AC94]

## 2025-12-31 (RLS-PATCH-20251231-0514Z)
- React SPA dev now runs on port 5174, with the islands preview moved to 5175 so both can be run without collisions. [PN-20251231-AC93]

## 2025-12-31 (RLS-PATCH-20251231-0511Z)
- Pinned Node 24 LTS + npm 11, added version files, and documented pnpm 10.26+ as an optional toolchain. [PN-20251231-AC92]

## 2025-12-31 (RLS-PATCH-20251231-0501Z)
- Main navigation tabs now live inside a hamburger menu with a floating toggle that docks top-left on desktop and bottom-right on mobile for cleaner responsive layout. [PN-20251231-AC90]
- Added optional User Timing profiling for sim ticks with sampling controls plus a DevTools capture checklist for perf audits. [PN-20251231-AC91]
- IndexedDB now defines event logs, release production views, and KPI snapshots with queryable indexes. [PN-20251231-AC92]

## 2025-12-29 (RLS-PATCH-20251229-0708Z)
- Added a dedicated Achievements hub (nav + dashboard card) that lists the 12 CEO Requests with statuses, progress bars, and Go To buttons so the win checklist is one click away. [PN-20251229-AC86]
- Navigation now forces view renders with a quick "switching view" toast, Save Now toasts show timestamp + location, autosave status appears in the HUD, and settings expose a Save Location change control so saving feels reliable. [PN-20251229-AC87]

## 2025-12-29 (RLS-PATCH-20251229-0837Z)
- Road to the Top now keeps the nav tabs in view with larger hit targets, the secondary Charts controls only render when Charts is active, and the monopoly/auto-create indicators spell out the blockers plus next-run countdowns. [PN-20251229-AC88]
- The Creator Community Chamber and Harmony Hub keep their columns visible under role filters, show multi-act badges with popovers, highlight slot drag/drop targets, and deliver signing/save toasts so the workflow feels clear. [PN-20251229-AC89]

## 2025-12-28 (RLS-PATCH-20251228-1138Z)
- Chart history panels now cache snapshot entry lookups and archive market-track maps to cut rerender scans. [PN-20251228-AC84]
- Release scheduling now enforces distribution lead times, supports digital rush fees, gates physical drops by quality/fan thresholds, and surfaces regional inventory/store capacity on the Release Desk. [PN-20251228-AC85]

## 2025-12-28 (RLS-PATCH-20251228-1126Z)
- External storage prompts now skip unsupported origins and persist cancel/skip choices to stop re-prompting. [PN-20251228-AC82]
- Monopoly losses now stay in a soft-loss state (achievements disabled) even after Year 4000 so play can continue. [PN-20251228-AC83]

## 2025-12-28 (RLS-PATCH-20251228-1028Z)
- Time control buttons now stack parenthetical speed/skip details under the main label for quicker scanning. [PN-20251228-AC77]
- Local storage writes now preflight log/settings payloads, warn on quota, and capture storage health diagnostics. [PN-20251228-AC79]
- Usage sessions now flush on visibility changes and debug bundle exports; external mirror failures keep local copies and log diagnostics. [PN-20251228-AC80]
- Chart worker requests now time out and clear pending promises on termination to avoid leaks. [PN-20251228-AC81]
- Fast sim now throttles chart/market renders, uses cached market-track lookups, and logs perf timings to cut stutter; chart snapshots no longer double-assign `projectType`. [PN-20251228-AC78]

## 2025-12-28 (RLS-PATCH-20251228-1014Z)
- Chart scoring jitter is now deterministic per week/scope/track to prevent flicker and non-repro ordering. [PN-20251228-AC75]
- Added chart determinism diagnostics (worker parity logs, console harness, and monopoly share checks). [PN-20251228-AC76]

## 2025-12-28 (RLS-PATCH-20251228-0946Z)
- External storage prompts now respect secure contexts and remember a skip choice so the save folder dialog stops blocking play. [PN-20251228-AC72]
- Monopoly losses now record a loss, disable achievements, and let the run continue instead of forcing a slot exit. [PN-20251228-AC73]
- Track quality potential now uses deterministic per-track jitter so refreshes stop re-rolling scores. [PN-20251228-AC74]

## 2025-12-28 (RLS-PATCH-20251228-0900Z)
- Added a Patch Notes portal view with a designed landing page that links to docs/PATCH_NOTES.md for the full release history. [PN-20251228-AC70]
- Tutorial Roles now marks rent/plan as live, and the tutorial adds leasing + touring guidance. [PN-20251228-AC71]

## 2025-12-28 (RLS-PATCH-20251228-0834Z)
- Rival rosters now surface KPI summaries, consumption share breakdowns, era completion drawers, and player-vs-rival deltas with data-staleness warnings. [PN-20251228-AC69]

## 2025-12-28 (RLS-PATCH-20251228-0829Z)
- Rivalry KPI snapshots now compute label consumption share, profitability, and near-term release/tour net projections for UI/logs. [PN-20251228-AC68]

## 2025-12-28 (RLS-PATCH-20251228-0826Z)
- Touring Budget + Staffing now shows tour readiness (stamina + skill + upcoming dates), crew endurance details, and fatigue/overuse risk callouts. [PN-20251228-AC66]
- Release Desk project summaries now include revenue, cost inputs, and net profit per project. [PN-20251228-AC67]

## 2025-12-28 (RLS-PATCH-20251228-0742Z)
- Harmony Hub now offers Quick Group Act filters for gender identity, age group, preferred theme/mood, act alignment, and skill level range. [PN-20251228-AC63]
- Release hygiene pass refreshed the README update stamp and patch note registry. [PN-20251228-AC64]
- Rival rollout planning now uses projected net gates, cadence + stamina roster targets, and CEO Request action biasing with logged plan reasons. [PN-20251228-AC65]

## 2025-12-28 (RLS-PATCH-20251228-0730Z)
- CCC rejected creators now drop to the bottom of CCC lists within the active sort mode. [PN-20251228-AC61]
- Release Desk now lets you scrap mastered tracks, clearing them from the pipeline before release. [PN-20251228-AC62]

## 2025-12-28 (RLS-PATCH-20251228-0729Z)
- Label settings now include a confirm alignment button with a logged status line, and the alignment control row now stacks on smaller screens. [PN-20251228-AC60]

## 2025-12-28 (RLS-PATCH-20251228-0709Z)
- Harmony Hub acts now wrap inside a capped grid so the Quick Act button stays put as the list grows. [PN-20251228-AC59]

## 2025-12-28 (RLS-PATCH-20251228-0601Z)
- Create view creator slots now fall back to legacy rendering when the React island is not mounted (e.g., after route changes). [PN-20251228-AC58]

## 2025-12-28 (RLS-PATCH-20251228-0506Z)
- Road to the Top tasks now refresh once per day at 12AM UTC; weekly and award-triggered refreshes were removed. [PN-20251228-AC52]
- UI typography now uses Ubuntu for body copy with Ubuntu Mono reserved for headings and headers. [PN-20251228-AC53]
- Label HUD now shows cash only, with a More toggle for studios, slots, and focus-era status. [PN-20251228-AC54]
- Header actions now stack into a 2x3 grid and include an Alerts button that consolidates Create/Release notifications (nav badges removed). [PN-20251228-AC55]
- Signed Creator IDs now wrap to fit available width instead of forcing three columns. [PN-20251228-AC56]
- Calendar split handles now capture pointer drags reliably so the Calendar vs Structures & Slots split can resize. [PN-20251228-AC57]

## 2025-12-28 (RLS-PATCH-20251228-0438Z)
- Removed the `dev:logs` workflow (and Puppeteer) so dev runs no longer generate a dedicated Edge profile in the repo. [PN-20251228-AC50]
- Usage session persistence now batches localStorage writes and only mirrors to external storage on session end/errors. [PN-20251228-AC51]

## 2025-12-28 (RLS-PATCH-20251228-0433Z)
- Favicon now swaps between light and dark variants based on system theme. [PN-20251228-AC49]

## 2025-12-28 (RLS-PATCH-20251228-0331Z)
- Creator portrait optimization now supports a watch mode (`npm run watch:portraits`) to auto-process new or changed images. [PN-20251228-AC47]
- Act/creator/track/rival lookups now use cached indexes to cut repeated scans across UI and gameplay views. [PN-20251228-AC48]

## 2025-12-28 (RLS-PATCH-20251228-0319Z)
- Signed creators now take a daily catharsis inactivity debuff after 6 months idle; the debuff only affects catharsis and recovers linearly over 14 days after use. [PN-20251228-AC44]
- Promo runs and tour dates now award small uncapped skill progress to signed creators (player + rival). [PN-20251228-AC45]
- Community rival label pills now open a Rival Rosters panel with their creators and acts. [PN-20251228-AC46]

## 2025-12-28 (RLS-PATCH-20251228-0315Z)
- Local saves now debounce and preflight size to avoid localStorage quota exceptions during heavy sim runs. [PN-20251228-AC39]
- World/Community view now throttles heavy market renders while time is running; UI actions force immediate refresh. [PN-20251228-AC40]
- Internal Log now includes Export Debug Bundle downloads for sharing usage sessions and system logs. [PN-20251228-AC41]
- Creator portrait builds can generate optimized assets via `npm run optimize:portraits`; builds prefer the optimized folder when present. [PN-20251228-AC42]
- Fast time skips now suppress weekly UI renders to keep long jumps responsive. [PN-20251228-AC43]

## 2025-12-28 (RLS-PATCH-20251228-0313Z)
- Rollout Plans now support multi-focus targets (Era, Release, Project, Tour, Campaign) with a shared Plan Library that tracks usage, outcomes, and market trend-rank context across labels. [PN-20251228-AC37]
- Week-numbered UI labels and selectors now render compact date ranges (YY-MMM-DD to YY-MMM-DD) across dashboards, charts, calendars, tours, promos, and rollout planning windows. [PN-20251228-AC38]

## 2025-12-28 (RLS-PATCH-20251228-0246Z)
- Awards now include a Year-End Charts tab with chart-type leaders and detail rankings from the annual ledger. [PN-20251228-AC35]
- Road to the Top tabs now stay pinned above Charts/Requests content so the view switcher stays visible. [PN-20251228-AC36]

## 2025-12-28 (RLS-PATCH-20251228-0228Z)
- Harmony Hub creator cards now keep their layout when the creators panel is resized. [PN-20251228-AC34]

## 2025-12-28 (RLS-PATCH-20251228-0225Z)
- Wide-screen layouts now respect single-column views (including Calendar), preventing an empty right column from stealing space. [PN-20251228-AC33]

## 2025-12-28 (RLS-PATCH-20251228-0210Z)
- On startup, the game now prompts to pick a save folder so save slots can sync to external storage. [PN-20251228-AC32]

## 2025-12-28 (RLS-PATCH-20251228-0155Z)
- Save writes now guard against local storage quota errors, warning to configure External Storage instead of crashing. [PN-20251228-AC31]

## 2025-12-28 (RLS-PATCH-20251228-0057Z)
- Harmony Hub now splits Acts and Creators into resizable panels. [PN-20251228-AC27]
- Calendar now splits Calendar and Structures & Slots into a resizable split view. [PN-20251228-AC28]
- Create Advanced now expands studio slots to full role limits (15 Songwriters, 10 Recorders, 5 Producers). [PN-20251228-AC29]
- Release project drafting now ignores unmastered tracks and waits for Act assignments before summarizing projects. [PN-20251228-AC30]
- Dark mode palette now anchors on `#0a0703`, with retuned panels, lines, text, and surfaces for deeper contrast. [PN-20251228-AC31]

## 2025-12-28 (RLS-PATCH-20251228-0116Z)
- Year-end awards now reveal nominees on the scheduled reveal date, cap nominee lists to 3-12 per category, and keep award show nomination counts hidden until reveal. [PN-20251228-AC27]

## 2025-12-28 (RLS-PATCH-20251228-0047Z)
- Promotions now notify when award performance bid windows open, with bid controls gated by active-era acts and show-specific quality ranges. [PN-20251228-AC25]

## 2025-12-28 (RLS-PATCH-20251228-0026Z)
- Ranking "More" windows now open anchored to the clicked button, stay draggable from the header, and avoid top-left spawns. [PN-20251228-AC21]
- Trend surfaces now share a unified ranking feed with backfill to keep early lists populated and balanced. [PN-20251228-AC22]
- Roster is now labeled Signed, and the roster view drops the Communities side panel. [PN-20251228-AC23]
- Creator act "See more" popovers now use a solid panel background for better readability. [PN-20251228-AC24]
- Tour drafts now append ARENA/STADIUM/WORLD to the name when bookings cover all arenas, all stadiums, or every nation. [PN-20251228-AC25]
- Quick Act now skips duplicate member lineups; it warns when only existing lineups are available. [PN-20251228-AC26]

## 2025-12-27 (RLS-PATCH-20251227-2352Z)
- Awards category selection now re-renders safely to prevent the Best-Selling Track click crash. [PN-20251227-AC19]
- Main nav notification badges now sit below labels instead of inline. [PN-20251227-AC20]

## 2025-12-27 (RLS-PATCH-20251227-2318Z)
- Awards now run annually per show schedule with yearlong eligibility windows and an expanded critics/audience/hybrid lineup. [PN-20251227-AC17]

## 2025-12-27 (RLS-PATCH-20251227-2254Z)
- Creator cards now show the most popular act beside catharsis, with a See more popover for full act memberships. [PN-20251227-AC12]
- Track title generation now deprioritizes repeats, while act/project auto-names avoid duplicate names across player + market pools. [PN-20251227-AC13]
- Tour drafts now auto-name from the active era/project anchor to keep tour names aligned with release branding. [PN-20251227-AC14]
- Project release tasks now target EP/Album releases (Singles excluded). [PN-20251227-AC15]
- Chart history snapshots now retain project types so Projects charts label releases correctly across weeks. [PN-20251227-AC16]
- Added an Awards tab with year selectors, dynamic categories, and nominee detail views that highlight winners. [PN-20251227-AC17]
- Fixed award show nomination locking to avoid a runtime crash during extended-window nominee checks. [PN-20251227-AC18]

## 2025-12-27 (RLS-PATCH-20251227-2245Z)
- Tour charts now include simulated rival tour entries so touring awards stay competitive across all labels. [PN-20251227-AC07]
- CEO Requests now show expandable label race rows with per-request progress bars for all labels. [PN-20251227-AC08]
- CEO Requests now show WON/WON xN after completed wins, and bailout runs keep progress tracking while flagging leaderboard eligibility. [PN-20251227-AC12]
- Win-track HUD copy now reflects the monopoly-loss rule through the full timeline. [PN-20251227-AC09]
- GitHub Pages deployment now builds the root + UI React bundles and publishes the assembled `site/` folder on main pushes. [PN-20251227-AC10]
- Monthly award shows now schedule nominations, live performance slots, winner boosts, and task progress with calendar + Promotions visibility. [PN-20251227-AC11]

## 2025-12-27 (RLS-PATCH-20251227-2152Z)
- Label settings moved out of Signed and into a header button beside the label summary. [PN-20251227-AC31]
- Calendar defaults to a 2/3 split between Calendar and Structures, and the Upcoming footer can collapse to a compact bar. [PN-20251227-AC32]

## 2025-12-27 (RLS-PATCH-20251227-2110Z)
- Simulation ticks now batch quarter-hour processing and surface a catch-up warning to keep fast-forward runs responsive. [PN-20251227-AC06]

## 2025-12-27 (RLS-PATCH-20251227-2104Z)
- PEAKING status now tracks top-5 streaks with a WK badge starting at week 2, while EMERGING pauses the streak counter.
- AI trend-chasing now ramps down after 8 top-5 weeks, reaching full disinterest by week 16 for creation and promo choices.

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
- Rival focus themes/moods now adapt to rollout plan trend tags as rollout templates evolve.

## 2025-12-26 (RLS-PATCH-20251226-0456Z)
- Rival rollout planning now preserves a cash reserve while scaling lease costs, so more labels schedule releases and promo.
- Era completion now records outcomes (Flop/Mid/Successful/Iconic) from track economy and alignment, surfaced in logs/social.
- Rollout strategy planner now shows base vs inflation-adjusted promo budget estimates with planned totals and per-type breakdowns.
- Era plan snapshot generation now includes archived market releases; promo spend is tracked per track.

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
- Rival rollout plans now commit to multi-week windows while keeping releases on Friday 00:00 and promos gated by budget + facility capacity.

## 2025-12-25 (RLS-PATCH-20251225-1604Z)
- Simulation ticks now advance in quarter-hour increments while keeping the clock display hour-only.
- Work order stamina and scheduled events now resolve on quarter-hour ticks with minute-gated weekly triggers.
- Progress bars now interpolate smoothly across quarter-hour updates.

## 2025-12-25 (RLS-PATCH-20251225-1600Z)
- Rival labels now plan releases/promos from a shared rollout plan library (starter + completed era plans) using deterministic trend/alignment/budget scoring.
- Rival schedules snap releases to Friday 00:00 and promo events to whole-hour timestamps with duplicate-week guards and fallback to starter cadence.
- Rival promo budgets now use a fixed AI wallet percentage instead of player auto promo settings.

## 2025-12-25 (RLS-PATCH-20251225-1552Z)
- Rollout Strategies now persist per Era/Act with weekly drop/event plan slots, manual expansion, and auto-run gating that logs deterministic block reasons.
- Calendar projection now includes scheduled rollout events alongside release queue entries (all timestamps snap to whole-hour cadence; releases at Friday 00:00).
- Era completion generates a reusable "what happened" rollout plan snapshot with an opt-out flag to limit save bloat.

## 2025-12-25 (RLS-PATCH-20251225-1545Z)
- Rival AI now selects rollout plans (starter + era-derived) to schedule releases and promo events in the rival queue.
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
- PN-20251231-AC117 (2025-12-31 13:26Z): Charts now include a Rollout Strategies tab with plan usage, outcomes, preference signals, cadence, and rival adoption odds for analytics.
- PN-20251231-AC118 (2025-12-31 13:26Z): Acts now track Active/Legacy lifecycles with reactivation on releases, CCC retention preserves previously signed creators while disposable unsigneds despawn, and non-charting releases surface as DNC in archives/performance.
- PN-20251231-AC116 (2025-12-31 12:08Z): Debug bundle exports now include a promo overlap snapshot (scheduled promos + banked momentum), and pre-release momentum banking logs are emitted for player + rivals.
- PN-20251231-AC115 (2025-12-31 12:05Z): Harmony Hub Acts now shows a Current Acts roster with selection that sets Create/Release targets, plus act summaries and inline rename.
- PN-20251231-AC114 (2025-12-31 11:00Z): Exported `renderActNameByNation` from the game module so UI render imports resolve and boot doesn't halt.
- PN-20251231-AC109 (2025-12-31 10:20Z): Tour dates now sell DVD merch from released or shelved catalog inventory (scheduled-only blocked), consuming units and logging sale details.
- PN-20251231-AC108 (2025-12-31 09:40Z): Release Desk now shows a shelved-physical readiness badge next to physical eligibility for faster physical planning.
- PN-20251231-AC107 (2025-12-31 09:40Z): Shelved releases now represent the physical/legacy lifecycle, generating long-tail catalog sales from tracked inventory and tagging tour merch pulls against shelved stock.
- PN-20251231-AC106 (2025-12-31 09:40Z): Release execution now gates scheduled releases by releaseAt, applies banked pre-release momentum on launch week for player + rival queues, clears banked momentum deterministically, and logs the applied momentum to prevent double-release.
- PN-20251231-AC105 (2025-12-31 09:40Z): Track release status is now canonical (unreleased → scheduled → released → shelved) across UI, promos, logs, and release execution for player + rival content, with save migration defaults.
- PN-20251231-AC104 (2025-12-31 08:33Z): Promotions now allow scheduled targets, bank pre-release momentum, and convert it on release for player + rival launches, with updated promo messaging.
- PN-20251231-AC103 (2025-12-31 08:25Z): Label Settings now apply alignment changes consistently from the dropdown or confirm button, with status feedback when the label state is unavailable.
- PN-20251231-AC102 (2025-12-31 08:35Z): Rival AutoOps now runs weekly with deterministic plan selection, budgets, release/promo/tour scheduling, and blocker + action observability logs.
- PN-20251231-AC101 (2025-12-31 08:10Z): Monopoly checks now read internal Top-K evaluation pools (1000/400/100) across track/promo/tour scopes and log dominance detection telemetry so losses only trigger under full-pool control.
- PN-20251231-AC100 (2025-12-31 07:52Z): Charts now compute internal Top-K evaluation pools (1000/400/100) to drive dominance telemetry and rival pacing while keeping visible charts at 100/40/10.
- PN-20251231-AC99 (2025-12-31 07:49Z): Harmony Hub now splits into Acts and Creators views, and the Menu groups navigation into era stages plus a World bucket for Calendar/Community/Rivals.
- PN-20251231-AC98 (2025-12-31 07:45Z): Bytenese and Crowlish branding now tags Hangul/Spanish-accented content names, including creator stage names and track/project titles.
- PN-20251231-AC97 (2025-12-31 07:23Z): Bytenese and Crowlish content names now render with language-specific fonts and in-game language branding.
- PN-20251231-AC95 (2025-12-31 06:20Z): Rival Rosters now open in a dedicated floating window from the Menu and label pills, with roster selection synced across the window and Community panel.
- PN-20251231-AC96 (2025-12-31 06:20Z): Guardrails now ignore extension-origin errors, and GitHub Pages loads assets from a base href so the menu layout stays stable.
- PN-20251231-AC90 (2025-12-31 05:01Z): Main nav tabs are now housed in a hamburger menu with a floating toggle positioned top-left on desktop and bottom-right on mobile.
- PN-20251231-AC91 (2025-12-31 05:09Z): Added optional User Timing profiling for sim ticks with sampling controls plus a DevTools capture checklist for perf audits.
- PN-20251231-AC92 (2025-12-31 05:13Z): IndexedDB now defines event logs, release production views, and KPI snapshots with queryable indexes.
- PN-20251231-AC92 (2025-12-31 05:11Z): Pinned Node 24 LTS + npm 11, added version files, and documented pnpm 10.26+ as an optional toolchain.
- PN-20251231-AC93 (2025-12-31 05:14Z): React SPA dev now runs on port 5174, with the islands preview moved to 5175 so both can be run without collisions.
- PN-20251231-AC94 (2025-12-31 05:20Z): React SPA now ships as a bundled static entry so /ui-react/ works off the main server without Vite.
- PN-20251229-AC86 (2025-12-29 07:08Z): Added an Achievements hub with the full CEO Request checklist, progress, and deep-links plus dashboard summary access.
- PN-20251229-AC87 (2025-12-29 07:08Z): Navigation always renders active views (with a switching toast), Save Now toasts display timestamp/location, autosave HUD badge shows last run/interval, and Save Location can be changed from Settings.
- PN-20251229-AC88 (2025-12-29 08:37Z): Road to the Top tabs stay pinned with enlarged hit targets, Charts-only sub-controls render only under Charts, and the monopoly/auto-create indicators now list blockers plus upcoming run countdowns.
- PN-20251229-AC89 (2025-12-29 08:37Z): Creator Community Chamber and Harmony Hub keep role columns visible while showing filtered badges, multi-act inline lists, slot drag/drop focus cues, and signing/save toasts for clarity.
- PN-20251227-AC01 (2025-12-27 20:02Z): Tour auto-generation now clusters dates by region, respects travel-buffer gaps, and stops at tier length caps.
- PN-20251227-AC02 (2025-12-27 20:02Z): Tour booking logs now include tour IDs; leg recap logs and eyeriSocial posts fire when dates resolve.
- PN-20251227-AC03 (2025-12-27 20:02Z): Tour summaries now list regional leg counts, and cooldown warnings surface when tours stack too tightly.
- PN-20251227-AC04 (2025-12-27 20:21Z): Creator given-name pools now respect gender identity filters, and creator cards show gender identity beside age.
- PN-20251227-AC05 (2025-12-27 20:39Z): Tour dates and promo runs now spend pooled act stamina (members cover for each other), applied to player + rival labels with overdraw warnings.
- PN-20251227-AC06 (2025-12-27 21:10Z): Simulation ticks now batch quarter-hour processing and surface a catch-up warning to keep fast-forward runs responsive.
- PN-20251227-AC07 (2025-12-27 22:45Z): Tour charts now include simulated rival tour entries so touring awards stay competitive across all labels.
- PN-20251227-AC08 (2025-12-27 22:45Z): CEO Requests now show expandable label race rows with per-request progress bars for all labels.
- PN-20251227-AC09 (2025-12-27 22:45Z): Win-track HUD copy now reflects the monopoly-loss rule through the full timeline.
- PN-20251227-AC10 (2025-12-27 22:45Z): GitHub Pages deployment now builds the root + UI React bundles and publishes the assembled `site/` folder on main pushes.
- PN-20251227-AC11 (2025-12-27 22:31Z): Monthly award shows now schedule nominations, live performance slots, winner boosts, and task progress with calendar + Promotions visibility.
- PN-20251227-AC12 (2025-12-27 22:54Z): Creator cards now show the most popular act beside catharsis, with a See more popover for full act memberships.
- PN-20251227-AC13 (2025-12-27 22:54Z): Track title generation now deprioritizes repeats, while act/project auto-names avoid duplicate names across player + market pools.
- PN-20251227-AC14 (2025-12-27 22:54Z): Tour drafts now auto-name from the active era/project anchor to keep tour names aligned with release branding.
- PN-20251227-AC15 (2025-12-27 22:54Z): Project release tasks now target EP/Album releases (Singles excluded).
- PN-20251227-AC16 (2025-12-27 22:54Z): Chart history snapshots now retain project types so Projects charts label releases correctly across weeks.
- PN-20251227-AC12 (2025-12-27 22:49Z): CEO Requests now show WON/WON xN after completed wins, and bailout runs keep progress tracking while flagging leaderboard eligibility.
- PN-20251227-AC17 (2025-12-27 23:27Z): Added an Awards tab with year selectors, dynamic categories, and nominee detail views that highlight winners.
- PN-20251227-AC18 (2025-12-27 23:37Z): Fixed award show nomination locking to avoid a runtime crash during extended-window nominee checks.
- PN-20251227-AC17 (2025-12-27 23:18Z): Awards now run annually per show schedule with yearlong eligibility windows and an expanded critics/audience/hybrid lineup.
- PN-20251227-AC19 (2025-12-27 23:52Z): Fixed awards category selection crashing on missing active view render.
- PN-20251227-AC20 (2025-12-27 23:52Z): Main nav notification badges now stack below labels.
- PN-20251228-AC21 (2025-12-28 00:27Z): Ranking "More" windows now open anchored to the clicked button, stay draggable from the header, and avoid top-left spawns.
- PN-20251228-AC22 (2025-12-28 00:27Z): Trend surfaces now share a unified ranking feed with backfill to keep early lists populated and balanced.
- PN-20251228-AC23 (2025-12-28 00:27Z): Roster is now labeled Signed, and the roster view drops the Communities side panel.
- PN-20251228-AC24 (2025-12-28 00:27Z): Creator act "See more" popovers now use a solid panel background for better readability.
- PN-20251228-AC25 (2025-12-28 01:10Z): Tour drafts now append ARENA/STADIUM/WORLD to the name when bookings cover all arenas, all stadiums, or every nation.
- PN-20251228-AC26 (2025-12-28 01:10Z): Quick Act now skips duplicate member lineups; it warns when only existing lineups are available.
- PN-20251228-AC25 (2025-12-28 00:47Z): Promotions now notify when award performance bid windows open, with bid controls gated by active-era acts and show-specific quality ranges.
- PN-20251228-AC27 (2025-12-28 01:16Z): Year-end awards now reveal nominees on the scheduled reveal date, cap nominee lists to 3-12 per category, and keep award show nomination counts hidden until reveal.
- PN-20251228-AC27 (2025-12-28 00:57Z): Harmony Hub now splits Acts and Creators into resizable panels.
- PN-20251228-AC28 (2025-12-28 00:57Z): Calendar now splits Calendar and Structures & Slots into a resizable split view.
- PN-20251228-AC29 (2025-12-28 00:57Z): Create Advanced now expands studio slots to full role limits (15 Songwriters, 10 Recorders, 5 Producers).
- PN-20251228-AC30 (2025-12-28 00:57Z): Release project drafting now ignores unmastered tracks and waits for Act assignments before summarizing projects.
- PN-20251228-AC31 (2025-12-28 01:55Z): Save writes now guard against local storage quota errors, warning to configure External Storage instead of crashing.
- PN-20251228-AC32 (2025-12-28 02:10Z): On startup, the game now prompts to pick a save folder so save slots can sync to external storage.
- PN-20251227-AC31 (2025-12-27 21:52Z): Label settings moved out of Signed and into a header button beside the label summary.
- PN-20251227-AC32 (2025-12-27 21:52Z): Calendar defaults to a 2/3 split between Calendar and Structures, and the Upcoming footer can collapse to a compact bar.
- PN-20251228-AC31 (2025-12-28 01:52Z): Dark mode palette now anchors on #0a0703 with retuned panels, lines, text, and surface tones.
- PN-20251228-AC35 (2025-12-28 02:46Z): Awards now include a Year-End Charts tab with chart-type leaders and detail rankings from the annual ledger.
- PN-20251228-AC36 (2025-12-28 02:46Z): Road to the Top tabs now stay pinned above Charts/Requests content so the view switcher stays visible.
- PN-20251228-AC33 (2025-12-28 02:25Z): Wide-screen layouts now respect single-column views (including Calendar), preventing an empty right column from stealing space.
- PN-20251228-AC34 (2025-12-28 02:28Z): Harmony Hub creator cards now keep their layout when the creators panel is resized.
- PN-20251228-AC37 (2025-12-28 03:13Z): Rollout Plans now support multi-focus targets with a shared Plan Library that tracks usage, outcomes, and market trend-rank context across labels.
- PN-20251228-AC38 (2025-12-28 03:13Z): Week-numbered UI labels and selectors now render compact date ranges across dashboards, charts, calendars, tours, promos, and rollout planning windows.
- PN-20251228-AC39 (2025-12-28 03:15Z): Local saves now debounce and preflight size to avoid localStorage quota exceptions during heavy sim runs.
- PN-20251228-AC40 (2025-12-28 03:15Z): World/Community view now throttles heavy market renders while time is running; UI actions force immediate refresh.
- PN-20251228-AC41 (2025-12-28 03:15Z): Internal Log now includes Export Debug Bundle downloads for sharing usage sessions and system logs.
- PN-20251228-AC42 (2025-12-28 03:15Z): Creator portrait builds can generate optimized assets via npm run optimize:portraits; builds prefer the optimized folder when present.
- PN-20251228-AC43 (2025-12-28 03:15Z): Fast time skips now suppress weekly UI renders to keep long jumps responsive.
- PN-20251228-AC44 (2025-12-28 03:19Z): Signed creators now take a daily catharsis inactivity debuff after 6 months idle; the debuff only affects catharsis and recovers linearly over 14 days after use.
- PN-20251228-AC45 (2025-12-28 03:19Z): Promo runs and tour dates now award small uncapped skill progress to signed creators (player + rival).
- PN-20251228-AC46 (2025-12-28 03:19Z): Community rival label pills now open a Rival Rosters panel with their creators and acts.
- PN-20251228-AC47 (2025-12-28 03:31Z): Creator portrait optimization now supports a watch mode (npm run watch:portraits) to auto-process new or changed images.
- PN-20251228-AC48 (2025-12-28 03:33Z): Act/creator/track/rival lookups now use cached indexes to cut repeated scans across UI and gameplay views.
- PN-20251228-AC49 (2025-12-28 04:33Z): Favicon now swaps between light and dark variants based on system theme.
- PN-20251228-AC50 (2025-12-28 04:38Z): Removed the dev:logs workflow (and Puppeteer) so dev runs no longer generate a dedicated Edge profile in the repo.
- PN-20251228-AC51 (2025-12-28 04:38Z): Usage session persistence now batches localStorage writes and only mirrors to external storage on session end/errors.
- PN-20251228-AC52 (2025-12-28 05:06Z): Road to the Top tasks now refresh once per day at 12AM UTC; weekly and award-triggered refreshes were removed.
- PN-20251228-AC53 (2025-12-28 05:06Z): UI typography now uses Ubuntu for body copy with Ubuntu Mono reserved for headings and headers.
- PN-20251228-AC54 (2025-12-28 05:06Z): Label HUD now shows cash only, with a More toggle for studios, slots, and focus-era status.
- PN-20251228-AC55 (2025-12-28 05:06Z): Header actions now stack into a 2x3 grid and include an Alerts button that consolidates Create/Release notifications (nav badges removed).
- PN-20251228-AC56 (2025-12-28 05:06Z): Signed Creator IDs now wrap to fit available width instead of forcing three columns.
- PN-20251228-AC57 (2025-12-28 05:06Z): Calendar split handles now capture pointer drags reliably so the Calendar vs Structures & Slots split can resize.
- PN-20251228-AC58 (2025-12-28 06:01Z): Create view creator slots now fall back to legacy rendering when the React island is not mounted (e.g., after route changes).
- PN-20251228-AC59 (2025-12-28 07:09Z): Harmony Hub acts now wrap inside a capped grid so the Quick Act button stays put as the list grows.
- PN-20251228-AC60 (2025-12-28 07:29Z): Label settings now include a confirm alignment button with a logged status line, and the alignment control row now stacks on smaller screens.
- PN-20251228-AC61 (2025-12-28 07:30Z): CCC rejected creators now drop to the bottom of CCC lists within the active sort mode.
- PN-20251228-AC62 (2025-12-28 07:30Z): Release Desk now lets you scrap mastered tracks, clearing them from the pipeline before release.
- PN-20251228-AC63 (2025-12-28 07:42Z): Harmony Hub now offers Quick Group Act filters for gender identity, age group, preferred theme/mood, act alignment, and skill level range.
- PN-20251228-AC64 (2025-12-28 07:42Z): Release hygiene pass refreshed the README update stamp and patch note registry.
- PN-20251228-AC65 (2025-12-28 08:20Z): Rival rollout planning now uses projected net gates, cadence + stamina roster targets, and CEO Request action biasing with logged plan reasons.
- PN-20251228-AC66 (2025-12-28 08:26Z): Touring Budget + Staffing now shows tour readiness (stamina + skill + upcoming dates), crew endurance details, and fatigue/overuse risk callouts.
- PN-20251228-AC67 (2025-12-28 08:26Z): Release Desk project summaries now include revenue, cost inputs, and net profit per project.
- PN-20251228-AC68 (2025-12-28 08:29Z): Rivalry KPI snapshots now compute label consumption share, profitability, and near-term release/tour net projections for UI/logs.
- PN-20251228-AC69 (2025-12-28 08:34Z): Rival rosters now surface KPI summaries, consumption share breakdowns, era completion drawers, and player-vs-rival deltas with data-staleness warnings.
- PN-20251228-AC70 (2025-12-28 09:00Z): Added a Patch Notes portal view that links to docs/PATCH_NOTES.md for the full release history.
- PN-20251228-AC71 (2025-12-28 09:00Z): Tutorial Roles now marks rent/plan as live, and the tutorial adds leasing + touring guidance.
- PN-20251228-AC72 (2025-12-28 09:46Z): External storage prompts now respect secure contexts and remember a skip choice so the save folder dialog stops blocking play.
- PN-20251228-AC73 (2025-12-28 09:46Z): Monopoly losses now record a loss, disable achievements, and let the run continue instead of forcing a slot exit.
- PN-20251228-AC74 (2025-12-28 10:10Z): Track quality potential now uses deterministic per-track jitter so refreshes stop re-rolling scores.
- PN-20251228-AC75 (2025-12-28 10:14Z): Chart scoring jitter is now deterministic per week/scope/track to prevent flicker and non-repro ordering.
- PN-20251228-AC76 (2025-12-28 10:14Z): Added chart determinism diagnostics (worker parity logs, console harness, and monopoly share checks).
- PN-20251228-AC77 (2025-12-28 10:28Z): Time control buttons now stack parenthetical speed/skip details under the main label for quicker scanning.
- PN-20251228-AC78 (2025-12-28 10:33Z): Fast sim now throttles chart/market renders, uses cached market-track lookups, and logs perf timings to cut stutter; chart snapshots no longer double-assign projectType.
- PN-20251228-AC79 (2025-12-28 11:30Z): Local storage writes now preflight log/settings payloads, warn on quota, and capture storage health diagnostics.
- PN-20251228-AC80 (2025-12-28 11:31Z): Usage sessions now flush on visibility changes and debug bundle exports; external mirror failures keep local copies and log diagnostics.
- PN-20251228-AC81 (2025-12-28 11:32Z): Chart worker requests now time out and clear pending promises on termination to avoid leaks.
- PN-20251228-AC82 (2025-12-28 11:26Z): External storage prompts now skip unsupported origins and persist cancel/skip choices to stop re-prompting.
- PN-20251228-AC83 (2025-12-28 11:26Z): Monopoly losses now stay in a soft-loss state (achievements disabled) even after Year 4000 so play can continue.
- PN-20251228-AC84 (2025-12-28 11:38Z): Chart history panels now cache snapshot entry lookups and archive market-track maps to cut rerender scans.
- PN-20251228-AC85 (2025-12-28 12:02Z): Release scheduling now enforces distribution lead times, supports digital rush fees, gates physical drops by quality/fan thresholds, and surfaces regional inventory/store capacity on the Release Desk.
- PN-20251231-AC110 (2025-12-31 10:29Z): Boot diagnostics now surface missing global data/DOM roots and prompt reloads when the release stamp changes.
- PN-20251231-AC111 (2025-12-31 10:29Z): UI render hooks now coalesce into a single animation frame to cut rerender/save churn during fast sim ticks.
- PN-20251231-AC112 (2025-12-31 10:29Z): IndexedDB chart history now uses compound indexes plus a week metadata store with cached lookups for faster chart-week queries.
- PN-20251231-AC113 (2025-12-31 10:46Z): Chart history queries now cache week lists and reset failed IndexedDB opens to recover faster from blocked upgrades.
