import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { hasFirebaseConfig, waitForFirebaseAuthUser, waitForFirebaseServices } from "../firebase/client";

type BuildInfo = {
  patchId: string | null;
  channel: string | null;
};

export type ClientLogEntry = {
  id: string;
  tsClientMs: number;
  eventType: string;
  build: BuildInfo;
  slotId?: number | null;
  payloadHash?: string | null;
  bytes?: number | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  write?: {
    attempted: boolean;
    ok?: boolean;
    error?: string | null;
    at?: number | null;
  };
};

const LOG_BUFFER_LIMIT = 60;
const LOG_WRITE_LIMIT = 40;
const PREVIEW_SAMPLE_RATE = 0.25;

const recentLogs: ClientLogEntry[] = [];
let writesThisSession = 0;

declare const RLS_RELEASE:
  | {
      patchId?: string;
      channel?: string;
    }
  | undefined;

function resolveBuildInfo(): BuildInfo {
  if (typeof RLS_RELEASE !== "undefined" && RLS_RELEASE) {
    return {
      patchId: RLS_RELEASE.patchId || null,
      channel: RLS_RELEASE.channel || null
    };
  }
  return { patchId: null, channel: null };
}

function isTruthyParam(value: string | null) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function isDebugEnabled() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.has("debug") ? isTruthyParam(params.get("debug")) || params.get("debug") === "" : false;
}

function isPreviewHosting() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname || "";
  const isFirebaseDomain = host.endsWith(".web.app") || host.endsWith(".firebaseapp.com");
  return isFirebaseDomain && host.includes("--");
}

function shouldEnableClientLogs() {
  return isDebugEnabled() || isPreviewHosting();
}

function shouldSample() {
  if (isDebugEnabled()) return true;
  return Math.random() < PREVIEW_SAMPLE_RATE;
}

function pushRecent(entry: ClientLogEntry) {
  recentLogs.push(entry);
  if (recentLogs.length > LOG_BUFFER_LIMIT) {
    recentLogs.splice(0, recentLogs.length - LOG_BUFFER_LIMIT);
  }
}

function createEventId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `log_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

export function getClientLogSnapshot() {
  return recentLogs.slice();
}

export function recordClientLog(eventType: string, detail: Partial<ClientLogEntry> = {}) {
  if (!eventType) return null;
  const entry: ClientLogEntry = {
    id: createEventId(),
    tsClientMs: Date.now(),
    eventType,
    build: resolveBuildInfo(),
    slotId: null,
    payloadHash: null,
    bytes: null,
    errorCode: null,
    errorMessage: null,
    ...detail,
    write: { attempted: false }
  };
  pushRecent(entry);

  if (!shouldEnableClientLogs()) return entry;
  if (!shouldSample()) return entry;
  if (writesThisSession >= LOG_WRITE_LIMIT) return entry;

  writesThisSession += 1;
  entry.write = { attempted: true, at: Date.now() };
  void writeClientLog(entry);
  return entry;
}

async function writeClientLog(entry: ClientLogEntry) {
  if (!hasFirebaseConfig()) return;
  const services = await waitForFirebaseServices();
  if (!services) return;
  const user = await waitForFirebaseAuthUser();
  if (!user) return;
  const payload = {
    tsClientMs: entry.tsClientMs,
    tsServer: serverTimestamp(),
    build: entry.build,
    eventType: entry.eventType,
    slotId: entry.slotId ?? null,
    payloadHash: entry.payloadHash ?? null,
    bytes: entry.bytes ?? null,
    errorCode: entry.errorCode ?? null,
    errorMessage: entry.errorMessage ?? null
  };
  try {
    const logRef = collection(services.db, "players_preview", user.uid, "client_log");
    await addDoc(logRef, payload);
    if (entry.write) {
      entry.write.ok = true;
    }
  } catch (error) {
    if (entry.write) {
      entry.write.ok = false;
      entry.write.error = error?.message || "log-write-failed";
    }
  }
}
