const MOOD_EMOJIS = {
  Cheering: "\u{1F31E}",
  Saddening: "\u{1F4A7}",
  Angering: "\u{1F4A2}",
  Energizing: "\u26A1",
  Calming: "\u{1F54A}\uFE0F",
  Thrilling: "\u{1F525}",
  Uplifting: "\u2B06\uFE0F",
  Boring: "\u25AB",
  Daring: "\u2753"
};

const THEME_OPTION_FALLBACK = "var(--accent)";

function getMoodEmoji(mood) {
  return MOOD_EMOJIS[mood] || "";
}

function buildThemeOptions(prefixOptions = []) {
  const options = [];
  prefixOptions.forEach((option) => {
    if (!option) return;
    const { value, label } = option;
    options.push(`<option value="${value}">${label}</option>`);
  });
  const themePool = Array.isArray(THEMES) ? THEMES : [];
  themePool.forEach((theme) => {
    const color = (THEME_COLORS && THEME_COLORS[theme]) ? THEME_COLORS[theme] : THEME_OPTION_FALLBACK;
    const style = color ? ` style="color:${color};"` : "";
    options.push(`<option value="${theme}"${style}>${theme}</option>`);
  });
  return options.join("");
}

function buildMoodOptions(prefixOptions = []) {
  const options = [];
  prefixOptions.forEach((option) => {
    if (!option) return;
    const { value, label } = option;
    options.push(`<option value="${value}">${label}</option>`);
  });
  const moodPool = Array.isArray(MOODS) ? MOODS : [];
  moodPool.forEach((mood) => {
    const emoji = getMoodEmoji(mood);
    const label = emoji ? `${emoji} ${mood}` : mood;
    options.push(`<option value="${mood}">${label}</option>`);
  });
  return options.join("");
}

function setThemeSelectAccent(select) {
  if (!select) return;
  select.classList.add("theme-select");
  const theme = select.value;
  const color = (THEME_COLORS && THEME_COLORS[theme]) ? THEME_COLORS[theme] : "";
  if (color) {
    select.style.setProperty("--select-accent", color);
  } else {
    select.style.removeProperty("--select-accent");
  }
}

function bindThemeSelectAccent(select) {
  if (!select) return;
  setThemeSelectAccent(select);
  if (select.dataset.themeAccentBound) return;
  select.dataset.themeAccentBound = "1";
  select.addEventListener("change", () => setThemeSelectAccent(select));
}

export {
  buildMoodOptions,
  buildThemeOptions,
  bindThemeSelectAccent,
  getMoodEmoji,
  setThemeSelectAccent
};
