import React, { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

const GameplayPage = () => {
  const { user } = useAuthStore()
  const { sessionId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!sessionId) return
    
    // Redirect to the new Nightfall v2 system
    const isSpectator = searchParams.get('spectator') === '1'
    const newPath = isSpectator 
      ? `/nightfall/play/${sessionId}?spectator=1`
      : `/nightfall/play/${sessionId}`
    
    navigate(newPath, { replace: true })
  }, [sessionId, searchParams, navigate])

  // Show loading while redirecting
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: 8 }}>Redirecting to Nightfall v2...</div>
        <div style={{ color: '#94a3b8' }}>Please wait...</div>
      </div>
    </div>
  )
}

export default GameplayPage
