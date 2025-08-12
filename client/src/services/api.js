import axios from 'axios'

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'http://localhost:3002/api', // Updated to use backend server URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/'
    }
    
    return Promise.reject(error.response?.data || error.message)
  }
)

export const api = {
  // Game APIs
  async getGames(filters = {}) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    
    return apiClient.get(`/games?${params.toString()}`)
  },

  async getGame(gameId) {
    return apiClient.get(`/games/${gameId}`)
  },

  async getGameCategories() {
    return apiClient.get('/games/meta/categories')
  },

  async getPopularGames() {
    return apiClient.get('/games/meta/popular')
  },

  async customizeGame(gameId, customization) {
    return apiClient.post(`/games/${gameId}/customize`, customization)
  },

  // Lobby APIs
  async createLobby(gameId, settings = {}) {
    return apiClient.post('/lobby/create', { gameId, settings })
  },

  async joinLobby(roomCode, playerName, playerId = null) {
    return apiClient.post('/lobby/join', { roomCode, playerName, playerId })
  },

  async getLobby(lobbyId) {
    return apiClient.get(`/lobby/${lobbyId}`)
  },

  async startGame(lobbyId) {
    return apiClient.post(`/lobby/${lobbyId}/start`)
  },

  async leaveLobby(lobbyId, playerId) {
    return apiClient.delete(`/lobby/${lobbyId}/leave`, { data: { playerId } })
  },

  // Analytics APIs
  async trackEvent(sessionId, playerId, eventType, eventData = {}) {
    return apiClient.post('/analytics/track', {
      sessionId,
      playerId,
      eventType,
      eventData,
      timestamp: new Date().toISOString()
    })
  },

  async getSessionAnalytics(sessionId) {
    return apiClient.get(`/analytics/session/${sessionId}`)
  },

  async getSessionSummary(sessionId) {
    return apiClient.post(`/analytics/session/${sessionId}/summary`)
  },

  // Reports APIs
  async generateReport(sessionId, gameId, managerEvaluation = {}, companyInfo = {}, emailSettings = {}) {
    return apiClient.post('/reports/generate', {
      sessionId,
      gameId,
      managerEvaluation,
      companyInfo,
      emailSettings
    }, {
      responseType: 'blob' // For PDF download
    })
  },

  async previewReport(sessionId, gameId, managerEvaluation = {}) {
    return apiClient.post('/reports/preview', {
      sessionId,
      gameId,
      managerEvaluation
    })
  },

  async getReportTemplates() {
    return apiClient.get('/reports/templates')
  },

  async getReportHistory() {
    return apiClient.get('/reports/history')
  },

  // Rewards APIs
  async getRewards(filters = {}) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    
    return apiClient.get(`/rewards?${params.toString()}`)
  },

  async getRewardCategories() {
    return apiClient.get('/rewards/categories')
  },

  async getPointsBalance() {
    return apiClient.get('/rewards/balance')
  },

  async redeemReward(itemId) {
    return apiClient.post('/rewards/redeem', { itemId })
  },

  async addPoints(points, reason, sessionId = null) {
    return apiClient.post('/rewards/points/add', { points, reason, sessionId })
  },

  async getRedemptionHistory() {
    return apiClient.get('/rewards/history')
  },

  // Auth APIs
  async login(firebaseToken) {
    const response = await apiClient.post('/auth/login', { firebaseToken })
    if (response.success) {
      localStorage.setItem('authToken', 'demo-token') // In production, use real token
    }
    return response
  },

  async verify() {
    return apiClient.post('/auth/verify')
  },

  async logout() {
    const response = await apiClient.post('/auth/logout')
    localStorage.removeItem('authToken')
    return response
  },

  // Health check
  async healthCheck() {
    return apiClient.get('/health')
  }
}

export default apiClient
