// Static data and canon values (themes, moods, colors, AI labels, economy).
const HOUR_MS = 3600000;
const WEEK_HOURS = 168;
const BASE_EPOCH = Date.UTC(2400, 0, 1, 0, 0, 0);
const BROADCAST_SLOT_SCHEDULE = [6, 2, 2, 2, 2, 3, 3];
const FILMING_STUDIO_SLOTS = 2;

const THEMES = ["Freedom", "Loyalty", "Ambition", "Morality", "Power"];
const MOODS = ["Cheering", "Saddening", "Thrilling", "Angering", "Calming", "Energizing", "Uplifting", "Boring", "Daring"];
const ALIGNMENTS = ["Safe", "Neutral", "Risky"];
const ACT_TYPES = ["Solo Act", "Group Act"];

const STAGES = [
  { name: "Sheet", role: "Songwriter", hours: 1, cost: 50, stamina: 25, progress: 0.35 },
  { name: "Demo", role: "Performer", hours: 2, cost: 500, stamina: 50, progress: 0.7 },
  { name: "Master", role: "Producer", hours: 3, cost: 2500, stamina: 150, progress: 1.0 }
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

const CHART_SIZES = { global: 100, nation: 40, region: 10 };
const CHART_WEIGHTS = { sales: 0.3, streaming: 0.3, airplay: 0.3, social: 0.1 };
const NATIONS = ["Annglora", "Bytenza", "Crowlya"];
const REGION_DEFS = [
  { id: "Annglora Capital", nation: "Annglora", label: "Capital of Annglora" },
  { id: "Annglora Elsewhere", nation: "Annglora", label: "Elsewhere in Annglora" },
  { id: "Bytenza Capital", nation: "Bytenza", label: "Capital of Bytenza" },
  { id: "Bytenza Elsewhere", nation: "Bytenza", label: "Elsewhere in Bytenza" },
  { id: "Crowlya Capital", nation: "Crowlya", label: "Capital of Crowlya" },
  { id: "Crowlya Elsewhere", nation: "Crowlya", label: "Elsewhere in Crowlya" }
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
  studioLease4y: 44000000,
  studioBuildCost: 528000000,
  tuitionPerMember: 1815,
  subscription: 14.99,
  governmentFunds: 1000000000000
};
const PRICE_PATTERN = [0.3, 0.7];

const MODIFIERS = [
  { id: "None", label: "None", qualityDelta: 0, hoursDelta: 0, costDelta: 0, desc: "No modifier." },
  { id: "Sensory Sage", label: "Sensory Sage", qualityDelta: 8, hoursDelta: 1, costDelta: 200, desc: "Higher quality, slower output." },
  { id: "Dispatch Dust", label: "Dispatch Dust", qualityDelta: -8, hoursDelta: -1, costDelta: -150, desc: "Faster output, lower quality." }
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
