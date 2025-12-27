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

## Annual award show calendar
- Each award show runs once per year on its own schedule rule (fixed date or week-of-month).
- Show night is 20:00 UTC; nomination lock/reveal happen during the show week.
- The awards calendar includes critics-only, audience-only, and hybrid (critics + audience) judging.
- Each show owns its category set, but categories can overlap across shows.

### Annual schedule (UTC)
| Award show | Rating focus | Schedule rule |
| --- | --- | --- |
| Praised Content Awards | Critics-only | 2nd Saturday of February |
| Studio Craft Awards | Critics-only | April 12 (fixed date) |
| Pop Content Awards | Audience-only | 3rd Saturday of May |
| Fanwave Live Awards | Audience-only | 2nd Saturday of July |
| Impact Circuit Awards | Hybrid | 2nd Saturday of September |
| Horizon Impact Awards | Hybrid | 3rd Saturday of November |

### Nomination cadence (per show)
- Eligibility window: 52 full chart weeks ending the Saturday before show week.
- Awards are granted after the eligibility window closes.
- Nomination lock: Wednesday 12:00 UTC of show week.
- Nominee reveal: Friday 12:00 UTC of show week.
- Show night: scheduled date at 20:00 UTC.

## Nomination rules (global scope)
- Each category defines a nominee count in the 3-12 range (see below).
- Nominee pool uses category metrics, then applies a per-Act cap of 2 nominations per show.
- If fewer than 3 eligible entries exist, widen the window to 60 weeks and fill with highest FQ wildcards.
- Winners are picked from nominees using the category primary metric; tie-breaks use critics score, then audience score, then earliest timestamp.
- Critics Pick badge: any content with FQ >= 90 during the window earns a badge that feeds the awards ledger.

## Categories + nominee counts

### Praised Content Awards (Critics-only)
- Critics' Track of the Year (12)
- Critics' Project of the Year (8)
- Critics' Promo of the Year (8)
- Critics' Tour of the Year (5)
- Critics' Breakthrough Act (6)

### Studio Craft Awards (Critics-only)
- Production Track of the Year (8)
- Concept Project of the Year (6)
- Directional Music Video (6)
- Prime Time Showcase (5)
- Studio Vision Act (6)

### Pop Content Awards (Audience-only)
- Most Streamed Track (12)
- Best-Selling Project (8)
- Most-Engaged Promo (8)
- Most Attended Tour (5)
- Fan Surge Act (6)

### Fanwave Live Awards (Audience-only)
- Live Crowd Favorite (6)
- Prime Time Live Set (5)
- Tour Attendance Leader (5)
- Encore Track of the Year (8)
- Fan Rally Act (6)

### Impact Circuit Awards (Hybrid)
- Track Impact of the Year (8)
- Project Impact of the Year (6)
- Music Video Impact (6)
- Live Performance Impact (6)
- Tour Impact of the Year (5)
- Act Impact of the Year (6)

### Horizon Impact Awards (Hybrid)
- Crossover Track Impact (8)
- Era-Building Project (6)
- eyeriSocial Impact Post (6)
- eyeriSocial Ad Impact (6)
- Tour Footprint (5)
- Momentum Act (6)

## Eligibility windows + criteria
- Tracks/projects: released during the eligibility window, with FQ >= 70.
- Projects include Albums, EPs, and Single albums (project-level releases, not individual tracks).
- Promos (music video/live performance): executed during the window (scheduled-only does not count).
- Tours: at least 2 dates executed during the window; attendance totals drive audience + hybrid scores.
- Breakthrough Act: first release within the last 12 months and at least one eligible entry in-window.
- Audience awards: require at least 2 promo types active during the eligibility year.

## Live performance slots
- Each award show reserves 3 live performance slots (Opener, Spotlight, Finale).
- Slots are filled from nominees (Opener = Breakthrough/rookie; Finale = major-category nominee or winner).
- Award show performances count as Live Performance promos and appear in promotional charts.

## Task + CEO Request linkage
- Award wins and nominations are recorded in the awards ledger and add progress to Tasks.
- Year-end CEO Request tie-breaks use the awards ledger totals (scope-weighted).
- Tasks may target nominations, wins, or performance slots (ex: "Earn 2 nominations this season").

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
