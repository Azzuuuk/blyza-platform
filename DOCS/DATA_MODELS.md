### Data Models

## Firebase Realtime Database (RTDB)

- `/lobbies/{sessionId}`
  - `game`: string, e.g., "nightfall"
  - `managerUid`: string
  - `code`: string (invite code)
  - `status`: "lobby" | "in_progress" | "finished"
  - `createdAt`: number (serverTimestamp)
  - `startedAt`: number | null
  - `endedAt`: number | null
  - `players/{uid}`:
    - `displayName`: string
    - `connected`: boolean
    - `role`: string | null
    - `ready`: boolean
    - `joinedAt`: number
    - `lastSeen`: number

- `/games/nightfall/{sessionId}`
  - `game`:
    - `phase`: "LOBBY" | "IN_PROGRESS" | "COMPLETE"
    - `turn`: number
    - `timers`: { [key: string]: { endsAt: number } }
    - `progress`: { percent: number, roomsCompleted: number }
  - `rooms/{roomId}`:
    - `leadUid`: string
    - `state`: object (room-local state)
  - `puzzles/{puzzleId}`: object
  - `eventsLog/{eventId}`: { ts: number, type: string, by: string, data: object }
  - `summary`: object (on completion)
  - `reportSummary`: { status: string, url?: string, insights?: object }

- `/analytics/{sessionId}`
  - `clicks`: number
  - `hints`: number
  - `solveTimes`: { [puzzleId: string]: number }
  - `handoffs`: number
  - `chatCount`: number

- `/presence/{uid}`
  - `isOnline`: boolean
  - `lastSeen`: number

## Firestore

- `users/{uid}`
  - `uid`, `email`, `name`, `role` ("manager" | "employee"), `points`: number, `createdAt`, `lastLogin`

- `managerFeedback/{sessionId}`
  - `managerUid`, `sessionId`, `sections`: { communication, leadership, inclusion, riskTaking, notesPerPlayer, freeText }, `createdAt`

- `reports/{sessionId}`
  - `sessionId`, `reportUrl`, `summaryJson`, `emailSent`: boolean, `createdAt`

- `redemptions/{uid}/{redemptionId}`
  - `itemId`, `pointsSpent`, `createdAt`, `note`


