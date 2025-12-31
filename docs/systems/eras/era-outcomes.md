# Era Outcomes (Web MVP)

## Intent
Classify completed Eras as Flop, Mid, Successful, or Iconic using released content performance.

## Inputs
- Released tracks tied to the Era.
- Track economy totals: revenue, production cost, distribution fees, promo spend.
- Dominant alignment from Era tracks (fallback: Act, then Label alignment).
- Non-charting releases still count toward the Era outcome; chart positions surface as DNC/- in performance panels.

## Rules
- If no released tracks or profit < 0 -> Flop.
- New Acts (no prior Era): profitable -> Successful.
- Established Acts:
  - Risky alignment + profitable -> Iconic.
  - Safe alignment + profitable -> Mid.
  - Neutral alignment + profitable -> Successful.

## Data Stored
- `era.outcome` (label string).
- `era.outcomeStats` (track count, revenue, costs, profit, alignment, genre, hasPrior).
