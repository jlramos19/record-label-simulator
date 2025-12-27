# Creator Portrait Assets

## Purpose
- Organize Creator ID portrait images for future random assignment without renaming files.
- Keep filters aligned with gameplay properties (gender identity, nationality, preferences, age group).

## Canon folder root
- `assets/png/portraits/creator-ids/`

## Folder semantics (drop once => all tags apply)
- Content genre (Theme + Mood pairing, top folder)
- Age bin (visual bucket)
- Nationality + gender identity (leaf folder)

## Folder layout
- `assets/png/portraits/creator-ids/<theme>-<mood>/age-XX-YY/<nationality>-<gender-identity>/`
- `assets/png/portraits/creator-ids/content-genres.md` lists the canonical Theme + Mood folder names.

## Folder values (current)
- Nationality + gender identity:
  - `annglora-man`, `annglora-woman`, `annglora-nonbinary`
  - `bytenza-man`, `bytenza-woman`, `bytenza-nonbinary`
  - `crowlya-man`, `crowlya-woman`, `crowlya-nonbinary`
- Age bins:
  - `age-20-23`, `age-24-27`, `age-28-31`, `age-32-35`
  - `age-36-43`, `age-44-51`
  - `age-52-75`, `age-76-120`
- Content genre: `freedom-cheering` .. `power-daring` (see genre map)

## Usage notes
- Filenames are left untouched; only the folder path encodes classification.
- A portrait implies the age bin only, not an exact age.
- If no matching image exists, UI continues to use placeholders.
- Creator records include `age` (20-119) and `ageGroup` (4-year bin) for matching.
- Creator records include `genderIdentity` (man/woman/nonbinary) for matching.

## Auto-assignment (web MVP)
- Portraits auto-assign from `assets/js/data/creator-portraits.js` when available.
- Run `npm run build` (or `node scripts/build-creator-portrait-manifest.mjs`) after adding images to refresh the manifest.
- If required tags are missing or no images exist in a folder, placeholders remain; avatar tooltips surface the reason.
