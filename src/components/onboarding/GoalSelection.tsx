import React, { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { GoalCard } from '../goals/GoalCard';
import { GoalType } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface GoalSelectionProps {
  onGoalsSelected: (goals: GoalType[]) => void;
}

const availableGoals = [
  {
    type: 'weight_loss' as GoalType,
    title: 'Weight Loss',
    description: 'Lose weight through calorie tracking, meal planning, and balanced exercise routines.'
  },
  {
    type: 'cardio_endurance' as GoalType,
    title: 'Cardio Endurance',
    description: 'Build cardiovascular fitness with running, cycling, and endurance training programs.'
  },
  {
    type: 'strength_building' as GoalType,
    title: 'Strength Building',
    description: 'Increase muscle strength and mass through progressive resistance training.'
  },
  {
    type: 'daily_steps' as GoalType,
    title: 'Daily Steps',
    description: 'Stay active with daily step goals and walking challenges.'
  },
  {
    type: 'sleep_tracking' as GoalType,
    title: 'Sleep Tracking',
    description: 'Improve sleep quality and maintain healthy sleep patterns.'
  }
];

export const GoalSelection: React.FC<GoalSelectionProps> = ({ onGoalsSelected }) => {
  const [selectedGoals, setSelectedGoals] = useState<GoalType[]>([]);
  
  // Get existing goals from store
  const { goals } = useAppStore();
  const existingGoals = goals.map(goal => goal.type);

  const toggleGoal = (goalType: GoalType) => {
    // Allow deselecting existing goals
    if (existingGoals.includes(goalType)) {
      // This is an existing goal - allow deselection for removal
      if (selectedGoals.includes(goalType)) {
        setSelectedGoals(selectedGoals.filter(g => g !== goalType));
      } else {
        // Add to selection for removal
        setSelectedGoals([...selectedGoals, goalType]);
      }
      return;
    }
    
    // For new goals, normal selection logic
    if (selectedGoals.includes(goalType)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goalType));
    } else {
      setSelectedGoals([...selectedGoals, goalType]);
    }
  };

  const handleContinue = () => {
    // Handle both new goal selection and existing goal management
    const goalsToRemove = selectedGoals.filter(goalType => existingGoals.includes(goalType));
    const goalsToAdd = selectedGoals.filter(goalType => !existingGoals.includes(goalType));
    
    // For now, just handle adding new goals
    // TODO: Implement goal removal functionality
    onGoalsSelected(goalsToAdd);
  };

  return (
    <div className="min-h-screen bg-[#0D1117] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#F3F4F6] mb-4">
            Choose Your Fitness Goals
          </h2>
          <p className="text-[#CBD5E1] text-lg max-w-2xl mx-auto">
            Select up to 3 goals that match your fitness aspirations. We'll personalize your experience based on your choices.
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <span className="text-sm text-[#CBD5E1]">Selected:</span>
            <span className="text-[#F08A3E] font-semibold">{selectedGoals.length}/3</span>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {availableGoals.map((goal) => (
            <div key={goal.type} className="relative">
              <GoalCard
                type={goal.type}
                title={goal.title}
                description={goal.description}
                isSelected={selectedGoals.includes(goal.type)}
                onClick={() => toggleGoal(goal.type)}
              />
              {existingGoals.includes(goal.type) && !selectedGoals.includes(goal.type) && (
                <div className="absolute top-4 left-4 bg-[#4BE0D1] text-white px-2 py-1 rounded-full text-xs font-medium">
                  Active
                </div>
              )}
              {existingGoals.includes(goal.type) && selectedGoals.includes(goal.type) && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Remove
                </div>
              )}
              {!existingGoals.includes(goal.type) && selectedGoals.includes(goal.type) && (
                <div className="absolute top-4 left-4 bg-[#F08A3E] text-white px-2 py-1 rounded-full text-xs font-medium">
                  New
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Goal Management Info */}
        {existingGoals.length > 0 && (
          <div className="bg-[#161B22] rounded-2xl p-4 border border-[#2B3440] mb-6">
            <h3 className="text-sm font-medium text-[#F3F4F6] mb-2">Goal Management</h3>
            <div className="text-sm text-[#CBD5E1] space-y-1">
              <p>• <span className="text-[#4BE0D1]">Active</span>: Currently tracking this goal</p>
              <p>• <span className="text-[#F08A3E]">New</span>: Will be added to your goals</p>
              <p>• <span className="text-red-400">Remove</span>: Will be removed from your goals</p>
            </div>
          </div>
        )}

        {/* Selected Goals Summary */}
        {selectedGoals.length > 0 && (
          <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440] mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-6 h-6 text-[#4BE0D1]" />
              <h3 className="text-lg font-semibold text-[#F3F4F6]">Changes to Apply</h3>
            </div>
            <div className="space-y-2">
              {selectedGoals.filter(goalType => !existingGoals.includes(goalType)).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-[#F08A3E] mb-1">Goals to Add:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedGoals.filter(goalType => !existingGoals.includes(goalType)).map((goalType) => {
                      const goal = availableGoals.find(g => g.type === goalType);
                      return (
                        <span
                          key={goalType}
                          className="px-3 py-1 bg-[#F08A3E]/20 text-[#F08A3E] rounded-full text-sm font-medium"
                        >
                          {goal?.title}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              {selectedGoals.filter(goalType => existingGoals.includes(goalType)).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-400 mb-1">Goals to Remove:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedGoals.filter(goalType => existingGoals.includes(goalType)).map((goalType) => {
                      const goal = availableGoals.find(g => g.type === goalType);
                      return (
                        <span
                          key={goalType}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium"
                        >
                          {goal?.title}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            className="bg-[#F08A3E] hover:bg-[#E17226] text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 inline-flex items-center space-x-3 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transform hover:scale-105 active:scale-95"
          >
            <span>
              {selectedGoals.length === 0 ? 'Back to Main' : 
               selectedGoals.some(g => !existingGoals.includes(g)) ? 'Add Selected Goals' : 
               'Apply Changes'}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
          {selectedGoals.length === 0 && existingGoals.length === 0 && (
            <p className="text-sm text-[#CBD5E1] mt-3">
              Please select at least one goal to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};