# Promotions Tab

This doc defines the Promotions view (route `logs`) for the web MVP.

## Scope
- Promotions is the primary surface for promo pushes plus the eyeriSocial feed.
- The tab label is "Promotions"; the feed itself remains branded as eyeriSocial.
- Promo Types support multi-select; the budget applies per selected type.
- Total spend equals budget times the number of selected promo types.
- Facility gating applies per promo type; if required slots are unavailable, the push is blocked.

## Related
- `docs/systems/promo/broadcast-studios.md`
- `docs/systems/promo/filming-studios.md`
