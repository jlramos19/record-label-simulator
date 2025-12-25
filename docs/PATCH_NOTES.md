# Patch Notes

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
