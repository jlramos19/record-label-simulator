# Dev Environment

## VS Code extensions
- ESLint (`dbaeumer.vscode-eslint`): lint JS (repo config) and keep TypeScript checks in `tsc`.
- Git History (`donjayamanne.githistory`): inspect file history and diff stacks inside VS Code.
- npm Intellisense (`christian-kohler.npm-intellisense`): autocomplete `package.json` scripts and dependencies.
- Markdownlint (`davidanson.vscode-markdownlint`): lint docs against repo Markdown rules.

## Run/Debug (Edge)
- Terminal A: `npm run start`
- Terminal B: `npm run watch`
- Optional Terminal C: `npm run watch:portraits` to auto-optimize new creator portrait images.
- Launch the `RLS: Edge` Run/Debug config to open `http://localhost:5173` (keep both terminals running for live TS updates).
- The React islands dev server uses `http://localhost:5174` to avoid conflicts.

## Observability
- Use Edge DevTools console (in the browser) for runtime errors and `npm run dev:logs` for session logs in `usage-logs/`.

## Linting
- `npm run lint` runs ESLint across JS/MJS/CJS (compiled output is ignored).
- Markdownlint reads `.markdownlint.json` for doc rules.

## Live edit reminders
- HTML/CSS/data JS changes show on refresh.
- TypeScript changes require `npm run watch` (or a build) to update `assets/js/dist`.
