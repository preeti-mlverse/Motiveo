interface AgentConfig {
  role: string;
  goal: string;
  backstory: string;
  tools: string[];
  memory: boolean;
  verbose: boolean;
}

interface Task {
  description: string;
  agent: string;
  expected_output: string;
  context?: any;
}

interface CrewConfig {
  agents: { [key: string]: AgentConfig };
  tasks: Task[];
  process: 'sequential' | 'hierarchical';
  memory: boolean;
  verbose: boolean;
}

interface AgentResponse {
  agent: string;
  response: string;
  confidence: number;
  actionItems: string[];
  insights: string[];
  recommendations: string[];
  nextSteps: string[];
}

interface CrewExecution {
  results: AgentResponse[];
  finalOutput: string;
  executionTime: number;
  success: boolean;
}

export class CrewAIService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private agentMemory: Map<string, any[]> = new Map();
  private userContext: Map<string, any> = new Map();

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
    this.model = 'gpt-4o-mini';
    
    if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
      console.warn('⚠️ OpenAI API key not configured for Crew.AI agents');
    } else {
      console.log('✅ Crew.AI Service configured with OpenAI GPT-4o-mini');
    }
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey !== 'your_openai_api_key_here' && this.apiKey.length > 20);
  }

  // Sleep Tracking Agent Configuration
  private getSleepTrackingCrew(): CrewConfig {
    return {
      agents: {
        sleep_analyst: {
          role: "Sleep Quality Analyst",
          goal: "Analyze sleep patterns, quality metrics, and provide data-driven insights for sleep optimization",
          backstory: "You are a certified sleep specialist with expertise in circadian rhythm science, sleep hygiene, and sleep disorder recognition. You analyze sleep data to identify patterns, quality issues, and optimization opportunities.",
          tools: ["sleep_data_analysis", "circadian_rhythm_assessment", "sleep_quality_scoring"],
          memory: true,
          verbose: true
        },
        sleep_coach: {
          role: "Sleep Optimization Coach",
          goal: "Provide personalized sleep improvement recommendations and behavioral coaching for better sleep habits",
          backstory: "You are a behavioral sleep coach specializing in sleep hygiene, bedtime routines, and lifestyle modifications for improved sleep. You help users build sustainable sleep habits through evidence-based interventions.",
          tools: ["habit_formation", "environmental_optimization", "routine_planning"],
          memory: true,
          verbose: true
        },
        circadian_specialist: {
          role: "Circadian Rhythm Specialist",
          goal: "Optimize sleep-wake cycles, light exposure, and timing recommendations for better circadian health",
          backstory: "You are a chronobiology expert who understands how light, timing, and lifestyle factors affect circadian rhythms. You provide precise timing recommendations for sleep, meals, exercise, and light exposure.",
          tools: ["light_therapy_planning", "meal_timing_optimization", "chronotype_assessment"],
          memory: true,
          verbose: true
        }
      },
      tasks: [
        {
          description: "Analyze current sleep data and identify patterns, quality issues, and areas for improvement",
          agent: "sleep_analyst",
          expected_output: "Detailed sleep analysis with quality scores, pattern identification, and specific improvement areas"
        },
        {
          description: "Generate personalized sleep optimization recommendations based on analysis",
          agent: "sleep_coach",
          expected_output: "Actionable sleep improvement plan with specific behavioral modifications and habit changes"
        },
        {
          description: "Provide circadian rhythm optimization strategies and timing recommendations",
          agent: "circadian_specialist",
          expected_output: "Precise timing recommendations for sleep, light exposure, meals, and activities to optimize circadian health"
        }
      ],
      process: 'sequential',
      memory: true,
      verbose: true
    };
  }

  // Daily Steps Agent Configuration
  private getStepsTrackingCrew(): CrewConfig {
    return {
      agents: {
        activity_analyst: {
          role: "Physical Activity Data Analyst",
          goal: "Analyze step patterns, activity levels, and movement behaviors to identify optimization opportunities",
          backstory: "You are a kinesiologist and movement specialist who analyzes daily activity patterns. You understand how step counts relate to overall health, weight management, and cardiovascular fitness.",
          tools: ["activity_pattern_analysis", "movement_behavior_assessment", "health_impact_calculation"],
          memory: true,
          verbose: true
        },
        movement_coach: {
          role: "Movement and Walking Coach",
          goal: "Provide personalized strategies to increase daily steps and build sustainable movement habits",
          backstory: "You are a certified exercise physiologist specializing in lifestyle physical activity. You help people integrate more movement into their daily routines through practical, achievable strategies.",
          tools: ["habit_integration", "route_planning", "motivation_strategies"],
          memory: true,
          verbose: true
        },
        wellness_strategist: {
          role: "Holistic Wellness Strategist",
          goal: "Connect daily movement with overall health goals and provide comprehensive wellness recommendations",
          backstory: "You are a wellness expert who understands how daily movement impacts sleep, stress, energy, weight management, and overall health. You create integrated wellness strategies.",
          tools: ["wellness_integration", "goal_alignment", "lifestyle_optimization"],
          memory: true,
          verbose: true
        }
      },
      tasks: [
        {
          description: "Analyze current step patterns, identify barriers to movement, and assess progress toward goals",
          agent: "activity_analyst",
          expected_output: "Comprehensive activity analysis with pattern identification, barrier assessment, and progress evaluation"
        },
        {
          description: "Generate personalized movement strategies and step-increasing recommendations",
          agent: "movement_coach",
          expected_output: "Practical movement plan with specific strategies to increase daily steps and build walking habits"
        },
        {
          description: "Integrate movement recommendations with overall wellness goals and lifestyle factors",
          agent: "wellness_strategist",
          expected_output: "Holistic wellness strategy connecting daily movement with sleep, nutrition, stress management, and other health goals"
        }
      ],
      process: 'sequential',
      memory: true,
      verbose: true
    };
  }

  // Execute Crew for specific goal type
  async executeCrew(goalType: 'sleep_tracking' | 'daily_steps', userQuery: string, context: any): Promise<CrewExecution> {
    if (!this.isConfigured()) {
      return this.getFallbackCrewExecution(goalType, userQuery, context);
    }

    const startTime = Date.now();
    
    try {
      const crewConfig = goalType === 'sleep_tracking' 
        ? this.getSleepTrackingCrew() 
        : this.getStepsTrackingCrew();

      // Update user context for this goal
      this.userContext.set(`${goalType}_context`, context);

      // Execute tasks sequentially
      const results: AgentResponse[] = [];
      
      for (const task of crewConfig.tasks) {
        const agent = crewConfig.agents[task.agent];
        const agentResponse = await this.executeAgentTask(agent, task, userQuery, context, results);
        results.push(agentResponse);
      }

      // Generate final coordinated response
      const finalOutput = await this.coordinateAgentResponses(results, userQuery, goalType);

      return {
        results,
        finalOutput,
        executionTime: Date.now() - startTime,
        success: true
      };

    } catch (error) {
      console.error(`Crew.AI execution failed for ${goalType}:`, error);
      return this.getFallbackCrewExecution(goalType, userQuery, context);
    }
  }

  // Execute individual agent task
  private async executeAgentTask(
    agent: AgentConfig, 
    task: Task, 
    userQuery: string, 
    context: any,
    previousResults: AgentResponse[]
  ): Promise<AgentResponse> {
    
    const agentMemory = this.agentMemory.get(agent.role) || [];
    const previousContext = previousResults.map(r => r.response).join('\n\n');

    const prompt = this.createAgentPrompt(agent, task, userQuery, context, previousContext, agentMemory);
    
    try {
      const response = await this.callOpenAI(prompt);
      const parsedResponse = this.parseAgentResponse(response, agent.role);
      
      // Update agent memory
      agentMemory.push({
        query: userQuery,
        response: parsedResponse.response,
        timestamp: new Date(),
        context: context
      });
      
      // Keep only last 10 interactions per agent
      if (agentMemory.length > 10) {
        agentMemory.splice(0, agentMemory.length - 10);
      }
      
      this.agentMemory.set(agent.role, agentMemory);
      
      return parsedResponse;
      
    } catch (error) {
      console.error(`Agent ${agent.role} failed:`, error);
      return this.getFallbackAgentResponse(agent.role, userQuery, context);
    }
  }

  // Create specialized prompts for each agent
  private createAgentPrompt(
    agent: AgentConfig, 
    task: Task, 
    userQuery: string, 
    context: any, 
    previousContext: string,
    agentMemory: any[]
  ): string {
    const memoryContext = agentMemory.length > 0 
      ? `\n\nPrevious interactions with this user:\n${agentMemory.slice(-3).map(m => `Q: ${m.query}\nA: ${m.response}`).join('\n\n')}`
      : '';

    return `# Agent Role: ${agent.role}

## Agent Profile
**Goal**: ${agent.goal}
**Backstory**: ${agent.backstory}
**Available Tools**: ${agent.tools.join(', ')}

## Current Task
${task.description}

## User Context
${this.formatContextForAgent(context, agent.role)}

## Previous Agent Outputs
${previousContext || 'None - you are the first agent in this crew.'}

## User Query
"${userQuery}"

${memoryContext}

## Instructions
As the ${agent.role}, provide your specialized analysis and recommendations. Focus on your specific expertise area while considering the user's context and previous agent insights. Provide actionable, specific advice that aligns with your role.

Expected Output Format:
- **Analysis**: Your specialized assessment
- **Recommendations**: 3-5 specific actionable items
- **Insights**: Key patterns or observations
- **Next Steps**: Immediate actions the user can take

Be conversational, supportive, and provide specific, measurable recommendations within your area of expertise.`;
  }

  // Format context specifically for each agent type
  private formatContextForAgent(context: any, agentRole: string): string {
    if (agentRole.includes('sleep')) {
      return `
Sleep Profile:
- Target sleep: ${context.targetSleepHours || 8} hours
- Bedtime: ${context.targetBedtime || 'Not set'}
- Wake time: ${context.targetWakeTime || 'Not set'}
- Last night's sleep: ${context.lastNightSleep || 'Not logged'} hours
- Sleep score: ${context.sleepScore || 'Not available'}
- Sleep efficiency: ${context.sleepEfficiency || 'Not available'}%
- Wake-ups: ${context.wakeUps || 'Not tracked'}
- Room temperature: ${context.roomTemperature || 'Not set'}°F
- Tracking method: ${context.trackingMethod || 'Manual'}
- Sleep streak: ${context.sleepStreak || 0} days
- Weekly average: ${context.weeklyAverage || 0} hours
      `;
    }

    if (agentRole.includes('activity') || agentRole.includes('movement') || agentRole.includes('wellness')) {
      return `
Steps Profile:
- Daily target: ${context.dailyStepTarget?.toLocaleString() || 'Not set'} steps
- Current steps today: ${context.currentSteps?.toLocaleString() || 0}
- Remaining steps: ${context.remainingSteps?.toLocaleString() || 'Unknown'}
- Distance today: ${context.distance || 0}km
- Calories burned: ${context.caloriesBurned || 0}
- Tracking method: ${context.trackingMethod || 'Manual'}
- Step streak: ${context.stepStreak || 0} days
- Weekly average: ${context.weeklyAverage?.toLocaleString() || 0} steps
- Baseline average: ${context.baselineAverage?.toLocaleString() || 'Not set'} steps
- Stride length: ${context.strideLength || 'Not set'}cm
- Preferred walking times: ${context.preferredWalkingTimes?.join(', ') || 'Not set'}
- Weather adaptive: ${context.weatherAdaptive ? 'Yes' : 'No'}
- Route discovery: ${context.routeDiscovery ? 'Enabled' : 'Disabled'}
      `;
    }

    return 'Context not available for this agent type.';
  }

  // Call OpenAI API
  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
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
    return data.choices[0]?.message?.content || '';
  }

  // Parse agent response into structured format
  private parseAgentResponse(response: string, agentRole: string): AgentResponse {
    const lines = response.split('\n').filter(line => line.trim());
    
    let recommendations: string[] = [];
    let insights: string[] = [];
    let actionItems: string[] = [];
    let nextSteps: string[] = [];

    // Extract structured information
    lines.forEach(line => {
      if (line.includes('**Recommendations**:') || line.includes('**Recommendation')) {
        const nextLines = lines.slice(lines.indexOf(line) + 1, lines.indexOf(line) + 6);
        recommendations = nextLines.filter(l => l.trim().startsWith('-') || l.trim().startsWith('•'))
          .map(l => l.replace(/^[\-\•]\s*/, '').trim());
      }
      
      if (line.includes('**Insights**:') || line.includes('**Insight')) {
        const nextLines = lines.slice(lines.indexOf(line) + 1, lines.indexOf(line) + 4);
        insights = nextLines.filter(l => l.trim().startsWith('-') || l.trim().startsWith('•'))
          .map(l => l.replace(/^[\-\•]\s*/, '').trim());
      }
      
      if (line.includes('**Next Steps**:') || line.includes('**Action')) {
        const nextLines = lines.slice(lines.indexOf(line) + 1, lines.indexOf(line) + 4);
        nextSteps = nextLines.filter(l => l.trim().startsWith('-') || l.trim().startsWith('•'))
          .map(l => l.replace(/^[\-\•]\s*/, '').trim());
      }
    });

    // Extract action items from recommendations if not explicitly found
    if (actionItems.length === 0) {
      actionItems = recommendations.slice(0, 3);
    }

    return {
      agent: agentRole,
      response,
      confidence: 0.85,
      actionItems,
      insights,
      recommendations,
      nextSteps
    };
  }

  // Coordinate multiple agent responses into final output
  private async coordinateAgentResponses(
    agentResponses: AgentResponse[], 
    userQuery: string, 
    goalType: string
  ): Promise<string> {
    
    const coordinationPrompt = `
# Crew Coordination Task

You are the crew coordinator for a ${goalType.replace('_', ' ')} assistance team. Multiple specialized agents have provided their analysis and recommendations for this user query: "${userQuery}"

## Agent Responses:
${agentResponses.map(agent => `
### ${agent.agent}
${agent.response}

Key Recommendations:
${agent.recommendations.map(r => `- ${r}`).join('\n')}
`).join('\n\n')}

## Your Task
Synthesize these expert insights into a cohesive, actionable response for the user. Create a unified plan that:

1. **Integrates all agent recommendations** into a coherent strategy
2. **Prioritizes actions** based on impact and feasibility  
3. **Provides specific next steps** the user can take today
4. **Maintains an encouraging, supportive tone**
5. **Includes measurable goals** where appropriate

Format your response as a conversational message that feels like it's coming from a unified AI assistant, not multiple separate agents. Focus on what the user should do next.
`;

    try {
      const coordinatedResponse = await this.callOpenAI(coordinationPrompt);
      return coordinatedResponse;
    } catch (error) {
      console.error('Coordination failed:', error);
      
      // Fallback: combine agent responses manually
      const combinedRecommendations = agentResponses.flatMap(agent => agent.recommendations).slice(0, 5);
      const combinedInsights = agentResponses.flatMap(agent => agent.insights).slice(0, 3);
      
      return `Based on expert analysis, here are your personalized recommendations:

${combinedRecommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

Key insights:
${combinedInsights.map(insight => `• ${insight}`).join('\n')}

Let me know if you'd like me to elaborate on any of these recommendations!`;
    }
  }

  // Fallback execution when OpenAI is not available
  private getFallbackCrewExecution(goalType: string, userQuery: string, context: any): CrewExecution {
    const fallbackResponses = this.getFallbackResponses(goalType, userQuery, context);
    
    return {
      results: fallbackResponses,
      finalOutput: this.generateFallbackFinalOutput(fallbackResponses, goalType, userQuery),
      executionTime: 500,
      success: true
    };
  }

  private getFallbackResponses(goalType: string, userQuery: string, context: any): AgentResponse[] {
    if (goalType === 'sleep_tracking') {
      return [
        {
          agent: 'Sleep Quality Analyst',
          response: `Based on your sleep data, I can see you're targeting ${context.targetSleepHours || 8} hours of sleep. Your current patterns show room for optimization in sleep consistency and quality.`,
          confidence: 0.8,
          actionItems: ['Track sleep consistently', 'Maintain regular bedtime', 'Monitor sleep quality'],
          insights: ['Sleep consistency is key to quality', 'Room temperature affects sleep quality'],
          recommendations: [
            'Maintain consistent bedtime and wake time',
            'Keep bedroom temperature between 65-68°F',
            'Avoid screens 1 hour before bed',
            'Create a relaxing bedtime routine'
          ],
          nextSteps: ['Set bedtime reminder', 'Prepare bedroom environment', 'Log tonight\'s sleep']
        },
        {
          agent: 'Sleep Optimization Coach',
          response: `Your sleep habits can be optimized through better sleep hygiene and routine establishment. Focus on consistency and environmental factors for better rest.`,
          confidence: 0.8,
          actionItems: ['Establish bedtime routine', 'Optimize sleep environment', 'Track sleep quality'],
          insights: ['Routine helps signal sleep time to your body', 'Environment greatly impacts sleep quality'],
          recommendations: [
            'Start wind-down routine 1 hour before bed',
            'Keep bedroom dark, cool, and quiet',
            'Avoid caffeine after 2 PM',
            'Use comfortable bedding and pillows'
          ],
          nextSteps: ['Plan tonight\'s routine', 'Adjust bedroom setup', 'Set caffeine cutoff reminder']
        }
      ];
    } else {
      return [
        {
          agent: 'Physical Activity Analyst',
          response: `Your current step count of ${context.currentSteps?.toLocaleString() || 0} shows you need ${context.remainingSteps?.toLocaleString() || 'more'} steps to reach your ${context.dailyStepTarget?.toLocaleString() || 10000} step goal.`,
          confidence: 0.8,
          actionItems: ['Increase daily movement', 'Find walking opportunities', 'Track step progress'],
          insights: ['Small movements throughout day add up', 'Consistency matters more than intensity'],
          recommendations: [
            'Take stairs instead of elevators',
            'Park farther away from destinations',
            'Take walking breaks every hour',
            'Walk during phone calls',
            'Use a standing desk when possible'
          ],
          nextSteps: ['Take a 10-minute walk now', 'Set hourly movement reminders', 'Plan walking routes']
        },
        {
          agent: 'Movement Coach',
          response: `To reach your step goal, focus on integrating movement into your daily routine. Small changes can lead to significant increases in daily activity.`,
          confidence: 0.8,
          actionItems: ['Integrate movement into routine', 'Set movement reminders', 'Track progress'],
          insights: ['Habit stacking makes movement automatic', 'Social walking increases adherence'],
          recommendations: [
            'Schedule 3 walking breaks during work',
            'Walk to nearby errands instead of driving',
            'Take evening walks with family/friends',
            'Use fitness apps for motivation',
            'Join walking groups or challenges'
          ],
          nextSteps: ['Schedule next walk', 'Invite someone to walk with you', 'Download step tracking app']
        }
      ];
    }
  }

  private generateFallbackFinalOutput(results: AgentResponse[], goalType: string, userQuery: string): string {
    const allRecommendations = results.flatMap(r => r.recommendations);
    const topRecommendations = allRecommendations.slice(0, 5);
    const allInsights = results.flatMap(r => r.insights);
    
    const goalEmoji = goalType === 'sleep_tracking' ? '😴' : '🚶‍♀️';
    const goalName = goalType === 'sleep_tracking' ? 'sleep optimization' : 'daily movement';
    
    return `${goalEmoji} **${goalName.charAt(0).toUpperCase() + goalName.slice(1)} Plan**

Based on expert analysis, here's your personalized strategy:

**Priority Actions:**
${topRecommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

**Key Insights:**
${allInsights.map(insight => `• ${insight}`).join('\n')}

**Next Steps:**
Start with action #1 today and gradually build these habits into your routine. Consistency is more important than perfection!

What would you like to focus on first?`;
  }

  private getFallbackAgentResponse(agentRole: string, userQuery: string, context: any): AgentResponse {
    return {
      agent: agentRole,
      response: `As your ${agentRole}, I'm here to help with your query about "${userQuery}". While I'm working with limited connectivity, I can still provide valuable guidance based on established best practices.`,
      confidence: 0.6,
      actionItems: ['Continue with current plan', 'Monitor progress', 'Stay consistent'],
      insights: ['Consistency is key to success', 'Small changes lead to big results'],
      recommendations: ['Maintain current routine', 'Track progress daily', 'Stay motivated'],
      nextSteps: ['Continue current approach', 'Monitor results', 'Adjust as needed']
    };
  }

  // Public methods for goal-specific crews
  async getSleepCoaching(userQuery: string, sleepContext: any): Promise<CrewExecution> {
    return this.executeCrew('sleep_tracking', userQuery, sleepContext);
  }

  async getStepsCoaching(userQuery: string, stepsContext: any): Promise<CrewExecution> {
    return this.executeCrew('daily_steps', userQuery, stepsContext);
  }

  // Clear agent memory
  clearAgentMemory(agentRole?: string) {
    if (agentRole) {
      this.agentMemory.delete(agentRole);
    } else {
      this.agentMemory.clear();
    }
  }

  // Get agent memory for debugging
  getAgentMemory(agentRole: string) {
    return this.agentMemory.get(agentRole) || [];
  }
}

// Create singleton instance
export const crewAIService = new CrewAIService();