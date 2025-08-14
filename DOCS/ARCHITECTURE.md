### Blyza Architecture (Finalized)

This document summarizes the finalized architecture per requirements.

## Overview
- **Frontend (Vite React)** in `client/` using Firebase Authentication + Firebase Realtime Database (RTDB) for multiplayer/state sync. Firestore is used for durable user/profile/report storage. Role-based routing is implemented in `AuthGuard` and `PostGameRouter`.
- **Backend (Express)** in `server/` remains for legacy APIs and optional webhook reception. Realtime gameplay no longer depends on Socket.IO.
- **n8n Integration** via webhooks with retries + idempotency. Preferred path is Firebase Cloud Functions (scaffold to be added in `functions/`) to send quantitative/qualitative data and receive AI insights callback.

## Core Data Flows
- Authentication: Firebase Auth; user profile/role in Firestore `users/{uid}`.
- Multiplayer: RTDB under `/lobbies/{sessionId}` and `/games/nightfall/{sessionId}`.
- Analytics: RTDB aggregates under `/analytics/{sessionId}` and Firestore summaries.
- Reports: n8n generates AI report; callback stored in Firestore `reports/{sessionId}` and surfaced to RTDB at `/games/nightfall/{sessionId}/reportSummary`.

## Realtime Model
- Finite State Machine for a session: `LOBBY → IN_PROGRESS → COMPLETE` stored at `lobbies/{sessionId}.status` and `games/nightfall/{sessionId}.game.phase`.
- Presence and reconnect: Players tracked under `lobbies/{sessionId}/players/{uid}` with `connected`, `lastSeen`, `onDisconnect` updates.

## Security
- RTDB rules (see `firebase/database.rules.json`) enforce least privilege:
  - Only session members can read/write their lobby/game session.
  - Only the manager (host) can transition status to `in_progress`/`finished` and initialize game state.
  - Field validation on key shapes/enum values.
- Firestore rules (see `firestore.rules`) restrict user profiles to self, reports readable by the manager, and feedback documents by managers.

## Removal of Socket.IO
- All Socket.IO-based real-time has been deprecated. Client uses RTDB subscriptions. Server `nightfallRealtime.js` remains as a non-mounted legacy file; not used at runtime.

## Manager Spectator View
- Manager subscribes to both `lobbies/{sessionId}/players/*` and `games/nightfall/{sessionId}` for an observer dashboard.

## Webhooks and Cloud Functions
- `functions/` provides:
  - `onGameComplete` HTTPS function to collect quantitative metrics and POST to n8n with `{sessionId, quantitative}`; includes idempotency and retries.
  - `onManagerFormSubmit` HTTPS function to store qualitative data in Firestore and POST to n8n.
  - `n8nCallback` HTTPS function to receive `{sessionId, reportUrl, summaryJson}` with signature verification; persists to Firestore and mirrors summary to RTDB.

## Dev/Prod
- Prefer Firebase Functions for webhooks. Railway backend can remain for existing APIs but is not required for real-time.


