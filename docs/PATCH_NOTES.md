# Patch Notes

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
- Modern Era (2400) seeding now generates grouped projects (Singles/EPs/Albums) in the market.

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
- Modern-era seed bias reduced (dominant label bonus + seed pick chance) to keep early rankings closer.

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
- Modern era starts now seed the trend ledger from kickoff charts so Community trends populate immediately.
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

