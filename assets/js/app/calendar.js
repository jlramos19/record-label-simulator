// Lightweight calendar Gantt renderer for the calendar modal
(function () {
  function formatWeekIndex(i) {
    return `W${i}`;
  }

  function renderCalendarGantt(containerId = 'calendarFullList', months = 12) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'gantt-wrapper';
    // weeks to show: months * 4 (approx)
    const weeks = Math.max(12, months * 4);

    const header = document.createElement('div');
    header.className = 'gantt-header';
    for (let w = 0; w < weeks; w++) {
      const cell = document.createElement('div');
      cell.className = 'gantt-cell gantt-header-cell';
      cell.textContent = (w % 4 === 0) ? `M${Math.floor(w / 4) + 1}` : '';
      header.appendChild(cell);
    }
    wrapper.appendChild(header);

    const lanes = document.createElement('div');
    lanes.className = 'gantt-lanes';

    // show scheduled releases if available, otherwise placeholders
    const releases = (window.state && window.state.releaseQueue) ? window.state.releaseQueue : [];
    const rows = releases.length ? releases : new Array(4).fill(null).map((_, i) => ({ title: `Slot ${i+1}`, scheduledWeeks: [] }));

    rows.slice(0, 12).forEach((r, idx) => {
      const row = document.createElement('div');
      row.className = 'gantt-row';
      const title = document.createElement('div');
      title.className = 'gantt-title';
      title.textContent = r.title || (r.track ? r.track.title : `Row ${idx+1}`);
      row.appendChild(title);

      const track = document.createElement('div');
      track.className = 'gantt-track';
      for (let w = 0; w < weeks; w++) {
        const cell = document.createElement('div');
        cell.className = 'gantt-cell';
        // mark scheduled releases
        if (r.scheduledWeek !== undefined && r.scheduledWeek === w) {
          const mark = document.createElement('div');
          mark.className = 'gantt-mark';
          mark.title = r.title || 'Scheduled';
          cell.appendChild(mark);
        }
        track.appendChild(cell);
      }
      row.appendChild(track);
      lanes.appendChild(row);
    });

    wrapper.appendChild(lanes);
    container.appendChild(wrapper);
  }

  window.renderCalendarGantt = renderCalendarGantt;

  // auto-render when modal is opened
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('calendarBtn');
    if (btn) btn.addEventListener('click', () => renderCalendarGantt('calendarFullList', 12));
  });
})();
