import { GoalType } from '../types';
import { WeightLossProfile } from '../types/weightLoss';
import { CardioProfile } from '../types/cardio';
import { StrengthProfile } from '../types/strength';
import { SleepProfile } from '../types/sleep';
import { StepsProfile } from '../types/steps';

interface AIServiceConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

interface GoalSpecificRequest {
  goalType: GoalType;
  userMessage: string;
  profile: any;
  todayData: any;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface AIResponse {
  message: string;
  actionSuggestions?: string[];
  dataUpdates?: any;
  motivationalTip?: string;
}

export class GoalSpecificAI {
  private config: AIServiceConfig;
  private isConfigured: boolean = false;

  constructor(config?: AIServiceConfig) {
    this.config = {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo',
      ...config
    };
    this.isConfigured = !!(this.config.apiKey && 
      this.config.apiKey !== 'your_openai_api_key_here' && 
      this.config.apiKey.length > 20);
  }

  configure(config: AIServiceConfig) {
    this.config = { ...this.config, ...config };
    this.isConfigured = !!(config.apiKey);
  }

  isReady(): boolean {
    return this.isConfigured;
  }

  async handleGoalSpecificQuery(request: GoalSpecificRequest): Promise<AIResponse> {
    if (!this.isConfigured) {
      return this.getFallbackResponse(request);
    }

    try {
      const prompt = this.createGoalSpecificPrompt(request);
      const response = await this.callAI(prompt, request.goalType);
      return this.parseAIResponse(response, request.goalType);
    } catch (error) {
      console.error('Goal-specific AI failed:', error);
      return this.getFallbackResponse(request);
    }
  }

  private createGoalSpecificPrompt(request: GoalSpecificRequest): string {
    const systemPrompt = this.getSystemPrompt(request.goalType);
    const contextData = this.formatContextData(request);
    
    return `${systemPrompt}

CURRENT CONTEXT:
${contextData}

USER MESSAGE: "${request.userMessage}"

Provide a helpful, encouraging response with specific actionable advice. Include:
1. Direct response to user's question
2. Specific action suggestions for today
3. Motivational tip related to their progress
4. Any data updates or recommendations

Keep response conversational and supportive.`;
  }

  private getSystemPrompt(goalType: GoalType): string {
    const prompts = {
      weight_loss: `You are a certified nutrition coach and weight loss specialist. You help users achieve sustainable weight loss through:
- Calorie tracking and meal planning
- Healthy food choices and portion control
- Exercise recommendations for weight loss
- Habit formation and behavior change
- Plateau management and motivation

Focus on sustainable, healthy approaches. Never recommend extreme diets or unsafe practices.`,

      cardio_endurance: `You are a cardiovascular fitness expert and endurance coach. You help users improve their cardio fitness through:
- Heart rate zone training and monitoring
- Progressive endurance building programs
- Running, cycling, and aerobic exercise guidance
- Recovery and training load management
- Performance optimization strategies

Focus on safe progression, proper heart rate training, and injury prevention.`,

      strength_building: `You are a certified strength and conditioning coach. You help users build strength through:
- Progressive overload and periodization
- Proper form and technique guidance
- Workout programming and exercise selection
- Recovery and nutrition for strength gains
- Equipment-specific training advice

Focus on safe progression, proper form, and sustainable strength building.`,

      daily_steps: `You are a movement and walking specialist focused on increasing daily activity. You help users achieve step goals through:
- Walking habit formation and motivation
- Route suggestions and activity integration
- Overcoming barriers to daily movement
- Step goal progression and adaptation
- Lifestyle integration strategies

Focus on making movement enjoyable, sustainable, and integrated into daily life.`,

      workout_consistency: `You are a fitness habit coach specializing in exercise consistency. You help users build sustainable workout routines through:
- Habit formation and routine building
- Motivation and accountability strategies
- Overcoming workout barriers and excuses
- Flexible programming for busy schedules
- Long-term adherence techniques

Focus on building sustainable habits rather than perfect performance.`,

      sleep_tracking: `You are a sleep specialist and circadian rhythm expert. You help users improve sleep quality through:
- Sleep hygiene and bedtime routine optimization
- Circadian rhythm regulation
- Sleep environment optimization
- Stress management for better sleep
- Sleep pattern analysis and improvement

Focus on evidence-based sleep improvement strategies and healthy sleep habits.`
    };

    return prompts[goalType] || 'You are a helpful fitness and wellness coach.';
  }

  private formatContextData(request: GoalSpecificRequest): string {
    const { goalType, profile, todayData } = request;

    switch (goalType) {
      case 'weight_loss':
        return `Weight Loss Profile:
- Current weight: ${profile?.currentWeight || 'Not set'}kg
- Target weight: ${profile?.targetWeight || 'Not set'}kg
- Daily calorie target: ${profile?.dailyCalorieTarget || 'Not set'} calories
- Today's calories: ${todayData?.calories || 0} consumed
- Remaining calories: ${todayData?.remainingCalories || 'Unknown'}
- Dietary preference: ${profile?.dietaryPreferences?.type || 'Not specified'}`;

      case 'cardio_endurance':
        return `Cardio Profile:
- Fitness objective: ${profile?.fitnessObjective || 'Not set'}
- Resting HR: ${profile?.restingHeartRate || 'Not set'} BPM
- Max HR: ${profile?.maxHeartRate || 'Not set'} BPM
- Today's workouts: ${todayData?.sessionsCount || 0}
- Total duration: ${todayData?.totalDuration || 0} minutes
- Calories burned: ${todayData?.totalCalories || 0}`;

      case 'strength_building':
        return `Strength Profile:
- Fitness level: ${profile?.fitnessLevel || 'Not set'}
- Primary goal: ${profile?.primaryGoal || 'Not set'}
- Workout frequency: ${profile?.workoutFrequency || 'Not set'} days/week
- Available equipment: ${profile?.availableEquipment?.join(', ') || 'Not specified'}
- Today's sessions: ${todayData?.totalSessions || 0}
- Total volume: ${todayData?.totalVolume || 0}kg`;

      case 'daily_steps':
        return `Steps Profile:
- Daily target: ${profile?.dailyStepTarget?.toLocaleString() || 'Not set'} steps
- Current steps: ${todayData?.currentSteps?.toLocaleString() || 0}
- Remaining: ${todayData?.remainingSteps?.toLocaleString() || 'Unknown'} steps
- Distance today: ${todayData?.distance || 0}km
- Tracking method: ${profile?.trackingMethod || 'Not set'}`;

      case 'sleep_tracking':
        return `Sleep Profile:
- Target sleep: ${profile?.targetSleepHours || 'Not set'} hours
- Bedtime: ${profile?.targetBedtime || 'Not set'}
- Wake time: ${profile?.targetWakeTime || 'Not set'}
- Last night's sleep: ${todayData?.lastNightSleep || 'Not logged'} hours
- Sleep score: ${todayData?.sleepScore || 'Not available'}`;

      case 'workout_consistency':
        return `Consistency Profile:
- Target frequency: ${profile?.targetFrequency || 'Not set'} workouts/week
- Current streak: ${todayData?.currentStreak || 0} days
- This week's workouts: ${todayData?.weeklyWorkouts || 0}
- Preferred workout time: ${profile?.preferredTime || 'Not set'}`;

      default:
        return 'General fitness tracking profile';
    }
  }

  private async callAI(prompt: string, goalType: GoalType): Promise<string> {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private parseAIResponse(response: string, goalType: GoalType): AIResponse {
    // Try to extract structured information from AI response
    const lines = response.split('\n').filter(line => line.trim());
    
    let message = response;
    let actionSuggestions: string[] = [];
    let motivationalTip = '';

    // Look for action items (lines starting with bullet points or numbers)
    const actionLines = lines.filter(line => 
      line.match(/^[\-\*\•]\s/) || line.match(/^\d+\.\s/)
    );
    
    if (actionLines.length > 0) {
      actionSuggestions = actionLines.map(line => 
        line.replace(/^[\-\*\•]\s/, '').replace(/^\d+\.\s/, '').trim()
      ).slice(0, 3);
    }

    // Look for motivational content (often at the end)
    const motivationalKeywords = ['remember', 'keep', 'you can', 'great job', 'well done'];
    const motivationalLine = lines.find(line => 
      motivationalKeywords.some(keyword => line.toLowerCase().includes(keyword))
    );
    
    if (motivationalLine) {
      motivationalTip = motivationalLine;
    }

    return {
      message,
      actionSuggestions,
      motivationalTip
    };
  }

  private getFallbackResponse(request: GoalSpecificRequest): AIResponse {
    const { goalType, userMessage, profile, todayData } = request;
    const lowerMessage = userMessage.toLowerCase();

    switch (goalType) {
      case 'weight_loss':
        return this.getWeightLossFallback(lowerMessage, profile, todayData);
      case 'cardio_endurance':
        return this.getCardioFallback(lowerMessage, profile, todayData);
      case 'strength_building':
        return this.getStrengthFallback(lowerMessage, profile, todayData);
      case 'daily_steps':
        return this.getStepsFallback(lowerMessage, profile, todayData);
      case 'sleep_tracking':
        return this.getSleepFallback(lowerMessage, profile, todayData);
      case 'workout_consistency':
        return this.getConsistencyFallback(lowerMessage, profile, todayData);
      default:
        return {
          message: "I'm here to help with your fitness goals! What would you like to know?",
          actionSuggestions: ["Set up your goals", "Log your progress", "View your stats"]
        };
    }
  }

  private getWeightLossFallback(message: string, profile: any, todayData: any): AIResponse {
    if (message.includes('hungry') || message.includes('snack')) {
      return {
        message: `You have ${todayData?.remainingCalories || 'some'} calories remaining today. Here are healthy snack options:\n\n🥕 Baby carrots with hummus (80 cal)\n🍎 Apple with almond butter (150 cal)\n🥜 Mixed nuts (160 cal)\n\nWhich sounds good to you?`,
        actionSuggestions: [
          "Log your snack choice",
          "Check meal suggestions",
          "Review today's progress"
        ],
        motivationalTip: "Smart snacking keeps you satisfied and on track!"
      };
    }

    if (message.includes('exercise') || message.includes('workout')) {
      return {
        message: `Great thinking! Exercise will help create a calorie deficit. Based on your current intake, I recommend:\n\n🚶‍♀️ 30-minute brisk walk (150 cal)\n🏃‍♀️ 20-minute jog (200 cal)\n💪 Strength training (180 cal)\n\nWhich activity interests you most?`,
        actionSuggestions: [
          "Log your workout",
          "Start a quick walk",
          "View exercise suggestions"
        ],
        motivationalTip: "Every step towards your goal counts!"
      };
    }

    return {
      message: `You're doing great with your weight loss journey! You have ${todayData?.remainingCalories || 'calories'} remaining today. How can I help you stay on track?`,
      actionSuggestions: [
        "Get meal suggestions",
        "Log your food",
        "Check progress"
      ],
      motivationalTip: "Consistency is the key to lasting weight loss success!"
    };
  }

  private getCardioFallback(message: string, profile: any, todayData: any): AIResponse {
    if (message.includes('heart rate') || message.includes('zone')) {
      return {
        message: `Your heart rate zones are personalized for ${profile?.fitnessObjective || 'fitness'}. For optimal training:\n\n💚 Zone 1-2: Recovery and fat burning\n💛 Zone 3: Aerobic base building\n❤️ Zone 4-5: High intensity intervals\n\nWhat type of workout are you planning?`,
        actionSuggestions: [
          "Start heart rate workout",
          "View your zones",
          "Log today's session"
        ],
        motivationalTip: "Training in the right zones maximizes your results!"
      };
    }

    if (message.includes('tired') || message.includes('recovery')) {
      return {
        message: `Recovery is crucial for cardiovascular improvement! Based on your recent activity:\n\n🚶‍♀️ Easy 20-minute walk in Zone 1\n🧘‍♀️ Gentle yoga or stretching\n💤 Focus on quality sleep tonight\n\nListen to your body - rest days make you stronger!`,
        actionSuggestions: [
          "Log recovery activity",
          "Check heart rate trends",
          "Plan tomorrow's workout"
        ],
        motivationalTip: "Smart recovery leads to stronger performance!"
      };
    }

    return {
      message: `Ready to boost your cardiovascular fitness? You've completed ${todayData?.sessionsCount || 0} sessions today. How can I help optimize your cardio training?`,
      actionSuggestions: [
        "Start new workout",
        "Check heart rate zones",
        "View progress trends"
      ],
      motivationalTip: "Every heartbeat makes you stronger!"
    };
  }

  private getStrengthFallback(message: string, profile: any, todayData: any): AIResponse {
    if (message.includes('sore') || message.includes('muscle')) {
      return {
        message: `Muscle soreness is normal after strength training! For optimal recovery:\n\n💪 Light stretching or yoga\n🥛 Protein within 30 minutes post-workout\n💤 7-9 hours of quality sleep\n🚶‍♀️ Gentle walk to promote blood flow\n\nHow are you feeling today?`,
        actionSuggestions: [
          "Log recovery activities",
          "Track protein intake",
          "Plan next workout"
        ],
        motivationalTip: "Muscle growth happens during recovery - embrace the process!"
      };
    }

    if (message.includes('weight') || message.includes('heavy')) {
      return {
        message: `Progressive overload is key to strength gains! Based on your ${profile?.fitnessLevel || 'current'} level:\n\n📈 Increase weight by 2.5-5lbs when you complete all sets\n🎯 Focus on 6-12 reps for strength\n⏱️ Rest 2-3 minutes between sets\n\nWhat exercise are you working on?`,
        actionSuggestions: [
          "Log your lifts",
          "Check personal records",
          "View workout templates"
        ],
        motivationalTip: "Strength is built one rep at a time!"
      };
    }

    return {
      message: `Time to build some strength! You've completed ${todayData?.totalSessions || 0} sessions today with ${Math.round(todayData?.totalVolume || 0)}kg total volume. What's your focus today?`,
      actionSuggestions: [
        "Start strength workout",
        "View workout templates",
        "Check progress charts"
      ],
      motivationalTip: "Consistency in the gym creates strength in life!"
    };
  }

  private getStepsFallback(message: string, profile: any, todayData: any): AIResponse {
    const remaining = todayData?.remainingSteps || profile?.dailyStepTarget || 10000;
    
    if (message.includes('tired') || message.includes('motivation')) {
      return {
        message: `I understand! Here are easy ways to add steps without feeling overwhelmed:\n\n🚶‍♀️ Park farther away (+300 steps)\n📞 Take calls while walking (+500 steps)\n🏢 Use stairs instead of elevator (+200 steps)\n☕ Walk to get coffee (+400 steps)\n\nSmall steps add up to big results!`,
        actionSuggestions: [
          "Start a 5-minute walk",
          "Log current steps",
          "View step challenges"
        ],
        motivationalTip: "Every step counts towards a healthier you!"
      };
    }

    if (message.includes('weather') || message.includes('indoor')) {
      return {
        message: `Bad weather? No problem! Here are indoor step options:\n\n🏬 Mall walking (climate controlled)\n🏠 Walking in place while watching TV\n🏢 Office building stair climbing\n🛒 Grocery store walking tours\n\nDon't let weather stop your progress!`,
        actionSuggestions: [
          "Find indoor walking spots",
          "Start indoor workout",
          "Log indoor steps"
        ],
        motivationalTip: "Adaptability is the key to consistent progress!"
      };
    }

    return {
      message: `You're at ${todayData?.currentSteps?.toLocaleString() || 0} steps today! Only ${remaining.toLocaleString()} steps to reach your goal. A ${Math.ceil(remaining / 120)}-minute walk will get you there!`,
      actionSuggestions: [
        "Start a quick walk",
        "Log recent steps",
        "View step suggestions"
      ],
      motivationalTip: "One step at a time leads to amazing places!"
    };
  }

  private getSleepFallback(message: string, profile: any, todayData: any): AIResponse {
    if (message.includes('tired') || message.includes('energy')) {
      return {
        message: `Feeling tired? Your sleep quality directly impacts energy levels. For better energy:\n\n☀️ Get 15 minutes of morning sunlight\n💧 Stay hydrated throughout the day\n🚫 Avoid caffeine after 2 PM\n🌙 Maintain consistent bedtime (${profile?.targetBedtime || '10:30 PM'})\n\nHow did you sleep last night?`,
        actionSuggestions: [
          "Log last night's sleep",
          "Set bedtime reminder",
          "Review sleep tips"
        ],
        motivationalTip: "Quality sleep is the foundation of all health goals!"
      };
    }

    if (message.includes('bedtime') || message.includes('routine')) {
      return {
        message: `A consistent bedtime routine improves sleep quality! Try this 1-hour wind-down:\n\n📱 No screens (1 hour before bed)\n🛁 Warm bath or shower\n📖 Light reading or meditation\n🌡️ Cool room to ${profile?.preferences?.roomTemperature || 67}°F\n\nWhat's your current routine like?`,
        actionSuggestions: [
          "Set bedtime reminder",
          "Log sleep quality",
          "Review sleep environment"
        ],
        motivationalTip: "Great days start with great nights!"
      };
    }

    return {
      message: `Your target is ${profile?.targetSleepHours || 8} hours of sleep. Last night you got ${todayData?.lastNightSleep || 'unknown'} hours. How can I help optimize your sleep tonight?`,
      actionSuggestions: [
        "Log sleep quality",
        "Set bedtime reminder",
        "Review sleep tips"
      ],
      motivationalTip: "Prioritizing sleep is prioritizing your health!"
    };
  }

  private getConsistencyFallback(message: string, profile: any, todayData: any): AIResponse {
    if (message.includes('skip') || message.includes('miss')) {
      return {
        message: `It's okay to miss a day! Consistency isn't about perfection. Here's how to get back on track:\n\n⚡ Do a 10-minute mini workout\n🚶‍♀️ Take a short walk\n🧘‍♀️ 5 minutes of stretching\n💪 Bodyweight exercises\n\nSomething is always better than nothing!`,
        actionSuggestions: [
          "Start 10-minute workout",
          "Log any activity",
          "Plan tomorrow's session"
        ],
        motivationalTip: "Progress, not perfection, builds lasting habits!"
      };
    }

    if (message.includes('motivation') || message.includes('hard')) {
      return {
        message: `Building workout consistency is challenging but so worth it! You're on a ${todayData?.currentStreak || 0}-day streak. Here's how to stay motivated:\n\n🎯 Focus on showing up, not perfect performance\n⏰ Schedule workouts like important appointments\n🏆 Celebrate small wins daily\n👥 Find an accountability partner\n\nWhat's your biggest challenge right now?`,
        actionSuggestions: [
          "Schedule next workout",
          "Set workout reminder",
          "View progress streak"
        ],
        motivationalTip: "Consistency is the mother of mastery!"
      };
    }

    return {
      message: `You're building an amazing workout habit! Current streak: ${todayData?.currentStreak || 0} days. This week you've completed ${todayData?.weeklyWorkouts || 0} workouts. How can I help you stay consistent?`,
      actionSuggestions: [
        "Plan next workout",
        "View workout options",
        "Check weekly progress"
      ],
      motivationalTip: "Every workout is an investment in your future self!"
    };
  }
}

// Create singleton instance
export const goalSpecificAI = new GoalSpecificAI();

// Configuration helper
export const configureGoalAI = (config: AIServiceConfig) => {
  goalSpecificAI.configure(config);
};

// Check if AI is ready
export const isGoalAIReady = () => goalSpecificAI.isReady();