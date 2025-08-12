import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config({ path: './server/.env' })

async function testN8nWebhookDebugging() {
  try {
    console.log('🔍 Testing n8n Webhook Data Reception...\n')
    
    console.log('🔗 Webhook URL:', process.env.N8N_WEBHOOK_URL)
    
    // Test with minimal data first
    const minimalData = {
      sessionId: "debug-test-123",
      quantitative: {
        test: "minimal"
      },
      qualitative: {
        test: "minimal"
      }
    }
    
    console.log('📊 Test 1: Minimal Data Structure')
    console.log('Sending:', JSON.stringify(minimalData, null, 2))
    
    const response1 = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(minimalData)
    })
    
    console.log('Response 1:', response1.status, response1.statusText)
    if (!response1.ok) {
      const errorText = await response1.text()
      console.log('Error 1:', errorText)
    }
    
    console.log('\n' + '='.repeat(50) + '\n')
    
    // Test with wrapped data (sometimes webhooks receive wrapped data)
    const wrappedData = {
      data: {
        sessionId: "debug-test-456",
        quantitative: {
          test: "wrapped"
        },
        qualitative: {
          test: "wrapped"
        }
      }
    }
    
    console.log('📊 Test 2: Wrapped Data Structure')
    console.log('Sending:', JSON.stringify(wrappedData, null, 2))
    
    const response2 = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(wrappedData)
    })
    
    console.log('Response 2:', response2.status, response2.statusText)
    if (!response2.ok) {
      const errorText = await response2.text()
      console.log('Error 2:', errorText)
    }
    
    console.log('\n' + '='.repeat(50) + '\n')
    
    // Test with different content type
    console.log('📊 Test 3: Different Content-Type')
    
    const response3 = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        sessionId: "debug-test-789",
        quantitative: JSON.stringify({ test: "form-data" }),
        qualitative: JSON.stringify({ test: "form-data" })
      })
    })
    
    console.log('Response 3:', response3.status, response3.statusText)
    if (!response3.ok) {
      const errorText = await response3.text()
      console.log('Error 3:', errorText)
    }
    
    console.log('\n🔍 Next Steps:')
    console.log('1. Check your n8n execution dashboard for these 3 test runs')
    console.log('2. Look at which one (if any) passes the Data Validation node')
    console.log('3. Check the n8n execution logs to see what data structure it actually receives')
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message)
  }
}

// Run the debug test
testN8nWebhookDebugging()
