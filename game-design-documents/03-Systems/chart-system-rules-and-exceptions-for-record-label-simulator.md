# **Chart System Rules and Exceptions for Record Label Simulator**

Version: v0.1

Date: December 12, 2025

Scope: Weekly Top 10 chart output, naming, eligibility, anonymity, and common misconceptions.

## **1\. Glossary**

### **Act**

The stage name shown publicly (Solo Act or Group Act). Acts are the “face that faces the music.”

### **Solo Act**

An Act representing a single vocalist as the public-facing identity.

### **Group Act**

An Act representing two or more vocalists as the public-facing identity.

### **Creator(s)**

* The credits behind a release.

* Real names only (legal/real identity), not IDs.

* Not stage names unless the stage name is also the real name.

### **Track name**

The quest song name, exactly as written in the quest tracklist (verbatim).

### **Project**

* The release container: album, EP, or single.

* In charts, this may appear under a column titled “Album”, but in-game it is always called Project.

### **Record label**

* The releasing label for the track/project.

* Must always be one of the 8 record labels.

## **2\. Chart Timing and Eligibility**

### **Chart issue date**

Each chart has a weekly issue date (the chart’s anchor date).

### **Eligibility rule**

* A track/project can appear only if it has been released by the chart issue date.

* Nothing can appear early relative to the issue date.

## **3\. Naming Rules**

### **Project naming for standalone singles**

If a release is a single and there is no project name:

* Project \= “{Track name} \- Single”

### **Track name formatting**

* Use the quest track name verbatim (punctuation, quotes, accents, casing).

## **4\. Audience Chunk and Rounding**

### **Audience chunk rule**

* Audience/population is modeled in chunks of 1,000.

* Any chart-facing count derived from audience (example: Sales (physical)) must be rounded up to the nearest 1,000.

* This rounding is always applied unless you explicitly define an exception later.

## **5\. Unsigned Anonymous Creator Feature**

### **What it is reserved for**

* Masked credits for contributors who exist in the simulation/save data but are not publicly disclosed yet.

* The creator’s real identity exists internally; the chart output may hide it until signing.

### **Where anonymity is allowed**

* Allowed only inside Creator(s) display (credits masking) while the creator is unsigned.

### **Where anonymity is not allowed**

* Not allowed as a release source.

* Tracks and projects cannot be released from anonymous sources.

### **Record label constraint**

* Every track/project must list a real Record label from the 8-label set.

* Anonymous must never appear in the Record label column.

### **Disclosure trigger**

* When the creator signs to a label, the chart stops masking and shows the creator’s real name(s) in Creator(s).

## **6\. Chart Table Schema**

Standard columns for weekly Top 10 output:

| Column | Meaning |
| :---: | :---: |
| Position | 1-10 ranking |
| Track name | Quest song name (verbatim) |
| Act | Stage name (Solo Act / Group Act) |
| Project | Album/EP/single container |
| Content genre | Your content genre descriptor |
| Record label | One of the 8 labels (always) |
| Creator(s) | Real names (credits); may be masked if anonymous and unsigned |
| Sales (physical) | Integer, rounded up to the nearest 1,000 |

## **7\. Misconceptions and Clarifications**

### **Misconception: Project names are Acts**

* Incorrect: Project is the release container; Act is the stage name.

* Correction: Acts are stage names (Solo Act / Group Act). Projects are albums/EPs/singles.

### **Misconception: Creator(s) can be IDs**

* Incorrect: Chart output uses real names for Creator(s).

* Clarification: IDs may exist internally, but they are not printed on charts.

### **Misconception: “Anonymous” can appear as Record label**

* Incorrect: Releases always come from one of the 8 labels.

* Correction: Anonymity is credits-only (Creator(s)) while unsigned.

### **Misconception: Rounding is optional**

* Incorrect: Audience-chunk rounding is always applied (round up to 1,000).

## **8\. Exceptions**

### **Allowed exception: masked credits**

* Creator(s) may display as masked only while the creator is anonymous and unsigned.

### **Disallowed exception: anonymous release source**

* No track/project may list an anonymous releasing entity in Record label.

End of document.

