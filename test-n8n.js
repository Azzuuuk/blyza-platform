import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config({ path: './server/.env' })

async function testN8nIntegration() {
  try {
    console.log('🔄 Testing n8n Integration (Mock Mode)...\n')
    
    // Test 1: Check if webhook URL is configured
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    console.log('🔗 Webhook URL:', webhookUrl)
    
    if (!webhookUrl || webhookUrl === 'YOUR_ACTUAL_WEBHOOK_URL_FROM_N8N') {
      console.log('⚠️  n8n webhook URL not configured yet')
      console.log('📋 To configure:')
      console.log('1. Create n8n account at https://n8n.cloud')
      console.log('2. Import the workflow from n8n-workflow.json')
      console.log('3. Get the webhook URL from the Webhook Trigger node')
      console.log('4. Add it to your .env file')
      console.log('\n🧪 Testing with mock data for now...\n')
    }
    
    // Test 2: Prepare sample team building data
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
    }
    
    console.log('📊 Sample Team Building Data:')
    console.log('🎮 Game:', sampleGameData.quantitative.gameInfo.gameName)
    console.log('👥 Team Size:', sampleGameData.qualitative.managerInfo.teamSize)
    console.log('📈 Participation Rate:', sampleGameData.quantitative.quantitativeData.participationRate + '%')
    console.log('🤝 Collaboration Score:', sampleGameData.quantitative.quantitativeData.collaborationScore + '/10')
    
    // Test 3: Test local data processing (what n8n would do)
    console.log('\n🧠 Testing AI Analysis Logic (Mock):')
    
    const mockAnalysis = {
      executiveSummary: "This team demonstrates exceptional collaboration and trust-building capabilities. The high participation rate and natural leadership rotation indicate a psychologically safe environment where team members feel comfortable contributing.",
      strengths: [
        "Natural leadership rotation based on individual strengths",
        "High psychological safety enabling open communication",
        "Strong collaborative problem-solving approach"
      ],
      improvements: [
        "Streamline initial brainstorming process to reduce talking-over incidents",
        "Develop more structured communication protocols for remote settings",
        "Create clearer role definitions during complex problem-solving tasks"
      ],
      recommendations: [
        "Implement weekly rotating leadership roles in regular team meetings",
        "Establish clear speaking protocols for brainstorming sessions",
        "Schedule quarterly team building sessions to maintain current trust levels",
        "Document and share successful collaboration patterns with other teams",
        "Consider mentoring opportunities for emerging leaders"
      ],
      followUpActivities: [
        "Leadership skills workshop for Alice, Carol, and David",
        "Communication styles assessment for the entire team",
        "Monthly team retrospectives focusing on collaboration effectiveness"
      ],
      riskAssessment: "Low risk - team shows healthy dynamics with minor process improvements needed"
    }
    
    console.log('✅ Mock Analysis Generated:')
    console.log('📝 Executive Summary:', mockAnalysis.executiveSummary.substring(0, 100) + '...')
    console.log('💪 Strengths Found:', mockAnalysis.strengths.length)
    console.log('🎯 Recommendations:', mockAnalysis.recommendations.length)
    console.log('⚠️  Risk Level:', mockAnalysis.riskAssessment)
    
    // Test 4: Show what would be sent to n8n
    console.log('\n📡 Data that would be sent to n8n:')
    console.log(JSON.stringify(sampleGameData, null, 2))
    
    console.log('\n✅ n8n Integration Test Complete!')
    console.log('📋 Next Steps:')
    console.log('1. Set up your n8n account')
    console.log('2. Import the workflow')
    console.log('3. Add the webhook URL to .env')
    console.log('4. Test with real n8n workflow')
    
  } catch (error) {
    console.error('❌ n8n Test Error:', error.message)
  }
}

testN8nIntegration()
