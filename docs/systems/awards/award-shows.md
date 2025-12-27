# Award Shows and Critics Councils

## Intent
- Make awards a visible, scheduled loop that ties critics, audience response, and promotion outcomes together.
- Award outcomes feed Tasks/CEO Requests, popularity boosts, and calendar-facing events.

## Critics councils and quality ratings
- Each release is rated by a 3-critic panel (Safe, Neutral, Risky leanings) to keep alignment bias in check.
- Critics score blends: 50% preliminary quality (PQ), 30% alignment fit, 20% theme/mood fit, minus stringency or saturation penalties.
- Critics Rating (CR) is stored as a delta and weighted by scope (Regional=1, National=2, Global=3).
- Audience Rating (AR) is a delta derived from engagement (sales/streams/views/attendance) over the eligibility window.
- Final Quality (FQ) = PQ + CR + AR, clamped to 0-100 and cached per content for awards + charts.

## Award show circuit (monthly)
- Three award families rotate across the first three Saturdays of each month at 20:00 UTC.
- Week 1: Praised Content Awards (critics-only ratings).
- Week 2: Pop Content Awards (audience-only ratings).
- Week 3: Impact Circuit Awards (hybrid ratings: critics + audience).
- Week 4: no show; reserved for calendar overflow and live performance recovery slots.

### Nomination cadence (per show)
- Nomination window: the 4 full chart weeks ending the Saturday before show week.
- Nomination lock: Wednesday 12:00 UTC of show week.
- Nominee reveal: Friday 12:00 UTC of show week.
- Show night: Saturday 20:00 UTC.

## Nomination rules (global scope)
- Each category defines a nominee count in the 3-12 range (see below).
- Nominee pool uses category metrics, then applies a per-Act cap of 2 nominations per show.
- If fewer than 3 eligible entries exist, widen the window to 8 weeks and fill with highest FQ wildcards.
- Winners are picked from nominees using the category primary metric; tie-breaks use critics score, then audience score, then earliest timestamp.
- Critics Pick badge: any content with FQ >= 90 during the window earns a badge that feeds the awards ledger.

## Categories + nominee counts

### Praised Content Awards (Critics-only)
- Critics' Track of the Month (12)
- Critics' Project of the Month (8)
- Critics' Promo of the Month (8)
- Critics' Tour of the Month (5)
- Critics' Breakthrough Act (6)

### Pop Content Awards (Audience-only)
- Most Streamed Track (12)
- Best-Selling Project (8)
- Most-Engaged Promo (8)
- Most Attended Tour (5)
- Fan Surge Act (6)

### Impact Circuit Awards (Hybrid)
- Track Impact of the Month (8)
- Project Impact of the Month (6)
- Music Video Impact (6)
- Live Performance Impact (6)
- Tour Impact of the Month (5)
- Act Impact of the Month (6)

## Eligibility windows + criteria
- Tracks/projects: released during the nomination window, with FQ >= 70.
- Projects include Albums, EPs, and Single albums (project-level releases, not individual tracks).
- Promos (music video/live performance): executed during the window (scheduled-only does not count).
- Tours: at least 2 dates executed during the window; attendance totals drive audience + hybrid scores.
- Breakthrough Act: first release within the last 6 months and at least one eligible entry in-window.
- Audience awards: require at least 2 promo types active during the window.

## Live performance slots
- Each award show reserves 3 live performance slots (Opener, Spotlight, Finale).
- Slots are filled from nominees (Opener = Breakthrough/rookie; Finale = major-category nominee or winner).
- Award show performances count as Live Performance promos and appear in promotional charts.

## Task + CEO Request linkage
- Award wins and nominations are recorded in the awards ledger and add progress to Tasks.
- Year-end CEO Request tie-breaks use the awards ledger totals (scope-weighted).
- Tasks may target nominations, wins, or performance slots (ex: "Earn 2 nominations this month").

## Popularity boosts
- Winners: +5% Act popularity and +3% content momentum for 4 weeks.
- Nominees: +2% Act popularity and +1% content momentum for 2 weeks.
- Boosts refresh duration but do not stack beyond one active award boost.

## UI + observability
- Award show events and performance slots appear in Calendar and Promotions.
- Nomination lock, reveal time, and eligibility window are shown per show.
- Ineligibility reasons (missing window, low quality, no executed promo) are logged and surfaced in tooltips.

## Related
- `docs/systems/endgame/annual-awards.md`
- `docs/systems/tasks/task-system.md`
- `docs/systems/calendar/calendar-projection.md`
- `docs/ui/promotions-tab.md`
