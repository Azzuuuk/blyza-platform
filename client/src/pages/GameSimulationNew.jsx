import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  SkipForward,
  Users,
  Brain,
  Heart,
  Lightbulb,
  MessageCircle,
  Timer,
  Zap,
  Star,
  CheckCircle,
  Trophy,
  TrendingUp
} from 'lucide-react'

const GameSimulationNew = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { gameId, customizations, lobbyCode, participants } = location.state || {}
  
  const [currentPhase, setCurrentPhase] = useState(0)
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes for demo
  const [isRunning, setIsRunning] = useState(true)
  const [insights, setInsights] = useState([])
  const [teamMetrics, setTeamMetrics] = useState({
    engagement: 85,
    communication: 78,
    collaboration: 92,
    innovation: 67
  })

  // Common styles
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
    color: '#e2e8f0'
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
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  }

  // Sample participants if none provided
  const defaultParticipants = [
    { id: 1, name: 'Alex Chen', status: 'ready', avatar: '👨‍💼' },
    { id: 2, name: 'Sarah Johnson', status: 'ready', avatar: '👩‍💼' },
    { id: 3, name: 'Mike Rodriguez', status: 'ready', avatar: '👨‍🎓' },
    { id: 4, name: 'Emma Davis', status: 'ready', avatar: '👩‍🔬' },
    { id: 5, name: 'David Kim', status: 'ready', avatar: '👨‍💻' }
  ]

  const gameParticipants = participants || defaultParticipants

  // Game phases for Trust & Transparency Challenge
  const gamePhases = [
    {
      id: 1,
      title: '🔥 Icebreaker Round',
      description: 'Share something unexpected about yourself!',
      duration: 180,
      color: '#fb7185',
      activities: [
        'Players share a unique skill or hobby',
        'Everyone guesses fun facts about teammates',
        'Building initial connections and comfort'
      ]
    },
    {
      id: 2,
      title: '🤝 Trust Building Exercises',
      description: 'Time to build deeper connections through vulnerability',
      duration: 300,
      color: '#a855f7',
      activities: [
        'Share a professional challenge you overcame',
        'Discuss a time when you needed help from others',
        'Practice active listening and empathy'
      ]
    },
    {
      id: 3,
      title: '💡 Collaborative Problem Solving',
      description: 'Work together to solve creative challenges',
      duration: 240,
      color: '#60a5fa',
      activities: [
        'Brainstorm solutions to a hypothetical scenario',
        'Build on each other\'s ideas without judgment',
        'Practice transparent communication'
      ]
    }
  ]

  const currentPhaseData = gamePhases[currentPhase] || gamePhases[0]

  // Timer effect
  useEffect(() => {
    let interval = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Auto-advance to next phase or finish
      if (currentPhase < gamePhases.length - 1) {
        setCurrentPhase(prev => prev + 1)
        setTimeLeft(gamePhases[currentPhase + 1]?.duration || 0)
      } else {
        // Game finished
        setTimeout(() => {
          navigate('/game/analysis', { 
            state: { gameId, customizations, participants: gameParticipants, teamMetrics, insights } 
          })
        }, 2000)
      }
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, currentPhase, navigate])

  // Generate AI insights periodically
  useEffect(() => {
    const insightTimer = setInterval(() => {
      const sampleInsights = [
        { 
          type: 'engagement', 
          message: 'Sarah is showing great leadership by asking follow-up questions!',
          participant: 'Sarah Johnson',
          timestamp: new Date().toLocaleTimeString()
        },
        { 
          type: 'collaboration', 
          message: 'The team is building on each other\'s ideas effectively.',
          participant: 'Team',
          timestamp: new Date().toLocaleTimeString()
        },
        { 
          type: 'communication', 
          message: 'Mike has become more vocal - great progress in participation!',
          participant: 'Mike Rodriguez',
          timestamp: new Date().toLocaleTimeString()
        },
        { 
          type: 'innovation', 
          message: 'Creative solutions emerging from diverse perspectives!',
          participant: 'Team',
          timestamp: new Date().toLocaleTimeString()
        }
      ]

      if (insights.length < 6) {
        const randomInsight = sampleInsights[Math.floor(Math.random() * sampleInsights.length)]
        setInsights(prev => [...prev, { ...randomInsight, id: Date.now() }])
      }
    }, 15000) // Add insight every 15 seconds

    return () => clearInterval(insightTimer)
  }, [insights.length])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const nextPhase = () => {
    if (currentPhase < gamePhases.length - 1) {
      setCurrentPhase(prev => prev + 1)
      setTimeLeft(gamePhases[currentPhase + 1]?.duration || 0)
    }
  }

  const finishGame = () => {
    navigate('/game/analysis', { 
      state: { gameId, customizations, participants: gameParticipants, teamMetrics, insights } 
    })
  }

  return (
    <div style={containerStyle}>
      {/* Animated Background */}
      <div style={{position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '200px',
          height: '200px',
          background: `${currentPhaseData.color}20`,
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'pulse 3s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '150px',
          height: '150px',
          background: `${currentPhaseData.color}15`,
          borderRadius: '50%',
          filter: 'blur(50px)',
          animation: 'pulse 3s ease-in-out infinite 1.5s'
        }}></div>
      </div>

      {/* Header */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{maxWidth: '1400px', margin: '0 auto', padding: '0 24px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
              <div style={{
                fontSize: '32px',
                background: `linear-gradient(135deg, ${currentPhaseData.color}, ${currentPhaseData.color}dd)`,
                borderRadius: '12px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                🤝
              </div>
              <div>
                <h1 style={{fontSize: '20px', fontWeight: 'bold', color: 'white', margin: 0}}>
                  Trust & Transparency Challenge
                </h1>
                <p style={{fontSize: '12px', color: '#94a3b8', margin: 0}}>
                  Lobby: {lobbyCode || 'DEMO123'} • {gameParticipants.length} participants
                </p>
              </div>
            </div>

            {/* Timer and Controls */}
            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(0,0,0,0.3)',
                padding: '8px 16px',
                borderRadius: '8px'
              }}>
                <Timer style={{width: '20px', height: '20px', color: currentPhaseData.color}} />
                <span style={{fontSize: '18px', fontWeight: 'bold', color: 'white'}}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              <button onClick={toggleTimer} style={{
                ...buttonStyle,
                background: 'rgba(51, 65, 85, 0.3)',
                color: '#cbd5e1'
              }}>
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{padding: '24px'}}>
        <div style={{maxWidth: '1400px', margin: '0 auto'}}>
          
          {/* Phase Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{...cardStyle, marginBottom: '24px'}}
          >
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h3 style={{fontSize: '18px', fontWeight: '600', color: 'white', margin: 0}}>
                Game Progress
              </h3>
              <span style={{
                background: currentPhaseData.color,
                color: 'white',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                Phase {currentPhase + 1} of {gamePhases.length}
              </span>
            </div>
            
            <div style={{display: 'flex', gap: '8px', marginBottom: '16px'}}>
              {gamePhases.map((phase, index) => (
                <div
                  key={phase.id}
                  style={{
                    flex: 1,
                    height: '8px',
                    borderRadius: '4px',
                    background: index <= currentPhase ? currentPhaseData.color : 'rgba(51, 65, 85, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
            
            <div style={{
              background: `${currentPhaseData.color}10`,
              border: `2px solid ${currentPhaseData.color}30`,
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h4 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: currentPhaseData.color,
                marginBottom: '8px',
                margin: 0
              }}>
                {currentPhaseData.title}
              </h4>
              <p style={{color: '#cbd5e1', marginBottom: '12px'}}>
                {currentPhaseData.description}
              </p>
              <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                {currentPhaseData.activities.map((activity, index) => (
                  <div key={index} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <CheckCircle style={{width: '16px', height: '16px', color: currentPhaseData.color}} />
                    <span style={{fontSize: '14px', color: '#94a3b8'}}>{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px'}}>
            
            {/* Left Column - Participants & Activity */}
            <div>
              {/* Active Participants */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{...cardStyle, marginBottom: '24px'}}
              >
                <h3 style={{fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '16px'}}>
                  Live Participants
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px'}}>
                  {gameParticipants.map((participant, index) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        border: `2px solid ${currentPhaseData.color}30`
                      }}
                    >
                      <div style={{fontSize: '24px'}}>{participant.avatar}</div>
                      <div>
                        <div style={{fontWeight: '600', color: 'white', fontSize: '14px'}}>
                          {participant.name}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            background: '#059669',
                            borderRadius: '50%',
                            animation: 'pulse 2s infinite'
                          }}></div>
                          Active
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Team Metrics Dashboard */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                style={cardStyle}
              >
                <h3 style={{fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '16px'}}>
                  Real-time Team Metrics
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                  {[
                    { name: 'Engagement', value: teamMetrics.engagement, icon: Zap, color: '#f59e0b' },
                    { name: 'Communication', value: teamMetrics.communication, icon: MessageCircle, color: '#60a5fa' },
                    { name: 'Collaboration', value: teamMetrics.collaboration, icon: Users, color: '#34d399' },
                    { name: 'Innovation', value: teamMetrics.innovation, icon: Lightbulb, color: '#a855f7' }
                  ].map((metric) => (
                    <div
                      key={metric.name}
                      style={{
                        padding: '16px',
                        background: `${metric.color}10`,
                        border: `1px solid ${metric.color}30`,
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                        <metric.icon style={{width: '18px', height: '18px', color: metric.color}} />
                        <span style={{fontSize: '14px', color: '#cbd5e1', fontWeight: '500'}}>
                          {metric.name}
                        </span>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <div style={{
                          flex: 1,
                          height: '6px',
                          background: 'rgba(51, 65, 85, 0.3)',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.value}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            style={{
                              height: '100%',
                              background: metric.color,
                              borderRadius: '3px'
                            }}
                          />
                        </div>
                        <span style={{fontSize: '16px', fontWeight: 'bold', color: metric.color}}>
                          {metric.value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - AI Insights & Controls */}
            <div>
              
              {/* AI Insights Feed */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{...cardStyle, marginBottom: '24px'}}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                  <Brain style={{width: '20px', height: '20px', color: '#a855f7'}} />
                  <h3 style={{fontSize: '18px', fontWeight: '600', color: 'white', margin: 0}}>
                    AI Insights
                  </h3>
                </div>
                
                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <AnimatePresence>
                    {insights.map((insight) => (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        style={{
                          padding: '12px',
                          background: 'rgba(168, 85, 247, 0.1)',
                          border: '1px solid rgba(168, 85, 247, 0.2)',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px'}}>
                          <span style={{fontSize: '12px', color: '#a855f7', fontWeight: '600'}}>
                            {insight.participant}
                          </span>
                          <span style={{fontSize: '10px', color: '#94a3b8'}}>
                            {insight.timestamp}
                          </span>
                        </div>
                        <p style={{fontSize: '14px', color: '#cbd5e1', margin: 0}}>
                          {insight.message}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Game Controls */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                style={cardStyle}
              >
                <h3 style={{fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '16px'}}>
                  Facilitator Controls
                </h3>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  <button
                    onClick={nextPhase}
                    disabled={currentPhase >= gamePhases.length - 1}
                    style={{
                      ...buttonStyle,
                      width: '100%',
                      justifyContent: 'center',
                      background: currentPhase < gamePhases.length - 1 
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                        : 'rgba(51, 65, 85, 0.3)',
                      color: currentPhase < gamePhases.length - 1 ? 'white' : '#94a3b8',
                      cursor: currentPhase < gamePhases.length - 1 ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <SkipForward style={{width: '16px', height: '16px'}} />
                    {currentPhase < gamePhases.length - 1 ? 'Next Phase' : 'Final Phase'}
                  </button>
                  
                  <button
                    onClick={finishGame}
                    style={{
                      ...buttonStyle,
                      width: '100%',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #059669, #047857)',
                    }}
                  >
                    <Trophy style={{width: '16px', height: '16px'}} />
                    Finish & Analyze Results
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Global Styles */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
          }
        `}
      </style>
    </div>
  )
}

export default GameSimulationNew
