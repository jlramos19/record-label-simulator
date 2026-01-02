// @ts-nocheck
import { clearFileHandle, fetchFileHandle, listChartSnapshots, storeFileHandle, storeChartSnapshot } from "./db";
import { recordExternalMirrorStatus, recordStorageError, updateStorageHealth } from "./storage-health";
import { decodeSavePayload, encodeSavePayload, isQuotaExceededError } from "./storage-utils";

const STORAGE_HANDLE_ID = "rls_external_storage_root_v1";
const STORAGE_MANIFEST_NAME = "rls-storage.json";
const USAGE_DIR = "usage-logs";
const SAVES_DIR = "saves";
const DB_DIR = "database";
const USAGE_WRITE_DEBOUNCE_MS = 1200;

let cachedHandle = null;
let handlePromise = null;
let writeQueue = Promise.resolve();
let usageWriteTimer = null;
let pendingUsageSession = null;

function isBrowser() {
  return typeof window !== "undefined";
}

export function isExternalStorageSupported() {
  if (!isBrowser()) return false;
  if (typeof window.showDirectoryPicker !== "function") return false;
  if (typeof window.location === "object") {
    const protocol = window.location.protocol || "";
    const hostname = window.location.hostname || "";
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    const isAllowedHttp = protocol === "http:" && isLocalhost;
    if (protocol !== "https:" && !isAllowedHttp) return false;
  }
  if (typeof window.isSecureContext === "boolean" && !window.isSecureContext) return false;
  return true;
}

function nowIso() {
  return new Date().toISOString();
}

function getSlotPrefix() {
  if (typeof SLOT_PREFIX === "string" && SLOT_PREFIX) return SLOT_PREFIX;
  return "rls_slot_";
}

function getSlotCount() {
  return Number.isFinite(SLOT_COUNT) ? SLOT_COUNT : 6;
}

function enqueueWrite(task) {
  writeQueue = writeQueue.then(task).catch(() => {});
  return writeQueue;
}

async function loadStoredHandle() {
  if (cachedHandle) return cachedHandle;
  if (handlePromise) return handlePromise;
  handlePromise = fetchFileHandle(STORAGE_HANDLE_ID)
    .then((handle) => {
      cachedHandle = handle || null;
      return cachedHandle;
    })
    .finally(() => {
      handlePromise = null;
    });
  return handlePromise;
}

async function ensurePermission(handle, requestPermission = false) {
  if (!handle) return false;
  if (typeof handle.queryPermission !== "function") return true;
  const opts = { mode: "readwrite" };
  let permission = await handle.queryPermission(opts);
  if (permission === "granted") return true;
  if (!requestPermission || typeof handle.requestPermission !== "function") return false;
  permission = await handle.requestPermission(opts);
  return permission === "granted";
}

export async function getExternalStorageHandle({ requestPermission = false } = {}) {
  if (!isExternalStorageSupported()) {
    updateStorageHealth({ externalConfigured: false });
    return null;
  }
  const handle = await loadStoredHandle();
  if (!handle) {
    updateStorageHealth({ externalConfigured: false });
    return null;
  }
  const allowed = await ensurePermission(handle, requestPermission);
  updateStorageHealth({ externalConfigured: allowed });
  return allowed ? handle : null;
}

export async function requestExternalStorageHandle() {
  if (!isExternalStorageSupported()) {
    updateStorageHealth({ externalConfigured: false });
    return { ok: false, reason: "unsupported" };
  }
  try {
    const handle = await window.showDirectoryPicker({ id: "rls-storage", mode: "readwrite" });
    cachedHandle = handle;
    await storeFileHandle(STORAGE_HANDLE_ID, handle);
    const allowed = await ensurePermission(handle, true);
    if (!allowed) {
      updateStorageHealth({ externalConfigured: false });
      return { ok: false, reason: "permission" };
    }
    updateStorageHealth({ externalConfigured: true });
    await writeStorageManifest(handle, { configuredAt: nowIso() });
    return { ok: true, handle };
  } catch (error) {
    if (error?.name === "AbortError") return { ok: false, reason: "cancelled" };
    updateStorageHealth({ externalConfigured: false });
    return { ok: false, reason: "error", error };
  }
}

export async function clearExternalStorageHandle() {
  cachedHandle = null;
  updateStorageHealth({ externalConfigured: false });
  return clearFileHandle(STORAGE_HANDLE_ID);
}

export async function getExternalStorageStatus() {
  if (!isExternalStorageSupported()) {
    updateStorageHealth({ externalConfigured: false });
    return { supported: false, status: "unsupported" };
  }
  const handle = await loadStoredHandle();
  if (!handle) {
    updateStorageHealth({ externalConfigured: false });
    return { supported: true, status: "not-set" };
  }
  const permission = await (async () => {
    if (typeof handle.queryPermission !== "function") return "granted";
    try {
      return await handle.queryPermission({ mode: "readwrite" });
    } catch {
      return "unknown";
    }
  })();
  const status = {
    supported: true,
    status: permission === "granted" ? "ready" : permission,
    name: handle.name || "External folder"
  };
  updateStorageHealth({ externalConfigured: status.status === "ready" });
  return status;
}

async function resolveDirectory(root, parts, create = true) {
  let current = root;
  for (const part of parts) {
    if (!part) continue;
    current = await current.getDirectoryHandle(part, { create });
  }
  return current;
}

async function writeTextFile(root, parts, content, { append = false } = {}) {
  if (!root) return false;
  try {
    const fileName = parts[parts.length - 1];
    const dirParts = parts.slice(0, -1);
    const dir = await resolveDirectory(root, dirParts, true);
    const fileHandle = await dir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable({ keepExistingData: append });
    if (append) {
      const file = await fileHandle.getFile();
      await writable.seek(file.size);
    }
    await writable.write(content);
    await writable.close();
    return true;
  } catch {
    return false;
  }
}

async function deleteFile(root, parts) {
  if (!root) return false;
  try {
    const fileName = parts[parts.length - 1];
    const dirParts = parts.slice(0, -1);
    const dir = await resolveDirectory(root, dirParts, false);
    await dir.removeEntry(fileName);
    return true;
  } catch {
    return false;
  }
}

async function writeStorageManifest(root, extra = {}) {
  const payload = {
    app: "Record Label Simulator",
    updatedAt: nowIso(),
    ...extra
  };
  return writeTextFile(root, [STORAGE_MANIFEST_NAME], JSON.stringify(payload, null, 2));
}

export function queueUsageSessionWrite(session) {
  if (!session) return;
  pendingUsageSession = session;
  if (usageWriteTimer) return;
  usageWriteTimer = setTimeout(() => {
    usageWriteTimer = null;
    const snapshot = pendingUsageSession;
    pendingUsageSession = null;
    if (!snapshot) return;
    enqueueWrite(async () => {
      const root = await getExternalStorageHandle();
      if (!root) {
        recordExternalMirrorStatus({ target: "usage", status: "skipped", reason: "not-configured" });
        return;
      }
      const ok = await writeTextFile(
        root,
        [USAGE_DIR, `usage-session-${snapshot.id}.json`],
        JSON.stringify(snapshot, null, 2)
      );
      if (!ok) {
        recordExternalMirrorStatus({ target: "usage", status: "failed", reason: "write-failed" });
        return;
      }
      const manifestOk = await writeStorageManifest(root, { lastUsageSession: snapshot.id, lastUsageSyncAt: nowIso() });
      if (!manifestOk) {
        recordExternalMirrorStatus({ target: "usage", status: "failed", reason: "manifest-failed" });
        return;
      }
      recordExternalMirrorStatus({ target: "usage", status: "ok" });
    });
  }, USAGE_WRITE_DEBOUNCE_MS);
}

export function queueSaveSlotWrite(index, payload) {
  if (!index || !payload) return;
  enqueueWrite(async () => {
    const root = await getExternalStorageHandle();
    if (!root) {
      recordExternalMirrorStatus({ target: "saves", status: "skipped", reason: "not-configured" });
      return;
    }
    const ok = await writeTextFile(root, [SAVES_DIR, `slot-${index}.json`], payload);
    if (!ok) {
      recordExternalMirrorStatus({ target: "saves", status: "failed", reason: "write-failed" });
      return;
    }
    const manifestOk = await writeStorageManifest(root, { lastSaveSyncAt: nowIso(), lastSaveSlot: index });
    if (!manifestOk) {
      recordExternalMirrorStatus({ target: "saves", status: "failed", reason: "manifest-failed" });
      return;
    }
    recordExternalMirrorStatus({ target: "saves", status: "ok" });
  });
}

export function queueSaveSlotDelete(index) {
  if (!index) return;
  enqueueWrite(async () => {
    const root = await getExternalStorageHandle();
    if (!root) {
      recordExternalMirrorStatus({ target: "saves", status: "skipped", reason: "not-configured" });
      return;
    }
    const ok = await deleteFile(root, [SAVES_DIR, `slot-${index}.json`]);
    if (!ok) {
      recordExternalMirrorStatus({ target: "saves", status: "failed", reason: "delete-failed" });
      return;
    }
    const manifestOk = await writeStorageManifest(root, { lastSaveSyncAt: nowIso(), lastSaveSlot: index, lastSaveAction: "delete" });
    if (!manifestOk) {
      recordExternalMirrorStatus({ target: "saves", status: "failed", reason: "manifest-failed" });
      return;
    }
    recordExternalMirrorStatus({ target: "saves", status: "ok" });
  });
}

export function queueChartSnapshotsWrite(snapshots) {
  if (!Array.isArray(snapshots) || !snapshots.length) return;
  enqueueWrite(async () => {
    const root = await getExternalStorageHandle();
    if (!root) {
      recordExternalMirrorStatus({ target: "charts", status: "skipped", reason: "not-configured" });
      return;
    }
    const lines = snapshots.map((snap) => JSON.stringify(snap)).join("\n") + "\n";
    const ok = await writeTextFile(root, [DB_DIR, "chart-history.ndjson"], lines, { append: true });
    if (!ok) {
      recordExternalMirrorStatus({ target: "charts", status: "failed", reason: "write-failed" });
      return;
    }
    const manifestOk = await writeStorageManifest(root, { lastChartSyncAt: nowIso(), lastChartSnapshots: snapshots.length });
    if (!manifestOk) {
      recordExternalMirrorStatus({ target: "charts", status: "failed", reason: "manifest-failed" });
      return;
    }
    recordExternalMirrorStatus({ target: "charts", status: "ok" });
  });
}

export async function readSaveSlotFromExternal(index) {
  if (!index) return null;
  const root = await getExternalStorageHandle();
  if (!root) return null;
  try {
    const dir = await resolveDirectory(root, [SAVES_DIR], false);
    const fileHandle = await dir.getFileHandle(`slot-${index}.json`);
    const file = await fileHandle.getFile();
    const text = await file.text();
    const decoded = decodeSavePayload(text);
    if (!decoded.ok || !decoded.payload) return null;
    return JSON.parse(decoded.payload);
  } catch {
    return null;
  }
}

export async function syncExternalStorageNow({ includeSaves = true, includeCharts = true, usageSession = null } = {}) {
  const root = await getExternalStorageHandle({ requestPermission: true });
  if (!root) {
    recordExternalMirrorStatus({ target: "sync", status: "failed", reason: "permission" });
    return { ok: false, reason: "permission" };
  }
  const summary = {
    ok: true,
    saves: 0,
    charts: 0,
    usage: 0,
    reason: null
  };
  let mirrorOk = true;
  if (includeSaves && typeof localStorage !== "undefined") {
    const prefix = getSlotPrefix();
    const count = getSlotCount();
    for (let i = 1; i <= count; i += 1) {
      const raw = localStorage.getItem(`${prefix}${i}`);
      if (!raw) continue;
      const wrote = await writeTextFile(root, [SAVES_DIR, `slot-${i}.json`], raw);
      if (wrote) {
        summary.saves += 1;
      } else if (mirrorOk) {
        mirrorOk = false;
        summary.reason = "save-write-failed";
      }
    }
  }
  if (includeCharts) {
    const snapshots = await listChartSnapshots();
    summary.charts = snapshots.length;
    const payload = JSON.stringify({ exportedAt: nowIso(), count: snapshots.length, snapshots }, null, 2);
    const chartOk = await writeTextFile(root, [DB_DIR, "chart-history.json"], payload);
    if (!chartOk && mirrorOk) {
      mirrorOk = false;
      summary.reason = "chart-write-failed";
    }
    if (snapshots.length) {
      const lines = snapshots.map((snap) => JSON.stringify(snap)).join("\n") + "\n";
      const ndOk = await writeTextFile(root, [DB_DIR, "chart-history.ndjson"], lines);
      if (!ndOk && mirrorOk) {
        mirrorOk = false;
        summary.reason = "chart-write-failed";
      }
    }
  }
  if (usageSession?.id) {
    const wrote = await writeTextFile(
      root,
      [USAGE_DIR, `usage-session-${usageSession.id}.json`],
      JSON.stringify(usageSession, null, 2)
    );
    if (wrote) {
      summary.usage = 1;
    } else if (mirrorOk) {
      mirrorOk = false;
      summary.reason = "usage-write-failed";
    }
  }
  const manifestOk = await writeStorageManifest(root, {
    lastSyncAt: nowIso(),
    saveCount: summary.saves,
    chartCount: summary.charts,
    usageCount: summary.usage
  });
  if (!manifestOk && mirrorOk) {
    mirrorOk = false;
    summary.reason = "manifest-failed";
  }
  summary.ok = mirrorOk;
  if (mirrorOk) {
    recordExternalMirrorStatus({ target: "sync", status: "ok" });
  } else {
    recordExternalMirrorStatus({ target: "sync", status: "failed", reason: summary.reason || "write-failed" });
  }
  return summary;
}

export async function importChartHistoryFromExternal() {
  const root = await getExternalStorageHandle({ requestPermission: true });
  if (!root) return { ok: false, reason: "permission" };
  try {
    const dir = await resolveDirectory(root, [DB_DIR], false);
    const fileHandle = await dir.getFileHandle("chart-history.ndjson");
    const file = await fileHandle.getFile();
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    let imported = 0;
    for (const line of lines) {
      try {
        const snapshot = JSON.parse(line);
        if (snapshot?.id) {
          await storeChartSnapshot(snapshot);
          imported += 1;
        }
      } catch {
        // skip bad lines
      }
    }
    await writeStorageManifest(root, { lastImportAt: nowIso(), lastChartImport: imported });
    return { ok: true, imported };
  } catch {
    return { ok: false, reason: "missing" };
  }
}

export async function importSavesFromExternal() {
  const root = await getExternalStorageHandle({ requestPermission: true });
  if (!root) return { ok: false, reason: "permission" };
  if (typeof localStorage === "undefined") return { ok: false, reason: "storage" };
  try {
    const dir = await resolveDirectory(root, [SAVES_DIR], false);
    const prefix = getSlotPrefix();
    let imported = 0;
    for await (const [name, handle] of dir.entries()) {
      if (handle.kind !== "file") continue;
      if (!name.startsWith("slot-") || !name.endsWith(".json")) continue;
      try {
        const file = await handle.getFile();
        const text = await file.text();
        const decoded = decodeSavePayload(text);
        if (!decoded.ok || !decoded.payload) continue;
        const data = JSON.parse(decoded.payload);
        const index = Number(name.replace(/[^0-9]/g, ""));
        if (!Number.isFinite(index) || !data) continue;
        try {
          const encoded = encodeSavePayload(JSON.stringify(data));
          localStorage.setItem(`${prefix}${index}`, encoded.payload);
          imported += 1;
        } catch (error) {
          if (isQuotaExceededError(error)) {
            recordStorageError({
              scope: "localStorage",
              message: "Local storage is full; import skipped.",
              error,
              notify: "localStorageQuota"
            });
          } else {
            recordStorageError({ scope: "localStorage", message: "Save import failed.", error });
          }
        }
      } catch {
        // skip invalid save
      }
    }
    await writeStorageManifest(root, { lastImportAt: nowIso(), lastSaveImport: imported });
    return { ok: true, imported };
  } catch {
    return { ok: false, reason: "missing" };
  }
}
