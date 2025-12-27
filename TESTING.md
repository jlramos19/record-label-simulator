TESTING.md

Manual verification and quick commands

1) Quick UI checks (1920x1080)
- Open `index.html` in a browser at 1920x1080.
- Verify compact layout: panels fit, gaps are reduced, side columns readable.
- Test panel resizers: drag right/left/top/bottom/corner on several panels and verify intuitive behavior.
- Open an overlay (e.g., `Skip Time`) and click outside the card - the overlay should close.

2) Weekly timing + trends
- Use `Skip Time` to jump to a Friday 00:00 UTC timestamp; confirm a release-processing log entry appears.
- Advance to Friday 12:00 UTC; confirm the Top Trends list refreshes in the header.
- Advance to Saturday 00:00 UTC; confirm charts refresh (chart list updates, countdown resets).
- In Community, confirm Top Trends list shows up to 40 items and can be fewer.

3) Promo facilities (broadcast + filming)
- On a weekday (not Sunday), select `Live Performance` and fund promos until you exhaust broadcast slots; verify the next attempt warns about no slots.
- Skip to Sunday and confirm the broadcast slot hint shows higher availability.
- Select `Music Video` or `eyeriSocial Ad` and fund promos until filming slots exhaust; verify the next attempt warns about no slots.
- Run an `eyeriSocial Ad` and confirm it posts to the feed with an "eyeriSocial Ad" title.

4) eyeriSocial templates and filters
- In the `eyeriSocial` card select a template from the dropdown and click `Post Template`.
- Toggle the filter checkboxes and the `Internal Log` toggle; posts should hide/show appropriately.

5) Population sanity check
- Open browser console and run:
```
// Run the population A/B helper (fast, posts result to event log)
runPopulationABTest({ startYear: 2025, endYear: 2075, runs: 10 })
```

- Check the `eyeriSocial` / event feed for a summary entry after tests complete.

6) Automation checklist
- If anything fails, open the DevTools console and copy errors into an issue.

7) CCC signing
- Success: set cash to C, sign a creator who accepts; expect cash = C - cost, creator moves to roster, CCC list updates, event log shows signing.
- Reject: sign a creator who rejects; expect cash unchanged, sign disabled for that creator until next 12AM refresh, event log shows rejection.
- Precondition (insufficient funds): set cash < cost, click Sign; expect cash unchanged, sign remains enabled, error logged.
- Precondition (roster full): fill roster to 125 creators, click Sign; expect cash unchanged, sign remains enabled, error logged.
- Midnight refresh: advance time across 12AM; expect sign lockouts cleared and CCC pool refreshed.

8) Stamina hourly ticks
- While time is running, confirm idle creators gain +50 stamina per in-game hour.
- Start a 3-hour Master stage and verify stamina drops each in-game hour (not only at completion).
- Confirm `staminaSpentToday` resets at 12AM.
- Confirm an overuse strike fires at most once per creator per day.

9) Touring planning + booking
- Open the Touring tab (right of Promotions); confirm the Touring Desk loads without console errors.
- With no active Era or released Project/Track, attempt to plan a tour; expect booking to block with a reason code in the Touring tab and event log.
- With an active Era + released content, select an Act, anchor Project/Track, and goal; confirm the planner saves the draft.
- Add tour dates and venues; verify availability conflicts and double-booking are blocked with reason codes, and calendar entries appear for booked dates.
- Choose a venue tier that mismatches projected attendance; confirm a warning appears but booking is not blocked.
- Toggle the touring balance flag off; confirm wallet/fan totals do not change while bookings still resolve and log.

10) Act name generator checks
- Run `npm run build`.
- Run `node scripts/test-act-name-generator.mjs` and confirm all checks pass.

Notes:
- Population constants live in `assets/js/data/constants.js`, app logic in `src/app/game.ts`.
