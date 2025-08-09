import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, X, Sparkles, Settings } from 'lucide-react';
import { WeightLossProfile } from '../../types/weightLoss';
import { aiService, isAIReady } from '../../services/aiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface ConversationalAIProps {
  profile: WeightLossProfile | null;
  currentCalories: number;
  remainingCalories: number;
  onClose: () => void;
}

export const ConversationalAI: React.FC<ConversationalAIProps> = ({
  profile,
  currentCalories,
  remainingCalories,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: profile ? `Hi! I'm your nutrition assistant. You have ${remainingCalories} calories remaining today. How can I help you stay on track?` : `Hi! I'm your AI fitness assistant. How can I help you with your fitness goals today?`,
      timestamp: new Date(),
      suggestions: [
        "I'm craving something sweet",
        "What should I eat for dinner?",
        "I went over my calories",
        "Suggest a healthy snack"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [aiConfigured, setAiConfigured] = useState(false);

  useEffect(() => {
    setAiConfigured(isAIReady());
    if (isAIReady()) {
      console.log('🤖 AI Chat ready with API key');
    } else {
      console.log('🤖 AI Chat using fallback responses (no valid API key)');
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    if (aiConfigured) {
      try {
        const response = await aiService.handleConversation({
          message: userMessage,
          context: {
            currentCalories: profile ? profile.dailyCalorieTarget - remainingCalories : 0,
            targetCalories: profile ? profile.dailyCalorieTarget : 2000,
            remainingCalories,
            dietaryPreferences: profile ? profile.dietaryPreferences : { type: 'vegetarian', allergies: [], dislikes: [], preferredFoods: [] },
            recentFoods: []
          },
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        });
        return response;
      } catch (error) {
        console.error('AI response failed:', error);
        // Fall back to static responses
      }
    }

    // Fallback static responses
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('sweet') || lowerMessage.includes('dessert') || lowerMessage.includes('craving')) {
      if (!profile) {
        return `I understand the craving! Here are some healthy sweet options:\n\n🍓 Fresh berries\n🍎 Apple slices with cinnamon\n🫖 Herbal tea with a touch of honey\n\nThese will satisfy your sweet tooth while keeping you healthy!`;
      }
      
      if (remainingCalories < 100) {
        return `I understand the craving! With ${remainingCalories} calories left, try these satisfying options:\n\n🍓 Fresh berries (50 cal)\n🍎 Apple slices with cinnamon (60 cal)\n🫖 Herbal tea with a touch of honey (20 cal)\n\nThese will satisfy your sweet tooth without derailing your progress!`;
      } else {
        return `You have ${remainingCalories} calories for something sweet! Here are some great options:\n\n🥛 Greek yogurt with berries (120 cal)\n🍫 1 square dark chocolate (50 cal)\n🍌 Banana with 1 tsp peanut butter (150 cal)\n\nWhich sounds good to you?`;
      }
    }
    
    if (lowerMessage.includes('dinner') || lowerMessage.includes('evening')) {
      if (!profile) {
        return `For dinner, here are some healthy options:\n\n🥗 Grilled vegetables with quinoa\n🍛 Dal with brown rice and vegetables\n🐟 Baked fish with steamed broccoli\n\nWould you like a specific recipe for any of these?`;
      }
      
      const dinnerCalories = Math.round(profile.dailyCalorieTarget * 0.3);
      return `For dinner, you should aim for around ${dinnerCalories} calories. Based on your ${profile.dietaryPreferences.type} preference:\n\n🥗 Grilled vegetables with quinoa (${dinnerCalories - 50} cal)\n🍛 Dal with brown rice and vegetables (${dinnerCalories} cal)\n🐟 Baked fish with steamed broccoli (${dinnerCalories - 30} cal)\n\nWould you like a specific recipe for any of these?`;
    }
    
    if (lowerMessage.includes('over') || lowerMessage.includes('exceeded')) {
      const overAmount = Math.abs(remainingCalories);
      return `No worries! You're ${overAmount} calories over, but that's manageable. Here's how to get back on track:\n\n💪 Take a 20-minute walk (burns ~100 cal)\n🥗 Make tomorrow's meals lighter\n💧 Drink extra water to help with digestion\n\nOne day won't derail your progress. Tomorrow is a fresh start!`;
    }
    
    if (lowerMessage.includes('snack') || lowerMessage.includes('hungry')) {
      if (!profile) {
        return `Here are some healthy snack options:\n\n🥒 Cucumber slices with hummus\n🥕 Baby carrots\n🥜 Mixed nuts\n🍎 Apple with almond butter\n\nThese will keep you satisfied and energized!`;
      }
      
      if (remainingCalories < 150) {
        return `For a light snack with ${remainingCalories} calories:\n\n🥒 Cucumber slices with hummus (80 cal)\n🥕 Baby carrots (50 cal)\n🫖 Green tea (0 cal)\n\nThese will keep you satisfied until your next meal!`;
      } else {
        return `Perfect snack time! With ${remainingCalories} calories available:\n\n🥜 Mixed nuts (150 cal)\n🍎 Apple with almond butter (180 cal)\n🧀 String cheese with whole grain crackers (120 cal)\n\nWhich appeals to you most?`;
      }
    }
    
    // Default response
    if (!profile) {
      return `I'm here to help with your fitness and nutrition goals! Feel free to ask me about meal suggestions, exercise tips, or any health questions you have.`;
    }
    
    return `I'm here to help with your nutrition goals! You currently have ${remainingCalories} calories remaining today. Feel free to ask me about meal suggestions, healthy swaps, or any nutrition questions you have.`;
  };

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

    // Simulate AI thinking time
    setTimeout(async () => {
      const responseContent = await generateAIResponse(message);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-50">
      <div className="bg-[#161B22] rounded-t-2xl border border-[#2B3440] w-full max-w-md h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2B3440] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#F8B84E] rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#F3F4F6]">Nutrition Assistant</h3>
              <p className="text-sm text-[#CBD5E1]">{profile ? `${remainingCalories} calories remaining` : 'Fitness & Nutrition Coach'}</p>
              {!aiConfigured && (
                <p className="text-xs text-[#F08A3E]">AI not configured</p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="w-8 h-8 bg-[#2B3440] hover:bg-[#0D1117] rounded-lg flex items-center justify-center text-[#CBD5E1] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'bg-[#F08A3E]' : 'bg-[#F8B84E]'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
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
                </div>
              </div>
            </div>
          ))}

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="space-y-2">
              <p className="text-sm text-[#CBD5E1] text-center">{profile ? 'Quick questions:' : 'How can I help you today?'}</p>
              <div className="flex flex-wrap gap-2">
                {messages[0].suggestions?.map((suggestion, index) => (
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
                <div className="w-8 h-8 bg-[#F8B84E] rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
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
              placeholder="Ask about meals, calories, or nutrition..."
              className="flex-1 px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#F08A3E] focus:outline-none"
            />
            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isTyping}
              className="px-4 py-3 bg-[#F08A3E] hover:bg-[#E17226] disabled:bg-[#2B3440] disabled:text-[#CBD5E1] text-white rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};