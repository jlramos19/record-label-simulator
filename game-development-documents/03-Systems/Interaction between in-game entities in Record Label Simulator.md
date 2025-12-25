## **`Interaction between in-game entities in Record Label Simulator`**

### **`Purpose`**

`Define the entities in the simulation and the ways they interact, so the gameplay loop stays coherent from signing Creators → producing Items → assorting Content → scheduling releases → promotion → audience reaction → chart/economy feedback.`

---

### **`Entity categories`**

#### **`1) Characters`**

`Characters are the actors that perform actions.`

* **`Player`** `(Role: CEO; Occupation: Music Executive)`  
  `Runs a Record Label, makes decisions, schedules output, allocates resources.`  
* **`Creators`**  
  `Creators are represented as IDs in the interface and are placed into ID Slots to do work inside Structures (writing, recording, producing, promoting).`  
* **`Community Members`**  
  `They consume content, generate demand, and drive trends/market outcomes through engagement.`

---

#### **`2) Organizations`**

`Organizations are major world “actors” that own or govern systems.`

* **`Record Labels`** `(Company; player-owned or rivals)`  
  `Plan eras, finance work, manage releases, compete on charts.`  
* **`Creators Community Chamber (CCC)`** `(Institution)`  
  `Presents Creator IDs to be signed; replaces legacy “interview” flows.`  
* **`Critics Councils`** `(Institution)`  
  `Rate releases; their evaluation affects perceived Quality and chart velocity.`  
* **`Broadcast corporations / programs`** `(Company or Institution depending on canon in that region)`  
  `Distribute performances/interviews to Members; amplify awareness and engagement loops.`

---

#### **`3) Structures`**

`Structures are the “places where actions happen,” and they expose slots for IDs, inputs, and outputs.`

* **`Studios / Academies / Sets / Venues`**  
  `Content studios are multipurpose for write -> record -> produce. Broadcast studios are used for performances/interviews (promotion).`  
* **`Key slot types (common pattern)`**  
  * **`ID Slot`**`: the Creator/Act ID performing the work`  
  * **`Content Slot`**`: the input Item (when required)`  
  * **`Output Slot`**`: the resulting Item/Content`  
  * **`Modifier Slot`**`: optional Item that tweaks output tradeoffs`

---

#### **`4) Items and Content`**

`Items are things Characters/Structures produce and manipulate.`

* **`Items in the creation chain`** `(example)`  
  *`Sheet Music`* `→ Demo Recording → Track`  
* **`Assorted Content`**  
  `The Player takes produced Items and “assorts” them into publishable choices (what’s being released, in what format, when). (This ties directly into your Table → Calendar flow.)`

---

#### **`5) Modifiers`**

`Modifiers are Items, not Characters.`

* `A modifier changes a Structure’s output (usually a tradeoff like Quality vs Speed, or preference tweaks).`  
* `A Modifier is typically used by placing it into a Modifier Slot during production.`  
* `Example roles modifiers can fill:`  
  * `production tuning (higher Quality / slower Speed; or faster / lower Quality)`  
  * `preference/skill adjustment (e.g., changing preferred Theme/Mood via a revamp-style modifier)`

---

## **`Interaction map`**

### **`A) Signing and roster intake`**

1. **`CCC`** `presents Creator IDs.`  
2. **`Player / Record Label`** `signs a Creator (contract/state transitions).`

**`Output:`** `Creator joins the Record Label roster as an available ID.`

---

### **`B) Production loop (Structures + Slots + Items)`**

1. `Player leases/uses a Recording Studio (or other production Structure).`  
2. `Player places a Creator ID into the ID Slot.`  
3. `If applicable, Player places an input Item into the Content Slot.`  
4. `(Optional) Player places a modifier into the Modifier Slot to tune output.`  
5. `Structure produces a new Item into output/inventory.`

**`Output:`** `Inventory fills with new Items that are candidates for release/promotion.`

---

### **`C) Assorting decisions (Table)`**

1. `Player lays IDs/Items into Table slots to decide:`  
   * `what becomes “release-ready”`  
   * `what is held back, revised, or discarded`  
   * `what is bundled into higher-level releases (when applicable)`

**`Output:`** `A set of selected content ready to be scheduled.`

---

### **`D) Scheduling and release (Calendar)`**

1. `Player places the chosen Content into Calendar slots and assigns the release date/time.`  
2. `Release timing interacts with distribution constraints (lead times differ by format/type).`

**`Output:`** `A future release event that will trigger downstream audience/market reactions.`

---

### **`E) Promotion and broadcast`**

1. `Player places an Act ID (or relevant ID) into a Broadcasting Studio to promote content.`  
2. `Promotion increases awareness among Members, changing engagement probabilities.`

**`Output:`** `Engagement uplift (streams/purchases) and stronger chart trajectory potential.`

---

### **`F) Evaluation and feedback loops`**

* **`Critics Councils`** `rate releases; ratings affect perceived Quality and chart momentum.`  
* **`Members`** `consume content based on preferences; consumption shapes trends and competitive pressures.`  
* **`Modifiers`** `let the Player intervene mid-loop to respond to market shifts without rewriting the whole pipeline (tune output, adapt Creator preferences, etc.).`

---

## **`Era execution task map (menu priority)`**

1. **`Create Content`** `Build Tracks and assign Acts/Creators so the Era has content.`  
2. **`Eras (Calendar)`** `Start/manage Eras and review the internal schedule (Label/Eras tabs).`  
3. **`Releases`** `Schedule or release Tracks; scheduling auto-starts an Era for the Act.`  
4. **`Campaigns`** `Run paid boosts from the Eras view to extend visibility during the Era.`  
5. **`eyeriSocial`** `Live world feed + public announcements; public knowledge only updates when posted.`  
6. **`World/Charts`** `Monitor trends, rival momentum, and chart movement to adjust Era strategy.`  

---

## **`Notes for coherence (so the doc stays clean going forward)`**

* `If something is a Character, it must have actions.`  
* `If something is a modifier, it must be an Item that occupies a Modifier Slot and affects output.`  
* `If something is a Structure, it must expose slots and produce/route Items.`

---

### **`Evidence lines used (so you can verify what I anchored this rewrite to)`**

* `Original “Interaction…” entity list + old flow assumptions`  
* `Slot + modifier usage in production steps`  
* `Modifier definition + examples`  
* `Institutions/companies framing (CCC, Critics Councils, Record Labels)`
