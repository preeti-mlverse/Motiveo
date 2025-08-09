import React, { useState } from 'react';
import { Dumbbell, Target, User, Calendar, ArrowRight, Activity } from 'lucide-react';
import { StrengthProfile, EquipmentType, MuscleGroup, WorkoutSplit } from '../../types/strength';

interface StrengthSetupProps {
  onComplete: (profile: StrengthProfile) => void;
  userProfile: any;
  availableEquipment: EquipmentType[];
}

export const StrengthSetup: React.FC<StrengthSetupProps> = ({
  onComplete,
  userProfile,
  availableEquipment
}) => {
  const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [primaryGoal, setPrimaryGoal] = useState<'muscle_gain' | 'strength_increase' | 'endurance' | 'toning'>('muscle_gain');
  const [workoutFrequency, setWorkoutFrequency] = useState<number>(3);
  const [workoutDuration, setWorkoutDuration] = useState<number>(45);
  const [targetMuscleGroups, setTargetMuscleGroups] = useState<MuscleGroup[]>([]);
  const [workoutSplit, setWorkoutSplit] = useState<WorkoutSplit>('full_body');
  const [step, setStep] = useState<'fitness' | 'goals' | 'schedule' | 'review'>('fitness');

  const muscleGroupOptions = [
    { value: 'chest' as const, label: 'Chest', icon: '💪' },
    { value: 'back' as const, label: 'Back', icon: '🏋️' },
    { value: 'shoulders' as const, label: 'Shoulders', icon: '💪' },
    { value: 'arms' as const, label: 'Arms', icon: '💪' },
    { value: 'legs' as const, label: 'Legs', icon: '🦵' },
    { value: 'core' as const, label: 'Core', icon: '🔥' },
    { value: 'glutes' as const, label: 'Glutes', icon: '🍑' }
  ];

  const toggleMuscleGroup = (group: MuscleGroup) => {
    if (targetMuscleGroups.includes(group)) {
      setTargetMuscleGroups(prev => prev.filter(g => g !== group));
    } else {
      setTargetMuscleGroups(prev => [...prev, group]);
    }
  };

  const getRecommendedSplit = () => {
    if (workoutFrequency <= 2) return 'full_body';
    if (workoutFrequency <= 4) return 'upper_lower';
    return 'push_pull_legs';
  };

  const handleComplete = () => {
    const profile: StrengthProfile = {
      id: Date.now().toString(),
      goalId: 'strength-goal',
      userId: 'current-user',
      fitnessLevel,
      primaryGoal,
      workoutFrequency,
      preferredWorkoutDuration: workoutDuration,
      availableEquipment,
      bodyweightPreference: availableEquipment.includes('bodyweight_only'),
      targetMuscleGroups: targetMuscleGroups.length > 0 ? targetMuscleGroups : ['chest', 'back', 'legs', 'arms'],
      workoutSplit,
      progressionMethod: 'weight',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onComplete(profile);
  };

  const renderFitnessLevel = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#EF4444] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Fitness Level</h2>
        <p className="text-[#CBD5E1]">Help us customize your strength training program</p>
      </div>

      <div className="space-y-4">
        {[
          { 
            value: 'beginner', 
            label: 'Beginner', 
            desc: 'New to strength training or returning after a break' 
          },
          { 
            value: 'intermediate', 
            label: 'Intermediate', 
            desc: '6+ months of consistent strength training experience' 
          },
          { 
            value: 'advanced', 
            label: 'Advanced', 
            desc: '2+ years of serious strength training' 
          }
        ].map((level) => (
          <button
            key={level.value}
            onClick={() => setFitnessLevel(level.value as any)}
            className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
              fitnessLevel === level.value
                ? 'border-[#EF4444] bg-[#EF4444]/10'
                : 'border-[#2B3440] bg-[#161B22] hover:border-[#EF4444]/50'
            }`}
          >
            <div className="font-medium text-[#F3F4F6]">{level.label}</div>
            <div className="text-sm text-[#CBD5E1] mt-1">{level.desc}</div>
          </button>
        ))}
      </div>

      <button
        onClick={() => setStep('goals')}
        className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
      >
        <span>Next: Training Goals</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#3B82F6] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Training Goals</h2>
        <p className="text-[#CBD5E1]">What's your primary strength training objective?</p>
      </div>

      <div className="space-y-4">
        {[
          { 
            value: 'muscle_gain', 
            label: 'Muscle Gain', 
            desc: 'Build muscle mass and size (hypertrophy)',
            icon: '💪'
          },
          { 
            value: 'strength_increase', 
            label: 'Strength Increase', 
            desc: 'Increase maximum strength and power',
            icon: '🏋️'
          },
          { 
            value: 'endurance', 
            label: 'Muscular Endurance', 
            desc: 'Improve muscle endurance and stamina',
            icon: '⚡'
          },
          { 
            value: 'toning', 
            label: 'Toning & Definition', 
            desc: 'Improve muscle definition and tone',
            icon: '✨'
          }
        ].map((goal) => (
          <button
            key={goal.value}
            onClick={() => setPrimaryGoal(goal.value as any)}
            className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
              primaryGoal === goal.value
                ? 'border-[#EF4444] bg-[#EF4444]/10'
                : 'border-[#2B3440] bg-[#161B22] hover:border-[#EF4444]/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{goal.icon}</div>
              <div className="flex-1">
                <div className="font-medium text-[#F3F4F6]">{goal.label}</div>
                <div className="text-sm text-[#CBD5E1] mt-1">{goal.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-3">
          Target Muscle Groups (Select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {muscleGroupOptions.map((muscle) => (
            <button
              key={muscle.value}
              onClick={() => toggleMuscleGroup(muscle.value)}
              className={`p-3 rounded-xl font-medium transition-all text-center ${
                targetMuscleGroups.includes(muscle.value)
                  ? 'bg-[#EF4444] text-white'
                  : 'bg-[#161B22] text-[#CBD5E1] hover:bg-[#2B3440]'
              }`}
            >
              <div className="text-xl mb-1">{muscle.icon}</div>
              <div className="text-sm">{muscle.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep('fitness')}
          className="flex-1 bg-[#161B22] hover:bg-[#2B3440] text-[#CBD5E1] font-semibold py-3 px-4 rounded-xl transition-all"
        >
          Back
        </button>
        <button
          onClick={() => setStep('schedule')}
          className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
        >
          <span>Next: Schedule</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#10B981] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Workout Schedule</h2>
        <p className="text-[#CBD5E1]">Set your training frequency and duration</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-3">
          Workouts per week: {workoutFrequency} days
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="2"
            max="6"
            value={workoutFrequency}
            onChange={(e) => {
              const freq = Number(e.target.value);
              setWorkoutFrequency(freq);
              setWorkoutSplit(getRecommendedSplit());
            }}
            className="w-full h-2 bg-[#2B3440] rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #EF4444 0%, #EF4444 ${((workoutFrequency - 2) / 4) * 100}%, #2B3440 ${((workoutFrequency - 2) / 4) * 100}%, #2B3440 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-[#CBD5E1]">
            <span>2 days</span>
            <span>4 days (Recommended)</span>
            <span>6 days</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-3">
          Workout duration: {workoutDuration} minutes
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="30"
            max="90"
            step="15"
            value={workoutDuration}
            onChange={(e) => setWorkoutDuration(Number(e.target.value))}
            className="w-full h-2 bg-[#2B3440] rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #10B981 0%, #10B981 ${((workoutDuration - 30) / 60) * 100}%, #2B3440 ${((workoutDuration - 30) / 60) * 100}%, #2B3440 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-[#CBD5E1]">
            <span>30min</span>
            <span>60min (Recommended)</span>
            <span>90min</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-3">
          Recommended Workout Split
        </label>
        <div className="space-y-3">
          {[
            { 
              value: 'full_body', 
              label: 'Full Body', 
              desc: 'Train all muscle groups each session',
              recommended: workoutFrequency <= 3
            },
            { 
              value: 'upper_lower', 
              label: 'Upper/Lower Split', 
              desc: 'Alternate between upper and lower body',
              recommended: workoutFrequency === 4
            },
            { 
              value: 'push_pull_legs', 
              label: 'Push/Pull/Legs', 
              desc: 'Separate pushing, pulling, and leg movements',
              recommended: workoutFrequency >= 5
            }
          ].map((split) => (
            <button
              key={split.value}
              onClick={() => setWorkoutSplit(split.value as WorkoutSplit)}
              className={`w-full p-3 rounded-xl text-left transition-all border-2 relative ${
                workoutSplit === split.value
                  ? 'border-[#EF4444] bg-[#EF4444]/10'
                  : 'border-[#2B3440] bg-[#161B22] hover:border-[#EF4444]/50'
              }`}
            >
              {split.recommended && (
                <div className="absolute top-2 right-2 bg-[#F59E0B] text-white px-2 py-1 rounded-full text-xs font-medium">
                  Recommended
                </div>
              )}
              <div className="font-medium text-[#F3F4F6]">{split.label}</div>
              <div className="text-sm text-[#CBD5E1] mt-1">{split.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep('goals')}
          className="flex-1 bg-[#161B22] hover:bg-[#2B3440] text-[#CBD5E1] font-semibold py-3 px-4 rounded-xl transition-all"
        >
          Back
        </button>
        <button
          onClick={() => setStep('review')}
          className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
        >
          <span>Review Setup</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#10B981] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Strength Plan Ready</h2>
        <p className="text-[#CBD5E1]">Review your personalized strength training program</p>
      </div>

      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">Training Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-2xl font-bold text-[#EF4444]">{workoutFrequency}</div>
            <div className="text-sm text-[#CBD5E1]">Days/Week</div>
          </div>
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-2xl font-bold text-[#10B981]">{workoutDuration}</div>
            <div className="text-sm text-[#CBD5E1]">Minutes</div>
          </div>
        </div>
      </div>

      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">Program Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[#CBD5E1]">Fitness Level</span>
            <span className="font-semibold text-[#F3F4F6] capitalize">{fitnessLevel}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#CBD5E1]">Primary Goal</span>
            <span className="font-semibold text-[#F3F4F6] capitalize">{primaryGoal.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#CBD5E1]">Workout Split</span>
            <span className="font-semibold text-[#F3F4F6] capitalize">{workoutSplit.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">Target Muscle Groups</h3>
        <div className="flex flex-wrap gap-2">
          {(targetMuscleGroups.length > 0 ? targetMuscleGroups : ['chest', 'back', 'legs', 'arms']).map((group) => {
            const muscle = muscleGroupOptions.find(m => m.value === group);
            return (
              <span
                key={group}
                className="px-3 py-1 bg-[#EF4444]/20 text-[#EF4444] rounded-full text-sm font-medium flex items-center space-x-1"
              >
                <span>{muscle?.icon}</span>
                <span>{muscle?.label}</span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">Available Equipment</h3>
        <div className="flex flex-wrap gap-2">
          {availableEquipment.map((equipment) => (
            <span
              key={equipment}
              className="px-3 py-1 bg-[#10B981]/20 text-[#10B981] rounded-full text-sm font-medium capitalize"
            >
              {equipment.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-2xl p-4">
        <h3 className="text-sm font-medium text-[#EF4444] mb-2">What's Next?</h3>
        <ul className="text-sm text-[#F3F4F6] space-y-1">
          <li>• Get personalized workout templates</li>
          <li>• Track sets, reps, and weights</li>
          <li>• Monitor strength progression</li>
          <li>• Unlock achievements and PRs</li>
        </ul>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep('schedule')}
          className="flex-1 bg-[#161B22] hover:bg-[#2B3440] text-[#CBD5E1] font-semibold py-3 px-4 rounded-xl transition-all"
        >
          Back
        </button>
        <button
          onClick={handleComplete}
          className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
        >
          <Dumbbell className="w-5 h-5" />
          <span>Start Training</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0D1117] py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          {step === 'fitness' && renderFitnessLevel()}
          {step === 'goals' && renderGoals()}
          {step === 'schedule' && renderSchedule()}
          {step === 'review' && renderReview()}
        </div>
      </div>
    </div>
  );
};