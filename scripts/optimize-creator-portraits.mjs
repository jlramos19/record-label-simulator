import fs from "fs";
import path from "path";
import sharp from "sharp";
import chokidar from "chokidar";

const SOURCE_ROOT = path.resolve("assets/png/portraits/creator-ids");
const OUTPUT_ROOT = path.resolve("assets/png/portraits/creator-ids-optimized");
const EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

const MAX_SIZE = Number(process.env.RLS_PORTRAIT_MAX_SIZE || 512);
const QUALITY = Number(process.env.RLS_PORTRAIT_QUALITY || 80);
const WATCH_MODE = process.argv.includes("--watch") || process.argv.includes("-w");

let workQueue = Promise.resolve();

function collectImageFiles(rootDir) {
  const files = [];
  if (!fs.existsSync(rootDir)) return files;
  const stack = [rootDir];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    entries.forEach((entry) => {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        return;
      }
      if (!entry.isFile()) return;
      const ext = path.extname(entry.name).toLowerCase();
      if (!EXTENSIONS.has(ext)) return;
      const relPath = path.relative(rootDir, fullPath);
      if (!relPath || relPath.startsWith("..")) return;
      files.push({ fullPath, relPath, ext });
    });
  }
  return files;
}

function shouldSkipOutput(sourcePath, outputPath) {
  if (!fs.existsSync(outputPath)) return false;
  const sourceStat = fs.statSync(sourcePath);
  const outputStat = fs.statSync(outputPath);
  return outputStat.mtimeMs >= sourceStat.mtimeMs;
}

function resolveOutputPath(sourcePath) {
  const relPath = path.relative(SOURCE_ROOT, sourcePath);
  if (!relPath || relPath.startsWith("..")) return null;
  return path.join(OUTPUT_ROOT, relPath);
}

function cleanupEmptyDirs(startDir) {
  let current = startDir;
  while (current && current.startsWith(OUTPUT_ROOT)) {
    if (!fs.existsSync(current)) {
      current = path.dirname(current);
      continue;
    }
    const entries = fs.readdirSync(current);
    if (entries.length) break;
    if (current === OUTPUT_ROOT) break;
    fs.rmdirSync(current);
    current = path.dirname(current);
  }
}

function enqueue(task) {
  workQueue = workQueue.then(task).catch((error) => {
    console.warn("Portrait optimizer task failed:", error?.message || error);
  });
  return workQueue;
}

async function writeOptimizedImage(sourcePath, outputPath, ext) {
  if (ext === ".gif") {
    fs.copyFileSync(sourcePath, outputPath);
    return;
  }
  const pipeline = sharp(sourcePath, { failOnError: false }).resize({
    width: Number.isFinite(MAX_SIZE) ? MAX_SIZE : 512,
    height: Number.isFinite(MAX_SIZE) ? MAX_SIZE : 512,
    fit: "inside",
    withoutEnlargement: true
  });
  if (ext === ".png") {
    await pipeline.png({ compressionLevel: 9, palette: true }).toFile(outputPath);
    return;
  }
  if (ext === ".jpg" || ext === ".jpeg") {
    await pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toFile(outputPath);
    return;
  }
  if (ext === ".webp") {
    await pipeline.webp({ quality: QUALITY }).toFile(outputPath);
    return;
  }
  await pipeline.toFile(outputPath);
}

async function optimizeSingleFile(sourcePath, { quiet = false } = {}) {
  const ext = path.extname(sourcePath).toLowerCase();
  if (!EXTENSIONS.has(ext)) return false;
  if (!fs.existsSync(sourcePath)) return false;
  const outputPath = resolveOutputPath(sourcePath);
  if (!outputPath) return false;
  if (shouldSkipOutput(sourcePath, outputPath)) return false;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await writeOptimizedImage(sourcePath, outputPath, ext);
  if (!quiet) {
    const relPath = path.relative(SOURCE_ROOT, sourcePath);
    console.log(`Optimized portrait: ${relPath}`);
  }
  return true;
}

function removeOptimizedFile(sourcePath) {
  const outputPath = resolveOutputPath(sourcePath);
  if (!outputPath) return false;
  if (!fs.existsSync(outputPath)) return false;
  fs.unlinkSync(outputPath);
  cleanupEmptyDirs(path.dirname(outputPath));
  return true;
}

function removeOptimizedDir(sourceDir) {
  const relPath = path.relative(SOURCE_ROOT, sourceDir);
  if (!relPath || relPath.startsWith("..")) return false;
  const outputDir = path.join(OUTPUT_ROOT, relPath);
  if (!fs.existsSync(outputDir)) return false;
  fs.rmSync(outputDir, { recursive: true, force: true });
  cleanupEmptyDirs(path.dirname(outputDir));
  return true;
}

async function optimizeAll() {
  const files = collectImageFiles(SOURCE_ROOT);
  if (!files.length) {
    console.log("No creator portraits found to optimize.");
    return { optimized: 0, skipped: 0, failed: 0 };
  }
  let optimized = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const outputPath = path.join(OUTPUT_ROOT, file.relPath);
    if (shouldSkipOutput(file.fullPath, outputPath)) {
      skipped += 1;
      continue;
    }
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    try {
      await writeOptimizedImage(file.fullPath, outputPath, file.ext);
      optimized += 1;
    } catch (error) {
      failed += 1;
      console.warn(`Failed to optimize ${file.relPath}:`, error?.message || error);
    }
  }

  return { optimized, skipped, failed };
}

function logSummary(summary) {
  console.log(
    `Creator portraits optimized: ${summary.optimized} updated, ${summary.skipped} skipped, ${summary.failed} failed.`
  );
}

async function run() {
  const summary = await optimizeAll();
  logSummary(summary);
  if (!WATCH_MODE) return;

  console.log("Watching creator portraits for changes...");
  const watcher = chokidar.watch(SOURCE_ROOT, {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 }
  });

  watcher.on("add", (filePath) => {
    enqueue(() => optimizeSingleFile(filePath));
  });
  watcher.on("change", (filePath) => {
    enqueue(() => optimizeSingleFile(filePath));
  });
  watcher.on("unlink", (filePath) => {
    enqueue(async () => {
      if (removeOptimizedFile(filePath)) {
        const relPath = path.relative(SOURCE_ROOT, filePath);
        console.log(`Removed optimized portrait: ${relPath}`);
      }
    });
  });
  watcher.on("unlinkDir", (dirPath) => {
    enqueue(async () => {
      if (removeOptimizedDir(dirPath)) {
        const relPath = path.relative(SOURCE_ROOT, dirPath);
        console.log(`Removed optimized portrait folder: ${relPath}`);
      }
    });
  });
  watcher.on("error", (error) => {
    console.warn("Portrait watcher error:", error?.message || error);
  });

  const shutdown = async () => {
    await watcher.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

run();
