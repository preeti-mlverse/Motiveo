import React, { useState, useEffect } from 'react';
import { Dumbbell, Plus, Play, Pause, Square, TrendingUp, Award, Clock, Zap, MessageCircle, Sparkles } from 'lucide-react';
import { StrengthProfile, StrengthWorkoutSession, CompletedExercise } from '../../types/strength';
import { WorkoutTemplateModal } from './WorkoutTemplateModal';
import { ActiveWorkoutModal } from './ActiveWorkoutModal';
import { StrengthProgressChart } from './StrengthProgressChart';

interface StrengthTodayProps {
  profile: StrengthProfile;
  onWorkoutLogged: (session: StrengthWorkoutSession) => void;
}

export const StrengthToday: React.FC<StrengthTodayProps> = ({
  profile,
  onWorkoutLogged
}) => {
  const [showWorkoutTemplates, setShowWorkoutTemplates] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<{
    session: Partial<StrengthWorkoutSession>;
    exercises: CompletedExercise[];
    currentExerciseIndex: number;
  } | null>(null);
  const [todaysSessions, setTodaysSessions] = useState<StrengthWorkoutSession[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    totalDuration: 0,
    personalRecords: 0
  });

  // Simulate today's sessions and weekly stats
  useEffect(() => {
    // Mock data for demonstration
    const mockSession: StrengthWorkoutSession = {
      id: 'session-1',
      goalId: profile.goalId,
      workoutName: 'Upper Body Strength',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      duration: 60,
      exercises: [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Bench Press',
          sets: [
            { setNumber: 1, reps: 10, weight: 60, restTime: 120, completed: true, rpe: 7 },
            { setNumber: 2, reps: 8, weight: 65, restTime: 120, completed: true, rpe: 8 },
            { setNumber: 3, reps: 6, weight: 70, restTime: 120, completed: true, rpe: 9 }
          ]
        }
      ],
      totalVolume: 1950, // kg
      personalRecords: [],
      difficulty: 8,
      createdAt: new Date()
    };

    setTodaysSessions([mockSession]);
    setWeeklyStats({
      totalWorkouts: 4,
      totalVolume: 8500,
      totalDuration: 240,
      personalRecords: 2
    });
  }, [profile]);

  const startWorkout = (templateName: string) => {
    const newSession: Partial<StrengthWorkoutSession> = {
      id: Date.now().toString(),
      goalId: profile.goalId,
      workoutName: templateName,
      startTime: new Date(),
      exercises: [],
      totalVolume: 0,
      personalRecords: [],
      createdAt: new Date()
    };

    setActiveWorkout({
      session: newSession,
      exercises: [],
      currentExerciseIndex: 0
    });
    setShowWorkoutTemplates(false);
  };

  const handleWorkoutComplete = (session: StrengthWorkoutSession) => {
    setTodaysSessions(prev => [...prev, session]);
    onWorkoutLogged(session);
    setActiveWorkout(null);
  };

  const getNextWorkoutRecommendation = () => {
    const lastWorkout = todaysSessions[todaysSessions.length - 1];
    if (!lastWorkout) {
      return getWorkoutForSplit(profile.workoutSplit, 0);
    }

    // Simple rotation based on split
    if (profile.workoutSplit === 'full_body') {
      return 'Full Body Workout';
    } else if (profile.workoutSplit === 'upper_lower') {
      return lastWorkout.workoutName.includes('Upper') ? 'Lower Body' : 'Upper Body';
    } else {
      // Push/Pull/Legs rotation
      if (lastWorkout.workoutName.includes('Push')) return 'Pull Day';
      if (lastWorkout.workoutName.includes('Pull')) return 'Legs Day';
      return 'Push Day';
    }
  };

  const getWorkoutForSplit = (split: WorkoutSplit, dayIndex: number): string => {
    switch (split) {
      case 'full_body':
        return 'Full Body Workout';
      case 'upper_lower':
        return dayIndex % 2 === 0 ? 'Upper Body' : 'Lower Body';
      case 'push_pull_legs':
        const pplWorkouts = ['Push Day', 'Pull Day', 'Legs Day'];
        return pplWorkouts[dayIndex % 3];
      default:
        return 'Strength Workout';
    }
  };

  const getTodaysProgress = () => {
    const totalSessions = todaysSessions.length;
    const totalDuration = todaysSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalVolume = todaysSessions.reduce((sum, session) => sum + session.totalVolume, 0);
    
    return { totalSessions, totalDuration, totalVolume };
  };

  const todaysProgress = getTodaysProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#F3F4F6]">Strength Training</h2>
          <p className="text-[#CBD5E1]">
            {profile.workoutFrequency}x/week • {profile.preferredWorkoutDuration}min • {profile.primaryGoal.replace('_', ' ')}
          </p>
        </div>
        <div className="w-12 h-12 bg-[#EF4444] rounded-2xl flex items-center justify-center">
          <Dumbbell className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Today's Progress */}
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#F3F4F6]">Today's Progress</h3>
          <TrendingUp className="w-6 h-6 text-[#6BD0D2]" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-2xl font-bold text-[#EF4444]">{todaysProgress.totalSessions}</div>
            <div className="text-sm text-[#CBD5E1]">Workouts</div>
          </div>
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-2xl font-bold text-[#10B981]">{todaysProgress.totalDuration}</div>
            <div className="text-sm text-[#CBD5E1]">Minutes</div>
          </div>
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-2xl font-bold text-[#F59E0B]">{Math.round(todaysProgress.totalVolume)}</div>
            <div className="text-sm text-[#CBD5E1]">Volume (kg)</div>
          </div>
        </div>
      </div>

      {/* Active Workout or Start Workout */}
      {activeWorkout ? (
        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[#F3F4F6]">Active Workout</h3>
              <p className="text-sm text-[#CBD5E1]">{activeWorkout.session.workoutName}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-400">In Progress</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-[#0D1117] rounded-xl">
              <Clock className="w-5 h-5 text-[#6BD0D2] mx-auto mb-1" />
              <div className="text-lg font-bold text-[#F3F4F6]">
                {Math.floor((Date.now() - (activeWorkout.session.startTime?.getTime() || 0)) / 60000)}
              </div>
              <div className="text-xs text-[#CBD5E1]">Minutes</div>
            </div>
            <div className="text-center p-3 bg-[#0D1117] rounded-xl">
              <Dumbbell className="w-5 h-5 text-[#EF4444] mx-auto mb-1" />
              <div className="text-lg font-bold text-[#F3F4F6]">{activeWorkout.exercises.length}</div>
              <div className="text-xs text-[#CBD5E1]">Exercises</div>
            </div>
          </div>

          <button
            onClick={() => {/* Open active workout modal */}}
            className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>Continue Workout</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[#F3F4F6]">Next Workout</h3>
              <p className="text-sm text-[#CBD5E1]">{getNextWorkoutRecommendation()}</p>
            </div>
            <Dumbbell className="w-6 h-6 text-[#EF4444]" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-[#0D1117] rounded-xl">
              <div className="text-lg font-bold text-[#F59E0B]">{profile.preferredWorkoutDuration}</div>
              <div className="text-xs text-[#CBD5E1]">Target Duration</div>
            </div>
            <div className="text-center p-3 bg-[#0D1117] rounded-xl">
              <div className="text-lg font-bold text-[#6BD0D2]">{profile.targetMuscleGroups.length}</div>
              <div className="text-xs text-[#CBD5E1]">Muscle Groups</div>
            </div>
          </div>

          <button
            onClick={() => setShowWorkoutTemplates(true)}
            className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>Start Workout</span>
          </button>
        </div>
      )}

      {/* Recent Sessions */}
      {todaysSessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[#F3F4F6]">Today's Sessions</h3>
          {todaysSessions.map((session) => (
            <div key={session.id} className="bg-[#161B22] rounded-2xl p-4 border border-[#2B3440]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-[#F3F4F6]">{session.workoutName}</h4>
                  <p className="text-sm text-[#CBD5E1]">
                    {session.duration} min • {session.exercises.length} exercises
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#EF4444]">{Math.round(session.totalVolume)}</div>
                  <div className="text-xs text-[#CBD5E1]">kg volume</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#CBD5E1]">
                  Difficulty: {session.difficulty}/10
                </span>
                <span className="text-[#CBD5E1]">
                  {session.personalRecords.length} PRs
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weekly Stats */}
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#F3F4F6]">Weekly Summary</h3>
          <Award className="w-6 h-6 text-[#F8B84E]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-2xl font-bold text-[#4BE0D1]">{weeklyStats.totalWorkouts}</div>
            <div className="text-sm text-[#CBD5E1]">Workouts</div>
          </div>
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-2xl font-bold text-[#F08A3E]">{Math.round(weeklyStats.totalVolume)}</div>
            <div className="text-sm text-[#CBD5E1]">Total Volume</div>
          </div>
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-2xl font-bold text-[#10B981]">{weeklyStats.totalDuration}</div>
            <div className="text-sm text-[#CBD5E1]">Minutes</div>
          </div>
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-2xl font-bold text-[#F8B84E]">{weeklyStats.personalRecords}</div>
            <div className="text-sm text-[#CBD5E1]">PRs</div>
          </div>
        </div>
      </div>

      {/* Strength Progress Chart */}
      <StrengthProgressChart profile={profile} />

      {/* AI Strength Coach */}
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center space-x-3 mb-4">
          <MessageCircle className="w-6 h-6 text-[#EF4444]" />
          <div>
            <h3 className="text-lg font-semibold text-[#F3F4F6]">Strength Coach</h3>
            <p className="text-sm text-[#CBD5E1]">Get personalized lifting and strength advice</p>
          </div>
        </div>

        <div className="mb-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl">
          <p className="text-sm text-[#F3F4F6]">
            {activeWorkout 
              ? `Workout in progress! Need form tips or motivation?`
              : `Ready to build strength? I can help with workout planning and technique.`
            }
          </p>
        </div>
        
        <button
          onClick={() => {
            const event = new CustomEvent('openGoalAI', { 
              detail: { goalType: 'strength_building' } 
            });
            window.dispatchEvent(event);
          }}
          className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Ask Strength Coach</span>
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#161B22] rounded-2xl p-4 border border-[#2B3440]">
          <div className="flex items-center space-x-3 mb-3">
            <Plus className="w-5 h-5 text-[#EF4444]" />
            <div>
              <h4 className="font-medium text-[#F3F4F6]">Quick Workout</h4>
              <p className="text-sm text-[#CBD5E1]">Start a template</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowWorkoutTemplates(true)}
            className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          >
            Browse Templates
          </button>
        </div>

        <div className="bg-[#161B22] rounded-2xl p-4 border border-[#2B3440]">
          <div className="flex items-center space-x-3 mb-3">
            <Zap className="w-5 h-5 text-[#F59E0B]" />
            <div>
              <h4 className="font-medium text-[#F3F4F6]">Quick Log</h4>
              <p className="text-sm text-[#CBD5E1]">Log past workout</p>
            </div>
          </div>
          
          <button
            onClick={() => {/* Open quick log modal */}}
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          >
            Manual Entry
          </button>
        </div>
      </div>

      {/* Workout Templates Modal */}
      {showWorkoutTemplates && (
        <WorkoutTemplateModal
          profile={profile}
          onSelectTemplate={startWorkout}
          onClose={() => setShowWorkoutTemplates(false)}
        />
      )}

      {/* Active Workout Modal */}
      {activeWorkout && (
        <ActiveWorkoutModal
          workout={activeWorkout}
          profile={profile}
          onComplete={handleWorkoutComplete}
          onCancel={() => setActiveWorkout(null)}
        />
      )}
    </div>
  );
};