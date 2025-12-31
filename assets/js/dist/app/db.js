const DB_NAME = "record-label-simulator";
const DB_VERSION = 1;
const STORE_CHART_HISTORY = "chart_history";
const STORE_FILE_HANDLES = "file_handles";
const STORE_EVENT_LOG = "event_log";
const STORE_RELEASE_PRODUCTION_VIEW = "release_production_view";
const STORE_KPI_SNAPSHOT = "kpi_snapshot";
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
            else {
                const store = request.transaction.objectStore(STORE_CHART_HISTORY);
                if (!store.indexNames.contains("by_scope"))
                    store.createIndex("by_scope", "scope");
                if (!store.indexNames.contains("by_week"))
                    store.createIndex("by_week", "week");
                if (!store.indexNames.contains("by_ts"))
                    store.createIndex("by_ts", "ts");
            }
            if (!db.objectStoreNames.contains(STORE_FILE_HANDLES)) {
                db.createObjectStore(STORE_FILE_HANDLES, { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains(STORE_EVENT_LOG)) {
                const store = db.createObjectStore(STORE_EVENT_LOG, { keyPath: "event_id" });
                store.createIndex("by_occurred_at_hour", "occurred_at_hour");
                store.createIndex("by_entity", ["entity_type", "entity_id"]);
                store.createIndex("by_event_type", "event_type");
            }
            else {
                const store = request.transaction.objectStore(STORE_EVENT_LOG);
                if (!store.indexNames.contains("by_occurred_at_hour")) {
                    store.createIndex("by_occurred_at_hour", "occurred_at_hour");
                }
                if (!store.indexNames.contains("by_entity")) {
                    store.createIndex("by_entity", ["entity_type", "entity_id"]);
                }
                if (!store.indexNames.contains("by_event_type")) {
                    store.createIndex("by_event_type", "event_type");
                }
            }
            if (!db.objectStoreNames.contains(STORE_RELEASE_PRODUCTION_VIEW)) {
                const store = db.createObjectStore(STORE_RELEASE_PRODUCTION_VIEW, { keyPath: "release_id" });
                store.createIndex("by_current_step", "current_step");
                store.createIndex("by_overall_risk", "overall_risk");
                store.createIndex("by_eta_hour", "eta_hour");
            }
            else {
                const store = request.transaction.objectStore(STORE_RELEASE_PRODUCTION_VIEW);
                if (!store.indexNames.contains("by_current_step")) {
                    store.createIndex("by_current_step", "current_step");
                }
                if (!store.indexNames.contains("by_overall_risk")) {
                    store.createIndex("by_overall_risk", "overall_risk");
                }
                if (!store.indexNames.contains("by_eta_hour")) {
                    store.createIndex("by_eta_hour", "eta_hour");
                }
            }
            if (!db.objectStoreNames.contains(STORE_KPI_SNAPSHOT)) {
                const store = db.createObjectStore(STORE_KPI_SNAPSHOT, { keyPath: "snapshot_id" });
                store.createIndex("by_entity_kpi", ["entity_type", "entity_id", "kpi_type"]);
                store.createIndex("by_calculated_at_hour", "calculated_at_hour");
            }
            else {
                const store = request.transaction.objectStore(STORE_KPI_SNAPSHOT);
                if (!store.indexNames.contains("by_entity_kpi")) {
                    store.createIndex("by_entity_kpi", ["entity_type", "entity_id", "kpi_type"]);
                }
                if (!store.indexNames.contains("by_calculated_at_hour")) {
                    store.createIndex("by_calculated_at_hour", "calculated_at_hour");
                }
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
    return dbPromise;
}
function countIndex(store, indexName) {
    return new Promise((resolve, reject) => {
        let index;
        try {
            index = store.index(indexName);
        }
        catch (error) {
            reject(error);
            return;
        }
        const request = index.count();
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}
export function verifyIndexedDbSchema() {
    return openDb().then((db) => {
        const missingStores = [];
        const missingIndexes = [];
        const storeSpecs = [
            {
                name: STORE_EVENT_LOG,
                indexes: ["by_occurred_at_hour", "by_entity", "by_event_type"],
            },
            {
                name: STORE_RELEASE_PRODUCTION_VIEW,
                indexes: ["by_current_step", "by_overall_risk", "by_eta_hour"],
            },
            {
                name: STORE_KPI_SNAPSHOT,
                indexes: ["by_entity_kpi", "by_calculated_at_hour"],
            },
        ];
        storeSpecs.forEach((spec) => {
            if (!db.objectStoreNames.contains(spec.name))
                missingStores.push(spec.name);
        });
        if (missingStores.length) {
            return {
                ok: false,
                missingStores,
                missingIndexes,
            };
        }
        const checks = storeSpecs.map((spec) => new Promise((resolve, reject) => {
            const tx = db.transaction(spec.name, "readonly");
            const store = tx.objectStore(spec.name);
            const indexChecks = spec.indexes.map((indexName) => {
                if (!store.indexNames.contains(indexName)) {
                    missingIndexes.push(`${spec.name}.${indexName}`);
                    return Promise.resolve(false);
                }
                return countIndex(store, indexName);
            });
            Promise.all(indexChecks)
                .then(() => resolve(true))
                .catch(reject);
        }));
        return Promise.all(checks)
            .then(() => ({
            ok: missingIndexes.length === 0,
            missingStores,
            missingIndexes,
        }))
            .catch((error) => ({
            ok: false,
            missingStores,
            missingIndexes,
            error,
        }));
    });
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