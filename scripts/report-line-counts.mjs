import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const outputPath = resolve("docs/reports/file-line-counts.csv");

const listFiles = () => {
  try {
    const stdout = execFileSync("rg", ["--files"], { encoding: "utf8" });
    return stdout.split(/\r?\n/).filter(Boolean);
  } catch {
    const out = [];
    const walk = (dir) => {
      const entries = readdirSync(dir);
      entries.forEach((entry) => {
        const full = join(dir, entry);
        const stat = statSync(full);
        if (stat.isDirectory()) {
          if (entry === ".git" || entry === "node_modules") return;
          walk(full);
        } else if (stat.isFile()) {
          out.push(full);
        }
      });
    };
    walk(".");
    return out;
  }
};

const countLines = (buffer) => {
  if (!buffer || buffer.length === 0) return 0;
  let lines = 0;
  for (let i = 0; i < buffer.length; i += 1) {
    if (buffer[i] === 10) lines += 1;
  }
  if (buffer[buffer.length - 1] !== 10) lines += 1;
  return lines;
};

const rows = [];
const files = listFiles();
files.forEach((file) => {
  const normalized = file.replace(/\\/g, "/");
  if (resolve(file) === outputPath) return;
  const data = readFileSync(file);
  const isBinary = data.includes(0);
  rows.push({
    path: normalized,
    lines: isBinary ? 0 : countLines(data),
    bytes: data.length,
    isBinary: isBinary ? 1 : 0
  });
});

rows.sort((a, b) => a.path.localeCompare(b.path));

mkdirSync(dirname(outputPath), { recursive: true });
const header = "path,lines,bytes,is_binary";
const body = rows.map((row) => `${row.path},${row.lines},${row.bytes},${row.isBinary}`);
writeFileSync(outputPath, `${header}\n${body.join("\n")}\n`, "utf8");

console.log(`Wrote ${rows.length} rows to ${outputPath}`);
