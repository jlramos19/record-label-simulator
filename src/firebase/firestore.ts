import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import {
  connectFirestoreEmulator,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
import { updateDebugStage } from "../app/debug-panel";

let firestoreDb: Firestore | null = null;
let emulatorConnected = false;

export function initFirestore(app: FirebaseApp) {
  if (firestoreDb) return firestoreDb;
  updateDebugStage("firestore", { status: "active", detail: "Enabling offline cache..." });
  try {
    firestoreDb = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
    updateDebugStage("firestore", { status: "ok", detail: "IndexedDB cache enabled." });
  } catch (error) {
    console.warn("[firestore] IndexedDB cache unavailable; falling back to memory cache.", error);
    firestoreDb = initializeFirestore(app, { localCache: memoryLocalCache() });
    updateDebugStage("firestore", { status: "warn", detail: "Memory cache only (IndexedDB blocked)." });
  }
  return firestoreDb;
}

export function connectFirestoreEmulatorIfNeeded(db: Firestore, host = "localhost", port = 8080) {
  if (emulatorConnected) return true;
  try {
    connectFirestoreEmulator(db, host, port);
    emulatorConnected = true;
    return true;
  } catch (error) {
    console.warn("[firebase] Firestore emulator connection failed.", error);
    return false;
  }
}

export function getFirestoreInstance() {
  return firestoreDb;
}
