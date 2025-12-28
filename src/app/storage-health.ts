const storageHealth = {
  saveSizeBytes: null,
  localStorageUsedBytes: null,
  localStorageFreeBytes: null,
  externalConfigured: null,
  lastMirror: null,
  lastError: null,
  updatedAt: null
};

const pendingWarnings = [];
let warningHandler = null;

function nowTs() {
  return Date.now();
}

export function setStorageWarningHandler(handler) {
  warningHandler = typeof handler === "function" ? handler : null;
  if (!warningHandler || !pendingWarnings.length) return;
  const queued = pendingWarnings.splice(0, pendingWarnings.length);
  queued.forEach((entry) => warningHandler(entry));
}

export function reportStorageWarning(message, kind = "storage") {
  const text = String(message || "").trim();
  if (!text) return;
  const payload = { message: text, kind };
  if (warningHandler) {
    warningHandler(payload);
    return;
  }
  pendingWarnings.push(payload);
}

export function updateStorageHealth(next = {}) {
  Object.assign(storageHealth, next);
  storageHealth.updatedAt = nowTs();
  return storageHealth;
}

export function recordStorageError({ scope = "storage", message = "", error = null, notify = null } = {}) {
  const detail = error
    ? (typeof error.message === "string" ? error.message : String(error))
    : null;
  const safeMessage = message || detail || "Storage error";
  storageHealth.lastError = {
    at: nowTs(),
    scope,
    message: safeMessage,
    detail
  };
  storageHealth.updatedAt = storageHealth.lastError.at;
  if (notify) {
    reportStorageWarning(safeMessage, notify);
  }
  return storageHealth.lastError;
}

export function recordExternalMirrorStatus({ target = "unknown", status = "ok", reason = null, error = null } = {}) {
  const entry = {
    at: nowTs(),
    target,
    status,
    reason: reason || null
  };
  if (error) {
    entry.detail = typeof error.message === "string" ? error.message : String(error);
  }
  storageHealth.lastMirror = entry;
  storageHealth.updatedAt = entry.at;
  if (status === "failed") {
    storageHealth.lastError = {
      at: entry.at,
      scope: `external:${target}`,
      message: reason || "External storage mirror failed",
      detail: entry.detail || null
    };
    if (storageHealth.externalConfigured) {
      const note = reason ? ` ${reason}.` : " Write failed.";
      reportStorageWarning(`External storage mirror failed (${target}).${note} Local copy preserved.`, "externalMirror");
    }
  }
  return entry;
}

export function getStorageHealthSnapshot() {
  try {
    return JSON.parse(JSON.stringify(storageHealth));
  } catch {
    return { ...storageHealth };
  }
}
