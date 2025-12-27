/// <reference lib="webworker" />
import { storeChartSnapshot } from "./db.js";
const workerScope = self;
const FALLBACK_WEIGHTS = { sales: 0.35, streaming: 0.2, airplay: 0.3, social: 0.15 };
const FALLBACK_VOLUME_MULTIPLIERS = { sales: 1, streaming: 5, airplay: 1, social: 1 };
const AUDIENCE_CHUNK = 1000;
const ALIGNMENTS = ["Safe", "Neutral", "Risky"];
const AUDIENCE_ALIGNMENT_SCORE_SCALE = 42;
const AUDIENCE_TREND_BONUS = 4;
const HOMELAND_ACT_BONUS = 4;
const HOMELAND_CREATOR_BONUS = 1;
const HOMELAND_CREATOR_BONUS_CAP = 6;
const INTERNATIONAL_RELATION_CAP = 4;
const COUNTRY_RELATION_BIAS = {
    Annglora: { Bytenza: -2, Crowlya: 2 },
    Bytenza: { Annglora: -2, Crowlya: 0 },
    Crowlya: { Annglora: 2, Bytenza: 0 }
};
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
function normalizeChartWeights(weights, fallback) {
    const safe = weights || fallback || FALLBACK_WEIGHTS;
    const total = Math.max(0, safe.sales || 0)
        + Math.max(0, safe.streaming || 0)
        + Math.max(0, safe.airplay || 0)
        + Math.max(0, safe.social || 0);
    const base = fallback || FALLBACK_WEIGHTS;
    if (!total)
        return { ...base };
    return {
        sales: Math.max(0, safe.sales || 0) / total,
        streaming: Math.max(0, safe.streaming || 0) / total,
        airplay: Math.max(0, safe.airplay || 0) / total,
        social: Math.max(0, safe.social || 0) / total
    };
}
function roundToAudienceChunk(value) {
    return Math.ceil(Math.max(0, value) / AUDIENCE_CHUNK) * AUDIENCE_CHUNK;
}
function buildChartMetrics(score, weights, fallback, volumeMultipliers) {
    const normalized = normalizeChartWeights(weights, fallback);
    const base = Math.max(0, score) * 1200;
    const multipliers = volumeMultipliers || FALLBACK_VOLUME_MULTIPLIERS;
    const salesMultiplier = Number.isFinite(multipliers.sales) ? multipliers.sales : 1;
    const streamingMultiplier = Number.isFinite(multipliers.streaming) ? multipliers.streaming : 1;
    const airplayMultiplier = Number.isFinite(multipliers.airplay) ? multipliers.airplay : 1;
    const socialMultiplier = Number.isFinite(multipliers.social) ? multipliers.social : 1;
    return {
        sales: roundToAudienceChunk(base * normalized.sales * salesMultiplier),
        streaming: roundToAudienceChunk(base * normalized.streaming * streamingMultiplier),
        airplay: roundToAudienceChunk(base * normalized.airplay * airplayMultiplier),
        social: roundToAudienceChunk(base * normalized.social * socialMultiplier)
    };
}
function resolveAudienceProfile(scopeId, profiles, audience) {
    const nationProfiles = profiles?.nations || {};
    const regionProfiles = profiles?.regions || {};
    const fallback = nationProfiles.Annglora || { alignment: "", theme: "", moods: [] };
    const base = regionProfiles[scopeId] || nationProfiles[scopeId] || fallback;
    const bias = audience?.regions?.[scopeId] || audience?.nations?.[scopeId] || null;
    if (bias) {
        return {
            alignmentWeights: bias.alignmentWeights || null,
            themes: Array.isArray(bias.themes) && bias.themes.length ? bias.themes : [base.theme],
            moods: Array.isArray(bias.moods) && bias.moods.length ? bias.moods : base.moods || [],
            trendGenres: Array.isArray(bias.trendGenres) ? bias.trendGenres : []
        };
    }
    return {
        alignment: base.alignment,
        themes: [base.theme],
        moods: base.moods || [],
        trendGenres: []
    };
}
function resolveScopeNation(scopeId, regionDefs, nations) {
    if (!scopeId || scopeId === "global")
        return null;
    if (Array.isArray(nations) && nations.includes(scopeId))
        return scopeId;
    const region = Array.isArray(regionDefs) ? regionDefs.find((entry) => entry.id === scopeId) : null;
    return region ? region.nation : null;
}
function resolveTrackOriginMeta(track) {
    if (!track)
        return { actCountry: null, creatorCountries: [], originCountries: [] };
    const creatorCountries = Array.isArray(track.creatorCountries)
        ? track.creatorCountries.filter(Boolean)
        : [];
    const actCountry = track.actCountry || null;
    const fallback = track.country || null;
    const originCountries = Array.from(new Set([actCountry, ...creatorCountries, fallback].filter(Boolean)));
    return { actCountry: actCountry || fallback, creatorCountries, originCountries };
}
function homelandBonusForScope(originMeta, scopeNation) {
    if (!originMeta || !scopeNation)
        return 0;
    let bonus = 0;
    if (originMeta.actCountry === scopeNation)
        bonus += HOMELAND_ACT_BONUS;
    const creatorMatches = originMeta.creatorCountries.filter((country) => country === scopeNation).length;
    if (creatorMatches) {
        bonus += Math.min(HOMELAND_CREATOR_BONUS_CAP, creatorMatches * HOMELAND_CREATOR_BONUS);
    }
    return bonus;
}
function internationalBiasForScope(originMeta, scopeNation) {
    if (!originMeta || !scopeNation)
        return 0;
    const foreignOrigins = originMeta.originCountries.filter((country) => country && country !== scopeNation);
    if (!foreignOrigins.length)
        return 0;
    const total = foreignOrigins.reduce((sum, country) => {
        const bias = COUNTRY_RELATION_BIAS?.[scopeNation]?.[country];
        return sum + (Number.isFinite(bias) ? bias : 0);
    }, 0);
    if (!Number.isFinite(total) || !total)
        return 0;
    return Math.max(-INTERNATIONAL_RELATION_CAP, Math.min(INTERNATIONAL_RELATION_CAP, total));
}
function scoreTrack(track, regionName, profiles, trends, audience, labelCompetition, regionDefs, nations) {
    const nationProfiles = profiles?.nations || {};
    const regionProfiles = profiles?.regions || {};
    const fallback = nationProfiles.Annglora || { alignment: "", theme: "", moods: [] };
    const region = regionProfiles[regionName] || nationProfiles[regionName] || fallback;
    const audienceProfile = resolveAudienceProfile(regionName, profiles, audience);
    let score = track.quality || 0;
    if (audienceProfile.alignmentWeights) {
        const alignment = ALIGNMENTS.includes(track.alignment) ? track.alignment : "Neutral";
        const alignmentWeight = Number(audienceProfile.alignmentWeights?.[alignment]);
        const baseline = 1 / ALIGNMENTS.length;
        const delta = Number.isFinite(alignmentWeight) ? alignmentWeight - baseline : 0;
        score += Math.round(delta * AUDIENCE_ALIGNMENT_SCORE_SCALE);
    }
    else {
        score += track.alignment === region.alignment ? 12 : -6;
    }
    if (Array.isArray(audienceProfile.themes) && audienceProfile.themes.includes(track.theme))
        score += 8;
    if (Array.isArray(audienceProfile.moods) && audienceProfile.moods.includes(track.mood))
        score += 6;
    if (Array.isArray(audienceProfile.trendGenres) && audienceProfile.trendGenres.includes(track.genre)) {
        score += AUDIENCE_TREND_BONUS;
    }
    score += Array.isArray(trends) && trends.includes(track.genre) ? 10 : 0;
    score += track.promoWeeks > 0 ? 10 : 0;
    const promoGapPenalty = Number.isFinite(track?.promoGapPenalty) ? track.promoGapPenalty : 0;
    const actStalePenalty = Number.isFinite(track?.actPromoStalePenalty) ? track.actPromoStalePenalty : 0;
    if (promoGapPenalty || actStalePenalty)
        score -= promoGapPenalty + actStalePenalty;
    const scopeNation = resolveScopeNation(regionName, regionDefs, nations);
    if (scopeNation) {
        const originMeta = resolveTrackOriginMeta(track);
        score += homelandBonusForScope(originMeta, scopeNation);
        score += internationalBiasForScope(originMeta, scopeNation);
    }
    score += rand(-4, 4);
    const competitionMultiplier = Number.isFinite(labelCompetition?.[track.label]) ? labelCompetition[track.label] : 1;
    if (competitionMultiplier !== 1)
        score = Math.round(score * competitionMultiplier);
    const boostMultiplier = Number.isFinite(track?.boostMultiplier) ? track.boostMultiplier : 1;
    if (boostMultiplier !== 1)
        score = Math.round(score * boostMultiplier);
    const decay = Math.max(0.4, 1 - (track.weeksOnChart || 0) * 0.05);
    return Math.round(score * decay);
}
function computeCharts(payload) {
    const tracks = Array.isArray(payload?.tracks) ? payload.tracks : [];
    const nations = Array.isArray(payload?.nations) ? payload.nations : [];
    const regionIds = Array.isArray(payload?.regionIds) ? payload.regionIds : [];
    const regionDefs = Array.isArray(payload?.regionDefs) ? payload.regionDefs : [];
    const chartSizes = payload?.chartSizes || { global: 0, nation: 0, region: 0 };
    const weights = payload?.weights || {};
    const defaultWeights = payload?.defaultWeights || FALLBACK_WEIGHTS;
    const volumeMultipliers = payload?.volumeMultipliers || FALLBACK_VOLUME_MULTIPLIERS;
    const profiles = payload?.profiles || {};
    const trends = payload?.trends || [];
    const audience = payload?.audience || {};
    const labelCompetition = payload?.labelCompetition || {};
    const nationScores = {};
    const regionScores = {};
    nations.forEach((nation) => {
        nationScores[nation] = [];
    });
    regionIds.forEach((regionId) => {
        regionScores[regionId] = [];
    });
    const globalScores = [];
    tracks.forEach((track) => {
        let sum = 0;
        nations.forEach((nation) => {
            const score = scoreTrack(track, nation, profiles, trends, audience, labelCompetition, regionDefs, nations);
            const metrics = buildChartMetrics(score, weights?.nations?.[nation], defaultWeights, volumeMultipliers);
            nationScores[nation].push({ key: track.key, score, metrics });
            sum += score;
        });
        const avg = nations.length ? Math.round(sum / nations.length) : 0;
        globalScores.push({
            key: track.key,
            score: avg,
            metrics: buildChartMetrics(avg, weights?.global, defaultWeights, volumeMultipliers)
        });
        regionIds.forEach((regionId) => {
            const score = scoreTrack(track, regionId, profiles, trends, audience, labelCompetition, regionDefs, nations);
            const metrics = buildChartMetrics(score, weights?.regions?.[regionId], defaultWeights, volumeMultipliers);
            regionScores[regionId].push({ key: track.key, score, metrics });
        });
    });
    globalScores.sort((a, b) => b.score - a.score);
    const charts = {
        global: globalScores.slice(0, chartSizes.global),
        nations: {},
        regions: {}
    };
    nations.forEach((nation) => {
        charts.nations[nation] = nationScores[nation]
            .sort((a, b) => b.score - a.score)
            .slice(0, chartSizes.nation);
    });
    regionIds.forEach((regionId) => {
        charts.regions[regionId] = regionScores[regionId]
            .sort((a, b) => b.score - a.score)
            .slice(0, chartSizes.region);
    });
    return { charts, globalScores };
}
async function persistSnapshots(snapshots) {
    if (!Array.isArray(snapshots) || !snapshots.length)
        return { stored: 0, total: 0 };
    const results = await Promise.allSettled(snapshots.map((snapshot) => storeChartSnapshot(snapshot)));
    const stored = results.filter((result) => result.status === "fulfilled").length;
    return { stored, total: snapshots.length };
}
workerScope.addEventListener("message", async (event) => {
    const message = event?.data || {};
    if (!message || !message.type || typeof message.id !== "number")
        return;
    if (message.type === "computeCharts") {
        const payload = computeCharts(message.payload);
        workerScope.postMessage({ type: "chartsComputed", id: message.id, payload });
        return;
    }
    if (message.type === "persistSnapshots") {
        const payload = await persistSnapshots(message.payload?.snapshots);
        workerScope.postMessage({ type: "snapshotsPersisted", id: message.id, payload });
    }
});
//# sourceMappingURL=chartWorker.js.map