#!/usr/bin/env node

/**
 * Test n8n webhook trigger by sending Code Breakers results
 */

const testWebhook = async () => {
  const testPayload = {
    sessionId: `test_session_${Date.now()}`,
    gameType: 'code-breakers',
    theme: 'spy',
    players: [
      { id: 1, name: 'Agent Alpha', role: 'decoder' },
      { id: 2, name: 'Agent Beta', role: 'analyst' },
      { id: 3, name: 'Agent Charlie', role: 'cryptographer' }
    ],
    startTime: Date.now() - 900000, // 15 minutes ago
    endTime: Date.now(),
    messagesDecoded: 3,
    totalMessages: 4,
    hintsUsed: 1,
    chatMessages: 12,
    finalScore: 850
  }

  console.log('🎮 Testing n8n webhook with Code Breakers result...')
  console.log('📊 Payload:', JSON.stringify(testPayload, null, 2))

  try {
    // Test local endpoint first
    console.log('\n🔗 Testing local backend endpoint...')
    const response = await fetch('http://localhost:3001/api/games/code-breakers/submit-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Local endpoint success:', result)
    } else {
      console.log('❌ Local endpoint failed:', response.status, await response.text())
    }

    // Test direct n8n webhook
    console.log('\n🌐 Testing direct n8n webhook...')
    const n8nResponse = await fetch('https://blyza.app.n8n.cloud/webhook/blyza-analysis/code-breakers-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gameResults: testPayload,
        analysisType: 'code-breakers',
        playerMetrics: {
          problemSolving: testPayload.messagesDecoded > 0 ? 'High' : 'Medium',
          teamwork: testPayload.chatMessages > 5 ? 'High' : 'Medium',
          timeManagement: (testPayload.endTime - testPayload.startTime) < 600000 ? 'Excellent' : 'Good',
          adaptability: testPayload.hintsUsed < 3 ? 'High' : 'Medium'
        }
      })
    })

    if (n8nResponse.ok) {
      const n8nResult = await n8nResponse.text()
      console.log('✅ Direct n8n webhook success:', n8nResult)
    } else {
      console.log('❌ Direct n8n webhook failed:', n8nResponse.status, await n8nResponse.text())
    }

  } catch (error) {
    console.error('❌ Error testing webhook:', error.message)
  }
}

// Run the test
testWebhook()
