# Creator Portrait Assets

## Purpose
- Organize Creator ID portrait images for future random assignment without renaming files.
- Keep filters aligned with gameplay properties (gender identity, nationality, preferences, age group).

## Canon folder root
- `assets/portraits/creator-ids/`

## Filters and folders
- `gender-identity/<identity>/`
- `nationality/<nation>/`
- `age-group/<range>/` (4-year spans, creators are 20+)
- `preferred-theme/<theme>/`
- `preferred-mood/<mood>/`
- `preferred-genre/<theme>-<mood>/` (Theme + Mood pairing)

## Folder values (current)
- Gender identity: `female`, `male`, `nonbinary`, `unspecified` (extend as needed)
- Nationality: `Annglora`, `Bytenza`, `Crowlya`
- Themes: `Freedom`, `Loyalty`, `Ambition`, `Morality`, `Power`
- Moods: `Cheering`, `Saddening`, `Thrilling`, `Angering`, `Calming`, `Energizing`, `Uplifting`, `Boring`, `Daring`
- Age groups: `20-23`, `24-27`, `28-31`, `32-35`, `36-39`, `40-43`, `44-47`, `48-51`, `52-55`, `56-59`, `60-63`, `64-67`, `68-71`, `72-75`, `76-79`, `80-83`, `84-87`, `88-91`, `92-95`, `96-99`, `100-103`, `104-107`, `108-111`, `112-115`, `116-119`

## Usage notes
- Place the same image in multiple folders when it matches multiple filters (theme + mood + identity, etc).
- Filenames are left untouched; only the folder path encodes classification.
- If no matching image exists, UI continues to use placeholders.
- Creator records now include `genderIdentity` (currently defaulting to null) for later mapping.
