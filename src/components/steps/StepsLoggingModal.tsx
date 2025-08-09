import React, { useState } from 'react';
import { Footprints, Plus, Mic, Clock, MapPin, X } from 'lucide-react';
import { StepsProfile, StepsEntry } from '../../types/steps';
import { VoiceInput } from '../common/VoiceInput';

interface StepsLoggingModalProps {
  profile: StepsProfile;
  onStepsLogged: (entry: StepsEntry) => void;
  onClose: () => void;
}

export const StepsLoggingModal: React.FC<StepsLoggingModalProps> = ({
  profile,
  onStepsLogged,
  onClose
}) => {
  const [steps, setSteps] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [activityType, setActivityType] = useState<'walking' | 'running' | 'hiking' | 'other'>('walking');
  const [notes, setNotes] = useState<string>('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const calculateMetrics = () => {
    const stepCount = parseInt(steps) || 0;
    const distance = (stepCount * profile.strideLength) / 100000; // km
    const calories = Math.round(stepCount * 0.04 * (profile.weight / 70));
    const activeMinutes = parseInt(duration) || Math.ceil(stepCount / 120); // Estimate if not provided
    
    return { distance, calories, activeMinutes };
  };

  const handleVoiceInput = (data: any) => {
    if (data.numbers.length > 0) {
      setSteps(data.numbers[0].toString());
      setNotes(data.originalText);
      setIsVoiceMode(false);
    }
  };

  const handleSave = () => {
    if (!steps) return;

    const metrics = calculateMetrics();
    
    const entry: StepsEntry = {
      id: Date.now().toString(),
      goalId: profile.goalId,
      date: new Date(),
      totalSteps: parseInt(steps),
      distance: metrics.distance,
      caloriesBurned: metrics.calories,
      activeMinutes: metrics.activeMinutes,
      hourlyBreakdown: [], // Would be populated by device data
      trackingMethod: isVoiceMode ? 'voice' : 'manual',
      createdAt: new Date()
    };

    onStepsLogged(entry);
  };

  const metrics = calculateMetrics();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#161B22] rounded-2xl border border-[#2B3440] w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#2B3440]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#10B981] rounded-xl flex items-center justify-center">
                <Footprints className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F3F4F6]">Log Steps</h2>
                <p className="text-sm text-[#CBD5E1]">Add your step count</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-[#2B3440] hover:bg-[#0D1117] rounded-lg flex items-center justify-center text-[#CBD5E1] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Metrics Preview */}
          {steps && (
            <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-[#10B981]">{parseInt(steps).toLocaleString()}</div>
                  <div className="text-xs text-[#CBD5E1]">steps</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[#6BD0D2]">{metrics.distance.toFixed(1)}</div>
                  <div className="text-xs text-[#CBD5E1]">km</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[#F08A3E]">{metrics.calories}</div>
                  <div className="text-xs text-[#CBD5E1]">cal</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Voice Input */}
          <div className="mb-6">
            <VoiceInput
              goalType="daily_steps"
              onVoiceInput={handleVoiceInput}
              placeholder="Say how many steps you walked..."
              className="w-full"
            />
            <p className="text-center text-xs text-[#CBD5E1] mt-2">
              Try: "I walked 5000 steps" or "Took 3000 steps this morning"
            </p>
          </div>

          {/* Manual Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
                Number of Steps
              </label>
              <input
                type="number"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder="5000"
                className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#10B981] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
                Duration (minutes) - Optional
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#10B981] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F3F4F6] mb-3">
                Activity Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'walking', label: 'Walking', icon: '🚶‍♀️' },
                  { value: 'running', label: 'Running', icon: '🏃‍♀️' },
                  { value: 'hiking', label: 'Hiking', icon: '🥾' },
                  { value: 'other', label: 'Other', icon: '🚶‍♂️' }
                ].map((activity) => (
                  <button
                    key={activity.value}
                    onClick={() => setActivityType(activity.value as any)}
                    className={`p-3 rounded-xl font-medium transition-all text-center ${
                      activityType === activity.value
                        ? 'bg-[#10B981] text-white'
                        : 'bg-[#0D1117] text-[#CBD5E1] hover:bg-[#2B3440]'
                    }`}
                  >
                    <div className="text-xl mb-1">{activity.icon}</div>
                    <div className="text-sm">{activity.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Where did you walk? How did it feel?"
                rows={3}
                className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#10B981] focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Quick Step Buttons */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[#F3F4F6] mb-3">Quick Add</h3>
            <div className="grid grid-cols-3 gap-2">
              {[1000, 2500, 5000, 7500, 10000, 15000].map((stepCount) => (
                <button
                  key={stepCount}
                  onClick={() => setSteps(stepCount.toString())}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    steps === stepCount.toString()
                      ? 'bg-[#10B981] text-white'
                      : 'bg-[#0D1117] text-[#CBD5E1] hover:bg-[#2B3440]'
                  }`}
                >
                  {stepCount >= 1000 ? `${stepCount / 1000}k` : stepCount}
                </button>
              ))}
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
              onClick={handleSave}
              disabled={!steps}
              className="flex-1 bg-[#10B981] hover:bg-[#059669] disabled:bg-[#2B3440] disabled:text-[#CBD5E1] disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <Footprints className="w-4 h-4" />
              <span>Log Steps</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};