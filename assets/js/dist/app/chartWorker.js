/// <reference lib="webworker" />
import { storeChartSnapshot } from "./db.js";
const workerScope = self;
const FALLBACK_WEIGHTS = { sales: 0.25, streaming: 0.25, airplay: 0.25, social: 0.25 };
const AUDIENCE_CHUNK = 1000;
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
function buildChartMetrics(score, weights, fallback) {
    const normalized = normalizeChartWeights(weights, fallback);
    const base = Math.max(0, score) * 1200;
    return {
        sales: roundToAudienceChunk(base * normalized.sales),
        streaming: roundToAudienceChunk(base * normalized.streaming),
        airplay: roundToAudienceChunk(base * normalized.airplay),
        social: roundToAudienceChunk(base * normalized.social)
    };
}
function scoreTrack(track, regionName, profiles, trends) {
    const nationProfiles = profiles?.nations || {};
    const regionProfiles = profiles?.regions || {};
    const fallback = nationProfiles.Annglora || { alignment: "", theme: "", moods: [] };
    const region = regionProfiles[regionName] || nationProfiles[regionName] || fallback;
    let score = track.quality || 0;
    score += track.alignment === region.alignment ? 12 : -6;
    score += track.theme === region.theme ? 8 : 0;
    score += Array.isArray(region.moods) && region.moods.includes(track.mood) ? 6 : 0;
    score += Array.isArray(trends) && trends.includes(track.genre) ? 10 : 0;
    score += track.promoWeeks > 0 ? 10 : 0;
    score += rand(-4, 4);
    const decay = Math.max(0.4, 1 - (track.weeksOnChart || 0) * 0.05);
    return Math.round(score * decay);
}
function computeCharts(payload) {
    const tracks = Array.isArray(payload?.tracks) ? payload.tracks : [];
    const nations = Array.isArray(payload?.nations) ? payload.nations : [];
    const regionIds = Array.isArray(payload?.regionIds) ? payload.regionIds : [];
    const chartSizes = payload?.chartSizes || { global: 0, nation: 0, region: 0 };
    const weights = payload?.weights || {};
    const defaultWeights = payload?.defaultWeights || FALLBACK_WEIGHTS;
    const profiles = payload?.profiles || {};
    const trends = payload?.trends || [];
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
            const score = scoreTrack(track, nation, profiles, trends);
            const metrics = buildChartMetrics(score, weights?.nations?.[nation], defaultWeights);
            nationScores[nation].push({ key: track.key, score, metrics });
            sum += score;
        });
        const avg = nations.length ? Math.round(sum / nations.length) : 0;
        globalScores.push({
            key: track.key,
            score: avg,
            metrics: buildChartMetrics(avg, weights?.global, defaultWeights)
        });
        regionIds.forEach((regionId) => {
            const score = scoreTrack(track, regionId, profiles, trends);
            const metrics = buildChartMetrics(score, weights?.regions?.[regionId], defaultWeights);
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
