import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

/**
 * PostGameRouter - Routes users to appropriate post-game experience
 * - Managers: Get directed to manager feedback form
 * - Regular players: Get directed to results page with points/rewards
 */
const PostGameRouter = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuthStore()
  const gameData = location.state?.gameData || {}

  useEffect(() => {
    // If user is not authenticated, redirect to regular results
    if (!isAuthenticated) {
      navigate('/results', { 
        state: { gameData, skipFeedback: true },
        replace: true 
      })
      return
    }

    // Check user role and redirect accordingly
    const userRole = user?.role || 'player'
    
    if (userRole === 'manager' || userRole === 'admin') {
      // Managers and admins get the feedback form
      navigate('/manager-feedback', { 
        state: { 
          gameData, 
          gameTitle: gameData.gameTitle || 'Team Building Session',
          teamAspect: gameData.teamAspect || 'collaboration'
        },
        replace: true
      })
    } else {
      // Regular players get results with points/rewards
      navigate('/results', { 
        state: { gameData, showRewards: true },
        replace: true
      })
    }
  }, [navigate, location.state, user, isAuthenticated])

  // Show loading screen while redirecting
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#e2e8f0'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '48px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          border: '4px solid rgba(124, 58, 237, 0.2)',
          borderTop: '4px solid #7c3aed',
          borderRadius: '50%',
          margin: '0 auto 24px',
          animation: 'spin 1s linear infinite'
        }} />
        
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '8px'
        }}>
          Processing Results...
        </h2>
        
        <p style={{
          color: '#94a3b8',
          fontSize: '16px'
        }}>
          Redirecting to your personalized experience
        </p>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default PostGameRouter
