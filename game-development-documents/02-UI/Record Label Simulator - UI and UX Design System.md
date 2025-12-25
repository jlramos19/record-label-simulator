# **`Record Label Simulator — UI and UX Design System`**

## **`Purpose`**

`This document defines how the UI and user experience (UX) present ECS-driven gameplay data-Acts, Creators, Audience Chunks, Trends, Quality, and Alignment-in a player-friendly way. The UI must be readable, modular, fast to navigate, and designed for decision-making during Eras.`

---

## **`UI Base Styling (canon)`**

- `UI shell uses a neutral dark-brown background baseline.`
- `Depth rule: deeper into a window or interaction, the surface is darker than its parent.`
- `UI neutrals must follow the hex-step grid rule (RGB channel values only: 00, 33, 66, 99, CC, FF).`

---

## **`1. UI Structure and Layout`**

### **`Main HUD and Panels`**

`Top Bar`

* `Displays Time (example: SAT - JAN 01, 2400 - 12AM), Wallet, and Trends.`

* `Time Speed Controls (►, ►►, ⏸) pause or accelerate simulation.`

`Left-Side Panels`

* `Collapsible, scrollable panels with icons for:`

  * `Areas`

  * `Creators`

  * `Acts`

  * `Inventory`

  * `Items`

  * `Modifiers`

  * `Collabs`

* `Panel state is driven by UIPanelStateComponents.`

`Right-Side Panels`

* `Calendar panel: scheduling timeline for releases, production, and promotions.`

* `Quests panel: task tracking and deadlines.`

* `Timeline bars visualize upcoming events and pipeline constraints.`

`ECS Context`

* `UIStateComponents and UIPanelStateComponents manage open/close state, dashboard switching, hover context, and transitions.`

* `IconAtlasComponent ensures consistent iconography and style.`

### **`Views and Routing (mirror of current UI behavior)`**

- `UI uses routed views so only one view is mounted at a time.`
- `Default view: Charts.`
- `Views: Charts, Create, Releases, Promotion, Roster, Creator Community Chamber (CCC), Logs/Debug.`
- `Create view uses stage buttons (Sheet/Demo/Master) with studio slot columns (5 slots per column; 3/2/1 for Songwriter/Performer/Producer).`
- `Roster view groups Creator IDs into Songwriter/Performer/Producer columns, mirroring the CCC layout.`
- `Hidden panels have zero layout footprint.`
- `Mini panels collapse into a dock (tab/pill), not a full panel shell.`
- `Charts view shows a week-range selector; clicking it opens a chart-history calendar/modal.`
- `Label rankings (record labels chart scores) live in a right-side panel, not inline beneath the chart list.`

### **`Menu Pipeline Order (core loop)`**

- `Creators -> Acts -> Era Planner -> Studio -> Promotion (Release gate) -> Charts/Legacy -> Logs`
- `Release is an explicit gate inside Promotion so unreleased content is not promoted by default.`

---

## **`2. Displaying ECS Data`**

### **`Data Translation Rules`**

* `Raw numeric values (Quality metrics, currency, engagement) must be translated into readable UI shapes:`

  * `badges, bars, meters, trend arrows, charts, and summary tiles.`

### **`Color and Icon Rules`**

* `Themes use Theme colors (Theme identity).`

* `Alignment uses grayscale overlays only (Alignment identity).`

* `Countries use Country colors (Nation identity).`

* `Moods are icon-coded first (Mood identity). Default display: {MoodName} {MotifIcon}.`
* `Colored-heart emojis are secondary/alt and are reserved for alignment-style signaling/overlays.`
* `Mood color-coding is optional only if a dedicated Mood palette exists and does not conflict with Theme/Country/Alignment.`

### **`Content Genre Display`**

* `Content Genre (Theme + Mood) displays as:`

  * `Theme color + Mood icon`

  * `optional compact label for readability`

### **`Tooltips`**

* `Hover tooltips reveal deeper ECS details without clutter:`

  * `Creator skill summaries`

  * `Audience Chunk preference snapshots`

  * `Critics reactions and reasoning`

  * `Trend movement and contribution factors`

---

## **`3. Interactivity and Controls`**

### **`Input Methods`**

* `Mouse and keyboard support with customizable shortcuts.`

* `Keyboard navigation includes focus outlines and consistent tab order.`

### **`Performance and Responsiveness`**

* `UI transitions are capped at ~0.3 seconds (fade/slide) for responsiveness.`

* `UI updates are batched at logical intervals:`

  * `weekly refresh for Trends`

  * `scheduled refresh for Calendar timelines`

  * `event-driven updates for notifications and panel contents`

---

## **`4. Feedback Loops and Player Guidance`**

### **`Notifications and Alerts`**

`Tooltips and notifications highlight:`

* `Newly trending content genres`

* `Depleted Creator stamina`

* `Upcoming releases and deadlines`

* `Calendar conflicts and bottlenecks`

* `Critics reactions that materially change momentum`

### **`End-of-Era Reporting`**

`End-of-Era reports compile:`

* `Critics feedback`

* `Audience metrics`

* `Popularity (Engagement Reach) change (up/down/same)`

* `Finance outcome (Loss / Break-even / Earned money)`

* `Rewards:`

  * `Currency`

  * `Expression Points (EXP)`

`Reports must be scannable first, expandable second.`

---

## **`5. Calendar and Scheduling`**

### **`Timeline Visualization`**

* `Calendar shows scheduled work as Gantt-like bars:`

  * `production steps`

  * `release timing`

  * `promotion tasks`

* `Bars show:`

  * `start/end time`

  * `assigned Entity/IDs`

  * `priority markers`

  * `conflicts and gaps`

### **`PENDING DECISION: System Bar Encoding`**

`The Calendar timeline needs a consistent encoding for:`

* `ContentCreationSystem events`

* `PromotionSystem tasks`

`Constraints:`

* `Morality green must remain Morality.`

* `Bytenza blue must remain Bytenza.`

* `Freedom cyan must remain Freedom.`

* `Safe white is reserved for Alignment.`

* `System encoding must not overload Theme/Country colors.`

`Allowed approaches:`

* `neutral grayscale bars + system icons`

* `patterned bars + system icons`

* `a dedicated “System palette” that follows the hex grid rule and is explicitly separate from Theme/Country/Alignment`

---

## **`6. Audience and Trend Visualization`**

### **`Audience Views`**

* `Dashboards visualize:`

  * `Audience Chunk preferences`

  * `regional bias`

  * `engagement shifts over time`

  * `community clustering`

### **`Trends Views`**

* `Trends are presented as weekly updates:`

  * `“NEW!” markers`

  * `movement arrows`

  * `region source indicators`

  * `contribution breakdown (engagement, critics, promotion effects)`

---

## **`7. Accessibility and Customization`**

### **`Accessibility Options`**

* `Text scaling`

* `simplified display modes`

* `clear icon labels`

* `high-contrast overlays where needed`

### **`Layout Customization`**

* `Panels can be rearranged, resized, and toggled off.`

* `Saved layouts support different play styles (creation-heavy, promotion-heavy, finance-heavy).`

---

## **`8. Scalability and Future Additions`**

### **`Modular UI Expansion`**

* `Adding a new panel or dashboard should require:`

  * `a new Component schema for UI state/data binding`

  * `a new System or Adapter for transforming ECS data into UI models`

* `The UI must remain stable as the simulation scales (more Acts, more content, deeper charts history).`

---

## **`9. Use Cases and Best Practices`**

### **`Example Flow`**

`A player:`

1. `checks Era goals in the Top Bar,`

2. `filters Creators by Theme/Mood/Alignment targets,`

3. `schedules Sheet Music, Demo Recording, and finalization in the Calendar,`

4. `runs Promotions timed to release windows,`

5. `reads weekly Trends and Critics reactions,`

6. `finishes the Era and reviews the report to plan the next Direction stage.`

---

## **`Conclusion`**

`This UI system converts complex ECS data into readable, actionable visuals. The interface is built for continuous strategic iteration: create content, schedule it, promote it, track charts and trends weekly, and close Eras with clear performance and finance outcomes—supporting long-term play from 2400 onward.`
