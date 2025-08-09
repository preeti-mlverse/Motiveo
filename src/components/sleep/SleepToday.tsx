import React, { useState, useEffect } from 'react';
import { Moon, Plus, Clock, TrendingUp, Award, Zap, Mic, Calendar, Sun, MessageCircle, Sparkles } from 'lucide-react';
import { SleepProfile, SleepEntry } from '../../types/sleep';
import { SleepLoggingModal } from './SleepLoggingModal';
import { SleepScoreRing } from './SleepScoreRing';
import { SleepStageChart } from './SleepStageChart';
import { SleepAIAssistant } from './SleepAIAssistant';

interface SleepTodayProps {
  profile: SleepProfile;
  onSleepLogged: (entry: SleepEntry) => void;
}

export const SleepToday: React.FC<SleepTodayProps> = ({
  profile,
  onSleepLogged
}) => {
  const [showSleepLogging, setShowSleepLogging] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastNightSleep, setLastNightSleep] = useState<SleepEntry | null>(null);
  const [sleepStreak, setSleepStreak] = useState(0);
  const [weeklyAverage, setWeeklyAverage] = useState(0);
  const [showSleepAI, setShowSleepAI] = useState(false);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Simulate last night's sleep data
  useEffect(() => {
    const mockSleepEntry: SleepEntry = {
      id: 'last-night',
      goalId: profile.goalId,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      bedtime: new Date(`${new Date().toDateString()} ${profile.targetBedtime}`),
      sleepTime: new Date(`${new Date().toDateString()} ${profile.targetBedtime}`),
      wakeTime: new Date(`${new Date().toDateString()} ${profile.targetWakeTime}`),
      totalTimeInBed: profile.targetSleepHours * 60,
      totalSleepTime: profile.targetSleepHours * 60 * 0.85, // 85% efficiency
      sleepEfficiency: 85,
      sleepScore: 82,
      stages: {
        light: Math.round(profile.targetSleepHours * 60 * 0.45),
        deep: Math.round(profile.targetSleepHours * 60 * 0.25),
        rem: Math.round(profile.targetSleepHours * 60 * 0.15),
        awake: Math.round(profile.targetSleepHours * 60 * 0.15)
      },
      wakeUps: 2,
      mood: 'good',
      trackingMethod: profile.trackingMethod === 'manual' ? 'manual' : 'automatic',
      createdAt: new Date()
    };
    
    setLastNightSleep(mockSleepEntry);
    setSleepStreak(7);
    setWeeklyAverage(7.5);
  }, [profile]);

  const handleSleepLogged = (entry: SleepEntry) => {
    setLastNightSleep(entry);
    onSleepLogged(entry);
    setShowSleepLogging(false);
  };

  const getTimeUntilBedtime = () => {
    const [bedHour, bedMin] = profile.targetBedtime.split(':').map(Number);
    const bedtime = new Date();
    bedtime.setHours(bedHour, bedMin, 0, 0);
    
    const now = new Date();
    let timeDiff = bedtime.getTime() - now.getTime();
    
    // If bedtime is tomorrow
    if (timeDiff < 0) {
      bedtime.setDate(bedtime.getDate() + 1);
      timeDiff = bedtime.getTime() - now.getTime();
    }
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, isToday: hours < 12 };
  };

  const bedtimeCountdown = getTimeUntilBedtime();

  const getSleepRecommendation = () => {
    const hour = currentTime.getHours();
    
    if (hour >= 6 && hour < 12) {
      return "Good morning! How did you sleep last night?";
    } else if (hour >= 12 && hour < 18) {
      return "Afternoon! Consider avoiding caffeine after 2 PM for better sleep.";
    } else if (hour >= 18 && hour < 21) {
      return "Evening! Start winding down soon for optimal sleep.";
    } else {
      return "It's getting late! Consider starting your bedtime routine.";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#F3F4F6]">Sleep Tracking</h2>
          <p className="text-[#CBD5E1]">
            Target: {profile.targetSleepHours}h • Bedtime: {profile.targetBedtime}
          </p>
        </div>
        <div className="w-12 h-12 bg-[#8B5CF6] rounded-2xl flex items-center justify-center">
          <Moon className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Last Night's Sleep */}
      {lastNightSleep && (
        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#F3F4F6]">Last Night</h3>
              <p className="text-sm text-[#CBD5E1]">
                {Math.floor(lastNightSleep.totalSleepTime / 60)}h {lastNightSleep.totalSleepTime % 60}m sleep, 
                {lastNightSleep.sleepEfficiency}% efficiency, {lastNightSleep.wakeUps} wake-ups
              </p>
            </div>
            <SleepScoreRing
              score={lastNightSleep.sleepScore}
              size={80}
            />
          </div>

          {/* Sleep Stages */}
          <SleepStageChart stages={lastNightSleep.stages} />

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-[#0D1117] rounded-xl">
              <div className="text-lg font-bold text-[#8B5CF6]">
                {Math.floor(lastNightSleep.totalSleepTime / 60)}h {lastNightSleep.totalSleepTime % 60}m
              </div>
              <div className="text-xs text-[#CBD5E1]">Total Sleep</div>
            </div>
            <div className="text-center p-3 bg-[#0D1117] rounded-xl">
              <div className="text-lg font-bold text-[#10B981]">{lastNightSleep.sleepEfficiency}%</div>
              <div className="text-xs text-[#CBD5E1]">Efficiency</div>
            </div>
            <div className="text-center p-3 bg-[#0D1117] rounded-xl">
              <div className="text-lg font-bold text-[#F59E0B]">{lastNightSleep.wakeUps}</div>
              <div className="text-xs text-[#CBD5E1]">Wake-ups</div>
            </div>
          </div>
        </div>
      )}

      {/* Bedtime Countdown */}
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#F3F4F6]">
            {bedtimeCountdown.isToday ? 'Bedtime Tonight' : 'Next Bedtime'}
          </h3>
          <Clock className="w-6 h-6 text-[#6BD0D2]" />
        </div>

        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-[#F3F4F6] mb-2">
            {bedtimeCountdown.hours}h {bedtimeCountdown.minutes}m
          </div>
          <div className="text-[#CBD5E1]">
            until bedtime ({profile.targetBedtime})
          </div>
        </div>

        {bedtimeCountdown.hours <= 2 && (
          <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-xl p-3 mb-4">
            <div className="flex items-center space-x-2">
              <Moon className="w-4 h-4 text-[#8B5CF6]" />
              <span className="text-sm font-medium text-[#8B5CF6]">Bedtime Reminder</span>
            </div>
            <p className="text-sm text-[#F3F4F6] mt-1">
              Start winding down soon! Consider dimming lights and avoiding screens.
            </p>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-[#CBD5E1]">{getSleepRecommendation()}</p>
        </div>
      </div>

      {/* Sleep Actions */}
      <div className="grid grid-cols-2 gap-4">
        {/* Log Sleep */}
        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <div className="flex items-center space-x-3 mb-4">
            <Plus className="w-6 h-6 text-[#8B5CF6]" />
            <div>
              <h4 className="font-semibold text-[#F3F4F6]">Log Sleep</h4>
              <p className="text-sm text-[#CBD5E1]">
                {profile.trackingMethod === 'manual' ? 'Manual entry' : 'Review auto-tracked'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowSleepLogging(true)}
            className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Log Sleep</span>
          </button>
        </div>

        {/* Sleep Stats */}
        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-[#10B981]" />
            <div>
              <h4 className="font-semibold text-[#F3F4F6]">Progress</h4>
              <p className="text-sm text-[#CBD5E1]">Weekly average: {weeklyAverage}h</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-[#0D1117] rounded-lg">
              <div className="text-lg font-bold text-[#10B981]">{sleepStreak}</div>
              <div className="text-xs text-[#CBD5E1]">Day Streak</div>
            </div>
            <div className="text-center p-2 bg-[#0D1117] rounded-lg">
              <div className="text-lg font-bold text-[#F59E0B]">{weeklyAverage}h</div>
              <div className="text-xs text-[#CBD5E1]">Avg Sleep</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Environment Tips */}
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center space-x-3 mb-4">
          <Award className="w-6 h-6 text-[#F8B84E]" />
          <h3 className="text-lg font-semibold text-[#F3F4F6]">Today's Sleep Tips</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-[#0D1117] rounded-xl">
            <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
            <span className="text-sm text-[#F3F4F6]">
              Keep room temperature at {profile.preferences.roomTemperature}°F
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-[#0D1117] rounded-xl">
            <div className="w-2 h-2 bg-[#F59E0B] rounded-full"></div>
            <span className="text-sm text-[#F3F4F6]">
              Avoid caffeine after {profile.preferences.caffeineTimeLimit}
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-[#0D1117] rounded-xl">
            <div className="w-2 h-2 bg-[#8B5CF6] rounded-full"></div>
            <span className="text-sm text-[#F3F4F6]">
              Stop screen time {profile.preferences.screenTimeLimit}h before bed
            </span>
          </div>
        </div>
      </div>

      {/* AI Sleep Coach */}
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center space-x-3 mb-4">
          <MessageCircle className="w-6 h-6 text-[#8B5CF6]" />
          <div>
            <h3 className="text-lg font-semibold text-[#F3F4F6]">Sleep Coach</h3>
            <p className="text-sm text-[#CBD5E1]">Get personalized sleep optimization advice</p>
          </div>
        </div>

        <div className="mb-4 p-3 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-xl">
          <p className="text-sm text-[#F3F4F6]">
            {lastNightSleep 
              ? `You got ${Math.floor(lastNightSleep.totalSleepTime / 60)}h sleep last night. How are you feeling today?`
              : `Ready to optimize your sleep? I can help with bedtime routines and sleep quality.`
            }
          </p>
        </div>
        
        <button
          onClick={() => {
            setShowSleepAI(true);
          }}
          className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Sleep Optimization Crew</span>
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Sleep Logging Modal */}
      {showSleepLogging && (
        <SleepLoggingModal
          profile={profile}
          onSleepLogged={handleSleepLogged}
          onClose={() => setShowSleepLogging(false)}
        />
      )}

      {/* Sleep AI Assistant */}
      {showSleepAI && (
        <SleepAIAssistant
          profile={profile}
          sleepData={{
            lastNightSleep: lastNightSleep ? Math.floor(lastNightSleep.totalSleepTime / 60) : 0,
            sleepScore: lastNightSleep?.sleepScore || 0,
            sleepEfficiency: lastNightSleep?.sleepEfficiency || 0,
            wakeUps: lastNightSleep?.wakeUps || 0,
            sleepStreak,
            weeklyAverage
          }}
          onClose={() => setShowSleepAI(false)}
          onActionSuggested={(action, data) => {
            console.log('Sleep action suggested:', action, data);
            // Handle specific sleep actions
            if (action.includes('Log') || action.includes('log')) {
              setShowSleepLogging(true);
            }
          }}
        />
      )}
    </div>
  );
};