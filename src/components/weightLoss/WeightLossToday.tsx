import React, { useState, useEffect } from 'react';
import { Plus, Utensils, Activity, Droplets, Scale, TrendingDown, MessageCircle, Zap, Target } from 'lucide-react';
import { CalorieRing } from './CalorieRing';
import { MealLogging } from './MealLogging';
import { ExerciseLogging } from './ExerciseLogging';
import { WeightLossProfile, MealLog } from '../../types/weightLoss';
import { CalorieCalculator } from '../../utils/calorieCalculator';
import { MealSuggestionEngine } from '../../utils/mealSuggestions';
import { SupabaseService } from '../../services/supabaseService';

interface WeightLossTodayProps {
  profile: WeightLossProfile;
  mealLogs: MealLog[];
  onMealLogged: (meal: MealLog) => void;
  onWeightLogged: (weight: number) => void;
}

export const WeightLossToday: React.FC<WeightLossTodayProps> = ({
  profile,
  mealLogs: propMealLogs,
  onMealLogged,
  onWeightLogged
}) => {
  const [showMealLogging, setShowMealLogging] = useState<{
    show: boolean;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  }>({ show: false, mealType: 'breakfast' });
  const [waterIntake, setWaterIntake] = useState(0);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [showExerciseLogging, setShowExerciseLogging] = useState(false);
  const [todayMeals, setTodayMeals] = useState<MealLog[]>([]);
  const [todayExercises, setTodayExercises] = useState<any[]>([]);
  const [todayWeightEntry, setTodayWeightEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load today's data from Supabase
  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      
      // Load meal logs
      const meals = await SupabaseService.getMealLogs();
      const today = new Date().toDateString();
      const todayMealLogs = meals.filter(meal => 
        new Date(meal.loggedDate).toDateString() === today
      );
      setTodayMeals(todayMealLogs);
      
      // Load weight entries
      const weightEntries = await SupabaseService.getWeightEntries();
      const todayWeight = weightEntries.find(entry =>
        new Date(entry.date).toDateString() === today
      );
      setTodayWeightEntry(todayWeight);
      
      console.log('📊 Loaded today\'s data:', {
        meals: todayMealLogs.length,
        totalCalories: todayMealLogs.reduce((sum, meal) => sum + meal.actualCalories, 0),
        weightEntry: !!todayWeight
      });
      
    } catch (error) {
      console.error('Failed to load today\'s data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals from loaded data
  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.actualCalories, 0);
  const totalProtein = todayMeals.reduce((sum, meal) => 
    sum + meal.foodsConsumed.reduce((mealSum, food) => mealSum + food.protein, 0), 0
  );
  const totalCaloriesBurned = todayExercises.reduce((sum, exercise) => sum + exercise.caloriesBurned, 0);
  const netCalories = Math.max(totalCalories - totalCaloriesBurned, 0);
  const remainingCalories = Math.max(profile.dailyCalorieTarget - netCalories, 0);

  const mealDistribution = CalorieCalculator.distributeMealCalories(profile.dailyCalorieTarget);

  const getMealCalories = (mealType: string) => {
    return todayMeals
      .filter(meal => meal.mealType === mealType)
      .reduce((sum, meal) => sum + meal.actualCalories, 0);
  };

  const getMealSuggestion = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const targetCalories = mealDistribution[mealType];
    const currentCalories = getMealCalories(mealType);
    
    if (currentCalories === 0) {
      const recentMeals = todayMeals.map(meal => meal.id);
      return MealSuggestionEngine.generatePersonalizedSuggestion(
        mealType,
        targetCalories,
        profile.dietaryPreferences,
        recentMeals,
        new Date().getHours()
      );
    }
    return null;
  };

  const handleMealLogged = async (meal: MealLog) => {
    try {
      console.log('💾 Saving meal to Supabase:', meal);
      
      // Save to Supabase
      const savedMeal = await SupabaseService.createMealLog(meal);
      console.log('✅ Meal saved to Supabase:', savedMeal);
      
      // Update local state
      setTodayMeals(prev => [...prev, savedMeal]);
      
      // Call parent handler
      onMealLogged(savedMeal);
      
      // Close modal
      setShowMealLogging({ show: false, mealType: 'breakfast' });
      
      console.log('🔄 Meal logging complete');
      
    } catch (error) {
      console.error('❌ Failed to save meal:', error);
      // Still update local state as fallback
      setTodayMeals(prev => [...prev, meal]);
      onMealLogged(meal);
      setShowMealLogging({ show: false, mealType: 'breakfast' });
    }
  };
  
  const handleWeightLog = async () => {
    if (weightInput) {
      try {
        const weightEntry = {
          goalId: profile.goalId,
          weight: parseFloat(weightInput),
          date: new Date()
        };
        
        const savedEntry = await SupabaseService.createWeightEntry(weightEntry);
        setTodayWeightEntry(savedEntry);
        onWeightLogged(parseFloat(weightInput));
        
        setWeightInput('');
        setShowWeightInput(false);
      } catch (error) {
        console.error('Failed to save weight:', error);
        // Fallback to local handling
        onWeightLogged(parseFloat(weightInput));
        setWeightInput('');
        setShowWeightInput(false);
      }
    }
  };

  const addWater = () => {
    setWaterIntake(prev => prev + 250);
  };

  const handleExerciseLogged = (exercise: any) => {
    setTodayExercises(prev => [...prev, exercise]);
    console.log('✅ WeightLossToday: Exercise logged successfully:', exercise);
    setShowExerciseLogging(false);
  };
  
  const mealCards = [
    { type: 'breakfast' as const, icon: '🌅', name: 'Breakfast', target: mealDistribution.breakfast },
    { type: 'lunch' as const, icon: '☀️', name: 'Lunch', target: mealDistribution.lunch },
    { type: 'dinner' as const, icon: '🌙', name: 'Dinner', target: mealDistribution.dinner },
    { type: 'snack' as const, icon: '🍎', name: 'Snack', target: mealDistribution.snack }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#F08A3E] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#F3F4F6]">Weight Loss Journey</h2>
          <p className="text-[#CBD5E1]">
            Goal: {profile.currentWeight - profile.targetWeight}kg in {Math.ceil((new Date(profile.createdAt).getTime() + (12 * 7 * 24 * 60 * 60 * 1000) - Date.now()) / (7 * 24 * 60 * 60 * 1000))} weeks
          </p>
        </div>
        <div className="w-12 h-12 bg-[#F08A3E] rounded-2xl flex items-center justify-center">
          <TrendingDown className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Calorie Overview */}
      <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-[#F3F4F6]">Today's Calories</h3>
            <p className="text-sm text-[#CBD5E1]">
              Target: {profile.dailyCalorieTarget} • Protein: {totalProtein}g / {profile.proteinGoalGrams}g
            </p>
          </div>
          <CalorieRing
            current={netCalories}
            target={profile.dailyCalorieTarget}
            size={100}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-lg font-bold text-[#4BE0D1]">{totalCalories}</div>
            <div className="text-xs text-[#CBD5E1]">Consumed</div>
          </div>
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-lg font-bold text-[#F08A3E]">{totalCaloriesBurned}</div>
            <div className="text-xs text-[#CBD5E1]">Burned</div>
          </div>
          <div className="text-center p-3 bg-[#0D1117] rounded-xl">
            <div className="text-lg font-bold text-[#6BD0D2]">{netCalories}</div>
            <div className="text-xs text-[#CBD5E1]">Net Calories</div>
          </div>
        </div>
      </div>

      {/* Meal Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#F3F4F6]">Meals</h3>
        
        {mealCards.map((meal) => {
          const currentCalories = getMealCalories(meal.type);
          const progress = (currentCalories / meal.target) * 100;
          const todayMealsForType = todayMeals.filter(mealLog => mealLog.mealType === meal.type);
          const suggestion = getMealSuggestion(meal.type);

          return (
            <div key={meal.type} className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#2B3440] rounded-xl flex items-center justify-center text-2xl">
                    {meal.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#F3F4F6]">{meal.name}</h4>
                    <p className="text-sm text-[#CBD5E1]">
                      <span className="font-semibold text-[#4BE0D1]">{currentCalories}</span> / {meal.target} calories
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMealLogging({ show: true, mealType: meal.type })}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#F08A3E] hover:bg-[#E17226] text-white rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{currentCalories > 0 ? 'Add More' : 'Log'}</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#2B3440] rounded-full h-2 mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progress > 100 ? 'bg-[#F08A3E]' : 'bg-[#4BE0D1]'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>

              {/* AI Suggestion */}
              {suggestion && currentCalories === 0 && (
                <div className="p-3 bg-[#F8B84E]/10 border border-[#F8B84E]/30 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-[#F8B84E] rounded-full"></div>
                    <span className="text-sm font-medium text-[#F8B84E]">AI Suggestion</span>
                  </div>
                  <p className="text-sm text-[#F3F4F6] leading-relaxed">
                    {suggestion.split('\n')[0]}
                  </p>
                </div>
              )}

              {/* Logged Foods */}
              {todayMealsForType.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-[#F3F4F6] mb-2">
                    Logged items ({todayMealsForType.length} meal{todayMealsForType.length !== 1 ? 's' : ''}):
                  </div>
                  {todayMealsForType.map((mealLog) => (
                    <div key={mealLog.id} className="p-3 bg-[#0D1117] rounded-xl">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-[#F3F4F6] mb-1">
                            {mealLog.foodsConsumed.length > 0 ? 
                              mealLog.foodsConsumed.map(food => food.name).join(', ') : 
                              'No foods listed'
                            }
                          </div>
                          <div className="text-xs text-[#CBD5E1]">
                            <span className="font-semibold text-[#4BE0D1]">{mealLog.actualCalories} cal</span> • 
                            <span className="text-[#6BD0D2]">{mealLog.foodsConsumed.reduce((sum, food) => sum + food.protein, 0)}g protein</span>
                          </div>
                        </div>
                        <div className="text-xs text-[#6BD0D2]">
                          {new Date(mealLog.createdAt).toLocaleTimeString('en', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        {/* Exercise Logging */}
        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="w-6 h-6 text-[#6BD0D2]" />
            <div>
              <h4 className="font-semibold text-[#F3F4F6]">Exercise</h4>
              <p className="text-sm text-[#CBD5E1]">
                {todayExercises.length > 0 ? `${totalCaloriesBurned} cal burned today` : 'No exercise logged today'}
              </p>
            </div>
          </div>
          
          {todayExercises.length > 0 && (
            <div className="mb-4 space-y-2">
              {todayExercises.map((exercise) => (
                <div key={exercise.id} className="p-3 bg-[#0D1117] rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-[#F3F4F6]">{exercise.activityType}</div>
                      <div className="text-xs text-[#CBD5E1]">
                        {exercise.durationMinutes} min • {exercise.caloriesBurned} cal burned
                      </div>
                    </div>
                    <div className="text-xs text-[#6BD0D2]">
                      {new Date(exercise.createdAt).toLocaleTimeString('en', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button
            onClick={() => setShowExerciseLogging(true)}
            className="w-full bg-[#6BD0D2] hover:bg-[#4BE0D1] text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Log Activity</span>
          </button>
        </div>

        {/* Weight Logging */}
        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440]">
          <div className="flex items-center space-x-3 mb-4">
            <Scale className="w-6 h-6 text-[#6BD0D2]" />
            <div>
              <h4 className="font-semibold text-[#F3F4F6]">Weight</h4>
              <p className="text-sm text-[#CBD5E1]">
                {todayWeightEntry ? `${todayWeightEntry.weight}kg today` : 'Log today\'s weight'}
              </p>
            </div>
          </div>
          
          {todayWeightEntry && (
            <div className="mb-4 p-3 bg-[#0D1117] rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-bold text-[#F3F4F6]">{todayWeightEntry.weight}kg</div>
                  <div className="text-xs text-[#CBD5E1]">
                    {profile.currentWeight - todayWeightEntry.weight > 0 ? 
                      `↓ ${(profile.currentWeight - todayWeightEntry.weight).toFixed(1)}kg lost` :
                      `↑ ${(todayWeightEntry.weight - profile.currentWeight).toFixed(1)}kg gained`
                    }
                  </div>
                </div>
                <div className="text-xs text-[#6BD0D2]">
                  {new Date(todayWeightEntry.date).toLocaleTimeString('en', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          )}
          
          {showWeightInput ? (
            <div className="space-y-3">
              <div className="flex">
                <input
                  type="number"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="70.5"
                  className="flex-1 px-3 py-2 bg-[#0D1117] border border-[#2B3440] rounded-l-lg text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#6BD0D2] focus:outline-none"
                />
                <div className="px-3 py-2 bg-[#2B3440] border border-[#2B3440] rounded-r-lg text-[#CBD5E1] text-sm">
                  kg
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleWeightLog}
                  className="flex-1 bg-[#6BD0D2] hover:bg-[#4BE0D1] text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowWeightInput(false)}
                  className="flex-1 bg-[#2B3440] hover:bg-[#0D1117] text-[#CBD5E1] py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowWeightInput(true)}
              className="w-full bg-[#6BD0D2] hover:bg-[#4BE0D1] text-white py-3 px-4 rounded-xl font-medium transition-colors"
            >
              {todayWeightEntry ? 'Update Weight' : 'Log Weight'}
            </button>
          )}
        </div>
      </div>

      {/* Water Intake & AI Assistant */}
      <div className="grid grid-cols-2 gap-4">
        {/* Water Intake */}
        <div className="bg-[#161B22] rounded-2xl p-4 border border-[#2B3440]">
          <div className="flex items-center space-x-2 mb-3">
            <Droplets className="w-5 h-5 text-[#4BE0D1]" />
            <div>
              <h4 className="font-medium text-[#F3F4F6]">Water</h4>
              <p className="text-xs text-[#CBD5E1]">{waterIntake}ml / 2000ml</p>
            </div>
          </div>
          
          <div className="w-full bg-[#2B3440] rounded-full h-2 mb-3">
            <div
              className="h-full bg-[#4BE0D1] rounded-full transition-all duration-300"
              style={{ width: `${Math.min((waterIntake / 2000) * 100, 100)}%` }}
            />
          </div>
          
          <button
            onClick={addWater}
            className="w-full bg-[#4BE0D1] hover:bg-[#6BD0D2] text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          >
            +250ml
          </button>
        </div>

        {/* AI Assistant */}
        <div className="bg-[#161B22] rounded-2xl p-4 border border-[#2B3440]">
          <div className="flex items-center space-x-2 mb-3">
            <MessageCircle className="w-5 h-5 text-[#B45309]" />
            <div>
              <h4 className="font-medium text-[#F3F4F6]">AI Coach</h4>
              <p className="text-xs text-[#CBD5E1]">{Math.max(profile.dailyCalorieTarget - totalCalories, 0)} cal remaining</p>
            </div>
          </div>
          
          <div className="mb-3 p-2 bg-[#B45309]/10 border border-[#B45309]/30 rounded-lg">
            <p className="text-xs text-[#F3F4F6]">
              {totalCalories === 0 
                ? "Ready to help with your nutrition goals!" 
                : totalCalories > profile.dailyCalorieTarget 
                  ? "Let's discuss healthy choices for tomorrow"
                  : "Ask me about meal suggestions or nutrition tips"
              }
            </p>
          </div>
          
          <button
            onClick={() => {
              const event = new CustomEvent('openGoalAI', { 
                detail: { goalType: 'weight_loss' } 
              });
              window.dispatchEvent(event);
            }}
            className="w-full bg-[#B45309] hover:bg-[#92400E] text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Weight Loss Coach</span>
          </button>
        </div>
      </div>

      {/* Meal Logging Modal */}
      {showMealLogging.show && (
        <MealLogging
          mealType={showMealLogging.mealType}
          targetCalories={mealDistribution[showMealLogging.mealType]}
          currentCalories={getMealCalories(showMealLogging.mealType)}
          onMealLogged={handleMealLogged}
          onClose={() => setShowMealLogging({ show: false, mealType: 'breakfast' })}
        />
      )}

      {/* Exercise Logging Modal */}
      {showExerciseLogging && (
        <ExerciseLogging
          userWeight={profile.currentWeight}
          onExerciseLogged={handleExerciseLogged}
          onClose={() => setShowExerciseLogging(false)}
        />
      )}
    </div>
  );
};