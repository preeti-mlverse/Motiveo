/*
  # Fitness Tracker Database Schema

  1. New Tables
    - `user_profiles` - Store user profile information
    - `goals` - Store user fitness goals
    - `log_entries` - Store activity logs
    - `achievements` - Store user achievements
    - `ai_recommendations` - Store AI-generated recommendations
    - `weight_loss_profiles` - Store weight loss specific data
    - `meal_logs` - Store meal logging data
    - `exercise_logs` - Store exercise logging data
    - `weight_entries` - Store weight tracking data
    - `ai_conversations` - Store AI chat conversations

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Features
    - UUID primary keys
    - Timestamps for all records
    - JSON fields for flexible data storage
    - Foreign key relationships
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text,
  weight numeric,
  weight_unit text DEFAULT 'pounds' CHECK (weight_unit IN ('kg', 'pounds')),
  height numeric,
  height_unit text DEFAULT 'feet' CHECK (height_unit IN ('cm', 'feet')),
  age integer,
  selected_goals text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Goals Table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('weight_loss', 'cardio_endurance', 'strength_building', 'daily_steps', 'workout_consistency', 'sleep_tracking')),
  title text NOT NULL,
  description text,
  icon text,
  target_value numeric,
  target_timeframe integer, -- in weeks
  current_value numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Log Entries Table
CREATE TABLE IF NOT EXISTS log_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  goal_type text NOT NULL,
  value numeric NOT NULL,
  unit text,
  notes text,
  logged_via text DEFAULT 'manual' CHECK (logged_via IN ('voice', 'manual')),
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type text NOT NULL,
  title text NOT NULL,
  description text,
  icon text,
  progress numeric DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  unlocked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- AI Recommendations Table
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type text NOT NULL,
  title text NOT NULL,
  description text,
  action_items text[] DEFAULT '{}',
  priority text DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at timestamptz DEFAULT now()
);

-- Weight Loss Profiles Table
CREATE TABLE IF NOT EXISTS weight_loss_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  current_weight numeric NOT NULL,
  target_weight numeric NOT NULL,
  weekly_loss_rate numeric NOT NULL,
  daily_calorie_target integer NOT NULL,
  protein_goal_grams integer NOT NULL,
  dietary_preferences jsonb DEFAULT '{}',
  gender text CHECK (gender IN ('male', 'female', 'other')),
  activity_level text CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Meal Logs Table
CREATE TABLE IF NOT EXISTS meal_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  logged_date date DEFAULT CURRENT_DATE,
  planned_calories integer DEFAULT 0,
  actual_calories integer DEFAULT 0,
  foods_consumed jsonb DEFAULT '[]',
  ai_suggested boolean DEFAULT false,
  user_followed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Exercise Logs Table
CREATE TABLE IF NOT EXISTS exercise_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  duration_minutes integer NOT NULL,
  intensity_level integer CHECK (intensity_level >= 1 AND intensity_level <= 10),
  calories_burned integer DEFAULT 0,
  ai_suggested boolean DEFAULT false,
  logged_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Weight Entries Table
CREATE TABLE IF NOT EXISTS weight_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  weight numeric NOT NULL,
  date date DEFAULT CURRENT_DATE,
  notes text,
  body_fat_percentage numeric,
  muscle_mass numeric,
  created_at timestamptz DEFAULT now()
);

-- AI Conversations Table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  messages jsonb DEFAULT '[]',
  context jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_loss_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for goals
CREATE POLICY "Users can read own goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for log_entries
CREATE POLICY "Users can read own log entries"
  ON log_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own log entries"
  ON log_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own log entries"
  ON log_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own log entries"
  ON log_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Users can read own achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON achievements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_recommendations
CREATE POLICY "Users can read own AI recommendations"
  ON ai_recommendations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI recommendations"
  ON ai_recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI recommendations"
  ON ai_recommendations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI recommendations"
  ON ai_recommendations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for weight_loss_profiles
CREATE POLICY "Users can read own weight loss profile"
  ON weight_loss_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight loss profile"
  ON weight_loss_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight loss profile"
  ON weight_loss_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for meal_logs
CREATE POLICY "Users can read own meal logs"
  ON meal_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal logs"
  ON meal_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal logs"
  ON meal_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal logs"
  ON meal_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for exercise_logs
CREATE POLICY "Users can read own exercise logs"
  ON exercise_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise logs"
  ON exercise_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise logs"
  ON exercise_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercise logs"
  ON exercise_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for weight_entries
CREATE POLICY "Users can read own weight entries"
  ON weight_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight entries"
  ON weight_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight entries"
  ON weight_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight entries"
  ON weight_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for ai_conversations
CREATE POLICY "Users can read own AI conversations"
  ON ai_conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI conversations"
  ON ai_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI conversations"
  ON ai_conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI conversations"
  ON ai_conversations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(type);
CREATE INDEX IF NOT EXISTS idx_log_entries_user_id ON log_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_log_entries_goal_id ON log_entries(goal_id);
CREATE INDEX IF NOT EXISTS idx_log_entries_timestamp ON log_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_loss_profiles_user_id ON weight_loss_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id ON meal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_logged_date ON meal_logs(logged_date);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_id ON exercise_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_logged_date ON exercise_logs(logged_date);
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_id ON weight_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_entries_date ON weight_entries(date);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);