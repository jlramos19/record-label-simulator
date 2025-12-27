### **`Economy - Pricing Models (Web MVP)`**

#### **`Purpose`**

`This section captures the pricing logic currently implemented in the web MVP, including baseline prices, physical multipliers, and the release fee used for physical runs.`

---

### **`1. MVP Pricing Baselines`**

* **`Digital single:`** `$0.69`  
* **`Physical single:`** `$4.99`  
* **`Physical release fee:`** `$500 per format`  
* **`Physical unit cost:`** `max($0.50, unit price * 0.35)`  

### **`2. Project Type Limits`**

* **`Single:`** `1-4 tracks`  
* **`EP:`** `5-7 tracks`  
* **`Album:`** `8-32 tracks`  

### **`3. Physical Price Multipliers`**

* **`Single:`** `1.00x`  
* **`EP:`** `1.55x`  
* **`Album:`** `2.25x`  

---

### **`4. Revenue and Expenses (MVP)`**

* `Weekly revenue is driven by chart scores plus touring when the touring balance flag is enabled.`  
* `Weekly upkeep scales with creator headcount, owned studio slots, and any lease fees.`  
* `Promo pushes deduct cash immediately; touring costs and profits apply only when balance is enabled.`  

---

### **`5. Legacy Pricing Models (Not Active in MVP)`**

* `The 30-70 per-track pricing pattern is a legacy design target and is not active in the web MVP.`  
* `Detailed per-format price tables (vinyl side tiers, cassette tiers, etc.) are not used in the MVP release math.`  

---

### **`Conclusion`**

`Pricing in the web MVP is intentionally simple: single baselines plus project-type multipliers. More granular pricing models remain future-facing design targets.`
