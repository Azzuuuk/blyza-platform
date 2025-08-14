### Deploy

## Firebase
1) Configure `.env` values per `DOCS/ENV_VARS.md`.
2) Deploy security rules:
   - `firebase deploy --only database:rules`
   - `firebase deploy --only firestore:rules`
3) Deploy Cloud Functions (if enabled): `firebase deploy --only functions`

## Vercel (Client)
- Set environment variables (VITE_FIREBASE_*) in Vercel Project Settings.
- Build command: `npm run client:build` from repo root or setup a Vercel project in `client/`.

## Optional Railway (Webhook)
- If not using Cloud Functions for n8n inbound/outbound, deploy `server/` to Railway.
- Set `CLIENT_URL`, `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`, `N8N_CALLBACK_SECRET` env vars.


