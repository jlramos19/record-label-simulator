// @ts-nocheck
import { ACHIEVEMENTS, ACHIEVEMENT_TARGET, CREATOR_FALLBACK_EMOJI, CREATOR_FALLBACK_ICON, DAY_MS, DEFAULT_TRACK_SLOT_VISIBLE, MARKET_ROLES, QUARTERS_PER_HOUR, RESOURCE_TICK_LEDGER_LIMIT, ROLE_ACTIONS, ROLE_ACTION_STATUS, STAGE_STUDIO_LIMIT, STAMINA_OVERUSE_LIMIT, STUDIO_COLUMN_SLOT_COUNT, TRACK_ROLE_KEYS, TRACK_ROLE_TARGETS, TREND_DETAIL_COUNT, UNASSIGNED_CREATOR_EMOJI, UNASSIGNED_CREATOR_LABEL, UNASSIGNED_SLOT_LABEL, WEEKLY_SCHEDULE, alignmentClass, buildCalendarProjection, buildStudioEntries, buildTrackHistoryScopes, chartWeightsForScope, clamp, collectTrendRanking, commitSlotChange, computePopulationSnapshot, countryColor, countryDemonym, creatorInitials, currentYear, ensureMarketCreators, ensureTrackSlotArrays, ensureTrackSlotVisibility, formatCount, formatDate, formatHourCountdown, formatMoney, formatShortDate, formatWeekRangeLabel, getAct, getActiveEras, getBusyCreatorIds, getCommunityLabelRankingLimit, getCommunityTrendRankingLimit, getCreator, getCreatorPortraitUrl, getCreatorSignLockout, getCreatorStaminaSpentToday, getEraById, getFocusedEra, getGameDifficulty, getGameMode, getLabelRanking, getModifier, getOwnedStudioSlots, getReleaseAsapAt, getRivalByName, getRolloutPlanningEra, getRolloutStrategiesForEra, getSlotData, getSlotGameMode, getSlotValue, getStageCost, getStageStudioAvailable, getStudioAvailableSlots, getStudioMarketSnapshot, getStudioUsageCounts, getTopActSnapshot, getTopTrendGenre, getTrack, getTrackRoleIds, getTrackRoleIdsFromSlots, getWorkOrderCreatorIds, hoursUntilNextScheduledTime, isMasteringTrack, listFromIds, loadLossArchives, logEvent, makeGenre, moodFromGenre, normalizeRoleIds, parseTrackRoleTarget, pruneCreatorSignLockouts, qualityGrade, rankCandidates, recommendReleasePlan, roleLabel, safeAvatarUrl, saveToActiveSlot, scoreGrade, session, setSelectedRolloutStrategyId, setTimeSpeed, shortGameModeLabel, slugify, staminaRequirement, state, syncLabelWallets, themeFromGenre, trackRoleLimit, trendAlignmentLeader, weekIndex, weekNumberFromEpochMs, } from "../../game.js";
import { CalendarView } from "../../calendar.js";
import { $, describeSlot, getSlotElement, openOverlay } from "../dom.js";
import { buildMoodOptions, buildThemeOptions, bindThemeSelectAccent, getMoodEmoji, setThemeSelectAccent } from "../themeMoodOptions.js";
const ACCESSIBLE_TEXT = { dark: "#0b0f14", light: "#ffffff" };
let trackHistoryRequestId = 0;
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
function renderNationalityPill(country) {
    const color = countryColor(country);
    const textColor = pickAccessibleTextColor(color);
    const demonym = countryDemonym(country);
    return `<span class="pill country-pill" style="color:${textColor}; border-color:${color}; background:${color};">${demonym}</span>`;
}
function renderCreatorName(creator, { stacked = true } = {}) {
    if (!creator)
        return "";
    const romanized = creator.name || "";
    const hangul = creator.nameHangul
        || (creator.surnameHangul && creator.givenNameHangul ? `${creator.surnameHangul}${creator.givenNameHangul}` : "");
    if (!hangul || !stacked)
        return romanized;
    return `<span class="name-stack"><span class="name-ko" lang="ko">${hangul}</span><span class="name-romanized">${romanized}</span></span>`;
}
function renderLabelTag(label, country) {
    const color = countryColor(country);
    const textColor = country === "Bytenza" ? "#f4f1ea" : "#0b0f14";
    return `<span class="tag" style="color:${textColor}; border-color:${color}; background:${color};"><span class="tag-dot" style="background:${textColor};"></span>${label}</span>`;
}
function renderMoodTag(mood) {
    const emoji = getMoodEmoji(mood) || "❓";
    return `<span class="tag mood"><span class="mood-emoji">${emoji}</span>${mood}</span>`;
}
function renderMoodLabel(mood) {
    const emoji = getMoodEmoji(mood) || "❓";
    return `<span class="tag mood">${mood} <span class="mood-emoji">${emoji}</span></span>`;
}
function renderGenrePills(theme, mood, { fallback = "-" } = {}) {
    if (!theme || !mood)
        return fallback;
    return `<span class="genre-pills">${renderThemeTag(theme)} <span class="genre-connector">but it's</span> ${renderMoodTag(mood)}</span>`;
}
function renderGenrePillsFromGenre(genre, options = {}) {
    if (!genre)
        return options.fallback || "-";
    const theme = themeFromGenre(genre);
    const mood = moodFromGenre(genre);
    return renderGenrePills(theme, mood, options);
}
function renderTrackGenrePills(track, options = {}) {
    if (!track)
        return options.fallback || "-";
    const theme = track.theme || themeFromGenre(track.genre);
    const mood = track.mood || moodFromGenre(track.genre);
    return renderGenrePills(theme, mood, options);
}
function ensureTrackSlotGrid() {
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
        const target = slot.dataset.slotTarget;
        slot.classList.toggle("active", target === activeTarget);
    });
    const actLead = getCreator(state.ui.actSlots.lead);
    const actMember2 = getCreator(state.ui.actSlots.member2);
    const actMember3 = getCreator(state.ui.actSlots.member3);
    const trackAct = getAct(state.ui.trackSlots.actId);
    const eraAct = getAct(state.ui.eraSlots.actId);
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
        $("trackActSlot").textContent = trackAct ? trackAct.name : unassignedLabel;
    if ($("eraActSlot"))
        $("eraActSlot").textContent = eraAct ? eraAct.name : unassignedLabel;
    if ($("promoTrackSlot"))
        $("promoTrackSlot").textContent = promoTrack ? promoTrack.title : unassignedLabel;
    if ($("socialTrackSlot"))
        $("socialTrackSlot").textContent = socialTrack ? socialTrack.title : unassignedLabel;
    document.querySelectorAll(".id-slot").forEach((slot) => {
        const target = slot.dataset.slotTarget;
        const type = slot.dataset.slotType;
        const value = getSlotValue(target);
        const valueEl = slot.querySelector(".slot-value");
        const avatarEl = slot.querySelector(".slot-avatar");
        if (!valueEl)
            return;
        if (type === "creator") {
            const creator = value ? getCreator(value) : null;
            valueEl.innerHTML = creator ? renderCreatorName(creator) : unassignedCreatorLabel;
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
            }
        }
        else if (type === "act") {
            const act = value ? getAct(value) : null;
            valueEl.textContent = act ? act.name : unassignedLabel;
            if (avatarEl) {
                avatarEl.classList.remove("has-image");
                avatarEl.classList.remove("is-empty");
                avatarEl.style.backgroundImage = "";
                avatarEl.textContent = "";
            }
        }
        else if (type === "track") {
            const track = value ? getTrack(value) : null;
            valueEl.textContent = track ? track.title : unassignedLabel;
            if (avatarEl) {
                avatarEl.classList.remove("has-image");
                avatarEl.classList.remove("is-empty");
                avatarEl.style.backgroundImage = "";
                avatarEl.textContent = "";
            }
        }
    });
    document.querySelectorAll("[data-slot-group-label]").forEach((label) => {
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
    if (modifierSelect)
        modifierSelect.innerHTML = MODIFIERS.map((mod) => `<option value="${mod.id}">${mod.label}</option>`).join("");
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
            const overuseSafe = getCreatorStaminaSpentToday(creator) + req <= STAMINA_OVERUSE_LIMIT;
            const canAssign = creator.ready && overuseSafe;
            return `
          <div class="list-item">
            <div class="auto-assign-candidate">
              <div>
                <div class="item-title">${renderCreatorName(creator)}</div>
                <div class="bar"><span style="width:${staminaPct}%"></span></div>
                <div class="muted">Stamina ${creator.stamina} / ${STAMINA_MAX}</div>
                <div class="muted">ID ${creator.id} | Skill <span class="grade-text" data-grade="${scoreGrade(creator.skill)}">${creator.skill}</span></div>
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
    $("weekDisplay").textContent = `Week ${weekIndex() + 1}`;
    const chartHours = hoursUntilNextScheduledTime(WEEKLY_SCHEDULE.chartUpdate);
    $("chartCountdown").textContent = `Charts update in ${formatHourCountdown(chartHours)}h`;
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
    const actName = displayEra ? getAct(displayEra.actId)?.name : null;
    const stageName = displayEra ? ERA_STAGES[displayEra.stageIndex] || "Active" : "";
    const baseLabel = displayEra
        ? `${displayEra.name}${actName ? ` (${actName})` : ""}${stageName ? ` | ${stageName}` : ""}`
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
        headerEl.textContent = headerLabel;
        if (displayEra) {
            const stageName = ERA_STAGES[displayEra.stageIndex] || "Active";
            headerEl.title = `Act: ${actName || "Unknown"} | Stage: ${stageName}`;
        }
        else {
            headerEl.title = "";
        }
    }
    const labelEl = $("eraFocusLabel");
    if (labelEl)
        labelEl.textContent = detailLabel;
    const promoEl = $("promoFocusLabel");
    if (promoEl)
        promoEl.textContent = promoLabel;
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
        else if (state.meta.achievementsLocked) {
            $("bailoutStatus").textContent = "Bailout used: achievements locked.";
        }
        else if (state.meta.bailoutUsed) {
            $("bailoutStatus").textContent = "Bailout used.";
        }
        else {
            $("bailoutStatus").textContent = "";
        }
    }
    if ($("winTrackDisplay")) {
        if (state.meta.winState) {
            $("winTrackDisplay").textContent = `Won ${state.meta.winState.year}`;
        }
        else {
            const year = currentYear();
            if (year < 3000)
                $("winTrackDisplay").textContent = "12 Requests (no monopoly)";
            else if (year < 4000)
                $("winTrackDisplay").textContent = "12 Requests or Monopoly";
            else
                $("winTrackDisplay").textContent = "Top Label or Monopoly";
        }
    }
    renderFocusEraStatus();
}
function buildLabelRankingList({ limit = null, showMore = false } = {}) {
    const fullRanking = getLabelRanking();
    const visible = typeof limit === "number" ? fullRanking.slice(0, limit) : fullRanking;
    if (!visible.length) {
        return { markup: `<div class="muted">No labels yet.</div>`, visibleCount: 0, totalCount: fullRanking.length };
    }
    const list = visible.map((row, index) => {
        const labelName = row[0];
        const points = row[1];
        const country = getRivalByName(labelName)?.country || state.label.country;
        const moreAction = showMore && index === 0
            ? `<button type="button" class="ghost mini" data-ranking-more="labels">More</button>`
            : "";
        return `
      <div class="list-item">
        <div class="list-row">
          <div class="item-title">#${index + 1} ${renderLabelTag(labelName, country)}</div>
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
          <span class="muted">${row[1]} pts</span>
        </div>
      `).join("")
        : `<div class="muted">No labels yet</div>`;
    const trendRanking = Array.isArray(state.trendRanking) && state.trendRanking.length
        ? state.trendRanking
        : (state.trends || []);
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
    if ($("topActName")) {
        const topAct = getTopActSnapshot();
        $("topActName").textContent = topAct ? `Top Act: ${topAct.name}` : "Top Act: -";
        $("topActPortrait").textContent = topAct ? topAct.initials : "RLS";
        $("topActPortrait").style.background = topAct ? topAct.color : "";
        $("topActPortrait").style.color = topAct ? topAct.textColor : "";
    }
}
function renderDashboard() {
    const statsEl = $("dashboardStats");
    if (!statsEl)
        return;
    const weekLabel = $("dashboardWeekLabel");
    if (weekLabel)
        weekLabel.textContent = `Week ${weekIndex() + 1}`;
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
                const lead = crew[0] || null;
                const crewLabel = lead ? (crew.length > 1 ? `${lead.name} +${crew.length - 1}` : lead.name) : "Unassigned";
                const stage = STAGES[order.stageIndex];
                const hoursLeft = Math.max(0, Math.ceil((order.endAt - now) / HOUR_MS));
                return `
            <div class="list-item">
              <div class="list-row">
                <div>
                  <div class="item-title">${track ? track.title : "Unknown"}</div>
                  <div class="muted">${stage?.name || "Stage"} | ${crewLabel}</div>
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
                  <div class="item-title">${track ? track.title : "Unknown"}</div>
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
        const entries = (state.charts.global || []).slice(0, 5);
        if (!entries.length) {
            chartsEl.innerHTML = `<div class="muted">No chart entries yet.</div>`;
        }
        else {
            chartsEl.innerHTML = entries.map((entry) => `
        <div class="list-item">
          <div class="list-row">
            <div>
              <div class="item-title">#${entry.rank} ${entry.track.title}</div>
              <div class="muted">${entry.track.label} | ${renderTrackGenrePills(entry.track, { fallback: "Genre -" })}</div>
            </div>
            <div class="pill">${formatCount(entry.score)}</div>
          </div>
        </div>
      `).join("");
        }
    }
    const eraList = $("dashboardEraList");
    if (eraList) {
        if (!activeEras.length) {
            eraList.innerHTML = `<div class="muted">No active eras.</div>`;
        }
        else {
            eraList.innerHTML = activeEras.map((era) => `
        <div class="list-item">
          <div class="list-row">
            <div>
              <div class="item-title">${era.name}</div>
              <div class="muted">${ERA_STAGES[era.stageIndex] || "Active"} | Week ${era.stageWeek}</div>
            </div>
            ${focusEra && focusEra.id === era.id ? `<span class="pill">Focus</span>` : ""}
          </div>
        </div>
      `).join("");
        }
    }
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
    const active = state.marketTracks.filter((entry) => entry.isPlayer && entry.promoWeeks > 0);
    if (!active.length) {
        listEl.innerHTML = `<div class="muted">No active promo pushes.</div>`;
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
            <div class="muted">${renderGenrePillsFromGenre(entry.genre)}</div>
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
        const week = entry.week ? `Week ${entry.week}` : "Week -";
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
        { title: "Performance", detail: "Assign Performer ID + Mood to craft the demo tone." },
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
            <div class="item-title">${track.title}</div>
            <div class="muted">Item: Track  ID ${track.id}</div>
            <div class="muted">${track.status}  ${renderGenrePillsFromGenre(track.genre)}</div>
          </div>
        </div>
        <div class="pill grade" data-grade="${qualityGrade(track.quality)}">${qualityGrade(track.quality)}</div>
      </div>
    </div>
  `).join("");
}
function renderCalendarEraList(eras) {
    if (!eras.length) {
        return `<div class="muted">No active eras on the calendar.</div>`;
    }
    return eras.map((era) => `
    <div class="list-item">
      <div class="item-title">${era.name}</div>
      <div class="muted">Act: ${era.actName} | Stage: ${era.stageName}</div>
      <div class="muted">Started Week ${era.startedWeek} | Content: ${era.content}</div>
    </div>
  `).join("");
}
function renderCalendarView() {
    const grid = $("calendarGrid");
    const list = $("calendarList");
    const eraList = $("calendarEraList");
    const rangeLabel = $("calendarRangeLabel");
    const projection = buildCalendarProjection({ pastWeeks: 0, futureWeeks: 3 });
    if (rangeLabel)
        rangeLabel.textContent = projection.rangeLabel || "";
    if (projection.tab === "eras") {
        if (grid) {
            grid.innerHTML = "";
            grid.classList.add("hidden");
        }
        if (list)
            list.classList.add("hidden");
        if (eraList)
            eraList.classList.remove("hidden");
        renderCalendarList("calendarEraList", projection.weeks.length, projection);
        return;
    }
    if (grid) {
        grid.classList.remove("hidden");
        grid.innerHTML = CalendarView(projection);
    }
    if (eraList) {
        eraList.classList.add("hidden");
        eraList.innerHTML = "";
    }
    if (list)
        list.classList.remove("hidden");
    const upcomingWeeks = projection.weeks.length || 1;
    const upcomingProjection = buildCalendarProjection({
        pastWeeks: 0,
        futureWeeks: Math.max(0, upcomingWeeks - 1),
        anchorWeekIndex: weekIndex() + 1
    });
    renderCalendarList("calendarList", upcomingWeeks, upcomingProjection);
}
function renderCalendarList(targetId, weeks, projectionOverride) {
    const target = $(targetId);
    if (!target)
        return;
    const futureWeeks = Math.max(0, (weeks || 1) - 1);
    const projection = projectionOverride || buildCalendarProjection({ pastWeeks: 0, futureWeeks });
    const tab = projection.tab || "label";
    const filters = projection.filters || {};
    document.querySelectorAll("[data-calendar-tab]").forEach((btn) => {
        if (!btn.dataset.calendarTab)
            return;
        btn.classList.toggle("active", btn.dataset.calendarTab === tab);
    });
    document.querySelectorAll("[data-calendar-filter]").forEach((input) => {
        const key = input.dataset.calendarFilter;
        if (!key || typeof filters[key] !== "boolean")
            return;
        input.checked = filters[key] !== false;
    });
    if (tab === "eras") {
        target.innerHTML = renderCalendarEraList(projection.eras || []);
        return;
    }
    if (!projection.weeks.length) {
        target.innerHTML = `<div class="muted">No scheduled entries.</div>`;
        return;
    }
    target.innerHTML = projection.weeks.map((week) => {
        const entries = Array.isArray(week.events) ? week.events.slice() : [];
        entries.sort((a, b) => a.ts - b.ts);
        const weekLabel = `Week ${week.weekNumber}`;
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
            const actName = entry.actName || "Unknown";
            const title = entry.title || "Untitled";
            const typeLabel = entry.typeLabel || "Event";
            const distribution = entry.distribution || "Digital";
            return `
            <div class="muted">${labelTag} | ${actName} | ${title} (${typeLabel}, ${distribution})</div>
          `;
        }).join("")}
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
              <div class="item-title">${act.name}</div>
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
    const content = hasImage ? initials : renderCreatorFallbackSymbols();
    return `<div class="${className}" aria-hidden="true"${imageStyle}>${content}</div>`;
}
function renderCreators() {
    const creatorList = $("creatorList");
    if (!creatorList)
        return;
    const busyIds = getBusyCreatorIds("In Progress");
    const pool = state.creators || [];
    const columns = MARKET_ROLES.map((role) => {
        const roleLabelText = roleLabel(role);
        const roleCreators = pool.filter((creator) => creator.role === role);
        const list = roleCreators.map((creator) => {
            const busy = busyIds.has(creator.id);
            const staminaPct = Math.round((creator.stamina / STAMINA_MAX) * 100);
            const skillGrade = scoreGrade(creator.skill);
            const roleText = roleLabel(creator.role);
            const themeCells = creator.prefThemes.map((theme) => renderThemeTag(theme)).join("");
            const moodCells = creator.prefMoods.map((mood) => renderMoodTag(mood)).join("");
            const nationalityPill = renderNationalityPill(creator.country);
            const memberships = state.acts.filter((act) => act.memberIds.includes(creator.id)).map((act) => act.name);
            const actText = memberships.length ? memberships.join(", ") : "No Act";
            return `
        <div class="list-item" data-entity-type="creator" data-entity-id="${creator.id}" data-entity-name="${creator.name}" draggable="true">
          <div class="list-row">
            <div class="creator-card">
              ${renderCreatorAvatar(creator)}
              <div>
                <div class="item-title">${renderCreatorName(creator)}</div>
                <div class="bar"><span style="width:${staminaPct}%"></span></div>
                <div class="muted">Stamina ${creator.stamina} / ${STAMINA_MAX}</div>
                <div class="muted">ID ${creator.id} | ${roleText} | Skill <span class="grade-text" data-grade="${skillGrade}">${creator.skill}</span></div>
                <div class="muted">Acts: ${actText}</div>
                <div class="time-row">${nationalityPill}</div>
                <div class="muted">Preferred Themes:</div>
              <div class="time-row">${themeCells}</div>
              <div class="muted">Preferred Moods:</div>
              <div class="time-row">${moodCells}</div>
            </div>
          </div>
          <div class="pill">${busy ? "Busy" : "Ready"}</div>
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
function renderMarket() {
    ensureMarketCreators({}, { replenish: false });
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
    const sortCreators = (list) => {
        if (!sortMode || sortMode === "default")
            return list;
        const entries = list.map((creator, index) => ({ creator, index }));
        const byText = (a, b) => a.localeCompare(b);
        const themeKey = (creator) => (creator.prefThemes?.[0] ? creator.prefThemes[0] : "");
        const themeKey2 = (creator) => (creator.prefThemes?.[1] ? creator.prefThemes[1] : "");
        const moodKey = (creator) => (creator.prefMoods?.[0] ? creator.prefMoods[0] : "");
        const moodKey2 = (creator) => (creator.prefMoods?.[1] ? creator.prefMoods[1] : "");
        entries.sort((a, b) => {
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
            const skillGrade = scoreGrade(creator.skill);
            const staminaPct = Math.round((creator.stamina / STAMINA_MAX) * 100);
            const nationalityPill = renderNationalityPill(creator.country);
            const lockout = getCreatorSignLockout(creator.id, now);
            const isLocked = !!lockout;
            const itemClass = `list-item${isLocked ? " ccc-market-item--failed" : ""}`;
            const buttonState = isLocked ? " disabled" : "";
            const buttonLabel = isLocked ? "Locked until refresh" : `Sign ${formatMoney(creator.signCost || 0)}`;
            const lockoutReason = isLocked && lockout?.reason ? ` - ${lockout.reason}` : "";
            const lockoutHint = isLocked ? `<div class="tiny muted">Locked until 12AM refresh${lockoutReason}</div>` : "";
            const lockoutTitle = isLocked && lockout
                ? ` title="Locked until ${formatDate(lockout.lockedUntilEpochMs)}${lockout?.reason ? ` | ${lockout.reason}` : ""}"`
                : "";
            const themeCells = (creator.prefThemes || []).map((theme) => renderThemeTag(theme)).join("");
            const moodCells = (creator.prefMoods || []).map((mood) => renderMoodTag(mood)).join("");
            return `
        <div class="${itemClass}" data-ccc-creator="${creator.id}">
          <div class="list-row">
            <div class="creator-card">
              ${renderCreatorAvatar(creator)}
              <div>
                <div class="item-title">${renderCreatorName(creator)}</div>
                <div class="bar"><span style="width:${staminaPct}%"></span></div>
                <div class="muted">Stamina ${creator.stamina} / ${STAMINA_MAX}</div>
                <div class="muted">ID ${creator.id} | ${roleLabelText} | Skill <span class="grade-text" data-grade="${skillGrade}">${creator.skill}</span></div>
                <div class="time-row">${nationalityPill}</div>
                <div class="muted">Preferred Themes:</div>
                <div class="time-row">${themeCells}</div>
                <div class="muted">Preferred Moods:</div>
                <div class="time-row">${moodCells}</div>
              </div>
            </div>
            <div>
              <button type="button" data-sign="${creator.id}"${buttonState}${lockoutTitle}>${buttonLabel}</button>
              ${lockoutHint}
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
        const lead = crew[0] || null;
        const crewLabel = lead ? (crew.length > 1 ? `${lead.name} +${crew.length - 1}` : lead.name) : "Unassigned";
        const stage = STAGES[order.stageIndex];
        const hoursLeft = order.status === "In Progress" ? Math.max(0, Math.ceil((order.endAt - now) / HOUR_MS)) : "Queued";
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${track ? track.title : "Unknown"}</div>
            <div class="muted">${stage.name} | ${crewLabel}</div>
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
                const weekLabel = `Week ${week}`;
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
              <div class="item-title">${track.title}</div>
              <div class="muted">Act: ${act ? act.name : "Unassigned"} | Project: ${project} (${projectType})</div>
              <div class="muted">Released ${releaseDate} | ${track.distribution || "Digital"}</div>
            </div>
          </div>
          <div class="track-history-table-wrap">
            <table class="chart-table track-history-table">
              <thead>
                <tr>
                  <th>Week</th>
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
    const archivedTracks = allTracks.filter((track) => track.status === "Released");
    let tracks = allTracks.filter((track) => track.status !== "Released");
    if (activeView === "create") {
        if (createStage === "demo") {
            tracks = tracks.filter((track) => track.status === "Awaiting Demo");
        }
        else if (createStage === "master") {
            tracks = tracks.filter((track) => track.status === "Awaiting Master");
        }
    }
    const trackList = $("trackList");
    if (trackList) {
        if (!tracks.length) {
            let emptyMsg = activeView === "create" && createStage === "demo"
                ? "No sheet music awaiting demo recordings."
                : activeView === "create" && createStage === "master"
                    ? "No demos awaiting mastering."
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
                    : `Act: ${act ? act.name : "Unassigned"} | Project: ${project} (${projectType})`;
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
              <div class="item-title">${track.title}</div>
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
        const actLine = `Act: ${act ? act.name : "Unassigned"} | Project: ${project} (${projectType})`;
        return `
      <div class="list-item" data-entity-type="track" data-entity-id="${track.id}" data-entity-name="${track.title}" draggable="true">
        <div class="list-row">
          <div class="item-main">
            <div class="content-thumb" aria-hidden="true"></div>
            <div>
              <div class="item-title">${track.title}</div>
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
    const weekInput = $("rolloutStrategyWeek");
    const dropInput = $("rolloutStrategyDropId");
    const eventTypeSelect = $("rolloutStrategyEventType");
    const eventContentInput = $("rolloutStrategyEventContent");
    const autoRunToggle = $("rolloutStrategyAutoRun");
    const expandBtn = $("rolloutStrategyExpand");
    const addDropBtn = $("rolloutStrategyAddDrop");
    const addEventBtn = $("rolloutStrategyAddEvent");
    const createBtn = $("rolloutStrategyCreate");
    if (!select || !summary)
        return;
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
        return;
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
    select.innerHTML = strategies.map((strategy) => (`<option value="${strategy.id}">${strategy.id} | ${strategy.status}</option>`)).join("");
    const desiredId = state.ui.viewContext?.rolloutStrategyId || era.rolloutStrategyId || strategies[0].id;
    const activeStrategy = strategies.find((strategy) => strategy.id === desiredId) || strategies[0];
    select.value = activeStrategy.id;
    setSelectedRolloutStrategyId(activeStrategy.id);
    if (eventTypeSelect) {
        eventTypeSelect.innerHTML = Object.keys(PROMO_TYPE_DETAILS)
            .map((key) => `<option value="${key}">${PROMO_TYPE_DETAILS[key].label}</option>`)
            .join("");
        if (!eventTypeSelect.value)
            eventTypeSelect.value = DEFAULT_PROMO_TYPE;
    }
    if (weekInput) {
        weekInput.disabled = false;
        weekInput.max = String(activeStrategy.weeks.length);
        const parsed = Math.max(1, Math.min(activeStrategy.weeks.length, Number(weekInput.value) || 1));
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
    const header = `
    <div class="list-item">
      <div class="item-title">Strategy ${activeStrategy.id}</div>
      <div class="muted">Status: ${activeStrategy.status} | Source: ${activeStrategy.source} | Weeks: ${activeStrategy.weeks.length}</div>
    </div>
  `;
    const rows = activeStrategy.weeks.map((week, index) => {
        const dropCount = Array.isArray(week.drops) ? week.drops.length : 0;
        const eventCount = Array.isArray(week.events) ? week.events.length : 0;
        return `
      <div class="list-item">
        <div class="item-title">Week ${index + 1}</div>
        <div class="muted">Drops ${dropCount} | Events ${eventCount}</div>
      </div>
    `;
    });
    summary.innerHTML = rows.length ? header + rows.join("") : `${header}<div class="muted">No rollout items yet.</div>`;
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
    renderRolloutStrategyPlanner();
}
function renderReleaseDesk() {
    const queuedIds = new Set(state.releaseQueue.map((entry) => entry.trackId));
    const asapAt = getReleaseAsapAt();
    const asapLabel = formatDate(asapAt);
    const readyTracks = state.tracks.filter((track) => {
        if (queuedIds.has(track.id))
            return false;
        if (track.status === "Ready")
            return true;
        return isMasteringTrack(track);
    });
    const readyHtml = readyTracks.length
        ? readyTracks.map((track) => {
            const isReady = track.status === "Ready";
            const isMastering = isMasteringTrack(track);
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
                : `<div class="muted">No Acts available. Create one in Roster.</div>`;
            const project = track.projectName || `${track.title} - Single`;
            const projectType = track.projectType || "Single";
            const themeTag = renderThemeTag(track.theme);
            const alignTag = renderAlignmentTag(track.alignment);
            const modifierName = track.modifier ? track.modifier.label : "None";
            const derivedGenre = track.genre || makeGenre(track.theme, track.mood);
            const grade = qualityGrade(track.quality);
            const rec = derivedGenre ? recommendReleasePlan({ ...track, genre: derivedGenre }) : recommendReleasePlan(track);
            const recLabel = `${rec.distribution} ${rec.scheduleKey === "now" ? "now" : rec.scheduleKey === "fortnight" ? "+14d" : "+7d"}`;
            const statusLabel = isReady ? "" : track.status === "In Production" ? "Mastering" : "Awaiting Master";
            const genreLabel = renderGenrePillsFromGenre(derivedGenre, { fallback: "-" });
            const hasAct = Boolean(track.actId);
            const canSchedule = hasAct && (isReady || isMastering);
            return `
        <div class="list-item">
          <div class="list-row">
            <div class="item-main">
              <div class="content-thumb" aria-hidden="true"></div>
              <div>
                <div class="item-title">${track.title}</div>
                <div class="muted">${genreLabel} | <span class="grade-text" data-grade="${grade}">${grade}</span>${isReady ? "" : ` | ${statusLabel}`}</div>
                <div class="muted">${themeTag} ${alignTag}</div>
                <div class="muted">Act: ${act ? act.name : "Unassigned"} | Project: ${project} (${projectType})</div>
                <div class="muted">Modifier: ${modifierName}</div>
                <div class="muted">Recommended: ${recLabel} - ${rec.reason}</div>
                ${actSelect}
              </div>
            </div>
            <div class="time-row">
              <div>
                <button type="button" data-release="asap" data-track="${track.id}"${canSchedule ? "" : " disabled"}>Release ASAP</button>
                <div class="time-meta">${asapLabel} (earliest Friday at midnight)</div>
              </div>
              <button type="button" class="ghost" data-release="week" data-track="${track.id}"${canSchedule ? "" : " disabled"}>+7d</button>
              <button type="button" class="ghost" data-release="fortnight" data-track="${track.id}"${canSchedule ? "" : " disabled"}>+14d</button>
              <button type="button" class="ghost" data-release="recommend" data-track="${track.id}"${canSchedule ? "" : " disabled"}>Use Recommended</button>
            </div>
          </div>
        </div>
      `;
        }).join("")
        : `<div class="muted">No ready or mastering tracks.</div>`;
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
        <div class="list-row">
          <div class="item-main">
            <div class="content-thumb" aria-hidden="true"></div>
            <div>
              <div class="item-title">${track ? track.title : "Unknown"}</div>
              <div class="muted">${date} | ${distribution}</div>
              <div class="muted">Act: ${track ? (act ? act.name : "Unassigned") : "Unknown"} | Project: ${project} (${projectType})</div>
            </div>
          </div>
        </div>
      </div>
    `;
    });
    $("releaseQueueList").innerHTML = queue.join("");
}
function buildTrendRankingList({ limit = null, showMore = false } = {}) {
    const { visible, aggregate } = collectTrendRanking();
    const displayed = typeof limit === "number" ? visible.slice(0, limit) : visible;
    if (!displayed.length) {
        return { markup: `<div class="muted">No trends yet.</div>`, visibleCount: 0, totalCount: visible.length };
    }
    const alignmentScores = aggregate.alignmentScores || {};
    const list = displayed.map((trend, index) => {
        const theme = themeFromGenre(trend);
        const mood = moodFromGenre(trend);
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
            <div class="item-title">#${index + 1} ${renderGenrePills(theme, mood)}</div>
          </div>
          <div class="ranking-actions">
            <div class="badge warn">Hot</div>
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
        const { markup, visibleCount, totalCount } = buildLabelRankingList({ limit: 8 });
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
    const { markup, visibleCount, totalCount } = buildTrendRankingList({ limit: 40 });
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
    const ranking = Array.isArray(state.trendRanking) && state.trendRanking.length ? state.trendRanking : (state.trends || []);
    const list = ranking.slice(0, TREND_DETAIL_COUNT).map((trend, index) => {
        const theme = themeFromGenre(trend);
        const mood = moodFromGenre(trend);
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">#${index + 1} ${renderGenrePills(theme, mood)}</div>
          </div>
          <div class="badge warn">Hot</div>
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
    }
    else if (NATIONS.includes(state.ui.activeChart)) {
        entries = state.charts.nations[state.ui.activeChart] || [];
        size = CHART_SIZES.nation;
        scopeLabel = state.ui.activeChart;
        scopeKey = `nation:${state.ui.activeChart}`;
    }
    else {
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
        }
        else {
            entries = [];
            historyMissing = true;
        }
    }
    entries = Array.isArray(entries) ? entries : [];
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
        const weights = chartWeightsForScope(state.ui.activeChart || "global");
        const pct = (value) => Math.round(value * 100);
        meta.textContent = `Top ${size} | ${scopeLabel} | Weights S ${pct(weights.sales)}% / Stream ${pct(weights.streaming)}% / Air ${pct(weights.airplay)}% / Social ${pct(weights.social)}%`;
    }
    const globalLocked = state.ui.activeChart === "global" && entries.length < size;
    if (historyMissing) {
        $("chartList").innerHTML = `<div class="muted">No saved chart history for this week and scope.</div>`;
    }
    else if (globalLocked) {
        const remaining = Math.max(0, size - entries.length);
        $("chartList").innerHTML = `<div class="muted">Global chart unlocks when ${formatCount(size)} tracks are in circulation. ${formatCount(remaining)} more needed.</div>`;
    }
    else if (!entries.length) {
        $("chartList").innerHTML = `<div class="muted">No chart data yet.</div>`;
    }
    else {
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
            <div class="muted">${renderTrackGenrePills(track, { fallback: "Genre -" })}</div>
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
    if (!listEl)
        return;
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
            }
            else if (achievement.id === "REQ-08") {
                progressText = `Reach ${value.toFixed(2)}% / ${achievement.target}%`;
            }
            else if (achievement.id === "REQ-04") {
                progressText = `Best Q ${value} / ${achievement.target}`;
            }
            else if (achievement.id === "REQ-11") {
                progressText = `Net ${formatMoney(value)} / ${formatMoney(achievement.target)}`;
            }
            else {
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
    const questList = $("questList");
    if (!questList)
        return;
    if (!state.quests.length) {
        questList.innerHTML = `<div class="muted">No active quests.</div>`;
        return;
    }
    const list = state.quests.map((quest) => {
        let detail = "";
        if (quest.type === "releaseCount")
            detail = `${quest.progress}/${quest.target} released`;
        if (quest.type === "trendRelease")
            detail = `${quest.progress}/${quest.target} released`;
        if (quest.type === "countryTop")
            detail = quest.bestRank ? `Best rank #${quest.bestRank}` : "No chart entries";
        if (quest.type === "cash")
            detail = `${formatMoney(quest.progress)} / ${formatMoney(quest.target)}`;
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
            ? `${modeTag ? `${modeTag} ` : ""}Week ${week} | ${formatMoney(cash)} | ${savedAt}`
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
function updateGenrePreview() {
    const themeSelect = $("themeSelect");
    const moodSelect = $("moodSelect");
    if (!themeSelect || !moodSelect)
        return;
    const theme = themeSelect.value;
    const mood = moodSelect.value;
    const preview = $("genrePreview");
    if (!preview)
        return;
    if (!theme || !mood) {
        preview.textContent = "Planned Genre: -";
        return;
    }
    preview.innerHTML = `Planned Genre: ${renderGenrePills(theme, mood)}`;
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
        const crewLabel = lead ? (crew.length > 1 ? `${lead.name} +${crew.length - 1}` : lead.name) : null;
        return {
            slot: Number.isFinite(order.studioSlot) ? order.studioSlot : null,
            trackTitle: track ? track.title : "Unknown Track",
            creatorName: crewLabel,
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
            return "Assign a Performer ID to create the demo recording.";
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
}
function renderActiveView(view) {
    const raw = view || state.ui.activeView || "dashboard";
    const active = raw === "promotion" ? "logs" : raw === "era" ? "eras" : raw;
    if (active === "dashboard") {
        renderDashboard();
    }
    else if (active === "charts") {
        renderCharts();
        renderReleaseDesk();
        renderSlots();
    }
    else if (active === "create") {
        renderCreateStageControls();
        renderSlots();
        renderTracks();
        renderCreateTrends();
        updateGenrePreview();
    }
    else if (active === "releases") {
        renderCalendarView();
        renderReleaseDesk();
        renderTracks();
        renderSlots();
    }
    else if (active === "eras") {
        renderEraStatus();
        renderSlots();
        renderTracks();
    }
    else if (active === "roster") {
        renderCreators();
        renderActs();
        renderSlots();
    }
    else if (active === "world") {
        renderMarket();
        renderPopulation();
        renderGenreIndex();
        renderEconomySummary();
        renderQuests();
        renderTopBar();
    }
    else if (active === "logs") {
        renderSlots();
        renderEventLog();
        renderWallet();
        renderResourceTickSummary();
        renderLossArchives();
    }
}
function renderAll({ save = true } = {}) {
    syncLabelWallets();
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
    if (save)
        saveToActiveSlot();
}
export { refreshSelectOptions, updateActMemberFields, renderAutoAssignModal, renderTime, renderStats, renderSlots, renderActs, renderCreators, renderEraStatus, renderTracks, renderReleaseDesk, renderQuickRecipes, renderCalendarView, renderCalendarList, renderGenreIndex, renderCommunityRankings, renderStudiosList, renderRoleActions, renderCharts, renderWallet, renderLossArchives, renderResourceTickSummary, renderSocialFeed, renderMainMenu, renderRankingModal, renderRankingWindow, renderAll, renderActiveStudiosSelect, renderCreateStageTrackSelect, renderCreateStageControls, renderActiveView, renderMarket, renderEventLog, renderSystemLog, renderTrends, renderCommunityLabels, renderTopBar, renderPopulation, renderEconomySummary, renderActiveCampaigns, renderInventory, renderWorkOrders, renderTrackHistoryPanel, renderRolloutStrategyPlanner, renderCreateTrends, renderAchievements, renderQuests, renderActiveArea, renderCalendarEraList, renderCreatorFallbackSymbols, renderCreatorAvatar, openMainMenu, closeMainMenu, updateGenrePreview, };
