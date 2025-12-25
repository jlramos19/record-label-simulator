### **`Economy - Broadcast Financial Flow and Strategy`**

#### **`1. Who Pays Whom:`**

* `Record Labels pay eyeriS’ broadcasting subcompany to secure Timeslots for promoting their Creators’ content.`  
* `eyeriS’ subcompany pays performance royalties to Record Labels when airing their Tracks.`

#### **`2. ECS Representation of Financial Flow:`**

* **`ExpenseComponent`**`: Logs the costs of booking prime-time Broadcasts.`  
* **`RevenueComponent`**`: Tracks royalties owed to Record Labels for aired Tracks.`

#### **`3. Generic Term for Shows/Stations:`**

* `Refer to both as “Broadcasts” for simplicity.`

#### **`4. Strategy and Scheduling:`**

* `Players use the CalendarSystem and TimeSlotComponents to schedule Broadcasts (promotions, live performances, interviews) at optimal times.`  
* **`PromotionSystem`** `boosts Audience engagement if aligned with Audience preferences and scheduling.`  
* `Overuse of the same prime-time slots leads to accumulating expenses, diminishing returns, and encourages diversification.`

#### **`5. ECS-Driven Outcome:`**

* `The ECS architecture ensures every action—booking Broadcasts, airing Tracks, receiving royalties—remains data-driven and incrementally adjustable.`  
* `Players maintain economic stability by balancing costs (ExpenseComponent) against incoming royalties (RevenueComponent), adjusting strategies to avoid predictable patterns or excessive expenditures.`

---

`This summary captures the payment flows, ECS-driven financial tracking, simple terminology for broadcasts, and strategic considerations within the simulation.`


