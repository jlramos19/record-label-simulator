# **Record Label Simulator — Sheet Music (Preliminary Content)**

## **Purpose**

Define Sheet Music as a Preliminary Content object in Record Label Simulator. This replaces devlog framing and aligns with current canon: Creator occupations (Songwriter, Recorder, Producer), Alignment (Safe/Neutral/Risky), Preferred Theme (5), and Preferred Mood (9).

## **Infobox — Content**

| Property | Value |
| :---- | :---- |
| Name | Sheet Music |
| Content Type | Preliminary Content |
| Phase | Content Creation |
| Owner Role | Songwriter (primary) |
| Downstream Users | Recorder, Producer |
| Primary Purpose | Blueprint for a Track: musical structure, lyrics, and Theme |
| Outputs | Sheet Music asset → inputs to Demo Recording and Track Finalization |
| Linked Systems | Alignment · Preferred Theme (5) · Preferred Mood (9) · Charts |

## **Definition**

Sheet Music is the authored blueprint of a future Track. It contains the musical composition and lyrical text, establishes the Preferred Theme, and provides the narrative backbone that downstream stages interpret.

## **Metadata (Schema)**

| Field | Type | Notes |
| :---- | :---- | :---- |
| sheet\_music\_id | UUID | Unique identifier |
| title | String | Working title |
| preferred\_theme | Enum | Freedom · Loyalty · Ambition · Morality · Power |
| intended\_mood | Enum | Cheering · Saddening · Thrilling · Angering · Calming · Energizing · Uplifting · Boring · Daring |
| tempo\_bpm | Integer | Typical 60–200 |
| time\_signature | String | e.g., 4/4, 3/4, 6/8 |
| key\_signature | String | e.g., C major, A minor |
| lyric\_text | RichText | Verses/chorus/bridge |
| sections | Array\<String\> | Intro, Verse, Chorus, Bridge, Outro |
| length\_estimate\_sec | Integer | Rough duration |
| composer\_ids | Array\<UUID\> | Songwriter(s) |
| created\_at / updated\_at | Timestamps | Audit trail |
| quality\_seed | Float (0–1) | Initial authoring quality seed |

## **Lifecycle**

1. Draft: Songwriter authors initial version in a Recording Studio slot.  
2. Review: Optional internal review for structure/Theme clarity.  
3. Approved for Demo: Unlocked for Recorder to record a Demo Recording.  
4. Consumed: Producer merges with Demo Recording to finalize a Track.  
5. Archived: Preserved for remixes, alternate takes, or historical reference.

## **Roles & Usage**

**Songwriter —** 

* Creates Sheet Music (lyrics & composition); sets Preferred Theme.

**Recorder (Creator ID) —** 

* Consumes Sheet Music to produce a Demo Recording; expresses Preferred Mood.

**Producer —** 

* Combines Sheet Music \+ Demo Recording to finalize a Track (content genre & quality).

## **Quality & Alignment**

Final Track quality benefits from strong alignment between the Sheet Music’s Preferred Theme and the Recorder’s Preferred Mood. High alignment improves Audience and Critics response and influences Charts velocity.

## **Telemetry**

* sheet\_music\_id, songwriter\_id  
* preferred\_theme, intended\_mood, tempo\_bpm, key\_signature  
* real\_time\_ms\_spent, ticks\_spent  
* quality\_seed, alignment\_score (0–100)

## **Notes**

Legacy branding (Topoda Charts) and deprecated terms (Guider, Drives/FLAMP) are retired. Use current canon: Creator, Alignment, Preferred Theme, Preferred Mood.

— End —
