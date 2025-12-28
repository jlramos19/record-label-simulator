# UI Theme Modes

This document defines the canonical UI neutral palettes for light/dark mode and the pill styling rules.
Neutral hex values are tuned for contrast and may deviate from the hex-step grid when art direction requires it.

## Dark Mode (Warm)

- Background base: `#0a0703`
- Background depth: `#0f0b06`
- Panel surface: `#1a1009`
- Panel depth: `#120b06`
- Text: `#f5d6b8`
- Muted text: `#c49b75`
- Lines: `#120805`
- Pill background: `#130b06`
- Pill risky background: `#f3d4b9`
- Pill ink: `#f5d6b8`
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
