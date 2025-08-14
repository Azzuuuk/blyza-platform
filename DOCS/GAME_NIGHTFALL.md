### Operation Nightfall - Game Logic

## State Machine
- LOBBY → IN_PROGRESS → COMPLETE

## Role Assignment
- 4 players: lead, analyst, operative, specialist
- 3 players: lead, analyst, operative (specialist collapsed into operative)
- 2 players: lead, analyst (operative capabilities shared)

Roles auto-assigned on start in join order. Manager is not a player and acts as spectator.

## Rooms and Leads
- Each room has a lead (mapped from roles; lead defaults to the first non-manager player). Room-specific interactions are gated by role abilities. Persist under `games/nightfall/{sessionId}/rooms/{id}`

## Reconnect
- Player refresh restores lobby role and room state from RTDB.

## Manager Spectator
- Subscribes to `lobbies/{sessionId}/players/*` and `games/nightfall/{sessionId}`.

## Determinism
- All state changes happen through RTDB writes; avoid non-deterministic timers on clients.


