# Promotions Tab

This doc defines the Promotions view (route `logs`) for the web MVP.

## Scope
- Promotions is the primary surface for promo pushes plus the eyeriSocial feed.
- Touring is a separate tab to the right of Promotions and is the final promotion step of an Era.
- The tab label is "Promotions"; the feed itself remains branded as eyeriSocial.
- Promo Types support multi-select; the budget applies per selected type.
- Total spend equals budget times the number of selected promo types.
- Promo runs spend pooled Act stamina per promo type; members share the cost.
- Budgets live per promo type card and roll into a summed total when multiple promos are selected.
- Budget helpers show efficiency vs typical spend plus an audience-variance lift range (trend/alignment-dependent).
- Promo pushes target an Act (required) with optional Project + Track targeting (Project sits between Act and Track).
- Auto Promo targets up to four slots; each slot has Act / Project / Track inputs and its own budget % allocation.
- Auto Promo allocations must total 100% or less; each slot resolves Track -> Project -> Act, with act-only promos allowed for active eras.
- Auto Promo target selects only list active-era acts/projects plus released or scheduled tracks.
- Auto Promo targets display only when Auto Promo is enabled.
- Act-only promos boost Act visibility; Act+Project promos boost project momentum; Act+Project+Track promos boost both.
- Project promos can target projects in active eras; boosts apply across released + scheduled tracks in the project.
- Track promos can target released or scheduled tracks; scheduled promos bank momentum for release.
- Music video promos unlock after release and are single-use per track.
- Live Performance promos include a Prime Time toggle to convert to a Prime Time Showcase with higher cost and prestige gates.
- Live performances (standard + Prime Time) measure concurrent live audience.
- Live performances generate a performance tape uploaded to the EyeriS Video division after airing.
- Promo Alerts list active-era content with missing promo types (ex: released tracks lacking Music Video) and warn when an Act has no promo activity in the last 6 months; alerts inform popularity + drop-risk tuning.
- Promo pushes feed the Charts view promotional rankings via engagement metrics (eyeriSocial likes, music video views, interview comments, live performance concurrent audience).
- Facility gating applies per promo type; if required slots are unavailable, the push is blocked.
- Broadcast program eligibility (quality + charting) blocks high-stakes programs when unmet.
- Promo booking windows can be reserved in advance (including eyeriSocial posts); scheduled promos appear in the Calendar.
- Internal Log surfaces system updates for balance/debug review.
- Loss Archives and Debug Bundle export stay internal-only and are not shown in Promotions.

## Related
- `docs/systems/promo/broadcast-studios.md`
- `docs/systems/promo/filming-studios.md`
- `docs/ui/touring-tab.md`
- `docs/systems/touring/venues.md`
