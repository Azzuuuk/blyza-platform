/**
 * Firebase service initialization and utilities
 */

import dotenv from 'dotenv'
dotenv.config()

// For development, we'll use a simplified approach
// In production, you'd use a service account key

let db = null
let auth = null

export const initializeFirebase = () => {
  try {
    console.log('🔥 Firebase service initialized (mock mode)')
    console.log('📊 Project ID:', process.env.FIREBASE_PROJECT_ID)
    
    // For now, we'll create mock services that can be replaced with real ones
    db = {
      collection: (name) => ({
        add: async (data) => {
          console.log(`📝 Mock: Adding to ${name}:`, JSON.stringify(data, null, 2))
          return { id: `mock_${Date.now()}` }
        },
        doc: (id) => ({
          get: async () => ({
            exists: true,
            data: () => ({ id, mockData: true, timestamp: new Date() })
          }),
          set: async (data) => {
            console.log(`📝 Mock: Setting ${name}/${id}:`, JSON.stringify(data, null, 2))
            return { success: true }
          }
        }),
        where: () => ({
          get: async () => ({
            docs: [
              { id: 'mock1', data: () => ({ mockData: true, timestamp: new Date() }) }
            ]
          })
        })
      })
    }
    
    auth = {
      verifyIdToken: async (token) => {
        console.log('🔐 Mock: Verifying token:', token.substring(0, 10) + '...')
        return { uid: 'mock_user', email: 'test@example.com' }
      }
    }
    
    return { db, auth }
    
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message)
    throw error
  }
}

export const getFirestore = () => {
  if (!db) {
    initializeFirebase()
  }
  return db
}

export const getAuth = () => {
  if (!auth) {
    initializeFirebase()
  }
  return auth
}

export const getStorage = () => {
  // TODO: Return Storage instance
  // return admin.storage();
  return null
}
