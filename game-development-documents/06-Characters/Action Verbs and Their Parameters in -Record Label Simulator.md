# Action Verbs and Their Parameters in Record Label Simulator

Each occupation has action verbs that drive the simulation and gameplay. Status indicates availability.

Status key:
- Live: Available as a player action in the current build.
- Simulated: Modeled in systems, but not directly controllable yet.
- Placeholder: Planned, not yet implemented in gameplay.

## Member (Role)

### Personnel (Occupation)
- Factory Personnel: manufacture (Produce content). Status: Placeholder.
- Shopping Center Personnel: distribute (Sell content). Status: Placeholder.
- Broadcast Corporation Personnel: present (Show content to audience). Status: Placeholder.

### Consumer (Occupation)
- buy (Purchase content from Shopping Centers). Status: Simulated.
- stream (Tune into shows, stations, or playlists when at home). Status: Simulated.
- attend (Participate in live performances or events by going to Venue Structures). Status: Simulated.
- rate (Provide ratings for consumed content at any time). Status: Simulated.

### Critic (Occupation)
- rate (Evaluate content quality based on Alignment and preferences, skewed by in-game Country). Status: Simulated.

## Creator (Role)

### Songwriter (Occupation)
- write (Create Sheet Music with selected Themes). Status: Live.
- Parameters: 1 in-game hour, cost 500, stamina 25.

### Performer (Occupation)
- perform (Create Demo Recordings that define Moods). Status: Live.
- Parameters: 2 in-game hours, cost 800, stamina 50.

### Producer (Occupation)
- produce (Create Masters by combining Theme + Mood into Genre and preliminary Quality). Status: Live.
- Parameters: 3 in-game hours, cost 1200, stamina 150.

Quality notes: Creator skill and preference matches raise quality potential. Final quality resolves at the Master stage.

## Act (Role)

### Promoter (Occupation)
- promote (Boost visibility and engagement of released content). Status: Live.

## CEO (Role)

### Music Executive (Occupation)
- negotiate (Contracts with Creators to sign them). Status: Simulated.
- sign (Creators to the Record Label). Status: Live.
- form (Acts from Creators within the Record Label). Status: Live.
- place (Creators in Structures' slots). Status: Live.
- terminate (A contract with a Creator). Status: Placeholder.
- rent (Structures to create content). Status: Placeholder.
- conduct (Era with Acts). Status: Live.
- plan (Tour). Status: Placeholder.

Placeholder actions are shown in-game as visibility markers so the roadmap is clear.
