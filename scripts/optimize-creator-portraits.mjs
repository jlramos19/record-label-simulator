import fs from "fs";
import path from "path";
import sharp from "sharp";

const SOURCE_ROOT = path.resolve("assets/png/portraits/creator-ids");
const OUTPUT_ROOT = path.resolve("assets/png/portraits/creator-ids-optimized");
const EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

const MAX_SIZE = Number(process.env.RLS_PORTRAIT_MAX_SIZE || 512);
const QUALITY = Number(process.env.RLS_PORTRAIT_QUALITY || 80);

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

async function run() {
  const files = collectImageFiles(SOURCE_ROOT);
  if (!files.length) {
    console.log("No creator portraits found to optimize.");
    return;
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

  console.log(
    `Creator portraits optimized: ${optimized} updated, ${skipped} skipped, ${failed} failed.`
  );
}

run();
