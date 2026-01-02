// @ts-nocheck
const PROJECT_TRACK_LIMITS = {
    Single: { min: 1, max: 4 },
    EP: { min: 5, max: 7 },
    Album: { min: 8, max: 32 }
};
const PROJECT_TYPE_ALIASES = {
    single: "Single",
    singles: "Single",
    ep: "EP",
    "e.p.": "EP",
    album: "Album",
    lp: "Album",
    "long play": "Album"
};
function normalizeProjectType(projectType) {
    const raw = String(projectType || "").trim();
    if (!raw)
        return "Single";
    const key = raw.toLowerCase();
    return PROJECT_TYPE_ALIASES[key] || (PROJECT_TRACK_LIMITS[raw] ? raw : "Single");
}
function normalizeProjectName(projectName) {
    return String(projectName || "").replace(/\s+/g, " ").trim().toLowerCase();
}
function getProjectTrackLimits(projectType) {
    const normalizedType = normalizeProjectType(projectType);
    const limits = PROJECT_TRACK_LIMITS[normalizedType] || PROJECT_TRACK_LIMITS.Single;
    return { ...limits, type: normalizedType };
}
function listProjectTracks(tracks, projectName) {
    const normalizedName = normalizeProjectName(projectName);
    if (!normalizedName)
        return [];
    const pool = Array.isArray(tracks) ? tracks : [];
    return pool.filter((track) => normalizeProjectName(track.projectName) === normalizedName);
}
function evaluateProjectTrackConstraints(tracks, projectName, projectType) {
    const normalizedType = normalizeProjectType(projectType);
    const limits = getProjectTrackLimits(normalizedType);
    const normalizedName = normalizeProjectName(projectName);
    if (!normalizedName) {
        return { ok: true, normalizedType, limits, count: 0, existingTypes: [] };
    }
    const matched = listProjectTracks(tracks, projectName);
    const count = matched.length;
    const existingTypes = Array.from(new Set(matched.map((track) => normalizeProjectType(track.projectType))));
    const conflict = existingTypes.find((type) => type !== normalizedType);
    if (conflict) {
        return {
            ok: false,
            normalizedType,
            limits,
            count,
            existingTypes,
            reason: `Project "${projectName}" already uses ${conflict} tracks. Use ${conflict} or rename the project.`
        };
    }
    if (Number.isFinite(limits.max) && count >= limits.max) {
        return {
            ok: false,
            normalizedType,
            limits,
            count,
            existingTypes,
            reason: `${normalizedType} projects cap at ${limits.max} tracks. "${projectName}" already has ${count}.`
        };
    }
    return { ok: true, normalizedType, limits, count, existingTypes };
}
export { getProjectTrackLimits, normalizeProjectName, normalizeProjectType, evaluateProjectTrackConstraints };
//# sourceMappingURL=project-tracks.js.map