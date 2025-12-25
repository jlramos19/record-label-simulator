### **`Member Transition in “Record Label Simulator”`**

#### **`Initial representation`**

* **`Default state: Consumer`**  
  * `A Member starts life as a Consumer: a normal person in the world who can listen, react, buy, and influence demand.`  
* **`Two-layer representation`**  
  * **`World layer:`** `Members can appear as lightweight “tokens” (simple markers) so the player can understand population flow at a glance.`  
  * **`UI layer:`** `Members exist as data-first entities (rows/records). The UI is just how you inspect and act on that data.`

#### **`Transition into an occupation`**

* **`Trigger`**  
  * `When a Member acquires an occupation other than Consumer (for example: Creator, Critic, Personnel), they “graduate” into a managed entity.`  
* **`What changes`**  
  * `The Member becomes representable as an ID in the UI (an “ID card” you can place into ID slots).`  
  * `The world-layer token is no longer the primary interface for that Member. The ID becomes the primary control surface.`

#### **`Occupations and their impact`**

##### **`Creator roles`**

* **`Songwriter`**  
  * **`Verb:`** `Write`  
  * **`Function:`** `Produces lead sheets / sheet music (inventory items).`  
* **`Recorder`**  
  * **`Verb:`** `Perform`  
  * **`Function:`** `Uses sheet music to produce recordings (for example: demo recordings).`

##### **`Critic roles`**

* **`Critic`**  
  * **`Verb:`** `Review`  
  * **`Function:`** `Rates content over time (your system can define eligibility rules + slot availability).`  
  * **`Placement:`** `Occupies a slot in a governing structure (for example: a Critics Council structure).`

##### **`Personnel roles`**

* **`Shopping Center Personnel`**  
  * **`Verb:`** `Assist`  
  * **`Function:`** `Supports selling/distribution-facing operations (retail-facing side of the content lifecycle).`  
* **`Factory Personnel`**  
  * **`Verb:`** `Work`  
  * **`Function:`** `Supports manufacturing/physical production operations.`  
* **`Broadcast Corporation Personnel`**  
  * **`Verb:`** `Present`  
  * **`Function:`** `Supports broadcast packaging, programming, and presentation workflows.`

#### **`Where “Modifiers” fit`**

* **`Modifiers are not Members and not IDs.`**  
  * `They are non-entity attributes you attach to things (IDs, items, content, or systems) to adjust outcomes.`  
* **`Examples of what Modifiers can do`**  
  * `Alter the output quality/quantity of a Creator’s verb (Write/Perform).`  
  * `Shift probabilities in Review behavior (Critic influence).`  
  * `Change production efficiency in Work/Assist/Present pipelines.`  
* **`Key rule`**  
  * `A Modifier should never be treated like a character. It’s a data modifier, not an entity.`

#### **`Summary`**

`Members begin as Consumers, represented lightly in the world and concretely as data. When a Member gains an occupation, the primary interaction shifts to an ID-based UI representation that can be placed into ID slots and used in the game’s verb-driven systems. Occupations define what verbs a Member can perform, while Modifiers tune outcomes without becoming entities themselves.`

