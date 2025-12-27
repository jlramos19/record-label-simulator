# Chart Records

Defines the record book surfaced in Charts > Records and the eyeriSocial record posts.

## Coverage
- Content types: Tracks, Projects, Promotions, Touring.
- Scopes: Regional, National, Global (Global unlocks after 100 entries).
- Windows: weekly, rolling 4-week, year-to-date, annual, all-time (configurable per record).

## Record categories
- Fastest to #1 (weeks from release to first #1).
- Fastest to Top 10 (weeks from release).
- Biggest debut (highest entry rank, plus debut-week score).
- Biggest jump (largest position gain week-over-week).
- Most weeks at #1.
- Most weeks in Top 10.
- Biggest week (sales, streams, airplay, eyeriSocial uses).
- Fastest to milestone totals (sales or streams within a defined window).

## Record ledger fields
- recordId (metric + scope + content type + window).
- holder: Act + content title + record label.
- scope + chart issue date achieved.
- release date and weeks-to-record.
- window start/end (for rolling or annual windows).
- record value + previous record value.
- previous holder + date set.
- chart snapshot reference (issue week).

## Updates and eyeriSocial
- Records update during the weekly chart refresh after scores are finalized.
- When a record is broken, append a new ledger entry and mark it current for that recordId.
- Emit a `<Place>Charts` eyeriSocial post with holder, value, scope, window, achieved date, and previous record.
- If multiple records break in the same tick, order posts by the HMMM rule.

## Observability
- Records tab shows "insufficient history" when snapshots are missing for the requested window.
- Data-gap badges appear when a record uses fallback weights or partial metrics.
