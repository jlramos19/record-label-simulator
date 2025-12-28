// @ts-nocheck
import { clearFileHandle, fetchFileHandle, listChartSnapshots, storeFileHandle, storeChartSnapshot } from "./db.js";
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
    if (!isBrowser())
        return false;
    if (typeof window.showDirectoryPicker !== "function")
        return false;
    if (typeof window.isSecureContext === "boolean" && !window.isSecureContext)
        return false;
    return true;
}
function nowIso() {
    return new Date().toISOString();
}
function getSlotPrefix() {
    if (typeof SLOT_PREFIX === "string" && SLOT_PREFIX)
        return SLOT_PREFIX;
    return "rls_slot_";
}
function getSlotCount() {
    return Number.isFinite(SLOT_COUNT) ? SLOT_COUNT : 6;
}
function enqueueWrite(task) {
    writeQueue = writeQueue.then(task).catch(() => { });
    return writeQueue;
}
async function loadStoredHandle() {
    if (cachedHandle)
        return cachedHandle;
    if (handlePromise)
        return handlePromise;
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
    if (!handle)
        return false;
    if (typeof handle.queryPermission !== "function")
        return true;
    const opts = { mode: "readwrite" };
    let permission = await handle.queryPermission(opts);
    if (permission === "granted")
        return true;
    if (!requestPermission || typeof handle.requestPermission !== "function")
        return false;
    permission = await handle.requestPermission(opts);
    return permission === "granted";
}
export async function getExternalStorageHandle({ requestPermission = false } = {}) {
    if (!isExternalStorageSupported())
        return null;
    const handle = await loadStoredHandle();
    if (!handle)
        return null;
    const allowed = await ensurePermission(handle, requestPermission);
    return allowed ? handle : null;
}
export async function requestExternalStorageHandle() {
    if (!isExternalStorageSupported()) {
        return { ok: false, reason: "unsupported" };
    }
    try {
        const handle = await window.showDirectoryPicker({ id: "rls-storage", mode: "readwrite" });
        cachedHandle = handle;
        await storeFileHandle(STORAGE_HANDLE_ID, handle);
        const allowed = await ensurePermission(handle, true);
        if (!allowed)
            return { ok: false, reason: "permission" };
        await writeStorageManifest(handle, { configuredAt: nowIso() });
        return { ok: true, handle };
    }
    catch (error) {
        if (error?.name === "AbortError")
            return { ok: false, reason: "cancelled" };
        return { ok: false, reason: "error", error };
    }
}
export async function clearExternalStorageHandle() {
    cachedHandle = null;
    return clearFileHandle(STORAGE_HANDLE_ID);
}
export async function getExternalStorageStatus() {
    if (!isExternalStorageSupported()) {
        return { supported: false, status: "unsupported" };
    }
    const handle = await loadStoredHandle();
    if (!handle) {
        return { supported: true, status: "not-set" };
    }
    const permission = await (async () => {
        if (typeof handle.queryPermission !== "function")
            return "granted";
        try {
            return await handle.queryPermission({ mode: "readwrite" });
        }
        catch {
            return "unknown";
        }
    })();
    return {
        supported: true,
        status: permission === "granted" ? "ready" : permission,
        name: handle.name || "External folder"
    };
}
async function resolveDirectory(root, parts, create = true) {
    let current = root;
    for (const part of parts) {
        if (!part)
            continue;
        current = await current.getDirectoryHandle(part, { create });
    }
    return current;
}
async function writeTextFile(root, parts, content, { append = false } = {}) {
    if (!root)
        return false;
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
    }
    catch {
        return false;
    }
}
async function deleteFile(root, parts) {
    if (!root)
        return false;
    try {
        const fileName = parts[parts.length - 1];
        const dirParts = parts.slice(0, -1);
        const dir = await resolveDirectory(root, dirParts, false);
        await dir.removeEntry(fileName);
        return true;
    }
    catch {
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
    if (!session)
        return;
    pendingUsageSession = session;
    if (usageWriteTimer)
        return;
    usageWriteTimer = setTimeout(() => {
        usageWriteTimer = null;
        const snapshot = pendingUsageSession;
        pendingUsageSession = null;
        if (!snapshot)
            return;
        enqueueWrite(async () => {
            const root = await getExternalStorageHandle();
            if (!root)
                return;
            await writeTextFile(root, [USAGE_DIR, `usage-session-${snapshot.id}.json`], JSON.stringify(snapshot, null, 2));
            await writeStorageManifest(root, { lastUsageSession: snapshot.id, lastUsageSyncAt: nowIso() });
        });
    }, USAGE_WRITE_DEBOUNCE_MS);
}
export function queueSaveSlotWrite(index, payload) {
    if (!index || !payload)
        return;
    enqueueWrite(async () => {
        const root = await getExternalStorageHandle();
        if (!root)
            return;
        await writeTextFile(root, [SAVES_DIR, `slot-${index}.json`], payload);
        await writeStorageManifest(root, { lastSaveSyncAt: nowIso(), lastSaveSlot: index });
    });
}
export function queueSaveSlotDelete(index) {
    if (!index)
        return;
    enqueueWrite(async () => {
        const root = await getExternalStorageHandle();
        if (!root)
            return;
        await deleteFile(root, [SAVES_DIR, `slot-${index}.json`]);
        await writeStorageManifest(root, { lastSaveSyncAt: nowIso(), lastSaveSlot: index, lastSaveAction: "delete" });
    });
}
export function queueChartSnapshotsWrite(snapshots) {
    if (!Array.isArray(snapshots) || !snapshots.length)
        return;
    enqueueWrite(async () => {
        const root = await getExternalStorageHandle();
        if (!root)
            return;
        const lines = snapshots.map((snap) => JSON.stringify(snap)).join("\n") + "\n";
        await writeTextFile(root, [DB_DIR, "chart-history.ndjson"], lines, { append: true });
        await writeStorageManifest(root, { lastChartSyncAt: nowIso(), lastChartSnapshots: snapshots.length });
    });
}
export async function readSaveSlotFromExternal(index) {
    if (!index)
        return null;
    const root = await getExternalStorageHandle();
    if (!root)
        return null;
    try {
        const dir = await resolveDirectory(root, [SAVES_DIR], false);
        const fileHandle = await dir.getFileHandle(`slot-${index}.json`);
        const file = await fileHandle.getFile();
        const text = await file.text();
        return JSON.parse(text);
    }
    catch {
        return null;
    }
}
export async function syncExternalStorageNow({ includeSaves = true, includeCharts = true, usageSession = null } = {}) {
    const root = await getExternalStorageHandle({ requestPermission: true });
    if (!root)
        return { ok: false, reason: "permission" };
    const summary = {
        ok: true,
        saves: 0,
        charts: 0,
        usage: 0
    };
    if (includeSaves && typeof localStorage !== "undefined") {
        const prefix = getSlotPrefix();
        const count = getSlotCount();
        for (let i = 1; i <= count; i += 1) {
            const raw = localStorage.getItem(`${prefix}${i}`);
            if (!raw)
                continue;
            const ok = await writeTextFile(root, [SAVES_DIR, `slot-${i}.json`], raw);
            if (ok)
                summary.saves += 1;
        }
    }
    if (includeCharts) {
        const snapshots = await listChartSnapshots();
        summary.charts = snapshots.length;
        const payload = JSON.stringify({ exportedAt: nowIso(), count: snapshots.length, snapshots }, null, 2);
        await writeTextFile(root, [DB_DIR, "chart-history.json"], payload);
        if (snapshots.length) {
            const lines = snapshots.map((snap) => JSON.stringify(snap)).join("\n") + "\n";
            await writeTextFile(root, [DB_DIR, "chart-history.ndjson"], lines);
        }
    }
    if (usageSession?.id) {
        const ok = await writeTextFile(root, [USAGE_DIR, `usage-session-${usageSession.id}.json`], JSON.stringify(usageSession, null, 2));
        if (ok)
            summary.usage = 1;
    }
    await writeStorageManifest(root, {
        lastSyncAt: nowIso(),
        saveCount: summary.saves,
        chartCount: summary.charts,
        usageCount: summary.usage
    });
    return summary;
}
export async function importChartHistoryFromExternal() {
    const root = await getExternalStorageHandle({ requestPermission: true });
    if (!root)
        return { ok: false, reason: "permission" };
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
            }
            catch {
                // skip bad lines
            }
        }
        await writeStorageManifest(root, { lastImportAt: nowIso(), lastChartImport: imported });
        return { ok: true, imported };
    }
    catch {
        return { ok: false, reason: "missing" };
    }
}
export async function importSavesFromExternal() {
    const root = await getExternalStorageHandle({ requestPermission: true });
    if (!root)
        return { ok: false, reason: "permission" };
    if (typeof localStorage === "undefined")
        return { ok: false, reason: "storage" };
    try {
        const dir = await resolveDirectory(root, [SAVES_DIR], false);
        const prefix = getSlotPrefix();
        let imported = 0;
        for await (const [name, handle] of dir.entries()) {
            if (handle.kind !== "file")
                continue;
            if (!name.startsWith("slot-") || !name.endsWith(".json"))
                continue;
            try {
                const file = await handle.getFile();
                const text = await file.text();
                const data = JSON.parse(text);
                const index = Number(name.replace(/[^0-9]/g, ""));
                if (!Number.isFinite(index) || !data)
                    continue;
                localStorage.setItem(`${prefix}${index}`, JSON.stringify(data));
                imported += 1;
            }
            catch {
                // skip invalid save
            }
        }
        await writeStorageManifest(root, { lastImportAt: nowIso(), lastSaveImport: imported });
        return { ok: true, imported };
    }
    catch {
        return { ok: false, reason: "missing" };
    }
}
//# sourceMappingURL=file-storage.js.map