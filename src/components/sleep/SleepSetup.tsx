import React, { useState } from 'react';
import { Moon, Clock, Target, ArrowRight, Settings } from 'lucide-react';
import { SleepProfile, SleepPreferences, ConnectedSleepDevice } from '../../types/sleep';

interface SleepSetupProps {
  onComplete: (profile: SleepProfile) => void;
  userProfile: any;
  connectedDevices: ConnectedSleepDevice[];
}

export const SleepSetup: React.FC<SleepSetupProps> = ({
  onComplete,
  userProfile,
  connectedDevices
}) => {
  const [targetSleepHours, setTargetSleepHours] = useState<number>(8);
  const [targetBedtime, setTargetBedtime] = useState<string>('22:30');
  const [targetWakeTime, setTargetWakeTime] = useState<string>('06:30');
  const [roomTemperature, setRoomTemperature] = useState<number>(67);
  const [caffeineTime, setCaffeineTime] = useState<string>('14:00');
  const [screenTimeLimit, setScreenTimeLimit] = useState<number>(1);
  const [step, setStep] = useState<'goals' | 'preferences' | 'review'>('goals');

  const calculateWakeTime = (bedtime: string, hours: number) => {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const bedDate = new Date();
    bedDate.setHours(bedHour, bedMin, 0, 0);
    
    const wakeDate = new Date(bedDate.getTime() + (hours * 60 * 60 * 1000));
    
    // If wake time is next day
    if (wakeDate.getDate() !== bedDate.getDate()) {
      return `${wakeDate.getHours().toString().padStart(2, '0')}:${wakeDate.getMinutes().toString().padStart(2, '0')}`;
    }
    
    return `${wakeDate.getHours().toString().padStart(2, '0')}:${wakeDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleBedtimeChange = (bedtime: string) => {
    setTargetBedtime(bedtime);
    setTargetWakeTime(calculateWakeTime(bedtime, targetSleepHours));
  };

  const handleSleepHoursChange = (hours: number) => {
    setTargetSleepHours(hours);
    setTargetWakeTime(calculateWakeTime(targetBedtime, hours));
  };

  const handleComplete = () => {
    const preferences: SleepPreferences = {
      roomTemperature,
      noiseLevel: 'silent',
      lightLevel: 'complete_darkness',
      caffeineTimeLimit: caffeineTime,
      screenTimeLimit,
      exerciseTimeLimit: 3
    };

    const profile: SleepProfile = {
      id: Date.now().toString(),
      goalId: 'sleep-goal',
      userId: 'current-user',
      targetSleepHours,
      targetBedtime,
      targetWakeTime,
      trackingMethod: connectedDevices.length > 0 ? connectedDevices[0].type : 'manual',
      deviceSettings: {
        connectedDevices,
        primaryDevice: connectedDevices[0]?.id,
        autoDetectionEnabled: connectedDevices.length > 0,
        smartAlarmEnabled: true,
        bedtimeRemindersEnabled: true,
        reminderTime: 30
      },
      preferences,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onComplete(profile);
  };

  const renderGoals = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#8B5CF6] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Sleep Goals</h2>
        <p className="text-[#CBD5E1]">Set your ideal sleep schedule</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-3">
          Target Sleep Duration: {targetSleepHours} hours
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="6"
            max="10"
            step="0.5"
            value={targetSleepHours}
            onChange={(e) => handleSleepHoursChange(Number(e.target.value))}
            className="w-full h-2 bg-[#2B3440] rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${((targetSleepHours - 6) / 4) * 100}%, #2B3440 ${((targetSleepHours - 6) / 4) * 100}%, #2B3440 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-[#CBD5E1]">
            <span>6h</span>
            <span>8h (Recommended)</span>
            <span>10h</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
            Bedtime
          </label>
          <input
            type="time"
            value={targetBedtime}
            onChange={(e) => handleBedtimeChange(e.target.value)}
            className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] focus:border-[#8B5CF6] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
            Wake Time
          </label>
          <input
            type="time"
            value={targetWakeTime}
            onChange={(e) => setTargetWakeTime(e.target.value)}
            className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] focus:border-[#8B5CF6] focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-[#161B22] rounded-2xl p-4 border border-[#2B3440]">
        <h3 className="text-sm font-medium text-[#F3F4F6] mb-2">Sleep Schedule Preview</h3>
        <div className="text-sm text-[#CBD5E1]">
          <p>• Bedtime: {targetBedtime}</p>
          <p>• Wake time: {targetWakeTime}</p>
          <p>• Sleep duration: {targetSleepHours} hours</p>
          <p>• Bedtime reminder: {targetBedtime.split(':').map((t, i) => i === 1 ? String(Number(t) - 30).padStart(2, '0') : t).join(':')}</p>
        </div>
      </div>

      <button
        onClick={() => setStep('preferences')}
        className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
      >
        <span>Next: Sleep Environment</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#10B981] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Sleep Environment</h2>
        <p className="text-[#CBD5E1]">Optimize your sleep conditions</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-3">
          Room Temperature: {roomTemperature}°F
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="60"
            max="75"
            value={roomTemperature}
            onChange={(e) => setRoomTemperature(Number(e.target.value))}
            className="w-full h-2 bg-[#2B3440] rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #10B981 0%, #10B981 ${((roomTemperature - 60) / 15) * 100}%, #2B3440 ${((roomTemperature - 60) / 15) * 100}%, #2B3440 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-[#CBD5E1]">
            <span>60°F</span>
            <span>65-68°F (Optimal)</span>
            <span>75°F</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
          Caffeine Cutoff Time
        </label>
        <input
          type="time"
          value={caffeineTime}
          onChange={(e) => setCaffeineTime(e.target.value)}
          className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] focus:border-[#8B5CF6] focus:outline-none"
        />
        <p className="text-xs text-[#CBD5E1] mt-1">Avoid caffeine after this time</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-3">
          Screen Time Limit: {screenTimeLimit} hour{screenTimeLimit !== 1 ? 's' : ''} before bed
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={screenTimeLimit}
            onChange={(e) => setScreenTimeLimit(Number(e.target.value))}
            className="w-full h-2 bg-[#2B3440] rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${((screenTimeLimit - 0.5) / 2.5) * 100}%, #2B3440 ${((screenTimeLimit - 0.5) / 2.5) * 100}%, #2B3440 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-[#CBD5E1]">
            <span>30min</span>
            <span>1h (Recommended)</span>
            <span>3h</span>
          </div>
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
          className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
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
          <Moon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Sleep Plan Ready</h2>
        <p className="text-[#CBD5E1]">Review your personalized sleep improvement plan</p>
      </div>

      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">Sleep Schedule</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <Clock className="w-6 h-6 text-[#8B5CF6] mx-auto mb-2" />
            <div className="text-lg font-bold text-[#F3F4F6]">{targetBedtime}</div>
            <div className="text-sm text-[#CBD5E1]">Bedtime</div>
          </div>
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-lg font-bold text-[#F3F4F6]">{targetWakeTime}</div>
            <div className="text-sm text-[#CBD5E1]">Wake Time</div>
          </div>
        </div>
        <div className="mt-4 text-center p-3 bg-[#0D1117] rounded-xl">
          <div className="text-2xl font-bold text-[#10B981]">{targetSleepHours}h</div>
          <div className="text-sm text-[#CBD5E1]">Target Sleep</div>
        </div>
      </div>

      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">Environment Settings</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[#CBD5E1]">Room Temperature</span>
            <span className="font-semibold text-[#F3F4F6]">{roomTemperature}°F</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#CBD5E1]">Caffeine Cutoff</span>
            <span className="font-semibold text-[#F3F4F6]">{caffeineTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#CBD5E1]">Screen Time Limit</span>
            <span className="font-semibold text-[#F3F4F6]">{screenTimeLimit}h before bed</span>
          </div>
        </div>
      </div>

      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">Tracking Method</h3>
        {connectedDevices.length > 0 ? (
          <div className="space-y-2">
            {connectedDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 bg-[#0D1117] rounded-xl">
                <span className="text-[#F3F4F6]">{device.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-400">Connected</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-[#0D1117] rounded-xl">
            <span className="text-[#F3F4F6]">Manual logging with AI assistance</span>
          </div>
        )}
      </div>

      <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-2xl p-4">
        <h3 className="text-sm font-medium text-[#8B5CF6] mb-2">What's Next?</h3>
        <ul className="text-sm text-[#F3F4F6] space-y-1">
          <li>• Start your 3-night baseline tracking period</li>
          <li>• Receive personalized bedtime reminders</li>
          <li>• Get daily sleep scores and insights</li>
          <li>• Track improvements over time</li>
        </ul>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep('preferences')}
          className="flex-1 bg-[#161B22] hover:bg-[#2B3440] text-[#CBD5E1] font-semibold py-3 px-4 rounded-xl transition-all"
        >
          Back
        </button>
        <button
          onClick={handleComplete}
          className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
        >
          <Moon className="w-5 h-5" />
          <span>Start Sleep Tracking</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0D1117] py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          {step === 'goals' && renderGoals()}
          {step === 'preferences' && renderPreferences()}
          {step === 'review' && renderReview()}
        </div>
      </div>
    </div>
  );
};