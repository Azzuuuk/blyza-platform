/**
 * Response Helper - Standardizes API responses
 */
export class ResponseHelper {
  static success(data, message = 'Success', meta = {}) {
    return {
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    }
  }

  static error(message = 'An error occurred', statusCode = 500, errors = []) {
    return {
      success: false,
      message,
      statusCode,
      errors,
      meta: {
        timestamp: new Date().toISOString()
      }
    }
  }

  static paginated(data, pagination) {
    return this.success(data, 'Data retrieved successfully', {
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        total: pagination.total || 0,
        totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 10))
      }
    })
  }
}

/**
 * Validation Helper - Common validation functions
 */
export class ValidationHelper {
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static isValidPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  }

  static sanitizeString(str) {
    if (typeof str !== 'string') return str
    return str.trim().replace(/[<>]/g, '')
  }

  static validateRequired(fields, data) {
    const missing = []
    
    for (const field of fields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missing.push(field)
      }
    }
    
    return missing
  }

  static validateRange(value, min, max, fieldName) {
    const num = Number(value)
    if (isNaN(num)) return `${fieldName} must be a number`
    if (num < min || num > max) return `${fieldName} must be between ${min} and ${max}`
    return null
  }
}

/**
 * Logger Helper - Consistent logging across the app
 */
export class Logger {
  static info(message, data = {}) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data)
  }

  static error(message, error = {}) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error)
  }

  static warn(message, data = {}) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data)
  }

  static debug(message, data = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data)
    }
  }
}

/**
 * ID Generator - Creates unique IDs for various entities
 */
export class IDGenerator {
  static generateGameId() {
    return `game_${this.timestamp()}_${this.randomString(6)}`
  }

  static generateUserId() {
    return `user_${this.timestamp()}_${this.randomString(6)}`
  }

  static generateSessionId() {
    return `session_${this.timestamp()}_${this.randomString(8)}`
  }

  static generateJoinCode() {
    // 6-digit uppercase code for easy sharing
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  static timestamp() {
    return Date.now().toString(36)
  }

  static randomString(length) {
    return Math.random().toString(36).substr(2, length)
  }
}

/**
 * Date Helper - Date formatting and manipulation
 */
export class DateHelper {
  static formatForAPI(date) {
    return new Date(date).toISOString()
  }

  static formatForDisplay(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  static isRecent(date, hoursAgo = 24) {
    const now = new Date()
    const targetDate = new Date(date)
    const diffHours = (now - targetDate) / (1000 * 60 * 60)
    return diffHours <= hoursAgo
  }

  static addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000)
  }
}

/**
 * Cache Helper - Simple in-memory caching
 */
export class CacheHelper {
  static cache = new Map()

  static set(key, value, ttlSeconds = 300) { // 5 minutes default
    const expiresAt = Date.now() + (ttlSeconds * 1000)
    this.cache.set(key, { value, expiresAt })
  }

  static get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  static delete(key) {
    this.cache.delete(key)
  }

  static clear() {
    this.cache.clear()
  }

  static cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key)
      }
    }
  }
}

// Cleanup expired cache items every 10 minutes
setInterval(() => {
  CacheHelper.cleanup()
}, 10 * 60 * 1000)
