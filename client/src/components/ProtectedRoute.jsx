import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

// Simple auth guard: redirects unauthenticated users into the funnel
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/game-intent" state={{ from: location.pathname, requireAuth: true }} replace />
  }
  return children
}

export default ProtectedRoute
