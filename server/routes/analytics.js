import express from 'express';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// In-memory analytics storage (use database in production)
const gameAnalytics = new Map();
// Mission results storage (keyed by sessionId)
const missionResults = new Map();

/**
 * @route POST /api/analytics/track
 * @desc Track game event
 * @access Public
 */
router.post('/track', async (req, res) => {
  try {
    const { 
      sessionId, 
      playerId, 
      eventType, 
      eventData, 
      timestamp 
    } = req.body;
    
    if (!sessionId || !playerId || !eventType) {
      return res.status(400).json({
        success: false,
        error: 'Session ID, player ID, and event type are required'
      });
    }
    
    const analyticsEntry = {
      sessionId,
      playerId,
      eventType,
      eventData: eventData || {},
      timestamp: timestamp || new Date().toISOString()
    };
    
    if (!gameAnalytics.has(sessionId)) {
      gameAnalytics.set(sessionId, []);
    }
    
    gameAnalytics.get(sessionId).push(analyticsEntry);
    
    res.json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track event'
    });
  }
});

/**
 * @route POST /api/analytics/event
 * @desc Accept batched lightweight client events (from front-end queue flush)
 * @access Public
 */
router.post('/event', async (req, res) => {
  try {
    const { events } = req.body || {};
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ success: false, error: 'Events array required' });
    }

    events.forEach(ev => {
      const sessionId = ev?.payload?.sessionId || ev?.payload?.session_id || 'unknown-session';
      if (!gameAnalytics.has(sessionId)) gameAnalytics.set(sessionId, []);
      gameAnalytics.get(sessionId).push({
        sessionId,
        playerId: ev?.payload?.playerId || 'anonymous',
        eventType: ev.type || ev.eventType || 'unknown',
        eventData: ev.payload || {},
        timestamp: new Date(ev.ts || Date.now()).toISOString(),
        _raw: ev,
      });
    });

    res.json({ success: true, stored: events.length });
  } catch (error) {
    console.error('Error storing batch events:', error);
    res.status(500).json({ success: false, error: 'Failed to store events' });
  }
});

/**
 * @route POST /api/analytics/results
 * @desc Store finalized mission results (Operation Nightfall etc.)
 * @access Public (can secure later)
 */
router.post('/results', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId required in results payload' });
    }
    missionResults.set(payload.sessionId, { ...payload, storedAt: new Date().toISOString() });
    res.json({ success: true });
  } catch (error) {
    console.error('Error storing mission results:', error);
    res.status(500).json({ success: false, error: 'Failed to store results' });
  }
});

/**
 * @route GET /api/analytics/results/:sessionId
 * @desc Retrieve stored mission results
 * @access Private (temporary: requires auth)
 */
router.get('/results/:sessionId', authenticateUser, async (req, res) => {
  try {
    const data = missionResults.get(req.params.sessionId);
    if (!data) return res.status(404).json({ success: false, error: 'Results not found' });
    res.json({ success: true, results: data });
  } catch (error) {
    console.error('Error retrieving mission results:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve results' });
  }
});

/**
 * @route GET /api/analytics/session/:sessionId
 * @desc Get analytics for a game session
 * @access Private
 */
router.get('/session/:sessionId', authenticateUser, async (req, res) => {
  try {
    const sessionEvents = gameAnalytics.get(req.params.sessionId) || [];
    
    // Calculate basic metrics
    const metrics = calculateSessionMetrics(sessionEvents);
    
    res.json({
      success: true,
      analytics: {
        sessionId: req.params.sessionId,
        totalEvents: sessionEvents.length,
        metrics,
        events: sessionEvents
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

/**
 * @route POST /api/analytics/session/:sessionId/summary
 * @desc Generate session summary
 * @access Private
 */
router.post('/session/:sessionId/summary', authenticateUser, async (req, res) => {
  try {
    const sessionEvents = gameAnalytics.get(req.params.sessionId) || [];
    
    if (sessionEvents.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No analytics data found for this session'
      });
    }
    
    const summary = generateSessionSummary(sessionEvents);
    
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate summary'
    });
  }
});

/**
 * Calculate metrics from session events
 */
function calculateSessionMetrics(events) {
  const players = new Set(events.map(e => e.playerId));
  const eventTypes = {};
  const playerStats = {};
  
  // Initialize player stats
  players.forEach(playerId => {
    playerStats[playerId] = {
      totalEvents: 0,
      responseTime: [],
      correctAnswers: 0,
      totalQuestions: 0,
      chatMessages: 0,
      reactions: 0
    };
  });
  
  // Process events
  events.forEach(event => {
    // Count event types
    eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;
    
    // Update player stats
    const playerStat = playerStats[event.playerId];
    playerStat.totalEvents++;
    
    switch (event.eventType) {
      case 'answer_submitted':
        if (event.eventData.responseTime) {
          playerStat.responseTime.push(event.eventData.responseTime);
        }
        if (event.eventData.correct) {
          playerStat.correctAnswers++;
        }
        playerStat.totalQuestions++;
        break;
        
      case 'chat_message':
        playerStat.chatMessages++;
        break;
        
      case 'reaction_sent':
        playerStat.reactions++;
        break;
    }
  });
  
  // Calculate averages
  Object.values(playerStats).forEach(stats => {
    if (stats.responseTime.length > 0) {
      stats.avgResponseTime = stats.responseTime.reduce((a, b) => a + b, 0) / stats.responseTime.length;
    }
    if (stats.totalQuestions > 0) {
      stats.accuracy = (stats.correctAnswers / stats.totalQuestions) * 100;
    }
  });
  
  return {
    totalPlayers: players.size,
    eventTypes,
    playerStats,
    sessionDuration: calculateSessionDuration(events),
    engagementScore: calculateEngagementScore(playerStats)
  };
}

/**
 * Generate comprehensive session summary
 */
function generateSessionSummary(events) {
  const metrics = calculateSessionMetrics(events);
  
  return {
    overview: {
      totalPlayers: metrics.totalPlayers,
      sessionDuration: metrics.sessionDuration,
      engagementScore: metrics.engagementScore,
      totalInteractions: events.length
    },
    playerInsights: Object.entries(metrics.playerStats).map(([playerId, stats]) => ({
      playerId,
      participationLevel: categorizeParticipation(stats),
      responseSpeed: categorizeResponseSpeed(stats.avgResponseTime),
      accuracy: stats.accuracy || 0,
      socialEngagement: stats.chatMessages + stats.reactions
    })),
    teamDynamics: {
      communicationLevel: calculateCommunicationLevel(metrics),
      collaborationScore: calculateCollaborationScore(metrics),
      leadershipEmergence: identifyLeaders(metrics.playerStats)
    },
    recommendations: generateRecommendations(metrics)
  };
}

function calculateSessionDuration(events) {
  if (events.length === 0) return 0;
  
  const timestamps = events.map(e => new Date(e.timestamp).getTime());
  return Math.max(...timestamps) - Math.min(...timestamps);
}

function calculateEngagementScore(playerStats) {
  const scores = Object.values(playerStats).map(stats => {
    let score = 0;
    score += Math.min(stats.totalEvents / 10, 1) * 30; // Activity
    score += Math.min(stats.chatMessages / 5, 1) * 25; // Communication
    score += Math.min(stats.reactions / 3, 1) * 15; // Reactions
    score += Math.min((stats.accuracy || 0) / 100, 1) * 30; // Performance
    return score;
  });
  
  return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
}

function categorizeParticipation(stats) {
  const total = stats.totalEvents;
  if (total >= 20) return 'High';
  if (total >= 10) return 'Medium';
  return 'Low';
}

function categorizeResponseSpeed(avgTime) {
  if (!avgTime) return 'No data';
  if (avgTime < 3000) return 'Fast';
  if (avgTime < 8000) return 'Average';
  return 'Slow';
}

function calculateCommunicationLevel(metrics) {
  const totalMessages = Object.values(metrics.playerStats)
    .reduce((sum, stats) => sum + stats.chatMessages, 0);
  
  if (totalMessages >= metrics.totalPlayers * 3) return 'High';
  if (totalMessages >= metrics.totalPlayers) return 'Medium';
  return 'Low';
}

function calculateCollaborationScore(metrics) {
  // Simple collaboration score based on interaction patterns
  const totalInteractions = Object.values(metrics.playerStats)
    .reduce((sum, stats) => sum + stats.chatMessages + stats.reactions, 0);
  
  return Math.min((totalInteractions / (metrics.totalPlayers * 5)) * 100, 100);
}

function identifyLeaders(playerStats) {
  return Object.entries(playerStats)
    .sort((a, b) => b[1].totalEvents - a[1].totalEvents)
    .slice(0, 2)
    .map(([playerId]) => playerId);
}

function generateRecommendations(metrics) {
  const recommendations = [];
  
  if (metrics.engagementScore < 50) {
    recommendations.push('Consider shorter, more interactive games to boost engagement');
  }
  
  if (calculateCommunicationLevel(metrics) === 'Low') {
    recommendations.push('Try communication-focused games to encourage team interaction');
  }
  
  const lowParticipators = Object.entries(metrics.playerStats)
    .filter(([_, stats]) => categorizeParticipation(stats) === 'Low').length;
  
  if (lowParticipators > metrics.totalPlayers * 0.3) {
    recommendations.push('Some team members may benefit from smaller group activities first');
  }
  
  return recommendations;
}

export { gameAnalytics, missionResults };
export default router;
