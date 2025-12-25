`### Comprehensive Documentation for Record Label Simulator`

`#### **Introduction**`  
`This document consolidates the critical mechanics, data structures, and gameplay systems of Record Label Simulator, offering a clear and cohesive reference for development and refinement.`

`---`

`### **Game Loop**`  
`#### **Overview**`  
`The **Record Label Simulator** game loop revolves around:`  
`- Managing a **Record Label**.`  
`- Creating and promoting content.`  
`- Competing against AI-controlled Labels to achieve chart dominance and fulfill the CEO’s 12 requests.`

`---`

`### **Core Gameplay Phases**`

`#### **1. Creator Recruitment and Management**`  
`- **Objective**: Recruit and manage Creators to produce *Sheet Music*, *Demo Recordings*, and *Tracks*.`  
`- **Actions**:`  
  `- Sign **Songwriters**, **Recorders**, and **Producers**.`  
  `- Place Creator IDs into slots within Structures to perform specific tasks.`  
  `- Monitor **Catharsis Levels** (Active and Passive).`  
`- **Outputs**:`  
  `- High-quality content for release and promotion.`

`#### **2. Content Creation**`  
`- **Tasks and Ticks**:`  
  `- *Sheet Music*: 2.5 seconds (real-life), 1 hour (in-game), 25,000,000 ticks.`  
  `- *Demo Recordings*: 5 seconds (real-life), 2 hours (in-game), 50,000,000 ticks.`  
  `- *Track Finalization*: 7.5 seconds (real-life), 3 hours (in-game), 75,000,000 ticks【119†source】.`

`#### **3. Promotion and Engagement**`  
`- **Promotional Content**:`  
  `- Boost visibility through advertising campaigns, live performances, and videos.`  
  `- Match promotions to trending content genres and audience preferences.`  
`- **Audience Behavior**:`  
  `- Engage specific Community Members based on *Mood* and *Theme* preferences.`

`#### **4. Chart Monitoring**`  
`- **Regional Charts**:`  
  `- 6 regional charts across 3 countries: **Capital of Annglora**, **Elsewhere in Annglora**, **Capital of Bytenza**, **Elsewhere in Bytenza**, **Capital of Crowlya**, **Elsewhere in Crowlya**【120†source】.`  
`- **Global and content Genre-Specific Charts**:`  
  `- Track performance on core and specialized charts.`  
`- **Adjustments**:`  
  `- Refine strategies based on chart feedback.`

`#### **5. Victory Conditions**`  
`- **12 Requests**:`  
  `- Achieve #1 positions for *Tracks*, *Projects*, *Promotional Content*, and *Tours* in various categories【114†source】.`  
`- Maintain competitive relevance until the year 3000 without bankrupting all 7 AI Labels【120†source】.`

`---`

`### **Time and Ticks System**`  
`- **Definition**: The "calendar" is the internal time system tracked using long-type ticks.`  
`- **Progression**:`  
  `- 1 in-game hour = 25,000,000 ticks = 2.5 real-life seconds【119†source】.`  
  `- 1 in-game week = 420 real-life seconds (7 minutes).`  
`- **Serialization**:`  
  ``- The `calendar` ticks are serialized using Odin for precise restoration【112†source】.``

`---`

`### **In-Game Characters**`  
`- **Player**: Music Executive managing the Hann Record Label.`  
`- **Creators**:`  
  `- **Songwriter**: Creates *Sheet Music* with specific *Themes*.`  
  `- **Recorder**: Records *Demo Recordings* with emotional expression.`  
  `- **Producer**: Finalizes *Tracks*, defining their *content Genre* and *Mood*【116†source】.`  
`- **Community Members**: Consumers with preferences for specific *Moods* and *Themes*.`  
`- **Critics**: Assess *Content* for quality, influencing chart performance【116†source】.`

`---`

`### **Economic Model**`  
`- **Tuition and Residency**:`  
  `- Each building can house 1,600,000 members, with tuition at $1,815/month per capsule.`  
  `- Total monthly tuition per building: $2,904,000,000【118†source】.`  
`- **Studio Leasing**:`  
  `- Recording studios leased every 4 years for $44,000,000【118†source】.`  
  `- Construction cost equals total lease payments over 48 years: $528,000,000【118†source】.`

`---`

`### **UI Elements**`  
`#### **Top Bar**`  
`- **Calendar Display**:`  
  `- Current time shown as "SAT - JAN 01, 2400 - 12AM"【117†source】.`  
`- **Time Speed Controls**:`  
  `- Pause, Play Normal, Play Faster, Skip Time【117†source】.`

`#### **Left Panel**`  
`- **Community Management**:`  
  `- Lease Areas, sign Creators, and unlock Items【117†source】.`

`#### **Right Panel**`  
`- **Quests and Calendar**:`  
  `- Track main/side quests and schedule content releases【117†source】.`

`#### **Bottom Bar**`  
`- **Promote Content**:`  
  `- Organize promotional campaigns【117†source】.`

`---`

`### **Pre-Game Simulation Plan**`  
`- **Historical Simulation**:`  
  `` - Start: `SUN - AUG 31, 2025 - 12AM` ``  
  `` - End: `FRI - JAN 01, 2100 - 12AM` ``  
  `- Simulates the emergence of the music industry【114†source】.`  
`- **Charts History**:`  
  `- Provides data from 2100 to 2200 for player strategy【114†source】.`  
`- **Player Commencement**:`  
  ``- Begins active management on `SAT - JAN 01, 2400 - 12AM`【114†source】.``

`---`

`### **Conclusion**`  
`This document serves as a comprehensive guide to the mechanics and systems within Record Label Simulator, ensuring consistency and clarity across all gameplay elements.`

