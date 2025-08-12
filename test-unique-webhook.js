import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config({ path: './server/.env' })

async function testWithUniqueWebhook() {
  try {
    console.log('🔍 Testing with Different Webhook Approaches...\n')
    
    // Test data
    const testData = {
      sessionId: `unique-test-${Date.now()}`,
      timestamp: new Date().toISOString(),
      quantitative: {
        gameInfo: {
          gameName: "Unique Test Game",
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
          { playerId: 'p1', name: 'Alice', engagement: 9, responses: 20 }
        ]
      },
      qualitative: {
        managerInfo: {
          managerName: "Test Manager",
          managerEmail: "test@example.com",
          department: "Engineering",
          teamSize: 1
        },
        managerObservations: {
          teamDynamics: "Good collaboration",
          communicationIssues: "None observed",
          leadershipEmergence: "Clear leadership",
          creativityLevel: "high",
          trustIndicators: "Good trust levels"
        }
      }
    }
    
    console.log('📊 Testing Current Webhook URL:')
    console.log('🔗', process.env.N8N_WEBHOOK_URL)
    
    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    })
    
    console.log('📝 Response Status:', response.status, response.statusText)
    
    if (response.ok) {
      try {
        const responseText = await response.text()
        console.log('📋 Response Body:', responseText)
      } catch (e) {
        console.log('📋 No response body')
      }
      
      console.log('\n✅ Webhook accepted the request')
      console.log('🔍 Now check your n8n execution dashboard')
      console.log('👉 Look for the most recent execution')
      console.log('👉 Check the console logs in the debug node')
      
    } else {
      console.log('❌ Webhook failed')
      const errorText = await response.text()
      console.log('📋 Error:', errorText)
    }
    
    console.log('\n🎯 What to check in n8n:')
    console.log('1. Go to Executions in your n8n dashboard')
    console.log('2. Find the most recent execution')
    console.log('3. Click on it to see the details')
    console.log('4. Look at the debug node output')
    console.log('5. Copy the console logs and paste them here')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testWithUniqueWebhook()
