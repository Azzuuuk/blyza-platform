import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  FileText, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Brain,
  CheckCircle,
  Star,
  AlertCircle
} from 'lucide-react'

const ManagerFeedback = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { gameData, gameTitle, teamAspect } = location.state || {}
  
  const [feedback, setFeedback] = useState({
    teamCohesion: '',
    communicationStyle: '',
    leadershipEmergence: '',
    conflictResolution: '',
    decisionMaking: '',
    overallObservations: '',
    specificChallenges: '',
    teamStrengths: '',
    areasForImprovement: ''
  })
  
  const [currentSection, setCurrentSection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const feedbackSections = [
    {
      title: "Team Dynamics Observation",
      questions: [
        {
          key: 'teamCohesion',
          label: 'How would you describe the overall team cohesion during the session?',
          type: 'textarea',
          placeholder: 'Describe how well team members worked together, supported each other, and maintained group harmony...'
        },
        {
          key: 'communicationStyle',
          label: 'What communication patterns did you observe?',
          type: 'textarea',
          placeholder: 'Note any communication styles, who spoke most/least, listening patterns, interruptions...'
        }
      ]
    },
    {
      title: "Leadership & Decision Making",
      questions: [
        {
          key: 'leadershipEmergence',
          label: 'Did natural leaders emerge during the activity? How?',
          type: 'textarea',
          placeholder: 'Identify who took initiative, guided discussions, or influenced group decisions...'
        },
        {
          key: 'decisionMaking',
          label: 'How did the team approach decision-making?',
          type: 'textarea',
          placeholder: 'Describe the decision-making process, consensus building, time taken, approach to disagreements...'
        }
      ]
    },
    {
      title: "Challenges & Conflict",
      questions: [
        {
          key: 'conflictResolution',
          label: 'How did the team handle disagreements or conflicts?',
          type: 'textarea',
          placeholder: 'Describe any tensions, how they were resolved, and the impact on team dynamics...'
        },
        {
          key: 'specificChallenges',
          label: 'What specific challenges did you notice the team struggling with?',
          type: 'textarea',
          placeholder: 'Identify pain points, bottlenecks, or recurring issues that hindered performance...'
        }
      ]
    },
    {
      title: "Strengths & Opportunities",
      questions: [
        {
          key: 'teamStrengths',
          label: 'What are the team\'s most notable strengths?',
          type: 'textarea',
          placeholder: 'Highlight what the team does exceptionally well and should continue...'
        },
        {
          key: 'areasForImprovement',
          label: 'What areas need the most improvement?',
          type: 'textarea',
          placeholder: 'Identify specific areas where the team could develop and grow...'
        },
        {
          key: 'overallObservations',
          label: 'Any additional observations or insights?',
          type: 'textarea',
          placeholder: 'Share any other important observations, patterns, or insights about team dynamics...'
        }
      ]
    }
  ]

  const handleInputChange = (key, value) => {
    setFeedback(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleNext = () => {
    if (currentSection < feedbackSections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Prepare comprehensive data for n8n webhook
      const completeAnalysisData = {
        sessionId: gameData?.sessionId || `feedback-session-${Date.now()}`,
        timestamp: new Date().toISOString(),
        quantitative: {
          gameInfo: {
            gameName: gameTitle || "Code Breakers Team Edition",
            duration: gameData?.timeElapsed || 0,
            difficulty: "spy",
            category: "team-collaboration"
          },
          quantitativeData: {
            messagesDecoded: gameData?.messagesDecoded || 0,
            totalMessages: gameData?.totalMessages || 1,
            completionRate: gameData?.completionRate || 0,
            hintsUsed: gameData?.hintsUsed || 0,
            finalScore: gameData?.finalScore || 0,
            teamworkScore: gameData?.teamworkScore || 0,
            codebreakingAttempts: gameData?.codebreakingAttempts || 0,
            chatMessages: gameData?.chatMessages || 0,
            timeElapsed: gameData?.timeElapsed || 0
          },
          playerMetrics: gameData?.playerMetrics || []
        },
        qualitative: {
          managerInfo: {
            managerName: "Manager Observer",
            managerEmail: "manager@blyza.com",
            department: "Team Development",
            teamSize: gameData?.playerCount || 4
          },
          managerObservations: {
            teamDynamics: feedback.teamCohesion,
            communicationPatterns: feedback.communicationStyle,
            leadershipEmergence: feedback.leadershipEmergence,
            decisionMaking: feedback.decisionMaking,
            conflictResolution: feedback.conflictResolution,
            teamStrengths: feedback.teamStrengths,
            areasForImprovement: feedback.areasForImprovement,
            specificChallenges: feedback.specificChallenges,
            overallObservations: feedback.overallObservations
          }
        },
        analysisType: 'comprehensive-team-analysis',
        platform: 'blyza-manager-feedback'
      }

      // Parallel: send to n8n AND store evaluation internally
      const tasks = []
      tasks.push(fetch('https://blyza.app.n8n.cloud/webhook/blyza-analysis', {
        method: 'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(completeAnalysisData)
      }).catch(()=>null))
      try {
        const { MvpAPI } = await import('../api/index.js')
        tasks.push(MvpAPI.evaluation({ sessionId: completeAnalysisData.sessionId, managerEmail: completeAnalysisData.qualitative.managerInfo.managerEmail, ratings:{}, comments: feedback.overallObservations || '' }))
      } catch(e){ console.warn('Eval save failed', e.message) }
      const results = await Promise.all(tasks)
      const webhookOk = results[0]?.ok || results[0]?.success || false

      if (webhookOk) {
        console.log('✅ Complete analysis data sent to n8n successfully')
        // Simulate additional AI processing time
        setTimeout(() => {
          navigate('/ai-analysis-report', {
            state: {
              gameData,
              feedback,
              gameTitle,
              teamAspect,
              timestamp: new Date().toISOString(),
              webhookSent: true
            }
          })
        }, 2000)
  } else {
        console.warn('⚠️ Failed to send data to n8n:', response.status)
        // Still navigate to results even if webhook fails
        setTimeout(() => {
          navigate('/ai-analysis-report', {
            state: {
              gameData,
              feedback,
              gameTitle,
              teamAspect,
              timestamp: new Date().toISOString(),
              webhookSent: false
            }
          })
        }, 2000)
      }
    } catch (error) {
      console.error('❌ Error sending data to n8n:', error)
      // Still navigate to results even if webhook fails
      setTimeout(() => {
        navigate('/ai-analysis-report', {
          state: {
            gameData,
            feedback,
            gameTitle,
            teamAspect,
            timestamp: new Date().toISOString(),
            webhookSent: false
          }
        })
      }, 2000)
    }
  }

  const isCurrentSectionComplete = () => {
    const currentQuestions = feedbackSections[currentSection].questions
    return currentQuestions.every(q => feedback[q.key]?.trim().length > 0)
  }

  const overallProgress = () => {
    const totalQuestions = feedbackSections.flatMap(s => s.questions).length
    const completedQuestions = Object.values(feedback).filter(v => v.trim().length > 0).length
    return Math.round((completedQuestions / totalQuestions) * 100)
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
        <div className="glass-card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            AI Analysis in Progress
          </h2>
          <p className="text-slate-300 mb-4">
            Processing game data and manager feedback to generate comprehensive insights...
          </p>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full animate-pulse" style={{width: '75%'}} />
          </div>
          <p className="text-sm text-slate-400 mt-2">This may take a moment...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
      color: '#e2e8f0'
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button 
                onClick={() => navigate('/')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(51, 65, 85, 0.3)',
                  background: 'rgba(51, 65, 85, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              
              <div style={{ width: 1, height: 24, background: '#475569' }}></div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #7c3aed, #2563eb)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare style={{ width: 20, height: 20, color: 'white' }} />
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>Manager Feedback</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '896px', margin: '0 auto', padding: '80px 24px 32px' }}>
        {/* Progress Steps */}
        <div style={{
          background: 'rgba(51, 65, 85, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(51, 65, 85, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {feedbackSections.map((section, index) => (
              <div key={index} className="flex items-center">
                <div style={{ width: 32, height: 32, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, background: index < currentSection ? '#22c55e' : (index === currentSection ? '#7c3aed' : '#475569'), color: 'white' }}>
                  {index < currentSection ? <CheckCircle style={{ width: 20, height: 20 }} /> : index + 1}
                </div>
                {index < feedbackSections.length - 1 && (
                  <div style={{ width: 64, height: 4, margin: '0 8px', background: index < currentSection ? '#22c55e' : '#475569', borderRadius: 9999 }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', color: '#cbd5e1', fontSize: 12 }}>
            Step {currentSection + 1} of {feedbackSections.length}: {feedbackSections[currentSection].title}
          </div>
        </div>

        {/* Current Section */}
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          style={{
            background: 'rgba(51, 65, 85, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(51, 65, 85, 0.2)',
            borderRadius: '16px',
            padding: '32px'
          }}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {feedbackSections[currentSection].title}
            </h2>
            <p className="text-slate-300">
              Share your observations about the team's behavior and dynamics during the session.
            </p>
          </div>

          <div className="space-y-8">
            {feedbackSections[currentSection].questions.map((question) => (
              <div key={question.key}>
                <label className="block text-lg font-semibold text-white mb-3">
                  {question.label}
                </label>
                <textarea
                  value={feedback[question.key]}
                  onChange={(e) => handleInputChange(question.key, e.target.value)}
                  placeholder={question.placeholder}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(51, 65, 85, 0.3)',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    resize: 'none'
                  }}
                />
                <div className="mt-1 text-right">
                  <span className={`text-sm ${
                    feedback[question.key]?.length > 50 ? 'text-green-400' : 'text-slate-400'
                  }`}>
                    {feedback[question.key]?.length || 0} characters
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-600">
            <button
              onClick={handlePrevious}
              disabled={currentSection === 0}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(51, 65, 85, 0.3)',
                background: 'rgba(51, 65, 85, 0.1)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: currentSection === 0 ? 'not-allowed' : 'pointer',
                opacity: currentSection === 0 ? 0.5 : 1
              }}
            >
              Previous
            </button>

            <div className="text-center">
              <div className="text-sm text-slate-300 mb-1">
                Section Progress
              </div>
              <div className="w-32 bg-slate-600 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(feedbackSections[currentSection].questions.filter(q => 
                      feedback[q.key]?.trim().length > 0
                    ).length / feedbackSections[currentSection].questions.length) * 100}%` 
                  }}
                />
              </div>
            </div>

            {currentSection === feedbackSections.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!isCurrentSectionComplete()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: !isCurrentSectionComplete() 
                    ? 'rgba(71, 85, 105, 0.5)' 
                    : 'linear-gradient(135deg, #7c3aed, #2563eb)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: !isCurrentSectionComplete() ? 'not-allowed' : 'pointer',
                  opacity: !isCurrentSectionComplete() ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Brain className="w-4 h-4" />
                <span>Generate AI Analysis</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isCurrentSectionComplete()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: !isCurrentSectionComplete() 
                    ? 'rgba(71, 85, 105, 0.5)' 
                    : 'linear-gradient(135deg, #7c3aed, #2563eb)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: !isCurrentSectionComplete() ? 'not-allowed' : 'pointer',
                  opacity: !isCurrentSectionComplete() ? 0.5 : 1
                }}
              >
                Next Section
              </button>
            )}
          </div>
        </motion.div>

        {/* Game Data Summary */}
        <div style={{
          marginTop: '32px',
          background: 'rgba(51, 65, 85, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
            Session Data Summary
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(gameData?.engagement || 0)}%
              </div>
              <div className="text-sm text-slate-300">Engagement</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(gameData?.participation || 0)}%
              </div>
              <div className="text-sm text-slate-300">Participation</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(gameData?.collaboration || 0)}%
              </div>
              <div className="text-sm text-slate-300">Collaboration</div>
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-slate-300">
            This quantitative data will be combined with your qualitative feedback for comprehensive analysis.
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerFeedback
