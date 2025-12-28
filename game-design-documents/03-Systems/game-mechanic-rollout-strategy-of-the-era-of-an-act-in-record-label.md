# Game Mechanic: Rollout Strategy Plans in Record Label Simulator

In Record Label Simulator, the Player can design Rollout Strategy Plans to conduct an Act's Era or to focus on a single release, project release, tour, or promo campaign. The Player can intervene and modify the Rollout Strategy Plan at any point during gameplay.

## Rollout Plan Library (canon)

- Rollout strategies are saved into a shared Plan Library (starter plans + player-used plans + rival-used plans).
- Each plan stores:
  - Success score and profitability score.
  - The results that earned those scores.
  - An execution context snapshot (including trend rank positions at the time of release).

## Multipurpose Scope

- Plans can scope to an Era, a single release, a project release, a tour, or a promo campaign.
- Scope is stored on the plan so outcomes can be compared across similar focus targets.

## Auto-Rollout Toggle (hooks)

- The UI includes an Auto Rollout toggle that enables rule-driven rollout execution.
- The toggle only enables the hook/state; rollout rules and conditions are defined separately.

## Early-Game Discovery

- Early game plans are discovered by JL and the 7 AI Record Labels experimenting per era.
- Template confidence grows from outcomes over time (first-win does not dominate).

## Auto-Run (Idle) Rollout Option

- The Player can toggle a Rollout Strategy to auto-run once gating conditions are met.
- Auto-run does not bypass readiness: content must be complete, slots must be free, and calendar windows must be valid.
- Specific condition rules are tracked in `docs/pending-concepts.md` until fully specified.
