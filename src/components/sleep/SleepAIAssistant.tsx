import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, X, Moon, Sparkles, Brain, Lightbulb } from 'lucide-react';
import { SleepProfile } from '../../types/sleep';
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

interface SleepAIAssistantProps {
  profile: SleepProfile;
  sleepData: any;
  onClose: () => void;
  onActionSuggested?: (action: string, data?: any) => void;
}

export const SleepAIAssistant: React.FC<SleepAIAssistantProps> = ({
  profile,
  sleepData,
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
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `🌙 **Sleep Optimization Crew Ready**

Hi! I'm your sleep coaching team consisting of:
• **Sleep Analyst** - Analyzes your sleep patterns and quality
• **Sleep Coach** - Provides behavioral recommendations  
• **Circadian Specialist** - Optimizes your sleep-wake timing

You're targeting ${profile.targetSleepHours}h of sleep with a ${profile.targetBedtime} bedtime. How can our team help optimize your sleep tonight?`,
      timestamp: new Date(),
      actionItems: [
        "I'm having trouble falling asleep",
        "How can I improve my sleep quality?",
        "My sleep schedule is inconsistent",
        "I wake up tired even after 8 hours"
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
      // Prepare sleep context for the crew
      const sleepContext = {
        targetSleepHours: profile.targetSleepHours,
        targetBedtime: profile.targetBedtime,
        targetWakeTime: profile.targetWakeTime,
        trackingMethod: profile.trackingMethod,
        roomTemperature: profile.preferences.roomTemperature,
        caffeineTimeLimit: profile.preferences.caffeineTimeLimit,
        screenTimeLimit: profile.preferences.screenTimeLimit,
        lastNightSleep: sleepData.lastNightSleep,
        sleepScore: sleepData.sleepScore,
        sleepEfficiency: sleepData.sleepEfficiency,
        wakeUps: sleepData.wakeUps,
        sleepStreak: sleepData.sleepStreak,
        weeklyAverage: sleepData.weeklyAverage,
        connectedDevices: profile.deviceSettings.connectedDevices.length
      };

      // Execute the sleep crew
      const crewResult = await crewAIService.getSleepCoaching(message, sleepContext);

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
      console.error('Sleep crew failed:', error);
      setShowAgentThinking(false);
      setIsProcessing(false);

      // Fallback response
      const fallbackMessage: Message = {
        id: `fallback-${Date.now()}`,
        role: 'assistant',
        content: getFallbackSleepResponse(message, sleepContext),
        timestamp: new Date(),
        actionItems: ['Maintain consistent bedtime', 'Optimize sleep environment', 'Track sleep quality']
      };
      setMessages(prev => [...prev, fallbackMessage]);
    }
  };

  const getFallbackSleepResponse = (query: string, context: any): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('trouble') || lowerQuery.includes('falling asleep')) {
      return `🌙 **Sleep Onset Optimization**

Having trouble falling asleep is common! Here's what can help:

**Immediate Actions:**
1. Start your wind-down routine 1 hour before ${context.targetBedtime}
2. Dim lights and avoid screens after ${context.screenTimeLimit}h before bed
3. Keep your room at ${context.roomTemperature}°F for optimal sleep
4. Try progressive muscle relaxation or deep breathing

**Tonight's Plan:**
• No caffeine after ${context.caffeineTimeLimit}
• Light stretching or reading before bed
• If not asleep in 20 minutes, get up and do a quiet activity until sleepy

Your target of ${context.targetSleepHours}h is achievable with these adjustments!`;
    }

    if (lowerQuery.includes('quality') || lowerQuery.includes('tired')) {
      return `😴 **Sleep Quality Enhancement**

Waking up tired despite adequate sleep time suggests quality issues:

**Quality Factors to Address:**
1. **Sleep stages**: Ensure you're getting deep sleep (20-25% of total)
2. **Sleep efficiency**: Minimize time awake in bed
3. **Consistency**: Same bedtime/wake time daily (even weekends)
4. **Environment**: Dark, quiet, cool room

**This Week's Focus:**
• Track how you feel each morning (1-10 scale)
• Note any middle-of-night wake-ups
• Monitor room temperature and noise levels
• Avoid large meals 3 hours before bed

Your ${context.weeklyAverage}h average is good - let's focus on quality!`;
    }

    if (lowerQuery.includes('schedule') || lowerQuery.includes('inconsistent')) {
      return `⏰ **Sleep Schedule Optimization**

Inconsistent sleep schedules disrupt your circadian rhythm:

**Schedule Stabilization Plan:**
1. **Fixed bedtime**: ${context.targetBedtime} every night (including weekends)
2. **Fixed wake time**: ${context.targetWakeTime} every morning
3. **Light exposure**: Bright light within 30 minutes of waking
4. **Evening routine**: Same activities before bed each night

**Weekly Implementation:**
• Week 1: Focus on consistent bedtime
• Week 2: Add consistent wake time
• Week 3: Optimize light exposure timing
• Week 4: Fine-tune routine elements

Your body will adapt to this rhythm in 1-2 weeks with consistency!`;
    }

    // Default response
    return `🌙 **Sleep Coaching Available**

I'm here to help optimize your sleep! You're targeting ${context.targetSleepHours}h with a ${context.targetBedtime} bedtime.

**Common Sleep Improvements:**
1. Maintain consistent sleep schedule (±30 minutes)
2. Create optimal sleep environment (cool, dark, quiet)
3. Develop relaxing bedtime routine
4. Monitor and improve sleep quality

**Quick Assessment:**
• Current sleep streak: ${context.sleepStreak || 0} days
• Weekly average: ${context.weeklyAverage || 0}h
• Last night's quality: ${context.sleepScore || 'Not tracked'}

What specific aspect of your sleep would you like to improve?`;
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleActionClick = (action: string) => {
    if (onActionSuggested) {
      onActionSuggested(action);
    }
    // Also send as message for context
    handleSendMessage(`I want to: ${action}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-50">
      <div className="bg-[#161B22] rounded-t-2xl border border-[#2B3440] w-full max-w-md h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2B3440] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#8B5CF6] rounded-full flex items-center justify-center">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#F3F4F6]">Sleep Optimization Crew</h3>
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
                  message.role === 'agent' ? 'bg-[#6B46C1]' : 'bg-[#8B5CF6]'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : message.role === 'agent' ? (
                    <Brain className="w-4 h-4 text-white" />
                  ) : (
                    <Moon className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`p-3 rounded-2xl ${
                  message.role === 'user' 
                    ? 'bg-[#F08A3E] text-white' 
                    : message.role === 'agent'
                      ? 'bg-[#6B46C1]/10 border border-[#6B46C1]/30 text-[#F3F4F6]'
                      : 'bg-[#0D1117] text-[#F3F4F6] border border-[#2B3440]'
                }`}>
                  {message.agentRole && (
                    <div className="text-xs text-[#8B5CF6] font-medium mb-2 flex items-center space-x-1">
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
                        <Lightbulb className="w-3 h-3" />
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
                    <div className="mt-3 p-2 bg-[#8B5CF6]/10 rounded-lg">
                      <p className="text-xs font-medium text-[#8B5CF6] mb-1">Key Recommendations:</p>
                      <ul className="text-xs space-y-1">
                        {message.recommendations.slice(0, 3).map((rec, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span className="text-[#8B5CF6]">•</span>
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
              <div className="bg-[#6B46C1]/10 border border-[#6B46C1]/30 rounded-2xl p-4 flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-[#8B5CF6]">Sleep experts analyzing...</span>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && !showAgentThinking && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#8B5CF6] rounded-full flex items-center justify-center">
                  <Moon className="w-4 h-4 text-white" />
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
              <p className="text-sm text-[#CBD5E1] text-center">Common sleep concerns:</p>
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
              placeholder="Ask about sleep quality, bedtime routines, or sleep problems..."
              className="flex-1 px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#8B5CF6] focus:outline-none"
              disabled={isProcessing}
            />
            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isProcessing}
              className="px-4 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#2B3440] disabled:text-[#CBD5E1] text-white rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};