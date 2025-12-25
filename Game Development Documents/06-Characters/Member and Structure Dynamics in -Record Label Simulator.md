`### Member and Structure Dynamics in "Record Label Simulator"`

`#### Initial Representation`

`1. **Capsule Shape**:`  
   `- **Initial Form**: Members are represented as simple UI avatars or list entries. This keeps the visualization lightweight and readable in the web app.`  
   `- **Movement (simulated)**: Movement is represented by timers and status changes, not pathfinding meshes.`

`#### Transition to Occupations`

`2. **Despawn and Transformation**:`  
   `- **Trigger for Transformation**: When a member acquires an occupation other than consumer (e.g., becoming a creator, critic, or other personnel), they undergo a transformation process.`  
   `- **Remove from World List**: The member is removed from the public world list.`  
   `- **ID in UI**: The member is then represented as an ID in the user interface (UI), reflecting their new role and responsibilities.`

`#### Structure Leasing and ID Management`

`3. **Leasing System**:`  
   `- **Leased Structures**: Structures such as studios, institutions, and offices are leased by the Record Labels. Each structure has a lease period.`  
   `- **Lease Expiry**: When the lease of a structure expires, and if it is not renewed, the structure despawns.`

`4. **ID Reassignment**:`  
   `- **Unassigned IDs Tab**: When a structure's lease expires, the IDs of members associated with that structure are moved to an unassigned IDs tab.`  
   `- **New Structures**: As new structures are built based on city demand, these unassigned IDs are reassigned to the new structures.`  
   `- **Example**: If a recording studio's lease is not renewed, the studio despawns, and all associated IDs (e.g., songwriters, recorders) are moved to the unassigned IDs tab. When a new studio is built, these IDs are reassigned to it.`

`### Example Scenario`

`1. **Member Representation**:`  
   `- A member starts as a UI avatar or list entry, with activity simulated by status and time windows.`

`2. **Occupation Transition**:`  
   `- The member levels up skills and transitions to a new role (e.g., songwriter), despawning from the terrain and becoming an ID in the UI.`

`3. **Leasing and Structure Dynamics**:`  
   `- The Record Label leases a recording studio, where the member (now an ID) works.`  
   `- If the lease expires and the studio despawns, the ID moves to the unassigned IDs tab.`

`4. **ID Reassignment**:`  
   `- As demand in the city leads to the construction of a new studio, the ID from the unassigned IDs tab is reassigned to this new structure.`

`### Summary`

`In "Record Label Simulator," members start as public UI avatars and transition to IDs in the UI when they acquire an occupation other than consumer. Structures are leased and have expiration periods. When a lease expires and a structure is removed from active listings, associated IDs move to an unassigned IDs tab and are reassigned to new structures built based on demand. This dynamic ensures continuous and efficient management of members and structures within the game.`  
