const DB_NAME = "rls_mvp_db";
const DB_VERSION = 2;
const STORE_CHART_HISTORY = "chart_history";
const STORE_FILE_HANDLES = "file_handles";
let dbPromise = null;
function openDb() {
    if (dbPromise)
        return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_CHART_HISTORY)) {
                const store = db.createObjectStore(STORE_CHART_HISTORY, { keyPath: "id" });
                store.createIndex("by_scope", "scope");
                store.createIndex("by_week", "week");
                store.createIndex("by_ts", "ts");
            }
            if (!db.objectStoreNames.contains(STORE_FILE_HANDLES)) {
                db.createObjectStore(STORE_FILE_HANDLES, { keyPath: "id" });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
    return dbPromise;
}
export function storeChartSnapshot(snapshot) {
    if (!snapshot || !snapshot.id)
        return Promise.resolve(false);
    return openDb().then((db) => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CHART_HISTORY, "readwrite");
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
        tx.objectStore(STORE_CHART_HISTORY).put(snapshot);
    }));
}
export function fetchChartSnapshot(scope, week) {
    if (!scope || !week)
        return Promise.resolve(null);
    return openDb().then((db) => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CHART_HISTORY, "readonly");
        const store = tx.objectStore(STORE_CHART_HISTORY);
        const index = store.index("by_week");
        const request = index.getAll(week);
        request.onsuccess = () => {
            const items = request.result || [];
            resolve(items.find((item) => item.scope === scope) || null);
        };
        request.onerror = () => reject(request.error);
    })).catch(() => null);
}
export function fetchChartSnapshotsForWeek(week) {
    if (!week)
        return Promise.resolve([]);
    return openDb().then((db) => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CHART_HISTORY, "readonly");
        const store = tx.objectStore(STORE_CHART_HISTORY);
        const index = store.index("by_week");
        const request = index.getAll(week);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    })).catch(() => []);
}
export function listChartWeeks() {
    return openDb().then((db) => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CHART_HISTORY, "readonly");
        const store = tx.objectStore(STORE_CHART_HISTORY);
        const index = store.index("by_week");
        const weeks = new Map();
        index.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                const value = cursor.value;
                if (value && value.week) {
                    const current = weeks.get(value.week) || 0;
                    if (value.ts && value.ts > current)
                        weeks.set(value.week, value.ts);
                }
                cursor.continue();
            }
            else {
                const list = Array.from(weeks.entries())
                    .map(([week, ts]) => ({ week: Number(week), ts }))
                    .sort((a, b) => b.week - a.week);
                resolve(list);
            }
        };
        tx.onerror = () => reject(tx.error);
    })).catch(() => []);
}
export function listChartSnapshots() {
    return openDb().then((db) => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CHART_HISTORY, "readonly");
        const store = tx.objectStore(STORE_CHART_HISTORY);
        const results = [];
        store.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                results.push(cursor.value);
                cursor.continue();
            }
            else {
                resolve(results);
            }
        };
        tx.onerror = () => reject(tx.error);
    })).catch(() => []);
}
export function storeFileHandle(id, handle) {
    if (!id || !handle)
        return Promise.resolve(false);
    return openDb().then((db) => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_FILE_HANDLES, "readwrite");
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
        tx.objectStore(STORE_FILE_HANDLES).put({ id, handle, updatedAt: Date.now() });
    })).catch(() => false);
}
export function fetchFileHandle(id) {
    if (!id)
        return Promise.resolve(null);
    return openDb().then((db) => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_FILE_HANDLES, "readonly");
        const store = tx.objectStore(STORE_FILE_HANDLES);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result?.handle || null);
        request.onerror = () => reject(request.error);
    })).catch(() => null);
}
export function clearFileHandle(id) {
    if (!id)
        return Promise.resolve(false);
    return openDb().then((db) => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_FILE_HANDLES, "readwrite");
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
        tx.objectStore(STORE_FILE_HANDLES).delete(id);
    })).catch(() => false);
}
//# sourceMappingURL=db.js.map