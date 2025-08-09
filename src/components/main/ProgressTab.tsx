import React from 'react';
import { TrendingUp, Award, Flame, Calendar } from 'lucide-react';
import { ProgressChart } from '../common/ProgressChart';
import { WeightProgressChart } from '../weightLoss/WeightProgressChart';
import { useAppStore } from '../../store/useAppStore';
import { useWeightLossStore } from '../../store/useWeightLossStore';
import { FloatingAIAssistant } from '../common/FloatingAIAssistant';

export const ProgressTab: React.FC = () => {
  const { goals, logEntries, achievements, userProfile } = useAppStore();
  const { profile: weightLossProfile, weightEntries } = useWeightLossStore();
  
  const activeGoals = goals.filter(g => g.isActive);
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const hasWeightLossGoal = activeGoals.some(g => g.type === 'weight_loss');
  
  // Calculate streaks
  const calculateStreak = (goalType: string) => {
    const goalLogs = logEntries
      .filter(log => log.goalType === goalType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const log of goalLogs) {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      
      if (logDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getWeeklyProgress = (goalType: string) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekLogs = logEntries.filter(log => 
      log.goalType === goalType && new Date(log.timestamp) >= weekAgo
    );
    
    return weekLogs.length;
  };

  return (
    <div className="pb-20 px-4 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6]">Progress</h1>
          <p className="text-[#CBD5E1]">Track your fitness journey</p>
        </div>
        <div className="w-12 h-12 bg-[#4BE0D1] rounded-2xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-[#F08A3E]" />
          </div>
          <div className="text-2xl font-bold text-[#F3F4F6] mb-1">
            {Math.max(...activeGoals.map(g => calculateStreak(g.type)), 0)}
          </div>
          <div className="text-sm text-[#CBD5E1]">Best Streak</div>
        </div>

        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 text-[#F8B84E]" />
          </div>
          <div className="text-2xl font-bold text-[#F3F4F6] mb-1">
            {unlockedAchievements.length}
          </div>
          <div className="text-sm text-[#CBD5E1]">Achievements</div>
        </div>
      </div>

      {/* Weight Loss Progress Chart */}
      {hasWeightLossGoal && weightLossProfile && (
        <WeightProgressChart
          weightEntries={weightEntries}
          targetWeight={weightLossProfile.targetWeight}
          currentWeight={weightLossProfile.currentWeight}
        />
      )}

      {/* Progress Charts */}
      {activeGoals.filter(goal => goal.type !== 'weight_loss').map((goal) => (
        <div key={goal.id} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#F3F4F6]">{goal.title}</h2>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Flame className="w-4 h-4 text-[#F08A3E]" />
                <span className="text-sm font-semibold text-[#F08A3E]">
                  {calculateStreak(goal.type)} days
                </span>
              </div>
            </div>
          </div>

          <ProgressChart
            logs={logEntries.filter(log => log.goalType === goal.type)}
            goalType={goal.type}
            target={goal.targetValue}
          />

          {/* Weekly Summary */}
          <div className="bg-[#161B22] rounded-2xl p-4 border border-[#2B3440]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#CBD5E1]">This Week</div>
                <div className="text-lg font-bold text-[#F3F4F6]">
                  {getWeeklyProgress(goal.type)} sessions
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-[#CBD5E1]">Streak</div>
                <div className="text-lg font-bold text-[#4BE0D1]">
                  {calculateStreak(goal.type)} days
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#F3F4F6] flex items-center space-x-2">
            <Award className="w-6 h-6 text-[#F8B84E]" />
            <span>Recent Achievements</span>
          </h2>
          
          <div className="grid grid-cols-1 gap-3">
            {unlockedAchievements.slice(-3).map((achievement) => (
              <div key={achievement.id} className="bg-[#161B22] rounded-2xl p-4 border border-[#F8B84E]/30 bg-gradient-to-r from-[#F8B84E]/5 to-[#F8B84E]/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#F8B84E] rounded-2xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#F3F4F6]">{achievement.title}</h3>
                    <p className="text-sm text-[#CBD5E1]">{achievement.description}</p>
                    {achievement.unlockedAt && (
                      <p className="text-xs text-[#F8B84E] mt-1">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeGoals.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-[#2B3440] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#CBD5E1] mb-2">No Progress Data</h3>
          <p className="text-[#CBD5E1]">Start logging your activities to see progress!</p>
        </div>
      )}

      {/* Floating AI Assistant */}
      <FloatingAIAssistant />
    </div>
  );
};