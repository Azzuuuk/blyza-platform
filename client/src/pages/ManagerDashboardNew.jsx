import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Download, 
  Calendar, 
  Users, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  Mail,
  Brain,
  Star,
  Trophy
} from 'lucide-react'

const ManagerDashboardNew = () => {
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

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
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Mock data for demo
      const mockReports = [
        {
          id: 1,
          sessionId: 'session-001',
          gameName: 'Tower Building Challenge',
          teamName: 'Development Team A',
          timestamp: new Date().toISOString(),
          aiAnalysis: {
            summary: 'Team showed excellent collaboration and communication throughout the session.',
            strengths: ['Strong leadership', 'Clear communication', 'Creative problem-solving'],
            areas_for_improvement: ['Time management', 'Resource allocation'],
            recommendations: ['Follow-up session in 2 weeks', 'Focus on time management exercises']
          },
          metrics: {
            participationRate: 95,
            engagementScore: 87,
            collaborationIndex: 92,
            completionRate: 88
          }
        },
        {
          id: 2,
          sessionId: 'session-002',
          gameName: 'Problem Solving Quest',
          teamName: 'Marketing Team B',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          aiAnalysis: {
            summary: 'Team demonstrated strong analytical skills but could improve on communication.',
            strengths: ['Analytical thinking', 'Individual expertise', 'Goal-oriented approach'],
            areas_for_improvement: ['Inter-team communication', 'Delegation skills'],
            recommendations: ['Communication workshop', 'Regular team building exercises']
          },
          metrics: {
            participationRate: 78,
            engagementScore: 82,
            collaborationIndex: 75,
            completionRate: 91
          }
        }
      ]

      const mockAnalytics = {
        totalSessions: 24,
        averageEngagement: 84,
        teamCount: 8,
        completionRate: 89
      }

      setReports(mockReports)
      setAnalytics(mockAnalytics)
      setSelectedReport(mockReports[0])
      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setLoading(false)
    }
  }

  const MetricCard = ({ title, value, trend, icon: Icon, color }) => {
    const getColorStyles = () => {
      const colors = {
        blue: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', icon: '#60a5fa' },
        green: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', icon: '#4ade80' },
        purple: { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.3)', icon: '#a78bfa' },
        emerald: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', icon: '#34d399' }
      }
      return colors[color] || colors.blue
    }

    const colorStyles = getColorStyles()

    return (
      <motion.div
        style={{
          ...cardStyle,
          background: colorStyles.bg,
          border: `1px solid ${colorStyles.border}`
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Icon style={{ width: '24px', height: '24px', color: colorStyles.icon }} />
          {trend && (
            <span style={{ 
              fontSize: '0.8rem', 
              color: trend > 0 ? '#4ade80' : '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <TrendingUp style={{ width: '12px', height: '12px' }} />
              +{trend}%
            </span>
          )}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '4px' }}>
          {value}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          {title}
        </div>
      </motion.div>
    )
  }

  const ReportCard = ({ report, isSelected, onClick }) => (
    <motion.div
      style={{
        ...cardStyle,
        background: isSelected ? 'rgba(124, 58, 237, 0.2)' : cardStyle.background,
        border: isSelected ? '1px solid rgba(124, 58, 237, 0.5)' : cardStyle.border,
        cursor: 'pointer',
        marginBottom: '16px'
      }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
    >
      <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px' }}>
        {report.gameName}
      </div>
      <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '8px' }}>
        {report.teamName}
      </div>
      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
        {new Date(report.timestamp).toLocaleDateString()}
      </div>
      <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
        <div style={{ fontSize: '0.8rem', color: '#4ade80' }}>
          Engagement: {report.metrics.engagementScore}%
        </div>
        <div style={{ fontSize: '0.8rem', color: '#60a5fa' }}>
          Collaboration: {report.metrics.collaborationIndex}%
        </div>
      </div>
    </motion.div>
  )

  const AnalysisSection = ({ report }) => (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* AI Summary */}
      <motion.div
        style={cardStyle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Brain style={{ width: '24px', height: '24px', color: '#a78bfa' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#e2e8f0', margin: 0 }}>
            AI Analysis Summary
          </h3>
        </div>
        <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
          {report.aiAnalysis.summary}
        </p>
      </motion.div>

      {/* Strengths & Improvements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <motion.div
          style={{
            ...cardStyle,
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Trophy style={{ width: '20px', height: '20px', color: '#4ade80' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#e2e8f0', margin: 0 }}>
              Strengths
            </h4>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {report.aiAnalysis.strengths.map((strength, index) => (
              <li key={index} style={{ 
                color: '#94a3b8', 
                marginBottom: '8px',
                paddingLeft: '16px',
                position: 'relative'
              }}>
                <CheckCircle style={{ 
                  width: '12px', 
                  height: '12px', 
                  color: '#4ade80',
                  position: 'absolute',
                  left: 0,
                  top: '4px'
                }} />
                {strength}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          style={{
            ...cardStyle,
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)'
          }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <TrendingUp style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#e2e8f0', margin: 0 }}>
              Areas for Improvement
            </h4>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {report.aiAnalysis.areas_for_improvement.map((area, index) => (
              <li key={index} style={{ 
                color: '#94a3b8', 
                marginBottom: '8px',
                paddingLeft: '16px',
                position: 'relative'
              }}>
                <AlertCircle style={{ 
                  width: '12px', 
                  height: '12px', 
                  color: '#fbbf24',
                  position: 'absolute',
                  left: 0,
                  top: '4px'
                }} />
                {area}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div
        style={{
          ...cardStyle,
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Star style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#e2e8f0', margin: 0 }}>
            AI Recommendations
          </h4>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {report.aiAnalysis.recommendations.map((rec, index) => (
            <li key={index} style={{ 
              color: '#94a3b8', 
              marginBottom: '8px',
              paddingLeft: '16px',
              position: 'relative'
            }}>
              <Star style={{ 
                width: '12px', 
                height: '12px', 
                color: '#60a5fa',
                position: 'absolute',
                left: 0,
                top: '4px'
              }} />
              {rec}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  )

  if (loading) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Clock style={{ width: '48px', height: '48px', color: '#7c3aed', margin: '0 auto 16px' }} />
          <div style={{ fontSize: '1.2rem', color: '#e2e8f0' }}>Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        {/* Header */}
        <motion.div
          style={{ marginBottom: '32px' }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            color: '#e2e8f0',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Manager Dashboard
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            Track team performance and engagement insights powered by AI
          </p>
          
          {/* Demo Indicator */}
          <div style={{
            ...cardStyle,
            marginTop: '16px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <AlertCircle style={{ width: '16px', height: '16px', color: '#60a5fa', marginRight: '8px' }} />
              <span style={{ fontSize: '0.9rem', color: '#93c5fd' }}>
                Demo mode: Displaying sample data and AI analysis
              </span>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        {analytics && (
          <motion.div
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '24px', 
              marginBottom: '32px' 
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <MetricCard 
              title="Total Sessions" 
              value={analytics.totalSessions}
              trend={12}
              icon={Calendar}
              color="blue"
            />
            <MetricCard 
              title="Average Engagement" 
              value={`${analytics.averageEngagement}%`}
              trend={5}
              icon={TrendingUp}
              color="green"
            />
            <MetricCard 
              title="Active Teams" 
              value={analytics.teamCount}
              trend={8}
              icon={Users}
              color="purple"
            />
            <MetricCard 
              title="Completion Rate" 
              value={`${analytics.completionRate}%`}
              trend={3}
              icon={CheckCircle}
              color="emerald"
            />
          </motion.div>
        )}

        {/* Reports Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '32px' }}>
          {/* Reports List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '16px' }}>
              Recent Reports
            </h3>
            {reports.map(report => (
              <ReportCard 
                key={report.id}
                report={report}
                isSelected={selectedReport?.id === report.id}
                onClick={() => setSelectedReport(report)}
              />
            ))}
          </motion.div>

          {/* Analysis Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {selectedReport ? (
              <AnalysisSection report={selectedReport} />
            ) : (
              <div style={{
                ...cardStyle,
                padding: '48px',
                textAlign: 'center'
              }}>
                <FileText style={{ 
                  width: '64px', 
                  height: '64px', 
                  margin: '0 auto 16px', 
                  color: '#64748b' 
                }} />
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '500', 
                  color: '#e2e8f0', 
                  marginBottom: '8px' 
                }}>
                  No Report Selected
                </h3>
                <p style={{ 
                  color: '#94a3b8', 
                  marginBottom: '24px' 
                }}>
                  Choose a report from the list to view detailed AI analysis
                </p>
                <button 
                  onClick={() => window.location.href = '/game-intent'}
                  style={buttonStyle}
                >
                  <Users style={{ width: '16px', height: '16px' }} />
                  Start New Team Session
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboardNew
