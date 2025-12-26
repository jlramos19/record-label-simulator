# Patch Notes

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
