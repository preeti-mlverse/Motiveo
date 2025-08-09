import React, { useState, useEffect } from 'react';
import { MessageCircle, Sparkles, X, Zap, Target, Heart, Dumbbell, Footprints, Moon, Calendar } from 'lucide-react';
import { GoalSpecificAIAssistant } from './GoalSpecificAIAssistant';
import { useWeightLossStore } from '../../store/useWeightLossStore';
import { useAppStore } from '../../store/useAppStore';
import { GoalType } from '../../types';

export const FloatingAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);
  const { goals } = useAppStore();
  const { profile, getTodayCalories } = useWeightLossStore();

  const activeGoals = goals.filter(g => g.isActive);

  // Animate the assistant periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Hide pulse after first interaction
  useEffect(() => {
    if (isOpen) {
      setShowPulse(false);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setShowPulse(false);
  };

  const shouldShow = activeGoals.length > 0;
  
  if (!shouldShow) return null;

  const todayCalories = profile ? getTodayCalories() : 0;
  const remainingCalories = profile ? profile.dailyCalorieTarget - todayCalories : 0;

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

  return (
    <>
      {/* Floating Assistant Button */}
      <div className="fixed bottom-24 right-4 z-40">
        <button
          onClick={handleToggle}
          className={`
            relative w-16 h-16 bg-gradient-to-br from-[#B45309] to-[#92400E] 
            rounded-full shadow-2xl shadow-amber-900/40 
            flex items-center justify-center text-white
            transition-all duration-300 hover:scale-110 active:scale-95 z-50
            ${isAnimating ? 'animate-bounce' : ''}
            ${isOpen ? 'rotate-180' : ''}
          `}
        >
          {/* Pulse Animation */}
          {showPulse && (
            <div className="absolute inset-0 rounded-full bg-[#B45309] animate-ping opacity-30" />
          )}
          
          {/* Sparkle Effect */}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#DC2626] rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>

          {/* Main Icon */}
          {isOpen ? (
            <X className="w-7 h-7 transition-transform duration-300" />
          ) : (
            <MessageCircle className="w-7 h-7 transition-transform duration-300" />
          )}

          {/* Notification Dot */}
          {!isOpen && profile && remainingCalories > 0 && (
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">!</span>
            </div>
          )}
        </button>

        {/* Tooltip */}
        {!isOpen && !selectedGoal && (
          <div className="absolute bottom-full right-0 mb-2 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-[#161B22] text-[#F3F4F6] px-3 py-2 rounded-lg text-sm whitespace-nowrap border border-[#2B3440] shadow-lg">
              <div className="font-medium">AI Nutrition Coach</div>
              <div className="text-xs text-[#CBD5E1]">
                Choose your goal for specialized coaching
              </div>
              {/* Arrow */}
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#161B22]" />
            </div>
          </div>
        )}

        {/* Quick Stats Bubble */}
        {!isOpen && !selectedGoal && profile && remainingCalories > 0 && (
          <div className="absolute bottom-full right-full mr-2 mb-2">
            <div className="bg-[#161B22] text-[#F3F4F6] px-3 py-2 rounded-full text-xs font-medium border border-[#2B3440] shadow-lg">
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-[#B45309]" />
                <span>{remainingCalories} cal left</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Goal Selection Modal */}
      {isOpen && !selectedGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#161B22] rounded-2xl border border-[#2B3440] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#F3F4F6]">Choose Your Coach</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-[#2B3440] hover:bg-[#0D1117] rounded-lg flex items-center justify-center text-[#CBD5E1] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-[#CBD5E1] mb-6">Select a goal to get specialized AI coaching:</p>
            
            <div className="space-y-3">
              {activeGoals.map((goal) => {
                const GoalIcon = goalIcons[goal.type];
                const goalColor = goalColors[goal.type];
                
                return (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.type)}
                    className="w-full flex items-center space-x-3 p-4 bg-[#0D1117] hover:bg-[#2B3440] border border-[#2B3440] rounded-xl transition-all text-left"
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${goalColor}20`, color: goalColor }}
                    >
                      <GoalIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-[#F3F4F6]">{goal.title}</h4>
                      <p className="text-sm text-[#CBD5E1]">Specialized coaching & tips</p>
                    </div>
                    <div className="w-5 h-5 text-[#CBD5E1]">→</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Goal-Specific AI Chat */}
      {selectedGoal && (
        <GoalSpecificAIAssistant
          goalType={selectedGoal}
          onClose={() => {
            setSelectedGoal(null);
            setIsOpen(false);
          }}
          onDataUpdate={(updates) => {
            // Handle real-time data updates to main screen
            console.log('AI suggested data updates:', updates);
          }}
        />
      )}
    </>
  );
};