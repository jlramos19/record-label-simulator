# Live Edit Guardrails + Release Stamps

These rules keep the hosted web build runnable while the team iterates quickly.

## Release stamp (single source of truth)
- Release metadata lives in `assets/js/data/release.js`.
- Patch ID format: `RLS-PATCH-YYYYMMDD-HHMMZ` (UTC, 24-hour time).
- Example: `RLS-PATCH-20251225-0830Z`.
- Patch notes headings must include the patch ID.

## Live edit guardrails (always follow)
1. Edit TypeScript in `src/`, not `assets/js/dist/`.
2. Run `npm run build` after TS changes to refresh `assets/js/dist/`.
3. Update `assets/js/data/release.js` with the new patch ID + timestamp.
4. Update `service-worker.js` cache version to match the release patch ID.
5. Keep required DOM IDs/data attributes in `index.html`; if you remove or rename them, update `src/app/ui.ts` and `src/app/game.ts` in the same change.
6. For local live edits, keep the service worker disabled (localhost defaults off; `?sw=off` also disables it).

## Patch notes convention
- `docs/PATCH_NOTES.md` entry header format: `## YYYY-MM-DD (RLS-PATCH-YYYYMMDD-HHMMZ)`.
- Each entry should list user-visible changes plus ops/guardrail updates.

## Runtime guardrails
- `src/app/guardrails.ts` installs global error handlers and auto-save on pagehide/visibilitychange.
- Critical runtime errors surface a console error plus an in-app toast (non-blocking, auto-dismiss) for visibility.
- If initialization fails, the app surfaces a safe-mode message to avoid silent blank screens.
- Usage sessions now track session IDs, action trails, and captured errors; debug exports include the active session log.

## External storage (File System Access API)
- Optional: logs, saves, and chart history can mirror to a user-selected folder via the Promotions view (route `logs`).
- Data is written under `usage-logs/`, `saves/`, and `database/` subfolders in the selected directory.
- Imports pull saves and chart history back into local storage/IndexedDB for recovery.
