import fs from "fs";
import path from "path";

const ROOT = path.resolve("assets/png/portraits/creator-ids");
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

const entries = sortEntries(collectEntries(ROOT));
const payload = { root: "assets/png/portraits/creator-ids", entries };
const content = `const CREATOR_PORTRAIT_MANIFEST = ${JSON.stringify(payload, null, 2)};\n`;

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, content, "utf8");

const count = Object.values(entries).reduce((sum, list) => sum + list.length, 0);
console.log(`Creator portrait manifest: ${count} files across ${Object.keys(entries).length} folders.`);
