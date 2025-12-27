// @ts-nocheck
function makeGenre(theme, mood) {
  if (!theme || !mood) return "";
  return `${theme} / ${mood}`;
}

function formatGenreLabel(theme, mood) {
  if (!theme || !mood) return "-";
  return `${theme.toLowerCase()} but it's ${mood.toLowerCase()}`;
}

function formatGenreKeyLabel(genre) {
  if (!genre) return "-";
  const parts = genre.split(" / ");
  if (parts.length !== 2) return genre;
  return formatGenreLabel(parts[0], parts[1]);
}

function themeFromGenre(genre) {
  if (!genre) return "";
  return genre.split(" / ")[0];
}

function moodFromGenre(genre) {
  if (!genre) return "";
  return genre.split(" / ")[1];
}

function themeColor(theme) {
  return THEME_COLORS[theme] || "var(--accent)";
}

function countryColor(country) {
  return COUNTRY_COLORS[country] || "var(--accent)";
}

function countryDemonym(country) {
  if (!country) return "Unknown";
  return COUNTRY_DEMONYMS[country] || country;
}

const LABEL_ACRONYM_MAP = {
  "Annglora Record Label": "ARL1",
  "International Record Label": "ARL2",
  "Hann Record Label": "ARL3",
  "Bytenza Record Label": "BRL1",
  "Strongbow Record Label": "BRL2",
  "Blackmount Record Label": "BRL3",
  "Crowlya Record Label": "CRL1",
  "Community Record Label": "CRL2"
};

function labelAcronymFromName(labelName) {
  const key = String(labelName || "").trim();
  if (!key) return "";
  return LABEL_ACRONYM_MAP[key] || "";
}

function deriveLabelAcronym(labelName) {
  const raw = String(labelName || "").trim();
  if (!raw) return "";
  const ignore = new Set(["record", "label"]);
  const initials = raw
    .split(/\s+/)
    .filter((word) => word && !ignore.has(word.toLowerCase()))
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
  return initials || "";
}

function resolveLabelAcronym(labelName, fallback = "") {
  const mapped = labelAcronymFromName(labelName);
  if (mapped) return mapped;
  const fallbackText = String(fallback || "").trim();
  if (fallbackText) return fallbackText;
  return deriveLabelAcronym(labelName);
}

function alignmentClass(alignment) {
  return alignment ? alignment.toLowerCase() : "neutral";
}

function slugify(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

export {
  alignmentClass,
  countryColor,
  countryDemonym,
  resolveLabelAcronym,
  formatGenreKeyLabel,
  formatGenreLabel,
  makeGenre,
  moodFromGenre,
  slugify,
  themeColor,
  themeFromGenre
};
