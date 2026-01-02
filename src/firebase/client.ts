import type { FirebaseApp, FirebaseOptions } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { connectAuthEmulator } from "firebase/auth";
import { updateDebugStage } from "../app/debug-panel";
import { initFirebaseApp, resolveFirebaseConfig, shouldUseEmulators } from "./app";
import { ensureAnonAuth, initAuth, waitForAuthReady } from "./auth";
import { connectFirestoreEmulatorIfNeeded, initFirestore } from "./firestore";

type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  config: FirebaseOptions;
};

let services: FirebaseServices | null = null;
let initPromise: Promise<FirebaseServices | null> | null = null;
let configMissing = false;

export function hasFirebaseConfig() {
  return Boolean(resolveFirebaseConfig());
}

export function getFirebaseServices() {
  return services;
}

export async function waitForFirebaseServices() {
  if (initPromise) return initPromise;
  return initFirebaseClient();
}

export async function waitForFirebaseAuthUser() {
  if (!services) await waitForFirebaseServices();
  if (!services) return null;
  return waitForAuthReady();
}

export function isFirebaseConfigMissing() {
  return configMissing;
}

export function initFirebaseClient() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (typeof window === "undefined") return null;
    updateDebugStage("firebase", { status: "active", detail: "Initializing Firebase..." });
    const config = resolveFirebaseConfig();
    if (!config) {
      configMissing = true;
      updateDebugStage("firebase", { status: "warn", detail: "Missing Firebase config." });
      return null;
    }
    configMissing = false;

    const app = initFirebaseApp(config);
    const auth = initAuth(app);
    const db = initFirestore(app);

    if (shouldUseEmulators()) {
      try {
        connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
      } catch (error) {
        console.warn("[firebase] Auth emulator connection failed.", error);
      }
      connectFirestoreEmulatorIfNeeded(db, "localhost", 8080);
      console.log("[firebase] Emulator connections attempted.");
    }

    services = { app, auth, db, config };
    updateDebugStage("firebase", { status: "ok", detail: "Firebase ready." });

    ensureAnonAuth(auth).catch((error) => {
      console.warn("[auth] Anonymous sign-in failed.", error);
    });

    return services;
  })().catch((error) => {
    initPromise = null;
    throw error;
  });
  return initPromise;
}
