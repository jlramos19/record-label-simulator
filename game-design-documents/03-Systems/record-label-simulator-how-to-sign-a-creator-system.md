# **`Record Label Simulator - How To Sign a Creator (System)`**

## **`Purpose`**

`This document defines the canonical system for signing Creators in Record Label Simulator. It supersedes legacy A&R interview mechanics. The process begins in the Creators Community Chamber (CCC), where Record Labels browse Creator IDs and initiate signing attempts.`

## **`Infobox - System`**

| `Property` | `Value` |
| :---- | :---- |
| `Name` | `How To Sign a Creator` |
| `Type` | `System` |
| `Owner` | `Record Labels (player-driven)` |
| `Entry Point` | `Creators Community Chamber (CCC)` |
| `Linked Systems` | `CCC · Alignment · Themes · Moods · eyeriSocial · Calendar` |

## **`Player Flow`**

1. `Select the Creators Community Chamber.`  
2. `Browse available Creator IDs presented by CCC.`  
3. `Each ID shows: occupation(s), Theme and Mood leans, Alignment tendency, and birth name (can be changed to Stage Name).`  
4. `Negotiate contract: define budget per era and expected projects.`  
5. `Three negotiation attempts are allowed:`  
6.    `- Accept → Creator joins the Label.`  
7.    `- Reconsider → starts in-game 2-week timer; negotiation can be retried after timer.`  
8.    `- Decline → Creator cannot be negotiated with for 4 in-game years and may be signed by another Label.`  
9. `On reaching a fourth attempt, 'Reconsider' converts to 'Give Up'.`

## **`Example`**

`Player offers a contract of 5 projects (albums) with a $1,000,000 budget per era.`  
`- Accept → Creator signed.`  
`- Reconsider → 2-week timer starts; retry allowed afterward.`  
`- Decline → Locked for 4 in-game years; risk of rival Label signing.`

## **`Integration`**

* `All outcomes are posted on eyeriSocial, alerting rival Labels.`  
* `Signing results affect Label Alignment and feed into Audience and Charts systems.`  
* `Calendar integration: timers and project commitments tracked in roadmap UI.`

## **`Telemetry`**

* `creator_id, ccc_id`  
* `attempt_number`  
* `outcome (accept/reconsider/decline/give_up)`  
* `timer_start, timer_end`  
* `eyeriSocial_post_id`

## **`Notes`**

`This system is the canonical way to sign Creators. Legacy mechanics (Record Label Simulator interview/A&R) are retired.`

`— End —`