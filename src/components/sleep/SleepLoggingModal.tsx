import React, { useState } from 'react';
import { Moon, Clock, Save, X, Mic, Star } from 'lucide-react';
import { SleepProfile, SleepEntry, SleepStages } from '../../types/sleep';

interface SleepLoggingModalProps {
  profile: SleepProfile;
  onSleepLogged: (entry: SleepEntry) => void;
  onClose: () => void;
}

export const SleepLoggingModal: React.FC<SleepLoggingModalProps> = ({
  profile,
  onSleepLogged,
  onClose
}) => {
  const [bedtime, setBedtime] = useState<string>('');
  const [wakeTime, setWakeTime] = useState<string>('');
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [wakeUps, setWakeUps] = useState<number>(0);
  const [mood, setMood] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [notes, setNotes] = useState<string>('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const calculateSleepMetrics = () => {
    if (!bedtime || !wakeTime) return null;

    const bedDate = new Date(`${new Date().toDateString()} ${bedtime}`);
    const wakeDate = new Date(`${new Date().toDateString()} ${wakeTime}`);
    
    // If wake time is earlier than bedtime, it's next day
    if (wakeDate < bedDate) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }

    const totalTimeInBed = Math.floor((wakeDate.getTime() - bedDate.getTime()) / (1000 * 60));
    const sleepEfficiency = Math.max(85 - (wakeUps * 5) + (sleepQuality * 5), 60);
    const totalSleepTime = Math.floor(totalTimeInBed * (sleepEfficiency / 100));
    
    // Calculate sleep stages (simplified)
    const stages: SleepStages = {
      light: Math.floor(totalSleepTime * 0.45),
      deep: Math.floor(totalSleepTime * 0.25),
      rem: Math.floor(totalSleepTime * 0.20),
      awake: Math.floor(totalSleepTime * 0.10)
    };

    const sleepScore = Math.min(
      Math.floor(
        (totalSleepTime / (profile.targetSleepHours * 60)) * 40 + // Duration score (40%)
        sleepEfficiency * 0.3 + // Efficiency score (30%)
        (5 - wakeUps) * 5 + // Wake-ups score (20%)
        sleepQuality * 2.5 // Quality score (10%)
      ),
      100
    );

    return {
      totalTimeInBed,
      totalSleepTime,
      sleepEfficiency,
      sleepScore,
      stages
    };
  };

  const handleVoiceInput = () => {
    // Simulate voice input processing
    setIsVoiceMode(true);
    
    // Mock voice recognition result
    setTimeout(() => {
      setBedtime('22:30');
      setWakeTime('06:45');
      setSleepQuality(4);
      setWakeUps(1);
      setNotes('Slept well, woke up once around 3 AM but fell back asleep quickly.');
      setIsVoiceMode(false);
    }, 3000);
  };

  const handleSave = () => {
    const metrics = calculateSleepMetrics();
    if (!metrics) return;

    const entry: SleepEntry = {
      id: Date.now().toString(),
      goalId: profile.goalId,
      date: new Date(),
      bedtime: new Date(`${new Date().toDateString()} ${bedtime}`),
      sleepTime: new Date(`${new Date().toDateString()} ${bedtime}`),
      wakeTime: new Date(`${new Date().toDateString()} ${wakeTime}`),
      totalTimeInBed: metrics.totalTimeInBed,
      totalSleepTime: metrics.totalSleepTime,
      sleepEfficiency: metrics.sleepEfficiency,
      sleepScore: metrics.sleepScore,
      stages: metrics.stages,
      wakeUps,
      notes,
      mood,
      trackingMethod: isVoiceMode ? 'voice' : 'manual',
      createdAt: new Date()
    };

    onSleepLogged(entry);
  };

  const metrics = calculateSleepMetrics();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#161B22] rounded-2xl border border-[#2B3440] w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#2B3440]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#8B5CF6] rounded-xl flex items-center justify-center">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F3F4F6]">Log Sleep</h2>
                <p className="text-sm text-[#CBD5E1]">How did you sleep last night?</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-[#2B3440] hover:bg-[#0D1117] rounded-lg flex items-center justify-center text-[#CBD5E1] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sleep Score Preview */}
          {metrics && (
            <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#CBD5E1]">Sleep Score:</span>
                <span className="text-2xl font-bold text-[#8B5CF6]">{metrics.sleepScore}</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Voice Input */}
          <div className="mb-6">
            <button
              onClick={handleVoiceInput}
              disabled={isVoiceMode}
              className={`w-full flex items-center justify-center space-x-3 py-4 px-4 rounded-2xl font-medium transition-all duration-300 ${
                isVoiceMode 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
              }`}
            >
              <Mic className="w-5 h-5" />
              <span>{isVoiceMode ? 'Listening...' : 'Voice Log Sleep'}</span>
            </button>
            {isVoiceMode && (
              <p className="text-center text-sm text-[#CBD5E1] mt-2">
                Say something like: "I went to bed at 10:30 PM and woke up at 6:45 AM. I slept well with one wake-up."
              </p>
            )}
          </div>

          {/* Manual Input */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
                  Bedtime
                </label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
                  Wake Time
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>
            </div>

            {/* Sleep Quality */}
            <div>
              <label className="block text-sm font-medium text-[#F3F4F6] mb-3">
                Sleep Quality: {sleepQuality}/5
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setSleepQuality(rating)}
                    className={`w-8 h-8 rounded-full transition-colors ${
                      rating <= sleepQuality 
                        ? 'bg-[#F59E0B] text-white' 
                        : 'bg-[#2B3440] text-[#CBD5E1] hover:bg-[#0D1117]'
                    }`}
                  >
                    <Star className="w-4 h-4 mx-auto" />
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-[#CBD5E1] mt-1">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Wake-ups */}
            <div>
              <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
                Number of Wake-ups
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setWakeUps(Math.max(0, wakeUps - 1))}
                  className="w-10 h-10 bg-[#2B3440] hover:bg-[#0D1117] rounded-lg flex items-center justify-center text-[#F3F4F6] font-bold"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-[#F3F4F6]">{wakeUps}</div>
                  <div className="text-sm text-[#CBD5E1]">times</div>
                </div>
                <button
                  onClick={() => setWakeUps(wakeUps + 1)}
                  className="w-10 h-10 bg-[#2B3440] hover:bg-[#0D1117] rounded-lg flex items-center justify-center text-[#F3F4F6] font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Morning Mood */}
            <div>
              <label className="block text-sm font-medium text-[#F3F4F6] mb-3">
                How do you feel this morning?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'excellent', label: 'Excellent', emoji: '😊' },
                  { value: 'good', label: 'Good', emoji: '🙂' },
                  { value: 'fair', label: 'Fair', emoji: '😐' },
                  { value: 'poor', label: 'Poor', emoji: '😴' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMood(option.value as any)}
                    className={`p-3 rounded-xl font-medium transition-all text-center ${
                      mood === option.value
                        ? 'bg-[#8B5CF6] text-white'
                        : 'bg-[#0D1117] text-[#CBD5E1] hover:bg-[#2B3440]'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-sm">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any observations about your sleep..."
                rows={3}
                className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#8B5CF6] focus:outline-none resize-none"
              />
            </div>

            {/* Sleep Metrics Preview */}
            {metrics && (
              <div className="bg-[#161B22] rounded-xl p-4 border border-[#2B3440]">
                <h3 className="text-sm font-medium text-[#F3F4F6] mb-3">Sleep Summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-[#0D1117] rounded-lg">
                    <div className="text-lg font-bold text-[#8B5CF6]">
                      {Math.floor(metrics.totalSleepTime / 60)}h {metrics.totalSleepTime % 60}m
                    </div>
                    <div className="text-xs text-[#CBD5E1]">Sleep Time</div>
                  </div>
                  <div className="text-center p-2 bg-[#0D1117] rounded-lg">
                    <div className="text-lg font-bold text-[#10B981]">{metrics.sleepEfficiency}%</div>
                    <div className="text-xs text-[#CBD5E1]">Efficiency</div>
                  </div>
                </div>
              </div>
            )}
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
              disabled={!bedtime || !wakeTime}
              className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#2B3440] disabled:text-[#CBD5E1] disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Sleep Log</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};