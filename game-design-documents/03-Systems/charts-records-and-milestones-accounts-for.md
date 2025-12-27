# Charts Records and Milestones

Defines the record tracking that powers the Charts > Records tab and eyeriSocial record posts.

## Coverage
- Content types: Tracks, Projects, Promotions, Touring.
- Scopes: Regional, National, Global.
- Windows: weekly, rolling 4-week, year-to-date, annual, all-time.

## Record types
- Fastest to #1 (weeks from release).
- Fastest to Top 10 (weeks from release).
- Biggest debut (best entry rank).
- Biggest jump (largest week-over-week climb).
- Most weeks at #1.
- Most weeks in Top 10.
- Biggest week by channel (sales, streams, airplay, eyeriSocial).
- Fastest to milestone totals within a window (sales or streams).

## Record ledger
- recordId (metric + scope + content type + window).
- holder (Act + content title + record label).
- achievedAt (chart issue date) and releaseDate.
- windowStart/windowEnd when applicable.
- value, previousValue, previousHolder, previousAchievedAt.
- chartSnapshotId for traceability.

## Posting
- When a record is set, queue a `<Place>Charts` eyeriSocial post with holder, value, scope, window, achieved date, and previous record.
- If multiple records break at the same tick, order posts by the HMMM rule.
