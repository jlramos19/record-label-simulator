**Record Label Simulator**  
**CEO 12 Requests \- Annual Winner & Tie-Break Protocol (Gaia)**

*Version: 1.0   |   Last updated: December 14, 2025*

# **1\. Purpose**

This document defines how yearly winners are computed for the CEO’s 12 Requests (the main game-winning achievements). It guarantees a single winner Act per achievement per calendar year at Gaia scope, with no ties.

# **2\. Scope and Definitions**

**Scope:**

* Applies to all “of the year in Gaia” CEO achievements.  
* Evaluated per in-game calendar year (12 months).  
* Output is exactly one winner Act per achievement per year. No ties are allowed.

**Key definitions:**

**Gaia:** The world scope. Gaia contains 3 countries.

**Country (Nation):** A whole-country scope (for example: “Annglora (nation)”).

**Region:** A sub-national scope within a country (for example: “Elsewhere in Annglora (region)”).

**Global:** A global scope across Gaia.

**Calendar year:** A 12-month in-game year. (Time speed differs, but the calendar structure is 12 months.)

**Winner Act:** The single Act that wins a given achievement for a given calendar year.

# **3\. CEO’s 12 Requests (Achievements)**

Each achievement is evaluated “of the year” and “in Gaia”, producing exactly one winner Act per year.

| Category | Achievement \# | Achievement wording |
| :---- | :---- | :---- |
| Tracks | 1 | Most chart-topping track of the year in Gaia |
| Tracks | 2 | Best-selling / most-streamed track of the year in Gaia |
| Tracks | 3 | Most awarded / critically acclaimed track of the year in Gaia |
| Projects | 4 | Most chart-topping project of the year in Gaia |
| Projects | 5 | Best-selling / most-streamed project of the year in Gaia |
| Projects | 6 | Most awarded / critically acclaimed project of the year in Gaia |
| Promotional Content | 7 | Most chart-topping promotional content of the year in Gaia |
| Promotional Content | 8 | Best-selling / most-watched promotional content of the year in Gaia |
| Promotional Content | 9 | Most awarded / critically acclaimed promotional content of the year in Gaia |
| Tours | 10 | Most chart-topping tour of the year in Gaia |
| Tours | 11 | Best-selling / highest-attended tour of the year in Gaia |
| Tours | 12 | Most awarded / critically acclaimed tour of the year in Gaia |

# **4\. Non-Negotiables**

* Exactly one winner Act per achievement per calendar year (no ties).  
* Never use chart position details (rank, peak, weeks-on-chart, etc.) as a tie-breaker.  
* Tie resolution must be deterministic and year-bounded.

# **5\. Scope Weights**

The same scope weights are used whenever a metric is counted by scope (per week for chart \#1s; per-year totals for critics and awards).

| Scope | Weight |
| :---- | :---- |
| Regional | 1 point |
| National | 2 points |
| Global | 3 points |

# **6\. Chart-Topping Achievements \- Primary Scoring**

Applies to achievements \#1, \#4, \#7, \#10.

Primary scoring rule (per calendar year):

1\. For each week in the year, for each scope where the content is \#1, award points using the scope weights (Regional=1, National=2, Global=3).

2\. Sum all points across the calendar year to get the Act’s Chart-Topping Score.

3\. Winner Act is the Act with the highest Chart-Topping Score for that achievement and year.

Note: weights are applied per week at \#1 (not per chart position).

# **7\. Sales/Streams/Views/Attendance Achievements \- Primary Scoring**

Applies to achievements \#2, \#5, \#8, \#11.

Primary scoring rule (per calendar year):

1\. Compute the global total for the year for the relevant measure (sales + streams weighted at 0.1, views, or attendance, depending on the achievement wording).

2\. Winner Act is the Act with the highest global total for that year.

Design intent: a global total is the simplest yearly comparison and discourages “camping” a position and then collapsing later, because it favors sustained volume across the year.

# **8\. Most Awarded / Critically Acclaimed Achievements \- Primary Scoring**

Applies to achievements \#3, \#6, \#9, \#12.

Primary scoring rule (per calendar year):

1\. Compare Critical Acclaim first (critics outcome), using the scope weights where applicable (Regional=1, National=2, Global=3).

2\. Winner Act is the Act with the strongest critics outcome for that year (Gaia scope).

If still tied, Awards are used next (see tie-break ladder).

# **9\. Tie-Break Ladder (No-Ties Guarantee)**

If a tie remains after the primary scoring for a given achievement, resolve it using the following ladder, stopping as soon as a single winner exists. (Never use chart position details.)

1\. Sales/Streams: compare global total for the same calendar year (streams weighted at 0.1).

2\. Critics: compare year-bounded critics outcome using scope weights (Regional=1, National=2, Global=3).

3\. Awards: compare year-bounded awards outcome using scope weights (Regional=1, National=2, Global=3).

4\. First Achieved: earliest in-game timestamp at which the Act’s yearly outcome satisfies the win condition.

# **10\. First Achieved Rule (Final Failsafe)**

If two (or more) Acts remain tied after Sales/Streams, Critics, and Awards comparisons, the tie is broken by who achieved the goal first. “Achieved first” is defined as the earliest in-game timestamp at which the Act’s result meets the win condition for that achievement in that calendar year.

# **11\. Worked Example (Chart-Topping Tie)**

This example illustrates the intended behavior. Numbers are illustrative.

* Two Acts end the year with identical Chart-Topping Scores.  
* Tie-break step 1 compares global total sales/streams for that year (streams weighted at 0.1); the Act with higher global total wins immediately.  
* Critics and Awards are only consulted if Sales/Streams still ties.  
* Chart position details (peak rank, weeks-on-chart, etc.) are never used to break the tie.

# **12\. Change Log**

v1.0 (Dec 14, 2025): Initial consolidation of yearly winner scoring \+ tie-break rules for CEO 12 Requests.
