/// <reference lib="webworker" />
import { storeChartSnapshot } from "./db.js";

const workerScope = self;
const FALLBACK_WEIGHTS = { sales: 0.25, streaming: 0.25, airplay: 0.25, social: 0.25 };
const AUDIENCE_CHUNK = 1000;
const ALIGNMENTS = ["Safe", "Neutral", "Risky"];
const AUDIENCE_ALIGNMENT_SCORE_SCALE = 42;
const AUDIENCE_TREND_BONUS = 4;
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function normalizeChartWeights(weights, fallback) {
  const safe = weights || fallback || FALLBACK_WEIGHTS;
  const total =
    Math.max(0, safe.sales || 0)
    + Math.max(0, safe.streaming || 0)
    + Math.max(0, safe.airplay || 0)
    + Math.max(0, safe.social || 0);
  const base = fallback || FALLBACK_WEIGHTS;
  if (!total) return { ...base };
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

function scoreTrack(track, regionName, profiles, trends, audience, labelCompetition) {
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
  } else {
    score += track.alignment === region.alignment ? 12 : -6;
  }
  if (Array.isArray(audienceProfile.themes) && audienceProfile.themes.includes(track.theme)) score += 8;
  if (Array.isArray(audienceProfile.moods) && audienceProfile.moods.includes(track.mood)) score += 6;
  if (Array.isArray(audienceProfile.trendGenres) && audienceProfile.trendGenres.includes(track.genre)) {
    score += AUDIENCE_TREND_BONUS;
  }
  score += Array.isArray(trends) && trends.includes(track.genre) ? 10 : 0;
  score += track.promoWeeks > 0 ? 10 : 0;
  score += rand(-4, 4);
  const competitionMultiplier = Number.isFinite(labelCompetition?.[track.label]) ? labelCompetition[track.label] : 1;
  if (competitionMultiplier !== 1) score = Math.round(score * competitionMultiplier);
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
      const score = scoreTrack(track, nation, profiles, trends, audience, labelCompetition);
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
      const score = scoreTrack(track, regionId, profiles, trends, audience, labelCompetition);
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
  if (!Array.isArray(snapshots) || !snapshots.length) return { stored: 0, total: 0 };
  const results = await Promise.allSettled(snapshots.map((snapshot) => storeChartSnapshot(snapshot)));
  const stored = results.filter((result) => result.status === "fulfilled").length;
  return { stored, total: snapshots.length };
}

workerScope.addEventListener("message", async (event) => {
  const message = event?.data || {};
  if (!message || !message.type || typeof message.id !== "number") return;
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
