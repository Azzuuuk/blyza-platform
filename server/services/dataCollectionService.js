/**
 * Data Collection Service - Stores game metrics and manager feedback
 * Triggers n8n workflow when both datasets are ready
 */

export class DataCollectionService {
  constructor() {
    // In a real implementation, this would be your actual database
    // For now using the existing mock database structure
    this.storage = {
      gameMetrics: new Map(),
      managerFeedback: new Map(),
      analysisReports: new Map()
    }
  }

  /**
   * Store quantitative game engagement metrics
   */
  async storeGameMetrics(gameSessionId, metrics) {
    const gameMetrics = {
      sessionId: gameSessionId,
      timestamp: new Date(),
      quantitativeData: {
        participationRate: metrics.participationRate || 0,
        averageResponseTime: metrics.averageResponseTime || 0,
        interactionCount: metrics.interactionCount || 0,
        emotionalEngagement: metrics.emotionalEngagement || 0,
        collaborationScore: metrics.collaborationScore || 0,
        completionRate: metrics.completionRate || 0
      },
      playerMetrics: (metrics.playerMetrics || []).map(player => ({
        playerId: player.id,
        name: player.name,
        engagementScore: player.engagement || 0,
        responseQuality: player.responseQuality || 0,
        leadershipBehavior: player.leadership || 0,
        communicationStyle: player.communication || 'neutral',
        participationLevel: player.participation || 0,
        responseCount: player.responseCount || 0
      })),
      gameInfo: {
        gameId: metrics.gameId,
        gameName: metrics.gameName,
        duration: metrics.duration,
        teamSize: metrics.teamSize
      }
    }

    // Store in mock database
    this.storage.gameMetrics.set(gameSessionId, gameMetrics)
    
    console.log(`📊 Game metrics stored for session: ${gameSessionId}`)
    
    // Check if we can trigger analysis
    await this.checkAndTriggerAnalysis(gameSessionId)
    
    return gameMetrics
  }

  /**
   * Store qualitative manager feedback
   */
  async storeManagerFeedback(gameSessionId, feedback) {
    const qualitativeData = {
      sessionId: gameSessionId,
      timestamp: new Date(),
      managerObservations: {
        teamDynamics: feedback.teamDynamics || '',
        communicationIssues: feedback.communicationIssues || '',
        leadershipEmergence: feedback.leadershipEmergence || '',
        conflictResolution: feedback.conflictResolution || '',
        creativityLevel: feedback.creativityLevel || 'medium',
        trustIndicators: feedback.trustIndicators || '',
        overallEngagement: feedback.overallEngagement || 'medium'
      },
      managerInfo: {
        managerId: feedback.managerId,
        managerName: feedback.managerName,
        managerEmail: feedback.managerEmail,
        companyId: feedback.companyId,
        department: feedback.department
      },
      additionalFeedback: {
        specificConcerns: feedback.specificConcerns || '',
        teamGoals: feedback.teamGoals || '',
        previousChallenges: feedback.previousChallenges || '',
        followUpNeeded: feedback.followUpNeeded || false,
        recommendNextGame: feedback.recommendNextGame || false
      }
    }

    // Store in mock database
    this.storage.managerFeedback.set(gameSessionId, qualitativeData)
    
    console.log(`📝 Manager feedback stored for session: ${gameSessionId}`)
    
    // Check if we can trigger analysis
    await this.checkAndTriggerAnalysis(gameSessionId)
    
    return qualitativeData
  }

  /**
   * Check if both datasets exist and trigger n8n workflow
   */
  async checkAndTriggerAnalysis(gameSessionId) {
    const gameMetrics = this.storage.gameMetrics.get(gameSessionId)
    const managerFeedback = this.storage.managerFeedback.get(gameSessionId)

    if (gameMetrics && managerFeedback) {
      console.log(`🚀 Both datasets ready for session: ${gameSessionId}. Triggering analysis...`)
      
      // Structure data to match n8n workflow expectations
      const combinedData = {
        sessionId: gameSessionId,
        timestamp: new Date().toISOString(),
        quantitative: {
          gameInfo: {
            gameName: gameMetrics.gameName || "Team Building Session",
            duration: gameMetrics.duration || 30,
            difficulty: gameMetrics.difficulty || "medium",
            category: gameMetrics.category || "team-building"
          },
          quantitativeData: {
            participationRate: gameMetrics.participationRate || 85,
            averageResponseTime: gameMetrics.averageResponseTime || 10,
            emotionalEngagement: gameMetrics.emotionalEngagement || 7.5,
            collaborationScore: gameMetrics.collaborationScore || 8.0
          },
          playerMetrics: gameMetrics.playerMetrics || []
        },
        qualitative: {
          managerInfo: {
            managerName: managerFeedback.managerInfo?.managerName || "Unknown Manager",
            managerEmail: managerFeedback.managerInfo?.managerEmail || "manager@company.com",
            department: managerFeedback.managerInfo?.department || "General",
            teamSize: gameMetrics.playerMetrics?.length || 5
          },
          managerObservations: {
            teamDynamics: managerFeedback.managerObservations?.teamDynamics || "Good team dynamics observed",
            communicationIssues: managerFeedback.managerObservations?.communicationIssues || "No major communication issues",
            leadershipEmergence: managerFeedback.managerObservations?.leadershipEmergence || "Clear leadership emerged",
            creativityLevel: managerFeedback.managerObservations?.creativityLevel || "medium",
            trustIndicators: managerFeedback.managerObservations?.trustIndicators || "Team showed good trust levels"
          }
        },
        status: 'ready_for_analysis'
      }

      console.log('📊 Structured data for n8n:')
      console.log('   - sessionId:', combinedData.sessionId)
      console.log('   - quantitative keys:', Object.keys(combinedData.quantitative))
      console.log('   - qualitative keys:', Object.keys(combinedData.qualitative))

      // Send to n8n webhook
      await this.sendToN8nWorkflow(combinedData)
      return true
    } else {
      console.log(`⏳ Waiting for complete data set for session: ${gameSessionId}`)
      console.log(`  - Game metrics: ${gameMetrics ? '✅' : '❌'}`)
      console.log(`  - Manager feedback: ${managerFeedback ? '✅' : '❌'}`)
      return false
    }
  }

  /**
   * Send combined data to n8n workflow via webhook
   */
  async sendToN8nWorkflow(data) {
    try {
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
      
      if (!n8nWebhookUrl) {
        console.warn('⚠️ N8N_WEBHOOK_URL not configured. Skipping workflow trigger.')
        return { success: false, error: 'Webhook URL not configured' }
      }

      console.log(`🔗 Sending data to n8n webhook: ${n8nWebhookUrl}`)
      
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.N8N_API_KEY || ''}`,
          'User-Agent': 'Blyza-Platform/1.0'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ n8n workflow triggered successfully:', result)
      
      return { success: true, result }
      
    } catch (error) {
      console.error('❌ Failed to trigger n8n workflow:', error.message)
      
      // Store failed attempt for retry later
      this.storage.failedAnalysis = this.storage.failedAnalysis || []
      this.storage.failedAnalysis.push({
        data,
        error: error.message,
        timestamp: new Date(),
        retryCount: 0
      })
      
      return { success: false, error: error.message }
    }
  }

  /**
   * Retry failed n8n workflows
   */
  async retryFailedWorkflows() {
    if (!this.storage.failedAnalysis || this.storage.failedAnalysis.length === 0) {
      return { message: 'No failed workflows to retry' }
    }

    const retryResults = []
    
    for (const failedItem of this.storage.failedAnalysis) {
      if (failedItem.retryCount < 3) { // Max 3 retries
        console.log(`🔄 Retrying workflow for session: ${failedItem.data.sessionId}`)
        
        const result = await this.sendToN8nWorkflow(failedItem.data)
        
        if (result.success) {
          // Remove from failed list
          this.storage.failedAnalysis = this.storage.failedAnalysis.filter(
            item => item.data.sessionId !== failedItem.data.sessionId
          )
          retryResults.push({ sessionId: failedItem.data.sessionId, status: 'success' })
        } else {
          failedItem.retryCount += 1
          retryResults.push({ 
            sessionId: failedItem.data.sessionId, 
            status: 'failed', 
            retryCount: failedItem.retryCount 
          })
        }
      }
    }

    return { retryResults }
  }

  /**
   * Get stored data for a session
   */
  async getSessionData(gameSessionId) {
    return {
      gameMetrics: this.storage.gameMetrics.get(gameSessionId),
      managerFeedback: this.storage.managerFeedback.get(gameSessionId),
      analysisReport: this.storage.analysisReports.get(gameSessionId)
    }
  }

  /**
   * Save analysis report from n8n (called by dashboard API)
   */
  async saveAnalysisReport(sessionId, reportData) {
    this.storage.analysisReports.set(sessionId, {
      ...reportData,
      savedAt: new Date()
    })
    
    console.log(`💾 Analysis report saved for session: ${sessionId}`)
    return true
  }

  /**
   * Get all reports for a manager
   */
  async getManagerReports(managerId) {
    const reports = []
    
    for (const [sessionId, report] of this.storage.analysisReports.entries()) {
      const managerFeedback = this.storage.managerFeedback.get(sessionId)
      
      if (managerFeedback && managerFeedback.managerInfo.managerId === managerId) {
        reports.push({
          sessionId,
          ...report,
          gameInfo: this.storage.gameMetrics.get(sessionId)?.gameInfo
        })
      }
    }
    
    // Sort by timestamp (newest first)
    return reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }
}
