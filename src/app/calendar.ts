type CalendarEvent = {
  id?: string;
  ts: number;
  title?: string;
  actName?: string;
  label?: string;
  labelColor?: string;
  kind?: string;
  typeLabel?: string;
  distribution?: string;
  className?: string;
  showLabel?: boolean;
};

type CalendarEraEntry = {
  id?: string;
  name?: string;
  actName?: string;
  stageName?: string;
  startedWeek?: number;
  content?: string;
};

type CalendarSources = {
  labelScheduled?: CalendarEvent[];
  labelReleased?: CalendarEvent[];
  tourScheduled?: CalendarEvent[];
  rivalScheduled?: CalendarEvent[];
  rivalReleased?: CalendarEvent[];
  eras?: CalendarEraEntry[];
};

type CalendarFilters = {
  labelScheduled?: boolean;
  labelReleased?: boolean;
  tourScheduled?: boolean;
  rivalScheduled?: boolean;
  rivalReleased?: boolean;
};

type CalendarProjectionConfig = {
  startEpochMs: number;
  anchorWeekIndex: number;
  pastWeeks?: number;
  futureWeeks?: number;
  activeWeeks?: number;
  tab?: string;
  filters?: CalendarFilters;
  sources?: CalendarSources;
};

const DAY_MS = HOUR_MS * 24;
const MAX_EVENTS_PER_DAY = 3;

function formatShortDate(epochMs) {
  const date = new Date(epochMs);
  const month = MONTHS[date.getUTCMonth()] || "Month";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${month.slice(0, 3)} ${day}, ${year}`;
}

function formatDayLabel(epochMs) {
  const date = new Date(epochMs);
  const dayName = DAYS[date.getUTCDay()] || "Day";
  return dayName.slice(0, 3);
}

function formatRangeLabel(startWeek, endWeek, startEpochMs, endEpochMs) {
  const weekLabel = startWeek === endWeek ? `Week ${startWeek}` : `Weeks ${startWeek}-${endWeek}`;
  return `${weekLabel} | ${formatShortDate(startEpochMs)} - ${formatShortDate(endEpochMs)}`;
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function toKebabCase(value) {
  return String(value || "event")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export function useCalendarProjection({
  startEpochMs,
  anchorWeekIndex,
  pastWeeks = 0,
  futureWeeks = 3,
  activeWeeks = 4,
  tab = "label",
  filters = {},
  sources = {}
}: CalendarProjectionConfig) {
  const labelScheduled = Array.isArray(sources.labelScheduled) ? sources.labelScheduled : [];
  const labelReleased = Array.isArray(sources.labelReleased) ? sources.labelReleased : [];
  const tourScheduled = Array.isArray(sources.tourScheduled) ? sources.tourScheduled : [];
  const rivalScheduled = Array.isArray(sources.rivalScheduled) ? sources.rivalScheduled : [];
  const rivalReleased = Array.isArray(sources.rivalReleased) ? sources.rivalReleased : [];
  const eras = Array.isArray(sources.eras) ? sources.eras : [];

  const showLabel = tab === "label" || tab === "public";
  const showRivals = tab === "public";
  const activeEvents = [];

  if (showLabel && filters.labelScheduled !== false) activeEvents.push(...labelScheduled);
  if (showLabel && filters.labelReleased !== false) activeEvents.push(...labelReleased);
  if (showLabel && filters.tourScheduled !== false) activeEvents.push(...tourScheduled);
  if (showRivals && filters.rivalScheduled !== false) activeEvents.push(...rivalScheduled);
  if (showRivals && filters.rivalReleased !== false) activeEvents.push(...rivalReleased);

  activeEvents.sort((a, b) => a.ts - b.ts);

  const safeAnchor = Number.isFinite(anchorWeekIndex) ? anchorWeekIndex : 0;
  const startWeekIndex = safeAnchor - Math.max(0, pastWeeks);
  const totalWeeks = Math.max(1, Math.max(0, pastWeeks) + Math.max(0, futureWeeks) + 1);
  const activeEndOffset = Math.max(0, activeWeeks - 1);

  const weeks = [];
  for (let i = 0; i < totalWeeks; i += 1) {
    const weekIndex = startWeekIndex + i;
    const offset = weekIndex - safeAnchor;
    const isPreview = offset < 0 || offset > activeEndOffset;
    const isAnchor = offset === 0;
    const weekStart = startEpochMs + weekIndex * WEEK_HOURS * HOUR_MS;
    const weekEnd = weekStart + WEEK_HOURS * HOUR_MS;
    const weekEvents = activeEvents.filter((event) => event.ts >= weekStart && event.ts < weekEnd);
    const days = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const dayStart = weekStart + dayIndex * DAY_MS;
      const dayEnd = dayStart + DAY_MS;
      const dayEvents = weekEvents.filter((event) => event.ts >= dayStart && event.ts < dayEnd);
      days.push({
        index: dayIndex,
        start: dayStart,
        end: dayEnd,
        dayLabel: formatDayLabel(dayStart),
        dateLabel: formatShortDate(dayStart),
        events: dayEvents,
        isPreview
      });
    }

    weeks.push({
      weekIndex,
      offset,
      isPreview,
      isAnchor,
      weekNumber: weekIndex + 1,
      start: weekStart,
      end: weekEnd,
      days,
      events: weekEvents
    });
  }

  const rangeStart = weeks[0]?.start ?? startEpochMs;
  const rangeEnd = weeks[weeks.length - 1]?.end ?? startEpochMs;
  const rangeLabel = formatRangeLabel(startWeekIndex + 1, startWeekIndex + totalWeeks, rangeStart, rangeEnd - 1);

  return {
    tab,
    filters,
    weeks,
    eras,
    rangeLabel
  };
}

export function CalendarDayCell(day) {
  const events = Array.isArray(day.events) ? day.events : [];
  const visible = events.slice(0, MAX_EVENTS_PER_DAY);
  const overflow = events.length - visible.length;
  const dayClass = day.isPreview ? "calendar-day is-preview" : "calendar-day";
  const eventHtml = visible.map((event) => {
    const typeLabel = event.typeLabel || "Event";
    const title = event.title || "Untitled";
    const actName = event.actName || "Unknown";
    const labelName = event.label || "Label";
    const distribution = event.distribution ? `, ${event.distribution}` : "";
    const detail = `${labelName} | ${actName} | ${title} (${typeLabel}${distribution})`;
    const kindClass = event.className || toKebabCase(event.kind || "event");
    const showLabel = event.showLabel && labelName;
    const labelColor = showLabel ? event.labelColor || "" : "";
    const labelStyle = labelColor ? ` style="--label-color:${escapeAttr(labelColor)}"` : "";
    const labelClass = labelColor ? " has-label-color" : "";
    const labelLine = showLabel ? `<span class="calendar-event-label">${labelName}</span>` : "";
    return `
      <div class="calendar-event calendar-event--${kindClass}${labelClass}"${labelStyle} title="${escapeAttr(detail)}">
        <span class="calendar-event-type">${typeLabel}</span>
        ${labelLine}
        <span class="calendar-event-title">${title}</span>
      </div>
    `;
  }).join("");
  const overflowHtml = overflow > 0
    ? `<div class="calendar-event calendar-event--more">+${overflow} more</div>`
    : "";

  return `
    <div class="${dayClass}" data-day-ts="${day.start}">
      <div class="calendar-day-head">
        <div class="calendar-day-name">${day.dayLabel}</div>
        <div class="calendar-day-date">${day.dateLabel}</div>
      </div>
      <div class="calendar-day-events">
        ${eventHtml || `<div class="calendar-day-empty">-</div>`}
        ${overflowHtml}
      </div>
    </div>
  `;
}

export function CalendarWeekRow(week) {
  const days = Array.isArray(week.days) ? week.days : [];
  const label = week.label || `Week ${week.weekNumber}`;
  const dayCells = days.map((day) => CalendarDayCell(day)).join("");
  const rowClass = [
    "calendar-week-row",
    week.isPreview ? "is-preview" : "",
    week.isAnchor ? "is-anchor" : ""
  ].filter(Boolean).join(" ");
  return `
    <div class="${rowClass}">
      <div class="calendar-week-label">${label}</div>
      <div class="calendar-week-days">
        ${dayCells}
      </div>
    </div>
  `;
}

export function CalendarView(projection) {
  const weeks = Array.isArray(projection.weeks) ? projection.weeks : [];
  if (!weeks.length) {
    return `<div class="muted">No calendar data available.</div>`;
  }
  const headerDays = Array.isArray(weeks[0]?.days) && weeks[0].days.length
    ? weeks[0].days.map((day, index) => day.dayLabel || DAYS[index] || "Day")
    : DAYS.map((day) => day.slice(0, 3));
  const header = headerDays.map((day) => `
    <div class="calendar-grid-day">${day.slice(0, 3)}</div>
  `).join("");
  const rows = weeks.map((week) => CalendarWeekRow(week)).join("");

  return `
    <div class="calendar-grid">
      <div class="calendar-grid-header">
        <div class="calendar-grid-spacer"></div>
        ${header}
      </div>
      ${rows}
    </div>
  `;
}
