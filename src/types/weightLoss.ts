export interface WeightLossProfile {
  id: string;
  goalId: string;
  currentWeight: number;
  targetWeight: number;
  weeklyLossRate: number;
  dailyCalorieTarget: number;
  proteinGoalGrams: number;
  dietaryPreferences: DietaryPreferences;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  createdAt: Date;
  updatedAt: Date;
}

export interface DietaryPreferences {
  type: 'vegetarian' | 'non_vegetarian' | 'eggetarian';
  allergies: string[];
  dislikes: string[];
  preferredFoods: string[];
}

export interface MealLog {
  id: string;
  goalId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  loggedDate: Date;
  plannedCalories: number;
  actualCalories: number;
  foodsConsumed: FoodItem[];
  aiSuggested: boolean;
  userFollowed: boolean;
  createdAt: Date;
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodDatabase {
  id: string;
  foodName: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  commonPortions: CommonPortion[];
  category: string;
  dietaryTags: string[];
}

export interface CommonPortion {
  name: string;
  grams: number;
  description: string;
}

export interface ExerciseLog {
  id: string;
  goalId: string;
  activityType: string;
  durationMinutes: number;
  intensityLevel: number;
  caloriesBurned: number;
  aiSuggested: boolean;
  loggedDate: Date;
  createdAt: Date;
}

export interface MealSuggestion {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  description: string;
  calories: number;
  protein: number;
  ingredients: string[];
  preparationTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  dietaryTags: string[];
}

export interface AIConversation {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context: ConversationContext;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    calories?: number;
    foodItems?: FoodItem[];
    suggestions?: MealSuggestion[];
  };
}

export interface ConversationContext {
  currentCalories: number;
  targetCalories: number;
  remainingCalories: number;
  lastMealTime?: Date;
  recentFoods: string[];
  preferences: DietaryPreferences;
}

export interface WeightEntry {
  id: string;
  goalId: string;
  weight: number;
  date: Date;
  notes?: string;
  bodyFatPercentage?: number;
  muscleMass?: number;
}

export interface PlateauDetection {
  goalId: string;
  detectedAt: Date;
  weightStagnationDays: number;
  averageCalorieAdherence: number;
  recommendedActions: string[];
  adjustmentsMade: boolean;
}