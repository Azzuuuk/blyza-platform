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
  token: null,
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
  setUser: (user) => set({ user, isAuthenticated: !!user, error: null }),
  setToken: (token) => set({ token }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      updatePreferences: (newPrefs) => set(state => ({
        preferences: { ...state.preferences, ...newPrefs }
      })),
      
      // Login action
      login: async (credentials) => {
        set({ loading: true, error: null })
        try {
          const base = import.meta.env.VITE_API_BASE || 'http://localhost:3001'
          const response = await fetch(`${base}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          })
          
          if (!response.ok) {
            const txt = await response.text()
            throw new Error(`Login failed: ${txt}`)
          }

          const data = await response.json()
          set({ user: data.user, token: data.token, isAuthenticated: true, loading: false })
          // Background upsert to MVP user table (non-blocking)
          try {
            const { MvpAPI } = await import('../api/index.js')
            await MvpAPI.upsertUser(data.user.email, data.user.name || 'Manager')
          } catch(_e){}
          
          return data
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false,
            isAuthenticated: false 
          })
          throw error
        }
      },

      signup: async (payload) => {
        set({ loading: true, error: null })
        try {
          const base = import.meta.env.VITE_API_BASE || 'http://localhost:3001'
            const response = await fetch(`${base}/api/auth/signup`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })
            if(!response.ok){
              const txt = await response.text()
              throw new Error(`Signup failed: ${txt}`)
            }
            const data = await response.json()
            set({ user: data.user, token: data.token, isAuthenticated: true, loading:false })
            try {
              const { MvpAPI } = await import('../api/index.js')
              await MvpAPI.upsertUser(data.user.email, data.user.name || 'Manager')
            } catch(_e){}
            return data
        } catch (e){
          set({ error: e.message, loading:false, isAuthenticated:false })
          throw e
        }
      },
      
      // Logout action
  logout: () => set({ user: null, token: null, isAuthenticated: false, error: null }),
      
      // Clear error
      clearError: () => set({ error: null }),
      
      // Getters
      getUserRole: () => get().user?.role || 'guest',
      isManager: () => get().user?.role === 'manager',
      isAdmin: () => get().user?.role === 'admin'
    }),
    {
      name: 'blyza-auth', // localStorage key
  partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated, preferences: state.preferences })
    }
  )
)
