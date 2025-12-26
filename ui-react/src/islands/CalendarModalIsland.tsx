import React, { useEffect } from "react";
import { useRlsState } from "../bridge/useRlsState";
import { emitStateChanged, getRlsState } from "../bridge/state";
import { Pill } from "../components/Pill";
import { Tag } from "../components/Tag";

const CALENDAR_TABS = [
  { id: "label", label: "Label" },
  { id: "public", label: "Public" }
];

const CALENDAR_FILTERS = [
  { key: "labelScheduled", label: "Label Scheduled" },
  { key: "labelReleased", label: "Label Released" },
  { key: "rivalScheduled", label: "Rival Scheduled" },
  { key: "rivalReleased", label: "Rival Released" }
];

function formatHour(hour) {
  if (hour === 0) return "12AM";
  if (hour < 12) return `${hour}AM`;
  if (hour === 12) return "12PM";
  return `${hour - 12}PM`;
}

function formatDate(epochMs) {
  if (!Number.isFinite(epochMs)) return "-";
  const date = new Date(epochMs);
  const days = window.DAYS || ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = window.MONTHS || [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];
  const dayName = days[date.getUTCDay()] || "DAY";
  const monthName = months[date.getUTCMonth()] || "MON";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const year = date.getUTCFullYear();
  const hour = date.getUTCHours();
  return `${dayName} - ${monthName} ${day}, ${year} - ${formatHour(hour)}`;
}

function findRivalCountry(state, label) {
  const rivals = Array.isArray(state?.rivals) ? state.rivals : [];
  return rivals.find((entry) => entry.name === label)?.country || null;
}

function resolveLabelColor(state, entry) {
  if (entry?.labelColor) return entry.labelColor;
  const label = entry?.label || state?.label?.name || "Label";
  const country = findRivalCountry(state, label) || state?.label?.country || "Annglora";
  const colors = window.COUNTRY_COLORS || {};
  return colors[country] || "var(--accent)";
}

function resolveLabelTextColor(state, entry) {
  const label = entry?.label || state?.label?.name || "Label";
  const country = findRivalCountry(state, label) || state?.label?.country || "Annglora";
  return country === "Bytenza" ? "#ffffff" : "#000000";
}

function applyCalendarTab(tabId) {
  const bridge = window.rlsUi?.setCalendarTab;
  if (typeof bridge === "function") {
    bridge(tabId);
    return;
  }
  const state = getRlsState();
  if (!state) return;
  if (!state.ui) state.ui = {};
  state.ui.calendarTab = tabId;
  emitStateChanged();
}

function applyCalendarFilter(key, checked) {
  const bridge = window.rlsUi?.setCalendarFilter;
  if (typeof bridge === "function") {
    bridge(key, checked);
    return;
  }
  const state = getRlsState();
  if (!state) return;
  if (!state.ui) state.ui = {};
  if (!state.ui.calendarFilters) state.ui.calendarFilters = {};
  state.ui.calendarFilters[key] = checked;
  emitStateChanged();
}

function buildProjection() {
  const builder = window.rlsBuildCalendarProjection || window.rlsBridge?.buildCalendarProjection;
  if (typeof builder !== "function") return null;
  try {
    return builder({ pastWeeks: 0, futureWeeks: 11 });
  } catch (error) {
    console.warn("Calendar projection failed.", error);
    return null;
  }
}

export function CalendarModalIsland() {
  const state = useRlsState();

  useEffect(() => {
    const modal = document.getElementById("calendarModal");
    if (!modal) return;
    const legacy = modal.querySelectorAll("#calendarModalTabs, #calendarModalFilters, #calendarFullList");
    legacy.forEach((el) => el.classList.add("hidden"));
    return () => legacy.forEach((el) => el.classList.remove("hidden"));
  }, []);

  if (!state) {
    return <div className="muted">Calendar bridge waiting for state.</div>;
  }

  const rawTab = state.ui?.calendarTab;
  const tab = rawTab === "public" ? "public" : "label";
  const filters = state.ui?.calendarFilters || {};
  const projection = buildProjection();

  useEffect(() => {
    if (rawTab && rawTab !== tab) {
      applyCalendarTab(tab);
    }
  }, [rawTab, tab]);

  return (
    <div className="rls-react-calendar">
      <div className="tabs">
        {CALENDAR_TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={`tab${tab === entry.id ? " active" : ""}`}
            onClick={() => applyCalendarTab(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="filter-row">
        {CALENDAR_FILTERS.map((filter) => {
          const checked = filters[filter.key] !== false;
          return (
            <label key={filter.key} className="check-pill">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => applyCalendarFilter(filter.key, event.target.checked)}
              />
              {filter.label}
            </label>
          );
        })}
      </div>

      <div className="list">
        {!projection ? (
          <div className="muted">Calendar data is unavailable.</div>
        ) : projection.weeks?.length ? (
          projection.weeks.map((week) => {
            const entries = Array.isArray(week.events) ? week.events.slice().sort((a, b) => a.ts - b.ts) : [];
            return (
              <div key={`week-${week.weekNumber}`} className="list-item">
                <div className="list-row">
                  <div>
                    <div className="item-title">Week {week.weekNumber}</div>
                    <div className="muted">{formatDate(week.start)} - {formatDate(week.end - (window.HOUR_MS || 3600000))}</div>
                  </div>
                  <Pill label={`${entries.length} event(s)`} />
                </div>
                {entries.map((entry) => {
                  const label = entry.label || state.label?.name || "Label";
                  const color = resolveLabelColor(state, entry);
                  const textColor = resolveLabelTextColor(state, entry);
                  const actName = entry.actName || "Unknown";
                  const title = entry.title || "Untitled";
                  const typeLabel = entry.typeLabel || "Event";
                  const distribution = entry.distribution || "Digital";
                  return (
                    <div key={entry.id || `${label}-${entry.ts}-${title}`} className="muted">
                      <Tag label={label} bgColor={color} textColor={textColor} /> | {actName} | {title} ({typeLabel}, {distribution})
                    </div>
                  );
                })}
              </div>
            );
          })
        ) : (
          <div className="muted">No scheduled entries.</div>
        )}
      </div>
    </div>
  );
}
