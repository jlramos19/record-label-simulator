## **IDs and ID slots on Studios, Academies, Sets and Venues**

**Purpose**  
 Define how **IDs**, **ID slots**, and production locations (**Studios, Academies, Sets, Venues**) interact with the **Table** and **Calendar** to create and publish content.

### **Core objects**

#### **ID**

* An **ID** represents an entity card used in production and decision workflows.

* An ID can represent:

  * a CREATOR, or

  * (deprecated term)

* IDs have **roles** (configured via properties like PROFESSION, SPECIALIZATION, etc.).

* IDs expose:

  * an **Equip** action (equip to hand / ready-to-place)

  * a **Details/Options** action (open extended controls for that ID)

### **Studios, Academies, Sets and Venues**

* These are **production locations** that contain:

  * **ID slots**

  * a production context that uses slotted IDs to generate **inventory items** (examples: lead sheets, interview tapes, recordings, etc.)

* Output inventory items are later turned into **assorted content**.

### **ID slot**

* An **ID slot** exists in multiple places:

  * the player’s **ID deck inventory** (as slot containers)

  * the **Table**

  * **Studios, Academies, Sets and Venues**

* Behavior:

  * When an ID is placed into a slot, the slot **binds** to that ID and exposes the ID’s relevant properties to the surrounding system (table actions, production actions, etc.).

  * Slot placement is done by **clicking** (ID → slot), not by typing.

### **Table**

* The **Table** is where the player (the CEO) lays out IDs to:

  * assort inventory items into publishable “assorted content”

  * decide packaging/selection (what is included vs excluded)

  * prepare content for scheduling

### **Calendar**

* The **Calendar** is where the player schedules **assorted content** for publication.

* Calendar decisions include:

  * release date

  * distribution method (digital / physical)

### **End-to-end loop (summary)**

1. IDs are placed into ID slots (inventory / hand / table / facilities)

2. Facilities (Studios, Academies, Sets, Venues) produce inventory items using slotted IDs

3. The Table converts inventory items into assorted content via player decisions

4. The Calendar schedules assorted content for release

