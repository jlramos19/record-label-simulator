export function isQuotaExceededError(error) {
    if (!error)
        return false;
    if (error.name === "QuotaExceededError")
        return true;
    if (error.name === "NS_ERROR_DOM_QUOTA_REACHED")
        return true;
    if (error.code === 22 || error.code === 1014)
        return true;
    const message = typeof error.message === "string" ? error.message.toLowerCase() : "";
    return message.includes("quota");
}
export function estimateUtf16Bytes(value) {
    if (!value)
        return 0;
    return value.length * 2;
}
export function estimatePayloadBytes(payload) {
    if (!payload)
        return 0;
    if (typeof Blob !== "undefined") {
        return new Blob([payload]).size;
    }
    return estimateUtf16Bytes(payload);
}
export function estimateLocalStorageBytes(storage = typeof localStorage !== "undefined" ? localStorage : null) {
    if (!storage)
        return 0;
    try {
        let total = 0;
        for (let i = 0; i < storage.length; i += 1) {
            const key = storage.key(i);
            if (!key)
                continue;
            const value = storage.getItem(key) || "";
            total += key.length + value.length;
        }
        return total * 2;
    }
    catch {
        return 0;
    }
}
const SAVE_COMPRESSION_PREFIX = "rls:lz:";
const SAVE_COMPRESSION_MIN_CHARS = 20000;
const SAVE_COMPRESSION_MIN_SAVINGS_BYTES = 256;
const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const baseReverseMap = {};
function getBaseValue(alphabet, character) {
    if (!baseReverseMap[alphabet]) {
        baseReverseMap[alphabet] = {};
        for (let i = 0; i < alphabet.length; i += 1) {
            baseReverseMap[alphabet][alphabet.charAt(i)] = i;
        }
    }
    return baseReverseMap[alphabet][character];
}
// Minimal LZ-based compression adapted from lz-string (MIT).
function lzCompress(uncompressed, bitsPerChar, getCharFromInt) {
    if (uncompressed == null)
        return "";
    let i;
    let value;
    const dictionary = {};
    const dictionaryToCreate = {};
    let c = "";
    let wc = "";
    let w = "";
    let enlargeIn = 2;
    let dictSize = 3;
    let numBits = 2;
    const data = [];
    let dataVal = 0;
    let dataPos = 0;
    const pushDataVal = (bit) => {
        dataVal = (dataVal << 1) | bit;
        if (dataPos === bitsPerChar - 1) {
            dataPos = 0;
            data.push(getCharFromInt(dataVal));
            dataVal = 0;
        }
        else {
            dataPos += 1;
        }
    };
    for (let ii = 0; ii < uncompressed.length; ii += 1) {
        c = uncompressed.charAt(ii);
        if (!Object.prototype.hasOwnProperty.call(dictionary, c)) {
            dictionary[c] = dictSize++;
            dictionaryToCreate[c] = true;
        }
        wc = w + c;
        if (Object.prototype.hasOwnProperty.call(dictionary, wc)) {
            w = wc;
        }
        else {
            if (Object.prototype.hasOwnProperty.call(dictionaryToCreate, w)) {
                value = w.charCodeAt(0);
                if (value < 256) {
                    for (i = 0; i < numBits; i += 1)
                        pushDataVal(0);
                    for (i = 0; i < 8; i += 1) {
                        pushDataVal(value & 1);
                        value >>= 1;
                    }
                }
                else {
                    for (i = 0; i < numBits; i += 1)
                        pushDataVal(1);
                    for (i = 0; i < 16; i += 1) {
                        pushDataVal(value & 1);
                        value >>= 1;
                    }
                }
                enlargeIn -= 1;
                if (enlargeIn === 0) {
                    enlargeIn = 2 ** numBits;
                    numBits += 1;
                }
                delete dictionaryToCreate[w];
            }
            else {
                value = dictionary[w];
                for (i = 0; i < numBits; i += 1) {
                    pushDataVal(value & 1);
                    value >>= 1;
                }
            }
            enlargeIn -= 1;
            if (enlargeIn === 0) {
                enlargeIn = 2 ** numBits;
                numBits += 1;
            }
            dictionary[wc] = dictSize++;
            w = String(c);
        }
    }
    if (w !== "") {
        if (Object.prototype.hasOwnProperty.call(dictionaryToCreate, w)) {
            value = w.charCodeAt(0);
            if (value < 256) {
                for (i = 0; i < numBits; i += 1)
                    pushDataVal(0);
                for (i = 0; i < 8; i += 1) {
                    pushDataVal(value & 1);
                    value >>= 1;
                }
            }
            else {
                for (i = 0; i < numBits; i += 1)
                    pushDataVal(1);
                for (i = 0; i < 16; i += 1) {
                    pushDataVal(value & 1);
                    value >>= 1;
                }
            }
            enlargeIn -= 1;
            if (enlargeIn === 0) {
                enlargeIn = 2 ** numBits;
                numBits += 1;
            }
            delete dictionaryToCreate[w];
        }
        else {
            value = dictionary[w];
            for (i = 0; i < numBits; i += 1) {
                pushDataVal(value & 1);
                value >>= 1;
            }
        }
        enlargeIn -= 1;
        if (enlargeIn === 0) {
            enlargeIn = 2 ** numBits;
            numBits += 1;
        }
    }
    value = 2;
    for (i = 0; i < numBits; i += 1) {
        pushDataVal(value & 1);
        value >>= 1;
    }
    while (true) {
        dataVal <<= 1;
        if (dataPos === bitsPerChar - 1) {
            data.push(getCharFromInt(dataVal));
            break;
        }
        else {
            dataPos += 1;
        }
    }
    return data.join("");
}
function lzDecompress(length, resetValue, getNextValue) {
    const dictionary = [];
    let next;
    let enlargeIn = 4;
    let dictSize = 4;
    let numBits = 3;
    let entry = "";
    const result = [];
    let i;
    let w;
    const data = { val: getNextValue(0), position: resetValue, index: 1 };
    for (i = 0; i < 3; i += 1) {
        dictionary[i] = i;
    }
    let bits = 0;
    let maxpower = 2 ** 2;
    let power = 1;
    while (power !== maxpower) {
        bits |= (data.val & data.position) > 0 ? power : 0;
        data.position >>= 1;
        if (data.position === 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index);
            data.index += 1;
        }
        power <<= 1;
    }
    switch (next = bits) {
        case 0:
            bits = 0;
            maxpower = 2 ** 8;
            power = 1;
            while (power !== maxpower) {
                bits |= (data.val & data.position) > 0 ? power : 0;
                data.position >>= 1;
                if (data.position === 0) {
                    data.position = resetValue;
                    data.val = getNextValue(data.index);
                    data.index += 1;
                }
                power <<= 1;
            }
            entry = String.fromCharCode(bits);
            break;
        case 1:
            bits = 0;
            maxpower = 2 ** 16;
            power = 1;
            while (power !== maxpower) {
                bits |= (data.val & data.position) > 0 ? power : 0;
                data.position >>= 1;
                if (data.position === 0) {
                    data.position = resetValue;
                    data.val = getNextValue(data.index);
                    data.index += 1;
                }
                power <<= 1;
            }
            entry = String.fromCharCode(bits);
            break;
        case 2:
            return "";
        default:
            return null;
    }
    dictionary[3] = entry;
    w = entry;
    result.push(entry);
    while (true) {
        if (data.index > length) {
            return "";
        }
        bits = 0;
        maxpower = 2 ** numBits;
        power = 1;
        while (power !== maxpower) {
            bits |= (data.val & data.position) > 0 ? power : 0;
            data.position >>= 1;
            if (data.position === 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index);
                data.index += 1;
            }
            power <<= 1;
        }
        switch (next = bits) {
            case 0:
                bits = 0;
                maxpower = 2 ** 8;
                power = 1;
                while (power !== maxpower) {
                    bits |= (data.val & data.position) > 0 ? power : 0;
                    data.position >>= 1;
                    if (data.position === 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index);
                        data.index += 1;
                    }
                    power <<= 1;
                }
                dictionary[dictSize++] = String.fromCharCode(bits);
                next = dictSize - 1;
                enlargeIn -= 1;
                break;
            case 1:
                bits = 0;
                maxpower = 2 ** 16;
                power = 1;
                while (power !== maxpower) {
                    bits |= (data.val & data.position) > 0 ? power : 0;
                    data.position >>= 1;
                    if (data.position === 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index);
                        data.index += 1;
                    }
                    power <<= 1;
                }
                dictionary[dictSize++] = String.fromCharCode(bits);
                next = dictSize - 1;
                enlargeIn -= 1;
                break;
            case 2:
                return result.join("");
            default:
                break;
        }
        if (enlargeIn === 0) {
            enlargeIn = 2 ** numBits;
            numBits += 1;
        }
        if (dictionary[next]) {
            entry = dictionary[next];
        }
        else if (next === dictSize) {
            entry = w + w.charAt(0);
        }
        else {
            return null;
        }
        result.push(entry);
        dictionary[dictSize++] = w + entry.charAt(0);
        enlargeIn -= 1;
        w = entry;
        if (enlargeIn === 0) {
            enlargeIn = 2 ** numBits;
            numBits += 1;
        }
    }
}
function compressToBase64(input) {
    if (input == null)
        return "";
    const res = lzCompress(input, 6, (a) => BASE64_CHARS.charAt(a));
    switch (res.length % 4) {
        case 0: return res;
        case 1: return `${res}===`;
        case 2: return `${res}==`;
        case 3: return `${res}=`;
        default: return res;
    }
}
function decompressFromBase64(input) {
    if (input == null)
        return "";
    if (input === "")
        return null;
    return lzDecompress(input.length, 32, (index) => getBaseValue(BASE64_CHARS, input.charAt(index)));
}
export function encodeSavePayload(payload, { minChars = SAVE_COMPRESSION_MIN_CHARS } = {}) {
    const raw = typeof payload === "string" ? payload : "";
    const rawBytes = estimatePayloadBytes(raw);
    if (!raw || raw.length < minChars) {
        return { payload: raw, rawBytes, storedBytes: rawBytes, compressed: false };
    }
    try {
        const compressed = compressToBase64(raw);
        if (!compressed) {
            return { payload: raw, rawBytes, storedBytes: rawBytes, compressed: false };
        }
        const stored = `${SAVE_COMPRESSION_PREFIX}${compressed}`;
        const storedBytes = estimatePayloadBytes(stored);
        if (storedBytes + SAVE_COMPRESSION_MIN_SAVINGS_BYTES >= rawBytes) {
            return { payload: raw, rawBytes, storedBytes: rawBytes, compressed: false };
        }
        return { payload: stored, rawBytes, storedBytes, compressed: true, method: "lz-base64" };
    }
    catch {
        return { payload: raw, rawBytes, storedBytes: rawBytes, compressed: false };
    }
}
export function decodeSavePayload(payload) {
    if (typeof payload !== "string") {
        return { ok: false, payload: null, compressed: false, reason: "invalid" };
    }
    if (!payload.startsWith(SAVE_COMPRESSION_PREFIX)) {
        return { ok: true, payload, compressed: false };
    }
    const encoded = payload.slice(SAVE_COMPRESSION_PREFIX.length);
    try {
        const decompressed = decompressFromBase64(encoded);
        if (typeof decompressed !== "string" || decompressed.length === 0) {
            return { ok: false, payload: null, compressed: true, reason: "decompress" };
        }
        return { ok: true, payload: decompressed, compressed: true, method: "lz-base64" };
    }
    catch {
        return { ok: false, payload: null, compressed: true, reason: "decompress" };
    }
}
export function isCompressedSavePayload(payload) {
    return typeof payload === "string" && payload.startsWith(SAVE_COMPRESSION_PREFIX);
}
//# sourceMappingURL=storage-utils.js.map