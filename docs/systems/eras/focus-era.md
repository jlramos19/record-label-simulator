# Focus Era (Web MVP)

## Purpose
Focus Era is the player's single active context for Era decisions. It reduces decision load and keeps era planning readable when multiple Acts run concurrent Eras.

## How It Works
- Only one Era can be focused at a time.
- Focus can only be set on active Eras.
- If exactly one Era is active, focus auto-sets (no extra action needed).
- Clearing focus returns to auto-focus behavior.

## Systems That Use Focus
- Recommendations: act selection for new plans favors the focused Era's Act.
- Era attachment: releases/schedules for that Act attach to the focused Era when available.
- Promotions: the Focus Era pick targets released tracks in that Era.
- UI: Focus status appears in the top bar, Era Desk, and Promotions panel.

## UX Guardrails
- Always display focus status with Era name, Act, and current stage.
- One-click Focus and Clear actions (no modal).
- If multiple active Eras and no focus selected, focus-only actions are disabled with a short hint.

## Challenge + Engagement
- Focusing is a strategic commitment. Unfocused Eras keep advancing, so missed weeks can reduce promotion impact.
- Switching focus is allowed, but the player must manage tradeoffs between competing Era timelines.
