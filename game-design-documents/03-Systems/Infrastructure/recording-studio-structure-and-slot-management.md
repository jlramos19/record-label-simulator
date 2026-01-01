# Recording Studio Structure and Slot Management

This document defines how recording studios gate the sheet -> demo -> master pipeline.

## Roles and slot types
- Songwriter slots: assign songwriter IDs to create sheet music.
- Vocalist slots: assign vocalist IDs to create demo recordings.
- Producer slot: assign the producer (player or producer ID) to finalize masters.
- Input slots: attach sheet or demo items required for the next stage.

## Capacity and tiers
- Slot counts are defined by studio tier and can scale as the label expands.
- The UI surfaces stage columns (Sheet/Demo/Master) with the available slots.
- Larger tiers can add slots or allow a single queued item per slot.

## Work order rules
- A work order starts only when a slot is open, the required input is present, and the assigned ID is idle.
- Slots remain occupied for the full work duration and release on completion.
- Canceling a work order returns partial progress and frees the slot.

## Outputs and downstream slots
- Sheet music feeds demo creation; demos feed master creation.
- Finished tracks move into project tracklist slots for release planning.

## Observability
- Blocked slots show a reason (missing input, busy ID, or locked stage).
- All slot actions are logged for replay and debugging.
