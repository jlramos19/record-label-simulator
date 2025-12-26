## **Gaia Time Zone Overview (Using Standard or Elsewhere)**

1. **12 AM Line**

   * **No capital city** here.  
   * In **Annglora**, this line is **“Elsewhere in Annglora.”**  
   * Often used as the **global anchor** (GST) for chart synchronization.  
2. **6 AM Line**

   * **Bloomville** (the **capital** of Annglora).  
   * Referred to as **“Annglora Standard”** (because it’s the capital).  
3. **12 PM Line**

   * **Campana City** (the **capital** of Crowlya).  
   * Referred to as **“Crowlya Standard.”**  
4. **6 PM Line**

   * **Belltown** (the **capital** of Bytenza).  
   * Referred to as **“Bytenza Standard.”**

---

## **Synchronizing In-Game Charts**

* **All chart updates** occur simultaneously at a **single** universal moment in code, typically using the **12 AM** line as the reference (Gaia Standard Time, or “GST”).  
* At that instant:  
  * **Elsewhere in Annglora** sees **12:00 AM**  
  * **Bloomville** (Annglora Standard) sees **6:00 AM**  
  * **Campana City** (Crowlya Standard) sees **12:00 PM**  
  * **Belltown** (Bytenza Standard) sees **6:00 PM**

This ensures a **unified** event time for **weekly chart resets** or **content updates**, despite local clocks differing by 6 or 12 hours.

---

## **Key Points**

* **Annglora:**

  * **Standard** \= **Bloomville** (6 AM line)  
  * **Elsewhere** \= **12 AM line** (no capital city)  
* **Crowlya:**

  * **Standard** \= **Campana City** (12 PM line)  
* **Bytenza:**

  * **Standard** \= **Belltown** (6 PM line)  
* **Global Anchor**:

  * The **12 AM** line (Elsewhere in Annglora) typically serves as the universal code “start of day,” labeled **GST** for game logic.

With these **four time zones** labeled as **Standard** vs. **Elsewhere**, you have a **clear** way to synchronize **chart events** or **weekly resets** across Gaia.

