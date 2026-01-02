# Known Issues

Last updated: 2026-01-02

## Save/Load Reliability
- Intermittent save/load failures can occur during cloud sync, showing "Cloud save failed" toasts or stale slot data. Watch for reason codes such as `firebase-not-ready`, `cloud-commit-failed`, and `commit-failed`.
- Slots sometimes appear in the slot list but fail to load. Slot status can report error codes like `slot-id-mismatch`, `schema-too-new`, `decode`, and `parse`.

## Storage Prompts
- Save UI occasionally requests a folder selection even though autosave + cloud commits should not require it. Folder picks should only happen on explicit Export/Backup actions.

## Error Sequences (Console/Debug Paths)
- Cloud read path: `fetchCloudSlotSnapshot` -> `cloud-read-failed` or slot error `decode`/`parse` -> storage error scope `firestore`.
- Cloud write path: `setDoc` failure -> `commit-failed` -> UI save status shows "Cloud save failed".
- Firebase not ready: `resolveFirebaseContext` returns null -> `firebase-not-ready` -> pending cloud commit remains queued.
