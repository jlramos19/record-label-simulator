# **Record Label Simulator: Preliminary Quality Assignment**

*How Creators and the Player Influence Content Quality*

---

## **1\. Contributors to Preliminary Quality**

Preliminary Quality is assigned during the **Content Creation Phase** by combining inputs from:

1. **Songwriters** (Weight: 0.5x)  
   * Define **Theme** (e.g., Freedom, Power).  
2. **Vocalists** (Weight: 0.5x)  
   * Define **Mood** (e.g., Daring, Calming).  
3. **Producers** (Weight: 1.0x)  
   * Synthesize Theme \+ Mood → Assign content **Genre** and **Preliminary Quality**.  
4. **Player (Executive)** (Weight: 1.0x)  
   * Strategic decisions (e.g., budget, marketing, Trends alignment).

---

## **2\. Calculation Formula**

Preliminary Quality is a **weighted average** of contributor scores:

Preliminary Quality=(Songwriter×0.5)+(Vocalist×0.5)+Producer+Player3.0

Preliminary Quality=

3.0

(Songwriter×0.5)+(Vocalist×0.5)+Producer+Player

​

* **Total Weights**: 0.5 (Songwriter) \+ 0.5 (Vocalist) \+ 1.0 (Producer) \+ 1.0 (Player) \= **3.0**  
* **Scores**: Contributor inputs are rated 0–100.  
* **Output**: Rounded to the nearest integer (0–100).

---

## **3\. Step-by-Step Example**

### **Scenario: Creating a Track**

| Contributor | Raw Score | Weighted Score |
| :---- | :---- | :---- |
| Songwriter (Theme) | 80 | `80 × 0.5 = 40` |
| Vocalist (Mood) | 70 | `70 × 0.5 = 35` |
| Producer (content Genre) | 90 | `90 × 1.0 = 90` |
| Player (Executive) | 85 | `85 × 1.0 = 85` |

Preliminary Quality=40+35+90+853.0=2503≈83 (Grade: B)

Preliminary Quality=

3.0

40+35+90+85

​

\=

3

250

​

≈83 (Grade: B)

**Result**:

* **Preliminary Quality**: 83/100 (B).  
* **Impact**:  
  * content Genre viability (e.g., "Daring Power").  
  * Baseline for Critics’ final rating (modified by Alignment and Trends).

---

## **4\. Role of the Producer**

The Producer’s **1.0x weight** reflects their critical role in:

* Combining **Theme** (Songwriter) \+ **Mood** (Vocalist) → content **Genre**.  
* Setting the initial Quality floor (e.g., a Producer with low skill caps maximum Quality).  
* Finalizing technical polish (mixing/mastering) for the Track.

---

## **5\. Player (Executive) Influence**

The Player’s **1.0x weight** represents strategic decisions, such as:

* Hiring high-skill Producers to offset weaker Songwriters/Vocalists.  
* Allocating budget for better studio equipment (boosts Producer score).  
* Aligning Content with **Trending Genres** (improves Audience engagement).

---

## **6\. ECS Integration**

* **QualityComponent**: Stores the Preliminary Quality score.  
* **ContentCreationSystem**: Executes the weighted formula during Track production.  
* **CriticsCouncilSystem**: Uses Preliminary Quality \+ Alignment to generate final Critic ratings.

---

## **7\. Strategic Implications**

* **High Producer/Player Scores**: Compensate for mediocre Songwriters/Vocalists.  
* **Low Preliminary Quality (F Grade)**:  
  * Fails to generate Trends (e.g., "Boring" Mood).  
  * Risks Critic backlash and Audience disengagement.  
* **Balancing Act**: Prioritize Creators and strategies that maximize weighted contributions.

