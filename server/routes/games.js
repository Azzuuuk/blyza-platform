import express from 'express';
import { gameTemplates } from '../data/gameTemplates.js';
import { AICustomizer } from '../services/aiCustomizer.js';
import { authenticateUser } from '../middleware/auth.js';
// Minimal points awarding (reuse existing MVP repo DB-backed points & rewards system)
import { addUserIfMissing, adjustPoints } from '../services/mvpRepo.js';

const router = express.Router();

/**
 * @route GET /api/games
 * @desc Get all available game templates
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const { category, duration, teamSize, difficulty } = req.query;
    
    let filteredGames = [...gameTemplates];
    
    // Apply filters
    if (category) {
      filteredGames = filteredGames.filter(game => 
        game.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (duration) {
      const [min, max] = duration.split('-').map(Number);
      filteredGames = filteredGames.filter(game => 
        game.duration >= min && game.duration <= max
      );
    }
    
    if (teamSize) {
      const size = parseInt(teamSize);
      filteredGames = filteredGames.filter(game => 
        game.teamSize.min <= size && game.teamSize.max >= size
      );
    }
    
    if (difficulty) {
      filteredGames = filteredGames.filter(game => 
        game.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }
    
    res.json({
      success: true,
      games: filteredGames,
      total: filteredGames.length
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch games' 
    });
  }
});

/**
 * @route GET /api/games/:id
 * @desc Get specific game template by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const game = gameTemplates.find(g => g.id === req.params.id);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }
    
    res.json({
      success: true,
      game
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch game' 
    });
  }
});

/**
 * @route POST /api/games/:id/customize
 * @desc Customize game using AI
 * @access Private
 */
router.post('/:id/customize', authenticateUser, async (req, res) => {
  try {
    const game = gameTemplates.find(g => g.id === req.params.id);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }
    
    const { tone, theme, difficulty, customPrompt, companyContext } = req.body;
    
    if (!tone) {
      return res.status(400).json({
        success: false,
        error: 'Tone is required for customization'
      });
    }
    
    const aiCustomizer = new AICustomizer();
    const customizedGame = await aiCustomizer.customizeGame(game, {
      tone,
      theme,
      difficulty,
      customPrompt,
      companyContext
    });
    
    res.json({
      success: true,
      customizedGame
    });
  } catch (error) {
    console.error('Error customizing game:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to customize game' 
    });
  }
});

/**
 * @route POST /api/games/:id/scenarios
 * @desc Generate custom scenarios for a game (AI assisted)
 * @access Private
 */
router.post('/:id/scenarios', authenticateUser, async (req,res)=>{
  try {
    const game = gameTemplates.find(g => g.id === req.params.id);
    if(!game) return res.status(404).json({ success:false, error:'Game not found'});
    const { context } = req.body || {};
    const aiCustomizer = new AICustomizer();
    const scenarios = await aiCustomizer.generateCustomScenarios(game, context||'General company setting');
    res.json({ success:true, scenarios });
  } catch(e){
    console.error('scenario generation error', e);
    res.status(500).json({ success:false, error:'Failed to generate scenarios'});
  }
});

/**
 * @route GET /api/games/categories
 * @desc Get all game categories
 * @access Public
 */
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = [...new Set(gameTemplates.map(game => game.category))];
    
    res.json({
      success: true,
      categories: categories.map(category => ({
        name: category,
        count: gameTemplates.filter(game => game.category === category).length
      }))
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch categories' 
    });
  }
});

/**
 * @route GET /api/games/popular
 * @desc Get popular/recommended games
 * @access Public
 */
router.get('/meta/popular', async (req, res) => {
  try {
    // For now, return games sorted by rating
    // In production, this would be based on actual usage analytics
    const popularGames = gameTemplates
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
    
    res.json({
      success: true,
      games: popularGames
    });
  } catch (error) {
    console.error('Error fetching popular games:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch popular games' 
    });
  }
});

/**
 * @route POST /api/games/code-breakers/submit-results
 * @desc Submit Code Breakers game results
 * @access Private
 */
router.post('/code-breakers/submit-results', async (req, res) => {
  try {
    const gameData = req.body;
    
    // 📊 Store game results in Firebase/your database
    const gameResults = {
      id: `cb_${Date.now()}`,
      sessionId: gameData.sessionId,
      gameType: 'code-breakers',
      theme: gameData.theme,
      players: gameData.players,
      startTime: gameData.startTime,
      endTime: gameData.endTime,
      duration: gameData.endTime - gameData.startTime,
      messagesDecoded: gameData.messagesDecoded,
      totalMessages: gameData.totalMessages,
      hintsUsed: gameData.hintsUsed,
      chatMessages: gameData.chatMessages,
      finalScore: gameData.finalScore,
      completionRate: (gameData.messagesDecoded / gameData.totalMessages) * 100,
      teamworkScore: Math.min(gameData.chatMessages * 10, 100), // Cap at 100
      timestamp: Date.now()
    };

    // 📡 Send to N8N for AI analysis - Format data as expected by n8n workflow
    try {
      const n8nPayload = {
        sessionId: gameResults.id,
        timestamp: new Date().toISOString(),
        quantitative: {
          gameInfo: {
            gameName: "Code Breakers",
            duration: Math.round((gameData.endTime - gameData.startTime) / 1000), // seconds
            difficulty: gameData.theme || "medium",
            category: "problem-solving"
          },
          quantitativeData: {
            messagesDecoded: gameData.messagesDecoded,
            totalMessages: gameData.totalMessages,
            completionRate: (gameData.messagesDecoded / gameData.totalMessages) * 100,
            hintsUsed: gameData.hintsUsed,
            finalScore: gameData.finalScore,
            teamworkScore: Math.min(gameData.chatMessages * 10, 100)
          },
          playerMetrics: gameData.players?.map(player => ({
            playerId: player.id,
            name: player.name,
            engagement: Math.min(player.score / 100, 10), // Scale to 1-10
            responses: player.messagesDecoded || 0
          })) || []
        },
        qualitative: {
          managerInfo: {
            managerName: "System Generated",
            managerEmail: "system@blyza.com",
            department: "Gaming",
            teamSize: gameData.players?.length || 1
          },
          managerObservations: {
            teamDynamics: gameData.chatMessages > 10 ? "High collaboration observed" : "Moderate collaboration",
            communicationIssues: gameData.hintsUsed > 5 ? "Team struggled with some clues" : "Team solved clues efficiently",
            leadershipEmergence: "Leadership patterns observed during gameplay",
            creativityLevel: gameData.messagesDecoded === gameData.totalMessages ? "high" : "medium",
            trustIndicators: "Team worked together to decode messages"
          }
        }
      };

      const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(n8nPayload)
      });

      if (n8nResponse.ok) {
        console.log('✅ Code Breakers data sent to N8N for analysis');
      }
    } catch (n8nError) {
      console.error('❌ N8N webhook failed:', n8nError);
    }

    // 🏅 Award points to each player (ONLY if an email is provided for that player).
    // We intentionally avoid over-engineering: no extra tables, just leverage existing users & points tables.
    // Expect optional player.email in payload. If absent, that player is skipped (cannot redeem later without an account).
    const playersAwarded = [];
    if (Array.isArray(gameData.players)) {
      for (const p of gameData.players) {
        try {
          if (!p.email) continue; // skip if we don't have an email to associate with a user account
          const user = await addUserIfMissing({ email: p.email, name: p.name });
          if (!user) continue;
          // Simple formula: direct score, fallback to 100 if missing, optionally clamp
            const rawPoints = typeof p.score === 'number' ? p.score : 100;
          const points = Math.max(1, Math.min(rawPoints, 500)); // clamp 1..500 to prevent abuse
          await adjustPoints({ userId: user.id, delta: points, reason: 'game_session', sessionId: gameData.sessionId });
          playersAwarded.push({ email: p.email, name: p.name, points });
        } catch (e) {
          console.warn('award_points_failed', p?.email, e.message);
        }
      }
    }

    res.json({
      success: true,
      message: 'Game results submitted successfully',
      gameId: gameResults.id,
      analysisUrl: `/analysis/${gameResults.id}`,
      playersAwarded,
      note: playersAwarded.length === 0 ? 'Include player.email in submission to award redeemable points.' : undefined
    });

  } catch (error) {
    console.error('Error submitting Code Breakers results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit game results'
    });
  }
});

/**
 * @route POST /api/games/code-breakers/track-event
 * @desc Track real-time game events for analytics
 * @access Private
 */
router.post('/code-breakers/track-event', async (req, res) => {
  try {
    const { sessionId, type, data, timestamp } = req.body;
    
    // 📈 Real-time event tracking for live analytics
    const event = {
      sessionId,
      type, // 'game_started', 'message_decoded', 'hint_used', 'chat_message', etc.
      data,
      timestamp: timestamp || Date.now()
    };

    // Store in your analytics database or send directly to N8N
    console.log(`🎮 Code Breakers Event [${type}]:`, data);

    res.json({
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking Code Breakers event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track event'
    });
  }
});

export default router;
