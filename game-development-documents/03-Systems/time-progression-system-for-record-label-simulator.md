# **`Time Progression System for Record Label Simulator`**

## **`Introduction`**

* `Record Label Simulator is a micromanaging tycoon simulation set in an evolving music industry world-state.`

* `The time progression system drives world simulation, content production pipelines, promotions, charts, trends, and Era outcomes.`

## **`Time Progression System Overview`**

* `The game advances in discrete in-game hours as the primary simulation unit.`

* `The UI displays time in the standardized in-game format with hour-only precision (no minutes).`

* `Game speed presets:`

  * `Normal Speed: 1 in-game hour per 2.5 real-life seconds.`

  * `Faster Speed: 1 in-game hour per 1 real-life second.`

## **`Simulation Cadence`**

* `Hourly systems run off the in-game hour tick (production steps, scheduling, stamina/availability updates).`

* `Weekly systems run off the in-game week boundary (168 in-game hours):`

  * `Charts update weekly.`

  * `Trends update weekly (reflecting last week’s dominant charting consumption).`

  * `Weekly evaluation inputs can include Audience engagement, Promotions, and Critics impacts.`

## **`Simulation Periods (World Timeline)`**

### **`Pre-Game Period: Emergence of the In-Game Music Industry (2025-2100)`**

* `Start Date: SUN - AUG 31, 2025 - 12AM`

* `End Date: FRI - JAN 01, 2100 - 12AM`

* `Objective: Simulate the emergence of the industry and seed the foundational world state that later charts and communities build on.`
* `Determinism: This period is fixed and identical across runs.`

### **`In-Game Charts History Period (2100-2200)`**

* `Start Date: FRI - JAN 01, 2100 - 12AM`

* `End Date: WED - JAN 01, 2200 - 12AM`

* `Objective: Generate a century of charts history that establishes legacy context, early trend cycles, and historical benchmarks for later strategy.`
* `Determinism: This period is fixed and identical across runs.`

### **`Final Pre-Player Build-Up (2200-2400)`**

* `Start Date: WED - JAN 01, 2200 - 12AM`

* `End Date: SAT - JAN 01, 2400 - 12AM`

* `Objective: Mature the world into the fully-developed industry state the player inherits at gameplay start (communities, trends, critics influence, rival label posture, chart ecosystems).`
* `Seeding: This period is uniquely seeded per run (variable).`

### **`Commencement of Player’s Game (2400)`**

* `Start Date: SAT - JAN 01, 2400 - 12AM`

* `Objective: Mark the beginning of the player’s active management of their Record Label in the mature simulation state.`

### **`Main Gameplay Window (2400–3000)`**

* `Start Year: 2400`

* `End Year: 3000`

* `Objective: The primary objective-driven campaign window for Era execution, growth, and long-term strategy.`

### **`Extended Mode (3001–9999)`**

* `Start Year: 3001`

* `End Year: 9999`

* `Objective: Sandbox continuation after the main gameplay window, allowing ongoing simulation until the hard end cap.`

### **`Hard End Cap`**

* `Year: 9999`

* `Objective: The run ends at year 9999.`

## **`Implications for Game Design`**

* `Weekly cadence creates a consistent strategic rhythm:`

  * `Create and release content, run promotions, observe chart movement, read trend shifts, then adapt.`

* `The time system must support both:`

  * `short-loop scheduling (hours/days), and`

  * `long-loop industry evolution (weeks/years/centuries).`

## **`Conclusion`**

* `Time progression is defined by in-game hour ticks with speed presets, and weekly boundaries for charts/trends.`

* `The simulation timeline separates pre-player world building from the playable campaign start in 2400, and supports long-run play through the year 9999 end cap.`
