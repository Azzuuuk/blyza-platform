#!/usr/bin/env node

/**
 * Test Script for Blyza Platform n8n Integration
 * This script simulates the complete data flow from game completion to dashboard report
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

// Sample game session data
const sampleGameData = {
  sessionId: `test-session-${Date.now()}`,
  timestamp: new Date().toISOString(),
  quantitative: {
    gameInfo: {
      gameName: "Virtual Escape Room",
      duration: 45,
      difficulty: "medium",
      category: "problem-solving"
    },
    quantitativeData: {
      participationRate: 95,
      averageResponseTime: 12.5,
      emotionalEngagement: 8.7,
      collaborationScore: 9.2
    },
    playerMetrics: [
      { playerId: "p1", name: "Alice Johnson", engagement: 9, responses: 15 },
      { playerId: "p2", name: "Bob Smith", engagement: 8, responses: 12 },
      { playerId: "p3", name: "Carol Davis", engagement: 9, responses: 18 },
      { playerId: "p4", name: "David Wilson", engagement: 8, responses: 14 },
      { playerId: "p5", name: "Eva Brown", engagement: 9, responses: 16 }
    ]
  },
  qualitative: {
    managerInfo: {
      managerName: "Sarah Manager",
      managerEmail: "sarah.manager@company.com",
      department: "Product Development",
      teamSize: 5
    },
    managerObservations: {
      teamDynamics: "Excellent collaboration with natural leadership rotation. Team members supported each other effectively and built on each other's ideas.",
      communicationIssues: "Minimal issues - one instance of talking over each other during brainstorming, but quickly self-corrected.",
      leadershipEmergence: "Alice took clear initiative early on, but leadership naturally rotated between Alice, Carol, and David based on their strengths.",
      creativityLevel: "high",
      trustIndicators: "Team members were comfortable sharing unconventional ideas, asked for help when needed, and openly admitted mistakes without defensiveness."
    }
  }
};

async function testWorkflow() {
  console.log('🧪 Testing Blyza Platform n8n Integration...\n');

  try {
    // Step 1: Submit game metrics
    console.log('📊 Step 1: Submitting game metrics...');
    const metricsResponse = await fetch(`${BASE_URL}/api/dashboard/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sampleGameData.sessionId,
        metrics: sampleGameData.quantitative
      })
    });
    
    if (metricsResponse.ok) {
      console.log('✅ Game metrics submitted successfully');
    } else {
      console.log('❌ Failed to submit metrics:', await metricsResponse.text());
    }

    // Step 2: Submit manager feedback
    console.log('\n💭 Step 2: Submitting manager feedback...');
    const feedbackResponse = await fetch(`${BASE_URL}/api/dashboard/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sampleGameData.sessionId,
        feedback: sampleGameData.qualitative
      })
    });

    if (feedbackResponse.ok) {
      console.log('✅ Manager feedback submitted successfully');
    } else {
      console.log('❌ Failed to submit feedback:', await feedbackResponse.text());
    }

    // Step 3: Check if workflow was triggered (simulated)
    console.log('\n🔄 Step 3: Checking workflow status...');
    console.log('📡 n8n workflow would be triggered with this data:');
    console.log(JSON.stringify(sampleGameData, null, 2));

    // Step 4: Simulate n8n saving the report back
    console.log('\n📝 Step 4: Simulating n8n report generation...');
    
    const simulatedAIReport = {
      sessionId: sampleGameData.sessionId,
      timestamp: new Date(),
      managerEmail: sampleGameData.qualitative.managerInfo.managerEmail,
      managerName: sampleGameData.qualitative.managerInfo.managerName,
      gameInfo: sampleGameData.quantitative.gameInfo,
      
      metrics: {
        overallEngagement: 87,
        participationRate: 95,
        teamCohesion: 92,
        communicationScore: 88,
        leadershipClarity: 85
      },
      
      insights: {
        executiveSummary: "This team demonstrated exceptional collaboration and adaptability during the virtual escape room challenge. Strong natural leadership rotation and high trust indicators suggest a psychologically safe environment.",
        strengths: [
          "Natural leadership rotation based on individual strengths",
          "High psychological safety enabling open communication",
          "Excellent problem-solving collaboration"
        ],
        improvements: [
          "Manage excitement levels during brainstorming to prevent talking over",
          "Develop structured approach to idea generation",
          "Practice active listening techniques"
        ],
        recommendations: [
          "Schedule monthly leadership rotation exercises",
          "Implement structured brainstorming protocols",
          "Conduct follow-up team retrospective in 2 weeks",
          "Consider advanced problem-solving challenges",
          "Document successful collaboration patterns for future reference"
        ],
        followUp: [
          "Schedule next team building session in 4-6 weeks",
          "Individual coaching for emerging leaders",
          "Team retrospective meeting",
          "Skills workshop on structured brainstorming"
        ]
      },
      
      chartData: {
        engagement: {
          labels: ['Communication', 'Collaboration', 'Leadership', 'Creativity', 'Trust'],
          values: [88, 92, 85, 90, 89]
        }
      }
    };

    const reportResponse = await fetch(`${BASE_URL}/api/dashboard/save-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sampleGameData.sessionId,
        reportData: simulatedAIReport,
        timestamp: new Date(),
        status: 'completed'
      })
    });

    if (reportResponse.ok) {
      console.log('✅ AI-generated report saved to dashboard');
    } else {
      console.log('❌ Failed to save report:', await reportResponse.text());
    }

    // Step 5: Verify dashboard can retrieve the report
    console.log('\n📋 Step 5: Retrieving report from dashboard...');
    const dashboardResponse = await fetch(`${BASE_URL}/api/dashboard/reports?manager=${encodeURIComponent(sampleGameData.qualitative.managerInfo.managerEmail)}`);
    
    if (dashboardResponse.ok) {
      const reports = await dashboardResponse.json();
      console.log('✅ Dashboard reports retrieved successfully');
      console.log(`📊 Found ${reports.length} report(s) for manager`);
    } else {
      console.log('❌ Failed to retrieve dashboard reports');
    }

    console.log('\n🎉 Test completed! Check the dashboard at http://localhost:3002/dashboard');
    console.log('\n📋 Next Steps:');
    console.log('1. Configure your n8n webhook URL in .env');
    console.log('2. Import the n8n workflow from n8n-workflow.json');
    console.log('3. Set up OpenAI and email credentials in n8n');
    console.log('4. Test with real data from the platform');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testWorkflow();
