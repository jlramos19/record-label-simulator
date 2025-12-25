`We’re running Drive-wide cleanup scripts (Google Apps Script) across Google Docs + Google Sheets to standardize Record Label Simulator terminology, with repeatable runs and predictable logs.`

---

## **`Approach that’s been working (rules)`**

### **`1) One run = one target change`**

* **`One phrase / acronym / rename per function`**`, per execution.`

* `Don’t batch multiple unrelated replacements in one run.`

### **`2) Keep matching rules explicit`**

* `Default: case-insensitive find unless you explicitly say case-sensitive.`

* `Replacement output can be fixed-case (e.g., always Record Label, always FREEDOM).`

### **`3) Logs: clean, reproducible`**

* `Progress logs optional (every 50).`

* `Per-file logs only when a file is touched:`

  * **`Renamed title`**

  * **`Content changed without rename`**

* `End with a single totals summary.`

### **`4) Always iterate all files`**

* `Even if matches happen early, we still must scan the full corpus to be sure.`

---

## **`Logging format we’re using (the “good” one)`**

### **`Per-file logs (only when touched)`**

* `Title rename:`

  * `RENAME: "[Old]" -> "[New]" [DOC]`

  * `RENAME: "[Old]" -> "[New]" [SHEET]`

* `Content changed, but title unchanged:`

  * `FILE_CHANGED_NOT_RENAMED: "[Title]" [DOC]`

  * `FILE_CHANGED_NOT_RENAMED: "[Title]" [SHEET]`

### **`Progress logs (optional)`**

* `Processed 50 files... (Docs=45, Sheets=5)`

### **`Final totals log`**

`Include both total + split:`

* `ProcessedTotal`

* `ProcessedDocs`

* `ProcessedSheets`

* `ContentFilesChangedTotal / Docs / Sheets`

* `TitleFilesChangedTotal / Docs / Sheets`

* `TotalContentReplacementsTotal / Docs / Sheets`

* `TotalTitleReplacementsTotal / Docs / Sheets`

* `ErrorsTotal`

* `Any run label: Run=...`

* `If relevant: DRY_RUN=true/false`

---

## **`Concrete examples from successful runs`**

### **`Example A: Hardcoded ID code rewrite (MN → RL in allowed ranges)`**

* `Output you liked:`

  * `FILE_CHANGED_NOT_RENAMED: "History of Annglora" [DOC]`

  * `DONE. Run=Hardcoded codes: *MN* -> *RL* ...`  
     `(Your log shows: content changed in Docs + Sheets, no title changes.)`

### **`Example B: Case-sensitive word swap (LOVE → LOYALTY)`**

* `Run was content-only, case-sensitive find:`

  * `DONE. Run=LOVE (all caps) -> LOYALTY ...`

### **`Example C: Title underscores → spaces`**

* `Title-only rename run:`

  * `RENAME: "Gaia_Countries_and_Currencies" -> "Gaia Countries and Currencies" [DOC]`

  * `DONE. Run=TitleUnderscoresToSpaces ...`

---

## **`The “deprecated scanner” script logging tweak (what you asked)`**

`We’ll keep the same scan behavior, but format match logs like:`

* `MATCH_TITLE_ONLY: "Some file" [DOC]`

* `MATCH_CONTENT_ONLY: "Some file" [SHEET]`

* `MATCH_TITLE+CONTENT: "Some file" [DOC]`

`That way, every line tells you the file type in brackets.`

