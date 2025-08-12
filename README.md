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
- **React 18** with **Next.js 14** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Socket.IO Client** for real-time features
- **React Query** for data fetching
- **Zustand** for state management

### Backend
- **Node.js** with **Express.js**
- **Socket.IO** for WebSocket connections
- **Firebase Admin SDK** for authentication and database
- **OpenAI API** for AI features
- **PDF-lib** for report generation
- **Stripe** for payments (rewards store)
- **Nodemailer** for email delivery

### Database & Services
- **Firebase Firestore** - Main database
- **Firebase Auth** - User authentication
- **Firebase Storage** - File storage
- **Firebase Realtime Database** - Game state
- **OpenAI GPT-4** - AI customization and reports

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore, Auth, and Storage enabled
- OpenAI API key
- Stripe account (for rewards store)

### Installation

1. **Clone and install dependencies:**
```bash
cd blyza-platform
npm run setup
```

2. **Environment setup:**
```bash
cp .env.example .env
# Fill in your API keys and Firebase config
```

3. **Start development servers:**
```bash
npm run dev
```

The platform will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Socket.IO: http://localhost:5000

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

## 🌍 Deployment

### Production Environment
- Frontend: Vercel/Netlify with CDN
- Backend: Railway/Heroku with auto-scaling
- Database: Firebase (automatically scaled)
- File Storage: Firebase Storage with CDN
- Monitoring: Firebase Analytics + Custom dashboards

### Environment Variables
```bash
# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# OpenAI
OPENAI_API_KEY=your-openai-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Email
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# App
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-domain.com
```

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
