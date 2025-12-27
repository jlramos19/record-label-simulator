import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "assets", "js", "dist");

const poolsPath = path.join(distDir, "app", "game", "names", "act-name-pools.js");
const generatorPath = path.join(distDir, "app", "game", "names", "act-name-generator.js");
const rendererPath = path.join(distDir, "app", "game", "names", "act-name-renderer.js");

if (!existsSync(poolsPath) || !existsSync(generatorPath) || !existsSync(rendererPath)) {
  console.error("Build output missing. Run `npm run build` before running this script.");
  process.exit(1);
}

const pools = await import(pathToFileURL(poolsPath).href);
const generator = await import(pathToFileURL(generatorPath).href);
const renderer = await import(pathToFileURL(rendererPath).href);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const {
  ACT_NAME_ADJECTIVES,
  ACT_NAME_NOUNS,
  ACT_NAME_CATEGORIES,
  ACT_NAME_ADJECTIVE_CATEGORY_IDS,
  ACT_NAME_NOUN_CATEGORY_IDS,
  ACT_NAME_TOTALS
} = pools;

const {
  ACT_NAME_TOTAL_COMBINATIONS,
  generateActNamePair,
  generateUniqueActNamePairs,
  makeActNameKey,
  parseActNameKey
} = generator;

const {
  renderActNameSpanish,
  renderActNameKorean
} = renderer;

const adjectiveIds = ACT_NAME_ADJECTIVE_CATEGORY_IDS;
const nounIds = ACT_NAME_NOUN_CATEGORY_IDS;
assert(adjectiveIds.length === 20, `Expected 20 adjective categories, got ${adjectiveIds.length}.`);
assert(nounIds.length === 20, `Expected 20 noun categories, got ${nounIds.length}.`);

adjectiveIds.forEach((categoryId) => {
  const list = ACT_NAME_CATEGORIES.adjectiveCategories[categoryId] || [];
  assert(list.length === 25, `Expected 25 adjectives in ${categoryId}, got ${list.length}.`);
});

nounIds.forEach((categoryId) => {
  const list = ACT_NAME_CATEGORIES.nounCategories[categoryId] || [];
  assert(list.length === 25, `Expected 25 nouns in ${categoryId}, got ${list.length}.`);
});

const adjectiveTotal = Object.keys(ACT_NAME_ADJECTIVES).length;
const nounTotal = Object.keys(ACT_NAME_NOUNS).length;
assert(adjectiveTotal === 500, `Expected 500 adjectives total, got ${adjectiveTotal}.`);
assert(nounTotal === 500, `Expected 500 nouns total, got ${nounTotal}.`);
assert(ACT_NAME_TOTALS.adjectives === 500, `ACT_NAME_TOTALS.adjectives expected 500, got ${ACT_NAME_TOTALS.adjectives}.`);
assert(ACT_NAME_TOTALS.nouns === 500, `ACT_NAME_TOTALS.nouns expected 500, got ${ACT_NAME_TOTALS.nouns}.`);
assert(ACT_NAME_TOTAL_COMBINATIONS === 250000, `Expected 250000 combinations, got ${ACT_NAME_TOTAL_COMBINATIONS}.`);

const pairA = generateActNamePair({ seed: "determinism", nation: "Crowlya" });
const pairB = generateActNamePair({ seed: "determinism", nation: "Crowlya" });
assert(pairA.nameKey === pairB.nameKey, "Determinism failed: same seed produced different keys.");

const uniquePairs = generateUniqueActNamePairs({ count: 50, seed: "unique", nation: "Annglora" });
assert(uniquePairs.length === 50, `Expected 50 unique pairs, got ${uniquePairs.length}.`);
assert(new Set(uniquePairs.map((pair) => pair.nameKey)).size === 50, "Unique generation returned duplicates.");

uniquePairs.slice(0, 20).forEach((pair) => {
  const parsed = parseActNameKey(pair.nameKey);
  assert(parsed, `Failed to parse key ${pair.nameKey}.`);
  const adj = ACT_NAME_ADJECTIVES[parsed.adjectiveId];
  const noun = ACT_NAME_NOUNS[parsed.nounId];
  assert(adj && noun, `Missing adjective or noun for ${pair.nameKey}.`);
  const gender = noun.es.gender === "f" ? "f" : "m";
  const adjective = adj.es[gender] || adj.es.m;
  const expected = `${noun.es.plural} ${adjective}`;
  const rendered = renderActNameSpanish(pair.nameKey);
  assert(rendered === expected, `Spanish mismatch for ${pair.nameKey}: ${rendered} vs ${expected}.`);
});

const adjectiveId = Object.keys(ACT_NAME_ADJECTIVES)[0];
const collectiveNounId = Object.keys(ACT_NAME_NOUNS).find((key) => ACT_NAME_NOUNS[key]?.ko?.collective);
if (adjectiveId && collectiveNounId) {
  const collective = ACT_NAME_NOUNS[collectiveNounId].ko.collective;
  const key = makeActNameKey(adjectiveId, collectiveNounId);
  const rendered = renderActNameKorean(key);
  assert(rendered.includes(collective), `Korean collective missing for ${key}: ${rendered}.`);
} else {
  console.warn("No collective Korean nouns found; skipping collective marker check.");
}

const deulNounId = Object.keys(ACT_NAME_NOUNS).find((key) => ACT_NAME_NOUNS[key]?.ko?.needsDeul);
if (adjectiveId && deulNounId) {
  const noun = ACT_NAME_NOUNS[deulNounId].ko.base;
  const key = makeActNameKey(adjectiveId, deulNounId);
  const rendered = renderActNameKorean(key);
  assert(rendered.includes(`${noun}들`), `Korean deul missing for ${key}: ${rendered}.`);
} else {
  console.warn("No nouns flagged for deul; skipping deul check.");
}

console.log("Act name generator checks passed.");
