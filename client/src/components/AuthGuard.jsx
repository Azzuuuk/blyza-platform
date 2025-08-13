import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore.js'
import AuthPanel from './AuthPanel.jsx'
import { motion } from 'framer-motion'
import { Lock, Users, Sparkles } from 'lucide-react'

const AuthGuard = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    )
  }

  // If authenticated, render children
  if (isAuthenticated && user) {
    return children
  }

  // If not authenticated, show auth wall
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Sign in to Continue
          </h1>
          <p className="text-slate-300 mb-6">
            Authentication is required to access team building games and track your progress
          </p>
          
          {/* Demo Notice */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-blue-300 font-semibold text-sm mb-2">🚀 Demo Access</h3>
            <div className="text-blue-200 text-xs space-y-1">
              <div><strong>Manager:</strong> manager@blyza.com / password123</div>
              <div><strong>Player:</strong> player@blyza.com / password123</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-sm text-slate-400 mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Team Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Earn Points</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AuthPanel />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default AuthGuard
