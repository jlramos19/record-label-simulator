// @ts-nocheck
// Name pools mix lore vocabulary with language-specific lists; Hangul is preserved where required.
import { RLS_GIVEN_NAMES } from "./names/rls.js";
import { WESTERN_NAMES } from "./names/western.js";
import { LATIN_NAMES } from "./names/latin.js";
import { EAST_ASIAN_NAMES } from "./names/east-asian.js";
import { ANGLORAN_GIVEN_NAMES, ANGLORAN_SURNAMES } from "./names/annglora.js";
import { CROWLYA_GIVEN_NAMES, CROWLYA_SURNAMES } from "./names/crowlya.js";
import { BYTENZA_GIVEN_NAMES_2, BYTENZA_GIVEN_NAMES_3, BYTENZA_GIVEN_NAMES_4, BYTENZA_GIVEN_NAMES_ALL, BYTENZA_SURNAMES } from "./names/bytenza.js";
import { ACT_NAMES, ERA_NAME_TEMPLATES, LABEL_NAMES, NAME_PARTS, PROJECT_TITLE_TEMPLATES, PROJECT_TITLES, TRACK_TITLE_TEMPLATES } from "./names/templates.js";
const CREATOR_NAME_PARTS = {
    // Annglora = English-language pool
    Annglora: {
        given: ANGLORAN_GIVEN_NAMES,
        surname: ANGLORAN_SURNAMES
    },
    // Bytenza = Korean-language pool
    Bytenza: {
        given: BYTENZA_GIVEN_NAMES_ALL,
        given2: BYTENZA_GIVEN_NAMES_2,
        given3: BYTENZA_GIVEN_NAMES_3,
        given4: BYTENZA_GIVEN_NAMES_4,
        surname: BYTENZA_SURNAMES
    },
    // Crowlya = Spanish-language pool
    Crowlya: {
        given: CROWLYA_GIVEN_NAMES,
        surname: CROWLYA_SURNAMES
    }
};
export { ACT_NAMES, CREATOR_NAME_PARTS, EAST_ASIAN_NAMES, ERA_NAME_TEMPLATES, LABEL_NAMES, LATIN_NAMES, NAME_PARTS, PROJECT_TITLE_TEMPLATES, PROJECT_TITLES, RLS_GIVEN_NAMES, TRACK_TITLE_TEMPLATES, WESTERN_NAMES };
