`### Stamina Recharge Mechanic in "Record Label Simulator"`

`#### Overview`  
`This document outlines the stamina recharge mechanic for Creators (Songwriters, Vocalists, and Producers) in the MVP.`

`### Stamina Recharge Rate:`  
`- **Recharge Rate**: 50 stamina per in-game hour.`  
`- **Tick Granularity**: Recharge is split across four quarter-hour ticks and applies only if the Creator is idle (not in an active work order) at that tick.`  
`- **Condition**: Partial hours do contribute; there is no full-hour wait requirement.`

`### Detailed Explanation:`  
`1. **Idle Detection**:`  
   `- On each quarter-hour tick, creators not in any active work order receive a regen slice. Busy creators receive 0 on that tick.`

`2. **Recharge Amount**:`  
   `- Each in-game hour provides 50 total stamina, split deterministically into quarter slices (13, 13, 12, 12 per hour).`  
   `- Regen clamps to the stamina cap (currently 400).`

`3. **Partial Hours**:`  
   `- The total regen is the sum of the idle quarter slices; partial hours contribute accordingly.`

`### Examples:`

`1. **Songwriter**:`  
   `- **Current Stamina**: 100 units`  
   `- **Inactivity**: 2 in-game hours (8 quarter-hour ticks)`  
   `- **Recharge**: 100 units total (50 per hour)`  
   `- **Total Stamina after Recharge**: 200 units`

`2. **Vocalist**:`  
   `- **Current Stamina**: 50 units`  
   `- **Inactivity**: 1 in-game hour (4 quarter-hour ticks)`  
   `- **Recharge**: 50 units total (13 + 13 + 12 + 12)`  
   `- **Total Stamina after Recharge**: 100 units`

`3. **Producer**:`  
   `- **Current Stamina**: 0 units`  
   `- **Inactivity**: 4 in-game hours (16 quarter-hour ticks)`  
   `- **Recharge**: 200 units total`  
   `- **Total Stamina after Recharge**: 200 units`

`### Summary:`  
`- Stamina recharge is processed on quarter-hour ticks, alongside stamina depletion.`  
`- Idle quarters grant regen slices; partial hours count.`  
`- See docs/systems/stamina-and-hourly-ticks.md for the canonical tick contract.`
