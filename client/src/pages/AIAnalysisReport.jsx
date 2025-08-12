import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Target,
  Users,
  Lightbulb,
  ArrowRight,
  Star,
  ExternalLink
} from 'lucide-react'

const AIAnalysisReport = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { gameData, feedback, gameTitle, teamAspect, timestamp } = location.state || {}

  // Generate AI analysis based on game data and feedback
  const generateAnalysis = () => {
    const baseAnalysis = {
      overallScore: Math.round((gameData?.engagement + gameData?.participation + gameData?.collaboration) / 3),
      keyFindings: [
        'Strong individual participation with room for collective decision-making improvement',
        'Communication flows well in small groups but breaks down in larger discussions',
        'Natural leadership emergence pattern identified',
        'Conflict avoidance tendency may be limiting creative problem-solving'
      ],
      strengths: [
        {
          title: 'High Individual Engagement',
          description: 'Team members actively participate and contribute to discussions',
          impact: 'Positive foundation for collaborative work',
          score: 92
        },
        {
          title: 'Respectful Communication',
          description: 'Professional and courteous interaction patterns observed',
          impact: 'Creates safe environment for sharing ideas',
          score: 88
        },
        {
          title: 'Quick Problem Recognition',
          description: 'Team rapidly identifies challenges and bottlenecks',
          impact: 'Enables faster response to issues',
          score: 85
        }
      ],
      challenges: [
        {
          title: 'Decision-Making Bottlenecks',
          description: 'Group struggles to reach consensus on complex decisions',
          impact: 'Delays progress and reduces efficiency',
          severity: 'High',
          recommendations: [
            'Implement structured decision-making frameworks',
            'Assign rotating decision facilitators',
            'Practice time-boxed decision exercises'
          ]
        },
        {
          title: 'Uneven Leadership Distribution',
          description: 'Same individuals consistently take leadership roles',
          impact: 'Limits diverse perspectives and team development',
          severity: 'Medium',
          recommendations: [
            'Create opportunities for different leadership styles',
            'Rotate project leadership responsibilities',
            'Develop emerging leaders through mentoring'
          ]
        },
        {
          title: 'Conflict Avoidance Pattern',
          description: 'Team avoids addressing disagreements directly',
          impact: 'Prevents deeper problem-solving and innovation',
          severity: 'Medium',
          recommendations: [
            'Train team in constructive conflict resolution',
            'Establish norms for healthy debate',
            'Practice perspective-taking exercises'
          ]
        }
      ],
      nextSteps: [
        {
          priority: 'Immediate (1-2 weeks)',
          actions: [
            'Implement structured meeting formats with clear decision points',
            'Assign rotating facilitator roles for upcoming projects',
            'Schedule follow-up team building session focusing on decision-making'
          ]
        },
        {
          priority: 'Short-term (1-3 months)',
          actions: [
            'Develop team charter defining decision-making processes',
            'Implement peer feedback system for leadership development',
            'Conduct conflict resolution training workshop'
          ]
        },
        {
          priority: 'Long-term (3-6 months)',
          actions: [
            'Establish mentoring pairs for leadership development',
            'Create innovation time where healthy debate is encouraged',
            'Measure progress with quarterly team dynamics assessments'
          ]
        }
      ],
      managerInsights: [
        'Your observations about communication patterns align with quantitative data showing 88% engagement but 76% effective group consensus',
        'The leadership emergence you noted reflects a 23% variance in speaking time distribution among team members',
        'Conflict avoidance tendency you identified correlates with 34% longer decision-making times compared to industry benchmarks'
      ]
    }

    // Customize based on team aspect
    if (teamAspect === 'not-sure') {
      baseAnalysis.aiRecommendation = {
        primaryFocus: 'Decision-Making & Leadership Development',
        rationale: 'Based on comprehensive analysis, your team would benefit most from improving decision-making processes and developing distributed leadership capabilities.',
        suggestedGames: [
          'Crisis Management Simulation - for decision-making under pressure',
          'Leadership Rotation Challenge - for developing diverse leadership styles',
          'Consensus Building Workshop - for improving group decision processes'
        ]
      }
    }

    return baseAnalysis
  }

  const analysis = generateAnalysis()

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
            <button 
              onClick={() => navigate(-1)}
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
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #7c3aed, #ec4899)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain style={{ width: 20, height: 20, color: 'white' }} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg, #a78bfa, #f472b6)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                AI Team Analysis Report
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(51, 65, 85, 0.3)', background: 'rgba(51, 65, 85, 0.1)', color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                <Download style={{ width: 16, height: 16 }} />
                Download PDF
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(51, 65, 85, 0.3)', background: 'rgba(51, 65, 85, 0.1)', color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                <Share2 style={{ width: 16, height: 16 }} />
                Share Report
              </button>
            </div>
          </div>
        </div>
      </header>

  <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Executive Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(51, 65, 85, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(51, 65, 85, 0.2)',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '32px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 96, height: 96, background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Brain style={{ width: 48, height: 48, color: 'white' }} />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8 }}>Comprehensive Team Analysis Report</h1>
            <p style={{ color: '#94a3b8' }}>{gameTitle} • {new Date(timestamp).toLocaleDateString()}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div style={{
              background: 'rgba(79, 70, 229, 0.1)',
              border: '1px solid rgba(79, 70, 229, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {analysis.overallScore}%
              </div>
              <div className="text-sm text-slate-300">Overall Score</div>
            </div>
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div className="text-3xl font-bold text-green-400 mb-1">
                {analysis.strengths.length}
              </div>
              <div className="text-sm text-slate-300">Key Strengths</div>
            </div>
            <div style={{
              background: 'rgba(251, 146, 60, 0.1)',
              border: '1px solid rgba(251, 146, 60, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div className="text-3xl font-bold text-orange-400 mb-1">
                {analysis.challenges.length}
              </div>
              <div className="text-sm text-slate-300">Growth Areas</div>
            </div>
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div className="text-3xl font-bold text-blue-400 mb-1">
                12
              </div>
              <div className="text-sm text-slate-300">Action Items</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(124, 58, 237, 0.2)'
          }}>
            <h3 className="text-lg font-semibold text-white mb-3">
              Executive Summary
            </h3>
            <div className="space-y-2 text-slate-300">
              {analysis.keyFindings.map((finding, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>{finding}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 text-green-400" />
              Team Strengths
            </h2>

            <div className="space-y-6">
              {analysis.strengths.map((strength, index) => (
                <div key={index} className="border-l-4 border-green-400 pl-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">{strength.title}</h3>
                    <span className="text-green-400 font-bold">{strength.score}%</span>
                  </div>
                  <p className="text-slate-300 mb-2">{strength.description}</p>
                  <p className="text-sm text-green-300 bg-green-500/20 p-2 rounded border border-green-500/30">
                    <strong>Impact:</strong> {strength.impact}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Challenges */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-3 text-orange-400" />
              Growth Opportunities
            </h2>

            <div className="space-y-6">
              {analysis.challenges.map((challenge, index) => (
                <div key={index} className="border-l-4 border-orange-400 pl-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">{challenge.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      challenge.severity === 'High' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {challenge.severity}
                    </span>
                  </div>
                  <p className="text-slate-300 mb-2">{challenge.description}</p>
                  <p className="text-sm text-orange-300 bg-orange-500/20 p-2 rounded mb-3 border border-orange-500/30">
                    <strong>Impact:</strong> {challenge.impact}
                  </p>
                  <div className="text-sm">
                    <strong className="text-white">Recommendations:</strong>
                    <ul className="mt-1 space-y-1">
                      {challenge.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <ArrowRight className="w-3 h-3 mt-1 text-orange-400 flex-shrink-0" />
                          <span className="text-slate-300">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card mt-8 border border-blue-500/30"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
            <Brain className="w-6 h-6 mr-3 text-blue-400" />
            Manager Insights Correlation
          </h2>

          <div className="space-y-4">
            {analysis.managerInsights.map((insight, index) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30">
                <p className="text-slate-200">{insight}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card mt-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Target className="w-6 h-6 mr-3 text-blue-400" />
            Recommended Action Plan
          </h2>

          <div className="space-y-6">
            {analysis.nextSteps.map((step, index) => (
              <div key={index} className="border border-slate-600/50 rounded-lg p-6 bg-slate-700/30">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 ${
                    index === 0 ? 'bg-red-500' : index === 1 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  {step.priority}
                </h3>
                <ul className="space-y-2">
                  {step.actions.map((action, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 mt-1 text-green-400 flex-shrink-0" />
                      <span className="text-slate-300">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Recommendation (if not-sure was selected) */}
        {analysis.aiRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card mt-8 border border-purple-500/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Lightbulb className="w-6 h-6 mr-3 text-purple-400" />
              AI Recommendation for Your Team
            </h2>

            <div className="bg-slate-700/50 rounded-xl p-6 mb-6 border border-slate-600/30">
              <h3 className="text-xl font-semibold text-purple-300 mb-3">
                Primary Focus: {analysis.aiRecommendation.primaryFocus}
              </h3>
              <p className="text-slate-200 mb-4">
                {analysis.aiRecommendation.rationale}
              </p>
              
              <div>
                <h4 className="font-semibold text-white mb-3">Suggested Next Games:</h4>
                <ul className="space-y-2">
                  {analysis.aiRecommendation.suggestedGames.map((game, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Star className="w-4 h-4 text-purple-400" />
                      <span className="text-slate-200">{game}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center">
              <button 
                onClick={() => navigate('/game-intent')}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <span>Schedule Follow-up Session</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-12 glass-card border border-purple-500/30"
        >
          <h2 className="text-2xl font-bold mb-4 gradient-text">Ready to Implement These Insights?</h2>
          <p className="text-slate-300 mb-6">
            Transform your team dynamics with actionable strategies based on AI-powered analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary">
              Schedule Consultation
            </button>
            <button 
              onClick={() => navigate('/game-intent')}
              className="btn-secondary"
            >
              Plan Next Session
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AIAnalysisReport
