import fs from "fs";
import path from "path";

const SOURCE_ROOT = path.resolve("assets/png/portraits/creator-ids");
const OPTIMIZED_ROOT = path.resolve("assets/png/portraits/creator-ids-optimized");
const OUTPUT = path.resolve("assets/js/data/creator-portraits.js");
const EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function collectEntries(rootDir) {
  const entries = {};
  if (!fs.existsSync(rootDir)) return entries;
  const stack = [rootDir];
  while (stack.length) {
    const current = stack.pop();
    const dirEntries = fs.readdirSync(current, { withFileTypes: true });
    dirEntries.forEach((entry) => {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        return;
      }
      if (!entry.isFile()) return;
      const ext = path.extname(entry.name).toLowerCase();
      if (!EXTENSIONS.has(ext)) return;
      const relDir = path.relative(rootDir, path.dirname(fullPath));
      if (!relDir || relDir.startsWith("..")) return;
      const key = relDir.split(path.sep).join("/");
      if (!key || key === ".") return;
      if (!entries[key]) entries[key] = [];
      entries[key].push(entry.name);
    });
  }
  return entries;
}

function sortEntries(entries) {
  const ordered = {};
  Object.keys(entries)
    .sort()
    .forEach((key) => {
      ordered[key] = entries[key].slice().sort();
    });
  return ordered;
}

const optimizedEntries = collectEntries(OPTIMIZED_ROOT);
const hasOptimized = Object.keys(optimizedEntries).length > 0;
const sourceEntries = hasOptimized ? optimizedEntries : collectEntries(SOURCE_ROOT);
const entries = sortEntries(sourceEntries);
const rootLabel = hasOptimized
  ? "assets/png/portraits/creator-ids-optimized"
  : "assets/png/portraits/creator-ids";
const payload = { root: rootLabel, entries };
const content = `const CREATOR_PORTRAIT_MANIFEST = ${JSON.stringify(payload, null, 2)};\n`;

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, content, "utf8");

const count = Object.values(entries).reduce((sum, list) => sum + list.length, 0);
const flavor = hasOptimized ? " (optimized)" : "";
console.log(`Creator portrait manifest: ${count} files across ${Object.keys(entries).length} folders${flavor}.`);
