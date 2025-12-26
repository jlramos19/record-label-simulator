// @ts-nocheck
export const QUARTERS_PER_HOUR = typeof globalThis.QUARTERS_PER_HOUR === "number" ? globalThis.QUARTERS_PER_HOUR : 4;
export const QUARTER_HOUR_MS = typeof globalThis.QUARTER_HOUR_MS === "number"
  ? globalThis.QUARTER_HOUR_MS
  : (typeof globalThis.HOUR_MS === "number" ? globalThis.HOUR_MS : 3600000) / QUARTERS_PER_HOUR;

export const LIVE_SYNC_INTERVAL_MS = 500;

export const UI_REACT_ISLANDS_ENABLED = true;

export const UI_EVENT_LOG_KEY = "rls_ui_event_log_v1";
export const LOSS_ARCHIVE_KEY = "rls_loss_archive_v1";
export const LOSS_ARCHIVE_LIMIT = 3;
export const SEED_CALIBRATION_KEY = "rls_seed_calibration_v1";

export const QUARTER_TICK_FRAME_LIMIT = 48 * QUARTERS_PER_HOUR;
export const QUARTER_TICK_WARNING_THRESHOLD = 12 * QUARTERS_PER_HOUR;
export const WEEKLY_UPDATE_WARN_MS = 50;
export const QUARTER_TICK_WARN_MS = 25;
export const TICK_FRAME_WARN_MS = 33;
export const STATE_VERSION = 4;

export const STARTING_CASH = 50000;
export const STARTING_STUDIO_SLOTS = 2;
export const STAGE_STUDIO_LIMIT = 3;
export const STUDIO_COLUMN_SLOT_COUNT = 5;
export const STAMINA_OVERUSE_LIMIT = 200;
export const STAMINA_OVERUSE_STRIKES = 1;
export const STAMINA_REGEN_PER_HOUR = 50;
export const RESOURCE_TICK_LEDGER_LIMIT = 24;
export const SEED_CALIBRATION_YEAR = 2400;
export const LABEL_DOMINANCE_TARGET_SHARE = 0.24;
export const LABEL_DOMINANCE_MAX_PENALTY = 0.28;
export const LABEL_DOMINANCE_MAX_BOOST = 0.12;
export const LABEL_DOMINANCE_SMOOTHING = 0.6;
export const SEED_DOMINANT_SCORE_BONUS_PCT = 0.1;
export const SEED_DOMINANT_PICK_CHANCE = 0.3;
export const SEED_DOMINANT_MOMENTUM_BONUS = 0.06;
export const COMMUNITY_LABEL_RANKING_LIMITS = [3, 8];
export const COMMUNITY_LABEL_RANKING_DEFAULT = 8;
export const COMMUNITY_TREND_RANKING_LIMITS = [3, 40];
export const COMMUNITY_TREND_RANKING_DEFAULT = 40;
export const COMMUNITY_LEGACY_RANKING_LIMITS = [8, 40];
export const TREND_DETAIL_COUNT = 3;
export const TREND_WINDOW_WEEKS = 4;
export const MARKET_TRACK_ACTIVE_LIMIT = 600;
export const MARKET_TRACK_ARCHIVE_LIMIT = 2400;
export const AUDIENCE_TASTE_WINDOW_WEEKS = 8;
export const AUDIENCE_ALIGNMENT_SCORE_SCALE = 42;
export const AUDIENCE_BASE_WEIGHT = 0.45;
export const AUDIENCE_CHART_WEIGHT = 0.35;
export const AUDIENCE_RELEASE_WEIGHT = 0.2;
export const AUDIENCE_PREF_DRIFT = 0.35;
export const AUDIENCE_ICONIC_RISK_BOOST = 0.12;
export const AUDIENCE_TREND_BONUS = 4;
export const AUDIENCE_PREF_LIMIT = 3;
export const WEEKLY_SCHEDULE = {
  releaseProcessing: { day: 5, hour: 0, minute: 0 },
  trendsUpdate: { day: 5, hour: 12, minute: 0 },
  chartUpdate: { day: 6, hour: 0, minute: 0 }
};
export const ROLLOUT_EVENT_SCHEDULE = { day: 2, hour: 12, minute: 0 };
export const ROLLOUT_BLOCK_LOG_COOLDOWN_HOURS = 24;
export const UNASSIGNED_SLOT_LABEL = "?";
export const UNASSIGNED_CREATOR_LABEL = "Unassigned";
export const CREATOR_FALLBACK_ICON = "person";
export const CREATOR_FALLBACK_EMOJI = "??";
export const UNASSIGNED_CREATOR_EMOJI = "???";

export const GAME_MODES = {
  founding: {
    id: "founding",
    label: "Founding Mode (2025)",
    startYear: 2025,
    seeded: false,
    description: "Start in 2025 and build the industry before modern play."
  },
  modern: {
    id: "modern",
    label: "Modern Mode (2400)",
    startYear: 2400,
    seeded: true,
    description: "Start in 2400 with seeded history and a mature market."
  }
};
export const DEFAULT_GAME_MODE = "modern";
export const GAME_DIFFICULTIES = {
  easy: {
    id: "easy",
    label: "Easy",
    description: "More runway with higher revenue and cheaper upkeep.",
    startingCash: 80000,
    revenueMult: 1.25,
    upkeepMult: 0.85,
    bailoutAmount: 15000000
  },
  medium: {
    id: "medium",
    label: "Medium",
    description: "Balanced cashflow with a modest cushion.",
    startingCash: 65000,
    revenueMult: 1.12,
    upkeepMult: 0.92,
    bailoutAmount: 12000000
  },
  hard: {
    id: "hard",
    label: "Hard",
    description: "Tighter cashflow with slimmer margins.",
    startingCash: STARTING_CASH,
    revenueMult: 1,
    upkeepMult: 1,
    bailoutAmount: 10000000
  }
};
export const DEFAULT_GAME_DIFFICULTY = "medium";
export const AUTO_PROMO_BUDGET_PCT = 0.05;
export const AUTO_PROMO_MIN_BUDGET = 100;
export const AUTO_PROMO_RIVAL_TYPE = "eyeriSocialPost";
export const AUTO_CREATE_BUDGET_PCT = 0.1;
export const AUTO_CREATE_MIN_CASH = 15000;
export const AUTO_CREATE_MAX_TRACKS = 1;
export const RIVAL_COMPETE_CASH_BUFFER = Math.round(STARTING_CASH * 0.1);
export const RIVAL_COMPETE_DROP_COST = 1200;
export const AI_PROMO_BUDGET_PCT = AUTO_PROMO_BUDGET_PCT;
export const AI_CREATE_BUDGET_PCT = AUTO_CREATE_BUDGET_PCT;
export const AI_CREATE_MIN_CASH = RIVAL_COMPETE_CASH_BUFFER;
export const HUSK_PROMO_DEFAULT_TYPE = AUTO_PROMO_RIVAL_TYPE;
export const HUSK_PROMO_DAY = 6;
export const HUSK_PROMO_HOUR = 12;
export const HUSK_MAX_RELEASE_STEPS = 4;
export const PRIME_SHOWCASE_MIN_QUALITY = 80;
export const PRIME_SHOWCASE_MIN_ACT_PEAK = 10;
export const PRIME_SHOWCASE_MIN_TRACK_PEAK = 20;

export const TRACK_ROLE_KEYS = {
  Songwriter: "songwriterIds",
  Performer: "performerIds",
  Producer: "producerIds"
};
export const TRACK_ROLE_TARGETS = {
  Songwriter: "track-writer",
  Performer: "track-performer",
  Producer: "track-producer"
};
export const TRACK_ROLE_TARGET_PATTERN = /^track-(writer|performer|producer)(?:-(\d+))?$/;
export const TRACK_ROLE_MATCH = {
  writer: "Songwriter",
  performer: "Performer",
  producer: "Producer"
};
export const TRACK_CREW_RULES = {
  Songwriter: { stepMinutes: 12, slotsPerTier: 5, maxPieces: 3 },
  Performer: { stepMinutes: 24, slotsPerTier: 5, maxPieces: 2 },
  Producer: { stepMinutes: 36, slotsPerTier: 5, maxPieces: 1 }
};
export const ROLE_LABELS = {
  Songwriter: "Songwriter",
  Performer: "Recorder",
  Recorder: "Recorder",
  Producer: "Producer"
};
export const CCC_SORT_OPTIONS = [
  "default",
  "quality-desc",
  "quality-asc",
  "theme-asc",
  "theme-desc",
  "mood-asc",
  "mood-desc"
];

export const ROLE_ACTION_STATUS = {
  live: { label: "Live", className: "badge" },
  simulated: { label: "Simulated", className: "badge warn" },
  placeholder: { label: "Placeholder", className: "badge danger" }
};

export const ROLE_ACTIONS = [
  {
    role: "Member",
    occupations: [
      {
        name: "Personnel",
        note: "Priority order for new Members.",
        actions: [
          { label: "Factory Personnel", verb: "manufacture", detail: "Produce physical inventory and packaging.", status: "placeholder", priority: 1 },
          { label: "Shopping Center Personnel", verb: "distribute", detail: "Move inventory to stores and sell to consumers.", status: "placeholder", priority: 2 },
          { label: "Broadcast Corporation Personnel", verb: "present", detail: "Program broadcasts that surface new content.", status: "placeholder", priority: 3 }
        ]
      },
      {
        name: "Consumer",
        actions: [
          { verb: "buy", detail: "Purchase released content from Shopping Centers.", status: "simulated" },
          { verb: "stream", detail: "Listen at home; drives weekly chart demand.", status: "simulated" },
          { verb: "attend", detail: "Attend live events and performances at Venues.", status: "simulated" },
          { verb: "rate", detail: "Score content after consuming it.", status: "simulated" }
        ]
      },
      {
        name: "Critic",
        actions: [
          { verb: "review", detail: "Rate content quality using Alignment and preferences.", status: "simulated" }
        ]
      }
    ]
  },
  {
    role: "Creator",
    occupations: [
      { name: "Songwriter", actions: [{ verb: "write", detail: "Draft sheet music from Themes in Create view.", status: "live" }] },
      { name: "Recorder", actions: [{ verb: "record", detail: "Record demos that set the track Mood.", status: "live" }] },
      { name: "Producer", actions: [{ verb: "produce", detail: "Master recordings to lock Genre and base Quality.", status: "live" }] }
    ]
  },
  {
    role: "Act",
    occupations: [
      { name: "Promoter", actions: [{ verb: "promote", detail: "Run promo pushes for an Act alone or an Act plus content.", status: "live" }] }
    ]
  },
  {
    role: "CEO",
    occupations: [
      {
        name: "Music Executive",
        actions: [
          { verb: "negotiate", detail: "Contracts with Creators (auto-resolved on sign).", status: "simulated" },
          { verb: "sign", detail: "Creators to the Record Label via the CCC.", status: "live" },
          { verb: "form", detail: "Acts from signed Creators in Harmony Hub.", status: "live" },
          { verb: "place", detail: "Creators in track and act slots.", status: "live" },
          { verb: "release", detail: "Schedule ready tracks in Release Desk.", status: "live" },
          { verb: "terminate", detail: "A contract with a Creator.", status: "placeholder" },
          { verb: "rent", detail: "Lease studios and structures for production.", status: "placeholder" },
          { verb: "conduct", detail: "Launch and manage Eras with Acts.", status: "live" },
          { verb: "plan", detail: "Tours and live circuits.", status: "placeholder" }
        ]
      }
    ]
  }
];

export const DEFAULT_TRACK_SLOT_VISIBLE = 3;
