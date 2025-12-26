# World Surface Representation (Web)

## Purpose
The web MVP does not render a 3D terrain. The world surface is represented as abstract regions and lists (cities, areas, facilities) for simulation and UI display.

## Representation
- World map is a data model: `{ region_id, name, type, population, modifiers }`.
- Any visual maps are optional UI widgets (2D panels, lists, mini-maps).

## Interaction
- Player actions target regions via selectors and ID slots.
- Movement and travel are simulated as timers and availability windows, not pathfinding meshes.
