import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Auth Store - Manages user authentication state
 * Persists user data across browser sessions
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // User state
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      
      // User preferences
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en'
      },
      
      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        error: null 
      }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      updatePreferences: (newPrefs) => set(state => ({
        preferences: { ...state.preferences, ...newPrefs }
      })),
      
      // Login action
      login: async (credentials) => {
        set({ loading: true, error: null })
        try {
          // This would call your actual auth API
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          })
          
          if (!response.ok) throw new Error('Login failed')
          
          const userData = await response.json()
          set({ 
            user: userData.user, 
            isAuthenticated: true,
            loading: false 
          })
          
          return userData
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false,
            isAuthenticated: false 
          })
          throw error
        }
      },
      
      // Logout action
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        error: null 
      }),
      
      // Clear error
      clearError: () => set({ error: null }),
      
      // Getters
      getUserRole: () => get().user?.role || 'guest',
      isManager: () => get().user?.role === 'manager',
      isAdmin: () => get().user?.role === 'admin'
    }),
    {
      name: 'blyza-auth', // localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        preferences: state.preferences
      })
    }
  )
)
