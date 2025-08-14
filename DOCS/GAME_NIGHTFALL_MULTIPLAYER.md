### Nightfall Multiplayer (RTDB)

RTDB schema
- /lobbies/{sessionId}
  - managerUid, code, status, createdAt, startedAt, endedAt
  - players/{uid}: { displayName, role, connected, lastSeen }
- /games/nightfall/{sessionId}
  - roles: { uid: roleName }
  - rooms/{roomId}: { solved, solvedAt, solvedBy, leadUid, inputs/{key}: { data, by, timestamp } }
  - chat/{messageId}: { senderUid, text, timestamp }
  - hints/{hintId}: { usedByUid, hintKey, timestamp }
  - progress: { percent?, roomsCompleted? }
  - eventsLog/{id}: { type, uid, payload, timestamp }

Lifecycle
- LOBBY: join/assign roles under /lobbies
- START: manager calls start; initialize /games/nightfall/{sessionId} with rooms and leads
- PLAY: players call setTeamInput/solveRoom/useHint/sendChat; all subscribe to /games/nightfall/{sessionId}
- COMPLETE: when all rooms solved, mark finished and freeze writes

Adding features
- Extend shared state under /games/nightfall/{sessionId}/{feature}
- Add a write helper in `client/src/services/nightfallRTDB.js`
- Update UI to read from `subscribeGame(sessionId)` payload


