import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config({ path: './server/.env' })

async function testN8nDataValidation() {
  try {
    console.log('🔄 Testing n8n Data Validation Fix...\n')
    
    console.log('🔗 Webhook URL:', process.env.N8N_WEBHOOK_URL)
    
    // Create data that exactly matches what our backend service sends
    const backendData = {
      sessionId: `backend-session-${Date.now()}`,
      timestamp: new Date().toISOString(),
      quantitative: {
        gameInfo: {
          gameName: "Backend Test Game",
          duration: 25,
          difficulty: "medium",
          category: "team-building"
        },
        quantitativeData: {
          participationRate: 95,
          averageResponseTime: 7.2,
          emotionalEngagement: 8.5,
          collaborationScore: 9.0
        },
        playerMetrics: [
          { playerId: 'p1', name: 'Alice Johnson', engagement: 9, responses: 20 },
          { playerId: 'p2', name: 'Bob Smith', engagement: 8, responses: 18 },
          { playerId: 'p3', name: 'Carol Davis', engagement: 9, responses: 22 },
          { playerId: 'p4', name: 'David Wilson', engagement: 7, responses: 16 }
        ]
      },
      qualitative: {
        managerInfo: {
          managerName: "Sarah Johnson",
          managerEmail: "sarah.johnson@testcompany.com",
          department: "Engineering",
          teamSize: 4
        },
        managerObservations: {
          teamDynamics: "Excellent collaboration and communication throughout the session",
          communicationIssues: "Some minor interruptions but overall very good communication",
          leadershipEmergence: "Alice demonstrated clear leadership qualities and guided the team effectively",
          creativityLevel: "high",
          trustIndicators: "Team members felt comfortable sharing ideas and providing honest feedback"
        }
      },
      status: 'ready_for_analysis'
    }

    console.log('📊 Data Structure Validation:')
    console.log('✅ sessionId:', !!backendData.sessionId)
    console.log('✅ quantitative object:', !!backendData.quantitative)
    console.log('✅ qualitative object:', !!backendData.qualitative)
    console.log('✅ quantitative.gameInfo:', !!backendData.quantitative.gameInfo)
    console.log('✅ quantitative.quantitativeData:', !!backendData.quantitative.quantitativeData)
    console.log('✅ quantitative.playerMetrics:', !!backendData.quantitative.playerMetrics)
    console.log('✅ qualitative.managerInfo:', !!backendData.qualitative.managerInfo)
    console.log('✅ qualitative.managerObservations:', !!backendData.qualitative.managerObservations)
    console.log('')

    console.log('🚀 Sending structured data to n8n...')
    
    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(backendData)
    })
    
    console.log('📝 Response Status:', response.status, response.statusText)
    
    if (response.ok) {
      console.log('✅ n8n webhook SUCCESS!')
      console.log('📊 Backend-formatted data sent successfully')
      console.log('🔍 Check your n8n dashboard execution logs')
      
      try {
        const responseText = await response.text()
        if (responseText) {
          console.log('📋 Response:', responseText)
        }
      } catch (e) {
        console.log('📋 No response body (normal for webhooks)')
      }
      
      console.log('')
      console.log('🎯 Expected n8n Flow:')
      console.log('   1. ✅ Webhook Trigger - Receives data')
      console.log('   2. 🔍 Data Validation - Should PASS now')
      console.log('   3. 🤖 OpenAI Analysis - Generate insights')
      console.log('   4. 📄 Generate Report Data - Structure report')
      console.log('   5. 📊 Generate PDF - Create PDF content')
      console.log('   6. 📧 Send Email Report - Email to manager')
      console.log('   7. 💾 Save to Dashboard - Store in backend')
      
    } else {
      console.log('❌ n8n webhook FAILED')
      const errorText = await response.text()
      console.log('📋 Error Response:', errorText)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testN8nDataValidation()
