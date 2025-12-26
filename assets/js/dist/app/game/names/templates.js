const ACT_ADJECTIVES_EN = [
    "Blue",
    "Red",
    "Green",
    "Black",
    "White",
    "Golden",
    "Silver",
    "Tall",
    "Long",
    "Short",
    "Soft",
    "Rough",
    "Big",
    "Small",
    "Warm",
    "Cold",
    "Fast",
    "Heavy",
];
const ACT_NOUNS_EN = [
    "Pencils",
    "Roses",
    "Lilies",
    "Pines",
    "Wolves",
    "Foxes",
    "Owls",
    "Lions",
    "Drums",
    "Lanterns",
    "Keys",
    "Comets",
];
const ACT_ADJECTIVES_ES = [
    "Azules",
    "Rojos",
    "Verdes",
    "Negros",
    "Blancos",
    "Dorados",
    "Plateados",
    "Altos",
    "Largos",
    "Cortos",
    "Suaves",
    "Rugosos",
    "Grandes",
    "Pequeños",
    "Cálidos",
    "Fríos",
    "Rápidos",
    "Pesados",
];
const ACT_NOUNS_ES = [
    "Lápices",
    "Lirios",
    "Pinos",
    "Lobos",
    "Zorros",
    "Halcones",
    "Leones",
    "Tambores",
    "Faroles",
    "Relojes",
    "Puentes",
    "Cometas",
];
const ACT_ADJECTIVES_KR = [
    { hangul: "파란", english: "Blue" },
    { hangul: "빨간", english: "Red" },
    { hangul: "초록", english: "Green" },
    { hangul: "검은", english: "Black" },
    { hangul: "하얀", english: "White" },
    { hangul: "황금", english: "Golden" },
    { hangul: "은빛", english: "Silver" },
    { hangul: "키 큰", english: "Tall" },
    { hangul: "긴", english: "Long" },
    { hangul: "짧은", english: "Short" },
    { hangul: "부드러운", english: "Soft" },
    { hangul: "거친", english: "Rough" },
    { hangul: "큰", english: "Big" },
    { hangul: "작은", english: "Small" },
    { hangul: "따뜻한", english: "Warm" },
    { hangul: "차가운", english: "Cold" },
    { hangul: "빠른", english: "Fast" },
    { hangul: "무거운", english: "Heavy" },
];
const ACT_NOUNS_KR = [
    { hangul: "연필들", english: "Pencils" },
    { hangul: "장미들", english: "Roses" },
    { hangul: "백합들", english: "Lilies" },
    { hangul: "소나무들", english: "Pines" },
    { hangul: "늑대들", english: "Wolves" },
    { hangul: "여우들", english: "Foxes" },
    { hangul: "올빼미들", english: "Owls" },
    { hangul: "사자들", english: "Lions" },
    { hangul: "북들", english: "Drums" },
    { hangul: "등불들", english: "Lanterns" },
    { hangul: "열쇠들", english: "Keys" },
    { hangul: "혜성들", english: "Comets" },
];
const buildActNamePairs = (adjectives, nouns, order = "adj-noun") => {
    const names = [];
    adjectives.forEach((adjective) => {
        nouns.forEach((noun) => {
            const left = order === "noun-adj" ? noun : adjective;
            const right = order === "noun-adj" ? adjective : noun;
            names.push(`${left} ${right}`.replace(/\s+/g, " ").trim());
        });
    });
    return names;
};
const buildTranslatedActNamePairs = (adjectives, nouns, order = "adj-noun") => {
    const names = [];
    const translations = {};
    adjectives.forEach((adjective) => {
        nouns.forEach((noun) => {
            const left = order === "noun-adj" ? noun : adjective;
            const right = order === "noun-adj" ? adjective : noun;
            const name = `${left.hangul} ${right.hangul}`.replace(/\s+/g, " ").trim();
            const translation = `${left.english} ${right.english}`.replace(/\s+/g, " ").trim();
            names.push(name);
            translations[name] = translation;
        });
    });
    return { names, translations };
};
const ACT_NAMES_EN = buildActNamePairs(ACT_ADJECTIVES_EN, ACT_NOUNS_EN);
const ACT_NAMES_ES = buildActNamePairs(ACT_ADJECTIVES_ES, ACT_NOUNS_ES, "noun-adj");
const { names: ACT_NAMES_KR, translations: ACT_NAME_TRANSLATIONS_KR } = buildTranslatedActNamePairs(ACT_ADJECTIVES_KR, ACT_NOUNS_KR);
const LEGACY_ACT_NAME_TRANSLATIONS = {
    "청룡단": "Cobalt Vanguard",
    "푸른 송곳니": "Azure Fang",
    "백호전선": "Ivory Front",
    "은빛 늑대": "Silver Wolf",
    "강철 매": "Steel Hawk",
    "사자 군단": "Lion Legion",
};
export const ACT_NAMES = [
    ...ACT_NAMES_EN,
    ...ACT_NAMES_ES,
    ...ACT_NAMES_KR,
];
export const LABEL_NAMES = [
    "Hann Record Label",
    "Annglora Record Label",
    "International Record Label",
    "Bytenza Record Label",
    "Strongbow Record Label",
    "Blackmount Record Label",
    "Crowlya Record Label",
    "Community Record Label",
];
export const NAME_PARTS = {
    labelPrefix: ["Aurora", "Crown", "Cinder", "Opal", "Signal", "Harbor", "Velvet", "Sunline", "Glass", "North", "Echo", "Nova", "Gold", "Silver", "Amber", "Drift"],
    labelSuffix: ["Records", "Record Label", "Audio", "Sound", "Works", "Collective", "Press", "Division", "Wave", "Guild", "District"],
    actPrefix: ACT_ADJECTIVES_EN,
    actSuffix: ACT_NOUNS_EN,
    projectPrefix: ["City", "Garden", "Atlas", "Map", "Lighthouse", "Chamber", "Signal", "Crown", "Glass", "Neon", "Shadow", "River", "Dawn", "Velvet", "Opal", "Cinder"],
    projectSuffix: ["of Glass", "of Noise", "of Ember", "of Dawn", "of Dust", "of Echoes", "Phase", "Archive", "Season", "Drift", "Route", "Bloom", "Ritual", "Circuit", "Harbor", "Tide"],
    trackVerb: ["Fading", "Hollow", "Paper", "Signal", "Orbit", "Chasing", "Breaking", "Calling", "Falling", "Rising", "Holding", "Running", "Tracing", "Counting", "Turning", "Shifting"],
    trackNoun: ["Satellites", "Radiance", "Crown", "Drift", "Bloom", "Glass", "Tide", "Shadow", "Pulse", "Echo", "Harbor", "District", "Moonlight", "Ember", "Voltage", "Mirage", "Namu"],
    eraDescriptor: ["Dawn", "Signal", "Crown", "Velvet", "Amber", "Nova", "Harbor", "Drift", "Echo", "Night", "Golden", "Midnight"],
    eraPhase: ["Phase", "Cycle", "Season", "Run", "Arc", "Wave", "Chapter", "Era", "Frame", "Bloom"],
};
export const TRACK_TITLE_TEMPLATES = [
    "{verb} {noun}",
    "{noun} {verb}",
    "{noun} Signal",
    "The {noun} {verb}",
];
export const PROJECT_TITLE_TEMPLATES = [
    "{prefix} {suffix}",
    "{prefix} {suffix}",
    "{prefix} {suffix}",
];
export const PROJECT_TITLES = [
    "City of Glass",
    "Atlas of Noise",
    "Garden of Ember",
    "Mapas del Viento",
    "Fuego en Agua",
    "Ruta Solar",
    "Mar de Cristal",
    "Lluvia Dorada",
    "Monologue",
    "Faint of Heart",
    "Cringe Is Subjective",
    "Into Me",
    "Irretrievably Broken",
    "Unwanted",
    "Lame",
    "Daggers",
    "De Atra Pa'lante",
    "Fading Hues, Shining Fate",
    "Trance: The Thirteenth Album",
    "Bloomville Hymns",
    "Campana Crown",
    "Belltown Directive",
    "FIRST VOW: PROVOKE",
    "RAGING AT THE MACHINE",
    "HEAT RISES",
    "유리의 도시",
    "소음의 아틀라스",
    "불씨의 정원",
    "첫 맹세: 도발",
    "기계를 향한 분노",
    "열기가 오른다",
];
export const ACT_NAME_TRANSLATIONS = {
    ...LEGACY_ACT_NAME_TRANSLATIONS,
    ...ACT_NAME_TRANSLATIONS_KR,
};
export const PROJECT_TITLE_TRANSLATIONS = {
    "유리의 도시": "City of Glass",
    "소음의 아틀라스": "Atlas of Noise",
    "불씨의 정원": "Garden of Ember",
    "첫 맹세: 도발": "FIRST VOW: PROVOKE",
    "기계를 향한 분노": "RAGING AT THE MACHINE",
    "열기가 오른다": "HEAT RISES",
};
export const ERA_NAME_TEMPLATES = [
    "{act}: Dawn Phase",
    "{act}: Signal Run",
    "{act}: Crown Cycle",
    "{act}: Velvet Season",
    "Project {act} - First Wave",
    "{act}: Longform Bloom",
];
//# sourceMappingURL=templates.js.map