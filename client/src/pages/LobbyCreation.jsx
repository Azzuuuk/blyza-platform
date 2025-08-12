import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Copy, 
  Users, 
  Play,
  Settings,
  Share2,
  UserPlus,
  Clock,
  CheckCircle,
  Circle,
  Sparkles,
  Zap
} from 'lucide-react'

const LobbyCreation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { gameId, customizations } = location.state || {}
  
  const [lobbyCode, setLobbyCode] = useState('')
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Alex Chen', status: 'ready', avatar: '👨‍💼' },
    { id: 2, name: 'Sarah Johnson', status: 'ready', avatar: '👩‍💼' },
    { id: 3, name: 'Mike Rodriguez', status: 'waiting', avatar: '👨‍🎓' },
    { id: 4, name: 'Emma Davis', status: 'ready', avatar: '👩‍🔬' },
    { id: 5, name: 'David Kim', status: 'waiting', avatar: '👨‍💻' }
  ])
  const [countdown, setCountdown] = useState(null)

  useEffect(() => {
    // Generate random lobby code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setLobbyCode(code)
  }, [])

  // Common styles
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
    color: '#e2e8f0'
  }

  const headerStyle = {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
    position: 'sticky',
    top: 0,
    zIndex: 50
  }

  const cardStyle = {
    background: 'rgba(51, 65, 85, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(51, 65, 85, 0.2)',
    borderRadius: '12px',
    padding: '24px',
    transition: 'all 0.3s ease'
  }

  const buttonStyle = {
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  }

  const gameData = {
    'trust-fall-modern': {
      title: '🤝 Trust & Transparency Challenge',
      color: '#fb7185'
    },
    'creative-storm': {
      title: '🌪️ Innovation Storm',
      color: '#a855f7'
    },
    'communication-flow': {
      title: '💬 Communication Flow',
      color: '#60a5fa'
    }
  }

  const currentGame = gameData[gameId] || gameData['trust-fall-modern']

  const copyLobbyCode = () => {
    navigator.clipboard.writeText(lobbyCode)
    // Could add a toast notification here
  }

  const startGame = () => {
    setCountdown(3)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/game/simulation', { state: { gameId, customizations, lobbyCode, participants } })
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const readyCount = participants.filter(p => p.status === 'ready').length

  return (
    <div style={containerStyle}>
      {/* Animated Background Elements */}
      <div style={{position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}>
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '150px',
          height: '150px',
          background: `rgba(251, 113, 133, 0.1)`,
          borderRadius: '50%',
          filter: 'blur(50px)',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '200px',
          height: '200px',
          background: `rgba(168, 85, 247, 0.1)`,
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'pulse 4s ease-in-out infinite 2s'
        }}></div>
      </div>

      {/* Countdown Overlay */}
      {countdown && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              fontSize: '128px',
              fontWeight: 'bold',
              color: currentGame.color,
              textShadow: `0 0 50px ${currentGame.color}50`
            }}
          >
            {countdown}
          </motion.div>
        </div>
      )}

      {/* Header */}
      <header style={headerStyle}>
        <div style={{maxWidth: '1280px', margin: '0 auto', padding: '0 24px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <button 
                onClick={() => navigate(-1)}
                style={{
                  ...buttonStyle,
                  background: 'rgba(51, 65, 85, 0.3)',
                  color: '#cbd5e1'
                }}
              >
                <ArrowLeft style={{width: '20px', height: '20px'}} />
                Back
              </button>
              
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users style={{width: '24px', height: '24px', color: 'white'}} />
              </div>
              <span style={{
                fontSize: '24px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}>
                Game Lobby
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{padding: '40px 24px'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          
          {/* Game Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              ...cardStyle,
              marginBottom: '32px',
              background: `linear-gradient(135deg, ${currentGame.color}15, rgba(51, 65, 85, 0.1))`,
              border: `2px solid ${currentGame.color}30`,
              textAlign: 'center'
            }}
          >
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '8px',
              margin: 0
            }}>
              {currentGame.title}
            </h1>
            <p style={{
              color: '#94a3b8',
              fontSize: '16px',
              margin: '8px 0 0 0'
            }}>
              Waiting for all players to join and get ready!
            </p>
          </motion.div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px'}}>
            
            {/* Left Column - Participants */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                style={cardStyle}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                  <h3 style={{fontSize: '20px', fontWeight: '600', color: 'white', margin: 0}}>
                    Team Members ({participants.length})
                  </h3>
                  <div style={{
                    background: readyCount === participants.length ? '#059669' : '#f59e0b',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {readyCount}/{participants.length} Ready
                  </div>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  {participants.map((participant, index) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        background: participant.status === 'ready' 
                          ? 'rgba(5, 150, 105, 0.1)' 
                          : 'rgba(245, 158, 11, 0.1)',
                        border: participant.status === 'ready' 
                          ? '1px solid rgba(5, 150, 105, 0.3)' 
                          : '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{fontSize: '32px'}}>{participant.avatar}</div>
                      <div style={{flex: 1}}>
                        <div style={{fontWeight: '600', color: 'white', marginBottom: '4px'}}>
                          {participant.name}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: participant.status === 'ready' ? '#059669' : '#f59e0b',
                          fontWeight: '500'
                        }}>
                          {participant.status === 'ready' ? '✅ Ready to play!' : '⏳ Getting ready...'}
                        </div>
                      </div>
                      {participant.status === 'ready' ? (
                        <CheckCircle style={{width: '20px', height: '20px', color: '#059669'}} />
                      ) : (
                        <Circle style={{width: '20px', height: '20px', color: '#f59e0b'}} />
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Lobby Info & Controls */}
            <div>
              
              {/* Lobby Code */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                style={{...cardStyle, marginBottom: '24px'}}
              >
                <h3 style={{fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '16px'}}>
                  Share Lobby Code
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                  border: '2px dashed rgba(168, 85, 247, 0.3)'
                }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#a855f7',
                    fontFamily: 'monospace',
                    flex: 1,
                    textAlign: 'center'
                  }}>
                    {lobbyCode}
                  </div>
                  <button
                    onClick={copyLobbyCode}
                    style={{
                      ...buttonStyle,
                      background: 'rgba(168, 85, 247, 0.2)',
                      color: '#a855f7',
                      padding: '8px'
                    }}
                  >
                    <Copy style={{width: '16px', height: '16px'}} />
                  </button>
                </div>
                <p style={{fontSize: '12px', color: '#94a3b8', marginTop: '8px', textAlign: 'center'}}>
                  Send this code to your team members so they can join!
                </p>
              </motion.div>

              {/* Game Settings Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                style={{...cardStyle, marginBottom: '24px'}}
              >
                <h3 style={{fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '16px'}}>
                  Game Settings
                </h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{color: '#94a3b8'}}>Tone:</span>
                    <span style={{color: 'white', fontWeight: '600'}}>
                      {customizations?.tone || 'Professional'}
                    </span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{color: '#94a3b8'}}>Difficulty:</span>
                    <span style={{color: 'white', fontWeight: '600'}}>
                      {customizations?.difficulty || 'Medium'}
                    </span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{color: '#94a3b8'}}>Duration:</span>
                    <span style={{color: 'white', fontWeight: '600'}}>
                      {customizations?.duration || '45'} mins
                    </span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{color: '#94a3b8'}}>Team Size:</span>
                    <span style={{color: 'white', fontWeight: '600'}}>
                      {customizations?.teamSize || '8'} people
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* AI Enhancement Notice */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  ...cardStyle,
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1))',
                  border: '2px solid rgba(168, 85, 247, 0.3)',
                  marginBottom: '24px'
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                  <Sparkles style={{width: '20px', height: '20px', color: '#a855f7'}} />
                  <h4 style={{fontSize: '16px', fontWeight: '600', color: 'white', margin: 0}}>
                    AI is Ready! 🤖
                  </h4>
                </div>
                <p style={{fontSize: '12px', color: '#cbd5e1', margin: 0}}>
                  Our AI facilitator will guide the session, provide real-time insights, and generate a personalized team report!
                </p>
              </motion.div>

              {/* Start Game Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  onClick={startGame}
                  disabled={readyCount < participants.length}
                  style={{
                    ...buttonStyle,
                    width: '100%',
                    fontSize: '18px',
                    padding: '16px',
                    background: readyCount === participants.length 
                      ? `linear-gradient(135deg, ${currentGame.color}, ${currentGame.color}dd)`
                      : 'rgba(51, 65, 85, 0.3)',
                    color: readyCount === participants.length ? 'white' : '#94a3b8',
                    cursor: readyCount === participants.length ? 'pointer' : 'not-allowed',
                    boxShadow: readyCount === participants.length 
                      ? `0 8px 25px ${currentGame.color}30` 
                      : 'none',
                    justifyContent: 'center'
                  }}
                >
                  {readyCount === participants.length ? (
                    <>
                      <Play style={{width: '20px', height: '20px'}} />
                      Start Game Session! 🚀
                    </>
                  ) : (
                    <>
                      <Clock style={{width: '20px', height: '20px'}} />
                      Waiting for all players...
                    </>
                  )}
                </button>
                
                {readyCount < participants.length && (
                  <p style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    textAlign: 'center',
                    marginTop: '8px'
                  }}>
                    {participants.length - readyCount} more player(s) need to get ready
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Global Styles */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  )
}

export default LobbyCreation
