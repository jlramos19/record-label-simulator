import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const TRACKLIST_PATH = path.join(ROOT, "public/assets/js/data/tracklist.js");

function loadTracklists() {
  const code = fs.readFileSync(TRACKLIST_PATH, "utf8");
  const context = { console };
  vm.createContext(context);
  vm.runInContext(
    `${code};
     Object.assign(globalThis, {
       TRACK_TITLES_EN,
       TRACK_TITLES_ES,
       TRACK_TITLES_KR,
       TRACK_TITLES
     });`,
    context,
    { filename: TRACKLIST_PATH },
  );

  const requiredKeys = [
    "TRACK_TITLES_EN",
    "TRACK_TITLES_ES",
    "TRACK_TITLES_KR",
    "TRACK_TITLES",
  ];
  for (const key of requiredKeys) {
    if (!Array.isArray(context[key])) {
      throw new Error(
        `Expected ${key} to be defined as an array in tracklist.js`,
      );
    }
  }

  return {
    en: context.TRACK_TITLES_EN,
    es: context.TRACK_TITLES_ES,
    kr: context.TRACK_TITLES_KR,
    all: context.TRACK_TITLES,
  };
}

function normalizeTitle(title) {
  return title.toLowerCase().replace(/\s+/g, " ").trim();
}

function findDuplicates(titles) {
  const seen = new Map();
  const duplicates = new Map();

  titles.forEach((title, index) => {
    const normalized = normalizeTitle(title);
    const prior = seen.get(normalized);
    if (prior !== undefined) {
      const list = duplicates.get(normalized) || [prior];
      list.push(index);
      duplicates.set(normalized, list);
    } else {
      seen.set(normalized, index);
    }
  });

  return duplicates;
}

function reportDuplicates(label, titles) {
  const duplicates = findDuplicates(titles);
  if (duplicates.size === 0) {
    console.log(`✅ ${label}: no duplicate track titles found.`);
    return 0;
  }

  console.error(`❌ ${label}: duplicate track titles detected`);
  for (const [normalized, indexes] of duplicates.entries()) {
    const rendered = indexes
      .map((idx) => `#${idx + 1} “${titles[idx]}”`)
      .join(", ");
    console.error(`  - ${rendered} (normalized as "${normalized}")`);
  }
  return duplicates.size;
}

function main() {
  const tracklists = loadTracklists();
  let duplicateCount = 0;
  duplicateCount += reportDuplicates("English", tracklists.en);
  duplicateCount += reportDuplicates("Spanish", tracklists.es);
  duplicateCount += reportDuplicates("Korean", tracklists.kr);
  duplicateCount += reportDuplicates("Combined", tracklists.all);

  if (duplicateCount > 0) {
    console.error(
      `\nFound ${duplicateCount} duplicate groups across track lists.`,
    );
    process.exitCode = 1;
  } else {
    console.log("\nAll track lists are duplicate-free.");
  }
}

main();
