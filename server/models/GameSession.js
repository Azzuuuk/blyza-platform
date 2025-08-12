/**
 * GameSession Model - Defines the structure for active game sessions
 */
export class GameSession {
  constructor(data) {
    this.id = data.id || this.generateId()
    this.gameId = data.gameId
    this.hostId = data.hostId
    this.title = data.title
    this.status = data.status || 'lobby' // lobby, active, paused, completed, cancelled
    this.players = data.players || []
    this.maxPlayers = data.maxPlayers || 8
    this.settings = data.settings || {}
    this.gameData = data.gameData || {}
    this.analytics = data.analytics || {
      startTime: null,
      endTime: null,
      engagement: {},
      interactions: [],
      scores: {}
    }
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  generateId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Add player to session
  addPlayer(player) {
    if (this.players.length >= this.maxPlayers) {
      throw new Error('Session is full')
    }
    
    if (this.players.find(p => p.id === player.id)) {
      throw new Error('Player already in session')
    }
    
    this.players.push({
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      joinedAt: new Date(),
      status: 'connected',
      score: 0
    })
    
    this.updatedAt = new Date()
  }

  // Remove player from session
  removePlayer(playerId) {
    this.players = this.players.filter(p => p.id !== playerId)
    this.updatedAt = new Date()
  }

  // Update player status
  updatePlayerStatus(playerId, status) {
    const player = this.players.find(p => p.id === playerId)
    if (player) {
      player.status = status
      this.updatedAt = new Date()
    }
  }

  // Start the game
  startGame() {
    if (this.status !== 'lobby') {
      throw new Error('Game can only be started from lobby')
    }
    
    if (this.players.length < 1) {
      throw new Error('At least 1 player required to start')
    }
    
    this.status = 'active'
    this.analytics.startTime = new Date()
    this.updatedAt = new Date()
  }

  // End the game
  endGame() {
    if (this.status !== 'active') {
      throw new Error('Game is not active')
    }
    
    this.status = 'completed'
    this.analytics.endTime = new Date()
    this.updatedAt = new Date()
  }

  // Update player score
  updatePlayerScore(playerId, score) {
    const player = this.players.find(p => p.id === playerId)
    if (player) {
      player.score = score
      this.analytics.scores[playerId] = score
      this.updatedAt = new Date()
    }
  }

  // Add interaction to analytics
  addInteraction(playerId, action, data = {}) {
    this.analytics.interactions.push({
      playerId,
      action,
      data,
      timestamp: new Date()
    })
  }

  // Get game duration in minutes
  getDuration() {
    if (!this.analytics.startTime) return 0
    
    const endTime = this.analytics.endTime || new Date()
    return Math.round((endTime - this.analytics.startTime) / (1000 * 60))
  }

  // Get session statistics
  getStats() {
    return {
      id: this.id,
      gameId: this.gameId,
      duration: this.getDuration(),
      playerCount: this.players.length,
      totalInteractions: this.analytics.interactions.length,
      averageScore: this.getAverageScore(),
      status: this.status
    }
  }

  // Calculate average score
  getAverageScore() {
    if (this.players.length === 0) return 0
    
    const totalScore = this.players.reduce((sum, player) => sum + (player.score || 0), 0)
    return Math.round((totalScore / this.players.length) * 10) / 10
  }

  // Validation
  validate() {
    const errors = []
    
    if (!this.gameId) {
      errors.push('Game ID is required')
    }
    
    if (!this.hostId) {
      errors.push('Host ID is required')
    }
    
    if (!this.title || this.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long')
    }
    
    return errors
  }

  // Convert to API response format
  toJSON() {
    return {
      id: this.id,
      gameId: this.gameId,
      hostId: this.hostId,
      title: this.title,
      status: this.status,
      players: this.players,
      maxPlayers: this.maxPlayers,
      settings: this.settings,
      stats: this.getStats(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}
