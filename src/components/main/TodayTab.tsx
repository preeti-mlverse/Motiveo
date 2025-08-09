import React, { useState, useEffect } from 'react';
import { Plus, Target, Zap, Trash2, X, Dumbbell, Footprints } from 'lucide-react';
import { Heart, Moon, Calendar } from 'lucide-react';
import { VoiceInput } from '../common/VoiceInput';
import { useAppStore } from '../../store/useAppStore';
import { useWeightLossStore } from '../../store/useWeightLossStore';
import { useCardioStore } from '../../store/useCardioStore';
import { useStrengthStore } from '../../store/useStrengthStore';
import { useSleepStore } from '../../store/useSleepStore';
import { useStepsStore } from '../../store/useStepsStore';
import { WeightLossToday } from '../weightLoss/WeightLossToday';
import { CardioToday } from '../cardio/CardioToday';
import { StrengthToday } from '../strength/StrengthToday';
import { SleepToday } from '../sleep/SleepToday';
import { StepsToday } from '../steps/StepsToday';
import { LogEntry, GoalType } from '../../types';
import { MealLog, WeightEntry } from '../../types/weightLoss';
import { generateAIRecommendation, getMotivationalMessage } from '../../utils/aiRecommendations';
import { FloatingAIAssistant } from '../common/FloatingAIAssistant';
import { GoalSpecificAIAssistant } from '../common/GoalSpecificAIAssistant';

export const TodayTab: React.FC = () => {
  const {
    currentScreen,
    userProfile,
    goals,
    logEntries,
    addLogEntry,
    addAIRecommendation,
    setCurrentScreen
  } = useAppStore();

  const { 
    profile: weightLossProfile, 
    mealLogs, 
    addMealLog, 
    addWeightEntry 
  } = useWeightLossStore();

  const {
    profile: cardioProfile,
    addWorkoutSession
  } = useCardioStore();
  
  const {
    profile: strengthProfile,
    addWorkoutSession: addStrengthSession
  } = useStrengthStore();
  
  const {
    profile: sleepProfile,
    addSleepEntry
  } = useSleepStore();
  
  const {
    profile: stepsProfile,
    addStepsEntry
  } = useStepsStore();

  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [quickValue, setQuickValue] = useState('');
  const [goalToRemove, setGoalToRemove] = useState<string | null>(null);
  const [showGoalAI, setShowGoalAI] = useState<{ show: boolean; goalType: GoalType | null }>({ 
    show: false, 
    goalType: null 
  });
  const [activeGoalTab, setActiveGoalTab] = useState<string | null>(null);

  const activeGoals = goals.filter(g => g.isActive);

  // Set first goal as active tab when goals are loaded
  useEffect(() => {
    if (activeGoals.length > 0 && !activeGoalTab) {
      setActiveGoalTab(activeGoals[0].id);
    }
  }, [activeGoals, activeGoalTab]);

  useEffect(() => {
    const handleGoalAIEvent = (event: any) => {
      const { goalType } = event.detail;
      setShowGoalAI({ show: true, goalType });
    };

    window.addEventListener('openGoalAI', handleGoalAIEvent);
    return () => window.removeEventListener('openGoalAI', handleGoalAIEvent);
  }, []);

  const todayLogs = logEntries.filter(log => {
    const today = new Date().toDateString();
    return new Date(log.timestamp).toDateString() === today;
  });

  const handleMealLogged = (meal: MealLog) => {
    console.log('📝 TodayTab: Handling meal log:', meal);
    
    // Add to weight loss store
    const { addMealLog } = useWeightLossStore.getState();
    addMealLog(meal);
    
    console.log('✅ TodayTab: Meal logged to store');
    
    // Force re-render to update calorie displays
    setTimeout(() => {
      window.dispatchEvent(new Event('mealLogged'));
    }, 100);
  };

  const handleWeightLogged = (weight: number) => {
    const weightEntry: WeightEntry = {
      id: Date.now().toString(),
      goalId: 'weight-loss-goal',
      weight,
      date: new Date()
    };
    addWeightEntry(weightEntry);
  };

  const handleWorkoutLogged = (session: any) => {
    addWorkoutSession(session);
    console.log('✅ Workout session logged:', session);
  };

  const handleStrengthWorkoutLogged = (session: any) => {
    addStrengthSession(session);
    console.log('✅ Strength workout logged:', session);
  };

  const handleSleepLogged = (entry: any) => {
    addSleepEntry(entry);
    console.log('✅ Sleep entry logged:', entry);
  };

  const handleStepsLogged = (entry: any) => {
    addStepsEntry(entry);
    console.log('✅ Steps entry logged:', entry);
  };

  const handleVoiceInput = (goalId: string, data: any) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || !data.numbers.length) return;

    const logEntry: LogEntry = {
      id: Date.now().toString(),
      goalType: goal.type,
      value: data.numbers[0],
      unit: getUnitForGoal(goal.type),
      notes: data.originalText,
      timestamp: new Date(),
      loggedVia: 'voice'
    };

    addLogEntry(logEntry);

    // Generate AI recommendation
    const recommendations = generateAIRecommendation(goal.type, userProfile!, logEntries);
    if (recommendations.length > 0) {
      addAIRecommendation({
        id: Date.now().toString(),
        goalType: goal.type,
        title: 'Daily Tip',
        description: recommendations[0],
        actionItems: recommendations.slice(1),
        priority: 'medium',
        createdAt: new Date()
      });
    }
  };

  const handleQuickLog = (goalId: string) => {
    if (!quickValue) return;

    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const logEntry: LogEntry = {
      id: Date.now().toString(),
      goalType: goal.type,
      value: Number(quickValue),
      unit: getUnitForGoal(goal.type),
      timestamp: new Date(),
      loggedVia: 'manual'
    };

    addLogEntry(logEntry);
    setQuickValue('');
    setSelectedGoal(null);
  };

  const handleRemoveGoal = (goalId: string) => {
    setGoalToRemove(goalId);
  };

  const confirmRemoveGoal = () => {
    if (goalToRemove) {
      const { updateGoal } = useAppStore.getState();
      updateGoal(goalToRemove, { isActive: false });
      setGoalToRemove(null);
      
      // If removed goal was active tab, switch to first available goal
      if (goalToRemove === activeGoalTab) {
        const remainingGoals = activeGoals.filter(g => g.id !== goalToRemove);
        setActiveGoalTab(remainingGoals.length > 0 ? remainingGoals[0].id : null);
      }
    }
  };

  const cancelRemoveGoal = () => {
    setGoalToRemove(null);
  };

  const getUnitForGoal = (goalType: string) => {
    switch (goalType) {
      case 'weight_loss': return userProfile?.weightUnit || 'pounds';
      case 'daily_steps': return 'steps';
      case 'cardio_endurance': return 'minutes';
      case 'strength_building': return 'sets';
      case 'workout_consistency': return 'sessions';
      case 'sleep_tracking': return 'hours';
      default: return '';
    }
  };

  const getProgressPercentage = (goal: any) => {
    if (!goal.targetValue) return 0;
    const recentLogs = logEntries.filter(log => log.goalType === goal.type).slice(-7);
    const avgValue = recentLogs.reduce((sum, log) => sum + log.value, 0) / (recentLogs.length || 1);
    return Math.min((avgValue / goal.targetValue) * 100, 100);
  };

  const getGoalIcon = (goalType: GoalType) => {
    switch (goalType) {
      case 'weight_loss': return Target;
      case 'cardio_endurance': return Heart;
      case 'strength_building': return Dumbbell;
      case 'daily_steps': return Footprints;
      case 'sleep_tracking': return Moon;
      case 'workout_consistency': return Calendar;
      default: return Target;
    }
  };

  const getGoalColor = (goalType: GoalType) => {
    switch (goalType) {
      case 'weight_loss': return '#F08A3E';
      case 'cardio_endurance': return '#EF4444';
      case 'strength_building': return '#EF4444';
      case 'daily_steps': return '#10B981';
      case 'sleep_tracking': return '#8B5CF6';
      case 'workout_consistency': return '#6BD0D2';
      default: return '#F08A3E';
    }
  };

  const getGoalProfile = (goalType: GoalType) => {
    switch (goalType) {
      case 'weight_loss': return weightLossProfile;
      case 'cardio_endurance': return cardioProfile;
      case 'strength_building': return strengthProfile;
      case 'daily_steps': return stepsProfile;
      case 'sleep_tracking': return sleepProfile;
      default: return null;
    }
  };

  const needsSetup = (goalType: GoalType) => {
    return !getGoalProfile(goalType);
  };

  const handleCompleteSetup = (goalType: GoalType) => {
    // Store the current goal type for setup and navigate to goal-setup
    setCurrentScreen('goal-setup');
  };

  const renderGoalContent = (goal: any) => {
    const profile = getGoalProfile(goal.type);
    
    // If goal needs setup, show setup prompt
    if (needsSetup(goal.type)) {
      const Icon = getGoalIcon(goal.type);
      const color = getGoalColor(goal.type);
      
      return (
        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: color }}
            >
              <Icon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#F3F4F6] mb-2">Complete {goal.title} Setup</h2>
            <p className="text-[#CBD5E1] mb-6">
              Finish setting up your {goal.title.toLowerCase()} goal to access specialized features, tracking, and AI coaching.
            </p>
            <button
              onClick={() => handleCompleteSetup(goal.type)}
              className="font-semibold py-3 px-6 rounded-xl transition-all duration-300 text-white"
              style={{ backgroundColor: color }}
            >
              Complete Setup
            </button>
          </div>
        </div>
      );
    }

    // Render goal-specific content based on type
    switch (goal.type) {
      case 'weight_loss':
        return weightLossProfile ? (
          <WeightLossToday
            profile={weightLossProfile}
            mealLogs={mealLogs.filter(meal => {
              const today = new Date().toDateString();
              return new Date(meal.loggedDate).toDateString() === today;
            })}
            onMealLogged={handleMealLogged}
            onWeightLogged={handleWeightLogged}
          />
        ) : null;

      case 'cardio_endurance':
        return cardioProfile ? (
          <CardioToday
            profile={cardioProfile}
            onWorkoutLogged={handleWorkoutLogged}
          />
        ) : null;

      case 'strength_building':
        return strengthProfile ? (
          <StrengthToday
            profile={strengthProfile}
            onWorkoutLogged={handleStrengthWorkoutLogged}
          />
        ) : null;

      case 'daily_steps':
        return stepsProfile ? (
          <StepsToday
            profile={stepsProfile}
            onStepsLogged={handleStepsLogged}
          />
        ) : null;

      case 'sleep_tracking':
        return sleepProfile ? (
          <SleepToday
            profile={sleepProfile}
            onSleepLogged={handleSleepLogged}
          />
        ) : null;

      default:
        // For other goals (workout_consistency), render the original goal card
        const progress = getProgressPercentage(goal);
        const motivationMessage = getMotivationalMessage(goal.type, progress);
        const todayGoalLogs = todayLogs.filter(log => log.goalType === goal.type);
        
        return (
          <div className="space-y-6">
            {/* Goal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#F3F4F6]">{goal.title}</h2>
                <p className="text-[#CBD5E1]">{goal.description}</p>
              </div>
              <div className="w-12 h-12 bg-[#6BD0D2] rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Goal Progress */}
            <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#F3F4F6]">{goal.title}</h3>
                  <p className="text-sm text-[#CBD5E1]">
                    Target: {goal.targetValue} {getUnitForGoal(goal.type)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-[#CBD5E1]">{Math.round(progress)}%</span>
                  <button
                    onClick={() => handleRemoveGoal(goal.id)}
                    className="p-2 text-[#CBD5E1] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                    title="Remove goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#2B3440] rounded-full h-2 mb-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#6BD0D2] to-[#4BE0D1] h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Today's Progress */}
              {todayGoalLogs.length > 0 && (
                <div className="mb-4 p-3 bg-[#0D1117] rounded-xl">
                  <div className="text-sm text-[#CBD5E1] mb-1">Today's Progress:</div>
                  <div className="text-[#4BE0D1] font-semibold">
                    {todayGoalLogs[todayGoalLogs.length - 1].value} {todayGoalLogs[todayGoalLogs.length - 1].unit}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-3">
                {/* Voice Input */}
                <VoiceInput
                  goalType={goal.type}
                  onVoiceInput={(data) => handleVoiceInput(goal.id, data)}
                  className="w-full"
                />

                {/* Quick Manual Input */}
                {selectedGoal === goal.id ? (
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={quickValue}
                      onChange={(e) => setQuickValue(e.target.value)}
                      placeholder={`Enter ${getUnitForGoal(goal.type)}`}
                      className="flex-1 px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#F08A3E] focus:outline-none"
                    />
                    <button
                      onClick={() => handleQuickLog(goal.id)}
                      className="px-6 py-3 bg-[#4BE0D1] hover:bg-[#6BD0D2] text-white font-medium rounded-xl transition-colors"
                    >
                      Log
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedGoal(goal.id)}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-[#0D1117] hover:bg-[#2B3440] border border-[#2B3440] text-[#CBD5E1] hover:text-[#F3F4F6] rounded-xl transition-all duration-300"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Quick Log</span>
                  </button>
                )}
              </div>

              {/* Motivational Message */}
              <div className="mt-4 p-3 bg-gradient-to-r from-[#F08A3E]/10 to-[#E17226]/5 rounded-xl border-l-4 border-[#F08A3E]">
                <p className="text-sm text-[#F3F4F6]">{motivationMessage}</p>
              </div>

              {/* Goal-Specific AI Button */}
              <button
                onClick={() => setShowGoalAI({ show: true, goalType: goal.type })}
                className="w-full mt-3 flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-[#B45309] to-[#92400E] hover:from-[#A3470A] hover:to-[#7C2D12] text-white rounded-xl transition-all duration-300"
              >
                <Target className="w-4 h-4" />
                <span>Ask {goal.title} Coach</span>
                <Zap className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
    }
  };

  // If no goals, show empty state
  if (activeGoals.length === 0) {
    return (
      <div className="pb-20 px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#F3F4F6]">Today</h1>
            <p className="text-[#CBD5E1]">{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="w-12 h-12 bg-[#F08A3E] rounded-2xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="text-center py-12">
          <Target className="w-16 h-16 text-[#2B3440] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#CBD5E1] mb-2">No Active Goals</h3>
          <p className="text-[#CBD5E1] mb-6">Set up your first goal to get started!</p>
          <button
            onClick={() => setCurrentScreen('goals')}
            className="bg-[#F08A3E] hover:bg-[#E17226] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
          >
            Add Goals
          </button>
        </div>

        <FloatingAIAssistant />
      </div>
    );
  }

  // If only one goal, show it directly without tabs
  if (activeGoals.length === 1) {
    const goal = activeGoals[0];
    
    return (
      <div className="pb-20 px-4 pt-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#F3F4F6]">Today</h1>
            <p className="text-[#CBD5E1]">{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="w-12 h-12 bg-[#F08A3E] rounded-2xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Single Goal Content */}
        {renderGoalContent(goal)}

        {/* Goal Removal Confirmation Modal */}
        {goalToRemove && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#161B22] rounded-2xl border border-[#2B3440] w-full max-w-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#F3F4F6]">Remove Goal</h3>
                  <button
                    onClick={cancelRemoveGoal}
                    className="w-8 h-8 bg-[#2B3440] hover:bg-[#0D1117] rounded-lg flex items-center justify-center text-[#CBD5E1] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-[#F3F4F6] text-center mb-2">
                    Are you sure you want to remove this goal?
                  </p>
                  <p className="text-sm text-[#CBD5E1] text-center">
                    <strong>{goals.find(g => g.id === goalToRemove)?.title}</strong>
                  </p>
                  <p className="text-xs text-[#CBD5E1] text-center mt-2">
                    This will deactivate the goal and stop tracking progress. Your logged data will be preserved.
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={cancelRemoveGoal}
                    className="flex-1 bg-[#2B3440] hover:bg-[#0D1117] text-[#CBD5E1] font-medium py-3 px-4 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRemoveGoal}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                  >
                    Remove Goal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <FloatingAIAssistant />

        {/* Goal-Specific AI Modal */}
        {showGoalAI.show && showGoalAI.goalType && (
          <GoalSpecificAIAssistant
            goalType={showGoalAI.goalType}
            onClose={() => setShowGoalAI({ show: false, goalType: null })}
            onDataUpdate={(updates) => {
              console.log('AI data updates for', showGoalAI.goalType, ':', updates);
              
              if (updates.autoLog && showGoalAI.goalType) {
                const logEntry = {
                  id: Date.now().toString(),
                  goalType: showGoalAI.goalType,
                  value: updates.value,
                  unit: getUnitForGoal(showGoalAI.goalType),
                  notes: 'AI suggested entry',
                  timestamp: new Date(),
                  loggedVia: 'manual' as const
                };
                addLogEntry(logEntry);
              }
            }}
          />
        )}
      </div>
    );
  }

  // Multiple goals - show tabbed interface
  const activeGoal = activeGoals.find(g => g.id === activeGoalTab) || activeGoals[0];

  return (
    <div className="pb-20 px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6]">Today</h1>
          <p className="text-[#CBD5E1]">{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="w-12 h-12 bg-[#F08A3E] rounded-2xl flex items-center justify-center">
          <Target className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Goal Tabs */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {activeGoals.map((goal) => {
            const Icon = getGoalIcon(goal.type);
            const color = getGoalColor(goal.type);
            const isActive = activeGoalTab === goal.id;
            const needsSetupFlag = needsSetup(goal.type);
            
            return (
              <button
                key={goal.id}
                onClick={() => setActiveGoalTab(goal.id)}
                className={`
                  relative flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap
                  ${isActive 
                    ? 'text-white shadow-lg' 
                    : 'text-[#CBD5E1] bg-[#161B22] hover:bg-[#2B3440] border border-[#2B3440]'
                  }
                `}
                style={{ 
                  backgroundColor: isActive ? color : undefined,
                  boxShadow: isActive ? `0 8px 25px ${color}40` : undefined
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{goal.title}</span>
                
                {/* Setup indicator */}
                {needsSetupFlag && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#F59E0B] rounded-full"></div>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Goal Content */}
      <div className="space-y-6">
        {renderGoalContent(activeGoal)}
      </div>

      {/* Goal Removal Confirmation Modal */}
      {goalToRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#161B22] rounded-2xl border border-[#2B3440] w-full max-w-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#F3F4F6]">Remove Goal</h3>
                <button
                  onClick={cancelRemoveGoal}
                  className="w-8 h-8 bg-[#2B3440] hover:bg-[#0D1117] rounded-lg flex items-center justify-center text-[#CBD5E1] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-[#F3F4F6] text-center mb-2">
                  Are you sure you want to remove this goal?
                </p>
                <p className="text-sm text-[#CBD5E1] text-center">
                  <strong>{goals.find(g => g.id === goalToRemove)?.title}</strong>
                </p>
                <p className="text-xs text-[#CBD5E1] text-center mt-2">
                  This will deactivate the goal and stop tracking progress. Your logged data will be preserved.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={cancelRemoveGoal}
                  className="flex-1 bg-[#2B3440] hover:bg-[#0D1117] text-[#CBD5E1] font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveGoal}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  Remove Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <FloatingAIAssistant />

      {/* Goal-Specific AI Modal */}
      {showGoalAI.show && showGoalAI.goalType && (
        <GoalSpecificAIAssistant
          goalType={showGoalAI.goalType}
          onClose={() => setShowGoalAI({ show: false, goalType: null })}
          onDataUpdate={(updates) => {
            console.log('AI data updates for', showGoalAI.goalType, ':', updates);
            
            if (updates.autoLog && showGoalAI.goalType) {
              const logEntry = {
                id: Date.now().toString(),
                goalType: showGoalAI.goalType,
                value: updates.value,
                unit: getUnitForGoal(showGoalAI.goalType),
                notes: 'AI suggested entry',
                timestamp: new Date(),
                loggedVia: 'manual' as const
              };
              addLogEntry(logEntry);
            }
          }}
        />
      )}
    </div>
  );
};