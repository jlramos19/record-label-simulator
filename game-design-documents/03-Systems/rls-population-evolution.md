# **RLS Population Evolution System**

## **1\. Overview**

This document defines the five-stage population evolution model used in Record Label Simulator. It governs how the global population is divided between the three countries - Annglora, Bytenza, and Crowlya - and how this distribution changes across in-game eras.

## **2\. Country Definitions**

- Annglora - Large population  
- Bytenza - Medium population  
- Crowlya - Small population

## **3\. Update Frequency**

Population updates yearly (once per in-game year). At each update, global population is recalculated, and each country receives a percentage based on the evolution stage active in that period.

## **4\. Evolution Stages**

### **Stage 1 - Rebuild Era (2025-2100)**

Annglora: 100%  
Bytenza: 0%  
Crowlya: 0%

### **Stage 2 - Two-Country Era (2100-2200)**

Annglora: 50%  
Bytenza: 50%  
Crowlya: 0%

### **Stage 3 - Three-Country Era (2200-2400)**

Annglora: 50%  
Bytenza: 25%  
Crowlya: 25%

### **Stage 4 - Campaign Era (2400-4000)**

Campaign Era splits are variable within loose ranges (approx).  
Target splits: Annglora 52.5%, Bytenza 33.3%, Crowlya 14.2%.  
Default variance policy: +/-5 percentage points, then normalize to sum = 100%.  
The realized split is generated per Campaign Era and stays stable within that era.

### **Stage 5 - Post-Campaign Stabilization (4000-9999)**

Annglora: 50%  
Bytenza: 30%  
Crowlya: 20%

## **5\. Usage in Simulation**

At each yearly update cycle:  
1\. Global population is computed using the long-term growth curve.  
2\. The current evolution stage is identified.  
3\. The stage's distribution split is applied to divide the global population into each country.  
4\. Population counts are rounded up to the nearest 1,000.  
5\. Additional subdivisions (e.g., capital vs elsewhere) occur afterward.

## **6\. Age Pyramid Distribution**

- Population snapshots track 4-year age groups from 0-119 (0-3, 4-7, ...).
- Each nation uses a distinct age-pyramid profile to keep distributions realistic and youth-weighted.
- Gaia (global) age splits aggregate the national distributions, weighted by each nation's population share.
- Audience chunks seed their ages from the current population distribution for their nation; ages 0-20 remain eligible.
- Creator ID ages sample from 20+ only, with additional bias toward younger cohorts.

## **7\. Document Status**

This file defines the authoritative population evolution system and supersedes all earlier drafts.

