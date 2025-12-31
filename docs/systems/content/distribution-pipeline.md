# Distribution Pipeline (Web MVP)

Defines how release distribution timing, physical eligibility, inventory, and store capacity behave in the web simulation.

## Distribution types
- Digital: fastest route; default option.
- Physical: manufactured inventory sold through shopping centers.
- Both: split between digital + physical channels (physical share is capped by capacity).

## Lead times + rush
- Digital lead time: 1 week (scheduled to the next eligible Friday 00:00 window).
- Physical/Both lead time: 2 weeks (scheduled to the next eligible Friday 00:00 window).
- Digital rush: optional manual override that reduces the digital lead time to 0 at a rush fee.
- Scheduling auto-delays to the earliest eligible Friday window when a requested time is too soon; a warning is logged.

## Physical eligibility
Physical/Both releases require minimum quality and minimum label fan thresholds.
- If a release is not eligible, it auto-falls back to Digital and logs a warning.
- Eligibility is evaluated at scheduling time (and re-checked at release for safety).

## Inventory + store capacity
Physical sales are constrained by the physical supply chain:
- Factories manufacture physical inventory (supply per region).
- Shopping centers sell physical inventory (retail capacity per region).
- Capacity is modeled per region and aggregated for national/global scopes.
- Inventory is tracked per region and updated weekly: `inventory + production - physical sales`.

## Sales allocation
- Digital-only: all sales are digital.
- Physical-only: sales are physical and capped by inventory + store capacity.
- Both: a fixed share of sales is targeted for physical; the remainder is digital.
- If physical demand exceeds capacity, the excess is lost (no auto-conversion to digital).
- Sales metrics are chunked to the audience size granularity.

## Shelved lifecycle
- Tracks exit the active market after 12 chart weeks and are archived.
- Archived tracks switch to `Shelved` release status (physical/legacy phase).
- Digital availability remains on; shelved adds legacy physical behavior without disabling streaming.

## Shelved physical inventory + long-tail
- Shelved Physical/Both tracks initialize a legacy inventory run with units produced/available plus unit price/cost.
- Each week, shelved catalog inventory sells a deterministic long-tail volume, adding revenue and costs to the weekly economy.
- Touring merch can reference shelved catalog inventory on completed tour dates (tracked on the booking for attribution).

## Observability
- Warnings surface when auto-delay occurs, when physical eligibility fails, and when physical demand exceeds capacity.
- A Release panel surface reports inventory and store capacity by region.
