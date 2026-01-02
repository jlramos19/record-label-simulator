import type { DocumentData } from "firebase/firestore";
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { updateDebugStage } from "./debug-panel";
import {
  getFirebaseServices,
  hasFirebaseConfig,
  isFirebaseConfigMissing,
  waitForFirebaseAuthUser,
  waitForFirebaseServices
} from "../firebase/client";

type CloudCommitMeta = {
  schemaVersion?: number | null;
  releasePatchId?: string | null;
};

type CloudSlotSnapshot = {
  slotId: number;
  storedSlotId: number | null;
  payload: string;
  payloadHash: string | null;
  schemaVersion: number | null;
  releasePatchId: string | null;
  updatedAtClientMs: number | null;
  updatedAtServer: unknown;
};

type CloudCommitStatus = {
  enabled: boolean;
  disabledReason: string | null;
  dirty: boolean;
  pending: boolean;
  lastAttemptAt: number | null;
  lastSuccessAt: number | null;
  lastErrorCode: string | null;
  lastErrorAt: number | null;
  lastSlotId: number | null;
  lastCommittedHash: string | null;
  lastCommittedSlotId: number | null;
  pendingHash: string | null;
  pendingSlotId: number | null;
};

const state: CloudCommitStatus & {
  pendingPayload: string | null;
  pendingMeta: CloudCommitMeta | null;
  pendingPromise: Promise<unknown> | null;
} = {
  enabled: false,
  disabledReason: null,
  dirty: false,
  pending: false,
  lastAttemptAt: null,
  lastSuccessAt: null,
  lastErrorCode: null,
  lastErrorAt: null,
  lastSlotId: null,
  lastCommittedHash: null,
  lastCommittedSlotId: null,
  pendingHash: null,
  pendingSlotId: null,
  pendingPayload: null,
  pendingMeta: null,
  pendingPromise: null
};

function now() {
  return Date.now();
}

function notifySaveStatusPanel() {
  if (typeof window === "undefined") return;
  const updater = (window as typeof window & { updateSaveStatusPanel?: () => void }).updateSaveStatusPanel;
  if (typeof updater === "function") updater();
}

function setDisabled(reason: string) {
  state.enabled = false;
  state.disabledReason = reason;
  notifySaveStatusPanel();
}

function setEnabled() {
  state.enabled = true;
  state.disabledReason = null;
}

function hashPayload(payload: string) {
  let hash = 2166136261;
  for (let i = 0; i < payload.length; i += 1) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function buildDocPayload(slotId: number, payload: string, payloadHash: string, meta: CloudCommitMeta) {
  return {
    slotId,
    payload,
    payloadHash,
    updatedAtClientMs: now(),
    updatedAtServer: serverTimestamp(),
    schemaVersion: meta?.schemaVersion ?? null,
    releasePatchId: meta?.releasePatchId ?? null
  };
}

export function getCloudCommitStatus(): CloudCommitStatus {
  if (!hasFirebaseConfig() || isFirebaseConfigMissing()) {
    state.enabled = false;
    state.disabledReason = "firebase-config-missing";
  } else if (!state.disabledReason) {
    state.enabled = true;
  }
  return { ...state };
}

export function markCloudCommitDirty(slotId: number, payload: string, meta: CloudCommitMeta = {}) {
  if (!slotId || !payload) return;
  if (!hasFirebaseConfig()) {
    setDisabled("firebase-config-missing");
    updateDebugStage("save", { status: "warn", detail: "Cloud commit disabled (config missing)." });
    return;
  }

  setEnabled();
  const nextHash = hashPayload(payload);
  const samePending = state.pendingHash === nextHash && state.pendingSlotId === slotId;
  if (samePending) return;

  const alreadyCommitted = state.lastCommittedHash === nextHash && state.lastCommittedSlotId === slotId;
  if (alreadyCommitted) {
    state.dirty = false;
    state.pendingPayload = null;
    state.pendingHash = null;
    state.pendingSlotId = null;
    notifySaveStatusPanel();
    return;
  }

  state.pendingPayload = payload;
  state.pendingHash = nextHash;
  state.pendingSlotId = slotId;
  state.pendingMeta = meta;
  state.dirty = true;
  state.lastSlotId = slotId;
  updateDebugStage("save", { status: "active", detail: "Cloud commit queued." });
  notifySaveStatusPanel();
}

async function resolveFirebaseContext() {
  if (!hasFirebaseConfig() || isFirebaseConfigMissing()) {
    setDisabled("firebase-config-missing");
    return null;
  }
  const services = getFirebaseServices() || await waitForFirebaseServices();
  if (!services) return null;
  const user = await waitForFirebaseAuthUser();
  if (!user) return null;
  return { services, user };
}

async function commitSnapshot(reason: string, force: boolean) {
  if (state.pendingPromise) return state.pendingPromise;
  if (!state.pendingPayload || !state.pendingSlotId || !state.pendingHash) return null;
  if (!state.dirty) return null;

  const context = await resolveFirebaseContext();
  if (!context) {
    state.lastErrorCode = "firebase-not-ready";
    state.lastErrorAt = now();
    updateDebugStage("save", { status: "warn", detail: "Cloud commit skipped (Firebase not ready)." });
    notifySaveStatusPanel();
    return null;
  }

  const { services, user } = context;
  const slotId = state.pendingSlotId;
  const payload = state.pendingPayload;
  const payloadHash = state.pendingHash;
  const meta = state.pendingMeta || {};

  if (!force && state.lastCommittedHash === payloadHash && state.lastCommittedSlotId === slotId) {
    state.dirty = false;
    notifySaveStatusPanel();
    return null;
  }

  state.pending = true;
  state.lastAttemptAt = now();
  updateDebugStage("save", { status: "active", detail: `Cloud commit in progress (${reason}).` });
  notifySaveStatusPanel();

  const docRef = doc(services.db, "players", user.uid, "slots", String(slotId));
  const docPath = `players/${user.uid}/slots/${slotId}`;
  const committedHash = payloadHash;
  const committedSlotId = slotId;
  const write = setDoc(docRef, buildDocPayload(slotId, payload, payloadHash, meta), { merge: true })
    .then(() => {
      if (typeof console !== "undefined") {
        console.log("[firestore] save slot", { path: docPath, uid: user.uid, slotId, payloadHash });
      }
      state.lastSuccessAt = now();
      state.lastErrorCode = null;
      state.lastErrorAt = null;
      state.lastCommittedHash = committedHash;
      state.lastCommittedSlotId = committedSlotId;
      const pendingChanged = state.pendingHash
        && (state.pendingHash !== committedHash || state.pendingSlotId !== committedSlotId);
      state.dirty = Boolean(pendingChanged);
      if (!pendingChanged) {
        state.pendingPayload = null;
        state.pendingHash = null;
        state.pendingSlotId = null;
        state.pendingMeta = null;
      }
      updateDebugStage(
        "save",
        {
          status: pendingChanged ? "active" : "ok",
          detail: pendingChanged ? "Cloud commit done; newer changes pending." : "Cloud commit complete."
        }
      );
      return { ok: true };
    })
    .catch((error) => {
      const code = (error as { code?: string })?.code || "commit-failed";
      state.lastErrorCode = code;
      state.lastErrorAt = now();
      updateDebugStage("save", { status: "warn", detail: `Cloud commit failed (${code}).` });
      return { ok: false, reason: code };
    })
    .finally(() => {
      state.pending = false;
      state.pendingPromise = null;
      notifySaveStatusPanel();
    });

  state.pendingPromise = write;
  return write;
}

export function flushCloudCommitIfDue(reason = "autosave") {
  return commitSnapshot(reason, false);
}

export function forceCloudCommitFlush(reason = "guardrails") {
  return commitSnapshot(reason, true);
}

export async function fetchCloudSlotSnapshot(slotId: number): Promise<CloudSlotSnapshot | null> {
  if (!slotId) return null;
  const context = await resolveFirebaseContext();
  if (!context) return null;
  const { services, user } = context;
  const docRef = doc(services.db, "players", user.uid, "slots", String(slotId));
  const docPath = `players/${user.uid}/slots/${slotId}`;
  try {
    updateDebugStage("save", { status: "active", detail: "Checking cloud slot..." });
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data() as DocumentData;
    const payload = typeof data?.payload === "string" ? data.payload : null;
    if (!payload) return null;
    const storedSlotId = Number.isFinite(data?.slotId)
      ? Number(data.slotId)
      : (Number.isFinite(Number.parseInt(data?.slotId, 10)) ? Number.parseInt(data?.slotId, 10) : null);
    const snapshot: CloudSlotSnapshot = {
      slotId,
      storedSlotId,
      payload,
      payloadHash: typeof data?.payloadHash === "string" ? data.payloadHash : null,
      schemaVersion: Number.isFinite(data?.schemaVersion) ? Number(data.schemaVersion) : null,
      releasePatchId: typeof data?.releasePatchId === "string" ? data.releasePatchId : null,
      updatedAtClientMs: Number.isFinite(data?.updatedAtClientMs) ? Number(data.updatedAtClientMs) : null,
      updatedAtServer: data?.updatedAtServer ?? null
    };
    if (typeof console !== "undefined") {
      console.log("[firestore] load slot", {
        path: docPath,
        uid: user.uid,
        slotId,
        payloadHash: snapshot.payloadHash
      });
    }
    updateDebugStage("save", { status: "ok", detail: "Cloud slot restored." });
    return snapshot;
  } catch (error) {
    const code = (error as { code?: string })?.code || "cloud-read-failed";
    state.lastErrorCode = code;
    state.lastErrorAt = now();
    updateDebugStage("save", { status: "warn", detail: `Cloud read failed (${code}).` });
    notifySaveStatusPanel();
    return null;
  }
}

export async function deleteCloudSlotSnapshot(slotId: number) {
  if (!slotId) return { ok: false, reason: "no-slot" };
  const context = await resolveFirebaseContext();
  if (!context) return { ok: false, reason: "firebase-not-ready" };
  const { services, user } = context;
  const docRef = doc(services.db, "players", user.uid, "slots", String(slotId));
  const docPath = `players/${user.uid}/slots/${slotId}`;
  try {
    await deleteDoc(docRef);
    if (typeof console !== "undefined") {
      console.log("[firestore] delete slot", { path: docPath, uid: user.uid, slotId });
    }
    return { ok: true };
  } catch (error) {
    const code = (error as { code?: string })?.code || "delete-failed";
    state.lastErrorCode = code;
    state.lastErrorAt = now();
    updateDebugStage("save", { status: "warn", detail: `Cloud delete failed (${code}).` });
    notifySaveStatusPanel();
    return { ok: false, reason: code, error };
  }
}
