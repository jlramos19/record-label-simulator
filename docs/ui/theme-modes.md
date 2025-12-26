# UI Theme Modes

This document defines the canonical UI neutral palettes for light/dark mode and the pill styling rules.
All neutral hex values follow the hex-step grid rule (00/33/66/99/CC/FF).

## Dark Mode (Warm)

- Background base: `#330000`
- Background depth: `#333300`
- Panel surface: `#663300`
- Panel depth: `#333300`
- Text: `#ffcc99`
- Muted text: `#cc9966`
- Lines: `#663333`
- Pill background: `#330000`
- Pill risky background: `#ffcc99`
- Pill ink: `#ffcc99`
- Pill shadow: `-2px 2px 0 #000000`

## Light Mode (Cool)

- Background base: `#ccffff`
- Background depth: `#99ccff`
- Panel surface: `#99ccff`
- Panel depth: `#6699cc`
- Text: `#003366`
- Muted text: `#336699`
- Lines: `#6699cc`
- Pill background: `#003366`
- Pill risky background: `#ccffff`
- Pill ink: `#ffffff`
- Pill shadow: `-2px 2px 0 #000000`

## Pill Color Rules

- Pill/tag backgrounds use the mode palette; text and borders use the pill color (currentColor).
- Theme/country/alignment tags set their text + border to the identity color.
- Mood tags use the alignment grayscale (Safe `#ffffff`, Neutral `#999999`, Risky `#000000`); default is Neutral if no alignment context is available.
