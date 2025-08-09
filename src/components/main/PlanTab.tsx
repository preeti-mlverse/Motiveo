import React from 'react';
import { Calendar, Lightbulb, Target, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { generateAIRecommendation } from '../../utils/aiRecommendations';
import { FloatingAIAssistant } from '../common/FloatingAIAssistant';

export const PlanTab: React.FC = () => {
  const { userProfile, goals, logEntries, aiRecommendations } = useAppStore();
  
  const activeGoals = goals.filter(g => g.isActive);
  const recentRecommendations = aiRecommendations.slice(-3);

  const getUpcomingActions = (goalType: string) => {
    switch (goalType) {
      case 'weight_loss':
        return [
          'Log your morning weight',
          'Track breakfast calories',
          '30-min cardio session',
          'Prepare healthy lunch'
        ];
      case 'cardio_endurance':
        return [
          'Warm-up stretches (5 min)',
          'Run 3 miles at easy pace',
          'Cool-down walk',
          'Log your session'
        ];
      case 'strength_building':
        return [
          'Dynamic warm-up',
          'Upper body strength training',
          'Core exercises (15 min)',
          'Protein intake within 30 min'
        ];
      case 'daily_steps':
        return [
          'Morning walk (20 min)',
          'Take stairs at work',
          'Lunch break walk',
          'Evening family walk'
        ];
      case 'workout_consistency':
        return [
          'Choose workout type',
          'Set up equipment',
          'Complete 30-min session',
          'Mark workout complete'
        ];
      case 'sleep_tracking':
        return [
          'No screens 1 hour before bed',
          'Prepare bedroom (cool, dark)',
          'Relaxation routine',
          'Track sleep quality'
        ];
      default:
        return [];
    }
  };

  const getPriorityLevel = (goalType: string) => {
    const recentLogs = logEntries.filter(log => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return log.goalType === goalType && new Date(log.timestamp) > yesterday;
    });

    if (recentLogs.length === 0) return 'high';
    if (recentLogs.length < 2) return 'medium';
    return 'low';
  };

  return (
    <div className="pb-20 px-4 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6]">Plan</h1>
          <p className="text-[#CBD5E1]">Your personalized fitness roadmap</p>
        </div>
        <div className="w-12 h-12 bg-[#6BD0D2] rounded-2xl flex items-center justify-center">
          <Calendar className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Daily Plan Overview */}
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#F3F4F6]">Today's Plan</h2>
          <span className="text-sm text-[#CBD5E1]">
            {new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="space-y-3">
          {activeGoals.slice(0, 3).map((goal, index) => {
            const priority = getPriorityLevel(goal.type);
            const actions = getUpcomingActions(goal.type);
            
            return (
              <div key={goal.id} className="flex items-center space-x-3 p-3 bg-[#0D1117] rounded-xl">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${priority === 'high' ? 'bg-[#F08A3E] text-white' : 
                    priority === 'medium' ? 'bg-[#F8B84E] text-white' : 
                    'bg-[#4BE0D1] text-white'
                  }
                `}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[#F3F4F6]">{goal.title}</h3>
                  <p className="text-sm text-[#CBD5E1]">{actions[0]}</p>
                </div>
                <div className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${priority === 'high' ? 'bg-[#F08A3E]/20 text-[#F08A3E]' : 
                    priority === 'medium' ? 'bg-[#F8B84E]/20 text-[#F8B84E]' : 
                    'bg-[#4BE0D1]/20 text-[#4BE0D1]'
                  }
                `}>
                  {priority}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Action Plans */}
      {activeGoals.map((goal) => (
        <div key={goal.id} className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#F3F4F6]">{goal.title}</h3>
            <Target className="w-6 h-6 text-[#6BD0D2]" />
          </div>

          <div className="space-y-3">
            {getUpcomingActions(goal.type).map((action, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-[#2B3440] rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#6BD0D2] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-[#F3F4F6] flex-1">{action}</span>
                <ArrowRight className="w-4 h-4 text-[#CBD5E1]" />
              </div>
            ))}
          </div>

          {/* Progress Indicator */}
          <div className="mt-4 pt-4 border-t border-[#2B3440]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#CBD5E1]">Today's Progress</span>
              <span className="text-[#4BE0D1] font-medium">0/4 completed</span>
            </div>
            <div className="w-full bg-[#2B3440] rounded-full h-2 mt-2">
              <div className="bg-[#4BE0D1] h-full rounded-full" style={{ width: '0%' }} />
            </div>
          </div>
        </div>
      ))}

      {/* AI Recommendations */}
      {recentRecommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-6 h-6 text-[#F8B84E]" />
            <h2 className="text-xl font-bold text-[#F3F4F6]">AI Recommendations</h2>
          </div>

          {recentRecommendations.map((recommendation) => (
            <div key={recommendation.id} className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440] bg-gradient-to-r from-[#F8B84E]/5 to-transparent">
              <div className="flex items-start space-x-3">
                <div className={`
                  w-3 h-3 rounded-full mt-2
                  ${recommendation.priority === 'high' ? 'bg-[#F08A3E]' : 
                    recommendation.priority === 'medium' ? 'bg-[#F8B84E]' : 
                    'bg-[#4BE0D1]'
                  }
                `} />
                <div className="flex-1">
                  <h3 className="font-semibold text-[#F3F4F6] mb-2">{recommendation.title}</h3>
                  <p className="text-[#CBD5E1] mb-3">{recommendation.description}</p>
                  
                  {recommendation.actionItems.length > 0 && (
                    <div className="space-y-2">
                      {recommendation.actionItems.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-[#6BD0D2] rounded-full" />
                          <span className="text-sm text-[#CBD5E1]">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeGoals.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-[#2B3440] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#CBD5E1] mb-2">No Active Goals</h3>
          <p className="text-[#CBD5E1]">Set up your goals to get a personalized plan!</p>
        </div>
      )}

      {/* Floating AI Assistant */}
      <FloatingAIAssistant />
    </div>
  );
};