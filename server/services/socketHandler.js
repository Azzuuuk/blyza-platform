/**
 * Socket.IO event handlers for real-time game features
 */
export class SocketHandler {
  constructor(io, gameEngine) {
    this.io = io;
    this.gameEngine = gameEngine;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Lobby events
      socket.on('join_lobby', this.handleJoinLobby.bind(this, socket));
      socket.on('leave_lobby', this.handleLeaveLobby.bind(this, socket));
      socket.on('start_game', this.handleStartGame.bind(this, socket));

      // Game events
      socket.on('submit_response', this.handleSubmitResponse.bind(this, socket));
      socket.on('send_reaction', this.handleSendReaction.bind(this, socket));
      socket.on('send_chat', this.handleSendChat.bind(this, socket));

      // Generic events
      socket.on('ping', () => socket.emit('pong'));
      socket.on('disconnect', this.handleDisconnect.bind(this, socket));
    });
  }

  /**
   * Handle player joining lobby
   */
  async handleJoinLobby(socket, data) {
    try {
      const { lobbyId, playerId, playerName } = data;
      
      if (!lobbyId || !playerId) {
        socket.emit('error', { message: 'Lobby ID and Player ID required' });
        return;
      }

      // Join socket room
      socket.join(`lobby_${lobbyId}`);
      
      // Store player socket mapping
      this.gameEngine.playerSockets.set(playerId, socket.id);
      socket.playerId = playerId;
      socket.lobbyId = lobbyId;

      // Notify lobby of new player
      socket.to(`lobby_${lobbyId}`).emit('player_joined', {
        playerId,
        playerName,
        timestamp: new Date().toISOString()
      });

      socket.emit('lobby_joined', {
        lobbyId,
        playerId,
        message: 'Successfully joined lobby'
      });

      console.log(`👤 Player ${playerName} (${playerId}) joined lobby ${lobbyId}`);
    } catch (error) {
      console.error('Join lobby error:', error);
      socket.emit('error', { message: 'Failed to join lobby' });
    }
  }

  /**
   * Handle player leaving lobby
   */
  async handleLeaveLobby(socket, data) {
    try {
      const { lobbyId, playerId } = data;
      
      socket.leave(`lobby_${lobbyId}`);
      this.gameEngine.playerSockets.delete(playerId);

      socket.to(`lobby_${lobbyId}`).emit('player_left', {
        playerId,
        timestamp: new Date().toISOString()
      });

      console.log(`👤 Player ${playerId} left lobby ${lobbyId}`);
    } catch (error) {
      console.error('Leave lobby error:', error);
    }
  }

  /**
   * Handle game start
   */
  async handleStartGame(socket, data) {
    try {
      const { lobbyId, gameId } = data;
      
      // Import here to avoid circular dependency
      const { gameTemplates } = await import('../data/gameTemplates.js');
      const gameTemplate = gameTemplates.find(g => g.id === gameId);
      
      if (!gameTemplate) {
        socket.emit('error', { message: 'Game template not found' });
        return;
      }

      const sessionId = this.gameEngine.startGame(lobbyId, gameTemplate);
      
      console.log(`🎮 Game started: ${gameTemplate.title} (Session: ${sessionId})`);
    } catch (error) {
      console.error('Start game error:', error);
      socket.emit('error', { message: 'Failed to start game' });
    }
  }

  /**
   * Handle player response submission
   */
  async handleSubmitResponse(socket, data) {
    try {
      const { sessionId, playerId, response } = data;
      
      if (!sessionId || !playerId || response === undefined) {
        socket.emit('error', { message: 'Session ID, Player ID, and response required' });
        return;
      }

      const result = this.gameEngine.submitResponse(sessionId, playerId, response);
      
      if (result.success) {
        socket.emit('response_received', {
          sessionId,
          playerId,
          timestamp: new Date().toISOString()
        });

        // Track analytics
        this.trackAnalyticsEvent(sessionId, playerId, 'answer_submitted', {
          response,
          responseTime: data.responseTime,
          round: data.round
        });
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (error) {
      console.error('Submit response error:', error);
      socket.emit('error', { message: 'Failed to submit response' });
    }
  }

  /**
   * Handle reaction/emoji sending
   */
  async handleSendReaction(socket, data) {
    try {
      const { sessionId, playerId, reaction, targetPlayerId } = data;
      
      if (!sessionId || !playerId || !reaction) {
        socket.emit('error', { message: 'Session ID, Player ID, and reaction required' });
        return;
      }

      const reactionData = {
        playerId,
        reaction,
        targetPlayerId,
        timestamp: new Date().toISOString()
      };

      // Broadcast to lobby
      this.io.to(`lobby_${socket.lobbyId}`).emit('reaction_received', reactionData);

      // Track analytics
      this.trackAnalyticsEvent(sessionId, playerId, 'reaction_sent', {
        reaction,
        targetPlayerId
      });

      console.log(`😀 Reaction sent: ${playerId} -> ${reaction}`);
    } catch (error) {
      console.error('Send reaction error:', error);
      socket.emit('error', { message: 'Failed to send reaction' });
    }
  }

  /**
   * Handle chat message
   */
  async handleSendChat(socket, data) {
    try {
      const { sessionId, playerId, playerName, message } = data;
      
      if (!sessionId || !playerId || !message) {
        socket.emit('error', { message: 'Session ID, Player ID, and message required' });
        return;
      }

      // Basic content filtering
      const filteredMessage = this.filterMessage(message);
      
      const chatData = {
        playerId,
        playerName,
        message: filteredMessage,
        timestamp: new Date().toISOString()
      };

      // Broadcast to lobby
      this.io.to(`lobby_${socket.lobbyId}`).emit('chat_message', chatData);

      // Track analytics
      this.trackAnalyticsEvent(sessionId, playerId, 'chat_message', {
        messageLength: message.length,
        wordCount: message.split(' ').length
      });

      console.log(`💬 Chat: ${playerName}: ${filteredMessage}`);
    } catch (error) {
      console.error('Send chat error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  /**
   * Handle client disconnect
   */
  async handleDisconnect(socket) {
    try {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      
      if (socket.playerId && socket.lobbyId) {
        this.gameEngine.playerSockets.delete(socket.playerId);
        
        socket.to(`lobby_${socket.lobbyId}`).emit('player_disconnected', {
          playerId: socket.playerId,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  /**
   * Track analytics event
   */
  async trackAnalyticsEvent(sessionId, playerId, eventType, eventData) {
    try {
      // Import analytics storage
      const { gameAnalytics } = await import('../routes/analytics.js');
      
      const analyticsEntry = {
        sessionId,
        playerId,
        eventType,
        eventData: eventData || {},
        timestamp: new Date().toISOString()
      };

      if (!gameAnalytics.has(sessionId)) {
        gameAnalytics.set(sessionId, []);
      }

      gameAnalytics.get(sessionId).push(analyticsEntry);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  /**
   * Basic message filtering
   */
  filterMessage(message) {
    // Simple profanity filter - in production, use a proper service
    const inappropriateWords = ['spam', 'test123']; // Add actual filter words
    
    let filtered = message;
    inappropriateWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    
    return filtered.substring(0, 500); // Limit length
  }

  /**
   * Broadcast system message to lobby
   */
  broadcastSystemMessage(lobbyId, message, type = 'info') {
    this.io.to(`lobby_${lobbyId}`).emit('system_message', {
      type,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send notification to specific player
   */
  notifyPlayer(playerId, notification) {
    const socketId = this.gameEngine.playerSockets.get(playerId);
    if (socketId) {
      this.io.to(socketId).emit('notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get lobby connection stats
   */
  getLobbyStats(lobbyId) {
    const room = this.io.sockets.adapter.rooms.get(`lobby_${lobbyId}`);
    return {
      connectedSockets: room ? room.size : 0,
      lobbyId
    };
  }
}
