import React, { useState } from 'react';
import { Heart, User, Target, ArrowRight, Activity } from 'lucide-react';
import { CardioProfile, HeartRateZones, ActivityProfile, ConnectedDevice } from '../../types/cardio';

interface CardioSetupProps {
  onComplete: (profile: CardioProfile) => void;
  userProfile: any;
  connectedDevices: ConnectedDevice[];
}

export const CardioSetup: React.FC<CardioSetupProps> = ({
  onComplete,
  userProfile,
  connectedDevices
}) => {
  const [age, setAge] = useState<string>(userProfile?.age?.toString() || '');
  const [restingHR, setRestingHR] = useState<string>('');
  const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [fitnessObjective, setFitnessObjective] = useState<'fat_burn' | 'endurance' | 'performance' | 'recovery'>('endurance');
  const [step, setStep] = useState<'basic' | 'zones' | 'activities' | 'review'>('basic');
  const [customMaxHR, setCustomMaxHR] = useState<string>('');
  const [useCustomMaxHR, setUseCustomMaxHR] = useState(false);

  const calculateMaxHR = () => {
    if (useCustomMaxHR && customMaxHR) {
      return parseInt(customMaxHR);
    }
    return 220 - parseInt(age || '25');
  };

  const calculateZones = (maxHR: number, restingHRValue: number): HeartRateZones => {
    const hrReserve = maxHR - restingHRValue;
    
    return {
      zone1: { 
        min: Math.round(restingHRValue + (hrReserve * 0.50)), 
        max: Math.round(restingHRValue + (hrReserve * 0.60)), 
        name: 'Recovery', 
        color: '#10B981' 
      },
      zone2: { 
        min: Math.round(restingHRValue + (hrReserve * 0.60)), 
        max: Math.round(restingHRValue + (hrReserve * 0.70)), 
        name: 'Fat Burn', 
        color: '#3B82F6' 
      },
      zone3: { 
        min: Math.round(restingHRValue + (hrReserve * 0.70)), 
        max: Math.round(restingHRValue + (hrReserve * 0.80)), 
        name: 'Aerobic', 
        color: '#F59E0B' 
      },
      zone4: { 
        min: Math.round(restingHRValue + (hrReserve * 0.80)), 
        max: Math.round(restingHRValue + (hrReserve * 0.90)), 
        name: 'Threshold', 
        color: '#EF4444' 
      },
      zone5: { 
        min: Math.round(restingHRValue + (hrReserve * 0.90)), 
        max: maxHR, 
        name: 'Max', 
        color: '#7C2D12' 
      }
    };
  };

  const getDefaultActivities = (): ActivityProfile[] => {
    const baseActivities = [
      {
        id: 'running',
        name: 'Running',
        type: 'running' as const,
        targetZones: fitnessObjective === 'fat_burn' ? [2, 3] : fitnessObjective === 'endurance' ? [3, 4] : [4, 5],
        duration: 30,
        intensity: 'moderate' as const
      },
      {
        id: 'cycling',
        name: 'Cycling',
        type: 'cycling' as const,
        targetZones: fitnessObjective === 'fat_burn' ? [2, 3] : fitnessObjective === 'endurance' ? [3, 4] : [4, 5],
        duration: 45,
        intensity: 'moderate' as const
      },
      {
        id: 'walking',
        name: 'Walking',
        type: 'walking' as const,
        targetZones: [1, 2],
        duration: 30,
        intensity: 'low' as const
      }
    ];

    return baseActivities;
  };

  const handleComplete = () => {
    const maxHR = calculateMaxHR();
    const restingHRValue = parseInt(restingHR || '60');
    const zones = calculateZones(maxHR, restingHRValue);
    const activities = getDefaultActivities();

    const profile: CardioProfile = {
      id: Date.now().toString(),
      goalId: 'cardio-goal',
      userId: 'current-user',
      age: parseInt(age),
      restingHeartRate: restingHRValue,
      maxHeartRate: maxHR,
      zones,
      activityProfiles: activities,
      deviceSettings: {
        connectedDevices,
        primaryDevice: connectedDevices[0]?.id,
        syncEnabled: true,
        alertsEnabled: true
      },
      fitnessObjective,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onComplete(profile);
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#EF4444] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Cardio Profile Setup</h2>
        <p className="text-[#CBD5E1]">Let's personalize your heart rate zones</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-2">Age</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="25"
          className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#EF4444] focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-2">Resting Heart Rate</label>
        <input
          type="number"
          value={restingHR}
          onChange={(e) => setRestingHR(e.target.value)}
          placeholder="60"
          className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#EF4444] focus:outline-none"
        />
        <p className="text-xs text-[#CBD5E1] mt-1">Measure first thing in the morning before getting up</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-3">Fitness Level</label>
        <div className="grid grid-cols-3 gap-3">
          {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFitnessLevel(level)}
              className={`px-4 py-3 rounded-xl font-medium transition-all capitalize ${
                fitnessLevel === level
                  ? 'bg-[#EF4444] text-white'
                  : 'bg-[#161B22] text-[#CBD5E1] hover:bg-[#2B3440]'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-3">Primary Goal</label>
        <div className="space-y-2">
          {[
            { value: 'fat_burn', label: 'Fat Burning', desc: 'Optimize for weight loss' },
            { value: 'endurance', label: 'Endurance', desc: 'Build cardiovascular fitness' },
            { value: 'performance', label: 'Performance', desc: 'Improve speed and power' },
            { value: 'recovery', label: 'Recovery', desc: 'Active recovery and health' }
          ].map((goal) => (
            <button
              key={goal.value}
              onClick={() => setFitnessObjective(goal.value as any)}
              className={`w-full p-3 rounded-xl text-left transition-all border-2 ${
                fitnessObjective === goal.value
                  ? 'border-[#EF4444] bg-[#EF4444]/10'
                  : 'border-[#2B3440] bg-[#161B22] hover:border-[#EF4444]/50'
              }`}
            >
              <div className="font-medium text-[#F3F4F6]">{goal.label}</div>
              <div className="text-sm text-[#CBD5E1]">{goal.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setStep('zones')}
        disabled={!age || !restingHR}
        className="w-full bg-[#EF4444] hover:bg-[#DC2626] disabled:bg-[#2B3440] disabled:text-[#CBD5E1] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
      >
        <span>Next: Heart Rate Zones</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderZones = () => {
    const maxHR = calculateMaxHR();
    const restingHRValue = parseInt(restingHR || '60');
    const zones = calculateZones(maxHR, restingHRValue);

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#3B82F6] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Your Heart Rate Zones</h2>
          <p className="text-[#CBD5E1]">Based on your age and resting heart rate</p>
        </div>

        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#CBD5E1]">Max Heart Rate</span>
            <span className="text-2xl font-bold text-[#F3F4F6]">{maxHR} BPM</span>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              checked={useCustomMaxHR}
              onChange={(e) => setUseCustomMaxHR(e.target.checked)}
              className="w-4 h-4 text-[#EF4444] bg-[#0D1117] border-[#2B3440] rounded focus:ring-[#EF4444]"
            />
            <label className="text-sm text-[#CBD5E1]">Use custom max HR</label>
          </div>
          
          {useCustomMaxHR && (
            <input
              type="number"
              value={customMaxHR}
              onChange={(e) => setCustomMaxHR(e.target.value)}
              placeholder="Enter max HR"
              className="w-full px-3 py-2 bg-[#0D1117] border border-[#2B3440] rounded-lg text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#EF4444] focus:outline-none mb-4"
            />
          )}
        </div>

        <div className="space-y-3">
          {Object.entries(zones).map(([key, zone]) => (
            <div key={key} className="bg-[#161B22] rounded-xl p-4 border border-[#2B3440]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: zone.color }}
                  />
                  <div>
                    <div className="font-medium text-[#F3F4F6]">Zone {key.slice(-1)} - {zone.name}</div>
                    <div className="text-sm text-[#CBD5E1]">{zone.min} - {zone.max} BPM</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: zone.color }}>
                    {Math.round(((zone.min + zone.max) / 2 / maxHR) * 100)}%
                  </div>
                  <div className="text-xs text-[#CBD5E1]">Max HR</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setStep('basic')}
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
  };

  const renderReview = () => {
    const maxHR = calculateMaxHR();
    const restingHRValue = parseInt(restingHR || '60');
    const zones = calculateZones(maxHR, restingHRValue);

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#10B981] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Setup Complete</h2>
          <p className="text-[#CBD5E1]">Review your cardio profile</p>
        </div>

        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">Profile Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-[#0D1117] rounded-xl">
              <div className="text-2xl font-bold text-[#EF4444]">{maxHR}</div>
              <div className="text-sm text-[#CBD5E1]">Max HR</div>
            </div>
            <div className="text-center p-3 bg-[#0D1117] rounded-xl">
              <div className="text-2xl font-bold text-[#3B82F6]">{restingHRValue}</div>
              <div className="text-sm text-[#CBD5E1]">Resting HR</div>
            </div>
          </div>
        </div>

        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">Connected Devices</h3>
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
            <p className="text-[#CBD5E1]">No devices connected - you can add them later</p>
          )}
        </div>

        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">Target Zones</h3>
          <p className="text-[#CBD5E1] mb-3">Based on your {fitnessObjective.replace('_', ' ')} goal:</p>
          <div className="flex space-x-2">
            {fitnessObjective === 'fat_burn' && (
              <>
                <div className="px-3 py-1 bg-[#3B82F6]/20 text-[#3B82F6] rounded-full text-sm">Zone 2</div>
                <div className="px-3 py-1 bg-[#F59E0B]/20 text-[#F59E0B] rounded-full text-sm">Zone 3</div>
              </>
            )}
            {fitnessObjective === 'endurance' && (
              <>
                <div className="px-3 py-1 bg-[#F59E0B]/20 text-[#F59E0B] rounded-full text-sm">Zone 3</div>
                <div className="px-3 py-1 bg-[#EF4444]/20 text-[#EF4444] rounded-full text-sm">Zone 4</div>
              </>
            )}
            {fitnessObjective === 'performance' && (
              <>
                <div className="px-3 py-1 bg-[#EF4444]/20 text-[#EF4444] rounded-full text-sm">Zone 4</div>
                <div className="px-3 py-1 bg-[#7C2D12]/20 text-[#7C2D12] rounded-full text-sm">Zone 5</div>
              </>
            )}
            {fitnessObjective === 'recovery' && (
              <>
                <div className="px-3 py-1 bg-[#10B981]/20 text-[#10B981] rounded-full text-sm">Zone 1</div>
                <div className="px-3 py-1 bg-[#3B82F6]/20 text-[#3B82F6] rounded-full text-sm">Zone 2</div>
              </>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setStep('zones')}
            className="flex-1 bg-[#161B22] hover:bg-[#2B3440] text-[#CBD5E1] font-semibold py-3 px-4 rounded-xl transition-all"
          >
            Back
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <Heart className="w-5 h-5" />
            <span>Start Training</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0D1117] py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          {step === 'basic' && renderBasicInfo()}
          {step === 'zones' && renderZones()}
          {step === 'review' && renderReview()}
        </div>
      </div>
    </div>
  );
};