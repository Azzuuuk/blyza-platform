### Environment Variables

Create `.env` files as needed. Do not commit real secrets.

## Client (`client/.env`)
- `VITE_FIREBASE_API_KEY=`
- `VITE_FIREBASE_AUTH_DOMAIN=`
- `VITE_FIREBASE_DATABASE_URL=`
- `VITE_FIREBASE_PROJECT_ID=`
- `VITE_FIREBASE_STORAGE_BUCKET=`
- `VITE_FIREBASE_MESSAGING_SENDER_ID=`
- `VITE_FIREBASE_APP_ID=`
Note: Vite dev server default port is 5173 unless configured otherwise.

## Server (`.env` at repo root for `server/`)
- `PORT=3001`
- `CLIENT_URL=http://localhost:3000`
- `N8N_WEBHOOK_URL=https://your-n8n.example/webhook/ingest`
- `N8N_WEBHOOK_SECRET=replace_me`
- `N8N_CALLBACK_SECRET=replace_me`
- `ENABLE_LEGACY_REWARDS=false`
- `AUTO_MIGRATE=false`

## Functions (`functions/.env` or Firebase config)
- `N8N_WEBHOOK_URL=`
- `N8N_WEBHOOK_SECRET=`
- `N8N_CALLBACK_SECRET=`


