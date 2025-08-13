import { create } from 'zustand'
import { subscribeToPresence, updatePresence, signUpUser, signInUser, signOutUser } from '../services/firebaseAuth'

export const useAuthStore = create((set, get) => ({
  // Auth state
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // Set user from Firebase Auth
  setUser: (user) => {
    set({ 
      user, 
      isAuthenticated: !!user, 
      loading: false,
      error: null 
    })
    
    // Update presence when user signs in
    if (user) {
      updatePresence(user.uid, true)
    }
  },

  // Set loading state
  setLoading: (loading) => set({ loading }),

  // Set error state
  setError: (error) => set({ error, loading: false }),

  // Clear error
  clearError: () => set({ error: null }),

  // Sign up method
  signup: async (userData) => {
    set({ loading: true, error: null })
    try {
      console.log('🔥 Store signup called with:', userData)
      const result = await signUpUser(
        userData.email, 
        userData.password, 
        userData.name, 
        userData.role || 'employee'
      )
      
      if (result.success) {
        get().setUser(result.user)
        return result
      } else {
        set({ error: result.error, loading: false })
        return result
      }
    } catch (error) {
      console.error('❌ Store signup error:', error)
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  // Login method
  login: async (userData) => {
    set({ loading: true, error: null })
    try {
      const result = await signInUser(userData.email, userData.password)
      
      if (result.success) {
        get().setUser(result.user)
        return result
      } else {
        set({ error: result.error, loading: false })
        return result
      }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  // Logout method
  logout: async () => {
    set({ loading: true })
    try {
      await signOutUser()
      get().signOut()
    } catch (error) {
      console.error('Logout error:', error)
      set({ loading: false })
    }
  },

  // Sign out
  signOut: async () => {
    const { user } = get()
    if (user) {
      await updatePresence(user.uid, false)
    }
    set({ 
      user: null, 
      isAuthenticated: false, 
      loading: false,
      error: null 
    })
  },

  // Initialize auth listener (called from App.jsx)
  initializeAuth: (authUser) => {
    if (authUser) {
      get().setUser(authUser)
    } else {
      set({ 
        user: null, 
        isAuthenticated: false, 
        loading: false 
      })
    }
  }
}))
