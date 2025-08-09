import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, X, Footprints, Sparkles, Brain, Target, TrendingUp } from 'lucide-react';
import { StepsProfile } from '../../types/steps';
import { crewAIService } from '../../services/crewAIService';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'agent';
  content: string;
  timestamp: Date;
  agentRole?: string;
  actionItems?: string[];
  insights?: string[];
  recommendations?: string[];
}

interface StepsAIAssistantProps {
  profile: StepsProfile;
  stepsData: any;
  onClose: () => void;
  onActionSuggested?: (action: string, data?: any) => void;
}

export const StepsAIAssistant: React.FC<StepsAIAssistantProps> = ({
  profile,
  stepsData,
  onClose,
  onActionSuggested
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAgentThinking, setShowAgentThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [aiConfigured, setAiConfigured] = useState(false);

  useEffect(() => {
    setAiConfigured(crewAIService.isConfigured());
    initializeConversation();
  }, []);

  const initializeConversation = () => {
    const remainingSteps = Math.max(profile.dailyStepTarget - (stepsData.currentSteps || 0), 0);
    
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `🚶‍♀️ **Movement Optimization Crew Ready**

Hi! I'm your walking coaching team consisting of:
• **Activity Analyst** - Analyzes your movement patterns and progress
• **Movement Coach** - Provides practical strategies to increase steps
• **Wellness Strategist** - Connects movement with your overall health goals

You're at ${(stepsData.currentSteps || 0).toLocaleString()} steps today with ${remainingSteps.toLocaleString()} to reach your ${profile.dailyStepTarget.toLocaleString()} goal. How can our team help you move more?`,
      timestamp: new Date(),
      actionItems: [
        "I need motivation to walk more",
        "How can I add steps to my busy day?",
        "Indoor walking ideas for bad weather",
        "I'm not reaching my step goal"
      ]
    };

    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);
    setShowAgentThinking(true);

    try {
      // Prepare steps context for the crew
      const stepsContext = {
        dailyStepTarget: profile.dailyStepTarget,
        currentSteps: stepsData.currentSteps || 0,
        remainingSteps: Math.max(profile.dailyStepTarget - (stepsData.currentSteps || 0), 0),
        distance: stepsData.distance || 0,
        caloriesBurned: stepsData.caloriesBurned || 0,
        trackingMethod: profile.trackingMethod,
        strideLength: profile.strideLength,
        baselineAverage: profile.baselineAverage,
        stepStreak: stepsData.stepStreak || 0,
        weeklyAverage: stepsData.weeklyAverage || 0,
        preferredWalkingTimes: profile.preferences.preferredWalkingTimes,
        weatherAdaptive: profile.preferences.weatherAdaptive,
        routeDiscovery: profile.preferences.routeDiscovery,
        challengesEnabled: profile.preferences.challengesEnabled,
        adaptiveGoals: profile.adaptiveGoals,
        hourlyReminders: profile.deviceSettings.hourlyRemindersEnabled
      };

      // Execute the steps crew
      const crewResult = await crewAIService.getStepsCoaching(message, stepsContext);

      setShowAgentThinking(false);

      if (crewResult.success) {
        // Add individual agent responses
        crewResult.results.forEach((agentResult, index) => {
          setTimeout(() => {
            const agentMessage: Message = {
              id: `agent-${Date.now()}-${index}`,
              role: 'agent',
              content: agentResult.response,
              timestamp: new Date(),
              agentRole: agentResult.agent,
              actionItems: agentResult.actionItems,
              insights: agentResult.insights,
              recommendations: agentResult.recommendations
            };
            setMessages(prev => [...prev, agentMessage]);
          }, index * 1000);
        });

        // Add final coordinated response
        setTimeout(() => {
          const finalMessage: Message = {
            id: `final-${Date.now()}`,
            role: 'assistant',
            content: crewResult.finalOutput,
            timestamp: new Date(),
            actionItems: crewResult.results.flatMap(r => r.actionItems).slice(0, 4),
            recommendations: crewResult.results.flatMap(r => r.recommendations).slice(0, 5)
          };
          setMessages(prev => [...prev, finalMessage]);
          setIsProcessing(false);
        }, crewResult.results.length * 1000 + 500);

      } else {
        throw new Error('Crew execution failed');
      }

    } catch (error) {
      console.error('Steps crew failed:', error);
      setShowAgentThinking(false);
      setIsProcessing(false);

      // Fallback response
      const fallbackMessage: Message = {
        id: `fallback-${Date.now()}`,
        role: 'assistant',
        content: getFallbackStepsResponse(message, stepsContext),
        timestamp: new Date(),
        actionItems: ['Take a 10-minute walk', 'Set hourly reminders', 'Find walking opportunities']
      };
      setMessages(prev => [...prev, fallbackMessage]);
    }
  };

  const getFallbackStepsResponse = (query: string, context: any): string => {
    const lowerQuery = query.toLowerCase();
    const remaining = context.remainingSteps;
    
    if (lowerQuery.includes('motivation') || lowerQuery.includes('tired')) {
      return `🚶‍♀️ **Movement Motivation Strategy**

I understand it can be challenging! You need ${remaining.toLocaleString()} more steps today.

**Motivation Boosters:**
1. **Break it down**: Just ${Math.ceil(remaining / 120)} minutes of walking gets you there
2. **Make it fun**: Listen to music, podcasts, or call a friend while walking
3. **Reward system**: Treat yourself after reaching daily goals
4. **Social accountability**: Share your progress with friends/family

**Easy Step Boosters:**
• Park farther away (+300 steps)
• Take stairs instead of elevator (+200 steps)
• Walk during phone calls (+500 steps)
• Walk to get coffee/water (+400 steps)

**Mindset Shift:**
Remember: You're not just counting steps, you're investing in your cardiovascular health, mental wellbeing, and energy levels!

What's one small step you can take right now?`;
    }

    if (lowerQuery.includes('busy') || lowerQuery.includes('time') || lowerQuery.includes('work')) {
      return `⏰ **Busy Day Movement Strategy**

No dedicated walking time? No problem! Here's how to add ${remaining.toLocaleString()} steps to your busy schedule:

**Stealth Steps (No Extra Time):**
1. **Meeting walks**: Take calls while walking (500-800 steps per call)
2. **Commute steps**: Get off transit one stop early (+1000 steps)
3. **Errand walking**: Walk to nearby stores instead of driving
4. **Waiting time**: Walk while waiting for appointments/meetings

**Micro-Movement Breaks:**
• 5-minute walks every 2 hours (600 steps each)
• Walk to bathroom/water cooler the long way (+100 steps)
• Pace while thinking or on hold (+200 steps)
• Walk up/down stairs during breaks (+300 steps)

**Time-Efficient Routes:**
Your ${Math.ceil(remaining / 120)}-minute power walk during lunch break would complete your goal!

Which of these fits best into your schedule today?`;
    }

    if (lowerQuery.includes('indoor') || lowerQuery.includes('weather') || lowerQuery.includes('rain')) {
      return `🏠 **Indoor Movement Solutions**

Bad weather shouldn't stop your progress! Here are indoor options for ${remaining.toLocaleString()} steps:

**Indoor Walking Venues:**
1. **Shopping malls**: Climate-controlled walking (many open early for walkers)
2. **Large stores**: Grocery store tours, department store browsing
3. **Office buildings**: Stair climbing, hallway walking
4. **Community centers**: Indoor tracks, gyms with walking areas

**Home-Based Options:**
• **Walking in place**: While watching TV, during commercial breaks
• **Stair climbing**: Up/down stairs repeatedly (great cardio bonus!)
• **Indoor circuits**: Walk around your home/apartment in patterns
• **Dance/movement**: Put on music and move for 15-20 minutes

**Productivity Walking:**
• Walk while on phone calls or video calls (if possible)
• Pace while brainstorming or thinking
• Walk during podcast/audiobook listening

**Weather-Independent Goal:**
Aim for ${Math.ceil(remaining / 100)} minutes of indoor movement to hit your target!

What indoor option sounds most appealing to you?`;
    }

    if (lowerQuery.includes('not reaching') || lowerQuery.includes('struggling') || lowerQuery.includes('goal')) {
      return `🎯 **Goal Achievement Strategy**

You're ${remaining.toLocaleString()} steps away from your ${profile.dailyStepTarget.toLocaleString()} goal. Let's analyze and adjust:

**Current Analysis:**
• Daily target: ${profile.dailyStepTarget.toLocaleString()} steps
• Today's progress: ${context.currentSteps.toLocaleString()} steps (${Math.round((context.currentSteps / profile.dailyStepTarget) * 100)}%)
• Weekly average: ${context.weeklyAverage.toLocaleString()} steps
• Baseline when you started: ${profile.baselineAverage.toLocaleString()} steps

**Strategy Adjustments:**
1. **Goal calibration**: Your current average suggests ${context.weeklyAverage < profile.dailyStepTarget ? 'gradually increasing' : 'maintaining'} your target
2. **Timing optimization**: Schedule walks during your most successful times
3. **Habit stacking**: Attach walking to existing habits (after meals, before work)
4. **Progress celebration**: Acknowledge improvement from your ${profile.baselineAverage.toLocaleString()} baseline!

**This Week's Focus:**
• Consistency over perfection (aim for 80% of goal daily)
• Find 3 "step opportunities" in your routine
• Track what works and repeat successful strategies

${context.weeklyAverage > profile.baselineAverage ? 
  `🎉 You've already improved by ${((context.weeklyAverage - profile.baselineAverage) / profile.baselineAverage * 100).toFixed(0)}% from your baseline!` : 
  'Every step forward is progress worth celebrating!'
}

What's the biggest barrier to reaching your daily goal?`;
    }

    // Default response
    return `🚶‍♀️ **Movement Coaching Available**

You're at ${context.currentSteps.toLocaleString()} steps today - ${remaining.toLocaleString()} to go!

**Quick Assessment:**
• Progress: ${Math.round((context.currentSteps / profile.dailyStepTarget) * 100)}% of daily goal
• Distance: ${context.distance.toFixed(1)}km walked
• Calories: ${context.caloriesBurned} burned through movement
• Streak: ${context.stepStreak} days

**Immediate Opportunities:**
1. **Quick walk**: ${Math.ceil(remaining / 120)} minutes gets you to goal
2. **Stair climbing**: 10 flights = ~100 steps
3. **Parking farther**: Easy +300 steps
4. **Walking meetings**: Turn next call into a walk

**Movement Mindset:**
Every step counts toward better cardiovascular health, weight management, and mental clarity!

What type of movement sounds good right now?`;
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleActionClick = (action: string) => {
    if (onActionSuggested) {
      onActionSuggested(action);
    }
    handleSendMessage(`Help me with: ${action}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-50">
      <div className="bg-[#161B22] rounded-t-2xl border border-[#2B3440] w-full max-w-md h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2B3440] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center">
              <Footprints className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#F3F4F6]">Movement Optimization Crew</h3>
              <p className="text-sm text-[#CBD5E1]">3 AI specialists working together</p>
              {!aiConfigured && (
                <p className="text-xs text-[#F59E0B]">Using smart fallback responses</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-[#2B3440] hover:bg-[#0D1117] rounded-lg flex items-center justify-center text-[#CBD5E1] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'bg-[#F08A3E]' : 
                  message.role === 'agent' ? 'bg-[#059669]' : 'bg-[#10B981]'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : message.role === 'agent' ? (
                    <Brain className="w-4 h-4 text-white" />
                  ) : (
                    <Footprints className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`p-3 rounded-2xl ${
                  message.role === 'user' 
                    ? 'bg-[#F08A3E] text-white' 
                    : message.role === 'agent'
                      ? 'bg-[#059669]/10 border border-[#059669]/30 text-[#F3F4F6]'
                      : 'bg-[#0D1117] text-[#F3F4F6] border border-[#2B3440]'
                }`}>
                  {message.agentRole && (
                    <div className="text-xs text-[#10B981] font-medium mb-2 flex items-center space-x-1">
                      <Brain className="w-3 h-3" />
                      <span>{message.agentRole}</span>
                    </div>
                  )}
                  
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  
                  {/* Action Items */}
                  {message.role === 'assistant' && message.actionItems && message.actionItems.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs opacity-70 flex items-center space-x-1">
                        <Target className="w-3 h-3" />
                        <span>Quick actions:</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {message.actionItems.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => handleActionClick(action)}
                            className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Recommendations */}
                  {message.recommendations && message.recommendations.length > 0 && (
                    <div className="mt-3 p-2 bg-[#10B981]/10 rounded-lg">
                      <p className="text-xs font-medium text-[#10B981] mb-1 flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Key Strategies:</span>
                      </p>
                      <ul className="text-xs space-y-1">
                        {message.recommendations.slice(0, 3).map((rec, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span className="text-[#10B981]">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Agent Thinking Indicator */}
          {showAgentThinking && (
            <div className="flex justify-center">
              <div className="bg-[#059669]/10 border border-[#059669]/30 rounded-2xl p-4 flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#10B981] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#10B981] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#10B981] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-[#10B981]">Movement experts analyzing...</span>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && !showAgentThinking && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#10B981] rounded-full flex items-center justify-center">
                  <Footprints className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[#0D1117] border border-[#2B3440] rounded-2xl p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#CBD5E1] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#CBD5E1] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#CBD5E1] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Initial Suggestions */}
          {messages.length === 1 && messages[0].actionItems && (
            <div className="space-y-2">
              <p className="text-sm text-[#CBD5E1] text-center">Common movement challenges:</p>
              <div className="flex flex-wrap gap-2">
                {messages[0].actionItems.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-2 bg-[#0D1117] hover:bg-[#2B3440] border border-[#2B3440] text-[#CBD5E1] rounded-lg text-sm transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#2B3440]">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage(inputMessage)}
              placeholder="Ask about increasing steps, motivation, or movement strategies..."
              className="flex-1 px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#10B981] focus:outline-none"
              disabled={isProcessing}
            />
            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isProcessing}
              className="px-4 py-3 bg-[#10B981] hover:bg-[#059669] disabled:bg-[#2B3440] disabled:text-[#CBD5E1] text-white rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};