// Lightweight CSV utilities for mirror data (works in http server mode).
function parseCSV(text) {
    const rows = [];
    let row = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        const next = text[i + 1];
        if (char === "\"" && inQuotes && next === "\"") {
            current += "\"";
            i += 1;
            continue;
        }
        if (char === "\"") {
            inQuotes = !inQuotes;
            continue;
        }
        if (char === "," && !inQuotes) {
            row.push(current);
            current = "";
            continue;
        }
        if ((char === "\n" || char === "\r") && !inQuotes) {
            if (current.length || row.length) {
                row.push(current);
                rows.push(row);
            }
            row = [];
            current = "";
            continue;
        }
        current += char;
    }
    if (current.length || row.length) {
        row.push(current);
        rows.push(row);
    }
    const headers = rows.shift() || [];
    return rows.map((cols) => {
        const entry = {};
        headers.forEach((header, index) => {
            entry[header] = cols[index] ?? "";
        });
        return entry;
    });
}
async function loadCSV(path) {
    const url = path.startsWith("csv/") ? path : `csv/${path}`;
    try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok)
            return null;
        const text = await res.text();
        return parseCSV(text);
    }
    catch (err) {
        return null;
    }
}
export { parseCSV, loadCSV };
//# sourceMappingURL=csv.js.map