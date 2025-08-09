import { supabase } from '../lib/supabase';
import { UserProfile, Goal, LogEntry, Achievement, AIRecommendation } from '../types';
import { WeightLossProfile, MealLog, WeightEntry } from '../types/weightLoss';

export class SupabaseService {
  // Authentication
  static async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
    return true;
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // User Profiles
  static async createUserProfile(profile: Omit<UserProfile, 'id' | 'createdAt'>) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        phone: profile.phone,
        weight: profile.weight,
        weight_unit: profile.weightUnit,
        height: profile.height,
        height_unit: profile.heightUnit,
        age: profile.age,
        selected_goals: profile.selectedGoals,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapUserProfile(data);
  }

  static async getUserProfile(): Promise<UserProfile | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }

    return this.mapUserProfile(data);
  }

  static async updateUserProfile(updates: Partial<UserProfile>) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        phone: updates.phone,
        weight: updates.weight,
        weight_unit: updates.weightUnit,
        height: updates.height,
        height_unit: updates.heightUnit,
        age: updates.age,
        selected_goals: updates.selectedGoals,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return this.mapUserProfile(data);
  }

  // Goals
  static async createGoal(goal: Omit<Goal, 'id' | 'createdAt'>) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        type: goal.type,
        title: goal.title,
        description: goal.description,
        icon: goal.icon,
        target_value: goal.targetValue,
        target_timeframe: goal.targetTimeframe,
        current_value: goal.currentValue,
        is_active: goal.isActive,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapGoal(data);
  }

  static async getGoals(): Promise<Goal[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapGoal);
  }

  static async updateGoal(goalId: string, updates: Partial<Goal>) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('goals')
      .update({
        title: updates.title,
        description: updates.description,
        target_value: updates.targetValue,
        target_timeframe: updates.targetTimeframe,
        current_value: updates.currentValue,
        is_active: updates.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return this.mapGoal(data);
  }

  // Log Entries
  static async createLogEntry(entry: Omit<LogEntry, 'id'>) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Find the goal to get goal_id
    const { data: goals } = await supabase
      .from('goals')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', entry.goalType)
      .eq('is_active', true)
      .limit(1);

    if (!goals || goals.length === 0) {
      throw new Error('No active goal found for this type');
    }

    const { data, error } = await supabase
      .from('log_entries')
      .insert({
        user_id: user.id,
        goal_id: goals[0].id,
        goal_type: entry.goalType,
        value: entry.value,
        unit: entry.unit,
        notes: entry.notes,
        logged_via: entry.loggedVia,
        timestamp: entry.timestamp.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapLogEntry(data);
  }

  static async getLogEntries(): Promise<LogEntry[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('log_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data.map(this.mapLogEntry);
  }

  // Weight Loss Profiles
  static async createWeightLossProfile(profile: Omit<WeightLossProfile, 'id' | 'createdAt' | 'updatedAt'>) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('weight_loss_profiles')
      .insert({
        user_id: user.id,
        goal_id: profile.goalId,
        current_weight: profile.currentWeight,
        target_weight: profile.targetWeight,
        weekly_loss_rate: profile.weeklyLossRate,
        daily_calorie_target: profile.dailyCalorieTarget,
        protein_goal_grams: profile.proteinGoalGrams,
        dietary_preferences: profile.dietaryPreferences,
        gender: profile.gender,
        activity_level: profile.activityLevel,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapWeightLossProfile(data);
  }

  static async getWeightLossProfile(): Promise<WeightLossProfile | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('weight_loss_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }

    return this.mapWeightLossProfile(data);
  }

  // Meal Logs
  static async createMealLog(meal: Omit<MealLog, 'id' | 'createdAt'>) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    console.log('💾 SupabaseService: Creating meal log:', meal);
    
    // Ensure we have a valid goal_id
    let goalId = meal.goalId;
    if (goalId === 'weight-loss-goal') {
      // Find the actual weight loss goal ID
      const { data: goals } = await supabase
        .from('goals')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'weight_loss')
        .eq('is_active', true)
        .limit(1);
      
      if (goals && goals.length > 0) {
        goalId = goals[0].id;
      }
    }
    
    const { data, error } = await supabase
      .from('meal_logs')
      .insert({
        user_id: user.id,
        goal_id: goalId,
        meal_type: meal.mealType,
        logged_date: meal.loggedDate.toISOString().split('T')[0],
        planned_calories: meal.plannedCalories,
        actual_calories: meal.actualCalories,
        foods_consumed: meal.foodsConsumed,
        ai_suggested: meal.aiSuggested,
        user_followed: meal.userFollowed,
      })
      .select()
      .single();

    if (error) throw error;
    
    const mappedMeal = this.mapMealLog(data);
    console.log('✅ SupabaseService: Meal log created:', mappedMeal);
    return mappedMeal;
  }

  static async getMealLogs(): Promise<MealLog[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    console.log('📊 SupabaseService: Fetching meal logs for user:', user.id);
    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_date', { ascending: false });

    if (error) throw error;
    
    const mappedMeals = data.map(this.mapMealLog);
    console.log('📊 SupabaseService: Fetched meal logs:', mappedMeals.length);
    return mappedMeals;
  }

  // Weight Entries
  static async createWeightEntry(entry: Omit<WeightEntry, 'id'>) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('weight_entries')
      .insert({
        user_id: user.id,
        goal_id: entry.goalId,
        weight: entry.weight,
        date: entry.date.toISOString().split('T')[0],
        notes: entry.notes,
        body_fat_percentage: entry.bodyFatPercentage,
        muscle_mass: entry.muscleMass,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapWeightEntry(data);
  }

  static async getWeightEntries(): Promise<WeightEntry[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    return data.map(this.mapWeightEntry);
  }

  // Mapping functions
  private static mapUserProfile(data: any): UserProfile {
    return {
      id: data.id,
      phone: data.phone,
      weight: data.weight,
      weightUnit: data.weight_unit,
      height: data.height,
      heightUnit: data.height_unit,
      age: data.age,
      selectedGoals: data.selected_goals,
      createdAt: new Date(data.created_at),
    };
  }

  private static mapGoal(data: any): Goal {
    return {
      id: data.id,
      type: data.type,
      title: data.title,
      description: data.description,
      icon: data.icon,
      targetValue: data.target_value,
      targetTimeframe: data.target_timeframe,
      currentValue: data.current_value,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
    };
  }

  private static mapLogEntry(data: any): LogEntry {
    return {
      id: data.id,
      goalType: data.goal_type,
      value: data.value,
      unit: data.unit,
      notes: data.notes,
      timestamp: new Date(data.timestamp),
      loggedVia: data.logged_via,
    };
  }

  private static mapWeightLossProfile(data: any): WeightLossProfile {
    return {
      id: data.id,
      goalId: data.goal_id,
      currentWeight: data.current_weight,
      targetWeight: data.target_weight,
      weeklyLossRate: data.weekly_loss_rate,
      dailyCalorieTarget: data.daily_calorie_target,
      proteinGoalGrams: data.protein_goal_grams,
      dietaryPreferences: data.dietary_preferences,
      gender: data.gender,
      activityLevel: data.activity_level,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static mapMealLog(data: any): MealLog {
    return {
      id: data.id,
      goalId: data.goal_id,
      mealType: data.meal_type,
      loggedDate: new Date(data.logged_date),
      plannedCalories: data.planned_calories,
      actualCalories: data.actual_calories,
      foodsConsumed: data.foods_consumed,
      aiSuggested: data.ai_suggested,
      userFollowed: data.user_followed,
      createdAt: new Date(data.created_at),
    };
  }

  private static mapWeightEntry(data: any): WeightEntry {
    return {
      id: data.id,
      goalId: data.goal_id,
      weight: data.weight,
      date: new Date(data.date),
      notes: data.notes,
      bodyFatPercentage: data.body_fat_percentage,
      muscleMass: data.muscle_mass,
    };
  }
}