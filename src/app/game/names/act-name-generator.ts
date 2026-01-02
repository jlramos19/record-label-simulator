import {
  ACT_NAME_ADJECTIVE_CATEGORY_IDS,
  ACT_NAME_NOUN_CATEGORY_IDS,
  ACT_NAME_CATEGORIES,
  ACT_NAME_TOTALS
} from "./act-name-pools";

export const ACT_NAME_KEY_SEPARATOR = "::";

export type ActKind = "group" | "solo";

type CategoryWeightMap = Record<string, number>;
type ActKindWeightOverrides = {
  group_weights?: CategoryWeightMap;
  solo_weights?: CategoryWeightMap;
};
type NationWeightConfig = {
  adjective_weights?: CategoryWeightMap;
  noun_weights?: CategoryWeightMap;
  actkind_overrides?: ActKindWeightOverrides;
};

export type ActNamePair = {
  adjectiveId: string;
  nounId: string;
  nameKey: string;
};

export const ACT_NAME_NATION_BIAS_WEIGHTS: Record<string, NationWeightConfig> = {
  annglora: {
    adjective_weights: {
      colors_basic: 2,
      light_glow: 3,
      temperature: 2,
      texture: 2,
      material_substance: 1,
      size_scale: 1,
      shape_geometry: 1,
      speed_motion: 1,
      strength_power: 1,
      calm_intense: 3,
      weather_sky: 2,
      time_age: 2,
      nature_ecology: 4,
      luxury_regality: 1,
      tech_digital: 1
    },
    noun_weights: {
      animals_general: 1,
      birds: 1,
      sea_creatures: 2,
      insects_small: 2,
      flowers: 5,
      trees_woods: 4,
      gemstones_crystals: 1,
      metals_alloys: 1,
      tools_stationery: 1,
      household_objects: 1,
      tech_components: 1,
      sky_celestial: 2,
      weather_water: 3,
      geography_places: 3,
      groups_formations: 1
    },
    actkind_overrides: {
      group_weights: {
        groups_formations: 2
      },
      solo_weights: {
        groups_formations: 0
      }
    }
  },
  crowlya: {
    adjective_weights: {
      colors_basic: 2,
      light_glow: 4,
      temperature: 1,
      texture: 2,
      material_substance: 2,
      size_scale: 1,
      shape_geometry: 2,
      speed_motion: 1,
      strength_power: 2,
      calm_intense: 2,
      weather_sky: 2,
      time_age: 2,
      nature_ecology: 1,
      luxury_regality: 5,
      tech_digital: 1
    },
    noun_weights: {
      animals_general: 1,
      birds: 1,
      sea_creatures: 1,
      insects_small: 1,
      flowers: 1,
      trees_woods: 1,
      gemstones_crystals: 5,
      metals_alloys: 4,
      tools_stationery: 1,
      household_objects: 2,
      tech_components: 1,
      sky_celestial: 3,
      weather_water: 2,
      geography_places: 2,
      groups_formations: 3
    },
    actkind_overrides: {
      group_weights: {
        groups_formations: 4,
        gemstones_crystals: 6
      },
      solo_weights: {
        groups_formations: 0
      }
    }
  },
  bytenza: {
    adjective_weights: {
      colors_basic: 2,
      light_glow: 2,
      temperature: 1,
      texture: 1,
      material_substance: 2,
      size_scale: 1,
      shape_geometry: 2,
      speed_motion: 3,
      strength_power: 3,
      calm_intense: 1,
      weather_sky: 1,
      time_age: 1,
      nature_ecology: 1,
      luxury_regality: 1,
      tech_digital: 5
    },
    noun_weights: {
      animals_general: 3,
      birds: 2,
      sea_creatures: 1,
      insects_small: 1,
      flowers: 1,
      trees_woods: 1,
      gemstones_crystals: 1,
      metals_alloys: 3,
      tools_stationery: 1,
      household_objects: 1,
      tech_components: 5,
      sky_celestial: 2,
      weather_water: 1,
      geography_places: 1,
      groups_formations: 4
    },
    actkind_overrides: {
      group_weights: {
        groups_formations: 6,
        tech_components: 6
      },
      solo_weights: {
        groups_formations: 0
      }
    }
  }
};

const DEFAULT_WEIGHT = 1;
const ACT_NAME_COMBINATIONS = ACT_NAME_TOTALS.adjectives * ACT_NAME_TOTALS.nouns;

const hashString = (value: string) => {
  const raw = String(value || "");
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const makeStableSeed = (parts: unknown) => {
  if (Array.isArray(parts)) return hashString(parts.join("|"));
  return hashString(String(parts));
};

const makeSeededRng = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

const resolveSeed = (seed: number | string | unknown) => {
  if (typeof seed === "number" && Number.isFinite(seed)) return seed >>> 0;
  if (typeof seed === "string" && seed.length) return makeStableSeed(seed);
  if (Array.isArray(seed) && seed.length) return makeStableSeed(seed);
  if (seed) return makeStableSeed(seed);
  return null;
};

const resolveRng = ({
  rng,
  seed
}: {
  rng?: () => number;
  seed?: number | string | unknown;
} = {}) => {
  if (typeof rng === "function") return rng;
  const resolvedSeed = resolveSeed(seed);
  return Number.isFinite(resolvedSeed) ? makeSeededRng(resolvedSeed as number) : Math.random;
};

const normalizeActKind = (actKind?: ActKind | string) =>
  actKind === "solo" ? "solo" : "group";

const normalizeNationKey = (nation?: string) => String(nation || "annglora").toLowerCase();

const resolveNationWeights = (nation: string, override?: NationWeightConfig) => {
  if (override) return override;
  const key = normalizeNationKey(nation);
  return ACT_NAME_NATION_BIAS_WEIGHTS[key] || ACT_NAME_NATION_BIAS_WEIGHTS.annglora;
};

const resolveCategoryWeight = (
  categoryId: string,
  baseWeights: CategoryWeightMap,
  actKindOverrides: ActKindWeightOverrides,
  actKind: ActKind
) => {
  const overrideMap = actKind === "solo" ? actKindOverrides.solo_weights : actKindOverrides.group_weights;
  const override = overrideMap && Object.prototype.hasOwnProperty.call(overrideMap, categoryId)
    ? overrideMap[categoryId]
    : undefined;
  const raw = override ?? baseWeights[categoryId] ?? DEFAULT_WEIGHT;
  return Number.isFinite(raw) ? Number(raw) : DEFAULT_WEIGHT;
};

const pickWeightedCategory = (
  categoryIds: string[],
  weights: CategoryWeightMap,
  actKindOverrides: ActKindWeightOverrides,
  actKind: ActKind,
  rng: () => number
) => {
  const entries = categoryIds
    .map((id) => ({ id, weight: resolveCategoryWeight(id, weights, actKindOverrides, actKind) }))
    .filter((entry) => entry.weight > 0);
  const pool = entries.length ? entries : categoryIds.map((id) => ({ id, weight: DEFAULT_WEIGHT }));
  const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = rng() * total;
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return entry.id;
  }
  return pool[pool.length - 1].id;
};

const seededPick = <T>(list: T[], rng: () => number) => list[Math.floor(rng() * list.length)];

export const makeActNameKey = (adjectiveId: string, nounId: string) =>
  `${adjectiveId}${ACT_NAME_KEY_SEPARATOR}${nounId}`;

export const parseActNameKey = (nameKey: string) => {
  if (!nameKey || typeof nameKey !== "string") return null;
  const parts = nameKey.split(ACT_NAME_KEY_SEPARATOR);
  if (parts.length !== 2) return null;
  const [adjectiveId, nounId] = parts;
  if (!adjectiveId || !nounId) return null;
  return { adjectiveId, nounId };
};

export const generateActNamePair = ({
  nation = "Annglora",
  actKind = "group",
  rng,
  seed,
  adjectiveCategoryId,
  nounCategoryId,
  weights
}: {
  nation?: string;
  actKind?: ActKind;
  rng?: () => number;
  seed?: number | string | unknown;
  adjectiveCategoryId?: string;
  nounCategoryId?: string;
  weights?: NationWeightConfig;
} = {}): ActNamePair => {
  const rngFn = resolveRng({ rng, seed });
  const resolvedActKind = normalizeActKind(actKind);
  const config = resolveNationWeights(nation, weights);
  const adjectiveWeights = config.adjective_weights || {};
  const nounWeights = config.noun_weights || {};
  const actKindOverrides = config.actkind_overrides || {};
  const adjCategory = adjectiveCategoryId
    || pickWeightedCategory(ACT_NAME_ADJECTIVE_CATEGORY_IDS, adjectiveWeights, actKindOverrides, resolvedActKind, rngFn);
  const nounCategory = nounCategoryId
    || pickWeightedCategory(ACT_NAME_NOUN_CATEGORY_IDS, nounWeights, actKindOverrides, resolvedActKind, rngFn);
  const adjectiveId = seededPick(ACT_NAME_CATEGORIES.adjectiveCategories[adjCategory], rngFn);
  const nounId = seededPick(ACT_NAME_CATEGORIES.nounCategories[nounCategory], rngFn);
  return { adjectiveId, nounId, nameKey: makeActNameKey(adjectiveId, nounId) };
};

export const generateUniqueActNamePairs = ({
  count = 1,
  nation = "Annglora",
  actKind = "group",
  rng,
  seed,
  existingKeys = [],
  maxAttempts
}: {
  count?: number;
  nation?: string;
  actKind?: ActKind;
  rng?: () => number;
  seed?: number | string | unknown;
  existingKeys?: Iterable<string>;
  maxAttempts?: number;
} = {}): ActNamePair[] => {
  const rngFn = resolveRng({ rng, seed });
  const resolvedActKind = normalizeActKind(actKind);
  const used = new Set(Array.from(existingKeys || []).filter(Boolean));
  const remaining = Math.max(0, ACT_NAME_COMBINATIONS - used.size);
  const target = Math.min(Math.max(0, Math.floor(count)), remaining);
  const results: ActNamePair[] = [];
  const attemptLimit = Number.isFinite(maxAttempts)
    ? Math.max(1, Math.floor(maxAttempts as number))
    : Math.max(1000, target * 50);
  let attempts = 0;
  while (results.length < target && attempts < attemptLimit) {
    const pair = generateActNamePair({ nation, actKind: resolvedActKind, rng: rngFn });
    attempts += 1;
    if (used.has(pair.nameKey)) continue;
    used.add(pair.nameKey);
    results.push(pair);
  }
  return results;
};

export const ACT_NAME_TOTAL_COMBINATIONS = ACT_NAME_COMBINATIONS;
