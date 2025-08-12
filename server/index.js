import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { runMigrations } from './services/runMigrations.js';

// Synchronous (eager) route imports for production reliability (lazy loading caused 404 races on Railway)
let authRoutes, gameRoutes, lobbyRoutes, analyticsRoutes, reportsRoutes, rewardsRoutes, dashboardRoutes, nightfallRoutes;
try { authRoutes = (await import('./routes/auth.js')).default } catch {}
try { gameRoutes = (await import('./routes/games.js')).default } catch {}
try { lobbyRoutes = (await import('./routes/lobby.js')).default } catch {}
try { analyticsRoutes = (await import('./routes/analytics.js')).default } catch {}
try { reportsRoutes = (await import('./routes/reports.js')).default } catch {}
try { rewardsRoutes = (await import('./routes/rewards.js')).default } catch {}
try { dashboardRoutes = (await import('./routes/dashboard.js')).default } catch {}
try { nightfallRoutes = (await import('./routes/nightfall.js')).default } catch {}

// Import services
import { initializeFirebase } from './services/firebase.js';
import { GameEngine } from './services/gameEngine.js';
import { SocketHandler } from './services/socketHandler.js';
import { NightfallRealtime } from './services/nightfallRealtime.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Track which major route groups loaded (diagnostics)
const routeStatus = {
  auth: false,
  games: false,
  lobby: false,
  analytics: false,
  reports: false,
  rewards: false,
  dashboard: false,
  nightfall: false
};

// Capture recent requests for troubleshooting (in-memory, volatile)
const lastRequests = [];
app.use((req,res,next) => {
  try {
    lastRequests.push({
      ts: new Date().toISOString(),
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      host: req.headers.host,
      ua: req.headers['user-agent']?.slice(0,60)
    });
    if(lastRequests.length > 200) lastRequests.shift();
  } catch {}
  next();
});

// Early diagnostic endpoint (always present even before dynamic route load)
app.get('/health/routes', (req,res) => {
  res.json({ success: true, routes: routeStatus, commit: process.env.RAILWAY_GIT_COMMIT_SHA || process.env.COMMIT_HASH || null });
});

// Raw express stack dump (minimal) for API route debugging (temporary)
app.get('/health/routes-raw', (req,res) => {
  try {
    const stack = (app._router?.stack||[]).filter(l=>l.route).map(l=>({
      path: l.route.path,
      methods: Object.keys(l.route.methods||{}).filter(m=>l.route.methods[m])
    }))
    res.json({ success:true, count: stack.length, stack })
  } catch (e) {
    res.status(500).json({ success:false, error: e.message })
  }
});

// Simple echo endpoint under /api to verify prefix matching in prod
app.all('/api/_debug/echo', (req,res) => {
  res.json({ success:true, msg:'api prefix reachable', method: req.method, url: req.originalUrl })
});

// Recent request log (sanitized)
app.get('/health/requests', (req,res) => {
  res.json({ success:true, count: lastRequests.length, requests: lastRequests.slice(-50) });
});

// Deep route inspection (debug). Lists registered HTTP method+path combos.
// NOTE: This is for troubleshooting only. Optionally gate with env var in future.
app.get('/health/express-routes', (req,res) => {
  const seen = []
  const extract = (stack, prefix='') => {
    stack.forEach(layer => {
      if(layer.route && layer.route.path) {
        const methods = Object.keys(layer.route.methods || {}).filter(m=>layer.route.methods[m]).map(m=>m.toUpperCase())
        seen.push({ methods, path: prefix + layer.route.path })
      } else if(layer.name === 'router' && layer.handle && layer.handle.stack) {
        // Try to derive the mount path from the layer.regexp (best-effort)
        let mount = ''
        if(layer.regexp && layer.regexp.source) {
          const match = layer.regexp.source
            .replace('(?=\/|$)', '')
            .replace('^\\/', '/')
            .replace('\\/?', '')
            .replace(/\\\/?$/,'')
          if(match && match !== '^' && match !== '(?=\/|$)') mount = match
        }
        extract(layer.handle.stack, prefix + mount)
      }
    })
  }
  if(app._router && app._router.stack) extract(app._router.stack)
  res.json({ success:true, count: seen.length, routes: seen })
})

// Initialize Firebase
initializeFirebase();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};// Body parsing middleware
// Enable CORS
app.use(cors(corsOptions));
 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    commit: process.env.RAILWAY_GIT_COMMIT_SHA || process.env.COMMIT_HASH || null
  });
});

// DB health (best-effort; does not crash if db module missing)
app.get('/health/db', async (req,res) => {
  try {
    const { healthCheck, dbDiagnostics } = await import('./services/db.js')
    const ok = await healthCheck()
    res.json({ success:true, healthy: ok, diagnostics: dbDiagnostics() })
  } catch (e) {
    res.status(200).json({ success:false, error: e.message })
  }
})

// TEMP one-off runtime migration trigger. REMOVE after first successful run.
// Requires setting TEMP_ADMIN_TOKEN in the backend service env vars.
app.post('/admin/migrate', async (req,res) => {
  try {
    const token = process.env.TEMP_ADMIN_TOKEN
    if(!token) return res.status(500).json({ success:false, error:'TEMP_ADMIN_TOKEN not set' })
    const provided = req.header('x-admin-token') || req.query.token
    if(provided !== token) return res.status(401).json({ success:false, error:'Unauthorized' })
    const result = await runMigrations()
    res.json({ success:true, result })
  } catch (e) {
    res.status(500).json({ success:false, error:e.message })
  }
})

// Eager mount API routes
const setupRoutes = () => {
  routeStatus.auth = !!authRoutes;
  routeStatus.games = !!gameRoutes;
  routeStatus.lobby = !!lobbyRoutes;
  routeStatus.analytics = !!analyticsRoutes;
  routeStatus.reports = !!reportsRoutes;
  routeStatus.rewards = !!rewardsRoutes;
  routeStatus.dashboard = !!dashboardRoutes;
  routeStatus.nightfall = !!nightfallRoutes;

  if (authRoutes) app.use('/api/auth', authRoutes);
  if (gameRoutes) app.use('/api/games', gameRoutes);
  if (lobbyRoutes) app.use('/api/lobby', lobbyRoutes);
  if (analyticsRoutes) app.use('/api/analytics', analyticsRoutes);
  if (reportsRoutes) app.use('/api/reports', reportsRoutes);
  if (rewardsRoutes) app.use('/api/rewards', rewardsRoutes);
  if (dashboardRoutes) app.use('/api/dashboard', dashboardRoutes);
  if (nightfallRoutes) app.use('/api/nightfall', nightfallRoutes);

  console.log('✅ API routes mounted (eager)', routeStatus);
};

// Initialize services and start server
const initializeServer = async () => {
  // Initialize Firebase
  initializeFirebase();
  
  // Setup routes (now synchronous)
  setupRoutes();
  
  // Initialize game engine
  const { GameEngine } = await import('./services/gameEngine.js').catch(() => ({ GameEngine: null }));
  const gameEngine = GameEngine ? new GameEngine(io) : null;
  
  // Initialize socket handling
  const { SocketHandler } = await import('./services/socketHandler.js').catch(() => ({ SocketHandler: null }));
  const socketHandler = SocketHandler && gameEngine ? new SocketHandler(io, gameEngine) : null;
  // Initialize Operation Nightfall real-time channel
  const nightfallRealtime = new NightfallRealtime(io);
  try { (await import('./services/nightfallRegistry.js')).registerNightfallRealtime(nightfallRealtime); } catch (e) { console.warn('Nightfall registry not available', e?.message); }
  
  if (!gameEngine || !socketHandler) {
    console.warn('⚠️  Game engine or socket handler not available - some features disabled');
  }
  
  return { gameEngine, socketHandler };
};

// Start server
initializeServer().then(({ gameEngine, socketHandler }) => {
  server.listen(PORT, () => {
    console.log(`\n🚀 Blyza Platform Server Running\n📍 Port: ${PORT}\n🌍 Environment: ${process.env.NODE_ENV || 'development'}\n🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}\n📊 Socket.IO: Ready for real-time connections\n🎮 Game Engine: ${gameEngine ? 'Initialized with 18 templates' : 'Not available'}\n`)
  })
}).catch(error => {
  console.error('Failed to initialize server:', error);
  process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  if (err.type === 'auth') {
    return res.status(401).json({ error: 'Authentication failed' });
  }
  
  if (err.type === 'validation') {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Debug fallthrough markers for dashboard & nightfall (helps remotely verify matcher)
app.use((req,res,next) => {
  if(req.originalUrl.startsWith('/api/dashboard')) {
    lastRequests.push({ ts:new Date().toISOString(), method:req.method, path:req.originalUrl, debug:'dashboard-fallthrough' });
  } else if(req.originalUrl.startsWith('/api/nightfall')) {
    lastRequests.push({ ts:new Date().toISOString(), method:req.method, path:req.originalUrl, debug:'nightfall-fallthrough' });
  }
  next();
});

// Handle 404 (keep last)
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id}, reason: ${reason}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start server moved to initializeServer function above

export default app;
