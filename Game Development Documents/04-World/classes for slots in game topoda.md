Creating a slot-based mechanic in the web app involves these steps:

1. Card Movement: Implement drag-and-drop or tap-to-assign for moving cards between slots.
2. Item Creation: When a card enters the Hand slot, create an item record in state.
3. Inventory Management: Store items in arrays/maps and render inventory lists.
4. Retail Assortment: Move item records into the Retail Assortment slot via UI actions.
5. Calendar: Use the scheduling system to place items on release dates.

Each step should be modular so UI actions map directly to state updates and event logs.
