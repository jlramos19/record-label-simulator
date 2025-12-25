# CSV Mirrors

This folder holds CSV exports that mirror source data for tuning and balancing.

Usage
- Place exports in subfolders or directly in `csv/` with stable names.
- Load in app/runtime via `loadCSV("path/to/file.csv")` (works when served over HTTP).

Example
- `csv/Record Label Simulator - Annglora Record Labels/AMN2 - Annglora Music Network #2.csv`
  can be loaded as `loadCSV("Record Label Simulator - Annglora Record Labels/AMN2 - Annglora Music Network #2.csv")`.
