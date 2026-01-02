import type { FirebaseApp, FirebaseOptions } from "firebase/app";
import { initializeApp } from "firebase/app";

const REQUIRED_KEYS: (keyof FirebaseOptions)[] = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId"
];

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

const hasValue = (value: unknown) => typeof value === "string" && value.trim().length > 0;

export function resolveFirebaseConfig(): FirebaseOptions | null {
  const config: FirebaseOptions = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };

  const ready = REQUIRED_KEYS.every((key) => hasValue(config[key]));
  return ready ? config : null;
}

export function isLocalHost(hostname?: string | null) {
  if (!hostname) return false;
  return LOCAL_HOSTS.has(hostname);
}

export function shouldUseEmulators() {
  const flag = import.meta.env.VITE_FIREBASE_USE_EMULATORS;
  if (flag === "1" || flag === "true") return true;
  if (typeof window === "undefined") return false;
  return isLocalHost(window.location.hostname);
}

let firebaseApp: FirebaseApp | null = null;

export function initFirebaseApp(config: FirebaseOptions): FirebaseApp {
  if (firebaseApp) return firebaseApp;
  firebaseApp = initializeApp(config);
  return firebaseApp;
}
