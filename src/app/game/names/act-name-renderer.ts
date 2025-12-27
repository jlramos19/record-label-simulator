import { ACT_NAME_ADJECTIVES, ACT_NAME_NOUNS, romanizeHangul } from "./act-name-pools.js";
import { ActKind, parseActNameKey } from "./act-name-generator.js";

const HANGUL_REGEX = /[\uac00-\ud7a3]/;

export const hasHangulText = (value: string) => HANGUL_REGEX.test(String(value || ""));

const joinParts = (parts: Array<string | null | undefined>) =>
  parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

const normalizeActKind = (actKind?: ActKind | string): ActKind =>
  (actKind === "solo" ? "solo" : "group");

const resolveActNameParts = (nameKey: string) => {
  const parsed = parseActNameKey(nameKey);
  if (!parsed) return null;
  const adjective = ACT_NAME_ADJECTIVES[parsed.adjectiveId];
  const noun = ACT_NAME_NOUNS[parsed.nounId];
  if (!adjective || !noun) return null;
  return { adjective, noun };
};

const resolveSpanishAdjective = (adjective, nounGender: "m" | "f", actKind: ActKind) => {
  if (actKind === "solo") return nounGender === "f" ? adjective.es_f_s : adjective.es_m_s;
  return nounGender === "f" ? adjective.es_f_p : adjective.es_m_p;
};

export const renderActNameEnglish = (nameKey: string, actKind: ActKind = "group") => {
  const parts = resolveActNameParts(nameKey);
  if (!parts) return "";
  const noun = actKind === "solo" ? parts.noun.en.s : parts.noun.en.p;
  return joinParts([parts.adjective.en, noun]);
};

export const renderActNameSpanish = (nameKey: string, actKind: ActKind = "group") => {
  const parts = resolveActNameParts(nameKey);
  if (!parts) return "";
  const gender = parts.noun.es.gender === "f" ? "f" : "m";
  const noun = actKind === "solo" ? parts.noun.es.s : parts.noun.es.p;
  const adjective = resolveSpanishAdjective(parts.adjective, gender, actKind);
  return joinParts([noun, adjective]);
};

export const renderActNameKorean = (nameKey: string, actKind: ActKind = "group") => {
  const parts = resolveActNameParts(nameKey);
  if (!parts) return "";
  const noun = actKind === "solo" ? parts.noun.ko.s.hangul : parts.noun.ko.p.hangul;
  return joinParts([parts.adjective.ko.hangul, noun]);
};

export const renderActNameKoreanRomanized = (nameKey: string, actKind: ActKind = "group") => {
  const parts = resolveActNameParts(nameKey);
  if (!parts) return "";
  const noun = actKind === "solo" ? parts.noun.ko.s.rr : parts.noun.ko.p.rr;
  return joinParts([parts.adjective.ko.rr, noun]);
};

export const renderActNameByNation = (
  nameKey: string,
  nation = "Annglora",
  actKind: ActKind = "group"
) => {
  if (nation === "Bytenza") return renderActNameKorean(nameKey, actKind);
  if (nation === "Crowlya") return renderActNameSpanish(nameKey, actKind);
  return renderActNameEnglish(nameKey, actKind);
};

export const getActNameTranslation = (nameKey: string, actKind: ActKind = "group") =>
  renderActNameEnglish(nameKey, actKind);

type ActNameLookup = {
  translation: string;
  romanized: string;
};

const buildActNameLookup = () => {
  const adjectives = Object.values(ACT_NAME_ADJECTIVES);
  const nouns = Object.values(ACT_NAME_NOUNS);
  const group = new Map<string, ActNameLookup>();
  const solo = new Map<string, ActNameLookup>();
  adjectives.forEach((adjective) => {
    nouns.forEach((noun) => {
      const groupName = joinParts([adjective.ko.hangul, noun.ko.p.hangul]);
      if (!group.has(groupName)) {
        group.set(groupName, {
          translation: joinParts([adjective.en, noun.en.p]),
          romanized: joinParts([adjective.ko.rr, noun.ko.p.rr])
        });
      }
      const soloName = joinParts([adjective.ko.hangul, noun.ko.s.hangul]);
      if (!solo.has(soloName)) {
        solo.set(soloName, {
          translation: joinParts([adjective.en, noun.en.s]),
          romanized: joinParts([adjective.ko.rr, noun.ko.s.rr])
        });
      }
    });
  });
  return { group, solo };
};

const ACT_NAME_LOOKUP = buildActNameLookup();

export const lookupActNameDetails = ({
  name,
  nameKey,
  actKind
}: {
  name: string;
  nameKey?: string | null;
  actKind?: ActKind | string;
}) => {
  const raw = String(name || "").trim();
  if (!raw || !hasHangulText(raw)) {
    return { translation: "", romanized: "" };
  }
  const hintKind = normalizeActKind(actKind);
  let resolvedKind = hintKind;
  if (nameKey) {
    if (actKind == null) {
      const normalizedRaw = raw.replace(/\s+/g, " ").trim();
      const soloName = renderActNameKorean(nameKey, "solo");
      const groupName = renderActNameKorean(nameKey, "group");
      if (normalizedRaw === soloName) {
        resolvedKind = "solo";
      } else if (normalizedRaw === groupName) {
        resolvedKind = "group";
      }
    }
    const translation = renderActNameEnglish(nameKey, resolvedKind);
    const romanized = renderActNameKoreanRomanized(nameKey, resolvedKind);
    return { translation, romanized };
  }
  const lookup = resolvedKind === "solo" ? ACT_NAME_LOOKUP.solo : ACT_NAME_LOOKUP.group;
  const fallback = resolvedKind === "solo" ? ACT_NAME_LOOKUP.group : ACT_NAME_LOOKUP.solo;
  const entry = lookup.get(raw) || fallback.get(raw);
  if (entry) return entry;
  return { translation: "", romanized: romanizeHangul(raw) };
};
