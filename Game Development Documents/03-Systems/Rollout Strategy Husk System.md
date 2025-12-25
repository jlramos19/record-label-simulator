## **`Rollout Strategy Husk System`**

`(Era template, Calendar scheduling, shared access, and Rival Record Label behavior)`

### **`Purpose`**

`A Rollout Strategy is the main planning and replay object for an Act’s Era. It exists to (1) make Era execution repeatable and readable, (2) keep competition legible across Record Labels, and (3) keep the loop alive by making timing, Trends, and counter-programming matter week over week.`

`This document defines the Rollout Strategy as a Husk and specifies how the Player and the other Record Labels use it.`

---

## **`Core Definitions`**

### **`Era`**

`An Era is the strategic run for an Act conducted through the four stages already used in the game: Direction → Creation → Promotion → Legacy. The Era is the container that evaluation systems grade (Flop/Mid/Successful/Iconic), and it is the scope that Rollout Strategies attach to.`

### **`Rollout Strategy`**

`A Rollout Strategy is a structured “how this Era is rolled out” plan object. It is editable while the Era is ongoing.`

### **`Rollout Strategy Husk`**

`A Rollout Strategy is specifically treated as a Husk:`

`A fixed-length sequence of weeks with Content drops and Events on a fixed schedule cadence.`

`Think of it as the Era’s schedule skeleton. You fill it with Content and Events, then schedule it to the Calendar.`

### **`Content drop and Event`**

* `A Content drop is a scheduled release action tied to finished Content (Tracks / Projects).`

* `An Event is a scheduled non-release action that still impacts outcomes (Promotion actions, appearances, announcements, community-facing moments, etc.).`

---

## **`Player Workflow Rules`**

### **`Rule A: Content must exist before it can be scheduled`**

`The Player must create Content through the Creation pipeline first (Theme + Mood → mastered Track / finalized release-ready Content). Only then can it be placed into any schedule container.`

### **`Rule B: Two ways to schedule to the Calendar`**

`The Calendar is the execution surface, and it accepts scheduling through either path:`

1. `Direct Calendar scheduling (no Rollout Strategy)`

    `You can drop Content directly into the Calendar as a one-off.`

2. `Rollout Strategy scheduling (Husk → Calendar)`

    `You place Content into Rollout Strategy Husk slots, then you drop the Rollout Strategy into the Calendar. This expands into the dated schedule.`

`Both paths are valid gameplay.`

### **`Rule B2: Auto-Run (Idle) Rollout Mode`**

`The Player can enable an auto-run option for a Rollout Strategy Husk.`

* `Auto-run executes scheduled drops/events when gating conditions are met (content ready, slots free, calendar window available).`
* `If conditions fail, auto-run pauses and logs the reason.`
* `Exact condition checks are specified in Pending Concepts (docs/pending-concepts.md).`

---

## **`End-of-Era Rollout Strategy Generation`**

### **`Rule C: A Rollout Strategy is generated at Era end by default`**

`At the end of every Era, the game generates a Rollout Strategy Husk template of the Era just conducted, even if the Player never used a Rollout Strategy during that Era.`

`This generated Husk represents what actually happened during the Era window: weeks, scheduled drops, and scheduled events in the order they occurred.`

### **`Rule D: Player opt-out`**

`The Player can opt out of receiving/saving the generated Rollout Strategy. If the Player opts out, the game does not preserve the generated Husk.`

---

## **`Shared Access Rule (Player + other Record Labels)`**

### **`Rule E: Same access for everyone`**

`All Record Labels (the Player and the other seven) have the same form of access to Rollout Strategy Husks.`

`This is not “special Player visibility” and not “AI-only scouting.” It is symmetrical: a Rollout Strategy is the shared unit of readable intent.`

### **`What this means in practice`**

* `When a Record Label has an Era’s Rollout Strategy Husk, other Record Labels can reference that same Husk as an input to their own Era planning.`

* `This enables counter-programming and prevents the simulation from feeling like hidden dice rolls.`

`(This access rule is about the Husk itself: a number of weeks with Content and Events on a fixed schedule.)`

---

## **`Rival Record Labels (Artificial Intelligence)`**

### **`AI Record Labels use Rollout Strategies as their primary planning primitive`**

`The other seven Record Labels operate using Rollout Strategies (Husks) to conduct their Acts’ Eras.`

### **`Simplification rule: Default Husks instead of complex behavior trees`**

`To keep their logic stable and avoid large behavior trees, AI Record Labels use default pre-defined Rollout Strategy Husks as templates. Each week, they adjust choices based on Trends and preference context, rather than “inventing plans from scratch.”`

`This keeps the charts active while keeping AI logic debuggable.`

---

## **`Market Focus Priority for AI Record Labels`**

### **`Rule F: Targeting priority order`**

`To bias AI behavior toward profitability and reachability, each AI Record Label targets audiences in this priority order:`

1. `National interest (their home nation)`

2. `Global interest`

3. `The other two countries in their region, ordered by popularity within that region`

`This priority stack is used to tweak AI preferences and decisions: what they choose to push, where they schedule major drops, and how they respond to opponents.`

---

## **`Keeping the Game Loop Alive`**

`(What this Husk system adds to prevent stagnation and keep Eras evolving)`

### **`1) Legible competition creates an actual “counter-game”`**

`Because Husks are shared and readable, the Player is not guessing blindly. You can see the weekly shape of what other Record Labels are doing and plan around it. Rivals can also react to your Husk patterns. The result is an evolving meta: timing and scheduling strategy stays relevant even late game.`

### **`2) Weekly cadence becomes the natural decision checkpoint`**

`Trends update weekly. The Husk is week-based. That locks together: every week becomes a meaningful moment to (a) stay on the Husk, (b) modify the Husk, or (c) pivot the Era.`

### **`3) Templates preserve learning while allowing variation`**

`End-of-Era generation turns every Era into a reusable template. The loop stays alive because the Player and rivals can reuse what worked—but Trends, competition, and audience response force iteration instead of permanent dominance.`

### **`4) “National-first” prevents global homogenization`**

`Without market bias, everyone converges to the same global-max strategy. National-first keeps the world diverse: regional scenes remain competitive, and global dominance becomes an earned escalation instead of the default.`

---

## **`Math Hooks (Proven Methods)`**

`(These are implementation-ready patterns; tune constants during balancing.)`

### **`Weekly Trends: exponential smoothing`**

`Use exponential smoothing so Trends evolve without whiplash:`

* `Trend_next = (1 - α) * Trend_current + α * Trend_signal_this_week`

`This makes week-by-week Husk planning meaningful because Trends don’t instantly flip from one week to the next.`

### **`AI Husks: weighted scoring + softmax selection`**

`For AI Rollout Strategy selection, score candidate Husks using your existing nouns:`

* `Market priority fit (National → Global → other two countries)`

* `Trend fit (content Genre alignment with current Trends)`

* `Competition pressure (avoid stacking major drops in the same week for the same Audience scope)`

`Then choose using softmax (consistent but not identical every run):`

* `P(husk_i) = exp(score_i / τ) / Σ exp(score_j / τ)`

`Lower temperature (τ) makes AI more deterministic; higher makes it more varied.`

### **`Diminishing returns: prevent “spam the same week” dominance`**

`When too many major drops/events are clustered into the same week targeting the same Audience scope, apply a diminishing returns factor so spacing and pacing matter.`

`A simple proven form:`

* `EffectiveImpact = RawImpact / (1 + k * OverlapCount)`

`This keeps Husk cadence decisions meaningful and prevents degenerate stacking.`

### **`Determinism with event logging`**

`Where any randomness is used (engagement rolls, AI selection tie-breaks), generate pseudo-random outcomes from stable inputs (tick + ids + event index) so replays stay consistent with the event_log.`

---

## **`What still needs to be specified in Drive after this doc is added`**

`To fully operationalize this system without ambiguity, these pieces should be defined next (still in your vocabulary):`

* `Rollout Strategy Husk slot types (what “drops” and “events” are valid categories)`

* `Minimum and maximum Husk length in weeks`

* `What parts of a Husk are visible via shared access (week structure only vs including all scheduled subjects)`

* `How “popularity order” of the other two countries in a region is represented as data (so AI can sort it deterministically)`  
