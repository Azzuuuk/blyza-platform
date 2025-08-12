import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes (will be created step by step)
let authRoutes, gameRoutes, lobbyRoutes, analyticsRoutes, reportsRoutes, rewardsRoutes, dashboardRoutes, nightfallRoutes;

// Lazy import routes to avoid circular dependencies
const loadRoutes = async () => {
  try {
    authRoutes = (await import('./routes/auth.js')).default;
    gameRoutes = (await import('./routes/games.js')).default;
    lobbyRoutes = (await import('./routes/lobby.js')).default;
    analyticsRoutes = (await import('./routes/analytics.js')).default;
    reportsRoutes = (await import('./routes/reports.js')).default;
    rewardsRoutes = (await import('./routes/rewards.js')).default;
    dashboardRoutes = (await import('./routes/dashboard.js')).default;
  nightfallRoutes = (await import('./routes/nightfall.js')).default;
  } catch (error) {
    console.warn('Some routes not available yet:', error.message);
  }
};

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
    version: '1.0.0'
  });
});

// API Routes (load after routes are imported)
const setupRoutes = async () => {
  await loadRoutes();
  // Track which route groups loaded for diagnostics
  const routeStatus = {
    auth: !!authRoutes,
    games: !!gameRoutes,
    lobby: !!lobbyRoutes,
    analytics: !!analyticsRoutes,
    reports: !!reportsRoutes,
    rewards: !!rewardsRoutes,
    dashboard: !!dashboardRoutes,
    nightfall: !!nightfallRoutes
  };

  if (authRoutes) app.use('/api/auth', authRoutes);
  if (gameRoutes) app.use('/api/games', gameRoutes);
  if (lobbyRoutes) app.use('/api/lobby', lobbyRoutes);
  if (analyticsRoutes) app.use('/api/analytics', analyticsRoutes);
  if (reportsRoutes) app.use('/api/reports', reportsRoutes);
  if (rewardsRoutes) app.use('/api/rewards', rewardsRoutes);
  if (dashboardRoutes) {
    console.log('📊 Dashboard routes loaded successfully');
    app.use('/api/dashboard', dashboardRoutes);
  } else {
    console.warn('⚠️ Dashboard routes not available');
  }
  if (nightfallRoutes) {
    console.log('🛰️ Nightfall routes loaded successfully');
    app.use('/api/nightfall', nightfallRoutes);
  } else {
    console.warn('⚠️ Nightfall routes not available');
  }

  // Expose diagnostic endpoint early
  app.get('/health/routes', (req,res) => {
    res.json({ success:true, routes: routeStatus });
  });

  console.log('✅ API routes loaded successfully', routeStatus);
};

// Initialize services and start server
const initializeServer = async () => {
  // Initialize Firebase
  initializeFirebase();
  
  // Setup routes
  await setupRoutes();
  
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

// Handle 404
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
