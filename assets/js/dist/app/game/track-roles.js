// @ts-nocheck
import { DEFAULT_TRACK_SLOT_VISIBLE, ROLE_LABELS, TRACK_ROLE_KEYS, TRACK_ROLE_MATCH, TRACK_ROLE_TARGET_PATTERN } from "./config.js";
function trackRoleLimit(role) {
    const limit = TRACK_ROLE_LIMITS?.[role];
    return Number.isFinite(limit) ? limit : 1;
}
function roleLabel(role) {
    return ROLE_LABELS[role] || role;
}
function buildEmptyTrackSlotList(role) {
    return Array.from({ length: trackRoleLimit(role) }, () => null);
}
function buildDefaultTrackSlotVisibility() {
    return {
        Songwriter: Math.min(DEFAULT_TRACK_SLOT_VISIBLE, trackRoleLimit("Songwriter")),
        Performer: Math.min(DEFAULT_TRACK_SLOT_VISIBLE, trackRoleLimit("Performer")),
        Producer: Math.min(DEFAULT_TRACK_SLOT_VISIBLE, trackRoleLimit("Producer"))
    };
}
function parseTrackRoleTarget(targetId) {
    const match = TRACK_ROLE_TARGET_PATTERN.exec(targetId || "");
    if (!match)
        return null;
    const role = TRACK_ROLE_MATCH[match[1]];
    if (!role)
        return null;
    const index = match[2] ? Math.max(0, Number(match[2]) - 1) : 0;
    return { role, key: TRACK_ROLE_KEYS[role], index };
}
export { buildDefaultTrackSlotVisibility, buildEmptyTrackSlotList, parseTrackRoleTarget, roleLabel, trackRoleLimit };
//# sourceMappingURL=track-roles.js.map