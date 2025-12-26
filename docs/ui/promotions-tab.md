# Promotions Tab

This doc defines the Promotions view (route `logs`) for the web MVP.

## Scope
- Promotions is the primary surface for promo pushes plus the eyeriSocial feed.
- Touring is a separate tab to the right of Promotions and is the final promotion step of an Era.
- The tab label is "Promotions"; the feed itself remains branded as eyeriSocial.
- Promo Types support multi-select; the budget applies per selected type.
- Total spend equals budget times the number of selected promo types.
- Budgets live per promo type card and roll into a summed total when multiple promos are selected.
- Budget helpers show efficiency vs typical spend plus an audience-variance lift range (trend/alignment-dependent).
- Promo pushes target an Act (required) and optionally an associated Track.
- Act-only promos boost Act visibility; Act+Track promos boost both.
- Track promos can target released or scheduled tracks; scheduled promos bank momentum for release.
- Music video promos unlock after release and are single-use per track.
- Facility gating applies per promo type; if required slots are unavailable, the push is blocked.
- Broadcast program eligibility (quality + charting) blocks high-stakes programs when unmet.
- Internal Log surfaces system updates for balance/debug review.
- Loss Archives and Debug Bundle export stay internal-only and are not shown in Promotions.

## Related
- `docs/systems/promo/broadcast-studios.md`
- `docs/systems/promo/filming-studios.md`
- `docs/ui/touring-tab.md`
- `docs/systems/touring/venues.md`
