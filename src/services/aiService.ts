interface AIServiceConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

interface MealSuggestionRequest {
  remainingCalories: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dietaryPreferences: {
    type: 'vegetarian' | 'non_vegetarian' | 'eggetarian';
    allergies: string[];
    dislikes: string[];
  };
  timeOfDay: number;
  recentMeals: string[];
}

interface ConversationRequest {
  message: string;
  context: {
    currentCalories: number;
    targetCalories: number;
    remainingCalories: number;
    dietaryPreferences: any;
    recentFoods: string[];
  };
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface FoodParsingRequest {
  voiceInput: string;
  confidence: number;
}

export class AIService {
  private config: AIServiceConfig;
  private isConfigured: boolean = false;

  constructor(config?: AIServiceConfig) {
    this.config = {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-5-mini',
      ...config
    };
    this.isConfigured = !!(this.config.apiKey && 
      this.config.apiKey !== 'your_openai_api_key_here' && 
      this.config.apiKey.length > 20);
    
    if (this.isConfigured) {
      console.log('✅ OpenAI API key configured successfully');
    } else {
      console.warn('⚠️ OpenAI API key not found, invalid, or using placeholder value - using fallback responses');
    }
  }

  // Configure AI service with API key
  configure(config: AIServiceConfig) {
    this.config = { ...this.config, ...config };
    this.isConfigured = !!(config.apiKey);
  }

  // Check if AI service is properly configured
  isReady(): boolean {
    return this.isConfigured;
  }

  // Generate meal suggestions using AI
  async generateMealSuggestions(request: MealSuggestionRequest): Promise<any[]> {
    if (!this.isReady()) {
      return this.getFallbackMealSuggestions(request);
    }

    try {
      const prompt = this.createMealSuggestionPrompt(request);
      const response = await this.callAI(prompt, 'meal-suggestion');
      return this.parseMealSuggestions(response);
    } catch (error) {
      console.error('AI meal suggestion failed:', error);
      return this.getFallbackMealSuggestions(request);
    }
  }

  // Handle conversational AI queries
  async handleConversation(request: ConversationRequest): Promise<string> {
    if (!this.isReady()) {
      return this.getFallbackConversationResponse(request);
    }

    try {
      const prompt = this.createConversationPrompt(request);
      const response = await this.callAI(prompt, 'conversation');
      return response.trim();
    } catch (error) {
      console.error('AI conversation failed:', error);
      return this.getFallbackConversationResponse(request);
    }
  }

  // Parse voice input for food logging
  async parseVoiceInput(request: FoodParsingRequest): Promise<{
    foodItems: any[];
    confidence: number;
    needsConfirmation: boolean;
  }> {
    if (!this.isReady()) {
      return this.getFallbackFoodParsing(request);
    }

    try {
      const prompt = this.createFoodParsingPrompt(request);
      const response = await this.callAI(prompt, 'food-parsing');
      return this.parseFoodParsingResponse(response);
    } catch (error) {
      console.error('AI food parsing failed:', error);
      return this.getFallbackFoodParsing(request);
    }
  }

  // Generate exercise recommendations
  async generateExerciseRecommendations(calorieBalance: number, userPreferences: any): Promise<string[]> {
    if (!this.isReady()) {
      return this.getFallbackExerciseRecommendations(calorieBalance);
    }

    try {
      const prompt = this.createExercisePrompt(calorieBalance, userPreferences);
      const response = await this.callAI(prompt, 'exercise-recommendation');
      return this.parseExerciseRecommendations(response);
    } catch (error) {
      console.error('AI exercise recommendation failed:', error);
      return this.getFallbackExerciseRecommendations(calorieBalance);
    }
  }

  // Core AI API call method
  private async callAI(prompt: string, type: string): Promise<string> {
    const apiKey = this.config.apiKey;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your environment variables.');
    }
    
    const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1';
    const model = this.config.model || 'gpt-3.5-turbo';

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(type)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: type === 'conversation' ? 300 : 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `AI API call failed (${response.status}): ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage += ` - ${errorData.error.message}`;
          }
        } catch (e) {
          // If we can't parse the error, just use the status text
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Network error: Unable to connect to OpenAI API. Please check your internet connection.`);
    }
  }

  // Create prompts for different AI tasks
  private createMealSuggestionPrompt(request: MealSuggestionRequest): string {
    return `
Generate 3 meal suggestions for ${request.mealType} with exactly ${request.remainingCalories} calories.

User preferences:
- Diet: ${request.dietaryPreferences.type}
- Allergies: ${request.dietaryPreferences.allergies.join(', ') || 'None'}
- Dislikes: ${request.dietaryPreferences.dislikes.join(', ') || 'None'}
- Recent meals: ${request.recentMeals.join(', ') || 'None'}

Format each suggestion as:
Name: [Meal Name]
Calories: [Exact calorie count]
Description: [Brief description]
Ingredients: [List of main ingredients]
Prep Time: [Minutes]
---
`;
  }

  private createConversationPrompt(request: ConversationRequest): string {
    const context = request.context;
    return `
You are a helpful nutrition coach. The user has ${context.remainingCalories} calories remaining today (consumed ${context.currentCalories}/${context.targetCalories}).

Diet type: ${context.dietaryPreferences?.type || 'Not specified'}
Recent foods: ${context.recentFoods.join(', ') || 'None today'}

User message: "${request.message}"

Provide a helpful, encouraging response with specific food suggestions if relevant. Keep it conversational and supportive.
`;
  }

  private createFoodParsingPrompt(request: FoodParsingRequest): string {
    return `
Parse this food description and extract food items with quantities and estimated calories:

"${request.voiceInput}"

Return a JSON object with:
{
  "foods": [
    {
      "name": "food name",
      "quantity": number,
      "unit": "grams/pieces/cups",
      "calories": estimated_calories
    }
  ],
  "confidence": 0.0-1.0
}
`;
  }

  private createExercisePrompt(calorieBalance: number, userPreferences: any): string {
    const status = calorieBalance > 0 ? 'over calorie target' : 'on track with calories';
    return `
User is ${status} by ${Math.abs(calorieBalance)} calories today.
Suggest 3 appropriate exercises with duration and estimated calorie burn.

Format:
- [Exercise name]: [Duration] ([Calories burned])
`;
  }

  // System prompts for different AI tasks
  private getSystemPrompt(type: string): string {
    const prompts = {
      'meal-suggestion': 'You are a nutrition expert specializing in healthy meal planning. Provide accurate calorie counts and practical meal suggestions.',
      'conversation': 'You are a supportive nutrition coach. Be encouraging, helpful, and provide actionable advice for healthy eating.',
      'food-parsing': 'You are a food recognition expert. Parse natural language food descriptions into structured data with accurate calorie estimates.',
      'exercise-recommendation': 'You are a fitness expert. Recommend appropriate exercises based on calorie balance and user goals.'
    };
    return prompts[type] || 'You are a helpful AI assistant.';
  }

  // Fallback methods when AI is not configured
  private getFallbackMealSuggestions(request: MealSuggestionRequest): any[] {
    // Return static suggestions based on meal type and dietary preferences
    const suggestions = {
      breakfast: [
        { name: 'Oatmeal with Fruits', calories: request.remainingCalories - 50, description: 'Healthy start to your day' },
        { name: 'Scrambled Eggs', calories: request.remainingCalories - 30, description: 'Protein-rich breakfast' }
      ],
      lunch: [
        { name: 'Grilled Chicken Salad', calories: request.remainingCalories - 50, description: 'Light and nutritious' },
        { name: 'Quinoa Bowl', calories: request.remainingCalories - 30, description: 'Plant-based protein' }
      ],
      dinner: [
        { name: 'Baked Fish with Vegetables', calories: request.remainingCalories - 50, description: 'Lean protein dinner' },
        { name: 'Lentil Curry', calories: request.remainingCalories - 30, description: 'Vegetarian protein' }
      ],
      snack: [
        { name: 'Greek Yogurt', calories: Math.min(request.remainingCalories, 150), description: 'Protein-rich snack' },
        { name: 'Mixed Nuts', calories: Math.min(request.remainingCalories, 200), description: 'Healthy fats' }
      ]
    };

    return suggestions[request.mealType] || [];
  }

  private getFallbackConversationResponse(request: ConversationRequest): string {
    const { remainingCalories, currentCalories, targetCalories } = request.context;
    
    if (request.message.toLowerCase().includes('sweet') || request.message.toLowerCase().includes('craving')) {
      return `I understand the craving! With ${remainingCalories} calories remaining, try some fresh fruit or a small piece of dark chocolate. What sounds good to you?`;
    }
    
    if (remainingCalories < 0) {
      return `You're ${Math.abs(remainingCalories)} calories over today, but don't worry! Tomorrow is a fresh start. Consider a light walk to help balance things out.`;
    }
    
    return `You have ${remainingCalories} calories remaining today. I'm here to help with meal suggestions or answer any nutrition questions you have!`;
  }

  private getFallbackFoodParsing(request: FoodParsingRequest): any {
    // Simple pattern matching for common foods
    const input = request.voiceInput.toLowerCase();
    const foods = [];
    
    if (input.includes('egg')) {
      foods.push({ name: 'Eggs', quantity: 2, unit: 'pieces', calories: 140 });
    }
    if (input.includes('toast') || input.includes('bread')) {
      foods.push({ name: 'Toast', quantity: 1, unit: 'slice', calories: 80 });
    }
    
    return {
      foodItems: foods,
      confidence: 0.6,
      needsConfirmation: true
    };
  }

  private getFallbackExerciseRecommendations(calorieBalance: number): string[] {
    if (calorieBalance > 0) {
      return [
        'Take a 30-minute brisk walk (150 calories)',
        'Do 20 minutes of bodyweight exercises (120 calories)',
        'Try a 15-minute HIIT workout (180 calories)'
      ];
    } else {
      return [
        'Take a gentle 20-minute walk',
        'Do some light stretching or yoga',
        'Try a short strength training session'
      ];
    }
  }

  // Response parsing methods
  private parseMealSuggestions(response: string): any[] {
    // Parse AI response into structured meal suggestions
    const suggestions = [];
    const sections = response.split('---');
    
    for (const section of sections) {
      const lines = section.trim().split('\n');
      const suggestion: any = {};
      
      for (const line of lines) {
        if (line.includes('Name:')) suggestion.name = line.split('Name:')[1]?.trim();
        if (line.includes('Calories:')) suggestion.calories = parseInt(line.split('Calories:')[1]?.trim());
        if (line.includes('Description:')) suggestion.description = line.split('Description:')[1]?.trim();
        if (line.includes('Prep Time:')) suggestion.preparationTime = parseInt(line.split('Prep Time:')[1]?.trim());
      }
      
      if (suggestion.name && suggestion.calories) {
        suggestions.push(suggestion);
      }
    }
    
    return suggestions;
  }

  private parseFoodParsingResponse(response: string): any {
    try {
      const parsed = JSON.parse(response);
      return {
        foodItems: parsed.foods || [],
        confidence: parsed.confidence || 0.5,
        needsConfirmation: parsed.confidence < 0.8
      };
    } catch (error) {
      return this.getFallbackFoodParsing({ voiceInput: '', confidence: 0 });
    }
  }

  private parseExerciseRecommendations(response: string): string[] {
    return response.split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace('-', '').trim());
  }
}

// Create singleton instance
export const aiService = new AIService();

// Configuration helper
export const configureAI = (config: AIServiceConfig) => {
  aiService.configure(config);
};

// Check if AI is ready
export const isAIReady = () => aiService.isReady();