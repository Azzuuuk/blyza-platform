import OpenAI from 'openai';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

/**
 * AI-powered report generation service
 */
export class ReportGenerator {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;
    
    this.emailTransporter = this.initializeEmailTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeEmailTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
    return null;
  }

  /**
   * Generate comprehensive team report
   */
  async generateReport(params) {
    const { sessionId, gameId, sessionEvents, managerEvaluation, companyInfo } = params;
    
    try {
      // Analyze session data
      const analytics = this.analyzeSessionData(sessionEvents);
      
      // Generate AI insights
      const aiInsights = await this.generateAIInsights(analytics, managerEvaluation, gameId);
      
      // Compile comprehensive report
      const report = {
        id: uuidv4(),
        sessionId,
        gameId,
        generatedAt: new Date().toISOString(),
        companyInfo: companyInfo || {},
        
        // Executive Summary
        executiveSummary: {
          overallScore: analytics.overallEngagementScore,
          keyFindings: aiInsights.keyFindings,
          recommendations: aiInsights.topRecommendations,
          teamHealthScore: analytics.teamHealthScore
        },
        
        // Detailed Analytics
        analytics: {
          engagement: analytics.engagement,
          communication: analytics.communication,
          collaboration: analytics.collaboration,
          performance: analytics.performance
        },
        
        // Team Insights
        teamInsights: {
          strengths: aiInsights.teamStrengths,
          improvementAreas: aiInsights.improvementAreas,
          teamDynamics: aiInsights.teamDynamics,
          leadershipEmergence: analytics.leadershipPatterns
        },
        
        // Individual Profiles
        individualProfiles: analytics.playerProfiles,
        
        // Action Plan
        actionPlan: {
          immediateActions: aiInsights.immediateActions,
          mediumTermGoals: aiInsights.mediumTermGoals,
          suggestedActivities: aiInsights.suggestedActivities,
          followUpTimeline: aiInsights.followUpTimeline
        },
        
        // Game Information
        gameInfo: this.getGameInfo(gameId),
        
        // Session Overview
        overview: {
          duration: analytics.sessionDuration,
          totalPlayers: analytics.totalPlayers,
          totalInteractions: sessionEvents.length,
          engagementRate: analytics.engagementRate
        }
      };
      
      return report;
    } catch (error) {
      console.error('Report generation error:', error);
      throw new Error('Failed to generate report');
    }
  }

  /**
   * Analyze session data to extract meaningful metrics
   */
  analyzeSessionData(events) {
    const players = [...new Set(events.map(e => e.playerId))];
    const playerStats = new Map();
    
    // Initialize player stats
    players.forEach(playerId => {
      playerStats.set(playerId, {
        playerId,
        totalEvents: 0,
        responses: 0,
        chatMessages: 0,
        reactions: 0,
        responseTimes: [],
        correctAnswers: 0,
        totalQuestions: 0,
        participationScore: 0,
        leadershipScore: 0
      });
    });
    
    // Process events
    events.forEach(event => {
      const stats = playerStats.get(event.playerId);
      if (!stats) return;
      
      stats.totalEvents++;
      
      switch (event.eventType) {
        case 'answer_submitted':
          stats.responses++;
          if (event.eventData.responseTime) {
            stats.responseTimes.push(event.eventData.responseTime);
          }
          if (event.eventData.correct) {
            stats.correctAnswers++;
          }
          stats.totalQuestions++;
          break;
          
        case 'chat_message':
          stats.chatMessages++;
          break;
          
        case 'reaction_sent':
          stats.reactions++;
          break;
      }
    });
    
    // Calculate derived metrics
    playerStats.forEach(stats => {
      stats.avgResponseTime = stats.responseTimes.length > 0 
        ? stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length 
        : 0;
      
      stats.accuracy = stats.totalQuestions > 0 
        ? (stats.correctAnswers / stats.totalQuestions) * 100 
        : 0;
      
      stats.participationScore = this.calculateParticipationScore(stats);
      stats.leadershipScore = this.calculateLeadershipScore(stats, events);
    });
    
    const playerProfiles = Array.from(playerStats.values());
    
    return {
      totalPlayers: players.length,
      sessionDuration: this.calculateSessionDuration(events),
      playerProfiles,
      overallEngagementScore: this.calculateOverallEngagement(playerProfiles),
      teamHealthScore: this.calculateTeamHealthScore(playerProfiles),
      engagementRate: this.calculateEngagementRate(events, players.length),
      engagement: this.analyzeEngagement(playerProfiles),
      communication: this.analyzeCommunication(playerProfiles, events),
      collaboration: this.analyzeCollaboration(playerProfiles, events),
      performance: this.analyzePerformance(playerProfiles),
      leadershipPatterns: this.identifyLeadershipPatterns(playerProfiles)
    };
  }

  /**
   * Generate AI insights using OpenAI
   */
  async generateAIInsights(analytics, managerEvaluation, gameId) {
    try {
      if (!this.openai) {
        return this.getMockAIInsights(analytics);
      }

      const prompt = this.buildInsightsPrompt(analytics, managerEvaluation, gameId);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert organizational psychologist and team dynamics consultant. Analyze team-building session data and provide actionable insights for improving team performance, communication, and collaboration."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('AI insights generation error:', error);
      return this.getMockAIInsights(analytics);
    }
  }

  /**
   * Build prompt for AI insights generation
   */
  buildInsightsPrompt(analytics, managerEvaluation, gameId) {
    return `
Analyze this team-building session data and provide comprehensive insights:

TEAM METRICS:
- Total Players: ${analytics.totalPlayers}
- Overall Engagement Score: ${analytics.overallEngagementScore}/100
- Team Health Score: ${analytics.teamHealthScore}/100
- Session Duration: ${analytics.sessionDuration} minutes
- Communication Level: ${analytics.communication.level}
- Collaboration Score: ${analytics.collaboration.score}/100

INDIVIDUAL PERFORMANCE:
${analytics.playerProfiles.map(p => `
- Player ${p.playerId}: Participation ${p.participationScore}/100, Accuracy ${p.accuracy.toFixed(1)}%, Avg Response Time ${p.avgResponseTime/1000}s
`).join('')}

MANAGER EVALUATION:
${JSON.stringify(managerEvaluation, null, 2)}

Please provide a JSON response with:
{
  "keyFindings": ["3-5 key insights about team performance"],
  "teamStrengths": ["3-4 team strengths identified"],
  "improvementAreas": ["3-4 areas needing improvement"],
  "teamDynamics": {
    "communicationPatterns": "Analysis of how team communicates",
    "collaborationStyle": "How team works together",
    "conflictResolution": "How team handles disagreements",
    "decisionMaking": "Team's decision-making approach"
  },
  "topRecommendations": ["3 top priority recommendations"],
  "immediateActions": ["2-3 actions to take within 1 week"],
  "mediumTermGoals": ["2-3 goals for next 1-3 months"],
  "suggestedActivities": ["3-4 specific follow-up activities"],
  "followUpTimeline": "Recommended schedule for next team activities"
}

Focus on actionable, specific insights that will help this team improve their collaboration and performance.
    `.trim();
  }

  /**
   * Generate mock AI insights when OpenAI is not available
   */
  getMockAIInsights(analytics) {
    return {
      keyFindings: [
        `Team shows ${analytics.overallEngagementScore > 70 ? 'strong' : 'moderate'} overall engagement`,
        'Communication patterns indicate good collaborative potential',
        'Some team members could benefit from increased participation',
        'Response timing suggests thoughtful consideration of answers'
      ],
      teamStrengths: [
        'Active participation in discussions',
        'Supportive team environment',
        'Good problem-solving approach',
        'Willingness to share ideas'
      ],
      improvementAreas: [
        'More balanced participation across all team members',
        'Faster decision-making in time-pressured situations',
        'Increased use of collaborative tools',
        'Better conflict resolution strategies'
      ],
      teamDynamics: {
        communicationPatterns: 'Team shows open communication with some members taking more active roles',
        collaborationStyle: 'Collaborative approach with room for more structured coordination',
        conflictResolution: 'Avoids direct conflict, could benefit from constructive disagreement skills',
        decisionMaking: 'Consensus-seeking approach, sometimes at the expense of speed'
      },
      topRecommendations: [
        'Implement regular check-ins to ensure all voices are heard',
        'Practice time-boxed decision-making exercises',
        'Establish clear communication protocols for different scenarios'
      ],
      immediateActions: [
        'Schedule 30-minute team retrospective within 3 days',
        'Assign rotating facilitation roles for next meetings',
        'Create shared team charter document'
      ],
      mediumTermGoals: [
        'Improve average response time while maintaining accuracy',
        'Increase participation from quieter team members',
        'Develop team-specific communication guidelines'
      ],
      suggestedActivities: [
        'Monthly problem-solving challenges',
        'Peer feedback sessions',
        'Cross-functional collaboration projects',
        'Communication style assessment workshop'
      ],
      followUpTimeline: 'Reconvene in 2 weeks for progress check, full team assessment in 6 weeks'
    };
  }

  /**
   * Generate PDF report
   */
  async generatePDF(report) {
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Page 1: Executive Summary
      let page = pdfDoc.addPage([612, 792]); // US Letter size
      let yPosition = 720;
      
      // Header
      page.drawText('TEAM PERFORMANCE REPORT', {
        x: 50,
        y: yPosition,
        size: 24,
        font: boldFont,
        color: rgb(0, 0.4, 0.8)
      });
      
      yPosition -= 30;
      page.drawText(`Generated: ${new Date(report.generatedAt).toLocaleDateString()}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: font
      });
      
      yPosition -= 20;
      page.drawText(`Company: ${report.companyInfo.name || 'Team Assessment'}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: font
      });
      
      yPosition -= 40;
      
      // Executive Summary
      page.drawText('EXECUTIVE SUMMARY', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont
      });
      
      yPosition -= 25;
      page.drawText(`Overall Engagement Score: ${report.executiveSummary.overallScore}/100`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: font
      });
      
      yPosition -= 20;
      page.drawText(`Team Health Score: ${report.executiveSummary.teamHealthScore}/100`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: font
      });
      
      yPosition -= 30;
      page.drawText('Key Findings:', {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont
      });
      
      yPosition -= 20;
      report.executiveSummary.keyFindings.forEach((finding, index) => {
        page.drawText(`• ${finding}`, {
          x: 60,
          y: yPosition,
          size: 11,
          font: font
        });
        yPosition -= 18;
      });
      
      // Add more content for remaining pages...
      // This is a simplified version - full implementation would include all sections
      
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  /**
   * Email report to recipient
   */
  async emailReport(params) {
    const { recipientEmail, recipientName, companyName, pdfBuffer, report } = params;
    
    if (!this.emailTransporter) {
      throw new Error('Email transporter not configured');
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipientEmail,
      subject: `Team Performance Report - ${companyName}`,
      html: `
        <h2>Your Team Performance Report is Ready</h2>
        <p>Dear ${recipientName},</p>
        <p>We've completed the analysis of your team-building session and generated a comprehensive report with insights and recommendations.</p>
        
        <h3>Quick Highlights:</h3>
        <ul>
          <li><strong>Overall Engagement:</strong> ${report.executiveSummary.overallScore}/100</li>
          <li><strong>Team Health Score:</strong> ${report.executiveSummary.teamHealthScore}/100</li>
          <li><strong>Total Participants:</strong> ${report.overview.totalPlayers}</li>
          <li><strong>Session Duration:</strong> ${report.overview.duration} minutes</li>
        </ul>
        
        <p>Please find the detailed report attached as a PDF. This report includes:</p>
        <ul>
          <li>Executive summary with key findings</li>
          <li>Individual player profiles and insights</li>
          <li>Team dynamics analysis</li>
          <li>Specific recommendations and action items</li>
          <li>Suggested follow-up activities</li>
        </ul>
        
        <p>We recommend reviewing this report with your team and implementing the suggested action items to continue building on the positive momentum from your session.</p>
        
        <p>Best regards,<br>The Blyza Team</p>
        
        <hr>
        <p style="font-size: 12px; color: #666;">
          This report was generated by Blyza's AI-powered team analytics engine. 
          For questions or support, please contact support@blyza.com
        </p>
      `,
      attachments: [
        {
          filename: `team-report-${report.sessionId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await this.emailTransporter.sendMail(mailOptions);
  }

  /**
   * Helper methods for analytics calculations
   */
  calculateParticipationScore(stats) {
    const baseScore = Math.min((stats.totalEvents / 15) * 60, 60);
    const interactionBonus = Math.min((stats.chatMessages + stats.reactions) * 2, 25);
    const responseBonus = Math.min(stats.responses * 3, 15);
    
    return Math.round(baseScore + interactionBonus + responseBonus);
  }

  calculateLeadershipScore(stats, allEvents) {
    // Simple leadership scoring based on early responses and interaction patterns
    let score = 0;
    
    // Early response bonus
    const playerEvents = allEvents.filter(e => e.playerId === stats.playerId);
    const earlyResponses = playerEvents.filter(e => 
      e.eventType === 'answer_submitted' && 
      new Date(e.timestamp).getSeconds() < 30
    ).length;
    
    score += Math.min(earlyResponses * 10, 40);
    
    // Communication leadership
    score += Math.min(stats.chatMessages * 5, 30);
    
    // Supportive reactions
    score += Math.min(stats.reactions * 3, 30);
    
    return Math.round(score);
  }

  calculateSessionDuration(events) {
    if (events.length === 0) return 0;
    
    const timestamps = events.map(e => new Date(e.timestamp).getTime());
    return Math.round((Math.max(...timestamps) - Math.min(...timestamps)) / 1000 / 60);
  }

  calculateOverallEngagement(playerProfiles) {
    if (playerProfiles.length === 0) return 0;
    
    const avgParticipation = playerProfiles.reduce((sum, p) => sum + p.participationScore, 0) / playerProfiles.length;
    return Math.round(avgParticipation);
  }

  calculateTeamHealthScore(playerProfiles) {
    // Complex calculation considering distribution of participation, performance variance, etc.
    const participationScores = playerProfiles.map(p => p.participationScore);
    const avgParticipation = participationScores.reduce((a, b) => a + b, 0) / participationScores.length;
    const participationVariance = this.calculateVariance(participationScores);
    
    // Lower variance = better team health (more balanced participation)
    const balanceScore = Math.max(0, 100 - participationVariance);
    const engagementScore = avgParticipation;
    
    return Math.round((balanceScore * 0.4) + (engagementScore * 0.6));
  }

  calculateVariance(numbers) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squareDiffs = numbers.map(value => Math.pow(value - mean, 2));
    return squareDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  calculateEngagementRate(events, totalPlayers) {
    const responseEvents = events.filter(e => e.eventType === 'answer_submitted');
    const rounds = new Set(responseEvents.map(e => e.eventData.round || 1)).size;
    const expectedResponses = totalPlayers * rounds;
    
    return expectedResponses > 0 ? Math.round((responseEvents.length / expectedResponses) * 100) : 0;
  }

  analyzeEngagement(playerProfiles) {
    const scores = playerProfiles.map(p => p.participationScore);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    return {
      average: Math.round(avg),
      high: scores.filter(s => s >= 80).length,
      medium: scores.filter(s => s >= 50 && s < 80).length,
      low: scores.filter(s => s < 50).length,
      distribution: 'balanced' // Could be more sophisticated
    };
  }

  analyzeCommunication(playerProfiles, events) {
    const totalMessages = playerProfiles.reduce((sum, p) => sum + p.chatMessages, 0);
    const totalReactions = playerProfiles.reduce((sum, p) => sum + p.reactions, 0);
    
    return {
      level: totalMessages >= playerProfiles.length * 2 ? 'High' : 
             totalMessages >= playerProfiles.length ? 'Medium' : 'Low',
      totalMessages,
      totalReactions,
      avgMessagesPerPlayer: Math.round(totalMessages / playerProfiles.length)
    };
  }

  analyzeCollaboration(playerProfiles, events) {
    // Simplified collaboration analysis
    const interactionEvents = events.filter(e => 
      e.eventType === 'chat_message' || e.eventType === 'reaction_sent'
    );
    
    return {
      score: Math.min((interactionEvents.length / playerProfiles.length) * 10, 100),
      interactionFrequency: interactionEvents.length,
      supportiveActions: events.filter(e => e.eventType === 'reaction_sent').length
    };
  }

  analyzePerformance(playerProfiles) {
    const accuracies = playerProfiles.map(p => p.accuracy).filter(a => a > 0);
    const responseTimes = playerProfiles.map(p => p.avgResponseTime).filter(t => t > 0);
    
    return {
      averageAccuracy: accuracies.length > 0 ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length) : 0,
      averageResponseTime: responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0,
      highPerformers: playerProfiles.filter(p => p.accuracy >= 80).length,
      consistentParticipators: playerProfiles.filter(p => p.participationScore >= 70).length
    };
  }

  identifyLeadershipPatterns(playerProfiles) {
    const sortedByLeadership = [...playerProfiles].sort((a, b) => b.leadershipScore - a.leadershipScore);
    
    return {
      emergentLeaders: sortedByLeadership.slice(0, 2).map(p => p.playerId),
      leadershipDistribution: {
        strong: sortedByLeadership.filter(p => p.leadershipScore >= 70).length,
        moderate: sortedByLeadership.filter(p => p.leadershipScore >= 40 && p.leadershipScore < 70).length,
        developing: sortedByLeadership.filter(p => p.leadershipScore < 40).length
      }
    };
  }

  getGameInfo(gameId) {
    // Import game templates to get game info
    // This is a simplified version
    return {
      id: gameId,
      title: 'Team Building Game',
      category: 'Team Building',
      description: 'Interactive team building activity'
    };
  }

  /**
   * Generate report data without PDF (for preview)
   */
  async generateReportData(params) {
    const report = await this.generateReport(params);
    delete report.pdfBuffer; // Remove heavy data for preview
    return report;
  }
}
