# Web Inventory Item Registry

## Overview
This document replaces engine-specific prefab inventory concepts with a web app registry. Items are modeled as data records, and the UI renders counts and availability without instantiating scene objects.

## Data Model
- Item template: `{ id, name, type, rarity, tags, effects }`
- Inventory entry: `{ item_id, count, acquired_at, source }`

## Registry Responsibilities
- Register item templates on boot (static JSON or CSV mirror).
- Add/remove counts without duplicating item data.
- Surface counts in UI (badges, list rows, tooltips).

## UI Binding
- Inventory list renders rows by `item_id` with a count pill.
- Incrementing an item updates the row; new items append to the list.

## Storage
- Persist inventory in localStorage or IndexedDB.
- Export/import as JSON for debugging and saves.
