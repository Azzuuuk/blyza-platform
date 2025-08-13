import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lock, Unlock, Key, Clock, Trophy, Users, MessageCircle, 
  Lightbulb, Target, CheckCircle, Shield, Zap, Star 
} from 'lucide-react'
import { generatePuzzles } from './PuzzleGenerator'
import { GAME_CONFIG, GAME_THEMES } from './GameConfig'

const CodeBreakersGame = ({ 
  sessionId = `cb_${Date.now()}`, 
  players = [
    { id: 1, name: 'Agent Alpha', role: 'decoder' },
    { id: 2, name: 'Agent Beta', role: 'analyst' },
    { id: 3, name: 'Agent Charlie', role: 'cryptographer' }
  ], 
  onDataUpdate = (data) => console.log('Game Data:', data),
  onGameComplete = (data) => console.log('Game Complete:', data)
}) => {
  // 🎮 Game State Management
  const [gameState, setGameState] = useState('setup') // setup, playing, completed
  const [selectedTheme, setSelectedTheme] = useState('spy_mission')
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [teamMembers, setTeamMembers] = useState(players || [])
  const [gameData, setGameData] = useState(null)
  const [solutions, setSolutions] = useState({})
  const [hintsUsed, setHintsUsed] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.defaultDuration)
  const [teamChat, setTeamChat] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [currentPlayer] = useState({ 
    id: 'player1', 
    name: 'You', 
    role: 'cryptographer' 
  })
  
  const gameStartTime = useRef(null)

  // 🎨 Styling
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    color: '#e2e8f0',
    fontFamily: "'Inter', sans-serif"
  }

  const cardStyle = {
    background: 'rgba(51, 65, 85, 0.15)',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(124, 58, 237, 0.3)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  }

  const buttonStyle = {
    background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }

  // 🎯 GAME LOGIC FUNCTIONS

  // Initialize game when component mounts
  useEffect(() => {
    if (players.length > 0 && gameState === 'setup') {
      setTeamMembers(players)
    }
  }, [players])

  // Timer management
  useEffect(() => {
    let timer
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleGameComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [gameState, timeLeft])

  // 🚀 Start the game
  const startGame = () => {
    setGameState('playing')
    setTimeLeft(GAME_CONFIG.defaultDuration)
    gameStartTime.current = Date.now()
    
    // Generate puzzles based on selected theme and team size
    const puzzleSet = generatePuzzles(selectedTheme, teamMembers.length)
    setGameData(puzzleSet)
    
    // 📡 Track game start
    trackGameEvent('game_started', {
      theme: selectedTheme,
      difficulty: selectedDifficulty,
      playerCount: teamMembers.length,
      timestamp: Date.now()
    })
  }

  // 📊 Track game events to backend
  const trackGameEvent = async (eventType, eventData) => {
    try {
      await fetch('/api/games/code-breakers/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          type: eventType,
          data: eventData,
          timestamp: Date.now()
        })
      })
      
      // Also call the parent callback if provided
      onDataUpdate?.({
        type: eventType,
        sessionId,
        ...eventData
      })
    } catch (error) {
      console.error('Failed to track event:', error)
      // Still call parent callback even if backend fails
      onDataUpdate?.({
        type: eventType,
        sessionId,
        ...eventData
      })
    }
  }

  // 🎯 Submit a solution attempt
  const submitSolution = (messageId, guess) => {
    const message = gameData?.messages.find(m => m.id === messageId)
    if (!message) return false

    const isCorrect = guess.toLowerCase().trim() === message.solution.toLowerCase().trim()
    
    if (isCorrect) {
      setSolutions(prev => ({
        ...prev,
        [messageId]: guess
      }))
      
      trackGameEvent('message_decoded', {
        messageId,
        solution: guess,
        timeToSolve: Date.now() - gameStartTime.current,
        hintsUsed,
        timestamp: Date.now()
      })

      // Check if all messages are decoded
      if (Object.keys(solutions).length + 1 >= (gameData?.messages.length || 0)) {
        setTimeout(() => {
          handleGameComplete()
        }, 1500)
      }
      
      return true
    } else {
      trackGameEvent('incorrect_attempt', {
        messageId,
        attempt: guess,
        timestamp: Date.now()
      })
      return false
    }
  }

  // 💡 Use a hint
  const useHint = (messageId) => {
    const message = gameData?.messages.find(m => m.id === messageId)
    if (!message) return "Message not found"

    setHintsUsed(prev => prev + 1)
    
    trackGameEvent('hint_used', {
      messageId,
      hintsUsedTotal: hintsUsed + 1,
      timestamp: Date.now()
    })

    const hints = message.layers?.[0]?.hints || [
      "Look for patterns in the text!",
      "Try different cipher techniques",
      "Work with your team - combine your keys!"
    ]
    
    return hints[Math.min(hintsUsed, hints.length - 1)]
  }

  // 💬 Send team chat message
  const sendMessage = () => {
    if (!newMessage.trim()) return
    
    const message = {
      id: Date.now(),
      player: currentPlayer,
      content: newMessage,
      timestamp: Date.now()
    }
    
    setTeamChat(prev => [...prev, message])
    setNewMessage('')
    
    trackGameEvent('player_communication', {
      playerId: currentPlayer.id,
      message: newMessage,
      timestamp: Date.now()
    })
  }

  // 🏆 Calculate scoring
  const calculateFinalScore = (timeElapsed) => {
    const timeInSeconds = Math.floor(timeElapsed / 1000)
    const timeBonus = Math.max(0, (GAME_CONFIG.defaultDuration - timeInSeconds) * 5)
    const solveBonus = Object.keys(solutions).length * 150
    const speedBonus = Object.keys(solutions).length > 0 ? 
      Math.floor(1000 / (timeInSeconds / Object.keys(solutions).length)) : 0
    const hintsDeduction = hintsUsed * 25
    const teamworkBonus = Math.min(teamChat.length * 10, 200)
    
    return Math.max(0, timeBonus + solveBonus + speedBonus - hintsDeduction + teamworkBonus)
  }

  // ⏰ Format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // 🏁 Handle game completion
  const handleGameComplete = async () => {
    setGameState('completed')
    
    const finalData = {
      sessionId: sessionId || `cb_${Date.now()}`,
      gameType: 'code-breakers',
      theme: selectedTheme,
      players: teamMembers,
      startTime: gameStartTime.current,
      endTime: Date.now(),
      solutions,
      finalScore: calculateFinalScore(Date.now() - gameStartTime.current),
      messagesDecoded: Object.keys(solutions).length,
      totalMessages: gameData?.messages.length || 0,
      hintsUsed,
      chatMessages: teamChat.length
    }

    try {
      // 📡 Submit final results to backend
      const response = await fetch('/api/games/code-breakers/submit-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Game results submitted successfully:', result)
      } else {
        console.error('❌ Failed to submit game results')
      }
    } catch (error) {
      console.error('❌ Error submitting game results:', error)
    }

    // Call parent callback
    onGameComplete?.(finalData)
  }

  // 🎮 RENDER PHASES

  // 🚀 SETUP PHASE
  if (gameState === 'setup') {
    return (
      <div style={containerStyle}>
        <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1 style={{ 
                fontSize: '3rem', 
                fontWeight: '800',
                background: 'linear-gradient(135deg, #7c3aed, #fbbf24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '16px'
              }}>
                Code Breakers
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
                🕵️ Work together to decrypt secret messages and uncover the truth!
              </p>
            </div>

            {/* Theme Selection */}
            <motion.div style={cardStyle} className="theme-selection">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Choose Your Mission</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {Object.entries(GAME_THEMES).map(([key, theme]) => (
                  <motion.div
                    key={key}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: selectedTheme === key ? '2px solid #7c3aed' : '2px solid transparent',
                      background: selectedTheme === key ? 'rgba(124, 58, 237, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => setSelectedTheme(key)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{theme.icon}</div>
                    <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>{theme.name}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{theme.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Team Info */}
            <motion.div 
              style={{ ...cardStyle, marginTop: '24px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={24} />
                Your Team ({teamMembers.length} agents)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {teamMembers.map((member, index) => (
                  <div key={index} style={{
                    background: 'rgba(124, 58, 237, 0.1)',
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Shield size={16} style={{ color: '#7c3aed' }} />
                    <span>{member.name || `Agent ${index + 1}`}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Start Game Button */}
            <motion.div 
              style={{ textAlign: 'center', marginTop: '32px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <button
                style={{
                  ...buttonStyle,
                  fontSize: '1.3rem',
                  padding: '16px 40px'
                }}
                onClick={startGame}
              >
                <Zap size={24} />
                Start Mission
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  // 🎮 PLAYING PHASE
  if (gameState === 'playing') {
    return (
      <div style={containerStyle}>
        {/* Game Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(124, 58, 237, 0.3)',
          zIndex: 100
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} style={{ color: timeLeft < 300 ? '#ef4444' : '#7c3aed' }} />
                <span style={{ 
                  fontWeight: '700', 
                  fontSize: '1.1rem',
                  color: timeLeft < 300 ? '#ef4444' : '#e2e8f0'
                }}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={20} style={{ color: '#fbbf24' }} />
                <span style={{ fontWeight: '600' }}>Score: {calculateFinalScore(Date.now() - gameStartTime.current)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                {Object.keys(solutions).length}/{gameData?.messages.length || 0} decoded
              </span>
              <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                💡 Hints: {hintsUsed}
              </span>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
            
            {/* Main Game Area */}
            <div>
              <h2 style={{ 
                fontSize: '1.8rem', 
                fontWeight: '700', 
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Lock size={28} style={{ color: '#7c3aed' }} />
                {GAME_THEMES[selectedTheme].name}
              </h2>
              
              <p style={{ 
                fontSize: '1.1rem', 
                color: '#94a3b8', 
                marginBottom: '32px',
                fontStyle: 'italic'
              }}>
                {GAME_THEMES[selectedTheme].story}
              </p>

              {/* Encrypted Messages */}
              <div style={{ display: 'grid', gap: '20px' }}>
                {gameData?.messages.map((message, index) => {
                  const isDecoded = solutions[message.id]
                  return (
                    <motion.div
                      key={message.id}
                      style={{
                        ...cardStyle,
                        border: isDecoded ? '2px solid #10b981' : cardStyle.border,
                        background: isDecoded ? 'rgba(16, 185, 129, 0.1)' : cardStyle.background
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isDecoded ? <Unlock size={20} style={{ color: '#10b981' }} /> : <Lock size={20} style={{ color: '#7c3aed' }} />}
                            Message #{index + 1}
                            {isDecoded && <CheckCircle size={16} style={{ color: '#10b981' }} />}
                          </h3>
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <span>Difficulty: {'⭐'.repeat(message.difficulty)}</span>
                          </div>
                        </div>
                        
                        {!isDecoded && (
                          <button
                            style={{
                              ...buttonStyle,
                              fontSize: '0.8rem',
                              padding: '6px 12px',
                              background: 'linear-gradient(135deg, #f59e0b, #d97706)'
                            }}
                            onClick={() => alert(useHint(message.id))}
                          >
                            <Lightbulb size={14} />
                            Hint
                          </button>
                        )}
                      </div>

                      {/* Encrypted Message */}
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontFamily: 'monospace',
                        fontSize: '1.1rem',
                        letterSpacing: '2px',
                        border: '1px solid rgba(124, 58, 237, 0.3)'
                      }}>
                        {message.encrypted}
                      </div>

                      {/* Solution Input */}
                      {!isDecoded ? (
                        <SolutionInput 
                          messageId={message.id}
                          onSubmit={submitSolution}
                        />
                      ) : (
                        <div style={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          padding: '12px',
                          borderRadius: '8px',
                          color: '#10b981',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <CheckCircle size={16} />
                          DECODED: {solutions[message.id]}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'grid', gap: '20px' }}>
              
              {/* Cipher Keys */}
              <motion.div
                style={cardStyle}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3 style={{ fontSize: '1.3rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={20} style={{ color: '#7c3aed' }} />
                  Your Cipher Keys
                </h3>
                
                {gameData?.playerKeys?.map((cipher, index) => (
                  <div key={index} style={{
                    background: 'rgba(124, 58, 237, 0.1)',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    border: '1px solid rgba(124, 58, 237, 0.3)'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {cipher.type.charAt(0).toUpperCase() + cipher.type.slice(1)} Cipher
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {cipher.description}
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Team Chat */}
              <motion.div
                style={cardStyle}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 style={{ fontSize: '1.3rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageCircle size={20} style={{ color: '#7c3aed' }} />
                  Team Chat
                </h3>
                
                <div style={{
                  height: '200px',
                  overflowY: 'auto',
                  marginBottom: '12px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  padding: '12px'
                }}>
                  {teamChat.map(msg => (
                    <div key={msg.id} style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: '600' }}>
                        {msg.player.name}:
                      </span>
                      <span style={{ marginLeft: '8px' }}>{msg.content}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Share a clue..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(124, 58, 237, 0.3)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: '#e2e8f0',
                      fontSize: '0.9rem'
                    }}
                  />
                  <button onClick={sendMessage} style={{ ...buttonStyle, padding: '8px 16px', fontSize: '0.8rem' }}>
                    Send
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 🏆 COMPLETED PHASE
  if (gameState === 'completed') {
    return (
      <div style={containerStyle}>
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Trophy size={64} style={{ color: '#fbbf24', marginBottom: '24px' }} />
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: '800',
              background: 'linear-gradient(135deg, #7c3aed, #fbbf24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '16px'
            }}>
              Mission {Object.keys(solutions).length === gameData?.messages.length ? 'Complete!' : 'Ended'}
            </h1>
            
            <div style={{ ...cardStyle, textAlign: 'left', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Team Results</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#7c3aed' }}>
                    {Object.keys(solutions).length}/{gameData?.messages.length || 0}
                  </div>
                  <div style={{ color: '#94a3b8' }}>Messages Decoded</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                    {calculateFinalScore(Date.now() - gameStartTime.current)}
                  </div>
                  <div style={{ color: '#94a3b8' }}>Final Score</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
                    {formatTime(Math.floor((Date.now() - gameStartTime.current) / 1000))}
                  </div>
                  <div style={{ color: '#94a3b8' }}>Time Taken</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ec4899' }}>
                    {hintsUsed}
                  </div>
                  <div style={{ color: '#94a3b8' }}>Hints Used</div>
                </div>
              </div>
            </div>

            <button
              style={{ ...buttonStyle, fontSize: '1.2rem', padding: '16px 32px' }}
              onClick={() => window.location.href = '/dashboard'}
            >
              <Target size={24} />
              View Analysis
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return <div>Loading game...</div>
}

// 🔑 Solution Input Component
const SolutionInput = ({ messageId, onSubmit }) => {
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState('')

  const handleSubmit = () => {
    if (!guess.trim()) return
    
    const isCorrect = onSubmit(messageId, guess)
    if (isCorrect) {
      setFeedback('correct')
      setGuess('')
    } else {
      setFeedback('incorrect')
      setTimeout(() => setFeedback(''), 2000)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Enter decoded message..."
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '6px',
            border: feedback === 'incorrect' ? '2px solid #ef4444' : '1px solid rgba(124, 58, 237, 0.3)',
            background: 'rgba(0, 0, 0, 0.3)',
            color: '#e2e8f0',
            fontSize: '0.9rem'
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Decode
        </button>
      </div>
      {feedback === 'incorrect' && (
        <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>
          Not quite right. Try again!
        </div>
      )}
    </div>
  )
}

export default CodeBreakersGame
