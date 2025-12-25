`Below is a concise, clear, and documentation-ready version of the venue, seat, and floor mechanics for inclusion in your Game Design Document (GDD):`

---

### **`Venues, Floors, and Seat Capacities`**

**`Concept Summary:`**  
 `Venues in the Record Label Simulator are physical structures where live performances and events take place. Each Venue’s capacity is defined by its number of floors, with each floor supporting a fixed number of seats. This system creates a scalable and modular approach to hosting events, influencing both Audience engagement and revenue generation.`

---

### **`Venue Types and Capacities`**

**`Venue Size Tiers:`**

* **`Small Venues (Broadcast Studios):`** `1,000–4,000 seats total`  
  * `Approx. 1,000 seats per floor`  
  * `Ideal for emerging Acts, televised shows, and promotional events.`  
* **`Arenas:`** `5,000–49,000 seats total`  
  * `Approx. 5,000 seats per floor`  
  * `Suitable for mid-level to large-scale performances.`  
* **`Stadiums:`** `50,000–300,000 seats total`  
  * `Approx. 10,000 seats per floor`  
  * `Hosts massive concerts and globally influential Acts.`

**`Example Calculations:`**

* `A 4,000-seat Broadcast Studio = 4 floors × 1,000 seats/floor`  
* `A 25,000-seat Arena = 5 floors × 5,000 seats/floor`  
* `A 100,000-seat Stadium = 10 floors × 10,000 seats/floor`

---

### **`ECS Integration`**

**`Key Components:`**

* **`VenueCapacityComponent:`** `Tracks total seats and current occupancy during events.`  
* **`FloorComponent:`** `Indicates the number of floors, derived from the Venue’s desired capacity.`  
* **`EngagementComponent:`** `Reflects how readily Audience Members fill seats based on active events.`  
* **`RevenueComponent:`** `Calculates total earnings from ticket sales, factoring in occupancy and seat counts.`

**`Key Systems:`**

* **`AudienceEngagementSystem:`**  
  * `Assigns Audience Members (in Capitals as capsules) and Audience Chunks (in Elsewhere Regions, displayed as UI numbers) to available Venue seats.`  
  * `Engagement depends on alignment with Audience preferences, Trends, and promotional efforts.`  
* **`EconomicsSystem:`**  
  * `Calculates total event revenue based on the number of occupied seats and ticket prices.`  
  * `Distributes revenue among the Venue (20%), Record Label, and Creators following predefined ratios.`  
* **`PromotionSystem:`**  
  * `Influences how many Audience Members attend events.`  
  * `Stronger promotions and alignment with Trends or popular Themes/Moods increase seat occupancy.`

---

### **`Gameplay Implications`**

1. **`Event Planning:`**  
    `Players must choose appropriate Venues that match expected demand. Smaller Venues limit potential revenue but can sell out more easily; larger Venues allow huge attendance but risk empty seats if demand is misjudged.`

2. **`Revenue and Costs:`**  
    `Since ticket revenue scales with attendance, selecting the right Venue size directly affects profitability. Players must consider Audience preferences, promotional strength, and current Trends when booking events.`

3. **`Visual Feedback and Strategy:`**

   * `In Capital Regions, Audience Members appear as capsules moving toward Venues, providing real-time visual feedback on attendance.`  
   * `In Elsewhere Regions, attendance is tracked numerically, allowing Players to manage large-scale audiences without overwhelming the interface.`  
4. **`Long-Term Market Influence:`**  
    `Repeated successful events at larger Venues may boost a Record Label’s Alignment, enable bigger promotions, and support expansion into global Trends.`

---

### **`Conclusion`**

`The integration of floors, seat capacities, and ECS-driven attendance mechanics ensures Venues feel both realistic and strategically meaningful. By linking physical space, Audience engagement, and revenue, this system provides Players with tangible incentives to carefully plan events, respond to changing Audience demands, and leverage their promotional strengths for maximum impact.`

