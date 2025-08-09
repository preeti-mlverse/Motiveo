import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types (generated from schema)
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          phone: string | null;
          weight: number | null;
          weight_unit: 'kg' | 'pounds';
          height: number | null;
          height_unit: 'cm' | 'feet';
          age: number | null;
          selected_goals: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          phone?: string | null;
          weight?: number | null;
          weight_unit?: 'kg' | 'pounds';
          height?: number | null;
          height_unit?: 'cm' | 'feet';
          age?: number | null;
          selected_goals?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          phone?: string | null;
          weight?: number | null;
          weight_unit?: 'kg' | 'pounds';
          height?: number | null;
          height_unit?: 'cm' | 'feet';
          age?: number | null;
          selected_goals?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          type: 'weight_loss' | 'cardio_endurance' | 'strength_building' | 'daily_steps' | 'workout_consistency' | 'sleep_tracking';
          title: string;
          description: string | null;
          icon: string | null;
          target_value: number | null;
          target_timeframe: number | null;
          current_value: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'weight_loss' | 'cardio_endurance' | 'strength_building' | 'daily_steps' | 'workout_consistency' | 'sleep_tracking';
          title: string;
          description?: string | null;
          icon?: string | null;
          target_value?: number | null;
          target_timeframe?: number | null;
          current_value?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'weight_loss' | 'cardio_endurance' | 'strength_building' | 'daily_steps' | 'workout_consistency' | 'sleep_tracking';
          title?: string;
          description?: string | null;
          icon?: string | null;
          target_value?: number | null;
          target_timeframe?: number | null;
          current_value?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      log_entries: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string;
          goal_type: string;
          value: number;
          unit: string | null;
          notes: string | null;
          logged_via: 'voice' | 'manual';
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_id: string;
          goal_type: string;
          value: number;
          unit?: string | null;
          notes?: string | null;
          logged_via?: 'voice' | 'manual';
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_id?: string;
          goal_type?: string;
          value?: number;
          unit?: string | null;
          notes?: string | null;
          logged_via?: 'voice' | 'manual';
          timestamp?: string;
          created_at?: string;
        };
      };
      weight_loss_profiles: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string;
          current_weight: number;
          target_weight: number;
          weekly_loss_rate: number;
          daily_calorie_target: number;
          protein_goal_grams: number;
          dietary_preferences: any;
          gender: 'male' | 'female' | 'other' | null;
          activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_id: string;
          current_weight: number;
          target_weight: number;
          weekly_loss_rate: number;
          daily_calorie_target: number;
          protein_goal_grams: number;
          dietary_preferences?: any;
          gender?: 'male' | 'female' | 'other' | null;
          activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_id?: string;
          current_weight?: number;
          target_weight?: number;
          weekly_loss_rate?: number;
          daily_calorie_target?: number;
          protein_goal_grams?: number;
          dietary_preferences?: any;
          gender?: 'male' | 'female' | 'other' | null;
          activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      meal_logs: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          logged_date: string;
          planned_calories: number;
          actual_calories: number;
          foods_consumed: any[];
          ai_suggested: boolean;
          user_followed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_id: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          logged_date?: string;
          planned_calories?: number;
          actual_calories?: number;
          foods_consumed?: any[];
          ai_suggested?: boolean;
          user_followed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_id?: string;
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          logged_date?: string;
          planned_calories?: number;
          actual_calories?: number;
          foods_consumed?: any[];
          ai_suggested?: boolean;
          user_followed?: boolean;
          created_at?: string;
        };
      };
      weight_entries: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string;
          weight: number;
          date: string;
          notes: string | null;
          body_fat_percentage: number | null;
          muscle_mass: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_id: string;
          weight: number;
          date?: string;
          notes?: string | null;
          body_fat_percentage?: number | null;
          muscle_mass?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_id?: string;
          weight?: number;
          date?: string;
          notes?: string | null;
          body_fat_percentage?: number | null;
          muscle_mass?: number | null;
          created_at?: string;
        };
      };
    };
  };
}