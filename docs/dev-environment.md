# Dev Environment

## VS Code extensions
- ESLint (`dbaeumer.vscode-eslint`): lint JS (repo config) and keep TypeScript checks in `tsc`.
- Git History (`donjayamanne.githistory`): inspect file history and diff stacks inside VS Code.
- Microsoft Edge Tools for VS Code (`ms-edgedevtools.vscode-edge-devtools`): debug the game with Edge + DevTools from Run/Debug.
- npm Intellisense (`christian-kohler.npm-intellisense`): autocomplete `package.json` scripts and dependencies.
- Markdownlint (`davidanson.vscode-markdownlint`): lint docs against repo Markdown rules.

## Run/Debug (Edge)
- Use the `RLS: Edge (Dev)` Run/Debug config to launch Edge with the game.
- Prelaunch tasks start `npm run start` + `npm run watch` so the game boots and TypeScript stays hot.
- The game server listens on `http://localhost:5173`. The React islands dev server uses `http://localhost:5174` to avoid conflicts.

## Observability
- Use Edge DevTools console for runtime errors and `npm run dev:logs` for session logs in `usage-logs/`.

## Linting
- `npm run lint` runs ESLint across JS/MJS/CJS (compiled output is ignored).
- Markdownlint reads `.markdownlint.json` for doc rules.

## Live edit reminders
- HTML/CSS/data JS changes show on refresh.
- TypeScript changes require `npm run watch` (or a build) to update `assets/js/dist`.
