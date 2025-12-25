

`### Eras`

`- An **Era** is an in-game period during which the **Act** promotes one or more projects cohesively within a specific in-game timeframe.`
`- Multiple Eras can overlap across different Acts, and a single Act can participate in multiple concurrent Eras.`
`- Scheduling or releasing a Track auto-starts a new Era for the Act if the Track is not already tied to an active Era.`
`- Each Era is tied to one or more content types (Track, Feature, Project) and keeps a list of associated content.`

`#### Era Duration and Auto-End (canon)`

`- Eras auto-end within 6 months to 1 year.`
`- At the 6-month checkpoint, compute is_charting:`
`  - is_charting = true if any Era + Act-associated content is charting on any chart (latest chart issue on or before the checkpoint).`
`- If is_charting is true, the Era lasts 1 year total.`
`- If is_charting is false, the Era ends at 6 months.`

`#### Types of Eras`

`- An Era can be a Flop, Mid, Successful, or Iconic.`

`##### Flop Era`

`- Determined dynamically in relation to the previous Era’s performance.` 

`##### Mid Era`

`- Profitable but Safe Era.`

`- Determined by the Act’s previous Era if it remains too similar in terms of its content Genre and the Behavior of the Act(s).`

`##### Successful Era`

`- Profitable and Neutral Era.`

`- Determined dynamically in relation to the previous Era’s performance.` 

`- If the Act remains consistent in either content Genre or Behavior but successfully executes a deviance in one of the two that doesn’t stray too far from their established content Genre and Alignment.`

`##### Iconic Era`

`- Iconic Era: Profitable and Risky Era.`

`Iconic eras can increase Popularity and earn more Currency and EXP but might decrease Alignment if the Act(s) deviate too much from their established **content Genre** and **Behavior**.`

`##### New Acts Exceptions`

`An era for a New Act without a previous Era is considered Successful or Flop based on its Financial Performance. If it loses money (doesn’t exceed Expenses), it is a flop. If it breaks even or earns money (exceeds Expenses), it is successful. A New Act cannot have an Iconic Era on its own, but can collaborate with an Established Act to do so.`
