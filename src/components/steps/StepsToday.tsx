import React, { useState, useEffect } from 'react';
import { Footprints, Plus, Target, TrendingUp, Award, Zap, MapPin, Clock, Play, MessageCircle, Sparkles } from 'lucide-react';
import { StepsProfile, StepsEntry, StepsChallenge } from '../../types/steps';
import { StepsLoggingModal } from './StepsLoggingModal';
import { StepsRing } from './StepsRing';
import { StepsHourlyChart } from './StepsHourlyChart';
import { StepsAIAssistant } from './StepsAIAssistant';

interface StepsTodayProps {
  profile: StepsProfile;
  onStepsLogged: (entry: StepsEntry) => void;
}

export const StepsToday: React.FC<StepsTodayProps> = ({
  profile,
  onStepsLogged
}) => {
  const [showStepsLogging, setShowStepsLogging] = useState(false);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [todayDistance, setTodayDistance] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [stepStreak, setStepStreak] = useState(0);
  const [weeklyAverage, setWeeklyAverage] = useState(0);
  const [todayChallenges, setTodayChallenges] = useState<StepsChallenge[]>([]);
  const [hourlySteps, setHourlySteps] = useState<number[]>([]);
  const [showStepsAI, setShowStepsAI] = useState(false);

  // Simulate step tracking
  useEffect(() => {
    // Simulate current steps (would come from device/API)
    const simulatedSteps = Math.floor(Math.random() * 3000) + 5000; // 5k-8k steps
    setCurrentSteps(simulatedSteps);
    
    // Calculate distance and calories
    const distance = (simulatedSteps * profile.strideLength) / 100000; // km
    setTodayDistance(distance);
    
    const calories = Math.round(simulatedSteps * 0.04 * (profile.weight / 70));
    setTodayCalories(calories);
    
    // Mock data
    setStepStreak(12);
    setWeeklyAverage(8750);
    
    // Generate hourly breakdown
    const hourly = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date().getHours();
      if (i > hour) return 0;
      return Math.floor(Math.random() * 800) + 200;
    });
    setHourlySteps(hourly);
    
    // Generate daily challenges
    setTodayChallenges([
      {
        id: 'stairs-challenge',
        type: 'daily',
        title: 'Stair Climber',
        description: 'Take the stairs instead of elevator 3 times',
        target: 3,
        reward: '+500 bonus steps',
        icon: '🏢',
        difficulty: 'easy'
      },
      {
        id: 'lunch-walk',
        type: 'daily',
        title: 'Lunch Break Walk',
        description: 'Take a 15-minute walk during lunch',
        target: 1500,
        reward: 'Afternoon energy boost',
        icon: '🌞',
        difficulty: 'medium'
      }
    ]);
  }, [profile]);

  const handleStepsLogged = (entry: StepsEntry) => {
    setCurrentSteps(prev => prev + entry.totalSteps);
    onStepsLogged(entry);
    setShowStepsLogging(false);
  };

  const getProgressPercentage = () => {
    return Math.min((currentSteps / profile.dailyStepTarget) * 100, 100);
  };

  const getRemainingSteps = () => {
    return Math.max(profile.dailyStepTarget - currentSteps, 0);
  };

  const getStepSuggestion = () => {
    const remaining = getRemainingSteps();
    const hour = new Date().getHours();
    
    if (remaining === 0) {
      return "🎉 Goal achieved! Keep moving for extra health benefits.";
    }
    
    if (remaining < 1000) {
      return `🚶‍♀️ Just ${remaining} steps to go! A quick 8-minute walk will get you there.`;
    }
    
    if (hour < 12) {
      return `🌅 Good morning! You need ${remaining.toLocaleString()} steps today. Start with a morning walk!`;
    } else if (hour < 17) {
      return `☀️ Afternoon boost! Take a ${Math.ceil(remaining / 100)} minute walk to stay on track.`;
    } else {
      return `🌆 Evening steps needed! A ${Math.ceil(remaining / 120)} minute evening walk will complete your goal.`;
    }
  };

  const startQuickWalk = () => {
    // Simulate starting a walk tracking session
    console.log('Starting quick walk session...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#F3F4F6]">Daily Steps</h2>
          <p className="text-[#CBD5E1]">
            Target: {profile.dailyStepTarget.toLocaleString()} • Streak: {stepStreak} days
          </p>
        </div>
        <div className="w-12 h-12 bg-[#10B981] rounded-2xl flex items-center justify-center">
          <Footprints className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Steps Progress Ring */}
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center justify-center mb-6">
          <StepsRing
            current={currentSteps}
            target={profile.dailyStepTarget}
            size={160}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-lg font-bold text-[#6BD0D2]">{todayDistance.toFixed(1)}</div>
            <div className="text-xs text-[#CBD5E1]">km walked</div>
          </div>
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-lg font-bold text-[#F08A3E]">{todayCalories}</div>
            <div className="text-xs text-[#CBD5E1]">calories</div>
          </div>
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-lg font-bold text-[#10B981]">{Math.floor(currentSteps / 100)}</div>
            <div className="text-xs text-[#CBD5E1]">active min</div>
          </div>
        </div>

        {/* AI Suggestion */}
        <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-[#10B981]" />
            <span className="text-sm font-medium text-[#10B981]">Smart Suggestion</span>
          </div>
          <p className="text-sm text-[#F3F4F6]">{getStepSuggestion()}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        {/* Start Walk */}
        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <div className="flex items-center space-x-3 mb-4">
            <Play className="w-6 h-6 text-[#10B981]" />
            <div>
              <h4 className="font-semibold text-[#F3F4F6]">Quick Walk</h4>
              <p className="text-sm text-[#CBD5E1]">Start tracking a walk</p>
            </div>
          </div>
          
          <button
            onClick={startQuickWalk}
            className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Start Walk</span>
          </button>
        </div>

        {/* Log Steps */}
        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <div className="flex items-center space-x-3 mb-4">
            <Plus className="w-6 h-6 text-[#6BD0D2]" />
            <div>
              <h4 className="font-semibold text-[#F3F4F6]">Log Steps</h4>
              <p className="text-sm text-[#CBD5E1]">Manual or voice entry</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowStepsLogging(true)}
            className="w-full bg-[#6BD0D2] hover:bg-[#4BE0D1] text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Log Steps</span>
          </button>
        </div>
      </div>

      {/* Daily Challenges */}
      {todayChallenges.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Award className="w-6 h-6 text-[#F8B84E]" />
            <h3 className="text-xl font-bold text-[#F3F4F6]">Today's Challenges</h3>
          </div>

          {todayChallenges.map((challenge) => (
            <div key={challenge.id} className="bg-[#161B22] rounded-2xl p-4 border border-[#2B3440]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{challenge.icon}</div>
                  <div>
                    <h4 className="font-medium text-[#F3F4F6]">{challenge.title}</h4>
                    <p className="text-sm text-[#CBD5E1]">{challenge.description}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  challenge.difficulty === 'easy' ? 'bg-[#10B981]/20 text-[#10B981]' :
                  challenge.difficulty === 'medium' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
                  'bg-[#EF4444]/20 text-[#EF4444]'
                }`}>
                  {challenge.difficulty}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#CBD5E1]">Reward: {challenge.reward}</span>
                <button className="px-4 py-2 bg-[#F8B84E] hover:bg-[#F8B84E]/80 text-white rounded-lg text-sm font-medium transition-colors">
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hourly Breakdown */}
      <StepsHourlyChart hourlySteps={hourlySteps} />

      {/* Weekly Progress */}
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#F3F4F6]">Weekly Summary</h3>
          <TrendingUp className="w-6 h-6 text-[#6BD0D2]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-2xl font-bold text-[#10B981]">{weeklyAverage.toLocaleString()}</div>
            <div className="text-sm text-[#CBD5E1]">Daily Average</div>
          </div>
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-2xl font-bold text-[#F8B84E]">{stepStreak}</div>
            <div className="text-sm text-[#CBD5E1]">Day Streak</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-[#0D1117] rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#CBD5E1]">This week's progress:</span>
            <span className="text-sm font-semibold text-[#10B981]">
              {weeklyAverage > profile.baselineAverage ? '+' : ''}{((weeklyAverage - profile.baselineAverage) / profile.baselineAverage * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Smart Suggestions */}
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center space-x-3 mb-4">
          <MapPin className="w-6 h-6 text-[#6BD0D2]" />
          <h3 className="text-lg font-semibold text-[#F3F4F6]">Step Boosters</h3>
        </div>

        <div className="space-y-3">
          {[
            {
              title: 'Coffee Shop Walk',
              description: 'Walk to nearby coffee shop instead of driving',
              steps: 1200,
              time: 12,
              icon: '☕'
            },
            {
              title: 'Parking Farther',
              description: 'Park at the far end of parking lots',
              steps: 400,
              time: 4,
              icon: '🚗'
            },
            {
              title: 'Lunch Break Stroll',
              description: 'Take a 15-minute walk during lunch',
              steps: 1800,
              time: 15,
              icon: '🥪'
            }
          ].map((suggestion, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-[#0D1117] rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="text-xl">{suggestion.icon}</div>
                <div>
                  <h4 className="font-medium text-[#F3F4F6]">{suggestion.title}</h4>
                  <p className="text-sm text-[#CBD5E1]">{suggestion.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[#10B981]">+{suggestion.steps}</div>
                <div className="text-xs text-[#CBD5E1]">{suggestion.time} min</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Walking Coach */}
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center space-x-3 mb-4">
          <MessageCircle className="w-6 h-6 text-[#10B981]" />
          <div>
            <h3 className="text-lg font-semibold text-[#F3F4F6]">Walking Coach</h3>
            <p className="text-sm text-[#CBD5E1]">Get personalized step and movement advice</p>
          </div>
        </div>

        <div className="mb-4 p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl">
          <p className="text-sm text-[#F3F4F6]">
            {currentSteps >= profile.dailyStepTarget 
              ? `🎉 Goal achieved! Want tips for tomorrow or bonus activities?`
              : `${Math.max(profile.dailyStepTarget - currentSteps, 0).toLocaleString()} steps to go! Need motivation or route ideas?`
            }
          </p>
        </div>
        
        <button
          onClick={() => {
            setShowStepsAI(true);
          }}
          className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Movement Optimization Crew</span>
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Steps Logging Modal */}
      {showStepsLogging && (
        <StepsLoggingModal
          profile={profile}
          onStepsLogged={handleStepsLogged}
          onClose={() => setShowStepsLogging(false)}
        />
      )}

      {/* Steps AI Assistant */}
      {showStepsAI && (
        <StepsAIAssistant
          profile={profile}
          stepsData={{
            currentSteps,
            remainingSteps: Math.max(profile.dailyStepTarget - currentSteps, 0),
            distance: todayDistance,
            caloriesBurned: todayCalories,
            stepStreak,
            weeklyAverage
          }}
          onClose={() => setShowStepsAI(false)}
          onActionSuggested={(action, data) => {
            console.log('Steps action suggested:', action, data);
            // Handle specific step actions
            if (action.includes('walk') || action.includes('Walk')) {
              startQuickWalk();
            }
            if (action.includes('Log') || action.includes('log')) {
              setShowStepsLogging(true);
            }
          }}
        />
      )}
    </div>
  );
};