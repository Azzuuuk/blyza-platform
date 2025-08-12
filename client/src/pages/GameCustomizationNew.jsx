import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Sparkles, 
  Users, 
  Clock, 
  Brain,
  Heart,
  Target,
  Zap,
  Play,
  Settings,
  Palette,
  Volume2
} from 'lucide-react'

const GameCustomization = () => {
  const navigate = useNavigate()
  const { gameId } = useParams()
  const [customizations, setCustomizations] = useState({
    tone: 'professional',
    difficulty: 'medium',
    duration: '45',
    teamSize: '8',
    focus: 'balanced'
  })

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

  // Sample game data
  const gameData = {
    'trust-fall-modern': {
      title: '🤝 Trust & Transparency Challenge',
      description: 'Build deeper team trust through fun vulnerability exercises and team support challenges!',
      icon: Heart,
      color: '#fb7185'
    },
    'creative-storm': {
      title: '🌪️ Innovation Storm',
      description: 'Unleash your team\'s creativity through wild brainstorming and crazy problem-solving adventures!',
      icon: Brain,
      color: '#a855f7'
    },
    'communication-flow': {
      title: '💬 Communication Flow',
      description: 'Master the art of clear communication through hilarious listening games and speaking challenges!',
      icon: Users,
      color: '#60a5fa'
    }
  }

  const currentGame = gameData[gameId] || gameData['trust-fall-modern']

  const toneOptions = [
    { id: 'professional', name: 'Professional', icon: '👔', description: 'Formal and business-focused approach' },
    { id: 'fun', name: 'Fun & Playful', icon: '🎉', description: 'Light-hearted and entertaining' },
    { id: 'casual', name: 'Casual', icon: '😊', description: 'Relaxed and comfortable atmosphere' },
    { id: 'energetic', name: 'High Energy', icon: '⚡', description: 'Dynamic and exciting experience' }
  ]

  const difficultyOptions = [
    { id: 'easy', name: 'Easy', color: '#34d399', description: 'Perfect for beginners' },
    { id: 'medium', name: 'Medium', color: '#f59e0b', description: 'Balanced challenge' },
    { id: 'hard', name: 'Advanced', color: '#ef4444', description: 'For experienced teams' }
  ]

  const handleCustomizationChange = (key, value) => {
    setCustomizations(prev => ({ ...prev, [key]: value }))
  }

  const handleStartGame = () => {
    // Navigate to lobby creation with customizations
    navigate('/lobby/create', { state: { gameId, customizations } })
  }

  return (
    <div style={containerStyle}>
      {/* Animated Background Elements */}
      <div style={{position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}>
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '40px',
          width: '128px',
          height: '128px',
          background: 'rgba(168, 85, 247, 0.1)',
          borderRadius: '50%',
          filter: 'blur(48px)',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '75%',
          right: '40px',
          width: '192px',
          height: '192px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '50%',
          filter: 'blur(48px)',
          animation: 'pulse 4s ease-in-out infinite 2s'
        }}></div>
      </div>

      {/* Header */}
      <header style={headerStyle}>
        <div style={{maxWidth: '1280px', margin: '0 auto', padding: '0 24px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <button 
                onClick={() => navigate('/games')}
                style={{
                  ...buttonStyle,
                  background: 'rgba(51, 65, 85, 0.3)',
                  color: '#cbd5e1'
                }}
              >
                <ArrowLeft style={{width: '20px', height: '20px'}} />
                Back to Games
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
                <Sparkles style={{width: '24px', height: '24px', color: 'white'}} />
              </div>
              <span style={{
                fontSize: '24px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}>
                Customize Game
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{padding: '40px 24px'}}>
        <div style={{maxWidth: '1000px', margin: '0 auto'}}>
          {/* Game Info Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              ...cardStyle,
              marginBottom: '32px',
              background: `linear-gradient(135deg, ${currentGame.color}15, rgba(51, 65, 85, 0.1))`,
              border: `2px solid ${currentGame.color}30`
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
              <div style={{
                width: '64px',
                height: '64px',
                background: `linear-gradient(135deg, ${currentGame.color}30, ${currentGame.color}20)`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${currentGame.color}40`
              }}>
                <currentGame.icon style={{width: '32px', height: '32px', color: currentGame.color}} />
              </div>
              <div>
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
                  margin: 0
                }}>
                  {currentGame.description}
                </p>
              </div>
            </div>
          </motion.div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px'}}>
            {/* Left Column - Customizations */}
            <div>
              {/* Tone Selection */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                style={{...cardStyle, marginBottom: '24px'}}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px'}}>
                  <Palette style={{width: '24px', height: '24px', color: '#a855f7'}} />
                  <h3 style={{fontSize: '20px', fontWeight: '600', color: 'white', margin: 0}}>
                    Game Tone & Style
                  </h3>
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                  {toneOptions.map((tone) => (
                    <motion.button
                      key={tone.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCustomizationChange('tone', tone.id)}
                      style={{
                        ...cardStyle,
                        padding: '16px',
                        background: customizations.tone === tone.id 
                          ? 'linear-gradient(135deg, #7c3aed20, #2563eb20)' 
                          : 'rgba(51, 65, 85, 0.1)',
                        border: customizations.tone === tone.id 
                          ? '2px solid #7c3aed' 
                          : '1px solid rgba(51, 65, 85, 0.2)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{fontSize: '24px', marginBottom: '8px'}}>{tone.icon}</div>
                      <div style={{fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '4px'}}>
                        {tone.name}
                      </div>
                      <div style={{fontSize: '12px', color: '#94a3b8'}}>
                        {tone.description}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Difficulty Selection */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                style={{...cardStyle, marginBottom: '24px'}}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px'}}>
                  <Target style={{width: '24px', height: '24px', color: '#f59e0b'}} />
                  <h3 style={{fontSize: '20px', fontWeight: '600', color: 'white', margin: 0}}>
                    Difficulty Level
                  </h3>
                </div>
                
                <div style={{display: 'flex', gap: '12px'}}>
                  {difficultyOptions.map((diff) => (
                    <motion.button
                      key={diff.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCustomizationChange('difficulty', diff.id)}
                      style={{
                        flex: 1,
                        padding: '16px',
                        borderRadius: '12px',
                        background: customizations.difficulty === diff.id 
                          ? `${diff.color}20` 
                          : 'rgba(51, 65, 85, 0.1)',
                        border: customizations.difficulty === diff.id 
                          ? `2px solid ${diff.color}` 
                          : '1px solid rgba(51, 65, 85, 0.2)',
                        color: customizations.difficulty === diff.id ? diff.color : '#94a3b8',
                        cursor: 'pointer',
                        fontWeight: '600',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{fontSize: '14px', marginBottom: '4px'}}>{diff.name}</div>
                      <div style={{fontSize: '11px'}}>{diff.description}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Settings */}
            <div>
              {/* Team Settings */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                style={{...cardStyle, marginBottom: '24px'}}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px'}}>
                  <Users style={{width: '24px', height: '24px', color: '#60a5fa'}} />
                  <h3 style={{fontSize: '20px', fontWeight: '600', color: 'white', margin: 0}}>
                    Team Settings
                  </h3>
                </div>
                
                <div style={{marginBottom: '16px'}}>
                  <label style={{display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px'}}>
                    Team Size: {customizations.teamSize} people
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    value={customizations.teamSize}
                    onChange={(e) => handleCustomizationChange('teamSize', e.target.value)}
                    style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px',
                      background: 'rgba(51, 65, 85, 0.3)',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px'}}>
                    Duration: {customizations.duration} minutes
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="15"
                    value={customizations.duration}
                    onChange={(e) => handleCustomizationChange('duration', e.target.value)}
                    style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px',
                      background: 'rgba(51, 65, 85, 0.3)',
                      outline: 'none'
                    }}
                  />
                </div>
              </motion.div>

              {/* AI Enhancement Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  ...cardStyle,
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1))',
                  border: '2px solid rgba(168, 85, 247, 0.3)'
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                  <Brain style={{width: '24px', height: '24px', color: '#a855f7'}} />
                  <h3 style={{fontSize: '20px', fontWeight: '600', color: 'white', margin: 0}}>
                    AI Enhanced Experience
                  </h3>
                </div>
                
                <div style={{padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px'}}>
                  <p style={{color: '#cbd5e1', fontSize: '14px', margin: 0, lineHeight: '1.5'}}>
                    🤖 <strong>AI will automatically:</strong><br/>
                    • Adapt content to your {customizations.tone} tone<br/>
                    • Adjust difficulty for {customizations.teamSize} people<br/>
                    • Generate real-time insights during gameplay<br/>
                    • Create personalized team reports
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '40px'
            }}
          >
            <button
              onClick={() => navigate('/games')}
              style={{
                ...buttonStyle,
                background: 'rgba(51, 65, 85, 0.3)',
                color: '#94a3b8'
              }}
            >
              Back to Games
            </button>
            
            <button
              onClick={handleStartGame}
              style={{
                ...buttonStyle,
                fontSize: '18px',
                padding: '16px 32px',
                background: `linear-gradient(135deg, ${currentGame.color}, ${currentGame.color}dd)`,
                boxShadow: `0 8px 25px ${currentGame.color}30`
              }}
            >
              <Play style={{width: '20px', height: '20px'}} />
              Create Game Session! 🎮
            </button>
          </motion.div>
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

export default GameCustomization
