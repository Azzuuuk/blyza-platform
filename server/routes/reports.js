import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { ReportGenerator } from '../services/reportGenerator.js';
import { gameAnalytics } from './analytics.js';

const router = express.Router();

/**
 * @route POST /api/reports/generate
 * @desc Generate AI-powered team report
 * @access Private
 */
router.post('/generate', authenticateUser, async (req, res) => {
  try {
    const { 
      sessionId, 
      gameId, 
      managerEvaluation, 
      companyInfo,
      emailSettings 
    } = req.body;
    
    if (!sessionId || !gameId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and Game ID are required'
      });
    }
    
    // Get analytics data
    const sessionEvents = gameAnalytics.get(sessionId) || [];
    
    if (sessionEvents.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No game data found for this session'
      });
    }
    
    const reportGenerator = new ReportGenerator();
    
    // Generate comprehensive report
    const report = await reportGenerator.generateReport({
      sessionId,
      gameId,
      sessionEvents,
      managerEvaluation: managerEvaluation || {},
      companyInfo: companyInfo || {}
    });
    
    // Generate PDF
    const pdfBuffer = await reportGenerator.generatePDF(report);
    
    // Save report metadata
    const reportMetadata = {
      id: report.id,
      sessionId,
      gameId,
      generatedAt: new Date().toISOString(),
      generatedBy: req.user.uid,
      companyName: companyInfo?.name || 'Unknown Company',
      teamSize: report.overview.totalPlayers,
      gameTitle: report.gameInfo.title
    };
    
    // Email the report if requested
    if (emailSettings?.sendEmail && emailSettings?.recipientEmail) {
      try {
        await reportGenerator.emailReport({
          recipientEmail: emailSettings.recipientEmail,
          recipientName: emailSettings.recipientName || 'Team Manager',
          companyName: companyInfo?.name || 'Your Company',
          pdfBuffer,
          report
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue anyway, return PDF download
      }
    }
    
    // Return PDF for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="team-report-${sessionId}.pdf"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report'
    });
  }
});

/**
 * @route POST /api/reports/preview
 * @desc Preview report data before PDF generation
 * @access Private
 */
router.post('/preview', authenticateUser, async (req, res) => {
  try {
    const { sessionId, gameId, managerEvaluation } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }
    
    const sessionEvents = gameAnalytics.get(sessionId) || [];
    
    if (sessionEvents.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No game data found for this session'
      });
    }
    
    const reportGenerator = new ReportGenerator();
    const reportData = await reportGenerator.generateReportData({
      sessionId,
      gameId,
      sessionEvents,
      managerEvaluation: managerEvaluation || {}
    });
    
    res.json({
      success: true,
      reportData
    });
  } catch (error) {
    console.error('Error generating report preview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report preview'
    });
  }
});

/**
 * @route GET /api/reports/templates
 * @desc Get available report templates
 * @access Private
 */
router.get('/templates', authenticateUser, async (req, res) => {
  try {
    const templates = [
      {
        id: 'standard',
        name: 'Standard Team Report',
        description: 'Comprehensive 3-page analysis with insights and recommendations',
        sections: ['Executive Summary', 'Detailed Analysis', 'Action Plan'],
        duration: '5-7 minutes to generate'
      },
      {
        id: 'quick',
        name: 'Quick Insights',
        description: '1-page summary with key metrics and highlights',
        sections: ['Key Metrics', 'Top Insights'],
        duration: '2-3 minutes to generate'
      },
      {
        id: 'detailed',
        name: 'Detailed Analysis',
        description: 'Extended 5-page report with individual player profiles',
        sections: ['Executive Summary', 'Team Dynamics', 'Individual Profiles', 'Recommendations', 'Next Steps'],
        duration: '8-10 minutes to generate'
      }
    ];
    
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report templates'
    });
  }
});

/**
 * @route GET /api/reports/history
 * @desc Get user's report generation history
 * @access Private
 */
router.get('/history', authenticateUser, async (req, res) => {
  try {
    // In production, this would query the database
    // For now, return mock data
    const reports = [
      {
        id: 'rpt_1',
        sessionId: 'session_1',
        gameTitle: 'Real or AI Challenge',
        teamSize: 6,
        generatedAt: '2024-01-15T10:30:00Z',
        companyName: 'Acme Corp',
        status: 'completed'
      },
      {
        id: 'rpt_2',
        sessionId: 'session_2',
        gameTitle: 'Collaboration Station',
        teamSize: 8,
        generatedAt: '2024-01-12T14:45:00Z',
        companyName: 'Acme Corp',
        status: 'completed'
      }
    ];
    
    res.json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Error fetching report history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report history'
    });
  }
});

export default router;
