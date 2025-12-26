// @ts-nocheck
function makeGenre(theme, mood) {
    if (!theme || !mood)
        return "";
    return `${theme} / ${mood}`;
}
function formatGenreLabel(theme, mood) {
    if (!theme || !mood)
        return "-";
    return `${theme.toLowerCase()} but it's ${mood.toLowerCase()}`;
}
function formatGenreKeyLabel(genre) {
    if (!genre)
        return "-";
    const parts = genre.split(" / ");
    if (parts.length !== 2)
        return genre;
    return formatGenreLabel(parts[0], parts[1]);
}
function themeFromGenre(genre) {
    if (!genre)
        return "";
    return genre.split(" / ")[0];
}
function moodFromGenre(genre) {
    if (!genre)
        return "";
    return genre.split(" / ")[1];
}
function themeColor(theme) {
    return THEME_COLORS[theme] || "var(--accent)";
}
function countryColor(country) {
    return COUNTRY_COLORS[country] || "var(--accent)";
}
function countryDemonym(country) {
    if (!country)
        return "Unknown";
    return COUNTRY_DEMONYMS[country] || country;
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
export { alignmentClass, countryColor, countryDemonym, formatGenreKeyLabel, formatGenreLabel, makeGenre, moodFromGenre, slugify, themeColor, themeFromGenre };
//# sourceMappingURL=label-utils.js.map