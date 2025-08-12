import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain,
  TrendingUp,
  Users,
  MessageCircle,
  Star,
  Award,
  Target,
  Lightbulb,
  Heart,
  Zap,
  Download,
  Share2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Trophy,
  BarChart3,
  FileText,
  Sparkles
} from 'lucide-react'

const GameAnalysis = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { gameId, customizations, participants, teamMetrics, insights } = location.state || {}
  
  const [activeTab, setActiveTab] = useState('overview')
  const [isGenerating, setIsGenerating] = useState(true)
  const [qualitativeData, setQualitativeData] = useState({})

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
    { id: 1, name: 'Alex Chen', avatar: '👨‍💼' },
    { id: 2, name: 'Sarah Johnson', avatar: '👩‍💼' },
    { id: 3, name: 'Mike Rodriguez', avatar: '👨‍🎓' },
    { id: 4, name: 'Emma Davis', avatar: '👩‍🔬' },
    { id: 5, name: 'David Kim', avatar: '👨‍💻' }
  ]

  const gameParticipants = participants || defaultParticipants

  // Default metrics if none provided
  const defaultMetrics = {
    engagement: 85,
    communication: 78,
    collaboration: 92,
    innovation: 67
  }

  const finalMetrics = teamMetrics || defaultMetrics

  // Simulate AI analysis generation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGenerating(false)
      setQualitativeData({
        teamDynamics: {
          score: 87,
          insights: [
            'Strong collaborative foundation with high trust levels',
            'Leadership naturally emerges from multiple team members',
            'Effective conflict resolution and consensus building',
            'Open communication channels promote psychological safety'
          ]
        },
        individualProfiles: gameParticipants.map(p => ({
          name: p.name,
          avatar: p.avatar,
          role: ['Natural Leader', 'Creative Thinker', 'Team Mediator', 'Detail Oriented', 'Strategic Planner'][Math.floor(Math.random() * 5)],
          strengths: ['Communication', 'Problem Solving', 'Empathy', 'Innovation'][Math.floor(Math.random() * 4)],
          growthAreas: ['Public Speaking', 'Time Management', 'Delegation', 'Technical Skills'][Math.floor(Math.random() * 4)],
          score: 75 + Math.floor(Math.random() * 20)
        })),
        recommendations: [
          {
            category: 'Communication',
            priority: 'High',
            suggestion: 'Implement regular check-ins to maintain the strong communication momentum',
            impact: 'Will improve project coordination by 25%'
          },
          {
            category: 'Innovation',
            priority: 'Medium',
            suggestion: 'Create dedicated brainstorming sessions to leverage creative potential',
            impact: 'Could increase innovative solutions by 30%'
          },
          {
            category: 'Leadership',
            priority: 'Low',
            suggestion: 'Rotate leadership roles to develop multiple team leaders',
            impact: 'Will build resilience and reduce single points of failure'
          }
        ]
      })
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'insights', name: 'AI Insights', icon: Brain },
    { id: 'individuals', name: 'Individual Profiles', icon: Users },
    { id: 'recommendations', name: 'Recommendations', icon: Target }
  ]

  const getScoreColor = (score) => {
    if (score >= 80) return '#34d399'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return '#ef4444'
      case 'Medium': return '#f59e0b'
      case 'Low': return '#34d399'
      default: return '#94a3b8'
    }
  }

  if (isGenerating) {
    return (
      <div style={containerStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #a855f7, #60a5fa)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Brain style={{width: '32px', height: '32px', color: 'white'}} />
          </motion.div>
          
          <div style={{textAlign: 'center'}}>
            <h2 style={{fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px'}}>
              AI Analysis in Progress
            </h2>
            <p style={{color: '#94a3b8', fontSize: '16px'}}>
              Analyzing team dynamics, individual contributions, and generating insights...
            </p>
          </div>
          
          <div style={{
            width: '400px',
            height: '8px',
            background: 'rgba(51, 65, 85, 0.3)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'easeInOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #a855f7, #60a5fa)',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {/* Animated Background */}
      <div style={{position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}>
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'rgba(168, 85, 247, 0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: '150px',
          height: '150px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          animation: 'pulse 4s ease-in-out infinite 2s'
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
              <button 
                onClick={() => navigate('/games')}
                style={{
                  ...buttonStyle,
                  background: 'rgba(51, 65, 85, 0.3)',
                  color: '#cbd5e1'
                }}
              >
                <ArrowLeft style={{width: '16px', height: '16px'}} />
                Back to Games
              </button>
              
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #a855f7, #60a5fa)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Trophy style={{width: '24px', height: '24px', color: 'white'}} />
              </div>
              <div>
                <h1 style={{fontSize: '20px', fontWeight: 'bold', color: 'white', margin: 0}}>
                  Team Analysis Results
                </h1>
                <p style={{fontSize: '12px', color: '#94a3b8', margin: 0}}>
                  Trust & Transparency Challenge • {gameParticipants.length} participants
                </p>
              </div>
            </div>

            <div style={{display: 'flex', gap: '12px'}}>
              <button style={{
                ...buttonStyle,
                background: 'rgba(34, 197, 94, 0.2)',
                color: '#22c55e'
              }}>
                <Download style={{width: '16px', height: '16px'}} />
                Export Report
              </button>
              
              <button style={{
                ...buttonStyle,
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#3b82f6'
              }}>
                <Share2 style={{width: '16px', height: '16px'}} />
                Share Results
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.5)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.3)'
      }}>
        <div style={{maxWidth: '1400px', margin: '0 auto', padding: '0 24px'}}>
          <div style={{display: 'flex', gap: '8px'}}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: activeTab === tab.id ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                  color: activeTab === tab.id ? '#a855f7' : '#94a3b8',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid #a855f7' : '3px solid transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
              >
                <tab.icon style={{width: '16px', height: '16px'}} />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{padding: '32px 24px'}}>
        <div style={{maxWidth: '1400px', margin: '0 auto'}}>
          
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Team Score Summary */}
                <div style={{...cardStyle, marginBottom: '32px', textAlign: 'center'}}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: `linear-gradient(135deg, ${getScoreColor(qualitativeData.teamDynamics?.score)}, ${getScoreColor(qualitativeData.teamDynamics?.score)}dd)`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    {qualitativeData.teamDynamics?.score || 87}
                  </div>
                  <h2 style={{fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px'}}>
                    Excellent Team Performance! 🎉
                  </h2>
                  <p style={{color: '#94a3b8', fontSize: '16px'}}>
                    Your team demonstrated strong collaboration, trust, and communication skills
                  </p>
                </div>

                {/* Metrics Grid */}
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px'}}>
                  {[
                    { name: 'Team Engagement', value: finalMetrics.engagement, icon: Zap, color: '#f59e0b' },
                    { name: 'Communication', value: finalMetrics.communication, icon: MessageCircle, color: '#60a5fa' },
                    { name: 'Collaboration', value: finalMetrics.collaboration, icon: Users, color: '#34d399' },
                    { name: 'Innovation', value: finalMetrics.innovation, icon: Lightbulb, color: '#a855f7' }
                  ].map((metric) => (
                    <motion.div
                      key={metric.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      style={{
                        ...cardStyle,
                        background: `${metric.color}10`,
                        border: `2px solid ${metric.color}30`
                      }}
                    >
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: `${metric.color}20`,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <metric.icon style={{width: '20px', height: '20px', color: metric.color}} />
                        </div>
                        <h3 style={{fontSize: '16px', fontWeight: '600', color: 'white', margin: 0}}>
                          {metric.name}
                        </h3>
                      </div>
                      
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <div style={{
                          flex: 1,
                          height: '8px',
                          background: 'rgba(51, 65, 85, 0.3)',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.value}%` }}
                            transition={{ duration: 1.5, delay: 0.3 }}
                            style={{
                              height: '100%',
                              background: metric.color,
                              borderRadius: '4px'
                            }}
                          />
                        </div>
                        <span style={{fontSize: '24px', fontWeight: 'bold', color: metric.color}}>
                          {metric.value}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Key Insights */}
                <div style={cardStyle}>
                  <h3 style={{fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '16px'}}>
                    🎯 Key Team Insights
                  </h3>
                  <div style={{display: 'grid', gap: '12px'}}>
                    {qualitativeData.teamDynamics?.insights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          background: 'rgba(34, 197, 94, 0.1)',
                          border: '1px solid rgba(34, 197, 94, 0.2)',
                          borderRadius: '8px'
                        }}
                      >
                        <CheckCircle style={{width: '20px', height: '20px', color: '#22c55e'}} />
                        <span style={{color: '#cbd5e1'}}>{insight}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI Insights Tab */}
            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
                  
                  {/* Real-time Insights */}
                  <div style={cardStyle}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                      <Sparkles style={{width: '20px', height: '20px', color: '#a855f7'}} />
                      <h3 style={{fontSize: '18px', fontWeight: '600', color: 'white', margin: 0}}>
                        Real-time AI Observations
                      </h3>
                    </div>
                    
                    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                      {(insights || []).map((insight, index) => (
                        <motion.div
                          key={insight.id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          style={{
                            padding: '12px',
                            background: 'rgba(168, 85, 247, 0.1)',
                            border: '1px solid rgba(168, 85, 247, 0.2)',
                            borderRadius: '8px'
                          }}
                        >
                          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
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
                    </div>
                  </div>

                  {/* AI Analysis Summary */}
                  <div style={cardStyle}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                      <Brain style={{width: '20px', height: '20px', color: '#60a5fa'}} />
                      <h3 style={{fontSize: '18px', fontWeight: '600', color: 'white', margin: 0}}>
                        AI Deep Analysis
                      </h3>
                    </div>
                    
                    <div style={{
                      padding: '20px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '2px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '8px'
                    }}>
                      <h4 style={{color: '#60a5fa', fontSize: '16px', fontWeight: '600', marginBottom: '12px'}}>
                        🤖 AI Summary
                      </h4>
                      <p style={{color: '#cbd5e1', lineHeight: '1.6', margin: 0}}>
                        The team demonstrated exceptional collaborative dynamics with Sarah emerging as a natural facilitator. 
                        Communication patterns show high psychological safety, enabling vulnerable sharing and creative problem-solving. 
                        Mike's increased participation throughout the session indicates growing confidence and trust. 
                        The team's ability to build on each other's ideas suggests strong innovation potential.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Individual Profiles Tab */}
            {activeTab === 'individuals' && (
              <motion.div
                key="individuals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px'}}>
                  {qualitativeData.individualProfiles?.map((profile, index) => (
                    <motion.div
                      key={profile.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      style={{
                        ...cardStyle,
                        background: `linear-gradient(135deg, ${getScoreColor(profile.score)}10, rgba(51, 65, 85, 0.1))`,
                        border: `2px solid ${getScoreColor(profile.score)}30`
                      }}
                    >
                      <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px'}}>
                        <div style={{
                          fontSize: '40px',
                          width: '60px',
                          height: '60px',
                          background: `${getScoreColor(profile.score)}20`,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {profile.avatar}
                        </div>
                        <div>
                          <h4 style={{fontSize: '18px', fontWeight: 'bold', color: 'white', margin: 0}}>
                            {profile.name}
                          </h4>
                          <p style={{fontSize: '14px', color: getScoreColor(profile.score), margin: 0}}>
                            {profile.role}
                          </p>
                        </div>
                        <div style={{
                          marginLeft: 'auto',
                          fontSize: '24px',
                          fontWeight: 'bold',
                          color: getScoreColor(profile.score)
                        }}>
                          {profile.score}%
                        </div>
                      </div>

                      <div style={{display: 'grid', gap: '12px'}}>
                        <div>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                            <Star style={{width: '16px', height: '16px', color: '#22c55e'}} />
                            <span style={{fontSize: '14px', fontWeight: '600', color: '#22c55e'}}>
                              Key Strength
                            </span>
                          </div>
                          <p style={{fontSize: '14px', color: '#cbd5e1', margin: 0, paddingLeft: '24px'}}>
                            {profile.strengths}
                          </p>
                        </div>

                        <div>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                            <Target style={{width: '16px', height: '16px', color: '#f59e0b'}} />
                            <span style={{fontSize: '14px', fontWeight: '600', color: '#f59e0b'}}>
                              Growth Area
                            </span>
                          </div>
                          <p style={{fontSize: '14px', color: '#cbd5e1', margin: 0, paddingLeft: '24px'}}>
                            {profile.growthAreas}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                  {qualitativeData.recommendations?.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      style={cardStyle}
                    >
                      <div style={{display: 'flex', alignItems: 'flex-start', gap: '16px'}}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: `${getPriorityColor(rec.priority)}20`,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: '4px'
                        }}>
                          {rec.category === 'Communication' && <MessageCircle style={{width: '24px', height: '24px', color: getPriorityColor(rec.priority)}} />}
                          {rec.category === 'Innovation' && <Lightbulb style={{width: '24px', height: '24px', color: getPriorityColor(rec.priority)}} />}
                          {rec.category === 'Leadership' && <Award style={{width: '24px', height: '24px', color: getPriorityColor(rec.priority)}} />}
                        </div>

                        <div style={{flex: 1}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px'}}>
                            <h4 style={{fontSize: '18px', fontWeight: 'bold', color: 'white', margin: 0}}>
                              {rec.category}
                            </h4>
                            <span style={{
                              background: getPriorityColor(rec.priority),
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '16px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {rec.priority} Priority
                            </span>
                          </div>

                          <p style={{color: '#cbd5e1', marginBottom: '12px', fontSize: '14px'}}>
                            {rec.suggestion}
                          </p>

                          <div style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: '6px',
                            padding: '8px 12px'
                          }}>
                            <span style={{fontSize: '12px', color: '#60a5fa', fontWeight: '600'}}>
                              Expected Impact: 
                            </span>
                            <span style={{fontSize: '12px', color: '#cbd5e1', marginLeft: '4px'}}>
                              {rec.impact}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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

export default GameAnalysis
