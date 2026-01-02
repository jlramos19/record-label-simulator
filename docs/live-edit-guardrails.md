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
- `index.html` includes a boot fallback overlay that triggers on script/style load failures or slow boots; `src/main.ts` marks boot readiness via `window.__RLS_BOOT_GUARD__.markReady()`.
- Boot fallback + safe-mode screens include a reload option that appends `?sw=off` to bypass service worker cache.
- Boot dependency checks expect `TRACKLIST`; `assets/js/data/tracklist.js` should keep the alias aligned with track title arrays.
- Usage sessions now track session IDs, action trails, and captured errors; debug exports include the active session log.
- Usage sessions flush on pagehide/visibilitychange and when exporting the debug bundle.
- Internal Log includes an Export Debug Bundle button to download usage sessions plus UI/system logs for sharing.
- Debug bundles include a storage health snapshot (save size, localStorage estimate).

## Save storage (Firestore)

- Save slots live in Firestore under `players/{uid}/slots/{slotId}` and store the encoded payload string.
- Firestore offline persistence is enabled via `initializeFirestore(... localCache ...)` to keep offline play workable.
- The web client no longer prompts for local folders or uses the File System Access API.
