# Agent Guide - Record Label Simulator

- Docs live in GitHub `docs/` (canon root); the decision register is `docs/DECISIONS.md`.
- GDD folder (Game Design Documents) lives at `game-design-documents/` (dashed, repo root).
- Google Drive mirrors GitHub; Drive is not canon.
- Conflicts are resolved case-by-case with GitHub as the tie-breaker.
- Unity-era content is retconned into web equivalents; keep concepts, rewrite Unity tooling language.
- Workflow: TODO -> Docs -> Code -> Patch Notes.
- README upkeep: verify `README.md` is current; update content as needed and refresh a `Last updated: YYYY-MM-DD HH:mm:ss +/-HH:MM` timestamp.
- When you stage changes in git, draft a commit message for me to push to main on GitHub.
- When making code changes, run `npm run build` and confirm the build succeeds; always request a test run when code is touched.
- Dev loop: run `npm run start` plus `npm run watch` for live TypeScript changes; static file edits (HTML/CSS/data JS) show on refresh, but `src/` changes require a build/watch.
- Staging order: stage changes after running `npm run build` so updated `assets/js/dist/*` output is included.
- Role alignment: user is the creative director doing "vibe coding" and UX direction; you implement and confirm details for behavior/tech tradeoffs.
- Observability focus: prioritize clear warning/error reporting and bug-handling surfaces when improving features.
- Primary dev environment: VS Code Run/Debug with Microsoft Edge. Prioritize this setup when developing and validating behavior.
- References: `docs/DECISIONS.md` and `docs/CONTRADICTIONS.md`.
- Coordination: Other AI agents may work in this repo; coordinate changes, avoid overlapping edits, and stop to ask when conflicts appear.
- Coordination addendum: If other agents made local changes that do not conflict with the task, incorporate them into the current pass.
- Git status handling: If `git status` shows local changes, proceed on top of them and incorporate them when there is no conflict; ask if there is a conflict or ambiguity.
