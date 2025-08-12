import React, { useState, useEffect } from 'react'
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
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
  Mail
} from 'lucide-react'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const ManagerDashboard = () => {
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch reports
      const reportsResponse = await fetch('http://localhost:3001/api/dashboard/reports')
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setReports(reportsData.reports || [])
        
        // Select the most recent report by default
        if (reportsData.reports && reportsData.reports.length > 0) {
          setSelectedReport(reportsData.reports[0])
        }
      } else {
        console.warn('Failed to fetch reports from backend, using mock data')
      }

      // Fetch analytics
      const analyticsResponse = await fetch('http://localhost:3001/api/dashboard/analytics')
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData.analytics || {})
      } else {
        console.warn('Failed to fetch analytics from backend, using mock data')
      }

      // If either request failed, load mock data
      if (!reportsResponse.ok || !analyticsResponse.ok) {
        loadMockData()
      }
        
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError(error.message)
      
      // Load mock data if backend is not available
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = () => {
    // Mock data for development
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
          completionRate: 92
        }
      }
    ]

    const mockAnalytics = {
      totalSessions: 24,
      averageEngagement: 84,
      teamCount: 6,
      trendsData: {
        engagement: [78, 82, 85, 87, 84, 89],
        participation: [88, 85, 92, 89, 87, 91]
      }
    }

    setReports(mockReports)
    setAnalytics(mockAnalytics)
    if (mockReports.length > 0) {
      setSelectedReport(mockReports[0])
    }
  }

  const MetricCard = ({ title, value, trend, icon: Icon, color = 'blue' }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="flex flex-col items-end">
          <Icon className={`w-8 h-8 text-${color}-500`} />
          {trend && (
            <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
      </div>
    </div>
  )

  const EngagementChart = ({ data }) => {
    const chartData = {
      labels: data?.labels || ['Session 1', 'Session 2', 'Session 3', 'Session 4'],
      datasets: [
        {
          label: 'Participation Rate',
          data: data?.participation || [85, 92, 78, 96],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
        },
        {
          label: 'Engagement Score',
          data: data?.engagement || [78, 85, 82, 91],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.1,
        }
      ]
    }

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Team Engagement Trends'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }

    return <Line data={chartData} options={options} />
  }

  const TeamDynamicsRadar = ({ data }) => {
    const chartData = {
      labels: ['Communication', 'Leadership', 'Collaboration', 'Problem Solving', 'Creativity', 'Adaptability'],
      datasets: [
        {
          label: 'Current Session',
          data: data?.current || [85, 78, 92, 88, 76, 89],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgb(59, 130, 246)',
          pointBackgroundColor: 'rgb(59, 130, 246)',
        },
        {
          label: 'Team Average',
          data: data?.average || [80, 82, 78, 85, 80, 83],
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'rgb(16, 185, 129)',
          pointBackgroundColor: 'rgb(16, 185, 129)',
        }
      ]
    }

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Team Dynamics Analysis'
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100
        }
      }
    }

    return <Radar data={chartData} options={options} />
  }

  const InsightCard = ({ type, title, insights }) => {
    const getIcon = () => {
      switch (type) {
        case 'strength': return <CheckCircle className="w-5 h-5 text-green-500" />
        case 'improvement': return <AlertCircle className="w-5 h-5 text-yellow-500" />
        case 'recommendation': return <TrendingUp className="w-5 h-5 text-blue-500" />
        default: return <FileText className="w-5 h-5 text-gray-500" />
      }
    }

    const getBgColor = () => {
      switch (type) {
        case 'strength': return 'bg-green-50 border-green-200'
        case 'improvement': return 'bg-yellow-50 border-yellow-200'
        case 'recommendation': return 'bg-blue-50 border-blue-200'
        default: return 'bg-gray-50 border-gray-200'
      }
    }

    return (
      <div className={`p-4 rounded-lg border ${getBgColor()}`}>
        <div className="flex items-center gap-2 mb-3">
          {getIcon()}
          <h4 className="font-semibold text-gray-900">{title}</h4>
        </div>
        <ul className="space-y-2">
          {(insights || []).map((insight, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
              {insight}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const ReportsList = ({ reports, selectedReport, onSelectReport }) => (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Recent Reports</h3>
      <div className="space-y-2">
        {reports.map((report) => (
          <button
            key={report.sessionId}
            onClick={() => onSelectReport(report)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              selectedReport?.sessionId === report.sessionId
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium text-sm text-gray-900">
              {report.gameName || 'Team Session'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(report.timestamp).toLocaleDateString()}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {report.teamSize || 'N/A'} participants
            </div>
          </button>
        ))}
        {reports.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No reports available yet</p>
          </div>
        )}
      </div>
    </div>
  )

  const InteractiveReport = ({ report }) => {
    if (!report) return null

    const mockChartData = {
      engagement: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        participation: [85, 92, 78, 96],
        engagement: [78, 85, 82, 91]
      },
      teamDynamics: {
        current: [85, 78, 92, 88, 76, 89],
        average: [80, 82, 78, 85, 80, 83]
      }
    }

    const mockInsights = {
      strengths: [
        "High participation rate across all team members",
        "Strong collaborative problem-solving skills demonstrated",
        "Clear communication patterns observed during activities"
      ],
      improvements: [
        "Some team members could be more proactive in discussions",
        "Time management during group activities needs attention",
        "Consider rotating leadership roles more frequently"
      ],
      recommendations: [
        "Schedule follow-up team building session in 4 weeks",
        "Implement weekly team check-ins to maintain momentum",
        "Focus next session on leadership development"
      ]
    }

    return (
      <div className="space-y-8">
        {/* Executive Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Executive Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard 
              title="Overall Engagement" 
              value="87%"
              trend={5}
              icon={TrendingUp}
              color="green"
            />
            <MetricCard 
              title="Team Cohesion" 
              value="8.4/10"
              trend={2}
              icon={Users}
              color="blue"
            />
            <MetricCard 
              title="Communication Score" 
              value="92%"
              trend={-1}
              icon={BarChart3}
              color="purple"
            />
            <MetricCard 
              title="Completion Rate" 
              value="96%"
              trend={8}
              icon={CheckCircle}
              color="green"
            />
          </div>
        </div>

        {/* Interactive Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <EngagementChart data={mockChartData.engagement} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <TeamDynamicsRadar data={mockChartData.teamDynamics} />
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">AI-Generated Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InsightCard 
              type="strength" 
              title="Team Strengths"
              insights={mockInsights.strengths}
            />
            <InsightCard 
              type="improvement" 
              title="Areas for Growth"
              insights={mockInsights.improvements}
            />
            <InsightCard 
              type="recommendation" 
              title="Recommended Actions"
              insights={mockInsights.recommendations}
            />
          </div>
        </div>

        {/* Action Items */}
        <div className="flex gap-4 flex-wrap">
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Full Report
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedule Follow-up
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Share Report
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading dashboard
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="mt-2 text-gray-600">Track team performance and engagement insights</p>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            title="Total Sessions" 
            value={analytics.totalSessions || 0}
            trend={12}
            icon={Calendar}
            color="blue"
          />
          <MetricCard 
            title="Average Engagement" 
            value={`${analytics.averageEngagement || 0}%`}
            trend={5}
            icon={TrendingUp}
            color="green"
          />
          <MetricCard 
            title="Active Teams" 
            value={analytics.teamCount || 0}
            trend={8}
            icon={Users}
            color="purple"
          />
          <MetricCard 
            title="Completion Rate" 
            value="94%"
            trend={3}
            icon={CheckCircle}
            color="emerald"
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report List */}
        <div className="lg:col-span-1">
          <ReportsList 
            reports={reports}
            selectedReport={selectedReport}
            onSelectReport={setSelectedReport}
          />
        </div>

        {/* Interactive Report View */}
        <div className="lg:col-span-3">
          {selectedReport ? (
            <InteractiveReport report={selectedReport} />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Report Selected</h3>
              <p className="text-gray-500 mb-6">Choose a report from the list to view detailed analysis</p>
              <button 
                onClick={() => window.location.href = '/game-intent'}
                className="btn-primary"
              >
                Start New Team Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard
