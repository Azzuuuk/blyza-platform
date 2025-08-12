/**
 * Game Model - Defines the structure for game data
 */
export class Game {
  constructor(data) {
    this.id = data.id || this.generateId()
    this.title = data.title
    this.description = data.description
    this.category = data.category
    this.duration = data.duration // in minutes
    this.teamSize = data.teamSize || { min: 2, max: 8 }
    this.difficulty = data.difficulty || 'medium'
    this.objectives = data.objectives || []
    this.materials = data.materials || []
    this.instructions = data.instructions || []
    this.rating = data.rating || 0
    this.playCount = data.playCount || 0
    this.tags = data.tags || []
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  generateId() {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Validation
  validate() {
    const errors = []
    
    if (!this.title || this.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long')
    }
    
    if (!this.description || this.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long')
    }
    
    if (!this.category) {
      errors.push('Category is required')
    }
    
    if (!this.duration || this.duration < 5 || this.duration > 120) {
      errors.push('Duration must be between 5 and 120 minutes')
    }
    
    return errors
  }

  // Update rating based on new feedback
  updateRating(newRating) {
    this.rating = ((this.rating * this.playCount) + newRating) / (this.playCount + 1)
    this.playCount += 1
    this.updatedAt = new Date()
  }

  // Convert to API response format
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      category: this.category,
      duration: this.duration,
      teamSize: this.teamSize,
      difficulty: this.difficulty,
      objectives: this.objectives,
      materials: this.materials,
      instructions: this.instructions,
      rating: Math.round(this.rating * 10) / 10, // Round to 1 decimal
      playCount: this.playCount,
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}
