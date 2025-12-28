// @ts-nocheck
import { queueUsageSessionWrite } from "./file-storage.js";

const SESSION_INDEX_KEY = "rls_usage_session_index_v1";
const SESSION_KEY_PREFIX = "rls_usage_session_v1:";
const SESSION_MAX = 6;
const EVENT_LIMIT = 360;
const ERROR_LIMIT = 20;
const TRAIL_LIMIT = 40;
const PERSIST_DELAY_MS = 1500;

let storage = null;
let currentSession = null;
let actionTrail = [];
let persistTimer = null;

function resolveStorage() {
  if (typeof localStorage === "undefined") return null;
  try {
    const key = "__rls_usage_log_test__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return localStorage;
  } catch {
    return null;
  }
}

storage = resolveStorage();

function nowTs() {
  return Date.now();
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setIfDefined(target, key, value) {
  if (value === null || value === undefined) return;
  target[key] = value;
}

function isPlainObject(value) {
  if (!value || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function normalizePayload(payload) {
  if (payload === null || payload === undefined) return undefined;
  if (Array.isArray(payload)) return payload.length ? payload : undefined;
  if (isPlainObject(payload)) {
    return Object.keys(payload).length ? payload : undefined;
  }
  return payload;
}

function loadSessionIndex() {
  if (!storage) return [];
  const raw = storage.getItem(SESSION_INDEX_KEY);
  const parsed = safeParse(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

function saveSessionIndex(index) {
  if (!storage) return;
  try {
    storage.setItem(SESSION_INDEX_KEY, JSON.stringify(index));
  } catch {
    // ignore storage errors
  }
}

function pruneSessionIndex(index) {
  if (!storage) return index;
  if (index.length <= SESSION_MAX) return index;
  const overflow = index.length - SESSION_MAX;
  const removed = index.splice(0, overflow);
  removed.forEach((entry) => {
    if (!entry?.id) return;
    try {
      storage.removeItem(`${SESSION_KEY_PREFIX}${entry.id}`);
    } catch {
      // ignore cleanup errors
    }
  });
  return index;
}

function updateIndexEntry(id, updates) {
  if (!storage || !id) return;
  const index = loadSessionIndex();
  const entry = index.find((item) => item?.id === id);
  if (entry) Object.assign(entry, updates);
  saveSessionIndex(index);
}

function buildSessionId() {
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}-${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`;
  const rand = Math.random().toString(36).slice(2, 7);
  return `RLS-SESSION-${stamp}-${rand}`;
}

function baseContext() {
  return {
    url: typeof location !== "undefined" ? location.href : null,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    timezoneOffsetMin: new Date().getTimezoneOffset()
  };
}

function persistSession({ syncExternal = false } = {}) {
  if (!currentSession) return;
  if (storage) {
    try {
      storage.setItem(`${SESSION_KEY_PREFIX}${currentSession.id}`, JSON.stringify(currentSession));
    } catch {
      // ignore storage errors
    }
  }
  if (syncExternal) {
    queueUsageSessionWrite(currentSession);
  }
}

function flushPersist({ syncExternal = false } = {}) {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  persistSession({ syncExternal });
}

function schedulePersist() {
  if (!storage || !currentSession) return;
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    persistSession();
  }, PERSIST_DELAY_MS);
}

function logToConsole(level, label, payload) {
  if (typeof console === "undefined") return;
  const safeLevel = level === "warn" || level === "error" ? level : "info";
  const writer = console[safeLevel] || console.info;
  writer(label, payload);
}

function appendEvent(entry, { isAction = false, reportToConsole = false, level = "info" } = {}) {
  if (!currentSession) return;
  currentSession.events.push(entry);
  if (currentSession.events.length > EVENT_LIMIT) currentSession.events.shift();
  currentSession.lastEventAt = entry.ts;
  if (isAction) {
    const trailEntry = {
      ts: entry.ts,
      type: entry.type
    };
    setIfDefined(trailEntry, "route", entry.route);
    setIfDefined(trailEntry, "gameTs", entry.gameTs);
    setIfDefined(trailEntry, "payload", entry.payload);
    actionTrail.push(trailEntry);
    if (actionTrail.length > TRAIL_LIMIT) actionTrail.shift();
    currentSession.trail = actionTrail.slice();
  }
  if (reportToConsole) {
    logToConsole(level, `[usage] ${entry.type}`, entry);
  }
  schedulePersist();
}

function ensureSession(meta = {}) {
  if (currentSession) return currentSession;
  return startUsageSession(meta);
}

function normalizeErrorValue(value) {
  if (value instanceof Error) {
    return { message: value.message, stack: value.stack };
  }
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
  if (value === null || value === undefined) return null;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}

export function startUsageSession({ release } = {}) {
  if (currentSession) return currentSession;
  const now = nowTs();
  const id = buildSessionId();
  currentSession = {
    id,
    startedAt: now,
    endedAt: null,
    status: "active",
    release: release?.patchId || null,
    releaseTimestamp: release?.timestamp || null,
    releaseChannel: release?.channel || null,
    context: baseContext(),
    events: [],
    errors: [],
    trail: []
  };
  actionTrail = [];
  const index = loadSessionIndex();
  index.push({ id, startedAt: now, endedAt: null, status: "active" });
  saveSessionIndex(pruneSessionIndex(index));
  appendEvent(
    {
      ts: now,
      type: "session.start",
      route: null,
      gameTs: null,
      payload: { release: currentSession.release, channel: currentSession.releaseChannel }
    },
    { reportToConsole: true, level: "info" }
  );
  schedulePersist();
  return currentSession;
}

export function recordUsageEvent(type, payload = {}, { route = null, gameTs = null, isAction = false, reportToConsole = false, level = "info" } = {}) {
  ensureSession();
  const normalizedPayload = normalizePayload(payload);
  const entry = {
    ts: nowTs(),
    type
  };
  setIfDefined(entry, "route", route);
  setIfDefined(entry, "gameTs", gameTs);
  setIfDefined(entry, "payload", normalizedPayload);
  appendEvent(entry, { isAction, reportToConsole, level });
  return entry;
}

export function updateUsageSessionContext(next = {}) {
  ensureSession();
  if (!currentSession.context || typeof currentSession.context !== "object") {
    currentSession.context = {};
  }
  Object.assign(currentSession.context, next || {});
  schedulePersist();
  return currentSession.context;
}

export function recordUsageError({
  kind = "error",
  message = "",
  stack = null,
  filename = null,
  lineno = null,
  colno = null,
  reason = null,
  route = null,
  gameTs = null,
  reportToConsole = true
} = {}) {
  ensureSession();
  const ts = nowTs();
  const entry = {
    ts,
    kind,
    message: String(message || "Unknown error"),
    trail: actionTrail.slice()
  };
  setIfDefined(entry, "stack", stack ? String(stack) : null);
  setIfDefined(entry, "source", filename ? { filename, lineno, colno } : null);
  setIfDefined(entry, "reason", normalizeErrorValue(reason));
  setIfDefined(entry, "route", route);
  setIfDefined(entry, "gameTs", gameTs);
  currentSession.errors.push(entry);
  if (currentSession.errors.length > ERROR_LIMIT) currentSession.errors.shift();
  currentSession.status = "error";
  currentSession.lastErrorAt = ts;
  currentSession.trail = actionTrail.slice();
  updateIndexEntry(currentSession.id, { status: "error", lastErrorAt: ts });
  appendEvent(
    {
      ts,
      type: "session.error",
      route,
      gameTs,
      payload: { kind: entry.kind, message: entry.message }
    },
    { reportToConsole: false }
  );
  if (reportToConsole) {
    logToConsole("error", "[usage] session.error", entry);
  }
  flushPersist({ syncExternal: true });
  return entry;
}

export function finalizeUsageSession(reason = "ended") {
  if (!currentSession) return null;
  const ts = nowTs();
  currentSession.endedAt = ts;
  currentSession.endReason = reason;
  if (currentSession.status !== "error") currentSession.status = "ended";
  updateIndexEntry(currentSession.id, {
    endedAt: ts,
    endReason: reason,
    status: currentSession.status
  });
  appendEvent(
    {
      ts,
      type: "session.end",
      route: null,
      gameTs: null,
      payload: { reason }
    },
    { reportToConsole: true, level: "info" }
  );
  flushPersist({ syncExternal: true });
  return currentSession;
}

export function getUsageSessionSnapshot() {
  if (!currentSession) return null;
  try {
    return JSON.parse(JSON.stringify(currentSession));
  } catch {
    return { ...currentSession };
  }
}

export function getUsageSessionId() {
  return currentSession?.id || null;
}
