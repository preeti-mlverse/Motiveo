import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, X, Sparkles, Target, Heart, Dumbbell, Footprints, Moon, Calendar } from 'lucide-react';
import { GoalType } from '../../types';
import { goalSpecificAI, isGoalAIReady } from '../../services/goalSpecificAI';
import { useAppStore } from '../../store/useAppStore';
import { useWeightLossStore } from '../../store/useWeightLossStore';
import { useCardioStore } from '../../store/useCardioStore';
import { useStrengthStore } from '../../store/useStrengthStore';
import { useSleepStore } from '../../store/useSleepStore';
import { useStepsStore } from '../../store/useStepsStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actionSuggestions?: string[];
  motivationalTip?: string;
}

interface GoalSpecificAIAssistantProps {
  goalType: GoalType;
  onClose: () => void;
  onDataUpdate?: (updates: any) => void;
}

const goalIcons = {
  weight_loss: Target,
  cardio_endurance: Heart,
  strength_building: Dumbbell,
  daily_steps: Footprints,
  sleep_tracking: Moon,
  workout_consistency: Calendar
};

const goalColors = {
  weight_loss: '#F08A3E',
  cardio_endurance: '#EF4444',
  strength_building: '#EF4444',
  daily_steps: '#10B981',
  sleep_tracking: '#8B5CF6',
  workout_consistency: '#6BD0D2'
};

export const GoalSpecificAIAssistant: React.FC<GoalSpecificAIAssistantProps> = ({
  goalType,
  onClose,
  onDataUpdate
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [aiConfigured, setAiConfigured] = useState(false);

  // Get relevant stores
  const { userProfile, goals, logEntries, addLogEntry } = useAppStore();
  const { profile: weightLossProfile, getTodayCalories, getTodayMeals } = useWeightLossStore();
  const { profile: cardioProfile, getTodaySessions, getWeeklyStats } = useCardioStore();
  const { profile: strengthProfile } = useStrengthStore();
  const { profile: sleepProfile, getLastNightSleep, getWeeklyAverage } = useSleepStore();
  const { profile: stepsProfile, getTodaySteps } = useStepsStore();

  const Icon = goalIcons[goalType];
  const goalColor = goalColors[goalType];

  useEffect(() => {
    setAiConfigured(isGoalAIReady());
    initializeConversation();
  }, [goalType]);

  const initializeConversation = () => {
    const welcomeMessage = getWelcomeMessage();
    setMessages([{
      id: '1',
      role: 'assistant',
      content: welcomeMessage.content,
      timestamp: new Date(),
      actionSuggestions: welcomeMessage.suggestions,
      motivationalTip: welcomeMessage.tip
    }]);
  };

  const getWelcomeMessage = () => {
    const todayData = getTodayData();
    
    switch (goalType) {
      case 'weight_loss':
        const remainingCals = weightLossProfile ? weightLossProfile.dailyCalorieTarget - getTodayCalories() : 0;
        return {
          content: `Hi! I'm your weight loss coach. You have ${remainingCals} calories remaining today. How can I help you stay on track with your nutrition goals?`,
          suggestions: ["I'm craving something sweet", "What should I eat for dinner?", "I went over my calories", "Suggest a healthy snack"],
          tip: "Small consistent choices lead to big transformations!"
        };
      
      case 'cardio_endurance':
        const todaySessions = cardioProfile ? getTodaySessions().length : 0;
        return {
          content: `Hi! I'm your cardio coach. You've completed ${todaySessions} sessions today. Ready to boost your cardiovascular fitness?`,
          suggestions: ["What heart rate zone should I train in?", "I'm feeling tired today", "How to improve endurance?", "Check my progress"],
          tip: "Your heart gets stronger with every beat!"
        };
      
      case 'strength_building':
        const todayVolume = todayData.totalVolume || 0;
        return {
          content: `Hi! I'm your strength coach. You've lifted ${Math.round(todayVolume)}kg total volume today. Let's build some serious strength!`,
          suggestions: ["My muscles are sore", "How much weight should I lift?", "Best exercises for beginners", "Check my progress"],
          tip: "Strength isn't just physical - it's mental resilience too!"
        };
      
      case 'daily_steps':
        const currentSteps = stepsProfile ? getTodaySteps() : 0;
        const remaining = stepsProfile ? Math.max(stepsProfile.dailyStepTarget - currentSteps, 0) : 10000;
        return {
          content: `Hi! I'm your walking coach. You're at ${currentSteps.toLocaleString()} steps today with ${remaining.toLocaleString()} to go. Let's get moving!`,
          suggestions: ["I need motivation to walk", "Indoor walking ideas", "How to add more steps?", "Check my progress"],
          tip: "Every journey begins with a single step!"
        };
      
      case 'sleep_tracking':
        const lastSleep = sleepProfile ? getLastNightSleep() : null;
        const sleepHours = lastSleep ? Math.round(lastSleep.totalSleepTime / 60 * 10) / 10 : 0;
        return {
          content: `Hi! I'm your sleep coach. You got ${sleepHours} hours of sleep last night. How can I help optimize your rest and recovery?`,
          suggestions: ["I'm feeling tired", "Bedtime routine tips", "Can't fall asleep", "Check sleep quality"],
          tip: "Quality sleep is the foundation of all health goals!"
        };
      
      case 'workout_consistency':
        const streak = todayData.currentStreak || 0;
        return {
          content: `Hi! I'm your consistency coach. You're on a ${streak}-day workout streak! Let's keep building that amazing habit.`,
          suggestions: ["I want to skip today", "Need motivation", "Quick workout ideas", "Check my streak"],
          tip: "Consistency is the mother of mastery!"
        };
      
      default:
        return {
          content: "Hi! I'm your fitness coach. How can I help you achieve your goals today?",
          suggestions: ["Get started", "Check progress", "Need motivation"],
          tip: "Every day is a new opportunity to grow stronger!"
        };
    }
  };

  const getTodayData = () => {
    switch (goalType) {
      case 'weight_loss':
        return {
          calories: getTodayCalories(),
          remainingCalories: weightLossProfile ? weightLossProfile.dailyCalorieTarget - getTodayCalories() : 0,
          mealsLogged: getTodayMeals().length
        };
      
      case 'cardio_endurance':
        const weeklyStats = cardioProfile ? getWeeklyStats() : { totalDuration: 0, totalCalories: 0, sessionsCount: 0 };
        return {
          sessionsCount: cardioProfile ? getTodaySessions().length : 0,
          totalDuration: weeklyStats.totalDuration,
          totalCalories: weeklyStats.totalCalories
        };
      
      case 'strength_building':
        return {
          totalSessions: 0, // Would get from strength store
          totalVolume: 0,   // Would get from strength store
          personalRecords: 0
        };
      
      case 'daily_steps':
        const currentSteps = stepsProfile ? getTodaySteps() : 0;
        return {
          currentSteps,
          remainingSteps: stepsProfile ? Math.max(stepsProfile.dailyStepTarget - currentSteps, 0) : 10000,
          distance: stepsProfile ? (currentSteps * stepsProfile.strideLength) / 100000 : 0
        };
      
      case 'sleep_tracking':
        const lastSleep = sleepProfile ? getLastNightSleep() : null;
        return {
          lastNightSleep: lastSleep ? Math.round(lastSleep.totalSleepTime / 60 * 10) / 10 : 0,
          sleepScore: lastSleep?.sleepScore || 0,
          weeklyAverage: sleepProfile ? getWeeklyAverage() : 0
        };
      
      case 'workout_consistency':
        return {
          currentStreak: 0, // Would calculate from logs
          weeklyWorkouts: 0,
          targetFrequency: 5
        };
      
      default:
        return {};
    }
  };

  const getProfile = () => {
    switch (goalType) {
      case 'weight_loss': return weightLossProfile;
      case 'cardio_endurance': return cardioProfile;
      case 'strength_building': return strengthProfile;
      case 'daily_steps': return stepsProfile;
      case 'sleep_tracking': return sleepProfile;
      case 'workout_consistency': return null; // No specific profile
      default: return null;
    }
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
    setIsTyping(true);

    // Get AI response
    setTimeout(async () => {
      try {
        const response = await goalSpecificAI.handleGoalSpecificQuery({
          goalType,
          userMessage: message,
          profile: getProfile(),
          todayData: getTodayData(),
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        });

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          actionSuggestions: response.actionSuggestions,
          motivationalTip: response.motivationalTip
        };

        setMessages(prev => [...prev, aiResponse]);
        
        // Trigger data updates if provided
        if (response.dataUpdates && onDataUpdate) {
          onDataUpdate(response.dataUpdates);
        }
      } catch (error) {
        console.error('AI response failed:', error);
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm having trouble connecting right now, but I'm still here to help! What would you like to know about your fitness goals?",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorResponse]);
      } finally {
        setIsTyping(false);
      }
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleActionSuggestion = (action: string) => {
    // Handle specific actions based on goal type
    switch (goalType) {
      case 'weight_loss':
        if (action.includes('Log')) {
          // Trigger meal logging
          console.log('Triggering meal logging...');
        }
        break;
      case 'daily_steps':
        if (action.includes('Start')) {
          // Trigger step tracking
          console.log('Starting step tracking...');
        }
        break;
      // Add other goal-specific actions
    }
    
    // Also send as message
    handleSendMessage(action);
  };

  const getGoalTitle = () => {
    const goalTitles = {
      weight_loss: 'Weight Loss Coach',
      cardio_endurance: 'Cardio Coach',
      strength_building: 'Strength Coach',
      daily_steps: 'Walking Coach',
      sleep_tracking: 'Sleep Coach',
      workout_consistency: 'Consistency Coach'
    };
    return goalTitles[goalType];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-50">
      <div className="bg-[#161B22] rounded-t-2xl border border-[#2B3440] w-full max-w-md h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2B3440] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: goalColor }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#F3F4F6]">{getGoalTitle()}</h3>
              <p className="text-sm text-[#CBD5E1]">Specialized AI coaching</p>
              {!aiConfigured && (
                <p className="text-xs text-[#F08A3E]">Using smart fallback responses</p>
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
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' ? 'bg-[#F08A3E]' : ''
                  }`}
                  style={{ backgroundColor: message.role === 'user' ? '#F08A3E' : goalColor }}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Icon className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`p-3 rounded-2xl ${
                  message.role === 'user' 
                    ? 'bg-[#F08A3E] text-white' 
                    : 'bg-[#0D1117] text-[#F3F4F6] border border-[#2B3440]'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  
                  {/* Action Suggestions */}
                  {message.role === 'assistant' && message.actionSuggestions && message.actionSuggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs opacity-70">Quick actions:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.actionSuggestions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => handleActionSuggestion(action)}
                            className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Motivational Tip */}
                  {message.role === 'assistant' && message.motivationalTip && (
                    <div className="mt-3 p-2 bg-white/5 rounded-lg border-l-2" style={{ borderColor: goalColor }}>
                      <div className="flex items-center space-x-1 mb-1">
                        <Sparkles className="w-3 h-3" style={{ color: goalColor }} />
                        <span className="text-xs font-medium" style={{ color: goalColor }}>Motivation</span>
                      </div>
                      <p className="text-xs opacity-90">{message.motivationalTip}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Initial Suggestions */}
          {messages.length === 1 && messages[0].actionSuggestions && (
            <div className="space-y-2">
              <p className="text-sm text-[#CBD5E1] text-center">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {messages[0].actionSuggestions.map((suggestion, index) => (
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

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: goalColor }}
                >
                  <Icon className="w-4 h-4 text-white" />
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
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#2B3440]">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
              placeholder={getInputPlaceholder()}
              className="flex-1 px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#F08A3E] focus:outline-none"
            />
            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isTyping}
              className="px-4 py-3 text-white rounded-xl transition-colors"
              style={{ 
                backgroundColor: goalColor,
                opacity: (!inputMessage.trim() || isTyping) ? 0.5 : 1
              }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  function getInputPlaceholder() {
    const placeholders = {
      weight_loss: "Ask about meals, calories, or nutrition...",
      cardio_endurance: "Ask about heart rate, workouts, or endurance...",
      strength_building: "Ask about lifting, exercises, or strength...",
      daily_steps: "Ask about walking, steps, or movement...",
      sleep_tracking: "Ask about sleep, rest, or recovery...",
      workout_consistency: "Ask about habits, motivation, or consistency..."
    };
    return placeholders[goalType] || "How can I help with your fitness goals?";
  }
};