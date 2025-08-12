import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config({ path: './server/.env' })

async function testDataStructure() {
  try {
    console.log('🔍 Testing Exact Data Structure n8n Receives...\n')
    
    // Very simple test data
    const simpleData = {
      test: "simple",
      quantitative: { value: 123 },
      qualitative: { value: 456 }
    }
    
    console.log('📤 Sending this exact data:')
    console.log(JSON.stringify(simpleData, null, 2))
    console.log('')
    
    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(simpleData)
    })
    
    console.log('📝 Response:', response.status, response.statusText)
    
    if (response.ok) {
      console.log('✅ Data sent successfully')
      console.log('')
      console.log('🔍 Now check your n8n debug execution:')
      console.log('👉 Look for the console logs that show:')
      console.log('   - "JSON content: {...}" ')
      console.log('   - What keys are actually present')
      console.log('   - Whether quantitative/qualitative exist')
      console.log('')
      console.log('📋 Copy the FULL console output from the debug node here!')
    } else {
      console.log('❌ Failed:', await response.text())
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testDataStructure()
