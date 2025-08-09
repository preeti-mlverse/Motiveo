import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WeightLossProfile, MealLog, ExerciseLog, WeightEntry, AIConversation } from '../types/weightLoss';

interface WeightLossState {
  // Profile
  profile: WeightLossProfile | null;
  
  // Logs
  mealLogs: MealLog[];
  exerciseLogs: ExerciseLog[];
  weightEntries: WeightEntry[];
  
  // AI
  conversations: AIConversation[];
  
  // Actions
  setProfile: (profile: WeightLossProfile) => void;
  addMealLog: (meal: MealLog) => void;
  addExerciseLog: (exercise: ExerciseLog) => void;
  addWeightEntry: (weight: WeightEntry) => void;
  addConversation: (conversation: AIConversation) => void;
  updateConversation: (id: string, updates: Partial<AIConversation>) => void;
  
  // Getters
  getTodayMeals: () => MealLog[];
  getTodayCalories: () => number;
  getWeeklyProgress: () => { date: Date; weight?: number; calories: number }[];
}

export const useWeightLossStore = create<WeightLossState>()(
  persist(
    (set, get) => ({
      profile: null,
      mealLogs: [],
      exerciseLogs: [],
      weightEntries: [],
      conversations: [],
      
      setProfile: (profile) => set({ profile }),
      
      addMealLog: (meal) => set((state) => {
        console.log('🏪 Store: Adding meal log:', {
          id: meal.id,
          mealType: meal.mealType,
          calories: meal.actualCalories,
          foodsCount: meal.foodsConsumed.length,
          loggedDate: meal.loggedDate
        });
        
        // Ensure the meal has today's date
        const mealWithCorrectDate = {
          ...meal,
          loggedDate: new Date() // Force today's date
        };
        
        const newMealLogs = [...state.mealLogs, meal];
        console.log('🏪 Store: New total meal logs:', newMealLogs.length);
        
        // Immediately verify today's meals after adding
        const today = new Date().toDateString();
        const todayMealsAfterAdd = newMealLogs.filter(m => {
          const mealDate = new Date(m.loggedDate).toDateString();
          return mealDate === today;
        });
        console.log('🏪 Store: Today meals after add:', todayMealsAfterAdd.length);
        
        return {
          mealLogs: newMealLogs
        };
      }),
      
      addExerciseLog: (exercise) => set((state) => ({
        exerciseLogs: [...state.exerciseLogs, exercise]
      })),
      
      addWeightEntry: (weight) => set((state) => ({
        weightEntries: [...state.weightEntries, weight]
      })),
      
      addConversation: (conversation) => set((state) => ({
        conversations: [...state.conversations, conversation]
      })),
      
      updateConversation: (id, updates) => set((state) => ({
        conversations: state.conversations.map(conv =>
          conv.id === id ? { ...conv, ...updates } : conv
        )
      })),
      
      getTodayMeals: () => {
        const today = new Date().toDateString();
        const { mealLogs } = get();
        console.log('📊 getTodayMeals: Checking', mealLogs.length, 'total meals for date:', today);
        
        const todayMeals = mealLogs.filter(meal => {
          const mealDate = new Date(meal.loggedDate).toDateString();
          console.log('📊 Comparing meal date:', mealDate, 'with today:', today, 'match:', mealDate === today);
          return mealDate === today;
        });
        
        console.log('📊 getTodayMeals result:', {
          todayMealsCount: todayMeals.length,
          todayMealsList: todayMeals.map(m => ({
            id: m.id,
            type: m.mealType,
            calories: m.actualCalories,
            date: m.loggedDate
          }))
        });
        
        return todayMeals;
      },
      
      getTodayCalories: () => {
        const todayMeals = get().getTodayMeals();
        const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.actualCalories, 0);
        console.log('🔥 getTodayCalories result:', {
          totalCalories,
          mealsCount: todayMeals.length,
          mealBreakdown: todayMeals.map(m => ({ type: m.mealType, calories: m.actualCalories }))
        });
        return totalCalories;
      },
      
      getWeeklyProgress: () => {
        const days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date;
        });
        
        const { mealLogs, weightEntries } = get();
        
        return days.map(date => {
          const dayString = date.toDateString();
          
          const dayMeals = mealLogs.filter(meal =>
            new Date(meal.loggedDate).toDateString() === dayString
          );
          
          const dayWeight = weightEntries.find(entry =>
            new Date(entry.date).toDateString() === dayString
          );
          
          const calories = dayMeals.reduce((sum, meal) => sum + meal.actualCalories, 0);
          
          return {
            date,
            weight: dayWeight?.weight,
            calories
          };
        });
      }
    }),
    {
      name: 'weight-loss-storage',
    }
  )
);