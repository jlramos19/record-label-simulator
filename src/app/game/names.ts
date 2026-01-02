// @ts-nocheck
// Name pools mix lore vocabulary with language-specific lists; Hangul is preserved where required.

import { RLS_GIVEN_NAMES } from "./names/rls";
import { WESTERN_NAMES } from "./names/western";
import { LATIN_NAMES } from "./names/latin";
import { EAST_ASIAN_NAMES } from "./names/east-asian";
import {
  ANGLORAN_GIVEN_NAMES,
  ANGLORAN_GIVEN_NAMES_MAN,
  ANGLORAN_GIVEN_NAMES_NONBINARY,
  ANGLORAN_GIVEN_NAMES_WOMAN,
  ANGLORAN_SURNAMES
} from "./names/annglora";
import {
  CROWLYA_GIVEN_NAMES,
  CROWLYA_GIVEN_NAMES_MAN,
  CROWLYA_GIVEN_NAMES_NONBINARY,
  CROWLYA_GIVEN_NAMES_WOMAN,
  CROWLYA_SURNAMES
} from "./names/crowlya";
import {
  BYTENZA_GIVEN_NAMES_2_MAN,
  BYTENZA_GIVEN_NAMES_2_NONBINARY,
  BYTENZA_GIVEN_NAMES_2_WOMAN,
  BYTENZA_GIVEN_NAMES_2,
  BYTENZA_GIVEN_NAMES_3_MAN,
  BYTENZA_GIVEN_NAMES_3_NONBINARY,
  BYTENZA_GIVEN_NAMES_3_WOMAN,
  BYTENZA_GIVEN_NAMES_3,
  BYTENZA_GIVEN_NAMES_4_MAN,
  BYTENZA_GIVEN_NAMES_4_NONBINARY,
  BYTENZA_GIVEN_NAMES_4_WOMAN,
  BYTENZA_GIVEN_NAMES_4,
  BYTENZA_GIVEN_NAMES_ALL,
  BYTENZA_GIVEN_NAMES_MAN,
  BYTENZA_GIVEN_NAMES_NONBINARY,
  BYTENZA_GIVEN_NAMES_WOMAN,
  BYTENZA_SURNAMES
} from "./names/bytenza";
import {
  ERA_NAME_TEMPLATES,
  LABEL_NAMES,
  NAME_PARTS,
  PROJECT_TITLE_TEMPLATES,
  PROJECT_TITLE_TRANSLATIONS,
  PROJECT_TITLES,
  TRACK_TITLE_TEMPLATES
} from "./names/templates";

const CREATOR_NAME_PARTS = {
  // Annglora = English-language pool
  Annglora: {
    given: ANGLORAN_GIVEN_NAMES,
    givenByGender: {
      man: ANGLORAN_GIVEN_NAMES_MAN,
      woman: ANGLORAN_GIVEN_NAMES_WOMAN,
      nonbinary: ANGLORAN_GIVEN_NAMES_NONBINARY
    },
    surname: ANGLORAN_SURNAMES
  },
  // Bytenza = Korean-language pool
  Bytenza: {
    given: BYTENZA_GIVEN_NAMES_ALL,
    givenByGender: {
      man: BYTENZA_GIVEN_NAMES_MAN,
      woman: BYTENZA_GIVEN_NAMES_WOMAN,
      nonbinary: BYTENZA_GIVEN_NAMES_NONBINARY
    },
    given2: BYTENZA_GIVEN_NAMES_2,
    given2ByGender: {
      man: BYTENZA_GIVEN_NAMES_2_MAN,
      woman: BYTENZA_GIVEN_NAMES_2_WOMAN,
      nonbinary: BYTENZA_GIVEN_NAMES_2_NONBINARY
    },
    given3: BYTENZA_GIVEN_NAMES_3,
    given3ByGender: {
      man: BYTENZA_GIVEN_NAMES_3_MAN,
      woman: BYTENZA_GIVEN_NAMES_3_WOMAN,
      nonbinary: BYTENZA_GIVEN_NAMES_3_NONBINARY
    },
    given4: BYTENZA_GIVEN_NAMES_4,
    given4ByGender: {
      man: BYTENZA_GIVEN_NAMES_4_MAN,
      woman: BYTENZA_GIVEN_NAMES_4_WOMAN,
      nonbinary: BYTENZA_GIVEN_NAMES_4_NONBINARY
    },
    surname: BYTENZA_SURNAMES
  },
  // Crowlya = Spanish-language pool
  Crowlya: {
    given: CROWLYA_GIVEN_NAMES,
    givenByGender: {
      man: CROWLYA_GIVEN_NAMES_MAN,
      woman: CROWLYA_GIVEN_NAMES_WOMAN,
      nonbinary: CROWLYA_GIVEN_NAMES_NONBINARY
    },
    surname: CROWLYA_SURNAMES
  }
};

export {
  CREATOR_NAME_PARTS,
  EAST_ASIAN_NAMES,
  ERA_NAME_TEMPLATES,
  LABEL_NAMES,
  LATIN_NAMES,
  NAME_PARTS,
  PROJECT_TITLE_TEMPLATES,
  PROJECT_TITLE_TRANSLATIONS,
  PROJECT_TITLES,
  RLS_GIVEN_NAMES,
  TRACK_TITLE_TEMPLATES,
  WESTERN_NAMES
};

export * from "./names/act-name-pools";
export * from "./names/act-name-generator";
export * from "./names/act-name-renderer";
