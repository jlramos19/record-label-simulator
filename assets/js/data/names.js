const buildNamePool = (first, second, limit) => {
  const out = [];
  for (let i = 0; i < first.length; i += 1) {
    for (let j = 0; j < second.length; j += 1) {
      const name = `${first[i]}${second[j]}`.replace(/\s+/g, " ").trim();
      if (!name) continue;
      if (!out.includes(name)) out.push(name);
      if (out.length >= limit) return out;
    }
  }
  return out;
};

const EN_GIVEN_FIRST = ["Ad", "Al", "An", "Ben", "Cal", "Dan", "El", "Em", "Fin", "Gar", "Har", "Isa", "Jo", "Ka", "Le", "Mar", "No", "Ol", "Pa", "Ra", "Sa", "Ta", "Vi", "Wil", "Zo"];
const EN_GIVEN_SECOND = ["an", "en", "er", "ia", "ie", "on", "el", "y", "a", "in"];
const EN_SURNAME_FIRST = ["Ash", "Brook", "Calder", "Drake", "East", "Fair", "Grant", "Haw", "Lake", "Marsh", "North", "Oak", "Park", "Quill", "Reed", "Stone", "Thorn", "West", "Young", "Winter"];
const EN_SURNAME_SECOND = ["ton", "wood", "field", "son", "ley", "ford", "man", "well", "brook", "more"];

const ES_GIVEN_FIRST = ["Al", "Car", "Die", "Fer", "Gab", "Isa", "Lu", "Mar", "Noe", "Pa", "Ra", "Sa", "Vale", "Vic", "Est", "Jul", "Mig", "Cam", "Ana", "Sof"];
const ES_GIVEN_SECOND = ["a", "o", "ia", "io", "el", "go", "na", "ra", "to", "ta", "uel", "ina", "ita"];
const ES_SURNAME_FIRST = ["Del", "San", "Val", "Mor", "Nav", "Tor", "Cas", "Ram", "Fer", "Her", "Sal", "Dom", "Car", "Flo", "Gar", "Men", "Mir", "Ort", "Pad", "Riv"];
const ES_SURNAME_SECOND = ["ez", "es", "as", "os", "ado", "ero", "illa", "ana", "ano", "ales", "ido", "ino"];

const KR_GIVEN_FIRST = ["민", "서", "지", "현", "하", "도", "유", "세", "수", "예", "채", "윤", "태", "나", "영", "준", "은", "호", "재", "우", "기", "다", "라", "솔"];
const KR_GIVEN_SECOND = ["준", "윤", "림", "아", "빈", "혁", "우", "희", "영", "민", "호", "연", "진", "서", "별", "하", "솔", "나", "리", "경"];
const KR_SURNAME_FIRST = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "오", "한", "신", "서", "권", "황", "안", "송", "전", "홍", "유", "고", "문", "양", "손", "배", "남", "백", "변", "설"];
const KR_SURNAME_SECOND = ["", "태", "원", "진", "호"];

const CREATOR_NAME_PARTS = {
  Annglora: {
    given: buildNamePool(EN_GIVEN_FIRST, EN_GIVEN_SECOND, 120),
    surname: buildNamePool(EN_SURNAME_FIRST, EN_SURNAME_SECOND, 120)
  },
  Bytenza: {
    given: buildNamePool(KR_GIVEN_FIRST, KR_GIVEN_SECOND, 120),
    surname: buildNamePool(KR_SURNAME_FIRST, KR_SURNAME_SECOND, 120)
  },
  Crowlya: {
    given: buildNamePool(ES_GIVEN_FIRST, ES_GIVEN_SECOND, 120),
    surname: buildNamePool(ES_SURNAME_FIRST, ES_SURNAME_SECOND, 120)
  }
};
const ACT_NAMES = [
  "Neon Signal", "Velvet Atlas", "Opal Circuit", "Midnight Pulse", "Silver District", "Amber Ritual",
  "Cielo Roto", "Luz de Mar", "Fuego Azul", "Sombra Clara", "Rio Lunar", "Viento Dorado",
  "Glass Harbor", "Cinder Path", "Drift Temple", "City Halo", "Gold Crown", "Nova Tide"
];
const LABEL_NAMES = [
  "Hann Record Label",
  "Annglora Record Label",
  "International Record Label",
  "Bytenza Record Label",
  "Strongbow Record Label",
  "Blackmount Record Label",
  "Crowlya Record Label",
  "Community Record Label"
];
const NAME_PARTS = {
  labelPrefix: ["Aurora", "Crown", "Cinder", "Opal", "Signal", "Harbor", "Velvet", "Sunline", "Glass", "North", "Echo", "Nova", "Gold", "Silver", "Amber", "Drift"],
  labelSuffix: ["Records", "Record Label", "Audio", "Sound", "Works", "Collective", "Press", "Division", "Wave", "Guild", "District"],
  actPrefix: ["Neon", "Velvet", "Opal", "Midnight", "Silver", "Amber", "Cielo", "Luna", "Rio", "Sombra", "Nova", "Drift", "Glass", "Cinder", "Pulse", "Signal", "Haneul", "Saebyeok"],
  actSuffix: ["Signal", "Atlas", "Circuit", "Pulse", "District", "Ritual", "Harbor", "Tide", "Union", "Temple", "Garden", "Crown", "Echo", "Halo", "Parade", "Line"],
  projectPrefix: ["City", "Garden", "Atlas", "Map", "Lighthouse", "Chamber", "Signal", "Crown", "Glass", "Neon", "Shadow", "River", "Dawn", "Velvet", "Opal", "Cinder"],
  projectSuffix: ["of Glass", "of Noise", "of Ember", "of Dawn", "of Dust", "of Echoes", "Phase", "Archive", "Season", "Drift", "Route", "Bloom", "Ritual", "Circuit", "Harbor", "Tide"],
  trackVerb: ["Fading", "Hollow", "Paper", "Signal", "Orbit", "Chasing", "Breaking", "Calling", "Falling", "Rising", "Holding", "Running", "Tracing", "Counting", "Turning", "Shifting"],
  trackNoun: ["Satellites", "Radiance", "Crown", "Drift", "Bloom", "Glass", "Tide", "Shadow", "Pulse", "Echo", "Harbor", "District", "Moonlight", "Ember", "Voltage", "Mirage", "Namu"],
  eraDescriptor: ["Dawn", "Signal", "Crown", "Velvet", "Amber", "Nova", "Harbor", "Drift", "Echo", "Night", "Golden", "Midnight"],
  eraPhase: ["Phase", "Cycle", "Season", "Run", "Arc", "Wave", "Chapter", "Era", "Frame", "Bloom"]
};
const TRACK_TITLE_TEMPLATES = ["{verb} {noun}", "{noun} {verb}", "{noun} Signal", "The {noun} {verb}"];
const PROJECT_TITLE_TEMPLATES = ["{prefix} {suffix}", "{prefix} {suffix}", "{prefix} {suffix}"];
const PROJECT_TITLES = [
  "City of Glass", "Atlas of Noise", "Garden of Ember", "Mapas del Viento", "Fuego en Agua",
  "Ruta Solar", "Mar de Cristal", "Lluvia Dorada",
  "Monologue", "Faint of Heart", "Cringe Is Subjective", "Into Me", "Irretrievably Broken",
  "Unwanted", "Lame", "Daggers", "De Atra Pa'lante"
];
const ERA_NAME_TEMPLATES = [
  "{act}: Dawn Phase",
  "{act}: Signal Run",
  "{act}: Crown Cycle",
  "{act}: Velvet Season",
  "Project {act} - First Wave",
  "{act}: Longform Bloom"
];
