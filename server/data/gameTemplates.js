/**
 * Comprehensive game templates for team building
 * Each game targets specific team challenges and can be customized via AI
 */

export const gameTemplates = [
  // TRUST BUILDING GAMES
  {
    id: 'real-or-ai',
    title: 'Real or AI?',
    category: 'Trust Building',
    description: 'Players guess whether statements, images, or stories are real or AI-generated. Builds critical thinking and trust in information.',
    objective: 'Develop collective judgment and trust in team decision-making',
    duration: 15, // minutes
    teamSize: { min: 3, max: 12 },
    difficulty: 'Easy',
    rating: 4.8,
    tags: ['critical-thinking', 'discussion', 'technology'],
    thumbnail: '/images/games/real-or-ai.jpg',
    gameType: 'quiz-discussion',
    rounds: 8,
    pointsPerRound: 10,
    mechanics: {
      type: 'voting',
      timePerQuestion: 45,
      discussion: true,
      individualScoring: true,
      teamScoring: true
    },
    questions: [
      {
        type: 'image',
        content: 'Is this landscape photo real or AI-generated?',
        options: ['Real', 'AI-Generated'],
        correct: 'AI-Generated',
        explanation: 'This was created by DALL-E 3. Notice the subtle inconsistencies in lighting.'
      },
      {
        type: 'text',
        content: 'Employee testimonial: "Working here changed my perspective on collaboration..."',
        options: ['Real Employee Review', 'AI-Generated Text'],
        correct: 'Real Employee Review',
        explanation: 'This came from our actual Glassdoor reviews.'
      }
    ],
    customizable: {
      tone: true,
      content: true,
      difficulty: true,
      industry: true
    }
  },

  {
    id: 'trust-fall-digital',
    title: 'Digital Trust Fall',
    category: 'Trust Building',
    description: 'Virtual trust-building exercise where team members share vulnerabilities and rely on others for support.',
    objective: 'Build psychological safety and interpersonal trust',
    duration: 25,
    teamSize: { min: 4, max: 8 },
    difficulty: 'Medium',
    rating: 4.6,
    tags: ['vulnerability', 'sharing', 'support'],
    thumbnail: '/images/games/trust-fall.jpg',
    gameType: 'sharing-circle',
    rounds: 3,
    pointsPerRound: 20,
    mechanics: {
      type: 'turn-based-sharing',
      timePerShare: 120,
      anonymousMode: true,
      supportReactions: true
    }
  },

  // COMMUNICATION GAMES
  {
    id: 'story-builder',
    title: 'Collaborative Story Builder',
    category: 'Communication',
    description: 'Teams build a story together, with each person adding one sentence. Tests listening and building on ideas.',
    objective: 'Improve active listening and collaborative creativity',
    duration: 20,
    teamSize: { min: 3, max: 10 },
    difficulty: 'Easy',
    rating: 4.7,
    tags: ['creativity', 'listening', 'storytelling'],
    thumbnail: '/images/games/story-builder.jpg',
    gameType: 'collaborative-creation',
    rounds: 5,
    pointsPerRound: 15,
    mechanics: {
      type: 'sequential',
      timePerTurn: 60,
      buildOnPrevious: true,
      voting: true
    }
  },

  {
    id: 'emoji-translator',
    title: 'Emoji Translator',
    category: 'Communication',
    description: 'Teams decode complex business scenarios told entirely through emojis. Focuses on non-verbal communication.',
    objective: 'Enhance interpretation skills and creative communication',
    duration: 18,
    teamSize: { min: 3, max: 12 },
    difficulty: 'Medium',
    rating: 4.5,
    tags: ['interpretation', 'creativity', 'fun'],
    thumbnail: '/images/games/emoji-translator.jpg',
    gameType: 'decoding-challenge',
    rounds: 6,
    pointsPerRound: 12
  },

  {
    id: 'telephone-remix',
    title: 'Digital Telephone Remix',
    category: 'Communication',
    description: 'Modern take on telephone game using images, text, and drawings to show how information changes.',
    objective: 'Understand communication barriers and improve clarity',
    duration: 22,
    teamSize: { min: 5, max: 12 },
    difficulty: 'Easy',
    rating: 4.4,
    tags: ['clarity', 'transformation', 'awareness'],
    thumbnail: '/images/games/telephone.jpg',
    gameType: 'transformation-chain',
    rounds: 4,
    pointsPerRound: 18
  },

  // PROBLEM SOLVING GAMES
  {
    id: 'escape-room-digital',
    title: 'Corporate Escape Room',
    category: 'Problem Solving',
    description: 'Solve business-related puzzles and challenges as a team to "escape" within the time limit.',
    objective: 'Develop collaborative problem-solving and time management',
    duration: 35,
    teamSize: { min: 4, max: 8 },
    difficulty: 'Hard',
    rating: 4.9,
    tags: ['puzzles', 'time-pressure', 'collaboration'],
    thumbnail: '/images/games/escape-room.jpg',
    gameType: 'puzzle-solving',
    rounds: 8,
    pointsPerRound: 25,
    mechanics: {
      type: 'collaborative-puzzle',
      timeLimit: 2100, // 35 minutes
      hints: true,
      progressTracking: true
    }
  },

  {
    id: 'budget-challenge',
    title: 'Budget Challenge',
    category: 'Problem Solving',
    description: 'Teams allocate limited resources to solve business scenarios, making trade-offs and justifying decisions.',
    objective: 'Practice resource allocation and consensus building',
    duration: 28,
    teamSize: { min: 3, max: 8 },
    difficulty: 'Hard',
    rating: 4.6,
    tags: ['strategy', 'trade-offs', 'business'],
    thumbnail: '/images/games/budget-challenge.jpg',
    gameType: 'strategy-simulation',
    rounds: 5,
    pointsPerRound: 30
  },

  {
    id: 'innovation-lab',
    title: 'Innovation Lab',
    category: 'Problem Solving',
    description: 'Rapid ideation and prototyping challenge where teams solve real workplace problems creatively.',
    objective: 'Foster innovative thinking and rapid prototyping skills',
    duration: 30,
    teamSize: { min: 4, max: 10 },
    difficulty: 'Medium',
    rating: 4.7,
    tags: ['innovation', 'ideation', 'prototyping'],
    thumbnail: '/images/games/innovation-lab.jpg',
    gameType: 'ideation-challenge',
    rounds: 4,
    pointsPerRound: 35
  },

  // CREATIVITY GAMES
  {
    id: 'pitch-perfect',
    title: 'Pitch Perfect',
    category: 'Creativity',
    description: 'Teams create and pitch ridiculous but compelling business ideas in limited time.',
    objective: 'Build presentation skills and creative confidence',
    duration: 25,
    teamSize: { min: 3, max: 12 },
    difficulty: 'Medium',
    rating: 4.8,
    tags: ['presentation', 'creativity', 'humor'],
    thumbnail: '/images/games/pitch-perfect.jpg',
    gameType: 'presentation-challenge',
    rounds: 3,
    pointsPerRound: 40
  },

  {
    id: 'design-thinking-workshop',
    title: 'Design Thinking Sprint',
    category: 'Creativity',
    description: 'Guided design thinking process to solve a team or company challenge in structured steps.',
    objective: 'Learn design thinking methodology and apply it collaboratively',
    duration: 40,
    teamSize: { min: 4, max: 8 },
    difficulty: 'Hard',
    rating: 4.9,
    tags: ['design-thinking', 'methodology', 'structured'],
    thumbnail: '/images/games/design-thinking.jpg',
    gameType: 'structured-workshop',
    rounds: 6,
    pointsPerRound: 25
  },

  {
    id: 'brainstorm-battle',
    title: 'Brainstorm Battle',
    category: 'Creativity',
    description: 'Competitive ideation where teams generate as many creative solutions as possible to given challenges.',
    objective: 'Practice rapid ideation and build on others\' ideas',
    duration: 20,
    teamSize: { min: 4, max: 12 },
    difficulty: 'Easy',
    rating: 4.5,
    tags: ['ideation', 'quantity', 'building-on-ideas'],
    thumbnail: '/images/games/brainstorm-battle.jpg',
    gameType: 'rapid-ideation',
    rounds: 5,
    pointsPerRound: 15
  },

  // LEADERSHIP GAMES
  {
    id: 'crisis-management',
    title: 'Crisis Management Simulator',
    category: 'Leadership',
    description: 'Teams navigate simulated business crises, making quick decisions and managing stakeholder communication.',
    objective: 'Develop crisis leadership and decision-making under pressure',
    duration: 32,
    teamSize: { min: 4, max: 8 },
    difficulty: 'Hard',
    rating: 4.7,
    tags: ['crisis', 'decision-making', 'pressure'],
    thumbnail: '/images/games/crisis-management.jpg',
    gameType: 'simulation',
    rounds: 6,
    pointsPerRound: 30
  },

  {
    id: 'delegation-station',
    title: 'Delegation Station',
    category: 'Leadership',
    description: 'Leadership exercise where one person must delegate tasks to complete a complex project efficiently.',
    objective: 'Practice effective delegation and task coordination',
    duration: 25,
    teamSize: { min: 4, max: 10 },
    difficulty: 'Medium',
    rating: 4.4,
    tags: ['delegation', 'coordination', 'leadership'],
    thumbnail: '/images/games/delegation.jpg',
    gameType: 'role-assignment',
    rounds: 4,
    pointsPerRound: 25
  },

  {
    id: 'vision-quest',
    title: 'Vision Quest',
    category: 'Leadership',
    description: 'Teams collaboratively create and align on a shared vision for a project or challenge.',
    objective: 'Practice vision creation and alignment building',
    duration: 30,
    teamSize: { min: 3, max: 8 },
    difficulty: 'Medium',
    rating: 4.6,
    tags: ['vision', 'alignment', 'collaboration'],
    thumbnail: '/images/games/vision-quest.jpg',
    gameType: 'collaborative-planning',
    rounds: 5,
    pointsPerRound: 28
  },

  // MIXED/GENERAL GAMES
  {
    id: 'values-alignment',
    title: 'Values Alignment Challenge',
    category: 'Trust Building',
    description: 'Discover team values through scenarios and discussions, finding common ground and understanding differences.',
    objective: 'Understand team values and build alignment',
    duration: 28,
    teamSize: { min: 3, max: 10 },
    difficulty: 'Medium',
    rating: 4.8,
    tags: ['values', 'alignment', 'understanding'],
    thumbnail: '/images/games/values.jpg',
    gameType: 'discussion-based',
    rounds: 6,
    pointsPerRound: 20
  },

  {
    id: 'time-travel-team',
    title: 'Time Travel Team',
    category: 'Creativity',
    description: 'Teams solve modern problems using only tools and knowledge from different historical periods.',
    objective: 'Think creatively with constraints and appreciate diverse perspectives',
    duration: 24,
    teamSize: { min: 3, max: 8 },
    difficulty: 'Medium',
    rating: 4.5,
    tags: ['constraints', 'history', 'perspective'],
    thumbnail: '/images/games/time-travel.jpg',
    gameType: 'constraint-challenge',
    rounds: 4,
    pointsPerRound: 22
  },

  {
    id: 'collaboration-station',
    title: 'Collaboration Station',
    category: 'Communication',
    description: 'Multi-stage challenges that require different team members to contribute their unique skills.',
    objective: 'Appreciate diverse skills and practice inclusive collaboration',
    duration: 26,
    teamSize: { min: 4, max: 10 },
    difficulty: 'Medium',
    rating: 4.7,
    tags: ['diversity', 'skills', 'inclusion'],
    thumbnail: '/images/games/collaboration.jpg',
    gameType: 'skill-based-challenge',
    rounds: 5,
    pointsPerRound: 24
  },

  {
    id: 'feedback-freestyle',
    title: 'Feedback Freestyle',
    category: 'Communication',
    description: 'Structured practice giving and receiving constructive feedback in a safe, game-like environment.',
    objective: 'Improve feedback skills and comfort with constructive criticism',
    duration: 22,
    teamSize: { min: 3, max: 8 },
    difficulty: 'Medium',
    rating: 4.6,
    tags: ['feedback', 'growth', 'communication'],
    thumbnail: '/images/games/feedback.jpg',
    gameType: 'feedback-practice',
    rounds: 4,
    pointsPerRound: 18
  },

  {
    id: 'guess-the-price',
    title: 'Guess the Price: Business Edition',
    category: 'Problem Solving',
    description: 'Teams estimate costs, budgets, and ROI for various business scenarios, learning about business economics.',
    objective: 'Develop business acumen and estimation skills',
    duration: 18,
    teamSize: { min: 3, max: 12 },
    difficulty: 'Easy',
    rating: 4.3,
    tags: ['estimation', 'business', 'economics'],
    thumbnail: '/images/games/guess-price.jpg',
    gameType: 'estimation-challenge',
    rounds: 8,
    pointsPerRound: 12
  }
];

/**
 * Get games by category
 */
export const getGamesByCategory = (category) => {
  return gameTemplates.filter(game => 
    game.category.toLowerCase() === category.toLowerCase()
  );
};

/**
 * Get games suitable for team size
 */
export const getGamesByTeamSize = (size) => {
  return gameTemplates.filter(game => 
    game.teamSize.min <= size && game.teamSize.max >= size
  );
};

/**
 * Get games by difficulty
 */
export const getGamesByDifficulty = (difficulty) => {
  return gameTemplates.filter(game => 
    game.difficulty.toLowerCase() === difficulty.toLowerCase()
  );
};

/**
 * Get games by duration range
 */
export const getGamesByDuration = (minDuration, maxDuration) => {
  return gameTemplates.filter(game => 
    game.duration >= minDuration && game.duration <= maxDuration
  );
};
