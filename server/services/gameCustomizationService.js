/**
 * Game Customization Service - Uses OpenAI to customize games
 * Based on company industry, team dynamics, and specific needs
 */

import OpenAI from 'openai'

export class GameCustomizationService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    
    // Storage for customization history
    this.customizationHistory = new Map()
  }

  /**
   * Customize a game template using OpenAI
   */
  async customizeGame(gameTemplate, customization) {
    try {
      if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️ OpenAI API key not configured. Using default template.')
        return this.getDefaultCustomization(gameTemplate, customization)
      }

      console.log(`🤖 Customizing game "${gameTemplate.title}" for ${customization.industry} team`)

      const prompt = this.buildCustomizationPrompt(gameTemplate, customization)
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert team-building facilitator with 20 years of experience in corporate training. You specialize in adapting games for different industries, team sizes, and cultural contexts."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })

      const customizedGame = JSON.parse(response.choices[0].message.content)
      
      // Add metadata
      const finalCustomization = {
        ...customizedGame,
        originalTemplate: gameTemplate.id,
        customizationId: this.generateCustomizationId(),
        customizedAt: new Date(),
        tokensUsed: response.usage?.total_tokens || 0,
        customizationParams: customization
      }
      
      // Store customization for analytics
      await this.storeCustomization(gameTemplate.id, customization, finalCustomization)
      
      console.log(`✅ Game customized successfully. Tokens used: ${response.usage?.total_tokens || 0}`)
      
      return finalCustomization
      
    } catch (error) {
      console.error('❌ Game customization failed:', error.message)
      
      // Fallback to default customization
      return this.getDefaultCustomization(gameTemplate, customization)
    }
  }

  /**
   * Build the AI prompt for game customization
   */
  buildCustomizationPrompt(gameTemplate, customization) {
    return `
Please customize this team-building game based on the specific requirements below. Return your response as a valid JSON object.

ORIGINAL GAME TEMPLATE:
${JSON.stringify(gameTemplate, null, 2)}

CUSTOMIZATION REQUIREMENTS:
- Industry: ${customization.industry || 'General Business'}
- Company Size: ${customization.companySize || 'Medium'}
- Team Size: ${customization.teamSize || '4-8 people'}
- Seniority Level: ${customization.seniorityLevel || 'Mixed'}
- Primary Focus: ${customization.focusArea || 'Team Building'}
- Tone Preference: ${customization.tone || 'Professional but engaging'}
- Difficulty Level: ${customization.difficulty || 'Medium'}
- Time Available: ${customization.timeMinutes || 30} minutes
- Cultural Context: ${customization.culturalContext || 'Western business culture'}
- Remote/In-Person: ${customization.format || 'Remote'}
- Special Considerations: ${customization.specialNotes || 'None'}

CUSTOMIZE THE FOLLOWING ELEMENTS:

1. **Game Instructions**: Adapt the main game flow for the industry and context
2. **Questions/Prompts**: Create industry-specific questions and scenarios
3. **Examples**: Provide relevant examples for the industry/role level
4. **Difficulty Adjustments**: Modify complexity based on seniority and time
5. **Visual Theme**: Suggest colors, imagery, and design elements
6. **Engagement Strategies**: Tactics to keep this specific team engaged
7. **Success Metrics**: What to measure for this type of team
8. **Follow-up Activities**: Suggested next steps after the game

REQUIREMENTS:
- Keep the core game mechanics but adapt the content
- Make it relevant to their industry and challenges
- Ensure it fits the time constraint
- Consider cultural sensitivity
- Include 3-5 specific industry-relevant scenarios
- Suggest appropriate difficulty level adjustments

Return the response in this exact JSON structure:
{
  "customizedTitle": "New game title with industry context",
  "customizedDescription": "Updated description",
  "instructions": {
    "overview": "Brief overview adapted for the context",
    "setup": "Setup instructions with customizations",
    "gameFlow": ["Step 1", "Step 2", "Step 3", "etc"],
    "timing": "Detailed timing breakdown"
  },
  "content": {
    "questions": ["Industry-specific question 1", "Question 2", "etc"],
    "scenarios": ["Scenario 1", "Scenario 2", "etc"],
    "examples": ["Example 1", "Example 2", "etc"]
  },
  "customizations": {
    "difficultyAdjustments": "How difficulty was modified",
    "industryAdaptations": "Industry-specific changes made",
    "cultureConsiderations": "Cultural adaptations"
  },
  "visualTheme": {
    "primaryColors": ["#color1", "#color2"],
    "imagery": "Suggested imagery style",
    "iconStyle": "Icon recommendations"
  },
  "engagementStrategies": [
    "Strategy 1 for this team type",
    "Strategy 2",
    "etc"
  ],
  "successMetrics": [
    "Metric 1 to track",
    "Metric 2",
    "etc"
  ],
  "followUpSuggestions": [
    "Follow-up activity 1",
    "Activity 2",
    "etc"
  ]
}
`
  }

  /**
   * Fallback customization when OpenAI is unavailable
   */
  getDefaultCustomization(gameTemplate, customization) {
    console.log('🔄 Using default customization fallback')
    
    return {
      customizedTitle: `${gameTemplate.title} for ${customization.industry || 'Your Team'}`,
      customizedDescription: gameTemplate.description,
      instructions: {
        overview: `A ${customization.difficulty || 'medium'} difficulty team building activity designed for ${customization.teamSize || '4-8'} people.`,
        setup: "Standard setup with team-specific adaptations",
        gameFlow: [
          "Welcome and introductions",
          "Explain the rules and objectives", 
          "Begin the main activity",
          "Team discussion and reflection",
          "Wrap-up and key takeaways"
        ],
        timing: `${customization.timeMinutes || 30} minutes total`
      },
      content: {
        questions: [
          "What's one strength you bring to this team?",
          "Describe a challenge you've overcome together",
          "What's one goal you'd like to achieve as a team?"
        ],
        scenarios: [
          "Your team needs to solve a problem under time pressure",
          "You need to collaborate on a project with tight deadlines",
          "How would you handle conflicting opinions in your team?"
        ],
        examples: [
          "Think about a recent project your team worked on",
          "Consider a time when communication was challenging",
          "Recall a moment when your team celebrated success"
        ]
      },
      customizations: {
        difficultyAdjustments: `Adjusted for ${customization.difficulty || 'medium'} difficulty`,
        industryAdaptations: `Adapted for ${customization.industry || 'general business'} context`,
        cultureConsiderations: "Standard business culture adaptations"
      },
      visualTheme: {
        primaryColors: ["#3B82F6", "#8B5CF6"],
        imagery: "Professional, modern, team-focused",
        iconStyle: "Clean, minimal, business-appropriate"
      },
      engagementStrategies: [
        "Use interactive polls and quick check-ins",
        "Encourage peer-to-peer sharing",
        "Include brief reflection moments"
      ],
      successMetrics: [
        "Participation rate",
        "Quality of responses", 
        "Team engagement level"
      ],
      followUpSuggestions: [
        "Schedule a follow-up team discussion",
        "Create action items based on insights",
        "Plan regular team building activities"
      ],
      originalTemplate: gameTemplate.id,
      customizationId: this.generateCustomizationId(),
      customizedAt: new Date(),
      tokensUsed: 0,
      customizationParams: customization,
      fallbackUsed: true
    }
  }

  /**
   * Store customization for analytics and learning
   */
  async storeCustomization(gameId, originalRequest, result) {
    const customizationRecord = {
      gameId,
      timestamp: new Date(),
      originalRequest,
      aiResult: result,
      tokensUsed: result.tokensUsed || 0,
      fallbackUsed: result.fallbackUsed || false
    }
    
    this.customizationHistory.set(result.customizationId, customizationRecord)
    
    console.log(`💾 Customization stored: ${result.customizationId}`)
  }

  /**
   * Get customization analytics
   */
  async getCustomizationAnalytics() {
    const totalCustomizations = this.customizationHistory.size
    let totalTokens = 0
    let fallbackCount = 0
    const industryBreakdown = {}
    
    for (const [id, record] of this.customizationHistory.entries()) {
      totalTokens += record.tokensUsed
      if (record.fallbackUsed) fallbackCount++
      
      const industry = record.originalRequest.industry || 'Unknown'
      industryBreakdown[industry] = (industryBreakdown[industry] || 0) + 1
    }
    
    return {
      totalCustomizations,
      totalTokens,
      averageTokensPerCustomization: totalCustomizations > 0 ? Math.round(totalTokens / totalCustomizations) : 0,
      fallbackUsageRate: totalCustomizations > 0 ? Math.round((fallbackCount / totalCustomizations) * 100) : 0,
      industryBreakdown,
      estimatedCost: totalTokens * 0.002 / 1000 // Rough OpenAI pricing estimate
    }
  }

  /**
   * Generate unique customization ID
   */
  generateCustomizationId() {
    return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get recent customizations for a game
   */
  async getGameCustomizations(gameId, limit = 10) {
    const gameCustomizations = []
    
    for (const [id, record] of this.customizationHistory.entries()) {
      if (record.gameId === gameId) {
        gameCustomizations.push({
          customizationId: id,
          ...record
        })
      }
    }
    
    return gameCustomizations
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)
  }
}
