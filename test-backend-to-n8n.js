import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config({ path: './server/.env' })

async function testBackendToN8nFlow() {
  try {
    console.log('🔄 Testing Backend to n8n Flow...\n')
    
    const baseUrl = 'http://localhost:3002'
    const sessionId = `backend-test-${Date.now()}`
    
    console.log('📊 Step 1: Submit Game Metrics')
    
    // Submit game metrics (simulating what happens after a game session)
    const gameMetricsResponse = await fetch(`${baseUrl}/api/dashboard/submit-metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        gameName: 'Backend Test Game',
        duration: 25,
        difficulty: 'medium',
        category: 'team-building',
        participationRate: 95,
        averageResponseTime: 7.2,
        emotionalEngagement: 8.5,
        collaborationScore: 9.0,
        playerMetrics: [
          { playerId: 'p1', name: 'Alice Johnson', engagement: 9, responses: 20 },
          { playerId: 'p2', name: 'Bob Smith', engagement: 8, responses: 18 },
          { playerId: 'p3', name: 'Carol Davis', engagement: 9, responses: 22 },
          { playerId: 'p4', name: 'David Wilson', engagement: 7, responses: 16 }
        ]
      })
    })
    
    if (gameMetricsResponse.ok) {
      console.log('✅ Game metrics submitted successfully')
    } else {
      console.log('❌ Failed to submit game metrics:', gameMetricsResponse.status)
      return
    }
    
    console.log('\n📝 Step 2: Submit Manager Feedback')
    
    // Submit manager feedback (simulating manager completing feedback form)
    const feedbackResponse = await fetch(`${baseUrl}/api/dashboard/submit-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        managerId: 'mgr123',
        managerName: 'Sarah Johnson',
        managerEmail: 'sarah.johnson@testcompany.com',
        companyId: 'comp456',
        department: 'Engineering',
        teamDynamics: 'Excellent collaboration and communication throughout the session',
        communicationIssues: 'Some minor interruptions but overall very good communication',
        leadershipEmergence: 'Alice demonstrated clear leadership qualities and guided the team effectively',
        conflictResolution: 'No major conflicts observed, team handled disagreements professionally',
        creativityLevel: 'high',
        trustIndicators: 'Team members felt comfortable sharing ideas and providing honest feedback',
        overallEngagement: 'high',
        specificConcerns: 'None at this time',
        teamGoals: 'Continue building on the strong foundation established',
        previousChallenges: 'Some initial hesitation but quickly overcome',
        followUpNeeded: true,
        recommendNextGame: true
      })
    })
    
    if (feedbackResponse.ok) {
      console.log('✅ Manager feedback submitted successfully')
      console.log('🚀 This should trigger the n8n workflow automatically!')
    } else {
      console.log('❌ Failed to submit manager feedback:', feedbackResponse.status)
      return
    }
    
    console.log('\n🔍 Step 3: Check n8n Dashboard')
    console.log('👉 Go to your n8n dashboard and check if the workflow executed successfully')
    console.log('👉 The workflow should complete all nodes: Data Validation → OpenAI Analysis → Generate Report → Email & Dashboard Save')
    console.log('\n📧 Step 4: Check Email')
    console.log('👉 Check the email address:', 'sarah.johnson@testcompany.com')
    console.log('👉 You should receive a team analysis report email')
    
    console.log('\n📊 Step 5: Verify Dashboard Integration')
    console.log('👉 The report should be automatically saved to the dashboard via the workflow')
    
    console.log('\n✅ Test completed! Check your n8n execution logs for any errors.')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testBackendToN8nFlow()
