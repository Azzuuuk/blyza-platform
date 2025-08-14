import React, { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Users,
  Globe,
  Monitor,
  Play,
  Sparkles,
  Loader2
} from 'lucide-react'
import { joinGameSession } from '../services/firebaseMultiplayer'
import { useAuthStore } from '../stores/useAuthStore'
import toast from 'react-hot-toast'

const JoinGame = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [roomCode, setRoomCode] = useState('')
  const params = useParams()
  const [search] = useSearchParams()
  const [isJoining, setIsJoining] = useState(false)

  const handleJoinGame = async (e) => {
    e.preventDefault()

    if (!roomCode.trim()) {
      toast.error('Please enter a room code')
      return
    }

    if (!user) {
      toast.error('Please sign in to join a game')
      navigate('/login')
      return
    }

    setIsJoining(true)

    try {
      console.log('🔥 Attempting to join session:', roomCode.trim().toUpperCase())
      console.log('🔥 Player user:', user)
      
      const result = await joinGameSession(roomCode.trim().toUpperCase(), user)
      console.log('🔥 Join result:', result)

      if (result.success) {
        toast.success('Joined lobby successfully!')
        navigate(`/lobby/${result.sessionId}`)
      } else {
        toast.error(result.error || 'Failed to join game. Please check the room code.')
      }
    } catch (error) {
      console.error('❌ Join error:', error)
      toast.error('Failed to join game. Please check the room code.')
    } finally {
      setIsJoining(false)
    }
  }

  // Pre-fill code from URL
  React.useEffect(() => {
    const fromPath = params.roomCode
    const fromQuery = search.get('code')
    const code = (fromPath || fromQuery || '').toString().toUpperCase()
    if (code && !roomCode) setRoomCode(code)
  }, [params.roomCode, search])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#e2e8f0'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  color: '#cbd5e1',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft style={{ width: 20, height: 20 }} />
                <span>Back</span>
              </button>

              <div style={{ width: 1, height: 24, background: '#475569' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles style={{ width: 20, height: 20, color: 'white' }} />
                </div>
                <span style={{
                  fontSize: 18,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}>Join Game</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '64px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(51, 65, 85, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(51, 65, 85, 0.2)',
            borderRadius: '24px',
            padding: '48px',
            textAlign: 'center',
            marginBottom: '48px'
          }}
        >
          <div style={{
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Users style={{ width: 40, height: 40, color: 'white' }} />
          </div>

          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'white', marginBottom: 12 }}>
            Join a Team Game
          </h1>

          <p style={{ fontSize: 18, color: '#94a3b8' }}>
            Enter the room code shared by your team leader to join the game session.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(51, 65, 85, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(51, 65, 85, 0.2)',
            borderRadius: '16px',
            padding: '32px'
          }}
        >
          <form onSubmit={handleJoinGame}>
            <div style={{ marginBottom: 24 }}>
              <label htmlFor="roomCode" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>Room Code</label>
              <input
                id="roomCode"
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-letter room code"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(51, 65, 85, 0.3)',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '24px',
                  fontFamily: 'monospace',
                  letterSpacing: '0.1em',
                  textAlign: 'center',
                  textTransform: 'uppercase'
                }}
                maxLength={6}
                disabled={isJoining}
              />
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>Ask your team leader for the room code</p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: '#22c55e', margin: 0, padding: '12px 16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px' }}>
                Joining as: <strong>{user?.name || 'Player'}</strong> ({user?.role || 'employee'})
              </p>
            </div>

            <button
              type="submit"
              disabled={!roomCode.trim() || isJoining}
              style={{
                width: '100%',
                background: !roomCode.trim() || isJoining 
                  ? 'rgba(71, 85, 105, 0.5)' 
                  : 'linear-gradient(135deg, #7c3aed, #2563eb)',
                color: 'white',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '600',
                border: 'none',
                cursor: !roomCode.trim() || isJoining ? 'not-allowed' : 'pointer',
                opacity: !roomCode.trim() || isJoining ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {isJoining ? (
                <>
                  <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} />
                  <span>Joining Game...</span>
                </>
              ) : (
                <>
                  <Play style={{ width: 20, height: 20 }} />
                  <span>Join Game</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Game Modes Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            marginTop: 48,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24
          }}
        >
          <div style={{
            background: 'rgba(51, 65, 85, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(51, 65, 85, 0.2)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, background: 'rgba(59, 130, 246, 0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe style={{ width: 20, height: 20, color: '#60a5fa' }} />
              </div>
              <h3 style={{ fontWeight: 600, color: 'white' }}>Online Multiplayer</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 14 }}>
              Join players from anywhere with real-time collaboration and live updates.
            </p>
          </div>

          <div style={{
            background: 'rgba(51, 65, 85, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(51, 65, 85, 0.2)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, background: 'rgba(34, 197, 94, 0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Monitor style={{ width: 20, height: 20, color: '#34d399' }} />
              </div>
              <h3 style={{ fontWeight: 600, color: 'white' }}>Local Play</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 14 }}>
              Play together on the same device or screen for in-person team building.
            </p>
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ marginTop: 48, textAlign: 'center' }}
        >
          <div style={{
            background: 'rgba(51, 65, 85, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ fontWeight: 600, color: '#60a5fa', marginBottom: 8 }}>Need Help?</h3>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>
              Having trouble joining? Make sure you have the correct room code from your team leader.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/games')}
                style={{
                  background: 'rgba(51, 65, 85, 0.5)',
                  color: '#cbd5e1',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  cursor: 'pointer'
                }}
              >
                Browse Games
              </button>
              <button
                onClick={() => navigate('/')}
                style={{
                  background: 'rgba(51, 65, 85, 0.5)',
                  color: '#cbd5e1',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  cursor: 'pointer'
                }}
              >
                Back to Home
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Local page styles */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

export default JoinGame
