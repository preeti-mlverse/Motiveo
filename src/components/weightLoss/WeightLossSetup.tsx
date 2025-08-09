import React, { useState } from 'react';
import { Target, User, Calendar, ArrowRight } from 'lucide-react';
import { CalorieCalculator } from '../../utils/calorieCalculator';
import { WeightLossProfile, DietaryPreferences } from '../../types/weightLoss';

interface WeightLossSetupProps {
  onComplete: (profile: WeightLossProfile) => void;
  userProfile: any;
}

export const WeightLossSetup: React.FC<WeightLossSetupProps> = ({ onComplete, userProfile }) => {
  const [currentWeight, setCurrentWeight] = useState<string>('');
  const [targetWeight, setTargetWeight] = useState<string>('');
  const [timelineWeeks, setTimelineWeeks] = useState<string>('12');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [activityLevel, setActivityLevel] = useState<string>('moderately_active');
  const [dietaryType, setDietaryType] = useState<'vegetarian' | 'non_vegetarian' | 'eggetarian'>('vegetarian');
  const [allergies, setAllergies] = useState<string>('');
  const [dislikes, setDislikes] = useState<string>('');
  const [step, setStep] = useState<'basic' | 'dietary' | 'review'>('basic');

  const handleBasicInfoNext = () => {
    if (currentWeight && targetWeight && timelineWeeks) {
      setStep('dietary');
    }
  };

  const handleDietaryNext = () => {
    setStep('review');
  };

  const handleComplete = () => {
    const current = parseFloat(currentWeight);
    const target = parseFloat(targetWeight);
    const weeks = parseInt(timelineWeeks);
    const height = userProfile?.height || 165; // Default height if not provided
    const age = userProfile?.age || 25; // Default age if not provided

    const calorieData = CalorieCalculator.calculateDailyCalorieTarget(
      current,
      target,
      height,
      age,
      gender,
      activityLevel,
      weeks
    );

    const proteinGoal = CalorieCalculator.calculateProteinGoal(current, activityLevel);

    const dietaryPreferences: DietaryPreferences = {
      type: dietaryType,
      allergies: allergies.split(',').map(a => a.trim()).filter(a => a),
      dislikes: dislikes.split(',').map(d => d.trim()).filter(d => d),
      preferredFoods: []
    };

    const profile: WeightLossProfile = {
      id: Date.now().toString(),
      goalId: 'weight-loss-goal',
      currentWeight: current,
      targetWeight: target,
      weeklyLossRate: calorieData.weeklyLossRate,
      dailyCalorieTarget: calorieData.dailyCalories,
      proteinGoalGrams: proteinGoal,
      dietaryPreferences,
      gender,
      activityLevel: activityLevel as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onComplete(profile);
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#F08A3E] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Weight Loss Goal</h2>
        <p className="text-[#CBD5E1]">Let's set up your personalized weight loss plan</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
            Current Weight
          </label>
          <div className="flex">
            <input
              type="number"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              placeholder="70"
              className="flex-1 px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-l-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#F08A3E] focus:outline-none"
            />
            <div className="px-4 py-3 bg-[#2B3440] border border-[#2B3440] rounded-r-xl text-[#CBD5E1] text-sm">
              {userProfile?.weightUnit || 'kg'}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
            Target Weight
          </label>
          <div className="flex">
            <input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              placeholder="65"
              className="flex-1 px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-l-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#F08A3E] focus:outline-none"
            />
            <div className="px-4 py-3 bg-[#2B3440] border border-[#2B3440] rounded-r-xl text-[#CBD5E1] text-sm">
              {userProfile?.weightUnit || 'kg'}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
          Timeline (weeks)
        </label>
        <select
          value={timelineWeeks}
          onChange={(e) => setTimelineWeeks(e.target.value)}
          className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] focus:border-[#F08A3E] focus:outline-none"
        >
          <option value="8">8 weeks (Aggressive)</option>
          <option value="12">12 weeks (Recommended)</option>
          <option value="16">16 weeks (Gradual)</option>
          <option value="24">24 weeks (Very Gradual)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
          Gender
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['male', 'female', 'other'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setGender(option)}
              className={`
                px-4 py-3 rounded-xl font-medium transition-all capitalize
                ${gender === option
                  ? 'bg-[#F08A3E] text-white'
                  : 'bg-[#161B22] text-[#CBD5E1] hover:bg-[#2B3440]'
                }
              `}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
          Activity Level
        </label>
        <select
          value={activityLevel}
          onChange={(e) => setActivityLevel(e.target.value)}
          className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] focus:border-[#F08A3E] focus:outline-none"
        >
          <option value="sedentary">Sedentary (Little/no exercise)</option>
          <option value="lightly_active">Lightly Active (Light exercise 1-3 days/week)</option>
          <option value="moderately_active">Moderately Active (Moderate exercise 3-5 days/week)</option>
          <option value="very_active">Very Active (Hard exercise 6-7 days/week)</option>
          <option value="extremely_active">Extremely Active (Very hard exercise, physical job)</option>
        </select>
      </div>

      <button
        onClick={handleBasicInfoNext}
        disabled={!currentWeight || !targetWeight || !timelineWeeks}
        className="w-full bg-[#F08A3E] hover:bg-[#E17226] disabled:bg-[#2B3440] disabled:text-[#CBD5E1] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
      >
        <span>Next: Dietary Preferences</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderDietaryPreferences = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#6BD0D2] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Dietary Preferences</h2>
        <p className="text-[#CBD5E1]">Help us personalize your meal suggestions</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-3">
          Dietary Type
        </label>
        <div className="grid grid-cols-1 gap-3">
          {([
            { value: 'vegetarian', label: 'Vegetarian', desc: 'Plant-based foods, dairy products' },
            { value: 'non_vegetarian', label: 'Non-Vegetarian', desc: 'All foods including meat and fish' },
            { value: 'eggetarian', label: 'Eggetarian', desc: 'Vegetarian diet including eggs' }
          ] as const).map((option) => (
            <button
              key={option.value}
              onClick={() => setDietaryType(option.value)}
              className={`
                p-4 rounded-xl text-left transition-all border-2
                ${dietaryType === option.value
                  ? 'border-[#F08A3E] bg-[#F08A3E]/10'
                  : 'border-[#2B3440] bg-[#161B22] hover:border-[#F08A3E]/50'
                }
              `}
            >
              <div className="font-medium text-[#F3F4F6]">{option.label}</div>
              <div className="text-sm text-[#CBD5E1] mt-1">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
          Food Allergies (Optional)
        </label>
        <input
          type="text"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          placeholder="e.g., nuts, dairy, gluten (comma separated)"
          className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#F08A3E] focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
          Foods You Dislike (Optional)
        </label>
        <input
          type="text"
          value={dislikes}
          onChange={(e) => setDislikes(e.target.value)}
          placeholder="e.g., broccoli, fish, spicy food (comma separated)"
          className="w-full px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#F08A3E] focus:outline-none"
        />
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep('basic')}
          className="flex-1 bg-[#161B22] hover:bg-[#2B3440] text-[#CBD5E1] font-semibold py-3 px-4 rounded-xl transition-all"
        >
          Back
        </button>
        <button
          onClick={handleDietaryNext}
          className="flex-1 bg-[#F08A3E] hover:bg-[#E17226] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
        >
          <span>Review Plan</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderReview = () => {
    const current = parseFloat(currentWeight);
    const target = parseFloat(targetWeight);
    const weeks = parseInt(timelineWeeks);
    const height = userProfile?.height || 165;
    const age = userProfile?.age || 25;

    const calorieData = CalorieCalculator.calculateDailyCalorieTarget(
      current, target, height, age, gender, activityLevel, weeks
    );

    const proteinGoal = CalorieCalculator.calculateProteinGoal(current, activityLevel);
    const mealDistribution = CalorieCalculator.distributeMealCalories(calorieData.dailyCalories);

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#4BE0D1] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Your Personalized Plan</h2>
          <p className="text-[#CBD5E1]">Review your weight loss strategy</p>
        </div>

        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">Goal Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-[#0D1117] rounded-xl">
              <div className="text-2xl font-bold text-[#F08A3E]">{current - target}</div>
              <div className="text-sm text-[#CBD5E1]">{userProfile?.weightUnit || 'kg'} to lose</div>
            </div>
            <div className="text-center p-3 bg-[#0D1117] rounded-xl">
              <div className="text-2xl font-bold text-[#6BD0D2]">{weeks}</div>
              <div className="text-sm text-[#CBD5E1]">weeks timeline</div>
            </div>
          </div>
        </div>

        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">Daily Targets</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#CBD5E1]">Daily Calories</span>
              <span className="font-semibold text-[#F3F4F6]">{calorieData.dailyCalories} cal</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#CBD5E1]">Protein Goal</span>
              <span className="font-semibold text-[#F3F4F6]">{proteinGoal}g</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#CBD5E1]">Weekly Loss Rate</span>
              <span className="font-semibold text-[#F3F4F6]">{calorieData.weeklyLossRate} {userProfile?.weightUnit || 'kg'}/week</span>
            </div>
          </div>
        </div>

        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">Meal Distribution</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-[#0D1117] rounded-xl">
              <div className="text-lg font-bold text-[#F8B84E]">{mealDistribution.breakfast}</div>
              <div className="text-sm text-[#CBD5E1]">Breakfast</div>
            </div>
            <div className="text-center p-3 bg-[#0D1117] rounded-xl">
              <div className="text-lg font-bold text-[#F8B84E]">{mealDistribution.lunch}</div>
              <div className="text-sm text-[#CBD5E1]">Lunch</div>
            </div>
            <div className="text-center p-3 bg-[#0D1117] rounded-xl">
              <div className="text-lg font-bold text-[#F8B84E]">{mealDistribution.dinner}</div>
              <div className="text-sm text-[#CBD5E1]">Dinner</div>
            </div>
            <div className="text-center p-3 bg-[#0D1117] rounded-xl">
              <div className="text-lg font-bold text-[#F8B84E]">{mealDistribution.snack}</div>
              <div className="text-sm text-[#CBD5E1]">Snack</div>
            </div>
          </div>
        </div>

        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">Dietary Preferences</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#CBD5E1]">Diet Type</span>
              <span className="font-semibold text-[#F3F4F6] capitalize">{dietaryType.replace('_', ' ')}</span>
            </div>
            {allergies && (
              <div className="flex justify-between items-center">
                <span className="text-[#CBD5E1]">Allergies</span>
                <span className="font-semibold text-[#F3F4F6]">{allergies}</span>
              </div>
            )}
          </div>
        </div>

        {!calorieData.isRealistic && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-red-400 font-medium">Aggressive Timeline</span>
            </div>
            <p className="text-red-300 text-sm">
              Your timeline is quite aggressive. Consider extending it for safer, more sustainable results.
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={() => setStep('dietary')}
            className="flex-1 bg-[#161B22] hover:bg-[#2B3440] text-[#CBD5E1] font-semibold py-3 px-4 rounded-xl transition-all"
          >
            Back
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 bg-[#F08A3E] hover:bg-[#E17226] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <span>Start My Journey</span>
            <Target className="w-5 h-5" />
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
          {step === 'dietary' && renderDietaryPreferences()}
          {step === 'review' && renderReview()}
        </div>
      </div>
    </div>
  );
};