export function isQuotaExceededError(error) {
  if (!error) return false;
  if (error.name === "QuotaExceededError") return true;
  if (error.name === "NS_ERROR_DOM_QUOTA_REACHED") return true;
  if (error.code === 22 || error.code === 1014) return true;
  const message = typeof error.message === "string" ? error.message.toLowerCase() : "";
  return message.includes("quota");
}

export function estimateUtf16Bytes(value) {
  if (!value) return 0;
  return value.length * 2;
}

export function estimatePayloadBytes(payload) {
  if (!payload) return 0;
  if (typeof Blob !== "undefined") {
    return new Blob([payload]).size;
  }
  return estimateUtf16Bytes(payload);
}

export function estimateLocalStorageBytes(storage = typeof localStorage !== "undefined" ? localStorage : null) {
  if (!storage) return 0;
  try {
    let total = 0;
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (!key) continue;
      const value = storage.getItem(key) || "";
      total += key.length + value.length;
    }
    return total * 2;
  } catch {
    return 0;
  }
}
