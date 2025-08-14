### Assumptions & Defaults

- Existing Firebase project credentials in `client/src/lib/firebase.js` are correct and should be used. No new keys created.
- RTDB is enabled for the project with the provided `VITE_FIREBASE_DATABASE_URL`.
- Realtime top-level paths follow:
  - `/lobbies/{sessionId}` and `/games/nightfall/{sessionId}` and `/analytics/{sessionId}`.
- Manager is the Firebase Auth user who creates the lobby; employees join with any authenticated account.
- n8n URLs and secrets are provided via env; Cloud Functions are preferred over Railway for webhook flows.
- Rewards store is client-driven for demo; production transactions should be implemented as Firebase Functions for double-spend prevention.
- Dev ports: client on 5173 (Vite default) or 3000; server remains on 3001 if used; avoid automatic port bumps.


