# Blyza Platform - AI-Powered Team Building

Welcome to Blyza, the first AI-powered team-building engine for corporate teams.

## 🚀 Features

### Core Capabilities
- **15+ Game Templates**: Curated team-building games targeting specific challenges
- **AI Customization**: Managers can customize game tone, theme, and difficulty
- **Dual Play Modes**: Local (single device) and Online (multiplayer with WebSockets)
- **Real-time Analytics**: Track engagement, participation, and team dynamics
- **AI Reports**: Generate comprehensive 3-page PDF reports with insights
- **Rewards Store**: Region-based rewards system with points redemption
- **Leaderboards**: Session and global rankings

### Game Categories
- **Trust Building**: "Truth or Dare Professional", "Trust Fall Simulator"
- **Communication**: "Real or AI", "Story Builder", "Emoji Translator"
- **Problem Solving**: "Escape Room Digital", "Budget Challenge", "Innovation Lab"
- **Creativity**: "Pitch Perfect", "Design Thinking Workshop", "Brainstorm Battle"
- **Leadership**: "Crisis Management", "Delegation Station", "Vision Quest"

## 🏗️ Architecture

```
blyza-platform/
├── client/                 # React/Next.js Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Game catalog, lobby, gameplay
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API calls, Firebase, Socket.IO
│   │   ├── store/         # State management (Redux/Zustand)
│   │   └── utils/         # Helper functions
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js/Express Backend
│   ├── index.js          # Main server file
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   ├── models/           # Data models
│   ├── middleware/       # Auth, validation, etc.
│   └── utils/            # Server utilities
├── shared/               # Shared types and constants
├── docs/                # Documentation
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **React 18 + Vite** (fast dev + lean prod bundle)
- **TypeScript** (strict mode planned; currently partial)
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Socket.IO Client** for real-time features
- **React Query** for server state
- **Zustand** for in-session game state & realtime diff/snapshot layer

### Backend
- **Node.js (Express)** REST + WebSocket gateway
- **Socket.IO** realtime session + lock coordination
- **OpenAI API** (game customization & reporting)
- **PDF-lib** report generation
- **Nodemailer** (email hooks - optional)
- (Pluggable) Persistence: currently in-memory + mock Firebase shim; Postgres adapter planned

### Data & Services (Current State)
- **In-memory store** (sessions, analytics metrics)
- **Mock Firebase layer** (placeholder – prints to console)
- **OpenAI** (optional; skip if key absent)
- Planned: Postgres (Railway) + migrator, Redis (ephemeral locks), n8n for analytics ETL

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- (Optional) OpenAI API key for AI customization/report text
- (Optional) SMTP creds for outbound email (reports)

### Installation

1. **Clone and install dependencies:**
```bash
cd blyza-platform
npm run setup
```

2. **Environment setup:**
```bash
cp .env.example .env
# Fill in only what you need (OPENAI_API_KEY optional). Leave Firebase/Stripe empty for now.
```

3. **Start development servers:**
```bash
npm run dev
```

The platform will be available at:
- Frontend: http://localhost:3000
- Backend API + Socket.IO: http://localhost:3001

## 🎮 Game Flow

### 1. Game Selection
- Browse game catalog with filters (category, duration, team size)
- Preview game rules and objectives
- Choose play mode (Local or Online)

### 2. AI Customization
- Select tone (Professional, Fun, Edgy, Casual)
- Choose theme (Office, Adventure, Sci-fi, Custom)
- Set difficulty level
- Add custom scenarios via AI prompt

### 3. Lobby System (Online Mode)
- Manager creates lobby with unique code
- Players join via link or room code
- Real-time lobby updates
- Team assignments and role selection

### 4. Gameplay
- Real-time game engine with Socket.IO
- Quantitative tracking (response times, participation, interactions)
- Live scoring and progress indicators
- Interactive elements (chat, reactions, voting)

### 5. Post-Game Analysis
- Manager evaluation form (team dynamics, observations)
- AI processes quantitative + qualitative data
- Generate comprehensive PDF report
- Email delivery with branding

### 6. Rewards & Recognition
- Points allocation based on performance
- Regional rewards store
- Achievement unlocks
- Leaderboard updates

## 📊 Analytics & Reporting

### Tracked Metrics
- **Engagement**: Participation rate, response times, interaction frequency
- **Communication**: Chat activity, reaction usage, collaboration patterns
- **Performance**: Accuracy, decision-making speed, problem-solving approach
- **Team Dynamics**: Leadership emergence, conflict resolution, support patterns

### AI Report Structure
1. **Executive Summary** (0.5 pages)
   - Overall team health score
   - Key findings and recommendations
   - Performance vs. benchmarks

2. **Detailed Analysis** (1.5 pages)
   - Individual player insights
   - Team interaction patterns
   - Strengths and improvement areas
   - Communication effectiveness

3. **Action Plan** (1 page)
   - Specific recommendations
   - Follow-up activities
   - Suggested next games
   - Timeline for improvements

## 🔐 Security & Performance

- JWT-based authentication with Firebase
- Rate limiting on all API endpoints
- Input validation and sanitization
- Real-time game state encryption
- Horizontal scaling with load balancers
- CDN integration for global performance

### API Keys & Auth (Current Implementation)
The platform supports lightweight gating:
- NIGHTFALL_API_KEY: Protects /api/nightfall write endpoints (session create/join/events). If unset, routes are open (dev mode).
- DASHBOARD_API_KEY: Protects /api/dashboard endpoints.
- JWT (Authorization: Bearer <token>): If provided (and JWT_SECRET set), decoded and attached to req.user; otherwise a demo user is injected.

Example (create session):
curl -X POST https://<host>/api/nightfall/sessions \
   -H "Content-Type: application/json" \
   -H "X-API-Key: $NIGHTFALL_API_KEY" \
   -d '{"title":"Team Run","hostId":"mgr_1","maxPlayers":6}'

Generic player event:
curl -X POST https://<host>/api/nightfall/sessions/<id>/events \
   -H "Content-Type: application/json" \
   -H "X-API-Key: $NIGHTFALL_API_KEY" \
   -d '{"type":"room_enter","payload":{"roomId":2}}'

Cleanup stale runtime sessions (>6h idle):
curl -X POST https://<host>/api/nightfall/maintenance/cleanup \
   -H "X-API-Key: $NIGHTFALL_API_KEY" -d '{}' -H 'Content-Type: application/json'

Dashboard metrics submission:
curl -X POST https://<host>/api/dashboard/submit-metrics \
   -H "X-API-Key: $DASHBOARD_API_KEY" -H 'Content-Type: application/json' \
   -d '{"sessionId":"<id>","metrics":{"participationRate":0.9,"playerMetrics":[]}}'

## 🌍 Deployment

### Production Environment (Recommended Minimal)
- Backend API + Realtime: Railway (Node 18)
- Frontend: Vercel (build with `npm run build` inside `client`)
- Database: Postgres on Railway (planned) or stay in-memory for demos
- Object/File: (Future) S3 / R2
- Observability: Railway logs + simple custom metrics endpoints

### Environment Variables
```bash
# Core
NODE_ENV=production
PORT=3001
CLIENT_URL=https://your-frontend-domain (or local dev URL)

# (Optional) OpenAI
OPENAI_API_KEY=sk-...

# (Optional) Email
SMTP_HOST=
SMTP_USER=
SMTP_PASS=

# (Future) Database
DATABASE_URL=postgresql://...
```

### Deploying Backend to Railway
1. Push repo to GitHub.
2. Create new Railway service from the repo root.
3. Railway detects Node. It will run `npm install` then `npm run build` (we override build to a no-op so server deploy is fast).
4. Start command uses `npm start` (serves Express + Socket.IO).
5. Set env vars: `PORT=3001`, `CLIENT_URL=https://<your-frontend-domain>` plus any optional keys.
6. Redeploy – health check at `/health` should return JSON.

If you want to pre-build the frontend inside the same container (not recommended for scale):
1. Move `client` devDependencies (vite, tailwind, etc.) into `dependencies` OR add `.npmrc` with `include=dev` (pnpm) / use `NPM_CONFIG_INCLUDE=dev`.
2. Change root `build` script back to `cd client && npm run build`.
3. Serve `client/dist` statically via Express or a CDN.

### Deploying Frontend (Vercel)
1. Import GitHub repo in Vercel, set root directory to `client`.
2. Build command: `npm run build` (Vercel auto installs dev deps).
3. Output directory: `dist`.
4. Set `VITE_API_BASE=https://your-railway-domain` in Vercel Project Env.
5. Deploy – confirm network requests succeed and Socket.IO connects.

### Common Deployment Issue: `vite: not found`
Cause: Hosting platform skipped devDependencies (where Vite lives). Fix options:
- Easiest: Deploy frontend separately (Vercel) and keep backend build a no-op (current setup).
- Or: Move `vite` + related plugins from `devDependencies` to `dependencies` in `client/package.json` (slower install) and restore build script.
- Or: Force install dev deps by setting `NPM_CONFIG_INCLUDE=dev=true` (if supported) before build.

Current repo configuration chooses separate deployments for faster backend boot and lean container.

## 📈 Roadmap

### Phase 1: MVP (Current)
- ✅ Core game engine
- ✅ 15 game templates
- ✅ Local and online play
- ✅ Basic AI integration
- ✅ PDF report generation

### Phase 2: Enhancement
- 🔄 Advanced AI customization
- 🔄 Video conferencing integration
- 🔄 Mobile app (React Native)
- 🔄 Enterprise SSO
- 🔄 White-label solutions

### Phase 3: Scale
- ⏳ 50+ game templates
- ⏳ Predictive team analytics
- ⏳ Integration marketplace
- ⏳ Advanced reporting dashboard
- ⏳ Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: [docs.blyza.com](https://docs.blyza.com)
- **Support Email**: support@blyza.com
- **Discord Community**: [discord.gg/blyza](https://discord.gg/blyza)

---

**Built with ❤️ for better team dynamics and workplace collaboration.**

## 🔄 Realtime State Sync (Snapshots & Diffs)

Plain language: We keep a full picture of the game (snapshot). When something small changes we send just the changed pieces (diff) to save bandwidth. If too many little changes build up or data looks suspicious, we resend the whole picture so everyone realigns.

Key pieces:
- Snapshot: built in `gameStore.buildSnapshot()` → includes version + checksum (a quick fingerprint) so we can detect corruption.
- Diff: `buildDiffPatch()` compares against the last snapshot we sent and outputs only changed top-level keys.
- Efficiency tracking: Counts bytes of diffs since the last full; if >60% of the original size we recommend a fresh full sync.
- Integrity checking: `verifySnapshot()` recomputes checksum; mismatches increment a counter and can auto-request a new full snapshot.
- Auto full snapshot: After 15 diffs we broadcast a new full snapshot (prevents slow drift).
- Versioning: `SNAPSHOT_VERSION` helps us migrate safely when structure changes; if we receive a higher version we set `remoteVersionAhead` and apply only known safe keys.
- Persistence: Last good snapshot + efficiency metrics saved in sessionStorage for quick reload recovery.

Stress test:
1. Open the Code Breakers game with `?debug=1&store=1&multiplayer=1` query params.
2. In the browser console run: `runDiffStressTest(300)` (added by `diffHarness.js`).
3. Watch the debug panel for efficiency ratio, mismatch count, and lock stats.

Future hardening ideas:
1. Unit tests for checksum + migration.
2. Persist lockStats across refresh.
3. Backoff strategy for repeated auto full-sync requests.
4. p50/p95 lock wait latency metrics.
