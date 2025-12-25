### **`Economy - Loan and Interest Rate System`**

#### **`Entities:`**

1. **`Government`**  
2. **`Community Members`**  
3. **`Corporations`**  
   * **`Record Labels`**  
   * **`eyeriS Corporation`**  
4. **`Bank`**

#### **`Components:`**

1. **`Loans`**  
2. **`Interest Rates`**  
3. **`Supply and Demand`**  
4. **`Structures and Lots`**

#### **`Systems:`**

1. **`Loan System`**  
2. **`Interest Rate System`**  
3. **`Supply and Demand System`**

### **`Loan System:`**

1. **`Government:`**  
   * **`Loans from the Bank:`**  
     * **`Purpose:`** `To build structures (residences, studios, venues).`  
     * **`Interest Rate:`** `0% (no interest).`  
   * **`Repayment:`** `Managed through taxes and income from other in-game activities.`  
2. **`Community Members:`**  
   * **`Loans from the Bank:`**  
     * **`Purpose:`** `To cover necessities when unemployed after age 20.`  
     * **`Interest Rate:`** `Fluctuates based on supply and demand, increasing by 3% every 4 years.`  
     * **`Repayment:`** `50% of the 33% allocated to necessities.`  
3. **`Corporations (Record Labels and eyeriS Corporation):`**  
   * **`Loans from the Bank:`**  
     * **`Purpose:`** `To purchase structures built by the government, for leasing, and to manage operations.`  
     * **`Interest Rate:`** `Fluctuates based on supply and demand at the time of borrowing.`  
   * **`Repayment:`** `Spread over 30 years with a fixed interest rate, repaid monthly. Lease payments are made every 4 years.`

### **`Interest Rate System:`**

1. **`Fluctuation Mechanism:`**  
   * **`Interest Rate Range:`** `0.02% to 50%.`  
   * **`Factors Influencing Rate:`**  
     * **`Supply of Empty Lots:`** `High supply lowers the interest rate.`  
     * **`Demand for Structures:`** `High demand increases the interest rate.`  
2. **`Interest Rate Application:`**  
   * **`Government Loans:`** `Always at 0% interest.`  
   * **`Community Members' Loans:`** `Adjusts based on current supply and demand, increasing by 3% every 4 years after age 20.`  
   * **`Corporations' Loans:`** `Adjusts based on current supply and demand at the time of borrowing, fixed for the loan duration.`

### **`Supply and Demand System:`**

1. **`Supply of Empty Lots:`**  
   * **`High Supply:`**  
     * **`Interest Rate:`** `Decreases towards 0.02%.`  
     * **`Effect:`** `Encourages borrowing, stimulates building and economic growth.`  
   * **`Low Supply:`**  
     * **`Interest Rate:`** `Increases up to 50%.`  
     * **`Effect:`** `Discourages borrowing, slows down construction, and reduces economic expansion.`  
2. **`Demand for Structures:`**  
   * **`High Demand:`**  
     * **`Interest Rate:`** `Increases up to 50%.`  
     * **`Effect:`** `Increases cost of loans, may limit expansion due to high borrowing costs.`  
   * **`Low Demand:`**  
     * **`Interest Rate:`** `Decreases towards 0.02%.`  
     * **`Effect:`** `Lower borrowing costs, encourages new projects and investments.`

### **`Interaction of Systems:`**

1. **`Government Building and Loan Repayment:`**  
   * `Government builds residences and other structures using loans from the bank at 0% interest.`  
   * `These structures are essential for housing community members and providing facilities for corporations.`  
2. **`Community Members' Loan Use and Repayment:`**  
   * `When unemployed, members take loans for necessities with a fluctuating interest rate starting at 3%, increasing by 3% every 4 years.`  
   * `Loans are repaid using 50% of the 33% of their income allocated to necessities.`  
3. **`Corporations' Expansion and Financial Management:`**  
   * `Corporations take loans to purchase and lease structures.`  
   * `Interest rates for these loans fluctuate based on the supply of empty lots and demand for structures at the time of borrowing.`  
   * `Repayment is spread over 30 years with a fixed interest rate, while lease payments are made every 4 years.`

### **`Example Scenario:`**

1. **`High Supply of Empty Lots:`**  
   * **`Interest Rate:`** `0.02%.`  
   * **`Effect on Community Members:`** `Lower cost loans, easier to cover necessities.`  
   * **`Effect on Corporations:`** `Lower borrowing costs, encourages expansion and building projects.`  
   * **`Effect on Government:`** `Continues to build with 0% interest loans, supports economic growth.`  
2. **`High Demand for Structures:`**  
   * **`Interest Rate:`** `50%.`  
   * **`Effect on Community Members:`** `Higher cost loans, increased financial burden.`  
   * **`Effect on Corporations:`** `Higher borrowing costs, may limit expansion projects.`  
   * **`Effect on Government:`** `Continues to support the economy through building, but with careful financial planning due to higher costs for members and corporations.`

`This succinctly explains the loan and interest rate system in the Record Label Simulator.`
