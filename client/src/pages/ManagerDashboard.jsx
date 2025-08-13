import React, { useState, useEffect } from 'react'
import { ReportsAPI, GamesAPI, MvpAPI } from '../api/index.js'
import AuthPanel from '../components/AuthPanel.jsx'
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
  const [sessionInput, setSessionInput] = useState('')
  const [deepReport, setDeepReport] = useState(null)
  const [deepLoading, setDeepLoading] = useState(false)
  const [scenarios, setScenarios] = useState([])
  const [scenarioLoading, setScenarioLoading] = useState(false)
  const [templates, setTemplates] = useState([])
  const [templateName, setTemplateName] = useState('')
  const [templateContent, setTemplateContent] = useState('')
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [history, setHistory] = useState({ transactions:[], redemptions:[] })
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const [reportEmail, setReportEmail] = useState('')
  const [reportCompany, setReportCompany] = useState('')
  const [reportMessage, setReportMessage] = useState('')
  const [managerBalance, setManagerBalance] = useState(null)
  const [pdfReports, setPdfReports] = useState([])

  useEffect(() => {
    console.log('🚀 Dashboard component mounted')
    loadMockData()
    setLoading(false)
  loadMvpExtras()
  loadPdfReports()
    const redemptionHandler = () => refreshHistory()
    window.addEventListener('blyza:rewards:redeemed', redemptionHandler)
    return () => window.removeEventListener('blyza:rewards:redeemed', redemptionHandler)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      let reportsSuccess = false
      let analyticsSuccess = false

      // Try to fetch reports
      try {
        const reportsResponse = await fetch('http://localhost:3001/api/dashboard/reports')
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json()
          setReports(reportsData.reports || [])
          
          // Select the most recent report by default
          if (reportsData.reports && reportsData.reports.length > 0) {
            setSelectedReport(reportsData.reports[0])
          }
          reportsSuccess = true
        }
      } catch (err) {
        console.warn('Reports fetch failed:', err.message)
      }

      // Try to fetch analytics
      try {
        const analyticsResponse = await fetch('http://localhost:3001/api/dashboard/analytics')
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json()
          setAnalytics(analyticsData.analytics || {})
          analyticsSuccess = true
        }
      } catch (err) {
        console.warn('Analytics fetch failed:', err.message)
      }

      // If either request failed, load mock data
      if (!reportsSuccess || !analyticsSuccess) {
        console.log('Loading mock data because backend is not available')
        loadMockData()
      }
        
    } catch (error) {
      console.error('Error in fetchDashboardData:', error)
      // Always load mock data if there's any error
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMvpExtras = async () => {
    try {
      const [tpls] = await Promise.all([
        MvpAPI.listTemplates().catch(()=>({ templates:[] }))
      ])
      setTemplates(tpls.templates||[])
      // if jwt user context not set we still can’t fetch balance-specific but leave placeholder
      try {
        const base = import.meta.env.VITE_API_BASE || 'http://localhost:3001'
        const res = await fetch(`${base}/api/mvp/manager/overview`, { headers:{ 'x-api-key': import.meta.env.VITE_MVP_API_KEY||'' }})
        if(res.ok){ const j = await res.json(); if(j.success) setManagerBalance(j.balance) }
      } catch(_e){}
    } catch(e){ /* silent */ }
  }

  const loadPdfReports = async () => {
    try {
      const email = 'manager@blyza.com'
      const resp = await ReportsAPI.listPdf(email).catch(()=>({ reports:[] }))
      setPdfReports(resp.reports||[])
    } catch(_e){}
  }

  const refreshHistory = async (userId) => {
    try {
      const [tx, rd] = await Promise.all([
        MvpAPI.transactions().catch(()=>({ transactions:[] })),
        userId ? MvpAPI.redemptions(userId).catch(()=>({ redemptions:[] })) : Promise.resolve({ redemptions:[] })
      ])
      setHistory({ transactions: tx.transactions||[], redemptions: rd.redemptions||[] })
    } catch(e){}
  }

  const handleSaveTemplate = async () => {
    if(!templateName || !templateContent) return
    setSavingTemplate(true)
    try {
      const resp = await MvpAPI.saveTemplate({ name: templateName, content: templateContent, author: 'manager@blyza.com' })
      setTemplates(t=>[resp.template, ...t])
      setTemplateName('')
      setTemplateContent('')
    } catch(e){ setError(e.message) } finally { setSavingTemplate(false) }
  }

  const loadMockData = () => {
    console.log('🎭 Loading mock data for dashboard')
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
    console.log('✅ Mock data loaded:', { reports: mockReports.length, analytics: mockAnalytics })
  }

  // Trigger deep report generation (server AI + analytics)
  const handleGenerateDeepReport = async () => {
    if(!sessionInput) return;
    try {
      setDeepLoading(true)
      const resp = await ReportsAPI.deep(sessionInput)
      setDeepReport(resp.report)
    } catch(e){
      setError(e.message)
    } finally { setDeepLoading(false) }
  }

  const handleGeneratePdf = async () => {
    if(!sessionInput) { setReportMessage('Enter session ID'); return }
    try {
      setPdfGenerating(true)
      setReportMessage('Generating PDF...')
      const blob = await ReportsAPI.generatePDF({
        sessionId: sessionInput,
        gameId:'generic',
        companyInfo: reportCompany ? { name: reportCompany } : {},
        emailSettings: reportEmail ? { sendEmail:true, recipientEmail: reportEmail } : undefined
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `team-report-${sessionInput}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setReportMessage(reportEmail ? 'PDF downloaded & email requested (if SMTP configured)' : 'PDF downloaded')
    } catch(e){
      setReportMessage(`PDF failed: ${e.message}`)
    } finally { setPdfGenerating(false) }
  }

  const handleComputeStats = async () => {
    if(!sessionInput) return;
    try {
      await ReportsAPI.compute(sessionInput)
      const stats = await ReportsAPI.stats(sessionInput)
      console.log('Stats', stats)
    } catch(e){ setError(e.message) }
  }

  const handleGenerateScenarios = async () => {
    if(!selectedReport) return;
    try {
      setScenarioLoading(true)
      const resp = await GamesAPI.scenarios(selectedReport.gameName?.toLowerCase().replace(/\s+/g,'-')||'team-game', 'Team needs communication focus')
      setScenarios(resp.scenarios || [])
    } catch(e){ setError(e.message) } finally { setScenarioLoading(false) }
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

  // Common styles for dark theme
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

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        {/* Dashboard Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#e2e8f0',
            marginBottom: '8px'
          }}>
            Manager Dashboard
          </h1>
          {managerBalance !== null && (
            <div className="mt-2 inline-block px-3 py-1 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-xs text-indigo-200">
              Balance: {managerBalance} pts
            </div>
          )}
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            Track team performance and engagement insights
          </p>
          <div className="mt-4"><AuthPanel /></div>
          {pdfReports.length > 0 && (
            <div className="mt-4 p-4 bg-slate-800/40 rounded border border-slate-600/40">
              <div className="font-semibold mb-2 text-slate-200 flex items-center gap-2"><FileText className="w-4 h-4"/> Recent PDF Reports</div>
              <ul className="text-xs space-y-1 max-h-40 overflow-auto pr-1">
                {pdfReports.slice(0,10).map(r=> (
                  <li key={r.id} className="flex justify-between gap-2">
                    <span className="truncate">{r.session_id}</span>
                    <span className="opacity-60">{new Date(r.created_at||r.createdAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </div>) }
          { (history.transactions.length || history.redemptions.length) && (
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-800/40 rounded border border-slate-600/40">
                <div className="font-semibold mb-2 text-slate-200">Recent Points</div>
                <ul className="text-xs space-y-1 max-h-40 overflow-auto">
                  {history.transactions.slice(0,8).map(t=> (
                    <li key={t.id} className="flex justify-between"><span>{t.delta>0?'+':''}{t.delta}</span><span className="opacity-60 truncate max-w-[120px]">{t.reason}</span><span className="opacity-40">{new Date(t.createdAt).toLocaleDateString()}</span></li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-slate-800/40 rounded border border-slate-600/40">
                <div className="font-semibold mb-2 text-slate-200">Redemptions</div>
                <ul className="text-xs space-y-1 max-h-40 overflow-auto">
                  {history.redemptions.slice(0,8).map(r=> (
                    <li key={r.id} className="flex justify-between"><span className="truncate max-w-[120px]">{r.name}</span><span className="opacity-60">-{r.pointsCost}</span><span className="opacity-40">{new Date(r.createdAt).toLocaleDateString()}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          ) }
          
          {/* Mock Data Indicator */}
          {reports.length > 0 && reports[0].id === 1 && (
            <div style={{
              ...cardStyle,
              marginTop: '16px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <AlertCircle style={{ width: '16px', height: '16px', color: '#60a5fa', marginRight: '8px' }} />
                <span style={{ fontSize: '0.9rem', color: '#93c5fd' }}>
                  Demo mode: Displaying sample data (backend unavailable)
                </span>
              </div>
            </div>
          )}
      </div>

      {/* Key Metrics */}
      {analytics && (
        <>
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

  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {/* Advanced Tools */}
          <div className="bg-white/5 p-4 rounded-lg border border-gray-700" style={{color:'#e2e8f0'}}>
            <h3 className="font-semibold mb-2">Advanced Analytics & AI Tools</h3>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div className="flex-1">
                <label className="text-xs uppercase tracking-wide text-gray-400">Session ID</label>
                <input value={sessionInput} onChange={e=>setSessionInput(e.target.value)} placeholder="session UUID" className="mt-1 w-full px-3 py-2 rounded bg-gray-800 text-sm focus:outline-none border border-gray-600" />
              </div>
              <button onClick={handleGenerateDeepReport} disabled={deepLoading || !sessionInput} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm font-medium">{deepLoading? 'Generating...':'Deep Report'}</button>
              <button onClick={handleComputeStats} disabled={!sessionInput} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-medium">Compute Stats</button>
              <button onClick={handleGenerateScenarios} disabled={scenarioLoading} className="px-4 py-2 rounded bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-sm font-medium">{scenarioLoading? 'AI...':'AI Scenarios'}</button>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wide text-gray-400">Company (optional)</label>
                <input value={reportCompany} onChange={e=>setReportCompany(e.target.value)} placeholder="Company" className="mt-1 w-full px-2 py-1 rounded bg-gray-800 text-xs border border-gray-600" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wide text-gray-400">Email (optional)</label>
                <input value={reportEmail} onChange={e=>setReportEmail(e.target.value)} placeholder="manager@company.com" className="mt-1 w-full px-2 py-1 rounded bg-gray-800 text-xs border border-gray-600" />
              </div>
              <div className="flex items-end">
                <button onClick={handleGeneratePdf} disabled={pdfGenerating || !sessionInput} className="w-full px-3 py-2 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-medium">{pdfGenerating? 'PDF...' : 'Generate PDF'}</button>
              </div>
              <div className="text-xs text-gray-400 flex items-end">{reportMessage}</div>
            </div>
            {deepReport && (
              <div className="mt-4 text-xs max-h-64 overflow-auto bg-black/30 p-3 rounded border border-gray-700">
                <pre className="whitespace-pre-wrap">{JSON.stringify(deepReport.executiveSummary, null, 2)}</pre>
              </div>
            )}
            {scenarios.length>0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-1">Generated Scenarios</h4>
                <ul className="text-xs space-y-1 max-h-40 overflow-auto">
                  {scenarios.map((s,i)=>(<li key={i} className="p-2 bg-gray-800 rounded border border-gray-700">{s.scenario || s.title || 'Scenario'} </li>))}
                </ul>
              </div>
            )}
            {/* Template Save */}
            <div className="mt-6 border-t border-gray-700 pt-4">
              <h4 className="text-sm font-semibold mb-2">Scenario Templates</h4>
              <div className="flex flex-col gap-2 mb-2">
                <input value={templateName} onChange={e=>setTemplateName(e.target.value)} placeholder="Template name" className="px-3 py-2 rounded bg-gray-800 text-xs border border-gray-700" />
                <textarea value={templateContent} onChange={e=>setTemplateContent(e.target.value)} placeholder="Template content / prompt" rows={3} className="px-3 py-2 rounded bg-gray-800 text-xs border border-gray-700" />
                <button disabled={savingTemplate || !templateName || !templateContent} onClick={handleSaveTemplate} className="px-3 py-2 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-medium w-fit">{savingTemplate? 'Saving...':'Save Template'}</button>
              </div>
              {templates.length>0 && (
                <ul className="text-xs space-y-1 max-h-32 overflow-auto">
                  {templates.map(t=>(<li key={t.id||t.session_id} className="p-2 bg-gray-800 rounded border border-gray-700"><span className="font-semibold">{t.payload?.name||t.name}</span><span className="opacity-60"> — { (t.payload?.content||'').slice(0,60) }</span></li>))}
                </ul>
              )}
            </div>
          </div>
          {/* Report List */}
          <div>
            <ReportsList 
              reports={reports}
              selectedReport={selectedReport}
              onSelectReport={setSelectedReport}
            />
          </div>

          {/* Interactive Report View */}
          <div>
            {selectedReport ? (
              <InteractiveReport report={selectedReport} />
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
                  Choose a report from the list to view detailed analysis
                </p>
                <button 
                  onClick={() => window.location.href = '/game-intent'}
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Start New Team Session
                </button>
              </div>
            )}
          </div>
          {/* History Panel */}
          <div className="bg-white/5 p-4 rounded-lg border border-gray-700" style={{color:'#e2e8f0'}}>
            <h3 className="font-semibold mb-2">Points & Rewards History</h3>
            <button onClick={()=>refreshHistory()} className="mb-2 text-xs px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500">Refresh</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-semibold mb-1">Transactions</h4>
                <ul className="space-y-1 max-h-40 overflow-auto">
                  {history.transactions.map(tx=>(<li key={tx.id} className="p-2 bg-gray-800 rounded border border-gray-700 flex justify-between"><span>{tx.reason}</span><span className="font-mono">{tx.delta}</span></li>))}
                  {history.transactions.length===0 && <li className="opacity-60">No transactions</li>}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Redemptions</h4>
                <ul className="space-y-1 max-h-40 overflow-auto">
                  {history.redemptions.map(r=>(<li key={r.id} className="p-2 bg-gray-800 rounded border border-gray-700 flex justify-between"><span>{r.name}</span><span className="font-mono">{r.pointsCost}</span></li>))}
                  {history.redemptions.length===0 && <li className="opacity-60">No redemptions</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
        </>
      )}
      </div>
    </div>
  )
}

export default ManagerDashboard
