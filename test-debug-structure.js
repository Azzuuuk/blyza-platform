import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './server/.env' });

const webhookUrl = process.env.N8N_WEBHOOK_URL;

console.log('🔄 Testing n8n Data Structure Debug...');
console.log('🔗 Webhook URL:', webhookUrl);

// Create minimal test data to debug the exact structure
const testData = {
  sessionId: "debug-session-001",
  quantitative: {
    gameInfo: {
      gameType: "Debug Test",
      duration: 5,
      participants: 1
    },
    quantitativeData: {
      totalInteractions: 10,
      averageResponseTime: 2.5
    },
    playerMetrics: [{
      playerId: "debug-player-1",
      name: "Debug Player",
      interactions: 10,
      avgResponseTime: 2.5
    }]
  },
  qualitative: {
    managerInfo: {
      managerName: "Debug Manager",
      department: "Debug Dept",
      email: "debug@test.com"
    },
    managerObservations: {
      teamDynamics: "Good debugging",
      communicationStyle: "Clear",
      leadershipObservations: "Effective",
      areasForImprovement: "None in debug mode"
    }
  }
};

console.log('📊 Debug Data Structure:');
console.log('✅ sessionId:', !!testData.sessionId);
console.log('✅ quantitative:', !!testData.quantitative);
console.log('✅ quantitative.gameInfo:', !!testData.quantitative.gameInfo);
console.log('✅ quantitative.quantitativeData:', !!testData.quantitative.quantitativeData);
console.log('✅ quantitative.playerMetrics:', !!testData.quantitative.playerMetrics);
console.log('✅ qualitative:', !!testData.qualitative);
console.log('✅ qualitative.managerInfo:', !!testData.qualitative.managerInfo);
console.log('✅ qualitative.managerObservations:', !!testData.qualitative.managerObservations);

async function testWebhook() {
  try {
    console.log('\n🚀 Sending debug data to n8n...');
    
    const response = await axios.post(webhookUrl, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('📝 Response Status:', response.status, response.statusText);
    console.log('✅ n8n webhook SUCCESS!');
    console.log('📋 Response:', response.data);
    console.log('\n🔍 Check your n8n dashboard execution logs');
    console.log('📊 Look for the console.log output from Data Validation node');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testWebhook();
