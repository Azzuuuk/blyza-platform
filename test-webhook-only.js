// Simple webhook test - sends data that matches the expected n8n validation structure
const testData = {
  sessionId: `webhook-test-${Date.now()}`,
  timestamp: new Date().toISOString(),
  quantitative: {
    gameInfo: {
      gameName: "Build Tower Game",
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
      { playerId: 'p3', name: 'Carol Davis', engagement: 9, responses: 22 }
    ]
  },
  qualitative: {
    managerInfo: {
      managerName: "Sarah Johnson",
      managerEmail: "sarah.johnson@testcompany.com",
      department: "Engineering",
      teamSize: 3
    },
    managerObservations: {
      teamDynamics: "Excellent collaboration and communication throughout the session",
      communicationIssues: "Some minor interruptions but overall very good communication",
      leadershipEmergence: "Alice demonstrated clear leadership qualities and guided the team effectively",
      creativityLevel: "high",
      trustIndicators: "Team members felt comfortable sharing ideas and providing honest feedback"
    }
  }
};

const N8N_WEBHOOK_URL = 'https://blyza.app.n8n.cloud/webhook/blyza-analysis';

console.log('🚀 Sending test data to n8n webhook...');
console.log('📡 Webhook URL:', N8N_WEBHOOK_URL);
console.log('📊 Data being sent:', JSON.stringify(testData, null, 2));

fetch(N8N_WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData),
  signal: AbortSignal.timeout(30000) // 30 second timeout
})
.then(response => {
  console.log('✅ Response Status:', response.status);
  console.log('📝 Response Headers:', Object.fromEntries(response.headers.entries()));
  return response.text();
})
.then(data => {
  console.log('📋 Response Body:', data);
  console.log('🎉 Webhook test completed!');
  console.log('👀 Check your n8n dashboard to see all nodes execute');
})
.catch(error => {
  console.error('❌ Error:', error);
});
