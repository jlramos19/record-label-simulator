# Content Production Costs (Web MVP)

## Intent
Define how sheet/demo/master costs scale with quality inputs, and how creator skill interacts with stamina and modifiers.

## Stage Cost Tiers
- Sheet (Songwriter): free to very cheap. Base cost 50.
- Demo (Recorder): cheap to regular. Base cost 500.
- Master (Producer): costly to very expensive. Base cost 2500.

Costs are charged per stage when that stage begins (not all up front).

## Cost Scaling
Stage cost formula:
- stageCost = baseCost * crewMultiplier * skillMultiplier + modifierCost
- crewMultiplier: +10% per additional assigned creator beyond the first.
- skillMultiplier: 0.85 to 1.45 based on average crew skill.
- modifierCost: per-stage delta from the selected modifier.
- Final cost is clamped to >= 0 and rounded.

## Quality Inputs
Quality potential combines:
- Base score with a small random drift.
- Effective skill per role (skill adjusted by stamina ratio).
- Theme/Mood preference matches.
- Modifier quality delta.
- Boring mood penalty.

Stamina reduces effective skill even if the stage can start, so low stamina lowers quality.

## Modifier Tools Pricing
- Modifiers are purchased as tools from the Community tab before they appear in Create.
- Each modifier has a base price; the buy cost is inflation-adjusted (2% annually) from the label start year.
- Modifier quality boosts apply only when the tool focus matches the track mood/theme/alignment (if specified).

## Skill Drift
- Skill gains on stage completion; higher stages grant more progress than earlier stages.
- Skill decays after sustained inactivity; decay is gradual and resets when the creator works again.

## Creator Market Supply + Demand
- CCC refreshes daily, rebalancing supply to the baseline per role.
- Each signing increases short-term market heat for that role; heat decays weekly.
- Sign cost and acceptance chance use market pressure (supply + heat) on top of role + skill factors.

## UX Notes
- Create Content should surface the current stage cost and warn if cash is insufficient.
- Recommendations should mention when Focus Era content is favored or when market pressure inflates signing costs.
