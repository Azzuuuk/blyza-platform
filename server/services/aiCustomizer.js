import OpenAI from 'openai';

/**
 * AI-powered game customization service
 */
export class AICustomizer {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;
  }

  /**
   * Customize a game template using AI
   */
  async customizeGame(gameTemplate, customization) {
    try {
      const { tone, theme, difficulty, customPrompt, companyContext } = customization;
      
      if (!this.openai) {
        // Return mock customization if no API key
        return this.getMockCustomization(gameTemplate, customization);
      }

      const prompt = this.buildCustomizationPrompt(gameTemplate, customization);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert team-building facilitator and game designer. Customize team-building games based on company context, tone preferences, and specific requirements. Return a JSON object with the customized game details."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const customizedContent = JSON.parse(response.choices[0].message.content);
      
      return {
        ...gameTemplate,
        ...customizedContent,
        customized: true,
        customizationApplied: {
          tone,
          theme,
          difficulty,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('AI customization error:', error);
      // Fall back to mock customization
      return this.getMockCustomization(gameTemplate, customization);
    }
  }

  /**
   * Build the AI prompt for game customization
   */
  buildCustomizationPrompt(gameTemplate, customization) {
    const { tone, theme, difficulty, customPrompt, companyContext } = customization;
    
    return `
Please customize this team-building game:

ORIGINAL GAME:
Title: ${gameTemplate.title}
Description: ${gameTemplate.description}
Category: ${gameTemplate.category}
Duration: ${gameTemplate.duration} minutes
Team Size: ${gameTemplate.teamSize.min}-${gameTemplate.teamSize.max} people
Current Difficulty: ${gameTemplate.difficulty}

CUSTOMIZATION REQUIREMENTS:
- Tone: ${tone} (Professional, Fun, Edgy, Casual)
- Theme: ${theme || 'Default'}
- Target Difficulty: ${difficulty || gameTemplate.difficulty}
- Company Context: ${companyContext || 'General corporate environment'}
${customPrompt ? `- Additional Requirements: ${customPrompt}` : ''}

Please provide a JSON response with these fields:
{
  "title": "Updated title that reflects the customization",
  "description": "Updated description matching the tone and theme",
  "customInstructions": "Specific facilitator instructions for this customization",
  "questions": "Updated or new questions/scenarios that fit the customization (if applicable)",
  "adaptedMechanics": "Any changes to game mechanics or flow",
  "estimatedDuration": "Updated duration if needed",
  "materials": "Any additional materials or setup required",
  "toneAdjustments": "Specific language and approach adjustments",
  "companySpecific": "How this relates to the company context provided"
}

Ensure the customization maintains the core team-building objectives while adapting to the requested tone and context.
    `.trim();
  }

  /**
   * Generate mock customization when AI is not available
   */
  getMockCustomization(gameTemplate, customization) {
    const { tone, theme, difficulty } = customization;
    
    const toneAdjustments = {
      'Professional': {
        prefix: 'Executive',
        language: 'business-focused',
        examples: 'corporate scenarios'
      },
      'Fun': {
        prefix: 'Fun-tastic',
        language: 'playful and energetic',
        examples: 'entertaining scenarios'
      },
      'Edgy': {
        prefix: 'Bold',
        language: 'direct and challenging',
        examples: 'provocative scenarios'
      },
      'Casual': {
        prefix: 'Relaxed',
        language: 'informal and comfortable',
        examples: 'everyday scenarios'
      }
    };

    const adjustment = toneAdjustments[tone] || toneAdjustments['Professional'];
    
    return {
      ...gameTemplate,
      title: `${adjustment.prefix} ${gameTemplate.title}`,
      description: `${gameTemplate.description} Customized with a ${tone.toLowerCase()} tone for enhanced team engagement.`,
      customInstructions: `Facilitate this game with a ${adjustment.language} approach. Use ${adjustment.examples} to make it relevant to the team.`,
      customized: true,
      mockCustomization: true,
      customizationApplied: {
        tone,
        theme,
        difficulty,
        timestamp: new Date().toISOString()
      },
      adaptedMechanics: `Game mechanics adapted for ${tone.toLowerCase()} delivery style.`,
      toneAdjustments: `Language and presentation adjusted to be ${adjustment.language}.`
    };
  }

  /**
   * Generate custom scenarios for a game
   */
  async generateCustomScenarios(gameTemplate, context) {
    try {
      if (!this.openai) {
        return this.getMockScenarios(gameTemplate);
      }

      const prompt = `
Generate 5 custom scenarios for the team-building game "${gameTemplate.title}".

Game Context: ${gameTemplate.description}
Company/Team Context: ${context}

Each scenario should:
1. Be relevant to the game mechanics
2. Relate to the team's work environment
3. Encourage meaningful discussion
4. Be appropriate for workplace settings

Return as JSON array with this structure:
[
  {
    "scenario": "The scenario description",
    "discussion_points": ["Point 1", "Point 2", "Point 3"],
    "difficulty": "Easy/Medium/Hard"
  }
]
      `.trim();

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 1500
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Scenario generation error:', error);
      return this.getMockScenarios(gameTemplate);
    }
  }

  /**
   * Mock scenarios for when AI is not available
   */
  getMockScenarios(gameTemplate) {
    return [
      {
        scenario: `Team scenario related to ${gameTemplate.category.toLowerCase()}`,
        discussion_points: [
          "How does this relate to our daily work?",
          "What can we learn from this situation?",
          "How can we apply this insight to our team?"
        ],
        difficulty: "Medium"
      }
    ];
  }
}
