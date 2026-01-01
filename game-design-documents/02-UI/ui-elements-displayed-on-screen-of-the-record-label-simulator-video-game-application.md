# UI Elements Displayed on Screen (Web MVP)

## Top Area

### Top Left Corner
- Displays the portrait of the label's most successful Act in the last 6 months.

### Top Left
- Popularity, audience reach, and alignment summary.
- Wallet: displays available funds; clicking opens a wallet summary overlay.

### Top Center
- Current in-game time and date (example: `SAT - JAN 01, 2400 - 12AM`).
- Time speed controls: Pause, Play, Fast, Skip Time (day/week/custom date presets).
- View navigation (routed views; only one view is mounted at a time):
  - Dashboard (default)
  - Charts
  - Create
  - Release
  - Calendar
  - Eras
  - Roster
  - Community (CCC)
  - Promotions
  - Tour

### Top Right
- Top Trends: top 3 global trends with a "More" window for the Top 40.
- Top Record Labels: top labels list with a "More" window for the Top 8/40.

### Top Right Corner
- Settings icon: opens the app settings overlay (save/load, exit, resume).

## Routed View Layout

- Each view renders a main panel plus optional side panels.
- Side panels are view-scoped, collapsible, and removed from layout when hidden.
- The Panel Menu overlay lists available panels for the current view.
- The CCC signing surface lives inside the Community view (not a standalone tab).

## View Details

### Create Content
- Stage controls show Sheet, Demo, and Master as side-by-side columns.
- Studios panel includes filters for owned/unowned, owner entity, and occupied slots.
- Creator slots are arranged as studio columns (5 slots each; 3 Songwriter, 2 Vocalist, 1 Producer).

### Release
- Release Desk schedules drops (Digital, Physical, Both) and sets project metadata.
- Release Desk queues feed the Calendar projection.

### Calendar
- Calendar view projects scheduling into a grid.
- Tabs: Label (internal), Public (world), Eras.
- Filters toggle scheduled vs released events and rival activity.
- Full list modal shows day details and upcoming events.

### Eras
- Era management desk with status, outcomes, and Era planning controls.

### Roster (Harmony Hub)
- Creator roster grouped by role.
- Harmony Hub forms Acts, assigns Creator IDs, and tracks Era participation.

### Community (CCC)
- CCC signing marketplace for Creator IDs with trend/watch and ranking panels.
- Community ranking lists for labels and trends.

### Promotions (eyeriSocial)
- Promo pushes, facility gating, and scheduling tools.
- eyeriSocial feed is embedded here (no separate Logs/Debug tab).
- Internal log entries surface system events for balance/debug review.

### Touring
- Tour planning, venue finder, route timeline, and projection summaries.
- Bookings appear on Calendar with warnings and reason codes.

## Overlays

- Tutorial modal includes a Quick Recipes button.
- Quick Recipes window lists content pipeline recipes.
