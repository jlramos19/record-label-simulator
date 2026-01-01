### **`Expanded and Integrated Stamina System Explanation`**

`In "Record Label Simulator", stamina is not just a measure of a Creator’s productivity but also directly tied to the QualityComponent of their output. This mechanic ensures that managing stamina effectively is critical to maintaining content excellence and long-term strategic success. Here’s the fully integrated explanation:`

---

### **`Core Concept: Stamina as Productivity and Readiness`**

`Stamina governs how Creators (Songwriters, Vocalists, Producers) perform tasks, including writing Sheet Music, creating Demo Recordings, and finalizing Tracks. It also represents a Vocalist's readiness for promotional activities like live Shows or Broadcasts.`

---

### **`Occupation-Specific Stamina Costs`**

#### **`Songwriters`**

* **`Task`**`: Write Sheet Music.`  
* **`Cost`**`: 25 stamina units per sheet.`  
* **`Production Time`**`: 1 hour in-game (4 quarter-hour ticks).`  
* **`Example`**`:`  
  * `A Songwriter with 400 stamina can create 16 sheets before requiring recovery.`

#### **`Vocalists`**

* **`Task`**`: Create Demo Recordings.`  
* **`Cost`**`: 50 stamina units per demo.`  
* **`Production Time`**`: 2 hours in-game (8 quarter-hour ticks).`  
* **`Example`**`:`  
  * `A Vocalist with 400 stamina can produce 8 demos before resting.`

#### **`Producers`**

* **`Task`**`: Finalize Tracks.`  
* **`Cost`**`: 100 stamina units per track.`  
* **`Production Time`**`: 3 hours in-game (12 quarter-hour ticks).`  
* **`Example`**`:`  
  * `A Producer with 400 stamina can finalize 4 tracks before recharging (daily overuse limits still cap safe output at 2 per day).`

---

### **`Stamina Recharge and Recovery`**

#### **`Recharge Mechanic`**

* **`Rate`**`: 50 stamina units per in-game hour of inactivity.`  
* **`Condition`**`: Regen is applied each quarter-hour tick when idle, so partial hours contribute.`  
* **`Example`**`:`  
  * `A Creator inactive for 3 in-game hours regains 150 stamina units.`

---

### **`Quality Penalties for Insufficient Stamina`**

1. **`When Stamina is Insufficient`**`:`

   * `If a Creator attempts a task without adequate stamina, the QualityComponent of the resulting content suffers.`  
   * `Example:`  
     * `A Producer with only 50 stamina finalizes a Track. The Track’s Quality drops from an A+ to a B, leading to weaker Critics scores and lower Audience engagement.`  
2. **`Impact on Engagement`**`:`

   * `Low-quality content fails to resonate with Critics and Audience Chunks, reducing engagement increments during Broadcasts or live Shows.`

---

### **`Optimal Daily Limit: 200 Units`**

* **`Why It Matters`**`:`  
  * `Staying at or below 200 units of daily stamina usage ensures sustainable productivity and consistent Quality.`  
* **`Overuse Consequences`**`:`  
* `Exceeding 200 stamina daily triggers:`  
    1. **`Overuse Strike`**`: One strike per creator per day (guarded by lastOveruseDay).`  
    2. **`Departure Risk`**`: At the configured strike limit (currently 1), the creator is flagged for departure; removal happens once they are not busy.`

---

### **`Rehearsals and Readiness for Vocalists`**

#### **`Mechanic:`**

* `Rehearsals at Rehearsal Studios restore stamina and maintain a Vocalist's readiness for live Shows or Broadcasts.`  
* **`Decay Mechanism`**`:`  
  * `Readiness (tracked via StaminaComponent) decays without regular rehearsals, leading to:`  
    * `Reduced Audience engagement during performances.`  
    * `Lower Broadcast effectiveness.`

#### **`Scheduling Rehearsals:`**

* `Rehearsals must be strategically scheduled via the CalendarSystem to:`  
  * `Prevent readiness decay.`  
  * `Optimize performance quality and engagement outcomes.`

---

### **`ECS Implementation`**

#### **`StaminaComponent:`**

* `Tracks current stamina levels and updates after each task or recharge period.`

#### **`StaminaDecaySystem:`**

* `Gradually reduces stamina during inactivity or after overuse penalties.`

#### **`CalendarSystem:`**

* `Allows Players to schedule work, rest, and rehearsal periods for optimal stamina management.`

#### **`PromotionSystem:`**

* `Uses stamina levels to calculate engagement boosts during Broadcasts or live Shows:`  
  * `High stamina: Maximum AudienceEngagementComponent increments.`  
  * `Low stamina: Reduced engagement impact.`

---

### **`Player Strategy: Balancing Productivity and Rest`**

#### **`1. Scheduling Downtime`**

* `Alternate heavy workload days with periods of inactivity to allow stamina recharge.`  
* `Example:`  
  * `A Producer working on Tracks Monday should rest Tuesday to maintain peak productivity Wednesday.`

#### **`2. Avoiding Overuse`**

* `Stay within the 200 units/day optimal limit to avoid exponential penalties.`

#### **`3. Monitoring Readiness`**

* `Regularly rehearse Vocalists to keep readiness levels high, ensuring effective prime-time Broadcasts.`

---

### **`Conclusion`**

`The stamina system ties task execution, readiness, and quality into a single mechanic, forcing Players to manage workload and recovery carefully. By balancing stamina usage with downtime and rehearsals, Players can maximize productivity and ensure their Creators deliver high-quality content consistently. Pushing Creators beyond their limits introduces direct penalties, reinforcing long-term strategic planning as essential for success in "Record Label Simulator."`
