// Test the backend Code Breakers route with the new n8n data structure
import fetch from 'node-fetch';

async function testBackendN8nIntegration() {
  console.log('🧪 Testing Backend Code Breakers -> n8n Integration...\n');
  
  const testPayload = {
    gameId: `test-game-${Date.now()}`,
    sessionId: `session-${Date.now()}`,
    theme: 'spy',
    players: [
      { id: 'p1', name: 'Alice', score: 850 },
      { id: 'p2', name: 'Bob', score: 720 }
    ],
    startTime: Date.now() - 300000, // 5 minutes ago
    endTime: Date.now(),
    messagesDecoded: 3,
    totalMessages: 4,
    hintsUsed: 2,
    chatMessages: 8,
    finalScore: 850
  };

  try {
    console.log('📤 Sending Code Breakers results to backend...');
    
    const response = await fetch('http://localhost:3001/api/games/code-breakers/submit-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📊 Response Status:', response.status, response.statusText);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Backend Response:', result);
      console.log('🎯 Success! Backend should have sent data to n8n with correct structure');
    } else {
      const error = await response.text();
      console.log('❌ Backend Error:', error);
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testBackendN8nIntegration();
