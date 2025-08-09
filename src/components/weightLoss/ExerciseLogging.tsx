import React, { useState } from 'react';
import { Activity, Clock, Zap, Plus, X } from 'lucide-react';
import { ExerciseLog } from '../../types/weightLoss';
import { CalorieCalculator } from '../../utils/calorieCalculator';

interface ExerciseLoggingProps {
  userWeight: number;
  onExerciseLogged: (exercise: ExerciseLog) => void;
  onClose: () => void;
}

const exerciseTypes = [
  { name: 'Walking', icon: '🚶‍♀️', met: 3.5 },
  { name: 'Jogging', icon: '🏃‍♀️', met: 7.0 },
  { name: 'Running', icon: '🏃‍♂️', met: 9.8 },
  { name: 'Cycling', icon: '🚴‍♀️', met: 6.8 },
  { name: 'Swimming', icon: '🏊‍♀️', met: 8.0 },
  { name: 'Weightlifting', icon: '🏋️‍♀️', met: 3.0 },
  { name: 'Yoga', icon: '🧘‍♀️', met: 2.5 },
  { name: 'Dancing', icon: '💃', met: 4.8 },
  { name: 'Hiking', icon: '🥾', met: 6.0 },
  { name: 'Elliptical', icon: '🏃‍♀️', met: 5.0 }
];

export const ExerciseLogging: React.FC<ExerciseLoggingProps> = ({
  userWeight,
  onExerciseLogged,
  onClose
}) => {
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(5);
  const [customExercise, setCustomExercise] = useState<string>('');
  const [showCustom, setShowCustom] = useState(false);

  const calculateCaloriesBurned = () => {
    const exerciseType = exerciseTypes.find(e => e.name === selectedExercise);
    if (!exerciseType || !duration) return 0;

    return CalorieCalculator.calculateExerciseCalories(
      selectedExercise.toLowerCase(),
      parseInt(duration),
      userWeight,
      intensity
    );
  };

  const handleLogExercise = () => {
    if ((!selectedExercise && !customExercise) || !duration) return;

    const caloriesBurned = calculateCaloriesBurned();
    
    const exercise: ExerciseLog = {
      id: Date.now().toString(),
      goalId: 'weight-loss-goal',
      activityType: selectedExercise || customExercise,
      durationMinutes: parseInt(duration),
      intensityLevel: intensity,
      caloriesBurned,
      aiSuggested: false,
      loggedDate: new Date(),
      createdAt: new Date()
    };

    console.log('🏃‍♀️ Logging exercise:', exercise);
    onExerciseLogged(exercise);
  };

  const estimatedCalories = calculateCaloriesBurned();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#161B22] rounded-2xl border border-[#2B3440] w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#2B3440]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#6BD0D2] rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F3F4F6]">Log Exercise</h2>
                <p className="text-sm text-[#CBD5E1]">Track your physical activity</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-[#2B3440] hover:bg-[#0D1117] rounded-lg flex items-center justify-center text-[#CBD5E1] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Estimated Calories */}
          {estimatedCalories > 0 && (
            <div className="bg-[#6BD0D2]/10 border border-[#6BD0D2]/30 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#CBD5E1]">Estimated calories burned:</span>
                <span className="text-lg font-bold text-[#6BD0D2]">{estimatedCalories} cal</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Exercise Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[#F3F4F6]">Select Activity</h3>
              <button
                onClick={() => setShowCustom(!showCustom)}
                className="text-sm text-[#6BD0D2] hover:text-[#4BE0D1] transition-colors"
              >
                {showCustom ? 'Show Presets' : 'Custom Activity'}
              </button>
            </div>

            {showCustom ? (
              <input
                type="text"
                value={customExercise}
                onChange={(e) => setCustomExercise(e.target.value)}
                placeholder="Enter custom activity..."
                className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#6BD0D2] focus:outline-none"
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {exerciseTypes.map((exercise) => (
                  <button
                    key={exercise.name}
                    onClick={() => setSelectedExercise(exercise.name)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      selectedExercise === exercise.name
                        ? 'border-[#6BD0D2] bg-[#6BD0D2]/10'
                        : 'border-[#2B3440] bg-[#0D1117] hover:border-[#6BD0D2]/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{exercise.icon}</div>
                    <div className="text-sm font-medium text-[#F3F4F6]">{exercise.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Duration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
              Duration (minutes)
            </label>
            <div className="flex">
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                className="flex-1 px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-l-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#6BD0D2] focus:outline-none"
              />
              <div className="px-4 py-3 bg-[#2B3440] border border-[#2B3440] rounded-r-xl text-[#CBD5E1] text-sm flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                min
              </div>
            </div>
          </div>

          {/* Quick Duration Buttons */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[#F3F4F6] mb-3">Quick Duration</h3>
            <div className="flex flex-wrap gap-2">
              {[15, 30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDuration(mins.toString())}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    duration === mins.toString()
                      ? 'bg-[#6BD0D2] text-white'
                      : 'bg-[#0D1117] text-[#CBD5E1] hover:bg-[#2B3440]'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Intensity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
              Intensity Level: {intensity}/10
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full h-2 bg-[#2B3440] rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #6BD0D2 0%, #6BD0D2 ${(intensity - 1) * 11.11}%, #2B3440 ${(intensity - 1) * 11.11}%, #2B3440 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-[#CBD5E1]">
                <span>Light</span>
                <span>Moderate</span>
                <span>Intense</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#2B3440]">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-[#2B3440] hover:bg-[#0D1117] text-[#CBD5E1] font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogExercise}
              disabled={(!selectedExercise && !customExercise) || !duration}
              className="flex-1 bg-[#6BD0D2] hover:bg-[#4BE0D1] disabled:bg-[#2B3440] disabled:text-[#CBD5E1] disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>Submit Exercise</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #6BD0D2;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #6BD0D2;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};