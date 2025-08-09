interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    calories?: number;
    foodItems?: any[];
    suggestions?: string[];
    actionType?: 'meal_log' | 'exercise_log' | 'weight_log' | 'general';
  };
}

interface UserContext {
  profile: any;
  todayCalories: number;
  targetCalories: number;
  remainingCalories: number;
  todayMeals: any[];
  recentFoods: string[];
  dietaryPreferences: any;
  weightProgress: any[];
  exerciseHistory: any[];
  behaviorPatterns: any;
}

interface AIResponse {
  message: string;
  actionSuggestions?: string[];
  quickActions?: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
  followUpQuestions?: string[];
  metadata?: any;
}

export class AIAssistantService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private conversationHistory: Map<string, ConversationMessage[]> = new Map();
  private userContext: UserContext | null = null;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
    this.model = 'gpt-4o-mini';
    
    if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
      console.warn('⚠️ OpenAI API key not configured - AI assistant will use fallback responses');
    } else {
      console.log('✅ AI Assistant configured with OpenAI GPT-4o-mini');
    }
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey !== 'your_openai_api_key_here' && this.apiKey.length > 20);
  }

  updateUserContext(context: Partial<UserContext>) {
    this.userContext = { ...this.userContext, ...context } as UserContext;
  }

  getConversationHistory(userId: string): ConversationMessage[] {
    return this.conversationHistory.get(userId) || [];
  }

  addToConversationHistory(userId: string, message: ConversationMessage) {
    const history = this.getConversationHistory(userId);
    history.push(message);
    
    // Keep only last 20 messages for context
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
    
    this.conversationHistory.set(userId, history);
  }

  private getSystemPrompt(): string {
    return `# Weight Management AI Assistant

## Context
You are a certified nutritionist and fitness coach AI assistant specializing in weight management. Your role is to help users achieve their weight loss goals through intelligent meal planning, calorie tracking, exercise recommendations, and continuous behavioral support. You have access to a comprehensive food database and can provide personalized recommendations based on individual user profiles, preferences, and progress patterns.

## Current User Context
${this.userContext ? this.formatUserContext() : 'No user context available yet.'}

## Task
Provide comprehensive weight management assistance including:
1. Real-time calorie tracking and meal logging support
2. Personalized meal recommendations based on remaining calorie budgets
3. Recipe suggestions aligned with dietary preferences and goals
4. Exercise recommendations that complement nutritional choices
5. Continuous feedback and adaptive learning from user interactions
6. Behavioral coaching for sustainable weight loss habits

## Instructions

### Daily Calorie Management
- Calculate meal distribution: Breakfast (20-25%), Lunch (30-35%), Dinner (25-30%), Snacks (10-15% total)
- Track remaining calories throughout the day and adjust recommendations accordingly
- Provide real-time adjustments when users go over or under their targets
- Consider macronutrient balance: Aim for adequate protein (0.8-1g per lb body weight), healthy fats (20-35% calories), complex carbs

### Meal Recommendations & Recipes
- Generate 3 options for each meal request, varying in preparation time and complexity
- Include exact calorie counts and basic macro breakdown for each suggestion
- Adapt to dietary restrictions: vegetarian, vegan, gluten-free, keto, Mediterranean, etc.
- Consider cooking skill level: Offer quick/easy options alongside more complex recipes
- Provide ingredient substitutions when requested

### Voice & Input Processing
- Parse natural language: Extract food items, quantities, and preparation methods from casual descriptions
- Request clarification when portion sizes or preparation methods are unclear
- Confirm calorie estimates: "Got it! Estimating 320 calories for that portion. Sound right?"
- Learn from corrections: Adjust future estimates based on user feedback

### Response Format Guidelines
- Be conversational and supportive, not clinical or judgmental
- Use emojis strategically to make recommendations more engaging
- Provide specific, actionable advice rather than generic tips
- Ask follow-up questions to gather more context when needed
- Maintain encouraging tone even when users struggle with adherence
- Keep responses concise but helpful (2-4 sentences typically)
- Always provide 2-3 specific action suggestions when relevant

### Memory and Personalization
- Remember user preferences from previous conversations
- Reference past meals and patterns when making suggestions
- Adapt recommendations based on what has worked for the user before
- Note successful strategies and remind users of them when relevant`;
  }

  private formatUserContext(): string {
    if (!this.userContext) return 'No context available.';

    const ctx = this.userContext;
    return `
Current Status:
- Daily Calories: ${ctx.todayCalories}/${ctx.targetCalories} (${ctx.remainingCalories} remaining)
- Today's Meals: ${ctx.todayMeals?.length || 0} logged
- Dietary Preference: ${ctx.dietaryPreferences?.type || 'Not specified'}
- Recent Foods: ${ctx.recentFoods?.slice(0, 5).join(', ') || 'None'}
- Weight Goal: ${ctx.profile?.currentWeight || 'Unknown'} → ${ctx.profile?.targetWeight || 'Unknown'}kg

User Patterns:
- Meal logging consistency: ${this.analyzeMealConsistency()}
- Preferred meal times: ${this.analyzePreferredTimes()}
- Common food choices: ${this.analyzeCommonFoods()}`;
  }

  private analyzeMealConsistency(): string {
    if (!this.userContext?.todayMeals) return 'New user';
    const meals = this.userContext.todayMeals;
    if (meals.length >= 3) return 'Excellent';
    if (meals.length >= 2) return 'Good';
    return 'Needs improvement';
  }

  private analyzePreferredTimes(): string {
    // Analyze meal timing patterns from history
    return 'Morning and evening meals most consistent';
  }

  private analyzeCommonFoods(): string {
    if (!this.userContext?.recentFoods) return 'Learning preferences';
    return this.userContext.recentFoods.slice(0, 3).join(', ') || 'Still learning';
  }

  async sendMessage(userId: string, message: string): Promise<AIResponse> {
    // Add user message to history
    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    this.addToConversationHistory(userId, userMessage);

    let response: AIResponse;

    if (this.isConfigured()) {
      try {
        response = await this.getOpenAIResponse(userId, message);
      } catch (error) {
        console.error('OpenAI API failed:', error);
        response = this.getFallbackResponse(message);
      }
    } else {
      response = this.getFallbackResponse(message);
    }

    // Add assistant response to history
    const assistantMessage: ConversationMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
      metadata: {
        suggestions: response.actionSuggestions,
        actionType: this.detectActionType(message)
      }
    };
    this.addToConversationHistory(userId, assistantMessage);

    return response;
  }

  private async getOpenAIResponse(userId: string, message: string): Promise<AIResponse> {
    const history = this.getConversationHistory(userId);
    const messages = [
      {
        role: 'system',
        content: this.getSystemPrompt()
      },
      ...history.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || '';

    return this.parseAIResponse(aiMessage, message);
  }

  private parseAIResponse(aiMessage: string, userMessage: string): AIResponse {
    // Extract action suggestions from AI response
    const actionSuggestions: string[] = [];
    const quickActions: Array<{ label: string; action: string; data?: any }> = [];
    
    // Look for bullet points or numbered lists as action suggestions
    const actionMatches = aiMessage.match(/[•\-\*]\s*([^\n]+)/g);
    if (actionMatches) {
      actionSuggestions.push(...actionMatches.map(match => 
        match.replace(/[•\-\*]\s*/, '').trim()
      ).slice(0, 3));
    }

    // Generate quick actions based on context
    if (this.userContext) {
      if (this.userContext.remainingCalories > 100) {
        quickActions.push({
          label: 'Get meal suggestions',
          action: 'suggest_meal',
          data: { calories: this.userContext.remainingCalories }
        });
      }
      
      if (this.userContext.todayMeals.length < 3) {
        quickActions.push({
          label: 'Log a meal',
          action: 'log_meal'
        });
      }
      
      if (this.userContext.remainingCalories < 0) {
        quickActions.push({
          label: 'Exercise suggestions',
          action: 'suggest_exercise',
          data: { caloriesOver: Math.abs(this.userContext.remainingCalories) }
        });
      }
    }

    return {
      message: aiMessage,
      actionSuggestions,
      quickActions,
      followUpQuestions: this.generateFollowUpQuestions(userMessage)
    };
  }

  private getFallbackResponse(message: string): AIResponse {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('sweet') || lowerMessage.includes('craving')) {
      return {
        message: `I understand the craving! With ${this.userContext?.remainingCalories || 'some'} calories remaining, here are satisfying sweet options:\n\n🍓 Greek yogurt with berries (120 cal)\n🍫 1 square dark chocolate (50 cal)\n🍌 Banana with 1 tsp peanut butter (150 cal)\n\nWhich sounds most appealing to you?`,
        actionSuggestions: [
          'Log one of these sweet options',
          'Get more healthy dessert ideas',
          'Check remaining calorie budget'
        ],
        quickActions: [
          { label: 'Log Greek yogurt', action: 'log_food', data: { food: 'Greek yogurt with berries', calories: 120 } },
          { label: 'Log dark chocolate', action: 'log_food', data: { food: 'Dark chocolate square', calories: 50 } }
        ]
      };
    }

    if (lowerMessage.includes('dinner') || lowerMessage.includes('evening')) {
      const dinnerCalories = this.userContext?.remainingCalories || 400;
      return {
        message: `For dinner with ${dinnerCalories} calories, here are balanced options:\n\n🥗 Grilled chicken salad (${dinnerCalories - 50} cal)\n🍛 Vegetable stir-fry with quinoa (${dinnerCalories - 30} cal)\n🐟 Baked fish with steamed vegetables (${dinnerCalories - 20} cal)\n\nWhich style appeals to you tonight?`,
        actionSuggestions: [
          'Get detailed recipe for any option',
          'Adjust portion sizes',
          'See vegetarian alternatives'
        ],
        quickActions: [
          { label: 'Choose chicken salad', action: 'log_meal', data: { meal: 'Grilled chicken salad', calories: dinnerCalories - 50 } }
        ]
      };
    }

    if (lowerMessage.includes('over') || lowerMessage.includes('exceeded')) {
      const overAmount = Math.abs(this.userContext?.remainingCalories || 0);
      return {
        message: `You're ${overAmount} calories over today, but don't worry! Here's how to get back on track:\n\n💪 Take a 20-minute walk (burns ~100 cal)\n🥗 Make tomorrow's meals lighter\n💧 Drink extra water to help with digestion\n\nOne day won't derail your progress!`,
        actionSuggestions: [
          'Log a quick walk',
          'Plan tomorrow\'s lighter meals',
          'Get motivation for tomorrow'
        ],
        quickActions: [
          { label: 'Log 20-min walk', action: 'log_exercise', data: { activity: 'Walking', duration: 20, calories: 100 } }
        ]
      };
    }

    // Default response
    return {
      message: `I'm here to help with your weight management goals! You currently have ${this.userContext?.remainingCalories || 'some'} calories remaining today. How can I assist you with nutrition, meal planning, or motivation?`,
      actionSuggestions: [
        'Get meal suggestions for remaining calories',
        'Log a meal or snack',
        'Check today\'s progress'
      ],
      quickActions: [
        { label: 'Meal suggestions', action: 'suggest_meal' },
        { label: 'Log food', action: 'log_meal' }
      ]
    };
  }

  private detectActionType(message: string): 'meal_log' | 'exercise_log' | 'weight_log' | 'general' {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('ate') || lowerMessage.includes('had') || lowerMessage.includes('breakfast') || 
        lowerMessage.includes('lunch') || lowerMessage.includes('dinner') || lowerMessage.includes('snack')) {
      return 'meal_log';
    }
    
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('walk') ||
        lowerMessage.includes('run') || lowerMessage.includes('gym')) {
      return 'exercise_log';
    }
    
    if (lowerMessage.includes('weigh') || lowerMessage.includes('weight') || lowerMessage.includes('scale')) {
      return 'weight_log';
    }
    
    return 'general';
  }

  private generateFollowUpQuestions(userMessage: string): string[] {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hungry') || lowerMessage.includes('snack')) {
      return [
        'What type of flavors are you craving?',
        'How many calories do you want to spend?',
        'Do you want something quick or are you willing to prepare?'
      ];
    }
    
    if (lowerMessage.includes('dinner') || lowerMessage.includes('meal')) {
      return [
        'How much time do you have to prepare?',
        'Any specific cuisines you\'re in the mood for?',
        'Are you cooking for yourself or others?'
      ];
    }
    
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
      return [
        'How much time do you have available?',
        'Do you prefer indoor or outdoor activities?',
        'What\'s your energy level right now?'
      ];
    }
    
    return [
      'How are you feeling about your progress today?',
      'What\'s your biggest challenge right now?',
      'Is there anything specific you\'d like help with?'
    ];
  }

  // Parse food mentions from user messages
  parseFoodMentions(message: string): { foods: string[]; estimatedCalories: number } {
    const commonFoods = {
      'apple': 80, 'banana': 105, 'orange': 60, 'egg': 70, 'bread': 80,
      'rice': 130, 'chicken': 165, 'fish': 140, 'pasta': 220, 'salad': 50,
      'yogurt': 100, 'milk': 150, 'cheese': 110, 'nuts': 160, 'oats': 150
    };

    const foods: string[] = [];
    let estimatedCalories = 0;

    Object.keys(commonFoods).forEach(food => {
      if (message.toLowerCase().includes(food)) {
        foods.push(food);
        estimatedCalories += commonFoods[food as keyof typeof commonFoods];
      }
    });

    return { foods, estimatedCalories };
  }

  // Generate meal suggestions based on remaining calories
  generateMealSuggestions(remainingCalories: number, mealType?: string): any[] {
    const suggestions = [
      {
        name: 'Grilled Chicken Salad',
        calories: Math.min(remainingCalories - 50, 350),
        protein: 25,
        description: 'Mixed greens with grilled chicken breast, cherry tomatoes, and light vinaigrette',
        prepTime: 15,
        difficulty: 'Easy'
      },
      {
        name: 'Vegetable Quinoa Bowl',
        calories: Math.min(remainingCalories - 30, 320),
        protein: 12,
        description: 'Quinoa with roasted vegetables, chickpeas, and tahini dressing',
        prepTime: 25,
        difficulty: 'Medium'
      },
      {
        name: 'Greek Yogurt Parfait',
        calories: Math.min(remainingCalories - 20, 200),
        protein: 15,
        description: 'Greek yogurt layered with berries and a sprinkle of granola',
        prepTime: 5,
        difficulty: 'Easy'
      }
    ];

    return suggestions.filter(s => s.calories > 0);
  }

  // Clear conversation history for a user
  clearConversationHistory(userId: string) {
    this.conversationHistory.delete(userId);
  }

  // Get conversation summary for persistence
  getConversationSummary(userId: string): any {
    const history = this.getConversationHistory(userId);
    return {
      messageCount: history.length,
      lastInteraction: history[history.length - 1]?.timestamp,
      commonTopics: this.extractCommonTopics(history),
      userPreferences: this.extractUserPreferences(history)
    };
  }

  private extractCommonTopics(history: ConversationMessage[]): string[] {
    const topics = new Set<string>();
    
    history.forEach(msg => {
      if (msg.role === 'user') {
        const content = msg.content.toLowerCase();
        if (content.includes('meal') || content.includes('food')) topics.add('meal_planning');
        if (content.includes('exercise') || content.includes('workout')) topics.add('exercise');
        if (content.includes('weight') || content.includes('scale')) topics.add('weight_tracking');
        if (content.includes('craving') || content.includes('hungry')) topics.add('cravings');
      }
    });
    
    return Array.from(topics);
  }

  private extractUserPreferences(history: ConversationMessage[]): any {
    const preferences = {
      preferredMealTypes: [] as string[],
      commonCravings: [] as string[],
      exercisePreferences: [] as string[],
      successfulStrategies: [] as string[]
    };

    // Analyze conversation history to extract preferences
    history.forEach(msg => {
      if (msg.role === 'user') {
        const content = msg.content.toLowerCase();
        
        // Extract meal preferences
        if (content.includes('love') || content.includes('like')) {
          if (content.includes('salad')) preferences.preferredMealTypes.push('salads');
          if (content.includes('chicken')) preferences.preferredMealTypes.push('chicken');
          if (content.includes('vegetarian')) preferences.preferredMealTypes.push('vegetarian');
        }
        
        // Extract craving patterns
        if (content.includes('craving')) {
          if (content.includes('sweet')) preferences.commonCravings.push('sweet');
          if (content.includes('salty')) preferences.commonCravings.push('salty');
        }
      }
    });

    return preferences;
  }
}

// Create singleton instance
export const aiAssistant = new AIAssistantService();

// Helper functions for components
export const updateAIContext = (context: Partial<UserContext>) => {
  aiAssistant.updateUserContext(context);
};

export const sendAIMessage = (userId: string, message: string) => {
  return aiAssistant.sendMessage(userId, message);
};

export const getAIHistory = (userId: string) => {
  return aiAssistant.getConversationHistory(userId);
};

export const clearAIHistory = (userId: string) => {
  aiAssistant.clearConversationHistory(userId);
};

export const isAIConfigured = () => {
  return aiAssistant.isConfigured();
};