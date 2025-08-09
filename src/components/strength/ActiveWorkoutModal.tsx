import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, Dumbbell, Check, X, ArrowRight } from 'lucide-react';
import { StrengthProfile, StrengthWorkoutSession, CompletedExercise, CompletedSet } from '../../types/strength';

interface ActiveWorkoutModalProps {
  workout: {
    session: Partial<StrengthWorkoutSession>;
    exercises: CompletedExercise[];
    currentExerciseIndex: number;
  };
  profile: StrengthProfile;
  onComplete: (session: StrengthWorkoutSession) => void;
  onCancel: () => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  workout,
  profile,
  onComplete,
  onCancel
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [currentWeight, setCurrentWeight] = useState<string>('');
  const [currentReps, setCurrentReps] = useState<string>('');
  const [currentRPE, setCurrentRPE] = useState<number>(5);

  // Mock exercises for the workout
  const workoutExercises = [
    {
      id: 'push-ups',
      name: 'Push-ups',
      sets: 3,
      targetReps: '8-12',
      restTime: 60,
      instructions: ['Start in plank position', 'Lower chest to ground', 'Push back up']
    },
    {
      id: 'squats',
      name: 'Bodyweight Squats',
      sets: 3,
      targetReps: '12-15',
      restTime: 60,
      instructions: ['Stand with feet shoulder-width apart', 'Lower down as if sitting', 'Return to standing']
    },
    {
      id: 'plank',
      name: 'Plank Hold',
      sets: 3,
      targetReps: '30-60s',
      restTime: 60,
      instructions: ['Hold plank position', 'Keep core tight', 'Maintain straight line']
    }
  ];

  const currentExercise = workoutExercises[currentExerciseIndex];

  // Update workout duration
  useEffect(() => {
    const interval = setInterval(() => {
      if (workout.session.startTime) {
        setWorkoutDuration(Math.floor((Date.now() - workout.session.startTime.getTime()) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [workout.session.startTime]);

  // Rest timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimeRemaining > 0) {
      interval = setInterval(() => {
        setRestTimeRemaining(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const completeSet = () => {
    const reps = parseInt(currentReps) || 0;
    const weight = parseFloat(currentWeight) || 0;

    // Start rest timer
    setIsResting(true);
    setRestTimeRemaining(currentExercise.restTime);

    // Move to next set or exercise
    if (currentSetIndex < currentExercise.sets - 1) {
      setCurrentSetIndex(prev => prev + 1);
    } else if (currentExerciseIndex < workoutExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSetIndex(0);
    } else {
      // Workout complete
      finishWorkout();
    }

    // Reset inputs
    setCurrentWeight('');
    setCurrentReps('');
    setCurrentRPE(5);
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimeRemaining(0);
  };

  const finishWorkout = () => {
    const completedSession: StrengthWorkoutSession = {
      id: workout.session.id || Date.now().toString(),
      goalId: workout.session.goalId || profile.goalId,
      workoutName: workout.session.workoutName || 'Strength Workout',
      startTime: workout.session.startTime || new Date(),
      endTime: new Date(),
      duration: workoutDuration / 60, // Convert to minutes
      exercises: [], // Would contain completed exercises
      totalVolume: 0, // Would calculate total volume
      personalRecords: [],
      difficulty: 7, // Default difficulty
      createdAt: new Date()
    };

    onComplete(completedSession);
  };

  const isWorkoutComplete = currentExerciseIndex >= workoutExercises.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#161B22] rounded-2xl border border-[#2B3440] w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#2B3440]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#EF4444] rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F3F4F6]">{workout.session.workoutName}</h2>
                <p className="text-sm text-[#CBD5E1]">Duration: {formatTime(workoutDuration)}</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="w-8 h-8 bg-[#2B3440] hover:bg-[#0D1117] rounded-lg flex items-center justify-center text-[#CBD5E1] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#CBD5E1]">
              Exercise {currentExerciseIndex + 1} of {workoutExercises.length}
            </span>
            <span className="text-[#CBD5E1]">
              Set {currentSetIndex + 1} of {currentExercise?.sets || 0}
            </span>
          </div>
          <div className="w-full bg-[#2B3440] rounded-full h-2 mt-2">
            <div
              className="bg-[#EF4444] h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${((currentExerciseIndex * 3 + currentSetIndex + 1) / (workoutExercises.length * 3)) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {isResting ? (
            /* Rest Screen */
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-[#F59E0B] rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-10 h-10 text-white" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-[#F3F4F6] mb-2">Rest Time</h3>
                <div className="text-4xl font-bold text-[#F59E0B] mb-2">
                  {formatTime(restTimeRemaining)}
                </div>
                <p className="text-[#CBD5E1]">
                  Next: {workoutExercises[currentExerciseIndex]?.name} - Set {currentSetIndex + 1}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={skipRest}
                  className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-4 rounded-xl transition-all"
                >
                  Skip Rest
                </button>
                <div className="text-xs text-[#CBD5E1] text-center">
                  Rest helps muscle recovery and performance
                </div>
              </div>
            </div>
          ) : (
            /* Exercise Screen */
            <div className="space-y-6">
              {/* Current Exercise */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#F3F4F6] mb-2">
                  {currentExercise?.name}
                </h3>
                <p className="text-[#CBD5E1] mb-4">
                  Set {currentSetIndex + 1} of {currentExercise?.sets} • Target: {currentExercise?.targetReps}
                </p>

                {/* Exercise Instructions */}
                <div className="bg-[#0D1117] rounded-xl p-4 mb-4">
                  <h4 className="text-sm font-medium text-[#F3F4F6] mb-2">Instructions:</h4>
                  <ul className="text-sm text-[#CBD5E1] space-y-1">
                    {currentExercise?.instructions.map((instruction, index) => (
                      <li key={index}>• {instruction}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Set Input */}
              <div className="space-y-4">
                {currentExercise?.name !== 'Plank Hold' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={currentWeight}
                        onChange={(e) => setCurrentWeight(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#EF4444] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
                        Reps
                      </label>
                      <input
                        type="number"
                        value={currentReps}
                        onChange={(e) => setCurrentReps(e.target.value)}
                        placeholder="10"
                        className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#EF4444] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {currentExercise?.name === 'Plank Hold' && (
                  <div>
                    <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
                      Duration (seconds)
                    </label>
                    <input
                      type="number"
                      value={currentReps}
                      onChange={(e) => setCurrentReps(e.target.value)}
                      placeholder="45"
                      className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#EF4444] focus:outline-none"
                    />
                  </div>
                )}

                {/* RPE Scale */}
                <div>
                  <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
                    Difficulty (RPE): {currentRPE}/10
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rpe) => (
                      <button
                        key={rpe}
                        onClick={() => setCurrentRPE(rpe)}
                        className={`w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                          rpe <= currentRPE 
                            ? 'bg-[#EF4444] text-white' 
                            : 'bg-[#2B3440] text-[#CBD5E1] hover:bg-[#0D1117]'
                        }`}
                      >
                        {rpe}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-[#CBD5E1] mt-1">
                    <span>Very Easy</span>
                    <span>Moderate</span>
                    <span>Maximum</span>
                  </div>
                </div>
              </div>

              {/* Complete Set Button */}
              <button
                onClick={completeSet}
                disabled={!currentReps}
                className="w-full bg-[#10B981] hover:bg-[#059669] disabled:bg-[#2B3440] disabled:text-[#CBD5E1] text-white font-semibold py-4 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <Check className="w-5 h-5" />
                <span>Complete Set</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#2B3440]">
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-[#2B3440] hover:bg-[#0D1117] text-[#CBD5E1] font-medium py-3 px-4 rounded-xl transition-colors"
            >
              End Workout
            </button>
            {isWorkoutComplete && (
              <button
                onClick={finishWorkout}
                className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Finish</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};