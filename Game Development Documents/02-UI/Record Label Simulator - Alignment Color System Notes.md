# **`Record Label Simulator – Alignment & Color System Notes`**

*`Last updated: 2025-12-06`*

## **`1. Alignment`**

**`Canonical name for the stat:`** `Alignment`  
**`Values:`** `Safe, Neutral, Risky`

**`Purpose:`** `Alignment describes how a project/artist/brand leans tonally and morally, not how famous or respected they are overall.`

- **`Safe`** `– Non-controversial, broadly acceptable, brand-friendly.`  
- **`Neutral`** `– Mixed or ambiguous tone; neither clearly safe nor clearly risky.`  
- **`Risky`** `– Edgy, provocative, challenging, or controversial.`

### **`1.1 Alignment visual language (grayscale)`**

`Alignment is intentionally represented in grayscale, to keep it visually distinct from Country and Theme colors:`

- **`Safe:`** `White → #FFFFFF`  
- **`Neutral:`** `Mid Gray → #999999 (approximate, can be adjusted slightly)`  
- **`Risky:`** `Near Black → #000000 or #111111`

`Grayscale should appear as a subtle layer (icons, small tags, borders, status dots), not the dominant palette of the UI. It is a tonal overlay on top of more colorful systems (Country & Theme).`

---

## **`2. Country Colors (canonical)`**

`Each country has a single canonical base color that represents it visually across UI, logos, and worldbuilding.`

| `Country` | `Color Name` | `HEX` |
| :---- | :---- | :---- |
| `Annglora` | `Periwinkle` | `#CC99FF` |
| `Bytenza` | `Blue` | `#0000FF` |
| `Crowlya` | `Yellow` | `#FFFF00` |

`These colors are country identity, not content genre or mood.`  
`Any brand, label, or store that is clearly tied to a country should use its country color as part of its palette (often as primary or secondary).`

`Example:`

- `Annglora brands should usually feature Periwinkle (#CC99FF) prominently.`

---

## **`3. Theme Colors (FLAMP → current names)`**

`Themes are content genre/mood meta-tags. Old names have been renamed:`

- `FREEDOM → Freedom`  
- **`Love → Loyalty`**  
- `MORALITY → Morality`

`Current canonical Theme set:`

| `Theme` | `Old Name` | `HEX` |
| :---- | :---- | :---- |
| `Freedom` | `Fulfillment` | `#00FFFF` |
| `Loyalty` | `Love` | `#FF33FF` |
| `Ambition` | `Ambition` | `#FF9900` |
| `Morality` | `MORALE` | `#00CC33` |
| `Power` | `Power` | `#FF3333` |

`Theme colors should be used for content genre / cosmetic identity, not for country or alignment.`  
`They can overlay with country colors (e.g., Annglora + Freedom), as long as Alignment stays in grayscale.`

---

## **`4. Layering Rules Summary`**

`When designing UI, logos, or brands in RLS, think in three separate color layers:`

1. **`Country Layer`** `– Where is this from?`  
     
   - `Uses: Periwinkle / White / Yellow.`

   

2. **`Theme Layer`** `– What FLAMP theme does it lean toward?`  
     
   - `Uses: Cyan / Magenta / Orange / Green / Red.`

   

3. **`Alignment Layer`** `– How tonally risky is it?`  
     
   - `Uses: Black / Gray / White (grayscale only).`

`These layers should never be collapsed into one, and Alignment in particular should not dominate the palette.`  

---

## **`5. UI Neutrals and Depth`**

- `UI shell uses a neutral dark-brown background baseline.`
- `Depth rule: deeper into a window or interaction, the surface is darker than its parent.`
- `UI neutrals must follow the hex-step grid rule (RGB channel values only: 00, 33, 66, 99, CC, FF).`
