/**
 * Database Helper - Mock database operations for development
 * In production, this would be replaced with actual database connections
 */

// In-memory storage for demo purposes
const storage = {
  users: new Map(),
  games: new Map(),
  sessions: new Map(),
  analytics: new Map()
}

export class DatabaseHelper {
  // User operations
  static async createUser(userData) {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const user = { id, ...userData, createdAt: new Date() }
    storage.users.set(id, user)
    return user
  }

  static async getUserById(id) {
    return storage.users.get(id) || null
  }

  static async getUserByEmail(email) {
    for (const user of storage.users.values()) {
      if (user.email === email) return user
    }
    return null
  }

  static async updateUser(id, updates) {
    const user = storage.users.get(id)
    if (!user) return null
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() }
    storage.users.set(id, updatedUser)
    return updatedUser
  }

  static async deleteUser(id) {
    return storage.users.delete(id)
  }

  // Game operations
  static async createGame(gameData) {
    const id = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const game = { id, ...gameData, createdAt: new Date() }
    storage.games.set(id, game)
    return game
  }

  static async getGameById(id) {
    return storage.games.get(id) || null
  }

  static async getAllGames(filters = {}) {
    let games = Array.from(storage.games.values())
    
    // Apply filters
    if (filters.category) {
      games = games.filter(game => game.category === filters.category)
    }
    
    if (filters.difficulty) {
      games = games.filter(game => game.difficulty === filters.difficulty)
    }
    
    return games
  }

  static async updateGame(id, updates) {
    const game = storage.games.get(id)
    if (!game) return null
    
    const updatedGame = { ...game, ...updates, updatedAt: new Date() }
    storage.games.set(id, updatedGame)
    return updatedGame
  }

  // Session operations
  static async createSession(sessionData) {
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const session = { id, ...sessionData, createdAt: new Date() }
    storage.sessions.set(id, session)
    return session
  }

  static async getSessionById(id) {
    return storage.sessions.get(id) || null
  }

  static async updateSession(id, updates) {
    const session = storage.sessions.get(id)
    if (!session) return null
    
    const updatedSession = { ...session, ...updates, updatedAt: new Date() }
    storage.sessions.set(id, updatedSession)
    return updatedSession
  }

  static async getActiveSessions() {
    return Array.from(storage.sessions.values()).filter(
      session => ['lobby', 'active'].includes(session.status)
    )
  }

  // Analytics operations
  static async saveAnalytics(sessionId, analyticsData) {
    const existing = storage.analytics.get(sessionId) || []
    existing.push({ ...analyticsData, timestamp: new Date() })
    storage.analytics.set(sessionId, existing)
    return true
  }

  static async getAnalytics(sessionId) {
    return storage.analytics.get(sessionId) || []
  }

  // Utility operations
  static async clearAllData() {
    storage.users.clear()
    storage.games.clear()
    storage.sessions.clear()
    storage.analytics.clear()
  }

  static getStorageStats() {
    return {
      users: storage.users.size,
      games: storage.games.size,
      sessions: storage.sessions.size,
      analytics: storage.analytics.size
    }
  }
}

// Initialize with some demo data
export const initializeDemoData = async () => {
  // This would be called on server startup
  console.log('Database helper initialized with demo data')
}
