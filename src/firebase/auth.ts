import type { FirebaseApp } from "firebase/app";
import type { Auth, User } from "firebase/auth";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { updateDebugStage } from "../app/debug-panel";

let firebaseAuth: Auth | null = null;
let currentUser: User | null = null;
let authReadyPromise: Promise<User | null> | null = null;
let authReadyResolve: ((user: User | null) => void) | null = null;

function ensureAuthListener(auth: Auth) {
  if (authReadyPromise) return;
  authReadyPromise = new Promise((resolve) => {
    authReadyResolve = resolve;
    onAuthStateChanged(auth, (user) => {
      currentUser = user || null;
      if (user) {
        updateDebugStage("auth", { status: "ok", detail: `Signed in (${user.uid}).` });
      } else {
        updateDebugStage("auth", { status: "warn", detail: "Signed out." });
      }
      if (authReadyResolve) {
        authReadyResolve(currentUser);
        authReadyResolve = null;
      }
    });
  });
}

export function initAuth(app: FirebaseApp) {
  if (firebaseAuth) return firebaseAuth;
  firebaseAuth = getAuth(app);
  ensureAuthListener(firebaseAuth);
  return firebaseAuth;
}

export function getAuthInstance() {
  return firebaseAuth;
}

export function getCurrentUser() {
  return currentUser || firebaseAuth?.currentUser || null;
}

export function waitForAuthReady() {
  if (!firebaseAuth) return Promise.resolve(null);
  if (currentUser) return Promise.resolve(currentUser);
  if (authReadyPromise) return authReadyPromise;
  ensureAuthListener(firebaseAuth);
  return authReadyPromise || Promise.resolve(getCurrentUser());
}

export async function ensureAnonAuth(auth: Auth) {
  if (auth.currentUser) return auth.currentUser;
  updateDebugStage("auth", { status: "active", detail: "Signing in anonymously..." });
  try {
    const credential = await signInAnonymously(auth);
    return credential.user;
  } catch (error) {
    const code = (error as { code?: string })?.code || "auth-error";
    updateDebugStage("auth", { status: "error", detail: `Anon sign-in failed (${code}).` });
    throw error;
  }
}
