# **`Record Label Simulator - Topodangle Visual Feedback System (VFX) v1`**

## **`Infobox - Systems`**

| `Property` | `Value` |
| :---- | :---- |
| `Name` | `Topodangle Visual Feedback` |
| `Type` | `System (UI/VFX feedback)` |
| `Symbol` | `Triangular bipyramid (Topodangle)` |
| `Purpose` | `Instant, readable feedback on Creator decisions/events without text walls` |
| `Links` | `Alignment · Themes · Moods · Trends/Charts` |

## **`Purpose`**

`Provide bite-size, branded visual feedback for Creator decisions and systemic events. Uses canon: Creator role, Alignment (Safe/Neutral/Risky), Preferred Theme (5), Preferred Mood (9). Charts is an in-game system (PvP/leaderboards only for specials). The Topodangle reacts visually as branding feedback, not a mechanic.`

## **`Visual Language (states)`**

* `Idle: subtle float + faint rim glow (1-2% scale oscillation, 4s loop).`  
* `Positive (Safe/clean success): refract pulse + soft bloom (150ms in / 250ms out).`  
* `Neutral: single pulse (scale 1.03) + brief desaturation reset.`  
* `Risky (minor fail/controversy): hairline cracks with a dust puff; auto-heal after 800ms.`  
* `Failure (hard fail): glass-shatter burst (shards + dust), quick reassemble to idle (~1.1s).`  
* `High-Drama (spikes/Beef): fast flip/tilt with chromatic fringe, then settle.`  
* `Brand/Sponsor moment: edge glow in brand color + slow orbit (500ms).`  
* `Info-only (peek/roadmap): soft halo; no motion (accessibility-safe).`

## **`Event -> Cue map`**

| `Event (example)` | `Cue` | `Particles` | `Shader/Material` | `Audio` |
| :---- | :---- | :---- | :---- | :---- |
| `Support Single (on-roadmap)` | `Refract pulse` | `Confetti micro (8-12 sprites)` | `Fresnel + bloom` | `Soft chime` |
| `Decline (repeat)` | `Hairline cracks` | `Dust micro (10-20 quads)` | `Crack mask lerp 0->0.4` | `Low tick` |
| `Postpone (with rationale)` | `Single pulse` | `None` | `Brief desaturation` | `Light thunk` |
| `Ignore` | `Dull dim` | `None` | `Lower emission` | `Subtle click` |
| `Sponsorship Accept` | `Edge glow (brand color)` | `None` | `Emissive rim` | `Whoosh in` |
| `Sponsorship Negotiate` | `Edge glow (half)` | `None` | `Emissive rim 50%` | `Soft tap` |
| `Befriend (similarity)` | `Gentle flip` | `None` | `Clean` | `Light arp` |
| `Beef (similarity)` | `Fast flip + crack flash` | `Dust micro` | `Crack mask 0.2` | `Crowd murmur swell` |
| `Ops: Hire` | `Refract pulse` | `None` | `Clean` | `Confirm tick` |
| `Ops: Outsource` | `Pulse + faint crack` | `Dust micro` | `Crack 0.1` | `Tap` |

`Severity scaling: Safe -> no cracks; Neutral -> tiny rim noise; Risky -> visible hairlines; Failure -> full shatter.`

## **`Color & theming hooks`**

* `Primary tint: derive from Preferred Theme.`  
* `Accent tint: derive from Preferred Mood (e.g., Thrilling = higher saturation; Calming = lower saturation).`  
* `Country contextual tint (optional): Annglora = greens, Bytenza = blues, Crowlya = golds (used sparingly behind the logo).`

## **`Timing & motion (safe defaults)`**

* `Micro-interactions: 150-450ms (ease in/out cubic).`  
* `Big moments (shatter/reassemble): 900-1100ms total.`  
* `Never exceed 1.2s for UI feedback.`

## **`Accessibility`**

* `Reduced motion: switch flips/shatters to fade/halo only.`  
* `Photosensitivity: cap bloom, remove chromatic aberration; keep peak brightness under UI guideline.`

## **`Implementation notes (web-friendly)`**

* `Shader Graph: Fresnel rim, crack mask (Voronoi/tri-planar), dissolve ramp for reassemble.`  
* `Particle System / VFX Graph:`  
*   `- DustPuff_S: 6-12 quads, 0.25s lifetime, gravity 0.2.`  
*   `- Shatter_S: mesh shards (<=40 pieces), burst 1 frame, 0.6s lifetime, sub-emitter DustPuff_S.`  
* `Post-processing: mild bloom only; clamp intensity for accessibility.`  
* `Budget targets: <=1 draw call per state change; <=500 live particle quads; mobile-safe.`

## **`Asset naming (examples)`**

* `VFX_Topo_Pulse_Pos · VFX_Topo_Pulse_Neu · VFX_Topo_Crack_Min · VFX_Topo_Shatter_Reassemble`  
* `MAT_Topo_Fresnel · MAT_Topo_Crack`  
* `SFX_UI_Tick_Soft · SFX_UI_Chime_Short · SFX_UI_Whoosh_Brand · SFX_UI_Crowd_Murmur`

## **`Telemetry taps`**

* `vfx_event, cue_type, severity, theme, mood, result_after_7d (stream delta / sentiment split).`

`-- End --`
