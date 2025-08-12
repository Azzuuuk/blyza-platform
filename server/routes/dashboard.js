/**
 * Dashboard API Routes - Handle manager dashboard and reports
 */

import express from 'express'
import { DataCollectionService } from '../services/dataCollectionService.js'
import { apiKey, maybeJwt, requireAdmin } from '../middleware/auth.js'

const router = express.Router()
const apiGate = apiKey('DASHBOARD_API_KEY')
const dataService = new DataCollectionService()

// Root diagnostic (helps confirm router mount in production)
router.get('/', (req,res) => {
  res.json({
    success: true,
    service: 'dashboard',
    note: 'If you see this, /api/dashboard base router is mounted.',
    endpoints: [
      'GET /api/dashboard/reports',
      'GET /api/dashboard/reports/:sessionId',
      'POST /api/dashboard/save-report',
      'POST /api/dashboard/submit-metrics',
      'POST /api/dashboard/submit-feedback',
      'GET /api/dashboard/analytics',
      'POST /api/dashboard/retry-workflows',
      'GET /api/dashboard/health'
    ]
  })
})

/**
 * Authentication middleware (simplified for demo)
 * In production, use proper JWT validation
 */
const authenticateUser = (req, res, next) => {
  // For demo purposes, we'll use a simple header check
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For development, allow requests without auth but with default user
    req.user = {
      id: 'demo_manager_1',
      name: 'Demo Manager',
      role: 'manager',
      email: 'manager@demo.com',
      companyId: 'demo_company'
    }
  } else {
    // In production, decode JWT token here
    req.user = {
      id: 'authenticated_manager',
      name: 'Authenticated Manager', 
      role: 'manager',
      email: 'auth@company.com',
      companyId: 'real_company'
    }
  }
  
  next()
}

/**
 * Get all reports for the authenticated manager
 */
router.get('/reports', apiGate, authenticateUser, maybeJwt(), async (req, res) => {
  try {
    const managerId = req.user.id
    const reports = await dataService.getManagerReports(managerId)

    console.log(`📊 Retrieved ${reports.length} reports for manager: ${managerId}`)

    res.json({ 
      success: true, 
      reports: reports,
      manager: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      },
      meta: {
        totalReports: reports.length,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('❌ Error fetching reports:', error.message)
    res.status(500).json({ 
      success: false,
      error: error.message,
      code: 'REPORTS_FETCH_ERROR'
    })
  }
})

/**
 * Get a specific report by session ID
 */
router.get('/reports/:sessionId', apiGate, authenticateUser, maybeJwt(), async (req, res) => {
  try {
    const { sessionId } = req.params
    const sessionData = await dataService.getSessionData(sessionId)

    if (!sessionData.gameMetrics && !sessionData.managerFeedback) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
        code: 'REPORT_NOT_FOUND'
      })
    }

    // Check if this report belongs to the authenticated manager
    const managerFeedback = sessionData.managerFeedback
    if (managerFeedback && managerFeedback.managerInfo.managerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      })
    }

    res.json({
      success: true,
      report: {
        sessionId,
        ...sessionData
      }
    })
  } catch (error) {
    console.error('❌ Error fetching specific report:', error.message)
    res.status(500).json({ 
      success: false,
      error: error.message,
      code: 'REPORT_FETCH_ERROR'
    })
  }
})

/**
 * Save analysis report from n8n workflow
 * This endpoint is called by n8n after processing
 */
router.post('/save-report', apiGate, async (req, res) => {
  try {
    const reportData = req.body
    
    if (!reportData.sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
        code: 'MISSING_SESSION_ID'
      })
    }

    await dataService.saveAnalysisReport(reportData.sessionId, reportData)

    console.log(`💾 Analysis report saved from n8n for session: ${reportData.sessionId}`)

    res.json({ 
      success: true,
      message: 'Report saved successfully',
      sessionId: reportData.sessionId
    })
  } catch (error) {
    console.error('❌ Error saving report from n8n:', error.message)
    res.status(500).json({ 
      success: false,
      error: error.message,
      code: 'REPORT_SAVE_ERROR'
    })
  }
})

/**
 * Submit game metrics (called after game completion)
 */
router.post('/submit-metrics', apiGate, authenticateUser, maybeJwt(), async (req, res) => {
  try {
    const { sessionId, metrics } = req.body
    
    if (!sessionId || !metrics) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and metrics are required',
        code: 'MISSING_REQUIRED_DATA'
      })
    }

    const result = await dataService.storeGameMetrics(sessionId, metrics)

    res.json({
      success: true,
      message: 'Game metrics submitted successfully',
      sessionId: sessionId,
      metricsStored: true
    })
  } catch (error) {
    console.error('❌ Error submitting game metrics:', error.message)
    res.status(500).json({ 
      success: false,
      error: error.message,
      code: 'METRICS_SUBMISSION_ERROR'
    })
  }
})

/**
 * Submit manager feedback (called after feedback form completion)
 */
router.post('/submit-feedback', apiGate, authenticateUser, maybeJwt(), async (req, res) => {
  try {
    const { sessionId, feedback } = req.body
    
    if (!sessionId || !feedback) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and feedback are required',
        code: 'MISSING_REQUIRED_DATA'
      })
    }

    // Add manager info from authenticated user
    const enrichedFeedback = {
      ...feedback,
      managerId: req.user.id,
      managerName: req.user.name,
      managerEmail: req.user.email,
      companyId: req.user.companyId
    }

    const result = await dataService.storeManagerFeedback(sessionId, enrichedFeedback)

    res.json({
      success: true,
      message: 'Manager feedback submitted successfully',
      sessionId: sessionId,
      feedbackStored: true,
      analysisTriggered: result ? 'Analysis workflow will be triggered' : 'Waiting for game metrics'
    })
  } catch (error) {
    console.error('❌ Error submitting manager feedback:', error.message)
    res.status(500).json({ 
      success: false,
      error: error.message,
      code: 'FEEDBACK_SUBMISSION_ERROR'
    })
  }
})

/**
 * Get dashboard analytics summary
 */
router.get('/analytics', apiGate, authenticateUser, maybeJwt(), async (req, res) => {
  try {
    const managerId = req.user.id
    const reports = await dataService.getManagerReports(managerId)
    
    // Calculate summary statistics
    const analytics = {
      totalSessions: reports.length,
      totalParticipants: reports.reduce((sum, report) => {
        return sum + (report.quantitative?.playerMetrics?.length || 0)
      }, 0),
      averageEngagement: reports.length > 0 ? 
        reports.reduce((sum, report) => {
          return sum + (report.quantitative?.quantitativeData?.participationRate || 0)
        }, 0) / reports.length : 0,
      recentActivity: reports.slice(0, 5).map(report => ({
        sessionId: report.sessionId,
        gameInfo: report.gameInfo,
        timestamp: report.timestamp,
        participantCount: report.quantitative?.playerMetrics?.length || 0
      })),
      topChallenges: this.extractTopChallenges(reports),
      improvementTrends: this.calculateTrends(reports)
    }

    res.json({
      success: true,
      analytics,
      manager: {
        id: req.user.id,
        name: req.user.name
      }
    })
  } catch (error) {
    console.error('❌ Error fetching analytics:', error.message)
    res.status(500).json({ 
      success: false,
      error: error.message,
      code: 'ANALYTICS_ERROR'
    })
  }
})

/**
 * Retry failed n8n workflows
 */
router.post('/retry-workflows', apiGate, authenticateUser, maybeJwt(), requireAdmin(), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
        code: 'ACCESS_DENIED'
      })
    }

    const result = await dataService.retryFailedWorkflows()

    res.json({
      success: true,
      message: 'Workflow retry completed',
      ...result
    })
  } catch (error) {
    console.error('❌ Error retrying workflows:', error.message)
    res.status(500).json({ 
      success: false,
      error: error.message,
      code: 'RETRY_ERROR'
    })
  }
})

/**
 * Health check endpoint
 */
router.get('/health', apiGate, (req, res) => {
  res.json({
    success: true,
    service: 'Dashboard API',
    timestamp: new Date(),
    status: 'healthy'
  })
})

// Helper functions
router.extractTopChallenges = (reports) => {
  const challenges = {}
  
  reports.forEach(report => {
    const feedback = report.qualitative?.managerObservations
    if (feedback?.communicationIssues) {
      challenges.communication = (challenges.communication || 0) + 1
    }
    if (feedback?.teamDynamics?.includes('conflict')) {
      challenges.conflict = (challenges.conflict || 0) + 1
    }
    if (feedback?.leadershipEmergence?.includes('unclear')) {
      challenges.leadership = (challenges.leadership || 0) + 1
    }
  })
  
  return Object.entries(challenges)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([challenge, count]) => ({ challenge, count }))
}

router.calculateTrends = (reports) => {
  if (reports.length < 2) return { trend: 'insufficient_data' }
  
  const sorted = reports.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  const recent = sorted.slice(-3)
  const previous = sorted.slice(-6, -3)
  
  const recentAvg = recent.reduce((sum, r) => 
    sum + (r.quantitative?.quantitativeData?.participationRate || 0), 0) / recent.length
  const previousAvg = previous.length > 0 ? 
    previous.reduce((sum, r) => 
      sum + (r.quantitative?.quantitativeData?.participationRate || 0), 0) / previous.length : recentAvg
  
  const change = recentAvg - previousAvg
  
  return {
    trend: change > 0.05 ? 'improving' : change < -0.05 ? 'declining' : 'stable',
    change: Math.round(change * 100) / 100,
    recentAverage: Math.round(recentAvg * 100) / 100
  }
}

export default router
