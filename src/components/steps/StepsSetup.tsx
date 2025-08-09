import React, { useState } from 'react';
import { Footprints, Target, User, ArrowRight, TrendingUp } from 'lucide-react';
import { StepsProfile, ConnectedStepsDevice, StepsPreferences } from '../../types/steps';

interface StepsSetupProps {
  onComplete: (profile: StepsProfile) => void;
  userProfile: any;
  connectedDevices: ConnectedStepsDevice[];
}

export const StepsSetup: React.FC<StepsSetupProps> = ({
  onComplete,
  userProfile,
  connectedDevices
}) => {
  const [dailyStepTarget, setDailyStepTarget] = useState<number>(10000);
  const [baselineAverage, setBaselineAverage] = useState<number>(6500);
  const [strideLength, setStrideLength] = useState<number>(75); // cm
  const [adaptiveGoals, setAdaptiveGoals] = useState<boolean>(true);
  const [hourlyReminders, setHourlyReminders] = useState<boolean>(true);
  const [routeDiscovery, setRouteDiscovery] = useState<boolean>(true);
  const [challengesEnabled, setChallengesEnabled] = useState<boolean>(true);
  const [step, setStep] = useState<'baseline' | 'goals' | 'preferences' | 'review'>('baseline');

  // Calculate stride length based on height
  React.useEffect(() => {
    if (userProfile?.height) {
      const heightCm = userProfile.heightUnit === 'feet' 
        ? userProfile.height * 30.48 
        : userProfile.height;
      const calculatedStride = Math.round(heightCm * 0.43); // Average stride is 43% of height
      setStrideLength(calculatedStride);
    }
  }, [userProfile]);

  const calculateDistance = (steps: number) => {
    return ((steps * strideLength) / 100000).toFixed(2); // Convert to km
  };

  const calculateCalories = (steps: number) => {
    const weight = userProfile?.weight || 70; // Default 70kg
    const weightKg = userProfile?.weightUnit === 'pounds' ? weight * 0.453592 : weight;
    return Math.round(steps * 0.04 * (weightKg / 70)); // Rough calorie calculation
  };

  const getRecommendedTarget = () => {
    if (baselineAverage < 5000) return 7500;
    if (baselineAverage < 8000) return 10000;
    if (baselineAverage < 12000) return 12500;
    return 15000;
  };

  const handleComplete = () => {
    const preferences: StepsPreferences = {
      preferredWalkingTimes: ['07:00', '12:00', '18:00'],
      indoorAlternatives: true,
      weatherAdaptive: true,
      routeDiscovery,
      socialFeatures: false,
      challengesEnabled
    };

    const profile: StepsProfile = {
      id: Date.now().toString(),
      goalId: 'steps-goal',
      userId: 'current-user',
      dailyStepTarget,
      baselineAverage,
      strideLength,
      weight: userProfile?.weight || 70,
      trackingMethod: connectedDevices.length > 0 ? connectedDevices[0].type : 'manual',
      deviceSettings: {
        connectedDevices,
        primaryDevice: connectedDevices[0]?.id,
        autoDetectionEnabled: connectedDevices.length > 0,
        backgroundTrackingEnabled: true,
        hourlyRemindersEnabled: hourlyReminders,
        goalNotificationsEnabled: true,
        locationTrackingEnabled: routeDiscovery
      },
      preferences,
      adaptiveGoals,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onComplete(profile);
  };

  const renderBaseline = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#3B82F6] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Baseline Assessment</h2>
        <p className="text-[#CBD5E1]">Help us understand your current activity level</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-3">
          Current daily average: {baselineAverage.toLocaleString()} steps
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="2000"
            max="15000"
            step="500"
            value={baselineAverage}
            onChange={(e) => setBaselineAverage(Number(e.target.value))}
            className="w-full h-2 bg-[#2B3440] rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #10B981 0%, #10B981 ${((baselineAverage - 2000) / 13000) * 100}%, #2B3440 ${((baselineAverage - 2000) / 13000) * 100}%, #2B3440 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-[#CBD5E1]">
            <span>2k (Sedentary)</span>
            <span>8k (Active)</span>
            <span>15k (Very Active)</span>
          </div>
        </div>
      </div>

      <div className="bg-[#161B22] rounded-2xl p-4 border border-[#2B3440]">
        <h3 className="text-sm font-medium text-[#F3F4F6] mb-2">Based on your baseline:</h3>
        <div className="space-y-2 text-sm text-[#CBD5E1]">
          <div className="flex justify-between">
            <span>Recommended target:</span>
            <span className="font-semibold text-[#10B981]">{getRecommendedTarget().toLocaleString()} steps</span>
          </div>
          <div className="flex justify-between">
            <span>Daily distance:</span>
            <span className="font-semibold text-[#6BD0D2]">{calculateDistance(baselineAverage)} km</span>
          </div>
          <div className="flex justify-between">
            <span>Calories burned:</span>
            <span className="font-semibold text-[#F08A3E]">{calculateCalories(baselineAverage)} cal</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setStep('goals')}
        className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
      >
        <span>Next: Set Your Goal</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#10B981] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Daily Step Goal</h2>
        <p className="text-[#CBD5E1]">Set your target daily steps</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-3">
          Daily target: {dailyStepTarget.toLocaleString()} steps
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="5000"
            max="20000"
            step="500"
            value={dailyStepTarget}
            onChange={(e) => setDailyStepTarget(Number(e.target.value))}
            className="w-full h-2 bg-[#2B3440] rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #10B981 0%, #10B981 ${((dailyStepTarget - 5000) / 15000) * 100}%, #2B3440 ${((dailyStepTarget - 5000) / 15000) * 100}%, #2B3440 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-[#CBD5E1]">
            <span>5k</span>
            <span>10k (Recommended)</span>
            <span>20k</span>
          </div>
        </div>
      </div>

      {/* Goal Recommendations */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { steps: 8000, label: 'Moderate', desc: 'Good for beginners' },
          { steps: 10000, label: 'Standard', desc: 'WHO recommendation' },
          { steps: 12500, label: 'Active', desc: 'For fitness enthusiasts' }
        ].map((goal) => (
          <button
            key={goal.steps}
            onClick={() => setDailyStepTarget(goal.steps)}
            className={`p-3 rounded-xl text-center transition-all border-2 ${
              dailyStepTarget === goal.steps
                ? 'border-[#10B981] bg-[#10B981]/10'
                : 'border-[#2B3440] bg-[#161B22] hover:border-[#10B981]/50'
            }`}
          >
            <div className="text-lg font-bold text-[#F3F4F6]">{goal.steps.toLocaleString()}</div>
            <div className="text-xs font-medium text-[#10B981]">{goal.label}</div>
            <div className="text-xs text-[#CBD5E1]">{goal.desc}</div>
          </button>
        ))}
      </div>

      <div className="bg-[#161B22] rounded-2xl p-4 border border-[#2B3440]">
        <h3 className="text-sm font-medium text-[#F3F4F6] mb-2">Your Goal Impact:</h3>
        <div className="space-y-2 text-sm text-[#CBD5E1]">
          <div className="flex justify-between">
            <span>Daily distance:</span>
            <span className="font-semibold text-[#6BD0D2]">{calculateDistance(dailyStepTarget)} km</span>
          </div>
          <div className="flex justify-between">
            <span>Calories burned:</span>
            <span className="font-semibold text-[#F08A3E]">{calculateCalories(dailyStepTarget)} cal</span>
          </div>
          <div className="flex justify-between">
            <span>Weekly increase:</span>
            <span className="font-semibold text-[#10B981]">
              +{((dailyStepTarget - baselineAverage) * 7).toLocaleString()} steps
            </span>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep('baseline')}
          className="flex-1 bg-[#161B22] hover:bg-[#2B3440] text-[#CBD5E1] font-semibold py-3 px-4 rounded-xl transition-all"
        >
          Back
        </button>
        <button
          onClick={() => setStep('preferences')}
          className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
        >
          <span>Next: Preferences</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#6BD0D2] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Step Preferences</h2>
        <p className="text-[#CBD5E1]">Customize your step tracking experience</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-[#161B22] rounded-xl border border-[#2B3440]">
          <div>
            <h4 className="font-medium text-[#F3F4F6]">Adaptive Goals</h4>
            <p className="text-sm text-[#CBD5E1]">Gradually increase targets based on progress</p>
          </div>
          <button
            onClick={() => setAdaptiveGoals(!adaptiveGoals)}
            className={`w-12 h-6 rounded-full transition-all ${
              adaptiveGoals ? 'bg-[#10B981]' : 'bg-[#2B3440]'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-all ${
              adaptiveGoals ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#161B22] rounded-xl border border-[#2B3440]">
          <div>
            <h4 className="font-medium text-[#F3F4F6]">Hourly Reminders</h4>
            <p className="text-sm text-[#CBD5E1]">Get reminded to move every hour</p>
          </div>
          <button
            onClick={() => setHourlyReminders(!hourlyReminders)}
            className={`w-12 h-6 rounded-full transition-all ${
              hourlyReminders ? 'bg-[#10B981]' : 'bg-[#2B3440]'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-all ${
              hourlyReminders ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#161B22] rounded-xl border border-[#2B3440]">
          <div>
            <h4 className="font-medium text-[#F3F4F6]">Route Discovery</h4>
            <p className="text-sm text-[#CBD5E1]">Discover new walking paths and routes</p>
          </div>
          <button
            onClick={() => setRouteDiscovery(!routeDiscovery)}
            className={`w-12 h-6 rounded-full transition-all ${
              routeDiscovery ? 'bg-[#10B981]' : 'bg-[#2B3440]'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-all ${
              routeDiscovery ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#161B22] rounded-xl border border-[#2B3440]">
          <div>
            <h4 className="font-medium text-[#F3F4F6]">Daily Challenges</h4>
            <p className="text-sm text-[#CBD5E1]">Fun challenges to boost motivation</p>
          </div>
          <button
            onClick={() => setChallengesEnabled(!challengesEnabled)}
            className={`w-12 h-6 rounded-full transition-all ${
              challengesEnabled ? 'bg-[#10B981]' : 'bg-[#2B3440]'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-all ${
              challengesEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-3">
          Stride length: {strideLength} cm
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="60"
            max="90"
            value={strideLength}
            onChange={(e) => setStrideLength(Number(e.target.value))}
            className="w-full h-2 bg-[#2B3440] rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #6BD0D2 0%, #6BD0D2 ${((strideLength - 60) / 30) * 100}%, #2B3440 ${((strideLength - 60) / 30) * 100}%, #2B3440 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-[#CBD5E1]">
            <span>60cm (Short)</span>
            <span>75cm (Average)</span>
            <span>90cm (Long)</span>
          </div>
        </div>
        <p className="text-xs text-[#CBD5E1] mt-1">
          Affects distance and calorie calculations
        </p>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep('baseline')}
          className="flex-1 bg-[#161B22] hover:bg-[#2B3440] text-[#CBD5E1] font-semibold py-3 px-4 rounded-xl transition-all"
        >
          Back
        </button>
        <button
          onClick={() => setStep('review')}
          className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
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
          <Footprints className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Steps Plan Ready</h2>
        <p className="text-[#CBD5E1]">Review your personalized step tracking plan</p>
      </div>

      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">Daily Goal</h3>
        <div className="text-center p-4 bg-[#0D1117] rounded-xl">
          <div className="text-4xl font-bold text-[#10B981] mb-2">
            {dailyStepTarget.toLocaleString()}
          </div>
          <div className="text-sm text-[#CBD5E1]">steps per day</div>
          <div className="text-xs text-[#6BD0D2] mt-1">
            {calculateDistance(dailyStepTarget)} km • {calculateCalories(dailyStepTarget)} calories
          </div>
        </div>
      </div>

      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">Tracking Setup</h3>
        {connectedDevices.length > 0 ? (
          <div className="space-y-2">
            {connectedDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 bg-[#0D1117] rounded-xl">
                <span className="text-[#F3F4F6]">{device.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-[#10B981] capitalize">{device.accuracy}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-[#0D1117] rounded-xl">
            <span className="text-[#F3F4F6]">Manual logging with voice input</span>
          </div>
        )}
      </div>

      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">Features Enabled</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[#CBD5E1]">Adaptive Goals</span>
            <span className={`text-sm font-medium ${adaptiveGoals ? 'text-[#10B981]' : 'text-[#CBD5E1]'}`}>
              {adaptiveGoals ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#CBD5E1]">Hourly Reminders</span>
            <span className={`text-sm font-medium ${hourlyReminders ? 'text-[#10B981]' : 'text-[#CBD5E1]'}`}>
              {hourlyReminders ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#CBD5E1]">Route Discovery</span>
            <span className={`text-sm font-medium ${routeDiscovery ? 'text-[#10B981]' : 'text-[#CBD5E1]'}`}>
              {routeDiscovery ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#CBD5E1]">Daily Challenges</span>
            <span className={`text-sm font-medium ${challengesEnabled ? 'text-[#10B981]' : 'text-[#CBD5E1]'}`}>
              {challengesEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl p-4">
        <h3 className="text-sm font-medium text-[#10B981] mb-2">What's Next?</h3>
        <ul className="text-sm text-[#F3F4F6] space-y-1">
          <li>• Start your 7-day baseline tracking period</li>
          <li>• Receive personalized step reminders</li>
          <li>• Get daily challenges and route suggestions</li>
          <li>• Track progress with detailed analytics</li>
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
          <Footprints className="w-5 h-5" />
          <span>Start Step Tracking</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0D1117] py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          {step === 'baseline' && renderBaseline()}
          {step === 'goals' && renderGoals()}
          {step === 'preferences' && renderPreferences()}
          {step === 'review' && renderReview()}
        </div>
      </div>
    </div>
  );
};