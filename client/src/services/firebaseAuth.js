/**
 * Firebase Authentication Service
 * Handles user authentication and role management
 */

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore'
import { 
  ref, 
  set, 
  onValue,
  serverTimestamp
} from 'firebase/database'
import { auth, db, rtdb } from '../lib/firebase'

/**
 * Sign up a new user with email/password and set their role
 */
export const signUpUser = async (email, password, name, role = 'employee') => {
  try {
    console.log('🔥 Starting signup process:', { email, name, role })
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    console.log('✅ User created in Auth:', user.uid)

    // Update user profile with display name
    await updateProfile(user, { displayName: name })
    console.log('✅ Profile updated')

    // Store user data in Firestore with role
    const userData = {
      uid: user.uid,
      email: user.email,
      name: name,
      role: role, // 'employee' or 'manager'
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
    
    console.log('🔥 Saving to Firestore:', userData)
    await setDoc(doc(db, 'users', user.uid), userData)
    console.log('✅ User data saved to Firestore')

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: name,
        role: role
      }
    }
  } catch (error) {
    console.error('❌ Sign up error:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Sign in existing user
 */
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found')
    }

    const userData = userDoc.data()

    // Update last login
    await updateDoc(doc(db, 'users', user.uid), {
      lastLogin: new Date().toISOString()
    })

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: userData.name || user.displayName,
        role: userData.role || 'employee'
      }
    }
  } catch (error) {
    console.error('Sign in error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Sign out current user
 */
export const signOutUser = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get current user with role data
 */
export const getCurrentUser = async (user) => {
  if (!user) return null

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    
    if (!userDoc.exists()) {
      return {
        uid: user.uid,
        email: user.email,
        name: user.displayName || 'User',
        role: 'employee'
      }
    }

    const userData = userDoc.data()
    return {
      uid: user.uid,
      email: user.email,
      name: userData.name || user.displayName,
      role: userData.role || 'employee'
    }
  } catch (error) {
    console.error('Error getting user data:', error)
    return {
      uid: user.uid,
      email: user.email,
      name: user.displayName || 'User',
      role: 'employee'
    }
  }
}

/**
 * Update user presence status in Firebase RTDB
 */
export const updatePresence = async (userId, isOnline) => {
  try {
    const presenceRef = ref(rtdb, `presence/${userId}`)
    await set(presenceRef, {
      isOnline,
      lastSeen: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating presence:', error)
  }
}

/**
 * Subscribe to user presence changes
 */
export const subscribeToPresence = (userId, callback) => {
  try {
    const presenceRef = ref(rtdb, `presence/${userId}`)
    return onValue(presenceRef, (snapshot) => {
      const data = snapshot.val()
      callback(data)
    })
  } catch (error) {
    console.error('Error subscribing to presence:', error)
    return () => {} // Return empty unsubscribe function
  }
}

/**
 * Set up authentication state listener
 */
export const setupAuthListener = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userData = await getCurrentUser(user)
      callback(userData)
    } else {
      callback(null)
    }
  })
}
