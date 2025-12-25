### **`Economy - Currency Flow Simulation`**

`Here are the updated results incorporating the detailed capacities and proper interest rate application:`

`### Interest Rate Increment`  
`- **Interest Rate Increment Per Cycle**: 8.33%`

`### Shopping Center (80 floors)`  
`- **Total Personnel**: 1,600,000 personnel`  
`- **Total Working Capsules Per Week**: 11,193 capsules (taking into account 3 shifts per day, 7 days a week)`  
`- **Total Consumer Interactions Per Week**: 44,772 interactions (each capsule assists 4 consumers per shift)`  
`- **Weekly Revenue**: $30,892.68`  
`- **Monthly Revenue**: $123,570.72`

`### Interest Calculation Over 48 Years`  
`- **Total Interest Rate Over 48 Years**: 103.0%`  
`- **Monthly Interest Rate**: 2.1458%`

`### Monthly Payment to Bank`  
`- **Monthly Payment to Bank**: $11,330,000.00`

`### Summary of Simulation Requirements`

`#### Entities`  
`1. **Shopping Center**`  
   `- Structure: 80 floors, 4 rooms per floor, 5 capsules per room.`  
   `- Runs 24 hours with personnel working in shifts.`  
   `- Pays lease every 4 years with interest incrementing by \( \frac{100}{12} \)% every 4 years, capping at 100% before the structure is destroyed after 48 years.`

`2. **Capsules (Personnel)**`  
   `- Each capsule represents 1,000 members.`  
   `- Each capsule works 40 hours per week, with shifts ensuring 24-hour coverage.`  
   `- Personnel assist 1 consumer every 2 hours.`

`3. **Consumers**`  
   `- Interacted with by personnel at the shopping center.`  
   `- Purchase content (tracks) at $0.69 per interaction.`

`4. **Bank**`  
   `- Provides loans to the shopping center.`  
   `- Charges interest on loans with an increment of \( \frac{100}{12} \)% every 4 years.`

`5. **Government**`  
   `- Builds and sells structures.`  
   `- Receives funds from sales to eyeriS Corporation.`

`6. **eyeriS Corporation**`  
   `- Buys structures from the government.`  
   `- Leases structures to shopping centers.`

`#### Components`  
`1. **Capsule Component**`  
   `- Represents 1,000 members.`  
   `- Tracks working hours and shifts.`  
   `- Tracks consumer interactions.`

`2. **Shopping Center Component**`  
   `- Tracks number of floors, rooms, capsules.`  
   `- Calculates total personnel capacity.`  
   `- Calculates revenue from consumer interactions.`  
   `- Manages lease payments and interest calculations.`

`3. **Financial Component**`  
   `- Tracks loans from the bank.`  
   `- Calculates interest and payments.`  
   `- Tracks lease payments to eyeriS Corporation.`  
   `- Tracks revenue from sales.`

`4. **Government Component**`  
   `- Tracks construction costs.`  
   `- Tracks sales to eyeriS Corporation.`

`5. **eyeriS Corporation Component**`  
   `- Tracks purchases from the government.`  
   `- Tracks lease agreements with shopping centers.`

`#### Systems`  
`1. **Capsule Management System**`  
   `- Manages working hours and shifts for capsules.`  
   `- Ensures 24-hour coverage with shifts.`

`2. **Consumer Interaction System**`  
   `- Calculates consumer interactions based on personnel.`  
   `- Tracks content sales revenue.`

`3. **Financial System**`  
   `- Manages loans and interest calculations.`  
   `- Processes payments from shopping centers to the bank.`  
   `- Tracks lease payments to eyeriS Corporation.`

`4. **Government System**`  
   `- Manages construction and sales of structures.`  
   `- Receives funds from eyeriS Corporation.`

`5. **eyeriS Corporation System**`  
   `- Manages purchase of structures from the government.`  
   `- Manages lease agreements with shopping centers.`

`These detailed requirements and calculations will help in setting up a comprehensive simulation for the currency flow and operations within the game "Record Label Simulator". If you need further adjustments or additional details, let me know!`
