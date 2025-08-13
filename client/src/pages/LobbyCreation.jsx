import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Users, 
  Share2, 
  Copy, 
  CheckCircle, 
  ExternalLink,
  Eye,
  UserPlus,
  Monitor,
  Clock,
  Play,
  Loader2
} from 'lucide-react'
import { useAuthStore } from '../stores/useAuthStore'
import { 
  createGameSession, 
  subscribeToGameSession, 
  subscribeToPlayers,
  startGameSession
} from '../services/firebaseMultiplayer'
import toast from 'react-hot-toast'

const LobbyCreation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { gameId } = location.state || { gameId: 'code-breakers' }
  const { user, isAuthenticated } = useAuthStore()

  // Manager lobby state
  const [lobby, setLobby] = useState(null)
  const [players, setPlayers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState([])

  // Redirect if not authenticated or not a manager
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    if (user?.role !== 'manager') {
      toast.error('Only managers can create game sessions')
      navigate('/')
      return
    }
  }, [isAuthenticated, user, navigate])

  // Game info
  const gameInfo = {
    'code-breakers': {
      title: 'Code Breakers',
      description: 'Team collaboration and problem-solving through encrypted challenges',
      color: '#7c3aed',
      minPlayers: 2,
      maxPlayers: 8
    },
    'operation-nightfall': {
      title: 'Operation Nightfall',
      description: 'High-stakes mission requiring strategic coordination',
      color: '#dc2626',
      minPlayers: 3,
      maxPlayers: 6
    }
  }

  const currentGame = gameInfo[gameId] || gameInfo['code-breakers']

  // Create manager lobby on mount
  useEffect(() => {
    createManagerLobby()
  }, [])

  const createManagerLobby = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Create Firebase game session
      const result = await createGameSession(gameId, user, currentGame.maxPlayers)
      
      if (result.success) {
        const { session } = result
        setLobby(session)
        setSessionId(session.id)
        
        // Subscribe to session updates
        const unsubscribeSession = subscribeToGameSession(session.id, (update) => {
          if (update.success) {
            setLobby(update.session)
          } else {
            setError(update.error)
          }
        })
        
        // Subscribe to player updates
        const unsubscribePlayers = subscribeToPlayers(session.id, (update) => {
          if (update.success) {
            setPlayers(update.players)
          }
        })
        
        setUnsubscribeFunctions([unsubscribeSession, unsubscribePlayers])
        
        toast.success('Lobby created successfully!')
      } else {
        throw new Error(result.error)
      }
      
    } catch (error) {
      console.error('Error creating lobby:', error)
      
      let errorMessage = 'Failed to create lobby. Please try again.'
      
      if (error.message.includes('rate limit') || error.message.includes('Too many')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.'
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe()
        }
      })
    }
  }, [unsubscribeFunctions])

  // Start game function
  const handleStartGame = async () => {
    if (!sessionId || !user) return
    
    try {
      setLoading(true)
      const result = await startGameSession(sessionId, user.uid)
      
      if (result.success) {
        toast.success('Game started!')
        navigate(`/games/${gameId}/play`, { 
          state: { 
            sessionId, 
            role: 'manager',
            isObserver: true 
          } 
        })
      } else {
        setError(result.error)
        toast.error(result.error)
      }
    } catch (error) {
      setError(error.message)
      toast.error('Failed to start game')
    } finally {
      setLoading(false)
    }
  }

  // Copy room code for sharing with employees
  const copyRoomCode = async () => {
    if (lobby?.roomCode) {
      try {
        await navigator.clipboard.writeText(lobby.roomCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  // Copy join link for sharing
  const copyJoinLink = async () => {
    const joinLink = `${window.location.origin}/join?code=${lobby?.roomCode}`
    try {
      await navigator.clipboard.writeText(joinLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Start game session (when enough employees have joined)
  const startGameSession_old = async () => {
    const playerCount = Object.keys(players).length
    if (playerCount < currentGame.minPlayers) {
      toast.error(`Need at least ${currentGame.minPlayers} employees to start the session`)
      return
    }

    try {
      setLoading(true)
      const result = await startGameSession(sessionId, user.uid)
      
      if (result.success) {
        toast.success('Game started!')
        navigate(`/games/${gameId}/play`, { 
          state: { 
            sessionId, 
            role: 'manager',
            isObserver: true 
          } 
        })
      } else {
        setError(result.error)
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Error starting game:', error)
      toast.error('Failed to start game')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center' }}
        >
          <Clock style={{ width: 48, height: 48, marginBottom: 16 }} />
          <div>Setting up manager session...</div>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 16, color: '#ef4444' }}>{error}</div>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

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
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
        position: 'sticky',
        top: 0,
        zIndex: 50
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
                  background: `linear-gradient(135deg, ${currentGame.color}, #2563eb)`,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Monitor style={{ width: 20, height: 20, color: 'white' }} />
                </div>
                <span style={{
                  fontSize: 18,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}>Manager Session</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Manager Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(168, 85, 247, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '32px',
            textAlign: 'center'
          }}
        >
          <Monitor style={{ width: 48, height: 48, color: '#a855f7', marginBottom: 16, marginLeft: 'auto', marginRight: 'auto' }} />
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '12px'
          }}>
            Manager Observation Session
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#cbd5e1',
            marginBottom: '24px'
          }}>
            You are setting up a team-building session. Share the room code below with your employees so they can join and play <strong>{currentGame.title}</strong>.
          </p>
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '14px',
            color: '#cbd5e1'
          }}>
            <strong>Your role:</strong> Observe employee interactions, take notes, and receive AI-powered insights about team dynamics and collaboration patterns.
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Employee Access Code */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: 'rgba(51, 65, 85, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(51, 65, 85, 0.2)',
              borderRadius: '16px',
              padding: '32px'
            }}
          >
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Share2 style={{ width: 24, height: 24, color: currentGame.color }} />
              Employee Access Code
            </h2>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                Room Code (Share this with your team)
              </label>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                <div style={{
                  flex: 1,
                  padding: '20px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '2px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '12px',
                  fontFamily: 'monospace',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: '#22c55e',
                  letterSpacing: '0.3em'
                }}>
                  {lobby?.roomCode || 'LOADING'}
                </div>
                <button
                  onClick={copyRoomCode}
                  style={{
                    padding: '20px',
                    background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                    border: `2px solid ${copied ? '#22c55e' : '#3b82f6'}`,
                    borderRadius: '12px',
                    color: copied ? '#22c55e' : '#60a5fa',
                    cursor: 'pointer'
                  }}
                >
                  {copied ? <CheckCircle style={{ width: 24, height: 24 }} /> : <Copy style={{ width: 24, height: 24 }} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                Direct Join Link
              </label>
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <input
                  type="text"
                  value={`${window.location.origin}/join?code=${lobby?.roomCode || 'LOADING'}`}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(51, 65, 85, 0.3)',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={copyJoinLink}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid #3b82f6',
                    borderRadius: '8px',
                    color: '#60a5fa',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ExternalLink style={{ width: 16, height: 16 }} />
                  Copy
                </button>
              </div>
            </div>

            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#22c55e', marginBottom: '8px' }}>
                How employees join:
              </h4>
              <ol style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, paddingLeft: '16px' }}>
                <li>Go to <strong>{window.location.origin}</strong></li>
                <li>Click <strong>"Join Game"</strong></li>
                <li>Enter room code: <strong>{lobby?.roomCode || 'LOADING'}</strong></li>
                <li>Start playing when you begin the session!</li>
              </ol>
            </div>
          </motion.div>

          {/* Employees Joined */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'rgba(51, 65, 85, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(51, 65, 85, 0.2)',
              borderRadius: '16px',
              padding: '32px'
            }}
          >
                        <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Users style={{ width: 24, height: 24, color: currentGame.color }} />
              Employees Joined ({Object.keys(players).length}/{currentGame.maxPlayers})
            </h2>

            <div style={{ marginBottom: '24px' }}>
              {Object.keys(players).length > 0 ? Object.values(players).map((player, index) => (
                <div
                  key={player.uid}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      background: `linear-gradient(135deg, ${currentGame.color}, #2563eb)`,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {player.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: 'white' }}>
                        {player.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#22c55e' }}>
                        Ready to play
                      </div>
                    </div>
                  </div>
                  <div style={{
                    width: 8,
                    height: 8,
                    background: '#22c55e',
                    borderRadius: '50%'
                  }} />
                </div>
              )) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px',
                  background: 'rgba(51, 65, 85, 0.1)',
                  border: '1px dashed rgba(71, 85, 105, 0.5)',
                  borderRadius: '8px',
                  color: '#64748b',
                  textAlign: 'center',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <UserPlus style={{ width: 24, height: 24 }} />
                  <div>Waiting for employees to join...</div>
                  <div style={{ fontSize: '12px' }}>Share the room code above</div>
                </div>
              )}

              {/* Empty slots */}
              {Array.from({ length: Math.max(0, currentGame.maxPlayers - Object.keys(players).length) }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 16px',
                    background: 'rgba(51, 65, 85, 0.1)',
                    border: '1px dashed rgba(71, 85, 105, 0.5)',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    color: '#64748b',
                    fontSize: '14px'
                  }}
                >
                  <UserPlus style={{ width: 16, height: 16, marginRight: '8px' }} />
                  Open slot for employee...
                </div>
              ))}
            </div>

            {/* Start Session Button */}
            <button
              onClick={startGameSession_old}
              disabled={Object.keys(players).length < currentGame.minPlayers || loading}
              style={{
                width: '100%',
                padding: '16px',
                background: Object.keys(players).length >= currentGame.minPlayers 
                  ? 'linear-gradient(135deg, #7c3aed, #2563eb)' 
                  : 'rgba(71, 85, 105, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: Object.keys(players).length >= currentGame.minPlayers ? 'pointer' : 'not-allowed',
                opacity: Object.keys(players).length >= currentGame.minPlayers ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <Loader2 style={{ width: 20, height: 20 }} />
              ) : (
                <Eye style={{ width: 20, height: 20 }} />
              )}
              {Object.keys(players).length >= currentGame.minPlayers 
                ? 'Start Session & Observe' 
                : `Need ${currentGame.minPlayers - Object.keys(players).length} more employees`
              }
            </button>

            {Object.keys(players).length >= currentGame.minPlayers && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#22c55e'
              }}>
                ✅ Ready to start! You'll observe the session and receive AI insights.
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default LobbyCreation
