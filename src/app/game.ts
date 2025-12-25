// @ts-nocheck
import { storeChartSnapshot } from "./db.js";

const session = { activeSlot: null, prevSpeed: null };

function makeDefaultState() {
  return {
    time: { epochMs: BASE_EPOCH, totalHours: 0, speed: "pause", secPerHourPlay: 2.5, secPerHourFast: 1, acc: 0, lastTick: null, lastYear: new Date(BASE_EPOCH).getUTCFullYear() },
    label: { name: "Hann Record Label", alignment: "Neutral", cash: 50000, fans: 0, country: "Annglora" },
    studio: { slots: 2, inUse: 0 },
    creators: [],
    acts: [],
    marketCreators: [],
    tracks: [],
    workOrders: [],
    releaseQueue: [],
    marketTracks: [],
    trends: [],
    charts: { global: [], nations: { Annglora: [], Bytenza: [], Crowlya: [] }, regions: {} },
    rivals: [],
    quests: [],
    events: [],
    ui: {
      activeChart: "global",
      genreTheme: "All",
      genreMood: "All",
      slotTarget: null,
      actSlots: { lead: null, member2: null, member3: null },
      trackSlots: { actId: null, songwriterId: null, performerId: null, producerId: null },
      focusEraId: null,
      eraSlots: { actId: null },
      promoSlots: { trackId: null },
      socialSlots: { trackId: null },
      viewContext: {
        actId: null,
        eraId: null,
        releaseId: null,
        projectId: null,
        plannedReleaseIds: [],
        selectedRolloutTemplateId: null
      },
      eraPlan: {
        actId: null,
        goals: "",
        themeTarget: "Any",
        moodTarget: "Any",
        cadence: "Weekly",
        scheduleNote: "",
        rolloutTemplateId: null,
        plannedReleaseIds: []
      },
      chartHistoryWeek: null,
      chartHistorySnapshot: null,
      socialShowInternal: true,
      socialFilters: {
        creator: true,
        quest: true,
        track: true,
        era: true,
        economy: true,
        system: true,
        chart: true,
        contract: true,
        receipt: true,
        ccc: true
      },
      calendarTab: "label",
      calendarFilters: {
        labelScheduled: true,
        labelReleased: true,
        rivalScheduled: true,
        rivalReleased: true
      },
      activeView: "charts"
    },
    era: { active: [], history: [] },
    economy: { lastRevenue: 0, lastUpkeep: 0, lastWeek: 0 },
    lastWeekIndex: 0,
    population: { snapshot: null, lastUpdateYear: 0, lastUpdateAt: null, campaignSplit: null, campaignSplitStage: null },
    social: { posts: [] },
    rivalReleaseQueue: [],
    meta: {
      savedAt: null,
      version: 3,
      annualWinners: [],
      questIdCounter: 0,
      chartHistoryLastWeek: null,
      achievements: 0,
      achievementsUnlocked: [],
      achievementsLocked: false,
      bailoutUsed: false,
      bailoutPending: false,
      exp: 0,
      promoRuns: 0,
      cumulativeLabelPoints: {},
      gameOver: null,
      winState: null,
      winShown: false,
      endShown: false,
      autoSave: { enabled: false, minutes: 5, lastSavedAt: null },
      autoRollout: { enabled: false, lastCheckedAt: null }
    }
  };
}

const state = makeDefaultState();

function populationBoundsForYear(prevPop, year, floor) {
  let min = floor;
  let max = POPULATION_CAP;
  if (year >= 3000) {
    const band = POPULATION_POST3000_BAND;
    min = Math.max(min, Math.round(prevPop * (1 - band)));
    max = Math.min(max, Math.round(prevPop * (1 + band)));
  }
  return { min, max };
}

function populationRateForCadence(year, tier, cadenceYears) {
  if (!cadenceYears || cadenceYears <= 1) return yearlyPopulationRate(year, tier);
  const offset = year - POPULATION_START_YEAR;
  if (offset % cadenceYears !== 0) return 0;
  return yearlyPopulationRate(year, tier);
}

function applyPopulationYear(pop, year, cadenceYears, altRateFn) {
  const tier = pop >= POPULATION_TIER_2 ? 3 : pop >= POPULATION_TIER_1 ? 2 : 1;
  const rate = typeof altRateFn === "function"
    ? altRateFn(year, tier)
    : populationRateForCadence(year, tier, cadenceYears);
  const next = Math.round(pop * (1 + rate));
  let floor = POPULATION_START;
  if (next >= POPULATION_TIER_1) floor = Math.max(floor, POPULATION_TIER_1);
  if (next >= POPULATION_TIER_2) floor = Math.max(floor, POPULATION_TIER_2);
  const bounds = populationBoundsForYear(pop, year, floor);
  const clamped = clamp(next, bounds.min, bounds.max);
  return { next: clamped, violated: next < bounds.min || next > bounds.max };
}

// Simple balance / A-B test helper: compare baseline yearly population progression
function runPopulationABTest({
  startYear = POPULATION_START_YEAR,
  endYear = POPULATION_START_YEAR + 50,
  altRateFn = null,
  altCadenceYears = 4,
  runs = 1
} = {}) {
  // runs: number of stochastic runs to average
  const baseline = [];
  const alt = [];
  let baseViolations = 0;
  let altViolations = 0;
  for (let r = 0; r < runs; r += 1) {
    let popBase = POPULATION_START;
    let popAlt = POPULATION_START;
    for (let y = startYear + 1; y <= endYear; y += 1) {
      const baseStep = applyPopulationYear(popBase, y, 1, null);
      popBase = baseStep.next;
      if (baseStep.violated) baseViolations += 1;

      const altStep = applyPopulationYear(popAlt, y, altCadenceYears, altRateFn);
      popAlt = altStep.next;
      if (altStep.violated) altViolations += 1;
    }
    baseline.push(popBase);
    alt.push(popAlt);
  }
  const avg = (arr) => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
  const baseAvg = avg(baseline);
  const altAvg = avg(alt);
  const summary = `yearly ${formatCount(baseAvg)} vs ${altCadenceYears}-year ${formatCount(altAvg)} over ${endYear - startYear} years`;
  logEvent(`Balance A/B: ${summary}.`);
  return { baseAvg, altAvg, baseline, alt, summary, baseViolations, altViolations };
}

let idCounter = 0;
const $ = (id: string): any => document.getElementById(id);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function openOverlay(id) {
  const el = $(id);
  if (!el) return;
  el.style.display = "flex";
  el.setAttribute("aria-hidden", "false");
}

function closeOverlay(id) {
  const el = $(id);
  if (!el) return;
  el.style.display = "none";
  el.setAttribute("aria-hidden", "true");
}

function showEndScreen(title, lines) {
  const titleEl = $("endTitle");
  const listEl = $("endMessage");
  if (!titleEl || !listEl) return;
  titleEl.textContent = title;
  listEl.innerHTML = lines.map((line) => `
    <div class="list-item">
      <div class="item-title">${line.title}</div>
      ${line.detail ? `<div class="muted">${line.detail}</div>` : ""}
    </div>
  `).join("");
  openOverlay("endModal");
}

function uid(prefix) {
  idCounter += 1;
  return `${prefix}${idCounter}`;
}

function pickOne(list) {
  return list[rand(0, list.length - 1)];
}

function pickDistinct(list, count) {
  const copy = list.slice();
  const out = [];
  while (out.length < count && copy.length) {
    out.push(copy.splice(rand(0, copy.length - 1), 1)[0]);
  }
  return out;
}

function clampSkill(value) {
  return clamp(Math.round(value), SKILL_MIN, SKILL_MAX);
}

function clampQuality(value) {
  return clamp(Math.round(value), QUALITY_MIN, QUALITY_MAX);
}

function clampStamina(value) {
  return clamp(Math.round(value), 0, STAMINA_MAX);
}

const STUDIO_CAP_PER_LABEL = 50;
const ACHIEVEMENT_TARGET = 12;

function currentYear() {
  return new Date(state.time.epochMs).getUTCFullYear();
}

function releasedTracks() {
  return state.tracks.filter((track) => track.status === "Released");
}

function releasedProjectCount() {
  const projects = new Set();
  releasedTracks().forEach((track) => {
    const name = track.projectName || `${track.title} - Single`;
    if (name) projects.add(name);
  });
  return projects.size;
}

function averageReleasedQuality(minCount) {
  const released = releasedTracks();
  if (released.length < minCount) return 0;
  const sum = released.reduce((total, track) => total + track.quality, 0);
  return sum / released.length;
}

function playerHasGlobalRank(maxRank) {
  return (state.charts.global || []).some((entry) => entry.track.isPlayer && entry.rank <= maxRank);
}

function playerHasNationRank(maxRank) {
  return NATIONS.some((nation) => (state.charts.nations[nation] || []).some(
    (entry) => entry.track.isPlayer && entry.rank <= maxRank
  ));
}

function playerHasRegionRank(maxRank) {
  return REGION_DEFS.some((region) => (state.charts.regions[region.id] || []).some(
    (entry) => entry.track.isPlayer && entry.rank <= maxRank
  ));
}

const ACHIEVEMENTS = [
  {
    id: "REQ-01",
    label: "Global No.1",
    desc: "Land a track at #1 on the Global chart.",
    exp: 2200,
    target: 1,
    check: () => playerHasGlobalRank(1),
    progress: () => {
      const ranks = (state.charts.global || []).filter((entry) => entry.track.isPlayer).map((entry) => entry.rank);
      return ranks.length ? Math.min(...ranks) : null;
    }
  },
  {
    id: "REQ-02",
    label: "National Top 3",
    desc: "Reach Top 3 on any national chart.",
    exp: 1600,
    target: 3,
    check: () => playerHasNationRank(3),
    progress: () => {
      const ranks = [];
      NATIONS.forEach((nation) => {
        (state.charts.nations[nation] || []).forEach((entry) => {
          if (entry.track.isPlayer) ranks.push(entry.rank);
        });
      });
      return ranks.length ? Math.min(...ranks) : null;
    }
  },
  {
    id: "REQ-03",
    label: "Regional Top 5",
    desc: "Reach Top 5 on any regional chart.",
    exp: 1400,
    target: 5,
    check: () => playerHasRegionRank(5),
    progress: () => {
      const ranks = [];
      REGION_DEFS.forEach((region) => {
        (state.charts.regions[region.id] || []).forEach((entry) => {
          if (entry.track.isPlayer) ranks.push(entry.rank);
        });
      });
      return ranks.length ? Math.min(...ranks) : null;
    }
  },
  {
    id: "REQ-04",
    label: "Quality Gold",
    desc: "Release a track with 90+ quality.",
    exp: 1700,
    target: 90,
    check: () => releasedTracks().some((track) => track.quality >= 90),
    progress: () => {
      const released = releasedTracks().map((track) => track.quality);
      return released.length ? Math.max(...released) : 0;
    }
  },
  {
    id: "REQ-05",
    label: "Catalog Depth",
    desc: "Release 12 tracks.",
    exp: 2000,
    target: 12,
    check: () => releasedTracks().length >= 12,
    progress: () => releasedTracks().length
  },
  {
    id: "REQ-06",
    label: "Era Complete",
    desc: "Complete one full Era cycle.",
    exp: 1500,
    target: 1,
    check: () => state.era.history.length >= 1,
    progress: () => state.era.history.length
  },
  {
    id: "REQ-07",
    label: "Trend Rider",
    desc: "Release a track that matched a live trend.",
    exp: 1500,
    target: 1,
    check: () => releasedTracks().some((track) => track.trendAtRelease),
    progress: () => releasedTracks().filter((track) => track.trendAtRelease).length
  },
  {
    id: "REQ-08",
    label: "Audience Reach",
    desc: "Capture at least 4% of Gaia's population.",
    exp: 1800,
    target: 4,
    check: () => {
      const snapshot = computePopulationSnapshot();
      return snapshot.total > 0 && state.label.fans >= snapshot.total * 0.04;
    },
    progress: () => {
      const snapshot = computePopulationSnapshot();
      return snapshot.total ? (state.label.fans / snapshot.total) * 100 : 0;
    }
  },
  {
    id: "REQ-09",
    label: "Roster Builder",
    desc: "Sign at least 8 creators.",
    exp: 1500,
    target: 8,
    check: () => state.creators.length >= 8,
    progress: () => state.creators.length
  },
  {
    id: "REQ-10",
    label: "Project Variety",
    desc: "Release tracks across 4 different projects.",
    exp: 1600,
    target: 4,
    check: () => releasedProjectCount() >= 4,
    progress: () => releasedProjectCount()
  },
  {
    id: "REQ-11",
    label: "Profit Week",
    desc: "Hit a weekly net of $40,000 or more.",
    exp: 1800,
    target: 40000,
    check: () => state.economy.lastRevenue - state.economy.lastUpkeep >= 40000,
    progress: () => state.economy.lastRevenue - state.economy.lastUpkeep
  },
  {
    id: "REQ-12",
    label: "Promo Push",
    desc: "Run 5 promotion campaigns.",
    exp: 1500,
    target: 5,
    check: () => state.meta.promoRuns >= 5,
    progress: () => state.meta.promoRuns
  }
];

function awardExp(amount, note, silent = false) {
  const value = Math.max(0, Math.round(amount || 0));
  if (!value) return;
  state.meta.exp = Math.max(0, state.meta.exp + value);
  if (note && !silent) {
    logEvent(`${note} (+${value} EXP).`);
  }
}

function unlockAchievement(definition) {
  if (state.meta.achievementsLocked) return;
  if (state.meta.achievementsUnlocked.includes(definition.id)) return;
  state.meta.achievementsUnlocked.push(definition.id);
  state.meta.achievements = state.meta.achievementsUnlocked.length;
  awardExp(definition.exp, `Achievement unlocked: ${definition.label}`);
}

function evaluateAchievements() {
  if (state.meta.achievementsLocked) return;
  ACHIEVEMENTS.forEach((definition) => {
    if (definition.check()) unlockAchievement(definition);
  });
  state.meta.achievements = state.meta.achievementsUnlocked.length;
}

function pickUniqueName(list, existingNames, suffix) {
  const existing = new Set(existingNames.filter(Boolean));
  const available = list.filter((name) => !existing.has(name));
  if (available.length) return pickOne(available);
  return `${pickOne(list)} ${suffix || "II"}`;
}

function buildCreatorName(country, existingNames) {
  const parts = CREATOR_NAME_PARTS[country] || CREATOR_NAME_PARTS.Annglora;
  const existing = new Set(existingNames.filter(Boolean));
  for (let i = 0; i < 24; i += 1) {
    const given = pickOne(parts.given);
    const surname = pickOne(parts.surname);
    const name = country === "Bytenza" ? `${surname} ${given}` : `${given} ${surname}`;
    if (!existing.has(name)) return name;
  }
  const fallback = `${pickOne(parts.given)} ${pickOne(parts.surname)}`;
  return existing.has(fallback) ? `${fallback} II` : fallback;
}

function buildCompositeName(prefixes, suffixes, existingNames, fallbackList, suffix) {
  const existing = new Set(existingNames.filter(Boolean));
  for (let i = 0; i < 24; i += 1) {
    const name = `${pickOne(prefixes)} ${pickOne(suffixes)}`.replace(/\s+/g, " ").trim();
    if (!existing.has(name)) return name;
  }
  return pickUniqueName(fallbackList, existingNames, suffix);
}

function fillTemplate(template, tokens) {
  return template
    .replace("{verb}", tokens.verb)
    .replace("{noun}", tokens.noun)
    .replace("{prefix}", tokens.prefix)
    .replace("{suffix}", tokens.suffix)
    .replace("{act}", tokens.act)
    .replace(/\s+/g, " ")
    .trim();
}

function makeGenre(theme, mood) {
  return `${theme} / ${mood}`;
}

function formatGenreLabel(theme, mood) {
  return `${theme.toLowerCase()} but it's ${mood.toLowerCase()}`;
}

function formatGenreKeyLabel(genre) {
  const parts = genre.split(" / ");
  if (parts.length !== 2) return genre;
  return formatGenreLabel(parts[0], parts[1]);
}

function themeFromGenre(genre) {
  return genre.split(" / ")[0];
}

function moodFromGenre(genre) {
  return genre.split(" / ")[1];
}

function themeColor(theme) {
  return THEME_COLORS[theme] || "var(--accent)";
}

function countryColor(country) {
  return COUNTRY_COLORS[country] || "var(--accent)";
}

function alignmentClass(alignment) {
  return alignment ? alignment.toLowerCase() : "neutral";
}

function slugify(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

function getModifier(id) {
  return MODIFIERS.find((mod) => mod.id === id) || MODIFIERS[0];
}

function renderAlignmentTag(alignment) {
  const cls = alignmentClass(alignment);
  return `<span class="tag ${cls}"><span class="tag-dot"></span>${alignment}</span>`;
}

function renderThemeTag(theme) {
  const cls = `theme-${slugify(theme)}`;
  return `<span class="tag ${cls}"><span class="tag-dot"></span>${theme}</span>`;
}

function renderCountryTag(country) {
  const cls = `country-${slugify(country)}`;
  return `<span class="tag ${cls}"><span class="tag-dot"></span>${country}</span>`;
}

function renderLabelTag(label, country) {
  const color = countryColor(country);
  const textColor = country === "Bytenza" ? "#f4f1ea" : "#0b0f14";
  return `<span class="tag" style="color:${textColor}; border-color:${color}; background:${color};"><span class="tag-dot" style="background:${textColor};"></span>${label}</span>`;
}

const MOOD_EMOJIS = {
  Cheering: "🌞",
  Saddening: "💧",
  Angering: "💢",
  Energizing: "⚡",
  Calming: "🕊️",
  Thrilling: "🔥",
  Uplifting: "⬆️",
  Boring: "▫",
  Daring: "❓"
};

function renderMoodTag(mood) {
  const emoji = MOOD_EMOJIS[mood] || "❓";
  return `<span class="tag mood"><span class="mood-emoji">${emoji}</span>${mood}</span>`;
}

function renderMoodLabel(mood) {
  const emoji = MOOD_EMOJIS[mood] || "❓";
  return `<span class="tag mood">${mood} <span class="mood-emoji">${emoji}</span></span>`;
}

function staminaRequirement(role) {
  const stage = STAGES.find((entry) => entry.role === role);
  return stage ? stage.stamina : 0;
}

function getSlotElement(targetId) {
  return document.querySelector(`[data-slot-target="${targetId}"]`);
}

function describeSlot(targetId) {
  const slot = getSlotElement(targetId);
  if (!slot) return targetId || "-";
  const label = slot.querySelector(".slot-label");
  return label ? label.textContent : targetId;
}

function commitSlotChange({ updateStats = false } = {}) {
  renderSlots();
  if (updateStats) renderStats();
  saveToActiveSlot();
}

function setSlotTarget(targetId) {
  state.ui.slotTarget = targetId;
  commitSlotChange({ updateStats: true });
}

function setSlotValue(targetId, value) {
  if (targetId === "act-lead") state.ui.actSlots.lead = value;
  if (targetId === "act-member2") state.ui.actSlots.member2 = value;
  if (targetId === "act-member3") state.ui.actSlots.member3 = value;
  if (targetId === "track-act") state.ui.trackSlots.actId = value;
  if (targetId === "track-writer") state.ui.trackSlots.songwriterId = value;
  if (targetId === "track-performer") state.ui.trackSlots.performerId = value;
  if (targetId === "track-producer") state.ui.trackSlots.producerId = value;
  if (targetId === "era-act") state.ui.eraSlots.actId = value;
  if (targetId === "promo-track") state.ui.promoSlots.trackId = value;
  if (targetId === "social-track") state.ui.socialSlots.trackId = value;
}

function assignToSlot(targetId, entityType, entityId) {
  const slot = getSlotElement(targetId);
  if (!slot) return;
  if (slot.classList.contains("disabled")) {
    logEvent("This slot is disabled for Solo Acts.", "warn");
    return;
  }
  const expectedType = slot.dataset.slotType;
  if (expectedType !== entityType) {
    logEvent(`Slot expects ${expectedType} ID.`, "warn");
    return;
  }
  if (entityType === "creator") {
    const creator = getCreator(entityId);
    if (!creator) return;
    const role = slot.dataset.slotRole;
    if (role && creator.role !== role) {
      logEvent(`${creator.name} is not a ${role}.`, "warn");
      return;
    }
  }
  if (entityType === "track" && targetId === "promo-track") {
    const track = getTrack(entityId);
    if (!track || track.status !== "Released") {
      logEvent("Campaign slot requires a released Track ID.", "warn");
      return;
    }
  }
  setSlotValue(targetId, entityId);
  commitSlotChange();
}

function clearSlot(targetId) {
  setSlotValue(targetId, null);
  commitSlotChange();
}

function renderSlots() {
  const activeTarget = state.ui.slotTarget;
  document.querySelectorAll(".id-slot").forEach((slot) => {
    const target = slot.dataset.slotTarget;
    slot.classList.toggle("active", target === activeTarget);
  });

  const actLead = getCreator(state.ui.actSlots.lead);
  const actMember2 = getCreator(state.ui.actSlots.member2);
  const actMember3 = getCreator(state.ui.actSlots.member3);
  const trackAct = getAct(state.ui.trackSlots.actId);
  const trackWriter = getCreator(state.ui.trackSlots.songwriterId);
  const trackPerformer = getCreator(state.ui.trackSlots.performerId);
  const trackProducer = getCreator(state.ui.trackSlots.producerId);
  const eraAct = getAct(state.ui.eraSlots.actId);
  const promoTrack = state.marketTracks.find((entry) => entry.trackId === state.ui.promoSlots.trackId)
    || getTrack(state.ui.promoSlots.trackId);
  const socialTrack = getTrack(state.ui.socialSlots.trackId);

  if ($("actLeadSlot")) $("actLeadSlot").textContent = actLead ? actLead.name : "Unassigned";
  if ($("actMember2Slot")) $("actMember2Slot").textContent = actMember2 ? actMember2.name : "Unassigned";
  if ($("actMember3Slot")) $("actMember3Slot").textContent = actMember3 ? actMember3.name : "Unassigned";
  if ($("trackActSlot")) $("trackActSlot").textContent = trackAct ? trackAct.name : "Unassigned";
  if ($("trackWriterSlot")) $("trackWriterSlot").textContent = trackWriter ? trackWriter.name : "Unassigned";
  if ($("trackPerformerSlot")) $("trackPerformerSlot").textContent = trackPerformer ? trackPerformer.name : "Unassigned";
  if ($("trackProducerSlot")) $("trackProducerSlot").textContent = trackProducer ? trackProducer.name : "Unassigned";
  if ($("eraActSlot")) $("eraActSlot").textContent = eraAct ? eraAct.name : "Unassigned";
  if ($("promoTrackSlot")) $("promoTrackSlot").textContent = promoTrack ? promoTrack.title : "Unassigned";
  if ($("socialTrackSlot")) $("socialTrackSlot").textContent = socialTrack ? socialTrack.title : "Unassigned";

  const solo = $("actTypeSelect") && $("actTypeSelect").value === "Solo Act";
  ["act-member2", "act-member3"].forEach((target) => {
    const slot = getSlotElement(target);
    if (slot) slot.classList.toggle("disabled", solo);
  });
  if (typeof window !== "undefined" && window.updateSlotDropdowns) {
    window.updateSlotDropdowns();
  }
}

function formatMoney(amount) {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  return `${sign}$${abs.toLocaleString("en-US")}`;
}

function formatCount(value) {
  return Math.round(value).toLocaleString("en-US");
}

function formatHour(hour) {
  if (hour === 0) return "12AM";
  if (hour < 12) return `${hour}AM`;
  if (hour === 12) return "12PM";
  return `${hour - 12}PM`;
}

function formatDate(epochMs) {
  const d = new Date(epochMs);
  const dayName = DAYS[d.getUTCDay()];
  const monthName = MONTHS[d.getUTCMonth()];
  const day = String(d.getUTCDate()).padStart(2, "0");
  const year = d.getUTCFullYear();
  const hour = d.getUTCHours();
  return `${dayName} - ${monthName} ${day}, ${year} - ${formatHour(hour)}`;
}

function weekIndex() {
  return Math.floor(state.time.totalHours / WEEK_HOURS);
}

function hoursUntilNextWeek() {
  return WEEK_HOURS - (state.time.totalHours % WEEK_HOURS);
}

function logEvent(text, kind = "info") {
  state.events.unshift({ ts: state.time.epochMs, text, kind });
  if (state.events.length > 80) state.events.pop();
  renderEventLog();
}

function handleFromName(name, fallback) {
  const cleaned = String(name || "").replace(/[^a-zA-Z0-9]+/g, "");
  const base = cleaned || fallback || "Gaia";
  return `@${base.slice(0, 32)}`;
}

function normalizeHandle(handle) {
  const raw = String(handle || "@Gaia");
  const withAt = raw.startsWith("@") ? raw : `@${raw}`;
  return withAt.slice(0, 32);
}

function labelContactInfo() {
  const labelName = state.label.name || "Record Label";
  const country = state.label.country || "Annglora";
  const slug = slugify(labelName) || "label";
  return {
    labelName,
    labelEmail: `no-reply@${slug}.ann`,
    labelPhone: "(001) 420-6969",
    labelAddress: [
      "1001 West 2nd Street, Floor 1",
      `${labelName} Campus`,
      "Bloomville, Audora",
      `${country} 1001`
    ],
    playerName: state.meta.playerName || "CEO",
    playerEmail: state.meta.playerEmail || "playername@email.ann",
    playerPhone: "(001) 555-1919",
    playerAddress: [
      "1919 East 19th Street",
      "Gleaming Meadows",
      "Bloomville, Audora",
      `${country} 1007`
    ]
  };
}

function postSocial({ handle, title, lines, text, type, order }) {
  if (!state.social) state.social = { posts: [] };
  const post = {
    id: uid("PS"),
    ts: state.time.epochMs,
    handle: normalizeHandle(handle || "@Gaia"),
    title: title || null,
    lines: Array.isArray(lines) ? lines : [],
    text: text || null,
    type: type || "system",
    order: order || 0
  };
  state.social.posts.unshift(post);
  if (state.social.posts.length > 140) state.social.posts.pop();
}

// Expose for data templates loaded as non-module scripts.
try {
  if (typeof window !== "undefined") {
    window.postSocial = postSocial;
  }
} catch (e) {
  // ignore
}

function postQuestEmail(quest) {
  const contact = labelContactInfo();
  const labelHandle = handleFromName(contact.labelName, "Label");
  const subject = `Quest: ${quest.text}`;
  const expReward = Math.round(quest.expReward ?? (quest.reward / 8));
  postSocial({
    handle: labelHandle,
    title: `Email: ${subject}`,
    lines: [
      `From: ${contact.labelName}`,
      `Email: ${contact.labelEmail}`,
      `Phone: ${contact.labelPhone}`,
      "Address:",
      ...contact.labelAddress,
      `To: ${contact.playerName}`,
      `Phone: ${contact.playerPhone}`,
      `Email: ${contact.playerEmail}`,
      "Address:",
      ...contact.playerAddress,
      `Subject: ${subject}`,
      `Dear ${contact.playerName},`,
      quest.story,
      `Objective: ${quest.text}.`,
      `Reward: ${formatMoney(quest.reward)} + ${formatCount(expReward)} EXP.`,
      "Best,",
      `${contact.labelName} CEO`
    ],
    type: "quest",
    order: 1
  });
}

function postQuestComplete(quest) {
  const expReward = Math.round(quest.expReward ?? (quest.reward / 8));
  postSocial({
    handle: "@eyeriStories",
    title: `Quest complete: ${quest.id}`,
    lines: [
      `${state.label.name} fulfilled "${quest.text}".`,
      `Reward issued: ${formatMoney(quest.reward)} + ${formatCount(expReward)} EXP.`
    ],
    type: "quest",
    order: 2
  });
}

function postContractEmail(creator, signCost) {
  const contact = labelContactInfo();
  const creatorSlug = slugify(creator.name) || "creator";
  const subject = `Welcome: Creator at ${contact.labelName}`;
  const startDate = formatDate(state.time.epochMs);
  postSocial({
    handle: handleFromName(contact.labelName, "Label"),
    title: `Email: ${subject}`,
    lines: [
      `From: ${contact.labelName}`,
      `Email: ${contact.labelEmail}`,
      `Phone: ${contact.labelPhone}`,
      "Address:",
      ...contact.labelAddress,
      `To: ${creator.name}`,
      "Phone: (001) 555-1919",
      `Email: ${creatorSlug}@email.ann`,
      "Address:",
      ...contact.playerAddress,
      `Subject: ${subject}`,
      `Hello, ${creator.name}!`,
      `Welcome to ${contact.labelName} as our new ${creator.role}, starting ${startDate}.`,
      `Reward: Signing bonus ${formatMoney(signCost || 0)}.`,
      "Best,",
      `${contact.labelName} CEO`
    ],
    type: "contract",
    order: 1
  });
}

function postCreatorSigned(creator, signCost) {
  const labelHandle = handleFromName(state.label.name, "Label");
  const creatorHandle = handleFromName(creator.name, "Creator");
  postContractEmail(creator, signCost);
  postSocial({
    handle: "@CreatorsChamber",
    title: "Creator signing",
    lines: [
      `The Executive Producer ${state.label.name} tried to negotiate a contract with the Creator ${creator.name}, and signed them.`,
      `${labelHandle} welcomed ${creatorHandle}.`
    ],
    type: "ccc",
    order: 2
  });
}

function postTrackRelease(track) {
  const act = getAct(track.actId);
  const actHandle = act ? handleFromName(act.name, "Act") : "@Act";
  const labelHandle = handleFromName(state.label.name, "Label");
  postSocial({
    handle: "@eyeriStories",
    title: "Release alert",
    lines: [
      `${labelHandle}'s ${actHandle} released "${track.title}".`,
      `Genre: ${track.genre} | Quality ${track.quality}.`
    ],
    type: "track",
    order: 2
  });
}

function postEraComplete(era) {
  const act = getAct(era.actId);
  const actHandle = act ? handleFromName(act.name, "Act") : "@Act";
  const labelHandle = handleFromName(state.label.name, "Label");
  postSocial({
    handle: "@eyeriStories",
    title: "Era complete",
    lines: [
      `${labelHandle}'s ${actHandle} closed the "${era.name}" era.`,
      `Status: Complete | Week ${era.completedWeek}.`
    ],
    type: "era",
    order: 2
  });
}

function makeCreator(role, existingNames, country) {
  const themes = pickDistinct(THEMES, 2);
  const moods = pickDistinct(MOODS, 2);
  const existing = existingNames
    || [...state.creators.map((creator) => creator.name), ...state.marketCreators.map((creator) => creator.name)];
  const origin = country || pickOne(NATIONS);
  return {
    id: uid("CR"),
    name: buildCreatorName(origin, existing),
    role,
    skill: clampSkill(rand(55, 92)),
    stamina: STAMINA_MAX,
    prefThemes: themes,
    prefMoods: moods,
    country: origin
  };
}

function normalizeCreator(creator) {
  creator.skill = clampSkill(creator.skill ?? 60);
  creator.stamina = clampStamina(creator.stamina ?? STAMINA_MAX);
  if (!creator.prefThemes?.length) creator.prefThemes = pickDistinct(THEMES, 2);
  if (!creator.prefMoods?.length) creator.prefMoods = pickDistinct(MOODS, 2);
  if (!creator.country) creator.country = pickOne(NATIONS);
  return creator;
}

function computeSignCost(creator) {
  const roleFactor = creator.role === "Producer" ? 1.2 : creator.role === "Songwriter" ? 0.95 : 1.05;
  const base = 900 + creator.skill * 40;
  return clamp(Math.round(base * roleFactor), 900, 9000);
}

function creatorPreferredGenres(creator) {
  const list = [];
  creator.prefThemes.forEach((theme) => {
    creator.prefMoods.forEach((mood) => {
      list.push(formatGenreLabel(theme, mood));
    });
  });
  return list;
}

function makeActName() {
  const existing = state.acts.map((act) => act.name);
  return buildCompositeName(NAME_PARTS.actPrefix, NAME_PARTS.actSuffix, existing, ACT_NAMES, "Collective");
}

function makeLabelName() {
  const existing = [state.label.name];
  return buildCompositeName(NAME_PARTS.labelPrefix, NAME_PARTS.labelSuffix, existing, LABEL_NAMES, "Records");
}

function makeEraName(actName) {
  const template = pickOne(ERA_NAME_TEMPLATES);
  const composed = fillTemplate(template, {
    act: actName,
    prefix: pickOne(NAME_PARTS.projectPrefix),
    suffix: pickOne(NAME_PARTS.projectSuffix),
    noun: pickOne(NAME_PARTS.trackNoun),
    verb: pickOne(NAME_PARTS.trackVerb)
  });
  return composed;
}

function makeAct({ name, type, alignment, memberIds }) {
  return {
    id: uid("AC"),
    name,
    type,
    alignment,
    memberIds
  };
}

function getAct(id) {
  return state.acts.find((act) => act.id === id);
}

function seedActs() {
  if (state.acts.length || !state.creators.length) return;
  const members = state.creators.slice(0, Math.min(3, state.creators.length)).map((creator) => creator.id);
  const type = members.length > 1 ? "Group Act" : "Solo Act";
  state.acts.push(makeAct({
    name: makeActName(),
    type,
    alignment: state.label.alignment,
    memberIds: members
  }));
}

function buildMarketCreators() {
  const list = [];
  const existing = () => [...state.creators.map((creator) => creator.name), ...list.map((creator) => creator.name)];
  ["Songwriter", "Performer", "Producer"].forEach((role) => {
    const first = normalizeCreator(makeCreator(role, existing()));
    const second = normalizeCreator(makeCreator(role, existing()));
    first.signCost = computeSignCost(first);
    second.signCost = computeSignCost(second);
    list.push(first);
    list.push(second);
  });
  return list;
}

function buildRivals() {
  return AI_LABELS.map((label) => ({
    id: label.id,
    name: label.name,
    alignment: label.alignment,
    country: label.country,
    focusThemes: label.focusThemes,
    focusMoods: label.focusMoods,
    momentum: 0.5,
    seedBonus: 0
  }));
}

function seedTrends() {
  const combos = [];
  THEMES.forEach((theme) => {
    MOODS.forEach((mood) => {
      if (mood !== "Boring") combos.push(makeGenre(theme, mood));
    });
  });
  return pickDistinct(combos, 3);
}

function makeSeededRng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function seededRand(min, max, rng) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function seededPick(list, rng) {
  return list[seededRand(0, list.length - 1, rng)];
}

function ensureSeedCatalog() {
  if (Array.isArray(state.meta.seedCatalog) && state.meta.seedCatalog.length) {
    return state.meta.seedCatalog;
  }
  const baseSeed = 940331;
  state.meta.seedCatalog = AI_LABELS.map((label, idx) => ({
    id: `seed-${label.id}`,
    dominantLabelId: label.id,
    variantSeed: baseSeed + idx * 10103
  }));
  return state.meta.seedCatalog;
}

function simulateSeedHistory(startYear, endYear, rng, labelNames, dominantLabelId) {
  const dominantName = state.rivals.find((rival) => rival.id === dominantLabelId)?.name || null;
  const cumulative = {};
  labelNames.forEach((name) => { cumulative[name] = 0; });
  const winners = [];
  for (let year = startYear; year <= endYear; year += 1) {
    const scores = labelNames.map((name) => {
      const base = seededRand(220, 520, rng);
      const variance = seededRand(-40, 40, rng);
      const dominance = dominantName && name === dominantName ? Math.round(base * 0.18) : 0;
      const points = Math.max(40, base + variance + dominance);
      return { name, points };
    });
    scores.sort((a, b) => b.points - a.points);
    scores.forEach((entry) => { cumulative[entry.name] += entry.points; });
    winners.push({ year, label: scores[0].name, points: scores[0].points });
  }
  return { startYear, endYear, cumulative, winners };
}

function seedWorldHistory() {
  const baselineSeed = 2025;
  const baselineRng = makeSeededRng(baselineSeed);
  const seedCatalog = ensureSeedCatalog();
  const preset = seedCatalog[rand(0, seedCatalog.length - 1)];
  const variantSeed = preset?.variantSeed || Math.floor(Date.now() % 1000000);
  const variantRng = makeSeededRng(variantSeed);
  const labelNames = state.rivals.map((rival) => rival.name);
  const baseline = simulateSeedHistory(2025, 2200, baselineRng, labelNames, null);
  const variant = simulateSeedHistory(2200, 2400, variantRng, labelNames, preset?.dominantLabelId || null);
  state.meta.seedInfo = {
    baselineSeed,
    variantSeed,
    dominantLabelId: preset?.dominantLabelId || null,
    baselineRange: [baseline.startYear, baseline.endYear],
    variantRange: [variant.startYear, variant.endYear]
  };
  state.meta.seedHistory = { baseline, variant };

  const maxPoints = Math.max(...Object.values(variant.cumulative));
  const scaledCumulative = {};
  Object.entries(variant.cumulative).forEach(([label, points]) => {
    const ratio = maxPoints ? points / maxPoints : 0;
    scaledCumulative[label] = Math.round(200 + ratio * 800);
  });
  state.meta.cumulativeLabelPoints = scaledCumulative;
  state.rivals.forEach((rival) => {
    const ratio = maxPoints ? (variant.cumulative[rival.name] || 0) / maxPoints : 0;
    rival.momentum = clamp(0.35 + ratio * 0.45, 0.35, 0.95);
    rival.seedBonus = rival.id === preset?.dominantLabelId ? 0.12 : 0;
  });

  state.marketTracks = [];
  seedMarketTracks({
    rng: variantRng,
    count: Math.max(CHART_SIZES.global, 120),
    dominantLabelId: preset?.dominantLabelId || null
  });
}

function makeTrackTitle(theme, mood) {
  return makeTrackTitleByCountry(theme, mood, state.label.country || "Annglora");
}

function trackPoolByLang(lang) {
  if (lang === "es") return TRACK_TITLES_ES;
  if (lang === "kr") return TRACK_TITLES_KR;
  return TRACK_TITLES_EN;
}

function pickTrackLanguage(country) {
  const weights = COUNTRY_LANGUAGE_WEIGHTS[country] || COUNTRY_LANGUAGE_WEIGHTS.Annglora;
  const roll = Math.random();
  let acc = 0;
  for (const entry of weights) {
    acc += entry.weight;
    if (roll <= acc) return entry.lang;
  }
  return weights[0]?.lang || "en";
}

function makeTrackTitleByCountry(theme, mood, country) {
  const existing = [
    ...state.tracks.map((track) => track.title),
    ...state.marketTracks.map((track) => track.title)
  ];
  const lang = pickTrackLanguage(country);
  const pool = trackPoolByLang(lang);
  const base = pickUniqueName(pool, existing, "II");
  if (Math.random() < 0.35) {
    return `${base} (${formatGenreLabel(theme, mood)})`;
  }
  return base;
}

function makeRivalActName() {
  const existing = state.marketTracks.map((track) => track.actName);
  return buildCompositeName(NAME_PARTS.actPrefix, NAME_PARTS.actSuffix, existing, ACT_NAMES, "Unit");
}

function makeProjectTitle() {
  const existing = [
    ...state.tracks.map((track) => track.projectName).filter(Boolean),
    ...state.marketTracks.map((track) => track.projectName).filter(Boolean)
  ];
  const composed = fillTemplate(pickOne(PROJECT_TITLE_TEMPLATES), {
    prefix: pickOne(NAME_PARTS.projectPrefix),
    suffix: pickOne(NAME_PARTS.projectSuffix)
  });
  return existing.includes(composed)
    ? pickUniqueName(PROJECT_TITLES, existing, "Edition")
    : pickUniqueName([composed, ...PROJECT_TITLES], existing, "Edition");
}

function computeQualityPotential(track) {
  const writer = getCreator(track.creators.songwriterId);
  const performer = getCreator(track.creators.performerId);
  const producer = getCreator(track.creators.producerId);
  if (!writer || !performer || !producer) return clampQuality(60);
  let score = 40 + writer.skill * 0.2 + performer.skill * 0.2 + producer.skill * 0.3 + rand(-5, 5);
  const prefHits =
    (writer.prefThemes.includes(track.theme) ? 1 : 0) +
    (performer.prefMoods.includes(track.mood) ? 1 : 0) +
    (producer.prefThemes.includes(track.theme) ? 1 : 0);
  score += prefHits * 3;
  if (track.mood === "Boring") score -= 12;
  if (track.modifier?.qualityDelta) score += track.modifier.qualityDelta;
  return clampQuality(score);
}

function qualityGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function getCreator(id) {
  return state.creators.find((c) => c.id === id);
}

function getTrack(id) {
  return state.tracks.find((t) => t.id === id);
}

function getStudioUsageCount() {
  return state.tracks.filter((track) => track.status === "In Production").length;
}

function getStudioAvailableSlots() {
  return Math.max(0, state.studio.slots - getStudioUsageCount());
}

function estimateRivalStudioUsage() {
  const cap = STUDIO_CAP_PER_LABEL;
  return state.rivals.reduce((sum, rival) => {
    const momentum = typeof rival.momentum === "number" ? rival.momentum : 0.35;
    const used = clamp(Math.round(cap * momentum), 1, cap);
    return sum + used;
  }, 0);
}

function getStudioMarketSnapshot() {
  const capPerLabel = STUDIO_CAP_PER_LABEL;
  const total = capPerLabel * (state.rivals.length + 1);
  const rivals = estimateRivalStudioUsage();
  const player = clamp(Math.round(state.studio.slots || 0), 0, capPerLabel);
  const available = Math.max(0, total - rivals - player);
  return { total, rivals, player, available, capPerLabel };
}

function getActiveEras() {
  return Array.isArray(state.era.active) ? state.era.active : [];
}

function getEraById(id) {
  if (!id) return null;
  const active = getActiveEras().find((era) => era.id === id);
  if (active) return active;
  return state.era.history.find((era) => era.id === id) || null;
}

function getFocusedEra() {
  const focusId = state.ui.focusEraId;
  if (!focusId) return null;
  const active = getActiveEras().filter((era) => era.status === "Active");
  const focus = active.find((era) => era.id === focusId) || null;
  if (!focus) state.ui.focusEraId = null;
  return focus;
}

function getFocusEraForAct(actId) {
  if (!actId) return null;
  const focus = getFocusedEra();
  if (!focus || focus.actId !== actId) return null;
  return focus;
}

function setFocusEraById(eraId) {
  if (!eraId) {
    state.ui.focusEraId = null;
    return null;
  }
  const focus = getActiveEras().find((era) => era.id === eraId && era.status === "Active") || null;
  state.ui.focusEraId = focus ? focus.id : null;
  return focus;
}

function getLatestActiveEraForAct(actId) {
  const active = getActiveEras().filter((era) => era.actId === actId && era.status === "Active");
  if (!active.length) return null;
  return active.reduce((latest, era) => {
    const latestStamp = latest.startedAt ?? latest.startedWeek ?? 0;
    const eraStamp = era.startedAt ?? era.startedWeek ?? 0;
    return eraStamp >= latestStamp ? era : latest;
  }, active[0]);
}

function normalizeEraContent(era) {
  if (!Array.isArray(era.contentTypes)) era.contentTypes = [];
  if (!Array.isArray(era.contentItems)) era.contentItems = [];
}

function registerEraContent(era, type, id) {
  if (!era) return;
  normalizeEraContent(era);
  if (type && !era.contentTypes.includes(type)) {
    era.contentTypes.push(type);
  }
  if (type && id && !era.contentItems.some((item) => item.type === type && item.id === id)) {
    era.contentItems.push({ type, id });
  }
}

function startEraForAct({ actId, name, rolloutId, contentType, contentId, source }) {
  const act = getAct(actId);
  const rollout =
    ROLLOUT_PRESETS.find((preset) => preset.id === rolloutId)
    || ROLLOUT_PRESETS[1];
  const eraName = name || makeEraName(act ? act.name : "New Act");
  const era = {
    id: uid("ER"),
    name: eraName,
    actId,
    rolloutId: rollout.id,
    rolloutWeeks: rollout.weeks.slice(),
    stageIndex: 0,
    stageWeek: 0,
    weeksElapsed: 0,
    startedWeek: weekIndex() + 1,
    startedAt: state.time.epochMs,
    status: "Active",
    contentTypes: [],
    contentItems: []
  };
  registerEraContent(era, contentType, contentId);
  state.era.active.push(era);
  logEvent(`Era started: ${eraName}${source ? ` (${source})` : ""}.`);
  return era;
}

function archiveEra(era, status) {
  if (!era) return;
  if (status) era.status = status;
  if (!era.completedWeek) era.completedWeek = weekIndex() + 1;
  if (!state.era.history.some((entry) => entry.id === era.id)) {
    state.era.history.push({
      id: era.id,
      name: era.name,
      actId: era.actId,
      completedWeek: era.completedWeek,
      status: era.status || status || "Ended",
      contentTypes: era.contentTypes || []
    });
  }
}

function endEraById(eraId, reason) {
  const active = getActiveEras();
  const index = active.findIndex((era) => era.id === eraId);
  if (index === -1) return null;
  const [era] = active.splice(index, 1);
  era.status = "Ended";
  era.completedWeek = weekIndex() + 1;
  archiveEra(era, "Ended");
  if (state.ui.focusEraId === era.id) state.ui.focusEraId = null;
  logEvent(`Era ended: ${era.name}${reason ? ` (${reason})` : ""}.`);
  return era;
}

function ensureEraForTrack(track, source) {
  if (!track) return null;
  const actId = track.actId;
  if (!actId) return null;
  const existing = track.eraId ? getEraById(track.eraId) : null;
  if (existing && existing.status === "Active") {
    registerEraContent(existing, "Track", track.id);
    return existing;
  }
  const focused = getFocusEraForAct(actId);
  if (focused) {
    track.eraId = focused.id;
    registerEraContent(focused, "Track", track.id);
    return focused;
  }
  const era = startEraForAct({
    actId,
    contentType: "Track",
    contentId: track.id,
    source
  });
  track.eraId = era.id;
  return era;
}

function getRivalByName(name) {
  return state.rivals.find((rival) => rival.name === name);
}

function createTrack({ title, theme, mood, alignment, songwriterId, performerId, producerId, actId, projectName, projectType, modifierId }) {
  const focusEra = getFocusEraForAct(actId);
  const activeEra = focusEra || getLatestActiveEraForAct(actId);
  const modifier = getModifier(modifierId);
  const track = {
    id: uid("TR"),
    title,
    theme,
    mood,
    alignment,
    genre: makeGenre(theme, mood),
    actId,
    projectName,
    projectType: projectType || "Single",
    eraId: activeEra ? activeEra.id : null,
    modifier: modifier && modifier.id !== "None" ? modifier : null,
    distribution: "Digital",
    creators: { songwriterId, performerId, producerId },
    stageIndex: 0,
    status: "In Production",
    qualityPotential: 0,
    quality: 0,
    completedAt: null,
    releasedAt: null,
    marketId: null
  };
  track.qualityPotential = computeQualityPotential(track);
  track.quality = Math.round(track.qualityPotential * STAGES[0].progress);
  state.tracks.push(track);
  if (activeEra) registerEraContent(activeEra, "Track", track.id);
  scheduleStage(track, 0);
  return track;
}

function scheduleStage(track, stageIndex) {
  const stage = STAGES[stageIndex];
  const hoursDelta = track.modifier?.hoursDelta || 0;
  const adjustedHours = Math.max(1, stage.hours + hoursDelta);
  const creatorId =
    stage.role === "Songwriter"
      ? track.creators.songwriterId
      : stage.role === "Performer"
        ? track.creators.performerId
        : track.creators.producerId;
  const order = {
    id: uid("WO"),
    trackId: track.id,
    stageIndex,
    stageName: stage.name,
    creatorId,
    startAt: null,
    endAt: null,
    hours: adjustedHours,
    status: "Queued"
  };
  state.workOrders.push(order);
  tryStartWorkOrder(order);
}

function tryStartWorkOrder(order) {
  const stage = STAGES[order.stageIndex];
  if (order.status !== "Queued") return;
  if (state.studio.inUse >= state.studio.slots) return;
  const creator = getCreator(order.creatorId);
  if (!creator || creator.stamina < stage.stamina) return;

  creator.stamina = clampStamina(creator.stamina - stage.stamina);
  order.status = "In Progress";
  order.startAt = state.time.epochMs;
  order.endAt = state.time.epochMs + (order.hours || stage.hours) * HOUR_MS;
  state.studio.inUse += 1;

  const track = getTrack(order.trackId);
  if (track) {
    logEvent(`${creator.name} started ${stage.name} on "${track.title}".`);
  }
}

function processWorkOrders() {
  const now = state.time.epochMs;
  let progressed = true;
  while (progressed) {
    progressed = false;
    const completedIds = new Set();
    state.workOrders.forEach((order) => {
      if (order.status === "In Progress" && order.endAt <= now) {
        order.status = "Done";
        state.studio.inUse = Math.max(0, state.studio.inUse - 1);
        completeStage(order);
        completedIds.add(order.id);
        progressed = true;
      }
    });
    if (completedIds.size) {
      state.workOrders = state.workOrders.filter((order) => !completedIds.has(order.id));
    }
    state.workOrders.forEach((order) => tryStartWorkOrder(order));
  }
}

function completeStage(order) {
  const track = getTrack(order.trackId);
  if (!track) return;
  const nextIndex = order.stageIndex + 1;
  if (nextIndex < STAGES.length) {
    track.stageIndex = nextIndex;
    track.quality = Math.round(track.qualityPotential * STAGES[nextIndex].progress);
    scheduleStage(track, nextIndex);
  } else {
    track.stageIndex = STAGES.length;
    track.status = "Ready";
    track.completedAt = state.time.epochMs;
    track.quality = track.qualityPotential;
    logEvent(`Track ready: "${track.title}" (${qualityGrade(track.quality)}).`);
  }
}

function releaseTrack(track, note, distribution) {
  ensureEraForTrack(track, "Release");
  track.status = "Released";
  track.releasedAt = state.time.epochMs;
  track.trendAtRelease = state.trends.includes(track.genre);
  track.distribution = distribution || track.distribution || "Digital";
  const act = getAct(track.actId);
  const era = track.eraId ? getEraById(track.eraId) : null;
  const projectName = track.projectName || `${track.title} - Single`;
  const marketEntry = {
    id: uid("MK"),
    trackId: track.id,
    title: track.title,
    label: state.label.name,
    actId: track.actId,
    actName: act ? act.name : "Unknown Act",
    eraId: track.eraId || null,
    eraName: era ? era.name : null,
    projectName,
    isPlayer: true,
    theme: track.theme,
    mood: track.mood,
    alignment: track.alignment,
    country: state.label.country || "Annglora",
    quality: track.quality,
    genre: track.genre,
    distribution: track.distribution,
    releasedAt: track.releasedAt,
    weeksOnChart: 0,
    promoWeeks: 0
  };
  track.marketId = marketEntry.id;
  state.marketTracks.push(marketEntry);
  logEvent(`Released "${track.title}" to market${note ? ` (${note})` : ""}.`);
  postTrackRelease(track);
}

function scheduleRelease(track, hoursFromNow, distribution, note) {
  const releaseAt = state.time.epochMs + hoursFromNow * HOUR_MS;
  const dist = distribution || note || "Digital";
  state.releaseQueue.push({ id: uid("RL"), trackId: track.id, releaseAt, note: dist, distribution: dist });
  track.status = "Scheduled";
  ensureEraForTrack(track, "Release scheduled");
  logEvent(`Scheduled "${track.title}" for release in ${hoursFromNow}h.`);
}

function processReleaseQueue() {
  const now = state.time.epochMs;
  const remaining = [];
  state.releaseQueue.forEach((entry) => {
    if (entry.releaseAt <= now) {
      const track = getTrack(entry.trackId);
      if (track) releaseTrack(track, entry.note, entry.distribution);
    } else {
      remaining.push(entry);
    }
  });
  state.releaseQueue = remaining;
}

function rechargeStamina(hours) {
  const busyIds = new Set(state.workOrders.filter((o) => o.status === "In Progress").map((o) => o.creatorId));
  state.creators.forEach((creator) => {
    if (busyIds.has(creator.id)) return;
    creator.stamina = clampStamina(creator.stamina + 50 * hours);
  });
}

function scoreTrack(track, regionName) {
  const region = REGION_PROFILES[regionName] || NATION_PROFILES[regionName] || NATION_PROFILES.Annglora;
  let score = track.quality;
  score += track.alignment === region.alignment ? 12 : -6;
  score += track.theme === region.theme ? 8 : 0;
  score += region.moods.includes(track.mood) ? 6 : 0;
  score += state.trends.includes(track.genre) ? 10 : 0;
  score += track.promoWeeks > 0 ? 10 : 0;
  score += rand(-4, 4);
  const decay = Math.max(0.4, 1 - track.weeksOnChart * 0.05);
  return Math.round(score * decay);
}

function roundToAudienceChunk(value) {
  const chunk = 1000;
  return Math.ceil(Math.max(0, value) / chunk) * chunk;
}

function buildChartMetrics(score) {
  const base = Math.max(0, score) * 1200;
  return {
    sales: roundToAudienceChunk(base * CHART_WEIGHTS.sales),
    streaming: roundToAudienceChunk(base * CHART_WEIGHTS.streaming),
    airplay: roundToAudienceChunk(base * CHART_WEIGHTS.airplay),
    social: roundToAudienceChunk(base * CHART_WEIGHTS.social)
  };
}

function trackKey(entry) {
  return entry.trackId || entry.id || entry.title;
}

function updateChartHistory(entry, scope, rank) {
  if (!entry.chartHistory) entry.chartHistory = {};
  const history = entry.chartHistory[scope] || { peak: rank, weeks: 0 };
  history.peak = history.peak ? Math.min(history.peak, rank) : rank;
  history.weeks = history.weeks + 1;
  entry.chartHistory[scope] = history;
  return history;
}

function formatShortDate(ms) {
  const d = new Date(ms);
  const month = MONTHS[d.getUTCMonth()] || "Month";
  const day = String(d.getUTCDate()).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${month.slice(0, 3)} ${day}, ${year}`;
}

function formatWeekRangeLabel(week) {
  const start = BASE_EPOCH + (week - 1) * WEEK_HOURS * HOUR_MS;
  const end = start + WEEK_HOURS * HOUR_MS - 1;
  return `Week ${week} | ${formatShortDate(start)} - ${formatShortDate(end)}`;
}

function buildChartSnapshot(scope, entries) {
  const ts = state.time.epochMs;
  const week = weekIndex() + 1;
  return {
    id: `${scope}-${ts}`,
    scope,
    ts,
    week,
    entries: entries.map((entry) => ({
      rank: entry.rank,
      lastRank: entry.lastRank,
      peak: entry.peak,
      woc: entry.woc,
      score: entry.score,
      metrics: entry.metrics,
      trackId: entry.track?.id || entry.track?.trackId || null,
      marketId: entry.track?.marketId || null,
      title: entry.track?.title || "",
      projectName: entry.track?.projectName || "",
      label: entry.track?.label || "",
      actId: entry.track?.actId || null,
      actName: entry.track?.actName || "",
      country: entry.track?.country || "",
      theme: entry.track?.theme || "",
      mood: entry.track?.mood || "",
      alignment: entry.track?.alignment || "",
      genre: entry.track?.genre || "",
      projectType: entry.track?.projectType || "",
      distribution: entry.track?.distribution || "",
      isPlayer: !!entry.track?.isPlayer
    }))
  };
}

function persistChartHistorySnapshots() {
  const week = weekIndex() + 1;
  if (state.meta.chartHistoryLastWeek === week) return;
  const snapshots = [];
  snapshots.push(buildChartSnapshot("global", state.charts.global || []));
  NATIONS.forEach((nation) => {
    snapshots.push(buildChartSnapshot(`nation:${nation}`, state.charts.nations[nation] || []));
  });
  REGION_DEFS.forEach((region) => {
    snapshots.push(buildChartSnapshot(`region:${region.id}`, state.charts.regions[region.id] || []));
  });
  snapshots.forEach((snapshot) => {
    storeChartSnapshot(snapshot).catch(() => {});
  });
  state.meta.chartHistoryLastWeek = week;
}

function computeCharts() {
  const nationScores = {};
  const regionScores = {};
  NATIONS.forEach((nation) => { nationScores[nation] = []; });
  REGION_DEFS.forEach((region) => { regionScores[region.id] = []; });
  const globalScores = [];

  state.marketTracks.forEach((track) => {
    let sum = 0;
    NATIONS.forEach((nation) => {
      const score = scoreTrack(track, nation);
      const metrics = buildChartMetrics(score);
      nationScores[nation].push({ track, score, metrics });
      sum += score;
    });
    const avg = Math.round(sum / NATIONS.length);
    globalScores.push({ track, score: avg, metrics: buildChartMetrics(avg) });
    REGION_DEFS.forEach((region) => {
      const score = scoreTrack(track, region.id);
      regionScores[region.id].push({ track, score, metrics: buildChartMetrics(score) });
    });
  });

  NATIONS.forEach((nation) => {
    const prev = state.charts.nations[nation] || [];
    const ordered = nationScores[nation].sort((a, b) => b.score - a.score).slice(0, CHART_SIZES.nation);
    state.charts.nations[nation] = ordered.map((entry, index) => {
      const prevEntry = prev.find((p) => trackKey(p.track) === trackKey(entry.track));
      const history = updateChartHistory(entry.track, nation, index + 1);
      return {
        rank: index + 1,
        lastRank: prevEntry ? prevEntry.rank : null,
        peak: history.peak,
        woc: history.weeks,
        track: entry.track,
        score: entry.score,
        metrics: entry.metrics
      };
    });
  });

  REGION_DEFS.forEach((region) => {
    const prev = state.charts.regions[region.id] || [];
    const ordered = regionScores[region.id].sort((a, b) => b.score - a.score).slice(0, CHART_SIZES.region);
    state.charts.regions[region.id] = ordered.map((entry, index) => {
      const prevEntry = prev.find((p) => trackKey(p.track) === trackKey(entry.track));
      const history = updateChartHistory(entry.track, region.id, index + 1);
      return {
        rank: index + 1,
        lastRank: prevEntry ? prevEntry.rank : null,
        peak: history.peak,
        woc: history.weeks,
        track: entry.track,
        score: entry.score,
        metrics: entry.metrics
      };
    });
  });

  const prevGlobal = state.charts.global || [];
  const orderedGlobal = globalScores.sort((a, b) => b.score - a.score).slice(0, CHART_SIZES.global);
  state.charts.global = orderedGlobal.map((entry, index) => {
    const prevEntry = prevGlobal.find((p) => trackKey(p.track) === trackKey(entry.track));
    const history = updateChartHistory(entry.track, "global", index + 1);
    return {
      rank: index + 1,
      lastRank: prevEntry ? prevEntry.rank : null,
      peak: history.peak,
      woc: history.weeks,
      track: entry.track,
      score: entry.score,
      metrics: entry.metrics
    };
  });

  persistChartHistorySnapshots();
  return { globalScores };
}

function updateTrends(globalScores) {
  const totals = {};
  globalScores.forEach((entry) => {
    if (entry.track.mood === "Boring") return;
    totals[entry.track.genre] = (totals[entry.track.genre] || 0) + entry.score;
  });
  const next = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0])
    .slice(0, 3);
  if (next.length) state.trends = next;
}

function updateEconomy(globalScores) {
  const playerScores = globalScores.filter((entry) => entry.track.isPlayer);
  let revenue = 0;
  playerScores.forEach((entry) => {
    revenue += Math.max(0, entry.score) * 22;
  });
  revenue = Math.round(revenue);
  const upkeep = state.creators.length * 150 + state.studio.slots * 600;
  state.label.cash = Math.round(state.label.cash + revenue - upkeep);
  state.economy.lastRevenue = revenue;
  state.economy.lastUpkeep = upkeep;
  state.economy.lastWeek = weekIndex() + 1;
  logEvent(`Week ${weekIndex() + 1} report: +${formatMoney(revenue)} revenue, -${formatMoney(upkeep)} upkeep.`);
  postSocial({
    handle: "@eyeriStats",
    title: `Week ${weekIndex() + 1} Market Report`,
    lines: [
      `Revenue ${formatMoney(revenue)} | Upkeep ${formatMoney(upkeep)}`,
      `Net ${formatMoney(revenue - upkeep)}`
    ],
    type: "economy",
    order: 2
  });
}

function updateLabelReach() {
  const chartEntries = (state.charts.global || []).filter((entry) => entry.track.isPlayer);
  const points = chartEntries.reduce((sum, entry) => sum + Math.max(1, CHART_SIZES.global + 1 - entry.rank), 0);
  const snapshot = computePopulationSnapshot();
  const gain = points * 1500 + state.tracks.filter((track) => track.status === "Released").length * 40;
  state.label.fans = clamp(state.label.fans + gain, 0, snapshot.total);
}

function computeLabelScoresFromCharts() {
  const scores = {};
  (state.charts.global || []).forEach((entry) => {
    const points = Math.max(1, CHART_SIZES.global + 1 - entry.rank);
    scores[entry.track.label] = (scores[entry.track.label] || 0) + points;
  });
  return scores;
}

function updateCumulativeLabelPoints(scores) {
  Object.entries(scores).forEach(([label, points]) => {
    state.meta.cumulativeLabelPoints[label] = (state.meta.cumulativeLabelPoints[label] || 0) + points;
  });
}

function updateRivalMomentum(scores) {
  state.rivals.forEach((rival) => {
    const points = scores[rival.name] || 0;
    const momentum = clamp(0.4 + points / (CHART_SIZES.global * 1.5), 0.35, 0.9);
    const bonus = typeof rival.seedBonus === "number" ? rival.seedBonus : 0;
    rival.momentum = clamp(momentum + bonus, 0.35, 0.95);
  });
}

function topLabelFromScores(scores) {
  const ordered = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (!ordered.length) return { label: null, points: 0 };
  return { label: ordered[0][0], points: ordered[0][1] };
}

function topCumulativeLabel() {
  const ordered = Object.entries(state.meta.cumulativeLabelPoints || {}).sort((a, b) => b[1] - a[1]);
  if (!ordered.length) return { label: null, points: 0 };
  return { label: ordered[0][0], points: ordered[0][1] };
}

function isMonopoly(scores) {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return false;
  const total = entries.reduce((sum, entry) => sum + entry[1], 0);
  const [topLabel, topScore] = entries[0];
  const runnerUp = entries[1]?.[1] || 0;
  const share = total ? topScore / total : 0;
  return topLabel === state.label.name && share >= MONOPOLY_SHARE && topScore >= runnerUp * 1.4;
}

function announceWin(reason) {
  if (state.meta.winState) return;
  state.meta.winState = { reason, year: currentYear(), exp: state.meta.exp };
  logEvent(`Victory secured: ${reason}.`);
  if (!state.meta.winShown) {
    state.meta.winShown = true;
    showEndScreen("You Won", [
      { title: reason, detail: `EXP ${formatCount(state.meta.exp)} | ${formatDate(state.time.epochMs)}` },
      { title: "Continue Play", detail: "You can keep playing until Year 4000." }
    ]);
  }
}

function finalizeGame(result, reason) {
  if (state.meta.gameOver) return;
  state.meta.gameOver = { result, reason, year: currentYear(), exp: state.meta.exp };
  setTimeSpeed("pause");
  const title = result === "win" ? "You Won" : "Game Over - You Lost";
  showEndScreen(title, [
    { title: reason, detail: `EXP ${formatCount(state.meta.exp)} | End ${formatDate(state.time.epochMs)}` }
  ]);
  state.meta.endShown = true;
}

function applyBailoutIfNeeded() {
  if (state.label.cash > 0) return;
  if (state.meta.bailoutUsed) {
    finalizeGame("loss", "Bankruptcy after bailout.");
    return;
  }
  if (state.meta.bailoutPending) return;
  state.meta.bailoutPending = true;
  state.time.speed = "pause";
  logEvent("Bailout offer available. Accept to continue or decline to lose the game.", "warn");
  openOverlay("bailoutModal");
}

function acceptBailout() {
  if (state.meta.bailoutUsed || !state.meta.bailoutPending) return false;
  state.meta.bailoutUsed = true;
  state.meta.bailoutPending = false;
  state.meta.achievementsLocked = true;
  state.label.cash = 10000000;
  logEvent("Bailout accepted: debt cleared and $10,000,000 granted. Achievements locked.", "warn");
  return true;
}

function declineBailout() {
  if (!state.meta.bailoutPending || state.meta.bailoutUsed) return false;
  state.meta.bailoutPending = false;
  finalizeGame("loss", "Bankruptcy after declining bailout.");
  return true;
}

function checkWinLoss(scores) {
  if (state.meta.gameOver) return;
  const year = currentYear();
  const achievements = Math.max(state.meta.achievementsUnlocked.length, state.meta.achievements || 0);
  const monopoly = isMonopoly(scores);

  if (year < 3000) {
    if (!state.meta.winState && achievements >= ACHIEVEMENT_TARGET && !monopoly) {
      announceWin("Completed 12 CEO Requests without monopoly.");
    }
  } else if (year < 4000) {
    if (!state.meta.winState && (achievements >= ACHIEVEMENT_TARGET || monopoly)) {
      announceWin(monopoly ? "Reached monopoly status." : "Completed 12 CEO Requests.");
    }
  }

  if (year >= 4000) {
    const currentTop = topLabelFromScores(scores).label;
    const cumulativeTop = topCumulativeLabel().label;
    const victory = Boolean(state.meta.winState) || monopoly
      || currentTop === state.label.name || cumulativeTop === state.label.name;
    finalizeGame(victory ? "win" : "loss", victory ? "Final Year 4000 verdict." : "Not #1 at Year 4000.");
  }
}

function nextQuestId() {
  state.meta.questIdCounter += 1;
  return `CEO-${String(state.meta.questIdCounter).padStart(2, "0")}`;
}

function makeQuest(template, existingTypes) {
  const week = weekIndex() + 1;
  return template(week, existingTypes);
}

function questTemplates() {
  return [
    (week) => {
      const target = clamp(2 + Math.floor(week / 4), 2, 8);
      const startCount = state.tracks.filter((track) => track.status === "Released").length;
      return {
        id: nextQuestId(),
        type: "releaseCount",
        target,
        progress: 0,
        startCount,
        reward: 1500 + target * 650,
        expReward: 300 + target * 40,
        story: "CEO Directive: Gaia wants fresh releases to keep the charts alive.",
        text: `Release ${target} tracks this cycle`,
        done: false,
        rewarded: false
      };
    },
    () => {
      const genre = state.trends.length ? pickOne(state.trends) : makeGenre(pickOne(THEMES), pickOne(MOODS));
      return {
        id: nextQuestId(),
        type: "trendRelease",
        target: 1,
        progress: 0,
        genre,
        createdAt: state.time.epochMs,
        reward: 3200,
        expReward: 420,
        story: `Topoda Charts tip: deliver a ${formatGenreKeyLabel(genre)} track to steer the week.`,
        text: `Release 1 track in ${formatGenreKeyLabel(genre)}`,
        done: false,
        rewarded: false
      };
    },
    () => {
      const countries = ["Annglora", "Bytenza", "Crowlya"];
      const country = pickOne(countries);
      const target = Math.random() < 0.5 ? 10 : 5;
      return {
        id: nextQuestId(),
        type: "countryTop",
        country,
        target,
        bestRank: null,
        reward: target <= 5 ? 5200 : 3600,
        expReward: target <= 5 ? 520 : 420,
        story: `${country} Critics Council is watching your next move.`,
        text: `Land a track in ${country} Top ${target}`,
        done: false,
        rewarded: false
      };
    },
    (week) => ({
      id: nextQuestId(),
      type: "cash",
      target: 65000 + week * 2500,
      progress: 0,
      reward: 2400,
      expReward: 360,
      story: "eyeriS Corp wants proof of sustainable cashflow this quarter.",
      text: "Reach a cash milestone",
      done: false,
      rewarded: false
    })
  ];
}

function buildQuests() {
  const pool = questTemplates();
  const quests = [];
  while (quests.length < 3) {
    const template = pickOne(pool);
    quests.push(makeQuest(template, quests.map((quest) => quest.type)));
  }
  return quests;
}

function updateQuests() {
  const released = state.tracks.filter((track) => track.status === "Released");
  state.quests.forEach((quest) => {
    if (quest.type === "releaseCount") {
      quest.progress = released.length - quest.startCount;
      quest.done = quest.progress >= quest.target;
    }
    if (quest.type === "trendRelease") {
      quest.progress = released.filter((track) => track.genre === quest.genre && track.releasedAt >= quest.createdAt).length;
      quest.done = quest.progress >= quest.target;
    }
    if (quest.type === "countryTop") {
      const entries = state.charts.nations[quest.country] || [];
      const playerEntry = entries.find((entry) => entry.track.isPlayer);
      quest.bestRank = playerEntry ? playerEntry.rank : quest.bestRank;
      quest.done = quest.bestRank !== null && quest.bestRank <= quest.target;
    }
    if (quest.type === "cash") {
      quest.progress = state.label.cash;
      quest.done = quest.progress >= quest.target;
    }
    if (quest.done && !quest.rewarded) {
      quest.rewarded = true;
      state.label.cash += quest.reward;
      const expGain = Math.round(quest.expReward ?? (quest.reward / 8));
      awardExp(expGain, null, true);
      logEvent(`Quest complete: ${quest.id}. Reward +${formatMoney(quest.reward)} and ${expGain} EXP.`);
      postQuestComplete(quest);
    }
  });
}

function refreshQuestPool() {
  const active = state.quests.filter((quest) => !quest.done);
  const pool = questTemplates();
  const newQuests = [];
  while (active.length < 3) {
    const template = pickOne(pool);
    const quest = makeQuest(template, active.map((quest) => quest.type));
    active.push(quest);
    newQuests.push(quest);
  }
  state.quests = active;
  newQuests.forEach((quest) => postQuestEmail(quest));
}

function updateStamina() {
  state.creators.forEach((creator) => {
    creator.stamina = Math.min(100, creator.stamina + 14);
  });
}

function ageMarketTracks() {
  state.marketTracks.forEach((track) => {
    track.weeksOnChart += 1;
    track.promoWeeks = Math.max(0, track.promoWeeks - 1);
  });
  state.marketTracks = state.marketTracks.filter((track) => track.weeksOnChart <= 12);
}

function generateRivalReleases() {
  state.rivals.forEach((rival) => {
    const momentum = typeof rival.momentum === "number" ? rival.momentum : 0.5;
    const chance = clamp(0.18 + momentum * 0.35, 0.2, 0.6);
    if (Math.random() < chance) {
      const themePool = rival.focusThemes?.length ? rival.focusThemes : THEMES;
      const moodPool = rival.focusMoods?.length ? rival.focusMoods : MOODS;
      const theme = Math.random() < 0.8 ? pickOne(themePool) : pickOne(THEMES);
      const mood = Math.random() < 0.8 ? pickOne(moodPool) : pickOne(MOODS);
      let quality = clampQuality(rand(55, 95) + Math.round(momentum * 8));
      if (mood === "Boring") quality = clampQuality(quality - 12);
      const releaseAt = state.time.epochMs + rand(12, WEEK_HOURS) * HOUR_MS;
      state.rivalReleaseQueue.push({
        id: uid("RR"),
        releaseAt,
        title: makeTrackTitleByCountry(theme, mood, rival.country),
        label: rival.name,
        actName: makeRivalActName(),
        projectName: makeProjectTitle(),
        theme,
        mood,
        alignment: rival.alignment,
        country: rival.country,
        quality,
        genre: makeGenre(theme, mood),
        distribution: "Digital"
      });
    }
  });
}

function processRivalReleaseQueue() {
  if (!Array.isArray(state.rivalReleaseQueue) || !state.rivalReleaseQueue.length) return;
  const now = state.time.epochMs;
  const remaining = [];
  state.rivalReleaseQueue.forEach((entry) => {
    if (entry.releaseAt <= now) {
      state.marketTracks.push({
        id: uid("MK"),
        trackId: null,
        title: entry.title,
        label: entry.label,
        actId: null,
        actName: entry.actName,
        projectName: entry.projectName,
        isPlayer: false,
        theme: entry.theme,
        mood: entry.mood,
        alignment: entry.alignment,
        country: entry.country,
        quality: entry.quality,
        genre: entry.genre,
        distribution: entry.distribution || "Digital",
        releasedAt: entry.releaseAt,
        weeksOnChart: 0,
        promoWeeks: 0
      });
    } else {
      remaining.push(entry);
    }
  });
  state.rivalReleaseQueue = remaining;
}

function advanceEraWeek() {
  const active = getActiveEras();
  if (!active.length) return;
  const stillActive = [];
  active.forEach((era) => {
    if (era.status !== "Active") {
      archiveEra(era, era.status || "Ended");
      return;
    }
    era.weeksElapsed += 1;
    era.stageWeek += 1;
    const stageWeeks = era.rolloutWeeks || ROLLOUT_PRESETS[1].weeks;
    if (era.stageWeek >= stageWeeks[era.stageIndex]) {
      era.stageIndex += 1;
      era.stageWeek = 0;
      if (era.stageIndex >= ERA_STAGES.length) {
        era.status = "Complete";
        era.completedWeek = weekIndex() + 1;
        archiveEra(era, "Complete");
        logEvent(`Era complete: ${era.name}.`);
        postEraComplete(era);
        return;
      }
      logEvent(`Era shift: ${era.name} moved to ${ERA_STAGES[era.stageIndex]}.`);
    }
    stillActive.push(era);
  });
  state.era.active = stillActive;
}

function maybeRunAutoRollout() {
  if (!state.meta.autoRollout || !state.meta.autoRollout.enabled) return;
  state.meta.autoRollout.lastCheckedAt = state.time.epochMs;
}

function weeklyUpdate() {
  const week = weekIndex() + 1;
  generateRivalReleases();
  const { globalScores } = computeCharts();
  const labelScores = computeLabelScoresFromCharts();
  updateCumulativeLabelPoints(labelScores);
  updateRivalMomentum(labelScores);
  updateTrends(globalScores);
  updateEconomy(globalScores);
  awardExp(Math.min(300, Math.round(state.economy.lastRevenue / 500)), null, true);
  updateLabelReach();
  updateQuests();
  refreshQuestPool();
  advanceEraWeek();
  maybeRunAutoRollout();
  ageMarketTracks();
  applyBailoutIfNeeded();
  evaluateAchievements();
  checkWinLoss(labelScores);
  renderAll();
}

function onYearTick(year) {
  // Annual snapshot and deterministic tie-resolution for awards
  logEvent(`Year ${year} tick.`);
  refreshPopulationSnapshot(year);
  logEvent(`Population update: Year ${year}.`);
  // Recompute charts and label scores to determine annual leader
  const { globalScores } = computeCharts();
  const labelScores = computeLabelScoresFromCharts();
  updateCumulativeLabelPoints(labelScores);
  // Determine top labels
  const entries = Object.entries(labelScores).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return;
  const topPoints = entries[0][1];
  const tied = entries.filter((e) => e[1] === topPoints).map((e) => e[0]);
  let winner = tied[0];
  let resolvedBy = "score";
  if (tied.length > 1) {
    // Use cumulative points as first tiebreaker
    const cumScores = tied.map((label) => ({ label, points: state.meta.cumulativeLabelPoints[label] || 0 }));
    cumScores.sort((a, b) => b.points - a.points);
    if (cumScores[0].points !== cumScores[1]?.points) {
      winner = cumScores[0].label;
      resolvedBy = "cumulative";
    } else {
      // Last resort: deterministic alphabetical order
      winner = tied.sort()[0];
      resolvedBy = "alphabetical";
    }
  }
  state.meta.annualWinners = state.meta.annualWinners || [];
  state.meta.annualWinners.push({ year, label: winner, points: topPoints, resolvedBy });
  logEvent(`Annual Winner ${year}: ${winner} (${formatCount(topPoints)} points) [${resolvedBy}].`);
  postSocial({ handle: "@TopodaCharts", title: `Annual Winner ${year}`, lines: [`${winner} secured the year with ${formatCount(topPoints)} points.`, `Tie-break: ${resolvedBy}`], type: "system", order: 1 });
  // Run end-of-year economy/housekeeping: award EXP, refresh quests
  awardExp(1200, `Year ${year} Season End` , true);
  // Reconcile win/loss state
  checkWinLoss(labelScores);
  // Persist snapshot
  saveToActiveSlot();
}

function advanceHours(hours) {
  if (state.meta.gameOver) return;
  for (let i = 0; i < hours; i += 1) {
    state.time.totalHours += 1;
    state.time.epochMs += HOUR_MS;
    processWorkOrders();
    processReleaseQueue();
    processRivalReleaseQueue();
    rechargeStamina(1);
    if (weekIndex() > state.lastWeekIndex) {
      state.lastWeekIndex = weekIndex();
      weeklyUpdate();
    }
    // Year crossing detection and yearly tick handling
    const cy = currentYear();
    if (typeof state.time.lastYear === "undefined") state.time.lastYear = cy;
    if (cy !== state.time.lastYear) {
      for (let y = state.time.lastYear + 1; y <= cy; y += 1) {
        try {
          onYearTick(y);
        } catch (e) {
          console.error("onYearTick error:", e);
        }
      }
      state.time.lastYear = cy;
    }
  }
  renderTime();
}

function tick(now) {
  if (state.time.lastTick === null || Number.isNaN(state.time.lastTick)) {
    state.time.lastTick = now;
    requestAnimationFrame(tick);
    return;
  }
  const dt = (now - state.time.lastTick) / 1000;
  state.time.lastTick = now;
  let secPerHour = Infinity;
  if (state.time.speed === "play") secPerHour = state.time.secPerHourPlay;
  if (state.time.speed === "fast") secPerHour = state.time.secPerHourFast;
  if (secPerHour !== Infinity) {
    state.time.acc += dt;
    while (state.time.acc >= secPerHour) {
      state.time.acc -= secPerHour;
      advanceHours(1);
    }
  }
  maybeAutoSave();
  requestAnimationFrame(tick);
}

function maybeAutoSave() {
  if (!session.activeSlot) return;
  if (!state.meta.autoSave.enabled) return;
  const intervalMs = state.meta.autoSave.minutes * 60000;
  const last = state.meta.autoSave.lastSavedAt || 0;
  if (Date.now() - last < intervalMs) return;
  saveToActiveSlot();
  state.meta.autoSave.lastSavedAt = Date.now();
}


function seedMarketTracks({ rng = Math.random, count = 6, dominantLabelId = null } = {}) {
  const rngFn = typeof rng === "function" ? rng : Math.random;
  const dominant = dominantLabelId ? state.rivals.find((rival) => rival.id === dominantLabelId) : null;
  const pickRival = () => {
    if (dominant && rngFn() < 0.45) return dominant;
    return seededPick(state.rivals, rngFn);
  };
  for (let i = 0; i < count; i += 1) {
    const rival = pickRival();
    const themePool = rival.focusThemes?.length ? rival.focusThemes : THEMES;
    const moodPool = rival.focusMoods?.length ? rival.focusMoods : MOODS;
    const theme = rngFn() < 0.8 ? seededPick(themePool, rngFn) : seededPick(THEMES, rngFn);
    const mood = rngFn() < 0.8 ? seededPick(moodPool, rngFn) : seededPick(MOODS, rngFn);
    const momentum = typeof rival.momentum === "number" ? rival.momentum : 0.5;
    let quality = clampQuality(seededRand(55, 95, rngFn) + Math.round(momentum * 6));
    if (mood === "Boring") quality = clampQuality(quality - 12);
    state.marketTracks.push({
      id: uid("MK"),
      trackId: null,
      title: makeTrackTitleByCountry(theme, mood, rival.country),
      label: rival.name,
      actId: null,
      actName: makeRivalActName(),
      projectName: makeProjectTitle(),
      isPlayer: false,
      theme,
      mood,
      alignment: rival.alignment,
      country: rival.country,
      quality,
      genre: makeGenre(theme, mood),
      weeksOnChart: seededRand(0, 8, rngFn),
      promoWeeks: seededRand(0, 4, rngFn)
    });
  }
}

function slotKey(index) {
  return `${SLOT_PREFIX}${index}`;
}

function getSlotData(index) {
  const raw = localStorage.getItem(slotKey(index));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToSlot(index) {
  if (!index) return;
  state.meta.savedAt = Date.now();
  if (state.meta.autoSave) state.meta.autoSave.lastSavedAt = state.meta.savedAt;
  const payload = JSON.stringify(state);
  localStorage.setItem(slotKey(index), payload);
}

function saveToActiveSlot() {
  if (!session.activeSlot) return;
  saveToSlot(session.activeSlot);
}

function resetState(nextState) {
  Object.assign(state, makeDefaultState(), nextState || {});
  normalizeState();
  state.time.lastTick = null;
  state.time.acc = 0;
}

function seedNewGame() {
  const baseCreators = [];
  ["Songwriter", "Performer", "Producer"].forEach((role) => {
    baseCreators.push(makeCreator(role, baseCreators.map((creator) => creator.name)));
  });
  state.creators = baseCreators;
  state.marketCreators = buildMarketCreators();
  state.rivals = buildRivals();
  state.trends = seedTrends();
  state.quests = buildQuests();
  state.quests.forEach((quest) => postQuestEmail(quest));
  seedWorldHistory();
  seedActs();
  logEvent("Welcome back, CEO. Your label awaits.");
}

function loadSlot(index, forceNew = false) {
  const data = forceNew ? null : getSlotData(index);
  resetState(data);
  if (!data) seedNewGame();
  session.activeSlot = index;
  sessionStorage.setItem("rls_active_slot", String(index));
  refreshSelectOptions();
  computeCharts();
  renderAll();
  if (!data && typeof window !== "undefined" && typeof window.resetViewLayout === "function") {
    window.resetViewLayout();
  }
  closeMainMenu();
  startGameLoop();
}

function deleteSlot(index) {
  localStorage.removeItem(slotKey(index));
}

function normalizeState() {
  if (!state.ui) {
    state.ui = {
      activeChart: "global",
      genreTheme: "All",
      genreMood: "All",
      slotTarget: null,
      actSlots: { lead: null, member2: null, member3: null },
      trackSlots: { actId: null, songwriterId: null, performerId: null, producerId: null },
      eraSlots: { actId: null },
      promoSlots: { trackId: null },
      activeView: "charts"
    };
  }
  if (!state.ui.activeChart) state.ui.activeChart = "global";
  if (!state.ui.genreTheme) state.ui.genreTheme = "All";
  if (!state.ui.genreMood) state.ui.genreMood = "All";
  if (!state.ui.actSlots) state.ui.actSlots = { lead: null, member2: null, member3: null };
  if (!state.ui.trackSlots) state.ui.trackSlots = { actId: null, songwriterId: null, performerId: null, producerId: null };
  if (typeof state.ui.focusEraId === "undefined") state.ui.focusEraId = null;
  if (state.ui.focusEraId !== null && typeof state.ui.focusEraId !== "string") state.ui.focusEraId = null;
  if (!state.ui.eraSlots) state.ui.eraSlots = { actId: null };
  if (!state.ui.promoSlots) state.ui.promoSlots = { trackId: null };
  if (!state.ui.socialSlots) state.ui.socialSlots = { trackId: null };
  if (typeof state.ui.chartHistoryWeek !== "number") state.ui.chartHistoryWeek = null;
  if (typeof state.ui.chartHistorySnapshot === "undefined") state.ui.chartHistorySnapshot = null;
  if (!state.meta) state.meta = makeDefaultState().meta;
  if (typeof state.meta.chartHistoryLastWeek === "undefined") state.meta.chartHistoryLastWeek = null;
  if (!state.ui.viewContext) {
    state.ui.viewContext = {
      actId: null,
      eraId: null,
      releaseId: null,
      projectId: null,
      plannedReleaseIds: [],
      selectedRolloutTemplateId: null
    };
  }
  if (!state.ui.eraPlan) {
    state.ui.eraPlan = {
      actId: null,
      goals: "",
      themeTarget: "Any",
      moodTarget: "Any",
      cadence: "Weekly",
      scheduleNote: "",
      rolloutTemplateId: null,
      plannedReleaseIds: []
    };
  }
  if (!state.ui.activeView) state.ui.activeView = "charts";
  if (state.ui.activeView === "promotion" || state.ui.activeView === "era") {
    state.ui.activeView = "eras";
  }
  if (typeof state.ui.socialShowInternal !== "boolean") state.ui.socialShowInternal = false;
  if (!state.ui.socialFilters) {
    state.ui.socialFilters = {
      creator: true,
      quest: true,
      track: true,
      era: true,
      economy: true,
      system: true,
      chart: true,
      contract: true,
      receipt: true,
      ccc: true
    };
  } else {
    const defaults = {
      creator: true,
      quest: true,
      track: true,
      era: true,
      economy: true,
      system: true,
      chart: true,
      contract: true,
      receipt: true,
      ccc: true
    };
    Object.keys(defaults).forEach((key) => {
      if (typeof state.ui.socialFilters[key] !== "boolean") state.ui.socialFilters[key] = defaults[key];
    });
  }
  if (!state.ui.calendarTab) state.ui.calendarTab = "label";
  if (!state.ui.calendarFilters) {
    state.ui.calendarFilters = {
      labelScheduled: true,
      labelReleased: true,
      rivalScheduled: true,
      rivalReleased: true
    };
  } else {
    const defaults = {
      labelScheduled: true,
      labelReleased: true,
      rivalScheduled: true,
      rivalReleased: true
    };
    Object.keys(defaults).forEach((key) => {
      if (typeof state.ui.calendarFilters[key] !== "boolean") state.ui.calendarFilters[key] = defaults[key];
    });
  }
  if (typeof state.ui.slotTarget === "undefined") state.ui.slotTarget = null;
  if (!state.studio) state.studio = { slots: 2, inUse: 0 };
  if (typeof state.studio.slots !== "number") state.studio.slots = 2;
  if (typeof state.studio.inUse !== "number") state.studio.inUse = 0;
  state.studio.slots = clamp(Math.round(state.studio.slots), 0, STUDIO_CAP_PER_LABEL);
  state.studio.inUse = clamp(Math.round(state.studio.inUse), 0, state.studio.slots);
  if (!state.acts) state.acts = [];
  if (!state.creators) state.creators = [];
  state.creators = state.creators.map((creator) => normalizeCreator(creator));
  if (!state.rivals) state.rivals = [];
  state.rivals.forEach((rival) => {
    if (typeof rival.seedBonus !== "number") rival.seedBonus = 0;
  });
  if (!state.trends) state.trends = [];
  if (!state.acts.length && state.creators.length) seedActs();
  if (!state.meta) state.meta = { savedAt: null, version: 3, questIdCounter: 0 };
  if (typeof state.meta.questIdCounter !== "number") state.meta.questIdCounter = 0;
  if (!Array.isArray(state.meta.achievementsUnlocked)) state.meta.achievementsUnlocked = [];
  if (typeof state.meta.achievements !== "number") state.meta.achievements = state.meta.achievementsUnlocked.length;
  state.meta.achievements = Math.max(state.meta.achievements, state.meta.achievementsUnlocked.length);
  if (typeof state.meta.achievementsLocked !== "boolean") state.meta.achievementsLocked = false;
  if (typeof state.meta.bailoutUsed !== "boolean") state.meta.bailoutUsed = false;
  if (typeof state.meta.bailoutPending !== "boolean") state.meta.bailoutPending = false;
  if (state.meta.bailoutUsed) state.meta.bailoutPending = false;
  if (state.meta.bailoutUsed && !state.meta.achievementsLocked) state.meta.achievementsLocked = true;
  if (typeof state.meta.exp !== "number") state.meta.exp = 0;
  if (typeof state.meta.promoRuns !== "number") state.meta.promoRuns = 0;
  if (!state.meta.cumulativeLabelPoints) state.meta.cumulativeLabelPoints = {};
  if (typeof state.meta.winShown !== "boolean") state.meta.winShown = false;
  if (typeof state.meta.endShown !== "boolean") state.meta.endShown = false;
  if (!state.meta.autoSave) state.meta.autoSave = { enabled: false, minutes: 5, lastSavedAt: null };
  if (typeof state.meta.autoSave.minutes !== "number") state.meta.autoSave.minutes = 5;
  if (typeof state.meta.autoSave.enabled !== "boolean") state.meta.autoSave.enabled = false;
  if (!state.meta.autoRollout) state.meta.autoRollout = { enabled: false, lastCheckedAt: null };
  if (typeof state.meta.autoRollout.enabled !== "boolean") state.meta.autoRollout.enabled = false;
  if (!state.meta.seedInfo) state.meta.seedInfo = null;
  if (!state.meta.seedHistory) state.meta.seedHistory = null;
  if (!Array.isArray(state.meta.seedCatalog)) state.meta.seedCatalog = [];
  if (!state.charts) state.charts = { global: [], nations: { Annglora: [], Bytenza: [], Crowlya: [] }, regions: {} };
  if (!state.charts.regions) state.charts.regions = {};
  if (!state.economy) state.economy = { lastRevenue: 0, lastUpkeep: 0, lastWeek: 0 };
  if (!state.era) state.era = { active: [], history: [] };
  if (!Array.isArray(state.era.active)) {
    const legacy = state.era.active ? [state.era.active] : [];
    state.era.active = legacy;
  }
  if (!Array.isArray(state.era.history)) state.era.history = [];
  if (!state.social) state.social = { posts: [] };
  if (!Array.isArray(state.social.posts)) state.social.posts = [];
  if (!Array.isArray(state.rivalReleaseQueue)) state.rivalReleaseQueue = [];
  if (!state.population) state.population = { snapshot: null, lastUpdateYear: 0, lastUpdateAt: null, campaignSplit: null, campaignSplitStage: null };
  if (typeof state.population.lastUpdateYear !== "number") {
    const derivedYear = state.population.lastUpdateAt
      ? new Date(state.population.lastUpdateAt).getUTCFullYear()
      : currentYear();
    state.population.lastUpdateYear = derivedYear;
  }
  if (typeof state.population.lastUpdateAt !== "number") state.population.lastUpdateAt = null;
  if (!state.population.campaignSplitStage) state.population.campaignSplitStage = null;
  if (state.label && !state.label.country) state.label.country = "Annglora";
  if (state.label) {
    state.label.cash = Math.round(state.label.cash ?? 0);
    const snapshot = computePopulationSnapshot();
    state.label.fans = clamp(state.label.fans ?? 0, 0, snapshot.total);
  }
  if (state.marketCreators?.length) {
    state.marketCreators = state.marketCreators.map((creator) => {
      const next = normalizeCreator(creator);
      next.signCost = next.signCost || computeSignCost(next);
      return next;
    });
  }
  if (state.tracks?.length) {
    state.tracks.forEach((track) => {
      track.quality = clampQuality(track.quality ?? 0);
      track.qualityPotential = clampQuality(track.qualityPotential ?? track.quality);
      if (typeof track.trendAtRelease !== "boolean") track.trendAtRelease = false;
      if (!track.projectType) track.projectType = "Single";
      if (!track.distribution) track.distribution = "Digital";
      if (track.modifier && !track.modifier.id) track.modifier = getModifier(track.modifier);
    });
  }
  if (state.marketTracks?.length) {
    state.marketTracks.forEach((entry) => {
      if (!entry.distribution) entry.distribution = "Digital";
      if (typeof entry.releasedAt !== "number") entry.releasedAt = state.time?.epochMs || Date.now();
      if (typeof entry.isPlayer !== "boolean") entry.isPlayer = false;
    });
  }
  if (!Array.isArray(state.releaseQueue)) state.releaseQueue = [];
  state.releaseQueue = state.releaseQueue.map((entry) => ({
    ...entry,
    distribution: entry.distribution || entry.note || "Digital"
  }));
  const timeDefaults = makeDefaultState().time;
  if (!state.time) state.time = { ...timeDefaults };
  state.time = { ...timeDefaults, ...state.time };
  if (state.time.speed !== "pause" && state.time.speed !== "play" && state.time.speed !== "fast") {
    state.time.speed = "pause";
  }
  if (typeof state.time.secPerHourPlay !== "number" || state.time.secPerHourPlay <= 0) {
    state.time.secPerHourPlay = timeDefaults.secPerHourPlay;
  }
  if (typeof state.time.secPerHourFast !== "number" || state.time.secPerHourFast <= 0) {
    state.time.secPerHourFast = timeDefaults.secPerHourFast;
  }
  if (typeof state.time.epochMs !== "number" || Number.isNaN(state.time.epochMs)) {
    state.time.epochMs = timeDefaults.epochMs;
  }
  if (typeof state.time.totalHours !== "number" || Number.isNaN(state.time.totalHours)) {
    state.time.totalHours = timeDefaults.totalHours;
  }
  if (typeof state.time.acc !== "number" || Number.isNaN(state.time.acc)) {
    state.time.acc = 0;
  }
  if (typeof state.time.lastTick === "undefined") state.time.lastTick = null;
  if (typeof state.time.lastYear === "undefined" || Number.isNaN(state.time.lastYear)) {
    state.time.lastYear = currentYear();
  }
}

function refreshSelectOptions() {
  const labelAlignment = $("labelAlignment");
  if (labelAlignment) labelAlignment.innerHTML = ALIGNMENTS.map((a) => `<option value="${a}">${a}</option>`).join("");
  const trackAlignment = $("trackAlignment");
  if (trackAlignment) trackAlignment.innerHTML = ALIGNMENTS.map((a) => `<option value="${a}">${a}</option>`).join("");
  const themeSelect = $("themeSelect");
  if (themeSelect) themeSelect.innerHTML = THEMES.map((t) => `<option value="${t}">${t}</option>`).join("");
  const moodSelect = $("moodSelect");
  if (moodSelect) moodSelect.innerHTML = MOODS.map((m) => `<option value="${m}">${m}</option>`).join("");
  const modifierSelect = $("modifierSelect");
  if (modifierSelect) modifierSelect.innerHTML = MODIFIERS.map((mod) => `<option value="${mod.id}">${mod.label}</option>`).join("");
  const actTypeSelect = $("actTypeSelect");
  if (actTypeSelect) actTypeSelect.innerHTML = ACT_TYPES.map((type) => `<option value="${type}">${type}</option>`).join("");
  const actAlignmentSelect = $("actAlignmentSelect");
  if (actAlignmentSelect) actAlignmentSelect.innerHTML = ALIGNMENTS.map((a) => `<option value="${a}">${a}</option>`).join("");
  const genreThemeFilter = $("genreThemeFilter");
  if (genreThemeFilter) {
    genreThemeFilter.innerHTML = [`<option value="All">All Themes</option>`, ...THEMES.map((t) => `<option value="${t}">${t}</option>`)].join("");
  }
  const genreMoodFilter = $("genreMoodFilter");
  if (genreMoodFilter) {
    genreMoodFilter.innerHTML = [`<option value="All">All Moods</option>`, ...MOODS.map((m) => `<option value="${m}">${m}</option>`)].join("");
  }
  const eraRolloutSelect = $("eraRolloutSelect");
  if (eraRolloutSelect) {
    eraRolloutSelect.innerHTML = ROLLOUT_PRESETS.map((preset) => `<option value="${preset.id}">${preset.label}</option>`).join("");
  }
  const eraPlanTheme = $("eraPlanTheme");
  if (eraPlanTheme) {
    eraPlanTheme.innerHTML = [`<option value="Any">Any Theme</option>`, ...THEMES.map((t) => `<option value="${t}">${t}</option>`)].join("");
    eraPlanTheme.value = state.ui.eraPlan?.themeTarget || "Any";
  }
  const eraPlanMood = $("eraPlanMood");
  if (eraPlanMood) {
    eraPlanMood.innerHTML = [`<option value="Any">Any Mood</option>`, ...MOODS.map((m) => `<option value="${m}">${m}</option>`)].join("");
    eraPlanMood.value = state.ui.eraPlan?.moodTarget || "Any";
  }
  const eraPlanRollout = $("eraPlanRollout");
  if (eraPlanRollout) {
    eraPlanRollout.innerHTML = ROLLOUT_PRESETS.map((preset) => `<option value="${preset.id}">${preset.label}</option>`).join("");
    eraPlanRollout.value = state.ui.eraPlan?.rolloutTemplateId || ROLLOUT_PRESETS[1].id;
  }
  const eraPlanCadence = $("eraPlanCadence");
  if (eraPlanCadence) {
    const cadenceOptions = ["Weekly", "Biweekly", "Monthly", "Quarterly"];
    eraPlanCadence.innerHTML = cadenceOptions.map((cadence) => `<option value="${cadence}">${cadence}</option>`).join("");
    eraPlanCadence.value = state.ui.eraPlan?.cadence || "Weekly";
  }
  const eraPlanGoals = $("eraPlanGoals");
  if (eraPlanGoals) eraPlanGoals.value = state.ui.eraPlan?.goals || "";
  const eraPlanSchedule = $("eraPlanSchedule");
  if (eraPlanSchedule) eraPlanSchedule.value = state.ui.eraPlan?.scheduleNote || "";
  const eraPlanPlannedReleases = $("eraPlanPlannedReleases");
  if (eraPlanPlannedReleases) {
    const planned = state.ui.eraPlan?.plannedReleaseIds || [];
    eraPlanPlannedReleases.value = planned.join(", ");
  }
  const projectTypeSelect = $("projectTypeSelect");
  if (projectTypeSelect && !projectTypeSelect.value) projectTypeSelect.value = "Single";
  if (labelAlignment) labelAlignment.value = state.label.alignment;
  if (trackAlignment) trackAlignment.value = state.label.alignment;
  if (actAlignmentSelect) actAlignmentSelect.value = state.label.alignment;
  const eraSeed = getActiveEras()[0];
  if (eraSeed && eraSeed.rolloutId && eraRolloutSelect) {
    eraRolloutSelect.value = eraSeed.rolloutId;
  }
  const labelNameInput = $("labelNameInput");
  if (labelNameInput) labelNameInput.value = state.label.name;
  if (genreThemeFilter) genreThemeFilter.value = state.ui.genreTheme || "All";
  if (genreMoodFilter) genreMoodFilter.value = state.ui.genreMood || "All";
  updateActMemberFields();
  renderSlots();
  updateGenrePreview();
}

function updateActMemberFields() {
  const actTypeSelect = $("actTypeSelect");
  if (!actTypeSelect) return;
  const solo = actTypeSelect.value === "Solo Act";
  if (solo) {
    state.ui.actSlots.member2 = null;
    state.ui.actSlots.member3 = null;
    if (state.ui.slotTarget === "act-member2" || state.ui.slotTarget === "act-member3") {
      state.ui.slotTarget = null;
    }
  }
  commitSlotChange();
}

function rankCandidates(role) {
  const busyIds = new Set(state.workOrders.filter((o) => o.status === "In Progress").map((o) => o.creatorId));
  const req = staminaRequirement(role);
  return state.creators
    .filter((c) => c.role === role)
    .map((creator) => ({
      ...creator,
      ready: creator.stamina >= req,
      busy: busyIds.has(creator.id)
    }))
    .sort((a, b) => {
      if (a.ready !== b.ready) return a.ready ? -1 : 1;
      if (a.busy !== b.busy) return a.busy ? 1 : -1;
      if (a.skill !== b.skill) return b.skill - a.skill;
      return b.stamina - a.stamina;
    });
}

const RECOMMEND_VERSION = 1;

function topTrendRecommendation() {
  const top = state.trends[0];
  if (top) {
    return { theme: themeFromGenre(top), mood: moodFromGenre(top), reason: "Top trend this week." };
  }
  return { theme: THEMES[0], mood: MOODS[0], reason: "Defaulting to core genre set." };
}

function recommendActId() {
  if (!state.acts.length) return { actId: null, reason: "No acts available yet." };
  const focusEra = getFocusedEra();
  if (focusEra) {
    const focusAct = getAct(focusEra.actId);
    if (focusAct) {
      return { actId: focusAct.id, reason: `Focus era selected (${focusEra.name}).` };
    }
  }
  const scored = state.acts.map((act) => {
    const members = act.memberIds.map((id) => getCreator(id)).filter(Boolean);
    const avgSkill = members.length
      ? Math.round(members.reduce((sum, creator) => sum + creator.skill, 0) / members.length)
      : 0;
    return { act, avgSkill };
  });
  scored.sort((a, b) => {
    if (b.avgSkill !== a.avgSkill) return b.avgSkill - a.avgSkill;
    return a.act.name.localeCompare(b.act.name);
  });
  return { actId: scored[0].act.id, reason: `Best average skill (${scored[0].avgSkill}).` };
}

function recommendModifierId(theme, mood) {
  const baseCost = STAGES.reduce((sum, stage) => sum + stage.cost, 0);
  const trendMatch = state.trends.includes(makeGenre(theme, mood));
  const qualityMod = MODIFIERS.find((mod) => mod.qualityDelta > 0);
  const speedMod = MODIFIERS.find((mod) => mod.hoursDelta < 0);
  if (trendMatch && qualityMod && state.label.cash >= baseCost + (qualityMod.costDelta || 0)) {
    return { modifierId: qualityMod.id, reason: "Invest in quality while trend is hot." };
  }
  if (!trendMatch && speedMod && state.label.cash >= baseCost + (speedMod.costDelta || 0)) {
    return { modifierId: speedMod.id, reason: "Favor speed on a colder week." };
  }
  return { modifierId: MODIFIERS[0]?.id || "None", reason: "Standard budget tier." };
}

function recommendProjectType(actId) {
  const relevant = actId
    ? state.tracks.filter((track) => track.actId === actId && track.status !== "In Production")
    : state.tracks.filter((track) => track.status !== "In Production");
  const count = relevant.length;
  if (count >= 6) return { type: "Album", reason: `Catalog depth ${count} supports an album.` };
  if (count >= 3) return { type: "EP", reason: `Catalog depth ${count} supports an EP.` };
  return { type: "Single", reason: `Catalog depth ${count} favors a single.` };
}

function recommendTrackPlan() {
  const trend = topTrendRecommendation();
  const actPick = recommendActId();
  const writer = rankCandidates("Songwriter")[0];
  const performer = rankCandidates("Performer")[0];
  const producer = rankCandidates("Producer")[0];
  const modifierPick = recommendModifierId(trend.theme, trend.mood);
  const projectPick = recommendProjectType(actPick.actId);
  return {
    version: RECOMMEND_VERSION,
    theme: trend.theme,
    mood: trend.mood,
    actId: actPick.actId,
    songwriterId: writer?.id || null,
    performerId: performer?.id || null,
    producerId: producer?.id || null,
    modifierId: modifierPick.modifierId,
    projectType: projectPick.type,
    reasons: [
      trend.reason,
      actPick.reason,
      modifierPick.reason,
      projectPick.reason
    ].filter(Boolean).join(" ")
  };
}

function recommendReleasePlan(track) {
  const trendMatch = state.trends.includes(track.genre);
  if (trendMatch) {
    return {
      version: RECOMMEND_VERSION,
      distribution: "Digital",
      scheduleKey: "now",
      scheduleHours: 0,
      reason: "Trend match favors an immediate digital release."
    };
  }
  if (track.quality >= 85) {
    return {
      version: RECOMMEND_VERSION,
      distribution: "Physical",
      scheduleKey: "fortnight",
      scheduleHours: WEEK_HOURS * 2,
      reason: "High quality warrants a physical rollout."
    };
  }
  return {
    version: RECOMMEND_VERSION,
    distribution: "Digital",
    scheduleKey: "week",
    scheduleHours: WEEK_HOURS,
    reason: "Give one week for prep and momentum."
  };
}

function renderAutoAssignModal() {
  const roles = ["Songwriter", "Performer", "Producer"];
  const blocks = roles.map((role) => {
    const candidates = rankCandidates(role).slice(0, 5);
    const req = staminaRequirement(role);
    if (!candidates.length) {
      return `
        <div class="auto-assign-role">
          <h3>${role}</h3>
          <div class="muted">No candidates available.</div>
        </div>
      `;
    }
    return `
      <div class="auto-assign-role">
        <h3>${role}</h3>
        ${candidates.map((creator) => `
          <div class="list-item">
            <div class="auto-assign-candidate">
              <div>
                <div class="item-title">${creator.name}</div>
                <div class="muted">ID ${creator.id} • Skill ${creator.skill} • Stamina ${creator.stamina}</div>
              </div>
              <div class="actions">
                ${creator.ready ? "" : `<span class="tag low">Low stamina</span>`}
                <button type="button" class="ghost" data-assign-role="${role}" data-assign-id="${creator.id}">Assign</button>
              </div>
            </div>
            <div class="muted">Needs ${req} stamina for ${role} stage</div>
          </div>
        `).join("")}
      </div>
    `;
  });
  $("autoAssignList").innerHTML = blocks.join("");
}
function renderTime() {
  $("timeDisplay").textContent = formatDate(state.time.epochMs);
  $("weekDisplay").textContent = `Week ${weekIndex() + 1}`;
  $("chartCountdown").textContent = `Charts update in ${hoursUntilNextWeek()}h`;
}

function renderFocusEraStatus() {
  const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
  const focusEra = getFocusedEra();
  const fallbackEra = !focusEra && activeEras.length === 1 ? activeEras[0] : null;
  const displayEra = focusEra || fallbackEra;
  const actName = displayEra ? getAct(displayEra.actId)?.name : null;
  const baseLabel = displayEra ? `${displayEra.name}${actName ? ` (${actName})` : ""}` : "";
  const headerLabel = focusEra
    ? baseLabel
    : fallbackEra
      ? `${baseLabel} (Auto)`
      : activeEras.length
        ? "Select focus"
        : "No active eras";
  const detailLabel = focusEra
    ? `Focused: ${baseLabel}`
    : fallbackEra
      ? `Auto: ${baseLabel}`
      : activeEras.length
        ? "No focus selected"
        : "No active eras";
  const promoLabel = focusEra
    ? baseLabel
    : fallbackEra
      ? `${baseLabel} (Auto)`
      : activeEras.length
        ? "Select focus"
        : "No active eras";

  const headerEl = $("focusEraDisplay");
  if (headerEl) {
    headerEl.textContent = headerLabel;
    if (displayEra) {
      const stageName = ERA_STAGES[displayEra.stageIndex] || "Active";
      headerEl.title = `Act: ${actName || "Unknown"} | Stage: ${stageName}`;
    } else {
      headerEl.title = "";
    }
  }
  const labelEl = $("eraFocusLabel");
  if (labelEl) labelEl.textContent = detailLabel;
  const promoEl = $("promoFocusLabel");
  if (promoEl) promoEl.textContent = promoLabel;
  const clearBtn = $("eraFocusClear");
  if (clearBtn) clearBtn.disabled = !focusEra;
  const promoBtn = $("promoFocusPickBtn");
  if (promoBtn) promoBtn.disabled = !displayEra;
}

function renderStats() {
  $("cashDisplay").textContent = formatMoney(state.label.cash);
  $("studioDisplay").textContent = `${state.studio.inUse} / ${state.studio.slots}`;
  $("slotDisplay").textContent = session.activeSlot ? `Slot ${session.activeSlot}` : "-";
  $("slotTargetDisplay").textContent = state.ui.slotTarget ? describeSlot(state.ui.slotTarget) : "-";
  if ($("labelNameDisplay")) {
    $("labelNameDisplay").textContent = state.label.name || "Record Label";
  }
  if ($("alignmentDisplay")) {
    $("alignmentDisplay").innerHTML = renderAlignmentTag(state.label.alignment);
  }
  if ($("popularityDisplay")) {
    const ranking = getLabelRanking();
    const index = ranking.findIndex((row) => row[0] === state.label.name);
    $("popularityDisplay").textContent = index >= 0 ? `#${index + 1}` : "Unranked";
  }
  if ($("reachDisplay")) {
    const snapshot = computePopulationSnapshot();
    const reach = snapshot.total ? (state.label.fans / snapshot.total) * 100 : 0;
    $("reachDisplay").textContent = `${reach.toFixed(2)}%`;
  }
  if ($("achievementCount")) {
    const unlockedCount = state.meta.achievementsUnlocked?.length || 0;
    const count = Math.max(unlockedCount, state.meta.achievements || 0);
    $("achievementCount").textContent = `${count} / ${ACHIEVEMENT_TARGET}`;
  }
  if ($("expDisplay")) {
    $("expDisplay").textContent = formatCount(state.meta.exp || 0);
  }
  if ($("bailoutStatus")) {
    if (state.meta.bailoutPending) {
      $("bailoutStatus").textContent = "Bailout offer pending.";
    } else if (state.meta.achievementsLocked) {
      $("bailoutStatus").textContent = "Bailout used: achievements locked.";
    } else if (state.meta.bailoutUsed) {
      $("bailoutStatus").textContent = "Bailout used.";
    } else {
      $("bailoutStatus").textContent = "";
    }
  }
  if ($("winTrackDisplay")) {
    if (state.meta.winState) {
      $("winTrackDisplay").textContent = `Won ${state.meta.winState.year}`;
    } else {
      const year = currentYear();
      if (year < 3000) $("winTrackDisplay").textContent = "12 Requests (no monopoly)";
      else if (year < 4000) $("winTrackDisplay").textContent = "12 Requests or Monopoly";
      else $("winTrackDisplay").textContent = "Top Label or Monopoly";
    }
  }
  renderFocusEraStatus();
}

function computeLabelScores() {
  const labelScores = {};
  (state.charts.global || []).forEach((entry) => {
    const points = Math.max(1, CHART_SIZES.global + 1 - entry.rank);
    labelScores[entry.track.label] = (labelScores[entry.track.label] || 0) + points;
  });
  return labelScores;
}

function getLabelRanking(limit) {
  const ranking = Object.entries(computeLabelScores())
    .sort((a, b) => b[1] - a[1]);
  return typeof limit === "number" ? ranking.slice(0, limit) : ranking;
}

function renderTopBar() {
  const ranking = getLabelRanking(3);
  const labelsMarkup = ranking.length
    ? ranking.map((row, index) => `
        <div class="top-mini-item">
          <span>${index + 1}. ${renderLabelTag(row[0], (getRivalByName(row[0])?.country || state.label.country))}</span>
          <span class="muted">${row[1]} pts</span>
        </div>
      `).join("")
    : `<div class="muted">No labels yet</div>`;
  const headerList = $("topLabelsHeaderList");
  if (headerList) headerList.innerHTML = labelsMarkup;
  const worldList = $("topLabelsWorldList");
  if (worldList) worldList.innerHTML = labelsMarkup;
  if ($("topActName")) {
    const topAct = getTopActSnapshot();
    $("topActName").textContent = topAct ? `Top Act: ${topAct.name}` : "Top Act: -";
    $("topActPortrait").textContent = topAct ? topAct.initials : "RLS";
    $("topActPortrait").style.background = topAct ? topAct.color : "";
    $("topActPortrait").style.color = topAct ? topAct.textColor : "";
  }
  if ($("topTrendDisplay")) {
    const topTrend = state.trends?.[0];
    $("topTrendDisplay").textContent = topTrend ? `Trend: ${topTrend}` : "Trend: -";
  }
}

function getTopActSnapshot() {
  const entries = state.marketTracks.filter((track) => track.isPlayer && track.actId);
  if (!entries.length) return null;
  const scores = {};
  entries.forEach((track) => {
    const score = track.quality + Math.max(0, 12 - track.weeksOnChart) * 5 + track.promoWeeks * 4;
    scores[track.actId] = (scores[track.actId] || 0) + score;
  });
  const bestId = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!bestId) return null;
  const act = getAct(bestId);
  if (!act) return null;
  const initials = act.name.split(" ").map((part) => part[0]).slice(0, 3).join("").toUpperCase();
  const color = act.alignment ? `linear-gradient(135deg, ${alignmentColor(act.alignment)}, rgba(255,255,255,0.1))` : "";
  const textColor = act.alignment === "Safe" ? "#0b0f14" : "#f4f1ea";
  return { name: act.name, initials, color, textColor };
}

function alignmentColor(alignment) {
  if (alignment === "Safe") return "#ffffff";
  if (alignment === "Risky") return "#111111";
  return "#999999";
}

function populationStageForYear(year) {
  const stage = POPULATION_STAGES.find((entry) => year >= entry.startYear && year < entry.endYear);
  return stage || POPULATION_STAGES[POPULATION_STAGES.length - 1];
}

function yearNoise(year, salt) {
  const x = Math.sin((year + salt) * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function yearlyPopulationRate(year, tier) {
  if (tier === 1) {
    const birth = 0.01 + yearNoise(year, 1) * 0.005;
    const death = 0.0075 + yearNoise(year, 2) * 0.0025;
    return Math.max(0, birth - death);
  }
  if (tier === 2) {
    return -0.002 + yearNoise(year, 3) * 0.006;
  }
  return -0.003 + yearNoise(year, 4) * 0.006;
}

function populationAtYear(year) {
  if (year <= POPULATION_START_YEAR) return POPULATION_START;
  let pop = POPULATION_START;
  let floor = POPULATION_START;
  for (let y = POPULATION_START_YEAR + 1; y <= year; y += 1) {
    const tier = pop >= POPULATION_TIER_2 ? 3 : pop >= POPULATION_TIER_1 ? 2 : 1;
    const rate = yearlyPopulationRate(y, tier);
    const next = Math.round(pop * (1 + rate));
    if (next >= POPULATION_TIER_1) floor = Math.max(floor, POPULATION_TIER_1);
    if (next >= POPULATION_TIER_2) floor = Math.max(floor, POPULATION_TIER_2);
    let min = floor;
    let max = POPULATION_CAP;
    if (y >= 3000) {
      const band = POPULATION_POST3000_BAND;
      min = Math.max(min, Math.round(pop * (1 - band)));
      max = Math.min(max, Math.round(pop * (1 + band)));
    }
    pop = clamp(next, min, max);
  }
  return Math.round(pop / 1000) * 1000;
}

function roundToThousandUp(value) {
  return Math.ceil(value / 1000) * 1000;
}

function normalizeSplit(split) {
  const total = Object.values(split).reduce((sum, value) => sum + value, 0) || 1;
  const normalized = {};
  Object.keys(split).forEach((key) => {
    normalized[key] = split[key] / total;
  });
  return normalized;
}

function campaignEraSplit(stage) {
  if (!state.population) {
    state.population = { snapshot: null, lastUpdateYear: 0, lastUpdateAt: null, campaignSplit: null, campaignSplitStage: null };
  }
  if (state.population.campaignSplit && state.population.campaignSplitStage === stage.id) {
    return state.population.campaignSplit;
  }
  const variance = typeof stage.variancePoints === "number" ? stage.variancePoints : 0.05;
  const base = stage.splits || { Annglora: 0.525, Bytenza: 0.333, Crowlya: 0.142 };
  const seed = stage.startYear || POPULATION_START_YEAR;
  const varied = {};
  NATIONS.forEach((nation, idx) => {
    const noise = yearNoise(seed, idx + 11) * 2 - 1;
    const target = base[nation] || 0;
    varied[nation] = Math.max(0.01, target + noise * variance);
  });
  const normalized = normalizeSplit(varied);
  state.population.campaignSplit = normalized;
  state.population.campaignSplitStage = stage.id;
  return normalized;
}

function populationSplitsForStage(stage) {
  if (stage?.id === "Campaign Era") {
    return campaignEraSplit(stage);
  }
  return stage.splits;
}

function buildPopulationSnapshot(year, totalOverride) {
  const stage = populationStageForYear(year);
  const total = typeof totalOverride === "number" ? totalOverride : populationAtYear(year);
  const splits = populationSplitsForStage(stage);
  const nations = NATIONS.map((nation) => {
    const nationPop = roundToThousandUp(total * splits[nation]);
    const capitalPop = roundToThousandUp(nationPop * REGION_CAPITAL_SHARE);
    const elsewherePop = Math.max(0, nationPop - capitalPop);
    return {
      nation,
      total: nationPop,
      capital: capitalPop,
      elsewhere: elsewherePop
    };
  });
  return { total, stage: stage.id, nations };
}

function refreshPopulationSnapshot(year) {
  if (!state.population) {
    state.population = { snapshot: null, lastUpdateYear: 0, lastUpdateAt: null, campaignSplit: null, campaignSplitStage: null };
  }
  const targetYear = typeof year === "number" ? year : currentYear();
  let total = populationAtYear(targetYear);
  const prev = state.population.snapshot?.total;
  if (typeof prev === "number" && state.population.lastUpdateYear) {
    const step = applyPopulationYear(prev, targetYear, 1, null);
    total = Math.round(step.next / 1000) * 1000;
  }
  state.population.snapshot = buildPopulationSnapshot(targetYear, total);
  state.population.lastUpdateYear = targetYear;
  state.population.lastUpdateAt = state.time.epochMs;
  return state.population.snapshot;
}

function computePopulationSnapshot() {
  if (!state.population) {
    state.population = { snapshot: null, lastUpdateYear: 0, lastUpdateAt: null, campaignSplit: null, campaignSplitStage: null };
  }
  if (!state.population.snapshot) {
    refreshPopulationSnapshot(currentYear());
  }
  return state.population.snapshot;
}

function renderPopulation() {
  if (!$("populationList")) return;
  const snapshot = computePopulationSnapshot();
  const stageLabel = snapshot.stage || "Campaign Era";
  const list = [
    `
      <div class="list-item">
          <div class="list-row">
          <div>
          <div class="item-title">Gaia Population</div>
          <div class="muted">${stageLabel} - updates yearly</div>
          </div>
          <div class="pill">${formatCount(snapshot.total)}</div>
        </div>
      </div>
    `
  ];
  snapshot.nations.forEach((nation) => {
    list.push(`
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${nation.nation}</div>
            <div class="muted">Capital ${formatCount(nation.capital)} | Elsewhere ${formatCount(nation.elsewhere)}</div>
          </div>
          <div class="pill">${formatCount(nation.total)}</div>
        </div>
      </div>
    `);
  });
  $("populationList").innerHTML = list.join("");
}

function renderEconomySummary() {
  if (!$("economySummary")) return;
  const studioMarket = getStudioMarketSnapshot();
  const summary = [
    `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">Weekly Net</div>
            <div class="muted">Revenue ${formatMoney(state.economy.lastRevenue)} | Upkeep ${formatMoney(state.economy.lastUpkeep)}</div>
          </div>
          <div class="pill">${formatMoney(state.economy.lastRevenue - state.economy.lastUpkeep)}</div>
        </div>
      </div>
    `,
    `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">Studio Availability</div>
            <div class="muted">eyeriS ${formatCount(studioMarket.available)} | Rivals ${formatCount(studioMarket.rivals)} | You ${formatCount(studioMarket.player)}</div>
          </div>
          <div class="pill">${formatCount(studioMarket.total)} total</div>
        </div>
      </div>
    `,
    `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">Baseline Prices</div>
            <div class="muted">Digital Single ${formatMoney(ECONOMY_BASELINES.digitalSingle)} | Physical Single ${formatMoney(ECONOMY_BASELINES.physicalSingle)}</div>
          </div>
          <div class="pill">2025</div>
        </div>
      </div>
    `,
    `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">Studio Lease</div>
            <div class="muted">${formatMoney(ECONOMY_BASELINES.studioLease4y)} every 4 years | Build ${formatMoney(ECONOMY_BASELINES.studioBuildCost)}</div>
          </div>
          <div class="pill">eyeriS</div>
        </div>
      </div>
    `
  ];
  $("economySummary").innerHTML = summary.join("");
}

function renderActiveCampaigns() {
  const listEl = $("activeCampaignList");
  if (!listEl) return;
  const active = state.marketTracks.filter((entry) => entry.isPlayer && entry.promoWeeks > 0);
  if (!active.length) {
    listEl.innerHTML = `<div class="muted">No active campaigns.</div>`;
    return;
  }
  listEl.innerHTML = active.map((entry) => {
    const track = entry.trackId ? getTrack(entry.trackId) : null;
    const title = track ? track.title : entry.title;
    return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${title}</div>
            <div class="muted">${entry.genre || "-"}</div>
          </div>
          <div class="pill">${entry.promoWeeks}w</div>
        </div>
      </div>
    `;
  }).join("");
}

function renderWallet() {
  const items = [
    `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${state.label.name}</div>
            <div class="muted">Active funds</div>
          </div>
          <div class="pill">${formatMoney(state.label.cash)}</div>
        </div>
      </div>
    `,
    `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">Last Weekly Report</div>
            <div class="muted">Week ${state.economy.lastWeek || 1}</div>
          </div>
          <div class="pill">${formatMoney(state.economy.lastRevenue)} / ${formatMoney(state.economy.lastUpkeep)}</div>
        </div>
      </div>
    `,
    `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">Audience Reach</div>
            <div class="muted">Active awareness</div>
          </div>
          <div class="pill">${formatCount(state.label.fans)}</div>
        </div>
      </div>
    `
  ];
  const targets = ["walletDetails", "usageLedgerList"];
  targets.forEach((id) => {
    const el = $(id);
    if (el) el.innerHTML = items.join("");
  });
}

function renderQuickRecipes() {
  if (!$("quickRecipesList")) return;
  const recipes = [
    { title: "Songwriting", detail: "Assign Songwriter ID + Theme to draft the sheet music." },
    { title: "Performance", detail: "Assign Performer ID + Mood to craft the demo tone." },
    { title: "Production", detail: "Assign Producer ID to master the track quality." },
    { title: "Release", detail: "Move Ready tracks into Release Desk for scheduling." },
    { title: "Campaigns", detail: "Assign a Released Track ID to the Campaign Slot." }
  ];
  $("quickRecipesList").innerHTML = recipes.map((recipe) => `
    <div class="list-item">
      <div class="item-title">${recipe.title}</div>
      <div class="muted">${recipe.detail}</div>
    </div>
  `).join("");
}

function renderActiveArea() {
  if (!$("activeAreaDisplay")) return;
  const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
  let era = "No active eras";
  if (activeEras.length === 1) {
    const active = activeEras[0];
    era = `${active.name} (${ERA_STAGES[active.stageIndex] || "Active"})`;
  } else if (activeEras.length > 1) {
    const names = activeEras.slice(0, 2).map((entry) => entry.name).join(", ");
    const extra = activeEras.length > 2 ? ` +${activeEras.length - 2}` : "";
    era = `${activeEras.length} active (${names}${extra})`;
  }
  $("activeAreaDisplay").innerHTML = `
    <div class="list-item">
      <div class="list-row">
        <div>
          <div class="item-title">Studios</div>
          <div class="muted">${state.studio.inUse} active / ${state.studio.slots} total</div>
        </div>
        <div class="pill">${state.studio.slots} rooms</div>
      </div>
    </div>
    <div class="list-item">
      <div class="list-row">
        <div>
          <div class="item-title">Active Era</div>
          <div class="muted">${era}</div>
        </div>
      </div>
    </div>
  `;
}

function renderInventory() {
  if (!$("inventoryList")) return;
  const ready = state.tracks.filter((track) => track.status === "Ready" || track.status === "Scheduled");
  if (!ready.length) {
    $("inventoryList").innerHTML = `<div class="muted">No finished content yet.</div>`;
    return;
  }
  $("inventoryList").innerHTML = ready.map((track) => `
    <div class="list-item">
      <div class="list-row">
        <div>
          <div class="item-title">${track.title}</div>
          <div class="muted">Item: Track • ID ${track.id}</div>
          <div class="muted">${track.status} • ${formatGenreKeyLabel(track.genre)}</div>
        </div>
        <div class="pill">${qualityGrade(track.quality)}</div>
      </div>
    </div>
  `).join("");
}

function renderCalendarList(targetId, weeks) {
  const target = $(targetId);
  if (!target) return;
  const tab = state.ui.calendarTab || "label";
  const filters = state.ui.calendarFilters || {};
  document.querySelectorAll("[data-calendar-tab]").forEach((btn) => {
    if (!btn.dataset.calendarTab) return;
    btn.classList.toggle("active", btn.dataset.calendarTab === tab);
  });
  document.querySelectorAll("[data-calendar-filter]").forEach((input) => {
    const key = input.dataset.calendarFilter;
    if (!key || typeof filters[key] !== "boolean") return;
    input.checked = filters[key] !== false;
  });
  if (tab === "eras") {
    const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
    if (!activeEras.length) {
      target.innerHTML = `<div class="muted">No active eras on the calendar.</div>`;
      return;
    }
    target.innerHTML = activeEras.map((era) => {
      const act = getAct(era.actId);
      const stageName = ERA_STAGES[era.stageIndex] || "Active";
      const content = era.contentTypes?.length ? era.contentTypes.join(", ") : "Unassigned";
      return `
        <div class="list-item">
          <div class="item-title">${era.name}</div>
          <div class="muted">Act: ${act ? act.name : "Unknown"} | Stage: ${stageName}</div>
          <div class="muted">Started Week ${era.startedWeek} | Content: ${content}</div>
        </div>
      `;
    }).join("");
    return;
  }

  const now = state.time.epochMs;
  const showLabel = tab === "label" || tab === "public";
  const showRivals = tab === "public";
  const list = [];

  for (let i = 0; i < weeks; i += 1) {
    const start = now + i * WEEK_HOURS * HOUR_MS;
    const end = start + WEEK_HOURS * HOUR_MS;
    const entries = [];

    if (showLabel && filters.labelScheduled) {
      state.releaseQueue
        .filter((entry) => entry.releaseAt >= start && entry.releaseAt < end)
        .forEach((entry) => {
          const track = getTrack(entry.trackId);
          const act = track ? getAct(track.actId) : null;
          entries.push({
            ts: entry.releaseAt,
            title: track ? track.title : "Unknown Track",
            actName: act ? act.name : "Unknown",
            label: state.label.name,
            type: "Scheduled",
            distribution: entry.distribution || entry.note || "Digital"
          });
        });
    }

    if (showLabel && filters.labelReleased) {
      state.marketTracks
        .filter((entry) => entry.isPlayer && entry.releasedAt >= start && entry.releasedAt < end)
        .forEach((entry) => {
          entries.push({
            ts: entry.releasedAt,
            title: entry.title,
            actName: entry.actName || "Unknown",
            label: entry.label,
            type: "Released",
            distribution: entry.distribution || "Digital"
          });
        });
    }

    if (showRivals && filters.rivalScheduled) {
      state.rivalReleaseQueue
        .filter((entry) => entry.releaseAt >= start && entry.releaseAt < end)
        .forEach((entry) => {
          entries.push({
            ts: entry.releaseAt,
            title: entry.title,
            actName: entry.actName || "Unknown",
            label: entry.label,
            type: "Rival Scheduled",
            distribution: entry.distribution || "Digital"
          });
        });
    }

    if (showRivals && filters.rivalReleased) {
      state.marketTracks
        .filter((entry) => !entry.isPlayer && entry.releasedAt >= start && entry.releasedAt < end)
        .forEach((entry) => {
          entries.push({
            ts: entry.releasedAt,
            title: entry.title,
            actName: entry.actName || "Unknown",
            label: entry.label,
            type: "Rival Released",
            distribution: entry.distribution || "Digital"
          });
        });
    }

    entries.sort((a, b) => a.ts - b.ts);
    const weekLabel = `Week ${weekIndex() + 1 + i}`;
    list.push(`
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${weekLabel}</div>
            <div class="muted">${formatDate(start)} - ${formatDate(end - HOUR_MS)}</div>
          </div>
          <div class="pill">${entries.length} event(s)</div>
        </div>
        ${entries.map((entry) => `
          <div class="muted">${entry.label} | ${entry.actName} | ${entry.title} (${entry.type}, ${entry.distribution})</div>
        `).join("")}
      </div>
    `);
  }
  target.innerHTML = list.join("");
}

function renderActs() {
  if (!state.acts.length) {
    $("actList").innerHTML = `<div class="muted">No acts yet.</div>`;
    return;
  }
  const list = state.acts.map((act) => {
    const members = act.memberIds
      .map((id) => {
        const creator = getCreator(id);
        return creator ? creator.name : "Unknown";
      })
      .join(", ");
    const inputId = `act-rename-${act.id}`;
    return `
      <div class="list-item" data-entity-type="act" data-entity-id="${act.id}" data-entity-name="${act.name}" draggable="true">
          <div class="list-row">
            <div>
              <div class="item-title">${act.name}</div>
              <div class="muted">ID ${act.id} | ${act.type}</div>
              <div class="muted">${renderAlignmentTag(act.alignment)}</div>
            </div>
            <button type="button" class="ghost" data-act-set="${act.id}">Assign</button>
          </div>
        <div class="muted">Members: ${members || "None"}</div>
        <div class="field">
          <label for="${inputId}">Rename Act</label>
          <input id="${inputId}" type="text" value="${act.name}" data-act-input="${act.id}" aria-label="Rename act ${act.name}">
        </div>
        <div class="actions">
          <button type="button" class="ghost" data-act-rename="${act.id}">Save Name</button>
        </div>
      </div>
    `;
  });
  $("actList").innerHTML = list.join("");
}

  function renderCreators() {
    const busyIds = new Set(state.workOrders.filter((o) => o.status === "In Progress").map((o) => o.creatorId));
    const list = state.creators.map((creator) => {
      const busy = busyIds.has(creator.id);
      const staminaPct = Math.round((creator.stamina / STAMINA_MAX) * 100);
    const themeCells = creator.prefThemes.map((theme) => renderThemeTag(theme)).join("");
    const moodCells = creator.prefMoods.map((mood) => renderMoodTag(mood)).join("");
    const memberships = state.acts.filter((act) => act.memberIds.includes(creator.id)).map((act) => act.name);
    const actText = memberships.length ? memberships.join(", ") : "No Act";
    return `
      <div class="list-item" data-entity-type="creator" data-entity-id="${creator.id}" data-entity-name="${creator.name}" draggable="true">
          <div class="list-row">
            <div>
              <div class="item-title">${creator.name}</div>
              <div class="muted">ID ${creator.id} | ${creator.role} | Skill ${creator.skill}</div>
              <div class="muted">Acts: ${actText}</div>
              <div class="muted">Preferred Themes:</div>
            <div class="time-row">${themeCells}</div>
            <div class="muted">Preferred Moods:</div>
            <div class="time-row">${moodCells}</div>
          </div>
          <div class="pill">${busy ? "Busy" : "Ready"}</div>
        </div>
          <div class="bar"><span style="width:${staminaPct}%"></span></div>
          <div class="muted">Stamina ${creator.stamina} / ${STAMINA_MAX}</div>
        </div>
      `;
    });
  $("creatorList").innerHTML = list.length ? list.join("") : `<div class="muted">No creators signed.</div>`;
}

function renderMarket() {
  const listEl = $("marketList");
  if (!listEl) return;
  const list = state.marketCreators.map((creator) => `
    <div class="list-item">
      <div class="list-row">
        <div>
          <div class="item-title">${creator.name}</div>
          <div class="muted">ID ${creator.id} | ${creator.role} | Skill ${creator.skill}</div>
        </div>
        <button type="button" data-sign="${creator.id}">Sign ${formatMoney(creator.signCost || 0)}</button>
      </div>
    </div>
  `);
  listEl.innerHTML = list.length ? list.join("") : `<div class="muted">No Creator IDs available.</div>`;
}

function renderWorkOrders() {
  const listEl = $("workOrderList");
  if (!listEl) return;
  if (!state.workOrders.length) {
    listEl.innerHTML = `<div class="muted">No active work orders.</div>`;
    return;
  }
  const now = state.time.epochMs;
  const list = state.workOrders.map((order) => {
    const track = getTrack(order.trackId);
    const creator = getCreator(order.creatorId);
    const stage = STAGES[order.stageIndex];
    const hoursLeft = order.status === "In Progress" ? Math.max(0, Math.ceil((order.endAt - now) / HOUR_MS)) : "Queued";
    return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${track ? track.title : "Unknown"}</div>
            <div class="muted">${stage.name} | ${creator ? creator.name : "Unassigned"}</div>
          </div>
          <div class="pill">${hoursLeft}h</div>
        </div>
      </div>
    `;
  });
  listEl.innerHTML = list.join("");
}

function renderTracks() {
  if (!state.tracks.length) {
    $("trackList").innerHTML = `<div class="muted">No tracks in catalog.</div>`;
    return;
  }
  const focusEra = getFocusedEra();
  const list = state.tracks.map((track) => {
    const stageName = track.status === "In Production" ? STAGES[Math.min(track.stageIndex, STAGES.length - 1)].name : track.status;
    const grade = qualityGrade(track.quality);
    const act = getAct(track.actId);
    const project = track.projectName || `${track.title} - Single`;
    const projectType = track.projectType || "Single";
    const themeTag = renderThemeTag(track.theme);
    const alignTag = renderAlignmentTag(track.alignment);
      const era = track.eraId ? getEraById(track.eraId) : null;
      const eraName = era ? era.name : null;
      const focusSuffix = focusEra && era && focusEra.id === era.id ? " | Focus" : "";
      const modifierName = track.modifier ? track.modifier.label : "None";
      return `
      <div class="list-item" data-entity-type="track" data-entity-id="${track.id}" data-entity-name="${track.title}" draggable="true">
        <div class="list-row">
            <div>
              <div class="item-title">${track.title}</div>
              <div class="muted">ID ${track.id} | Item: Track</div>
              <div class="muted">${track.genre}</div>
              <div class="muted">${themeTag} ${alignTag}</div>
            <div class="muted">Act: ${act ? act.name : "Unassigned"} | Project: ${project} (${projectType})</div>
            <div class="muted">Distribution: ${track.distribution || "Digital"}</div>
          </div>
          <div class="badge">${grade}</div>
        </div>
        <div class="muted">Status: ${stageName} | Quality ${track.quality}${eraName ? ` | Era: ${eraName}${focusSuffix}` : ""}</div>
      </div>
    `;
  });
  $("trackList").innerHTML = list.join("");
}

function renderEraStatus() {
  const eraBox = $("eraStatus");
  if (!eraBox) return;
  renderFocusEraStatus();
  const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
  const focusEra = getFocusedEra();
  if (!activeEras.length) {
    eraBox.innerHTML = `<div class="muted">No active Eras. Start one or schedule a release.</div>`;
    return;
  }
  eraBox.innerHTML = activeEras.map((era) => {
    const act = getAct(era.actId);
    const stageName = ERA_STAGES[era.stageIndex] || "Complete";
    const stageWeeks = era.rolloutWeeks || ROLLOUT_PRESETS[1].weeks;
    const stageTotal = stageWeeks[era.stageIndex] || 0;
    const stageProgress = `${era.stageWeek}/${stageTotal} weeks`;
    const content = era.contentTypes?.length ? era.contentTypes.join(", ") : "Unassigned";
    const isFocused = focusEra && focusEra.id === era.id;
    return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${era.name}</div>
            <div class="muted">Act: ${act ? act.name : "Unknown"}</div>
            <div class="muted">Stage: ${stageName} | ${stageProgress}</div>
            <div class="muted">Status: ${era.status} | Started Week ${era.startedWeek}</div>
            <div class="muted">Content: ${content}</div>
          </div>
          <div class="actions">
            ${isFocused ? `<span class="pill">Focused</span>` : `<button type="button" class="ghost mini" data-era-focus="${era.id}">Focus</button>`}
            <button type="button" class="ghost mini" data-era-end="${era.id}">End Era</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderReleaseDesk() {
  const readyTracks = state.tracks.filter((track) => track.status === "Ready");
  const readyHtml = readyTracks.length
    ? readyTracks.map((track) => {
      const act = getAct(track.actId);
      const project = track.projectName || `${track.title} - Single`;
      const projectType = track.projectType || "Single";
      const themeTag = renderThemeTag(track.theme);
      const alignTag = renderAlignmentTag(track.alignment);
      const modifierName = track.modifier ? track.modifier.label : "None";
      const rec = recommendReleasePlan(track);
      const recLabel = `${rec.distribution} ${rec.scheduleKey === "now" ? "now" : rec.scheduleKey === "fortnight" ? "+14d" : "+7d"}`;
      return `
        <div class="list-item">
          <div class="list-row">
            <div>
              <div class="item-title">${track.title}</div>
              <div class="muted">${track.genre} | ${qualityGrade(track.quality)}</div>
              <div class="muted">${themeTag} ${alignTag}</div>
              <div class="muted">Act: ${act ? act.name : "Unassigned"} | Project: ${project} (${projectType})</div>
              <div class="muted">Modifier: ${modifierName}</div>
              <div class="muted">Recommended: ${recLabel} - ${rec.reason}</div>
            </div>
            <div class="time-row">
              <button type="button" data-release="now" data-track="${track.id}">Release</button>
              <button type="button" class="ghost" data-release="week" data-track="${track.id}">+7d</button>
              <button type="button" class="ghost" data-release="fortnight" data-track="${track.id}">+14d</button>
              <button type="button" class="ghost" data-release="recommend" data-track="${track.id}">Use Recommended</button>
            </div>
          </div>
        </div>
      `;
    }).join("")
    : `<div class="muted">No ready tracks.</div>`;
  $("readyList").innerHTML = readyHtml;

  if (!state.releaseQueue.length) {
    $("releaseQueueList").innerHTML = `<div class="muted">No scheduled releases.</div>`;
    return;
  }
  const queue = state.releaseQueue.map((entry) => {
    const track = getTrack(entry.trackId);
    const date = formatDate(entry.releaseAt);
    const act = track ? getAct(track.actId) : null;
    const project = track ? (track.projectName || `${track.title} - Single`) : "Unknown";
    const projectType = track?.projectType || "Single";
    const distribution = entry.distribution || entry.note || "Digital";
    return `
      <div class="list-item">
        <div class="item-title">${track ? track.title : "Unknown"}</div>
        <div class="muted">${date} | ${distribution}</div>
        <div class="muted">Act: ${track ? (act ? act.name : "Unassigned") : "Unknown"} | Project: ${project} (${projectType})</div>
      </div>
    `;
  });
  $("releaseQueueList").innerHTML = queue.join("");
}

function renderTrends() {
  const listEl = $("trendList");
  if (!listEl) return;
  const list = state.trends.map((trend, index) => {
    const theme = themeFromGenre(trend);
    const mood = moodFromGenre(trend);
    return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">#${index + 1} ${formatGenreKeyLabel(trend)}</div>
            <div class="time-row">${renderThemeTag(theme)} ${renderMoodLabel(mood)}</div>
          </div>
          <div class="badge warn">Hot</div>
        </div>
      </div>
    `;
  });
  listEl.innerHTML = list.join("");
}

function renderGenreIndex() {
  const themeFilter = state.ui.genreTheme || "All";
  const moodFilter = state.ui.genreMood || "All";
  const list = [];
  THEMES.forEach((theme) => {
    if (themeFilter !== "All" && theme !== themeFilter) return;
    MOODS.forEach((mood) => {
      if (moodFilter !== "All" && mood !== moodFilter) return;
      const genre = makeGenre(theme, mood);
      const label = formatGenreLabel(theme, mood);
      const hot = state.trends.includes(genre);
      list.push(`
        <div class="list-item">
          <div class="list-row">
            <div>
              <div class="item-title">${label}</div>
              <div class="muted">${genre}</div>
              <div class="muted">${renderThemeTag(theme)}</div>
            </div>
            ${hot ? `<div class="badge warn">Hot</div>` : `<div class="pill">Catalog</div>`}
          </div>
        </div>
      `);
    });
  });
  $("genreList").innerHTML = list.length ? list.join("") : `<div class="muted">No genres match the filters.</div>`;
}

function renderCharts() {
  document.querySelectorAll("#chartTabs .tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.chart === state.ui.activeChart);
  });
  let entries = [];
  let size = CHART_SIZES.global;
  let scopeLabel = "Global (Gaia)";
  let scopeKey = "global";
  if (state.ui.activeChart === "global") {
    entries = state.charts.global;
    size = CHART_SIZES.global;
    scopeLabel = "Global (Gaia)";
    scopeKey = "global";
  } else if (NATIONS.includes(state.ui.activeChart)) {
    entries = state.charts.nations[state.ui.activeChart] || [];
    size = CHART_SIZES.nation;
    scopeLabel = state.ui.activeChart;
    scopeKey = `nation:${state.ui.activeChart}`;
  } else {
    entries = state.charts.regions[state.ui.activeChart] || [];
    size = CHART_SIZES.region;
    const region = REGION_DEFS.find((r) => r.id === state.ui.activeChart);
    scopeLabel = region ? region.label : state.ui.activeChart;
    scopeKey = `region:${state.ui.activeChart}`;
  }

  const historyWeek = state.ui.chartHistoryWeek;
  const historySnapshot = state.ui.chartHistorySnapshot;
  let historyMissing = false;
  if (historyWeek) {
    if (historySnapshot && historySnapshot.week === historyWeek && historySnapshot.scope === scopeKey) {
      entries = historySnapshot.entries || [];
    } else {
      entries = [];
      historyMissing = true;
    }
  }
  entries = Array.isArray(entries) ? entries : [];

  const weekLabel = formatWeekRangeLabel(historyWeek || (weekIndex() + 1));
  if ($("chartWeekRange")) $("chartWeekRange").textContent = weekLabel;
  if ($("chartHistoryNotice")) {
    if (historyWeek && historyMissing) {
      $("chartHistoryNotice").textContent = "History view: no snapshot available for this week.";
    } else if (historyWeek) {
      $("chartHistoryNotice").textContent = `History view: ${weekLabel}`;
    } else {
      $("chartHistoryNotice").textContent = "";
    }
  }

  const meta = $("chartMeta");
  if (meta) {
    meta.textContent = `Top ${size} | ${scopeLabel} | Weights S ${CHART_WEIGHTS.sales * 100}% / Stream ${CHART_WEIGHTS.streaming * 100}% / Air ${CHART_WEIGHTS.airplay * 100}% / Social ${CHART_WEIGHTS.social * 100}%`;
  }

  const globalLocked = state.ui.activeChart === "global" && entries.length < size;
  if (historyMissing) {
    $("chartList").innerHTML = `<div class="muted">No saved chart history for this week and scope.</div>`;
  } else if (globalLocked) {
    const remaining = Math.max(0, size - entries.length);
    $("chartList").innerHTML = `<div class="muted">Global chart unlocks when ${formatCount(size)} tracks are in circulation. ${formatCount(remaining)} more needed.</div>`;
  } else if (!entries.length) {
    $("chartList").innerHTML = `<div class="muted">No chart data yet.</div>`;
  } else {
    const rows = entries.map((entry) => {
      const track = entry.track || entry;
      const labelTag = renderLabelTag(track.label, track.country || "Annglora");
      const alignTag = renderAlignmentTag(track.alignment);
      const actName = track.actName || "-";
      const projectName = track.projectName || "-";
      const lastRank = entry.lastRank ? `LW ${entry.lastRank}` : "LW --";
      const peak = entry.peak ? `Peak ${entry.peak}` : "Peak --";
      const woc = entry.woc ? `WOC ${entry.woc}` : "WOC 0";
      const metrics = entry.metrics || {};
      return `
        <tr>
          <td class="chart-rank">#${entry.rank}</td>
          <td class="chart-title">
            <div class="item-title">${track.title}</div>
            <div class="muted">${track.genre}</div>
          </td>
          <td class="chart-label">${labelTag}</td>
          <td class="chart-act">
            <div>${actName}</div>
            <div class="muted">${projectName}</div>
          </td>
          <td class="chart-align">${alignTag}</td>
          <td class="chart-metrics">
            <div class="muted">${lastRank} | ${peak} | ${woc}</div>
            <div class="muted">Sales ${formatCount(metrics.sales || 0)} | Stream ${formatCount(metrics.streaming || 0)}</div>
            <div class="muted">Air ${formatCount(metrics.airplay || 0)} | Social ${formatCount(metrics.social || 0)}</div>
          </td>
          <td class="chart-score">${entry.score}</td>
        </tr>
      `;
    });

    if (entries.length < size) {
      for (let i = entries.length + 1; i <= size; i += 1) {
        rows.push(`
          <tr class="chart-empty">
            <td class="chart-rank">#${i}</td>
            <td class="chart-title">
              <div class="item-title">N/A</div>
              <div class="muted">N/A</div>
            </td>
            <td class="chart-label"><span class="muted">N/A</span></td>
            <td class="chart-act">
              <div>N/A</div>
              <div class="muted">N/A</div>
            </td>
            <td class="chart-align"><span class="muted">N/A</span></td>
            <td class="chart-metrics">
              <div class="muted">LW -- | Peak -- | WOC 0</div>
              <div class="muted">Sales N/A | Stream N/A</div>
              <div class="muted">Air N/A | Social N/A</div>
            </td>
            <td class="chart-score">N/A</td>
          </tr>
        `);
      }
    }
    const rowMarkup = rows.join("");
    $("chartList").innerHTML = `
      <div class="chart-table-wrap">
        <table class="chart-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Track</th>
              <th>Label</th>
              <th>Act / Project</th>
              <th>Alignment</th>
              <th>Stats</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            ${rowMarkup}
          </tbody>
        </table>
      </div>
    `;
  }

  const ranking = getLabelRanking(3);
  $("labelRankings").innerHTML = ranking.length
    ? ranking.map((row, index) => {
      const rival = getRivalByName(row[0]);
      const country = rival ? rival.country : state.label.country || "Annglora";
      return `
        <div class="list-item">
          <div class="list-row">
            <div>
              <div class="item-title">${index + 1}. ${renderLabelTag(row[0], country)}</div>
            </div>
            <div class="pill">${row[1]} pts</div>
          </div>
        </div>
      `;
    }).join("")
    : "";
}

function renderAchievements() {
  const listEl = $("achievementList");
  const summaryEl = $("achievementSummary");
  if (!listEl) return;
  const unlocked = new Set(state.meta.achievementsUnlocked || []);
  const rankIds = new Set(["REQ-01", "REQ-02", "REQ-03"]);
  listEl.innerHTML = ACHIEVEMENTS.map((achievement) => {
    const done = unlocked.has(achievement.id);
    const badgeClass = done ? "badge" : "badge warn";
    let progressText = "";
    if (typeof achievement.progress === "function" && typeof achievement.target !== "undefined") {
      const value = achievement.progress();
      if (rankIds.has(achievement.id)) {
        const best = value === null ? "--" : value;
        progressText = `Best #${best} / Target #${achievement.target}`;
      } else if (achievement.id === "REQ-08") {
        progressText = `Reach ${value.toFixed(2)}% / ${achievement.target}%`;
      } else if (achievement.id === "REQ-04") {
        progressText = `Best Q ${value} / ${achievement.target}`;
      } else if (achievement.id === "REQ-11") {
        progressText = `Net ${formatMoney(value)} / ${formatMoney(achievement.target)}`;
      } else {
        progressText = `${formatCount(value)} / ${formatCount(achievement.target)}`;
      }
    }
    return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${achievement.id} ${achievement.label}</div>
            <div class="muted">${achievement.desc}</div>
          </div>
          <div class="${badgeClass}">${done ? "Done" : "Active"}</div>
        </div>
        <div class="muted">${progressText} | Reward ${formatCount(achievement.exp)} EXP</div>
      </div>
    `;
  }).join("");
  if (summaryEl) {
    const count = Math.max(unlocked.size, state.meta.achievements || 0);
    const lock = state.meta.achievementsLocked ? "Achievements locked after bailout." : "";
    summaryEl.textContent = `CEO Requests ${count} / ${ACHIEVEMENT_TARGET}${lock ? ` | ${lock}` : ""}`;
  }
}

function renderQuests() {
  renderAchievements();
  if (!state.quests.length) {
    $("questList").innerHTML = `<div class="muted">No active quests.</div>`;
    return;
  }
  const list = state.quests.map((quest) => {
    let detail = "";
    if (quest.type === "releaseCount") detail = `${quest.progress}/${quest.target} released`;
    if (quest.type === "trendRelease") detail = `${quest.progress}/${quest.target} released`;
    if (quest.type === "countryTop") detail = quest.bestRank ? `Best rank #${quest.bestRank}` : "No chart entries";
    if (quest.type === "cash") detail = `${formatMoney(quest.progress)} / ${formatMoney(quest.target)}`;
    const badgeClass = quest.done ? "badge" : "badge warn";
    const expReward = Math.round(quest.expReward ?? (quest.reward / 8));
    return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${quest.id}</div>
            <div class="muted">${quest.text}</div>
            <div class="muted">${quest.story}</div>
          </div>
          <div class="${badgeClass}">${quest.done ? "Done" : "Active"}</div>
        </div>
        <div class="muted">${detail} | Reward ${formatMoney(quest.reward)} + ${formatCount(expReward)} EXP</div>
      </div>
    `;
  });
  $("questList").innerHTML = list.join("");
}

function renderSocialFeed() {
  const listEl = $("socialFeed");
  if (!listEl) return;
  const showInternal = state.ui.socialShowInternal !== false;
  const filters = state.ui.socialFilters || {};
  const posts = [];

  if (showInternal) {
    state.events.forEach((entry) => {
      posts.push({
        id: `LOG-${entry.ts}`,
        ts: entry.ts,
        handle: "@System",
        title: entry.text,
        lines: [],
        type: "system",
        order: 3
      });
    });
  }

  (state.social?.posts || []).forEach((post) => {
    posts.push({ ...post, order: post.order || 0 });
  });

  const filtered = posts.filter((post) => {
    const type = post.type || "system";
    return filters[type] !== false;
  });

  filtered.sort((a, b) => (b.ts - a.ts) || (a.order - b.order));

  if (!filtered.length) {
    listEl.innerHTML = `<div class="muted">No eyeriSocial posts yet.</div>`;
    return;
  }

  const summarize = (value) => {
    if (!value) return "";
    const text = String(value).replace(/\s+/g, " ").trim();
    return text.length > 120 ? `${text.slice(0, 120)}...` : text;
  };

  listEl.innerHTML = filtered.map((post) => {
    const handle = post.handle || "@Gaia";
    const title = post.title || post.text || "Update";
    const fullLines = post.lines?.length ? post.lines : (post.text && post.title ? [post.text] : []);
    const emailTypes = ["quest", "contract", "receipt"];
    const preview = emailTypes.includes(post.type) ? "" : summarize(fullLines[0] || "");
    return `
      <div class="list-item social-item" data-post-id="${post.id}">
        <div class="list-row">
          <div>
            <div class="item-title">${title}</div>
            <div class="muted">${handle} | ${formatDate(post.ts)}</div>
            ${preview ? `<div class="muted">${preview}</div>` : ""}
          </div>
          <div class="pill">${post.type || "system"}</div>
        </div>
      </div>
    `;
  }).join("");

  const toggle = $("socialShowInternal");
  if (toggle) toggle.checked = Boolean(showInternal);
  document.querySelectorAll("[data-social-filter]").forEach((input) => {
    const key = input.dataset.socialFilter;
    if (!key) return;
    input.checked = filters[key] !== false;
  });
}

function renderEventLog() {
  renderSocialFeed();
  renderSystemLog();
}

function renderSystemLog() {
  const target = $("eventLogList");
  if (!target) return;
  if (!state.events.length) {
    target.innerHTML = `<div class="muted">No system updates yet.</div>`;
    return;
  }
  target.innerHTML = state.events.slice(0, 80).map((entry) => {
    const time = formatDate(entry.ts);
    return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${entry.kind?.toUpperCase() || "INFO"}</div>
            <div class="muted">${time}</div>
          </div>
        </div>
        <div class="muted">${entry.text}</div>
      </div>
    `;
  }).join("");
}

function renderMainMenu() {
  const list = [];
  for (let i = 1; i <= SLOT_COUNT; i += 1) {
    const data = getSlotData(i);
    const hasData = Boolean(data);
    const labelName = data?.label?.name || "Empty Game Slot";
    const savedAt = data?.meta?.savedAt ? new Date(data.meta.savedAt).toLocaleString() : "Never saved";
    const hours = data?.time?.totalHours || 0;
    const week = Math.floor(hours / WEEK_HOURS) + 1;
    const cash = data?.label?.cash ?? 0;
    list.push(`
      <div class="slot-card" data-slot-index="${i}" data-slot-has-data="${hasData ? "1" : "0"}" data-slot-default="${hasData ? "continue" : "new"}">
        <div class="slot-row">
          <div>
            <div class="item-title">Game Slot ${i}: ${data ? labelName : "Empty"}</div>
            <div class="muted">${data ? `Week ${week} | ${formatMoney(cash)} | ${savedAt}` : "Start a new label in this game slot."}</div>
          </div>
          <div class="actions">
            <button type="button" data-slot-action="continue" data-slot-index="${i}" ${hasData ? "" : "disabled"}>Continue</button>
            <button type="button" class="ghost" data-slot-action="new" data-slot-index="${i}">Create New</button>
            ${hasData ? `<button type="button" class="ghost" data-slot-action="delete" data-slot-index="${i}">Delete</button>` : ""}
          </div>
        </div>
      </div>
    `);
  }
  $("slotList").innerHTML = list.join("");
  const closeBtn = $("menuCloseBtn");
  if (closeBtn) {
    closeBtn.disabled = !session.activeSlot;
  }
  const saveBtn = $("menuSaveBtn");
  if (saveBtn) {
    saveBtn.disabled = !session.activeSlot;
  }
  const autoSaveMinutes = $("autoSaveMinutes");
  const autoSaveToggle = $("autoSaveToggle");
  if (autoSaveMinutes && autoSaveToggle) {
    const options = [];
    for (let i = 2; i <= 10; i += 1) {
      options.push(`<option value="${i}">${i} min</option>`);
    }
    autoSaveMinutes.innerHTML = options.join("");
    autoSaveMinutes.value = String(state.meta.autoSave.minutes || 5);
    autoSaveToggle.checked = Boolean(state.meta.autoSave.enabled);
    const disabled = !session.activeSlot;
    autoSaveMinutes.disabled = disabled;
    autoSaveToggle.disabled = disabled;
  }
}

function openMainMenu() {
  document.body.classList.add("menu-open");
  if (state.time.speed !== "pause") {
    session.prevSpeed = state.time.speed;
  }
  setTimeSpeed("pause");
  renderMainMenu();
}

function closeMainMenu() {
  document.body.classList.remove("menu-open");
  if (session.prevSpeed) {
    setTimeSpeed(session.prevSpeed);
    session.prevSpeed = null;
  }
}

function setTimeSpeed(nextSpeed) {
  const speed = nextSpeed === "pause" || nextSpeed === "play" || nextSpeed === "fast" ? nextSpeed : "pause";
  const changed = state.time.speed !== speed;
  state.time.speed = speed;
  if (typeof window !== "undefined" && window.updateTimeControls) {
    window.updateTimeControls();
  }
  if (changed) saveToActiveSlot();
}

let gameLoopStarted = false;
function startGameLoop() {
  if (gameLoopStarted) return;
  gameLoopStarted = true;
  requestAnimationFrame(tick);
}

function updateGenrePreview() {
  const themeSelect = $("themeSelect");
  const moodSelect = $("moodSelect");
  if (!themeSelect || !moodSelect) return;
  const theme = themeSelect.value;
  const mood = moodSelect.value;
  if (!theme || !mood) {
    $("genrePreview").textContent = "Genre: -";
    return;
  }
  $("genrePreview").textContent = `Genre: ${formatGenreLabel(theme, mood)}`;
}

function renderActiveView(view) {
  const raw = view || state.ui.activeView || "charts";
  const active = raw === "promotion" || raw === "era" ? "eras" : raw;
  if (active === "charts") {
    renderCharts();
    renderReleaseDesk();
    renderSlots();
  } else if (active === "create") {
    renderSlots();
    renderTracks();
    renderGenreIndex();
    updateGenrePreview();
  } else if (active === "releases") {
    renderReleaseDesk();
    renderTracks();
    renderSlots();
  } else if (active === "eras") {
    renderEraStatus();
    renderSlots();
    renderCalendarList("calendarList", 4);
    renderTracks();
  } else if (active === "roster") {
    renderCreators();
    renderActs();
    renderSlots();
  } else if (active === "world") {
    renderMarket();
    renderTrends();
    renderTopBar();
  } else if (active === "logs") {
    renderEventLog();
    renderWallet();
  }
}

function renderAll() {
  renderTime();
  renderStats();
  renderTopBar();
  renderActiveView(state.ui.activeView);
  renderWallet();
  if (typeof window !== "undefined" && window.updateTimeControls) {
    window.updateTimeControls();
  }
  if (typeof window !== "undefined" && window.updateRecommendations) {
    window.updateRecommendations();
  }
  saveToActiveSlot();
}

export {
  session,
  state,
  $,
  clamp,
  formatMoney,
  formatCount,
  formatDate,
  openOverlay,
  closeOverlay,
  logEvent,
  makeTrackTitle,
  makeProjectTitle,
  makeLabelName,
  makeActName,
  makeEraName,
  handleFromName,
  makeAct,
  createTrack,
  getModifier,
  getAct,
  getCreator,
  getTrack,
  getStudioAvailableSlots,
  getEraById,
  getActiveEras,
  getFocusedEra,
  setFocusEraById,
  startEraForAct,
  endEraById,
  pickDistinct,
  uid,
  weekIndex,
  normalizeCreator,
  postCreatorSigned,
  renderAll,
  renderStats,
  renderSlots,
  renderActs,
  renderCreators,
  renderTracks,
  renderReleaseDesk,
  renderEraStatus,
  renderWallet,
  renderActiveCampaigns,
  renderQuickRecipes,
  renderCalendarList,
  renderGenreIndex,
  renderCharts,
  renderSocialFeed,
  renderMainMenu,
  updateGenrePreview,
  formatWeekRangeLabel,
  renderAutoAssignModal,
  rankCandidates,
  recommendTrackPlan,
  recommendReleasePlan,
  recommendProjectType,
  assignToSlot,
  clearSlot,
  getSlotElement,
  describeSlot,
  setSlotTarget,
  updateActMemberFields,
  advanceHours,
  releaseTrack,
  scheduleRelease,
  acceptBailout,
  declineBailout,
  refreshSelectOptions,
  computeCharts,
  buildMarketCreators,
  startGameLoop,
  setTimeSpeed,
  openMainMenu,
  closeMainMenu,
  saveToActiveSlot,
  getSlotData,
  loadSlot,
  resetState,
  deleteSlot
};
