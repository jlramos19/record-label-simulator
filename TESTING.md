TESTING.md

Manual verification and quick commands

1) Quick UI checks (1920x1080)
- Open `index.html` in a browser at 1920x1080.
- Verify compact layout: panels fit, gaps are reduced, side columns readable.
- Test panel resizers: drag right/left/top/bottom/corner on several panels and verify intuitive behavior.
- Open an overlay (e.g., `Skip Time`) and click outside the card — the overlay should close.

2) eyeriSocial templates and filters
- In the `eyeriSocial` card select a template from the dropdown and click `Post Template`.
- Toggle the filter checkboxes and the `Internal Log` toggle; posts should hide/show appropriately.

3) Population sanity check
- Open browser console and run:
```
// Run the population A/B helper (fast, posts result to event log)
runPopulationABTest({ startYear: 2025, endYear: 2075, runs: 10 })
```

- Check the `eyeriSocial` / event feed for a summary entry after tests complete.

4) Automation checklist
- If anything fails, open the DevTools console and copy errors into an issue.

Notes:
- Population constants live in `assets/js/data/constants.js`, app logic in `src/app/game.ts`.
