// @ts-nocheck
import { ACT_PROMO_WARNING_WEEKS, ACHIEVEMENTS, ACHIEVEMENT_TARGET, CREATOR_FALLBACK_EMOJI, CREATOR_FALLBACK_ICON, DAY_MS, DEFAULT_TRACK_SLOT_VISIBLE, MARKET_ROLES, QUARTERS_PER_HOUR, RESOURCE_TICK_LEDGER_LIMIT, ROLE_ACTIONS, ROLE_ACTION_STATUS, STAGE_STUDIO_LIMIT, STAMINA_OVERUSE_LIMIT, STUDIO_COLUMN_SLOT_COUNT, TRACK_ROLE_KEYS, TRACK_ROLE_TARGETS, TREND_DETAIL_COUNT, UI_REACT_ISLANDS_ENABLED, UNASSIGNED_CREATOR_EMOJI, UNASSIGNED_CREATOR_LABEL, UNASSIGNED_SLOT_LABEL, WEEKLY_SCHEDULE, alignmentClass, annualAwardNomineeRevealAt, buildAnnualAwardNomineesFromLedger, buildCalendarProjection, buildLabelAchievementProgress, buildPromoProjectKeyFromTrack, buildStudioEntries, buildTrackHistoryScopes, chartScopeLabel, chartWeightsForScope, clamp, collectTrendRanking, commitSlotChange, computeAudienceEngagementRate, computeAudienceWeeklyBudget, computeAudienceWeeklyHours, computeChartProjectionForScope, computeCreatorCatharsisScore, getCreatorCatharsisInactivityStatus, computePopulationSnapshot, computeTourDraftSummary, computeTourProjection, estimateCreatorMaxConsecutiveTourDates, estimateTourDateStaminaShare, countryColor, countryDemonym, creatorInitials, currentYear, ensureMarketCreators, ensureTrackSlotArrays, ensureTrackSlotVisibility, formatCompactDateRange, formatCount, formatDate, formatHourCountdown, formatGenreKeyLabel, formatMoney, formatShortDate, formatWeekRangeLabel, getAct, hasHangulText, lookupActNameDetails, getActPopularityLeaderboard, getActiveEras, getAudienceChunksSnapshot, getBusyCreatorIds, getCommunityLabelRankingLimit, getCommunityTrendRankingLimit, getCreator, getCreatorPortraitUrl, getCreatorSignLockout, getCreatorStaminaSpentToday, getEraById, getFocusedEra, getGameDifficulty, getGameMode, getLabelRanking, getLatestActiveEraForAct, getModifier, getModifierInventoryCount, getProjectTrackLimits, getTourVenueAvailability, getOwnedStudioSlots, getReleaseAsapAt, getReleaseDistributionFee, getRivalByName, getRolloutPlanningEra, getRolloutStrategiesForEra, getSlotData, getSlotGameMode, getSlotValue, getStageCost, getStageStudioAvailable, getStudioAvailableSlots, getStudioMarketSnapshot, getStudioUsageCounts, getTopActSnapshot, getTopTrendGenre, getTrack, getTrackRoleIds, getTrackRoleIdsFromSlots, getSelectedTourDraft, getWorkOrderCreatorIds, weekStartEpochMs, hoursUntilNextScheduledTime, isAwardPerformanceBidWindowOpen, isMasteringTrack, listAnnualAwardDefinitions, listAwardShows, listFromIds, listRolloutPlanLibrary, listTourBookings, listTourDrafts, listTourTiers, listTourVenues, loadLossArchives, logEvent, makeGenre, moodFromGenre, resolveAwardShowPerformanceBidWindow, resolveAwardShowPerformanceQuality, normalizeProjectName, normalizeProjectType, normalizeRoleIds, parseTrackRoleTarget, parsePromoProjectKey, pruneCreatorSignLockouts, PROJECT_TITLE_TRANSLATIONS, qualityGrade, rankCandidates, recommendPhysicalRun, recommendReleasePlan, resolveLabelAcronym, resolveTrackReleaseType, resolveTourAnchor, roleLabel, safeAvatarUrl, saveToActiveSlot, scoreGrade, session, setSelectedRolloutStrategyId, setTimeSpeed, shortGameModeLabel, slugify, staminaRequirement, state, selectTourDraft, syncLabelWallets, themeFromGenre, trackRoleLimit, touringBalanceEnabled, trendAlignmentLeader, weekIndex, weekNumberFromEpochMs, validateTourBooking, } from "../../game.js";
import { PROMO_TYPE_DETAILS } from "../../promo_types.js";
import { CalendarView } from "../../calendar.js";
import { fetchChartSnapshot, listChartWeeks } from "../../db.js";
import { $, describeSlot, getSlotElement, openOverlay } from "../dom.js";
import { buildMoodOptions, buildThemeOptions, bindThemeSelectAccent, getMoodEmoji, setThemeSelectAccent } from "../themeMoodOptions.js";
import { buildRolloutBudgetSummary, getModifierCosts, getPromoInflationMultiplier } from "./promo-budget.js";
const ACCESSIBLE_TEXT = { dark: "#000000", light: "#ffffff" };
const PROMO_TRACK_REQUIRED_TYPES = Object.keys(PROMO_TYPE_DETAILS)
    .filter((typeId) => PROMO_TYPE_DETAILS[typeId]?.requiresTrack);
const WORLD_RENDER_THROTTLE_MS = 1200;
let lastWorldRenderAt = 0;
function renderRolloutBudgetSummary(strategy) {
    const summary = buildRolloutBudgetSummary(strategy);
    if (!summary)
        return "";
    if (!summary.eventCount) {
        return `
      <div class="list-item">
        <div class="item-title">Budget estimate</div>
        <div class="muted">No promo events scheduled yet.</div>
      </div>
    `;
    }
    const breakdown = summary.byType
        .map((entry) => `${entry.label} x${entry.count}: ${formatMoney(entry.totalPlanned)}`)
        .join(" | ");
    const breakdownLine = breakdown ? `<div class="muted">${breakdown}</div>` : "";
    return `
    <div class="list-item">
      <div class="item-title">Budget estimate</div>
      <div class="muted">Base ${formatMoney(summary.totalBase)} | Inflation-adjusted ${formatMoney(summary.totalAdjusted)} | Planned ${formatMoney(summary.totalPlanned)}</div>
      ${breakdownLine}
      <div class="muted">Uses current promo budgets; adjust them to adapt.</div>
    </div>
  `;
}
function formatPlanFocusLine(plan) {
    const type = plan?.focusType || "Era";
    const label = plan?.focusLabel || plan?.focusId || "";
    return label ? `${type}: ${label}` : type;
}
function renderPlanUsageLine(plan) {
    const usage = plan?.usage;
    if (!usage)
        return `<div class="muted">Usage: No tracked releases yet.</div>`;
    const parts = [];
    if (Number.isFinite(usage.releaseCount) && usage.releaseCount > 0) {
        parts.push(`${formatCount(usage.releaseCount)} releases`);
    }
    if (Number.isFinite(usage.lastUsedAt)) {
        parts.push(`Last used ${formatShortDate(usage.lastUsedAt)}`);
    }
    if (Array.isArray(usage.labels) && usage.labels.length) {
        const listed = usage.labels.slice(0, 3);
        const overflow = usage.labels.length - listed.length;
        parts.push(`Labels: ${listed.join(", ")}${overflow > 0 ? ` +${overflow} more` : ""}`);
    }
    if (!parts.length)
        return `<div class="muted">Usage: No tracked releases yet.</div>`;
    return `<div class="muted">Usage: ${parts.join(" | ")}</div>`;
}
function renderPlanContextLines(context) {
    if (!context)
        return `<div class="muted">Context: No tracked outcomes yet.</div>`;
    const signalParts = [];
    if (Array.isArray(context.alignmentTags) && context.alignmentTags.length) {
        signalParts.push(`Alignment: ${context.alignmentTags.join(", ")}`);
    }
    if (Array.isArray(context.trendTags) && context.trendTags.length) {
        signalParts.push(`Trend tags: ${context.trendTags.join(", ")}`);
    }
    const signalLine = signalParts.length ? `<div class="muted">${signalParts.join(" | ")}</div>` : "";
    const outcomes = context.outcomes || {};
    const outcomeParts = [];
    if (Number.isFinite(context.outcomeScore) && context.outcomeScore > 0) {
        outcomeParts.push(`Score ${Math.round(context.outcomeScore)}`);
    }
    if (Number.isFinite(outcomes.releaseCount) && outcomes.releaseCount > 0) {
        outcomeParts.push(`${formatCount(outcomes.releaseCount)} releases`);
    }
    if (Number.isFinite(outcomes.avgPeak) && outcomes.avgPeak > 0) {
        outcomeParts.push(`Avg peak #${Math.round(outcomes.avgPeak)}`);
    }
    if (Number.isFinite(outcomes.avgWeeksOnChart) && outcomes.avgWeeksOnChart > 0) {
        outcomeParts.push(`Avg weeks ${Math.round(outcomes.avgWeeksOnChart)}`);
    }
    if (Number.isFinite(outcomes.avgQuality) && outcomes.avgQuality > 0) {
        outcomeParts.push(`Avg quality ${Math.round(outcomes.avgQuality)}`);
    }
    const outcomeLine = outcomeParts.length ? `<div class="muted">Outcomes: ${outcomeParts.join(" | ")}</div>` : "";
    const trendRanks = Array.isArray(context.marketConditions?.trendRanks)
        ? context.marketConditions.trendRanks.slice(0, 6)
        : [];
    const marketLine = trendRanks.length
        ? `<div class="muted">Market: ${trendRanks.map((entry) => {
            const range = entry.dateRange || (Number.isFinite(entry.week) ? formatWeekRangeLabel(entry.week) : "");
            return `${entry.genre} #${entry.rank}${range ? ` (${range})` : ""}`;
        }).join(" | ")}</div>`
        : "";
    const lines = [signalLine, outcomeLine, marketLine].filter(Boolean);
    return lines.length ? lines.join("") : `<div class="muted">Context: No tracked outcomes yet.</div>`;
}
function renderPlanLibraryList(plans) {
    const list = Array.isArray(plans) ? plans : [];
    if (!list.length)
        return `<div class="muted">No rollout plans captured yet.</div>`;
    return list.map((plan) => {
        const label = plan.label || plan.id || "Rollout Plan";
        const focusLine = formatPlanFocusLine(plan);
        const source = plan.source || "Unknown";
        return `
      <div class="list-item">
        <div class="item-title">${label}</div>
        <div class="muted">Focus: ${focusLine} | Source: ${source}</div>
        ${renderPlanUsageLine(plan)}
        ${renderPlanContextLines(plan.context)}
      </div>
    `;
    }).join("");
}
let trackHistoryRequestId = 0;
let eraHistoryRequestId = 0;
function resolveCssColor(value) {
    const raw = String(value || "").trim();
    if (!raw || !raw.startsWith("var("))
        return raw;
    const match = raw.match(/var\((--[^)]+)\)/);
    if (!match || typeof document === "undefined")
        return raw;
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
    return resolved || raw;
}
function parseColorToRgb(value) {
    const color = resolveCssColor(value);
    if (!color)
        return null;
    if (color.startsWith("#")) {
        let hex = color.slice(1).trim();
        if (hex.length === 3) {
            hex = hex.split("").map((ch) => ch + ch).join("");
        }
        if (hex.length === 8)
            hex = hex.slice(0, 6);
        if (hex.length !== 6)
            return null;
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return { r, g, b };
    }
    const rgbMatch = color.match(/^rgba?\(([^)]+)\)$/);
    if (!rgbMatch)
        return null;
    const parts = rgbMatch[1].split(",").map((part) => Number.parseFloat(part.trim()));
    if (parts.length < 3 || parts.some((part) => Number.isNaN(part)))
        return null;
    return { r: parts[0], g: parts[1], b: parts[2] };
}
function relativeLuminance(rgb) {
    const toLinear = (value) => {
        const channel = value / 255;
        return channel <= 0.03928
            ? channel / 12.92
            : Math.pow((channel + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}
function contrastRatio(a, b) {
    const lighter = Math.max(a, b);
    const darker = Math.min(a, b);
    return (lighter + 0.05) / (darker + 0.05);
}
function pickAccessibleTextColor(bgColor) {
    const bg = parseColorToRgb(bgColor);
    const dark = parseColorToRgb(ACCESSIBLE_TEXT.dark);
    const light = parseColorToRgb(ACCESSIBLE_TEXT.light);
    if (!bg || !dark || !light)
        return ACCESSIBLE_TEXT.dark;
    const bgLum = relativeLuminance(bg);
    const darkContrast = contrastRatio(bgLum, relativeLuminance(dark));
    const lightContrast = contrastRatio(bgLum, relativeLuminance(light));
    return lightContrast >= darkContrast ? ACCESSIBLE_TEXT.light : ACCESSIBLE_TEXT.dark;
}
/** @deprecated Replaced by React Pill/Tag components. */
function renderAlignmentTag(alignment) {
    const cls = alignmentClass(alignment);
    return `<span class="tag tag--alignment ${cls}"><span class="tag-dot"></span><span class="tag-label">${alignment}</span></span>`;
}
/** @deprecated Replaced by React Pill/Tag components. */
function renderThemeTag(theme, options = {}) {
    const cls = `theme-${slugify(theme)}`;
    const label = options?.label || theme;
    return `<span class="tag tag--theme ${cls}"><span class="tag-dot"></span><span class="tag-label">${label}</span></span>`;
}
/** @deprecated Replaced by React Pill/Tag components. */
function renderCountryTag(country) {
    const cls = `country-${slugify(country)}`;
    return `<span class="tag tag--country ${cls}"><span class="tag-dot"></span><span class="tag-label">${country}</span></span>`;
}
/** @deprecated Replaced by React Pill/Tag components. */
function renderNationalityPill(country) {
    const color = countryColor(country);
    const demonym = countryDemonym(country);
    return `<span class="pill country-pill" style="color:${color};">${demonym}</span>`;
}
function renderCreatorLabelPill({ labelName, labelCountry, labelAcronym, unsigned = false } = {}) {
    if (unsigned) {
        return `<span class="pill creator-label-pill creator-label-pill--unsigned">Unsigned</span>`;
    }
    const fallbackAcronym = String(labelAcronym || "").trim();
    const resolvedAcronym = fallbackAcronym || resolveLabelAcronym(labelName);
    if (!resolvedAcronym)
        return "";
    const color = countryColor(labelCountry);
    const textColor = pickAccessibleTextColor(color);
    const title = labelName ? ` title="${escapeAttribute(labelName)}"` : "";
    return `<span class="pill creator-label-pill" style="background:${color};color:${textColor};"${title}>${resolvedAcronym}</span>`;
}
function getCreatorHangulName(creator) {
    if (!creator)
        return "";
    return creator.nameHangul
        || (creator.surnameHangul && creator.givenNameHangul ? `${creator.surnameHangul}${creator.givenNameHangul}` : "");
}
function renderCreatorName(creator, { stacked = true } = {}) {
    if (!creator)
        return "";
    const romanized = creator.name || "";
    const hangul = getCreatorHangulName(creator);
    if (!hangul || !stacked)
        return romanized;
    return `<span class="name-stack name-stack--inline"><span class="name-ko" lang="ko">${hangul}</span><span class="name-romanized">${romanized}</span></span>`;
}
const HANGUL_REGEX = /[\uAC00-\uD7A3]/;
function splitNameSuffix(name) {
    const raw = String(name || "").trim();
    if (!raw)
        return { base: "", suffix: "" };
    const match = raw.match(/^(.*?)(\s*\([^)]*\))$/);
    if (!match)
        return { base: raw, suffix: "" };
    return { base: match[1].trim(), suffix: match[2] };
}
function lookupTrackTitleTranslation(name) {
    if (!name || !HANGUL_REGEX.test(name))
        return "";
    if (typeof TRACK_TITLE_TRANSLATIONS_KR === "object" && TRACK_TITLE_TRANSLATIONS_KR[name]) {
        return TRACK_TITLE_TRANSLATIONS_KR[name];
    }
    return "";
}
function lookupProjectTitleTranslation(name) {
    if (!name || !HANGUL_REGEX.test(name))
        return "";
    return PROJECT_TITLE_TRANSLATIONS?.[name] || "";
}
function escapeAttribute(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
function renderLocalizedName(primary, translation, { lang = "ko", romanized = "" } = {}) {
    if (!translation)
        return primary;
    const titleAttr = romanized ? ` title="${escapeAttribute(romanized)}"` : "";
    return `<span class="name-stack"${titleAttr}><span class="name-ko" lang="${lang}">${primary}</span><span class="name-romanized">${translation}</span></span>`;
}
function renderTrackTitle(title) {
    if (!title)
        return "";
    const { base, suffix } = splitNameSuffix(title);
    const translation = lookupTrackTitleTranslation(base);
    if (!translation)
        return title;
    return renderLocalizedName(`${base}${suffix}`, translation);
}
function renderProjectName(name) {
    const raw = String(name || "").trim();
    if (!raw)
        return "";
    const singleMatch = raw.match(/^(.*)\s+-\s+Single$/);
    if (singleMatch) {
        const base = singleMatch[1].trim();
        const baseTranslation = lookupProjectTitleTranslation(base) || lookupTrackTitleTranslation(base);
        if (baseTranslation) {
            return renderLocalizedName(`${base} - Single`, `${baseTranslation} - Single`);
        }
    }
    const { base, suffix } = splitNameSuffix(raw);
    const translation = lookupProjectTitleTranslation(base);
    if (!translation)
        return raw;
    return renderLocalizedName(`${base}${suffix}`, translation);
}
function normalizeActKind(value) {
    const raw = String(value || "").trim();
    if (!raw)
        return null;
    const lowered = raw.toLowerCase();
    if (lowered === "solo" || lowered === "solo act")
        return "solo";
    if (lowered === "group" || lowered === "group act")
        return "group";
    return null;
}
function resolveActNameParts(act) {
    if (!act)
        return { name: "", nameKey: null, actKind: null };
    if (typeof act === "object") {
        const name = String(act.name || act.actName || "").trim();
        const nameKey = act.nameKey || act.actNameKey || null;
        const actKind = normalizeActKind(act.actKind || act.actType || act.type);
        return { name, nameKey, actKind };
    }
    return { name: String(act || "").trim(), nameKey: null, actKind: null };
}
function renderActName(act) {
    const { name, nameKey, actKind } = resolveActNameParts(act);
    if (!name)
        return "";
    if (!hasHangulText(name))
        return name;
    const { translation, romanized } = lookupActNameDetails({ name, nameKey, actKind });
    if (!translation)
        return name;
    return renderLocalizedName(name, translation, { romanized });
}
function formatActNamePlain(act) {
    const { name, nameKey, actKind } = resolveActNameParts(act);
    if (!name)
        return "";
    if (!hasHangulText(name))
        return name;
    const { translation, romanized } = lookupActNameDetails({ name, nameKey, actKind });
    if (!translation)
        return name;
    return romanized ? `${name} / ${translation} (${romanized})` : `${name} / ${translation}`;
}
function isCreatorInAct(creatorId) {
    if (!creatorId)
        return false;
    return state.acts.some((act) => Array.isArray(act.memberIds) && act.memberIds.includes(creatorId));
}
function getCreatorStageName(creator) {
    if (!creator)
        return "";
    const stageName = typeof creator.stageName === "string" ? creator.stageName.trim() : "";
    if (stageName)
        return stageName;
    const fallback = String(creator.givenName || creator.name || "").trim();
    return fallback;
}
function formatCreatorRealNameLine(creator) {
    if (!creator)
        return "";
    const romanized = String(creator.name || "").trim();
    const hangul = getCreatorHangulName(creator);
    if (hangul && romanized && hangul !== romanized)
        return `${hangul} / ${romanized}`;
    return romanized || hangul;
}
function renderCreatorStudioName(creator) {
    if (!creator)
        return "";
    if (!isCreatorInAct(creator.id))
        return renderCreatorName(creator);
    const stageName = getCreatorStageName(creator);
    if (!stageName)
        return renderCreatorName(creator);
    const realName = formatCreatorRealNameLine(creator);
    const realLine = realName ? `<span class="muted">[${realName}]</span>` : "";
    return `<span class="name-stack"><span class="creator-stage-name">${stageName}</span>${realLine}</span>`;
}
function listCreatorActs(creatorId) {
    if (!creatorId)
        return [];
    return state.acts.filter((act) => Array.isArray(act.memberIds) && act.memberIds.includes(creatorId));
}
function buildActPopularityScoreMap(year = currentYear()) {
    const leaderboard = getActPopularityLeaderboard(year);
    const map = new Map();
    const entries = Array.isArray(leaderboard?.entries) ? leaderboard.entries : [];
    entries.forEach((entry) => {
        if (!entry?.actId)
            return;
        const score = Number.isFinite(entry.points) ? entry.points : 0;
        map.set(entry.actId, score);
    });
    return map;
}
function sortActsByPopularity(acts, scoreMap) {
    const safeActs = Array.isArray(acts) ? acts.slice() : [];
    return safeActs.sort((a, b) => {
        const aScore = scoreMap?.get(a?.id) ?? 0;
        const bScore = scoreMap?.get(b?.id) ?? 0;
        if (bScore !== aScore)
            return bScore - aScore;
        return String(a?.name || "").localeCompare(String(b?.name || ""));
    });
}
function buildWorkOrderCrewLabel(crew) {
    const lead = crew[0] || null;
    if (!lead)
        return { primary: "Unassigned", secondary: "" };
    if (!isCreatorInAct(lead.id))
        return { primary: lead.name || "Unassigned", secondary: "" };
    const stageName = getCreatorStageName(lead) || lead.name || "Unassigned";
    const suffix = crew.length > 1 ? ` +${crew.length - 1}` : "";
    const realName = formatCreatorRealNameLine(lead);
    return {
        primary: `${stageName}${suffix}`,
        secondary: realName ? `[${realName}]` : ""
    };
}
const SKILL_LEVEL_COUNT = 10;
const SKILL_EXP_PER_LEVEL = Math.max(1, (SKILL_MAX - SKILL_MIN + 1) / SKILL_LEVEL_COUNT);
const SKILL_EXP_PER_LEVEL_LABEL = Number.isInteger(SKILL_EXP_PER_LEVEL)
    ? String(SKILL_EXP_PER_LEVEL)
    : SKILL_EXP_PER_LEVEL.toFixed(2);
function getCreatorSkillLevel(creator) {
    const skill = Number.isFinite(creator?.skill) ? creator.skill : SKILL_MIN;
    const bounded = clamp(skill, SKILL_MIN, SKILL_MAX) - SKILL_MIN;
    return clamp(Math.floor(bounded / SKILL_EXP_PER_LEVEL) + 1, 1, SKILL_LEVEL_COUNT);
}
function getCreatorSkillExp(creator) {
    const skill = Number.isFinite(creator?.skill) ? creator.skill : SKILL_MIN;
    const progress = Number.isFinite(creator?.skillProgress) ? creator.skillProgress : 0;
    const bounded = clamp(skill, SKILL_MIN, SKILL_MAX) - SKILL_MIN;
    const exp = (bounded % SKILL_EXP_PER_LEVEL) + progress;
    return clamp(exp, 0, SKILL_EXP_PER_LEVEL);
}
function renderCreatorSkillProgress(creator) {
    const level = getCreatorSkillLevel(creator);
    const exp = getCreatorSkillExp(creator);
    return `Skill Level ${level} | EXP ${exp.toFixed(2)} / ${SKILL_EXP_PER_LEVEL_LABEL}`;
}
function formatCreatorGenderIdentity(creator) {
    if (!creator)
        return "";
    const raw = String(creator.genderIdentity || "").trim().toLowerCase();
    if (!raw)
        return "";
    if (raw === "man")
        return "Man";
    if (raw === "woman")
        return "Woman";
    if (raw === "nonbinary" || raw === "non-binary")
        return "Non-binary";
    return "";
}
function formatCreatorAgeMeta(creator) {
    if (!creator)
        return "Age -";
    const age = Number.isFinite(creator.age) ? creator.age : null;
    const group = creator.ageGroup || "";
    let base = "Age -";
    if (age !== null && group)
        base = `Age ${age} (${group})`;
    if (age !== null && !group)
        base = `Age ${age}`;
    if (age === null && group)
        base = `Age Group ${group}`;
    const genderLabel = formatCreatorGenderIdentity(creator);
    return genderLabel ? `${base} | ${genderLabel}` : base;
}
function getCreatorCatharsisScore(creator) {
    return computeCreatorCatharsisScore(creator);
}
function splitRecordLabelName(label) {
    const raw = String(label || "").trim();
    if (!raw)
        return { primary: "Label", secondary: "Record Label" };
    const match = raw.match(/^(.*?)(?:\s+Record Label)$/i);
    const primary = match ? match[1].trim() : raw;
    if (!primary)
        return { primary: raw, secondary: "" };
    return { primary, secondary: "Record Label" };
}
/** @deprecated Replaced by React Pill/Tag components. */
function renderLabelTag(label, country) {
    const color = countryColor(country);
    const { primary, secondary } = splitRecordLabelName(label);
    const secondaryLine = secondary ? `<span class="tag-line tag-line--sub">${secondary}</span>` : "";
    const rival = getRivalByName(label);
    const isRival = Boolean(rival);
    const attrs = isRival
        ? ` data-rival-label="${escapeAttribute(label)}" role="button" tabindex="0" aria-label="View ${escapeAttribute(primary)} roster"`
        : "";
    const cls = `tag tag--label${isRival ? " tag--clickable" : ""}`;
    return `<span class="${cls}" style="color:${color};"${attrs}><span class="tag-dot"></span><span class="tag-label tag-label--stacked"><span class="tag-line">${primary}</span>${secondaryLine}</span></span>`;
}
/** @deprecated Replaced by React Pill/Tag components. */
function renderMoodTag(mood, alignment, options = {}) {
    const emoji = getMoodEmoji(mood) || "\u2753";
    const cls = alignment ? alignmentClass(alignment) : "neutral";
    const label = options?.label || mood;
    return `<span class="tag tag--mood mood ${cls}"><span class="mood-emoji">${emoji}</span><span class="tag-label">${label}</span></span>`;
}
/** @deprecated Replaced by React Pill/Tag components. */
function renderMoodLabel(mood, alignment) {
    const emoji = getMoodEmoji(mood) || "\u2753";
    const cls = alignment ? alignmentClass(alignment) : "neutral";
    return `<span class="tag tag--mood mood ${cls}"><span class="tag-label">${mood}</span><span class="mood-emoji">${emoji}</span></span>`;
}
function formatModifierDelta(modifier) {
    if (!modifier)
        return "Quality 0 | Time 0h | Cost $0";
    const quality = Number(modifier.qualityDelta || 0);
    const hours = Number(modifier.hoursDelta || 0);
    const cost = Number(modifier.costDelta || 0);
    const qualityLabel = `Quality ${quality > 0 ? "+" : ""}${quality}`;
    const hoursLabel = `Time ${hours > 0 ? "+" : ""}${hours}h`;
    const costLabel = `Cost ${cost > 0 ? "+" : ""}${formatMoney(cost)}`;
    return `${qualityLabel} | ${hoursLabel} | ${costLabel}`;
}
function renderModifierFocus(modifier) {
    if (!modifier)
        return "";
    const tags = [];
    if (modifier.theme)
        tags.push(renderThemeTag(modifier.theme));
    if (modifier.mood)
        tags.push(renderMoodTag(modifier.mood, modifier.alignment));
    if (modifier.alignment)
        tags.push(renderAlignmentTag(modifier.alignment));
    if (!tags.length)
        return "";
    return `<div class="muted">Focus: ${tags.join(" ")}</div>`;
}
/** @deprecated Replaced by React Pill/Tag components. */
function renderGenrePills(theme, mood, { fallback = "-", alignment, inline = false } = {}) {
    if (!theme || !mood)
        return fallback;
    const themeTag = renderThemeTag(theme, { label: `${theme} but` });
    const moodTag = renderMoodTag(mood, alignment, { label: `it's ${mood}` });
    if (inline) {
        return `<span class="genre-pills genre-pills--inline">${themeTag}${moodTag}</span>`;
    }
    return `<span class="genre-pills"><span class="genre-line">${themeTag}</span><span class="genre-line">${moodTag}</span></span>`;
}
/** @deprecated Replaced by React Pill/Tag components. */
function renderGenrePillsFromGenre(genre, options = {}) {
    if (!genre)
        return options.fallback || "-";
    const theme = themeFromGenre(genre);
    const mood = moodFromGenre(genre);
    return renderGenrePills(theme, mood, options);
}
/** @deprecated Replaced by React Pill/Tag components. */
function renderTrackGenrePills(track, options = {}) {
    if (!track)
        return options.fallback || "-";
    const theme = track.theme || themeFromGenre(track.genre);
    const mood = track.mood || moodFromGenre(track.genre);
    const alignment = options.alignment || track.alignment || state.label?.alignment || "";
    return renderGenrePills(theme, mood, { ...options, alignment });
}
let trackSlotsReactFallbackWarned = false;
function shouldRenderLegacyTrackSlots() {
    if (!UI_REACT_ISLANDS_ENABLED)
        return true;
    const root = document.getElementById("rls-react-trackslots-root");
    if (!root)
        return false;
    const mounted = root.childElementCount > 0;
    if (!mounted && !trackSlotsReactFallbackWarned) {
        logEvent("React track slots not mounted; using legacy slots.", "warn");
        trackSlotsReactFallbackWarned = true;
    }
    return !mounted;
}
function ensureTrackSlotGrid() {
    if (!shouldRenderLegacyTrackSlots())
        return;
    const grid = $("trackSlotGrid");
    if (!grid || grid.dataset.built === "true")
        return;
    grid.dataset.built = "true";
    grid.innerHTML = "";
    const roles = [
        { role: "Songwriter", target: TRACK_ROLE_TARGETS.Songwriter },
        { role: "Performer", target: TRACK_ROLE_TARGETS.Performer },
        { role: "Producer", target: TRACK_ROLE_TARGETS.Producer }
    ];
    roles.forEach((entry) => {
        const limit = trackRoleLimit(entry.role);
        const group = document.createElement("div");
        group.className = "slot-role-group";
        group.dataset.slotRoleGroup = entry.role;
        const head = document.createElement("div");
        head.className = "slot-group-head";
        const header = document.createElement("div");
        header.className = "slot-group-label";
        header.dataset.slotGroupLabel = entry.role;
        header.textContent = `${roleLabel(entry.role)} Slots (0/${limit})`;
        const actions = document.createElement("div");
        actions.className = "slot-group-actions";
        actions.innerHTML = `
      <button type="button" class="ghost mini" data-slot-more="${entry.role}">Add Slot</button>
      <button type="button" class="ghost mini" data-slot-less="${entry.role}">Show Less</button>
    `;
        head.appendChild(header);
        head.appendChild(actions);
        group.appendChild(head);
        const slotGrid = document.createElement("div");
        slotGrid.className = "slot-role-grid";
        slotGrid.dataset.slotRoleGrid = entry.role;
        group.appendChild(slotGrid);
        const columns = Math.max(1, Math.ceil(limit / STUDIO_COLUMN_SLOT_COUNT));
        // Studio columns render five slots each to mirror studio capacity.
        for (let col = 0; col < columns; col += 1) {
            const columnLabel = document.createElement("div");
            columnLabel.className = "slot-column-label";
            columnLabel.dataset.slotColumnLabel = `${entry.role}-${col + 1}`;
            columnLabel.dataset.slotRole = entry.role;
            columnLabel.dataset.slotColumnStart = String(col * STUDIO_COLUMN_SLOT_COUNT + 1);
            columnLabel.textContent = `Studio ${col + 1}`;
            slotGrid.appendChild(columnLabel);
            for (let row = 0; row < STUDIO_COLUMN_SLOT_COUNT; row += 1) {
                const index = col * STUDIO_COLUMN_SLOT_COUNT + row + 1;
                if (index > limit)
                    break;
                const slot = document.createElement("div");
                slot.className = "id-slot";
                slot.dataset.slotTarget = `${entry.target}-${index}`;
                slot.dataset.slotType = "creator";
                slot.dataset.slotRole = entry.role;
                slot.dataset.slotGroup = "track";
                slot.dataset.slotIndex = String(index);
                const label = `${roleLabel(entry.role)} Slot`;
                slot.innerHTML = `
          <div class="slot-label">${label} ${index}</div>
          <div class="slot-id">
            <div class="slot-avatar" aria-hidden="true"></div>
            <div class="slot-value">${UNASSIGNED_CREATOR_LABEL}</div>
          </div>
          <div class="slot-actions">
            <button type="button" class="ghost mini" data-slot-recommend="${entry.target}-${index}">Recommend</button>
            <button type="button" class="ghost mini" data-slot-clear="${entry.target}-${index}">Clear</button>
          </div>
        `;
                slotGrid.appendChild(slot);
            }
        }
        grid.appendChild(group);
    });
}
function applyTrackSlotVisibility() {
    if (!shouldRenderLegacyTrackSlots())
        return;
    const grid = $("trackSlotGrid");
    if (!grid)
        return;
    ensureTrackSlotVisibility();
    ["Songwriter", "Performer", "Producer"].forEach((role) => {
        const limit = trackRoleLimit(role);
        const key = TRACK_ROLE_KEYS[role];
        const assigned = listFromIds(state.ui.trackSlots?.[key]).length;
        const fallback = Math.min(DEFAULT_TRACK_SLOT_VISIBLE, limit);
        const current = Number(state.ui.trackSlotVisible?.[role]);
        const desired = Number.isFinite(current) ? current : fallback;
        const visibleCount = Math.max(fallback, Math.min(limit, Math.max(desired, assigned)));
        state.ui.trackSlotVisible[role] = visibleCount;
        const label = grid.querySelector(`[data-slot-group-label="${role}"]`);
        if (label)
            label.textContent = `${roleLabel(role)} Slots (${assigned}/${limit})`;
        grid.querySelectorAll(`.id-slot[data-slot-role="${role}"]`).forEach((slot) => {
            const index = Number(slot.dataset.slotIndex || "0");
            slot.classList.toggle("hidden", index > visibleCount);
        });
        grid.querySelectorAll(`.slot-column-label[data-slot-role="${role}"]`).forEach((column) => {
            const start = Number(column.dataset.slotColumnStart || "0");
            column.classList.toggle("hidden", start > visibleCount);
        });
        const moreBtn = grid.querySelector(`[data-slot-more="${role}"]`);
        if (moreBtn)
            moreBtn.disabled = visibleCount >= limit;
        const lessBtn = grid.querySelector(`[data-slot-less="${role}"]`);
        if (lessBtn)
            lessBtn.disabled = visibleCount <= Math.max(fallback, assigned);
    });
}
function renderSlots() {
    ensureTrackSlotGrid();
    ensureTrackSlotArrays();
    applyTrackSlotVisibility();
    const activeTarget = state.ui.slotTarget;
    document.querySelectorAll(".id-slot").forEach((slot) => {
        if (slot.closest("#rls-react-trackslots-root"))
            return;
        const target = slot.dataset.slotTarget;
        slot.classList.toggle("active", target === activeTarget);
    });
    const actLead = getCreator(state.ui.actSlots.lead);
    const actMember2 = getCreator(state.ui.actSlots.member2);
    const actMember3 = getCreator(state.ui.actSlots.member3);
    const trackAct = getAct(state.ui.trackSlots.actId);
    const eraAct = getAct(state.ui.eraSlots.actId);
    const promoProject = state.ui.promoSlots.projectId ? parsePromoProjectKey(state.ui.promoSlots.projectId) : null;
    const promoTrack = state.marketTracks.find((entry) => entry.trackId === state.ui.promoSlots.trackId)
        || getTrack(state.ui.promoSlots.trackId);
    const socialTrack = getTrack(state.ui.socialSlots.trackId);
    const unassignedLabel = UNASSIGNED_SLOT_LABEL;
    const unassignedCreatorLabel = UNASSIGNED_CREATOR_LABEL;
    if ($("actLeadSlot"))
        $("actLeadSlot").innerHTML = actLead ? renderCreatorName(actLead) : unassignedCreatorLabel;
    if ($("actMember2Slot"))
        $("actMember2Slot").innerHTML = actMember2 ? renderCreatorName(actMember2) : unassignedCreatorLabel;
    if ($("actMember3Slot"))
        $("actMember3Slot").innerHTML = actMember3 ? renderCreatorName(actMember3) : unassignedCreatorLabel;
    if ($("trackActSlot"))
        $("trackActSlot").innerHTML = trackAct ? renderActName(trackAct) : unassignedLabel;
    if ($("eraActSlot"))
        $("eraActSlot").innerHTML = eraAct ? renderActName(eraAct) : unassignedLabel;
    if ($("promoProjectSlot")) {
        const projectType = promoProject ? normalizeProjectType(promoProject.projectType || "Single") : "Single";
        const label = promoProject
            ? `${renderProjectName(promoProject.projectName)} (${projectType})`
            : unassignedLabel;
        $("promoProjectSlot").innerHTML = label;
    }
    if ($("promoTrackSlot"))
        $("promoTrackSlot").innerHTML = promoTrack ? renderTrackTitle(promoTrack.title) : unassignedLabel;
    if ($("socialTrackSlot"))
        $("socialTrackSlot").innerHTML = socialTrack ? renderTrackTitle(socialTrack.title) : unassignedLabel;
    document.querySelectorAll(".id-slot").forEach((slot) => {
        if (slot.closest("#rls-react-trackslots-root"))
            return;
        const target = slot.dataset.slotTarget;
        const type = slot.dataset.slotType;
        const slotGroup = slot.dataset.slotGroup || "";
        const value = getSlotValue(target);
        const valueEl = slot.querySelector(".slot-value");
        const avatarEl = slot.querySelector(".slot-avatar");
        if (!valueEl)
            return;
        if (type === "creator") {
            const creator = value ? getCreator(value) : null;
            if (creator && slotGroup === "track") {
                valueEl.innerHTML = renderCreatorStudioName(creator);
            }
            else {
                valueEl.innerHTML = creator ? renderCreatorName(creator) : unassignedCreatorLabel;
            }
            if (avatarEl) {
                const portraitUrl = creator ? getCreatorPortraitUrl(creator) : null;
                const hasImage = Boolean(portraitUrl);
                avatarEl.classList.toggle("has-image", hasImage);
                avatarEl.classList.toggle("is-empty", !creator);
                avatarEl.classList.toggle("has-symbols", !hasImage);
                if (hasImage) {
                    avatarEl.style.backgroundImage = `url("${safeAvatarUrl(portraitUrl)}")`;
                    avatarEl.textContent = "";
                }
                else {
                    avatarEl.style.backgroundImage = "";
                    avatarEl.innerHTML = renderCreatorFallbackSymbols({ unassigned: !creator });
                }
                avatarEl.title = creator?.portraitNote || "";
            }
        }
        else if (type === "act") {
            const act = value ? getAct(value) : null;
            valueEl.innerHTML = act ? renderActName(act) : unassignedLabel;
            if (avatarEl) {
                avatarEl.classList.remove("has-image");
                avatarEl.classList.remove("is-empty");
                avatarEl.style.backgroundImage = "";
                avatarEl.textContent = "";
            }
        }
        else if (type === "track") {
            const track = value ? getTrack(value) : null;
            let trackLabel = track ? track.title : unassignedLabel;
            const isPromoTrackSlot = target === "promo-track" || (typeof target === "string" && target.startsWith("auto-promo-track-"));
            if (!track && isPromoTrackSlot && value) {
                const marketEntry = state.marketTracks.find((entry) => entry.trackId === value);
                if (marketEntry?.title)
                    trackLabel = marketEntry.title;
            }
            valueEl.innerHTML = trackLabel ? renderTrackTitle(trackLabel) : trackLabel;
            if (avatarEl) {
                avatarEl.classList.remove("has-image");
                avatarEl.classList.remove("is-empty");
                avatarEl.style.backgroundImage = "";
                avatarEl.textContent = "";
            }
        }
        else if (type === "project") {
            const project = value ? parsePromoProjectKey(value) : null;
            const projectType = project ? normalizeProjectType(project.projectType || "Single") : "Single";
            const label = project
                ? `${renderProjectName(project.projectName)} (${projectType})`
                : unassignedLabel;
            valueEl.innerHTML = label;
            if (avatarEl) {
                avatarEl.classList.remove("has-image");
                avatarEl.classList.remove("is-empty");
                avatarEl.style.backgroundImage = "";
                avatarEl.textContent = "";
            }
        }
    });
    document.querySelectorAll("[data-slot-group-label]").forEach((label) => {
        if (label.closest("#rls-react-trackslots-root"))
            return;
        const role = label.dataset.slotGroupLabel;
        if (!role)
            return;
        const limit = trackRoleLimit(role);
        const assigned = getTrackRoleIdsFromSlots(role).length;
        label.textContent = `${roleLabel(role)} Slots (${assigned}/${limit})`;
    });
    const createStage = state.ui.activeView === "create" ? (state.ui.createStage || "sheet") : null;
    const stageRole = createStage === "demo"
        ? "Performer"
        : createStage === "master"
            ? "Producer"
            : createStage === "sheet"
                ? "Songwriter"
                : null;
    document.querySelectorAll(".slot-role-group").forEach((group) => {
        if (group.closest("#rls-react-trackslots-root"))
            return;
        const role = group.dataset.slotRoleGroup;
        group.classList.toggle("is-active", !!stageRole && role === stageRole);
    });
    const solo = $("actTypeSelect") && $("actTypeSelect").value === "Solo Act";
    ["act-member2", "act-member3"].forEach((target) => {
        const slot = getSlotElement(target);
        if (slot)
            slot.classList.toggle("disabled", solo);
    });
    if (typeof window !== "undefined" && window.ensureSlotDropdowns) {
        window.ensureSlotDropdowns();
    }
    if (typeof window !== "undefined" && window.updateSlotDropdowns) {
        window.updateSlotDropdowns();
    }
}
function refreshSelectOptions() {
    const labelAlignment = $("labelAlignment");
    if (labelAlignment)
        labelAlignment.innerHTML = ALIGNMENTS.map((a) => `<option value="${a}">${a}</option>`).join("");
    const trackAlignment = $("trackAlignment");
    if (trackAlignment)
        trackAlignment.innerHTML = ALIGNMENTS.map((a) => `<option value="${a}">${a}</option>`).join("");
    const themeSelect = $("themeSelect");
    if (themeSelect) {
        themeSelect.innerHTML = buildThemeOptions();
        bindThemeSelectAccent(themeSelect);
    }
    const moodSelect = $("moodSelect");
    if (moodSelect)
        moodSelect.innerHTML = buildMoodOptions();
    const modifierSelect = $("modifierSelect");
    if (modifierSelect) {
        const options = MODIFIERS.filter((mod) => mod.id === "None" || getModifierInventoryCount(mod.id) > 0);
        modifierSelect.innerHTML = options.map((mod) => {
            if (mod.id === "None")
                return `<option value="${mod.id}">${mod.label}</option>`;
            const count = getModifierInventoryCount(mod.id);
            return `<option value="${mod.id}">${mod.label} (x${count})</option>`;
        }).join("");
    }
    const actTypeSelect = $("actTypeSelect");
    if (actTypeSelect)
        actTypeSelect.innerHTML = ACT_TYPES.map((type) => `<option value="${type}">${type}</option>`).join("");
    const actAlignmentSelect = $("actAlignmentSelect");
    if (actAlignmentSelect)
        actAlignmentSelect.innerHTML = ALIGNMENTS.map((a) => `<option value="${a}">${a}</option>`).join("");
    const genreThemeFilter = $("genreThemeFilter");
    if (genreThemeFilter) {
        genreThemeFilter.innerHTML = buildThemeOptions([{ value: "All", label: "All Themes" }]);
        bindThemeSelectAccent(genreThemeFilter);
    }
    const genreMoodFilter = $("genreMoodFilter");
    if (genreMoodFilter) {
        genreMoodFilter.innerHTML = buildMoodOptions([{ value: "All", label: "All Moods" }]);
    }
    const cccThemeFilter = $("cccThemeFilter");
    if (cccThemeFilter) {
        cccThemeFilter.innerHTML = buildThemeOptions([{ value: "All", label: "All Themes" }]);
        bindThemeSelectAccent(cccThemeFilter);
    }
    const cccMoodFilter = $("cccMoodFilter");
    if (cccMoodFilter) {
        cccMoodFilter.innerHTML = buildMoodOptions([{ value: "All", label: "All Moods" }]);
    }
    const quickActFilters = state.ui.quickActFilters || {};
    const quickActGroupSize = $("quickActGroupSize");
    if (quickActGroupSize) {
        const options = [
            { value: "2-3", label: "2-3 (random)" },
            { value: "2", label: "2 members" },
            { value: "3", label: "3 members" }
        ];
        quickActGroupSize.innerHTML = options.map((opt) => `<option value="${opt.value}">${opt.label}</option>`).join("");
        quickActGroupSize.value = quickActFilters.groupSize || "2-3";
    }
    const quickActGenderFilter = $("quickActGenderFilter");
    if (quickActGenderFilter) {
        const options = [
            { value: "", label: "Any Gender" },
            { value: "man", label: "Man" },
            { value: "woman", label: "Woman" },
            { value: "nonbinary", label: "Non-binary" },
            { value: "unspecified", label: "Unspecified" }
        ];
        quickActGenderFilter.innerHTML = options.map((opt) => `<option value="${opt.value}">${opt.label}</option>`).join("");
        quickActGenderFilter.value = quickActFilters.genderIdentity || "";
    }
    const quickActAgeGroupFilter = $("quickActAgeGroupFilter");
    if (quickActAgeGroupFilter) {
        const groups = Array.from(new Set((state.creators || []).map((creator) => creator.ageGroup).filter(Boolean)));
        const toStart = (label) => {
            const start = Number(String(label).split("-")[0]);
            return Number.isFinite(start) ? start : 0;
        };
        groups.sort((a, b) => toStart(a) - toStart(b) || String(a).localeCompare(String(b)));
        quickActAgeGroupFilter.innerHTML = [
            `<option value="">Any Age Group</option>`,
            ...groups.map((group) => `<option value="${group}">${group}</option>`)
        ].join("");
        quickActAgeGroupFilter.value = quickActFilters.ageGroup || "";
    }
    const quickActThemeFilter = $("quickActThemeFilter");
    if (quickActThemeFilter) {
        quickActThemeFilter.innerHTML = buildThemeOptions([{ value: "Any", label: "Any Theme" }]);
        quickActThemeFilter.value = quickActFilters.theme || "Any";
        bindThemeSelectAccent(quickActThemeFilter);
    }
    const quickActMoodFilter = $("quickActMoodFilter");
    if (quickActMoodFilter) {
        quickActMoodFilter.innerHTML = buildMoodOptions([{ value: "Any", label: "Any Mood" }]);
        quickActMoodFilter.value = quickActFilters.mood || "Any";
    }
    const quickActAlignmentFilter = $("quickActAlignmentFilter");
    if (quickActAlignmentFilter) {
        const options = ["Label", ...ALIGNMENTS];
        quickActAlignmentFilter.innerHTML = options.map((value) => {
            const label = value === "Label" ? "Label Alignment" : value;
            return `<option value="${value}">${label}</option>`;
        }).join("");
        quickActAlignmentFilter.value = quickActFilters.alignment || "Label";
    }
    const quickActSkillMin = $("quickActSkillMin");
    if (quickActSkillMin) {
        const options = [
            `<option value="">Any</option>`,
            ...Array.from({ length: 10 }, (_, index) => `<option value="${index + 1}">Level ${index + 1}</option>`)
        ];
        quickActSkillMin.innerHTML = options.join("");
        quickActSkillMin.value = Number.isFinite(quickActFilters.minSkillLevel)
            ? String(quickActFilters.minSkillLevel)
            : "";
    }
    const quickActSkillMax = $("quickActSkillMax");
    if (quickActSkillMax) {
        const options = [
            `<option value="">Any</option>`,
            ...Array.from({ length: 10 }, (_, index) => `<option value="${index + 1}">Level ${index + 1}</option>`)
        ];
        quickActSkillMax.innerHTML = options.join("");
        quickActSkillMax.value = Number.isFinite(quickActFilters.maxSkillLevel)
            ? String(quickActFilters.maxSkillLevel)
            : "";
    }
    const trendScopeSelect = $("trendScopeSelect");
    if (trendScopeSelect)
        trendScopeSelect.value = state.ui.trendScopeType || "global";
    const eraRolloutSelect = $("eraRolloutSelect");
    if (eraRolloutSelect) {
        eraRolloutSelect.innerHTML = ROLLOUT_PRESETS.map((preset) => `<option value="${preset.id}">${preset.label}</option>`).join("");
    }
    const eraPlanTheme = $("eraPlanTheme");
    if (eraPlanTheme) {
        eraPlanTheme.innerHTML = buildThemeOptions([{ value: "Any", label: "Any Theme" }]);
        eraPlanTheme.value = state.ui.eraPlan?.themeTarget || "Any";
        bindThemeSelectAccent(eraPlanTheme);
    }
    const eraPlanMood = $("eraPlanMood");
    if (eraPlanMood) {
        eraPlanMood.innerHTML = buildMoodOptions([{ value: "Any", label: "Any Mood" }]);
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
    if (eraPlanGoals)
        eraPlanGoals.value = state.ui.eraPlan?.goals || "";
    const eraPlanSchedule = $("eraPlanSchedule");
    if (eraPlanSchedule)
        eraPlanSchedule.value = state.ui.eraPlan?.scheduleNote || "";
    const eraPlanPlannedReleases = $("eraPlanPlannedReleases");
    if (eraPlanPlannedReleases) {
        const planned = state.ui.eraPlan?.plannedReleaseIds || [];
        eraPlanPlannedReleases.value = planned.join(", ");
    }
    const projectTypeSelect = $("projectTypeSelect");
    if (projectTypeSelect && !projectTypeSelect.value)
        projectTypeSelect.value = "Single";
    if (labelAlignment)
        labelAlignment.value = state.label.alignment;
    if (trackAlignment)
        trackAlignment.value = state.label.alignment;
    if (actAlignmentSelect)
        actAlignmentSelect.value = state.label.alignment;
    const eraSeed = getActiveEras()[0];
    if (eraSeed && eraSeed.rolloutId && eraRolloutSelect) {
        eraRolloutSelect.value = eraSeed.rolloutId;
    }
    const labelNameInput = $("labelNameInput");
    if (labelNameInput)
        labelNameInput.value = state.label.name;
    if (genreThemeFilter) {
        genreThemeFilter.value = state.ui.genreTheme || "All";
        setThemeSelectAccent(genreThemeFilter);
    }
    if (genreMoodFilter)
        genreMoodFilter.value = state.ui.genreMood || "All";
    if (cccThemeFilter) {
        cccThemeFilter.value = state.ui.cccThemeFilter || "All";
        setThemeSelectAccent(cccThemeFilter);
    }
    if (cccMoodFilter)
        cccMoodFilter.value = state.ui.cccMoodFilter || "All";
    const cccSort = $("cccSort");
    if (cccSort)
        cccSort.value = state.ui.cccSort || "default";
    updateActMemberFields();
    renderSlots();
    updateGenrePreview();
}
function updateActMemberFields() {
    const actTypeSelect = $("actTypeSelect");
    if (!actTypeSelect)
        return;
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
function renderAutoAssignModal() {
    const roles = ["Songwriter", "Performer", "Producer"];
    const blocks = roles.map((role) => {
        const candidates = rankCandidates(role).slice(0, 5);
        const req = staminaRequirement(role);
        const label = roleLabel(role);
        if (!candidates.length) {
            return `
        <div class="auto-assign-role">
          <h3>${label}</h3>
          <div class="muted">No candidates available.</div>
        </div>
      `;
        }
        return `
      <div class="auto-assign-role">
        <h3>${label}</h3>
        ${candidates.map((creator) => {
            const staminaPct = Math.round((creator.stamina / STAMINA_MAX) * 100);
            const catharsisScore = getCreatorCatharsisScore(creator);
            const catharsisGrade = scoreGrade(catharsisScore);
            const skillGrade = scoreGrade(creator.skill);
            const overuseSafe = getCreatorStaminaSpentToday(creator) + req <= STAMINA_OVERUSE_LIMIT;
            const canAssign = creator.ready && overuseSafe;
            return `
          <div class="list-item">
            <div class="auto-assign-candidate">
              <div>
                <div class="item-title">${renderCreatorName(creator)}</div>
                <div class="bar"><span style="width:${staminaPct}%"></span></div>
                <div class="muted">Stamina ${creator.stamina} / ${STAMINA_MAX}</div>
                <div class="muted">${formatCreatorAgeMeta(creator)}</div>
                <div class="muted">ID ${creator.id} | Skill <span class="grade-text" data-grade="${skillGrade}">${creator.skill}</span></div>
                <div class="muted">${renderCreatorSkillProgress(creator)}</div>
                <div class="muted">Catharsis <span class="grade-text" data-grade="${catharsisGrade}">${catharsisScore}</span></div>
              </div>
              <div class="actions">
                ${creator.ready ? "" : `<span class="tag low">Low stamina</span>`}
                ${overuseSafe ? "" : `<span class="tag low">Overuse limit</span>`}
                <button type="button" class="ghost" data-assign-role="${role}" data-assign-id="${creator.id}"${canAssign ? "" : " disabled"}>Assign</button>
              </div>
            </div>
            <div class="muted">Needs ${req} stamina for ${label} stage</div>
          </div>
        `;
        }).join("")}
      </div>
    `;
    });
    $("autoAssignList").innerHTML = blocks.join("");
}
function renderTime() {
    $("timeDisplay").textContent = formatDate(state.time.epochMs);
    $("weekDisplay").textContent = formatWeekRangeLabel(weekIndex() + 1);
    const chartHours = hoursUntilNextScheduledTime(WEEKLY_SCHEDULE.chartUpdate);
    $("chartCountdown").textContent = `Charts update in ${formatHourCountdown(chartHours, { padHours: 3 })}h`;
    const mode = getGameMode(state.meta?.gameMode);
    const modeLabel = shortGameModeLabel(mode.label);
    const modeEl = $("gameModeDisplay");
    if (modeEl) {
        modeEl.textContent = modeLabel || "-";
        if (mode?.id) {
            modeEl.dataset.mode = mode.id;
        }
        else {
            modeEl.removeAttribute("data-mode");
        }
        modeEl.setAttribute("title", mode.label || "");
        modeEl.setAttribute("aria-label", mode.label ? `Game mode: ${mode.label}` : "Game mode");
    }
    const difficulty = getGameDifficulty(state.meta?.difficulty);
    const difficultyEl = $("gameDifficultyDisplay");
    if (difficultyEl) {
        difficultyEl.textContent = difficulty?.label || "-";
        if (difficulty?.id) {
            difficultyEl.dataset.difficulty = difficulty.id;
        }
        else {
            difficultyEl.removeAttribute("data-difficulty");
        }
        difficultyEl.setAttribute("title", difficulty?.label || "");
        difficultyEl.setAttribute("aria-label", difficulty?.label ? `Game difficulty: ${difficulty.label}` : "Game difficulty");
    }
}
function renderFocusEraStatus() {
    const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
    const focusEra = getFocusedEra();
    const fallbackEra = !focusEra && activeEras.length === 1 ? activeEras[0] : null;
    const displayEra = focusEra || fallbackEra;
    const act = displayEra ? getAct(displayEra.actId) : null;
    const actName = act ? act.name : null;
    const actLabel = act ? renderActName(act) : "";
    const stageName = displayEra ? ERA_STAGES[displayEra.stageIndex] || "Active" : "";
    const baseLabel = displayEra
        ? `${displayEra.name}${actLabel ? ` (${actLabel})` : ""}${stageName ? ` | ${stageName}` : ""}`
        : "";
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
        headerEl.innerHTML = headerLabel;
        if (displayEra) {
            const stageName = ERA_STAGES[displayEra.stageIndex] || "Active";
            const actTitle = act ? formatActNamePlain(act) : "Unknown";
            headerEl.title = `Act: ${actTitle} | Stage: ${stageName}`;
        }
        else {
            headerEl.title = "";
        }
    }
    const labelEl = $("eraFocusLabel");
    if (labelEl)
        labelEl.innerHTML = detailLabel;
    const promoEl = $("promoFocusLabel");
    if (promoEl)
        promoEl.innerHTML = promoLabel;
    const clearBtn = $("eraFocusClear");
    if (clearBtn)
        clearBtn.disabled = !focusEra;
    const promoBtn = $("promoFocusPickBtn");
    if (promoBtn)
        promoBtn.disabled = !displayEra;
}
function renderStats() {
    $("cashDisplay").textContent = formatMoney(state.label.cash);
    const counts = getStudioUsageCounts();
    const ownedSlots = getOwnedStudioSlots();
    const totalSlots = ownedSlots + counts.leased;
    state.studio.inUse = counts.total;
    $("studioDisplay").textContent = `${counts.total} / ${totalSlots}`;
    $("slotDisplay").textContent = session.activeSlot ? `Slot ${session.activeSlot}` : "-";
    $("slotTargetDisplay").textContent = state.ui.slotTarget ? describeSlot(state.ui.slotTarget) : "-";
    const hudStatsExtra = $("hudStatsExtra");
    const hudStatsMore = $("hudStatsMoreBtn");
    const hudStatsExpanded = Boolean(state.ui?.hudStatsExpanded);
    if (hudStatsExtra)
        hudStatsExtra.classList.toggle("hidden", !hudStatsExpanded);
    if (hudStatsMore) {
        hudStatsMore.textContent = hudStatsExpanded ? "Less" : "More";
        hudStatsMore.setAttribute("aria-expanded", String(hudStatsExpanded));
    }
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
        }
        else if (state.meta.bailoutUsed) {
            $("bailoutStatus").textContent = "Bailout used: win flagged.";
        }
        else {
            $("bailoutStatus").textContent = "";
        }
    }
    if ($("winTrackDisplay")) {
        if (state.meta.winState) {
            const bailoutTag = state.meta.winState.bailoutUsed || state.meta.bailoutUsed ? " (Bailout)" : "";
            $("winTrackDisplay").textContent = `Won ${state.meta.winState.year}${bailoutTag}`;
        }
        else {
            const year = currentYear();
            if (year < 4000)
                $("winTrackDisplay").textContent = "12 Requests (avoid monopoly)";
            else
                $("winTrackDisplay").textContent = "Final Year 4000 verdict";
        }
    }
    renderFocusEraStatus();
}
function getCreatePendingCounts() {
    const counts = { sheet: 0, demo: 0 };
    if (!Array.isArray(state.tracks))
        return { ...counts, total: 0 };
    state.tracks.forEach((track) => {
        if (!track)
            return;
        const stageIndex = Number(track.stageIndex);
        if (!Number.isFinite(stageIndex))
            return;
        if (stageIndex === 0)
            counts.sheet += 1;
        if (stageIndex === 1)
            counts.demo += 1;
    });
    return { ...counts, total: counts.sheet + counts.demo };
}
function getReleaseReadyCount() {
    if (!Array.isArray(state.tracks))
        return 0;
    return state.tracks.filter((track) => track?.status === "Ready").length;
}
function renderNotificationsButton() {
    const button = $("notificationsBtn");
    if (!button)
        return;
    const badge = button.querySelector("[data-notification-total]");
    const createCounts = getCreatePendingCounts();
    const releaseCount = getReleaseReadyCount();
    const total = createCounts.total + releaseCount;
    const target = releaseCount > 0 ? "release" : (createCounts.total > 0 ? "create" : "");
    const titleParts = [];
    if (releaseCount > 0)
        titleParts.push(`${formatCount(releaseCount)} ready`);
    if (createCounts.total > 0) {
        titleParts.push(`${formatCount(createCounts.total)} pending (${createCounts.sheet} sheet, ${createCounts.demo} demo)`);
    }
    if (badge) {
        badge.textContent = formatCount(total);
        badge.classList.toggle("is-hidden", total <= 0);
    }
    button.classList.toggle("has-notifications", total > 0);
    if (target) {
        button.dataset.notificationTarget = target;
    }
    else {
        delete button.dataset.notificationTarget;
    }
    if (titleParts.length) {
        const detail = titleParts.join(" | ");
        button.setAttribute("aria-label", `Alerts: ${detail}`);
        button.setAttribute("title", detail);
    }
    else {
        button.setAttribute("aria-label", "Alerts");
        button.setAttribute("title", "Alerts");
    }
}
function buildLabelRankingMeta() {
    const fallbackSinceAt = Number.isFinite(state.time?.startEpochMs)
        ? state.time.startEpochMs
        : (Number.isFinite(state.time?.epochMs) ? state.time.epochMs : Date.now());
    const metaByLabel = new Map();
    const ensure = (label) => {
        if (!label)
            return null;
        const key = String(label);
        if (!metaByLabel.has(key))
            metaByLabel.set(key, { sinceAt: fallbackSinceAt });
        return metaByLabel.get(key);
    };
    const addBaseMeta = (label, { country = null, cash = null } = {}) => {
        const meta = ensure(label);
        if (!meta)
            return;
        if (country)
            meta.country = country;
        if (Number.isFinite(cash))
            meta.cash = cash;
    };
    addBaseMeta(state.label?.name, {
        country: state.label?.country,
        cash: state.label?.wallet?.cash ?? state.label?.cash
    });
    if (Array.isArray(state.rivals)) {
        state.rivals.forEach((rival) => {
            addBaseMeta(rival?.name, {
                country: rival?.country,
                cash: rival?.wallet?.cash ?? rival?.cash
            });
        });
    }
    if (Array.isArray(state.marketTracks)) {
        state.marketTracks.forEach((entry) => {
            const meta = ensure(entry?.label);
            if (!meta)
                return;
            const releasedAt = Number.isFinite(entry?.releasedAt) ? entry.releasedAt : null;
            if (releasedAt && releasedAt < meta.sinceAt)
                meta.sinceAt = releasedAt;
            if (!meta.country && entry?.country)
                meta.country = entry.country;
        });
    }
    return { metaByLabel, fallbackSinceAt };
}
function buildLabelUsageByName() {
    const usageByLabel = new Map();
    if (!Array.isArray(state.marketTracks))
        return usageByLabel;
    state.marketTracks.forEach((entry) => {
        if (!entry)
            return;
        const label = String(entry.label || "").trim();
        if (!label)
            return;
        const theme = entry.theme || themeFromGenre(entry.genre);
        const mood = entry.mood || moodFromGenre(entry.genre);
        const current = usageByLabel.get(label) || { total: 0, themes: {}, moods: {} };
        current.total += 1;
        if (theme)
            current.themes[theme] = (current.themes[theme] || 0) + 1;
        if (mood)
            current.moods[mood] = (current.moods[mood] || 0) + 1;
        usageByLabel.set(label, current);
    });
    return usageByLabel;
}
function pickTopUsage(counts) {
    const entries = Object.entries(counts || {});
    if (!entries.length)
        return null;
    entries.sort((a, b) => {
        const diff = b[1] - a[1];
        if (diff !== 0)
            return diff;
        return String(a[0]).localeCompare(String(b[0]));
    });
    return { value: entries[0][0], count: entries[0][1] };
}
function getLabelUsageSummary(labelName, usageByLabel) {
    if (!usageByLabel) {
        return { total: 0, theme: null, themeCount: 0, mood: null, moodCount: 0 };
    }
    const key = String(labelName || "").trim();
    const usage = usageByLabel.get(key) || { total: 0, themes: {}, moods: {} };
    const themeTop = pickTopUsage(usage.themes);
    const moodTop = pickTopUsage(usage.moods);
    return {
        total: usage.total || 0,
        theme: themeTop?.value || null,
        themeCount: themeTop?.count || 0,
        mood: moodTop?.value || null,
        moodCount: moodTop?.count || 0
    };
}
function renderLabelUsageColumn(labelName, usageByLabel) {
    const usage = getLabelUsageSummary(labelName, usageByLabel);
    if (!usage.total) {
        return `
      <div class="label-rank-usage">
        <div class="muted">Top Theme / Mood</div>
        <div class="label-usage-empty muted">No releases yet</div>
      </div>
    `;
    }
    const alignment = labelName === state.label?.name
        ? state.label?.alignment
        : getRivalByName(labelName)?.alignment;
    const themeTag = usage.theme ? renderThemeTag(usage.theme) : `<span class="muted">-</span>`;
    const moodTag = usage.mood ? renderMoodTag(usage.mood, alignment) : `<span class="muted">-</span>`;
    return `
    <div class="label-rank-usage">
      <div class="muted">Top Theme / Mood</div>
      <div class="label-usage-tags">
        ${themeTag}
        ${moodTag}
      </div>
    </div>
  `;
}
function getLabelRankingStatus(points, meta) {
    if (points > 0)
        return null;
    const cash = meta?.cash;
    if (Number.isFinite(cash) && cash <= 0)
        return "bankrupted";
    return "inactive";
}
function buildLabelRankingList({ limit = null, showMore = false, showUsage = false } = {}) {
    const fullRanking = getLabelRanking();
    const { metaByLabel, fallbackSinceAt } = buildLabelRankingMeta();
    const usageByLabel = showUsage ? buildLabelUsageByName() : null;
    const visible = typeof limit === "number" ? fullRanking.slice(0, limit) : fullRanking;
    if (!visible.length) {
        return { markup: `<div class="muted">No labels yet.</div>`, visibleCount: 0, totalCount: fullRanking.length };
    }
    const list = visible.map((row, index) => {
        const labelName = row[0];
        const points = row[1];
        const meta = metaByLabel.get(labelName) || { sinceAt: fallbackSinceAt };
        const sinceAt = Number.isFinite(meta.sinceAt) ? meta.sinceAt : fallbackSinceAt;
        const status = getLabelRankingStatus(points, meta);
        const statusLabel = status === "bankrupted" ? "Bankrupted" : "Inactive";
        const statusMarkup = status ? `<span class="label-status label-status--${status}">${statusLabel}</span>` : "";
        const country = meta.country || getRivalByName(labelName)?.country || state.label.country;
        const moreAction = showMore && index === 0
            ? `<button type="button" class="ghost mini" data-ranking-more="labels">More</button>`
            : "";
        const usageMarkup = showUsage ? renderLabelUsageColumn(labelName, usageByLabel) : "";
        const rowClass = showUsage ? "list-row label-ranking-row" : "list-row";
        return `
      <div class="list-item">
        <div class="${rowClass}">
          <div class="label-rank">
            <div class="item-title">#${index + 1} ${renderLabelTag(labelName, country)}</div>
            <div class="label-rank-meta">
              <span class="muted">Since ${formatShortDate(sinceAt)}</span>
              ${statusMarkup}
            </div>
          </div>
          ${usageMarkup}
          <div class="ranking-actions">
            <span class="muted">${formatCount(points)} pts</span>
            ${moreAction}
          </div>
        </div>
      </div>
    `;
    });
    return { markup: list.join(""), visibleCount: visible.length, totalCount: fullRanking.length };
}
function renderCommunityLabels() {
    const listEl = $("topLabelsWorldList");
    if (!listEl)
        return;
    const limit = getCommunityLabelRankingLimit();
    const { markup, visibleCount, totalCount } = buildLabelRankingList({ limit, showMore: true });
    listEl.innerHTML = markup;
    const meta = $("labelRankingMeta");
    if (meta) {
        if (!totalCount) {
            meta.textContent = "No labels ranked yet.";
        }
        else if (visibleCount >= totalCount) {
            meta.textContent = `Showing ${formatCount(totalCount)} labels.`;
        }
        else {
            meta.textContent = `Showing Top ${formatCount(visibleCount)} of ${formatCount(totalCount)} labels.`;
        }
    }
}
function renderTopBar() {
    const ranking = getLabelRanking(3);
    const labelsMarkup = ranking.length
        ? ranking.map((row, index) => `
        <div class="top-mini-item">
          <span>${index + 1}. ${renderLabelTag(row[0], (getRivalByName(row[0])?.country || state.label.country))}</span>
          <span class="muted">${formatCount(row[1])} pts</span>
        </div>
      `).join("")
        : `<div class="muted">No labels yet</div>`;
    const { visible: rankedTrends } = collectTrendRanking();
    const trendRanking = rankedTrends.length ? rankedTrends : (state.trends || []);
    const trendsMarkup = trendRanking.length
        ? trendRanking.slice(0, TREND_DETAIL_COUNT).map((trend, index) => `
        <div class="top-mini-item">
          <span>${index + 1}. ${renderGenrePillsFromGenre(trend)}</span>
        </div>
      `).join("")
        : `<div class="muted">No trends yet</div>`;
    const headerList = $("topLabelsHeaderList");
    if (headerList)
        headerList.innerHTML = labelsMarkup;
    const trendsList = $("topTrendsHeaderList");
    if (trendsList)
        trendsList.innerHTML = trendsMarkup;
    const labelsMoreBtn = $("topLabelsMoreBtn");
    if (labelsMoreBtn)
        labelsMoreBtn.disabled = !ranking.length;
    const trendsMoreBtn = $("topTrendsMoreBtn");
    if (trendsMoreBtn)
        trendsMoreBtn.disabled = !trendRanking.length;
    const rankingWindow = $("rankingWindow");
    if (rankingWindow && !rankingWindow.classList.contains("hidden")) {
        const category = rankingWindow.dataset.category || "labels";
        renderRankingWindow(category);
    }
    const topActNameEl = $("topActName");
    if (topActNameEl) {
        const topAct = getTopActSnapshot();
        topActNameEl.innerHTML = topAct ? `Top Act: ${renderActName(topAct)}` : "Top Act: -";
        $("topActPortrait").textContent = topAct ? topAct.initials : "RLS";
        $("topActPortrait").style.background = topAct ? topAct.color : "";
        $("topActPortrait").style.color = topAct ? topAct.textColor : "";
    }
}
function buildChartPulsePromoEntries({ startAt, endAt, scopeType, scopeTarget }) {
    const entries = [];
    const scopeNation = scopeType === "global"
        ? null
        : scopeType === "nation"
            ? scopeTarget
            : REGION_DEFS.find((region) => region.id === scopeTarget)?.nation || null;
    const allowCountry = (country) => !scopeNation || country === scopeNation;
    const labelName = state.label?.name || "Label";
    const labelCountry = state.label?.country || "Annglora";
    if (Array.isArray(state.scheduledEvents) && allowCountry(labelCountry)) {
        state.scheduledEvents.forEach((entry) => {
            if (entry.status === "Cancelled")
                return;
            if (!Number.isFinite(entry.scheduledAt))
                return;
            if (entry.scheduledAt < startAt || entry.scheduledAt >= endAt)
                return;
            const details = PROMO_TYPE_DETAILS[entry.actionType];
            if (!details)
                return;
            const track = entry.contentId ? getTrack(entry.contentId) : null;
            const act = entry.actId ? getAct(entry.actId) : track ? getAct(track.actId) : null;
            entries.push({
                id: entry.id,
                ts: entry.scheduledAt,
                title: track ? track.title : details.label,
                actName: act ? act.name : "Unknown",
                actNameKey: act?.nameKey || null,
                label: labelName,
                typeLabel: details.label,
                impact: details.cost
            });
        });
    }
    if (Array.isArray(state.rivalReleaseQueue)) {
        state.rivalReleaseQueue.forEach((entry) => {
            if ((entry.queueType || "release") !== "promo")
                return;
            if (!Number.isFinite(entry.releaseAt))
                return;
            if (entry.releaseAt < startAt || entry.releaseAt >= endAt)
                return;
            const details = PROMO_TYPE_DETAILS[entry.promoType];
            if (!details)
                return;
            const rival = getRivalByName(entry.label);
            const rivalCountry = rival?.country || entry.country || labelCountry;
            if (!allowCountry(rivalCountry))
                return;
            entries.push({
                id: entry.id,
                ts: entry.releaseAt,
                title: entry.title || details.label,
                actName: entry.actName || "Promotion",
                actNameKey: entry.actNameKey || null,
                label: entry.label || "Rival",
                typeLabel: details.label,
                impact: details.cost
            });
        });
    }
    return entries
        .sort((a, b) => b.impact - a.impact || a.ts - b.ts)
        .slice(0, 5)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
}
const DASHBOARD_FOCUS_PANELS = ["charts", "quests", "requests", "eras"];
function normalizeDashboardFocusPanel(value) {
    return DASHBOARD_FOCUS_PANELS.includes(value) ? value : "charts";
}
function renderDashboardFocusPanels() {
    const tabs = $("dashboardFocusTabs");
    const panels = typeof document === "undefined"
        ? []
        : Array.from(document.querySelectorAll("[data-dashboard-focus-panel]"));
    if (!tabs && !panels.length)
        return;
    const active = normalizeDashboardFocusPanel(state.ui.dashboardFocusPanel);
    if (state.ui.dashboardFocusPanel !== active) {
        state.ui.dashboardFocusPanel = active;
    }
    if (tabs) {
        tabs.querySelectorAll(".tab").forEach((tab) => {
            const isActive = tab.dataset.dashboardFocus === active;
            tab.classList.toggle("active", isActive);
            tab.setAttribute("aria-pressed", String(isActive));
        });
    }
    panels.forEach((panel) => {
        const isActive = panel.dataset.dashboardFocusPanel === active;
        panel.classList.toggle("is-active", isActive);
        panel.setAttribute("aria-hidden", String(!isActive));
    });
}
function formatAudienceHour(hour) {
    if (!Number.isFinite(hour))
        return "--";
    return `${String(Math.round(hour)).padStart(2, "0")}:00`;
}
function formatAudienceActiveHours(chunk) {
    const hours = chunk?.activeHours || null;
    const label = hours?.label || chunk?.timeProfile || "Active";
    const start = Number.isFinite(hours?.startHour) ? formatAudienceHour(hours.startHour) : null;
    const end = Number.isFinite(hours?.endHour) ? formatAudienceHour(hours.endHour) : null;
    if (start && end)
        return `${label} ${start}-${end}`;
    return label;
}
function renderAudienceChunks({ listId, metaId, limit = 8 } = {}) {
    const listEl = $(listId || "dashboardAudienceList");
    if (!listEl)
        return;
    const metaEl = $(metaId || "dashboardAudienceMeta");
    const snapshot = getAudienceChunksSnapshot();
    const chunks = Array.isArray(snapshot?.chunks) ? snapshot.chunks : [];
    const year = Number.isFinite(snapshot?.lastUpdateYear) ? snapshot.lastUpdateYear : currentYear();
    if (metaEl) {
        const updated = Number.isFinite(snapshot?.lastUpdateAt) ? formatShortDate(snapshot.lastUpdateAt) : null;
        metaEl.textContent = updated
            ? `${formatCount(chunks.length)} chunks | Year ${year} | Updated ${updated}`
            : `${formatCount(chunks.length)} chunks | Year ${year}`;
    }
    if (!chunks.length) {
        listEl.innerHTML = `<div class="muted">No audience chunks yet.</div>`;
        return;
    }
    const ordered = chunks
        .slice()
        .sort((a, b) => (a.nation || "").localeCompare(b.nation || "") || (b.age || 0) - (a.age || 0));
    const display = ordered.slice(0, limit);
    listEl.innerHTML = display.map((chunk) => {
        const community = formatGenreKeyLabel(chunk.communityId || "");
        const age = Number.isFinite(chunk.age) ? `Age ${chunk.age}` : "Age -";
        const ageGroup = chunk.ageGroup ? `(${chunk.ageGroup})` : "";
        const generation = chunk.generation ? `Gen ${chunk.generation}` : "Gen -";
        const budget = Number.isFinite(chunk.weeklyBudget) ? `${formatMoney(chunk.weeklyBudget)}/wk` : "-";
        const engagement = Number.isFinite(chunk.engagementRate) ? `${Math.round(chunk.engagementRate * 100)}%` : "-";
        const hours = Number.isFinite(chunk.weeklyHours) ? `${chunk.weeklyHours}h/wk` : "-";
        const life = chunk.lifeExpectancy?.label || "-";
        const repro = Number.isFinite(chunk.reproductionRate) ? chunk.reproductionRate : "-";
        const emigrate = Number.isFinite(chunk.emigrationRate) ? `${Math.round(chunk.emigrationRate * 100)}%` : "-";
        const themes = Array.isArray(chunk.prefThemes) && chunk.prefThemes.length ? chunk.prefThemes.join(", ") : "-";
        const moods = Array.isArray(chunk.prefMoods) && chunk.prefMoods.length ? chunk.prefMoods.join(", ") : "-";
        return `
      <div class="list-item">
        <div class="item-title">${community}</div>
        <div class="muted">${chunk.nation || "Unknown"} | ${age} ${ageGroup} | ${generation}</div>
        <div class="muted">Budget (int.) ${budget} | Engage ${engagement} | Time ${hours} | ${formatAudienceActiveHours(chunk)}</div>
        <div class="tiny muted">Life ${life} | Repro ${repro} | Emigrate ${emigrate}</div>
        <div class="tiny muted">Prefs: Themes ${themes} | Moods ${moods}</div>
      </div>
    `;
    }).join("");
}
function renderDashboard() {
    const statsEl = $("dashboardStats");
    if (!statsEl)
        return;
    renderDashboardFocusPanels();
    const weekLabel = $("dashboardWeekLabel");
    if (weekLabel)
        weekLabel.textContent = formatWeekRangeLabel(weekIndex() + 1);
    const dateLabel = $("dashboardDateLabel");
    if (dateLabel)
        dateLabel.textContent = formatDate(state.time.epochMs);
    const activeTracks = state.tracks.filter((track) => track.status !== "Released");
    const releasedTracks = state.tracks.filter((track) => track.status === "Released");
    const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
    const focusEra = getFocusedEra();
    const studioCounts = getStudioUsageCounts();
    const ownedSlots = getOwnedStudioSlots();
    const totalSlots = ownedSlots + studioCounts.leased;
    const topTrend = getTopTrendGenre() || "-";
    const topAct = getTopActSnapshot();
    const stats = [
        { label: "Cash", value: formatMoney(state.label.cash), detail: `Weekly ${formatMoney(state.economy.lastRevenue || 0)}` },
        { label: "Active Tracks", value: formatCount(activeTracks.length), detail: `Released ${formatCount(releasedTracks.length)}` },
        { label: "Creators", value: formatCount(state.creators.length), detail: `Acts ${formatCount(state.acts.length)}` },
        { label: "Studios", value: `${studioCounts.total}/${totalSlots}`, detail: `Owned ${ownedSlots}` },
        { label: "Active Eras", value: formatCount(activeEras.length), detail: focusEra ? `Focus ${focusEra.name}` : "No focus era" },
        { label: "Top Trend", value: topTrend, detail: topAct ? `Top Act ${topAct.name}` : "Top Act -" }
    ];
    statsEl.innerHTML = stats.map((stat) => `
    <div class="dashboard-stat">
      <div class="stat-label">${stat.label}</div>
      <div class="stat-value">${stat.value}</div>
      <div class="tiny muted">${stat.detail}</div>
    </div>
  `).join("");
    const workOrdersEl = $("dashboardWorkOrders");
    if (workOrdersEl) {
        const activeOrders = state.workOrders.filter((order) => order.status === "In Progress");
        if (!activeOrders.length) {
            workOrdersEl.innerHTML = `<div class="muted">No active work orders.</div>`;
        }
        else {
            const now = state.time.epochMs;
            const list = activeOrders
                .slice(0, 5)
                .map((order) => {
                const track = getTrack(order.trackId);
                const crewIds = getWorkOrderCreatorIds(order);
                const crew = crewIds.map((id) => getCreator(id)).filter(Boolean);
                const crewLabel = buildWorkOrderCrewLabel(crew);
                const stage = STAGES[order.stageIndex];
                const hoursLeft = Math.max(0, Math.ceil((order.endAt - now) / HOUR_MS));
                const crewLine = `${stage?.name || "Stage"} | ${crewLabel.primary}`;
                const crewDetail = crewLabel.secondary ? `<div class="muted">${crewLabel.secondary}</div>` : "";
                return `
            <div class="list-item">
              <div class="list-row">
                <div>
                  <div class="item-title">${track ? renderTrackTitle(track.title) : "Unknown"}</div>
                  <div class="muted">${crewLine}</div>
                  ${crewDetail}
                </div>
                <div class="pill">${hoursLeft}h</div>
              </div>
            </div>
          `;
            });
            workOrdersEl.innerHTML = list.join("");
        }
    }
    const queueEl = $("dashboardReleaseQueue");
    if (queueEl) {
        if (!state.releaseQueue.length) {
            queueEl.innerHTML = `<div class="muted">No releases scheduled.</div>`;
        }
        else {
            const list = state.releaseQueue
                .slice()
                .sort((a, b) => (a.releaseAt || 0) - (b.releaseAt || 0))
                .slice(0, 5)
                .map((entry) => {
                const track = getTrack(entry.trackId);
                const date = entry.releaseAt ? formatDate(entry.releaseAt) : "TBD";
                const distribution = entry.distribution || entry.note || "Digital";
                return `
            <div class="list-item">
              <div class="list-row">
                <div>
                  <div class="item-title">${track ? renderTrackTitle(track.title) : "Unknown"}</div>
                  <div class="muted">${date} | ${distribution}</div>
                </div>
              </div>
            </div>
          `;
            });
            queueEl.innerHTML = list.join("");
        }
    }
    const chartsEl = $("dashboardChartsList");
    if (chartsEl) {
        const scopeTabs = $("chartPulseScopeTabs");
        const contentTabs = $("chartPulseContentTabs");
        const targetSelect = $("chartPulseTarget");
        const targetLabel = $("chartPulseTargetLabel");
        const metaEl = $("chartPulseMeta");
        const contentType = state.ui.chartPulseContentType || "tracks";
        const scopeType = state.ui.chartPulseScopeType || "global";
        let scopeTarget = state.ui.chartPulseScopeTarget || "global";
        if (contentTabs) {
            contentTabs.querySelectorAll(".tab").forEach((btn) => {
                btn.classList.toggle("active", btn.dataset.chartPulseContent === contentType);
            });
        }
        if (scopeTabs) {
            scopeTabs.querySelectorAll(".tab").forEach((btn) => {
                btn.classList.toggle("active", btn.dataset.chartPulseScope === scopeType);
            });
        }
        if (scopeType === "global") {
            scopeTarget = "global";
            state.ui.chartPulseScopeTarget = scopeTarget;
            if (targetLabel)
                targetLabel.textContent = "Global";
            if (targetSelect) {
                targetSelect.disabled = true;
                targetSelect.innerHTML = `<option value="global">Global</option>`;
                targetSelect.value = "global";
            }
        }
        else if (scopeType === "nation") {
            const nations = Array.isArray(NATIONS) ? NATIONS : [];
            const labelNation = nations.includes(state.label?.country) ? state.label.country : nations[0];
            if (!nations.includes(scopeTarget))
                scopeTarget = labelNation || "";
            state.ui.chartPulseScopeTarget = scopeTarget;
            if (targetLabel)
                targetLabel.textContent = "Nation";
            if (targetSelect) {
                targetSelect.disabled = false;
                targetSelect.innerHTML = nations.map((nation) => `<option value="${nation}">${nation}</option>`).join("");
                targetSelect.value = scopeTarget;
            }
        }
        else {
            const regions = Array.isArray(REGION_DEFS) ? REGION_DEFS : [];
            const regionIds = regions.map((region) => region.id);
            const labelRegion = regions.find((region) => region.nation === state.label?.country)?.id;
            if (!regionIds.includes(scopeTarget))
                scopeTarget = labelRegion || regionIds[0] || "";
            state.ui.chartPulseScopeTarget = scopeTarget;
            if (targetLabel)
                targetLabel.textContent = "Region";
            if (targetSelect) {
                targetSelect.disabled = false;
                targetSelect.innerHTML = regions.map((region) => `<option value="${region.id}">${region.label}</option>`).join("");
                targetSelect.value = scopeTarget;
            }
        }
        const scopeKey = scopeType === "global" ? "global" : scopeTarget;
        const scopeLabel = chartScopeLabel(scopeKey);
        const slotMs = DAY_MS / 4;
        const slotCount = 6;
        const slots = Array.from({ length: slotCount }).map((_, index) => {
            const offsetHours = index * 6;
            const slotStart = state.time.epochMs + index * slotMs;
            const slotEnd = slotStart + slotMs;
            let entries = [];
            if (contentType === "promos") {
                entries = buildChartPulsePromoEntries({
                    startAt: slotStart,
                    endAt: slotEnd,
                    scopeType,
                    scopeTarget
                });
            }
            else {
                const projected = computeChartProjectionForScope({
                    targetEpochMs: slotStart,
                    scopeType,
                    scopeTarget,
                    limit: contentType === "tracks" ? 5 : null
                });
                entries = contentType === "projects"
                    ? collectProjectChartEntries(projected).slice(0, 5)
                    : projected.slice(0, 5);
            }
            return { offsetHours, slotStart, entries };
        });
        chartsEl.innerHTML = slots.map((slot) => {
            const label = slot.offsetHours === 0 ? "Now" : `+${slot.offsetHours}h`;
            const timeLabel = formatDate(slot.slotStart);
            const emptyLabel = contentType === "promos"
                ? "No promo events in this window."
                : "No projected entries yet.";
            let entryMarkup = "";
            if (!slot.entries.length) {
                entryMarkup = `<div class="muted">${emptyLabel}</div>`;
            }
            else if (contentType === "promos") {
                entryMarkup = slot.entries.map((entry) => `
          <div class="list-item">
            <div class="list-row">
              <div>
                <div class="item-title">#${entry.rank} ${renderTrackTitle(entry.title)}</div>
                <div class="muted">${entry.typeLabel} | ${renderActName(entry) || "-"} | ${entry.label}</div>
              </div>
              <div class="pill">${formatMoney(entry.impact)}</div>
            </div>
          </div>
        `).join("");
            }
            else if (contentType === "projects") {
                entryMarkup = slot.entries.map((entry) => `
          <div class="list-item">
            <div class="list-row">
              <div>
                <div class="item-title">#${entry.rank} ${renderProjectName(entry.projectName)}</div>
                <div class="muted">${entry.projectType} | ${renderActName(entry) || "-"} | ${entry.label || "-"}</div>
              </div>
              <div class="pill">${formatCount(entry.score)}</div>
            </div>
          </div>
        `).join("");
            }
            else {
                entryMarkup = slot.entries.map((entry) => {
                    const track = entry.track || entry;
                    return `
            <div class="list-item">
              <div class="list-row">
                <div>
                  <div class="item-title">#${entry.rank} ${track?.title ? renderTrackTitle(track.title) : "Unknown Track"}</div>
                  <div class="muted">${track?.label || "Unknown"} | ${renderTrackGenrePills(track, { fallback: "Genre -" })}</div>
                </div>
                <div class="pill">${formatCount(entry.score)}</div>
              </div>
            </div>
          `;
                }).join("");
            }
            return `
        <div class="chart-pulse-slot">
          <div class="slot-head">
            <div>
              <div class="slot-label">${label}</div>
              <div class="tiny muted">${timeLabel}</div>
            </div>
          </div>
          <div class="list">
            ${entryMarkup}
          </div>
        </div>
      `;
        }).join("");
        if (metaEl) {
            const contentLabel = contentType === "projects" ? "Projects" : contentType === "promos" ? "Promos" : "Tracks";
            metaEl.textContent = contentType === "promos"
                ? `Promo feed in 6h windows • ${scopeLabel}.`
                : `Projected Top 5 every 6h • ${scopeLabel} • ${contentLabel}.`;
        }
    }
    const eraList = $("dashboardEraList");
    if (eraList) {
        if (!activeEras.length) {
            eraList.innerHTML = `<div class="muted">No active eras.</div>`;
        }
        else {
            eraList.innerHTML = activeEras.map((era) => {
                const stageName = ERA_STAGES[era.stageIndex] || "Active";
                const stageWeeks = era.rolloutWeeks || ROLLOUT_PRESETS[1].weeks;
                const stageTotal = stageWeeks[era.stageIndex] || 0;
                const weeksElapsed = Number.isFinite(era.weeksElapsed) ? era.weeksElapsed : 0;
                const startWeek = Number.isFinite(era.startedWeek) ? era.startedWeek : weekIndex() + 1;
                const currentWeek = startWeek + Math.max(0, weeksElapsed);
                const weekLabel = formatWeekRangeLabel(currentWeek);
                return `
          <div class="list-item">
            <div class="list-row">
              <div>
                <div class="item-title">${era.name}</div>
                <div class="muted">${stageName} | ${weekLabel}</div>
                <div class="tiny muted">Stage progress ${era.stageWeek}/${stageTotal}</div>
              </div>
              ${focusEra && focusEra.id === era.id ? `<span class="pill">Focus</span>` : ""}
            </div>
          </div>
        `;
            }).join("");
        }
    }
    renderQuests();
    renderRivalAchievementRace();
}
function renderPopulation() {
    if (!$("populationList"))
        return;
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
    if (Array.isArray(snapshot.ageGroups) && snapshot.ageGroups.length) {
        const ageLine = snapshot.ageGroups.map((group) => {
            const count = Number.isFinite(group.count) ? group.count : 0;
            const share = Number.isFinite(group.share)
                ? group.share
                : (snapshot.total ? count / snapshot.total : 0);
            const pct = Math.round(share * 100);
            return `${group.label}: ${formatCount(count)} (${pct}%)`;
        }).join(" | ");
        list.push(`
      <div class="list-item">
        <div class="item-title">Audience Age Split</div>
        <div class="muted">${ageLine}</div>
      </div>
    `);
    }
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
function renderRoleActions() {
    const listEl = $("roleActionsList");
    if (!listEl)
        return;
    const badgeFor = (status) => {
        const meta = ROLE_ACTION_STATUS[status] || ROLE_ACTION_STATUS.placeholder;
        return `<span class="${meta.className}">${meta.label}</span>`;
    };
    const renderAction = (action) => {
        const label = action.label ? `${action.label}${action.priority ? ` (Priority ${action.priority})` : ""}: ` : "";
        return `
      <div class="list-row">
        <div class="muted">${label}${action.verb} - ${action.detail}</div>
        ${badgeFor(action.status)}
      </div>
    `;
    };
    listEl.innerHTML = ROLE_ACTIONS.map((group) => `
    <div class="list-item">
      <div class="item-title">${group.role}</div>
      ${group.occupations.map((occupation) => `
        <div class="muted">${occupation.name}${occupation.note ? ` - ${occupation.note}` : ""}</div>
        ${occupation.actions.map(renderAction).join("")}
      `).join("")}
    </div>
  `).join("");
}
function renderTutorialEconomy() {
    const listEl = $("tutorialEconomyList");
    const tuningEl = $("tutorialEconomyTuning");
    const noticeEl = $("tutorialCheaterNotice");
    if (!listEl || !tuningEl)
        return;
    const safeNumber = (value, fallback) => (Number.isFinite(value) ? value : fallback);
    const cheaterActive = Boolean(state.meta?.cheaterMode);
    if (noticeEl) {
        noticeEl.textContent = cheaterActive
            ? "Cheater mode active. Achievements and tasks are disabled while active."
            : "Enable Cheater Mode in Settings to edit economy tuning.";
    }
    const revenueRate = safeNumber(ECONOMY_TUNING?.revenuePerChartPoint, 22);
    const upkeepPerCreator = safeNumber(ECONOMY_TUNING?.upkeepPerCreator, 150);
    const upkeepPerStudio = safeNumber(ECONOMY_TUNING?.upkeepPerOwnedStudio, 600);
    const promoStep = safeNumber(ECONOMY_TUNING?.promoWeekBudgetStep, 1200);
    const promoBase = safeNumber(ECONOMY_TUNING?.promoWeekBase, 1);
    const promoMin = safeNumber(ECONOMY_TUNING?.promoWeeksMin, 1);
    const promoMax = safeNumber(ECONOMY_TUNING?.promoWeeksMax, 4);
    const releaseFee = safeNumber(ECONOMY_BASELINES?.physicalReleaseFee, 0);
    const baseSingle = safeNumber(ECONOMY_BASELINES?.physicalSingle, 4.99);
    const unitRatio = safeNumber(ECONOMY_BASELINES?.physicalUnitCostRatio, 0.35);
    const unitCostMin = safeNumber(ECONOMY_TUNING?.physicalUnitCostMin, 0.5);
    const runMin = safeNumber(ECONOMY_BASELINES?.physicalRunMin, 200);
    const runMax = safeNumber(ECONOMY_BASELINES?.physicalRunMax, 25000);
    const runRound = safeNumber(ECONOMY_BASELINES?.physicalRunRound, 50);
    const multSingle = safeNumber(ECONOMY_PRICE_MULTIPLIERS?.single, 1);
    const multEp = safeNumber(ECONOMY_PRICE_MULTIPLIERS?.ep, 1.55);
    const multAlbum = safeNumber(ECONOMY_PRICE_MULTIPLIERS?.album, 2.25);
    const ratioLabel = `${Math.round(unitRatio * 100)}%`;
    listEl.innerHTML = [
        `
      <div class="list-item">
        <div class="item-title">Weekly revenue</div>
        <div class="muted">Revenue = sum(max(0, score) * ${formatMoney(revenueRate)}) * difficulty revenue multiplier.</div>
        <div class="tiny muted">Each track uses the same ${formatMoney(revenueRate)} per chart score point.</div>
      </div>
    `,
        `
      <div class="list-item">
        <div class="item-title">Weekly upkeep</div>
        <div class="muted">Upkeep = (creators * ${formatMoney(upkeepPerCreator)}) + (owned studios * ${formatMoney(upkeepPerStudio)}) + lease fees.</div>
        <div class="tiny muted">Final upkeep multiplies by difficulty upkeep modifier.</div>
      </div>
    `,
        `
      <div class="list-item">
        <div class="item-title">Distribution fee</div>
        <div class="muted">Physical/Both releases charge ${formatMoney(releaseFee)} upfront; Digital releases are $0.</div>
      </div>
    `,
        `
      <div class="list-item">
        <div class="item-title">Physical unit price</div>
        <div class="muted">Unit price = ${formatMoney(baseSingle)} * multiplier (Single ${multSingle}x, EP ${multEp}x, Album ${multAlbum}x).</div>
      </div>
    `,
        `
      <div class="list-item">
        <div class="item-title">Physical unit cost</div>
        <div class="muted">Unit cost = max(${formatMoney(unitCostMin)}, unit price * ${ratioLabel}).</div>
      </div>
    `,
        `
      <div class="list-item">
        <div class="item-title">Promo weeks from budget</div>
        <div class="muted">Promo weeks = clamp(floor(budget / ${formatMoney(promoStep)}) + ${formatCount(promoBase)}, ${formatCount(promoMin)} to ${formatCount(promoMax)}).</div>
      </div>
    `,
        `
      <div class="list-item">
        <div class="item-title">Physical run rounding</div>
        <div class="muted">Recommended units round to ${formatCount(runRound)} and clamp between ${formatCount(runMin)} and ${formatCount(runMax)} (budget caps apply).</div>
      </div>
    `
    ].join("");
    const attr = (name, value) => (typeof value === "undefined" || value === null ? "" : ` ${name}="${value}"`);
    const formatValue = (value, format) => {
        if (!Number.isFinite(value))
            return "-";
        if (format === "money")
            return formatMoney(value);
        if (format === "percent")
            return `${Math.round(value * 100)}%`;
        if (format === "multiplier")
            return `${value.toFixed(2)}x`;
        return formatCount(value);
    };
    const fields = [
        {
            label: "Revenue per chart score",
            detail: "Cash per chart score point.",
            target: "tuning",
            key: "revenuePerChartPoint",
            value: revenueRate,
            min: 0,
            step: 1,
            format: "money"
        },
        {
            label: "Upkeep per creator",
            detail: "Weekly upkeep per signed creator.",
            target: "tuning",
            key: "upkeepPerCreator",
            value: upkeepPerCreator,
            min: 0,
            step: 1,
            format: "money"
        },
        {
            label: "Upkeep per owned studio",
            detail: "Weekly upkeep per owned studio slot.",
            target: "tuning",
            key: "upkeepPerOwnedStudio",
            value: upkeepPerStudio,
            min: 0,
            step: 1,
            format: "money"
        },
        {
            label: "Promo budget step",
            detail: "Budget per promo week tier.",
            target: "tuning",
            key: "promoWeekBudgetStep",
            value: promoStep,
            min: 0,
            step: 50,
            format: "money"
        },
        {
            label: "Promo week base",
            detail: "Weeks added before clamp.",
            target: "tuning",
            key: "promoWeekBase",
            value: promoBase,
            min: 0,
            step: 1,
            format: "count"
        },
        {
            label: "Promo weeks min",
            detail: "Minimum promo weeks.",
            target: "tuning",
            key: "promoWeeksMin",
            value: promoMin,
            min: 0,
            step: 1,
            format: "count"
        },
        {
            label: "Promo weeks max",
            detail: "Maximum promo weeks.",
            target: "tuning",
            key: "promoWeeksMax",
            value: promoMax,
            min: 1,
            step: 1,
            format: "count"
        },
        {
            label: "Physical release fee",
            detail: "Upfront fee for Physical/Both releases.",
            target: "baselines",
            key: "physicalReleaseFee",
            value: releaseFee,
            min: 0,
            step: 50,
            format: "money"
        },
        {
            label: "Physical single base price",
            detail: "Base single price before multipliers.",
            target: "baselines",
            key: "physicalSingle",
            value: baseSingle,
            min: 0.01,
            step: 0.01,
            format: "money"
        },
        {
            label: "Single price multiplier",
            detail: "Single price multiplier.",
            target: "priceMultipliers",
            key: "single",
            value: multSingle,
            min: 0,
            step: 0.05,
            format: "multiplier"
        },
        {
            label: "EP price multiplier",
            detail: "EP price multiplier.",
            target: "priceMultipliers",
            key: "ep",
            value: multEp,
            min: 0,
            step: 0.05,
            format: "multiplier"
        },
        {
            label: "Album price multiplier",
            detail: "Album price multiplier.",
            target: "priceMultipliers",
            key: "album",
            value: multAlbum,
            min: 0,
            step: 0.05,
            format: "multiplier"
        },
        {
            label: "Physical unit cost ratio",
            detail: "Unit cost as % of unit price.",
            target: "baselines",
            key: "physicalUnitCostRatio",
            value: unitRatio,
            min: 0,
            max: 1,
            step: 0.01,
            format: "percent"
        },
        {
            label: "Physical unit cost floor",
            detail: "Minimum unit cost.",
            target: "tuning",
            key: "physicalUnitCostMin",
            value: unitCostMin,
            min: 0,
            step: 0.1,
            format: "money"
        },
        {
            label: "Physical run rounding",
            detail: "Round units to this increment.",
            target: "baselines",
            key: "physicalRunRound",
            value: runRound,
            min: 0,
            step: 10,
            format: "count"
        },
        {
            label: "Physical run min",
            detail: "Minimum recommended units.",
            target: "baselines",
            key: "physicalRunMin",
            value: runMin,
            min: 0,
            step: 10,
            format: "count"
        },
        {
            label: "Physical run max",
            detail: "Maximum recommended units.",
            target: "baselines",
            key: "physicalRunMax",
            value: runMax,
            min: 0,
            step: 100,
            format: "count"
        }
    ];
    tuningEl.innerHTML = fields.map((field) => {
        const inputValue = Number.isFinite(field.value) ? field.value : "";
        const display = formatValue(field.value, field.format);
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${field.label}</div>
            <div class="muted">${field.detail}</div>
          </div>
          <input
            type="number"
            class="tutorial-input"
            data-cheat-econ-target="${field.target}"
            data-cheat-econ-key="${field.key}"
            value="${inputValue}"
            ${cheaterActive ? "" : "disabled"}
            ${attr("min", field.min)}
            ${attr("max", field.max)}
            ${attr("step", field.step)}
          >
        </div>
        <div class="tiny muted">Current: ${display}</div>
      </div>
    `;
    }).join("");
}
function renderEconomySummary() {
    if (!$("economySummary"))
        return;
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
    if (!listEl)
        return;
    const activeTracks = state.marketTracks.filter((entry) => entry.isPlayer && entry.promoWeeks > 0);
    const activeActs = state.acts.filter((act) => act.promoWeeks > 0);
    if (!activeTracks.length && !activeActs.length) {
        listEl.innerHTML = `<div class="muted">No active promo pushes.</div>`;
        return;
    }
    const items = [
        ...activeTracks.map((entry) => {
            const track = entry.trackId ? getTrack(entry.trackId) : null;
            const title = track ? track.title : entry.title;
            const genreLabel = track
                ? renderTrackGenrePills(track)
                : renderGenrePillsFromGenre(entry.genre, { alignment: entry.alignment });
            return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${renderTrackTitle(title)}</div>
            <div class="muted">${genreLabel}</div>
          </div>
          <div class="pill">${entry.promoWeeks}w</div>
        </div>
      </div>
    `;
        }),
        ...activeActs.map((act) => `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${renderActName(act)}</div>
            <div class="muted">Act promo${act.alignment ? ` | ${renderAlignmentTag(act.alignment)}` : ""}</div>
          </div>
          <div class="pill">${act.promoWeeks}w</div>
        </div>
      </div>
    `)
    ];
    listEl.innerHTML = items.join("");
}
function renderPromoAlerts() {
    const listEl = $("promoAlertsList");
    if (!listEl)
        return;
    const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
    const focusEra = getFocusedEra();
    const fallbackEra = !focusEra && activeEras.length === 1 ? activeEras[0] : null;
    const displayEra = focusEra || fallbackEra;
    if (!displayEra) {
        listEl.innerHTML = `<div class="muted">No active era promo alerts.</div>`;
        return;
    }
    const act = getAct(displayEra.actId);
    const actLabel = act ? renderActName(act) : "";
    const stageName = ERA_STAGES[displayEra.stageIndex] || "Active";
    const eraLabel = `${displayEra.name}${actLabel ? ` (${actLabel})` : ""} | ${stageName}`;
    const now = state.time.epochMs;
    const tracks = state.tracks.filter((track) => track.eraId === displayEra.id)
        .filter((track) => track.status === "Released" || track.status === "Scheduled");
    const trackAlerts = tracks.map((track) => {
        const used = track.promo?.typesUsed || {};
        const missing = PROMO_TRACK_REQUIRED_TYPES.filter((typeId) => {
            if (typeId === "musicVideo" && track.status !== "Released")
                return false;
            const count = Number.isFinite(used[typeId]) ? used[typeId] : 0;
            if (count > 0)
                return false;
            if (typeId === "musicVideo" && track.promo?.musicVideoUsed)
                return false;
            return true;
        });
        if (!missing.length)
            return null;
        return { track, missing };
    }).filter(Boolean);
    const actAlerts = [];
    if (act) {
        const referenceAt = Number.isFinite(act.lastPromoAt) ? act.lastPromoAt : displayEra.startedAt;
        if (Number.isFinite(referenceAt)) {
            const weeksSince = Math.floor(Math.max(0, now - referenceAt) / (DAY_MS * 7));
            if (weeksSince >= ACT_PROMO_WARNING_WEEKS) {
                actAlerts.push({ act, referenceAt, weeksSince });
            }
        }
    }
    const blocks = [
        `
      <div class="list-item">
        <div class="item-title">Focus Era</div>
        <div class="muted">${eraLabel}</div>
      </div>
    `
    ];
    if (!actAlerts.length && !trackAlerts.length) {
        blocks.push(`
      <div class="list-item">
        <div class="item-title">No promo alerts</div>
        <div class="muted">Active-era content has current promo coverage.</div>
      </div>
    `);
        listEl.innerHTML = blocks.join("");
        return;
    }
    actAlerts.forEach((entry) => {
        const alignmentLine = entry.act.alignment ? ` | ${renderAlignmentTag(entry.act.alignment)}` : "";
        const lastPromoLabel = formatShortDate(entry.referenceAt);
        blocks.push(`
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${renderActName(entry.act)}</div>
            <div class="muted">Last promo ${lastPromoLabel} (${entry.weeksSince}w ago)${alignmentLine}</div>
            <div class="muted">Warning: no promo activity in ${ACT_PROMO_WARNING_WEEKS} weeks.</div>
          </div>
          <span class="badge warn">Stale act</span>
        </div>
      </div>
    `);
    });
    trackAlerts.forEach(({ track, missing }) => {
        const missingLabels = missing.map((typeId) => PROMO_TYPE_DETAILS[typeId]?.label || typeId).join(", ");
        const act = track.actId ? getAct(track.actId) : null;
        const actLabel = act ? renderActName(act) : "Unassigned";
        const releaseLabel = track.releasedAt ? ` | Released ${formatShortDate(track.releasedAt)}` : "";
        blocks.push(`
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${renderTrackTitle(track.title)}</div>
            <div class="muted">Missing promo: ${missingLabels}</div>
            <div class="muted">Act: ${actLabel} | Status: ${track.status}${releaseLabel}</div>
          </div>
          <span class="badge warn">Promo gap</span>
        </div>
      </div>
    `);
    });
    listEl.innerHTML = blocks.join("");
}
function renderAwardPerformanceBidControls(shows) {
    const showSelect = $("awardBidShowSelect");
    const slotSelect = $("awardBidSlotSelect");
    const actSelect = $("awardBidActSelect");
    const trackSelect = $("awardBidTrackSelect");
    const amountInput = $("awardBidAmountInput");
    const hintEl = $("awardBidHint");
    const submitBtn = $("awardBidSubmitBtn");
    if (!showSelect || !slotSelect || !actSelect || !trackSelect || !amountInput)
        return;
    if (!state.ui)
        state.ui = {};
    const now = state.time?.epochMs || Date.now();
    const list = Array.isArray(shows) ? shows : listAwardShows({ includePast: false, limit: null });
    const openShows = list.filter((show) => isAwardPerformanceBidWindowOpen(show, now));
    const disableControls = (message) => {
        showSelect.disabled = true;
        slotSelect.disabled = true;
        actSelect.disabled = true;
        trackSelect.disabled = true;
        amountInput.disabled = true;
        if (submitBtn)
            submitBtn.disabled = true;
        showSelect.innerHTML = "<option value=\"\">No bidding windows open</option>";
        slotSelect.innerHTML = "<option value=\"\">Slot</option>";
        actSelect.innerHTML = "<option value=\"\">Act</option>";
        trackSelect.innerHTML = "<option value=\"\">Track</option>";
        if (hintEl)
            hintEl.textContent = message || "Performance bids open three months before show night.";
    };
    if (!openShows.length) {
        disableControls("Performance bids open three months before show night.");
        return;
    }
    showSelect.disabled = false;
    slotSelect.disabled = false;
    actSelect.disabled = false;
    trackSelect.disabled = false;
    amountInput.disabled = false;
    const showOptions = openShows.map((show) => {
        const label = Number.isFinite(show.showAt) ? `${show.label} (${formatShortDate(show.showAt)})` : show.label;
        return `<option value="${show.id}">${label}</option>`;
    }).join("");
    showSelect.innerHTML = showOptions;
    const selectedShowId = openShows.some((show) => show.id === state.ui.awardBidShowId)
        ? state.ui.awardBidShowId
        : openShows[0].id;
    state.ui.awardBidShowId = selectedShowId;
    showSelect.value = selectedShowId;
    const selectedShow = openShows.find((show) => show.id === selectedShowId) || openShows[0];
    const bidWindow = resolveAwardShowPerformanceBidWindow(selectedShow);
    const qualityRange = resolveAwardShowPerformanceQuality(selectedShow);
    const slots = Array.isArray(selectedShow.performances) ? selectedShow.performances : [];
    if (!slots.length) {
        slotSelect.innerHTML = "<option value=\"\">Slot</option>";
    }
    else {
        slotSelect.innerHTML = slots.map((slot) => {
            const status = slot.status === "Booked" ? "Booked" : "Pending";
            return `<option value="${slot.id}">${slot.label} (${status})</option>`;
        }).join("");
    }
    const selectedSlotId = slots.some((slot) => slot.id === state.ui.awardBidSlotId)
        ? state.ui.awardBidSlotId
        : slots[0]?.id || "";
    state.ui.awardBidSlotId = selectedSlotId || null;
    slotSelect.value = selectedSlotId || "";
    const activeActs = state.acts
        .map((act) => {
        const era = getLatestActiveEraForAct(act.id);
        if (!era || era.status !== "Active")
            return null;
        return { act, era };
    })
        .filter(Boolean)
        .sort((a, b) => String(a.act.name || "").localeCompare(String(b.act.name || "")));
    if (!activeActs.length) {
        actSelect.innerHTML = "<option value=\"\">No active-era acts</option>";
        actSelect.disabled = true;
        trackSelect.innerHTML = "<option value=\"\">Track</option>";
        trackSelect.disabled = true;
        if (submitBtn)
            submitBtn.disabled = true;
        if (hintEl) {
            hintEl.textContent = "Performance bids require an act with an active era.";
        }
        return;
    }
    actSelect.disabled = false;
    actSelect.innerHTML = activeActs.map(({ act }) => `<option value="${act.id}">${renderActName(act)}</option>`).join("");
    const selectedActId = activeActs.some(({ act }) => act.id === state.ui.awardBidActId)
        ? state.ui.awardBidActId
        : activeActs[0].act.id;
    state.ui.awardBidActId = selectedActId;
    actSelect.value = selectedActId;
    const selectedActEntry = activeActs.find(({ act }) => act.id === selectedActId) || activeActs[0];
    const selectedEraId = selectedActEntry?.era?.id || null;
    const resolveTrackQuality = (track) => {
        if (Number.isFinite(track?.qualityFinal))
            return track.qualityFinal;
        if (Number.isFinite(track?.quality))
            return track.quality;
        if (Number.isFinite(track?.qualityPotential))
            return track.qualityPotential;
        return null;
    };
    const eligibleTracks = state.tracks
        .filter((track) => track.actId === selectedActId && (!selectedEraId || track.eraId === selectedEraId))
        .map((track) => {
        const quality = resolveTrackQuality(track);
        const scheduled = state.releaseQueue.find((entry) => entry.trackId === track.id);
        const isReleased = track.status === "Released" && track.marketId;
        const inReleaseWindow = Boolean(isReleased || scheduled);
        const inRange = Number.isFinite(quality)
            && quality >= qualityRange.min
            && quality <= qualityRange.max;
        return {
            track,
            quality,
            inReleaseWindow,
            inRange,
            statusLabel: isReleased ? "Released" : scheduled ? "Scheduled" : track.status || "Draft"
        };
    })
        .filter((entry) => entry.inReleaseWindow && entry.inRange && Number.isFinite(entry.quality));
    eligibleTracks.sort((a, b) => (b.quality || 0) - (a.quality || 0));
    if (!eligibleTracks.length) {
        trackSelect.innerHTML = "<option value=\"\">No eligible tracks</option>";
        trackSelect.disabled = true;
        if (submitBtn)
            submitBtn.disabled = true;
        if (hintEl) {
            hintEl.textContent = `No active-era tracks meet the ${qualityRange.min}-${qualityRange.max} quality range.`;
        }
        return;
    }
    trackSelect.disabled = false;
    trackSelect.innerHTML = eligibleTracks.map(({ track, quality, statusLabel }) => {
        const grade = qualityGrade(quality);
        return `<option value="${track.id}">${renderTrackTitle(track.title)} (${statusLabel}, Q${quality} ${grade})</option>`;
    }).join("");
    const selectedTrackId = eligibleTracks.some(({ track }) => track.id === state.ui.awardBidTrackId)
        ? state.ui.awardBidTrackId
        : eligibleTracks[0].track.id;
    state.ui.awardBidTrackId = selectedTrackId;
    trackSelect.value = selectedTrackId;
    const amountValue = Number.isFinite(state.ui.awardBidAmount)
        ? Math.max(0, Math.round(state.ui.awardBidAmount))
        : "";
    amountInput.value = amountValue === "" ? "" : String(amountValue);
    const closeLabel = Number.isFinite(bidWindow.closeAt) ? formatShortDate(bidWindow.closeAt) : "TBD";
    if (hintEl) {
        hintEl.textContent = `Bids close ${closeLabel}. Performance quality ${qualityRange.min}-${qualityRange.max}.`;
    }
    const canBid = Boolean(selectedShowId && selectedSlotId && selectedActId && selectedTrackId)
        && Number.isFinite(amountValue) && amountValue > 0;
    if (submitBtn)
        submitBtn.disabled = !canBid;
}
function renderAwardsCircuit() {
    const listEl = $("awardsCircuitList");
    const noticeEl = $("awardsCircuitNotice");
    if (!listEl)
        return;
    const shows = listAwardShows({ includePast: true });
    renderAwardPerformanceBidControls(shows);
    if (!shows.length) {
        listEl.innerHTML = `<div class="muted">No award shows scheduled yet.</div>`;
        if (noticeEl) {
            noticeEl.textContent = "";
            noticeEl.classList.add("hidden");
        }
        return;
    }
    const now = state.time?.epochMs || Date.now();
    const openShows = shows.filter((show) => isAwardPerformanceBidWindowOpen(show, now));
    if (noticeEl) {
        if (openShows.length) {
            const openList = openShows.map((show) => {
                const bidWindow = resolveAwardShowPerformanceBidWindow(show);
                const closeLabel = Number.isFinite(bidWindow.closeAt)
                    ? formatShortDate(bidWindow.closeAt)
                    : "TBD";
                return `${show.label} (closes ${closeLabel})`;
            });
            noticeEl.textContent = `Performance bids open: ${openList.join(" | ")}.`;
            noticeEl.classList.remove("hidden");
        }
        else {
            noticeEl.textContent = "";
            noticeEl.classList.add("hidden");
        }
    }
    const playerLabel = state.label?.name || "";
    const items = shows.map((show) => {
        const showDate = Number.isFinite(show.showAt) ? formatDate(show.showAt) : "TBD";
        const window = show.nominationWindow || {};
        const windowLabel = Number.isFinite(window.startWeek) && Number.isFinite(window.endWeek)
            ? formatCompactDateRange(weekStartEpochMs(window.startWeek), weekStartEpochMs(window.endWeek + 1) - 1)
            : "Nomination window TBD";
        const lockLabel = Number.isFinite(show.nominationLockAt) ? formatDate(show.nominationLockAt) : "TBD";
        const revealLabel = Number.isFinite(show.nominationRevealAt) ? formatDate(show.nominationRevealAt) : "TBD";
        const nomineesRevealed = show.status === "Revealed"
            || show.status === "Resolved"
            || (Number.isFinite(show.nominationRevealAt) && now >= show.nominationRevealAt);
        const nominees = Array.isArray(show.categories)
            ? show.categories.flatMap((category) => category?.nominees || [])
            : [];
        const nominationCount = playerLabel && nomineesRevealed
            ? nominees.filter((nominee) => nominee?.label === playerLabel).length
            : 0;
        const winCount = playerLabel && nomineesRevealed && Array.isArray(show.categories)
            ? show.categories.filter((category) => category?.winner?.label === playerLabel).length
            : 0;
        const playerLine = playerLabel && nomineesRevealed
            ? ` | ${nominationCount} nom${nominationCount === 1 ? "" : "s"}${winCount ? `, ${winCount} win${winCount === 1 ? "" : "s"}` : ""}`
            : "";
        const performanceLine = Array.isArray(show.performances) && show.performances.length
            ? show.performances.map((slot) => `${slot.label}: ${slot.actName || "TBD"}`).join(" | ")
            : "Performance slots TBD";
        const bidWindow = resolveAwardShowPerformanceBidWindow(show);
        const qualityRange = resolveAwardShowPerformanceQuality(show);
        const bidLabel = Number.isFinite(bidWindow.openAt) && Number.isFinite(bidWindow.closeAt)
            ? now < bidWindow.openAt
                ? `Bids open ${formatShortDate(bidWindow.openAt)}`
                : now < bidWindow.closeAt
                    ? `Bids close ${formatShortDate(bidWindow.closeAt)}`
                    : "Bids closed"
            : "Bids TBD";
        const bidDetail = `${bidLabel} | Performance quality ${qualityRange.min}-${qualityRange.max}`;
        const status = show.status || "Scheduled";
        const badgeClass = status === "Resolved" || status === "Revealed" ? "badge" : "badge warn";
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${show.label}</div>
            <div class="muted">${showDate} | ${windowLabel}</div>
            <div class="muted">Lock ${lockLabel} | Reveal ${revealLabel}${playerLine}</div>
            <div class="muted">${bidDetail}</div>
            <div class="tiny muted">${performanceLine}</div>
          </div>
          <div class="${badgeClass}">${status}</div>
        </div>
      </div>
    `;
    });
    listEl.innerHTML = items.join("");
}
const YEAR_END_CHART_TYPES = [
    { id: "tracks", label: "Tracks" },
    { id: "projects", label: "Projects" },
    { id: "promotions", label: "Promos" },
    { id: "tours", label: "Tours" }
];
function normalizeAwardsView(value) {
    return value === "charts" ? "charts" : "awards";
}
function normalizeAwardsChartType(value) {
    return YEAR_END_CHART_TYPES.some((entry) => entry.id === value) ? value : "tracks";
}
function syncAwardsYearSelect(years) {
    const yearSelect = $("awardsYearSelect");
    if (yearSelect) {
        if (!years.length) {
            yearSelect.innerHTML = `<option value="">No years available</option>`;
            yearSelect.disabled = true;
        }
        else {
            yearSelect.disabled = false;
            yearSelect.innerHTML = years.map((year) => `<option value="${year}">${year}</option>`).join("");
        }
    }
    if (!years.length) {
        state.ui.awardsYear = null;
        return null;
    }
    const selectedYear = years.includes(state.ui.awardsYear) ? state.ui.awardsYear : years[0];
    state.ui.awardsYear = selectedYear;
    if (yearSelect)
        yearSelect.value = String(selectedYear);
    return selectedYear;
}
function hasAnnualAwardLedgerData(entry) {
    if (!entry || typeof entry !== "object")
        return false;
    if (!entry.totalWeeks || entry.totalWeeks <= 0)
        return false;
    const stores = entry.stores || {};
    return ["tracks", "projects", "promotions", "tours"].some((key) => {
        const store = stores[key];
        return store && typeof store.candidates === "object" && Object.keys(store.candidates).length > 0;
    });
}
function buildYearEndChartDefinitionMap() {
    const definitions = typeof listAnnualAwardDefinitions === "function" ? listAnnualAwardDefinitions() : [];
    const map = new Map();
    definitions.forEach((definition) => {
        if (!definition?.store || definition.metric !== "chartPoints")
            return;
        map.set(definition.store, definition);
    });
    return map;
}
function listAnnualAwardYearsFromLedger() {
    const years = Object.keys(state.meta?.annualAwardLedger?.years || {})
        .map((key) => Number.parseInt(key, 10))
        .filter((value) => Number.isFinite(value))
        .sort((a, b) => b - a);
    return years;
}
function resolveAnnualAwardsEntryForYear(year) {
    if (!Number.isFinite(year))
        return null;
    const list = Array.isArray(state.meta?.annualAwards) ? state.meta.annualAwards : [];
    return list.find((entry) => Number(entry?.year) === year) || null;
}
function buildAnnualAwardLabelLookup() {
    const lookup = new Map();
    ACHIEVEMENTS.forEach((entry) => {
        if (!entry || !entry.id)
            return;
        lookup.set(entry.id, entry.label || entry.id);
    });
    return lookup;
}
function resolveAnnualAwardLabel(id, lookup) {
    if (!id)
        return "Unknown category";
    return lookup?.get(id) || id;
}
function buildAnnualAwardCategoryList(yearEntry, awardsEntry, definitions) {
    const list = [];
    const seen = new Set();
    const awards = awardsEntry?.awards && typeof awardsEntry.awards === "object" ? awardsEntry.awards : {};
    (definitions || []).forEach((definition) => {
        if (!definition?.id)
            return;
        const store = yearEntry?.stores?.[definition.store];
        const metricMap = store?.[definition.metric];
        const hasMetricData = metricMap && typeof metricMap === "object" && Object.keys(metricMap).length > 0;
        const hasCandidates = store?.candidates && typeof store.candidates === "object" && Object.keys(store.candidates).length > 0;
        const hasAward = Boolean(awards?.[definition.id]);
        if (hasMetricData || hasCandidates || hasAward) {
            list.push({
                id: definition.id,
                definition,
                hasMetricData,
                hasCandidates,
                hasAward
            });
            seen.add(definition.id);
        }
    });
    Object.keys(awards || {}).forEach((awardId) => {
        if (seen.has(awardId))
            return;
        list.push({
            id: awardId,
            definition: null,
            hasMetricData: false,
            hasCandidates: false,
            hasAward: true
        });
    });
    return list;
}
function resolveAnnualAwardNomineeDisplay(candidate) {
    const projectName = candidate?.projectName ? renderProjectName(candidate.projectName) : "";
    if (projectName) {
        return { primary: projectName, meta: candidate?.label ? `Label: ${candidate.label}` : "" };
    }
    const title = candidate?.title || candidate?.trackTitle || "";
    if (title) {
        const renderedTitle = renderTrackTitle(title);
        const actLabel = renderActName(candidate);
        const metaParts = [];
        if (actLabel)
            metaParts.push(`Act: ${actLabel}`);
        if (candidate?.label)
            metaParts.push(`Label: ${candidate.label}`);
        return { primary: renderedTitle, meta: metaParts.join(" | ") };
    }
    const tourName = candidate?.tourName ? String(candidate.tourName) : "";
    if (tourName) {
        const metaParts = [];
        if (candidate?.label)
            metaParts.push(`Label: ${candidate.label}`);
        return { primary: tourName, meta: metaParts.join(" | ") };
    }
    const actName = renderActName(candidate);
    const metaParts = [];
    if (candidate?.label)
        metaParts.push(`Label: ${candidate.label}`);
    return { primary: actName || "Unknown entity", meta: metaParts.join(" | ") };
}
function resolveAnnualAwardNomineeRevealState(year, awardsEntry) {
    if (!Number.isFinite(year))
        return { revealAt: null, revealed: false };
    const revealAt = annualAwardNomineeRevealAt(year);
    const now = state.time?.epochMs || Date.now();
    const awardCount = Object.keys(awardsEntry?.awards || {}).length;
    const revealed = awardCount > 0 || (Number.isFinite(revealAt) && now >= revealAt);
    return { revealAt, revealed };
}
function renderAwardsViewTabs() {
    const tabs = $("awardsViewTabs");
    const panels = tabs
        ? Array.from(tabs.parentElement?.querySelectorAll("[data-awards-view-panel]") || [])
        : Array.from(document.querySelectorAll("[data-awards-view-panel]"));
    const active = normalizeAwardsView(state.ui.awardsView);
    if (state.ui.awardsView !== active)
        state.ui.awardsView = active;
    if (tabs) {
        tabs.querySelectorAll(".tab").forEach((tab) => {
            const isActive = tab.dataset.awardsView === active;
            tab.classList.toggle("active", isActive);
        });
    }
    panels.forEach((panel) => {
        const isActive = panel.dataset.awardsViewPanel === active;
        panel.classList.toggle("is-active", isActive);
    });
    const detailTitle = $("awardsDetailTitle");
    if (detailTitle) {
        detailTitle.textContent = active === "charts" ? "Year-End Charts" : "Category Detail";
    }
}
function normalizeAwardMatchValue(value) {
    return String(value || "").trim().toLowerCase();
}
function awardWinnerMatches(nominee, winner) {
    if (!nominee || !winner)
        return false;
    if (winner.actKey && nominee.key && String(winner.actKey) === String(nominee.key))
        return true;
    if (winner.actId && nominee.candidate?.actId && String(winner.actId) === String(nominee.candidate.actId))
        return true;
    const winnerName = normalizeAwardMatchValue(winner.actName);
    const nomineeName = normalizeAwardMatchValue(nominee.candidate?.actName);
    if (winnerName && nomineeName && winnerName === nomineeName) {
        const winnerLabel = normalizeAwardMatchValue(winner.label);
        const nomineeLabel = normalizeAwardMatchValue(nominee.candidate?.label);
        if (!winnerLabel || !nomineeLabel)
            return true;
        return winnerLabel === nomineeLabel;
    }
    return false;
}
function renderAnnualAwardsPanel() {
    const listEl = $("awardsCategoryList");
    if (!listEl)
        return;
    const emptyEl = $("awardsYearEmpty");
    const warningEl = $("awardsYearWarning");
    const years = listAnnualAwardYearsFromLedger();
    const selectedYear = syncAwardsYearSelect(years);
    if (!years.length || !selectedYear) {
        if (emptyEl) {
            emptyEl.textContent = "No year-end awards recorded yet.";
            emptyEl.classList.remove("hidden");
        }
        if (warningEl)
            warningEl.classList.add("hidden");
        listEl.innerHTML = "";
        state.ui.awardsYear = null;
        state.ui.awardsCategoryId = null;
        return;
    }
    if (emptyEl)
        emptyEl.classList.add("hidden");
    const yearEntry = state.meta?.annualAwardLedger?.years?.[String(selectedYear)] || null;
    const awardsEntry = resolveAnnualAwardsEntryForYear(selectedYear);
    const hasLedger = Boolean(yearEntry && typeof yearEntry === "object"
        && yearEntry.stores && typeof yearEntry.stores === "object");
    const nomineeState = resolveAnnualAwardNomineeRevealState(selectedYear, awardsEntry);
    if (warningEl) {
        const warnings = [];
        if (!hasLedger)
            warnings.push("Ledger data is missing for this year. Nominees may be unavailable.");
        if (!nomineeState.revealed) {
            const revealLabel = Number.isFinite(nomineeState.revealAt) ? formatDate(nomineeState.revealAt) : "TBD";
            warnings.push(`Nominees reveal ${revealLabel}.`);
        }
        if (warnings.length) {
            warningEl.textContent = warnings.join(" ");
            warningEl.classList.remove("hidden");
        }
        else {
            warningEl.classList.add("hidden");
        }
    }
    const definitions = typeof listAnnualAwardDefinitions === "function" ? listAnnualAwardDefinitions() : [];
    const categories = buildAnnualAwardCategoryList(yearEntry, awardsEntry, definitions);
    if (!categories.length) {
        listEl.innerHTML = `<div class="muted">No award categories available for ${selectedYear}.</div>`;
        state.ui.awardsCategoryId = null;
        return;
    }
    const selectedCategoryId = categories.some((entry) => entry.id === state.ui.awardsCategoryId)
        ? state.ui.awardsCategoryId
        : categories[0].id;
    state.ui.awardsCategoryId = selectedCategoryId;
    const labelLookup = buildAnnualAwardLabelLookup();
    const awards = awardsEntry?.awards && typeof awardsEntry.awards === "object" ? awardsEntry.awards : {};
    listEl.innerHTML = categories.map((category) => {
        const label = resolveAnnualAwardLabel(category.id, labelLookup);
        const isSelected = category.id === selectedCategoryId;
        const definition = category.definition;
        const nominees = nomineeState.revealed && definition
            ? buildAnnualAwardNomineesFromLedger(definition, yearEntry)
            : [];
        const nomineeCount = nominees.length;
        const nomineeLine = nomineeState.revealed
            ? nomineeCount
                ? `Nominees: ${nomineeCount}`
                : "Nominees: 0"
            : "Nominees: TBD";
        const winnerEntry = awards?.[category.id] || null;
        const winnerLabel = winnerEntry?.actName || winnerEntry?.actKey || "TBD";
        const winnerLine = winnerEntry ? `Winner: ${winnerLabel}` : "Winner: TBD";
        const metaLine = `${nomineeLine} | ${winnerLine}`;
        return `
      <div class="list-item awards-category ${isSelected ? "is-selected" : ""}" data-award-category="${category.id}" role="button" tabindex="0" aria-pressed="${isSelected ? "true" : "false"}">
        <div class="list-row">
          <div>
            <div class="item-title">${label}</div>
            <div class="muted">${metaLine}</div>
          </div>
          <div class="actions">
            <span class="badge">${isSelected ? "Selected" : "View"}</span>
          </div>
        </div>
      </div>
    `;
    }).join("");
}
function renderYearEndChartsPanel() {
    const listEl = $("awardsChartList");
    if (!listEl)
        return;
    const emptyEl = $("awardsChartEmpty");
    const warningEl = $("awardsChartWarning");
    const years = listAnnualAwardYearsFromLedger();
    const selectedYear = syncAwardsYearSelect(years);
    if (!years.length || !selectedYear) {
        if (emptyEl) {
            emptyEl.textContent = "No year-end charts recorded yet.";
            emptyEl.classList.remove("hidden");
        }
        if (warningEl)
            warningEl.classList.add("hidden");
        listEl.innerHTML = "";
        state.ui.awardsYear = null;
        return;
    }
    if (emptyEl)
        emptyEl.classList.add("hidden");
    const yearEntry = state.meta?.annualAwardLedger?.years?.[String(selectedYear)] || null;
    const awardsEntry = resolveAnnualAwardsEntryForYear(selectedYear);
    const nomineeState = resolveAnnualAwardNomineeRevealState(selectedYear, awardsEntry);
    const hasLedger = Boolean(yearEntry && typeof yearEntry === "object"
        && yearEntry.stores && typeof yearEntry.stores === "object");
    const hasData = hasAnnualAwardLedgerData(yearEntry);
    if (warningEl) {
        const warnings = [];
        if (!hasLedger)
            warnings.push("Ledger data is missing for this year. Chart leaders may be unavailable.");
        if (!nomineeState.revealed) {
            const revealLabel = Number.isFinite(nomineeState.revealAt) ? formatDate(nomineeState.revealAt) : "TBD";
            warnings.push(`Year-end charts release ${revealLabel}.`);
        }
        else if (!hasData) {
            warnings.push("No chart data recorded for this year yet.");
        }
        if (warnings.length) {
            warningEl.textContent = warnings.join(" ");
            warningEl.classList.remove("hidden");
        }
        else {
            warningEl.classList.add("hidden");
        }
    }
    const chartDefinitionMap = buildYearEndChartDefinitionMap();
    const selectedChartType = normalizeAwardsChartType(state.ui.awardsChartType);
    state.ui.awardsChartType = selectedChartType;
    const revealLabel = Number.isFinite(nomineeState.revealAt) ? formatDate(nomineeState.revealAt) : "TBD";
    listEl.innerHTML = YEAR_END_CHART_TYPES.map((chartType) => {
        const definition = chartDefinitionMap.get(chartType.id);
        const nominees = nomineeState.revealed && definition && yearEntry
            ? buildAnnualAwardNomineesFromLedger(definition, yearEntry)
            : [];
        const leader = nominees[0];
        let metaLine = "";
        if (!nomineeState.revealed) {
            metaLine = `Releases ${revealLabel}`;
        }
        else if (leader) {
            const leaderName = renderActName(leader.candidate) || leader.candidate?.actName || "Unknown Act";
            const points = formatCount(Math.round(leader.score || 0));
            metaLine = `Leader: ${leaderName} | Points ${points}`;
        }
        else {
            metaLine = "No chart leaders recorded yet.";
        }
        const isSelected = chartType.id === selectedChartType;
        return `
      <div class="list-item awards-category ${isSelected ? "is-selected" : ""}" data-award-chart="${chartType.id}" role="button" tabindex="0" aria-pressed="${isSelected ? "true" : "false"}">
        <div class="list-row">
          <div>
            <div class="item-title">${chartType.label}</div>
            <div class="muted">${metaLine}</div>
          </div>
          <div class="actions">
            <span class="badge">${isSelected ? "Selected" : "View"}</span>
          </div>
        </div>
      </div>
    `;
    }).join("");
}
function renderAnnualAwardsDetail() {
    const detailEl = $("awardsDetailBody");
    if (!detailEl)
        return;
    const years = listAnnualAwardYearsFromLedger();
    if (!years.length) {
        detailEl.innerHTML = `<div class="muted">No year-end awards recorded yet.</div>`;
        return;
    }
    const year = state.ui.awardsYear;
    if (!Number.isFinite(year)) {
        detailEl.innerHTML = `<div class="muted">Select a year to view awards.</div>`;
        return;
    }
    const yearEntry = state.meta?.annualAwardLedger?.years?.[String(year)] || null;
    const awardsEntry = resolveAnnualAwardsEntryForYear(year);
    const nomineeState = resolveAnnualAwardNomineeRevealState(year, awardsEntry);
    const definitions = typeof listAnnualAwardDefinitions === "function" ? listAnnualAwardDefinitions() : [];
    const categories = buildAnnualAwardCategoryList(yearEntry, awardsEntry, definitions);
    if (!categories.length) {
        detailEl.innerHTML = `<div class="muted">No award categories available for ${year}.</div>`;
        return;
    }
    const category = categories.find((entry) => entry.id === state.ui.awardsCategoryId) || categories[0];
    const labelLookup = buildAnnualAwardLabelLookup();
    const categoryLabel = resolveAnnualAwardLabel(category.id, labelLookup);
    const winnerEntry = awardsEntry?.awards && typeof awardsEntry.awards === "object"
        ? awardsEntry.awards[category.id]
        : null;
    const headerLines = [];
    headerLines.push(`<div class="item-title">${categoryLabel}</div>`);
    headerLines.push(`<div class="muted">Year ${year}</div>`);
    if (winnerEntry) {
        const winnerName = winnerEntry.actName || winnerEntry.actKey || "Winner";
        headerLines.push(`<div class="muted">Winner: ${winnerName}</div>`);
    }
    else {
        headerLines.push(`<div class="muted">Winner not available.</div>`);
    }
    const items = [
        `
      <div class="list-item">
        ${headerLines.join("")}
      </div>
    `
    ];
    if (!nomineeState.revealed) {
        const revealLabel = Number.isFinite(nomineeState.revealAt) ? formatDate(nomineeState.revealAt) : "TBD";
        items.push(`<div class="muted">Nominees reveal ${revealLabel}.</div>`);
        detailEl.innerHTML = items.join("");
        return;
    }
    if (!category.definition) {
        items.push(`<div class="muted">Nominee data unavailable for this category.</div>`);
        detailEl.innerHTML = items.join("");
        return;
    }
    const nominees = buildAnnualAwardNomineesFromLedger(category.definition, yearEntry);
    const winnerIndex = winnerEntry ? nominees.findIndex((nominee) => awardWinnerMatches(nominee, winnerEntry)) : -1;
    if (!nominees.length) {
        items.push(`<div class="muted">No nominees recorded for this category.</div>`);
        detailEl.innerHTML = items.join("");
        return;
    }
    nominees.forEach((nominee, index) => {
        const display = resolveAnnualAwardNomineeDisplay(nominee.candidate);
        const metaLine = display.meta ? `<div class="muted">${display.meta}</div>` : "";
        const isWinner = index === winnerIndex;
        items.push(`
      <div class="list-item awards-nominee ${isWinner ? "is-winner" : ""}">
        <div class="list-row">
          <div>
            <div class="item-title">${display.primary}</div>
            ${metaLine}
          </div>
          <div class="actions">
            <span class="badge">#${index + 1}</span>
            ${isWinner ? `<span class="badge">Winner</span>` : ""}
          </div>
        </div>
      </div>
    `);
    });
    detailEl.innerHTML = items.join("");
}
function renderYearEndChartsDetail() {
    const detailEl = $("awardsDetailBody");
    if (!detailEl)
        return;
    const years = listAnnualAwardYearsFromLedger();
    if (!years.length) {
        detailEl.innerHTML = `<div class="muted">No year-end charts recorded yet.</div>`;
        return;
    }
    const year = state.ui.awardsYear;
    if (!Number.isFinite(year)) {
        detailEl.innerHTML = `<div class="muted">Select a year to view charts.</div>`;
        return;
    }
    const yearEntry = state.meta?.annualAwardLedger?.years?.[String(year)] || null;
    const awardsEntry = resolveAnnualAwardsEntryForYear(year);
    const nomineeState = resolveAnnualAwardNomineeRevealState(year, awardsEntry);
    const hasData = hasAnnualAwardLedgerData(yearEntry);
    const chartDefinitionMap = buildYearEndChartDefinitionMap();
    const chartType = normalizeAwardsChartType(state.ui.awardsChartType);
    state.ui.awardsChartType = chartType;
    const chartLabel = YEAR_END_CHART_TYPES.find((entry) => entry.id === chartType)?.label || "Chart";
    const headerLines = [];
    headerLines.push(`<div class="item-title">Year-End ${chartLabel}</div>`);
    headerLines.push(`<div class="muted">Year ${year}</div>`);
    if (yearEntry) {
        const weeksTracked = Number.isFinite(yearEntry.totalWeeks) ? yearEntry.totalWeeks : 0;
        const lastWeek = Number.isFinite(yearEntry.lastUpdateWeek) ? yearEntry.lastUpdateWeek : null;
        const weekLine = weeksTracked ? `Weeks tracked ${formatCount(weeksTracked)}` : "Weeks tracked --";
        const lastLine = lastWeek ? `Last update ${formatWeekRangeLabel(lastWeek)}` : "Last update --";
        headerLines.push(`<div class="muted">${weekLine} | ${lastLine}</div>`);
    }
    else {
        headerLines.push(`<div class="muted">Ledger data unavailable.</div>`);
    }
    const items = [
        `
      <div class="list-item">
        ${headerLines.join("")}
      </div>
    `
    ];
    if (!nomineeState.revealed) {
        const revealLabel = Number.isFinite(nomineeState.revealAt) ? formatDate(nomineeState.revealAt) : "TBD";
        items.push(`<div class="muted">Year-end charts release ${revealLabel}.</div>`);
        detailEl.innerHTML = items.join("");
        return;
    }
    if (yearEntry && !hasData) {
        items.push(`<div class="muted">No chart data recorded for ${year} yet.</div>`);
        detailEl.innerHTML = items.join("");
        return;
    }
    if (!yearEntry) {
        items.push(`<div class="muted">No year-end chart ledger available for ${year}.</div>`);
        detailEl.innerHTML = items.join("");
        return;
    }
    const definition = chartDefinitionMap.get(chartType);
    const nominees = definition ? buildAnnualAwardNomineesFromLedger(definition, yearEntry) : [];
    if (!nominees.length) {
        items.push(`<div class="muted">No chart leaders recorded yet.</div>`);
        detailEl.innerHTML = items.join("");
        return;
    }
    nominees.forEach((nominee, index) => {
        const actName = renderActName(nominee.candidate) || nominee.candidate?.actName || "Unknown Act";
        const labelName = nominee.candidate?.label || "Unknown Label";
        const labelLine = labelName ? `Label: ${labelName}` : "Label: --";
        const leadWeek = Number.isFinite(nominee.leadWeek)
            ? `First lead ${formatWeekRangeLabel(nominee.leadWeek)}`
            : "First lead --";
        const points = formatCount(Math.round(nominee.score || 0));
        items.push(`
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">#${index + 1} ${actName}</div>
            <div class="muted">${labelLine} | ${leadWeek}</div>
          </div>
          <div class="pill">${points} pts</div>
        </div>
      </div>
    `);
    });
    detailEl.innerHTML = items.join("");
}
function renderAnnualAwardsView() {
    renderAwardsViewTabs();
    const view = normalizeAwardsView(state.ui.awardsView);
    if (view === "charts") {
        renderYearEndChartsPanel();
        renderYearEndChartsDetail();
    }
    else {
        renderAnnualAwardsPanel();
        renderAnnualAwardsDetail();
    }
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
            <div class="muted">${formatWeekRangeLabel(state.economy.lastWeek || 1)}</div>
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
    const el = $("walletDetails");
    if (el)
        el.innerHTML = items.join("");
}
function renderLossArchives() {
    const target = $("usageLedgerList");
    if (!target)
        return;
    const archives = loadLossArchives();
    if (!archives.length) {
        target.innerHTML = `<div class="muted">No loss archives yet.</div>`;
        return;
    }
    const sorted = archives.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    target.innerHTML = sorted.map((entry) => {
        const createdAt = entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "Unknown";
        const slot = entry.slot ? `Slot ${entry.slot}` : "Slot -";
        const week = entry.week ? formatWeekRangeLabel(entry.week) : "Date range -";
        const year = entry.year || "-";
        const uiCount = Array.isArray(entry.uiEvents) ? entry.uiEvents.length : 0;
        const simCount = Array.isArray(entry.simEvents) ? entry.simEvents.length : 0;
        const label = entry.label || "Unknown Label";
        const reason = entry.reason || "Loss recorded.";
        const lossId = entry.id || "";
        const gameDate = entry.gameTime ? formatDate(entry.gameTime) : "Unknown";
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${label} - Loss</div>
            <div class="muted">${reason}</div>
            <div class="muted">${slot} | ${week} | Year ${year}</div>
            <div class="muted">Game date ${gameDate}</div>
            <div class="muted">UI ${uiCount} | System ${simCount} | Archived ${createdAt}</div>
          </div>
          <div class="actions">
            <button type="button" class="ghost mini" data-loss-action="download" data-loss-id="${lossId}">Download</button>
          </div>
        </div>
      </div>
    `;
    }).join("");
}
function renderResourceTickSummary() {
    const target = $("resourceTickSummary");
    if (!target)
        return;
    const ledger = state.resourceTickLedger?.hours || [];
    const recent = ledger.slice(-RESOURCE_TICK_LEDGER_LIMIT);
    const totals = recent.reduce((sum, entry) => ({
        regenTotal: sum.regenTotal + (entry.regenTotal || 0),
        spendTotal: sum.spendTotal + (entry.spendTotal || 0),
        overuseCount: sum.overuseCount + (entry.overuseCount || 0),
        departuresFlagged: sum.departuresFlagged + (entry.departuresFlagged || 0)
    }), { regenTotal: 0, spendTotal: 0, overuseCount: 0, departuresFlagged: 0 });
    const dayIndex = Math.floor(state.time.epochMs / DAY_MS);
    const spentToday = state.creators.map((creator) => ({
        creator,
        spent: getCreatorStaminaSpentToday(creator)
    }));
    spentToday.sort((a, b) => b.spent - a.spent);
    const topSpent = spentToday.filter((entry) => entry.spent > 0).slice(0, 5);
    const overuseToday = state.creators.filter((creator) => creator.lastOveruseDay === dayIndex);
    const departureRisks = state.creators.filter((creator) => creator.departurePending?.reason === "overuse");
    const blocks = [];
    blocks.push(`
    <div class="list-item">
      <div class="item-title">Last 24h</div>
      <div class="muted">Regen +${formatCount(totals.regenTotal)} | Spend -${formatCount(totals.spendTotal)}</div>
      <div class="muted">Overuse strikes ${formatCount(totals.overuseCount)} | Departures flagged ${formatCount(totals.departuresFlagged)}</div>
    </div>
  `);
    if (topSpent.length) {
        blocks.push(`
      <div class="list-item">
        <div class="item-title">Top Stamina Spent (Today)</div>
        ${topSpent.map((entry) => `
          <div class="muted">${entry.creator.name} (${roleLabel(entry.creator.role)}) - ${formatCount(entry.spent)} / ${STAMINA_OVERUSE_LIMIT}</div>
        `).join("")}
      </div>
    `);
    }
    else {
        blocks.push(`
      <div class="list-item">
        <div class="item-title">Top Stamina Spent (Today)</div>
        <div class="muted">No stamina spent yet.</div>
      </div>
    `);
    }
    if (overuseToday.length) {
        blocks.push(`
      <div class="list-item">
        <div class="item-title">Overuse Strikes Today</div>
        ${overuseToday.map((creator) => `
          <div class="muted">${creator.name} (${roleLabel(creator.role)}) - strikes ${creator.overuseStrikes}</div>
        `).join("")}
      </div>
    `);
    }
    else {
        blocks.push(`
      <div class="list-item">
        <div class="item-title">Overuse Strikes Today</div>
        <div class="muted">None.</div>
      </div>
    `);
    }
    if (departureRisks.length) {
        blocks.push(`
      <div class="list-item">
        <div class="item-title">Departure Risks</div>
        ${departureRisks.map((creator) => `
          <div class="muted">${creator.name} (${roleLabel(creator.role)}) - strikes ${creator.overuseStrikes}</div>
        `).join("")}
      </div>
    `);
    }
    else {
        blocks.push(`
      <div class="list-item">
        <div class="item-title">Departure Risks</div>
        <div class="muted">None.</div>
      </div>
    `);
    }
    target.innerHTML = blocks.join("");
}
function renderQuickRecipes() {
    if (!$("quickRecipesList"))
        return;
    const recipes = [
        { title: "Songwriting", detail: "Assign Songwriter ID + Theme to draft the sheet music." },
        { title: "Recording", detail: "Assign Recorder ID + Mood to craft the demo tone." },
        { title: "Production", detail: "Assign Producer ID to master the track quality." },
        { title: "Release", detail: "Move Ready tracks into Release Desk for scheduling." },
        { title: "Promo Pushes", detail: "Assign a Scheduled or Released Track ID to the Promo Push Slot." }
    ];
    $("quickRecipesList").innerHTML = recipes.map((recipe) => `
    <div class="list-item">
      <div class="item-title">${recipe.title}</div>
      <div class="muted">${recipe.detail}</div>
    </div>
  `).join("");
}
function renderActiveArea() {
    if (!$("activeAreaDisplay"))
        return;
    const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
    const counts = getStudioUsageCounts();
    const ownedSlots = getOwnedStudioSlots();
    const totalSlots = ownedSlots + counts.leased;
    state.studio.inUse = counts.total;
    let era = "No active eras";
    if (activeEras.length === 1) {
        const active = activeEras[0];
        era = `${active.name} (${ERA_STAGES[active.stageIndex] || "Active"})`;
    }
    else if (activeEras.length > 1) {
        const names = activeEras.slice(0, 2).map((entry) => entry.name).join(", ");
        const extra = activeEras.length > 2 ? ` +${activeEras.length - 2}` : "";
        era = `${activeEras.length} active (${names}${extra})`;
    }
    $("activeAreaDisplay").innerHTML = `
    <div class="list-item">
      <div class="list-row">
        <div>
          <div class="item-title">Studios</div>
          <div class="muted">${counts.total} active / ${totalSlots} total</div>
        </div>
        <div class="pill">${totalSlots} rooms</div>
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
    if (!$("inventoryList"))
        return;
    const ready = state.tracks.filter((track) => track.status === "Ready" || track.status === "Scheduled");
    if (!ready.length) {
        $("inventoryList").innerHTML = `<div class="muted">No finished content yet.</div>`;
        return;
    }
    $("inventoryList").innerHTML = ready.map((track) => `
    <div class="list-item">
      <div class="list-row">
        <div class="item-main">
          <div class="content-thumb" aria-hidden="true"></div>
          <div>
            <div class="item-title">${renderTrackTitle(track.title)}</div>
            <div class="muted">Item: Track  ID ${track.id}</div>
            <div class="muted">${track.status}  ${renderTrackGenrePills(track)}</div>
          </div>
        </div>
        <div class="pill grade" data-grade="${qualityGrade(track.quality)}">${qualityGrade(track.quality)}</div>
      </div>
    </div>
  `).join("");
}
function renderModifierInventory() {
    const listEl = $("modifierInventoryList");
    if (!listEl)
        return;
    const items = MODIFIERS.filter((mod) => mod.id !== "None" && getModifierInventoryCount(mod.id) > 0);
    if (!items.length) {
        listEl.innerHTML = `<div class="muted">No modifiers purchased yet.</div>`;
        return;
    }
    listEl.innerHTML = items.map((modifier) => `
    <div class="list-item">
      <div class="list-row">
        <div>
          <div class="item-title">${modifier.label}</div>
          <div class="muted">${modifier.desc}</div>
          ${renderModifierFocus(modifier)}
          <div class="tiny muted">${formatModifierDelta(modifier)}</div>
        </div>
        <div class="pill">x${getModifierInventoryCount(modifier.id)}</div>
      </div>
    </div>
  `).join("");
}
function renderModifierTools() {
    const listEl = $("communityToolsList");
    if (!listEl)
        return;
    const inflationMultiplier = getPromoInflationMultiplier();
    const inflationLabel = $("modifierInflationLabel");
    if (inflationLabel)
        inflationLabel.textContent = `Inflation x${inflationMultiplier.toFixed(2)}`;
    const tools = MODIFIERS.filter((mod) => mod.id !== "None");
    if (!tools.length) {
        listEl.innerHTML = `<div class="muted">No modifiers available.</div>`;
        return;
    }
    listEl.innerHTML = tools.map((modifier) => {
        const { baseCost, adjustedCost } = getModifierCosts(modifier, inflationMultiplier);
        const ownedCount = getModifierInventoryCount(modifier.id);
        const canAfford = state.label.cash >= adjustedCost;
        const buttonLabel = `Buy ${formatMoney(adjustedCost)}${canAfford ? "" : " (short)"}`;
        const buttonState = !canAfford ? " disabled" : "";
        const focusLine = renderModifierFocus(modifier);
        const deltaLine = `<div class="tiny muted">${formatModifierDelta(modifier)}</div>`;
        const priceLine = `<div class="tiny muted">Base ${formatMoney(baseCost)} | Inflation-adjusted ${formatMoney(adjustedCost)}</div>`;
        const ownedLine = ownedCount ? `<div class="tiny muted">Owned: x${ownedCount}</div>` : "";
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${modifier.label}</div>
            <div class="muted">${modifier.desc}</div>
            ${focusLine}
            ${deltaLine}
            ${priceLine}
            ${ownedLine}
          </div>
          <button type="button" class="ghost mini" data-modifier-buy="${modifier.id}"${buttonState}>${buttonLabel}</button>
        </div>
      </div>
    `;
    }).join("");
}
function renderCalendarEraList(eras) {
    if (!eras.length) {
        return `<div class="muted">No active eras on the calendar.</div>`;
    }
    return eras.map((era) => {
        const startedLabel = Number.isFinite(era.startedWeek) ? formatWeekRangeLabel(era.startedWeek) : "TBD";
        return `
      <div class="list-item">
        <div class="item-title">${era.name}</div>
        <div class="muted">Act: ${renderActName(era) || "Unknown"} | Stage: ${era.stageName}</div>
        <div class="muted">Started ${startedLabel} | Content: ${era.content}</div>
      </div>
    `;
    }).join("");
}
function normalizeCalendarTab() {
    if (!state.ui)
        state.ui = {};
    const tab = state.ui.calendarTab;
    if (tab !== "label" && tab !== "public") {
        state.ui.calendarTab = "label";
    }
    return state.ui.calendarTab || "label";
}
function renderCalendarView() {
    normalizeCalendarTab();
    const grid = $("calendarGrid");
    const list = $("calendarList");
    const footerPanel = $("calendarFooterPanel");
    const rangeLabel = $("calendarRangeLabel");
    const projection = buildCalendarProjection({ pastWeeks: 0, futureWeeks: 3 });
    if (rangeLabel)
        rangeLabel.textContent = projection.rangeLabel || "";
    if (grid) {
        grid.classList.remove("hidden");
        grid.innerHTML = CalendarView(projection);
    }
    if (list)
        list.classList.remove("hidden");
    if (footerPanel) {
        footerPanel.classList.remove("hidden");
        footerPanel.classList.toggle("is-collapsed", !!state.ui?.calendarFooterCollapsed);
    }
    const upcomingWeeks = projection.weeks.length || 1;
    const upcomingProjection = buildCalendarProjection({
        pastWeeks: 0,
        futureWeeks: Math.max(0, upcomingWeeks - 1),
        anchorWeekIndex: weekIndex() + 1
    });
    renderCalendarList("calendarList", upcomingWeeks, upcomingProjection);
}
function formatEventTimeLabel(epochMs) {
    if (!Number.isFinite(epochMs))
        return "";
    const date = new Date(epochMs);
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return hours === "00" && minutes === "00" ? "" : `${hours}:${minutes}`;
}
function renderCalendarUpcomingFooter(projection, tab) {
    const daysWithEvents = [];
    (projection.weeks || []).forEach((week) => {
        const days = Array.isArray(week.days) ? week.days : [];
        days.forEach((day) => {
            if (Array.isArray(day.events) && day.events.length)
                daysWithEvents.push(day);
        });
    });
    const countLabel = `${daysWithEvents.length} day${daysWithEvents.length === 1 ? "" : "s"}`;
    const isCollapsed = !!state.ui?.calendarFooterCollapsed;
    const toggleLabel = isCollapsed ? "Expand" : "Minimize";
    const togglePressed = isCollapsed ? "true" : "false";
    const header = `
    <div class="calendar-footer-head">
      <div class="subhead">Upcoming</div>
      <div class="calendar-footer-actions">
        <div class="tiny muted">${countLabel}</div>
        <button type="button" class="ghost mini" data-calendar-footer-toggle aria-pressed="${togglePressed}">${toggleLabel}</button>
      </div>
    </div>
  `;
    if (!daysWithEvents.length) {
        return `${header}<div class="calendar-upcoming calendar-upcoming--empty"><div class="muted">No upcoming events.</div></div>`;
    }
    const cards = daysWithEvents.map((day) => {
        const events = Array.isArray(day.events) ? day.events.slice().sort((a, b) => a.ts - b.ts) : [];
        const visible = events.slice(0, 3);
        const overflow = events.length - visible.length;
        const dayClass = day.isPreview ? "calendar-upcoming-day is-preview" : "calendar-upcoming-day";
        const items = visible.map((entry) => {
            const title = entry.title || "Untitled";
            const typeLabel = entry.typeLabel || "Event";
            const distribution = entry.distribution || "Digital";
            const timeLabel = formatEventTimeLabel(entry.ts);
            const metaLine = timeLabel ? `${typeLabel} | ${timeLabel} | ${distribution}` : `${typeLabel} | ${distribution}`;
            const actLabel = renderActName(entry) || "Unknown";
            const labelName = entry.label || "Label";
            const showLabel = entry.showLabel || tab === "public";
            const labelCountry = getRivalByName(labelName)?.country || state.label.country || "Annglora";
            const labelTag = showLabel ? renderLabelTag(labelName, labelCountry) : "";
            const labelLine = showLabel
                ? `${labelTag}<span class="calendar-upcoming-event-act">${actLabel}</span>`
                : `<span class="calendar-upcoming-event-act">${actLabel}</span>`;
            return `
        <div class="calendar-upcoming-event">
          <div class="calendar-upcoming-event-title">${title}</div>
          <div class="calendar-upcoming-event-meta">${metaLine}</div>
          <div class="calendar-upcoming-event-label">${labelLine}</div>
        </div>
      `;
        }).join("");
        const overflowHtml = overflow > 0
            ? `<div class="calendar-upcoming-event calendar-upcoming-event--more" data-calendar-day-more data-day-ts="${day.start}" role="button" tabindex="0">+${overflow} more</div>`
            : "";
        return `
      <div class="${dayClass}" data-day-ts="${day.start}">
        <div class="calendar-upcoming-meta">
          <div class="calendar-upcoming-date">
            <span class="calendar-upcoming-dayname">${day.dayLabel}</span>
            <span class="calendar-upcoming-datelabel">${day.dateLabel}</span>
          </div>
          <div class="calendar-upcoming-count">${events.length} event${events.length === 1 ? "" : "s"}</div>
        </div>
        <div class="calendar-upcoming-events">
          ${items}
          ${overflowHtml}
        </div>
      </div>
    `;
    }).join("");
    return `${header}<div class="calendar-upcoming">${cards}</div>`;
}
function formatBroadcastScope(scope) {
    if (!scope)
        return "Local";
    if (scope.type === "global")
        return "Global";
    if (scope.type === "nation")
        return `${scope.id} Nation`;
    if (scope.type === "region")
        return `${scope.id} Region`;
    return scope.id || scope.type || "Local";
}
function listPromoTimeframesSafe() {
    return Array.isArray(PROMO_TIMEFRAMES) ? PROMO_TIMEFRAMES : [];
}
function promoDayStartEpochMs(epochMs) {
    const day = new Date(epochMs);
    day.setUTCHours(0, 0, 0, 0);
    return day.getTime();
}
function resolvePromoWindow(epochMs) {
    const frames = listPromoTimeframesSafe();
    if (!frames.length)
        return null;
    const hour = new Date(epochMs).getUTCHours();
    const dayStart = promoDayStartEpochMs(epochMs);
    const current = frames.find((frame) => hour >= frame.startHour && hour < frame.endHour);
    if (current)
        return { frame: current, dayStart, isCurrent: true };
    const first = frames[0];
    if (hour < first.startHour)
        return { frame: first, dayStart, isCurrent: false };
    return { frame: first, dayStart: dayStart + DAY_MS, isCurrent: false };
}
function buildWeekSelectOptions({ selectedWeek, startWeek, count, placeholder = "Date range" }) {
    const baseWeek = Number.isFinite(startWeek) ? startWeek : weekIndex() + 1;
    const total = Math.max(1, Math.round(Number(count) || 1));
    const weeks = new Set();
    if (Number.isFinite(selectedWeek))
        weeks.add(selectedWeek);
    for (let i = 0; i < total; i += 1) {
        weeks.add(baseWeek + i);
    }
    const options = Array.from(weeks)
        .sort((a, b) => a - b)
        .map((week) => `<option value="${week}">${formatWeekRangeLabel(week)}</option>`)
        .join("");
    const placeholderOption = placeholder ? `<option value="">${placeholder}</option>` : "";
    return `${placeholderOption}${options}`;
}
function renderPromoScheduleControls() {
    const weekInput = $("promoScheduleWeek");
    const daySelect = $("promoScheduleDay");
    const timeframeSelect = $("promoScheduleTimeframe");
    if (!weekInput || !daySelect || !timeframeSelect)
        return;
    if (!state.ui)
        state.ui = {};
    const frames = listPromoTimeframesSafe();
    const options = frames.map((frame) => `<option value="${frame.id}">${frame.label}</option>`).join("");
    timeframeSelect.innerHTML = `<option value="">Timeframe</option>${options}`;
    const selectedWeek = Number.isFinite(state.ui.promoScheduleWeek)
        ? Math.max(1, Math.round(state.ui.promoScheduleWeek))
        : null;
    const dayValue = Number.isFinite(state.ui.promoScheduleDay)
        ? String(clamp(Math.round(state.ui.promoScheduleDay), 0, 6))
        : "";
    if (weekInput.tagName === "SELECT") {
        weekInput.innerHTML = buildWeekSelectOptions({
            selectedWeek,
            startWeek: weekIndex() + 1,
            count: 12,
            placeholder: "Date range"
        });
        weekInput.value = selectedWeek ? String(selectedWeek) : "";
    }
    else {
        weekInput.value = selectedWeek ? String(selectedWeek) : "";
    }
    if (!daySelect.querySelector('option[value=""]')) {
        daySelect.insertAdjacentHTML("afterbegin", "<option value=\"\">Day</option>");
    }
    daySelect.value = dayValue;
    timeframeSelect.value = state.ui.promoScheduleTimeframe || "";
}
function getBookingTimeframeId(booking) {
    if (booking?.timeframeId)
        return booking.timeframeId;
    if (!Number.isFinite(booking?.startsAt))
        return null;
    const hour = new Date(booking.startsAt).getUTCHours();
    const frames = listPromoTimeframesSafe();
    const match = frames.find((frame) => hour >= frame.startHour && hour < frame.endHour);
    return match?.id || frames[0]?.id || null;
}
function getStudioTimeframeCapacity(studio, timeframeId) {
    const frames = listPromoTimeframesSafe();
    const frame = frames.find((entry) => entry.id === timeframeId);
    if (!frame)
        return 0;
    const overrides = studio?.timeframeSlots;
    if (overrides && typeof overrides === "object") {
        const value = overrides[timeframeId];
        if (Number.isFinite(value))
            return Math.max(0, Math.floor(value));
    }
    return Math.max(0, Math.floor(frame.slots || 0));
}
function buildPromoTimeframeUsage(bookings, studio, dayStart, defaultStudioId) {
    const frames = listPromoTimeframesSafe();
    return frames.map((frame) => {
        const capacity = getStudioTimeframeCapacity(studio, frame.id);
        const inUse = bookings.filter((booking) => {
            if (!booking)
                return false;
            const bookingStudioId = booking.studioId || defaultStudioId;
            if (studio && bookingStudioId !== studio.id)
                return false;
            if (!Number.isFinite(booking.startsAt))
                return false;
            if (promoDayStartEpochMs(booking.startsAt) !== dayStart)
                return false;
            const timeframeId = getBookingTimeframeId(booking);
            return timeframeId === frame.id;
        }).length;
        return { frame, capacity, inUse, available: Math.max(0, capacity - inUse) };
    });
}
function formatPromoTimeframeUsageLine(usage) {
    if (!usage.length)
        return "Slots: -";
    const segments = usage.map((entry) => `${entry.frame.label} ${formatCount(entry.inUse)}/${formatCount(entry.capacity)}`);
    return `Slots: ${segments.join(" | ")}`;
}
function renderCalendarStructuresPanel() {
    const recordingList = $("calendarRecordingStudios");
    const broadcastList = $("calendarBroadcastStudios");
    const filmingList = $("calendarFilmingStudios");
    if (!recordingList && !broadcastList && !filmingList)
        return;
    if (recordingList) {
        const entries = buildStudioEntries().filter((entry) => entry.ownerType !== "player");
        const grouped = new Map();
        entries.forEach((entry) => {
            const key = entry.ownerId || entry.ownerName || entry.id;
            if (!grouped.has(key)) {
                grouped.set(key, { ownerName: entry.ownerName || "Rival", slotCount: entry.slotCount || 0, occupied: 0 });
            }
            const group = grouped.get(key);
            group.slotCount = Math.max(group.slotCount, entry.slotCount || 0);
            if (entry.occupied)
                group.occupied += 1;
        });
        const list = Array.from(grouped.values()).sort((a, b) => a.ownerName.localeCompare(b.ownerName));
        if (!list.length) {
            recordingList.innerHTML = `<div class="muted">No rival recording studios tracked yet.</div>`;
        }
        else {
            recordingList.innerHTML = list.map((entry) => {
                const available = Math.max(0, entry.slotCount - entry.occupied);
                const slotLine = `Slots: ${formatCount(entry.occupied)} in use | ${formatCount(available)} open | Cap ${formatCount(entry.slotCount)}`;
                const status = available > 0 ? `${formatCount(available)} open` : "Full";
                return `
          <div class="list-item">
            <div class="list-row">
              <div>
                <div class="item-title">${entry.ownerName} Recording Studios</div>
                <div class="muted">${slotLine}</div>
              </div>
              <div class="pill">${status}</div>
            </div>
          </div>
        `;
            }).join("");
        }
    }
    if (broadcastList) {
        const studios = Array.isArray(BROADCAST_STUDIOS) ? BROADCAST_STUDIOS : [];
        if (!studios.length) {
            broadcastList.innerHTML = `<div class="muted">No broadcast studios available.</div>`;
        }
        else {
            const epochMs = Number.isFinite(state.time?.epochMs) ? state.time.epochMs : Date.now();
            const window = resolvePromoWindow(epochMs);
            const dayIndex = new Date((window?.dayStart ?? epochMs)).getUTCDay();
            const dayLabel = DAYS?.[dayIndex] || "Day";
            const windowLabel = window ? (window.isCurrent ? window.frame.label : `Next ${window.frame.label}`) : "";
            const bookings = state.promoFacilities?.broadcast?.bookings || [];
            const dayStart = window?.dayStart ?? promoDayStartEpochMs(epochMs);
            const defaultStudioId = studios[0]?.id || null;
            broadcastList.innerHTML = studios.map((studio) => {
                const usage = buildPromoTimeframeUsage(bookings, studio, dayStart, defaultStudioId);
                const windowUsage = window ? usage.find((entry) => entry.frame.id === window.frame.id) : null;
                const capacity = windowUsage?.capacity || 0;
                const available = windowUsage?.available || 0;
                const scopeLabel = formatBroadcastScope(studio.scope);
                const meta = `${studio.owner || "Broadcast"} | ${scopeLabel} | ${dayLabel}${windowLabel ? ` | ${windowLabel}` : ""}`;
                const slotLine = formatPromoTimeframeUsageLine(usage);
                const status = capacity > 0 ? `${formatCount(available)} open` : "Closed";
                return `
          <div class="list-item">
            <div class="list-row">
              <div>
                <div class="item-title">${studio.label}</div>
                <div class="muted">${meta}</div>
                <div class="muted">${slotLine}</div>
              </div>
              <div class="pill">${status}</div>
            </div>
          </div>
        `;
            }).join("");
        }
    }
    if (filmingList) {
        const studios = Array.isArray(FILMING_STUDIOS) ? FILMING_STUDIOS : [];
        if (!studios.length) {
            filmingList.innerHTML = `<div class="muted">No filming studios available.</div>`;
        }
        else {
            const epochMs = Number.isFinite(state.time?.epochMs) ? state.time.epochMs : Date.now();
            const window = resolvePromoWindow(epochMs);
            const dayIndex = new Date((window?.dayStart ?? epochMs)).getUTCDay();
            const dayLabel = DAYS?.[dayIndex] || "Day";
            const windowLabel = window ? (window.isCurrent ? window.frame.label : `Next ${window.frame.label}`) : "";
            const dayStart = window?.dayStart ?? promoDayStartEpochMs(epochMs);
            const bookings = state.promoFacilities?.filming?.bookings || [];
            const defaultStudioId = studios[0]?.id || null;
            filmingList.innerHTML = studios.map((studio) => {
                const usage = buildPromoTimeframeUsage(bookings, studio, dayStart, defaultStudioId);
                const windowUsage = window ? usage.find((entry) => entry.frame.id === window.frame.id) : null;
                const capacity = windowUsage?.capacity || 0;
                const available = windowUsage?.available || 0;
                const scopeLabel = formatBroadcastScope(studio.scope);
                const meta = `${studio.owner || "Filming"} | ${scopeLabel} | ${dayLabel}${windowLabel ? ` | ${windowLabel}` : ""}`;
                const slotLine = formatPromoTimeframeUsageLine(usage);
                const status = capacity > 0 ? `${formatCount(available)} open` : "Closed";
                return `
          <div class="list-item">
            <div class="list-row">
              <div>
                <div class="item-title">${studio.label}</div>
                <div class="muted">${meta}</div>
                <div class="muted">${slotLine}</div>
              </div>
              <div class="pill">${status}</div>
            </div>
          </div>
        `;
            }).join("");
        }
    }
    renderAchievements();
    renderRivalAchievementRace();
}
function renderCalendarList(targetId, weeks, projectionOverride) {
    const target = $(targetId);
    if (!target)
        return;
    if (UI_REACT_ISLANDS_ENABLED && targetId === "calendarFullList") {
        target.innerHTML = "";
        return;
    }
    normalizeCalendarTab();
    const futureWeeks = Math.max(0, (weeks || 1) - 1);
    const projection = projectionOverride && (projectionOverride.tab === "label" || projectionOverride.tab === "public")
        ? projectionOverride
        : buildCalendarProjection({ pastWeeks: 0, futureWeeks });
    const tab = projection.tab === "public" ? "public" : "label";
    const filters = projection.filters || {};
    const scope = target.closest("#calendarModal") || target.closest(".view") || document;
    scope.querySelectorAll("[data-calendar-tab]").forEach((btn) => {
        if (!btn.dataset.calendarTab)
            return;
        btn.classList.toggle("active", btn.dataset.calendarTab === tab);
    });
    scope.querySelectorAll("[data-calendar-filter]").forEach((input) => {
        const key = input.dataset.calendarFilter;
        if (!key || typeof filters[key] !== "boolean")
            return;
        input.checked = filters[key] !== false;
    });
    if (targetId === "calendarList") {
        target.innerHTML = renderCalendarUpcomingFooter(projection, tab);
        return;
    }
    if (!projection.weeks.length) {
        target.innerHTML = `<div class="muted">No scheduled entries.</div>`;
        return;
    }
    target.innerHTML = projection.weeks.map((week) => {
        const entries = Array.isArray(week.events) ? week.events.slice() : [];
        entries.sort((a, b) => a.ts - b.ts);
        const weekLabel = formatCompactDateRange(week.start, week.end - HOUR_MS);
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${weekLabel}</div>
            <div class="muted">${formatDate(week.start)} - ${formatDate(week.end - HOUR_MS)}</div>
          </div>
          <div class="pill">${entries.length} event(s)</div>
        </div>
        ${entries.map((entry) => {
            const label = entry.label || "Label";
            const labelCountry = getRivalByName(label)?.country || state.label.country || "Annglora";
            const labelTag = label ? renderLabelTag(label, labelCountry) : "Label";
            const actLabel = renderActName(entry) || "Unknown";
            const title = entry.title || "Untitled";
            const typeLabel = entry.typeLabel || "Event";
            const distribution = entry.distribution || "Digital";
            const timeLabel = formatEventTimeLabel(entry.ts);
            const timeLine = timeLabel ? ` @ ${timeLabel}` : "";
            return `
            <div class="muted">${labelTag} | ${actLabel} | ${title} (${typeLabel}${timeLine}, ${distribution})</div>
          `;
        }).join("")}
      </div>
    `;
    }).join("");
}
function renderCalendarDayDetail(dayStartTs) {
    const listEl = $("calendarDayList");
    if (!listEl)
        return;
    const titleEl = $("calendarDayTitle");
    const dayStart = Number(dayStartTs);
    if (!Number.isFinite(dayStart)) {
        if (titleEl)
            titleEl.textContent = "Selected day";
        listEl.innerHTML = `<div class="muted">No date selected.</div>`;
        return;
    }
    if (titleEl)
        titleEl.textContent = formatShortDate(dayStart);
    const weekNumber = weekNumberFromEpochMs(dayStart);
    const anchorWeekIndex = Number.isFinite(weekNumber) ? weekNumber - 1 : weekIndex();
    const projection = buildCalendarProjection({ pastWeeks: 0, futureWeeks: 0, anchorWeekIndex });
    const week = projection.weeks[0];
    const day = week?.days?.find((entry) => entry.start === dayStart) || null;
    const events = Array.isArray(day?.events) ? day.events.slice().sort((a, b) => a.ts - b.ts) : [];
    if (!events.length) {
        listEl.innerHTML = `<div class="muted">No events scheduled for this day.</div>`;
        return;
    }
    listEl.innerHTML = events.map((entry) => {
        const label = entry.label || "Label";
        const labelCountry = getRivalByName(label)?.country || state.label.country || "Annglora";
        const labelTag = label ? renderLabelTag(label, labelCountry) : "Label";
        const actLabel = renderActName(entry) || "Unknown";
        const title = entry.title || "Untitled";
        const typeLabel = entry.typeLabel || "Event";
        const distribution = entry.distribution || "Digital";
        const timeLabel = formatEventTimeLabel(entry.ts);
        const timeLine = timeLabel ? ` @ ${timeLabel}` : "";
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${title}</div>
            <div class="muted">${labelTag} | ${actLabel}</div>
            <div class="muted">${typeLabel}${timeLine} | ${distribution}</div>
          </div>
        </div>
      </div>
    `;
    }).join("");
}
function renderActs() {
    if (!state.acts.length) {
        $("actList").innerHTML = `<div class="muted">No acts yet.</div>`;
        return;
    }
    const list = state.acts.map((act) => {
        const activeEras = getActiveEras().filter((era) => era.actId === act.id && era.status === "Active");
        const historyCount = state.era.history.filter((era) => era.actId === act.id).length;
        const eraLabel = activeEras.length
            ? activeEras.map((era) => `${era.name} (${ERA_STAGES[era.stageIndex] || "Active"})`).join(", ")
            : "None active";
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
              <div class="item-title">${renderActName(act)}</div>
              <div class="muted">ID ${act.id} | ${act.type}</div>
              <div class="muted">${renderAlignmentTag(act.alignment)}</div>
            </div>
            <button type="button" class="ghost" data-act-set="${act.id}">Assign</button>
          </div>
        <div class="muted">Members: ${members || "None"}</div>
        <div class="muted">Eras: ${eraLabel}${historyCount ? ` | Past ${historyCount}` : ""}</div>
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
function renderCreatorFallbackSymbols({ unassigned = false } = {}) {
    const emoji = unassigned ? UNASSIGNED_CREATOR_EMOJI : CREATOR_FALLBACK_EMOJI;
    return `<span class="avatar-symbols" aria-hidden="true"><span class="material-symbols-rounded avatar-icon">${CREATOR_FALLBACK_ICON}</span><span class="avatar-emoji">${emoji}</span></span>`;
}
function renderCreatorAvatar(creator) {
    const initials = creatorInitials(creator?.nameHangul || creator?.name || "");
    const portraitUrl = getCreatorPortraitUrl(creator);
    const hasImage = Boolean(portraitUrl);
    const imageStyle = hasImage ? ` style="background-image: url('${safeAvatarUrl(portraitUrl)}')"` : "";
    const className = hasImage ? "creator-avatar has-image" : "creator-avatar has-symbols";
    const note = creator?.portraitNote ? ` title="${escapeAttribute(creator.portraitNote)}"` : "";
    const content = hasImage ? initials : renderCreatorFallbackSymbols();
    return `<div class="${className}" aria-hidden="true"${imageStyle}${note}>${content}</div>`;
}
function renderCreators() {
    const creatorList = $("creatorList");
    if (!creatorList)
        return;
    const busyIds = getBusyCreatorIds("In Progress");
    const pool = state.creators || [];
    const labelName = state.label?.name || "";
    const labelCountry = state.label?.country || "";
    const labelAcronym = state.label?.acronym || "";
    const labelPill = renderCreatorLabelPill({ labelName, labelCountry, labelAcronym });
    const actPopularityMap = buildActPopularityScoreMap();
    const columns = MARKET_ROLES.map((role) => {
        const roleLabelText = roleLabel(role);
        const roleCreators = pool.filter((creator) => creator.role === role);
        const list = roleCreators.map((creator) => {
            const busy = busyIds.has(creator.id);
            const staminaPct = Math.round((creator.stamina / STAMINA_MAX) * 100);
            const catharsisScore = getCreatorCatharsisScore(creator);
            const catharsisGrade = scoreGrade(catharsisScore);
            const inactivity = getCreatorCatharsisInactivityStatus(creator);
            const inactivityPct = Math.round((inactivity?.pct || 0) * 100);
            const inactivityDetail = inactivityPct > 0
                ? `Inactivity debuff: -${inactivityPct}% catharsis${inactivity?.isRecovering && Number.isFinite(inactivity?.recoveryDaysRemaining)
                    ? ` | recovering ${formatCount(inactivity.recoveryDaysRemaining)}d`
                    : " | recovers over 14d after use"}`
                : "";
            const roleText = roleLabel(creator.role);
            const themeCells = creator.prefThemes.map((theme) => renderThemeTag(theme)).join("");
            const moodCells = creator.prefMoods.map((mood) => renderMoodTag(mood)).join("");
            const nationalityPill = renderNationalityPill(creator.country);
            const memberships = listCreatorActs(creator.id);
            const sortedActs = sortActsByPopularity(memberships, actPopularityMap);
            const primaryAct = sortedActs[0] || null;
            const primaryActLabel = primaryAct ? renderActName(primaryAct) : "No Act";
            const hasMultipleActs = sortedActs.length > 1;
            const popoverId = `creator-acts-popover-${creator.id}`;
            const actsPopover = hasMultipleActs
                ? `
          <div id="${popoverId}" class="creator-acts-popover" data-creator-acts-popover="${creator.id}" aria-hidden="true">
            <div class="creator-acts-popover-title">Acts</div>
            <div class="creator-acts-popover-list">
              ${sortedActs.map((act) => `<div class="creator-acts-popover-item">${renderActName(act)}</div>`).join("")}
            </div>
          </div>
        `
                : "";
            const actsMoreButton = hasMultipleActs
                ? `<button type="button" class="ghost mini creator-acts-more" data-creator-acts-more="${creator.id}" aria-expanded="false" aria-controls="${popoverId}">See more</button>`
                : "";
            return `
        <div class="list-item" data-entity-type="creator" data-entity-id="${creator.id}" data-entity-name="${creator.name}" draggable="true">
          <div class="list-row">
            <div class="creator-card">
              <div class="creator-card-header">
                <div class="creator-card-header-left">${nationalityPill}${labelPill}</div>
                <div class="creator-card-header-right">
                  <div class="creator-card-occupation">${roleText}</div>
                  <div class="creator-card-id">ID ${creator.id}</div>
                </div>
              </div>
              <div class="creator-card-body">
                <div class="creator-card-portrait">${renderCreatorAvatar(creator)}</div>
                <div class="creator-card-info">
                  <div class="item-title">${renderCreatorName(creator)}</div>
                  <div class="muted">${formatCreatorAgeMeta(creator)}</div>
                  <div class="muted">${renderCreatorSkillProgress(creator)}</div>
                  <div class="creator-card-meta-row">
                    <div class="muted">Catharsis <span class="grade-text" data-grade="${catharsisGrade}">${catharsisScore}</span></div>
                    <div class="muted creator-card-acts">
                      <span class="creator-acts-label">Acts:</span>
                      <span class="creator-acts-primary">${primaryActLabel}</span>
                      ${actsMoreButton}
                      ${actsPopover}
                    </div>
                  </div>
                  ${inactivityDetail ? `<div class="muted">${inactivityDetail}</div>` : ""}
                  <div class="muted">Preferred Themes:</div>
                  <div class="creator-pref-tags">${themeCells}</div>
                  <div class="muted">Preferred Moods:</div>
                  <div class="creator-pref-tags">${moodCells}</div>
                </div>
              </div>
              <div class="creator-card-footer">
                <div class="creator-card-stamina">
                  <div class="bar"><span style="width:${staminaPct}%"></span></div>
                  <div class="muted">Stamina ${creator.stamina} / ${STAMINA_MAX}</div>
                </div>
                <div class="creator-card-actions">
                  <div class="pill">${busy ? "Busy" : "Ready"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
        });
        const emptyMsg = pool.length
            ? `No ${roleLabelText} Creator IDs signed.`
            : "No Creator IDs signed.";
        return `
      <div class="ccc-market-column" data-role="${role}">
        <div class="ccc-market-head">
          <div class="ccc-market-title">${roleLabelText}s</div>
          <div class="tiny muted">${roleCreators.length} signed</div>
        </div>
        <div class="list ccc-market-list">
          ${list.length ? list.join("") : `<div class="muted">${emptyMsg}</div>`}
        </div>
      </div>
    `;
    });
    creatorList.innerHTML = columns.join("");
}
function renderCheaterCccControls() {
    const roleSelect = $("cheatCccRole");
    if (roleSelect && !roleSelect.dataset.built) {
        roleSelect.innerHTML = MARKET_ROLES.map((role) => `<option value="${role}">${roleLabel(role)}</option>`).join("");
        roleSelect.dataset.built = "1";
    }
    const themeSelect = $("cheatCccTheme");
    if (themeSelect && !themeSelect.dataset.built) {
        themeSelect.innerHTML = buildThemeOptions([{ value: "", label: "Any Theme" }]);
        bindThemeSelectAccent(themeSelect);
        themeSelect.dataset.built = "1";
    }
    const moodSelect = $("cheatCccMood");
    if (moodSelect && !moodSelect.dataset.built) {
        moodSelect.innerHTML = buildMoodOptions([{ value: "", label: "Any Mood" }]);
        moodSelect.dataset.built = "1";
    }
    const countrySelect = $("cheatCccCountry");
    if (countrySelect && !countrySelect.dataset.built) {
        const options = [`<option value="">Any Nation</option>`]
            .concat(NATIONS.map((nation) => `<option value="${nation}">${nation}</option>`));
        countrySelect.innerHTML = options.join("");
        countrySelect.dataset.built = "1";
    }
    const genderSelect = $("cheatCccGender");
    if (genderSelect && !genderSelect.dataset.built) {
        genderSelect.innerHTML = [
            `<option value="">Any Gender</option>`,
            `<option value="man">Man</option>`,
            `<option value="woman">Woman</option>`,
            `<option value="nonbinary">Non-binary</option>`
        ].join("");
        genderSelect.dataset.built = "1";
    }
    const cheaterActive = Boolean(state.meta?.cheaterMode);
    document.querySelectorAll("[data-cheat-ccc]").forEach((input) => {
        if (!input)
            return;
        input.disabled = !cheaterActive;
    });
    const status = $("cheatCccStatus");
    if (status) {
        status.textContent = cheaterActive
            ? "Cheater mode active. Inject Creator IDs into the CCC pool."
            : "Enable Cheater Mode in Settings to use CCC injection.";
    }
}
function renderMarket() {
    ensureMarketCreators({}, { replenish: false });
    renderCheaterCccControls();
    const listEl = $("marketList");
    if (!listEl)
        return;
    const filters = state.ui.cccFilters || {};
    document.querySelectorAll("[data-ccc-filter]").forEach((input) => {
        const key = input.dataset.cccFilter;
        if (!key)
            return;
        input.checked = filters[key] !== false;
    });
    const themeFilter = state.ui.cccThemeFilter || "All";
    const moodFilter = state.ui.cccMoodFilter || "All";
    const sortMode = state.ui.cccSort || "default";
    const themeSelect = $("cccThemeFilter");
    const moodSelect = $("cccMoodFilter");
    const sortSelect = $("cccSort");
    if (themeSelect) {
        themeSelect.value = themeFilter;
        setThemeSelectAccent(themeSelect);
    }
    if (moodSelect)
        moodSelect.value = moodFilter;
    if (sortSelect)
        sortSelect.value = sortMode;
    const filtersActive = themeFilter !== "All" || moodFilter !== "All";
    const pool = state.marketCreators || [];
    const now = state.time.epochMs;
    pruneCreatorSignLockouts(now);
    const unsignedPill = renderCreatorLabelPill({ unsigned: true });
    const sortCreators = (list) => {
        const entries = list.map((creator, index) => ({
            creator,
            index,
            isLocked: Boolean(getCreatorSignLockout(creator.id, now))
        }));
        const byText = (a, b) => a.localeCompare(b);
        const themeKey = (creator) => (creator.prefThemes?.[0] ? creator.prefThemes[0] : "");
        const themeKey2 = (creator) => (creator.prefThemes?.[1] ? creator.prefThemes[1] : "");
        const moodKey = (creator) => (creator.prefMoods?.[0] ? creator.prefMoods[0] : "");
        const moodKey2 = (creator) => (creator.prefMoods?.[1] ? creator.prefMoods[1] : "");
        const compareBySort = (a, b) => {
            if (!sortMode || sortMode === "default")
                return a.index - b.index;
            if (sortMode === "quality-desc") {
                return (b.creator.skill || 0) - (a.creator.skill || 0)
                    || byText(a.creator.name || "", b.creator.name || "")
                    || a.index - b.index;
            }
            if (sortMode === "quality-asc") {
                return (a.creator.skill || 0) - (b.creator.skill || 0)
                    || byText(a.creator.name || "", b.creator.name || "")
                    || a.index - b.index;
            }
            if (sortMode === "theme-asc") {
                return byText(themeKey(a.creator), themeKey(b.creator))
                    || byText(themeKey2(a.creator), themeKey2(b.creator))
                    || byText(a.creator.name || "", b.creator.name || "")
                    || a.index - b.index;
            }
            if (sortMode === "theme-desc") {
                return byText(themeKey(b.creator), themeKey(a.creator))
                    || byText(themeKey2(b.creator), themeKey2(a.creator))
                    || byText(a.creator.name || "", b.creator.name || "")
                    || a.index - b.index;
            }
            if (sortMode === "mood-asc") {
                return byText(moodKey(a.creator), moodKey(b.creator))
                    || byText(moodKey2(a.creator), moodKey2(b.creator))
                    || byText(a.creator.name || "", b.creator.name || "")
                    || a.index - b.index;
            }
            if (sortMode === "mood-desc") {
                return byText(moodKey(b.creator), moodKey(a.creator))
                    || byText(moodKey2(b.creator), moodKey2(a.creator))
                    || byText(a.creator.name || "", b.creator.name || "")
                    || a.index - b.index;
            }
            return a.index - b.index;
        };
        entries.sort((a, b) => {
            if (a.isLocked !== b.isLocked)
                return a.isLocked ? 1 : -1;
            return compareBySort(a, b);
        });
        return entries.map((entry) => entry.creator);
    };
    const columns = MARKET_ROLES.map((role) => {
        const roleLabelText = roleLabel(role);
        const roleCreators = pool.filter((creator) => creator.role === role);
        const filteredCreators = roleCreators.filter((creator) => {
            const themeMatch = themeFilter === "All" || creator.prefThemes?.includes(themeFilter);
            const moodMatch = moodFilter === "All" || creator.prefMoods?.includes(moodFilter);
            return themeMatch && moodMatch;
        });
        const sortedCreators = sortCreators(filteredCreators);
        const list = sortedCreators.map((creator) => {
            const catharsisScore = getCreatorCatharsisScore(creator);
            const catharsisGrade = scoreGrade(catharsisScore);
            const staminaPct = Math.round((creator.stamina / STAMINA_MAX) * 100);
            const nationalityPill = renderNationalityPill(creator.country);
            const lockout = getCreatorSignLockout(creator.id, now);
            const isLocked = !!lockout;
            const signCost = Number.isFinite(creator.signCost) ? creator.signCost : 0;
            const canAfford = state.label.cash >= signCost;
            const itemClass = `list-item${isLocked ? " ccc-market-item--failed" : ""}`;
            const buttonState = isLocked || !canAfford ? " disabled" : "";
            const buttonLabel = isLocked
                ? "Locked until refresh"
                : `Sign ${formatMoney(signCost)}${canAfford ? "" : " (not enough money)"}`;
            const lockoutReason = isLocked && lockout?.reason ? ` - ${lockout.reason}` : "";
            const lockoutHint = isLocked
                ? `<div class="tiny muted creator-card-hint">Locked until 12AM refresh${lockoutReason}</div>`
                : "";
            const lockoutTitle = isLocked && lockout
                ? ` title="Locked until ${formatDate(lockout.lockedUntilEpochMs)}${lockout?.reason ? ` | ${lockout.reason}` : ""}"`
                : "";
            const cashTitle = !isLocked && !canAfford
                ? ' title="Not enough money to sign this creator."'
                : "";
            const buttonTitle = lockoutTitle || cashTitle;
            const themeCells = (creator.prefThemes || []).map((theme) => renderThemeTag(theme)).join("");
            const moodCells = (creator.prefMoods || []).map((mood) => renderMoodTag(mood)).join("");
            return `
        <div class="${itemClass}" data-ccc-creator="${creator.id}">
          <div class="list-row">
            <div class="creator-card">
              <div class="creator-card-header">
                <div class="creator-card-header-left">${nationalityPill}${unsignedPill}</div>
                <div class="creator-card-header-right">
                  <div class="creator-card-occupation">${roleLabelText}</div>
                  <div class="creator-card-id">ID ${creator.id}</div>
                </div>
              </div>
              <div class="creator-card-body">
                <div class="creator-card-portrait">${renderCreatorAvatar(creator)}</div>
                <div class="creator-card-info">
                  <div class="item-title">${renderCreatorName(creator)}</div>
                  <div class="muted">${formatCreatorAgeMeta(creator)}</div>
                  <div class="muted">${renderCreatorSkillProgress(creator)}</div>
                  <div class="muted">Catharsis <span class="grade-text" data-grade="${catharsisGrade}">${catharsisScore}</span></div>
                  <div class="muted">Preferred Themes:</div>
                  <div class="creator-pref-tags">${themeCells}</div>
                  <div class="muted">Preferred Moods:</div>
                  <div class="creator-pref-tags">${moodCells}</div>
                </div>
              </div>
              <div class="creator-card-footer">
                <div class="creator-card-stamina">
                  <div class="bar"><span style="width:${staminaPct}%"></span></div>
                  <div class="muted">Stamina ${creator.stamina} / ${STAMINA_MAX}</div>
                </div>
                <div class="creator-card-actions">
                  <button type="button" data-sign="${creator.id}"${buttonState}${buttonTitle}>${buttonLabel}</button>
                  ${lockoutHint}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
        });
        const emptyMsg = filtersActive
            ? `No ${roleLabelText} Creator IDs match the current filters.`
            : pool.length
                ? `No ${roleLabelText} Creator IDs available.`
                : "No Creator IDs available.";
        const columnState = filters[role] === false ? " is-hidden" : "";
        const countLabel = filtersActive
            ? `${sortedCreators.length} of ${roleCreators.length} available`
            : `${roleCreators.length} available`;
        return `
      <div class="ccc-market-column${columnState}" data-role="${role}">
        <div class="ccc-market-head">
          <div class="ccc-market-title">${roleLabelText}s</div>
          <div class="tiny muted">${countLabel}</div>
        </div>
        <div class="list ccc-market-list">
          ${list.length ? list.join("") : `<div class="muted">${emptyMsg}</div>`}
        </div>
      </div>
    `;
    });
    listEl.innerHTML = columns.join("");
}
function buildRivalActSummary(labelName) {
    const entries = Array.isArray(state.marketTracks) ? state.marketTracks : [];
    const actMap = new Map();
    entries.forEach((entry) => {
        if (!entry || entry.label !== labelName)
            return;
        const actName = entry.actName || "Unknown Act";
        const key = `${actName}::${entry.actNameKey || ""}`;
        const current = actMap.get(key) || { name: actName, nameKey: entry.actNameKey || null, count: 0, latest: null };
        current.count += 1;
        if (Number.isFinite(entry.releasedAt)) {
            current.latest = current.latest ? Math.max(current.latest, entry.releasedAt) : entry.releasedAt;
        }
        actMap.set(key, current);
    });
    return Array.from(actMap.values()).sort((a, b) => {
        const aLatest = Number.isFinite(a.latest) ? a.latest : 0;
        const bLatest = Number.isFinite(b.latest) ? b.latest : 0;
        if (aLatest !== bLatest)
            return bLatest - aLatest;
        if (a.count !== b.count)
            return b.count - a.count;
        return a.name.localeCompare(b.name);
    });
}
function renderRivalRosterPanel() {
    const listEl = $("rivalRosterList");
    const selectEl = $("rivalRosterSelect");
    const metaEl = $("rivalRosterMeta");
    if (!listEl || !selectEl)
        return;
    const rivals = Array.isArray(state.rivals) ? state.rivals.slice() : [];
    if (!state.ui)
        state.ui = {};
    if (!rivals.length) {
        selectEl.innerHTML = `<option value="">No rival labels yet</option>`;
        selectEl.value = "";
        listEl.innerHTML = `<div class="muted">No rival rosters available yet.</div>`;
        if (metaEl)
            metaEl.textContent = "No rivals observed.";
        return;
    }
    const selectedId = state.ui.rivalRosterId;
    const selected = rivals.find((rival) => rival.id === selectedId) || rivals[0];
    state.ui.rivalRosterId = selected?.id || null;
    selectEl.innerHTML = [
        `<option value="">Select a rival label</option>`,
        ...rivals.map((rival) => `<option value="${rival.id}">${rival.name}</option>`)
    ].join("");
    selectEl.value = selected ? selected.id : "";
    if (!selected) {
        listEl.innerHTML = `<div class="muted">Select a rival label to view their roster.</div>`;
        if (metaEl)
            metaEl.textContent = "Select a rival label.";
        return;
    }
    const creators = Array.isArray(selected.creators) ? selected.creators : [];
    const acts = buildRivalActSummary(selected.name);
    if (metaEl) {
        metaEl.textContent = `${formatCount(creators.length)} creators | ${formatCount(acts.length)} acts`;
    }
    const creatorSections = MARKET_ROLES.map((role) => {
        const roleLabelText = roleLabel(role);
        const roleCreators = creators.filter((creator) => creator.role === role);
        const items = roleCreators.map((creator) => {
            const catharsisScore = getCreatorCatharsisScore(creator);
            const catharsisGrade = scoreGrade(catharsisScore);
            const inactivity = getCreatorCatharsisInactivityStatus(creator);
            const inactivityPct = Math.round((inactivity?.pct || 0) * 100);
            const inactivityLine = inactivityPct > 0
                ? `Inactivity debuff: -${inactivityPct}% catharsis`
                : "";
            return `
        <div class="list-item">
          <div class="list-row">
            <div>
              <div class="item-title">${renderCreatorName(creator)}</div>
              <div class="muted">${roleLabelText} | Skill ${formatCount(creator.skill || 0)} | Catharsis <span class="grade-text" data-grade="${catharsisGrade}">${catharsisScore}</span></div>
              ${inactivityLine ? `<div class="tiny muted">${inactivityLine}</div>` : ""}
            </div>
            <div class="pill">${creator.country || "-"}</div>
          </div>
        </div>
      `;
        });
        const emptyMsg = `No ${roleLabelText}s signed.`;
        return `
      <div class="rival-roster-group">
        <div class="tiny muted">${roleLabelText}s (${formatCount(roleCreators.length)})</div>
        <div class="list">
          ${items.length ? items.join("") : `<div class="muted">${emptyMsg}</div>`}
        </div>
      </div>
    `;
    }).join("");
    const actItems = acts.map((act) => {
        const actLabel = renderActName({ name: act.name, nameKey: act.nameKey });
        const dateLabel = Number.isFinite(act.latest) ? formatShortDate(act.latest) : "Unknown";
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${actLabel}</div>
            <div class="muted">${formatCount(act.count)} release${act.count === 1 ? "" : "s"} | Last ${dateLabel}</div>
          </div>
          <div class="pill">${formatCount(act.count)}</div>
        </div>
      </div>
    `;
    });
    const actMarkup = actItems.length
        ? actItems.join("")
        : `<div class="muted">No rival acts observed yet.</div>`;
    listEl.innerHTML = `
    <div class="subhead">Creators</div>
    ${creatorSections}
    <div class="subhead">Acts</div>
    <div class="list">${actMarkup}</div>
  `;
}
function renderWorkOrders() {
    const listEl = $("workOrderList");
    if (!listEl)
        return;
    if (!state.workOrders.length) {
        listEl.innerHTML = `<div class="muted">No active work orders.</div>`;
        return;
    }
    const now = state.time.epochMs;
    const list = state.workOrders.map((order) => {
        const track = getTrack(order.trackId);
        const crewIds = getWorkOrderCreatorIds(order);
        const crew = crewIds.map((id) => getCreator(id)).filter(Boolean);
        const crewLabel = buildWorkOrderCrewLabel(crew);
        const stage = STAGES[order.stageIndex];
        const hoursLeft = order.status === "In Progress" ? Math.max(0, Math.ceil((order.endAt - now) / HOUR_MS)) : "Queued";
        const crewLine = `${stage?.name || "Stage"} | ${crewLabel.primary}`;
        const crewDetail = crewLabel.secondary ? `<div class="muted">${crewLabel.secondary}</div>` : "";
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${track ? renderTrackTitle(track.title) : "Unknown"}</div>
            <div class="muted">${crewLine}</div>
            ${crewDetail}
          </div>
          <div class="pill">${hoursLeft}h</div>
        </div>
      </div>
    `;
    });
    listEl.innerHTML = list.join("");
}
function renderTrackHistoryPanel(activeTab) {
    const panel = $("trackHistoryPanel");
    if (!panel || activeTab !== "history")
        return;
    const listEl = $("trackHistoryList");
    if (!listEl)
        return;
    const metaEl = $("trackHistoryMeta");
    const focusEra = getFocusedEra();
    const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
    const fallbackEra = !focusEra && activeEras.length === 1 ? activeEras[0] : null;
    const targetEra = focusEra || fallbackEra;
    if (!targetEra) {
        panel.dataset.historyKey = "";
        panel.dataset.historyStatus = "";
        if (metaEl)
            metaEl.textContent = "Focus an active era to view chart history.";
        listEl.innerHTML = `<div class="muted">No active era selected.</div>`;
        return;
    }
    const tracks = state.tracks.filter((track) => track.status === "Released" && track.eraId === targetEra.id);
    if (metaEl)
        metaEl.textContent = `${targetEra.name} | ${formatCount(tracks.length)} released tracks`;
    if (!tracks.length) {
        panel.dataset.historyKey = "";
        panel.dataset.historyStatus = "";
        listEl.innerHTML = `<div class="muted">No released tracks for ${targetEra.name} yet.</div>`;
        return;
    }
    const chartWeek = Number.isFinite(state.meta?.chartHistoryLastWeek) ? state.meta.chartHistoryLastWeek : weekIndex() + 1;
    const trackKey = tracks.map((track) => track.id).sort().join(",");
    const cacheKey = `${targetEra.id}:${chartWeek}:${trackKey}`;
    if (panel.dataset.historyKey === cacheKey && panel.dataset.historyStatus === "ready") {
        return;
    }
    panel.dataset.historyKey = cacheKey;
    panel.dataset.historyStatus = "loading";
    listEl.innerHTML = `<div class="muted">Loading chart history...</div>`;
    const requestId = ++trackHistoryRequestId;
    (async () => {
        const weeks = await listChartWeeks();
        if (requestId !== trackHistoryRequestId)
            return;
        const currentWeek = weekIndex() + 1;
        let weekNumbers = weeks.map((entry) => entry.week).filter((week) => week <= currentWeek);
        if (!weekNumbers.length) {
            listEl.innerHTML = `<div class="muted">No chart history yet.</div>`;
            panel.dataset.historyStatus = "ready";
            return;
        }
        const releaseWeeks = tracks
            .map((track) => weekNumberFromEpochMs(track.releasedAt))
            .filter((week) => Number.isFinite(week));
        const minWeek = releaseWeeks.length ? Math.min(...releaseWeeks) : null;
        if (minWeek) {
            weekNumbers = weekNumbers.filter((week) => week >= minWeek);
        }
        if (!weekNumbers.length) {
            listEl.innerHTML = `<div class="muted">No chart history yet.</div>`;
            panel.dataset.historyStatus = "ready";
            return;
        }
        weekNumbers.sort((a, b) => b - a);
        const scopes = buildTrackHistoryScopes();
        const snapshotsByWeek = new Map();
        for (const week of weekNumbers) {
            const snapshots = await Promise.all(scopes.map((scope) => fetchChartSnapshot(scope.scope, week)));
            if (requestId !== trackHistoryRequestId)
                return;
            const scopeMap = new Map();
            snapshots.forEach((snapshot, index) => {
                if (snapshot)
                    scopeMap.set(scopes[index].scope, snapshot);
            });
            snapshotsByWeek.set(week, scopeMap);
        }
        if (requestId !== trackHistoryRequestId)
            return;
        const headerCells = scopes.map((scope) => `<th title="${scope.title}">${scope.label}</th>`).join("");
        const historyMarkup = tracks.map((track) => {
            const act = getAct(track.actId);
            const project = track.projectName || `${track.title} - Single`;
            const projectType = track.projectType || "Single";
            const releaseDate = track.releasedAt ? formatShortDate(track.releasedAt) : "TBD";
            const releaseWeek = weekNumberFromEpochMs(track.releasedAt);
            const rows = weekNumbers.map((week) => {
                const weekTitle = formatWeekRangeLabel(week);
                const weekLabel = weekTitle;
                const scopeMap = snapshotsByWeek.get(week);
                const cells = scopes.map((scope) => {
                    const snapshot = scopeMap?.get(scope.scope);
                    const entry = snapshot?.entries?.find((item) => item.trackId === track.id);
                    let value = "-";
                    let cellClass = "chart-rank is-unreleased";
                    if (Number.isFinite(releaseWeek) && week >= releaseWeek) {
                        if (entry && Number.isFinite(entry.rank)) {
                            value = `#${entry.rank}`;
                            cellClass = "chart-rank";
                        }
                        else {
                            value = "DNC";
                            cellClass = "chart-rank is-dnc";
                        }
                    }
                    return `<td class="${cellClass}">${value}</td>`;
                }).join("");
                return `<tr><td title="${weekTitle}">${weekLabel}</td>${cells}</tr>`;
            }).join("");
            return `
        <div class="list-item track-history-item">
          <div class="list-row">
            <div>
              <div class="item-title">${renderTrackTitle(track.title)}</div>
              <div class="muted">Act: ${renderActName(act || "Unassigned")} | Project: ${renderProjectName(project)} (${projectType})</div>
              <div class="muted">Released ${releaseDate} | ${track.distribution || "Digital"}</div>
            </div>
          </div>
          <div class="track-history-table-wrap">
            <table class="chart-table track-history-table">
              <thead>
                <tr>
                  <th>Date Range</th>
                  ${headerCells}
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        </div>
      `;
        }).join("");
        listEl.innerHTML = historyMarkup;
        panel.dataset.historyStatus = "ready";
    })().catch(() => {
        if (requestId !== trackHistoryRequestId)
            return;
        listEl.innerHTML = `<div class="muted">Chart history unavailable.</div>`;
        panel.dataset.historyStatus = "ready";
    });
}
function renderTracks() {
    const activeView = state.ui.activeView || "";
    const createStage = state.ui.createStage || "sheet";
    const allTracks = state.tracks;
    const pipelineTracks = allTracks.filter((track) => (track.status === "In Production"
        || track.status === "Awaiting Demo"
        || track.status === "Awaiting Master"));
    const archivedTracks = allTracks.filter((track) => track.status === "Released");
    let tracks = allTracks.filter((track) => track.status !== "Released");
    if (activeView === "create") {
        tracks = pipelineTracks;
        if (createStage === "demo") {
            tracks = tracks.filter((track) => track.stageIndex === 1);
        }
        else if (createStage === "master") {
            tracks = tracks.filter((track) => track.stageIndex === 2);
        }
    }
    const trackList = $("trackList");
    if (trackList) {
        if (!tracks.length) {
            let emptyMsg = activeView === "create" && createStage === "demo"
                ? "No sheet music awaiting demo recordings."
                : activeView === "create" && createStage === "master"
                    ? "No demos awaiting mastering."
                    : activeView === "create"
                        ? "No tracks in the creation pipeline."
                        : "No active tracks in catalog.";
            if (archivedTracks.length && emptyMsg === "No active tracks in catalog.") {
                emptyMsg = `${emptyMsg} Released tracks are in the Archive.`;
            }
            trackList.innerHTML = `<div class="muted">${emptyMsg}</div>`;
        }
        else {
            const focusEra = getFocusedEra();
            const now = state.time.epochMs;
            const list = tracks.map((track) => {
                const stageName = track.status === "In Production" ? STAGES[Math.min(track.stageIndex, STAGES.length - 1)].name : track.status;
                const grade = qualityGrade(track.quality);
                const act = getAct(track.actId);
                const project = track.projectName || `${track.title} - Single`;
                const projectType = track.projectType || "Single";
                const themeTag = renderThemeTag(track.theme);
                const alignTag = renderAlignmentTag(track.alignment);
                const actLine = activeView === "create"
                    ? `Project: ${project} (${projectType})`
                    : `Act: ${renderActName(act || "Unassigned")} | Project: ${renderProjectName(project)} (${projectType})`;
                const era = track.eraId ? getEraById(track.eraId) : null;
                const eraName = era ? era.name : null;
                const focusSuffix = focusEra && era && focusEra.id === era.id ? " | Focus" : "";
                const modifierName = track.modifier ? track.modifier.label : "None";
                const genreLabel = renderTrackGenrePills(track, { fallback: "Genre: -" });
                const activeOrder = track.status === "In Production"
                    ? state.workOrders.find((order) => order.trackId === track.id && order.status === "In Progress")
                    : null;
                let progressBlock = "";
                if (activeOrder && activeOrder.startAt && activeOrder.endAt) {
                    const total = Math.max(1, activeOrder.endAt - activeOrder.startAt);
                    const progress = clamp((now - activeOrder.startAt) / total, 0, 1);
                    const pct = Math.round(progress * 100);
                    const hoursLeft = Math.max(0, Math.ceil((activeOrder.endAt - now) / HOUR_MS));
                    progressBlock = `
        <div class="bar"><span style="width:${pct}%"></span></div>
        <div class="muted">Progress: ${pct}% • ${hoursLeft}h left</div>
      `;
                }
                else if (track.status === "In Production") {
                    progressBlock = `<div class="muted">Queued for studio time.</div>`;
                }
                return `
      <div class="list-item" data-entity-type="track" data-entity-id="${track.id}" data-entity-name="${track.title}" draggable="true">
        <div class="list-row">
          <div class="item-main">
            <div class="content-thumb" aria-hidden="true"></div>
            <div>
              <div class="item-title">${renderTrackTitle(track.title)}</div>
              <div class="muted">ID ${track.id} | Item: Track</div>
              <div class="muted">${genreLabel}</div>
              <div class="muted">${themeTag} ${alignTag}</div>
              <div class="muted">${actLine}</div>
              <div class="muted">Distribution: ${track.distribution || "Digital"}</div>
            </div>
          </div>
          <div class="badge grade" data-grade="${grade}">${grade}</div>
        </div>
        <div class="muted">Status: ${stageName} | Quality ${track.quality}${eraName ? ` | Era: ${eraName}${focusSuffix}` : ""}</div>
        ${progressBlock}
      </div>
    `;
            });
            trackList.innerHTML = list.join("");
        }
    }
    const archiveList = $("trackArchiveList");
    if (!archiveList)
        return;
    if (!archivedTracks.length) {
        archiveList.innerHTML = `<div class="muted">No released tracks yet.</div>`;
        return;
    }
    const sortedArchive = archivedTracks.slice().sort((a, b) => (b.releasedAt || 0) - (a.releasedAt || 0));
    const archiveItems = sortedArchive.map((track) => {
        const act = getAct(track.actId);
        const project = track.projectName || `${track.title} - Single`;
        const projectType = track.projectType || "Single";
        const releaseDate = track.releasedAt ? formatDate(track.releasedAt) : "TBD";
        const grade = qualityGrade(track.quality);
        const genreLabel = renderTrackGenrePills(track, { fallback: "Genre: -" });
        const actLine = `Act: ${renderActName(act || "Unassigned")} | Project: ${renderProjectName(project)} (${projectType})`;
        return `
      <div class="list-item" data-entity-type="track" data-entity-id="${track.id}" data-entity-name="${track.title}" draggable="true">
        <div class="list-row">
          <div class="item-main">
            <div class="content-thumb" aria-hidden="true"></div>
            <div>
              <div class="item-title">${renderTrackTitle(track.title)}</div>
              <div class="muted">ID ${track.id} | ${genreLabel}</div>
              <div class="muted">${actLine}</div>
              <div class="muted">Released ${releaseDate} | ${track.distribution || "Digital"}</div>
            </div>
          </div>
          <div class="badge grade" data-grade="${grade}">${grade}</div>
        </div>
      </div>
    `;
    });
    archiveList.innerHTML = archiveItems.join("");
    let activeTab = state.ui.trackPanelTab || "active";
    if (activeTab === "history" && !$("trackHistoryPanel")) {
        activeTab = "active";
    }
    document.querySelectorAll("[data-track-tab]").forEach((tab) => {
        const isActive = tab.dataset.trackTab === activeTab;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-pressed", String(isActive));
    });
    document.querySelectorAll("[data-track-panel]").forEach((panel) => {
        const isActive = panel.dataset.trackPanel === activeTab;
        panel.classList.toggle("hidden", !isActive);
    });
    renderTrackHistoryPanel(activeTab);
}
function renderRolloutStrategyPlanner() {
    const select = $("rolloutStrategySelect");
    const summary = $("rolloutStrategySummary");
    const planLibrarySummary = $("rolloutPlanLibrarySummary");
    const weekInput = $("rolloutStrategyWeek");
    const dropInput = $("rolloutStrategyDropId");
    const eventTypeSelect = $("rolloutStrategyEventType");
    const eventContentInput = $("rolloutStrategyEventContent");
    const focusTypeSelect = $("rolloutStrategyFocusType");
    const focusTargetInput = $("rolloutStrategyFocusTarget");
    const focusTargetList = $("rolloutStrategyFocusTargetList");
    const autoRunToggle = $("rolloutStrategyAutoRun");
    const expandBtn = $("rolloutStrategyExpand");
    const addDropBtn = $("rolloutStrategyAddDrop");
    const addEventBtn = $("rolloutStrategyAddEvent");
    const createBtn = $("rolloutStrategyCreate");
    const templateSelect = $("rolloutStrategyTemplateSelect");
    const templateCreateBtn = $("rolloutStrategyTemplateCreate");
    const planLibrary = listRolloutPlanLibrary();
    if (!select || !summary)
        return;
    if (planLibrarySummary) {
        planLibrarySummary.innerHTML = renderPlanLibraryList(planLibrary);
    }
    const era = getRolloutPlanningEra();
    if (!era) {
        select.innerHTML = `<option value="">No active era</option>`;
        summary.innerHTML = `<div class="muted">Focus an active era to plan a rollout strategy.</div>`;
        if (weekInput)
            weekInput.disabled = true;
        if (dropInput)
            dropInput.disabled = true;
        if (eventTypeSelect)
            eventTypeSelect.disabled = true;
        if (eventContentInput)
            eventContentInput.disabled = true;
        if (focusTypeSelect)
            focusTypeSelect.disabled = true;
        if (focusTargetInput)
            focusTargetInput.disabled = true;
        if (autoRunToggle)
            autoRunToggle.disabled = true;
        if (expandBtn)
            expandBtn.disabled = true;
        if (addDropBtn)
            addDropBtn.disabled = true;
        if (addEventBtn)
            addEventBtn.disabled = true;
        if (createBtn)
            createBtn.disabled = true;
        if (templateSelect) {
            templateSelect.innerHTML = `<option value="">No active era</option>`;
            templateSelect.disabled = true;
        }
        if (templateCreateBtn)
            templateCreateBtn.disabled = true;
        return;
    }
    if (templateSelect) {
        if (!planLibrary.length) {
            templateSelect.innerHTML = `<option value="">No plans yet</option>`;
            templateSelect.disabled = true;
            if (templateCreateBtn)
                templateCreateBtn.disabled = true;
        }
        else {
            templateSelect.innerHTML = planLibrary.map((plan) => {
                const label = plan.label || plan.id || "Rollout Plan";
                const focusTag = plan.focusType && plan.focusType !== "Era" ? ` (${plan.focusType})` : "";
                return `<option value="${plan.id}">${label}${focusTag}</option>`;
            }).join("");
            const stored = state.ui?.viewContext?.selectedRolloutTemplateId;
            const desired = planLibrary.some((plan) => plan.id === stored)
                ? stored
                : planLibrary[0].id;
            templateSelect.value = desired;
            if (state.ui?.viewContext)
                state.ui.viewContext.selectedRolloutTemplateId = desired;
            templateSelect.disabled = false;
            if (templateCreateBtn)
                templateCreateBtn.disabled = false;
        }
    }
    const focusTypeOptions = ["Era", "Release", "Project", "Tour", "Campaign"];
    if (focusTypeSelect) {
        focusTypeSelect.innerHTML = focusTypeOptions
            .map((type) => `<option value="${type}">${type}</option>`)
            .join("");
    }
    const buildFocusTargetOptions = (focusType) => {
        if (focusType === "Release") {
            const tracks = state.tracks.filter((track) => !track.eraId || track.eraId === era.id);
            return tracks.map((track) => (`<option value="${track.id}" label="${track.title}"></option>`)).join("");
        }
        if (focusType === "Project") {
            const projects = new Map();
            state.tracks.forEach((track) => {
                if (track.eraId && track.eraId !== era.id)
                    return;
                const name = track.projectName || `${track.title} - Single`;
                const type = normalizeProjectType(track.projectType || "Single");
                const key = `${name}::${type}`;
                if (!projects.has(key))
                    projects.set(key, { name, type });
            });
            return Array.from(projects.values()).map((project) => (`<option value="${project.name}" label="${project.name} (${project.type})"></option>`)).join("");
        }
        if (focusType === "Tour") {
            const drafts = listTourDrafts();
            return drafts.map((draft) => (`<option value="${draft.id}" label="${draft.name || draft.id}"></option>`)).join("");
        }
        return "";
    };
    if (focusTargetList && focusTypeSelect) {
        focusTargetList.innerHTML = buildFocusTargetOptions(focusTypeSelect.value || "Era");
    }
    const strategies = getRolloutStrategiesForEra(era.id);
    if (!strategies.length) {
        select.innerHTML = `<option value="">No strategy yet</option>`;
        summary.innerHTML = `<div class="muted">No rollout strategies yet. Click New to create one.</div>`;
        if (weekInput)
            weekInput.disabled = true;
        if (dropInput)
            dropInput.disabled = true;
        if (eventTypeSelect)
            eventTypeSelect.disabled = true;
        if (eventContentInput)
            eventContentInput.disabled = true;
        if (focusTypeSelect)
            focusTypeSelect.disabled = true;
        if (focusTargetInput)
            focusTargetInput.disabled = true;
        if (autoRunToggle)
            autoRunToggle.disabled = true;
        if (expandBtn)
            expandBtn.disabled = true;
        if (addDropBtn)
            addDropBtn.disabled = true;
        if (addEventBtn)
            addEventBtn.disabled = true;
        if (createBtn)
            createBtn.disabled = false;
        return;
    }
    select.innerHTML = strategies.map((strategy) => {
        const label = strategy.label || strategy.id;
        return `<option value="${strategy.id}">${label} | ${strategy.status}</option>`;
    }).join("");
    const desiredId = state.ui.viewContext?.rolloutStrategyId || era.rolloutStrategyId || strategies[0].id;
    const activeStrategy = strategies.find((strategy) => strategy.id === desiredId) || strategies[0];
    select.value = activeStrategy.id;
    setSelectedRolloutStrategyId(activeStrategy.id);
    if (focusTypeSelect) {
        focusTypeSelect.value = activeStrategy.focusType || "Era";
        focusTypeSelect.disabled = false;
    }
    if (focusTargetList) {
        focusTargetList.innerHTML = buildFocusTargetOptions(activeStrategy.focusType || "Era");
    }
    if (focusTargetInput) {
        const focusValue = activeStrategy.focusLabel || activeStrategy.focusId || "";
        if ((activeStrategy.focusType || "Era") === "Era") {
            focusTargetInput.value = era.name || "";
            focusTargetInput.disabled = true;
        }
        else {
            focusTargetInput.value = focusValue;
            focusTargetInput.disabled = false;
        }
    }
    if (eventTypeSelect) {
        eventTypeSelect.innerHTML = Object.keys(PROMO_TYPE_DETAILS)
            .map((key) => `<option value="${key}">${PROMO_TYPE_DETAILS[key].label}</option>`)
            .join("");
        if (!eventTypeSelect.value)
            eventTypeSelect.value = DEFAULT_PROMO_TYPE;
    }
    if (weekInput) {
        weekInput.disabled = false;
        const weekCount = activeStrategy.weeks.length;
        const currentValue = Number(weekInput.value) || 1;
        if (weekInput.tagName === "SELECT") {
            const baseWeek = Number.isFinite(era?.startedWeek) ? era.startedWeek : weekIndex() + 1;
            weekInput.innerHTML = activeStrategy.weeks.map((week, index) => {
                const label = formatWeekRangeLabel(baseWeek + index);
                return `<option value="${index + 1}">${label}</option>`;
            }).join("");
        }
        else {
            weekInput.max = String(weekCount);
        }
        const parsed = Math.max(1, Math.min(weekCount, currentValue));
        weekInput.value = String(parsed);
    }
    if (dropInput)
        dropInput.disabled = false;
    if (eventTypeSelect)
        eventTypeSelect.disabled = false;
    if (eventContentInput)
        eventContentInput.disabled = false;
    if (autoRunToggle) {
        autoRunToggle.disabled = false;
        autoRunToggle.checked = Boolean(activeStrategy.autoRun);
    }
    if (expandBtn)
        expandBtn.disabled = false;
    if (addDropBtn)
        addDropBtn.disabled = false;
    if (addEventBtn)
        addEventBtn.disabled = false;
    if (createBtn)
        createBtn.disabled = false;
    const focusLine = formatPlanFocusLine(activeStrategy);
    const header = `
    <div class="list-item">
      <div class="item-title">${activeStrategy.label || `Plan ${activeStrategy.id}`}</div>
      <div class="muted">ID ${activeStrategy.id} | Focus: ${focusLine}</div>
      <div class="muted">Status: ${activeStrategy.status} | Source: ${activeStrategy.source} | Windows: ${activeStrategy.weeks.length}</div>
      ${renderPlanContextLines(activeStrategy.context)}
    </div>
  `;
    const budgetSummary = renderRolloutBudgetSummary(activeStrategy);
    const baseWeek = Number.isFinite(era?.startedWeek) ? era.startedWeek : weekIndex() + 1;
    const rows = activeStrategy.weeks.map((week, index) => {
        const dropCount = Array.isArray(week.drops) ? week.drops.length : 0;
        const eventCount = Array.isArray(week.events) ? week.events.length : 0;
        const windowLabel = formatWeekRangeLabel(baseWeek + index);
        return `
      <div class="list-item">
        <div class="item-title">${windowLabel}</div>
        <div class="muted">Drops ${dropCount} | Events ${eventCount}</div>
      </div>
    `;
    });
    summary.innerHTML = rows.length
        ? header + budgetSummary + rows.join("")
        : `${header}${budgetSummary}<div class="muted">No rollout items yet.</div>`;
}
function renderEraStatus() {
    const eraBox = $("eraStatus");
    if (!eraBox)
        return;
    renderFocusEraStatus();
    const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
    const focusEra = getFocusedEra();
    if (!activeEras.length) {
        eraBox.innerHTML = `<div class="muted">No active Eras. Start one or schedule a release.</div>`;
        renderRolloutStrategyPlanner();
        return;
    }
    eraBox.innerHTML = activeEras.map((era) => {
        const act = getAct(era.actId);
        const stageName = ERA_STAGES[era.stageIndex] || "Complete";
        const stageWeeks = era.rolloutWeeks || ROLLOUT_PRESETS[1].weeks;
        const stageTotal = stageWeeks[era.stageIndex] || 0;
        const stageProgress = `${era.stageWeek}/${stageTotal} weeks`;
        const content = era.contentTypes?.length ? era.contentTypes.join(", ") : "Unassigned";
        const startedLabel = Number.isFinite(era.startedWeek) ? formatWeekRangeLabel(era.startedWeek) : "TBD";
        const isFocused = focusEra && focusEra.id === era.id;
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${era.name}</div>
            <div class="muted">Act: ${renderActName(act || "Unknown")}</div>
            <div class="muted">Stage: ${stageName} | ${stageProgress}</div>
            <div class="muted">Status: ${era.status} | Started ${startedLabel}</div>
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
    renderRolloutStrategyPlanner();
}
function renderEraHistoryPanel(targetEra) {
    const panel = $("eraHistoryPanel");
    const listEl = $("eraHistoryList");
    if (!panel || !listEl)
        return;
    const metaEl = $("eraHistoryMeta");
    if (!targetEra) {
        panel.dataset.historyKey = "";
        panel.dataset.historyStatus = "";
        if (metaEl)
            metaEl.textContent = "Focus an active era to view chart history.";
        listEl.innerHTML = `<div class="muted">No active era selected.</div>`;
        return;
    }
    const tracks = state.tracks.filter((track) => track.status === "Released" && track.eraId === targetEra.id);
    if (metaEl)
        metaEl.textContent = `${targetEra.name} | ${formatCount(tracks.length)} released tracks`;
    if (!tracks.length) {
        panel.dataset.historyKey = "";
        panel.dataset.historyStatus = "";
        listEl.innerHTML = `<div class="muted">No released tracks for ${targetEra.name} yet.</div>`;
        return;
    }
    const chartWeek = Number.isFinite(state.meta?.chartHistoryLastWeek) ? state.meta.chartHistoryLastWeek : weekIndex() + 1;
    const trackKey = tracks.map((track) => track.id).sort().join(",");
    const cacheKey = `${targetEra.id}:${chartWeek}:${trackKey}`;
    if (panel.dataset.historyKey === cacheKey && panel.dataset.historyStatus === "ready") {
        return;
    }
    panel.dataset.historyKey = cacheKey;
    panel.dataset.historyStatus = "loading";
    listEl.innerHTML = `<div class="muted">Loading chart history...</div>`;
    const requestId = ++eraHistoryRequestId;
    (async () => {
        const weeks = await listChartWeeks();
        if (requestId !== eraHistoryRequestId)
            return;
        const currentWeek = weekIndex() + 1;
        let weekNumbers = weeks.map((entry) => entry.week).filter((week) => week <= currentWeek);
        if (!weekNumbers.length) {
            listEl.innerHTML = `<div class="muted">No chart history yet.</div>`;
            panel.dataset.historyStatus = "ready";
            return;
        }
        const releaseWeeks = tracks
            .map((track) => weekNumberFromEpochMs(track.releasedAt))
            .filter((week) => Number.isFinite(week));
        const minWeek = releaseWeeks.length ? Math.min(...releaseWeeks) : null;
        if (minWeek) {
            weekNumbers = weekNumbers.filter((week) => week >= minWeek);
        }
        if (!weekNumbers.length) {
            listEl.innerHTML = `<div class="muted">No chart history yet.</div>`;
            panel.dataset.historyStatus = "ready";
            return;
        }
        weekNumbers.sort((a, b) => b - a);
        const scopes = buildTrackHistoryScopes();
        const snapshotsByWeek = new Map();
        for (const week of weekNumbers) {
            const snapshots = await Promise.all(scopes.map((scope) => fetchChartSnapshot(scope.scope, week)));
            if (requestId !== eraHistoryRequestId)
                return;
            const scopeMap = new Map();
            snapshots.forEach((snapshot, index) => {
                if (snapshot)
                    scopeMap.set(scopes[index].scope, snapshot);
            });
            snapshotsByWeek.set(week, scopeMap);
        }
        if (requestId !== eraHistoryRequestId)
            return;
        const headerCells = scopes.map((scope) => `<th title="${scope.title}">${scope.label}</th>`).join("");
        const historyMarkup = tracks.map((track) => {
            const act = getAct(track.actId);
            const project = track.projectName || `${track.title} - Single`;
            const projectType = track.projectType || "Single";
            const releaseDate = track.releasedAt ? formatShortDate(track.releasedAt) : "TBD";
            const releaseWeek = weekNumberFromEpochMs(track.releasedAt);
            const rows = weekNumbers.map((week) => {
                const weekTitle = formatWeekRangeLabel(week);
                const weekLabel = weekTitle;
                const scopeMap = snapshotsByWeek.get(week);
                const cells = scopes.map((scope) => {
                    const snapshot = scopeMap?.get(scope.scope);
                    const entry = snapshot?.entries?.find((item) => item.trackId === track.id);
                    let value = "-";
                    let cellClass = "chart-rank is-unreleased";
                    if (Number.isFinite(releaseWeek) && week >= releaseWeek) {
                        if (entry && Number.isFinite(entry.rank)) {
                            value = `#${entry.rank}`;
                            cellClass = "chart-rank";
                        }
                        else {
                            value = "DNC";
                            cellClass = "chart-rank is-dnc";
                        }
                    }
                    return `<td class="${cellClass}">${value}</td>`;
                }).join("");
                return `<tr><td title="${weekTitle}">${weekLabel}</td>${cells}</tr>`;
            }).join("");
            return `
        <div class="list-item track-history-item">
          <div class="list-row">
            <div>
              <div class="item-title">${renderTrackTitle(track.title)}</div>
              <div class="muted">Act: ${renderActName(act || "Unassigned")} | Project: ${renderProjectName(project)} (${projectType})</div>
              <div class="muted">Released ${releaseDate} | ${track.distribution || "Digital"}</div>
            </div>
          </div>
          <div class="track-history-table-wrap">
            <table class="chart-table track-history-table">
              <thead>
                <tr>
                  <th>Date Range</th>
                  ${headerCells}
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        </div>
      `;
        }).join("");
        listEl.innerHTML = historyMarkup;
        panel.dataset.historyStatus = "ready";
    })().catch(() => {
        if (requestId !== eraHistoryRequestId)
            return;
        listEl.innerHTML = `<div class="muted">Chart history unavailable.</div>`;
        panel.dataset.historyStatus = "ready";
    });
}
function renderEraPerformance() {
    const tableWrap = $("eraPerformanceTableWrap");
    if (!tableWrap)
        return;
    const metaEl = $("eraPerformanceMeta");
    const focusEra = getFocusedEra();
    const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
    const fallbackEra = !focusEra && activeEras.length === 1 ? activeEras[0] : null;
    const targetEra = focusEra || fallbackEra;
    if (!targetEra) {
        if (metaEl)
            metaEl.textContent = "Focus an active era to see performance details.";
        tableWrap.innerHTML = `<div class="muted">No active era selected.</div>`;
        renderEraHistoryPanel(null);
        return;
    }
    const eraTracks = state.tracks.filter((track) => track.eraId === targetEra.id);
    const released = eraTracks.filter((track) => track.status === "Released");
    if (metaEl)
        metaEl.textContent = `${targetEra.name} | ${formatCount(eraTracks.length)} tracks | Released ${formatCount(released.length)}`;
    if (!eraTracks.length) {
        tableWrap.innerHTML = `<div class="muted">No tracks linked to ${targetEra.name} yet.</div>`;
        renderEraHistoryPanel(targetEra);
        return;
    }
    const rows = eraTracks.map((track) => {
        const act = getAct(track.actId);
        const economy = track.economy || {};
        const isReleased = track.status === "Released";
        const marketEntry = state.marketTracks.find((entry) => entry.trackId === track.id)
            || state.meta?.marketTrackArchive?.find((entry) => entry.trackId === track.id);
        const history = marketEntry?.chartHistory?.global || null;
        const peakLabel = history?.peak ? `#${history.peak}` : "-";
        const wocLabel = history?.weeks ? formatCount(history.weeks) : "-";
        const chartPoints = isReleased ? formatCount(economy.chartPoints || 0) : "-";
        const salesLabel = isReleased ? formatCount(economy.sales || 0) : "-";
        const streamLabel = isReleased ? formatCount(economy.streaming || 0) : "-";
        const revenueLabel = isReleased ? formatMoney(economy.revenue || 0) : "-";
        const productionCost = economy.productionCost || 0;
        const distributionFees = economy.distributionFees || 0;
        const actualCosts = productionCost + distributionFees;
        const net = isReleased ? formatMoney((economy.revenue || 0) - actualCosts) : "-";
        const costsLabel = formatMoney(actualCosts || 0);
        const physical = recommendPhysicalRun(track, { act, label: state.label });
        const vinylUnits = physical.units ? formatCount(physical.units) : "0";
        const vinylGross = formatMoney(physical.estimatedGross || 0);
        const vinylCost = formatMoney(physical.estimatedCost || 0);
        const unitPrice = formatMoney(physical.unitPrice || 0);
        const unitCost = formatMoney(physical.unitCost || 0);
        const budgetNote = physical.isBudgetCapped && Number.isFinite(physical.budgetCap)
            ? `Budget cap ${formatCount(physical.budgetCap)}`
            : "";
        const releaseDate = track.releasedAt ? formatShortDate(track.releasedAt) : "TBD";
        const projectType = track.projectType || "Single";
        const distribution = track.distribution || "Digital";
        return `
      <tr>
        <td>
          <div class="item-title">${renderTrackTitle(track.title)}</div>
          <div class="muted">Act: ${renderActName(act || "Unassigned")} | Status: ${track.status}</div>
        </td>
        <td>
          <div>${projectType}</div>
          <div class="muted">${distribution}</div>
          <div class="muted">Release ${releaseDate}</div>
        </td>
        <td>
          <div class="chart-score">${chartPoints}</div>
          <div class="muted">Peak ${peakLabel} | WOC ${wocLabel}</div>
        </td>
        <td>
          <div>Sales ${salesLabel}</div>
          <div class="muted">Stream ${streamLabel}</div>
        </td>
        <td>
          <div>Revenue ${revenueLabel}</div>
          <div class="muted">Costs ${costsLabel}</div>
          <div class="muted">Net ${net}</div>
        </td>
        <td>
          <div>${vinylUnits} units</div>
          <div class="muted">${unitPrice} ea | ${unitCost} cost</div>
          <div class="muted">Gross ${vinylGross} | Cost ${vinylCost}</div>
          ${budgetNote ? `<div class="muted">${budgetNote}</div>` : ""}
        </td>
      </tr>
    `;
    }).join("");
    tableWrap.innerHTML = `
    <table class="chart-table era-performance-table">
      <thead>
        <tr>
          <th>Content</th>
          <th>Type</th>
          <th>Charts</th>
          <th>Sales</th>
          <th>Economics</th>
          <th>Vinyl Run</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
    renderEraHistoryPanel(targetEra);
}
function projectKey(projectName, projectType) {
    const nameKey = normalizeProjectName(projectName);
    const typeKey = normalizeProjectType(projectType);
    return `${nameKey}::${typeKey}`;
}
function collectProjectSummaries(tracks, queuedIds) {
    const summaries = new Map();
    tracks.forEach((track) => {
        const projectName = track.projectName || `${track.title} - Single`;
        const projectType = normalizeProjectType(track.projectType || "Single");
        const key = projectKey(projectName, projectType);
        const summary = summaries.get(key) || {
            projectName,
            projectType,
            trackCount: 0,
            readyCount: 0,
            masteringCount: 0,
            scheduledCount: 0,
            releasedCount: 0,
            actNames: new Set(),
            revenue: 0,
            productionCost: 0,
            distributionFees: 0,
            promoCost: 0,
            costs: 0,
            profit: 0
        };
        summary.trackCount += 1;
        if (track.status === "Released")
            summary.releasedCount += 1;
        if (track.status === "Ready")
            summary.readyCount += 1;
        if (track.status !== "Ready" && isMasteringTrack(track))
            summary.masteringCount += 1;
        if (queuedIds.has(track.id))
            summary.scheduledCount += 1;
        const economy = track.economy || {};
        summary.revenue += Number(economy.revenue || 0);
        summary.productionCost += Number(economy.productionCost || 0);
        summary.distributionFees += Number(economy.distributionFees || 0);
        summary.promoCost += Number(economy.promoCost || 0);
        summary.costs = summary.productionCost + summary.distributionFees + summary.promoCost;
        summary.profit = summary.revenue - summary.costs;
        const act = track.actId ? getAct(track.actId) : null;
        if (act?.name)
            summary.actNames.add(act.name);
        summaries.set(key, summary);
    });
    return Array.from(summaries.values()).sort((a, b) => a.projectName.localeCompare(b.projectName));
}
function renderReleaseDesk() {
    const readyList = $("readyList");
    if (!readyList)
        return;
    if (!state.ui)
        state.ui = {};
    if (typeof document !== "undefined") {
        const active = document.activeElement;
        const activeSelect = active && active.matches
            ? (active.matches("select[data-assign-act]") || active.matches("select[data-release-type]")) && readyList.contains(active)
            : false;
        if (state.ui.releaseDeskLock && !activeSelect)
            state.ui.releaseDeskLock = false;
        if (state.ui.releaseDeskLock)
            return;
    }
    else if (state.ui.releaseDeskLock) {
        state.ui.releaseDeskLock = false;
    }
    const releaseReadyStatuses = new Set(["Ready", "Scheduled", "Released"]);
    const queueEntries = state.releaseQueue.map((entry) => {
        const track = getTrack(entry.trackId);
        const isReleaseReady = track ? releaseReadyStatuses.has(track.status) : false;
        return { entry, track, isReleaseReady };
    });
    const queuedIds = new Set(queueEntries.filter((item) => item.isReleaseReady).map((item) => item.entry.trackId));
    const blockedQueue = queueEntries.filter((item) => !item.isReleaseReady);
    const projectTracks = state.tracks.filter((track) => releaseReadyStatuses.has(track.status) && track.actId);
    const projectSummaries = collectProjectSummaries(projectTracks, queuedIds);
    const hasReadyUnassigned = state.tracks.some((track) => releaseReadyStatuses.has(track.status) && !track.actId);
    const projectSummaryByKey = new Map(projectSummaries.map((summary) => [projectKey(summary.projectName, summary.projectType), summary]));
    const projectList = $("releaseProjectList");
    if (projectList) {
        if (!projectSummaries.length) {
            const emptyMessage = hasReadyUnassigned
                ? "No projects yet. Assign an Act to mastered tracks to draft projects."
                : "No projects yet. Create content in Create, then return here to schedule releases.";
            projectList.innerHTML = `<div class="muted">${emptyMessage}</div>`;
        }
        else {
            projectList.innerHTML = projectSummaries.map((summary) => {
                const limits = getProjectTrackLimits(summary.projectType);
                const minRemaining = Math.max(0, limits.min - summary.trackCount);
                const maxRemaining = Math.max(0, limits.max - summary.trackCount);
                const statusLabel = minRemaining > 0
                    ? `${minRemaining} to minimum`
                    : maxRemaining === 0
                        ? "At cap"
                        : `+${maxRemaining} slots`;
                const statusClass = minRemaining > 0 || maxRemaining === 0 ? "badge warn" : "badge";
                const readyLabel = `Ready ${formatCount(summary.readyCount)}`;
                const masteringLabel = summary.masteringCount ? `Mastering ${formatCount(summary.masteringCount)}` : null;
                const actLabel = summary.actNames.size
                    ? Array.from(summary.actNames).map((name) => renderActName(name)).join(", ")
                    : "Unassigned";
                const summaryParts = [
                    `${summary.projectType} | Tracks ${summary.trackCount}/${limits.max}`,
                    readyLabel,
                    masteringLabel,
                    `Scheduled ${formatCount(summary.scheduledCount)}`,
                    `Released ${formatCount(summary.releasedCount)}`
                ].filter(Boolean).join(" | ");
                const revenueLabel = formatMoney(summary.revenue || 0);
                const costsLabel = formatMoney(summary.costs || 0);
                const profitLabel = formatMoney(summary.profit || 0);
                const productionLabel = formatMoney(summary.productionCost || 0);
                const distributionLabel = formatMoney(summary.distributionFees || 0);
                const promoLabel = formatMoney(summary.promoCost || 0);
                const economyLine = `Revenue ${revenueLabel} | Costs ${costsLabel} | Net ${profitLabel}`;
                const inputsLine = `Inputs: Prod ${productionLabel} | Dist ${distributionLabel} | Promo ${promoLabel}`;
                return `
          <div class="list-item">
            <div class="list-row">
              <div>
                <div class="item-title">${renderProjectName(summary.projectName)}</div>
                <div class="muted">${summaryParts}</div>
                <div class="muted">Acts: ${actLabel}</div>
                <div class="muted">${economyLine}</div>
                <div class="muted">${inputsLine}</div>
              </div>
              <div class="${statusClass}">${statusLabel}</div>
            </div>
          </div>
        `;
            }).join("");
        }
    }
    const asapAt = getReleaseAsapAt();
    const asapLabel = formatDate(asapAt);
    const distributionSelect = $("releaseDistribution");
    const selectedDistribution = distributionSelect ? distributionSelect.value : "Digital";
    const selectedFeeLabel = formatMoney(getReleaseDistributionFee(selectedDistribution));
    const readyTracks = state.tracks.filter((track) => {
        if (queuedIds.has(track.id))
            return false;
        return track.status === "Ready";
    });
    const readyHtml = readyTracks.length
        ? readyTracks.map((track) => {
            const isReady = track.status === "Ready";
            const act = getAct(track.actId);
            const actOptions = state.acts.map((entry) => `<option value="${entry.id}"${entry.id === track.actId ? " selected" : ""}>${entry.name}</option>`).join("");
            const actSelect = state.acts.length
                ? `
          <div class="field">
            <label>Assign Act</label>
            <div class="input-row">
              <select data-assign-act="${track.id}">
                <option value="">Select Act</option>
                ${actOptions}
              </select>
              <button type="button" class="ghost mini" data-act-recommend="${track.id}">Recommend</button>
            </div>
          </div>
        `
                : `<div class="muted">No Acts available. Create one in Signed.</div>`;
            const project = track.projectName || `${track.title} - Single`;
            const projectType = normalizeProjectType(track.projectType || "Single");
            const releaseType = resolveTrackReleaseType(track);
            const releaseTypeLabel = releaseType === "Single" ? "Single" : "Project track";
            const editionLabel = track.projectEdition === "Deluxe" ? " | Deluxe" : "";
            const limits = getProjectTrackLimits(projectType);
            const summaryKey = projectKey(project, projectType);
            const summary = projectSummaryByKey.get(summaryKey);
            const projectCount = summary ? summary.trackCount : 1;
            const minRemaining = Math.max(0, limits.min - projectCount);
            const maxRemaining = Math.max(0, limits.max - projectCount);
            const projectCountLine = minRemaining > 0
                ? `Project size: ${projectCount}/${limits.max} (${minRemaining} to minimum)`
                : maxRemaining === 0
                    ? `Project size: ${projectCount}/${limits.max} (at cap)`
                    : `Project size: ${projectCount}/${limits.max}`;
            const themeTag = renderThemeTag(track.theme);
            const alignTag = renderAlignmentTag(track.alignment);
            const modifierName = track.modifier ? track.modifier.label : "None";
            const derivedGenre = track.genre || makeGenre(track.theme, track.mood);
            const grade = qualityGrade(track.quality);
            const rec = derivedGenre ? recommendReleasePlan({ ...track, genre: derivedGenre }) : recommendReleasePlan(track);
            const recLabel = `${rec.distribution} ${rec.scheduleKey === "now" ? "now" : rec.scheduleKey === "fortnight" ? "+14d" : "+7d"}`;
            const recFeeLabel = formatMoney(getReleaseDistributionFee(rec.distribution));
            const genreLabel = renderGenrePillsFromGenre(derivedGenre, { fallback: "-", alignment: track.alignment });
            const hasAct = Boolean(track.actId);
            const canSchedule = hasAct && isReady;
            const releaseTypeSelect = `
        <div class="field">
          <label>Release Type</label>
          <select data-release-type="${track.id}">
            <option value="Single"${releaseType === "Single" ? " selected" : ""}>Single</option>
            <option value="Project"${releaseType === "Project" ? " selected" : ""}>Project track</option>
          </select>
        </div>
      `;
            return `
        <div class="list-item">
          <div class="list-row">
            <div class="item-main">
              <div class="content-thumb" aria-hidden="true"></div>
              <div>
                <div class="item-title">${renderTrackTitle(track.title)}</div>
                <div class="muted">${genreLabel} | <span class="grade-text" data-grade="${grade}">${grade}</span></div>
                <div class="muted">${themeTag} ${alignTag}</div>
                <div class="muted">Act: ${renderActName(act || "Unassigned")} | Project: ${renderProjectName(project)} (${projectType}${editionLabel})</div>
                <div class="muted">Release type: ${releaseTypeLabel}</div>
                <div class="muted">${projectCountLine}</div>
                <div class="muted">Modifier: ${modifierName}</div>
                <div class="muted">Recommended: ${recLabel} - ${rec.reason}</div>
                ${releaseTypeSelect}
                ${actSelect}
              </div>
            </div>
            <div class="time-row">
              <div>
              <button type="button" data-release="asap" data-track="${track.id}"${canSchedule ? "" : " disabled"}>Release ASAP (${selectedFeeLabel})</button>
                <div class="time-meta">${asapLabel} (earliest Friday at midnight)</div>
              </div>
              <button type="button" class="ghost" data-release="week" data-track="${track.id}"${canSchedule ? "" : " disabled"}>+7d (${selectedFeeLabel})</button>
              <button type="button" class="ghost" data-release="fortnight" data-track="${track.id}"${canSchedule ? "" : " disabled"}>+14d (${selectedFeeLabel})</button>
              <button type="button" class="ghost" data-release="recommend" data-track="${track.id}"${canSchedule ? "" : " disabled"}>Use Recommended (${recFeeLabel})</button>
              <button type="button" class="ghost" data-track-scrap="${track.id}" title="Scrap this mastered track (removes it from the pipeline).">Scrap</button>
            </div>
          </div>
        </div>
      `;
        }).join("")
        : `<div class="muted">No release-ready tracks yet.</div>`;
    readyList.innerHTML = readyHtml;
    const releaseQueueList = $("releaseQueueList");
    if (!releaseQueueList)
        return;
    if (!queueEntries.length) {
        releaseQueueList.innerHTML = `<div class="muted">No scheduled releases.</div>`;
        return;
    }
    const blockedNote = (() => {
        if (!blockedQueue.length)
            return "";
        let missingCount = 0;
        let unmasteredCount = 0;
        blockedQueue.forEach(({ track }) => {
            if (!track)
                missingCount += 1;
            else
                unmasteredCount += 1;
        });
        const parts = [];
        if (unmasteredCount)
            parts.push(`${formatCount(unmasteredCount)} not mastered yet`);
        if (missingCount)
            parts.push(`${formatCount(missingCount)} missing track${missingCount === 1 ? "" : "s"}`);
        return `<div class="muted">Blocked: ${parts.join(", ")}.</div>`;
    })();
    const releaseReadyQueue = queueEntries.filter((item) => item.isReleaseReady);
    const queueHtml = releaseReadyQueue.length
        ? releaseReadyQueue.map(({ entry, track }) => {
            const date = formatDate(entry.releaseAt);
            const act = track ? getAct(track.actId) : null;
            const project = track ? (track.projectName || `${track.title} - Single`) : "Unknown";
            const projectType = track ? normalizeProjectType(track.projectType || "Single") : "Single";
            const releaseType = track ? resolveTrackReleaseType(track) : "Single";
            const releaseTypeLabel = releaseType === "Single" ? "Single" : "Project track";
            const editionLabel = track?.projectEdition === "Deluxe" ? " | Deluxe" : "";
            const distribution = entry.distribution || entry.note || "Digital";
            return `
      <div class="list-item">
        <div class="list-row">
          <div class="item-main">
            <div class="content-thumb" aria-hidden="true"></div>
            <div>
              <div class="item-title">${track ? renderTrackTitle(track.title) : "Unknown"}</div>
              <div class="muted">${date} | ${distribution}</div>
              <div class="muted">Act: ${track ? renderActName(act || "Unassigned") : "Unknown"} | Project: ${renderProjectName(project)} (${projectType}${editionLabel})</div>
              <div class="muted">Release type: ${releaseTypeLabel}</div>
            </div>
          </div>
        </div>
      </div>
    `;
        }).join("")
        : `<div class="muted">No release-ready scheduled entries.</div>`;
    releaseQueueList.innerHTML = `${blockedNote}${queueHtml}`;
}
function renderTouringDesk() {
    const draftSelect = $("tourDraftSelect");
    if (!draftSelect)
        return;
    if (!state.ui)
        state.ui = {};
    if (typeof document !== "undefined") {
        const active = document.activeElement;
        const isTourField = active && typeof active.closest === "function" && active.closest("[data-tour-lock]");
        if (state.ui.tourDeskLock && !isTourField)
            state.ui.tourDeskLock = false;
        if (state.ui.tourDeskLock)
            return;
    }
    else if (state.ui.tourDeskLock) {
        state.ui.tourDeskLock = false;
    }
    if (!state.ui.tourVenueFilters || typeof state.ui.tourVenueFilters !== "object") {
        state.ui.tourVenueFilters = { nation: "All", regionId: "All", tier: "All" };
    }
    if (!Number.isFinite(state.ui.tourBookingWeek))
        state.ui.tourBookingWeek = weekIndex() + 1;
    if (!Number.isFinite(state.ui.tourBookingDay))
        state.ui.tourBookingDay = 5;
    if (!Number.isFinite(state.ui.tourAutoCount))
        state.ui.tourAutoCount = 8;
    state.ui.tourBookingWeek = Math.max(1, Math.round(state.ui.tourBookingWeek));
    state.ui.tourBookingDay = clamp(Math.round(state.ui.tourBookingDay), 0, 6);
    state.ui.tourAutoCount = Math.max(1, Math.round(state.ui.tourAutoCount));
    const drafts = listTourDrafts();
    let draft = getSelectedTourDraft();
    if (!draft && drafts.length)
        draft = selectTourDraft(drafts[0].id);
    const noticeEl = $("tourNotice");
    const nameInput = $("tourNameInput");
    const actSelect = $("tourActSelect");
    const eraSelect = $("tourEraSelect");
    const anchorSelect = $("tourAnchorSelect");
    const windowStartInput = $("tourWindowStart");
    const windowEndInput = $("tourWindowEnd");
    const autoCountInput = $("tourAutoCount");
    const autoGenerateBtn = $("tourAutoGenerateBtn");
    const plannerMeta = $("tourPlannerMeta");
    const act = draft?.actId ? getAct(draft.actId) : null;
    const era = draft?.eraId ? getEraById(draft.eraId) : (act ? getLatestActiveEraForAct(act.id) : null);
    const marketPool = Array.isArray(state.marketTracks) ? state.marketTracks : [];
    const marketTracks = marketPool.filter((track) => {
        if (!track || !track.isPlayer)
            return false;
        if (!draft?.actId)
            return false;
        if (track.actId !== draft.actId)
            return false;
        if (draft?.eraId && track.eraId !== draft.eraId)
            return false;
        return true;
    });
    const defaultNotice = (() => {
        if (!draft)
            return { message: "Create a tour draft to begin planning.", tone: "warn" };
        if (!draft.actId)
            return { message: "Assign an Act to unlock venues and projections.", tone: "warn" };
        if (!era || era.status !== "Active")
            return { message: "Touring requires an active Era for the selected Act.", tone: "warn" };
        if (!marketTracks.length)
            return { message: "Touring requires released Project or Track content.", tone: "warn" };
        return { message: "Plan the window, pick an anchor release, then book venues to build the route.", tone: "info" };
    })();
    const notice = state.ui.tourNotice || defaultNotice;
    if (noticeEl) {
        noticeEl.textContent = notice.message || defaultNotice.message;
        noticeEl.className = `callout${notice.tone === "warn" ? " callout--warn" : ""}`;
    }
    if (draftSelect) {
        if (!drafts.length) {
            draftSelect.innerHTML = `<option value="">No drafts yet</option>`;
        }
        else {
            draftSelect.innerHTML = drafts.map((entry) => (`<option value="${entry.id}"${draft?.id === entry.id ? " selected" : ""}>${entry.name || entry.id}</option>`)).join("");
        }
        draftSelect.value = draft?.id || "";
    }
    if (nameInput) {
        nameInput.value = draft?.name || "";
        nameInput.disabled = !draft;
    }
    if (actSelect) {
        const acts = Array.isArray(state.acts) ? state.acts : [];
        const options = acts.map((entry) => `<option value="${entry.id}">${entry.name}</option>`).join("");
        actSelect.innerHTML = `<option value="">Select Act</option>${options}`;
        actSelect.value = draft?.actId || "";
        actSelect.disabled = !draft || !acts.length;
    }
    if (eraSelect) {
        const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
        const options = activeEras
            .filter((entry) => !draft?.actId || entry.actId === draft.actId)
            .map((entry) => {
            const eraAct = getAct(entry.actId);
            const actLabel = eraAct ? ` (${eraAct.name})` : "";
            return `<option value="${entry.id}">${entry.name}${actLabel}</option>`;
        }).join("");
        eraSelect.innerHTML = `<option value="">Auto (latest active)</option>${options}`;
        eraSelect.value = draft?.eraId || "";
        eraSelect.disabled = !draft;
    }
    if (anchorSelect) {
        let anchorValue = "auto";
        if (draft?.anchorTrackIds?.length) {
            anchorValue = `track:${draft.anchorTrackIds[0]}`;
        }
        else if (draft?.anchorProjectId) {
            anchorValue = draft.anchorProjectId;
        }
        const sortedTracks = marketTracks.slice().sort((a, b) => (b.releasedAt || 0) - (a.releasedAt || 0));
        const projectMap = new Map();
        sortedTracks.forEach((track) => {
            const projectName = track.projectName || `${track.title} - Single`;
            const projectType = normalizeProjectType(track.projectType || "Single");
            const key = `${normalizeProjectName(projectName)}::${projectType}`;
            if (!projectMap.has(key))
                projectMap.set(key, track);
        });
        const projectOptions = Array.from(projectMap.values()).map((track) => {
            const key = buildPromoProjectKeyFromTrack(track);
            if (!key)
                return "";
            const projectName = track.projectName || `${track.title} - Single`;
            const projectType = normalizeProjectType(track.projectType || "Single");
            const label = `${projectName} (${projectType})`;
            return `<option value="${key}">${label}</option>`;
        }).filter(Boolean).join("");
        const trackOptions = sortedTracks.map((track) => {
            const trackId = track.trackId || track.id;
            if (!trackId)
                return "";
            const projectName = track.projectName || `${track.title} - Single`;
            const projectType = normalizeProjectType(track.projectType || "Single");
            const suffix = projectType === "Single" ? "Single" : projectType;
            return `<option value="track:${trackId}">${track.title} (${suffix} | ${projectName})</option>`;
        }).filter(Boolean).join("");
        anchorSelect.innerHTML = `
      <option value="auto">Auto (latest release)</option>
      ${projectOptions ? `<optgroup label="Projects">${projectOptions}</optgroup>` : ""}
      ${trackOptions ? `<optgroup label="Tracks">${trackOptions}</optgroup>` : ""}
    `;
        anchorSelect.value = anchorValue;
        anchorSelect.disabled = !draft || !draft.actId || !marketTracks.length;
    }
    const windowStartWeek = Number.isFinite(draft?.window?.startWeek) ? Math.round(draft.window.startWeek) : null;
    const windowEndWeek = Number.isFinite(draft?.window?.endWeek) ? Math.round(draft.window.endWeek) : null;
    if (windowStartInput) {
        if (windowStartInput.tagName === "SELECT") {
            windowStartInput.innerHTML = buildWeekSelectOptions({
                selectedWeek: windowStartWeek,
                startWeek: weekIndex() + 1,
                count: 24,
                placeholder: "Start window"
            });
            windowStartInput.value = windowStartWeek ? String(windowStartWeek) : "";
        }
        else {
            windowStartInput.value = windowStartWeek ? String(windowStartWeek) : "";
        }
        windowStartInput.disabled = !draft;
    }
    if (windowEndInput) {
        if (windowEndInput.tagName === "SELECT") {
            windowEndInput.innerHTML = buildWeekSelectOptions({
                selectedWeek: windowEndWeek,
                startWeek: weekIndex() + 1,
                count: 24,
                placeholder: "End window"
            });
            windowEndInput.value = windowEndWeek ? String(windowEndWeek) : "";
        }
        else {
            windowEndInput.value = windowEndWeek ? String(windowEndWeek) : "";
        }
        windowEndInput.disabled = !draft;
    }
    if (autoCountInput) {
        autoCountInput.value = String(state.ui.tourAutoCount || 1);
        autoCountInput.disabled = !draft;
    }
    if (autoGenerateBtn) {
        autoGenerateBtn.disabled = !draft;
    }
    if (plannerMeta) {
        const actLabel = act ? renderActName(act) : "No Act";
        const eraLabel = era ? era.name : "No active Era";
        plannerMeta.textContent = `Status: ${draft?.status || "Draft"} | Act: ${actLabel} | Era: ${eraLabel}`;
    }
    const timelineList = $("tourTimelineList");
    if (timelineList) {
        const bookings = draft ? listTourBookings({ tourId: draft.id }) : [];
        const ordered = bookings.slice().sort((a, b) => (a.scheduledAt || 0) - (b.scheduledAt || 0));
        if (!draft) {
            timelineList.innerHTML = `<div class="muted">No tour draft selected yet.</div>`;
        }
        else if (!ordered.length) {
            timelineList.innerHTML = `<div class="muted">No tour dates booked yet.</div>`;
        }
        else {
            timelineList.innerHTML = ordered.map((booking) => {
                const isCompleted = booking.status === "Completed";
                const projection = booking.projection || {};
                const attendance = Number(isCompleted ? booking.attendance : projection.attendance || 0);
                const revenue = Number(isCompleted ? booking.revenue : projection.revenue || 0);
                const costs = Number(isCompleted ? booking.costs : projection.costs || 0);
                const profit = Number(isCompleted ? booking.profit : projection.profit || 0);
                const warnings = Array.isArray(booking.warnings) ? booking.warnings : [];
                const warningLine = warnings.length
                    ? `<div class="muted tour-warning-line">${warnings.map((warn) => warn.message || warn.code || "Warning").join(" | ")}</div>`
                    : "";
                const statusBadge = isCompleted ? "badge" : "badge warn";
                const canRemove = !isCompleted;
                return `
          <div class="list-item">
            <div class="list-row">
              <div>
                <div class="item-title">${booking.venueLabel || "Venue"} | ${formatDate(booking.scheduledAt)}</div>
                <div class="muted">${booking.weekNumber ? formatWeekRangeLabel(booking.weekNumber) : "Date range -"} | ${DAYS?.[booking.dayIndex] || "Day"} | ${booking.regionId || "Region"} (${booking.tier || "Tier"})</div>
                <div class="muted">${isCompleted ? "Actual" : "Projected"} attendance ${formatCount(attendance)} | Revenue ${formatMoney(revenue)} | Costs ${formatMoney(costs)} | Profit ${formatMoney(profit)}</div>
                ${warningLine}
              </div>
              <div class="${statusBadge}">${isCompleted ? "Completed" : "Booked"}</div>
            </div>
            <div class="actions">
              <button type="button" class="ghost mini" data-tour-remove="${booking.id}"${canRemove ? "" : " disabled"}>Remove</button>
            </div>
          </div>
        `;
            }).join("");
        }
    }
    const bookingWeekInput = $("tourBookingWeek");
    const bookingDaySelect = $("tourBookingDay");
    const bookingWeekValue = Number.isFinite(state.ui.tourBookingWeek) ? state.ui.tourBookingWeek : weekIndex() + 1;
    if (bookingWeekInput) {
        if (bookingWeekInput.tagName === "SELECT") {
            bookingWeekInput.innerHTML = buildWeekSelectOptions({
                selectedWeek: bookingWeekValue,
                startWeek: weekIndex() + 1,
                count: 24,
                placeholder: "Date range"
            });
            bookingWeekInput.value = String(bookingWeekValue);
        }
        else {
            bookingWeekInput.value = String(bookingWeekValue);
        }
        bookingWeekInput.disabled = !draft;
    }
    if (bookingDaySelect) {
        bookingDaySelect.value = String(state.ui.tourBookingDay ?? 5);
        bookingDaySelect.disabled = !draft;
    }
    const venueNation = $("tourVenueNation");
    const venueRegion = $("tourVenueRegion");
    const venueTier = $("tourVenueTier");
    if (venueNation) {
        const options = NATIONS.map((nation) => `<option value="${nation}">${nation}</option>`).join("");
        venueNation.innerHTML = `<option value="All">All Nations</option>${options}`;
        venueNation.value = state.ui.tourVenueFilters.nation || "All";
        venueNation.disabled = !draft;
    }
    if (venueRegion) {
        const options = REGION_DEFS.map((region) => `<option value="${region.id}">${region.label}</option>`).join("");
        venueRegion.innerHTML = `<option value="All">All Regions</option>${options}`;
        venueRegion.value = state.ui.tourVenueFilters.regionId || "All";
        venueRegion.disabled = !draft;
    }
    if (venueTier) {
        const tiers = listTourTiers();
        const options = tiers.map((tier) => `<option value="${tier}">${tier}</option>`).join("");
        venueTier.innerHTML = `<option value="All">All Tiers</option>${options}`;
        venueTier.value = state.ui.tourVenueFilters.tier || "All";
        venueTier.disabled = !draft;
    }
    const venueList = $("tourVenueList");
    if (venueList) {
        if (!draft) {
            venueList.innerHTML = `<div class="muted">Create a tour draft to browse venues.</div>`;
        }
        else {
            const filters = state.ui.tourVenueFilters || {};
            const filterNation = filters.nation !== "All" ? filters.nation : null;
            const filterRegion = filters.regionId !== "All" ? filters.regionId : null;
            const filterTier = filters.tier !== "All" ? filters.tier : null;
            const venues = listTourVenues({ nation: filterNation, regionId: filterRegion, tier: filterTier });
            const tierOrder = listTourTiers();
            const tierIndex = (tier) => {
                const index = tierOrder.indexOf(tier);
                return index >= 0 ? index : tierOrder.length;
            };
            venues.sort((a, b) => {
                const tierDelta = tierIndex(a.tier) - tierIndex(b.tier);
                if (tierDelta !== 0)
                    return tierDelta;
                return (a.capacity || 0) - (b.capacity || 0);
            });
            const week = state.ui.tourBookingWeek || weekIndex() + 1;
            const dayIndex = state.ui.tourBookingDay ?? 5;
            const scheduledAt = weekStartEpochMs(week) + dayIndex * DAY_MS;
            const anchor = draft && act ? resolveTourAnchor(draft, act.id, era?.id) : { primary: null };
            const projectionsReady = !!(draft && act && era && marketTracks.length);
            if (!venues.length) {
                venueList.innerHTML = `<div class="muted">No venues match the current filters.</div>`;
            }
            else {
                venueList.innerHTML = venues.map((venue) => {
                    const availability = getTourVenueAvailability(venue.id, scheduledAt);
                    const validation = validateTourBooking({ draft, venue, scheduledAt });
                    const projection = validation.projection || (projectionsReady
                        ? computeTourProjection({ draft, act, era, venue, scheduledAt, anchor: anchor.primary })
                        : null);
                    const slotsLabel = `${availability.available}/${availability.capacity} slots`;
                    const projectionLine = projection
                        ? `Projected attendance ${formatCount(projection.attendance)} | Profit ${formatMoney(projection.profit)}`
                        : "Projection unavailable (needs Act + Era + released content).";
                    const blockLine = !validation.ok && validation.reason
                        ? `<div class="muted tour-warning-line">${validation.reason}</div>`
                        : "";
                    const canBook = validation.ok;
                    return `
            <div class="list-item">
              <div class="list-row">
                <div>
                  <div class="item-title">${venue.label}</div>
                  <div class="muted">${venue.tier} | ${venue.regionId} | Capacity ${formatCount(venue.capacity)}</div>
                  <div class="muted">Availability ${slotsLabel} | ${formatDate(scheduledAt)}</div>
                  <div class="muted">${projectionLine}</div>
                  ${blockLine}
                </div>
                <div class="actions">
                  <button type="button" data-tour-book="${venue.id}"${canBook ? "" : " disabled"}>Book</button>
                </div>
              </div>
            </div>
          `;
                }).join("");
            }
        }
    }
    const summaryList = $("tourBudgetSummary");
    const warningList = $("tourWarningList");
    const crewSummaryList = $("tourCrewSummary");
    const crewStaminaList = $("tourCrewStaminaList");
    if (summaryList) {
        if (!draft) {
            summaryList.innerHTML = `<div class="muted">Select a tour draft to see projections.</div>`;
        }
        else {
            const summary = computeTourDraftSummary(draft.id);
            if (!summary.count) {
                summaryList.innerHTML = `<div class="muted">No tour dates booked yet.</div>`;
            }
            else {
                const legLine = (summary.legs || [])
                    .map((leg) => `${leg.regionLabel} (${leg.count})`)
                    .join(" | ");
                summaryList.innerHTML = `
          <div class="list-item">
            <div class="item-title">Tour summary</div>
            <div class="muted">Dates ${formatCount(summary.count)} | Attendance ${formatCount(summary.attendance)}</div>
            ${legLine ? `<div class="muted">Legs ${summary.legCount} | ${legLine}</div>` : ""}
            <div class="muted">Revenue ${formatMoney(summary.revenue)} | Costs ${formatMoney(summary.costs)} | Profit ${formatMoney(summary.profit)}</div>
          </div>
        `;
            }
        }
    }
    if (crewSummaryList || crewStaminaList) {
        if (!draft) {
            const message = `<div class="muted">Select a tour draft to see crew readiness.</div>`;
            if (crewSummaryList)
                crewSummaryList.innerHTML = message;
            if (crewStaminaList)
                crewStaminaList.innerHTML = message;
        }
        else if (!act) {
            const message = `<div class="muted">Assign an Act to view crew readiness.</div>`;
            if (crewSummaryList)
                crewSummaryList.innerHTML = message;
            if (crewStaminaList)
                crewStaminaList.innerHTML = message;
        }
        else {
            const crew = (act.memberIds || []).map((id) => getCreator(id)).filter(Boolean);
            if (!crew.length) {
                const message = `<div class="muted">No crew assigned for this Act yet.</div>`;
                if (crewSummaryList)
                    crewSummaryList.innerHTML = message;
                if (crewStaminaList)
                    crewStaminaList.innerHTML = message;
            }
            else {
                const crewCount = crew.length;
                const perDateCost = estimateTourDateStaminaShare(crewCount);
                const projectedCost = Math.max(1, Math.ceil(perDateCost || 0));
                const now = state.time?.epochMs || Date.now();
                const upcomingBookings = listTourBookings({ tourId: draft.id })
                    .filter((booking) => booking?.status !== "Completed" && Number.isFinite(booking?.scheduledAt))
                    .filter((booking) => booking.scheduledAt >= now);
                const upcomingDates = upcomingBookings.length;
                const avgSkill = crew.reduce((sum, creator) => sum + Number(creator.skill || 0), 0) / crewCount;
                const avgCatharsis = crew.reduce((sum, creator) => sum + getCreatorCatharsisScore(creator), 0) / crewCount;
                const avgStamina = crew.reduce((sum, creator) => sum + Number(creator.stamina || 0), 0) / crewCount;
                const avgStaminaPct = STAMINA_MAX ? clamp(avgStamina / STAMINA_MAX, 0, 1) : 0;
                const avgSkillPct = SKILL_MAX ? clamp(avgSkill / SKILL_MAX, 0, 1) : 0;
                const maxDates = crew.map((creator) => estimateCreatorMaxConsecutiveTourDates(creator, crewCount));
                const minMaxDates = maxDates.length ? Math.min(...maxDates) : 0;
                const avgMaxDates = maxDates.length
                    ? maxDates.reduce((sum, value) => sum + value, 0) / maxDates.length
                    : 0;
                const projectedSpend = Math.max(0, Math.round(perDateCost * upcomingDates));
                const projectedFatigue = avgStamina > 0 ? Math.round((projectedSpend / avgStamina) * 100) : 0;
                const overuseEntries = crew.map((creator) => {
                    const spent = getCreatorStaminaSpentToday(creator);
                    const projected = spent + projectedCost;
                    const risk = STAMINA_OVERUSE_LIMIT > 0
                        ? projected > STAMINA_OVERUSE_LIMIT
                            ? 2
                            : projected >= STAMINA_OVERUSE_LIMIT * 0.75
                                ? 1
                                : 0
                        : 0;
                    return { creator, spent, projected, risk };
                });
                const overuseRiskCount = overuseEntries.filter((entry) => entry.risk > 0).length;
                const readiness = (() => {
                    if (upcomingDates && minMaxDates > 0 && upcomingDates > minMaxDates) {
                        return { label: "Overbooked", className: "badge danger" };
                    }
                    if (avgStaminaPct < 0.35 || avgSkillPct < 0.45) {
                        return { label: "Strained", className: "badge warn" };
                    }
                    if (upcomingDates > 0 && (avgStaminaPct < 0.55 || avgSkillPct < 0.55)) {
                        return { label: "Warming", className: "badge warn" };
                    }
                    return { label: "Ready", className: "badge" };
                })();
                if (crewSummaryList) {
                    const upcomingLabel = upcomingDates
                        ? `${formatCount(upcomingDates)} upcoming date${upcomingDates === 1 ? "" : "s"}`
                        : "No upcoming dates";
                    const staminaLabel = STAMINA_MAX
                        ? `${formatCount(Math.round(avgStamina))} / ${STAMINA_MAX}`
                        : formatCount(Math.round(avgStamina));
                    const skillLabel = formatCount(Math.round(avgSkill));
                    const catharsisLabel = formatCount(Math.round(avgCatharsis));
                    const streakLabel = minMaxDates > 0
                        ? `Min streak ${formatCount(minMaxDates)} dates | Avg streak ${formatCount(Math.round(avgMaxDates))}`
                        : "Streak estimate unavailable";
                    const fatigueLabel = upcomingDates
                        ? `Projected fatigue ${formatCount(projectedSpend)} stamina (~${projectedFatigue}% avg)`
                        : "Projected fatigue -";
                    const overuseLabel = overuseRiskCount
                        ? `Overuse risk ${formatCount(overuseRiskCount)} crew near daily limit`
                        : "Overuse risk none";
                    crewSummaryList.innerHTML = `
            <div class="list-item">
              <div class="list-row">
                <div>
                  <div class="item-title">Tour readiness</div>
                  <div class="muted">Stamina avg ${staminaLabel} | Skill avg ${skillLabel} | ${upcomingLabel}</div>
                  <div class="muted">${streakLabel}</div>
                  <div class="muted">${fatigueLabel} | ${overuseLabel}</div>
                </div>
                <div class="${readiness.className}">${readiness.label}</div>
              </div>
            </div>
            <div class="list-item">
              <div class="item-title">Skill + catharsis</div>
              <div class="muted">Act: ${renderActName(act)} | Skill avg ${skillLabel} | Catharsis avg ${catharsisLabel}</div>
              <div class="muted">Tour crew: ${formatCount(crewCount)} member${crewCount === 1 ? "" : "s"} | Skill avg ${skillLabel} | Catharsis avg ${catharsisLabel}</div>
            </div>
          `;
                }
                if (crewStaminaList) {
                    crewStaminaList.innerHTML = crew.map((creator) => {
                        const stamina = Number(creator.stamina || 0);
                        const spent = getCreatorStaminaSpentToday(creator);
                        const strikes = creator.overuseStrikes || 0;
                        const maxStreak = estimateCreatorMaxConsecutiveTourDates(creator, crewCount);
                        const entry = overuseEntries.find((item) => item.creator?.id === creator.id);
                        const risk = entry?.risk || 0;
                        const riskBadge = risk === 2
                            ? `<div class="badge danger">Overuse risk</div>`
                            : risk === 1
                                ? `<div class="badge warn">Overuse risk</div>`
                                : "";
                        return `
              <div class="list-item">
                <div class="list-row">
                  <div>
                    <div class="item-title">${creator.name}</div>
                    <div class="muted">Stamina ${formatCount(stamina)} / ${STAMINA_MAX} | Spent ${formatCount(spent)} / ${STAMINA_OVERUSE_LIMIT} | Strikes ${formatCount(strikes)}</div>
                    <div class="muted">Max consecutive dates ${formatCount(maxStreak)}</div>
                  </div>
                  ${riskBadge}
                </div>
              </div>
            `;
                    }).join("");
                }
            }
        }
    }
    if (warningList) {
        if (!draft) {
            warningList.innerHTML = `<div class="muted">No tour warnings yet.</div>`;
        }
        else {
            const summary = computeTourDraftSummary(draft.id);
            const seen = new Set();
            const warnings = (summary.warnings || [])
                .filter((warn) => {
                const code = warn?.code || warn?.message || "warning";
                if (seen.has(code))
                    return false;
                seen.add(code);
                return true;
            })
                .map((warn) => warn?.message || warn?.code || "Warning");
            warningList.innerHTML = warnings.length
                ? warnings.map((message) => `
          <div class="list-item">
            <div class="list-row">
              <div class="muted">${message}</div>
              <div class="badge warn">Warning</div>
            </div>
          </div>
        `).join("")
                : `<div class="muted">No tour warnings yet.</div>`;
        }
    }
    const balanceToggle = $("tourBalanceToggle");
    if (balanceToggle) {
        balanceToggle.checked = touringBalanceEnabled();
    }
}
function collectProjectChartEntries(entries) {
    const projects = new Map();
    (entries || []).forEach((entry) => {
        const track = entry.track || entry;
        if (!track)
            return;
        const projectName = track.projectName || `${track.title} - Single`;
        const projectType = normalizeProjectType(track.projectType || "Single");
        const label = track.label || "Unknown";
        const actName = track.actName || "-";
        const key = `${normalizeProjectName(projectName)}::${projectType}::${label}::${actName}`;
        const metrics = entry.metrics || {};
        const score = Number(entry.score || 0);
        const existing = projects.get(key) || {
            projectName,
            projectType,
            label,
            actName,
            alignment: track.alignment,
            country: track.country || "Annglora",
            primaryTrack: track,
            primaryScore: Number.isFinite(score) ? score : 0,
            trackCount: 0,
            metrics: { sales: 0, streaming: 0, airplay: 0, social: 0 },
            score: 0
        };
        existing.trackCount += 1;
        if (Number.isFinite(score)) {
            existing.score += score;
            if (!existing.primaryTrack || score > existing.primaryScore) {
                existing.primaryTrack = track;
                existing.primaryScore = score;
            }
        }
        existing.metrics.sales += Number(metrics.sales || 0);
        existing.metrics.streaming += Number(metrics.streaming || 0);
        existing.metrics.airplay += Number(metrics.airplay || 0);
        existing.metrics.social += Number(metrics.social || 0);
        projects.set(key, existing);
    });
    return Array.from(projects.values())
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
}
function buildTrendRankingList({ limit = null, showMore = false, inlineGenre = false } = {}) {
    const { visible, aggregate, statusByGenre } = collectTrendRanking();
    const displayed = typeof limit === "number" ? visible.slice(0, limit) : visible;
    if (!displayed.length) {
        return { markup: `<div class="muted">No trends yet.</div>`, visibleCount: 0, totalCount: visible.length };
    }
    const alignmentScores = aggregate.alignmentScores || {};
    const list = displayed.map((trend, index) => {
        const theme = themeFromGenre(trend);
        const mood = moodFromGenre(trend);
        const status = statusByGenre?.[trend] || { label: "STABLE", className: "", weekLabel: "" };
        const statusClass = status.className ? `badge ${status.className}` : "badge";
        const weekBadge = status.weekLabel ? `<div class="badge">${status.weekLabel}</div>` : "";
        const points = Math.round(aggregate.totals?.[trend] || 0);
        const pointsLabel = `${formatCount(points)} pts`;
        const isTop = index < TREND_DETAIL_COUNT;
        const leader = isTop ? trendAlignmentLeader(trend, alignmentScores) : null;
        const detail = isTop
            ? `
        <div class="trend-detail">
          <div class="trend-detail-row">
            <span class="trend-detail-pill">Alignment push</span>
            ${leader
                ? `${renderAlignmentTag(leader.alignment)} <span class="muted">${leader.share}% of trend points</span>`
                : `<span class="muted">No clear alignment leader</span>`}
          </div>
        </div>
      `
            : "";
        const moreAction = showMore && index === 0
            ? `<button type="button" class="ghost mini" data-ranking-more="trends">More</button>`
            : "";
        return `
      <div class="list-item trend-item${isTop ? " trend-item--top" : ""}">
        <div class="list-row">
          <div>
            <div class="item-title">#${index + 1} ${renderGenrePills(theme, mood, { inline: inlineGenre })}</div>
          </div>
          <div class="ranking-actions">
            <div class="${statusClass}">${status.label}</div>
            ${weekBadge}
            <div class="pill trend-points">${pointsLabel}</div>
            ${moreAction}
          </div>
        </div>
        ${detail}
      </div>
    `;
    });
    return { markup: list.join(""), visibleCount: displayed.length, totalCount: visible.length };
}
function renderTrends() {
    const listEl = $("trendList");
    if (!listEl)
        return;
    const scopeSelect = $("trendScopeSelect");
    const targetSelect = $("trendScopeTarget");
    const targetLabel = $("trendScopeTargetLabel");
    const scopeMeta = $("trendScopeMeta");
    if (scopeSelect) {
        scopeSelect.value = "global";
        scopeSelect.disabled = true;
    }
    if (targetLabel)
        targetLabel.textContent = "Global";
    if (targetSelect) {
        targetSelect.disabled = true;
        targetSelect.innerHTML = `<option value="global">Global</option>`;
    }
    const limit = getCommunityTrendRankingLimit();
    const { markup, visibleCount, totalCount } = buildTrendRankingList({ limit, showMore: true });
    listEl.innerHTML = markup;
    if (scopeMeta) {
        if (!totalCount) {
            scopeMeta.textContent = "No trends available yet.";
        }
        else if (visibleCount >= totalCount) {
            scopeMeta.textContent = `Showing ${formatCount(totalCount)} global trends.`;
        }
        else {
            scopeMeta.textContent = `Showing Global Top ${formatCount(visibleCount)} of ${formatCount(totalCount)} trends.`;
        }
    }
}
function renderCommunityRankings() {
    renderCommunityLabels();
    renderTrends();
}
function renderRankingModal(category) {
    const titleEl = $("rankingModalTitle");
    const listEl = $("rankingModalList");
    const metaEl = $("rankingModalMeta");
    if (!titleEl || !listEl)
        return;
    if (category === "labels") {
        const { markup, totalCount } = buildLabelRankingList();
        titleEl.textContent = "Label Rankings";
        listEl.innerHTML = markup;
        if (metaEl) {
            metaEl.textContent = totalCount
                ? `Showing ${formatCount(totalCount)} ranked labels.`
                : "No labels ranked yet.";
        }
    }
    else if (category === "trends") {
        const { markup, totalCount } = buildTrendRankingList();
        titleEl.textContent = "Trend Rankings";
        listEl.innerHTML = markup;
        if (metaEl) {
            metaEl.textContent = totalCount
                ? `Showing ${formatCount(totalCount)} global trends.`
                : "No trends available yet.";
        }
    }
    openOverlay("rankingModal");
}
function renderRankingWindow(category) {
    const windowEl = $("rankingWindow");
    const titleEl = $("rankingWindowTitle");
    const listEl = $("rankingWindowList");
    const metaEl = $("rankingWindowMeta");
    if (!windowEl || !titleEl || !listEl)
        return;
    const isLabels = category === "labels";
    if (isLabels) {
        const { markup, visibleCount, totalCount } = buildLabelRankingList({ limit: 8, showUsage: true });
        titleEl.textContent = "Top Labels";
        listEl.innerHTML = markup;
        if (metaEl) {
            if (!totalCount) {
                metaEl.textContent = "No labels ranked yet.";
            }
            else if (visibleCount >= totalCount) {
                metaEl.textContent = `Showing ${formatCount(totalCount)} labels.`;
            }
            else {
                metaEl.textContent = `Showing Top ${formatCount(visibleCount)} of ${formatCount(totalCount)} labels.`;
            }
        }
        return;
    }
    const { markup, visibleCount, totalCount } = buildTrendRankingList({ limit: 40, inlineGenre: true });
    titleEl.textContent = "Top Trends";
    listEl.innerHTML = markup;
    if (metaEl) {
        if (!totalCount) {
            metaEl.textContent = "No trends available yet.";
        }
        else if (visibleCount >= totalCount) {
            metaEl.textContent = `Showing ${formatCount(totalCount)} global trends.`;
        }
        else {
            metaEl.textContent = `Showing Global Top ${formatCount(visibleCount)} of ${formatCount(totalCount)} trends.`;
        }
    }
}
function renderCreateTrends() {
    const listEl = $("createTrendList");
    if (!listEl)
        return;
    const { visible, aggregate, statusByGenre } = collectTrendRanking();
    const list = visible.slice(0, TREND_DETAIL_COUNT).map((trend, index) => {
        const theme = themeFromGenre(trend);
        const mood = moodFromGenre(trend);
        const status = statusByGenre?.[trend] || { label: "STABLE", className: "", weekLabel: "" };
        const statusClass = status.className ? `badge ${status.className}` : "badge";
        const weekBadge = status.weekLabel ? `<div class="badge">${status.weekLabel}</div>` : "";
        const points = Math.round(aggregate.totals?.[trend] || 0);
        const pointsLabel = `${formatCount(points)} pts`;
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">#${index + 1} ${renderGenrePills(theme, mood)}</div>
          </div>
          <div class="ranking-actions">
            <div class="${statusClass}">${status.label}</div>
            ${weekBadge}
            <div class="pill trend-points">${pointsLabel}</div>
          </div>
        </div>
      </div>
    `;
    });
    listEl.innerHTML = list.length ? list.join("") : `<div class="muted">No trends yet.</div>`;
}
function renderGenreIndex() {
    const listEl = $("genreList");
    if (!listEl)
        return;
    const themeFilter = state.ui.genreTheme || "All";
    const moodFilter = state.ui.genreMood || "All";
    const list = [];
    THEMES.forEach((theme) => {
        if (themeFilter !== "All" && theme !== themeFilter)
            return;
        MOODS.forEach((mood) => {
            if (moodFilter !== "All" && mood !== moodFilter)
                return;
            const genre = makeGenre(theme, mood);
            const label = renderGenrePills(theme, mood);
            const hot = state.trends.includes(genre);
            list.push(`
        <div class="list-item">
          <div class="list-row">
            <div>
              <div class="item-title">${label}</div>
            </div>
            ${hot ? `<div class="badge warn">Hot</div>` : `<div class="pill">Catalog</div>`}
          </div>
        </div>
      `);
        });
    });
    listEl.innerHTML = list.length ? list.join("") : `<div class="muted">No genres match the filters.</div>`;
}
function renderStudiosList() {
    const listEl = $("studioList");
    if (!listEl)
        return;
    const filters = state.ui.studioFilters || {};
    const ownerFilter = state.ui.studioOwnerFilter || "all";
    const restrictToOwned = state.ui.activeView === "create";
    document.querySelectorAll("[data-studio-filter]").forEach((input) => {
        const key = input.dataset.studioFilter;
        if (!key || typeof filters[key] !== "boolean")
            return;
        input.checked = filters[key] !== false;
    });
    const ownerSelect = $("studioOwnerFilter");
    if (ownerSelect) {
        const options = [
            `<option value="all">All rivals</option>`,
            ...state.rivals.map((rival) => `<option value="${rival.id}">${rival.name}</option>`)
        ];
        ownerSelect.innerHTML = options.join("");
        const validOwners = new Set(["all", ...state.rivals.map((rival) => rival.id)]);
        if (!validOwners.has(ownerFilter))
            state.ui.studioOwnerFilter = "all";
        ownerSelect.value = state.ui.studioOwnerFilter || "all";
        ownerSelect.disabled = restrictToOwned || filters.unowned === false;
    }
    const showOwned = restrictToOwned ? true : filters.owned !== false;
    const showUnowned = restrictToOwned ? false : filters.unowned !== false;
    const showOccupied = filters.occupied !== false;
    const showUnoccupied = filters.unoccupied !== false;
    const filtered = buildStudioEntries().filter((entry) => {
        if (entry.ownerType === "player" && !showOwned)
            return false;
        if (entry.ownerType !== "player" && !showUnowned)
            return false;
        if (entry.ownerType !== "player" && ownerFilter !== "all" && entry.ownerId !== ownerFilter)
            return false;
        if (entry.occupied && !showOccupied)
            return false;
        if (!entry.occupied && !showUnoccupied)
            return false;
        return true;
    });
    if (!filtered.length) {
        listEl.innerHTML = `<div class="muted">No studios match the filters.</div>`;
        return;
    }
    listEl.innerHTML = filtered.map((entry) => {
        const ownership = entry.ownerType === "player" ? "Owned" : "Unowned";
        const status = entry.occupied ? "Occupied" : "Available";
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${entry.ownerName} Studio ${entry.slotIndex}</div>
            <div class="muted">${ownership} | Slot ${entry.slotIndex} of ${entry.slotCount}</div>
          </div>
          <div class="pill">${status}</div>
        </div>
      </div>
    `;
    }).join("");
}
function renderCharts() {
    const contentType = state.ui.chartContentType || "tracks";
    const isActs = contentType === "acts";
    const isDemographics = contentType === "demographics";
    document.querySelectorAll("#chartTypeTabs .tab").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.chartContent === contentType);
    });
    const chartTabs = document.querySelector("#chartTabs");
    if (chartTabs)
        chartTabs.classList.toggle("hidden", isActs);
    const regionTabs = document.querySelector("#chartRegionTabs");
    const regions = Array.isArray(REGION_DEFS) ? REGION_DEFS : [];
    const regionIds = new Set(regions.map((region) => region.id));
    let activeChart = state.ui.activeChart || "global";
    let demographicsNotice = "";
    if (isActs) {
        if (activeChart !== "global") {
            activeChart = "global";
            state.ui.activeChart = activeChart;
        }
    }
    else if (isDemographics) {
        if (regionIds.has(activeChart)) {
            const region = regions.find((entry) => entry.id === activeChart);
            if (region?.nation) {
                activeChart = region.nation;
                state.ui.activeChart = activeChart;
                demographicsNotice = `Regional demographics are not modeled yet. Showing ${activeChart}.`;
                logEvent(`Demographics uses nation scope only. Showing ${activeChart}.`, "warn");
            }
            else {
                activeChart = "global";
                state.ui.activeChart = activeChart;
                demographicsNotice = "Demographics scope reset to Global after an invalid selection.";
                logEvent("Demographics scope reset to Global after an invalid selection.", "warn");
            }
        }
        else if (activeChart !== "global" && !NATIONS.includes(activeChart)) {
            activeChart = "global";
            state.ui.activeChart = activeChart;
            demographicsNotice = "Demographics scope reset to Global after an invalid selection.";
            logEvent("Demographics scope reset to Global after an invalid selection.", "warn");
        }
    }
    else if (activeChart !== "global" && !NATIONS.includes(activeChart) && !regionIds.has(activeChart)) {
        activeChart = "global";
        state.ui.activeChart = activeChart;
        logEvent("Charts scope reset to Global after an invalid selection.", "warn");
    }
    const chartWeekBtn = $("chartWeekBtn");
    if (chartWeekBtn) {
        chartWeekBtn.disabled = isActs || isDemographics;
        chartWeekBtn.title = isActs
            ? "History snapshots are available for charts only."
            : isDemographics
                ? "Population snapshots update yearly."
                : "";
    }
    if (isActs) {
        if (regionTabs) {
            regionTabs.innerHTML = "";
            regionTabs.classList.add("hidden");
        }
        const leaderboard = getActPopularityLeaderboard(currentYear());
        const yearLabel = `Year ${leaderboard.year}`;
        if ($("chartWeekRange"))
            $("chartWeekRange").textContent = yearLabel;
        if ($("chartHistoryNotice"))
            $("chartHistoryNotice").textContent = "";
        const meta = $("chartMeta");
        if (meta) {
            const weeksTracked = Number.isFinite(leaderboard.totalWeeks) ? leaderboard.totalWeeks : 0;
            const trackedLabel = weeksTracked
                ? `${formatCount(weeksTracked)} weeks tracked`
                : "No weekly points logged yet";
            meta.textContent = `${yearLabel} | Act popularity leaderboard | ${trackedLabel}`;
        }
        const entries = Array.isArray(leaderboard.entries) ? leaderboard.entries : [];
        if (!entries.length) {
            $("chartList").innerHTML = `<div class="muted">No act popularity data yet. Weekly chart updates will populate this leaderboard.</div>`;
            return;
        }
        const rows = entries.map((entry, index) => {
            const labelTag = renderLabelTag(entry.label || "Unknown Label", entry.country || state.label?.country || "Annglora");
            const actName = renderActName(entry) || "Unknown Act";
            const weeksActive = Number.isFinite(entry.weeksActive) ? entry.weeksActive : 0;
            const lastWeek = Number.isFinite(entry.lastWeek) ? entry.lastWeek : null;
            const lastWeekLabel = lastWeek ? `Last window ${formatWeekRangeLabel(lastWeek)}` : "Last window --";
            const trackPoints = formatCount(Math.round(entry.trackPoints || 0));
            const promoPoints = formatCount(Math.round(entry.promoPoints || 0));
            const tourPoints = formatCount(Math.round(entry.tourPoints || 0));
            const totalPoints = formatCount(Math.round(entry.points || 0));
            const playerLine = entry.isPlayer ? `<div class="muted">Your act</div>` : "";
            return `
        <tr>
          <td class="chart-rank">#${index + 1}</td>
          <td class="chart-title">
            <div class="item-title">${actName}</div>
            ${playerLine}
          </td>
          <td class="chart-label">${labelTag}</td>
          <td class="chart-act">
            <div>Weeks active ${formatCount(weeksActive)}</div>
            <div class="muted">${lastWeekLabel}</div>
          </td>
          <td class="chart-metrics">
            <div class="muted">Tracks ${trackPoints} | Promos ${promoPoints} | Tours ${tourPoints}</div>
          </td>
          <td class="chart-score">${totalPoints}</td>
        </tr>
      `;
        });
        $("chartList").innerHTML = `
      <div class="chart-table-wrap">
        <table class="chart-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Act</th>
              <th>Label</th>
              <th>Activity</th>
              <th>Breakdown</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            ${rows.join("")}
          </tbody>
        </table>
      </div>
    `;
        return;
    }
    const activeRegion = regions.find((region) => region.id === activeChart) || null;
    const activeNation = activeChart === "global"
        ? null
        : NATIONS.includes(activeChart)
            ? activeChart
            : activeRegion?.nation || null;
    document.querySelectorAll("#chartTabs .tab").forEach((btn) => {
        const chartKey = btn.dataset.chart;
        const isActive = activeChart === "global"
            ? chartKey === "global"
            : chartKey === activeNation;
        btn.classList.toggle("active", !!isActive);
    });
    if (regionTabs) {
        if (!activeNation || isDemographics) {
            regionTabs.innerHTML = "";
            regionTabs.classList.add("hidden");
        }
        else {
            const nationRegions = regions.filter((region) => region.nation === activeNation);
            regionTabs.classList.toggle("hidden", nationRegions.length === 0);
            regionTabs.innerHTML = nationRegions.map((region) => (`<button class="tab${region.id === activeChart ? " active" : ""}" data-chart="${region.id}" type="button">${region.label} Regional</button>`)).join("");
        }
    }
    if (isDemographics) {
        const snapshot = computePopulationSnapshot();
        const scopeEntry = activeNation
            ? snapshot?.nations?.find((entry) => entry.nation === activeNation)
            : snapshot;
        const scopeLabel = activeNation || "Gaia";
        const stageLabel = snapshot?.stage || "Campaign Era";
        if ($("chartWeekRange"))
            $("chartWeekRange").textContent = `Year ${currentYear()}`;
        if ($("chartHistoryNotice")) {
            $("chartHistoryNotice").textContent = demographicsNotice;
        }
        const meta = $("chartMeta");
        if (meta) {
            meta.textContent = `Population | ${scopeLabel} | ${stageLabel} | Age pyramid in 4-year bins`;
        }
        if (!scopeEntry || !Array.isArray(scopeEntry.ageGroups) || !scopeEntry.ageGroups.length) {
            $("chartList").innerHTML = `<div class="muted">No population snapshot available yet.</div>`;
            return;
        }
        const scopeTotal = Number.isFinite(scopeEntry.total) ? scopeEntry.total : snapshot?.total || 0;
        const segmentDefs = [
            { label: "0-20", min: 0, max: 20 },
            { label: "21-40", min: 21, max: 40 },
            { label: "41-60", min: 41, max: 60 },
            { label: "61+", min: 61, max: 119 }
        ];
        const segmentLine = segmentDefs.map((segment) => {
            const share = scopeEntry.ageGroups.reduce((sum, group) => {
                const midpoint = (group.minAge + group.maxAge) / 2;
                if (midpoint < segment.min || midpoint > segment.max)
                    return sum;
                const pct = Number.isFinite(group.share)
                    ? group.share
                    : scopeTotal ? (group.count || 0) / scopeTotal : 0;
                return sum + pct;
            }, 0);
            return `${segment.label}: ${Math.round(share * 100)}%`;
        }).join(" | ");
        const ageCards = scopeEntry.ageGroups.map((group) => {
            const pct = Number.isFinite(group.share)
                ? Math.round(group.share * 100)
                : scopeTotal ? Math.round(((group.count || 0) / scopeTotal) * 100) : 0;
            const count = Number.isFinite(group.count)
                ? group.count
                : scopeTotal ? Math.round(scopeTotal * (group.share || 0)) : 0;
            const midpoint = (group.minAge + group.maxAge) / 2;
            const budget = computeAudienceWeeklyBudget(midpoint, { stable: true });
            const engagement = computeAudienceEngagementRate(midpoint, { stable: true });
            const hours = computeAudienceWeeklyHours(midpoint, { stable: true });
            return `
        <div class="demographic-card">
          <div class="item-title">${group.label}</div>
          <div class="muted">${formatCount(count)} (${pct}%)</div>
          <div class="tiny muted">Budget ${formatMoney(budget)} / wk | Engage ${Math.round(engagement * 100)}% | Time ${formatCount(hours)}h</div>
        </div>
      `;
        }).join("");
        const nationLines = snapshot?.nations?.map((entry) => {
            const share = snapshot.total ? Math.round((entry.total / snapshot.total) * 100) : 0;
            const detail = activeNation
                ? `Capital ${formatCount(entry.capital)} | Elsewhere ${formatCount(entry.elsewhere)}`
                : `${share}% of Gaia`;
            return `
        <div class="list-item">
          <div class="list-row">
            <div>
              <div class="item-title">${entry.nation}</div>
              <div class="muted">${detail}</div>
            </div>
            <div class="pill">${formatCount(entry.total)}</div>
          </div>
        </div>
      `;
        }).join("") || "";
        const audienceSection = `
      <div class="subhead">Audience Chunks</div>
      <div class="tiny muted">Sampled 1K-member chunks with yearly age + preference evolution.</div>
      <div id="demographicsAudienceMeta" class="tiny muted"></div>
      <div id="demographicsAudienceList" class="list"></div>
    `;
        $("chartList").innerHTML = `
      <div class="callout">
        Demographics uses the seeded age pyramid per nation. Higher engagement flags streaming pressure, while higher budgets hint at future sales lift as cohorts age.
      </div>
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${scopeLabel} Population</div>
            <div class="muted">${stageLabel} | Updates yearly</div>
          </div>
          <div class="pill">${formatCount(scopeTotal)}</div>
        </div>
      </div>
      <div class="list-item">
        <div class="item-title">Age Segments</div>
        <div class="muted">${segmentLine}</div>
      </div>
      ${nationLines}
      <div class="demographics-grid">
        ${ageCards}
      </div>
      ${audienceSection}
    `;
        renderAudienceChunks({ listId: "demographicsAudienceList", metaId: "demographicsAudienceMeta" });
        return;
    }
    const chartSource = contentType === "promotions"
        ? state.promoCharts
        : contentType === "tours"
            ? state.tourCharts
            : state.charts;
    let entries = [];
    let size = CHART_SIZES.global;
    let baseScopeKey = "global";
    if (activeChart === "global") {
        entries = chartSource?.global || [];
        size = CHART_SIZES.global;
        baseScopeKey = "global";
    }
    else if (NATIONS.includes(activeChart)) {
        entries = chartSource?.nations?.[activeChart] || [];
        size = CHART_SIZES.nation;
        baseScopeKey = `nation:${activeChart}`;
    }
    else {
        entries = chartSource?.regions?.[activeChart] || [];
        size = CHART_SIZES.region;
        baseScopeKey = `region:${activeChart}`;
    }
    const scopeKey = contentType === "promotions"
        ? `promo:${baseScopeKey}`
        : contentType === "tours"
            ? `tour:${baseScopeKey}`
            : baseScopeKey;
    const scopeLabel = chartScopeLabel(activeChart);
    const historyWeek = state.ui.chartHistoryWeek;
    const historySnapshot = state.ui.chartHistorySnapshot;
    let historyMissing = false;
    if (historyWeek) {
        if (historySnapshot && historySnapshot.week === historyWeek && historySnapshot.scope === scopeKey) {
            entries = historySnapshot.entries || [];
        }
        else {
            entries = [];
            historyMissing = true;
        }
    }
    entries = Array.isArray(entries) ? entries : [];
    const displayEntries = contentType === "projects" ? collectProjectChartEntries(entries) : entries;
    const weekLabel = formatWeekRangeLabel(historyWeek || (weekIndex() + 1));
    if ($("chartWeekRange"))
        $("chartWeekRange").textContent = weekLabel;
    if ($("chartHistoryNotice")) {
        if (historyWeek && historyMissing) {
            $("chartHistoryNotice").textContent = "History view: no snapshot available for this week.";
        }
        else if (historyWeek) {
            $("chartHistoryNotice").textContent = `History view: ${weekLabel}`;
        }
        else {
            $("chartHistoryNotice").textContent = "";
        }
    }
    const meta = $("chartMeta");
    if (meta) {
        if (contentType === "tracks" || contentType === "projects") {
            const weights = chartWeightsForScope(activeChart);
            const pct = (value) => Math.round(value * 100);
            const contentLabel = contentType === "projects" ? "Project" : "Track";
            meta.textContent = `Top ${size} | ${scopeLabel} | ${contentLabel} charts | Weights S ${pct(weights.sales)}% / Stream ${pct(weights.streaming)}% / Air ${pct(weights.airplay)}% / Social ${pct(weights.social)}%`;
        }
        else if (contentType === "promotions") {
            meta.textContent = `Top ${size} | ${scopeLabel} | Promotions chart | Metrics Likes / Views / Comments / Concurrent`;
        }
        else {
            meta.textContent = `Top ${size} | ${scopeLabel} | Touring chart | Metric Attendance draw`;
        }
    }
    const globalLocked = contentType === "tracks" && activeChart === "global" && displayEntries.length < size;
    if (historyMissing) {
        $("chartList").innerHTML = `<div class="muted">No saved chart history for this week and scope.</div>`;
    }
    else if (globalLocked) {
        const remaining = Math.max(0, size - displayEntries.length);
        $("chartList").innerHTML = `<div class="muted">Global chart unlocks when ${formatCount(size)} tracks are in circulation. ${formatCount(remaining)} more needed.</div>`;
    }
    else if (!displayEntries.length) {
        $("chartList").innerHTML = `<div class="muted">No chart data yet.</div>`;
    }
    else {
        let rows = [];
        if (contentType === "projects") {
            rows = displayEntries.map((entry) => {
                const labelTag = renderLabelTag(entry.label, entry.country || "Annglora");
                const alignTag = renderAlignmentTag(entry.alignment);
                const metrics = entry.metrics || {};
                const trackCount = entry.trackCount || 0;
                const genreLine = entry.primaryTrack
                    ? renderTrackGenrePills(entry.primaryTrack, { fallback: "Genre -" })
                    : "Genre -";
                return `
          <tr>
            <td class="chart-rank">#${entry.rank}</td>
            <td class="chart-title">
              <div class="item-title">${renderProjectName(entry.projectName)}</div>
              <div class="muted">${entry.projectType} | ${formatCount(trackCount)} track${trackCount === 1 ? "" : "s"}</div>
            </td>
            <td class="chart-label">${labelTag}</td>
            <td class="chart-act">
              <div>${renderActName(entry) || "-"}</div>
              <div class="muted">${genreLine}</div>
            </td>
            <td class="chart-align">${alignTag}</td>
            <td class="chart-metrics">
              <div class="muted">Charting tracks ${formatCount(trackCount)}</div>
              <div class="muted">Sales ${formatCount(metrics.sales || 0)} | Stream ${formatCount(metrics.streaming || 0)}</div>
              <div class="muted">Air ${formatCount(metrics.airplay || 0)} | Social ${formatCount(metrics.social || 0)}</div>
            </td>
            <td class="chart-score">${formatCount(entry.score || 0)}</td>
          </tr>
        `;
            });
        }
        else if (contentType === "promotions") {
            rows = displayEntries.map((entry) => {
                const labelTag = renderLabelTag(entry.label, entry.country || "Annglora");
                const alignTag = renderAlignmentTag(entry.alignment);
                const actLabel = renderActName(entry) || "-";
                const trackTitle = entry.trackTitle || entry.title || "";
                const targetType = entry.targetType
                    || (trackTitle ? "track" : entry.projectName ? "project" : "act");
                const targetLine = targetType === "track"
                    ? `Track: ${trackTitle}`
                    : targetType === "project"
                        ? `Project: ${renderProjectName(entry.projectName || "")}`
                        : "Act push";
                const projectLine = entry.projectName
                    ? renderProjectName(entry.projectName)
                    : (targetType === "track" ? "Single" : "Act visibility");
                const lastRank = entry.lastRank ? `LW ${entry.lastRank}` : "LW --";
                const peak = entry.peak ? `Peak ${entry.peak}` : "Peak --";
                const woc = entry.woc ? `WOC ${entry.woc}` : "WOC 0";
                const metrics = entry.metrics || {};
                const primaryLabel = metrics.primaryLabel || "Engagement";
                const primaryValue = Number(metrics.primary || 0);
                return `
          <tr>
            <td class="chart-rank">#${entry.rank}</td>
            <td class="chart-title">
              <div class="item-title">${entry.promoLabel || "Promo push"}</div>
              <div class="muted">${targetLine}</div>
            </td>
            <td class="chart-label">${labelTag}</td>
            <td class="chart-act">
              <div>${actLabel}</div>
              <div class="muted">${projectLine}</div>
            </td>
            <td class="chart-align">${alignTag}</td>
            <td class="chart-metrics">
              <div class="muted">${lastRank} | ${peak} | ${woc}</div>
              <div class="muted">${primaryLabel} ${formatCount(primaryValue)}</div>
              <div class="muted">Likes ${formatCount(metrics.likes || 0)} | Views ${formatCount(metrics.views || 0)} | Comments ${formatCount(metrics.comments || 0)} | Concurrent ${formatCount(metrics.concurrent || 0)}</div>
            </td>
            <td class="chart-score">${formatCount(entry.score || 0)}</td>
          </tr>
        `;
            });
        }
        else if (contentType === "tours") {
            rows = displayEntries.map((entry) => {
                const labelTag = renderLabelTag(entry.label, entry.country || "Annglora");
                const alignTag = renderAlignmentTag(entry.alignment);
                const dateCount = Number.isFinite(entry.dateCount) ? entry.dateCount : (entry.trackCount || 0);
                const primaryTrack = entry.primaryTrack || {
                    title: entry.primaryTrackTitle || entry.title || "-",
                    theme: entry.primaryTrackTheme || entry.theme || "",
                    mood: entry.primaryTrackMood || entry.mood || "",
                    genre: entry.primaryTrackGenre || entry.genre || ""
                };
                const genreLine = renderTrackGenrePills(primaryTrack, { fallback: "Genre -" });
                const lastRank = entry.lastRank ? `LW ${entry.lastRank}` : "LW --";
                const peak = entry.peak ? `Peak ${entry.peak}` : "Peak --";
                const woc = entry.woc ? `WOC ${entry.woc}` : "WOC 0";
                const metrics = entry.metrics || {};
                const grossTicket = formatMoney(metrics.grossTicket || 0);
                const merch = formatMoney(metrics.merch || 0);
                const sponsorship = formatMoney(metrics.sponsorship || 0);
                const revenue = formatMoney(metrics.revenue || 0);
                const costs = formatMoney(metrics.costs || 0);
                const profit = formatMoney(metrics.profit || 0);
                return `
          <tr>
            <td class="chart-rank">#${entry.rank}</td>
            <td class="chart-title">
              <div class="item-title">${renderActName(entry) || "-"}</div>
              <div class="muted">Tour dates ${formatCount(dateCount)}</div>
            </td>
            <td class="chart-label">${labelTag}</td>
            <td class="chart-act">
              <div>${primaryTrack?.title ? renderTrackTitle(primaryTrack.title) : "-"}</div>
              <div class="muted">${genreLine}</div>
            </td>
            <td class="chart-align">${alignTag}</td>
            <td class="chart-metrics">
              <div class="muted">${lastRank} | ${peak} | ${woc}</div>
              <div class="muted">Attendance ${formatCount(metrics.attendance || 0)}</div>
              <div class="muted">Ticket ${grossTicket} | Merch ${merch} | Sponsor ${sponsorship}</div>
              <div class="muted">Revenue ${revenue} | Costs ${costs} | Profit ${profit}</div>
            </td>
            <td class="chart-score">${formatCount(entry.score || 0)}</td>
          </tr>
        `;
            });
        }
        else {
            rows = displayEntries.map((entry) => {
                const track = entry.track || entry;
                const labelTag = renderLabelTag(track.label, track.country || "Annglora");
                const alignTag = renderAlignmentTag(track.alignment);
                const projectName = track.projectName || "-";
                const actLabel = renderActName(track) || "-";
                const lastRank = entry.lastRank ? `LW ${entry.lastRank}` : "LW --";
                const peak = entry.peak ? `Peak ${entry.peak}` : "Peak --";
                const woc = entry.woc ? `WOC ${entry.woc}` : "WOC 0";
                const metrics = entry.metrics || {};
                return `
          <tr>
            <td class="chart-rank">#${entry.rank}</td>
            <td class="chart-title">
              <div class="item-title">${renderTrackTitle(track.title)}</div>
              <div class="muted">${renderTrackGenrePills(track, { fallback: "Genre -" })}</div>
            </td>
            <td class="chart-label">${labelTag}</td>
            <td class="chart-act">
              <div>${actLabel}</div>
              <div class="muted">${renderProjectName(projectName)}</div>
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
        }
        if (displayEntries.length < size) {
            for (let i = displayEntries.length + 1; i <= size; i += 1) {
                let statsMarkup = `
          <div class="muted">LW -- | Peak -- | WOC 0</div>
          <div class="muted">Sales N/A | Stream N/A</div>
          <div class="muted">Air N/A | Social N/A</div>
        `;
                if (contentType === "projects") {
                    statsMarkup = `
            <div class="muted">Charting tracks N/A</div>
            <div class="muted">Sales N/A | Stream N/A</div>
            <div class="muted">Air N/A | Social N/A</div>
          `;
                }
                else if (contentType === "promotions") {
                    statsMarkup = `
            <div class="muted">LW -- | Peak -- | WOC 0</div>
            <div class="muted">Engagement N/A</div>
            <div class="muted">Likes N/A | Views N/A | Comments N/A | Concurrent N/A</div>
          `;
                }
                else if (contentType === "tours") {
                    statsMarkup = `
            <div class="muted">LW -- | Peak -- | WOC 0</div>
            <div class="muted">Attendance N/A</div>
            <div class="muted">Ticket N/A | Merch N/A | Sponsor N/A</div>
            <div class="muted">Revenue N/A | Costs N/A | Profit N/A</div>
          `;
                }
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
              ${statsMarkup}
            </td>
            <td class="chart-score">N/A</td>
          </tr>
        `);
            }
        }
        const rowMarkup = rows.join("");
        const contentHeader = contentType === "projects"
            ? "Project"
            : contentType === "promotions"
                ? "Promotion"
                : contentType === "tours"
                    ? "Tour"
                    : "Track";
        const actHeader = contentType === "projects"
            ? "Act / Genre"
            : contentType === "promotions"
                ? "Act / Target"
                : contentType === "tours"
                    ? "Top Track / Genre"
                    : "Act / Project";
        $("chartList").innerHTML = `
      <div class="chart-table-wrap">
        <table class="chart-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>${contentHeader}</th>
              <th>Label</th>
              <th>${actHeader}</th>
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
}
function formatAchievementWins(value, target) {
    const wins = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
    const goal = Number.isFinite(target) ? Math.max(1, Math.round(target)) : 1;
    if (wins >= goal && wins > 0) {
        return wins > 1 ? `WON x${formatCount(wins)}` : "WON";
    }
    return `Wins ${formatCount(wins)} / ${formatCount(goal)}`;
}
function renderAchievements() {
    const listEl = $("achievementList");
    const summaryEl = $("achievementSummary");
    if (!listEl)
        return;
    const unlocked = new Set(state.meta.achievementsUnlocked || []);
    listEl.innerHTML = ACHIEVEMENTS.map((achievement) => {
        const done = unlocked.has(achievement.id);
        const badgeClass = done ? "badge" : "badge warn";
        let progressText = "";
        if (typeof achievement.progress === "function" && typeof achievement.target !== "undefined") {
            const value = achievement.progress();
            progressText = formatAchievementWins(value, achievement.target);
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
        const notes = [];
        if (state.meta.bailoutUsed)
            notes.push("Bailout used: win flagged for leaderboards.");
        if (state.meta.cheaterMode)
            notes.push("Cheater mode active: achievements paused.");
        const noteText = notes.join(" ");
        summaryEl.textContent = `CEO Requests ${count} / ${ACHIEVEMENT_TARGET}${noteText ? ` | ${noteText}` : ""}`;
    }
}
function renderRivalAchievementRace() {
    const listEl = $("rivalAchievementList");
    if (!listEl)
        return;
    const rivals = Array.isArray(state.rivals) ? state.rivals.slice() : [];
    const entries = [];
    if (state.label?.name)
        entries.push({ name: state.label.name, isPlayer: true, rival: null });
    rivals.forEach((rival) => {
        if (rival?.name)
            entries.push({ name: rival.name, isPlayer: false, rival });
    });
    if (!entries.length) {
        listEl.innerHTML = `<div class="muted">No label progress yet.</div>`;
        return;
    }
    const labelMap = new Map(ACHIEVEMENTS.map((entry) => [entry.id, entry.label]));
    const ranked = entries.map((entry) => {
        const progress = buildLabelAchievementProgress(entry.name);
        return { entry, progress };
    }).sort((a, b) => b.progress.total - a.progress.total || String(a.entry.name).localeCompare(String(b.entry.name)));
    listEl.innerHTML = ranked.map(({ entry, progress }) => {
        const focusId = entry.rival?.achievementFocus || null;
        const focusLabel = focusId ? labelMap.get(focusId) || "Unknown Request" : "None";
        const focusText = focusId ? `${focusId} ${focusLabel}` : "No focus set";
        const summaryLine = entry.isPlayer ? "Player label" : `Focus ${focusText}`;
        const totalPct = ACHIEVEMENT_TARGET > 0 ? Math.round((progress.total / ACHIEVEMENT_TARGET) * 100) : 0;
        const requestMarkup = progress.entries.map((request) => {
            const done = request.wins >= request.target;
            const badgeClass = done ? "badge" : "badge warn";
            const badgeText = done
                ? formatAchievementWins(request.wins, request.target)
                : `${formatCount(request.wins)} / ${formatCount(request.target)}`;
            const percent = Math.round(request.ratio * 100);
            return `
        <div class="rival-achievement-detail">
          <div class="list-row">
            <div>
              <div class="item-title">${request.id} ${request.label}</div>
              <div class="muted">${request.desc}</div>
            </div>
            <div class="${badgeClass}">${badgeText}</div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percent}%"></div>
          </div>
          <div class="tiny muted">${formatAchievementWins(request.wins, request.target)}</div>
        </div>
      `;
        }).join("");
        return `
      <details class="rival-achievement-card">
        <summary class="rival-achievement-summary">
          <div class="list-row">
            <div>
              <div class="item-title">${entry.name}${entry.isPlayer ? " <span class=\"pill\">You</span>" : ""}</div>
              <div class="muted">${summaryLine}</div>
            </div>
            <div class="badge">${progress.total} / ${ACHIEVEMENT_TARGET}</div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${totalPct}%"></div>
          </div>
          <div class="tiny muted">${totalPct}% complete</div>
        </summary>
        <div class="rival-achievement-details">
          ${requestMarkup}
        </div>
      </details>
    `;
    }).join("");
}
function renderQuests() {
    renderAchievements();
    const questList = $("questList");
    const summaryEl = $("questSummary");
    if (!questList)
        return;
    if (state.meta.cheaterMode) {
        if (summaryEl)
            summaryEl.textContent = "Cheater mode active: tasks are paused.";
        questList.innerHTML = `<div class="muted">Cheater mode active. Tasks are disabled.</div>`;
        return;
    }
    if (!state.quests.length) {
        if (summaryEl)
            summaryEl.textContent = "No active tasks.";
        questList.innerHTML = `<div class="muted">No active tasks.</div>`;
        return;
    }
    const completed = state.quests.filter((quest) => quest.done).length;
    const activeCount = state.quests.length - completed;
    if (summaryEl)
        summaryEl.textContent = `${formatCount(activeCount)} active | ${formatCount(completed)} complete`;
    const list = state.quests.map((quest) => {
        let detail = "";
        if (quest.type === "releaseCount")
            detail = `${quest.progress}/${quest.target} released`;
        if (quest.type === "trendRelease")
            detail = `${quest.progress}/${quest.target} released`;
        if (quest.type === "countryTop")
            detail = quest.bestRank ? `Best rank #${quest.bestRank}` : "No chart entries";
        if (quest.type === "chartTop")
            detail = quest.bestRank ? `Best rank #${quest.bestRank}` : "No chart entries";
        if (quest.type === "projectRelease") {
            detail = `${quest.progress}/${quest.target} ${quest.projectType} project${quest.target === 1 ? "" : "s"}`;
        }
        if (quest.type === "promoRuns")
            detail = `${quest.progress}/${quest.target} promos launched`;
        if (quest.type === "tourBookings")
            detail = `${quest.progress}/${quest.target} dates booked`;
        if (quest.type === "awardNominations")
            detail = `${quest.progress}/${quest.target} nominations`;
        if (quest.type === "awardWins")
            detail = `${quest.progress}/${quest.target} wins`;
        if (quest.type === "cash")
            detail = `${formatMoney(quest.progress)} / ${formatMoney(quest.target)}`;
        const badgeClass = quest.done ? "badge" : "badge warn";
        const expReward = Math.round(quest.expReward ?? (quest.reward / 8));
        const focusRequests = Array.isArray(quest.focusRequests) ? quest.focusRequests.filter(Boolean) : [];
        const focusLine = focusRequests.length ? `Supports CEO Requests: ${focusRequests.join(", ")}` : "";
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${quest.id}</div>
            <div class="muted">${quest.text}</div>
            <div class="muted">${quest.story}</div>
            ${focusLine ? `<div class="tiny muted">${focusLine}</div>` : ""}
          </div>
          <div class="${badgeClass}">${quest.done ? "Done" : "Active"}</div>
        </div>
        <div class="muted">${detail} | Reward ${formatMoney(quest.reward)} + ${formatCount(expReward)} EXP</div>
      </div>
    `;
    });
    questList.innerHTML = list.join("");
}
function renderSocialFeed() {
    const listEl = $("socialFeed");
    if (!listEl)
        return;
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
        if (!value)
            return "";
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
    if (toggle)
        toggle.checked = Boolean(showInternal);
    document.querySelectorAll("[data-social-filter]").forEach((input) => {
        const key = input.dataset.socialFilter;
        if (!key)
            return;
        input.checked = filters[key] !== false;
    });
}
function renderEventLog() {
    renderSocialFeed();
    renderSystemLog();
}
function renderSystemLog() {
    const target = $("eventLogList");
    if (!target)
        return;
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
        const totalQuarters = data?.time?.totalQuarters;
        const hours = Number.isFinite(totalQuarters)
            ? Math.floor(totalQuarters / QUARTERS_PER_HOUR)
            : data?.time?.totalHours || 0;
        const week = Math.floor(hours / WEEK_HOURS) + 1;
        const cash = data?.label?.cash ?? 0;
        const mode = getSlotGameMode(data);
        const modeLabel = mode ? shortGameModeLabel(mode.label) : "";
        const modeTag = mode && modeLabel
            ? `<span class="pill mode-pill" data-mode="${mode.id}" title="${mode.label}">${modeLabel}</span>`
            : "";
        const metaLine = data
            ? `${modeTag ? `${modeTag} ` : ""}${formatWeekRangeLabel(week)} | ${formatMoney(cash)} | ${savedAt}`
            : "Create a new label in this game slot.";
        list.push(`
      <div class="slot-card" data-slot-index="${i}" data-slot-has-data="${hasData ? "1" : "0"}" data-slot-default="${hasData ? "continue" : "new"}">
        <div class="slot-row">
          <div>
            <div class="item-title">Game Slot ${i}: ${data ? labelName : "Empty"}</div>
            <div class="muted">${metaLine}</div>
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
        autoSaveMinutes.value = String(state.meta.autoSave.minutes || 2);
        autoSaveToggle.checked = Boolean(state.meta.autoSave.enabled);
        const disabled = !session.activeSlot;
        autoSaveMinutes.disabled = disabled;
        autoSaveToggle.disabled = disabled;
    }
    const cheaterToggle = $("cheaterModeToggle");
    if (cheaterToggle) {
        cheaterToggle.checked = Boolean(state.meta.cheaterMode);
        cheaterToggle.disabled = !session.activeSlot;
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
function updateGenrePreview() {
    const themeSelect = $("themeSelect");
    const moodSelect = $("moodSelect");
    if (!themeSelect || !moodSelect)
        return;
    const theme = themeSelect.value;
    const mood = moodSelect.value;
    const preview = $("genrePreview");
    const alignmentSelect = $("trackAlignment");
    const alignment = alignmentSelect ? alignmentSelect.value : (state.label?.alignment || "");
    if (!preview)
        return;
    if (!theme || !mood) {
        preview.textContent = "Planned Genre: -";
        return;
    }
    preview.innerHTML = `Planned Genre: ${renderGenrePills(theme, mood, { alignment })}`;
}
function stageLabelFromId(stageId) {
    if (stageId === "demo")
        return "Demo Recording";
    if (stageId === "master")
        return "Master Recording";
    return "Sheet Music";
}
function stageIndexFromId(stageId) {
    if (stageId === "demo")
        return 1;
    if (stageId === "master")
        return 2;
    return 0;
}
function renderActiveStudiosSelect(stageId, selectId, metaId) {
    const stageKey = stageId || "sheet";
    const select = $(selectId);
    if (!select)
        return;
    const stageIndex = stageIndexFromId(stageKey);
    const stageLabel = stageLabelFromId(stageKey);
    const labelEl = select.closest(".field")?.querySelector("label");
    if (labelEl)
        labelEl.textContent = `Active Studios (${stageLabel})`;
    const active = state.workOrders
        .filter((order) => order.status === "In Progress" && order.stageIndex === stageIndex)
        .map((order) => {
        const track = getTrack(order.trackId);
        const crewIds = getWorkOrderCreatorIds(order);
        const crew = crewIds.map((id) => getCreator(id)).filter(Boolean);
        const lead = crew[0] || null;
        const stageName = STAGES[order.stageIndex]?.name || stageLabel;
        const crewLabel = buildWorkOrderCrewLabel(crew);
        const crewText = lead
            ? `${crewLabel.primary}${crewLabel.secondary ? ` ${crewLabel.secondary}` : ""}`
            : null;
        return {
            slot: Number.isFinite(order.studioSlot) ? order.studioSlot : null,
            trackTitle: track ? track.title : "Unknown Track",
            creatorName: crewText,
            stageName
        };
    })
        .sort((a, b) => (a.slot || 0) - (b.slot || 0));
    if (!active.length) {
        select.innerHTML = `<option value="">No active studios</option>`;
        select.disabled = true;
    }
    else {
        select.innerHTML = active
            .map((entry, index) => {
            const slotLabel = entry.slot ? `Studio ${entry.slot}` : `Studio ${index + 1}`;
            const creatorLabel = entry.creatorName ? ` | ${entry.creatorName}` : "";
            return `<option value="${entry.slot || index + 1}">${slotLabel} | ${entry.trackTitle}${creatorLabel}</option>`;
        })
            .join("");
        select.disabled = false;
    }
    const meta = $(metaId);
    if (meta) {
        const counts = getStudioUsageCounts();
        const ownedSlots = getOwnedStudioSlots();
        const totalSlots = ownedSlots + counts.leased;
        meta.textContent = `Active ${active.length}/${STAGE_STUDIO_LIMIT} | Global ${counts.total}/${totalSlots}`;
    }
}
function renderCreateStageTrackSelect() {
    const renderStageSelect = (stageId, selectId, metaId) => {
        const select = $(selectId);
        if (!select)
            return;
        const meta = $(metaId);
        const isDemo = stageId === "demo";
        const status = isDemo ? "Awaiting Demo" : "Awaiting Master";
        const tracks = state.tracks.filter((track) => track.status === status);
        if (!tracks.length) {
            select.innerHTML = `<option value="">No tracks awaiting ${isDemo ? "demo recording" : "mastering"}.</option>`;
            select.disabled = true;
            if (state.ui.createTrackIds)
                state.ui.createTrackIds[stageId] = null;
            if (state.ui.createStage === stageId)
                state.ui.createTrackId = null;
            if (meta)
                meta.textContent = `Awaiting ${isDemo ? "demo recordings" : "mastering"}: 0`;
            return;
        }
        select.innerHTML = tracks
            .map((track) => `<option value="${track.id}">${track.title}</option>`)
            .join("");
        const stored = state.ui.createTrackIds ? state.ui.createTrackIds[stageId] : null;
        const preferred = tracks.some((track) => track.id === stored)
            ? stored
            : tracks[0].id;
        if (state.ui.createTrackIds)
            state.ui.createTrackIds[stageId] = preferred;
        if (state.ui.createStage === stageId)
            state.ui.createTrackId = preferred;
        select.value = preferred;
        select.disabled = false;
        if (meta)
            meta.textContent = `Awaiting ${isDemo ? "demo recordings" : "mastering"}: ${tracks.length}`;
    };
    renderStageSelect("demo", "demoTrackSelect", "demoTrackMeta");
    renderStageSelect("master", "masterTrackSelect", "masterTrackMeta");
}
function getSheetStartPlan({ mode, theme, modifierId, cash } = {}) {
    const resolvedMode = mode || state.ui.recommendAllMode || "solo";
    const resolvedTheme = typeof theme === "string"
        ? theme
        : ($("themeSelect") ? $("themeSelect").value : "");
    const resolvedModifierId = typeof modifierId === "string"
        ? modifierId
        : ($("modifierSelect") ? $("modifierSelect").value : "None");
    const modifier = getModifier(resolvedModifierId);
    const assignedSongwriters = [...new Set(getTrackRoleIdsFromSlots("Songwriter"))];
    const req = staminaRequirement("Songwriter");
    const eligibleSongwriters = assignedSongwriters.filter((id) => {
        const creator = getCreator(id);
        return creator && creator.stamina >= req;
    });
    const cashOnHand = Number.isFinite(cash) ? cash : state.label.cash;
    const studioSlotsAvailable = getStudioAvailableSlots();
    const sheetStageSlots = getStageStudioAvailable(0);
    const capacityLimit = Math.min(studioSlotsAvailable, sheetStageSlots);
    const themeReady = !!resolvedTheme;
    if (resolvedMode === "collab") {
        const sheetCrew = assignedSongwriters;
        const sheetCost = sheetCrew.length ? getStageCost(0, modifier, sheetCrew) : 0;
        const canStart = themeReady
            && sheetCrew.length > 0
            && cashOnHand >= sheetCost
            && capacityLimit > 0;
        return {
            mode: resolvedMode,
            themeReady,
            modifier,
            assignedSongwriters,
            eligibleSongwriters,
            startableSongwriters: canStart ? sheetCrew : [],
            startableCount: canStart ? 1 : 0,
            sheetCost,
            capacityLimit,
            studioSlotsAvailable,
            sheetStageSlots,
            stoppedByCash: themeReady && sheetCrew.length > 0 && cashOnHand < sheetCost,
            stoppedByCapacity: themeReady && sheetCrew.length > 0 && capacityLimit <= 0,
            staminaRequirement: req
        };
    }
    if (!themeReady) {
        let previewCash = cashOnHand;
        let previewCapacity = capacityLimit;
        let sheetCost = 0;
        for (let i = 0; i < eligibleSongwriters.length; i += 1) {
            if (previewCapacity <= 0)
                break;
            const songwriterId = eligibleSongwriters[i];
            const stageCost = getStageCost(0, modifier, [songwriterId]);
            if (previewCash < stageCost)
                break;
            previewCash -= stageCost;
            previewCapacity -= 1;
            sheetCost += stageCost;
        }
        return {
            mode: resolvedMode,
            themeReady,
            modifier,
            assignedSongwriters,
            eligibleSongwriters,
            startableSongwriters: [],
            startableCount: 0,
            sheetCost,
            capacityLimit,
            studioSlotsAvailable,
            sheetStageSlots,
            stoppedByCash: false,
            stoppedByCapacity: false,
            staminaRequirement: req
        };
    }
    let remainingCash = cashOnHand;
    let remainingCapacity = capacityLimit;
    let stoppedByCash = false;
    let stoppedByCapacity = false;
    const startableSongwriters = [];
    let sheetCost = 0;
    for (let i = 0; i < eligibleSongwriters.length; i += 1) {
        if (remainingCapacity <= 0) {
            stoppedByCapacity = true;
            break;
        }
        const songwriterId = eligibleSongwriters[i];
        const stageCost = getStageCost(0, modifier, [songwriterId]);
        if (remainingCash < stageCost) {
            stoppedByCash = true;
            break;
        }
        startableSongwriters.push(songwriterId);
        remainingCash -= stageCost;
        remainingCapacity -= 1;
        sheetCost += stageCost;
    }
    return {
        mode: resolvedMode,
        themeReady,
        modifier,
        assignedSongwriters,
        eligibleSongwriters,
        startableSongwriters,
        startableCount: startableSongwriters.length,
        sheetCost,
        capacityLimit,
        studioSlotsAvailable,
        sheetStageSlots,
        stoppedByCash,
        stoppedByCapacity,
        staminaRequirement: req
    };
}
function getCreateStageAvailability() {
    const theme = $("themeSelect") ? $("themeSelect").value : "";
    const modifierId = $("modifierSelect") ? $("modifierSelect").value : "None";
    const sheetPlan = getSheetStartPlan({ theme, modifierId });
    const sheetReadyCount = sheetPlan.startableCount;
    const studioSlotsAvailable = sheetPlan.studioSlotsAvailable;
    const sheetStageSlots = sheetPlan.sheetStageSlots;
    const sheetCanStart = sheetPlan.startableCount > 0;
    const sheetReason = (() => {
        if (!sheetPlan.themeReady)
            return "Select a Theme to create sheet music.";
        if (!sheetPlan.assignedSongwriters.length)
            return "Assign a Songwriter ID to create sheet music.";
        if (sheetPlan.mode === "solo" && sheetPlan.assignedSongwriters.length && !sheetPlan.eligibleSongwriters.length) {
            return `No available Songwriter creators with ${sheetPlan.staminaRequirement} stamina.`;
        }
        if (sheetStageSlots <= 0)
            return "No studio slots available for sheet music. Wait for a studio to free up.";
        if (studioSlotsAvailable <= 0)
            return "No studio slots available. Finish a production or expand capacity first.";
        if (sheetPlan.stoppedByCash && !sheetPlan.startableCount)
            return "Not enough cash to create sheet music.";
        return "";
    })();
    const demoTracks = state.tracks.filter((track) => track.status === "Awaiting Demo");
    const masterTracks = state.tracks.filter((track) => track.status === "Awaiting Master");
    const demoCount = demoTracks.length;
    const masterCount = masterTracks.length;
    const demoTrackId = (state.ui.createTrackIds ? state.ui.createTrackIds.demo : null)
        || $("demoTrackSelect")?.value
        || null;
    const demoTrack = demoTrackId ? getTrack(demoTrackId) : null;
    const mood = $("moodSelect") ? $("moodSelect").value : "";
    const moodValid = !!mood && (!Array.isArray(MOODS) || MOODS.includes(mood));
    const demoPerformers = getTrackRoleIdsFromSlots("Performer");
    const demoAssigned = demoPerformers.length
        ? normalizeRoleIds(demoPerformers, "Performer")
        : getTrackRoleIds(demoTrack, "Performer");
    const demoCost = demoAssigned.length ? getStageCost(1, demoTrack?.modifier, demoAssigned) : 0;
    const demoReady = demoTrack && demoTrack.status === "Awaiting Demo" && demoTrack.stageIndex === 1;
    const demoStageSlots = getStageStudioAvailable(1);
    const demoCanStart = !!demoReady
        && moodValid
        && demoAssigned.length > 0
        && state.label.cash >= demoCost
        && studioSlotsAvailable > 0
        && demoStageSlots > 0;
    const demoReason = (() => {
        if (!demoCount)
            return "No tracks awaiting demo recording.";
        if (!demoTrackId)
            return "Select a track awaiting demo recording.";
        if (!demoTrack)
            return "Track not found for demo recording.";
        if (!demoReady)
            return "Track is not ready for demo recording.";
        if (!mood)
            return "Select a Mood to create the demo recording.";
        if (!moodValid)
            return "Select a valid Mood to create the demo recording.";
        if (!demoAssigned.length)
            return "Assign a Recorder ID to create the demo recording.";
        if (studioSlotsAvailable <= 0)
            return "No studio slots available. Finish a production or expand capacity first.";
        if (demoStageSlots <= 0)
            return "No studio slots available for demo recording. Wait for a studio to free up.";
        if (state.label.cash < demoCost)
            return "Not enough cash to create the demo recording.";
        return "";
    })();
    const masterTrackId = (state.ui.createTrackIds ? state.ui.createTrackIds.master : null)
        || $("masterTrackSelect")?.value
        || null;
    const masterTrack = masterTrackId ? getTrack(masterTrackId) : null;
    const alignmentInput = $("trackAlignment") ? $("trackAlignment").value : "";
    const resolvedAlignment = alignmentInput || masterTrack?.alignment || state.label.alignment || "";
    const alignmentValid = !!resolvedAlignment && (!Array.isArray(ALIGNMENTS) || ALIGNMENTS.includes(resolvedAlignment));
    const masterProducers = getTrackRoleIdsFromSlots("Producer");
    const masterAssigned = masterProducers.length
        ? normalizeRoleIds(masterProducers, "Producer")
        : getTrackRoleIds(masterTrack, "Producer");
    const masterCost = masterAssigned.length ? getStageCost(2, masterTrack?.modifier, masterAssigned) : 0;
    const masterReady = masterTrack
        && masterTrack.status === "Awaiting Master"
        && masterTrack.stageIndex === 2
        && !!masterTrack.mood;
    const masterStageSlots = getStageStudioAvailable(2);
    const masterCanStart = !!masterReady
        && alignmentValid
        && masterAssigned.length > 0
        && state.label.cash >= masterCost
        && studioSlotsAvailable > 0
        && masterStageSlots > 0;
    const masterReason = (() => {
        if (!masterCount)
            return "No tracks awaiting mastering.";
        if (!masterTrackId)
            return "Select a track awaiting mastering.";
        if (!masterTrack)
            return "Track not found for mastering.";
        if (!masterTrack.status || masterTrack.status !== "Awaiting Master" || masterTrack.stageIndex !== 2) {
            return "Track is not ready for mastering.";
        }
        if (!masterTrack.mood)
            return "Demo recording must assign a Mood before mastering.";
        if (!masterAssigned.length)
            return "Assign a Producer ID to create the master recording.";
        if (!resolvedAlignment)
            return "Select a Content Alignment before mastering.";
        if (!alignmentValid)
            return "Select a valid Content Alignment before mastering.";
        if (studioSlotsAvailable <= 0)
            return "No studio slots available. Finish a production or expand capacity first.";
        if (masterStageSlots <= 0)
            return "No studio slots available for mastering. Wait for a studio to free up.";
        if (state.label.cash < masterCost)
            return "Not enough cash to create the master recording.";
        return "";
    })();
    return {
        sheetReadyCount,
        demoCount,
        masterCount,
        sheetCanStart,
        demoCanStart,
        masterCanStart,
        sheetCost: Number.isFinite(sheetPlan.sheetCost) ? sheetPlan.sheetCost : 0,
        demoCost,
        masterCost,
        sheetReason: sheetCanStart ? "" : (sheetReason || "Requirements not met."),
        demoReason: demoCanStart ? "" : (demoReason || "Requirements not met."),
        masterReason: masterCanStart ? "" : (masterReason || "Requirements not met.")
    };
}
function renderProjectTypeMeta() {
    const meta = $("projectTypeMeta");
    if (!meta)
        return;
    const projectNameInput = $("projectName");
    const rawName = projectNameInput ? projectNameInput.value.trim() : "";
    const projectType = $("projectTypeSelect") ? $("projectTypeSelect").value : "Single";
    const limits = getProjectTrackLimits(projectType);
    const typeLabel = limits.type || normalizeProjectType(projectType);
    if (!rawName) {
        meta.textContent = `${typeLabel} projects target ${limits.min}-${limits.max} tracks.`;
        return;
    }
    const normalizedName = normalizeProjectName(rawName);
    const projectTracks = state.tracks.filter((track) => {
        const trackName = track.projectName || `${track.title} - Single`;
        return normalizeProjectName(trackName) === normalizedName;
    });
    const existingTypes = Array.from(new Set(projectTracks.map((track) => normalizeProjectType(track.projectType))));
    if (existingTypes.length && !existingTypes.includes(typeLabel)) {
        meta.textContent = `${rawName} already uses ${existingTypes.join(" / ")}. Switch the Content Type or rename the project.`;
        return;
    }
    const count = projectTracks.length;
    const minRemaining = Math.max(0, limits.min - count);
    const maxRemaining = Math.max(0, limits.max - count);
    let detail = `${count}/${limits.max} tracks`;
    if (minRemaining > 0) {
        detail += ` | ${minRemaining} to minimum`;
    }
    else if (maxRemaining === 0) {
        detail += " | Maxed";
    }
    else {
        detail += ` | ${maxRemaining} slots left`;
    }
    meta.textContent = `${rawName} (${typeLabel}): ${detail}`;
}
function renderCreateStageControls() {
    const stageButtons = document.querySelectorAll("[data-create-stage]");
    if (!stageButtons.length)
        return;
    let stage = state.ui.createStage || "sheet";
    const validStages = ["sheet", "demo", "master"];
    if (!validStages.includes(stage)) {
        logEvent("Unknown creation stage selected. Reverting to Sheet Music.", "warn");
        stage = "sheet";
    }
    state.ui.createStage = stage;
    renderCreateStageTrackSelect();
    const availability = getCreateStageAvailability();
    const sheetCountEl = $("createStageCountSheet");
    if (sheetCountEl)
        sheetCountEl.textContent = `(${availability.sheetReadyCount} available)`;
    const demoCountEl = $("createStageCountDemo");
    if (demoCountEl)
        demoCountEl.textContent = `(${availability.demoCount} available)`;
    const masterCountEl = $("createStageCountMaster");
    if (masterCountEl)
        masterCountEl.textContent = `(${availability.masterCount} available)`;
    stageButtons.forEach((btn) => {
        const id = btn.dataset.createStage;
        if (!id || !validStages.includes(id))
            return;
        const isActive = id === stage;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
        const column = btn.closest(".create-stage-column");
        if (column)
            column.classList.toggle("is-active", isActive);
    });
    const desiredRole = stage === "demo"
        ? "Performer"
        : stage === "master"
            ? "Producer"
            : stage === "sheet"
                ? "Songwriter"
                : null;
    const currentRole = parseTrackRoleTarget(state.ui.slotTarget || "")?.role || null;
    if (desiredRole && currentRole !== desiredRole) {
        state.ui.slotTarget = `${TRACK_ROLE_TARGETS[desiredRole]}-1`;
    }
    if (stage === "demo" || stage === "master") {
        const tracked = state.ui.createTrackIds ? state.ui.createTrackIds[stage] : null;
        state.ui.createTrackId = tracked || null;
    }
    const sheetBtn = $("startSheetBtn");
    if (sheetBtn) {
        const sheetCostLabel = formatMoney(availability.sheetCost || 0);
        sheetBtn.textContent = `Create Sheet Music (${sheetCostLabel})`;
        sheetBtn.disabled = !availability.sheetCanStart;
        sheetBtn.title = availability.sheetCanStart ? "" : availability.sheetReason;
    }
    const sheetReason = $("startSheetReason");
    if (sheetReason) {
        sheetReason.textContent = availability.sheetReason || "";
        sheetReason.classList.toggle("hidden", !availability.sheetReason);
    }
    const demoBtn = $("startDemoBtn");
    if (demoBtn) {
        const demoCostLabel = formatMoney(availability.demoCost || 0);
        demoBtn.textContent = `Create Demo Recording (${demoCostLabel})`;
        demoBtn.disabled = !availability.demoCanStart;
        demoBtn.title = availability.demoCanStart ? "" : availability.demoReason;
    }
    const demoReason = $("startDemoReason");
    if (demoReason) {
        demoReason.textContent = availability.demoReason || "";
        demoReason.classList.toggle("hidden", !availability.demoReason);
    }
    const masterBtn = $("startMasterBtn");
    if (masterBtn) {
        const masterCostLabel = formatMoney(availability.masterCost || 0);
        masterBtn.textContent = `Create Master Recording (${masterCostLabel})`;
        masterBtn.disabled = !availability.masterCanStart;
        masterBtn.title = availability.masterCanStart ? "" : availability.masterReason;
    }
    const masterReason = $("startMasterReason");
    if (masterReason) {
        masterReason.textContent = availability.masterReason || "";
        masterReason.classList.toggle("hidden", !availability.masterReason);
    }
    const recommendSelect = $("recommendAllMode");
    if (recommendSelect)
        recommendSelect.value = state.ui.recommendAllMode || "solo";
    const recommendHelp = $("recommendAllHelp");
    if (recommendHelp) {
        recommendHelp.textContent = stage === "sheet"
            ? "Solo starts separate sheet music for each assigned songwriter. Collab fills one track with everyone."
            : "Solo/collab applies to sheet music only. Demo and master stages always run one track at a time.";
    }
    const advanced = $("createAdvancedOptions");
    if (advanced) {
        const showAdvanced = !!state.ui.createAdvancedOpen;
        advanced.classList.toggle("hidden", !showAdvanced);
    }
    renderActiveStudiosSelect("sheet", "activeStudiosSelectSheet", "activeStudiosMetaSheet");
    renderActiveStudiosSelect("demo", "activeStudiosSelectDemo", "activeStudiosMetaDemo");
    renderActiveStudiosSelect("master", "activeStudiosSelectMaster", "activeStudiosMetaMaster");
    renderProjectTypeMeta();
}
function shouldThrottleWorldRender() {
    if (state.time?.speed === "pause")
        return false;
    if (state.ui?.forceWorldRender)
        return false;
    const now = Date.now();
    return now - lastWorldRenderAt < WORLD_RENDER_THROTTLE_MS;
}
function recordWorldRender() {
    lastWorldRenderAt = Date.now();
    if (state.ui?.forceWorldRender)
        state.ui.forceWorldRender = false;
}
function renderActiveView(view) {
    const raw = view || state.ui.activeView || "dashboard";
    const active = raw === "promotion" ? "logs" : raw === "era" ? "eras" : raw;
    if (active === "dashboard") {
        renderDashboard();
    }
    else if (active === "charts") {
        renderCharts();
        renderSlots();
    }
    else if (active === "awards") {
        renderAnnualAwardsView();
    }
    else if (active === "release") {
        renderReleaseDesk();
    }
    else if (active === "create") {
        renderCreateStageControls();
        renderSlots();
        renderTracks();
        renderModifierInventory();
        renderCreateTrends();
        updateGenrePreview();
        if (typeof window !== "undefined" && typeof window.updateCreateModePanels === "function") {
            window.updateCreateModePanels();
        }
        if (typeof window !== "undefined" && typeof window.updateAutoCreateSummary === "function") {
            window.updateAutoCreateSummary();
        }
    }
    else if (active === "releases") {
        renderCalendarView();
        renderCalendarStructuresPanel();
    }
    else if (active === "eras") {
        renderEraStatus();
        renderSlots();
        renderEraPerformance();
    }
    else if (active === "roster") {
        renderCreators();
        renderActs();
        renderSlots();
    }
    else if (active === "world") {
        if (shouldThrottleWorldRender())
            return;
        recordWorldRender();
        renderMarket();
        renderModifierTools();
        renderRivalRosterPanel();
        renderPopulation();
        renderGenreIndex();
        renderEconomySummary();
        renderQuests();
        renderTopBar();
    }
    else if (active === "tour") {
        renderTouringDesk();
    }
    else if (active === "logs") {
        renderSlots();
        renderEventLog();
        renderPromoAlerts();
        renderAwardsCircuit();
        renderPromoScheduleControls();
        renderWallet();
        renderResourceTickSummary();
        renderLossArchives();
        if (typeof window !== "undefined" && typeof window.updateAutoPromoSummary === "function") {
            window.updateAutoPromoSummary();
        }
    }
}
function shouldHoldActiveViewRender() {
    const ui = state.ui;
    if (!ui?.renderHoldActive)
        return false;
    const now = Date.now();
    const holdUntil = Number.isFinite(ui.renderHoldUntil) ? ui.renderHoldUntil : 0;
    if (!holdUntil || now > holdUntil) {
        ui.renderHoldActive = false;
        ui.renderHoldUntil = 0;
        return false;
    }
    return true;
}
function renderAll({ save = true } = {}) {
    syncLabelWallets();
    renderTime();
    renderStats();
    renderNotificationsButton();
    renderTopBar();
    if (!shouldHoldActiveViewRender()) {
        renderActiveView(state.ui.activeView);
    }
    renderWallet();
    if (typeof window !== "undefined" && window.updateTimeControls) {
        window.updateTimeControls();
    }
    if (typeof window !== "undefined" && window.updateRecommendations) {
        window.updateRecommendations();
    }
    if (save)
        saveToActiveSlot();
}
export { refreshSelectOptions, updateActMemberFields, renderAutoAssignModal, renderTime, renderStats, renderSlots, renderActs, renderCreators, renderEraStatus, renderTracks, renderModifierInventory, renderReleaseDesk, renderTouringDesk, renderQuickRecipes, renderCalendarView, renderCalendarList, renderCalendarDayDetail, renderGenreIndex, renderCommunityRankings, renderStudiosList, renderRoleActions, renderTutorialEconomy, renderModifierTools, renderCharts, renderWallet, renderLossArchives, renderResourceTickSummary, renderAwardsCircuit, renderSocialFeed, renderMainMenu, renderRankingModal, renderRankingWindow, renderAll, renderActiveStudiosSelect, renderCreateStageTrackSelect, renderCreateStageControls, renderActiveView, renderMarket, renderRivalRosterPanel, renderEventLog, renderSystemLog, renderTrends, renderCommunityLabels, renderTopBar, renderPopulation, renderEconomySummary, renderActiveCampaigns, renderInventory, renderWorkOrders, renderTrackHistoryPanel, renderRolloutStrategyPlanner, renderCreateTrends, renderAchievements, renderQuests, renderActiveArea, renderCalendarEraList, renderCreatorFallbackSymbols, renderCreatorAvatar, openMainMenu, closeMainMenu, updateGenrePreview, };
//# sourceMappingURL=index.js.map