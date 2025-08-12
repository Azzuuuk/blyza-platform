import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config({ path: './server/.env' })

async function testN8nWebhook() {
  try {
    console.log('🔄 Testing n8n Webhook Integration...\n')
    
    console.log('🔗 Webhook URL:', process.env.N8N_WEBHOOK_URL)
    
    // Create sample data for n8n - matching exactly what Data Validation expects
    const testData = {
      sessionId: `test-session-${Date.now()}`,
      timestamp: new Date().toISOString(),
      quantitative: {
        gameInfo: {
          gameName: "Virtual Trust Building",
          duration: 30,
          difficulty: "medium",
          category: "team-building"
        },
        quantitativeData: {
          participationRate: 92,
          averageResponseTime: 8.5,
          emotionalEngagement: 8.2,
          collaborationScore: 9.1
        },
        playerMetrics: [
          { playerId: "p1", name: "Alice Johnson", engagement: 9, responses: 18 },
          { playerId: "p2", name: "Bob Smith", engagement: 8, responses: 15 },
          { playerId: "p3", name: "Carol Davis", engagement: 9, responses: 20 }
        ]
      },
      qualitative: {
        managerInfo: {
          managerName: "Test Manager",
          managerEmail: "test@blyza.com",
          department: "Engineering",
          teamSize: 3
        },
        managerObservations: {
          teamDynamics: "Great teamwork and collaboration throughout the session",
          communicationIssues: "Minor interruptions during discussion phases",
          leadershipEmergence: "Alice showed clear natural leadership qualities",
          creativityLevel: "high",
          trustIndicators: "Team felt safe to share ideas and gave honest feedback"
        }
      }
    }

    console.log('📊 Test Data Structure:')
    console.log('✅ sessionId:', testData.sessionId)
    console.log('✅ quantitative data keys:', Object.keys(testData.quantitative))
    console.log('✅ qualitative data keys:', Object.keys(testData.qualitative))
    console.log('')
    
    console.log('🚀 Sending test data to n8n...')
    
    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })
    
    console.log('📤 Request sent with data structure:')
    console.log('   - sessionId:', testData.sessionId ? '✅' : '❌')
    console.log('   - quantitative object:', testData.quantitative ? '✅' : '❌')
    console.log('   - qualitative object:', testData.qualitative ? '✅' : '❌')
    console.log('')
    
    console.log('📝 Response Status:', response.status, response.statusText)
    
    if (response.ok) {
      console.log('✅ n8n webhook SUCCESS!')
      console.log('📊 Data sent successfully to your workflow')
      console.log('🔍 Check your n8n dashboard to see the execution')
      
      try {
        const responseText = await response.text()
        if (responseText) {
          console.log('📋 Response:', responseText.substring(0, 200))
        }
      } catch (e) {
        console.log('📋 No response body (normal for webhooks)')
      }
      
    } else {
      console.log('❌ n8n webhook FAILED')
      const errorText = await response.text()
      console.log('📋 Error Response:', errorText)
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message)
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n🔗 URL Problem:')
      console.log('1. Check if the webhook URL is correct')
      console.log('2. Make sure n8n workflow is activated')
    }
  }
}

testN8nWebhook()
