import { lobbies } from '../routes/lobby.js';
import { gameTemplates } from '../data/gameTemplates.js';

/**
 * Real-time game engine using Socket.IO
 */
export class GameEngine {
  constructor(io) {
    this.io = io;
    this.activeSessions = new Map(); // sessionId -> gameState
    this.playerSockets = new Map(); // playerId -> socketId
  }

  /**
   * Start a new game session
   */
  startGame(lobbyId, gameTemplate) {
    const lobby = lobbies.get(lobbyId);
    if (!lobby) {
      throw new Error('Lobby not found');
    }

    const sessionId = `session_${Date.now()}`;
    const gameState = {
      sessionId,
      lobbyId,
      gameId: gameTemplate.id,
      gameTemplate,
      status: 'starting',
      currentRound: 0,
      totalRounds: gameTemplate.rounds || 5,
      players: lobby.players.map(player => ({
        ...player,
        score: 0,
        responses: [],
        isActive: true
      })),
      startedAt: new Date().toISOString(),
      timePerRound: gameTemplate.mechanics?.timePerQuestion || 60,
      gameData: this.initializeGameData(gameTemplate)
    };

    this.activeSessions.set(sessionId, gameState);
    lobby.sessionId = sessionId;
    lobby.status = 'in-progress';

    // Notify all players
    this.io.to(`lobby_${lobbyId}`).emit('game_started', {
      sessionId,
      gameState: this.getPublicGameState(gameState)
    });

    // Start first round after a delay
    setTimeout(() => {
      this.startRound(sessionId);
    }, 3000);

    return sessionId;
  }

  /**
   * Initialize game-specific data
   */
  initializeGameData(gameTemplate) {
    switch (gameTemplate.gameType) {
      case 'quiz-discussion':
        return {
          questions: this.shuffleArray([...gameTemplate.questions || []]),
          currentQuestion: null,
          responses: new Map()
        };
      
      case 'collaborative-creation':
        return {
          story: [],
          currentTurn: 0,
          prompt: "Once upon a time in a workplace far, far away..."
        };
      
      case 'voting':
        return {
          proposals: [],
          votes: new Map(),
          votingActive: false
        };
      
      default:
        return {
          challenges: [],
          submissions: new Map()
        };
    }
  }

  /**
   * Start a new round
   */
  startRound(sessionId) {
    const gameState = this.activeSessions.get(sessionId);
    if (!gameState) return;

    gameState.currentRound++;
    gameState.roundStartedAt = new Date().toISOString();
    gameState.status = 'round-active';

    const roundData = this.generateRoundData(gameState);
    gameState.currentRoundData = roundData;

    // Clear previous round responses
    if (gameState.gameData.responses) {
      gameState.gameData.responses.clear();
    }

    this.io.to(`lobby_${gameState.lobbyId}`).emit('round_started', {
      round: gameState.currentRound,
      totalRounds: gameState.totalRounds,
      roundData,
      timeLimit: gameState.timePerRound
    });

    // Set round timer
    setTimeout(() => {
      this.endRound(sessionId);
    }, gameState.timePerRound * 1000);
  }

  /**
   * Generate data for the current round
   */
  generateRoundData(gameState) {
    const { gameTemplate, currentRound, gameData } = gameState;

    switch (gameTemplate.gameType) {
      case 'quiz-discussion':
        if (gameData.questions && gameData.questions.length > 0) {
          const questionIndex = (currentRound - 1) % gameData.questions.length;
          gameData.currentQuestion = gameData.questions[questionIndex];
          return {
            type: 'question',
            question: gameData.currentQuestion.content,
            options: gameData.currentQuestion.options,
            questionType: gameData.currentQuestion.type
          };
        }
        break;

      case 'collaborative-creation':
        const currentPlayer = gameState.players[gameData.currentTurn % gameState.players.length];
        return {
          type: 'story-contribution',
          currentStory: gameData.story.join(' '),
          activePlayer: currentPlayer.id,
          prompt: "Continue the story with one sentence..."
        };

      case 'estimation-challenge':
        return {
          type: 'estimation',
          challenge: `Estimate the annual budget for office supplies in a ${Math.floor(Math.random() * 500) + 50}-person company`,
          unit: 'dollars'
        };

      default:
        return {
          type: 'general-challenge',
          challenge: `Round ${currentRound} challenge`,
          instruction: 'Work together to solve this challenge'
        };
    }

    return { type: 'generic', message: `Round ${currentRound}` };
  }

  /**
   * Handle player response
   */
  submitResponse(sessionId, playerId, response) {
    const gameState = this.activeSessions.get(sessionId);
    if (!gameState || gameState.status !== 'round-active') {
      return { success: false, error: 'Game not active' };
    }

    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    // Store response
    if (!gameState.gameData.responses) {
      gameState.gameData.responses = new Map();
    }

    const responseData = {
      playerId,
      response,
      timestamp: new Date().toISOString(),
      round: gameState.currentRound
    };

    gameState.gameData.responses.set(playerId, responseData);

    // Handle specific game mechanics
    this.handleGameSpecificResponse(gameState, responseData);

    // Notify other players of response submission (without revealing content)
    this.io.to(`lobby_${gameState.lobbyId}`).emit('response_submitted', {
      playerId,
      playerName: player.name,
      responseCount: gameState.gameData.responses.size,
      totalPlayers: gameState.players.length
    });

    return { success: true };
  }

  /**
   * Handle game-specific response logic
   */
  handleGameSpecificResponse(gameState, responseData) {
    const { gameTemplate } = gameState;

    switch (gameTemplate.gameType) {
      case 'collaborative-creation':
        // Add to story
        gameState.gameData.story.push(responseData.response);
        gameState.gameData.currentTurn++;
        break;

      case 'quiz-discussion':
        // Check if answer is correct
        if (gameState.gameData.currentQuestion) {
          const isCorrect = responseData.response === gameState.gameData.currentQuestion.correct;
          responseData.correct = isCorrect;
          
          if (isCorrect) {
            const player = gameState.players.find(p => p.id === responseData.playerId);
            if (player) {
              player.score += gameTemplate.pointsPerRound;
            }
          }
        }
        break;
    }
  }

  /**
   * End the current round
   */
  endRound(sessionId) {
    const gameState = this.activeSessions.get(sessionId);
    if (!gameState) return;

    gameState.status = 'round-ended';
    
    const roundResults = this.calculateRoundResults(gameState);

    this.io.to(`lobby_${gameState.lobbyId}`).emit('round_ended', {
      round: gameState.currentRound,
      results: roundResults,
      scores: gameState.players.map(p => ({
        playerId: p.id,
        playerName: p.name,
        score: p.score
      }))
    });

    // Check if game is complete
    if (gameState.currentRound >= gameState.totalRounds) {
      setTimeout(() => {
        this.endGame(sessionId);
      }, 5000);
    } else {
      // Start next round
      setTimeout(() => {
        this.startRound(sessionId);
      }, 8000);
    }
  }

  /**
   * Calculate results for the current round
   */
  calculateRoundResults(gameState) {
    const responses = Array.from(gameState.gameData.responses.values());
    
    switch (gameState.gameTemplate.gameType) {
      case 'quiz-discussion':
        return {
          correctAnswer: gameState.gameData.currentQuestion?.correct,
          explanation: gameState.gameData.currentQuestion?.explanation,
          playerResponses: responses.map(r => ({
            playerName: gameState.players.find(p => p.id === r.playerId)?.name,
            response: r.response,
            correct: r.correct
          }))
        };
      
      case 'collaborative-creation':
        return {
          storyProgress: gameState.gameData.story.join(' '),
          contributingPlayer: gameState.players.find(p => 
            p.id === responses[responses.length - 1]?.playerId
          )?.name
        };
      
      default:
        return {
          submissions: responses.length,
          summary: `${responses.length} players participated in this round`
        };
    }
  }

  /**
   * End the game session
   */
  endGame(sessionId) {
    const gameState = this.activeSessions.get(sessionId);
    if (!gameState) return;

    gameState.status = 'completed';
    gameState.completedAt = new Date().toISOString();

    const finalResults = this.calculateFinalResults(gameState);

    this.io.to(`lobby_${gameState.lobbyId}`).emit('game_ended', {
      sessionId,
      results: finalResults,
      duration: this.calculateGameDuration(gameState),
      nextSteps: {
        report: true,
        rewards: true,
        playAgain: true
      }
    });

    // Update lobby status
    const lobby = lobbies.get(gameState.lobbyId);
    if (lobby) {
      lobby.status = 'completed';
    }
  }

  /**
   * Calculate final game results
   */
  calculateFinalResults(gameState) {
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
    
    return {
      leaderboard: sortedPlayers.map((player, index) => ({
        rank: index + 1,
        playerId: player.id,
        playerName: player.name,
        score: player.score,
        badge: index === 0 ? '🥇' : index === 1 ? '🥉' : index === 2 ? '🥉' : ''
      })),
      teamStats: {
        totalPlayers: gameState.players.length,
        averageScore: sortedPlayers.reduce((sum, p) => sum + p.score, 0) / sortedPlayers.length,
        totalRounds: gameState.currentRound,
        engagementRate: this.calculateEngagementRate(gameState)
      },
      highlights: this.generateGameHighlights(gameState)
    };
  }

  /**
   * Calculate engagement rate
   */
  calculateEngagementRate(gameState) {
    const totalPossibleResponses = gameState.players.length * gameState.currentRound;
    const actualResponses = gameState.players.reduce((sum, player) => 
      sum + (player.responses?.length || 0), 0
    );
    
    return totalPossibleResponses > 0 ? 
      Math.round((actualResponses / totalPossibleResponses) * 100) : 0;
  }

  /**
   * Generate game highlights
   */
  generateGameHighlights(gameState) {
    const highlights = [];
    
    const topPlayer = gameState.players.reduce((prev, current) => 
      (prev.score > current.score) ? prev : current
    );
    
    highlights.push(`🌟 Top performer: ${topPlayer.name} with ${topPlayer.score} points`);
    
    if (gameState.gameTemplate.gameType === 'collaborative-creation') {
      highlights.push(`📚 Created a ${gameState.gameData.story.length}-sentence collaborative story`);
    }
    
    const engagementRate = this.calculateEngagementRate(gameState);
    if (engagementRate > 80) {
      highlights.push(`🚀 Excellent team engagement: ${engagementRate}%`);
    }
    
    return highlights;
  }

  /**
   * Calculate game duration
   */
  calculateGameDuration(gameState) {
    const start = new Date(gameState.startedAt);
    const end = new Date(gameState.completedAt);
    return Math.round((end - start) / 1000 / 60); // minutes
  }

  /**
   * Get public game state (safe to send to clients)
   */
  getPublicGameState(gameState) {
    return {
      sessionId: gameState.sessionId,
      gameId: gameState.gameId,
      status: gameState.status,
      currentRound: gameState.currentRound,
      totalRounds: gameState.totalRounds,
      players: gameState.players.map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        isActive: p.isActive
      })),
      gameInfo: {
        title: gameState.gameTemplate.title,
        category: gameState.gameTemplate.category,
        duration: gameState.gameTemplate.duration
      }
    };
  }

  /**
   * Utility: Shuffle array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get active session by ID
   */
  getSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Clean up completed sessions (call periodically)
   */
  cleanupSessions() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [sessionId, gameState] of this.activeSessions) {
      const sessionTime = new Date(gameState.startedAt).getTime();
      if (sessionTime < cutoff && gameState.status === 'completed') {
        this.activeSessions.delete(sessionId);
      }
    }
  }
}
