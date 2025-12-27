# **`Record Label Simulator – MVP Gameplay Overview`**

## **`Game Loop & Objectives`**

`Role & Cycle: In Record Label Simulator (RLS), you play as a music executive managing a label in the Gaia nations. The core loop is to sign Creators (songwriters, recorders, producers), produce tracks through the sheet/demo/master pipeline, schedule releases, fund promotions, and read weekly charts and trends to steer the next cycle. Progress is measured by CEO Requests (achievements). Before year 3000 you must clear 12 Requests without triggering a monopoly; from year 3000-3999 either 12 Requests or a monopoly secures a win state. At year 4000 the game resolves with a final verdict based on win state, monopoly, or top label status. Bankruptcy triggers a bailout choice; declining ends the run, accepting locks achievements.`

`High-Level Loop: The gameplay progresses in repeating phases: (1) Recruit & assign Creators to projects, (2) Create content through multiple stages (composition to final track), (3) Schedule releases and fund promotions, (4) Monitor weekly charts and trends for feedback, and (5) Adjust strategy to begin the cycle anew. Time advances in real time: one in-game hour passes every ~2.5 seconds on Play or ~1 second on Fast. Charts refresh weekly (168 hours). Time controls include pause, play, fast, and skip options for day/week/custom date jumps.`

## **`Creator Recruitment & Management`**

`Signing Creators: Your label signs Creators from the CCC market roster (Songwriters, Recorders, Producers). Signing costs scale with skill and role, and roster size is capped at 125. Accepted offers deduct cash and move the Creator into the roster; rejected offers lock the Sign button until the next 12AM refresh (precondition failures do not lock out). Signed Creators become managed UI entries and can be assigned to Acts or production slots.`

`Roles & Functions:`

* `Songwriters - Create Sheet Music, setting the track's Theme. Their skill and theme preference matches contribute to quality potential.`

* `Recorders - Record Demo versions, setting the track's Mood. Their skill and mood preference matches contribute to quality potential.`

* `Producers - Master the track, confirming Alignment and finalizing the Theme+Mood genre. Their skill has the largest impact on quality potential.`

`Stamina & Catharsis: Creators have stamina (max 400) for throughput and catharsis for quality (a skill-weighted stamina score). Each stage consumes stamina (Sheet 25, Demo 50, Master 100). Idle Creators regenerate 50 stamina per in-game hour. Catharsis is derived from skill and current stamina, keeping higher-skill Creators steadier at low stamina. If a Creator exceeds 200 stamina used in a day, they accrue an overuse strike and may enter a departure state. Studio slots gate how many work orders can run at once, so scheduling and rest management are core pacing tools.`

## **`Content Creation Pipeline`**

`Multi-Stage Creation: Producing a song (Track) is a three-phase process:`

1. `Sheet Music (Composition) - Created by a songwriter, establishing the track's core Theme (e.g. Freedom, Ambition). Takes 1 in-game hour and consumes 25 stamina.`

2. `Demo Recording (Draft) - Recorded by a recorder, layering on a Mood (e.g. Calming, Energizing, Daring) to shape the track's emotional feel. Takes 2 in-game hours and consumes 50 stamina.`

3. `Master Recording (Final Track) - Finalized by a producer who combines the Theme and Mood into the final content Genre classification and applies studio polish. Takes 3 in-game hours and consumes 100 stamina.`

`Stage costs are set at $500 / $800 / $1200 and are used to calculate lease fees for unowned studio slots.`

`Quality & Grades: A track's quality potential is computed from creator skills, Theme/Mood preference matches, and modifiers, with a penalty for the Boring mood. Each stage reveals a percentage of that potential (35% after Sheet, 70% after Demo, 100% after Master). Quality uses the 0-100 scale with grades: A (90-100), B (80-89), C (70-79), D (60-69), F (<60).`

`Themes, Moods & content Genre: Theme and Mood selections define the content Genre (Theme / Mood). There are 5 Themes x 9 Moods; the Boring mood never trends and carries a quality penalty. Trends are derived weekly from the top 3 global genres, and Alignment (Safe/Neutral/Risky) shapes chart scoring via regional profiles.`

## **`Projects, Release & Distribution`**

`Tracks vs Projects: Tracks are the primary release unit but can be tagged with a Project name and type (Single 1-4, EP 5-7, Album 8-32) for grouping, scheduling, and recommendations. Project tags roll up promo coverage and physical run estimates across the grouped tracks.`

`Release Scheduling: Releases can be scheduled as Digital, Physical, or Both. The Release Desk supports immediate release or queueing +7d / +14d; recommendations prefer immediate digital drops for trend matches or a two-week lead for high-quality physical rollouts (Both follows the physical lead). When the scheduled hour arrives, the track is released to the market and begins charting.`

`Distribution Pricing & Tradeoffs: Digital releases are fastest and low-overhead (baseline single $0.69), ideal for trend chasing. Physical releases command higher unit prices (baseline single $4.99 with project-type multipliers: Single 1.00x, EP 1.55x, Album 2.25x) plus per-format fees ($500). "Both" captures both channels but uses the physical timeline and costs. The 30-70 per-track pricing pattern is a legacy target and is not active in the web MVP.`

`Rival Distribution Logic: AI labels follow the same release guidance as the player: trend matches favor immediate digital releases, high-quality projects take the 2-week physical lead, and mid-tier releases use the 1-week digital prep window.`

`Promotion: Promo pushes are budgeted spends that add 1-4 promo weeks to a released track. Promotion types include Music Video, Live Performance, eyeriSocial Post, and Interview; each can post to eyeriSocial templates and boosts chart scores while promo weeks last. Touring is implemented with booking, projections, and chart surfaces, while wallet impact remains gated by the touring balance flag.`

## **`Audience, Trends & Regions`**

`Audience Segments: The world is divided into 3 nations (Annglora, Bytenza, Crowlya), each split into Capital and Elsewhere regions. Regional profiles define preferred Alignment, Theme, and Mood combos; chart scoring rewards matches against those profiles. The MVP abstracts demographic chunks into these region profiles.`

`Trends System: Every in-game week, the simulation totals global chart scores and promotes the top 3 non-Boring Theme/Mood genres to trends. Trend matches grant a score bonus and inform recommendations.`

`Regional Variation: Charts are calculated separately for each nation and region, so the same track can rank differently depending on alignment/theme/mood fit and chart decay. Trend status is global in the MVP, but regional preferences still shape local rankings.`

## **`Critics & Quality Feedback`**

`Critics' Councils: In the MVP, critic influence is abstracted into chart scoring rather than a separate council system. Alignment, Theme, and Mood matches act as the "critical reception" component of a track's score.`

`Alignment Alignment: Alignment (Safe/Neutral/Risky) matters through regional preference bonuses/penalties rather than bespoke critic panels.`

`Feedback & Adaptation: Feedback is surfaced through chart movement, trend changes, and genre rankings. Players use these signals to adjust Themes, Moods, and Alignments in subsequent releases.`

## **`Charting & Performance Metrics`**

`Charts Hierarchy: Charts update weekly. Global Top 100, Nation Top 40, and Region Top 10 lists are computed from a score that starts with quality, adds alignment/theme/mood matches, trend and promo bonuses, noise, and applies weekly decay (5% per week, floor 40%).`

`Display Metrics: Sales/streaming/airplay/social figures are derived from the score using weights (0.35/0.20/0.30/0.15) for UI reporting; streams also apply a 5x volume multiplier to keep counts higher, but they do not drive ranking in the current MVP.`

`Feedback Loops: Chart performance feeds trend momentum, label reach, and strategic decisions. Rival releases and promo pushes shift rankings week to week, so pacing releases and promotions is a core loop.`

## **`Economic Management (Studios, Money & Resources)`**

`Studios & Infrastructure: The MVP models studio capacity as owned slots plus leased market slots. Using unowned slots accrues lease fees calculated from stage costs and market scarcity; owned slots avoid those fees. The UI displays baseline lease/build prices for reference, while gameplay focuses on managing slot availability and weekly upkeep.`

`Revenue & Expenses: Weekly revenue is derived from global chart scores (score * 22 per track). Weekly upkeep scales with creator headcount, owned studio slots, and any lease fees. Promotions subtract cash immediately, and bankruptcy triggers a bailout choice.`

`Modifiers & Items: Production modifiers adjust quality, time, and cost for a track's pipeline. Current MVP modifiers include Sensory Sage (higher quality, slower output) and Dispatch Dust (faster output, lower quality). Modifiers are applied per track during creation and affect quality potential.`

## **`User Interface & Controls`**

`Time & Pace: The UI features a top bar with the current in-game date/time and controls to adjust time flow. You can pause, run at normal speed, fast-forward, or skip ahead (24h, 7d, or a custom date/time). Game mode determines the start year: Founding Mode begins in 2025; Modern Mode begins in 2400 with a seeded market. The date is displayed in a format like SAT - JAN 01, 2400 - 12AM (UTC).`

`Main Panels: The interface uses routed views rather than persistent side panels. The top nav switches between Dashboard, Charts, Create, Release, Calendar, Eras, Roster, Community (CCC), Promotions, and Tour. Each view owns its main panel and optional side panels, which can be toggled per view. CEO Requests and status surfaces live on the Dashboard, while scheduling lives in Release and Calendar views.`

* `(Additionally, context menus and overlay windows pop up for detailed information: e.g. clicking a Creator opens their Creator Card with stats, skills, and preferences; clicking a Track shows its quality, theme, mood, and critic feedback.)`

`Visual Style: The game emphasizes a dense, readable UI surface for the web app. In early gameplay, Members (general population NPCs) can be represented as simple UI avatars or list entries on a map-like panel (movement is simulated by timers and state changes). When those members become Creators (e.g. you sign a songwriter), they are removed from the public map/list and represented in the UI as an ID or card. This indicates a shift from the simulation world to the management interface - a deliberate design to prevent clutter and focus the player on managing through the UI once individuals "join" your organization. The UI conveys a lot of data in text and pill labels (for instance, Theme/Mood labels on a track, colored letters for Quality grade, arrows for chart movement). Tooltips and highlight colors are used to guide the player; for example, a track trending upward on a chart might be highlighted green with an upward arrow, and hovering it would show "+5 positions (Critics' Choice award bonus)". Similarly, if a Creator is low on stamina/catharsis, their portrait might flash or a tooltip might warn "Needs rest". These interface choices ensure that while the simulation data is complex, the player can quickly scan and understand the status and make informed decisions without needing to read raw numbers continuously.`

## **`Conclusion & Future Expansion`**

`In its MVP form, Record Label Simulator offers a comprehensive simulation of running a music label, focusing on the intertwined systems of content production, cultural trends, and business management. The gameplay we’ve described is the stable foundation – all the key loops (signing talent, making tracks, marketing them, reading feedback, and reinvesting profits) function together coherently. Notably, this foundation was built in a data-driven way (using an ECS architecture under the hood), which means adding complexity is straightforward without breaking existing systems . Future expansions can layer on more depth – e.g. additional content types, more nuanced artist personalities, dynamic events like music awards, or even story-driven scenarios – without changing the core loop. The design decisions captured here are the “latest and most stable” agreed-upon mechanics, balancing realism and fun: every stat has a purpose, every system feeds into another (a true gameplay loop), and the player is rewarded for understanding the flow of stats to strategy (how a songwriter’s skill leads to a Quality track, which leads to chart success, which fuels trend momentum, which suggests the next creative direction, and so on). By mastering these loops – and keeping an eye on those CEO Requests – players can guide their record label from obscurity to an Iconic Era of musical dominance, all while adapting to the ever-evolving world of trends and tastes.`

