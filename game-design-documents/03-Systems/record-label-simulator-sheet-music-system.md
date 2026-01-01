# **Record Label Simulator — Sheet Music (System)**

## **Purpose**

Define Sheet Music as a core system in Record Label Simulator, aligned with current canon: Creator occupations (Songwriter, Vocalist, Producer), Alignment (Safe/Neutral/Risky), Preferred Theme (5), and Preferred Mood (9). This document replaces legacy Record Label Simulator devlog framing.

## **Infobox — Systems**

| Property | Value |
| :---- | :---- |
| Name | Sheet Music |
| Type | System |
| Phase | Content Creation |
| Owner Roles | Songwriter (primary), Vocalist (downstream), Producer (downstream) |
| Structures | Recording Studio |
| Inputs | Songwriter time & stamina; Preferred Theme |
| Outputs | Sheet Music asset; feeds Demo Recording and Track Finalization |
| Linked Systems | Demo Recording · Track Finalization · Alignment · Themes · Moods · Charts |

## **Definition**

Sheet Music is the conceptual and structural blueprint of a Track, authored by a Songwriter. It establishes the Track’s Preferred Theme and narrative backbone that downstream stages interpret.

## **Roles & Responsibilities**

**Songwriter —** Creates Sheet Music: lyrics and composition; sets Preferred Theme.

**Vocalist (Creator ID) —** Consumes Sheet Music to record Demo Recordings; expresses Preferred Mood.

**Producer —** Merges Sheet Music and Demo Recordings to finalize Tracks (content genre & quality).

## **Creation Flow**

1. Assign a Songwriter to a Recording Studio slot.  
2. Songwriter spends time and stamina to produce a Sheet Music asset.  
3. Vocalist optionally converts the Sheet Music into a Demo Recording.  
4. Producer merges Sheet Music \+ Demo Recording to finalize a Track.

## **Time & Ticks**

| Stage | Real-Life Time | In-Game Time | Ticks | Stamina (typical) |
| :---- | :---- | :---- | :---- | :---- |
| Sheet Music (Songwriter) | ≈2.5 seconds | ≈1 hour | 25,000,000 | 25 (Mental) |
| Demo Recording (Vocalist) | ≈5 seconds | ≈2 hours | 50,000,000 | 50 (Physical) |
| Track Finalization (Producer) | ≈7.5 seconds | ≈3 hours | 75,000,000 | 150 (75 Mental \+ 75 Physical) |

## **Quality & Alignment**

Sheet Music quality results from a Songwriter’s skill, stamina state, and Theme fit. Downstream, Demo Recording applies the Vocalist’s Mood expression; Track Finalization sets content Genre & overall quality. Strong Theme/Mood alignment improves Audience and Critics response and influences Charts velocity.

## **Data & Telemetry**

* sheet\_music\_id, songwriter\_id, studio\_id  
* theme, created\_at, finished\_at  
* stamina\_spent, real\_time\_ms, ticks\_spent  
* quality\_score (0–100), alignment\_score (0–100)

## **Notes**

Legacy terms (Guider, Hand of Cards, Drives) and Record Label Simulator branding are retired. Use current terminology and systems only.

— End —
