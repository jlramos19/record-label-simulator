# Game Mechanic: Rollout Strategy of the Era of an Act in Record Label Simulator

In Record Label Simulator, the Player can design Rollout Strategies, to conduct the Act(s) Era. The Player can intervene and modify the Rollout Strategy at any point during gameplay.

## Rollout Template System (canon)

- Rollout strategies can be saved as templates.
- Each template stores:
  - Success score and profitability score.
  - The results that earned those scores.
  - An execution context snapshot (including what was trending at the time of rollout).

## Auto-Rollout Toggle (hooks)

- The UI includes an Auto Rollout toggle that enables rule-driven rollout execution.
- The toggle only enables the hook/state; rollout rules and conditions are defined separately.

## Early-Game Discovery

- Early game templates are discovered by JL and the 7 AI Record Labels experimenting per era.
- Template confidence grows from outcomes over time (first-win does not dominate).

## Auto-Run (Idle) Rollout Option

- The Player can toggle a Rollout Strategy to auto-run once gating conditions are met.
- Auto-run does not bypass readiness: content must be complete, slots must be free, and calendar windows must be valid.
- Specific condition rules are tracked in `docs/pending-concepts.md` until fully specified.
