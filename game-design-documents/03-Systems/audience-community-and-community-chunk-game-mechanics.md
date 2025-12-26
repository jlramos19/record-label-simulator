## **`Audience`**

`The audience in Record Label Simulator is a collective term for all the virtual individuals who interact with the content you release. They are the consumers of your Record Label, driving the game's economy and the player's success. The audience's behavior collectively determines the popularity of music and the reach of different content released in the game.`

## **`Community`**

`Communities are subsets of the audience segmented based on the music genres they prefer, with 45 unique communities representing the 45 different content genres available. Each community behaves as a group with shared musical interests, and their interactions with content are crucial to shaping the Record Label's strategy for content creation and release schedule to maximize engagement.`

## **`Community Chunk`**

`A Community Chunk refers to a group of precisely 1,000 members within a community, acting as a unit with consistent behavior and preferences, simplifying the game's mechanics related to audience response and interaction. Each chunk has a trait for active hours determining when they will most likely engage with content that matches their preferred content genre. The sum of these chunks' behaviors outlines the overall pattern and preferences of their entire community.`

`_____`  
`## Audience Behavior in MVP`

`For the MVP, the audience behavior will be binary based on their active hours. The audience is divided into nocturnal and diurnal groups, with each group's content consumption strictly determined by the in-game time, independent of music genre preferences.`

`## Community Behavior in MVP`

`Communities, in the MVP stage, are not yet differentiated by their content genre preferences. Instead, they are represented simply by the dichotomy of nocturnal and diurnal, which dictates when they engage with the released content.`

`## Community Chunk Behavior in MVP`

`Each community chunk, comprising 1,000 members, will mirror the behavior of their broader community—nocturnal or diurnal. These chunks will interact with the content only during their active hours: either 6 AM to 6 PM for diurnal chunks or 6 PM to 6 AM for nocturnal chunks. The complexity of content genre preferences and varied active hours will be developed beyond the MVP.`

`________`

## **`Audience Mechanics`**

`The audience in the Record Label Simulator comprises the entirety of the game’s consumers, who interact with and respond to the content released by the player. They are the primary target for the player's content and the driving force behind the in-game expression points system.`

* `The audience consumes content based on active hours.`  
* `Their engagement directly impacts the player's EXP earnings.`

## **`Community Mechanics`**

`Each community represents a segmented portion of the audience, organized by shared music genre preferences. In the MVP phase, these preferences are not coded in yet, so the communities are mainly differentiated by their active hours.`

* `Communities consist of nocturnal and diurnal groups.`  
* `They are set to evolve into more complex systems with 45 distinct content genres, shaping the in-game music culture and strategy.`

## **`Community Chunk Mechanics`**

`A community chunk is a subset of a community, comprising 1,000 members who behave as a cohesive unit within the game. The community chunk is a foundational element for scaling "in-game sales" and audience interaction.`

* `Chunks have a 50% chance to consume content during their active hours.`  
* `Once a chunk consumes content, a cooldown period is initiated, preventing them from consuming the same content type until the next day.`  
* `Following their engagement and subsequent cooldown, the community chunk's chance to consume the same content is reduced to 25% after the cooldown period and during its active hours.`  
* `Chunks operate within designated active hours—6 AM to 6 PM for diurnal and 6 PM to 6 AM for nocturnal.`  
* `When chunks consume content, the player receives 1000 EXP per chunk.`  
* `Chunks’ interactions are time-based initially but will later be determined by their preferred music genres.`

`NOTE: The rule regarding the community chunk's reduced chance of re-engagement with content at a 25% rate is specific to content released within a particular era. If there isn't a continuous stream of new content being released within that era to maintain the community chunk's engagement, the likelihood that the community chunk will interact with the existing content again diminishes. This mechanic underscores the importance of consistently producing fresh content to sustain audience interest within an era.`

`______________________`

`The MVP (Minimum Viable Product) for your Record Label Simulator game defined in this conversation includes:`

`- A fundamental **game loop** where the player, as the music executive, creates content by clicking a "Create Content" button, which then appears in an empty inventory slot.`

`- The player schedules this content for release using an **in-game calendar** system, with the ability to choose specific hours and days for when the content will go live.`

`- The audience is composed of **community chunks**—groups of 1,000 members—categorized into nocturnal and diurnal communities based on their active hours (6 PM to 6 AM and 6 AM to 6 PM, respectively).`

`- When content is released, community chunks have a **50% chance to engage** with it during their active hours. Once a chunk consumes content, it enters a **cooldown period** to prevent immediate re-engagement.`

`- After a cooldown, if the same community chunk encounters the same type of content from a specific era, their engagement chance is **reduced to 25%**.`

`- The player is rewarded with **Expression Points (EXP)** for each interaction from an audience chunk, with the interaction number reflecting the "population" of that chunk.`

`This MVP sets the stage for the player to manage both content creation and release strategy within the game's simulated music industry environment. Later enhancements include the introduction of a currency system and economic mechanics as part of Phase Two, following the successful implementation of these fundamental features in the web app.`

`Model and Design`

`Community Members will be represented by simple UI avatars or tokens, color-tinted by the theme and mood they prefer. Headphone icons can represent the music they are currently consuming.` 
