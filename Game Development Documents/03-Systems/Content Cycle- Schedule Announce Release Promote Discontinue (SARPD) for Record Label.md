Content Cycle: Schedule, Announce, Release, Promote, Discontinue (SARPD) for Record Label Simulator

This reflects the current MVP implementation.

Prerequisite
- Content must be assigned to an Act. Releases and scheduling are blocked without an Act.
- Only Ready or Mastering tracks can be scheduled for release.
- Scheduling or releasing a track auto-starts (or attaches to) an active Era for the Act.

Schedule
- Use the Release Desk to release now or queue +7d / +14d releases.
- Scheduled releases appear in the Calendar and remain internal until posted publicly.
- Distribution can be set per release (Digital or Physical).

Announce
- Public announcements are handled through eyeriSocial posts (release announcements or promo templates).
- Internal schedules remain private until a post is published.

Release
- When the scheduled time arrives, the track enters the market and charts.
- The track records whether it launched during an active trend.

Promote
- Use the Promotion console to select a released track and a promo type (Music Video, Live Performance, eyeriSocial Post, Interview).
- Budgets convert to 1-4 promo weeks and deduct cash.
- Promo pushes can auto-post to eyeriSocial using templates.

Discontinue
- Promo weeks decay by 1 each weekly update.
- Tracks age off charts after 12 weeks, ending active chart impact and trend influence.
