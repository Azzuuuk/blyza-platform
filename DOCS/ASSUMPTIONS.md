### Assumptions

- RTDB write latency is acceptable (<200ms) for game interactions.
- Manager assigns roles before starting; auto-assign used only as fallback.
- Room definitions and abilities from `engine/constants.js` remain authoritative.
- Chat stored as child nodes under /games/nightfall/{sessionId}/chat.
- n8n webhook URLs/secrets will be set and Functions deployed as per DOCS/DEPLOY.md.
- Nightfall v2 code is introduced under `client/src/games/nightfall_v2/` and legacy Nightfall remains until full cutover.


