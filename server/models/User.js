/**
 * User Model - Defines the structure for user data
 */
export class User {
  constructor(data) {
    this.id = data.id || this.generateId()
    this.email = data.email
    this.name = data.name
    this.role = data.role || 'player' // player, manager, admin
    this.company = data.company || null
    this.department = data.department || null
    this.avatar = data.avatar || null
    this.preferences = data.preferences || {
      notifications: true,
      theme: 'light',
      language: 'en'
    }
    this.stats = data.stats || {
      gamesPlayed: 0,
      totalScore: 0,
      favoriteCategories: [],
      achievements: []
    }
    this.createdAt = data.createdAt || new Date()
    this.lastLoginAt = data.lastLoginAt || null
    this.isActive = data.isActive !== undefined ? data.isActive : true
  }

  generateId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Validation
  validate() {
    const errors = []
    
    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('Valid email is required')
    }
    
    if (!this.name || this.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long')
    }
    
    if (!['player', 'manager', 'admin'].includes(this.role)) {
      errors.push('Invalid role')
    }
    
    return errors
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Update user stats after game
  updateGameStats(gameResult) {
    this.stats.gamesPlayed += 1
    this.stats.totalScore += gameResult.score || 0
    
    // Track favorite categories
    const category = gameResult.category
    if (category) {
      const categoryIndex = this.stats.favoriteCategories.findIndex(c => c.name === category)
      if (categoryIndex >= 0) {
        this.stats.favoriteCategories[categoryIndex].count += 1
      } else {
        this.stats.favoriteCategories.push({ name: category, count: 1 })
      }
    }
  }

  // Check if user has permission
  hasPermission(permission) {
    const permissions = {
      player: ['play_games', 'view_own_stats'],
      manager: ['play_games', 'view_own_stats', 'view_team_analytics', 'create_sessions'],
      admin: ['*'] // All permissions
    }
    
    const userPermissions = permissions[this.role] || []
    return userPermissions.includes('*') || userPermissions.includes(permission)
  }

  // Get user's average score
  getAverageScore() {
    return this.stats.gamesPlayed > 0 ? this.stats.totalScore / this.stats.gamesPlayed : 0
  }

  // Convert to API response format (remove sensitive data)
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      company: this.company,
      department: this.department,
      avatar: this.avatar,
      preferences: this.preferences,
      stats: {
        ...this.stats,
        averageScore: this.getAverageScore()
      },
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt,
      isActive: this.isActive
    }
  }

  // Safe version for public display
  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      avatar: this.avatar,
      stats: {
        gamesPlayed: this.stats.gamesPlayed,
        averageScore: this.getAverageScore()
      }
    }
  }
}
