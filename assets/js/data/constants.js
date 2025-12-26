// Static data and canon values (themes, moods, colors, AI labels, economy).
const HOUR_MS = 3600000;
const QUARTERS_PER_HOUR = 4;
const QUARTER_HOUR_MS = HOUR_MS / QUARTERS_PER_HOUR;
const WEEK_HOURS = 168;
const BASE_EPOCH = Date.UTC(2400, 0, 1, 0, 0, 0);
const PROMO_TIMEFRAMES = [
  { id: "morning", label: "Morning", startHour: 6, endHour: 12, slots: 2 },
  { id: "afternoon", label: "Afternoon", startHour: 12, endHour: 18, slots: 1 },
  { id: "night", label: "Night", startHour: 18, endHour: 24, slots: 2 }
];
const BROADCAST_SLOT_SCHEDULE = [5, 5, 5, 5, 5, 5, 5];
const FILMING_STUDIO_SLOTS = 5;

const BROADCAST_PROGRAMS = [
  {
    id: "eyeris-live-set",
    label: "Live Set",
    tier: "standard",
    minQuality: 0,
    requiresCharting: false,
    allowsActOnly: true
  },
  {
    id: "eyeris-interview",
    label: "Standard Interview",
    tier: "standard",
    minQuality: 0,
    requiresCharting: false,
    allowsActOnly: true
  },
  {
    id: "eyeris-prime-showcase",
    label: "Prime Time Showcase",
    tier: "high",
    minQuality: 80,
    requiresCharting: true,
    allowsActOnly: true
  }
];

const BROADCAST_STUDIOS = [
  {
    id: "eyeris-prime",
    label: "EyeriS Prime",
    owner: "eyeriS Corp",
    scope: { type: "global", id: "global" },
    slotSchedule: [5, 5, 5, 5, 5, 5, 5],
    audience: {
      ages: ["25-34", "35-44"],
      alignment: ["Safe", "Neutral"],
      themes: ["Freedom", "Ambition"],
      moods: ["Uplifting", "Energizing", "Thrilling"]
    }
  },
  {
    id: "eyeris-annglora",
    label: "EyeriS Nationline Annglora",
    owner: "eyeriS Corp",
    scope: { type: "nation", id: "Annglora", regions: ["Annglora Capital", "Annglora Elsewhere"] },
    slotSchedule: [5, 5, 5, 5, 5, 5, 5],
    audience: {
      ages: ["25-34", "35-49"],
      alignment: ["Safe"],
      themes: ["Freedom"],
      moods: ["Calming", "Cheering", "Uplifting"]
    }
  },
  {
    id: "eyeris-bytenza",
    label: "EyeriS Nationline Bytenza",
    owner: "eyeriS Corp",
    scope: { type: "nation", id: "Bytenza", regions: ["Bytenza Capital", "Bytenza Elsewhere"] },
    slotSchedule: [5, 5, 5, 5, 5, 5, 5],
    audience: {
      ages: ["16-24", "25-29"],
      alignment: ["Neutral"],
      themes: ["Ambition"],
      moods: ["Energizing", "Uplifting", "Calming"]
    }
  },
  {
    id: "eyeris-crowlya",
    label: "EyeriS Nationline Crowlya",
    owner: "eyeriS Corp",
    scope: { type: "nation", id: "Crowlya", regions: ["Crowlya Capital", "Crowlya Elsewhere"] },
    slotSchedule: [5, 5, 5, 5, 5, 5, 5],
    audience: {
      ages: ["18-29", "30-39"],
      alignment: ["Risky"],
      themes: ["Power"],
      moods: ["Daring", "Thrilling", "Angering"]
    }
  },
  {
    id: "eyeris-annglora-capital",
    label: "EyeriS Regionline: Bloomville",
    owner: "eyeriS Corp",
    scope: { type: "region", id: "Annglora Capital", regions: ["Annglora Capital"] },
    slotSchedule: [5, 5, 5, 5, 5, 5, 5],
    audience: {
      ages: ["25-34", "35-49"],
      alignment: ["Safe"],
      themes: ["Freedom"],
      moods: ["Uplifting", "Cheering", "Calming"]
    }
  },
  {
    id: "eyeris-annglora-elsewhere",
    label: "EyeriS Regionline: Annglora Elsewhere",
    owner: "eyeriS Corp",
    scope: { type: "region", id: "Annglora Elsewhere", regions: ["Annglora Elsewhere"] },
    slotSchedule: [5, 5, 5, 5, 5, 5, 5],
    audience: {
      ages: ["25-34", "35-49"],
      alignment: ["Safe"],
      themes: ["Morality"],
      moods: ["Calming", "Uplifting", "Boring"]
    }
  },
  {
    id: "eyeris-bytenza-capital",
    label: "EyeriS Regionline: Belltown",
    owner: "eyeriS Corp",
    scope: { type: "region", id: "Bytenza Capital", regions: ["Bytenza Capital"] },
    slotSchedule: [5, 5, 5, 5, 5, 5, 5],
    audience: {
      ages: ["16-24", "25-29"],
      alignment: ["Neutral"],
      themes: ["Ambition"],
      moods: ["Energizing", "Thrilling", "Uplifting"]
    }
  },
  {
    id: "eyeris-bytenza-elsewhere",
    label: "EyeriS Regionline: Bytenza Elsewhere",
    owner: "eyeriS Corp",
    scope: { type: "region", id: "Bytenza Elsewhere", regions: ["Bytenza Elsewhere"] },
    slotSchedule: [5, 5, 5, 5, 5, 5, 5],
    audience: {
      ages: ["16-24", "25-29"],
      alignment: ["Neutral"],
      themes: ["Loyalty"],
      moods: ["Calming", "Uplifting", "Cheering"]
    }
  },
  {
    id: "eyeris-crowlya-capital",
    label: "EyeriS Regionline: Campana City",
    owner: "eyeriS Corp",
    scope: { type: "region", id: "Crowlya Capital", regions: ["Crowlya Capital"] },
    slotSchedule: [5, 5, 5, 5, 5, 5, 5],
    audience: {
      ages: ["18-29", "30-39"],
      alignment: ["Risky"],
      themes: ["Power"],
      moods: ["Daring", "Thrilling", "Angering"]
    }
  },
  {
    id: "eyeris-crowlya-elsewhere",
    label: "EyeriS Regionline: Crowlya Elsewhere",
    owner: "eyeriS Corp",
    scope: { type: "region", id: "Crowlya Elsewhere", regions: ["Crowlya Elsewhere"] },
    slotSchedule: [5, 5, 5, 5, 5, 5, 5],
    audience: {
      ages: ["18-29", "30-39"],
      alignment: ["Risky"],
      themes: ["Ambition"],
      moods: ["Daring", "Energizing", "Angering"]
    }
  }
];

const FILMING_STUDIOS = [
  {
    id: "eyeris-film-annglora-capital",
    label: "EyeriS Filming Studio: Bloomville",
    owner: "eyeriS Corp",
    scope: { type: "region", id: "Annglora Capital", regions: ["Annglora Capital"] },
    slotSchedule: [5, 5, 5, 5, 5, 5, 5],
    audience: {
      ages: ["25-34", "35-49"],
      alignment: ["Safe"],
      themes: ["Freedom"],
      moods: ["Uplifting", "Cheering", "Calming"]
    }
  },
  {
    id: "eyeris-film-annglora-elsewhere",
    label: "EyeriS Filming Studio: Annglora Elsewhere",
    owner: "eyeriS Corp",
    scope: { type: "region", id: "Annglora Elsewhere", regions: ["Annglora Elsewhere"] },
    slotSchedule: [5, 5, 5, 5, 5, 5, 5],
    audience: {
      ages: ["25-34", "35-49"],
      alignment: ["Safe"],
      themes: ["Morality"],
      moods: ["Calming", "Uplifting", "Boring"]
    }
  },
  {
    id: "eyeris-film-bytenza-capital",
    label: "EyeriS Filming Studio: Belltown",
    owner: "eyeriS Corp",
    scope: { type: "region", id: "Bytenza Capital", regions: ["Bytenza Capital"] },
    slotSchedule: [5, 5, 5, 5, 5, 5, 5],
    audience: {
      ages: ["16-24", "25-29"],
      alignment: ["Neutral"],
      themes: ["Ambition"],
      moods: ["Energizing", "Thrilling", "Uplifting"]
    }
  },
  {
    id: "eyeris-film-bytenza-elsewhere",
    label: "EyeriS Filming Studio: Bytenza Elsewhere",
    owner: "eyeriS Corp",
    scope: { type: "region", id: "Bytenza Elsewhere", regions: ["Bytenza Elsewhere"] },
    slotSchedule: [5, 5, 5, 5, 5, 5, 5],
    audience: {
      ages: ["16-24", "25-29"],
      alignment: ["Neutral"],
      themes: ["Loyalty"],
      moods: ["Calming", "Uplifting", "Cheering"]
    }
  },
  {
    id: "eyeris-film-crowlya-capital",
    label: "EyeriS Filming Studio: Campana City",
    owner: "eyeriS Corp",
    scope: { type: "region", id: "Crowlya Capital", regions: ["Crowlya Capital"] },
    slotSchedule: [5, 5, 5, 5, 5, 5, 5],
    audience: {
      ages: ["18-29", "30-39"],
      alignment: ["Risky"],
      themes: ["Power"],
      moods: ["Daring", "Thrilling", "Angering"]
    }
  },
  {
    id: "eyeris-film-crowlya-elsewhere",
    label: "EyeriS Filming Studio: Crowlya Elsewhere",
    owner: "eyeriS Corp",
    scope: { type: "region", id: "Crowlya Elsewhere", regions: ["Crowlya Elsewhere"] },
    slotSchedule: [5, 5, 5, 5, 5, 5, 5],
    audience: {
      ages: ["18-29", "30-39"],
      alignment: ["Risky"],
      themes: ["Ambition"],
      moods: ["Daring", "Energizing", "Angering"]
    }
  }
];

const THEMES = ["Freedom", "Loyalty", "Ambition", "Morality", "Power"];
const MOODS = ["Cheering", "Saddening", "Thrilling", "Angering", "Calming", "Energizing", "Uplifting", "Boring", "Daring"];
const ALIGNMENTS = ["Safe", "Neutral", "Risky"];
const ACT_TYPES = ["Solo Act", "Group Act"];

const STAGES = [
  { name: "Sheet", role: "Songwriter", hours: 1, cost: 50, stamina: 25, progress: 0.35 },
  { name: "Demo", role: "Performer", hours: 2, cost: 500, stamina: 50, progress: 0.7 },
  { name: "Master", role: "Producer", hours: 3, cost: 2500, stamina: 100, progress: 1.0 }
];

const TRACK_ROLE_LIMITS = {
  Songwriter: 15,
  Performer: 10,
  Producer: 5
};

const STAMINA_MAX = 400;
const SKILL_MIN = 1;
const SKILL_MAX = 100;
const QUALITY_MIN = 1;
const QUALITY_MAX = 100;

const ERA_STAGES = ["Direction", "Creation", "Promotion", "Legacy"];
const ROLLOUT_PRESETS = [
  { id: "Sprint", label: "Sprint", weeks: [1, 2, 2, 1] },
  { id: "Standard", label: "Standard", weeks: [2, 2, 2, 2] },
  { id: "Longform", label: "Longform", weeks: [3, 3, 3, 3] }
];
const ROLLOUT_STRATEGY_TEMPLATES = [
  {
    id: "single-drip",
    label: "Single Drip",
    source: "template",
    cadence: [
      { kind: "release", weekOffset: 0 },
      { kind: "promo", weekOffset: 0, day: 6, hour: 12, promoType: "eyeriSocialPost" }
    ],
    eligibleCategories: { releases: ["Single"], promos: ["eyeriSocialPost"] },
    context: { alignmentTags: ALIGNMENTS.slice(), trendTags: [], outcomeScore: 38 }
  },
  {
    id: "pulse-loop",
    label: "Pulse Loop",
    source: "template",
    cadence: [
      { kind: "release", weekOffset: 0 },
      { kind: "promo", weekOffset: 0, day: 6, hour: 12, promoType: "eyeriSocialPost" },
      { kind: "release", weekOffset: 1 },
      { kind: "promo", weekOffset: 1, day: 6, hour: 12, promoType: "eyeriSocialPost" }
    ],
    eligibleCategories: { releases: ["Single"], promos: ["eyeriSocialPost"] },
    context: { alignmentTags: ["Safe", "Neutral"], trendTags: [], outcomeScore: 45 }
  },
  {
    id: "project-ladder",
    label: "Project Ladder",
    source: "template",
    cadence: [
      { kind: "release", weekOffset: 0 },
      { kind: "promo", weekOffset: 0, day: 6, hour: 12, promoType: "interview" },
      { kind: "release", weekOffset: 2 },
      { kind: "promo", weekOffset: 2, day: 6, hour: 12, promoType: "interview" },
      { kind: "release", weekOffset: 4 },
      { kind: "promo", weekOffset: 4, day: 6, hour: 12, promoType: "interview" }
    ],
    eligibleCategories: { releases: ["Single", "EP", "Album"], promos: ["interview"] },
    context: { alignmentTags: ["Safe", "Neutral"], trendTags: [], outcomeScore: 55 }
  },
  {
    id: "video-blitz",
    label: "Video Blitz",
    source: "template",
    cadence: [
      { kind: "release", weekOffset: 0 },
      { kind: "promo", weekOffset: 0, day: 6, hour: 12, promoType: "musicVideo" },
      { kind: "release", weekOffset: 2 },
      { kind: "promo", weekOffset: 2, day: 6, hour: 12, promoType: "musicVideo" }
    ],
    eligibleCategories: { releases: ["Single", "EP", "Album"], promos: ["musicVideo"] },
    context: { alignmentTags: ["Neutral", "Risky"], trendTags: [], outcomeScore: 60 }
  },
  {
    id: "tour-warmup",
    label: "Tour Warmup",
    source: "template",
    cadence: [
      { kind: "release", weekOffset: 0 },
      { kind: "promo", weekOffset: 1, day: 6, hour: 12, promoType: "interview" },
      { kind: "release", weekOffset: 3 },
      { kind: "promo", weekOffset: 3, day: 6, hour: 12, promoType: "livePerformance" }
    ],
    eligibleCategories: { releases: ["Single", "EP"], promos: ["interview", "livePerformance"] },
    context: { alignmentTags: ["Safe", "Risky"], trendTags: [], outcomeScore: 52 }
  }
];

const CHART_SIZES = { global: 100, nation: 40, region: 10 };
const CHART_WEIGHTS = { sales: 0.3, streaming: 0.3, airplay: 0.3, social: 0.1 };
const NATIONS = ["Annglora", "Bytenza", "Crowlya"];
const REGION_DEFS = [
  { id: "Annglora Capital", nation: "Annglora", label: "Bloomville" },
  { id: "Annglora Elsewhere", nation: "Annglora", label: "Annglora Elsewhere" },
  { id: "Bytenza Capital", nation: "Bytenza", label: "Belltown" },
  { id: "Bytenza Elsewhere", nation: "Bytenza", label: "Bytenza Elsewhere" },
  { id: "Crowlya Capital", nation: "Crowlya", label: "Campana City" },
  { id: "Crowlya Elsewhere", nation: "Crowlya", label: "Crowlya Elsewhere" }
];
const REGION_CONSUMPTION_WEIGHTS = {
  "Annglora Capital": { sales: 0.28, streaming: 0.32, airplay: 0.25, social: 0.15 },
  "Annglora Elsewhere": { sales: 0.35, streaming: 0.24, airplay: 0.31, social: 0.1 },
  "Bytenza Capital": { sales: 0.2, streaming: 0.4, airplay: 0.2, social: 0.2 },
  "Bytenza Elsewhere": { sales: 0.25, streaming: 0.35, airplay: 0.25, social: 0.15 },
  "Crowlya Capital": { sales: 0.25, streaming: 0.25, airplay: 0.35, social: 0.15 },
  "Crowlya Elsewhere": { sales: 0.32, streaming: 0.2, airplay: 0.33, social: 0.15 }
};
const NATION_PROFILES = {
  Annglora: { alignment: "Safe", theme: "Freedom", moods: ["Calming", "Cheering", "Uplifting"] },
  Bytenza: { alignment: "Neutral", theme: "Ambition", moods: ["Energizing", "Uplifting", "Calming"] },
  Crowlya: { alignment: "Risky", theme: "Power", moods: ["Daring", "Thrilling", "Angering"] }
};
const REGION_PROFILES = {
  "Annglora Capital": { alignment: "Safe", theme: "Freedom", moods: ["Uplifting", "Cheering", "Calming"] },
  "Annglora Elsewhere": { alignment: "Safe", theme: "Morality", moods: ["Calming", "Uplifting", "Boring"] },
  "Bytenza Capital": { alignment: "Neutral", theme: "Ambition", moods: ["Energizing", "Thrilling", "Uplifting"] },
  "Bytenza Elsewhere": { alignment: "Neutral", theme: "Loyalty", moods: ["Calming", "Uplifting", "Cheering"] },
  "Crowlya Capital": { alignment: "Risky", theme: "Power", moods: ["Daring", "Thrilling", "Angering"] },
  "Crowlya Elsewhere": { alignment: "Risky", theme: "Ambition", moods: ["Daring", "Energizing", "Angering"] }
};

const POPULATION_START_YEAR = 2025;
const POPULATION_START = 1000000000;
const POPULATION_TIER_1 = 5000000000;
const POPULATION_TIER_2 = 7500000000;
const POPULATION_CAP = 12500000000;
const POPULATION_POST3000_BAND = 0.03;
const POPULATION_STAGES = [
  { id: "Rebuild Era", startYear: 2025, endYear: 2100, splits: { Annglora: 1, Bytenza: 0, Crowlya: 0 } },
  { id: "Two-Country Era", startYear: 2100, endYear: 2200, splits: { Annglora: 0.5, Bytenza: 0.5, Crowlya: 0 } },
  { id: "Three-Country Era", startYear: 2200, endYear: 2400, splits: { Annglora: 0.5, Bytenza: 0.25, Crowlya: 0.25 } },
  { id: "Campaign Era", startYear: 2400, endYear: 4000, splits: { Annglora: 0.525, Bytenza: 0.333, Crowlya: 0.142 }, variancePoints: 0.05 },
  { id: "Post-Campaign Stabilization", startYear: 4000, endYear: 9999, splits: { Annglora: 0.5, Bytenza: 0.3, Crowlya: 0.2 } }
];
const REGION_CAPITAL_SHARE = 0.35;
const MONOPOLY_SHARE = 0.6;

const ECONOMY_BASELINES = {
  digitalSingle: 0.69,
  physicalSingle: 4.99,
  physicalReleaseFee: 500,
  physicalUnitCostRatio: 0.35,
  physicalRunMin: 200,
  physicalRunMax: 25000,
  physicalRunRound: 50,
  studioLease4y: 44000000,
  studioBuildCost: 528000000,
  tuitionPerMember: 1815,
  subscription: 14.99,
  governmentFunds: 1000000000000
};
const ECONOMY_TUNING = {
  revenuePerChartPoint: 22,
  upkeepPerCreator: 150,
  upkeepPerOwnedStudio: 600,
  promoWeekBudgetStep: 1200,
  promoWeekBase: 1,
  promoWeeksMin: 1,
  promoWeeksMax: 4,
  physicalUnitCostMin: 0.5
};
const ECONOMY_PRICE_MULTIPLIERS = { single: 1, ep: 1.55, album: 2.25 };
const PRICE_PATTERN = [0.3, 0.7];

const MODIFIERS = [
  { id: "None", label: "None", qualityDelta: 0, hoursDelta: 0, costDelta: 0, basePrice: 0, desc: "No modifier." },
  { id: "Sensory Sage", label: "Sensory Sage", qualityDelta: 8, hoursDelta: 1, costDelta: 200, basePrice: 2400, desc: "Higher quality, slower output." },
  { id: "Dispatch Dust", label: "Dispatch Dust", qualityDelta: -8, hoursDelta: -1, costDelta: -150, basePrice: 1800, desc: "Faster output, lower quality." },
  { id: "Cheering Citrus", label: "Cheering Citrus", qualityDelta: 6, hoursDelta: 0, costDelta: 0, basePrice: 1200, mood: "Cheering", desc: "Boosts quality for Cheering mood content." },
  { id: "Saddening Shade", label: "Saddening Shade", qualityDelta: 6, hoursDelta: 0, costDelta: 0, basePrice: 1200, mood: "Saddening", desc: "Boosts quality for Saddening mood content." },
  { id: "Thrilling Spark", label: "Thrilling Spark", qualityDelta: 6, hoursDelta: 0, costDelta: 0, basePrice: 1200, mood: "Thrilling", desc: "Boosts quality for Thrilling mood content." },
  { id: "Almighty Aqua", label: "Almighty Aqua", qualityDelta: 6, hoursDelta: 0, costDelta: 0, basePrice: 1200, mood: "Angering", desc: "Boosts quality for Angering mood content." },
  { id: "Calming Cloud", label: "Calming Cloud", qualityDelta: 6, hoursDelta: 0, costDelta: 0, basePrice: 1200, mood: "Calming", desc: "Boosts quality for Calming mood content." },
  { id: "Energizing Ember", label: "Energizing Ember", qualityDelta: 6, hoursDelta: 0, costDelta: 0, basePrice: 1200, mood: "Energizing", desc: "Boosts quality for Energizing mood content." },
  { id: "Uplifting Aura", label: "Uplifting Aura", qualityDelta: 6, hoursDelta: 0, costDelta: 0, basePrice: 1200, mood: "Uplifting", desc: "Boosts quality for Uplifting mood content." },
  { id: "Boring Basalt", label: "Boring Basalt", qualityDelta: 6, hoursDelta: 0, costDelta: 0, basePrice: 1200, mood: "Boring", desc: "Boosts quality for Boring mood content." },
  { id: "Daring Drift", label: "Daring Drift", qualityDelta: 6, hoursDelta: 0, costDelta: 0, basePrice: 1200, mood: "Daring", desc: "Boosts quality for Daring mood content." },
  { id: "Freedom Forge", label: "Freedom Forge", qualityDelta: 5, hoursDelta: 0, costDelta: 0, basePrice: 1100, theme: "Freedom", desc: "Boosts quality for Freedom theme content." },
  { id: "Loyalty Lattice", label: "Loyalty Lattice", qualityDelta: 5, hoursDelta: 0, costDelta: 0, basePrice: 1100, theme: "Loyalty", desc: "Boosts quality for Loyalty theme content." },
  { id: "Ambition Apex", label: "Ambition Apex", qualityDelta: 5, hoursDelta: 0, costDelta: 0, basePrice: 1100, theme: "Ambition", desc: "Boosts quality for Ambition theme content." },
  { id: "Morality Mirror", label: "Morality Mirror", qualityDelta: 5, hoursDelta: 0, costDelta: 0, basePrice: 1100, theme: "Morality", desc: "Boosts quality for Morality theme content." },
  { id: "Power Prism", label: "Power Prism", qualityDelta: 5, hoursDelta: 0, costDelta: 0, basePrice: 1100, theme: "Power", desc: "Boosts quality for Power theme content." },
  { id: "Safe Sentinel", label: "Safe Sentinel", qualityDelta: 4, hoursDelta: 0, costDelta: 0, basePrice: 900, alignment: "Safe", desc: "Boosts quality for Safe alignment content." },
  { id: "Neutral Nexus", label: "Neutral Nexus", qualityDelta: 4, hoursDelta: 0, costDelta: 0, basePrice: 900, alignment: "Neutral", desc: "Boosts quality for Neutral alignment content." },
  { id: "Risky Razor", label: "Risky Razor", qualityDelta: 4, hoursDelta: 0, costDelta: 0, basePrice: 900, alignment: "Risky", desc: "Boosts quality for Risky alignment content." }
];

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const SLOT_COUNT = 3;
const SLOT_PREFIX = "rls_mvp_slot_";

const THEME_COLORS = {
  Freedom: "var(--theme-freedom)",
  Loyalty: "var(--theme-loyalty)",
  Ambition: "var(--theme-ambition)",
  Morality: "var(--theme-morality)",
  Power: "var(--theme-power)"
};
const COUNTRY_COLORS = {
  Annglora: "var(--country-annglora)",
  Bytenza: "var(--country-bytenza)",
  Crowlya: "var(--country-crowlya)"
};
const COUNTRY_DEMONYMS = {
  Annglora: "Anngloran",
  Bytenza: "Bytenese",
  Crowlya: "Crowlish"
};

const COUNTRY_LANGUAGE_WEIGHTS = {
  Annglora: [
    { lang: "en", weight: 0.7 },
    { lang: "es", weight: 0.15 },
    { lang: "kr", weight: 0.15 }
  ],
  Bytenza: [
    { lang: "kr", weight: 0.7 },
    { lang: "en", weight: 0.15 },
    { lang: "es", weight: 0.15 }
  ],
  Crowlya: [
    { lang: "es", weight: 0.7 },
    { lang: "en", weight: 0.15 },
    { lang: "kr", weight: 0.15 }
  ]
};
