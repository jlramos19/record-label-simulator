# Dev Environment

## Toolchain
- Node.js 24 LTS (see `.nvmrc` / `.node-version`).
- npm 11 is the default package manager for this repo.
- pnpm 10.26+ is supported if you prefer (keep `package-lock.json` updated when using npm).

## VS Code extensions
- ESLint (`dbaeumer.vscode-eslint`): lint JS (repo config) and keep TypeScript checks in `tsc`.
- Git History (`donjayamanne.githistory`): inspect file history and diff stacks inside VS Code.
- npm Intellisense (`christian-kohler.npm-intellisense`): autocomplete `package.json` scripts and dependencies.
- Markdownlint (`davidanson.vscode-markdownlint`): lint docs against repo Markdown rules.

## Run/Debug (Edge)
- Terminal A: `npm run dev`
- Optional Terminal C: `npm run watch:portraits` to auto-optimize new creator portrait images.
- Launch the `RLS: Edge` Run/Debug config to open `http://localhost:5173` (Vite dev server).
- The React SPA dev server uses `http://localhost:5174` to avoid conflicts.
- The React islands dev server uses `http://localhost:5175` to avoid conflicts.
- After `cd ui-react && npm run build`, the React SPA is served from `http://localhost:5173/ui-react/`.

## Firebase emulators (optional)
- One-time install: `npm install -g firebase-tools`.
- Ensure `firebase.json` exists (Auth 9099, Firestore 8080, Hosting 5000) and update `.firebaserc` with your project ID if needed.
- Java JDK 11+ is required for emulator runs.
- Create `.env.local` with your `VITE_FIREBASE_*` values from the Firebase console.
- Terminal C (or D): `firebase emulators:start` to run Auth + Firestore + Hosting locally (Emulator UI may appear at `http://localhost:4000`).
- Offline persistence is enabled automatically; expect a warning if multiple tabs open or IndexedDB is blocked.

## Local Hosting emulator (dist/)
- Build + serve with Hosting emulator: `npm run serve:local`.
- Open `http://localhost:5000` to verify the built app (hash routes should refresh correctly).

## Observability
- Use Edge DevTools console (in the browser) for runtime errors.
- Use Internal Log > Export Debug Bundle for usage session + UI/system logs.

## Performance profiling
- Enable User Timing marks with `?perf=1` (optional `perfSample=N`, default 10) or set `window.rlsPerf = { enabled: true, sampleEvery: 10 }` in the console.
- Marks/measures emitted: `rls:tick`, `rls:tick:sim`, `rls:tick:sync` (cleared each sample to avoid buffer churn).
- DevTools capture checklist: record 15-30s while sim runs, confirm `rls:*` entries in Timings, inspect >50ms main-thread tasks against tick spikes, save trace for notes.

## Linting
- `npm run lint` runs ESLint across JS/MJS/CJS (compiled output is ignored).
- Markdownlint reads `.markdownlint.json` for doc rules.

## Live edit reminders
- Vite handles TypeScript + CSS updates automatically during `npm run dev`.
- Static assets live under `public/` and update on refresh.
