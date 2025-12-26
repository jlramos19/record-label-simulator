## **UX Design for Record Label Simulator**

**Purpose**  
Define the user experience (UX) for **Record Label Simulator**, focusing on: selecting and placing **IDs**, using **ID slots**, filtering, and turning inventory items into scheduled releases through the **Table → Calendar** loop.

---

### **Interaction model: properties vs values**

The interface exposes **properties** (fields) and lets the player set **values**.

* **Property** \= the field name (example: **SPECIALIZATION**)  
* **Value** \= the chosen option (example: **SONGWRITER**)

Values are selected via click-to-open dropdowns (hover-to-preview is optional if you implement it later).

Example:

* **Property:** SPECIALIZATION  
* **Value:** SONGWRITER / RECORDER

---

### **IDs and ID slots**

* The player has an **ID deck inventory** containing **IDs**.  
* The player **clicks to place IDs into ID slots**.  
* When an ID is placed into an ID slot, the ID’s **properties apply to that slot’s context** (inventory / table / production / hand).

IDs have two primary UI actions:

1. **Equip to hand** (prepare/select the ID for placement)  
2. **More options** (open details and additional ID actions)

---

### **Filtering and browsing**

Filtering controls are dropdown-based and are used to browse/select relevant IDs and/or content inputs.

#### **Content genre filters**

Content genre is formed by combining:

* **THEME**  
* **MOOD**

##### **THEME**

* FREEDOM  
* LOYALTY  
* AMBITION  
* MORALITY  
* POWER

##### **MOOD**

* CHEERING  
* SADDENING  
* THRILLING  
* ANGERING  
* CALMING  
* ENERGIZING  
* UPLIFTING  
* BORING  
* DARING

#### **Identity / role filters**

##### **PROFESSION**

* CREATOR

##### **SPECIALIZATION**

* SONGWRITER  
* RECORDER

##### **NATIONALITY**

* ANNGLORAN  
* BYTENESE  
* CROWLISH

---

### **Table workflow**

The **Table** is where the CEO (player) lays out IDs and makes decisions that transform produced items into publishable content.

On the Table, the player:

* places IDs into ID slots on the Table / hand  
* reviews which inventory items exist (from Studios / Academies / Sets / Venues)  
* **assorts inventory items into content**  
* decides what will be published (and what will not)

---

### **Calendar workflow**

After content is assorted on the Table, the player uses the **Calendar** to schedule publication by selecting:

* release date  
* distribution method (digital / physical)

---

### **UX constraints / notes**

* Dropdown lists should support large lists (scroll \+ search/typeahead if needed).  
* Avoid free-typed values for canonical fields; use controlled dropdown values unless explicitly in an “edit list” mode.  
* Keep the mental model consistent everywhere:  
  * **property name \= label**  
  * **selected option \= value**  
* IDs and ID slots are the primary interaction pattern; dropdown filters support selection and browsing, but placement happens through clicking IDs into slots.

