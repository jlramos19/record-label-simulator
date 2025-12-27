# Game Simulation Mechanics

## Overview
This document captures the current MVP simulation rules implemented in the web build. It focuses on cadence, population updates, chart scoring, trends, and promotions as they exist today.

## Time Cadence
- Hourly: production work orders progress, release queues check, rival releases process, and idle stamina regenerates.
- Weekly (every 168 in-game hours): charts update, trends update, economy update, era progression, quests refresh, and creator inactivity checks run.
- Yearly: population snapshot refreshes, annual winners resolve, and cumulative label points are recorded.

## Population Update Mechanics
- Updates once per in-game year (year tick).
- Starts in 2025 at 1,000,000,000. Tier floors at 5,000,000,000 and 7,500,000,000; hard cap at 12,500,000,000.
- Yearly growth uses a tier-based rate with light noise. After year 3000, year-over-year change is clamped within +/-3% of the prior year for stability.
- Era-based nation splits:
  - 2025-2100 Rebuild Era: 100% Annglora.
  - 2100-2200 Two-Country Era: 50% Annglora, 50% Bytenza.
  - 2200-2400 Three-Country Era: 50% Annglora, 25% Bytenza, 25% Crowlya.
  - 2400-4000 Campaign Era: target 52.5% / 33.3% / 14.2% with +/-5pp variance generated once per Campaign Era and held stable for that era.
  - 4000+: Post-Campaign Stabilization: 50% / 30% / 20%.
- Regions split into Capital vs Elsewhere using a 35% / 65% rule.

## Chart Scoring and Trends
- Every released track is scored per nation/region using:
  - Track quality.
  - Alignment match (+12 / -6).
  - Theme match (+8).
  - Mood match (+6).
  - Trend bonus (+10).
  - Promo bonus (+10).
  - Small random noise (+/-4).
  - Weekly decay of 5% per week on chart (floor 40% of base).
- Chart sizes: Global Top 100, Nation Top 40, Region Top 10.
- Trends update weekly from global chart scores; top 3 non-Boring genres become the weekly trends.

## Promotions and Market Aging
- Promo pushes add 1-4 promo weeks to a track; each weekly update reduces promo weeks by 1.
- Market tracks age off charts after 12 weeks on chart.

## Economy Snapshot (Current MVP)
- Weekly revenue is derived from global chart scores (score * 22).
- Weekly upkeep includes creator headcount, owned studio slots, and lease fees.
